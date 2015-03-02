google.load("visualization", "1.0", {packages:["corechart"]});

// create jquery page
$(document).ready(function () {

var key = localStorage["keyVal"];
  if (key !== "control") {

    var timeWasted = JSON.parse(localStorage["timeWasted"]);
    if (timeWasted !== undefined) 
      var wasteMins = Math.floor(timeWasted / 60);
    
    var target = JSON.parse(localStorage["target"]);
    if (target !== undefined) {

      // offer target setting if no target set
      if (target === 0 && key !== "count") {

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
        if (key !== "count") {
          var $set = $("<b>Target set for " + target + " hour(s)</b>");
          $("#reminder").append($set);
        }
      }

      var blocking = JSON.parse(localStorage["blockVar"]);
      if (blocking || key === "count" || key === "control") {
        $("#block").hide();
        $("#target").hide();

      }
    }

   $("#block").click(function(){
      chrome.extension.sendRequest({ msg: "initiateBlock" });
    });
    google.setOnLoadCallback(makeChart);
  }

  // hide most features for control groups
  else {
    $("#target").hide();
    $("#block").hide();
  }

  $("#options").click(showOptions);
});

// Show options in a new tab
function showOptions() {
  chrome.tabs.create({
    url: 'options.html'
  });
}

// passes situation specific parameters to google charts.draw
function makeChart() {

  // if blocking, make a chart that shows how much block time left
  var blocking = JSON.parse(localStorage["blockVar"]);
  if (blocking) {
    
    var dur = JSON.parse(localStorage["blockDuration"]);
    var durMins = dur * 60;
    var blockSec = JSON.parse(localStorage["blockCount"]);
    var blockMins = Math.floor(blockSec / 60);
    var blockPct = Math.floor(((blockMins) / (dur * 60)) * 100);

    data = google.visualization.arrayToDataTable([
          ['Year', 'Minutes Blocked', '% of Block Duration'],
          ['Block Usage',  blockMins, blockPct]
    ]);
    var title = 'Time Left for Block';
    var text = 'Block Ends: ' + durMins;
    var vals = makeTicks(durMins, text, blocking);
    options = {
      width: 400,
      height: 300,
      title: title,
      vAxis: {ticks: vals}
    };

    var timeChart = new google.visualization.ColumnChart(
      document.getElementById('graph'));

    timeChart.draw(data, options);    
  }

  // display time wasted
  else {

    var timeWasted = JSON.parse(localStorage["timeWasted"]);
    var target = JSON.parse(localStorage["target"]);
    targetMins = parseFloat(60 * target);

    // display total wasted time since last reset
    var spentMins = Math.floor(timeWasted / 60);
    console.log('minutes spent is ' + spentMins);

    var data = google.visualization.arrayToDataTable([
      ['XXZZXXZZXX', 'Minutes Spent'],
      ['Play Time Usage', spentMins]
    ]);
    /*var data = new google.visualization.DataTable();
    data.addColumn('string', 'Time Spent'); 
    data.addColumn('number', 'minutes');
    data.addRows([['Minutes Spent', spentMins]]);*/
    var options = {
          width: 400,
          height: 300,
          title: title
    }

    var title = 'Time spent on play sites';


    //display wasted time relative to taret and 2 * target
    if (target !== 0) {
      title = 'Time Spent and Target Usage';
      var text = 'Target: ' + targetMins;
      var vals = makeTicks(targetMins, text, blocking);
      options = {
        width: 400,
        height: 300,
        title: title,
        vAxis: { ticks: vals}
      };
    }
  }

    var timeChart = new google.visualization.ColumnChart(
      document.getElementById('graph'));

    timeChart.draw(data, options);
}

// create tick marks array that gives perspective on target or 
// block duration, depending on the value of blocking boolean
function makeTicks(max, maxString, blocking) {
  var ticks = [];
  var interval = (max > 150) ? 30 : ((max > 60) ? 20 : 10);
  var maxVal = max;
  if (!blocking) {
    maxVal = (2 * max) + 1;
    interval *= 2;
  }
  console.log(interval);
  var count = 0;

  for (var i = 0; i < maxVal; i = i + interval) {
    if (i != max) {
      ticks[count] = i;
      count++; 
    }
  }
  ticks[count] = {v: max, f: maxString};
  console.log(ticks);
  return ticks;
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
    
    // log target setting in target cache
    var date = new Date();
    var qCache = localStorage["targetLog"];
    qCache += "\n" + targetNum + ". " + target + " hrs. day_time: " + date;
    console.log(qCache);
    localStorage["targetLog"] = qCache;
    
    console.log('target set at ' + date);
    localStorage["target"] = JSON.stringify(target);

		console.log("hiding");
    $("#target").hide();
    var $set = $("<b>Target set for " + target + " hour(s)</b>");
    $("#reminder").append($set);
	}
}
