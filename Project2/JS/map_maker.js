const color_fires = ['#ffbc56', '#ffa03a', '#fc8314', '#ec6c00', '#d65a00', '#c04800', '#aa3600', '#962200', '#800c00', '#670000']
const color_map = ['#eeeeee', '#d6d6d6', '#bebebe', '#a7a7a7', '#909090', '#7a7a7a', '#656565', '#505050', '#3c3c3c', '#2a2a2a', '#181818']


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

createMap = async function () {



    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    create_svg_border(svg, height, width);


    svg.append("g").attr("id", "mapLayer");
    svg.append("g").attr("id", "pointLayer");
    d3.select("#mapLayer").append("text").text("Class G Wildfires in the Western US in 1985").attr("x", 10).attr("y", 20).attr("id", "map_title");

    // In order to convert lat / lon (spherical!) coordinates to fit in the 2D
    // coordinate system of our screen, we need to create a projection function:

    let projection = d3.geoAlbersUsa()      // a USA-specific projection (that deals with Hawaii / Alaska)
        .translate([width / 1.2, height / 1.7]) // this centers the map in our SVG element
        .scale([1600]);                     // this specifies how much to zoom

    // This converts the projected lat/lon coordinates into an SVG path string
    let path = d3.geoPath()
        .projection(projection);

    // Load in states GeoJSON data    
    //let us_json = await d3.json("Data/us-states.json");
    let west_us_json = await d3.json("Data/western_us.geojson");


    // Bind data and create one path per GeoJSON feature
    var us_paths = d3.select("#mapLayer").selectAll("path")
        .data(west_us_json.features)
        .join("path")
        // use d attribute to define the path
        .attr("d", path)
        .classed("state", true)
        .attr("opacity", "1");

    var tooltip = d3.select("body")
        .append("div")
        .classed(".tooltip", true)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "#ffffff")
        .text("a simple tooltip");



}

addFires = async function (f_year) {
    d3.selectAll(".fire_point").remove();


    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 1.7])
        .scale([1600]);

    let w_fires = await d3.json("Data/western_fires.geojson");

    let fires = d3.select("#pointLayer").selectAll("circle")
        .data(w_fires.features)

    // let start = 5000;
    // let stop = 1000000;
    // let s = (stop - start) / 10;

    // const c_domain = (start, stop, step = s) =>
    //     Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

    // console.log(c_domain(start, stop, s))

    c_d = [7000, 10000, 20000, 40000, 60000, 80000, 100000, 200000, 400000, 600000]

    var fire_colors = d3.scaleLinear()
        .domain(c_d)
        .range(color_fires);

    hover_info = d3.select(".tooltip");

    fires
        .join("circle")
        .filter(d => d.properties.year == parseInt(f_year))
        .classed("fire_point", true)
        .attr("cx", d => (projection(d.geometry.coordinates)[0]))
        .attr("cy", d => (projection(d.geometry.coordinates)[1]))
        .attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
        .attr("fill", d => fire_colors(d.properties.BurnBndAc))
        .on("mouseover", event => {
            hover_info.style("visibility", "visible");
        })
        .on("mousemove", (event, d) => {
            hover_info.text("Burned Area: " + d.properties.BurnBndAc + " Acres");
            hover_info.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseleave", event => {
            hover_info.style("visibility", "hidden");
        });

    chloroplethView(f_year);
    createLegend(f_year);


}

