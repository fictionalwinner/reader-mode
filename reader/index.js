(function(){
'use strict';

function convertImageToBase64(img) {
  var canvas = document.createElement('canvas');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  img.setAttribute('src', canvas.toDataURL());
}

function process(article) {
  if (!article) return;
  $('#title').find('input').val(article.title);
  var $content = $('#content');
  $content.html(article.content);
  $content.find('img').one('load', function() {
    convertImageToBase64(this);
  });
}

function saveText(data, name, ext) {
  var blob = new Blob([data], {
    type: 'text/plain'
  });
  name = name.replace(/[<>:"/\\|?*]+/g, '_') + ext;
  var $a = $('<a style="display:none" href="' + URL.createObjectURL(blob) + '" download="' + name + '"></a>').appendTo('body');
  $a[0].click();
  $a.remove();
}

function saveAsHtml(data, name) {
  data = '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\r\n' + data;
  saveText(data, name, '.html');
}

function saveAsMarkdown(data, name) {
  data = new TurndownService().turndown(data);
  saveText(data, name, '.md');
}

function init() {
  var key = decodeURIComponent(window.location.search.substr(1));
  if (key) {
    chrome.storage.local.get([key], function(items) {
      if (chrome.runtime.lastError)
        return;
      process(items[key]);
      chrome.storage.local.remove([key]);
    });
  }

  $('#download').find('button:eq(0)').click(function() {
    saveAsHtml($('#content').html(), $('#title').find('input').val());
  });
  $('#download').find('button:eq(1)').click(function() {
    saveAsMarkdown($('#content').html(), $('#title').find('input').val());
  });
}

init();

})();