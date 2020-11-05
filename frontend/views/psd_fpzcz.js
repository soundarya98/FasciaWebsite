var margin = {top: 80, right: 80, bottom: 80, left: 80};
socket.on('SleepStage', function (fulldata) {

    d3.select("#svg_orig").remove();
    var setup = function() {
        // 2. Use the margin convention practice
        width = parseInt(d3.select("#chart").style("width"))- margin.left - margin.right;// Use the window's width
        height =  250; // Use the window's height

        // The number of datapoints

        var values = fulldata.psd;

        // var values=  [{"Frequencies": 0.0, "PSD": 4.619072882032186}, {"Frequencies": 0.03333333333333333, "PSD": 9.188535336237155}, {"Frequencies": 0.06666666666666667, "PSD": 10.20130559865677}, {"Frequencies": 0.1, "PSD": 12.443099520736432}, {"Frequencies": 0.13333333333333333, "PSD": 16.737059658856037}, {"Frequencies": 0.16666666666666666, "PSD": 22.687172443070143}, {"Frequencies": 0.2, "PSD": 22.948040787781693}, {"Frequencies": 0.23333333333333334, "PSD": 27.99160487600715}];

        // 5. X scale will use the index of our data
        var xScale = d3.scaleLinear()
            .domain([values[0].Frequencies, values[values.length - 1].Frequencies])
            .range([0, width]); // output

        // 6. Y scale will use the randomly generate number
        var yScale = d3.scaleLinear()
        .domain([0, d3.max(values, function(d) { return d.PSD; })])
            .range([height, 0]); // output

        // 7. d3's line generator
        var line = d3.line()
            .x(function(d) { return xScale(d.Frequencies); }) // set the x values for the line generator
            .y(function(d) { return yScale(d.PSD); }) // set the y values for the line generator
            .curve(d3.curveMonotoneX) // apply smoothing to the line

        // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number


        // 1. Add the SVG to the page and employ #2
        var svg = d3.select("#chart").append("svg")
            .attr("id","svg_orig")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

        // 4. Call the y axis in a group tag
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
        // .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Power Spectral Density (V^2 / Hz)");

        // 9. Append the path, bind the data, and call the line generator
        svg.append("path")
            .datum(values) // 10. Binds data to the line
            .attr("class", "line") // Assign a class for styling
            .attr("d", line); // 11. Calls the line generator
    }
setup();
});