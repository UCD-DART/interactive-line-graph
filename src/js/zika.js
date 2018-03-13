import axios from "axios";
import { timeFormat, select } from "d3";
import "../scss/zika.scss";
import { data } from "../constants/geojson.js";
import { mapOptions } from "../constants/mapSettings";
import { Map } from "./map";
import { Slider } from "./slider";
import { Chart } from "./chart";

let currentCity;
let week = 25;
let riskObj;

//MAP BEHAVIOR
const map = new google.maps.Map(document.getElementById("map"), mapOptions);
const zikaMap = Map(map);
zikaMap.drawMap(data);
map.data.addListener("click", function(e) {
  currentCity = e.feature.getProperty("city");
  fetchData(currentCity);
});

// SLIDER BEHAVIOR
// INIT FAKE DATA FIRST
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
const svg = select("#chart")
  .append("svg")
  .attr("height", 400)
  .attr("width", 600)
  .attr("class", "card");

let riskGraph;

function fetchData(city) {
  // console.log(city);
  data.features.forEach(d => {
    if (d.properties.city === city) {
      riskObj = d.properties.risk;
    }
  });
  document.getElementById("currentCity").innerHTML = city;
  riskGraph = Chart(svg, riskObj);
  riskGraph.drawGraph(riskObj);
  riskGraph.setBrush();
}

fetchData("Fresno");

// TODO: get a list of cities that actually have data
// let cities = [];

// axios
//   .get("http://maps.calsurv.org/zika/layer")
//   .then(res => {
//     // console.log(res.data);
//     let geojson = res.data;

//     return geojson.features.map(city => city.properties.city);
//   })
//   .then(res => {
//     let citiesWithData = [];
//     res.forEach(city => {
//       axios.get(`http://maps.calsurv.org/zika/risk/${city}`).then(res => {
//         if (res.data.length) {
//           console.log(city);
//           citiesWithData.push(city);
//         }
//         // if (res.data.length) citiesWithData.push(city);
//       });
//     });
//     return citiesWithData;
//   })
//   .then(res => console.log(res));

// console.log(cities);
