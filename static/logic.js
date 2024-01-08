
var streetmap = 
L.tileLayer('https://{s}.tile.openstreetMap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetMap.org/copyright">OpenStreetMap</a> contributors'
})

var layers = {};
var censusTractsLayer = new L.layerGroup();
var foodDesertsLayer = new L.layerGroup();
var groceryStoresLayer = new L.layerGroup();

var overlays = {
  "Census Tracts": censusTractsLayer,
  "Food Deserts": foodDesertsLayer,
  "Grocery Stores": groceryStoresLayer
};

var myMap = L.map("map", {
  center: [36.156470, -86.788350],
  zoom: 11,
  layers: [streetmap, censusTractsLayer, foodDesertsLayer, groceryStoresLayer]
});

streetmap.addTo(myMap);

L.control.layers(null, overlays, {collapsed: false}).addTo(myMap);

//CENSUS TRACTS
var link = "data/map.geojson";

function chooseColor(Poverty) {
  if (Poverty == 0) return "#BFEFFF"; 
  else if (Poverty < 6) return "#66B3FF"; 
  else if (Poverty < 11) return "#3366FF"; 
  else if (Poverty < 16) return "#0000CC"; 
  else if (Poverty < 21) return "#000099"; 
  else if (Poverty < 26) return "#000066"; 
  else return "#330066"; 
}
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend');
    div.style.background = 'rgba(211,211,211,0.9)';
    div.innerHTML += '<h4 style="margin-bottom: 14px; font-weight: bold;">Poverty Rate <hr> &lt; $10K</h4>';
    var colors = ["#BFEFFF", "#66B3FF", "#3366FF", "#0000CC", "#000099", "#000066", "#330066"];
    labels = [];
    for (var i = 0; i < colors.length; i++) {
      div.innerHTML +=
      '<i class="legend-icon" style="background:' + colors[i] + '"></i> ' +
      '<span style="font-weight: bold; color: black;">' + chooseColorLabel(colors[i]) + '</span><br>';
}
    div.style.border = '7px solid blue';
    div.style.padding = '8px';
    div.style.fontSize = '16px';
    return div;
};
legend.addTo(myMap);
function chooseColorLabel(color) {
    // Extract the poverty rate range from the color function
    var povertyRange = getPovertyRange(color);
    return '<span style="color: ' + color + ';">' + povertyRange + '</span>';
}

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

d3.json(link).then(function(data) {
  L.geoJson(data, {
    style: function(feature) {
      return {
        color: "white",
        fillColor: chooseColor(feature.properties.Poverty),
        fillOpacity: 0.5,
        weight: 3
      };
    },
    onEachFeature: function(feature, layer) {
      layer.on({
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
      });

      layer.bindPopup("<h1>" + "Census Tract: " + feature.properties.NAME_x + "</h1> <hr> <h2>" + "Poverty Rate: " + feature.properties.Poverty + "% " +
      "<br>" + "Households: " + feature.properties.Households.toLocaleString("en-US") + "<br>" + "Average Income: " + 
      feature.properties.Mean.toLocaleString("en-US") + "<br>" + "Food Desert: " + feature.properties.Desert + "</h2>");

    }
  }).addTo(myMap);
});

//GROCERY STORES
fetch('data/grocery.json')
  .then(response => response.json())
  .then(grocery => {
    locations = grocery;
locations.forEach(function (location) {

    var radius = 6; 
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
      radius: radius, 
      fillColor: 'red',
      color: 'white',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });

      var popupContent = `<b>${location.name}</b><br>Address: ${location.address}<br>Rating: ${location.rating}`;
    marker.bindPopup(popupContent);
  
    if (!layers[location.rating]) {
      layers[location.rating] = L.layerGroup().addTo(myMap);
    }
  
    layers[location.rating].addLayer(marker);
  });
  })
  console.log(Date.now())
