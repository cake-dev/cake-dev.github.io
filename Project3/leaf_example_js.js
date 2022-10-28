// create a map in the "map" div, set the view to a given place and zoom
var map = L.map('map').setView([0, 0], 2);

// add an OpenStreetMap tile layer to the map (note: there are many options for OSM layers)
var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: '(this appears at the bottom right of the map)'
}).addTo(map);
