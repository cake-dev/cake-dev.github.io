createMap = async function () {

    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    let w = width
    let h = height;

    svg.append("g").attr("id", "mapLayer");

    let projection = d3.geoMercator()
        .translate([width / 2, height / 2]) // this centers the map in our SVG element
        .scale(100);                     // this specifies how much to zoom

    // This converts the projected lat/lon coordinates into an SVG path string
    let path = d3.geoPath()
        .projection(projection);

    let world_countries = await d3.json("data/worldcountries.geojson");


    // Bind data and create one path per GeoJSON feature
    var us_paths = d3.select("#mapLayer").selectAll("path")
        .data(world_countries.features)
        .join("path")
        // use d attribute to define the path
        .attr("d", path)
        .classed("country", true)
        .attr("opacity", "1");

    const b = path.bounds(world_countries);

    // scale
    const s = 0.99 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h);

    // transform
    const t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];

    // update projection
    projection
        .scale(s)
        .translate(t);


    // scale and position
    const raster_width = (b[1][0] - b[0][0]) * s;
    const raster_height = (b[1][1] - b[0][1]) * s;

    const rtranslate_x = (w - raster_width) / 2;
    const rtranslate_y = (h - raster_height) / 2;

    // svg.append("image")
    //     .attr('id', 'population')
    //     .attr("xlink:href", "data/worldpop.png")
    //     .attr("width", raster_width)
    //     .attr("height", raster_height)
    //     .attr("transform", "translate(" + rtranslate_x + ", " + rtranslate_y + ")");

    let tiff = await d3.buffer('data/population_world.geotiff')
        .then(buffer => GeoTIFF.fromArrayBuffer(buffer));
    let image = await tiff.getImage();
    let rasters = await image.readRasters();

    let values = rasters[0];
    let wi = image.getWidth(), hi = image.getHeight();

    let scaling = Math.min(window.innerWidth * .9 / wi, window.innerHeight * .9 / hi);

    let contours = d3.contours().size([wi, hi]);
    let contourData = contours(values);

    console.log(contourData)

    let colorScale = d3.scaleSequential(d3.extent(values), d3.interpolateViridis);

    let populations = svg.selectAll('.populations').data(contourData);
    populations.enter().append('path')
        .attr('class', 'populations')
        .attr('fill', d => colorScale(d.value))
        .attr('stroke', 'black')
        .attr('stroke-width', 0.1)
        .style('opacity', 1)
        .attr('d', d => path(d.coordinates))
        .attr('transform', `scale(${scaling})`);

}
createMap();