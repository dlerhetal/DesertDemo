// Creating the map object
var Map = L.map("map", {
  center: [36.156470, -86.788350],
  zoom: 11
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(Map);

// Use this link to get the GeoJSON data.
var link = "data/map.geojson";
// The function that will determine the color of a NAME_x based on the borough that it belongs to
function chooseColor(poverty) {
  if (poverty == 0) return "Wheat";
  else if (poverty < 2) return "Goldenrod";
  else if (poverty < 4) return "Peru";
  else if (poverty < 8) return "Chocolate";
  else if (poverty < 13) return "orange";
  else if (poverty < 20) return "SaddleBrown";
  else return "Maroon";
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
          Map.fitBounds(event.target.getBounds());
        }
      });
      // Giving each feature a popup with information that's relevant to it
      layer.bindPopup("<h1>" + "Census Tract: " + feature.properties.NAME_x + "</h1> <hr> <h2>" + "Poverty Rate: " + feature.properties.Poverty + "% " +
      "<br>" + "Households: " + feature.properties.Households.toLocaleString("en-US") + "<br>" + "Average Income: " + 
      feature.properties.Mean.toLocaleString("en-US") + "<br>" + "Food Desert: " + feature.properties.Desert + "</h2>");

    }
  }).addTo(Map);
});
// Sample data (replace this with your actual data)
var locations;

fetch('data/grocery.json')
  .then(response => response.json())
  .then(grocery => {
    locations = grocery;
    console.log(locations); // Check the value of locations

// Add markers to the map based on rating
locations.forEach(function (location) {

    var radius = 6; // Default radius

    // Adjust the radius based on the rating
    if (location.rating >= 4.5) {
      radius = 10;
    } else if (location.rating >= 4) {
      radius = 8;
    } else if (location.rating >= 3.5) {
      radius = 6;
    } else if (location.rating >= 3) {
      radius = 4;
    } else {
      radius = 2;
    }

    var marker = L.circleMarker([location.latitude, location.longitude], {
      radius: radius, // Adjust the radius here
      fillColor: getColor(location.rating),
      color: 'white',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  
    // Create a popup for each marker
    var popupContent = `<b>${location.name}</b><br>Address: ${location.address}<br>Rating: ${location.rating}`;
    marker.bindPopup(popupContent);
  
    // Check if the layer exists, if not, create one
    if (!layers[location.rating]) {
      layers[location.rating] = L.layerGroup().addTo(Map);
    }
  
    // Add the marker to the respective rating layer
    layers[location.rating].addLayer(marker);
  });
    // Call any functions or perform any operations that depend on the `locations` variable here
  })
  .catch(error => console.error(error));

function getColor(rating) {
  if (rating >= 4.5) {
    return 'green';
  } else if (rating >= 4) {
    return 'lime';
  } else if (rating >= 3.5) {
    return 'yellow';
  } else if (rating >= 3) {
    return 'orange';
  } else {
    return 'red';
  }
}

var layers = {};

// Create a custom control for the map and satellite toggle
var mapToggleControl = L.control({ position: 'topright' });

// Add control to toggle map and satellite views
// mapToggleControl.addTo(Map);

// Create layers control for rating layers
var ratingLayersControl = L.control.layers(null, layers, { collapsed: false }).addTo(Map);
