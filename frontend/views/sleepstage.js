function sleepstage() {
  function realTimeLineChart() {
    var margin = { top: 20, right: 20, bottom: 20, left: 50 },
      width = 1200,
      height = 200,
      duration = 500,
      color = d3.schemeCategory10;

    function chart(selection) {
      // Based on https://bl.ocks.org/mbostock/3884955
      selection.each(function (data) {
        data = ["wake", "n1", "n2", "n3", "rem"].map(function (c) {
          return {
            label: c,
            values: data.map(function (d) {
              return { time: +d.time, value: d[c] };
            }),
          };
        });
        var t = d3.transition().duration(duration).ease(d3.easeLinear),
          x = d3
            .scaleTime()
            .rangeRound([0, width - margin.left - margin.right]),
          y = d3
            .scaleLinear()
            .rangeRound([height - margin.top - margin.bottom, 0]),
          z = d3.scaleOrdinal([
            "#403F4C",
            "#E84855",
            "#F9DC5C",
            "#3185FC",
            "#EFBCD5",
          ]);

        var xMin = d3.min(data, function (c) {
          return d3.min(c.values, function (d) {
            return d.time;
          });
        });
        var xMax = new Date(
          new Date(
            d3.max(data, function (c) {
              return d3.max(c.values, function (d) {
                return d.time;
              });
            })
          ).getTime() -
            duration * 2
        );

        x.domain([xMin, xMax]);
        y.domain([0, 5]);
        z.domain(
          data.map(function (c) {
            return c.label;
          })
        );

        // data.map(function(c) {if})

        var line = d3
          .line()
          // .curve(d3.curveBasis)
          .defined((d) => !isNaN(d.value))
          .x(function (d) {
            return x(d.time);
          })
          .y(function (d) {
            return y(d.value);
          });

        // define the area
        var area = d3
          .area()
          .x(function (d) {
            return x(d.time);
          })
          .y0(y(0))
          .y1(function (d) {
            return y(d.value);
          });

        var svg = d3.select(this).selectAll("svg").data([data]);
        var gEnter = svg.enter().append("svg").append("g");
        gEnter.append("g").attr("class", "axis x");
        gEnter.append("g").attr("class", "axis y");
        gEnter
          .append("defs")
          .append("clipPath")
          .attr("id", "clip")
          .append("rect")
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.bottom);

        gEnter
          .append("g")
          .attr("class", "lines")
          .attr("clip-path", "url(#clip)")
          .selectAll(".data")
          .data(data)
          .enter()
          .append("path")
          .attr("class", "data");

        var legendEnter = gEnter
          .append("g")
          .attr("class", "legend")
          .attr(
            "transform",
            "translate(" +
              (width - margin.right - margin.left - 75 - 100) +
              ",10)"
          );
        // legendEnter.append("rect")
        //   .attr("width", 50)
        //   .attr("height", 75)
        //   .attr("fill", "#ffffff")
        //   .attr("fill-opacity", 0);
        legendEnter
          .selectAll("text")
          .data(data)
          .enter()
          .append("text")
          .attr("y", 5)
          .attr("x", 5)
          .attr("fill", "#000");

        var svg = selection.select("svg");
        svg.attr("width", width).attr("height", height);
        var g = svg
          .select("g")
          .attr(
            "transform",
            "translate(" + margin.left + "," + margin.top + ")"
          );

        g.select("g.axis.x")
          .attr(
            "transform",
            "translate(0," + (height - margin.bottom - margin.top) + ")"
          )
          .transition(t)
          .call(d3.axisBottom(x).ticks(5));
        g.select("g.axis.y")
          .transition(t)
          .attr("class", "axis y")
          .call(
            d3
              .axisLeft(y)
              .ticks(6)
              .tickValues([0, 1, 2, 3, 4, 5])
              .tickFormat(function (d) {
                if (d == 1) return "Wake";
                if (d == 2) return "N1";
                if (d == 3) return "N2";
                if (d == 4) return "N3";
                if (d == 5) return "REM";
                else return "";
              })
          );

        g.select("defs clipPath rect")
          .transition(t)
          .attr("width", width - margin.left - margin.right)
          .attr("height", height - margin.top - margin.right);

        // .style("stroke", function (d, i) {console.log(i); if(d.values[i].value == 1) {return "#fcf"} else {return "#ccc"}})
        g.selectAll("g path.data")
          .data(data)
          .style("stroke", function (d) {
            return z(d.label);
          })
          .style("stroke-width", 2)
          .style("fill", "#fff")
          .transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .on("start", tick);

        g.selectAll("g .legend text")
          .data(data)
          .text(function (d) {
            var sleep = "";
            var stage = "Uninitialized";

            if (d.label == "wake") {
              if (d.values[d.values.length - 1].value == 1) {
                stage = "Wake";
                sleep = "Sleep Stage: ";
              } else {
                stage = "";
              }
            }

            if (d.label == "n1") {
              if (d.values[d.values.length - 1].value == 2) {
                stage = "N1";
                sleep = "Sleep Stage: ";
              } else {
                stage = "";
              }
            }

            if (d.label == "n2") {
              if (d.values[d.values.length - 1].value == 3) {
                stage = "N2";
                sleep = "Sleep Stage: ";
              } else {
                stage = "";
              }
            }
            if (d.label == "n3") {
              if (d.values[d.values.length - 1].value == 4) {
                stage = "N3";
                sleep = "Sleep Stage: ";
              } else {
                stage = "";
              }
            }
            if (d.label == "rem") {
              if (d.values[d.values.length - 1].value == 5) {
                stage = "REM";
                sleep = "Sleep Stage: ";
              } else {
                stage = "";
              }
            }
            return sleep + stage;
          });

        // For transitions https://bl.ocks.org/mbostock/1642874
        function tick() {
          d3.select(this)
            .attr("d", function (d) {
              return line(d.values);
            })
            .attr("transform", null);

          var xMinLess = new Date(new Date(xMin).getTime() - duration);
          d3.active(this)
            .attr("transform", "translate(" + x(xMinLess) + ",0)")
            .transition()
            .on("start", tick);
        }
      });
    }

    chart.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    chart.color = function (_) {
      if (!arguments.length) return color;
      color = _;
      return chart;
    };

    chart.duration = function (_) {
      if (!arguments.length) return duration;
      duration = _;
      return chart;
    };

    return chart;
  }
  var lineArr = [];
  var lineData;
  var MAX_LENGTH = 1000;
  var duration = 500;
  var chart = realTimeLineChart();

  function randomNumberBounds(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  function seedData() {
    var now = new Date();
    for (var i = 0; i < MAX_LENGTH; ++i) {
      lineArr.push({
        time: new Date(now.getTime() - (MAX_LENGTH - i) * duration),
        wake: NaN,
        n1: NaN,
        n2: NaN,
        n3: NaN,
        rem: NaN,
      });
    }
  }

  function updateData() {
    var now = new Date();

    lineData = {
      time: now,
      wake: lineArr[lineArr.length - 1].wake,
      n1: lineArr[lineArr.length - 1].n1,
      n2: lineArr[lineArr.length - 1].n2,
      n3: lineArr[lineArr.length - 1].n3,
      rem: lineArr[lineArr.length - 1].rem,
    };
    lineArr.push(lineData);

    if (lineArr.length > 1000) {
      lineArr.shift();
    }
    d3.select("#chart").datum(lineArr).call(chart);
  }
  var first = false;
  var justFirst = false;
  var previousstage = NaN;
  socket.on("SleepStage", function (fulldata) {
    function updateDataSleep() {
      var now = new Date();
      var hours = now.getHours();

      hours = ((hours + 11) % 12) + 1;

      if (now.getHours() < 10) {
        hours = "0" + hours;
      }

      var minutes;
      if (now.getMinutes() < 10) {
        minutes = "0" + now.getMinutes();
      } else {
        minutes = now.getMinutes();
      }
      var time = hours + ":" + minutes;
      var seconds;
      if (now.getSeconds() > 30) {
        seconds = "00";
      } else {
        seconds = "30";
      }
      time = time + ":" + seconds;
      document.getElementById("time").innerHTML = time;

      var numbers = [0, 1, 2, 3, 4, 5];
      var firststage = numbers.map(firstColor);

      function firstColor(num) {
        if (num == fulldata.stage.stage) {
          return 0;
        } else {
          return NaN;
        }
      }

      // console.log(firststage);

      if (first == false) {
        console.log("first");
        var lineData1 = {
          time: now,
          wake: firststage[1],
          n1: firststage[2],
          n2: firststage[3],
          n3: firststage[4],
          rem: firststage[5],
        };
        console.log(lineData1);
        lineArr.push(lineData1);
        first = true;
        justFirst = true;
        d3.select("#chart").datum(lineArr).call(chart);
        // if (lineArr.length > 1000) {
        //   lineArr.shift();
        // }
      }

      var numberssleep = [0, 1, 2, 3, 4, 5];
      var stage = numberssleep.map(stageColor);

      function stageColor(num) {
        if (num == fulldata.stage.stage) {
          return num;
        } else {
          return NaN;
        }
      }

      if (fulldata.stage.stage != previousstage && justFirst == false) {
        console.log("changed!");
        var newstage = numberssleep.map(newstageColor);

        function newstageColor(num) {
          if (num == Math.max(fulldata.stage.stage, previousstage)) {
            return Math.min(previousstage, fulldata.stage.stage);
          } else {
            return NaN;
          }
        }
        lineData = {
          time: now,
          wake: newstage[1],
          n1: newstage[2],
          n2: newstage[3],
          n3: newstage[4],
          rem: newstage[5],
        };
        lineArr.push(lineData);

        if (lineArr.length > 1000) {
          lineArr.shift();
        }
        d3.select("#chart").datum(lineArr).call(chart);
      }

      previousstage = fulldata.stage.stage;
      justFirst = false;
      lineData = {
        time: now,
        wake: stage[1],
        n1: stage[2],
        n2: stage[3],
        n3: stage[4],
        rem: stage[5],
      };
      lineArr.push(lineData);

      if (lineArr.length > 1000) {
        lineArr.shift();
      }
      d3.select("#chart").datum(lineArr).call(chart);
    }
    updateDataSleep();
  });

  function resize() {
    if (d3.select("#chart svg").empty()) {
      return;
    }
    chart.width(+d3.select("#chart").style("width").replace(/(px)/g, ""));
    d3.select("#chart").call(chart);
  }

  document.addEventListener("DOMContentLoaded", function () {
    seedData();
    window.setInterval(updateData, 500);
    d3.select("#chart").datum(lineArr).call(chart);
    // d3.select(window).on('resize', resize);
  });
}
