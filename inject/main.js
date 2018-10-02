(function(){
'use strict';

// The implementation is from https://stackoverflow.com/a/5084441/260793
function getSelectionHTML() {
  const userSelection = window.getSelection();
  if (userSelection && userSelection.rangeCount && userSelection.toString().length > 5) {
    let range;
    if (userSelection.getRangeAt) {
      range = userSelection.getRangeAt(0);
    }
    else {
      range = document.createRange();
      range.setStart(userSelection.anchorNode, userSelection.anchorOffset);
      range.setEnd(userSelection.focusNode, userSelection.focusOffset);
    }

    const doc = document.implementation.createHTMLDocument(document.title);
    const article = doc.body.appendChild(
      doc.createElement('article')
    );
    article.appendChild(range.commonAncestorContainer.cloneNode(true));
    return doc;
  }
  else {
    return;
  }
}

function init() {
  var article = new Readability(
    getSelectionHTML() || document.cloneNode(true)
  ).parse();

  if (!article) {
    alert('error')
    return;
  }

  var key = Math.random();
  var items = {};
  items[key] = {
    title: article.title,
    content: article.content
  }

  chrome.storage.local.set(items, function() {
    chrome.runtime.sendMessage({
      cmd: 'open-reader',
      key: key
    });
  });

}

init();

})();