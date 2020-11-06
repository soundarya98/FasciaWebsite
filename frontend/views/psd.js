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