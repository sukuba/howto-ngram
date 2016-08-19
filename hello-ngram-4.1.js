// hello-search
// https://github.com/sukuba/howto-ngram

$(document).ready(function(){
  
  function showErrorMessage(msg) {
    $('#error').text(msg);
  }
  
  function clearErrorMessage() {
    showErrorMessage('');
  }
  
  function clearSearchResult() {
    $('#result').html('');
  }
  
  function makeHtmlTrTd(tds) {
    var tr = [];
    tr.push('<tr><td>');
    tr.push(tds.join('</td><td>'));
    tr.push('</td></tr>');
    return(tr.join(''));
  }
  
  function failMessageHandler(xhr, ajaxOptions, thrownError) {
    var msg =xhr.status + ' / ' + thrownError;
    console.log(this.url);
    console.log(msg);
    showErrorMessage(this.url + ' / ' + msg);
  }
  
  var commonParams = {
    dataType: 'json',
    mimeType: 'text/plain; charset=utf8'
  }
  
  var cheat = {
    '/a': "This is the first document we've added!",
    '/b': 'The second one is even more interesting!'
  };
  var jsonBase = 'hoge/';
  
  function encodeKey(text) {
    var encodedArr = [];
    for(var i = 0; i < text.length; i++) {
      encodedArr.push(text.charCodeAt(i).toString(16));
    }
    var encodedStr = encodedArr.join('');
    var byByte = [];
    for(var i = 0; i < encodedStr.length; i+=2) {
      byByte.push(encodedStr.substr(i, 2));
    }
    
    return(byByte.join('-'));
  }
  
  function appendSearchResult(what) {
    var n = what.length;
    var findWhat = encodeKey(what);
    var fileName = jsonBase + findWhat + '.json';
    $.ajax(fileName, commonParams
    ).done(function(result){
      $.each(result, function(i, val){
        strVal = JSON.stringify(val);
        var x = cheat[val[0]]
        var xx = [x.substr(0, val[1]), '<b>', x.substr(val[1], n), '</b>', x.substring(val[1] + n, x.length)];
        $('#result').append(makeHtmlTrTd([what, fileName, strVal, xx.join('')]));
      });
    }).fail(failMessageHandler
    );
  }
  
  function onSearch(what) {
    clearSearchResult();
    clearErrorMessage();
    appendSearchResult(what);
  }
  
  $('#search').click(function(){
    onSearch($('#q').val());
  });
  
});
