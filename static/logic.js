// Creating the map object
var myMap = L.map("map", {
  center: [36.156470, -86.788350],
  zoom: 11
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Use this link to get the GeoJSON data.
var link = "data/map.geojson";
// The function that will determine the color of a NAME_x based on the borough that it belongs to
function chooseColor(poverty) {
  if (poverty == 0) return "black";
  else if (poverty < 2) return "blue";
  else if (poverty < 4) return "green";
  else if (poverty < 8) return "yellow";
  else if (poverty < 13) return "orange";
  else if (poverty < 20) return "red";
  else return "brown";
}

// Getting our GeoJSON data
d3.json(link).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data, {
    // Styling each feature (in this case, a NAME_x)
    style: function(feature) {
      return {
        color: "white",
        // Call the chooseColor() function to decide which color to color our NAME_x. (The color is based on the borough.)
        fillColor: chooseColor(feature.properties.Poverty),
        fillOpacity: 0.5,
        weight: 3
      };
    },
    // This is called on each feature.
    onEachFeature: function(feature, layer) {
      // Set the mouse events to change the map styling.
      layer.on({
        // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
        // When a feature (NAME_x) is clicked, it enlarges to fit the screen.
        click: function(event) {
          myMap.fitBounds(event.target.getBounds());
        }
      });
      // Giving each feature a popup with information that's relevant to it
      layer.bindPopup("<h1>" + "Census Tract: " + feature.properties.NAME_x + "</h1> <hr> <h2>" + "Poverty Rate: " + feature.properties.Poverty + "% " +
      "<br>" + "Households: " + feature.properties.Households.toLocaleString("en-US") + "<br>" + "Average Income: " + 
      feature.properties.Mean.toLocaleString("en-US") + "<br>" + "Food Desert: " + feature.properties.Desert + "</h2>");

    }
  }).addTo(myMap);
});
