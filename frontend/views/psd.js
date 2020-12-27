function redraw_psd(data, channel) {
    d3.select("#svg-" + channel).remove();
    var margin = {top: 80, right: 80, bottom: 80, left: 80};

    width = parseInt(d3.select("#" + channel).style("width")) - margin.left - margin.right;
    height = 250;

    // Scales and axes. Note the inverted domain for the y-scale
    x = d3.scale.linear().range([0, width]);
    y = d3.scale.linear().range([height, 0]);

    xAxis = d3.axisBottom().scale(x).ticks(4);
    yAxis = d3.axisLeft().scale(y).ticks(4);

    // An area generator, for the light fill.
    area = d3.area()
        .x(function (d) {
            return x(d.Frequencies);
        })
        .y0(height)
        .y1(function (d) {
            return y(d.PSD);
        });

    // A line generator, for the dark stroke.
    line = d3.line()
        .x(function (d) {
            return x(d.Frequencies);
        })
        .y(function (d) {
            return y(d.PSD);
        });

    // X scale will use the index of our data
    var xScale = d3.scaleLinear()
        .domain([data[0].Frequencies, data[data.length - 1].Frequencies])
        .range([0, width]); // output

    // Y scale will use the randomly generate number
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.PSD;
        })])
        .range([height, 0]); // output

    // d3's line generator
    var line = d3.line()
        .x(function (d) {
            return xScale(d.Frequencies);
        }) // set the x values for the line generator
        .y(function (d) {
            return yScale(d.PSD);
        }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    // Add the SVG to the page and employ #2
    var svg = d3.select("#" + channel).append("svg")
        .attr("id", "svg-" + channel)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 35)
        .text("Frequency (Hz)");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text("Power Spectral Density (V^2 / Hz)");

    // Append the path, bind the data, and call the line generator
    svg.append("path")
        .datum(data) // 10. Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("d", line); // 11. Calls the line generator
}

function redraw_fft(data, channel) {
d3.select("#svg-" + channel).remove();
var outerWidth  = 960, outerHeight = 500;    // includes margins

    var margin = {top: 80, right: 80, bottom: 80, left: 80};

    var width = parseInt(d3.select("#" + channel).style("width")) - margin.left - margin.right;
    var height = 250;

document.body.style.margin="0px"; // Eliminate default margin from <body> element

function xValue(d) { return d.x; }      // accessors
function yValue(d) { return d.y; }

var x = d3.scaleLinear()                // interpolator for X axis -- inner plot region
    .domain(d3.extent(data,xValue))
    .range([0,width]);

var y = d3.scaleLinear()                // interpolator for Y axis -- inner plot region
    .domain(d3.extent(data,yValue))
    .range([height,0]);                  // remember, (0,0) is upper left -- this reverses "y"

var line = d3.line()                     // SVG line generator
    .x(function(d) { return x(d.x); } )
    .y(function(d) { return y(d.y); } );

var xAxis = d3.axisBottom(x)
    .ticks(5)                            // request 5 ticks on the x axis

var yAxis = d3.axisLeft(y)                // y Axis
    .ticks(4)

var svg = d3.select("#" + channel).append("svg")
    .attr("id", "svg-" + channel)
    .attr("width",  outerWidth)
    .attr("height", outerHeight);        // Note: ok to leave this without units, implied "px"

var g = svg.append("g")                  // <g> element is the inner plot area (i.e., inside the margins)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

g.append("g")                            // render the Y axis in the inner plot area
    .attr("class", "y axis")
    .call(yAxis);

g.append("g")                            // render the X axis in the inner plot area
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")  // axis runs along lower part of graph
    .call(xAxis);

// g.append("text")                         // inner x-axis label
//     .attr("class", "x label")
//     .attr("text-anchor", "end")
//     .attr("x", width - 6)
//     .attr("y", height - 6)
//     .text("inner x-axis label");

g.append("text")                         // outer x-axis label
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width/2 + 40)
    .attr("y", height + 2*margin.bottom/3 + 6)
    .text("Frequency (Hz)");

g.append("text")                         // plot title
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", -margin.top/2)
    .attr("dy", "+.75em")
    .text("Fast Fourier Transform");

// g.append("text")                         // inner y-axis label
//     .attr("class", "y label")
//     .attr("text-anchor", "end")
//     .attr("x", -6)
//     .attr("y", 6)
//     .attr("dy", ".75em")
//     .attr("transform", "rotate(-90)")
//     .text("inner y-axis label");

g.append("text")                         // outer y-axis label
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", -height/2)
    .attr("y", -6 - margin.left/3)
    .attr("dy", "-.75em")
    .attr("transform", "rotate(-90)")
    .text("Magnitude of FFT");

g.append("path")                         // plot the data as a line
    .datum(data)
    .attr("class", "line")
    .attr("d", line)
    .style('fill', 'none')
    .style('stroke', '#fff')
  .transition()
    .delay(0)
    .duration(0)
    .style('stroke', '#000')
}