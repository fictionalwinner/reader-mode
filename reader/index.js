(function(){
'use strict';

var identifier;

function getElementData(element, key) {
  return element.getAttribute('data-' + key + '-' + identifier);
}

function setElementData(element, key, value) {
  element.setAttribute('data-' + key + '-' + identifier, value);
}

function convertImageToBlob(img, cb) {
  var canvas = document.createElement('canvas');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  canvas.toBlob(cb);
}

function uploadImage(img, cb) {
  function showError() {
    alert('failed to upload image:\n' + img.getAttribute('src'));
  }

  if (getElementData(img, 'uploaded') === 'yes') {
    cb();
    return;
  }

  $('#status').text('uploading image: ' + img.getAttribute('src'));

  convertImageToBlob(img, function(blob) {
    var formData = new FormData();
    formData.append('smfile', blob);
    $.ajax({
      url: 'https://sm.ms/api/upload',
      data: formData,
      processData: false,
      contentType: false,
      type: 'POST',
      success: function(result) {
        $('#status').text('');
        if (result.code !== 'success') {
          showError();
          return;
        }
        img.setAttribute('src', result.data.url);
        setElementData(img, 'uploaded', 'yes');
        cb();
      },
      error: function() {
        $('#status').text('');
        showError();
      }
    });
  });
}

function uploadImages(cb) {
  var imgs = document.getElementsByTagName('img');
  for (var l = imgs.length; l > 0; l--) {
    cb = uploadImage.bind(this, imgs[l-1], cb);
  }
  cb();
}

function process(article) {
  if (!article) return;
  $('#title').find('input').val(article.title);
  $('#content').html(article.content);
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

function saveAsMarkdown() {
  var data = $('#content').html(), name = $('#title').find('input').val();
  data = new TurndownService().turndown(data);
  saveText(data, name, '.md');
}

function init() {
  identifier = decodeURIComponent(window.location.search.substr(1));
  if (identifier) {
    chrome.storage.local.get([identifier], function(items) {
      if (chrome.runtime.lastError)
        return;
      process(items[identifier]);
      chrome.storage.local.remove([identifier]);
    });
  }

  $('#download').find('button:eq(0)').click(function() {
    saveAsMarkdown();
  });
  $('#download').find('button:eq(1)').click(function() {
    uploadImages(saveAsMarkdown);
  });
}

init();

})();