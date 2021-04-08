function redraw_eeg(data, channel, clientWidth, clientHeight) {
    d3.select("#" + "svg-" + channel).remove();
    var chartDiv = document.getElementById(channel);
    var svg = d3.select(chartDiv).append("svg").attr("id", "svg-" + channel);

    var margin = {top: 10, right: 0, bottom: 30, left: 20};

    var width = clientWidth - margin.left - margin.right;
    var height = clientHeight - margin.bottom;

    svg.attr("width", width)
        .attr("height", height);


    // SVG G to provide D3 Margin Convention
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Date Parser takes in Date string and returns JS Data Object
    var parseTime = d3.timeParse("%b-%d-%Y %H:%M:%S:%L");

    // Scale X - time scale
    // Scale Y - linear scale
    // Scale Z - color categorical scale
    var x = d3.scaleTime().range([margin.left, width - margin.right]),
        y = d3.scaleLinear().range([height - margin.bottom, margin.top]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    // D3 Line generator
    var line = d3.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.voltage);
        })
        .defined(function (d) {
            return d.voltage !== null;
        });

    data.forEach(function (d) {
        d.date = parseTime(d.date);
    });

    var keys_ = null;
    if(channel == 'EEG-FPZ-CZ'){
         keys_ =   ["EEG_FPZ_CZ", "EEG_FPZ_CZ_Spindle", "EEG_FPZ_CZ_Slow Waves"];
    }

    else{
        keys_ =   ["EEG_PZ_OZ", "EEG_PZ_OZ_Spindle", "EEG_PZ_OZ_Slow Waves"];
    }

    var rows = keys_.map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return {date: d.date, voltage: d[id]};
            })
        };
    });


    // Using the initial data figure out the min / max dates
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));


    y.domain([
        d3.min(rows, function (c) {
            return d3.min(c.values, function (d) {
                return d.voltage;
            });
        }),
        d3.max(rows, function (c) {
            return d3.max(c.values, function (d) {
                return d.voltage;
            });
        })
    ]);

    z.domain(rows.map(function (c) {
        return c.id;
    }));

    // Create X Axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + [height - margin.bottom] + ")")
        .call(d3.axisBottom(x));

    console.log("HERE")

    // Create Y Axis
    // Add Text label to Y axis
    g.append("g")
        // .attr("class", "axis axis--y")
        // .attr("transform", `translate(${margin.left},0)`)
        // .call(d3.axisLeft(y))
        .append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", "0.31em")
        .attr("fill", "#000")
        .text(channel);


    // Create a <g> element for each row
    var row = g.selectAll(".row")
        .data(rows)
        .enter().append("g")
        .attr("class", "row");

    var colours = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a <path> element inside of each row <g>
    row.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return z(d.id);
        })
        .style("color", colours(3));

    var color = d3.scale.ordinal()
      .domain(["EEG", "Spindle", "Slow Waves"])
      .range(d3.schemeCategory10);

    // row.selectAll("mydots")
    //   .data(["EEG", "Spindle", "Slow Waves"])
    //   .enter()
    //   .append("circle")
    //     .attr("cx", function(d,i){ return 0 + i*65})
    //     .attr("cy", -20)
    //     .attr("r", 7)
    //     // .style("fill", color2(3));
    //     .style("fill", function(d){ return color(d)});

    // row.selectAll("mylabels")
    //     .data(["EEG", "Spindle", "Slow Waves"])
    //     .enter()
    //     .append("text")
    //     .attr("x", function(d,i){ return 10 + i*65})
    //     .attr("y", -20)
    //     .style("fill", function(d){ return color(d)})
    //     .text(function(d){ return d})
    //     .attr("text-anchor", "left")
    //     .style("alignment-baseline", "middle")
};

