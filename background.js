UPDATE_SECONDS = 5;

// create domains hash table
var domHash = new Object();
var doms = ["netflix.com", "buzzfeed.com", "facebook.com",
			"hulu.com", "twitter.com", "tumblr.com"];

for (var i = 0; i < doms.length; i++) {
	domHash[doms[i]] = 0;
}
console.log('domHash initialized');

// show the values stored
for (var k in domHash) {
   	// use hasOwnProperty to filter out keys from the Object.prototype
    if (domHash.hasOwnProperty(k)) {
   	    console.log('key is: ' + k + ', value is: ' + domHash[k]);
   	}
}

// set initial storage values
localStorage["domHash"] = JSON.stringify(domHash);

localStorage["timeWasted"] = 0;

localStorage["target"] = 0;

localStorage["targetCache"] = "";

localStorage["targetNum"] = 0;

localStorage["blockVar"] = "false";

localStorage["promptNum"] = 0;

localStorage["blockNum"] = 0;

localStorage["blockCount"] = 0;

localStorage["checked"] = "false";
localStorage["checkPtNum"] = 0;

// default redirect workpage
localStorage["redirect"] = "http://www.princeton.edu/economics";

// need to create these two
localStorage["blockLog"] = "";

// option to change how long you're blocked
localStorage["blockDuration"] = 1;

// send needed data to content script if requested
chrome.runtime.onMessage.addListener( 
  	function(request, sender, sendResponse) {
  		if (request.greeting == "hello") {
  		    sendResponse({block: localStorage["blockVar"], dH: localStorage["domHash"],
  						  workpage: localStorage["redirect"]});	
		}
});

// thanks to Dan Kang and his web timer
function getDomain(url) {
  var regEx = /:\/\/(www\.)?(.+?)\//;
  return url.match(regEx)[2];
}

// returns updated hash 
// *** thanks to Dan Kang's web timer.
function countUpdate() {
	console.log('\nnew call');
	chrome.idle.queryState(30, function (state) {
    	chrome.windows.getCurrent(function (current) {

    		// count time is browser is in use
			if (state === "active" || current.state === "fullscreen") {
  				chrome.tabs.query({active: true, currentWindow: true}, 
  					function (tabs) {

  					// if we should block, count blocked time
					var blocked = JSON.parse(localStorage["blockVar"]);
					if (blocked) {
						checkBlock();
					}

					// if we shouldn't block, count wasted time
					else {
						if (tabs.length === 0) return;

						var tab = tabs[0];
						// get current Domain
						var current = getDomain(tab.url);	

						// a problem cause undefined
						console.log(localStorage["domHash"]);
   						var dH = JSON.parse(localStorage["domHash"]);
        				if (dH !== undefined) {
							console.log('domHash got');
							console.log('current domain is ' + current);
							
							// get the hashed domain
							var found = 'false';
							for (var k in dH) {
    							if (k === current) {
    								console.log('match found!');
    								dH[k] += UPDATE_SECONDS;
  									console.log(dH);
									found = 'true';
									break;
    							}
							}
							if (found === 'true') {
								console.log(' updating...');
								localStorage["domHash"] = JSON.stringify(dH);
								console.log("domHash updated!");
								countSum();
								
							}
							else console.log('no change needed');
						}
						else console.log('PANIC: Hash table does not exist!');
							
					}			
				});
			}
			else console.log('state inactive; no update needed.');
		});
	});
}

// counts block duration and removes block if 
function checkBlock() {
	
	// get/update block time and duration in seconds
	var count = JSON.parse(localStorage["blockCount"]);
	count += UPDATE_SECONDS;
	
	var blockDur = localStorage["blockDuration"];
	blockDur = blockDur * 3600;
	console.log(count + " seconds of " + blockDur + " second sentence served");
	// remove block if duration exceeded
	if (count >= blockDur) {
    	localStorage["blockVar"] = "false";
    	localStorage["target"] = 0;
    	localStorage["blockCount"] = 0;
   		console.log("you did great. the block is coming down");
	}
	else {
		localStorage["blockCount"] = count;
	}

	
	// removes block at 6 am.
   /* var now = new Date();

    var targetSetTime = localStorage["targetSetTime"];
    if (targetSetTime !== undefined) {
   		var qst = targetSetTime.split("_");
   	 	var setDay = parseInt($.trim(qst[0]));
    	var setHr = parseInt($.trim(qst[1]));
    	var today = now.getDay();
    	var nowHr = now.getHours();

    	console.log('now is ' + nowHr + ' of ' + today + '.');
    	console.log('set on ' + setHr + ' of ' + setDay + '.');
   		console.log('day comparison evaluates to ' + (setDay !== today));
   		console.log('hours compare to 6 evaluates to ' + (setHr < 6 && nowHr > 6));


    	if (setDay !== today || (setHr < 6 && nowHr > 6)) {
    		localStorage["blockVar"] = "false";
    		localStorage["target"] = 0;
    		console.log("you did great. the block is coming down");
    	}
    	else console.log("not yet sry");
    }*/
}

