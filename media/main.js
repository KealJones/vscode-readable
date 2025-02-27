'use strict';
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  const vscode = acquireVsCodeApi();
  const positiveIcon = '✓';
  const negativeIcon = '✗';

  const oldState = /** @type {{ fleschGradeIdeal: number, fleschEaseIdeal: number} | undefined} */ (vscode.getState());

  const contentContainer = document.getElementById('content-container');

  const emptyView = document.getElementById('empty-view');
  const selectedText = document.getElementById('selected-text');

  const fleschEase = document.getElementById('flesch-ease');
  const fleschEaseValue = fleschEase?.querySelector('.value');
  const fleschEaseIdeal = fleschEase?.querySelector('.ideal');
  const fleschEaseStatus = fleschEase?.querySelector('.status');
  const fleschEaseIcon = fleschEaseStatus?.querySelector('.icon');

  const fleschGrade = document.getElementById('flesch-grade');
  const fleschGradeValue = fleschGrade?.querySelector('.value');
  const fleschGradeIdeal = fleschGrade?.querySelector('.ideal');
  const fleschGradeStatus = fleschGrade?.querySelector('.status');
  const fleschGradeIcon = fleschGradeStatus?.querySelector('.icon');

  let currentFleschGradeIdeal = (oldState && oldState.fleschGradeIdeal) || 8;
  let currentFleschEaseIdeal = (oldState && oldState.fleschEaseIdeal) || 65;

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.command) {
      case 'syncSettings':
        if (fleschEaseIdeal && fleschGradeIdeal) {
          fleschGradeIdeal.textContent = message.fleschGradeIdeal;
          fleschEaseIdeal.textContent = message.fleschEaseIdeal;
          vscode.setState({
            fleschGradeIdeal: message.fleschGradeIdeal,
            fleschEaseIdeal: message.fleschEaseIdeal,
          });
        }
        break;
      case 'checkSelected':
        emptyView?.classList.toggle('hide', true);
        contentContainer?.classList.toggle('hide', false);
        if (selectedText) {
          selectedText.textContent = message.selectedText;
        }
        // This is gross and i bet it could be cleaned up and streamlined but This gets the job done.
        if (fleschGradeValue && fleschEaseValue) {
          fleschGradeValue.textContent = `Grade ${message.fleschGrade}`;
          fleschEaseValue.textContent = message.fleschEase;
          if (fleschEaseIcon && fleschGradeIcon) {
            const isFleschEasePositive = message.fleschEase >= currentFleschEaseIdeal;
            const isFleschGradePositive = message.fleschGrade <= currentFleschGradeIdeal;
            fleschEaseIcon.textContent = isFleschEasePositive ? positiveIcon : negativeIcon;
            fleschEaseStatus?.classList.toggle('good', isFleschEasePositive);
            fleschEaseStatus?.classList.toggle('bad', !isFleschEasePositive);
            fleschGradeIcon.textContent = isFleschGradePositive ? positiveIcon : negativeIcon;
            fleschGradeStatus?.classList.toggle('good', isFleschGradePositive);
            fleschGradeStatus?.classList.toggle('bad', !isFleschGradePositive);
          }
        }

        break;
    }
  });
})();
