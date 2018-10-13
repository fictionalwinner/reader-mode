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

function fixRelativeUris(articleContent) {
  var baseURI = document.baseURI;
  var documentURI = document.documentURI;
  function toAbsoluteURI(uri) {
    // Leave hash links alone if the base URI matches the document URI:
    if (baseURI == documentURI && uri.charAt(0) == "#") {
      return uri;
    }
    // Otherwise, resolve against base URI:
    try {
      return new URL(uri, baseURI).href;
    } catch (ex) {
      // Something went wrong, just return the original:
    }
    return uri;
  }

  var links = articleContent.getElementsByTagName("a");
  links = Array.from(links);
  links.forEach(function(link) {
    var href = link.getAttribute("href");
    if (href) {
      // Replace links with javascript: URIs with text content, since
      // they won't work after scripts have been removed from the page.
      if (href.indexOf("javascript:") === 0) {
        var text = document.createTextNode(link.textContent);
        link.parentNode.replaceChild(text, link);
      } else {
        link.setAttribute("href", toAbsoluteURI(href));
      }
    }
  });

  var imgs = articleContent.getElementsByTagName("img");
  imgs = Array.from(imgs);
  imgs.forEach(function(img) {
    var src = img.getAttribute("src");
    if (src) {
      img.setAttribute("src", toAbsoluteURI(src));
    }
  });
}

function grabArticleSafari() {
  var result = ReaderArticleFinderJS.adoptableArticle();

  if (!result)
    return null;

  fixRelativeUris(result);

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

  var key = Math.random().toString().substr(2);
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