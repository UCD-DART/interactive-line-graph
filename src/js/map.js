import { mapOptions } from "../constants/mapSettings.js";
import { colors } from "./helpers";

export const Map = function(data) {
  let geoJson = data;
  let map = new google.maps.Map(document.getElementById("map"), mapOptions);
  let week = 2;

  const riskColor = function(feature) {
    let risk = feature.getProperty("risk");
    let color;
    let current = risk[week].risk;

    if (current > 2.0) {
      color = colors["dark-red"];
    } else if (current > 1.0) {
      color = colors["light-red"];
    } else if (current > 0.5) {
      color = colors["light-blue"];
    } else {
      color = colors["dark-blue"];
    }

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeColor: color
    };
  };

  const depthOf = function(object) {
    var level = 1;
    for (let key in object) {
      if (!object.hasOwnProperty(key)) continue;

      if (typeof object[key] == "object") {
        var depth = depthOf(object[key]) + 1;
        level = Math.max(depth, level);
      }
    }
    return level;
  };

  const _decodeCoordinates = function(coordinates) {
    if (typeof coordinates.point == "undefined") {
      if (coordinates.constructor == Array) {
        var container = [];
        for (let i in coordinates) {
          var g = _decodeCoordinates(coordinates[i]);
          container.push(g);
        }
        return container;
      }
    } else {
      var points = google.maps.geometry.encoding.decodePath(coordinates.point);
      var pointContainer = [];
      for (let point in points) {
        pointContainer.push([points[point].lng(), points[point].lat()]);
      }
      return pointContainer;
    }
  };

  const decodeGeometry = function(g) {
    const newCoordinates = _decodeCoordinates(g.coordinates);
    if (depthOf(newCoordinates) == 3) {
      g.type = "Polygon";
    } else {
      g.type = "MultiPolygon";
    }
    g.coordinates = newCoordinates;
    return g;
  };

  const setDay = function(num) {
    week = num;
    map.data.setStyle(riskColor);
  };

  const drawMap = function(geoJson) {
    console.log(geoJson);
    geoJson.features.forEach(feature => {
      let geo = feature.geometry;
      feature.geometry = decodeGeometry(geo);
    });
    map.data.addGeoJson(geoJson);
    map.data.setStyle(riskColor);
    // let msg = new google.maps.InfoWindow();
    map.data.addListener("click", function(e) {
      // going to have to find a way to manipulate another module,
      // may have to draw the map in zika.js then just use map.js to handle geometry out and provide styling.
      // when using redux, this could then just update the current city variable, trigger render for chart and details

      console.log(e.feature.getProperty("city"));
    });
  };

  return {
    drawMap: drawMap,
    setDay: setDay
  };
};
