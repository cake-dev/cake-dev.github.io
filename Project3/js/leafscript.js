
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

    var Esri_WorldImagery = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);

    var url_to_geotiff_file = "data/alaska_ice_2018_2022.TIFF";

    fetch(url_to_geotiff_file)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                const min = georaster.mins[0];
                const max = georaster.maxs[0];
                const range = georaster.ranges[0];

                console.log(georaster)

                // available color scales can be found by running console.log(chroma.brewer);
                console.log(chroma.brewer);
                var scale = chroma.scale("viridis");

                var ice_2018 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.5,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[0]; // there's just one band in this raster

                        // if there's zero value, don't return a color
                        if (pixelValue === 0 || pixelValue === 255 || pixelValue === 253) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });
                var ice_2022 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.5,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[1]; // there's just one band in this raster

                        // if there's zero value, don't return a color
                        if (pixelValue === 0 || pixelValue === 255 || pixelValue === 253) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });


                var ice_layers = {
                    "2018": ice_2018,
                    "2022": ice_2022
                }

                var layerControl = L.control.layers(ice_layers).addTo(map);

                // console.log("layer:", layer);
                ice_2018.addTo(map);


                map.fitBounds(ice_2018.getBounds());
                map.setView([63.440002, -152.358398], 3.5);
            });
        });

    var chl_url = "data/chlorophyll_sea_2018_2022.TIFF"

    fetch(chl_url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
            parseGeoraster(arrayBuffer).then(georaster => {
                const min = georaster.mins[0];
                const max = georaster.maxs[0];
                const range = georaster.ranges[0];

                console.log(georaster)

                // available color scales can be found by running console.log(chroma.brewer);
                console.log(chroma.brewer);
                var scale = chroma.scale("viridis");

                var chl_2018 = new GeoRasterLayer({
                    georaster: georaster,
                    opacity: 0.5,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[0]; // there's just one band in this raster

                        // if there's zero value, don't return a color
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
                    opacity: 0.5,
                    pixelValuesToColorFn: function (pixelValues) {
                        var pixelValue = pixelValues[1]; // there's just one band in this raster

                        // if there's zero value, don't return a color
                        if (pixelValue === 0 || pixelValue === 255 || pixelValue === 253) return null;

                        // scale to 0 - 1 used by chroma
                        var scaledPixelValue = (pixelValue - min) / range;

                        var color = scale(scaledPixelValue).hex();

                        return color;
                    },
                    resolution: 256
                });


                var chl_layers = {
                    "2018": chl_2018,
                    "2022": chl_2022
                }

                var layerControl = L.control.layers(chl_layers).addTo(map);

                // console.log("layer:", layer);
                chl_2018.addTo(map);


                map.fitBounds(chl_2018.getBounds());
                map.setView([63.440002, -152.358398], 3.5);
            });
        });

    console.log(map._layers)

    // var data = fetchJSON('data/mtbs_perims_us_2020_large.geojson')
    //     .then(function (data) { return data })
    //     .then(function (data) {
    //         var geojsonLayer = L.geoJson(data, {
    //             style: function (feature) {
    //                 return {
    //                     color: 'red',
    //                     weight: 1,
    //                     opacity: 0.5,
    //                     fillOpacity: 0.1
    //                 };
    //             }
    //         }).addTo(map);
    //     });
}
createMap();




// map.dragging.disable();
// map.touchZoom.disable();
// map.doubleClickZoom.disable();
// map.scrollWheelZoom.disable();
// map.boxZoom.disable();
// map.keyboard.disable();
// if (map.tap) map.tap.disable();
// document.getElementById('map').style.cursor = 'default';
document.getElementsByClassName('leaflet-control-attribution')[0].style.display = 'none';
// var imageUrl = 'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg';
// var errorOverlayUrl = 'https://cdn-icons-png.flaticon.com/512/110/110686.png';
// var altText = 'Image of Newark, N.J. in 1922. Source: The University of Texas at Austin, UT Libraries Map Collection.';
// var latLngBounds = L.latLngBounds([[40.799311, -74.118464], [40.68202047785919, -74.33]]);

// var imageOverlay = L.imageOverlay(imageUrl, latLngBounds, {
//     opacity: 0.8,
//     errorOverlayUrl: errorOverlayUrl,
//     alt: altText,
//     interactive: true
// }).addTo(map);

// L.rectangle(latLngBounds).addTo(map);
// map.fitBounds(latLngBounds);
// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);