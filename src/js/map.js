import { invasiveMapOptions } from '../constants/mapSettings.js';
import { colors, labelZikaRisk } from './helpers';

export const Map = function(mapObj) {
  // let geoJson = data;
  let map = mapObj;
  let currentCity = 'Fresno';
  let week = 25; // just a random number picked to stylet he map
  let date = new Date('2018-06-01');
  let startDate = new Date('01-01-2011');
  let endDate = new Date('11-01-2018');
  let geojson;
  let species = 'aegypti';

  const riskColor = feature => {
    let risk = feature.getProperty('risk');
    let currentRisk = risk[week].risk;
    let color = labelZikaRisk(currentRisk);

    if (currentCity === feature.getProperty('city')) {
      return {
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#000000',
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

  // const invasiveColor = feature => {
  //   let detected = [];
  //   let albos = feature.getProperty("albopictus_detections");
  //   let aegypti = feature.getProperty("aegypti_detections");
  //   let color;

  //   if (albos && aegypti) {
  //     color = colors["orange"];
  //   } else if (aegypti) {
  //     color = colors["blue"];
  //   } else if (albos) {
  //     color = colors["red"];
  //   } else color = colors["green"];

  //   return {
  //     fillColor: color,
  //     fillOpacity: 0.5,
  //     strokeWeight: 2,
  //     strokeColor: color,
  //     zindex: 0
  //   };
  // };

  const changeDate = newDate => {
    date = new Date(newDate);
  };

  const changeDates = (newStart, newEnd, species) => {
    startDate = newStart;
    endDate = newEnd;
    // console.log(startDate, endDate);
    // let surviellance = false;
    // let target = false;
    // let idx = 0;

    // let data = feature.getProperty("data");
    // let aegypti = data.aegypti;

    // for (let i=0; i< aegypti.length; i++) {
    //   if (startDate < aegypti[i].date) {
    //     continue;
    //   } else {

    //   }
    // }
  };

  const aegyptiStyle = feature => {
    let aegyptiStart = new Date(feature.getProperty('aegypti_first_found'));
    let aegyptiLast = new Date(feature.getProperty('aegypti_last_found'));
    let surviellance = new Date(feature.getProperty('surveillance_start'));
    // let data = feature.getProperty("data");
    // let inRange;
    let color = colors['gray'];

    if (
      startDate < aegyptiStart &&
      endDate > aegyptiLast &&
      startDate < aegyptiLast &&
      endDate > aegyptiStart
    ) {
      color = colors['red'];
    } else if (endDate > surviellance) {
      color = colors['green'];
    }

    if (feature.getProperty('city') === currentCity) {
      return {
        fillColor: color,
        fillOpacity: 0.5,
        strokeWeight: 2,
        strokeColor: 'black',
        zindex: 0
      };
    } else {
      return {
        fillColor: color,
        fillOpacity: 0.5,
        strokeWeight: 0.5,
        strokeColor: color,
        zindex: 0
      };
    }

    // let firstDetected =
    //   new Date(feature.getProperty("aegypti_first_found")) || false;
    // let survillanceStarted = new Date(
    //   feature.getProperty("surveillance_start")
    // );

    // // let data = feature.getProperty("data");
    // // let aegypti = data.aegypti;
    // // if (!aegypti.length) {
    // //   color = colors["gray"];
    // // } else {
    // //   color = colors["green"];
    // // }

    // if (firstDetected < date) {
    //   color = colors["red"];
    // } else if (survillanceStarted < date) {
    //   color = colors["green"];
    // } else color = colors["gray"];
    // return styling;
    // return {
    //   fillColor: color,
    //   fillOpacity: 0.5,
    //   strokeWeight: 0.5,
    //   strokeColor: color,
    //   zindex: 0
    // };
  };

  const albopictusStyle = feature => {
    // let firstDetected =
    //   new Date(feature.getProperty("albopictus_first_found")) || false;
    // let surviellanceStarted = new Date(
    //   feature.getProperty("surveillance_start")
    // );
    // let color;

    // if (firstDetected && firstDetected < date) {
    //   color = colors["blue"];
    // } else if (surviellanceStarted < date) {
    //   color = colors["green"];
    // } else color = colors["gray"];

    let alboStart = new Date(feature.getProperty('albopictus_first_found'));
    let alboLast = new Date(feature.getProperty('albopictus_last_found'));
    let surviellance = new Date(feature.getProperty('surveillance_start'));
    // let data = feature.getProperty("data");
    // let inRange;
    let color = colors['gray'];

    if (
      startDate < alboStart &&
      endDate > alboLast &&
      startDate < alboLast &&
      endDate > alboStart
    ) {
      color = colors['blue'];
    } else if (endDate > surviellance) {
      color = colors['green'];
    }

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 0.5,
      strokeColor: color,
      zindex: 0
    };
  };

  const notoscriptusStyle = feature => {
    // let firstDetected =
    //   new Date(feature.getProperty("notoscriptus_first_found")) || false;
    // let surviellanceStarted = new Date(
    //   feature.getProperty("surveillance_start")
    // );
    // let color;

    // if (firstDetected && firstDetected < date) {
    //   color = colors["yellow"];
    // } else if (surviellanceStarted < date) {
    //   color = colors["green"];
    // } else color = colors["gray"];

    let notoStart = new Date(feature.getProperty('notoscriptus_first_found'));
    let notoLast = new Date(feature.getProperty('notoscriptus_last_found'));
    let surviellance = new Date(feature.getProperty('surveillance_start'));
    // let data = feature.getProperty("data");
    // let inRange;
    let color = colors['gray'];

    if (
      startDate < notoStart &&
      endDate > notoLast &&
      startDate < notoLast &&
      endDate > notoStart
    ) {
      color = colors['yellow'];
    } else if (endDate > surviellance) {
      color = colors['green'];
    }

    return {
      fillColor: color,
      fillOpacity: 0.5,
      strokeWeight: 0.5,
      strokeColor: color,
      zindex: 0
    };
  };

  const showAegypti = () => {
    // console.log("showing aegypti between " + startDate + " and " + endDate);
    map.data.setStyle(aegyptiStyle);
  };

  const showAlbopictus = () => {
    map.data.setStyle(albopictusStyle);
  };

  const showNotoscriptus = () => {
    map.data.setStyle(notoscriptusStyle);
  };

  const setInvasiveCity = function(newCity, species) {
    currentCity = newCity;
    console.log(currentCity);
    if (species === 'aegypti') {
      map.data.setStyle(aegyptiStyle);
    } else if (species === 'albopictus') {
      map.data.setStyle(albopictusStyle);
    } else if (species === 'notoscriptus') {
      map.data.setStyle(notoscriptusStyle);
    } else {
      console.error('species styling not available for ' + species);
    }
  };

  const setCity = function(city) {
    currentCity = city;
    map.data.setStyle(riskColor);
  };

  const depthOf = function(object) {
    let level = 1;
    for (let key in object) {
      if (!object.hasOwnProperty(key)) continue;

      if (typeof object[key] == 'object') {
        let depth = depthOf(object[key]) + 1;
        level = Math.max(depth, level);
      }
    }
    return level;
  };

  // <input id="map-search" type="text" placeholder="Search for your city">

  const initAutocomplete = () => {
    // let input = document.createElement('input');
    // input.setAttribute('id', 'map-search');
    // input.setAttribute('type', 'text');
    // input.setAttribute('placeholder', "search for your city");
    // document.getElementByClassName

    const input = document.getElementById('map-search');
    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);

    //bias the search box
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    let markers = [];
    searchBox.addListener('places_changed', function() {
      const places = searchBox.getPlaces();
      if (places.length === 0) return;

      //clear out old marker(s)
      markers.forEach(marker => marker.setMap(null));
      markers = [];

      //get icon name and location for place
      const bounds = new google.maps.LatLngBounds();
      places.forEach(place => {
        if (!place.geometry) {
          console.log(`${place} has no geometry`);
          return;
        }

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  };

  const _decodeCoordinates = function(coordinates) {
    if (typeof coordinates.point == 'undefined') {
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
      g.type = 'Polygon';
    } else {
      g.type = 'MultiPolygon';
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
    geojson = geoJson;
    geoJson.features.forEach(feature => {
      let geo = feature.geometry;
      feature.geometry = decodeGeometry(geo);
    });
    map.data.addGeoJson(geoJson);
    map.data.setStyle(showAegypti);
    initAutocomplete();
  };

  return {
    drawMap: drawMap,
    setWeek: setWeek,
    setCity: setCity,
    setInvasiveCity: setInvasiveCity,
    drawInvasiveMap: drawInvasiveMap,
    showAegypti: showAegypti,
    showAlbopictus: showAlbopictus,
    showNotoscriptus: showNotoscriptus,
    changeDate: changeDate,
    changeDates: changeDates
  };
};
