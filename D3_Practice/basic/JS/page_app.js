const DUMMY_DATA = [
    { id: 'd1', value: 18, region: 'USA' },
    { id: 'd2', value: 11, region: 'India' },
    { id: 'd3', value: 16, region: 'China' },
    { id: 'd5', value: 7, region: 'Canada' },
];

const xScale = d3.scaleBand().domain(DUMMY_DATA.map(dataPoint => dataPoint.region)).rangeRound([0, 250]).padding(0.1);
const yScale = d3.scaleLinear().domain([0, 20]).range([200, 0]);

const container = d3.select('svg')
    .classed('container', true)
    .attr('width', '80%')
    .attr('height', 800)

// const bars = container
//     .selectAll('.bar')
//     .data(DUMMY_DATA)
//     .enter()
//     .append('rect')
//     .classed('bar', true)
//     .attr('width', xScale.bandwidth())
//     .attr('height', (data) => 200 - yScale(data.value))
//     .attr('x', data => xScale(data.region))
//     .attr('y', data => yScale(data.value));

const shape_data = [
    { id: 'p1', x: 10, y: 10 },
    { id: 'p2', x: 20, y: 20 },
    { id: 'p3', x: 30, y: 30 },
    { id: 'p4', x: 40, y: 40 },
    { id: 'p5', x: 50, y: 50 },
    { id: 'p6', x: 60, y: 60 },
    { id: 'p7', x: 70, y: 70 },
    { id: 'p8', x: 80, y: 80 },
    { id: 'p9', x: 90, y: 90 },
    { id: 'p10', x: 100, y: 100 },
]

execute = function () {

    let points = container.selectAll('circle').data(shape_data)

    points.enter()
        .append('circle')
        .classed('d_point', true)
        .transition().duration(4000).delay((data, index) => index * 100).ease(d3.easeBack)
        .attr('cx', data => data.x * 5)
        .attr('cy', data => data.y * 5)
        .attr('r', data => data.x / 2 + data.y / 2);
}
