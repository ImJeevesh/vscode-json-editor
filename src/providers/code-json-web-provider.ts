import * as vscode from 'vscode';

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export class CodeJsonWebProvider implements vscode.WebviewViewProvider {
  private _webviewView: vscode.WebviewView | undefined;
  private _html: string | undefined;

  private get _webview(): vscode.Webview {
    return this._webviewView!.webview;
  }

  private get _rootPathUri(): vscode.Uri {
    return vscode.Uri.joinPath(this._extensionUri, 'src', 'web-root');
  }

  constructor(private _extensionUri: vscode.Uri) {}

  async resolveWebviewView(
    _webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this._webviewView = _webviewView;
    this._webview.options = {
      enableScripts: true,
      enableCommandUris: true,
      localResourceRoots: [this._rootPathUri],
    };

    this._webview.html = await this._getHtml();
    this._webview.onDidReceiveMessage(data => {});
  }

  private async _getHtml() {
    if (this._html) {
      return this._html;
    }

    const nonce = getNonce();
    const stylesUri = this._webview.asWebviewUri(vscode.Uri.joinPath(this._rootPathUri, 'styles.css'));
    const mainJsUri = this._webview.asWebviewUri(vscode.Uri.joinPath(this._rootPathUri, 'main.js'));

    // TODO: move to index.html and gen build system
    this._html = `
    <!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this._webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesUri}" rel="stylesheet">
				
				<title>Code JSON Editor</title>
			</head>
			<body>
				<h1>Under Development!</h1>
        <button id="toggle-body-border-btn">Toggle Border</button>
				<script nonce="${nonce}" src="${mainJsUri}"></script>
			</body>
			</html>
    `;
    return this._html;
  }
}
