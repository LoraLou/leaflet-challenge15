// check the links 
console.log("Map Check");
//base layer
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
// base map objects 
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};
// empty layer for earthquakes
let earthquakes = new L.layerGroup();
//overlay oject
let overlayMaps = {
    Earthquakes: earthquakes
};
// create map
let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 3.5,
    layers: [street, earthquakes]
});
// layer control
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);
// get earthquake data
let queryUrl = "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"
// perform d3 to query URL
d3.json(queryUrl).then(function(data){
    console.log(data.features[0]);
// GeoJSON layer
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "blue",
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    L.geoJSON(data, {
        pointToLayer:function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        // create pop-ups
        onEachFeature: function onEachFeature(feature, layer) {
            layer.bindPopup(`
            <h3>${feature.properties.place}</h3>
            <hr>
            <p>${new Date(feature.properties.time)}</p>
            <h3>Magnitude: ${feature.properties.mag.toLocaleString()}</h3>
            <h3>Depth: ${feature.geometry.coordinates[2].toLocaleString()}</h3>
            `);
        }
    }).addTo(earthquakes);
     });

