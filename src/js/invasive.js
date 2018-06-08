import "../scss/zika.scss";
import { mapOptions, invasiveMapOptions } from "../constants/mapSettings";
import * as data from "../constants/invasiveGeo";
import {
  clovisData,
  delanoData,
  sdAegypti,
  sdAlbopictus
} from "../constants/clovisInvasive";
import { colors } from "./helpers";
import { Map } from "./map";
import { InvasiveGraph } from "./invasiveChart";
import axios from "axios";

console.log(sdAegypti);
console.log(sdAlbopictus);

const map = new google.maps.Map(
  document.getElementById("map"),
  invasiveMapOptions
);

//set up some state variables
let city = "Clovis";
let species = "aegypti";

document.cookie = "authtoken=51b6a36d08509e71b9f8f3a4ddd9f0d8f0684cad";

const invasiveMap = Map(map);
invasiveMap.drawInvasiveMap(data);
map.data.addListener("click", function(e) {
  showCityDetails(e.feature.f);
  const f = e.feature.f;
  const url = `https://maps.calsurv.org/invasive/data/${f.agency}/${
    f.city
  }/${species}`;
  console.log(url);

  console.log(document.cookie);
  // const request = axios.create({
  //   timeout: 10000,
  //   withCredentials: true,
  //   headers: {
  //     // authtoken: "51b6a36d08509e71b9f8f3a4ddd9f0d8f0684cad",
  //     // SESS4137c6466818b9e352b9c64faf0008b9: "93vafh9ocasasttn2lpeho9qg7"
  //   }
  // });
  axios
    .get(
      // "https://maps.calsurv.org/invasive/data/San%20Diego%20Co%20VCP/San%20Diego/aegypti"
      url
    )
    .then(res => {
      console.log(res);
      invasiveGraph = InvasiveGraph("chart--invasive", res.data, width);
    })
    .catch(err => console.log(err));
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
  } else if (mosquito === "albopictus") {
    invasiveMap.showAlbopictus();
  } else if (mosquito === "notoscriptus") {
    invasiveMap.showNotoscriptus();
  }
}

function showCityDetails(props) {
  document.getElementById("cityName").innerHTML = props.city;
  document.getElementById("aegypti-text").innerHTML = props.aegypti_detections;
  document.getElementById("albopictus-text").innerHTML =
    props.albopictus_detections;
  document.getElementById("aegypti-first-found").innerHTML =
    props.aegypti_first_found || "N/A";
  document.getElementById("aegypti-last-found").innerHTML =
    props.aegypti_last_found || "N/A";
  document.getElementById("albopictus-first-found").innerHTML =
    props.albopictus_first_found || "N/A";
  document.getElementById("albopictus-last-found").innerHTML =
    props.albopictus_last_found || "N/A";
  document.getElementById("agency").innerHTML = props.agency;
  document.getElementById("website").innerHTML = props.website || "N/A";
}

//DRAW THE CHART
let invasiveGraph;
let width = document.getElementById("chart--invasive").clientWidth;
invasiveGraph = InvasiveGraph("chart--invasive", clovisData, width);
