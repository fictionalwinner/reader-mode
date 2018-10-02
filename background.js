(function(){
'use strict';

function execScript(tabId, file, next) {
  chrome.tabs.executeScript(tabId, {
    file: file
  }, function() {
    if (chrome.runtime.lastError) {
      alert(chrome.runtime.lastError.message);
      return;
    }
    next && next();
  });
}


function execScripts(tabId, files) {
  var next = undefined;
  for (var l = files.length; l > 0; l--) {
    next = execScript.bind(this, tabId, files[l-1], next);
  }
  next && next();
}

function inject(info, tab) {
  execScripts(tab.id, [
    'inject/Readability.js',
    'inject/main.js'
  ]);
}

function init() {
  chrome.contextMenus.create({
    title: 'Reader Mode',
    contexts: ['page'],
    documentUrlPatterns: ['*://*/*'],
    onclick: inject
  });

  chrome.contextMenus.create({
    title: 'Reader Mode',
    contexts: ['selection'],
    onclick: inject
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd === 'open-reader') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('reader/index.html?') + request.key
    });
  }
});

chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

})();