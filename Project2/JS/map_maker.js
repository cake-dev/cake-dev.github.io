const color_fires = ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04']
const color_map = ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000']


function create_svg_border(svg, h, w) {
    svg.attr('border', 1);
    svg.append("rect")
        .classed("svg_border", true)
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", h)
        .attr("width", w)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 1);
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
        .translate([width / 1.2, height / 2]) // this centers the map in our SVG element
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

add_fires_1985 = async function () {
    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 2])
        .scale([1600]);

    let path = d3.geoPath()
        .projection(projection);

    let fires_1985 = await d3.json("Data/fires_1985.geojson");

    d3.selectAll(".fire_15").remove()

    let fires_85 = d3.select("#pointLayer").selectAll("circle")
        .data(fires_1985.features)

    var fire_colors = d3.scaleQuantize()
        .domain([5071, 126854])
        .range(color_fires);

    fires_85
        .join("circle")
        .classed("fire_85", true)
        .attr("cx", d => (projection(d.geometry.coordinates)[0]))
        .attr("cy", d => (projection(d.geometry.coordinates)[1]))
        .attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
        .attr("fill", d => fire_colors(d.properties.BurnBndAc));
}

add_fires_2015 = async function () {
    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 2])
        .scale([1600]);

    let fires_2015 = await d3.json("Data/fires_2015.geojson");

    d3.selectAll(".fire_85").remove()

    let fires_15 = d3.select("#pointLayer").selectAll("circle")
        .data(fires_2015.features)

    var fire_colors = d3.scaleQuantize()
        .domain([5052, 282888])
        .range(color_fires);

    fires_15
        .join("circle")
        .classed("fire_15", true)
        .attr("cx", d => (projection(d.geometry.coordinates)[0]))
        .attr("cy", d => (projection(d.geometry.coordinates)[1]))
        .attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
        .attr("fill", d => fire_colors(d.properties.BurnBndAc));
}

addFires = async function (f_year) {
    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));

    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 2])
        .scale([1600]);

    let w_fires = await d3.json("Data/western_fires.geojson");

    let fires = d3.select("#pointLayer").selectAll("circle")
        .data(w_fires.features)

    var fire_colors = d3.scaleQuantize()
        .domain([5052, 282888])
        .range(color_fires);

    fires
        .join("circle")
        .classed("fire_point", true)
        .filter(d => d.properties.year == f_year)
        .attr("cx", d => (projection(d.geometry.coordinates)[0]))
        .attr("cy", d => (projection(d.geometry.coordinates)[1]))
        .attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
        .attr("fill", d => fire_colors(d.properties.BurnBndAc));

}

chloroplethView = async function (m_year) {

    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));
    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 2])
        .scale([1600]);
    let path = d3.geoPath()
        .projection(projection);

    let west_us_json = await d3.json("Data/western_us.geojson");
    let burned_state_area_1985 = await d3.csv("Data/burned_area_1985.csv");
    let burned_state_area_2015 = await d3.csv("Data/burned_area_2015.csv");

    let map_title = d3.select("#map_title");
    map_year = map_title.text().substring(map_title.text().length - 4, map_title.text().length)

    let burned_area;

    if (map_year == "1985") {
        burned_area = burned_state_area_1985;
    } else {
        burned_area = burned_state_area_2015;
    }

    let color = d3.scaleQuantize()
        .range(
            color_map
        );

    color.domain([
        d3.min(burned_area, function (d) {
            return d.Acres;
        }),
        d3.max(burned_area, function (d) {
            return d.Acres;
        })
    ]);

    // Convert the data array to an object, so that it's easy to look up
    // data values by state names
    let dataLookup = {};
    burned_area.forEach(function (burned_area) {
        // d3.csv will read the values as strings; we need to convert them to floats
        dataLookup[burned_area.State] = parseFloat(burned_area.Acres);
    });
    console.log(dataLookup)
    // Now we add the data values to the geometry for every state

    west_us_json.features.forEach(function (feature) {
        feature.properties.Acres = dataLookup[feature.properties.name];
    });
    console.log(west_us_json.features.properties)
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

    // select the svg area
    var SVG = d3.select("#my_legend")

    // create a list of keys
    var keys = ["Mister A", "Brigitte", "Eleonore", "Another friend", "Batman"]

    // Usually you have a color scale in your chart already
    var color2 = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet1);

    // Add one dot in the legend for each name.
    var size = 20
    SVG.selectAll("mydots")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", 100)
        .attr("y", function (d, i) { return 100 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function (d) { return color2(d) })

    // Add one dot in the legend for each name.
    SVG.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 100 + size * 1.2)
        .attr("y", function (d, i) { return 100 + i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (d) { return color2(d) })
        .text(function (d) { return d })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
}

