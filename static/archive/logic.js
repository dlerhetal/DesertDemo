// Create the map object
var myMap = L.map("map").setView([36.1627, -86.7816], 12);

// Add the tile layer to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(myMap);

// Load the GeoJSON data
d3.json("map.geojson").then(function (data) {
  // Create a GeoJSON layer and add it to the map
  L.geoJSON(data, {
    style: function (feature) {
      return {
        color: "blue",
        fillOpacity: 0.5,
      };
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup("<h3>Neighborhood: " + feature.properties.neighborhood + "</h3>");
    },
  }).addTo(myMap);
});