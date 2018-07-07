import "../scss/zika.scss";
import { invasiveMapOptions } from "../constants/mapSettings";
// import * as data from "../constants/invasiveGeo";
// import {
//   clovisData,
//   delanoData,
//   sdAegypti,
//   sdAlbopictus,
//   bakersfieldData,
//   fresnoData,
//   SanDiego
// } from "../constants/clovisInvasive";
// import { colors } from "./helpers";
import { Map } from "./map";
import { InvasiveGraph } from "./invasiveChart";
import * as geojson from "../constants/invasiveData3.json";
import { Slider } from "./slider";
import { timeFormat } from "d3-time-format";

console.log(geojson);

const formatDate = timeFormat("%b %d, %Y");

const map = new google.maps.Map(
  document.getElementById("map"),
  invasiveMapOptions
);

// console.log(data);

//set up some state variables
let city = "San Diego";
let species = "aegypti";
let dataObj = geojson.features[1281].properties.data; //index for San Diego in the static data
// console.log(geojson.features[1]);
// console.log(dataObj);
let invasiveGraph;

const invasiveMap = Map(map);
invasiveMap.drawInvasiveMap(geojson);

// for (let i = 0; i < geojson.features.length; i++) {
//   if (geojson.features[i].properties.city === "San Diego") console.log(i);
// }

map.data.addListener("click", function(e) {
  showCityDetails(e.feature.f);
  const f = e.feature.f;
  // const url = `https://maps.calsurv.org/invasive/data/${f.agency}/${
  //   f.city
  // }/${species}`;
  // console.log(url);
  changeCity(f.city);

  // let cityData;
  console.log(f.agency);

  // fetch(
  //   `https://maps.calsurv.org/invasive/data/${f.agency}/${f.city}/aegypti`,
  //   {
  //     credentials: "include",
  //     headers: {},
  //     referrer: "https://maps.calsurv.org/invasive",
  //     referrerPolicy: "no-referrer-when-downgrade",
  //     body: null,
  //     method: "GET",
  //     mode: "cors"
  //   }
  // )
  //   .then(res => {
  //     return res.json();
  //   })
  //   .then(myJson => console.log(myJson));

  // switch (f.city) {
  //   case "Fresno":
  //     invasiveGraph = InvasiveGraph(fresnoData);
  //     break;
  //   case "Delano":
  //     invasiveGraph = InvasiveGraph(delanoData);
  //     break;
  //   case "Clovis":
  //     invasiveGraph = InvasiveGraph(clovisData);
  //     break;
  //   case "San Diego":
  //     let sdData = species === "aegypti" ? sdAegypti : sdAlbopictus;
  //     invasiveGraph = InvasiveGraph(sdData);
  //     break;
  //   case "Bakersfield":
  //     invasiveGraph = InvasiveGraph(bakersfieldData);
  //     break;
  //   default:
  //     axios
  //       .get(url)
  //       .then(res => {
  //         console.log(res.data);
  //         cityData = res.data;
  //         invasiveGraph = InvasiveGraph(cityData);
  //       })
  //       .catch(err => console.log(err));
  // }
});

const mosquitoToggle = document.getElementById("changeMosquito");
mosquitoToggle.addEventListener("change", function() {
  if (this.checked) {
    changeMosquito("albopictus");
  } else changeMosquito("aegypti");
});

function changeMosquito(mosquito) {
  if (mosquito === "aegypti") {
    invasiveMap.showAegypti();
    species = "aegypti";
  } else if (mosquito === "albopictus") {
    invasiveMap.showAlbopictus();
    species = "albopictus";
  }
  invasiveGraph = InvasiveGraph(dataObj, species);
}

function changeCity(newCity) {
  city = newCity;
  geojson.features.forEach(d => {
    if (d.properties.city === newCity) {
      dataObj = d.properties.data;
    }
  });
  console.log("new city is " + city);
  console.log(dataObj);
  if (dataObj) {
    invasiveGraph = InvasiveGraph(dataObj, species);
  } else {
    document.getElementById("chart--invasive").innerHTML = `
      <div class='card'>
        <h1>No data for that city.  Try one of these cities on the map:</h1>
        
        <li>"Fresno",</li>
        <li>"San Diego",</li>
        <li>"Rancho Cucamonga",</li>
        <li>"Bakersfield",</li>
        <li>"Delano",</li>
        <li>"Clovis",</li>
        <li>"Newport Beach",</li>
        <li>"Tulare",</li>
        <li>"Palm Springs",</li>
        <li>"Chino Hills",</li>
        <li>"Madera",</li>
        <li>"Arvin",</li>
        <li>"Pico Rivera"</li>
      </div>
      `;
  }
}

function showCityDetails(props) {
  const website = props.website
    ? `<a href=${props.website}>${props.website}</a>`
    : "No page available";

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
  document.getElementById("website").innerHTML = website;
}

//Add slider and its behavior
let dates = [];
for (let i = 2; i < 9; i++) {
  const year = "201" + i;
  dates.push(new Date(`${year}-01-02`));
  dates.push(new Date(`${year}-04-02`));
  dates.push(new Date(`${year}-07-02`));
  dates.push(new Date(`${year}-11-02`));
}

Slider("slider", dates.length - 1);
document.getElementById("pickDate").oninput = e => changeDate(e.target.value);
document.getElementById("pickDate").classList.add("slider-invasive");

function changeDate(idx) {
  let newDate = dates[idx];
  invasiveMap.changeDate(newDate);
  species === "aegypti"
    ? invasiveMap.showAegypti()
    : invasiveMap.showAlbopictus();

  document.getElementById("selected-date").innerHTML = formatDate(newDate);
}

//initialize the chart

changeCity("San Diego");
showCityDetails(geojson.features[1281].properties);
invasiveGraph = InvasiveGraph(dataObj, species);
