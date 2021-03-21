import * as vscode from 'vscode';
import { CodeJsonTreeProvider } from './providers/code-json-tree-provider';

export function activate(_context: vscode.ExtensionContext) {
  const provider = new CodeJsonTreeProvider();

  _context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() =>
      provider.onDidChangeActiveTextEditor()
    ),
    vscode.workspace.onDidChangeTextDocument(e =>
      provider.onDidChangeTextDocument(e)
    )
  );

  vscode.window.createTreeView('code-json-editor', {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  provider.refreshTree();
  console.log(
    'Congratulations, your extension "code-json-editor" is now ready!'
  );
}

export function deactivate() {}