// adds to time wasted and calls target checking code
function countSum() {
	var sum = 0;
	var timeWasted = JSON.parse(localStorage["timeWasted"]);
		if (timeWasted !== undefined) {
			sum = timeWasted + UPDATE_SECONDS;
			localStorage["timeWasted"] = JSON.stringify(sum);
			console.log('Total time wasted is ' + sum + ' seconds');

			var target = JSON.parse(localStorage["target"]);
			if (target !== 0) {
				checkWasteTarget(sum, target);
			}	
			else console.log("no target set");
		}
		else console.log("PANIC: timeWasted undefined!!");
}

// checks total wastedTime against the user's target; 
// if surpassed, initiate block
function checkWasteTarget(wastedTime, target) {
	
	// ratios of the target at which a prompt should appear
	var checkpoint = [0.5, 1, 1.5, 2];

	// convert time wasted and savings target to minutes
	wastedTime = Math.floor(wastedTime / 60);
	target = (target * 60);
	console.log("target is now " + target + " minutes");
	console.log("time wasted is " + wastedTime);

	var checked = JSON.parse(localStorage["checked"]);
	var i = JSON.parse(localStorage["checkPtNum"]);
		
	// check if block needed: matches a checkpoint AND haven't checked
	// at this checkpoint yet
	if (checkpoint.length > i) {
		console.log("ratio is " + checkpoint[i]);
		var targetCheckPt = target * checkpoint[i];
		console.log(targetCheckPt + " is the current target");
		console.log(wastedTime + " is the current wasted time total");

		// prevents breaking if block set later than current checkpoint
		if (wastedTime > targetCheckPt) localStorage["checkPtNum"] = i + 1;

		if (wastedTime === targetCheckPt) {
			console.log("time match!");
			if (!checked) {
				localStorage["checked"] = "true";
				localStorage["checkPtNum"] = i + 1;

				console.log("headed to prompt");
				blockPrompt(checkpoint[i]);
			}
		}
		else {
			console.log("resetting check var");
			localStorage["checked"] = "false";
		}
	}
}

// prompt the user to block play sites. if confirmed, initiate block. 
// Otherwise, reset target if final checkpoint is surpassed
function blockPrompt(ratio) {

	var percent = ratio * 100;
	var dur = localStorage["blockDuration"];
	
	// ask the user to block sites
	var c = 
		confirm("You have spent " + percent + 
			"% of your play time target.\n Do you want to block play sites now?\nBlock Duration set to "
			+ dur + " hour(s)");
	
	// increment prompt total			
	var promptNum = JSON.parse(localStorage["promptNum"]);
	if (promptNum !== undefined) promptNum++;
	else promptNum = 1;

	localStorage["promptNum"] = JSON.stringify(promptNum);
	console.log('number of block prompts is ' + promptNum);

	if (c === true) {

		// set block and increment block total
		localStorage["timeWasted"] = 0;
		localStorage["checkPtNum"] = 0;
		localStorage["blockVar"] = "true";
		var blockNum = JSON.parse(localStorage["blockNum"]);
		if (blockNum !== undefined) blockNum++;
		else blockNum = 1;
				
		localStorage["blockNum"] = JSON.stringify(blockNum);
		console.log('number of blocks is ' + blockNum);

		// log target size in target cache
    	var bCache = localStorage["blockLog"];
    	bCache += "\n" + blockNum + ". " + percent + "% of " + dur + " hours";
    	console.log(bCache);
    	localStorage["blockLog"] = bCache;
	
		//var 5minMS = 600 * 1000; // sec * ms/sec		
		//setTimeout( function() {

    		// refresh the current window
			chrome.tabs.reload();	
  		//}, 5minMS);										
		
	}
	else {
		if (ratio === 2) {
			localStorage["timeWasted"] = 0;
			localStorage["checkPtNum"] = 0;
			localStorage["target"] = 0;
			alert("resetting target to 0");
		}
	}
}

// count periodically
setInterval(countUpdate, UPDATE_SECONDS * 1000);