import axios from "axios";
import { mapOptions } from "../constants/mapSettings.js";
import { data } from "../constants/geojson.js";
import { consoleStyling } from "../constants/consoleStyling.js";

// console.log(data);

export let day = "day1";
export let city = "Fresno";

export function riskColor(feature) {
  let risk = feature.getProperty("risk");
  let color;
  if (risk[day] > 1.0) {
    color = "red";
  } else {
    color = "blue";
  }
  return {
    fillColor: color,
    fillOpacity: 0.6,
    strokeWeight: 2,
    strokeColor: "black"
  };
}

export function depthOf(object) {
  var level = 1;
  for (let key in object) {
    if (!object.hasOwnProperty(key)) continue;

    if (typeof object[key] == "object") {
      var depth = depthOf(object[key]) + 1;
      level = Math.max(depth, level);
    }
  }
  return level;
}

export function _decodeCoordinates(coordinates) {
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
}

export function decodeGeometry(g) {
  const newCoordinates = _decodeCoordinates(g.coordinates);
  if (depthOf(newCoordinates) == 3) {
    g.type = "Polygon";
  } else {
    g.type = "MultiPolygon";
  }
  g.coordinates = newCoordinates;
  return g;
}

export function drawMap() {
  let map = new google.maps.Map(document.getElementById("map"), mapOptions);
  let validGeo;

  function setDay(date) {
    day = date;
    map.data.setStyle(riskColor);
  }

  data.features.forEach(feature => {
    let geo = feature.geometry;
    feature.geometry = decodeGeometry(geo);
    // console.log(feature);
    // feature.geometry = google.maps.geometry.encoding.decodePath(geo);
  });

  map.data.addGeoJson(data);
  map.data.setStyle(riskColor);

  // document
  //   .querySelector("#day1")
  //   .addEventListener("click", () => setDay("day1"));
  // document
  //   .querySelector("#day2")
  //   .addEventListener("click", () => setDay("day2"));
  // document
  //   .querySelector("#day3")
  //   .addEventListener("click", () => setDay("day3"));

  document.querySelector("#mapSlider").oninput = function() {
    day = "day" + this.value;
    setDay(day);
  };
}
