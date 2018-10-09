(function createInteractive() {
    var outerWidth = 600, outerHeight = 600;

    var margin = {top: 30, right: 20, bottom: 150, left: -20},
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    dropdowns = d3.select("#chart").append("span")

    Z_list = ['Z11_mag', 'Z22_mag', 'Z33_mag', 'Z11_ph', 'Z22_ph', 'Z33_ph'];
    Z_legend = ['1st harmonic magnitude', '2nd harmonic magnitude', '3rd harmonic magnitude',
                '1st harmonic phase', '2nd harmonic phase', '3rd harmonic phase'];

    Z_label = dropdowns.append("label")
        .text("Parameter")
        .attr("class", "labels");

    Z_dropDown = Z_label.append("select")
        .attr("class","dropdowns");

    var Z_options = Z_dropDown.selectAll("option")
        .data(Z_legend)
        .enter().append("option");

    Z_options.text(function(d) {return d})
        .attr("value", function(d) {return d})
        .attr("selected", function(d) {if(d == '1st harmonic phase') { return d}});

    S_list = ['S1', 'ST'];

    S_label = dropdowns.append("label")
        .text("Sensitivity")
        .attr("class", "labels");

    S_dropDown = S_label.append("select")
        .attr("class","dropdowns");

    var S_options = S_dropDown.selectAll("option")
        .data(S_list)
        .enter().append("option");

    S_options.text(function(d) {return d})
        .attr("value", function(d) {return d})
        .attr("selected", function(d) {if(d == "ST") { return d}});

    var frequencies = ['0.001', '0.002154435', '0.004641589', '0.01', '0.02154435', '0.04641589', '0.1', '0.2154435', '0.4641589', '1.0', '2.154435', '4.641589', '10.0', '21.54435', '46.41589', '100.0', '215.4435', '464.1589', '1000.0', '2154.435', '4641.589', '10000.0', '21544.35', '46415.89', '100000.0'];

    var S1_color_hash = {  0 : ["S1", "CornflowerBlue"],
                        1 : ["95% Confidence Interval", "FireBrick"]}

    var ST_color_hash = {  0 : ["ST", "CornflowerBlue"],
                        1 : ["95% Confidence Interval", "FireBrick"]}

    var freq_labels = ['10⁻³', , , '10⁻²', , , '10⁻¹', , , '1', , , '10', , , '100', , , '1000', , , '10000', , , '100000' ];

    var S = 'ST';

    var slider = d3.select(".interactive").append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

    var ordScale = d3.scaleOrdinal().domain(d3.range(0,25)).range([0, 1])

    slider.append("line")
        .attr("class", "track")
        .attr("x1", ordScale.range()[0])
        .attr("x2", ordScale.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() { console.log(d3.event.x); }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(ordScale.range().map(function(r) {
            return r + (ordScale.range() / 2);
        }))
      .enter().append("text")
        .attr("x", d3.scaleOrdinal().domain(d3.range(0,25)).range([0, 1]))
        .attr("text-anchor", "middle")
        .text(function(d) { return d + "°"; });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
    // slider = d3.slider().scale(d3.scale.ordinal().domain(d3.range(0,25)).rangePoints([0, 1], 0.5)).axis(d3.svg.axis().tickFormat(function(d) {return freq_labels[d];})).snap(true).value(5);
    //
    // d3.select('#chart').call(slider);
    //
    // d3.select('svg.interactive').append('text')
    //     .text('Frequency (Hz)')
    //     .style("display", "block")
    //     .style("text-align", "center");
    //
    //
    // slider.on("slide", function(evt, value) {
    //     updateChart(full_data, value, S);
    // });

    Z_dropDown.on("change", ZChanged);
    S_dropDown.on("change", SChanged);

    // var tip = d3.tip()
    //   .attr('class', 'd3-tip')
    //   .offset([-10, 0])
    //   .html(function(d) {
    //     return "<strong>S1:</strong> <span style='color:red'>" + d.S1 + "</span><br></br>" +
    //            "<strong>ST:</strong> <span style='color:red'>" + d.ST + "</span>";
    //   })

    var full_data = [];
    var x, xAxis, y, yAxis;
    read_inputs("Z11_ph", 0);

    function ZChanged() {
        Z_i = Z_legend.indexOf(d3.event.target.value);
        Z = Z_list[Z_i];
        load_Z(Z)
    }

    function SChanged() {
        S = d3.event.target.value;
        updateChart(full_data, slider.value(), S)
    }

    function load_Z(Z) {
        update_inputs(Z,0);
    }

    function find_domain(data, S) {

        maximum = d3.max(
        [d3.max(data.map(function(d) {
                return d3.max(d, function(d2) {
                    return d2[S];});// + d2[S + '_conf'];});
                })),
         d3.max(data.map(function(d) {
                return d3.max(d, function(d2) {
                    return d2[S];});// + d2[S + '_conf'];});
                }))]);

        if(maximum<=1) {
            return [0.0001, maximum];
        } else {
            return [0.0001, 1];
        }
    }

    function draw_axes(data, S) {

        svg = d3.select("svg.interactive");

        y = d3.scaleLinear().range([height, 0]);
        x = d3.scaleOrdinal().range([0, width]);

        xAxis = d3.axisBottom().scale(x);

        y.domain(find_domain(full_data, S));
        x.domain(data.map(function(d) { return d.Parameter; }));

        yAxis = d3.axisLeft()
            .scale(y)
            .ticks(4);

        svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(" + margin.left + "," + height + ")")
              .call(xAxis)
              .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)" );;

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);
    }

    function update_axes(data, S) {

        y = d3.scaleLinear().range([height, 0]);

        y.domain(find_domain(full_data, S));

        yAxis = d3.svg.axis()
            .scale(y)
            .ticks(4)
            .orient("left");

        d3.select("svg.interactive").selectAll("g.y.axis").call(yAxis);
    }

    function drawChart(full_data, f, S) {

        svg = d3.select(".interactive")
            .attr("width", outerWidth)
            .attr("height", outerHeight)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // svg.call(tip);

        data = full_data[f]

        draw_axes(data, S);

        svg.selectAll(".errors")
              .data(data)
            .enter().append("rect")
              .attr("class", "error")
              .attr("x", function(d) { return margin.left + x(d.Parameter) + x.range()/2; })
              .attr("width", x.range()/10)
              .attr("y", function(d) { return y(d[S] + d[S + "_conf"])})
              .attr("opacity", 0.5)
              .attr("height", function(d) { return height - y(2*d[S + "_conf"]);})

        svg.selectAll(".bar")
              .data(data)
            .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) { return margin.left + x(d.Parameter); })
              .attr("width", x.range())
              .attr("y", function(d) { return y(d[S]); })
              .attr("height", function(d) { return height - y(d[S]); })
              .attr("opacity", 0.5)
            //   .on('mouseover', tip.show)
            //   .on('mouseout', tip.hide)


        // add legend

        var legend = svg.append("g")
          .attr("class", "legend")
          .attr("x", width - 65)
          .attr("y", 25)
          .attr("height", 100)
          .attr("width", 100);

        legend.selectAll('g').data([0,1])
          .enter()
          .append('g')
          .each(function(d, i) {
            var g = d3.select(this);
            g.append("rect")
              .attr("x", 45)
              .attr("y", i*45)
              .attr("width", 30)
              .attr("height", 30)
              .style("fill", S1_color_hash[String(i)][1])
              .attr("opacity", 0.5);

            g.append("text")
              .attr("x", 45 + 35)
              .attr("y", i * 45 + 20)
              .attr("height",30)
              .attr("width",100)
              .style("fill", S1_color_hash[String(i)][1])
              .text(S1_color_hash[String(i)][0]);

         });
    };

    function updateChart(full_data, f, S) {
        data = full_data[f];

        update_axes(data, S);

        update_bar = d3.select("svg.interactive").selectAll(".bar").data(data);
        update_error = d3.select("svg.interactive").selectAll(".error").data(data);

        update_bar.enter().append("rect");
        update_error.enter().append("rect");

        update_bar.transition().delay(0).duration(100)
            .attr("y", function(d) { return y(d[S]); })
            .attr("height", function(d) { return height - y(d[S]); });

        update_error.transition()
            .attr("y", function(d) { return y(d[S] + d[S + "_conf"])})
            .attr("height", function(d) { return height - y(2*d[S + "_conf"]);})

        update_bar.exit().remove();
        update_error.exit().remove();

        if(S == 'S1') {
            color_hash = S1_color_hash;
        } else {
            color_hash = ST_color_hash;
        }

        // remove + add legend (probably should create separate
        // draw_legend() to call when dropdown updates)

        d3.selectAll('.legend').remove();

        var legend = svg.append("g")
          .attr("class", "legend")
          .attr("x", width - 65)
          .attr("y", 25)
          .attr("height", 100)
          .attr("width", 100);

        legend.selectAll('g').data([0,1])
          .enter()
          .append('g')
          .each(function(d, i) {
            var g = d3.select(this);
            g.append("rect")
              .attr("x", 45)
              .attr("y", i*45)
              .attr("width", 30)
              .attr("height", 30)
              .style("fill", color_hash[String(i)][1])
              .attr("opacity", 0.5);

            g.append("text")
              .attr("x", 45 + 35)
              .attr("y", i * 45 + 20)
              .attr("height",30)
              .attr("width",100)
              .style("fill", color_hash[String(i)][1])
              .text(color_hash[String(i)][0]);

         });
    };

    function read_inputs(variable,f) {
        if(f <= 24) {
            freq = frequencies[f];
            // var dsv = d3.dsvFormat(" ");
            var csv = d3.csv("./data/4264-runs-2sigma/Zp11/analysis_0.01Hz.txt", function(row) {
                return {
                    Parameter: d2.Parameter,
                    S1: +d2.S1,
                    S1_conf: +d2.S1_conf,
                    ST: +d2.ST,
                    ST_conf: +d2.ST_conf
                }
                // data = d;
            }, function(error, data) {
                full_data[f] = data;
            });
            //     subset = d.filter(function(d2,i) {
            //         if(i<40) {
            //             d2.Parameter = d2.Parameter;
            //             d2.S1 = +d2.S1;
            //             d2.S1_conf = +d2.S1_conf;
            //             d2.ST = +d2.ST;
            //             d2.ST_conf = +d2.ST_conf;
            //             }
            //         });
            //     return subset;
            // });
            // full_data[f] = data;
            f = f + 1;
            read_inputs(variable, f)
        } else {
            drawChart(full_data, 5, 'ST');
            console.log(full_data);
        }
    }


    function update_inputs(variable, f) {
        if(f <= 24) {
            freq = frequencies[f];
            var dsv = d3.dsvFormat(" ");
            dsv("./data/full-spectra/" + folder + "/" + variable + "/analysis_" + freq + "Hz.txt", function(csv) {
                csv = csv.filter(function(row, i) {
                    if(i<40) {
                        row.S1 = +row.S1;
                        row.S1_conf = +row.S1_conf;
                        row.ST = +row.ST;
                        row.ST_conf = +row.ST_conf;
                        return row;
                    }
                })
                full_data[f] = csv;
                f = f + 1;
                update_inputs(variable, f)
            });
        } else {
            slider.value(5);
            //S_options.attr("selected", function(d) {if(d == "S1") { return d}});
            updateChart(full_data, 5, S_list[S_dropDown[0][0].selectedIndex]);
        }
    };
})()
