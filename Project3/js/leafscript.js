
const rev_spectral_scale = ['#5e4fa2',
    '#3288bd',
    '#66c2a5',
    '#abdda4',
    '#e6f598',
    '#ffffbf',
    '#fee08b',
    '#fdae61',
    '#f46d43',
    '#d53e4f',
    '#9e0142']

function fetchRaster(url) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => { return georaster });
        });
}

function fetchJSON(url) {
    return fetch(url)
        .then(function (response) {
            return response.json();
        });
}

async function createMap() {
    var map = L.map('map', { zoomControl: false });

    //disable pan and zoom
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap) map.tap.disable();
    document.getElementById('map').style.cursor = 'default';

    var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    }).addTo(map);

    var ice_url = "data/sea_ice_apr_2021_2022.TIFF";

    var layers = {};

    fetch(ice_url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                const min = georaster.mins[0];
                const max = georaster.maxs[0];
                const range = georaster.ranges[0];

                // available color scales can be found by running console.log(chroma.brewer);
                console.log(chroma.brewer);
                var scale = chroma.scale("greys");

                var ice_2021 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.75,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[0]; // there's just 2 band in this raster

                        // if there's a certain value, don't return a color
                        if (pixelValue === 0 || pixelValue === 255 || pixelValue === 253 || pixelValue === 150) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });
                var ice_2022 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.75,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[1]; // there's just 2 band in this raster

                        // if there's certain value, don't return a color
                        if (pixelValue === 0 || pixelValue === 255 || pixelValue === 253 || pixelValue === 150) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });


                var ice_layers = {
                    "2021 Sea Ice": ice_2021,
                    "2022 Sea Ice": ice_2022
                }

                layers["2021 Sea Ice"] = ice_2021;
                layers["2022 Sea Ice"] = ice_2022;

                var layerControl = L.control.layers(null, ice_layers).addTo(map);

                // console.log("layer:", layer);
                ice_2021.addTo(map);

            });
        });

    var sst_url = "data/sst_2021_2022_clipped.tiff";

    fetch(sst_url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                const min = georaster.mins[0];
                const max = georaster.maxs[0];
                const range = georaster.ranges[0];

                // available color scales can be found by running console.log(chroma.brewer);
                console.log(chroma.brewer);
                var scale = chroma.scale(rev_spectral_scale);

                var sst_2021 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.75,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[0]; // there's just 2 band in this raster

                        // if there's certain value, don't return a color
                        if (pixelValue === 0) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });
                var sst_2022 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.75,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[1]; // there's just 2 band in this raster

                        // if there's certain value, don't return a color
                        if (pixelValue === 0) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });


                var sst_layers = {
                    "2021 SST anom": sst_2021,
                    "2022 SST anom": sst_2022,
                }

                layers["2021 SST anom"] = sst_2021;
                layers["2022 SST anom"] = sst_2022;

                var layerControl = L.control.layers(null, sst_layers).addTo(map);

                // console.log("layer:", layer);

            });
        });

    var chl_url = "data/chloro_apr_2021_2022.TIFF"

    fetch(chl_url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                const min = georaster.mins[0];
                const max = georaster.maxs[0];
                const range = georaster.ranges[0];

                // available color scales can be found by running console.log(chroma.brewer);
                var scale = chroma.scale("greens");

                var chl_2021 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.75,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[0]; // there's just 2 band in this raster

                        // if there's certain value, don't return a color
                        if (pixelValue === 0 || pixelValue === 255 || pixelValue === 253) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });
                var chl_2022 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.75,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[1]; // there's just 2 band in this raster

                        // if there's certain value, don't return a color
                        if (pixelValue === 0 || pixelValue === 255 || pixelValue === 253) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });



                var chl_layers = {
                    "2021 Chlorophyll": chl_2021,
                    "2022 Chlorophyll": chl_2022
                }

                layers["2021 Chlorophyll"] = chl_2021;
                layers["2022 Chlorophyll"] = chl_2022;

                var layerControl = L.control.layers(null, chl_layers).addTo(map);

                // console.log("layer:", layer);
                chl_2021.addTo(map);

                console.log(map._layers)


                map.fitBounds(chl_2021.getBounds());
                map.setView([63.440002, -154.358398], 3.5);
            });
        });
    var data = fetchJSON('data/snowcrabrange.geojson')
        .then(function (data) { return data })
        .then(function (data) {
            var geojsonLayer = L.geoJson(data, {
                style: function (feature) {
                    return {
                        color: 'orange',
                        weight: 1,
                        opacity: 0.5,
                        fillOpacity: 0
                    };
                }
            }).addTo(map);
        });

    L.Control.textbox = L.Control.extend({
        onAdd: function (map) {

            var text = L.DomUtil.create('div');
            text.id = "info_text";
            text.innerHTML = "<strong>Alaskan Coastal Sea Metrics - Spring 2021 and 2022</strong>"
            return text;
        },

        onRemove: function (map) {
            // Nothing to do here
        }
    });
    L.control.textbox = function (opts) { return new L.Control.textbox(opts); }
    L.control.textbox({ position: 'bottomleft' }).addTo(map);

    img = d3.select("#my_legend").append("image")

    img.attr("xlink:href", "static/ColorScales_alaska.png")
        .attr("x", 2)
        .attr("y", 2)
        .attr("width", 500)

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

    let table_data = d3.csv("data/");




}
createMap();





document.getElementsByClassName('leaflet-control-attribution')[0].style.display = 'none';