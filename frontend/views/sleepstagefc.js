 FusionCharts.ready(function (stream) {
     var chart = {
        "theme": "fusion",
        "caption": "Sleep Stages",
        "subCaption": "Hypnogram",
        "showrealtimevalue": "1",
          "labelStep": "1",
        "yaxismaxvalue": "5",
        "numdisplaysets": "10",
        "xAxisName": "Time",
        "yAxisName": "Sleep Stage",
        "labeldisplay": "rotate",
        "slantLabels": "1",
        "showLegend": "0",
        "showValues": "0",
        "showlabels": "1",
        "showRealTimeValue": "1",
      };
  var transactionChart = new FusionCharts({
    id: "mychart1",
    type: 'realtimecolumn',
    renderAt: 'sleep-stage',
    width: '100%',
    height: '300',
    dataFormat: 'json',
    dataSource: {
      "chart": chart,
      "categories": [{
        // "category": [{
        //   "label": "Start"
        // }]
      }],
      "dataset": [{
        "seriesname": "",
        "alpha": "100",
        "data": [{
          "value": "3"
        }]
      }]
    },
    "events": {
      "initialized": function(evt, arg) {
        //Format minutes, seconds by adding 0 prefix accordingly
        function formatTime(time) {
          (time < 10) ? (time = "0" + time) : (time = time);
          return time;
        }
        //Update Data method
          const socket = io();
          socket.on('SleepStage', function (fulldata) {
              stage = fulldata.stage
	    function updateData() {
	        var chartRef = FusionCharts("mychart1");
            //We need to create a querystring format incremental update, containing
            //label in hh:mm:ss format
            //and a value (random).
            currDate = new Date(),
            label = formatTime(currDate.getHours()) + ":" + formatTime(currDate.getMinutes()) + ":" + formatTime(currDate.getSeconds()),
            //Get random number between 1 & 5 - rounded
            data = stage;
            strData = "&label=" + label + "&value=" + data;
          //Feed it to chart.
          chartRef.feedData(strData);
	    }
	    //calling the update method-->
	    updateData();
	 });
      }
    }
  });
  transactionChart.render();
});