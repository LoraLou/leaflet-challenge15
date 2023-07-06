// check the links 
console.log("Map Check");
//base layer
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' +
    '<br> Data Analyst: Lora L <a href="https://github.com/LoraLou/leaflet-challenge">Github Repo</a>'
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
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"
// perform d3 to query URL
d3.json(queryUrl).then(function(data){
    console.log(data.features[0]);
    //marker size function
    function markerSize(magnitude){
        return magnitude * 4
    }
    // create marker color function
    function markerColor(depth) {
            return depth > 150 ? '#d73027' :
                   depth > 100  ? '#f46d43' :
                   depth > 50  ? '#fdae61' :
                   depth > 25  ? '#fee08b' :
                   depth > 10   ? '#d9ef8b' :
                   depth > 5   ? '#a6d96a' :
                   depth > 2   ? '#66bd63' :
                              '#1a9850';
        }
    // GeoJSON layer
    function styleInfo(feature) {
        return{
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
    }
    L.geoJSON(data, {
        pointToLayer:function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        // create circleMarker style
        style: styleInfo,
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
    //add legend 
    let legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 2, 5, 10, 25, 50, 100, 150],
            labels = [];
        //loop
        div.innerHTML += 'Depth (km) <br>'
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML += 
                '<i style="background:' + markerColor(grades[i] + 1) + '"></i>' +
                grades[i] + (grades[i+1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
    //info control
    let info = L.control();
    info.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = '<h4>USGS Live Earthquake Feed for the Past 7 Days</h4>' + 
            'Circle radius is a function of magnitude' +
            '<br>' +
            'Circle color is a function of depth';
    };
    info.addTo(myMap);
     });
