import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitChangeInfo {
  modified: number;
  added: number;
  deleted: number;
  renamed: number;
  total: number;
}

export class GitChangeCountProvider {
  private disposables: vscode.Disposable[] = [];
  private updateTimeout: NodeJS.Timeout | undefined;
  private statusBarItem: vscode.StatusBarItem | undefined;
  private intervalTimer: NodeJS.Timeout | undefined;
  private lastChangeInfo: GitChangeInfo = { modified: 0, added: 0, deleted: 0, renamed: 0, total: 0 };

  async activate(context: vscode.ExtensionContext): Promise<void> {
    
    // 注册命令
    const refreshCommand = vscode.commands.registerCommand(
      'show-git-change-count.refresh',
      () => {
        console.log('刷新命令被触发');
        vscode.window.showInformationMessage('Git 变更数量刷新命令已执行');
        this.updateChangeCount();
      }
    );
    context.subscriptions.push(refreshCommand);

    // 注册测试命令
    const testCommand = vscode.commands.registerCommand(
      'show-git-change-count.test',
      () => {
        console.log('测试命令被触发');
        vscode.window.showInformationMessage('插件测试成功！');
        this.updateGitBadge(5); // 设置测试数量
      }
    );
    context.subscriptions.push(testCommand);

    // 注册立即检查命令
    const immediateCheckCommand = vscode.commands.registerCommand(
      'show-git-change-count.immediate-check',
      () => {
        console.log('立即检查命令被触发');
        this.updateChangeCount();
      }
    );
    context.subscriptions.push(immediateCheckCommand);

    // 监听文件系统变化（使用防抖）
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    fileSystemWatcher.onDidChange(() => this.debouncedUpdate());
    fileSystemWatcher.onDidCreate(() => this.debouncedUpdate());
    fileSystemWatcher.onDidDelete(() => this.debouncedUpdate());
    context.subscriptions.push(fileSystemWatcher);



    // 监听工作区变化
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      this.updateChangeCount();
    });

    // 监听配置变化
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('showGitChangeCount')) {
        this.recreateStatusBarItem();
        this.ensureStatusBarItem();
        this.updateChangeCount();
      }
    });

    // 立即创建状态栏项
    this.showStatusBarBadge(0);
    

    
    // 立即执行一次 Git 状态检查
    this.updateChangeCount();
    
    // 延迟再次执行，确保 VSCode 完全加载
    setTimeout(async () => {
      await this.updateChangeCount();
    }, 1000);
    
    // 启动定时器，定期检查 Git 状态
    this.startPeriodicUpdate();
  }

  private debouncedUpdate(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    const updateInterval = vscode.workspace.getConfiguration('showGitChangeCount').get<number>('updateInterval', 500);
    this.updateTimeout = setTimeout(() => {
      this.updateChangeCount();
    }, updateInterval);
  }

  private startPeriodicUpdate(): void {
    const config = vscode.workspace.getConfiguration('showGitChangeCount');
    const updateInterval = config.get<number>('updateInterval', 500);
    
    // 使用配置的更新间隔，但最小 1 秒，最大 10 秒
    const interval = Math.max(1000, Math.min(10000, updateInterval * 2));
    
    this.intervalTimer = setInterval(() => {
      this.updateChangeCount();
    }, interval);
  }

  private async updateChangeCount(): Promise<void> {
    const config = vscode.workspace.getConfiguration('showGitChangeCount');
    const enabled = config.get<boolean>('enabled', true);

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

  private ensureStatusBarItem(): void {
    if (!this.statusBarItem) {
      this.showStatusBarBadge(0);
    }
  }

  private showStatusBarBadge(count: number): void {
    // 如果状态栏项不存在，创建一个
    if (!this.statusBarItem) {
      const config = vscode.workspace.getConfiguration('showGitChangeCount');
      const position = config.get<string>('position', 'left');
      
      this.statusBarItem = vscode.window.createStatusBarItem(
        position === 'right' ? vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left,
        1000
      );
      this.statusBarItem.command = 'workbench.view.scm';
      this.disposables.push(this.statusBarItem);
    }

    if (count === 0) {
      const config = vscode.workspace.getConfiguration('showGitChangeCount');
      const showWhenZero = config.get<boolean>('showWhenZero', true);
      
      if (showWhenZero) {
        this.statusBarItem.text = '$(git-branch) 0';
        this.statusBarItem.tooltip = 'Git 变更文件数量: 0';
        this.statusBarItem.show();
      } else {
        this.statusBarItem.hide();
      }
    } else {
      const config = vscode.workspace.getConfiguration('showGitChangeCount');
      const showDetails = config.get<boolean>('showDetails', true);
      
      let displayText: string;
      let tooltipText: string;
      
      if (showDetails) {
        // 详细模式：显示具体的变更类型
        const changeInfo = this.lastChangeInfo;
        const parts: string[] = [];
        const tooltipParts: string[] = [];
        
        if (changeInfo.modified > 0) {
          parts.push(`M:${changeInfo.modified}`);
          tooltipParts.push(`修改: ${changeInfo.modified}`);
        }
        if (changeInfo.added > 0) {
          parts.push(`A:${changeInfo.added}`);
          tooltipParts.push(`新增: ${changeInfo.added}`);
        }
        if (changeInfo.deleted > 0) {
          parts.push(`D:${changeInfo.deleted}`);
          tooltipParts.push(`删除: ${changeInfo.deleted}`);
        }
        if (changeInfo.renamed > 0) {
          parts.push(`R:${changeInfo.renamed}`);
          tooltipParts.push(`重命名: ${changeInfo.renamed}`);
        }
        
        displayText = `$(git-branch) ${parts.join(' ')}`;
        tooltipText = `Git 变更详情:\n${tooltipParts.join('\n')}\n\n总计: ${count} 个文件`;
      } else {
        // 简洁模式：仅显示总数量
        displayText = `$(git-branch) ${count}`;
        tooltipText = `Git 变更文件数量: ${count}`;
      }
      
      this.statusBarItem.text = displayText;
      this.statusBarItem.tooltip = tooltipText;
      this.statusBarItem.show();
    }
  }

  private async getGitChangeInfo(): Promise<GitChangeInfo> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return { modified: 0, added: 0, deleted: 0, renamed: 0, total: 0 };
    }

    let totalModified = 0;
    let totalAdded = 0;
    let totalDeleted = 0;
    let totalRenamed = 0;

    for (const folder of workspaceFolders) {
      try {
        const info = await this.getGitChangeInfoForFolder(folder.uri.fsPath);
        totalModified += info.modified;
        totalAdded += info.added;
        totalDeleted += info.deleted;
        totalRenamed += info.renamed;
      } catch (error) {
        console.warn(`获取文件夹 ${folder.name} 的 Git 变更信息失败:`, error);
      }
    }

    return {
      modified: totalModified,
      added: totalAdded,
      deleted: totalDeleted,
      renamed: totalRenamed,
      total: totalModified + totalAdded + totalDeleted + totalRenamed
    };
  }

  private async getGitChangeInfoForFolder(folderPath: string): Promise<GitChangeInfo> {
    try {
      // 检查是否为 Git 仓库
      await execAsync('git rev-parse --git-dir', { cwd: folderPath });
    } catch {
      return { modified: 0, added: 0, deleted: 0, renamed: 0, total: 0 };
    }

    try {
      // 获取所有变更的文件
      const { stdout } = await execAsync(
        'git status --porcelain',
        { cwd: folderPath }
      );

      if (!stdout.trim()) {
        return { modified: 0, added: 0, deleted: 0, renamed: 0, total: 0 };
      }

      let modified = 0;
      let added = 0;
      let deleted = 0;
      let renamed = 0;

      const lines = stdout.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.length >= 2) {
          const status = line.substring(0, 2);
          const filePath = line.substring(3).trim();

          if (filePath.includes(' -> ')) {
            renamed++;
          } else if (status.includes('M')) {
            modified++;
          } else if (status.includes('A')) {
            added++;
          } else if (status.includes('D')) {
            deleted++;
          }
        }
      }

      return {
        modified,
        added,
        deleted,
        renamed,
        total: modified + added + deleted + renamed
      };
    } catch (error) {
      console.error(`执行 git status 失败:`, error);
      return { modified: 0, added: 0, deleted: 0, renamed: 0, total: 0 };
    }
  }



  dispose(): void {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }
    this.disposables.forEach(disposable => disposable.dispose());
  }
} 