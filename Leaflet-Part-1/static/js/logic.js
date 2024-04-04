let myMap;

// API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Performing a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

// Function to create the features of the map visual based on preset conditions
function createFeatures(earthquakeData) {
  // Saving the earthquake data in a variable.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 2, 
        fillColor: getColor(feature.geometry.coordinates[2]),
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: function (feature, layer) {
    layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</br></h4><hr><p>Time: ${Date(feature.properties.time)}</p><hr><p>Location: ${feature.properties.place}</p>`);
    }
  })
  // Passing the earthquake data to a createMap() function.
  createMap(earthquakes);
};
  
// getColor Function sets the color of the circular maker based on the depth of the quake
function getColor(d){
  return d > 90 ? '#800026' :
           d > 70  ? '#BD0026' :
           d > 50  ? '#E31A1C' :
           d > 30  ? '#FC4E2A' :
           d > 10   ? '#FD8D3C' :
           d > -10   ? '#FEB24C' :
                       '#FED976';
};


function createMap(earthquakes) {
  // Creating the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // BaseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };
  
  // Overlays object.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Creating a new map.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [street, earthquakes],
  });

// Layer control that contains the baseMaps and overlays.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Creating a legend control
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function (myMap) {

    const div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Depth Ranges of Quake</strong>'],
    categories = [-10, 10, 30, 50, 70, 90];
    
    for (var i = 0; i < categories.length; i++) {
  
          div.innerHTML += 
          labels.push(
                      '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' + categories[i] +
          (categories[i + 1] ? '&ndash;' + categories[i + 1] + '<br>' : '+'));
      }
      div.innerHTML = labels.join('<br>');
  return div;
  };

      legend.addTo(myMap);
}