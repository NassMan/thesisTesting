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
      if (blocking || key === "count" || key === "control") $("#block").hide();
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
    // $("#graph").hide();     maybe superfluous
  }

  $("#options").click(showOptions);
});

// Show options in a new tab
function showOptions() {
  chrome.tabs.create({
    url: 'options.html'
  });
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
    
    // package and save time target was set
    var date = new Date();
    var day = date.getDay();
    var hr = date.getHours();
    var dateString = day + "_" + hr;
    
    // log target size in target cache
    var qCache = localStorage["targetLog"];
    qCache += "\n" + targetNum + ". " + target + " hrs. day_time: " + dateString;
    console.log(qCache);
    localStorage["targetLog"] = qCache;
    
    console.log('total number of targets set is ' + targetNum);
        


    localStorage["targetSetTime"] = dateString;
    console.log('target set at day_hour ' + dateString);
    localStorage["target"] = JSON.stringify(target);

		console.log("hiding");
    $("#target").hide();
    var $set = $("<b>Target set for " + target + " hour(s)</b>");
    $("#reminder").append($set);
	}
}



