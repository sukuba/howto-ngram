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
  
  function XXXappendSearchResult(what) {
    var N = what.length;
    var n = 2;
    // single character text will not go into the loop.
    for(var i = 0; i < N - n + 1; i++) {
      var findWhat = encodeKey(what.substr(i, n));
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
  }
  
  function loadNgramIndex(text) {
    console.log(text);
    var fileName = jsonBase + encodeKey(text) + '.json';
    return($.ajax(fileName, commonParams).fail(failMessageHandler));
  }
  
  function appendSearchResult(what) {
    var nWhat = what.length;
    var nGram = 2;
    var nIter = nWhat - nGram + 1;
    var texts = [];
    // single character text will not go into the loop.
    for(var i = 0; i < nIter; i++) {
      texts.push(what.substr(i, nGram));
    }
    
    // for a short word
    if(nWhat < nGram) {
      texts.push(what);
      console.log('adjusted: ', texts);
    }
    
    var deferred = [];
    for(var i = 0; i < texts.length; i++) {
      deferred.push(loadNgramIndex(texts[i]));
    }
    
    $.when.apply($, deferred).done(function(useArgumentsToGetAllAsArray){
      var results = arguments;
      if(deferred.length == 1) { // adjust nesting level
        results = [results];
      }
      console.log('whole: ', results.length, results);
      $.each(results, function(j, result){
        console.log('j=', j, result);
        if(result == undefined) {
          console.log('result is undefined. means ajax success with empty result.');
          return(true);
        }
        // result is [data, status_text, jqXHR_object]
        $.each(result[0], function(i, val){
          console.log('i=', i, val);
          strVal = JSON.stringify(val);
          console.log(val[0]);
          var x = cheat[val[0]];
          var xx = [x.substr(0, val[1]), '<b>', x.substr(val[1], nGram), '</b>', x.substring(val[1] + nGram, x.length)];
          $('#result').append(makeHtmlTrTd([what, strVal, xx.join('')]));
        });
      });
    }).fail(function(hoge){
      console.log('failed.');
      console.log(arguments);
      console.log(arguments[0]);
      var keys = Object.keys(arguments[0])
      console.log(keys);
      for(i = 0; i < keys.length; i++) {
        console.log(arguments[0][i]);
      }
      console.log(deferred[0].state());
      console.log(deferred[1].state());
    });
    
    //$('#result').append(makeHtmlTrTd(texts));
  }
  
  function onSearch(what) {
    clearSearchResult();
    clearErrorMessage();
    appendSearchResult(what);
  }
  
  $('#search').click(function(){
    onSearch($('#q').val());
  });
  
  $('#q').keypress(function(k){
    if(k.which == 13) {
      onSearch($('#q').val());
      return(false);
    }
  });
  
});
