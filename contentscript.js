

// request local storage data package from background.js
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {

  console.log("receiving background data for block");
  console.log(response.block);
  console.log(response.dH);
  var block = JSON.parse(response.block);
  var dH = JSON.parse(response.dH);
  var workpage = response.workpage;

  if (block) {
    console.log("we gotta block, man");

    // process domain name from current URL
    console.log("current URL is " + document.URL);
    current = getDomain(document.URL);

  	// check current domain name against time wasters
    if (dH != undefined) {
      // block if domain match found
      for (var k in dH) {
        console.log(k + " vs. " + current);
        if (k === current) {
				  window.location = workpage;
        }  
      }
    }
  }
  else console.log ("no need to block right now");
});

// thanks to Dan Kang and his web timer
function getDomain(url) {
    var regEx = /:\/\/(www\.)?(.+?)\//;
    return url.match(regEx)[2];


}