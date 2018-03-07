import { mapOptions } from "../constants/mapSettings.js";
import { colors } from "./helpers";

export const Map = function(mapObj) {
  // let geoJson = data;
  let map = mapObj;
  let week = 25; // just a random number picked to stylet he map

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

  const setWeek = function(num) {
    week = num;
    map.data.setStyle(riskColor);
  };

  const drawMap = function(geoJson) {
    // console.log(geoJson);
    geoJson.features.forEach(feature => {
      let geo = feature.geometry;
      feature.geometry = decodeGeometry(geo);
    });
    map.data.addGeoJson(geoJson);
    map.data.setStyle(riskColor);
  };

  return {
    drawMap: drawMap,
    setWeek: setWeek
  };
};
