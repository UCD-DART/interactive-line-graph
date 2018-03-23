import "../scss/zika.scss";
import { timeFormat, select } from "d3";
import { mapOptions } from "../constants/mapSettings";
import { Map } from "./map";
import { Slider } from "./slider";
import { Chart } from "./chart";
import * as data from "./risk.json";

let currentCity;
let week = 22;
let riskObj;

// MAP BEHAVIOR
const map = new google.maps.Map(document.getElementById("map"), mapOptions);
const zikaMap = Map(map);
zikaMap.drawMap(data);
map.data.addListener("click", function(e) {
  currentCity = e.feature.getProperty("city");
  zikaMap.setCity(currentCity);
  setCity(currentCity);
});

// SLIDER BEHAVIOR
// INIT FAKE DATA FIRST -- all of this should actually be a axios req
let fakeData = [];
for (let i = 0; i < 111; i++) {
  let obj = {};

  obj["tempMin"] = +(Math.random() * 20).toFixed(0);
  obj["tempMax"] = +(Math.random() * 20 + obj["tempMin"]).toFixed(0);
  obj["bites"] = +(Math.random() * 50).toFixed(1);
  obj["survival"] = +(Math.random() * 50 + 25).toFixed(0);
  obj["mosqPer"] = +(Math.random() * 7 + 1).toFixed(1);
  obj["days"] = +(Math.random() * 7 + 1).toFixed(2);
  obj["incubation"] = +(Math.random() * 40 + 100).toFixed(1);

  fakeData.push(obj);
}

function changeData(i) {
  let data = fakeData[i];
  document.querySelector("#minTemp").innerHTML = data.tempMin;
  document.querySelector("#maxTemp").innerHTML = data.tempMax;
  document.querySelector("#mosqValue").innerHTML = data.mosqPer;
  document.querySelector("#bitesValue").innerHTML = data.bites;
  document.querySelector("#survivalValue").innerHTML = data.survival;
  document.querySelector("#incubationValue").innerHTML = data.incubation;
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
  document.getElementById("riskValue").innerHTML = riskValue;
  riskGraph.moveLine(selectedDay);
  riskGraph.drawCircles(riskObj, week);
  changeData(idx);
}

// DRAW GRAPH

let width = document.getElementById("chart").clientWidth;

window.addEventListener("resize", function() {
  document.getElementById("chart").innerHTML = "";
  width = document.querySelector("#chart").clientWidth;
  riskGraph = Chart("chart", riskObj, width);
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
  riskGraph = Chart("chart", riskObj, width);
  riskGraph.drawGraph();
}

setCity("Fresno");
