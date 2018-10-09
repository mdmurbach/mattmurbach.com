(function sensitivityInteractive() {
    console.log("Creating interactive chart...");

    var outerwidth = .9*window.innerWidth
    var outerHeight = window.innerHeight*.75

    var margin = {top: 10, right: 20, bottom: 100, left: 20},
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    var frequencies = ['0.001', '0.002154435', '0.004641589', '0.01', '0.02154435', '0.04641589', '0.1', '0.2154435', '0.4641589', '1.0', '2.154435', '4.641589', '10.0', '21.54435', '46.41589', '100.0', '215.4435', '464.1589', '1000.0', '2154.435', '4641.589', '10000.0', '21544.35', '46415.89', '100000.0'];

    var full_data = [];
    var x, xAxis, y, yAxis;
    read_inputs("Z11_ph", 0);

    function drawSlider() {
        var slider_x = d3.scale.linear()
            .domain([0, 180])
            .range([0, .9*width])
            // .clamp(true);

        var brush = d3.svg.brush()
            .x(slider_x)
            .extent([0, 0])
            .on("brush", brushed);

        d3.select("svg").append("g")
            .attr("class", "slider_axis")
            .attr("transform","translate(0,0)")// + height + margin.bottom/2 +  ")")
            .call(d3.svg.axis()
              .scale(slider_x)
              .orient("bottom")
              .tickFormat(function(d) { return d + "°"; })
              .tickSize(0)
              .tickPadding(12))
            .select(".domain")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "halo");

        var slider = svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(0,0)")// + margin.left + "," + height + margin.bottom/2 +  ")")
            .call(brush);

        var handle = slider.append("circle")
            .attr("class", "handle")
            .attr("transform", "translate(0,0)")// + height + ")")
            .attr("r", 9);

        slider.call(brush.event)
              .transition() // gratuitous intro!
                .duration(750)
                .call(brush.extent([0, 0]))
                .call(brush.event);

        slider.selectAll(".extent,.resize")
            .remove();

        function brushed() {
              var value = brush.extent()[0];
              if (d3.event.sourceEvent) { // not a programmatic event
                value = slider_x.invert(d3.mouse(this)[0]+277.66668701171875);
                console.log(d3.mouse(this)[0]+277.66668701171875);
                console.log(value);
                // console.log(slider_x(value))
                brush.extent([slider_x(value), slider_x(value)]);
              }
              handle.attr("cx", slider_x(value));
            //   d3.select("body").style("background-color", d3.hsl(value, .8, .8));
        }

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
        svg = d3.select("#chart svg");

        y = d3.scale.linear().range([height, 0]);
        x = d3.scale.ordinal().rangeRoundBands([0, width], .1);

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        y.domain(find_domain(full_data, S));
        x.domain(data.map(function(d) { return d.Parameter; }));

        yAxis = d3.svg.axis()
            .scale(y)
            .ticks(4)
            .orient("left");

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

    function drawChart(full_data, f, S) {

        svg = d3.select("#chart").append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // svg.call(tip);

        data = full_data[f]

        draw_axes(data, S);
        drawSlider();

        svg.selectAll(".errors")
              .data(data)
            .enter().append("rect")
              .attr("class", "error")
              .attr("x", function(d) { return margin.left + x(d.Parameter) + x.rangeBand()/2; })
              .attr("width", x.rangeBand()/10)
              .attr("y", function(d) { return y(d[S] + d[S + "_conf"])})
              .attr("opacity", 0.5)
              .attr("height", function(d) { return height - y(2*d[S + "_conf"]);})

        svg.selectAll(".bar")
              .data(data)
            .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) { return margin.left + x(d.Parameter); })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { return y(d[S]); })
              .attr("height", function(d) { return height - y(d[S]); })
              .attr("opacity", 0.5)
            //   .on('mouseover', tip.show)
            //   .on('mouseout', tip.hide)


        // add legend

        // var legend = svg.append("g")
        //   .attr("class", "legend")
        //   .attr("x", width - 65)
        //   .attr("y", 25)
        //   .attr("height", 100)
        //   .attr("width", 100);
        //
        // legend.selectAll('g').data([0,1])
        //   .enter()
        //   .append('g')
        //   .each(function(d, i) {
        //     var g = d3.select(this);
        //     g.append("rect")
        //       .attr("x", 45)
        //       .attr("y", i*45)
        //       .attr("width", 30)
        //       .attr("height", 30)
        //       .style("fill", S1_color_hash[String(i)][1])
        //       .attr("opacity", 0.5);
        //
        //     g.append("text")
        //       .attr("x", 45 + 35)
        //       .attr("y", i * 45 + 20)
        //       .attr("height",30)
        //       .attr("width",100)
        //       .style("fill", S1_color_hash[String(i)][1])
        //       .text(S1_color_hash[String(i)][0]);
        //  });
    };

    function read_inputs(variable,f) {
        if(f <= 24) {
            freq = frequencies[f];
            var dsv = d3.dsv(" ", "text/plain");
            dsv("./data/4264-runs-2sigma/" + variable + "/analysis_" + freq + "Hz.txt", function(csv) {
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
                read_inputs(variable, f)
            });
        } else {
            drawChart(full_data, 5, 'ST');
        }
    }
})()
