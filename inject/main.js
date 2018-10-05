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

function grabArticleSafari() {
  var result = ReaderArticleFinderJS.adoptableArticle();

  if (!result)
    return null;

  return {
    title: ReaderArticleFinderJS.articleTitle(),
    content: result.outerHTML
  };
}

function grabArticleMozilla(selectionHTML) {
  var result = new Readability(
    selectionHTML || document.cloneNode(true)
  ).parse();

  if (!result)
    return null;

  return {
    title: result.title,
    content: result.content
  };
}

function grabArticle() {
  var selectionHTML = getSelectionHTML();
  if (selectionHTML)
    return grabArticleMozilla(selectionHTML);

  var article = grabArticleSafari();
  if (!article)
    article = grabArticleMozilla();
  return article;
}

function init() {
  var article = grabArticle();
  if (!article) {
    alert('failed to grab article');
    return;
  }

  var key = Math.random();
  var items = {};
  items[key] = article;

  chrome.storage.local.set(items, function() {
    chrome.runtime.sendMessage({
      cmd: 'open-reader',
      key: key
    });
  });
}

init();

})();