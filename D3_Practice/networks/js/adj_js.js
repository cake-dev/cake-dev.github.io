c_scale = ['#41bbc5', '#2d747a', '#96e79a', '#096013', '#b1e632', '#2d5da8', '#8b9bdc', '#941f73', '#f75ef0', '#7e5fe7', '#f6adff', '#6524ff', '#39f27a', '#829951']

var color = d3.scaleOrdinal(c_scale);
color(1);
color(2);
color(3);
color(4);
color(5);
color(6);
color(7);
color(8);
color(9);
color(10);
color(11);
color(12);
color(13);
color(14);

// blend two hex colors together by an amount
function blendColors(colorA, colorB, amount) {
    const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
    return '#' + r + g + b;
}

var margin = { top: 80, right: 0, bottom: 10, left: 80 },
    width = 800,
    height = 800;

var x = d3.scaleBand().domain(d3.range(14)).range([0, width]),
    z = d3.scaleLinear().domain([0, 4]).clamp(true),
    c = color

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("margin-left", -margin.left + "px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



d3.json("data/stack_overflow/stack_network.json", function (miserables) {

    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var matrix = [],
        nodes = miserables.nodes,
        n = nodes.length;

    // Compute index per node.
    nodes.forEach(function (node, i) {
        node.index = i;
        node.count = 0;
        matrix[i] = d3.range(n).map(function (j) { return { x: j, y: i, z: 0 }; });
    });

    for (var i = 0, leni = miserables.links.length; i < leni; i++) {
        for (var j = 0, lenj = nodes.length; j < lenj; j++) {
            if (miserables.links[i].source == nodes[j].id) {
                miserables.links[i].source = j;
            }
            if (miserables.links[i].target == nodes[j].id) {
                miserables.links[i].target = j;
            }
        }
    }

    // Convert links to matrix; count character occurrences.
    miserables.links.forEach(function (link) {
        matrix[link.source][link.target].z += link.value;
        matrix[link.target][link.source].z += link.value;
        matrix[link.source][link.source].z += link.value;
        matrix[link.target][link.target].z += link.value;
        nodes[link.source].count += link.value;
        nodes[link.target].count += link.value;
    });

    console.log(matrix);

    // Precompute the orders.
    var orders = {
        id: d3.range(n).sort(function (a, b) { return d3.ascending(nodes[a].id, nodes[b].id); }),
        count: d3.range(n).sort(function (a, b) { return nodes[b].count - nodes[a].count; }),
        group: d3.range(n).sort(function (a, b) { return nodes[b].group - nodes[a].group; })
    };

    // The default sort order.
    x.domain(orders.id);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height);

    var row = svg.selectAll(".row")
        .data(matrix)
        .enter().append("g")
        .attr("class", "row")
        .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
        .each(row);

    row.append("line")
        .attr("x2", width);

    row.append("text")
        .attr("x", -6)
        .attr("y", x.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr('font-size', '8px')
        .attr("text-anchor", "end")
        .text(function (d, i) { return nodes[i].id; });

    var column = svg.selectAll(".column")
        .data(matrix)
        .enter().append("g")
        .attr("class", "column")
        .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
        .attr("x1", -width);

    column.append("text")
        .attr("x", 6)
        .attr("y", x.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr('font-size', '8px')
        .attr("text-anchor", "start")
        .text(function (d, i) { return nodes[i].id; });

    function row(row) {
        var cell = d3.select(this).selectAll(".cell")
            .data(row.filter(function (d) { return d.z; }))
            .enter().append("rect")
            .attr("class", "cell")
            .attr("x", function (d) { return x(d.x); })
            .attr("width", x.bandwidth())
            .attr("height", x.bandwidth())
            .style("fill-opacity", function (d) { return z(d.z); })
            .style("fill", function (d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : blendColors(c(nodes[d.x].group), c(nodes[d.y].group), 0.5); })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on('mouseover.tooltip', function (d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", .8);
                tooltip.html("<p>Link: " + nodes[d.x].id + " -- " + nodes[d.y].id + "<hr>Groups:" + nodes[d.x].group + ", " + nodes[d.y].group + "<hr>Strength:" + ((nodes[d.x].count + nodes[d.y].count) / 2).toFixed(2) + "</p>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on("mouseout.tooltip", function () {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .on("mousemove", function () {
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            });
    }

    function mouseover(p) {
        d3.selectAll(".row text").classed("active", function (d, i) { return i == p.y; });
        d3.selectAll(".column text").classed("active", function (d, i) { return i == p.x; });
    }

    function mouseout() {
        d3.selectAll("text").classed("active", false);
    }

    d3.select("#order").on("change", function () {
        clearTimeout(timeout);
        order(this.value);
    });

    function order(value) {
        x.domain(orders[value]);

        var t = svg.transition().duration(2500);

        t.selectAll(".row")
            .delay(function (d, i) { return x(i) * 4; })
            .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
            .selectAll(".cell")
            .delay(function (d) { return x(d.x) * 4; })
            .attr("x", function (d) { return x(d.x); });

        t.selectAll(".column")
            .delay(function (d, i) { return x(i) * 4; })
            .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }

    var timeout = setTimeout(function () {
        order("group");
        d3.select("#order").property("selectedIndex", 2).node().focus();
    }, 1000);
});