changeYear = async function () {
    let map_title = d3.select("#map_title");
    map_year = map_title.text().substring(map_title.text().length - 4, map_title.text().length)

    if (map_year == "1985") {
        map_title.text("Class G Wildfires in the Western US in 2015");
        await add_fires_2015();
        await chloroplethView();
        d3.select(".map_table").remove();
        await createLegend();

    } else {
        map_title.text("Class G Wildfires in the Western US in 1985");
        await add_fires_1985();
        await chloroplethView();
        d3.select(".map_table").remove();
        await createLegend();
    }
}

changeSize = async function () {
    let map_title = d3.select("#map_title");
    map_year = map_title.text().substring(map_title.text().length - 4, map_title.text().length)

    if (map_year == "1985") {
        if (d3.selectAll(".fire_85").attr("r") == 5) {
            d3.selectAll(".fire_85").attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
        }
        else {
            d3.selectAll(".fire_85").attr("r", 5);
        }
    }
    else {
        if (d3.selectAll(".fire_15").attr("r") == 5) {
            d3.selectAll(".fire_15").attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
        }
        else {
            d3.selectAll(".fire_15").attr("r", 5);
        }
    }
}

var tabulate = function (data, columns) {
    var table = d3.select('#legend_container').append('table').classed("map_table", true)
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
        .text(function (d) { return d.value })

    return table;
}

createLegend = async function (m_year) {

    d3.selectAll(".map_table").remove();

    let svg = d3.select("#viz");
    let width = parseInt(svg.attr("width"));
    let height = parseInt(svg.attr("height"));
    let projection = d3.geoAlbersUsa()
        .translate([width / 1.2, height / 2])
        .scale([1600]);
    let path = d3.geoPath()
        .projection(projection);

    let burned_state_area_1985 = await d3.csv("Data/burned_area_1985.csv");
    let burned_state_area_2015 = await d3.csv("Data/burned_area_2015.csv");

    let map_title = d3.select("#map_title");
    map_year = map_title.text().substring(map_title.text().length - 4, map_title.text().length)

    let burned_area;
    cols = ["State", "Acres"]

    if (map_year == "1985") {
        burned_area = burned_state_area_1985;
    } else {
        burned_area = burned_state_area_2015;
    }
    d3.select("#legend_container").append("p").text("Acres Burned by State in " + map_year).classed("map_table", true);
    d3.select("#legend_container").append("p").text("Total Acres burned: " + d3.sum(burned_area, d => parseInt(d.Acres))).classed("map_table", true)
    tabulate(burned_area, cols);

}

addSlider = async function () {
    // Time
    var dataTime = d3.range(0, 36).map(function (d) {
        return new Date(1985 + d, 1, 1);
    });

    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .width(1000)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(1998, 10, 3))
        .on('onchange', val => {
            d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
            d3.selectAll(".fire_point").remove();
            addFires(d3.timeFormat('%Y')(val));
        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 1100)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));
}

async function main() {
    await createMap();
    await add_fires_1985();
    await chloroplethView();
    await createLegend();
    await addSlider();

}

main();