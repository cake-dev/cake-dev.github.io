import * as d3 from 'd3'

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

const bars = container
    .selectAll('.bar')
    .data(DUMMY_DATA)
    .enter()
    .append('rect')
    .classed('bar', true)
    .attr('width', xScale.bandwidth())
    .attr('height', (data) => 200 - yScale(data.value))
    .attr('x', data => xScale(data.region))
    .attr('y', data => yScale(data.value));