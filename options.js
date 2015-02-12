$(document).ready(function() {

	// populate textarea with current monitored sites
	var txt = localStorage["domHash"];
	txt = txt.replace(/[0-9]/g, "");
	txt = txt.replace('{"', '');
	txt = txt.replace('":}', '');
	txt = txt.replace(/":,"/g, ', ');
	$("#domains").val(txt);

   	// activate buttons
	$('#saveDoms').click(checkDomInputs);
	$('#export').click(exportData);
	$('#durButton').click(saveDuration);
	$('#URLbutton').click(verifyWorkpage);

});

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
	$deets = $("<label id = 'deets'>Checking input validity. This may take a few seconds...</label>");
	$('#redirect').append($deets);

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
			$success = $("<p id = 'nice'>Redirect URL saved successfully</p>");
			$("#deets").remove();
			$("#redirect").append($success);
			$("#nice").fadeOut(5000);

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

		$save = $("<p id = 'win'>new block duration set.</p>");
		$("#dur").append($save);
		$("#win").fadeOut(5000);
	}
	else {
		$sorry = $("<p id = 'lose'>You may not change block duration during a block. Sorry.</p>");
		$("#dur").append($sorry);
		$("#lose").fadeOut(5000);

	}
}

// button activation for domains to monitor setting
// check for the validity of domain names and store them if valid
function checkDomInputs() {
	console.log("time to check and save");

	// inform user that we're working
	$deets = $("<label id = 'deets'>Checking input validity. This may take a few seconds...</label>");
	$('#doms').append($deets);

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

// create a new domHash and transfer old values if applicable
function makeDH(doms) {

	var dH = new Object();
	var oldDH = JSON.parse(localStorage["domHash"]);

	console.log(oldDH);
	console.log("creating an updated domHash");

	// transfer time wasted values if there are matching domains in the new set
	// !! possible improvement: save in separate data package positive time 
	// !! wasted values that are thrown out 
	for (var i = 0; i < doms.length; i++) {
		for (var j in oldDH) {
			console.log("old dom is " + j + " and new is " + doms[i]);
			if (j === doms[i]) {
				console.log("match! Transferring value " + oldDH[j]);
				dH[doms[i]] = oldDH[j];
				break;
			}
			else {
				console.log("writing value 0");
				dH[doms[i]] = 0; 
			}
		}
	}
	console.log('user domHash initialized');


	// show the values stored
	for (var k in dH) {
		console.log("the printing loop is happening");
   		// use hasOwnProperty to filter out keys from the Object.prototype
    	if (dH.hasOwnProperty(k)) {
   	    	console.log('key is: ' + k + ', value is: ' + dH[k]);
   		}
	}
	localStorage["domHash"] = JSON.stringify(dH);
	console.log("user's domHash saved");
	$saved = $("<p id = 'woot'>New Domains saved<p/>");
	$("#deets").remove();
	$("#doms").append($saved);
	$("#woot").fadeOut(5000);

}

// checks that each domain name input exists. Calls Hash making code if 
// they all exist and alerts the user if an error is thrown
function checkDom(doms, count, last) {
	console.log("checking dom named '" + doms[count] 
		+ "', index number " + count);

	$.ajax({
		//type: 'HEAD',
		url: "http://" + doms[count],

		// domain exists
		success: function() {
			console.log(doms[count] + " is valid");
			if (count === last) {
				console.log("checked em all successfully!");
				makeDH(doms);
			}
			else {
				count++;
				checkDom(doms, count, last);
			}
		},

		// domain does not exist
		error: function() {
        	console.log(doms[count] + " failed!");
        	$("#deets").remove();
        	alert("Domain Name input invalid!\n Culprit: " + doms[count]);
        	return;
		}
	});
}

function exportData() {
	console.log("we're doing the export here");

	var data = "target Cache:\n";
	data += localStorage["targetCache"] + "\n";

	data += "\ndomHash:\n";
	data += localStorage["domHash"] + "\n";

	data += "\n# targets Set: ";
	data += localStorage["targetNum"] + "\n";
	
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
