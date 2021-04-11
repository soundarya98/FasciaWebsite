function redraw_sleepprob(data, channel, clientWidth, clientHeight) {
// set the dimensions and margins of the graph
//   var margin = {top: 20, right: 20, bottom: 30, left: 40},
//     width = clientWidth - margin.left - margin.right,
//     height = clientHeight - margin.bottom;

    var margin = {top: 10, right: 0, bottom: 20, left: 50};
    // width = parseInt(d3.select("#" + "svg-sleepprob").style("width")) - margin.left - margin.right;
    var width = 400;
    var height = 200;
 
// set the ranges
  var x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);
  var y = d3.scaleLinear()
      .range([height, 0]);

  // var colorScale = d3.scale.category10();
  var colorScale =  d3.scaleOrdinal(["#403F4C", "#E84855", "#F9DC5C", "#3185FC", "#EFBCD5"])

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
  d3.select("#" + "svg-sleepprob").remove();
  var chartDiv = document.getElementById("SleepProb");

  var svg = d3.select(chartDiv).append("svg")
      .attr("id", "svg-sleepprob")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    // console.log(data);

  // Scale the range of the data in the domains
  x.domain(data.map(function (d) {
    return d.sleepstage;
  }));
  y.domain([0, 1]);
  //   y.domain([0, d3.max(data, function (d) {
  //   return d.value;
  // })]);
    colorScale.domain(data.map(function (d){ return d.sleepstage; }));

  // var colours = d3.scaleOrdinal(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"]);
  // console.log(colours);

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("fill", function (d){ return colorScale(d.sleepstage); })
      // .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.sleepstage);
      })
      .attr("width", x.bandwidth())
      .attr("y", function (d) {
        return y(d.value);
      })
      .attr("height", function (d) {
        return height - y(d.value);
      });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

}