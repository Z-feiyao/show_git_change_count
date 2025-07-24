import * as vscode from 'vscode';
import { GitChangeCountProvider } from './gitChangeCountProvider';

export function activate(context: vscode.ExtensionContext): void {
  console.log('扩展开始激活...');
  const provider = new GitChangeCountProvider();
  provider.activate(context);
  context.subscriptions.push(provider);
  console.log('扩展激活完成');
}

export function deactivate(): void {
  // 清理工作在这里完成
} 