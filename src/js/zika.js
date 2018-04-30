import "../scss/zika.scss";
import axios from "axios";
import { timeFormat } from "d3-time-format";
import { select } from "d3-selection";
import { mapOptions } from "../constants/mapSettings";
import { Map } from "./map";
import { Slider } from "./slider";
import { Chart } from "./chart";
import * as data from "./risk2.json";
import { colors, labelZikaRisk } from "./helpers";

let currentCity = "Fresno";
let cityId = 13832;
let week = 28;
let riskObj = {};
let cityDetails = [];

// MAP BEHAVIOR
const map = new google.maps.Map(document.getElementById("map"), mapOptions);
const zikaMap = Map(map);
zikaMap.drawMap(data);
map.data.addListener("click", function(e) {
  //set the current city on the map and for the chart to render out the risk values for
  currentCity = e.feature.getProperty("city");
  zikaMap.setCity(currentCity);
  setCity(currentCity);

  // grab the city ids so that an AJAX request can be made for those city details
  cityId = e.feature.getId();
  getCityDetails(cityId);
});

// SLIDER BEHAVIOR
// INIT FAKE DATA FIRST -- all of this should actually be a axios req
function getCityDetails(id) {
  axios.get(`http://mathew.calsurv.org/api/zika/${id}`).then(res => {
    cityDetails = res.data;
    changeDetails(week);
  });
}

function changeDetails(week) {
  let data = cityDetails[week];
  document.querySelector("#minTemp").innerHTML = data.tmin.toFixed(0);
  document.querySelector("#maxTemp").innerHTML = data.tmax.toFixed(0);
  document.querySelector("#mosqValue").innerHTML = data.mosqPerPerson.toFixed(
    1
  );
  document.querySelector("#bitesValue").innerHTML = data.bites.toFixed(1);
  document.querySelector("#survivalValue").innerHTML = data.survival.toFixed(0);
  document.querySelector(
    "#incubationValue"
  ).innerHTML = data.incubationPeriod.toFixed(1);

  //risk value is dynamically styled depending on its value
  const riskValue = data.risk.toFixed(2);
  const riskElement = document.getElementById("riskValue");
  riskElement.innerHTML = riskValue;
  riskElement.style.color = labelZikaRisk(riskValue);
}

// ALL SLIDER BEHAVIOR
Slider("slider", data.features[0].properties.risk.length);
document.querySelector("#pickDate").oninput = e => changeDate(e.target.value);

const formatDate = timeFormat("%b %d, %Y");
function changeDate(idx) {
  week = idx;
  zikaMap.setWeek(week);
  const selectedDay = new Date(data.features[0].properties.risk[week].date);
  document.getElementById("selected-date").innerHTML =
    "Week of " + formatDate(selectedDay);
  let riskValue = riskObj[week].risk === 0 ? "<0.001" : riskObj[week].risk;
  // document.getElementById("riskValue").innerHTML = riskValue;
  riskGraph.moveLine(selectedDay);
  riskGraph.drawCircles(riskObj, week);
  changeDetails(idx, cityDetails);
}

// DRAW GRAPH

let width = document.getElementById("chart").clientWidth;

window.addEventListener("resize", function() {
  document.getElementById("chart").innerHTML = "";
  width = document.querySelector("#chart").clientWidth;
  riskGraph = Chart("chart", riskObj, width, riskObj[week].date);
  riskGraph.drawGraph();
});
let riskGraph;

function setCity(city) {
  // Go through our static data, set current risk Object to the matching city
  data.features.forEach(d => {
    if (d.properties.city === city) {
      riskObj = d.properties.risk;
      return;
    }
  });

  //to animate city name, need to remove old node, insert new node
  const oldCity = document.getElementById("currentCity");
  let newCity = oldCity.cloneNode(true);
  newCity.innerHTML = city;
  oldCity.parentNode.replaceChild(newCity, oldCity);

  // create a date object based on where we are currently at on the brush and re-render the Chart with the brush in an appropriate place
  const markerDate = new Date(riskObj[week].date);
  riskGraph = Chart("chart", riskObj, width, markerDate);
  riskGraph.drawGraph();
  getCityDetails(cityId);
}

setCity(currentCity);
