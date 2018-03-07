import FakeSlider from "./fakeSlider";
import * as d3 from "d3";
import "../scss/zika.scss";
import { data } from "../constants/geojson.js";
import { mapOptions } from "../constants/mapSettings";
import { Map } from "./map";
import { Slider } from "./slider";
import { Chart } from "./chart";

//MAP BEHAVIOR
const map = new google.maps.Map(document.getElementById("map"), mapOptions);
const zikaMap = Map(map);
zikaMap.drawMap(data);
map.data.addListener("click", function(e) {
  // console.log(e.feature.getProperty("city") + " is listening to clicks too");
  fetchData(e.feature.getProperty("city"));
});

// SLIDER BEHAVIOR
Slider("slider", data.features[0].properties.risk.length);
document.querySelector("#pickDate").oninput = e => changeDate(e.target.value);

const formatDate = d3.timeFormat("%b %d, %Y");
function changeDate(idx) {
  // let idx = e.target.value;
  zikaMap.setWeek(idx);
  const selectedDay = new Date(data.features[0].properties.risk[idx].date);
  document.getElementById("selected-date").innerHTML = formatDate(selectedDay);
}

// DRAW GRAPH
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("height", 400)
  .attr("width", 700)
  .attr("class", "card");

const riskGraph = Chart(svg);

// const parsedate = d3.timeParse("%m/%d/%Y %H:%M");

// function fetchData(city) {
//   // d3.json(`http://maps.calsurv.org/zika/risk/${city}`, (error, data) => {
//   d3.json(__dirname + `./data/${city}.json`, (error, data) => {
//     if (error) console.log(error);
//     console.log(data);
//     drawGraph(data);
//   });
// }

// const fresnoRisk = data.features[0].properties.risk;
// console.log(fresnoRisk);
function fetchData(city) {
  // console.log(city);
  let riskObj;
  data.features.forEach(d => {
    if (d.properties.city === city) {
      riskObj = d.properties.risk;
    }
  });
  document.getElementById("currentCity").innerHTML = city;
  riskGraph.drawGraph(riskObj);
}

fetchData("Fresno");

// document
//   .getElementById("fresnoButton")
//   .addEventListener("click", () => fetchData("Fresno"));
// document
//   .getElementById("bakersfieldButton")
//   .addEventListener("click", () => fetchData("Bakersfield"));
// document
//   .getElementById("tulareButton")
//   .addEventListener("click", () => fetchData("Tulare"));

// const slider = FakeSlider("pickDate", "cityData");
