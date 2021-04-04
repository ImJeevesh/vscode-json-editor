(function () {
  const vscode = acquireVsCodeApi();

  const borderToggler = document.querySelector('#toggle-body-border-btn');
  if (borderToggler) {
    borderToggler.addEventListener('click', () => toggleBorder());
  }

  function getCurrentState() {
    return vscode.getState() || { showBorder: false };
  }

  function toggleBorder() {
    const oldState = getCurrentState();
    document.body.classList.toggle('border-purple');
    vscode.setState({ showBorder: !oldState.showBorder });
  }
})();
