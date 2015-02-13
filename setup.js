google.load("visualization", "1.0", {packages:["corechart"]});

// create jquery page
$(document).ready(function () {

  var timeWasted = JSON.parse(localStorage["timeWasted"]);
  if (timeWasted !== undefined) 
    var wasteMins = Math.floor(timeWasted / 60);
    
  var target = JSON.parse(localStorage["target"]);
  if (target !== undefined) {

    // offer target setting if no target set
    if (target === 0) {

      // inject dropdown values
      var option = '<option value = .1>6 minutes</option>';
      for (var i = 1; i <= 16; i++) {
        var val = i * 0.5;
        option += '<option value = ' + val + '>' + val + '</option>';
      }

      $('#dropdown').html(option);
      $('#submit').click(setTarget);
    }

    // else block any target change
    else {
      $("#target").hide();
      var $set = $("<b>Target set for " + target + " hour(s)</b>");
      $("#reminder").append($set);
    }

    var showButton = JSON.parse(localStorage["blockVar"]);
    if (showButton) $("#block").hide();
  }

  $("#block").click(initiateBlock);
  $("#options").click(showOptions);
  google.setOnLoadCallback(makeChart);
});

// Show options in a new tab
function showOptions() {
  chrome.tabs.create({
    url: 'options.html'
  });
}

function initiateBlock() {

  // ask the user to block sites
  var dur = localStorage["blockDuration"];
  var c = 
    confirm("Are you sure you want to block now for " + dur + " hour(s)?");
  
  // increment prompt total     
  var promptNum = JSON.parse(localStorage["promptNum"]);
  if (promptNum !== undefined) promptNum++;
  else promptNum = 1;

  localStorage["promptNum"] = JSON.stringify(promptNum);
  console.log('number of block prompts is ' + promptNum);

  if (c === true) {
    $("#block").hide();

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
    bCache += "\n" + blockNum + ". User Instigated; " + dur + " hours";
    console.log(bCache);
    localStorage["blockLog"] = bCache;
  
    //var 5minMS = 600 * 1000; // sec * ms/sec    
    //setTimeout( function() {

        // refresh the current window
      chrome.tabs.reload(); 
      //}, 5minMS);                   
  }
}

function makeChart() {

  var timeWasted = JSON.parse(localStorage["timeWasted"]);
  var target = JSON.parse(localStorage["target"]);


  // display total wasted time since last reset
  var spentMins = Math.floor(timeWasted / 60);
  console.log('minutes spent is ' + spentMins);
  var data = google.visualization.arrayToDataTable([
    ['Element', 'Play Time Usage', { role: 'style' }],
    ['Minutes Spent', spentMins, 'color: blue']
      ]);
  /*var data = new google.visualization.DataTable();
  data.addColumn('string', 'Time Spent'); 
  data.addColumn('number', 'minutes');
  data.addRows([['Minutes Spent', spentMins]]);*/

  var title = 'Time spent on play sites';


  //display wasted time as %age of target
  if (target !== 0) {

    // create % of target data table
    var percent = Math.floor(((timeWasted / 60) / (60 * target)) * 100);
    //var data2 = new google.visualization.DataTable();
    data = google.visualization.arrayToDataTable([
          ['Year', 'Minutes Spent', '% of Target'],
          ['Play Time Usage',  spentMins, percent]
        ]);
    /*data.addColumn('string', 'Time Spent') 
    data.addColumn('number', '%'),
    data.addRows([['target Used (%)', percent]]);*/
    title = 'Time Spent and Target Usage';
  }

  options = {
    width: 300,
    height: 300,
    title: title
    };

  var timeChart = new google.visualization.ColumnChart(
    document.getElementById('graph'));

  timeChart.draw(data, options);
  console.log("yeah man");
}

// set target variable and alter interface so target cannot be reset
function setTarget() {
	var target = $('#dropdown').val();
	console.log("target is currently " + target);

	if (target !== 0) {

    // increment target total
    var targetNum = JSON.parse(localStorage["targetNum"]);
  
    if (targetNum !== undefined) targetNum++;
    else targetNum = 1;
    localStorage["targetNum"] = JSON.stringify(targetNum);

    // log target size in target cache
    var qCache = localStorage["targetCache"];
    qCache += "\n" + targetNum + ". " + target + " hrs";
    console.log(qCache);
    localStorage["targetCache"] = qCache;
    
    console.log('total number of targets set is ' + targetNum);
        
    // package and save time target was set
    var date = new Date();
    var day = date.getDay();
    var hr = date.getHours();
    var dateString = day + "_" + hr;

    localStorage["targetSetTime"] = dateString;
    console.log('target set at day_hour ' + dateString);
    localStorage["target"] = JSON.stringify(target);

		console.log("hiding");
    $("#target").hide();
    var $set = $("<b>Target set for " + target + " hour(s)</b>");
    $("#reminder").append($set);
	}
}


