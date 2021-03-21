import * as vscode from 'vscode';
import * as parser from 'jsonc-parser';
import * as path from 'path';
import { CodeNodeType } from '../models/code-node-type.enum';

export class CodeJsonTreeProvider implements vscode.TreeDataProvider<number> {
  private _notifyTreeChanges = new vscode.EventEmitter<
    number | undefined | void
  >();
  readonly onDidChangeTreeData = this._notifyTreeChanges.event;

  private _textEditor?: vscode.TextEditor;
  private _text: string = '';
  private _root?: parser.Node;

  constructor() {}

  getTreeItem(position: number): vscode.TreeItem {
    const path = parser.getLocation(this._text, position).path;
    const node = parser.findNodeAtLocation(this._root!, path)!;
    const treeItem = new vscode.TreeItem(
      this._getLabel(node),
      this._getCollapsibleState(node)
    );
    treeItem.contextValue = node.type;
    return treeItem;
  }

  getChildren(position?: number): vscode.ProviderResult<number[]> {
    if (!position) {
      return Promise.resolve(
        this._root ? this._getChildrenOffsets(this._root!) : []
      );
    }
    const path = parser.getLocation(this._text, position).path;
    const node = parser.findNodeAtLocation(this._root!, path);
    return Promise.resolve(this._getChildrenOffsets(node!));
  }

  refreshTree(): void {
    this._text = '';
    this._root = undefined;
    this._textEditor = vscode.window.activeTextEditor;

    if (this._textEditor?.document) {
      this._text = this._textEditor.document.getText();
      this._root = parser.parseTree(this._text);
    }
  }

  onDidChangeActiveTextEditor(): void {
    const isTreeActive =
      vscode.window.activeTextEditor?.document.uri.scheme === 'file' &&
      !!vscode.window.activeTextEditor.document.languageId.match(/^jsonc?$/);
    vscode.commands.executeCommand(
      'setContext',
      'code-json-editor.tree-active',
      isTreeActive
    );

    this.refreshTree();
    this._notifyTreeChanges.fire();
  }

  onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent): void {
    if (
      event.document.uri.toString() ===
      this._textEditor?.document.uri.toString()
    ) {
      for (const change of event.contentChanges) {
        const path = parser.getLocation(
          this._text,
          this._textEditor.document.offsetAt(change.range.start)
        ).path;
        path.pop();
        const node = path.length
          ? parser.findNodeAtLocation(this._root!, path)
          : void 0;
        this.refreshTree();
        this._notifyTreeChanges.fire(node?.offset);
      }
    }
  }

  private _getCollapsibleState(
    node: parser.Node
  ): vscode.TreeItemCollapsibleState {
    switch (node.type) {
      case CodeNodeType.object:
        return vscode.TreeItemCollapsibleState.Expanded;
      case CodeNodeType.array:
        return vscode.TreeItemCollapsibleState.Collapsed;
    }
    return vscode.TreeItemCollapsibleState.None;
  }

  private _getChildrenOffsets(node: parser.Node): number[] {
    return (
      node?.children?.reduce((accum, child) => {
        const childNode = this._getNode(child.offset);
        if (childNode) {
          accum.push(childNode.offset);
        }
        return accum;
      }, <number[]>[]) ?? []
    );
  }

  private _getNode(position: number): parser.Node | undefined {
    return parser.findNodeAtLocation(
      this._root!,
      parser.getLocation(this._text, position).path
    );
  }

  private _getLabel(node: parser.Node): string {
    if (node.parent!.type === CodeNodeType.array) {
      const prefix = node.parent!.children!.indexOf(node).toString();
      if (node.type === CodeNodeType.object) {
        return '{ } ' + prefix;
      }
      if (node.type === CodeNodeType.array) {
        return '[ ] ' + prefix;
      }
      return prefix + ':' + node.value.toString();
    }

    const property = node.parent!.children![0].value.toString();
    if (node.type === CodeNodeType.object) {
      return '{ } ' + property;
    }
    if (node.type === CodeNodeType.array) {
      return '[ ] ' + property;
    }
    const value = this._textEditor?.document.getText(
      new vscode.Range(
        this._textEditor.document.positionAt(node.offset),
        this._textEditor.document.positionAt(node.offset + node.length)
      )
    );
    return `${property}: ${value}`;
  }
}
