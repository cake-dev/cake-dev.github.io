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

function zoomed(event) {
    g
        .selectAll('path') // To prevent stroke width from scaling
        .attr('transform', event.transform);
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

    // create zoom
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', event => {
            d3.select("#viz").selectAll('path') // To prevent stroke width from scaling
                .attr('transform', event.transform);
            d3.select("#viz").selectAll('circle')
                .attr('transform', event.transform);
        });

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


    svg.call(zoom);


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

    var tooltip = d3.select("body")
        .append("div")
        .classed(".tooltip", true)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "#ffffff")
        .text("a simple tooltip");

    fires
        .join("circle")
        .filter(d => d.properties.year == parseInt(f_year))
        .classed("fire_point", true)
        .attr("cx", d => (projection(d.geometry.coordinates)[0]))
        .attr("cy", d => (projection(d.geometry.coordinates)[1]))
        .attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
        .attr("fill", d => fire_colors(d.properties.BurnBndAc))
        .on("mouseover", event => {
            tooltip.style("visibility", "visible");
        })
        .on("mousemove", (event, d) => {
            tooltip.text("Burned Area: " + Number(d.properties.BurnBndAc).toLocaleString() + " acres");
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseleave", event => {
            tooltip.style("visibility", "hidden");
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

}

createTimeSeries = async function () {
    d3.select(".footer").append("div").attr("id", "timeSeries");

    let burn_data = await d3.csv("Data/burned_area_per_year.csv");


    const margin = { top: 20, right: 30, bottom: 30, left: 60 },
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    // append the svg object to the body of the page
    const svg = d3.select("#timeSeries")
        .append("svg")
        .attr('id', 'graph')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    //Read the data
    d3.csv('Data/burned_area_per_year.csv').then(

        // Now I can use this dataset:
        function (data) {

            // Add X axis --> it is a date format
            const x = d3.scaleLinear()
                .domain(d3.extent(data, function (d) { return d.Year; }))
                .range([0, width]);
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.format("d"))); //this formats the number to not have a comma


            // Add Y axis
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return +d.Acres; })])
                .range([height, 0]);
            svg.append("g")
                .call(d3.axisLeft(y));


            // Create grids.
            const xAxisGrid = d3.axisBottom(x).tickSize(-height).tickFormat('').ticks(10);
            const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(10);
            svg.append('g')
                .attr('class', 'x axis-grid')
                .attr('transform', 'translate(0,' + height + ')')
                .attr('opacity', 0.3)
                .call(xAxisGrid);
            svg.append('g')
                .attr('class', 'y axis-grid')
                .attr('opacity', 0.3)
                .call(yAxisGrid);

            // add dots at data points
            svg.append("g")
                .selectAll("dot")
                .data(data)
                .join("circle")
                .attr("cx", function (d) { return x(d.Year) })
                .attr("cy", function (d) { return y(d.Acres) })
                .attr("r", 3.0)
                .style("fill", "#69b3a2")

            // Add the line
            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) { return x(d.Year) })
                    .y(function (d) { return y(d.Acres) })
                )


        }




    )
}

changeSize = async function () {

    if (d3.selectAll(".fire_point").attr("r") == 3) {
        d3.selectAll(".fire_point").attr("r", d => Math.sqrt(parseInt(d.properties.BurnBndAc) * .0003))
    }
    else {
        d3.selectAll(".fire_point").attr("r", 3);
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
    d3.selectAll(".map_titles").remove();

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

    d3.select("#info_container").append("h3").text("Acres Burned (state) " + m_year).classed("map_titles h3", true);
    d3.select("#info_container").append("p").text("Total Class G Fires: " + fires_per_year.length).classed("map_titles p", true);
    d3.select("#info_container").append("p").text("Total Acres burned: " + Number(d3.sum(burned_area, d => parseInt(d.Acres))).toLocaleString()).classed("map_titles p", true)
    tabulate(burned_area, cols);

}

async function main() {
    await createMap();

    await addFires(1985);

    await createTimeSeries();

    img = d3.select("#viz").append("image")

    img.attr("xlink:href", "assets/img/map_key.png")
        .attr("x", 648)
        .attr("y", 1)
        .attr("width", 150)




}

main();
