(function () {
  const vscode = acquireVsCodeApi();

  window.addEventListener('message', ({ data }) => {
    const { type, arguments } = data;
    switch (type) {
      case 'json':
        updateJsonView(arguments[0]);
        break;
    }
  });

  vscode.postMessage({ type: 'get-initial-json' });

  document.querySelector('#jsonata-evaluate-btn')
    .addEventListener('click', () => evaluateJsonataExpression());

  function getCurrentState() {
    return vscode.getState() || { json: {} };
  }

  function updateJsonView(json) {
    if (json) {
      vscode.setState({ json: json ?? {} });
    }
  }

  function evaluateJsonataExpression() {
    const expression = document.querySelector('#jsonata-expression').value;
    console.log(expression, getCurrentState().json);
    document.querySelector('#jsonata-result').innerHTML = JSON.stringify(jsonata(expression).evaluate(getCurrentState().json), null, 2);
  }
})();
