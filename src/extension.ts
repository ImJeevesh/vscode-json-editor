import * as vscode from 'vscode';
import { CodeJsonTreeProvider } from './providers/code-json-tree-provider';
import { CodeJsonWebProvider } from './providers/code-json-web-provider';

export function activate(_context: vscode.ExtensionContext) {
  const treeDataProvider = new CodeJsonTreeProvider();
  const webProvider = new CodeJsonWebProvider(_context.extensionUri);

  const treeView = vscode.window.createTreeView('code-json-editor', {
    treeDataProvider,
    showCollapseAll: true,
  });

  _context.subscriptions.push(
    // treeDataProvider
    treeDataProvider.registerSubscriptions(),
    vscode.window.onDidChangeTextEditorSelection(() => treeDataProvider.onDidChangeTextEditorSelection(treeView)),
    // webProvider
    vscode.window.registerWebviewViewProvider('code-json-editor.web-view', webProvider),
  );
  console.log('Congratulations, your extension "code-json-editor" is now ready!');
}

export function deactivate() {}
