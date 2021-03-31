import * as vscode from 'vscode';
import { CJECommandNames } from './models/cje-command-names.enum';
import { CodeJsonTreeProvider } from './providers/code-json-tree-provider';

export function activate(_context: vscode.ExtensionContext) {
  const provider = new CodeJsonTreeProvider();

  const treeView = vscode.window.createTreeView('code-json-editor', {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  _context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => provider.onDidChangeActiveTextEditor()),
    vscode.workspace.onDidChangeTextDocument(e => provider.onDidChangeTextDocument(e)),
    vscode.window.onDidChangeTextEditorSelection(() => provider.onDidChangeTextEditorSelection(treeView)),
    vscode.commands.registerCommand(CJECommandNames.treeItemSelection, (position: number) =>
      provider.onDidSelectTreeItem(position)
    ),
    vscode.commands.registerCommand(CJECommandNames.highlightValue, (position: number) =>
      provider.onDidHighlightValue(position)
    ),
    vscode.commands.registerCommand(CJECommandNames.jumpEnd, (position: number) => provider.onDidJumpToEnd(position)),
    vscode.commands.registerCommand(CJECommandNames.copyValueToClipboard, (position: number) =>
      provider.onCopyValueToClipboard(position)
    )
  );
  provider.refreshTree();
  console.log('Congratulations, your extension "code-json-editor" is now ready!');
}

export function deactivate() {}
