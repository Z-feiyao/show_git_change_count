import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export interface GitChangeInfo {
  modified: number;
  added: number;
  deleted: number;
  renamed: number;
  untracked: number;
  total: number;
}

export class GitChangeCountProvider {
  private disposables: vscode.Disposable[] = [];
  private updateTimeout: NodeJS.Timeout | undefined;
  private statusBarItem: vscode.StatusBarItem | undefined;
  private lastChangeInfo: GitChangeInfo = { modified: 0, added: 0, deleted: 0, renamed: 0, untracked: 0, total: 0 };
  private currentRepositoryPath: string | undefined;
  private gitExtension: vscode.Extension<any> | undefined;
  private gitApi: any;

  async activate(context: vscode.ExtensionContext): Promise<void> {
    // 初始化Git扩展
    await this.initializeGitExtension();
    
    // 注册刷新命令
    const refreshCommand = vscode.commands.registerCommand(
      'show-git-change-count.refresh',
      () => this.updateChangeCount()
    );
    context.subscriptions.push(refreshCommand);

    // 监听文件系统变化
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    fileWatcher.onDidChange(() => this.debouncedUpdate());
    fileWatcher.onDidCreate(() => this.debouncedUpdate());
    fileWatcher.onDidDelete(() => this.debouncedUpdate());
    context.subscriptions.push(fileWatcher);

    // 设置Git仓库监听
    this.setupGitRepositoryWatchers(context);

    // 监听配置变化
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('showGitChangeCount')) {
          this.recreateStatusBarItem();
          this.updateChangeCount();
        }
      })
    );

    // 初始化并更新
    this.updateFromSelectedRepository();
    this.showStatusBarBadge(0);
  }

  private debouncedUpdate(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    const interval = vscode.workspace.getConfiguration('showGitChangeCount')
      .get<number>('updateInterval', 2000);
    this.updateTimeout = setTimeout(() => {
      this.updateChangeCount();
    }, interval);
  }

  private async updateChangeCount(): Promise<void> {
    const enabled = vscode.workspace.getConfiguration('showGitChangeCount')
      .get<boolean>('enabled', true);

    if (!enabled) {
      this.updateGitBadge(0);
      return;
    }

    try {
      const changeInfo = await this.getGitChangeInfo();
      this.lastChangeInfo = changeInfo;
      this.updateGitBadge(changeInfo.total);
    } catch (error) {
      console.error('获取 Git 变更信息失败:', error);
      this.updateGitBadge(0);
    }
  }

  private updateGitBadge(count: number): void {
    this.showStatusBarBadge(count);
  }

  private recreateStatusBarItem(): void {
    if (this.statusBarItem) {
      this.statusBarItem.dispose();
      this.statusBarItem = undefined;
    }
  }

  private showStatusBarBadge(count: number): void {
    if (!this.statusBarItem) {
      const config = vscode.workspace.getConfiguration('showGitChangeCount');
      const position = config.get<string>('position', 'left');
      
      this.statusBarItem = vscode.window.createStatusBarItem(
        position === 'right' ? vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left,
        1000
      );
      this.statusBarItem.command = 'show-git-change-count.refresh';
      this.disposables.push(this.statusBarItem);
    }

    const config = vscode.workspace.getConfiguration('showGitChangeCount');
    const showWhenZero = config.get<boolean>('showWhenZero', true);
    const showDetails = config.get<boolean>('showDetails', true);

    if (count === 0 && !showWhenZero) {
      this.statusBarItem.hide();
      return;
    }

    const repoName = this.currentRepositoryPath ? 
      path.basename(this.currentRepositoryPath) : '';
    const repoDisplay = repoName ? `[${repoName}] ` : '';

    if (showDetails && count > 0) {
      const parts: string[] = [];
      const tooltipParts: string[] = [];
      
      if (this.lastChangeInfo.modified > 0) {
        parts.push(`M:${this.lastChangeInfo.modified}`);
        tooltipParts.push(`修改: ${this.lastChangeInfo.modified}`);
      }
      if (this.lastChangeInfo.added > 0) {
        parts.push(`A:${this.lastChangeInfo.added}`);
        tooltipParts.push(`新增: ${this.lastChangeInfo.added}`);
      }
      if (this.lastChangeInfo.deleted > 0) {
        parts.push(`D:${this.lastChangeInfo.deleted}`);
        tooltipParts.push(`删除: ${this.lastChangeInfo.deleted}`);
      }
      if (this.lastChangeInfo.renamed > 0) {
        parts.push(`R:${this.lastChangeInfo.renamed}`);
        tooltipParts.push(`重命名: ${this.lastChangeInfo.renamed}`);
      }
      if (this.lastChangeInfo.untracked > 0) {
        parts.push(`U:${this.lastChangeInfo.untracked}`);
        tooltipParts.push(`未跟踪: ${this.lastChangeInfo.untracked}`);
      }
      
      this.statusBarItem.text = `$(git-branch) ${repoDisplay}${parts.join(' ')}`;
      this.statusBarItem.tooltip = `Git 变更:\n${tooltipParts.join('\n')}\n总计: ${count}`;
    } else {
      this.statusBarItem.text = `$(git-branch) ${repoDisplay}${count}`;
      this.statusBarItem.tooltip = `Git 变更文件: ${count}`;
    }
    
    this.statusBarItem.show();
  }

  private async getGitChangeInfo(): Promise<GitChangeInfo> {
    const repoPath = this.currentRepositoryPath || this.getWorkspacePath();
    
    if (!repoPath) {
      return { modified: 0, added: 0, deleted: 0, renamed: 0, untracked: 0, total: 0 };
    }

    return await this.getGitChangeInfoForFolder(repoPath);
  }

  private async getGitChangeInfoForFolder(folderPath: string): Promise<GitChangeInfo> {
    try {
      // 检查是否为 Git 仓库
      await execAsync('git rev-parse --git-dir', { 
        cwd: folderPath, 
        timeout: 2000
      });
    } catch {
      return { modified: 0, added: 0, deleted: 0, renamed: 0, untracked: 0, total: 0 };
    }

    try {
      const { stdout } = await execAsync(
        'git status --porcelain',
        { cwd: folderPath, timeout: 2000 }
      );

      if (!stdout.trim()) {
        return { modified: 0, added: 0, deleted: 0, renamed: 0, untracked: 0, total: 0 };
      }

      let modified = 0, added = 0, deleted = 0, renamed = 0, untracked = 0;
      const lines = stdout.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.length < 2) continue;
        
        const status = line.substring(0, 2);
        const filePath = line.substring(3).trim();

        if (filePath.includes(' -> ')) {
          renamed++;
        } else if (status === '??') {
          untracked++;
        } else if (status.includes('M')) {
          modified++;
        } else if (status.includes('A')) {
          added++;
        } else if (status.includes('D')) {
          deleted++;
        }
      }

      return {
        modified, added, deleted, renamed, untracked,
        total: modified + added + deleted + renamed + untracked
      };
    } catch (error: any) {
      console.error('执行 git status 失败:', error);
      return { modified: 0, added: 0, deleted: 0, renamed: 0, untracked: 0, total: 0 };
    }
  }

  private async initializeGitExtension(): Promise<void> {
    try {
      this.gitExtension = vscode.extensions.getExtension('vscode.git');
      if (this.gitExtension && !this.gitExtension.isActive) {
        await this.gitExtension.activate();
      }
      
      if (this.gitExtension?.isActive) {
        this.gitApi = this.gitExtension.exports.getAPI(1);
      }
    } catch (error) {
      console.warn('初始化Git扩展失败:', error);
    }
  }

  private setupGitRepositoryWatchers(context: vscode.ExtensionContext): void {
    if (!this.gitApi) {
      return;
    }

    // 监听仓库打开/关闭
    if (this.gitApi.onDidOpenRepository) {
      context.subscriptions.push(
        this.gitApi.onDidOpenRepository((repo: any) => {
          this.watchRepository(repo, context);
        })
      );
    }

    if (this.gitApi.onDidCloseRepository) {
      context.subscriptions.push(
        this.gitApi.onDidCloseRepository(() => {
          this.updateChangeCount();
        })
      );
    }

    // 监听现有仓库
    if (this.gitApi.repositories) {
      this.gitApi.repositories.forEach((repo: any) => {
        this.watchRepository(repo, context);
      });
    }
  }

  private watchRepository(repo: any, context: vscode.ExtensionContext): void {
    // 监听仓库状态变化
    if (repo.state) {
      context.subscriptions.push(
        repo.state.onDidChange(() => {
          this.updateFromSelectedRepository();
        })
      );
    }
    
    // 监听仓库 UI 变化（包括选中状态变化）
    if (repo.ui?.onDidChange) {
      context.subscriptions.push(
        repo.ui.onDidChange(() => {
          this.updateFromSelectedRepository();
        })
      );
    }
  }

  private updateFromSelectedRepository(): void {
    if (!this.gitApi?.repositories || this.gitApi.repositories.length === 0) {
      this.currentRepositoryPath = this.getWorkspacePath();
      this.updateChangeCount();
      return;
    }

    // 查找选中的仓库（通过 ui.selected 属性）
    const selectedRepo = this.gitApi.repositories.find((repo: any) => {
      return repo.ui?.selected === true;
    });

    if (selectedRepo) {
      this.currentRepositoryPath = selectedRepo.rootUri.fsPath;
      this.updateChangeCount();
      return;
    }

    // 如果没有明确选中的仓库，使用第一个仓库
    const firstRepo = this.gitApi.repositories[0];
    this.currentRepositoryPath = firstRepo.rootUri.fsPath;
    this.updateChangeCount();
  }

  private getWorkspacePath(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    return folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
  }

  dispose(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.disposables.forEach(d => d.dispose());
  }
}
