import "../scss/zika.scss";
import { mapOptions, invasiveMapOptions } from "../constants/mapSettings";
import * as data from "../constants/invasiveGeo";
import { colors } from "./helpers";
import { Map } from "./map";

console.log(data);

const map = new google.maps.Map(
  document.getElementById("map"),
  invasiveMapOptions
);

const invasiveMap = Map(map);
invasiveMap.drawInvasiveMap(data);
map.data.addListener("click", function(e) {
  showCityDetails(e.feature.f);
});

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
  console.log(props);
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