function redraw_signal(data, channel, clientWidth, clientHeight) {
    d3.select("#" + "svg-" + channel).remove();
    var chartDiv = document.getElementById(channel);
    var svg = d3.select(chartDiv).append("svg").attr("id", "svg-" + channel);

    var margin = {top: 10, right: 0, bottom: 30, left: 20};
    // var width = chartDiv.clientWidth - margin.left - margin.right;
    // var height = chartDiv.clientHeight - margin.bottom;
    var width = clientWidth - margin.left - margin.right;
    var height = clientHeight - margin.bottom - margin.top;

    svg.attr("width", width)
        .attr("height", height);


    // SVG G to provide D3 Margin Convention
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Date Parser takes in Date string and returns JS Data Object
    var parseTime = d3.timeParse("%b-%d-%Y %H:%M:%S:%L");

    // Scale X - time scale
    // Scale Y - linear scale
    // Scale Z - color categorical scale
    var x = d3.scaleTime().range([margin.left, width - margin.right]),
        y = d3.scaleLinear().range([height - margin.bottom, margin.top]),
        z = d3.scaleOrdinal(d3.schemeCategory10);

    // D3 Line generator
    var line = d3.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.voltage);
        })
        .defined(function (d) {
            return d.voltage !== null;
        });

    data.forEach(function (d) {
        d.date = parseTime(d.date);
    });

    var keys_ = [channel];
    var rows = keys_.map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return {date: d.date, voltage: d[id]};
            })
        };
    });


    // Using the initial data figure out the min / max dates
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));


    y.domain([
        d3.min(rows, function (c) {
            return d3.min(c.values, function (d) {
                return d.voltage;
            });
        }),
        d3.max(rows, function (c) {
            return d3.max(c.values, function (d) {
                return d.voltage;
            });
        })
    ]);

    z.domain(rows.map(function (c) {
        return c.id;
    }));

    // Create X Axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + [height - margin.bottom] + ")")
        .call(d3.axisBottom(x));

    // Create Y Axis
    // Add Text label to Y axis
    g.append("g")
        // .attr("class", "axis axis--y")
        // .attr("transform", `translate(${margin.left},0)`)
        // .call(d3.axisLeft(y))
        .append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("dy", "0.31em")
        .attr("fill", "#000")
        .text(channel);

    // Create a <g> element for each row
    var row = g.selectAll(".row")
        .data(rows)
        .enter().append("g")
        .attr("class", "row");

    // Create a <path> element inside of each row <g>
    row.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return z(d.id);
        });

    var color = d3.scale.ordinal()
      .domain(["EOG"])
      .range(d3.schemeCategory10);

    row.selectAll("mydots")
      .data(["EOG"])
      .enter()
      .append("circle")
        .attr("cx", function(d,i){ return 0 + i*65})
        .attr("cy", -20)
        .attr("r", 7)
        .style("fill", function(d){ return color(d)});

    row.selectAll("mylabels")
        .data(["EOG"])
        .enter()
        .append("text")
        .attr("x", function(d,i){ return 10 + i*65})
        .attr("y", -20)
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
};

function redraw_grad(data, channel, clientWidth, clientHeight) {
    d3.select("#" + "svg-" + channel + "-grad").remove();
    var chartDiv = document.getElementById(channel + "-Grad");
    var svg = d3.select(chartDiv).append("svg").attr("id", "svg-" + channel + "-grad");

    var margin = {top: 10, right: 0, bottom: 30, left: 20};
    // var width = chartDiv.clientWidth - margin.left - margin.right;
    // var height = chartDiv.clientHeight - margin.bottom;
    var width = clientWidth - margin.left - margin.right;
    var height = clientHeight - margin.bottom;

    svg.attr("width", width)
        .attr("height", height);


    // SVG G to provide D3 Margin Convention
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Date Parser takes in Date string and returns JS Data Object
    var parseTime = d3.timeParse("%b-%d-%Y %H:%M:%S:%L");

    // Scale X - time scale
    // Scale Y - linear scale
    // Scale Z - color categorical scale
    var x = d3.scaleTime().range([margin.left, width - margin.right]),
        y = d3.scaleLinear().range([height - margin.bottom, margin.top]);
        // z = d3.scaleOrdinal(d3.schemeCategory10);

    var z = d3.scaleOrdinal(["#1f77b4", "#DE0098", "#2ca02c"]);

    // console.log(d3.schemeCategory10);
    // D3 Line generator
    var line = d3.line()
        .x(function (d) {
            return x(d.date);
        })
        .y(function (d) {
            return y(d.voltage);
        })
        .defined(function (d) {
            return d.voltage !== null;
        });

    data.forEach(function (d) {
        d.date = parseTime(d.date);
    });

    var keys_ =  [channel, channel + "-Grad"];


    var rows = keys_.map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return {date: d.date, voltage: d[id]};
            })
        };
    });


    // Using the initial data figure out the min / max dates
    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));


    y.domain([
        d3.min(rows, function (c) {
            return d3.min(c.values, function (d) {
                return d.voltage;
            });
        }),
        d3.max(rows, function (c) {
            return d3.max(c.values, function (d) {
                return d.voltage;
            });
        })
    ]);

    z.domain(rows.map(function (c) {
        return c.id;
    }));

    // console.log(z)

    // Create X Axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + [height - margin.bottom] + ")")
        .call(d3.axisBottom(x));

    // // Create Y Axis
    // // Add Text label to Y axis
    // g.append("g")
    //     .attr("class", "axis axis--y")
    //     .attr("transform", `translate(${margin.left},0)`)
    //     .call(d3.axisLeft(y))
    //     .append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 6)
    //     .attr("dy", "0.71em")
    //     .attr("fill", "#000000")
    //     .text("Voltage, mV");

    // Create a <g> element for each row
    var row = g.selectAll(".row")
        .data(rows)
        .enter().append("g")
        .attr("class", "row");

    // Create a <path> element inside of each row <g>
    row.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        // .style("color", z(3))
        .style("stroke", function (d) {
            return z(d.id);
            // return '#800000';
        })
        // .style("fill", z(3));

    var color = d3.scale.ordinal()
      .domain([channel, channel+"-Grad"])
      .range(d3.schemeCategory10);

    row.selectAll("mydots")
      .data([channel, channel+"-Grad"])
      .enter()
      .append("circle")
        .attr("cx", function(d,i){ return 0 + i*65})
        .attr("cy", -20)
        .attr("r", 7)
        .style("color", z(4))
        .style("fill", function(d){ return color(d)});

    row.selectAll("mylabels")
        .data([channel, channel+"-Grad"])
        .enter()
        .append("text")
        .attr("x", function(d,i){ return 10 + i*65})
        .attr("y", -20)
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
};