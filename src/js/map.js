import { invasiveMapOptions } from "../constants/mapSettings.js";
import { colors, labelZikaRisk } from "./helpers";

export const Map = function(mapObj) {
  // let geoJson = data;
  let map = mapObj;
  let currentCity = "Fresno";
  let week = 25; // just a random number picked to stylet he map

  const riskColor = feature => {
    let risk = feature.getProperty("risk");
    let currentRisk = risk[week].risk;
    let color = labelZikaRisk(currentRisk);

    if (currentCity === feature.getProperty("city")) {
      return {
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: "#000000",
        zindex: 10
      };
    }

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeColor: color,
      zindex: 0
    };
  };

  const invasiveColor = feature => {
    let detected = [];
    let albos = feature.getProperty("albopictus_detections");
    let aegypti = feature.getProperty("aegypti_detections");
    let color;

    if (albos && aegypti) {
      color = colors["orange"];
    } else if (aegypti) {
      color = colors["blue"];
    } else if (albos) {
      color = colors["red"];
    } else color = colors["green"];

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeColor: color,
      zindex: 0
    };
  };

  const aegyptiStyle = feature => {
    let detected = [];
    let aegeypti = feature.getProperty("aegypti_detections");
    let survielance = feature.getProperty("surveillance_start");
    let color;

    if (aegeypti) {
      color = colors["red"];
    } else if (survielance) {
      color = colors["green"];
    } else color = colors["gray"];

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeColor: color,
      zindex: 0
    };
  };

  const albopictusStyle = feature => {
    let albos = feature.getProperty("albopictus_detections");
    let survielance = feature.getProperty("surveillance_start");
    let color;

    if (albos) {
      color = colors["blue"];
    } else if (survielance) {
      color = colors["green"];
    } else color = colors["gray"];

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeColor: color,
      zindex: 0
    };
  };

  const notoscriptusStyle = feature => {
    let albos = feature.getProperty("albopictus_detections");
    let aegypti = feature.getProperty("aegypti_detections");
    let survielance = feature.getProperty("surveillance_start");
    let color;

    if (albos && aegypti) {
      color = colors["orange"];
    } else if (survielance) {
      color = colors["green"];
    } else color = colors["gray"];

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 2,
      strokeColor: color,
      zindex: 0
    };
  };

  const showAegypti = () => {
    map.data.setStyle(aegyptiStyle);
  };

  const showAlbopictus = () => {
    map.data.setStyle(albopictusStyle);
  };

  const showNotoscriptus = () => {
    map.data.setStyle(notoscriptusStyle);
  };

  const setCity = function(city) {
    currentCity = city;
    map.data.setStyle(riskColor);
  };

  const depthOf = function(object) {
    let level = 1;
    for (let key in object) {
      if (!object.hasOwnProperty(key)) continue;

      if (typeof object[key] == "object") {
        let depth = depthOf(object[key]) + 1;
        level = Math.max(depth, level);
      }
    }
    return level;
  };

  const _decodeCoordinates = function(coordinates) {
    if (typeof coordinates.point == "undefined") {
      if (coordinates.constructor == Array) {
        let container = [];
        for (let i in coordinates) {
          let g = _decodeCoordinates(coordinates[i]);
          container.push(g);
        }
        return container;
      }
    } else {
      let points = google.maps.geometry.encoding.decodePath(coordinates.point);
      let pointContainer = [];
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
    geoJson.features.forEach(feature => {
      let geo = feature.geometry;
      feature.geometry = decodeGeometry(geo);
    });
    map.data.addGeoJson(geoJson);
    map.data.setStyle(riskColor);
  };

  const drawInvasiveMap = function(geoJson) {
    geoJson.features.forEach(feature => {
      let geo = feature.geometry;
      feature.geometry = decodeGeometry(geo);
    });
    map.data.addGeoJson(geoJson);
    map.data.setStyle(showAegypti);
  };

  return {
    drawMap: drawMap,
    setWeek: setWeek,
    setCity: setCity,
    drawInvasiveMap: drawInvasiveMap,
    showAegypti: showAegypti,
    showAlbopictus: showAlbopictus,
    showNotoscriptus: showNotoscriptus
  };
};
