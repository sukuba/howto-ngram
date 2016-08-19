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
    '/a': "私たちは、もっとも始めに、この文書 a を追加してみます。",
    '/b': '2つ目はもっともっとおもしろいよ、ね。'
  };
  var jsonBase = 'hoge/';
  
  function encodeKey(text) {
    var encodedArr = [];
    for(var i = 0; i < text.length; i++) {
      var twoByte = ('0000' + text.charCodeAt(i).toString(16)).slice(-4);
      encodedArr.push(twoByte);
    }
    var encodedStr = encodedArr.join('');
    var byByte = [];
    for(var i = 0; i < encodedStr.length; i+=2) {
      byByte.push(encodedStr.substr(i, 2));
    }
    
    return(byByte.join('-'));
  }
  
  function findPerfection(x, n) {
    var bag = [];
    var ids = Object.keys(x);
    for(var i = 0; i < ids.length; i++) {
      var xx = x[ids[i]];
      var seqs = Object.keys(xx);
      if(seqs.length < n) { continue; }
      
      var mini = Number.MAX_SAFE_INTEGER;
      for(var j = 0; j < n; j++) {
        if(xx[j].length < mini) {
          mini = j;
        }
      }
      
      var xxx = xx[mini];
      for(var k = 0; k < xxx.length; k++) {
        var p = xxx[k] - mini;
        for(var j = 0; j < n; j++) {
          if(j == mini) { continue; }
          var q = xx[j].indexOf(p + j);
          if(q == -1) { break; }
        }
        if(j == n) {
          bag.push([ids[i], p]);
        }
      }
    }
    return(bag);
  }
  
  function loadNgramIndex(text) {
    //console.log(text);
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
    
    var nText = texts.length;
    var deferred = [];
    for(var i = 0; i < nText; i++) {
      deferred.push(loadNgramIndex(texts[i]));
    }
    
    $.when.apply($, deferred).done(function(useArgumentsToGetAllAsArray){
      var results = arguments;
      if(deferred.length == 1) { // adjust nesting level
        results = [results];
      }
      console.log('whole: ', results.length, results);
      found = {}; // gather results by location.
      $.each(results, function(j, result){
        console.log('j=', j, result);
        if(result == undefined) {
          console.log('result is undefined. means ajax success with empty result.');
          return(true);
        }
        // result is [data, status_text, jqXHR_object]
        $.each(result[0], function(i, val){
          console.log('i=', i, val);
          
          //var keyText = texts[j];
          var docId = val[0];
          var pos = val[1];
          if(!(docId in found)) {
            found[docId] = {};
          }
          //if(!(keyText in found[docId])) {
          //  found[docId][keyText] = [];
          if(!(j in found[docId])) {
            found[docId][j] = [];
          }
          //found[docId][keyText].push(pos);
          found[docId][j].push(pos);
          // not using keyText, because what actually important is the sequence.
          
          strVal = JSON.stringify(val);
          console.log(val[0]);
          var x = cheat[val[0]];
          var xx = [x.substr(0, val[1]), '<b>', x.substr(val[1], nGram), '</b>', x.substring(val[1] + nGram, x.length)];
          $('#result').append(makeHtmlTrTd([what, strVal, xx.join('')]));
        });
      });
      
      console.log(JSON.stringify(found));
      var perfection = findPerfection(found, nText);
      console.log(JSON.stringify(perfection));
      
      for(var k = 0; k < perfection.length; k++) {
        var val = perfection[k];
        var x = cheat[val[0]];
        var xx = [x.substr(0, val[1]), '<b>', x.substr(val[1], nWhat), '</b>', x.substring(val[1] + nWhat, x.length)];
        $('#result').append(makeHtmlTrTd(['*', JSON.stringify(val), xx.join('')]));
      }
    });
    
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
