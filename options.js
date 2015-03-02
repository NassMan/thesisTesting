$(document).ready(function() {

	// hide key input if it's been activated
	var keyUsed = JSON.parse(localStorage["keyBool"]);
	if (keyUsed) $("#key").remove();

	// populate textarea with current monitored sites
	var txt = localStorage["domHash"];
	txt = txt.replace(/[0-9]/g, "");
	txt = txt.replace('{"', '');
	txt = txt.replace('":}', '');
	txt = txt.replace(/":,"/g, ', ');
	$("#domains").val(txt);

	// populate extras with their values
	txt = localStorage["blockDuration"];
	$("#dropdown").val(txt);

	txt = localStorage["redirect"];
	$("#workpage").val(txt);

   	// activate buttons
	$('#saveDoms').click(checkDomInputs);
	$('#export').click(exportData);
	$('#keyButton').click(activateKey);
	$('#clearButton').click(clearTarget);

	// change options page based on experimental group
	var key = localStorage["keyVal"];
	if (key === "control" || key === "count") {
		$("#extras").hide();
		$clear = $('<label><b>Reset Time Wasted</b><br></label>')
		$('#clearButton').before($clear);
	}

	else {
		$('#durButton').click(saveDuration);
		$('#URLbutton').click(verifyWorkpage);
		$clear = $('<label><b>Reset Target and Time Wasted</b><br></label>')
		$('#clearButton').before($clear);
	}

});

// resets target and time wasted
function clearTarget() {
	var c = confirm("are you sure you want to reset?");

	if (c) {
		localStorage["target"] = 0;
		localStorage["timeWasted"] = 0;

    	// make a target clear log with timestamp
    	var date = new Date();
		var tCache = localStorage["resetLog"];
		var clrNum = JSON.parse(localStorage["resetNum"]);
		clrNum++;
		tCache += clrNum + ". " + date + "\n";
		localStorage["resetLog"] = tCache;
	}
}

// validate and activate key
function activateKey() {

	// check that it's one of the four valid keys
	var keySub = $("#keyInput").val();
	if (keySub !== "now" && keySub !== "5min" && 
		keySub !== "count" && keySub !== "control") {

		alert("invalid key!");
		$('#keyInput').val();
		return;
	}

	// save the key
	localStorage["keyVal"] = keySub;
	//alert("key value has taken on " + keySub);

	// remove key input capability
	localStorage["keyBool"] = "true";

	// close the options page
	window.close();
}

// thanks to Dan Kang and his web timer
function getDomain(url) {
  var regEx = /:\/\/(www\.)?(.+?)\//;
  return url.match(regEx)[2];
}

// checks for redirect URL validity and saves if valid. if not, alerts user
function verifyWorkpage () {
	
	// ensure workpage is URL
	var workpage = $('#workpage').val();
	console.log("checking workpage " + workpage);

	if (workpage === "") {
		console.log(workpage + " failed!");
       	$("#deets").remove();
       	alert("you need a URL, silly");
       	return;		
	}

	// inform user that we're working
	deets = "Checking input validity. This may take a few seconds...";
	document.getElementById("workUpdate").innerHTML = deets;

	//ajax check
	$.ajax({
		//type: 'HEAD',
		url: workpage,

		// domain exists
		success: function() {
			var dH = JSON.parse(localStorage["domHash"]);

			for (var i in dH) {

			if (getDomain(workpage) === i) {
				alert("No redirecting to a play site, you rascal!");
				return;
				}
			}

			localStorage["redirect"] = workpage;
			console.log(workpage + " is valid. saved.");
			var success = "Redirect URL saved successfully";
			document.getElementById("workUpdate").innerHTML = success;
		},

		// domain does not exist
		error: function() {
        	console.log(workpage + " failed!");
        	$("#deets").remove();
        	alert("URL " + workpage + " is not valid! Please revise.");
        	return;
		}
	});
}

// button activation for duration setting
function saveDuration() {
	var dur = parseFloat($('#dropdown').val());

	if (isNaN(dur)) {
		alert("invalid input! Please enter decimal or integer value");
		return;
	}
	var prohibited = JSON.parse(localStorage["blockVar"]);

	if (!prohibited) {
		console.log("block duration is currently " + dur);
		localStorage["blockDuration"] = dur;

		var save = "new block duration set.";
		document.getElementById("durUpdate").innerHTML = save;
	}
	else {
		var sorry = "You may not change block duration during a block. Sorry.";
		document.getElementById("durUpdate").innerHTML = sorry;
	}
}

