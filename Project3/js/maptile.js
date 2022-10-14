var pi = Math.PI,
    tau = 2 * pi;

var width = 960;
height = 500;

// Initialize the projection to fit the world in a 1×1 square centered at the origin.
var projection = d3.geoMercator()
    .scale(1 / tau)
    .translate([0, 0]);

var path = d3.geoPath()
    .projection(projection);

var tile = d3.tile()
    .size([width, height]);

var zoom = d3.zoom()
    .scaleExtent([1 << 11, 1 << 14])
    .on("zoom", zoomed);

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

var raster = svg.append("g");
var vector = svg.append("g");

// Compute the projected initial center.


var center = projection([-98.5, 39.5]);


d3.json("https://unpkg.com/world-atlas@1/world/110m.json", function (error, data) {

    vector.append("path")
        .datum(topojson.feature(data, data.objects.land))
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("d", path)

    // let west_us_json = await d3.json("Data/western_us.geojson");

    // // Bind data and create one path per GeoJSON feature
    // var us_paths = d3.select("#mapLayer").selectAll("path")
    //     .data(west_us_json.features)
    //     .join("path")
    //     // use d attribute to define the path
    //     .attr("d", path)
    //     .classed("state", true)
    //     .attr("opacity", "1");

    // Apply a zoom transform equivalent to projection.{scale,translate,center}.
    svg
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(1 << 12)
            .translate(-center[0], -center[1]));

})

function zoomed() {
    var transform = d3.event.transform;

    var tiles = tile
        .scale(transform.k)
        .translate([transform.x, transform.y])
        ();

    projection
        .scale(transform.k / tau)
        .translate([transform.x, transform.y]);

    var image = raster
        .attr("transform", stringify(tiles.scale, tiles.translate))
        .selectAll("image")
        .data(tiles, function (d) {
            return d;
        });

    image.exit().remove();
    // enter:
    var entered = image.enter().append("image");
    // update:
    image = entered.merge(image)
        .attr('xlink:href', function (d) {
            return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/' + d.z + '/' + d.y + '/' + d.x + '.png';
        })
        .attr('x', function (d) {
            return d.x * 256;
        })
        .attr('y', function (d) {
            return d.y * 256;
        })
        .attr("width", 256)
        .attr("height", 256)
        .attr("opacity", 0.8);

    vector.selectAll("path")
        .attr("transform", "translate(" + [transform.x, transform.y] + ")scale(" + transform.k + ")")
        .style("stroke-width", 0.5 / transform.k);
}

function stringify(scale, translate) {
    var k = scale / 256,
        r = scale % 1 ? Number : Math.round;
    return "translate(" + r(translate[0] * scale) + "," + r(translate[1] * scale) + ") scale(" + k + ")";
}