chloroplethView = async function (m_year) {

    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));
    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 1.7])
        .scale([1600]);
    let path = d3.geoPath()
        .projection(projection);

    let west_us_json = await d3.json("Data/western_us.geojson");
    let burned_area_by_state_year = await d3.csv("Data/burned_area_per_year_per_state.csv");

    let map_title = d3.select("#map_title");
    map_title.text("Class G Wildfires in the Western US in " + m_year).attr("font-size", 20);

    let burned_area = burned_area_by_state_year.filter(function (d) {
        return parseInt(d.year) == parseInt(m_year);
    });

    let color = d3.scaleLinear()
        .range(
            color_map
        );
    let c_domain = function (burned_area) {
        let c_d = [];
        burned_area.forEach(function (d) {
            c_d.push(parseInt(d.Acres));
        });
        return c_d.reverse();
    }
    color.domain(c_domain(burned_area));

    // Convert the data array to an object, so that it's easy to look up
    // data values by state names
    let dataLookup = {};
    burned_area.forEach(function (burned_area) {
        // d3.csv will read the values as strings; we need to convert them to floats
        dataLookup[burned_area.State] = parseFloat(burned_area.Acres);
    });

    // Now we add the data values to the geometry for every state

    west_us_json.features.forEach(function (feature) {
        feature.properties.Acres = dataLookup[feature.properties.name];
    });

    var us_paths = d3.select("#mapLayer").selectAll("path")
        .data(west_us_json.features)
        .join("path")
        // use d attribute to define the path
        .attr("d", path)
        .classed("state", true)
        .style("fill", function (d) {
            if (d.properties.Acres > 0) {
                return color(d.properties.Acres);
            } else {
                return "#ffffff";
            }
        })
        .attr("opacity", "0.6");


    // NOTE: code below is for creating a key of sorts
    // // select the svg area
    // var SVG = d3.select("#my_legend")

    // // create a list of keys
    // var keys = ["Mister A", "Brigitte", "Eleonore", "Another friend", "Batman"]

    // // Usually you have a color scale in your chart already
    // var color2 = d3.scaleOrdinal()
    //     .domain(keys)
    //     .range(d3.schemeSet1);

    // // Add one dot in the legend for each name.
    // var size = 20
    // SVG.selectAll("mydots")
    //     .data(keys)
    //     .enter()
    //     .append("rect")
    //     .attr("x", 100)
    //     .attr("y", function (d, i) { return 100 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
    //     .attr("width", size)
    //     .attr("height", size)
    //     .style("fill", function (d) { return color2(d) })

    // // Add one dot in the legend for each name.
    // SVG.selectAll("mylabels")
    //     .data(keys)
    //     .enter()
    //     .append("text")
    //     .attr("x", 100 + size * 1.2)
    //     .attr("y", function (d, i) { return 100 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
    //     .style("fill", function (d) { return color2(d) })
    //     .text(function (d) { return d })
    //     .attr("text-anchor", "left")
    //     .style("alignment-baseline", "middle")
}


changeSize = async function () {

    if (d3.selectAll(".fire_point").attr("r") == 5) {
        d3.selectAll(".fire_point").attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
    }
    else {
        d3.selectAll(".fire_point").attr("r", 5);
    }

}

var tabulate = function (data, columns) {
    var table = d3.select('#info_container').append('table').classed("map_table", true)
    var thead = table.append('thead')
    var tbody = table.append('tbody')

    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) { return d })

    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr')

    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] }
            })
        })
        .enter()
        .append('td')
        .text(function (d) {
            if (d.column == "Acres") {
                return Number(d.value).toLocaleString()
            } else {
                return d.value;
            }
        })

    return table;
}

createLegend = async function (m_year) {

    d3.selectAll(".map_table").remove();

    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));
    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 1.7])
        .scale([1600]);
    let path = d3.geoPath()
        .projection(projection);

    let burned_area_by_state_year = await d3.csv("Data/burned_area_per_year_per_state.csv");
    let w_fires = await d3.json("Data/western_fires.geojson");

    let burned_area = burned_area_by_state_year.filter(function (d) {
        return parseInt(d.year) == parseInt(m_year);
    });
    cols = ["State", "Acres"]

    fires_per_year = w_fires.features.filter(function (d) {
        return parseInt(d.properties.year) == parseInt(m_year);
    });

    d3.select("#info_container").append("p").text("Acres Burned by State in " + m_year).classed("map_table", true);
    d3.select("#info_container").append("p").text("Total Fires: " + fires_per_year.length).classed("map_table", true);
    d3.select("#info_container").append("p").text("Total Acres burned: " + d3.sum(burned_area, d => parseInt(d.Acres))).classed("map_table", true)
    tabulate(burned_area, cols);

}

async function main() {
    await createMap();
    await addFires(1985)

    img = d3.select("#viz").append("image")

    img.attr("xlink:href", "assets/img/map_key.png")
        .attr("x", 648)
        .attr("y", 1)
        .attr("width", 150)

}

main();