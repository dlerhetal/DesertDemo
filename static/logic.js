// Creating the Map object
var myMap = L.map("map", {
  center: [36.156470, -86.788350],
  zoom: 11
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetMap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetMap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Use this link to get the GeoJSON data.
var link = "data/map.geojson";
// The function that will determine the color of a NAME_x based on the borough that it belongs to
function chooseColor(Poverty) {
  if (Poverty == 0) return "#BFEFFF"; // Pale Blue
  else if (Poverty < 6) return "#66B3FF"; // Light Blue
  else if (Poverty < 11) return "#3366FF"; // Medium Blue
  else if (Poverty < 16) return "#0000CC"; // Dark Blue
  else if (Poverty < 21) return "#000099"; // Very Dark Blue
  else if (Poverty < 26) return "#000066"; // Super Dark Blue
  else return "#330066"; // Dark Purple
}

// Create a legend control
var legend = L.control({ position: 'bottomright' });
// Add legend to the Map
legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += '<h4 style="margin-bottom: 10px;">Poverty Rate <hr> &lt; $10K</h4>';
    var colors = ["#BFEFFF", "#66B3FF", "#3366FF", "#0000CC", "#000099", "#000066", "#330066"];
        labels = [];
    // Loop through colors and generate a label with the corresponding poverty rate range
    for (var i = 0; i < colors.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            chooseColorLabel(colors[i]) + '<br>';
    }
    // Add styling to the legend
    div.style.border = '2px solid #ccc';
    div.style.background = 'rgba(255, 255, 255, 0.8)';
    div.style.padding = '8px';
    return div;
};
// Add legend to the Map
legend.addTo(myMap);
// Function to get legend labels based on color
function chooseColorLabel(color) {
    // Extract the poverty rate range from the color function
    var povertyRange = getPovertyRange(color);
    return '<span style="color: ' + color + ';">' + povertyRange + '</span>';
}
// Function to get poverty rate range based on color
function getPovertyRange(color) {
  switch (color) {
      case "#BFEFFF":
          return "0%";
      case "#66B3FF":
          return "0% - 2%";
      case "#3366FF":
          return "2% - 4%";
      case "#0000CC":
          return "4% - 8%";
      case "#000099":
          return "8% - 13%";
      case "#000066":
          return "13% - 20%";
      case "#330066":
          return "20%+";
      default:
          return "";
  }
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
      // Set the mouse events to change the Map styling.
      layer.on({
        // When a user's mouse cursor touches a Map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a Map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
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
// Sample data (replace this with your actual data)
var locations;

fetch('data/grocery.json')
  .then(response => response.json())
  .then(grocery => {
    locations = grocery;
    console.log(locations); // Check the value of locations

// Add markers to the Map based on rating
locations.forEach(function (location) {

    var radius = 6; // Default radius

    // Adjust the radius based on the rating
    if (location.rating >= 4.5) {
      radius = 12;
    } else if (location.rating >= 4) {
      radius = 10;
    } else if (location.rating >= 3.5) {
      radius = 8;
    } else if (location.rating >= 3) {
      radius = 6;
    } else if (location.rating >= 2) {
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
      layers[location.rating] = L.layerGroup().addTo(myMap);
    }
  
    // Add the marker to the respective rating layer
    layers[location.rating].addLayer(marker);
  });
    // Call any functions or perform any operations that depend on the `locations` variable here
  })
  .catch(error => console.error(error));

function getColor(rating) {
  if (rating >= 4.5) {
    return 'red';
  } else if (rating >= 4) {
    return 'red';
  } else if (rating >= 3.5) {
    return 'red';
  } else if (rating >= 3) {
    return 'red';
  } else {
    return 'red';
  }
}

var layers = {};







// Create a custom control for the Map and satellite toggle
var MapToggleControl = L.control({ position: 'topright' });




// Add control to toggle Map and satellite views
// MapToggleControl.addTo(Map);

// Create layers control for rating layers
var ratingLayersControl = L.control.layers(null, layers, { collapsed: false }).addTo(myMap);