// button activation for domains to monitor setting
// check for the validity of domain names and store them if valid
function checkDomInputs() {
	var blocking = JSON.parse(localStorage["blockVar"]);

	if (!blocking) {

		console.log("time to check and save");

		// inform user that we're working
		var deets = "Checking input validity. This may take a few seconds...";
		document.getElementById("domsUpdate").innerHTML = deets;

		// parse the doms input value
		var doms = $('#domains').val();
		doms = doms.split(/\s*,\s*/);

		for (var c in doms) {
			doms[c] = $.trim(doms[c]);
		}

		// check that domain inputs are valid
		var last = doms.length - 1;
		var count = 0;
		checkDom(doms, count, last);
	}
	else alert("For Shame!");
}

// create a new domHash and transfer old values if applicable
function makeDH(doms) {

	var dH = new Object();
	var oldDH = JSON.parse(localStorage["domHash"]);
	var lostPlayTime = JSON.parse(localStorage["otherDoms"]);
	console.log(oldDH);
	console.log("creating an updated domHash");


	// transfer time wasted values if there are matching domains in the new set
	for (var i = 0; i < doms.length; i++) {
		for (var j in oldDH) {
			console.log("old dom is " + j + " and new is " + doms[i]);
			if (j === doms[i]) {
				console.log("match! Transferring value " + oldDH[j]);
				dH[doms[i]] = oldDH[j];
				break;
			}
			else dH[doms[i]] = 0; 
		}
	}

	// save lost time spent in "other" cache
	var oldSum = 0;
	for (var k in oldDH) {
		oldSum += oldDH[k];
		console.log(oldDH[k]);
	}
	var newSum = 0;
	for (var m in dH) newSum += dH[m];
	lostPlayTime += (oldSum - newSum);
	console.log("old total is " + oldSum + " and new total is " + newSum);
	console.log("lost play time total is " + lostPlayTime);
	localStorage["otherDoms"] = lostPlayTime;

	// save new domHash
	console.log(dH);
	localStorage["domHash"] = JSON.stringify(dH);

	// notify user of completion
	console.log("user's domHash saved");
	var saved = "New Domains saved";
	document.getElementById("domsUpdate").innerHTML = saved;
}

// checks that each domain name input exists. Calls Hash making code if 
// they all exist and alerts the user if an error is thrown
function checkDom(doms, food, love) {
	console.log("checking dom named '" + doms[food] 
		+ "', index number " + food);

	$.ajax({
		//type: 'HEAD',
		url: "http://" + doms[food],

		// domain exists
		success: function() {
			console.log(doms[food] + " is valid");
			if (food === love) {
				console.log("checked em all successfully!");
				makeDH(doms);
			}
			else {
				food++;
				checkDom(doms, food, love);
			}
		},

		// domain does not exist
		error: function() {
        	console.log(doms[food] + " failed!");
        	alert("Domain Name input invalid!\n Culprit: " + doms[food]);
        	return;
		}
	});
}

function exportData() {
	console.log("we're doing the export here");

	var data = "group: " + localStorage["keyVal"] + "\n";
	
	data += "\n# targets Set: ";
	data += localStorage["targetNum"] + "\n";
	
	data += "target set Cache:\n";
	data += localStorage["targetLog"] + "\n";

	data += "\n# targets removed: ";
	data += localStorage["resetNum"] + "\n";
	
	data += "target removal Cache:\n";
	data += localStorage["resetLog"] + "\n";

	data += "\ndomHash:\n";
	data += localStorage["domHash"] + "\n";
	data += "other: " + localStorage["otherDoms"] + "\n";
	
	data += "\n# Blocks Prompted: ";
	data += localStorage["promptNum"] + "\n";

	data += "\n# Blocks Accepted: ";
	data += localStorage["blockNum"] + "\n";

	data += "\n block details:\n";
	data += localStorage["blockLog"] + "\n";

    var a = document.body.appendChild(
            document.createElement("a"));
    a.download = "exportDFA.txt";
    a.href = "data:text/plain;base64," + btoa(data);
    a.innerHTML = "download export data";
}
