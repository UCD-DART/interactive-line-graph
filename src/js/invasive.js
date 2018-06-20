import "../scss/zika.scss";
import { mapOptions, invasiveMapOptions } from "../constants/mapSettings";
import * as data from "../constants/invasiveGeo";
import {
  clovisData,
  delanoData,
  sdAegypti,
  sdAlbopictus,
  bakersfieldData,
  fresnoData
} from "../constants/clovisInvasive";
import { colors } from "./helpers";
import { Map } from "./map";
import { InvasiveGraph } from "./invasiveChart";
import axios from "axios";
import * as geojson from "../constants/invasiveData.json";

console.log(geojson);
console.log(data);

const map = new google.maps.Map(
  document.getElementById("map"),
  invasiveMapOptions
);

// console.log(data);

//set up some state variables
let city = "Clovis";
let species = "aegypti";

const invasiveMap = Map(map);
invasiveMap.drawInvasiveMap(data);
map.data.addListener("click", function(e) {
  showCityDetails(e.feature.f);
  const f = e.feature.f;
  const url = `https://maps.calsurv.org/invasive/data/${f.agency}/${
    f.city
  }/${species}`;
  // console.log(url);

  let cityData;

  fetch("https://maps.calsurv.org/invasive/data/Tulare%20MAD/Tulare/aegypti", {
    credentials: "include",
    headers: {},
    referrer: "https://maps.calsurv.org/invasive",
    referrerPolicy: "no-referrer-when-downgrade",
    body: null,
    method: "GET",
    mode: "cors"
  })
    .then(res => {
      return res.json();
    })
    .then(myJson => console.log(myJson));

  switch (f.city) {
    case "Fresno":
      invasiveGraph = InvasiveGraph(fresnoData);
      break;
    case "Delano":
      invasiveGraph = InvasiveGraph(delanoData);
      break;
    case "Clovis":
      invasiveGraph = InvasiveGraph(clovisData);
      break;
    case "San Diego":
      let sdData = species === "aegypti" ? sdAegypti : sdAlbopictus;
      invasiveGraph = InvasiveGraph(sdData);
      break;
    case "Bakersfield":
      invasiveGraph = InvasiveGraph(bakersfieldData);
      break;
    default:
      axios
        .get(url)
        .then(res => {
          console.log(res.data);
          cityData = res.data;
          invasiveGraph = InvasiveGraph(cityData);
        })
        .catch(err => console.log(err));
  }
});

// const tokenStr = "51b6a36d08509e71b9f8f3a4ddd9f0d8f0684cad";

let selectors = document.getElementsByClassName("selector__mosquito--toggle");

for (let i = 0; i < selectors.length; i++) {
  let el = selectors[i];
  el.addEventListener("click", function() {
    //remove active classes from other elements, add active class to clicked, change mosquito styling for map
    if (!el.classList.contains("active")) {
      for (let j = 0; j < selectors.length; j++) {
        selectors[j].classList.remove("active");
      }
      el.classList.add("active");
      changeMosquito(el.id);
    }
  });
}

function changeMosquito(mosquito) {
  if (mosquito === "aegypti") {
    invasiveMap.showAegypti();
    species = "aegypti";
  } else if (mosquito === "albopictus") {
    invasiveMap.showAlbopictus();
    species = "albopictus";
  } else if (mosquito === "notoscriptus") {
    invasiveMap.showNotoscriptus();
    species = "notoscriptus";
  }
}

function showCityDetails(props) {
  document.getElementById("cityName").innerHTML = props.city;
  document.getElementById("aegypti_detections").innerHTML =
    props.aegypti_detections;
  document.getElementById("albopictus_detections").innerHTML =
    props.albopictus_detections;
  document.getElementById("aegypti_first_found").innerHTML =
    props.aegypti_first_found || "N/A";
  document.getElementById("aegypti_last_found").innerHTML =
    props.aegypti_last_found || "N/A";
  document.getElementById("albopictus_first_found").innerHTML =
    props.albopictus_first_found || "N/A";
  document.getElementById("albopictus_last_found").innerHTML =
    props.albopictus_last_found || "N/A";
  document.getElementById("agency").innerHTML = props.agency;
  document.getElementById("website").innerHTML = props.website
    ? `<a href=${props.website}>${props.website}</a>`
    : "No page available";
}

//DRAW THE CHART
let invasiveGraph;
function calculateWidth() {
  return document.getElementById("chart--invasive").clientWidth;
}
// let width = document.getElementById("chart--invasive").clientWidth;
invasiveGraph = InvasiveGraph(clovisData, species);
