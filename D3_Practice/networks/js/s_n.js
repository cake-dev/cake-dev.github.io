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

function create_svg_border(svg, h, w) {
    svg.attr('border', 1);
    svg.append("rect")
        .classed("svg_border", true)
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", h)
        .attr("width", w)
        .style("stroke", "black")
        .style("fill", "#f0ead6")
        .style("stroke-width", 1)
        .attr("opacity", "0.5");
}

function createNetworkGraph() {
    var tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    d3.json("data/stack_overflow/stack_network.json", function (error, graph) {
        if (error) throw error;
        const svg = d3.select('svg'),
            width = +svg.attr('width'),
            height = +svg.attr('height');

        create_svg_border(svg, height, width);

        const simulation = d3.forceSimulation()
            .nodes(graph.nodes)
            .force('link', d3.forceLink().id(d => d.id))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(5))
            .on('tick', ticked);

        simulation.force('link')
            .links(graph.links);


        //add encompassing group for the zoom 
        var vis = svg.append("g")
            .attr("class", "everything");


        let link = vis.selectAll('line')
            .data(graph.links)
            .enter().append('line');

        link
            .attr('class', 'link')
            .on('mouseover.tooltip', function (d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", .8);
                tooltip.html("Source:" + d.source.id +
                    "<p/>Target:" + d.target.id +
                    "<p/>Strength:" + d.value.toFixed(2))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on("mouseout.tooltip", function () {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .on('mouseout.fade', fade(1))
            .on("mousemove", function () {
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .attr("stroke-width", function (d) { return Math.sqrt(d.value) - 3; });
        ;

        var node = vis.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter().append("g")

        // Create a drag handler and append it to the node object instead
        var drag_handler = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

        drag_handler(node);

        node.append('circle')
            .attr('r', d => Math.sqrt(d.nodesize))
            .attr("fill", function (d) { return color(d.group); })
            .on('mouseover.tooltip', function (d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", .8);
                tooltip.html("Name:" + d.id + "<p/>group:" + d.group)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on('mouseover.fade', fade(0.1))
            .on("mouseout.tooltip", function () {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            })
            .on('mouseout.fade', fade(1))
            .on("mousemove", function () {
                tooltip.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 10) + "px");
            })
            .on('dblclick', releasenode)

        var lables = node.append("text")
            .text(function (d) {
                return d.id;
            })
            .attr('x', 6)
            .attr('y', 3);

        node.append('text')
            .attr('x', 0)
            .attr('dy', '.35em')
            .text(d => d.name);

        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        }

        //add zoom capabilities 
        var zoom_handler = d3.zoom()
            .on("zoom", zoom_actions);

        zoom_handler(svg);

        //Zoom functions 
        function zoom_actions() {
            vis.attr("transform", d3.event.transform)
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            //d.fx = null;
            //d.fy = null;
        }
        function releasenode(d) {
            d.fx = null;
            d.fy = null;
        }

        const linkedByIndex = {};
        graph.links.forEach(d => {
            linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
        });

        function isConnected(a, b) {
            return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
        }

        function fade(opacity) {
            return d => {
                node.style('stroke-opacity', function (o) {
                    const thisOpacity = isConnected(d, o) ? 1 : opacity;
                    this.setAttribute('fill-opacity', thisOpacity);
                    return thisOpacity;
                });

                link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));

            };
        }
        var sequentialScale = d3.scaleOrdinal(c_scale)
            .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);


        svg.append("g")
            .attr("class", "legendSequential")
            .attr("transform", "translate(" + (width - 140) + "," + (height - 300) + ")");

        var legendSequential = d3.legendColor()
            .shapeWidth(30)
            .cells(11)
            .orient("vertical")
            .title("Group number by color:")
            .titleWidth(100)
            .scale(sequentialScale)

        svg.select(".legendSequential")
            .call(legendSequential);


    })
}

function createAdjMatrix() {
    var margin = { top: 80, right: 0, bottom: 10, left: 80 },
        width = 800,
        height = 800;

    var x = d3.scaleBand().domain(d3.range(14)).range([0, width]),
        z = d3.scaleLinear().domain([10, 80]).clamp(true),
        c = color

    var svg2 = d3.select("#adj_matrix").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", -margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    d3.json("data/stack_overflow/stack_network.json", function (miserables) {

        var tooltip2 = d3.select("body")
            .append("div")
            .attr("class", "tooltip2")
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

        // translates the source/target strings to indices
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

        // Convert links to matrix; count connection occurrences.
        miserables.links.forEach(function (link) {
            matrix[link.source][link.target].z += link.value;
            matrix[link.target][link.source].z += link.value;
            matrix[link.source][link.source].z += link.value;
            matrix[link.target][link.target].z += link.value;
            nodes[link.source].count = link.value;
            nodes[link.target].count = link.value;
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

        svg2.append("rect")
            .attr("class", "background")
            .attr("width", width)
            .attr("height", height);

        var row = svg2.selectAll(".rows")
            .data(matrix)
            .enter().append("g")
            .attr("class", "rows")
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

        var column = svg2.selectAll(".columns")
            .data(matrix)
            .enter().append("g")
            .attr("class", "columns")
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
                .attr("class", function (d) { return "cell " + nodes[d.x].group; })
                .attr("x", function (d) { return x(d.x); })
                .attr("width", x.bandwidth())
                .attr("height", x.bandwidth())
                .style("fill-opacity", function (d) { return z(d.z); })
                .style("fill", function (d) { return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : blendColors(c(nodes[d.x].group), c(nodes[d.y].group), 0.5); })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on('mouseover.tooltip', function (d) {
                    tooltip2.transition()
                        .duration(300)
                        .style("opacity", .8);
                    tooltip2.html("<p>Link: " + nodes[d.y].id + " -- " + nodes[d.x].id + "<hr>Groups:" + nodes[d.y].group + ", " + nodes[d.x].group + "<hr>Strength:" + (nodes[d.x].count).toFixed(2) + "</p>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 10) + "px");
                })
                .on("mouseout.tooltip", function () {
                    tooltip2.transition()
                        .duration(100)
                        .style("opacity", 0);
                })
                .on("mousemove", function () {
                    tooltip2.style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 10) + "px");
                });
        }

        function mouseover(p) {
            d3.selectAll(".rows text").classed("active", function (d, i) { return i == p.y; });
            d3.selectAll(".columns text").classed("active", function (d, i) { return i == p.x; });
        }

        function mouseout() {
            d3.selectAll(".rows text").classed("active", false);
            d3.selectAll(".columns text").classed("active", false);
        }

        d3.select("#order").on("change", function () {
            clearTimeout(timeout);
            order(this.value);
        });

        function order(value) {
            x.domain(orders[value]);

            var t = svg2.transition().duration(1500);

            t.selectAll(".rows")
                .delay(function (d, i) { return x(i) * 4; })
                .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
                .selectAll(".cell")
                .delay(function (d) { return x(d.x) * 4; })
                .attr("x", function (d) { return x(d.x); });

            t.selectAll(".columns")
                .delay(function (d, i) { return x(i) * 4; })
                .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
        }

        var timeout = setTimeout(function () {
            order("group");
            d3.select("#order").property("selectedIndex", 2).node().focus();
        }, 1000);
    });
}

createNetworkGraph();
createAdjMatrix();