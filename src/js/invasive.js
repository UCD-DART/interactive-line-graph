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
import axios from "axios";
import "babel-polyfill"; // for async await
import { resolve } from "path";

// console.log(geojson);

const formatDate = timeFormat("%b %d, %Y");

const map = new google.maps.Map(
  document.getElementById("map"),
  invasiveMapOptions
);

axios
  .get("https://maps.calsurv.org/invasive/layer")
  .then(res => {
    const features = res.data.features.slice(550, 555);
    console.log(features);

    const fetchOptions = {
      credentials: "include",
      headers: {},
      referrer: "https://maps.calsurv.org/invasive",
      referrerPolicy: "no-referrer-when-downgrade",
      body: null,
      method: "GET",
      mode: "cors"
    };

    function generateFeatures() {
      let finalFeatures = [];
      for (let i = 0; i < features.length; i++) {
        const feature = features[i]; // {geometry, properties}
        console.log(feature);
        const city = feature.properties.city;

        const agency = feature.properties.agency;
        // console.log("agency is " + agency);

        //if we are not going to make a request due to parameter names, just push empty data
        if (city.includes("/") || agency.includes("/") || city.includes("(")) {
          console.log("found a slash in " + city);
          feature.properties.data = [];
          finalFeatures.push(feature);
          continue;
        }

        //lets get some collections and reproduction data!
        const aegyptiURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/aegypti`;
        const albosURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/albopictus`;
        const notoURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/notoscriptus`;
        const rrURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/rr`;

        let aegyptiData, albopictusData, notoscriptusData;

        async function getAndMergeData() {
          //grab the aegypti and the albos data
          aegyptiData = await fetch(aegyptiURL, fetchOptions)
            .then(res => res.json())
            .catch(err => console.log("aegypti fetch request fucked up"));

          albopictusData = await fetch(albosURL, fetchOptions)
            .then(res => res.json())
            .catch(err => console.log("albos fetch request fucked up"));

          //now either merge the data or just grab the reprostuff
          let merged = [];
          if (!aegyptiData && !albopictusData) {
            console.log(city + " only has rr data");
            merged = fetch(rrURL, fetchOptions)
              .then(res => (merged = res.json()))
              .catch(err => console.log("backup fetch fucked up"));
          } else {
            for (let i = 0; i < aegyptiData.length; i++) {
              let obj = Object.assign(aegyptiData[i], albopictusData[i]);
              merged.push(obj);
            }
          }
          return merged;
        }

        async function assignMergedDataToFeature() {
          feature.properties.data = await getAndMergeData();
        }
        assignMergedDataToFeature();
        finalFeatures.push(feature);
      }
      return finalFeatures;
    }
    async function generateGeoJson() {
      const features = await generateFeatures();
      function asyncStringify(data) {
        return new Promise((resolve, reject) => {
          resolve(JSON.stringify(data));
        });
      }
      return asyncStringify(features);
    }
    console.log(generateGeoJson());
  })
  .catch(err => console.log(err));

// console.log(data);
// axios
//   .get("https://maps.calsurv.org/invasive/layer")
//   .then(res => {
//     let finalFeatures = [];
//     // console.log(res.data.features);
//     // res.data.features
//     for (let i = 0; i < 10; i++) {
//       let f = res.data.features[i];
//       let simpleFeature = {};

//       let urlAegypti = `https://maps.calsurv.org/invasive/data/${
//         f.properties.agency
//       }/${f.properties.city}/aegypti`;
//       let urlAlbos = `https://maps.calsurv.org/invasive/data/${
//         f.properties.agency
//       }/${f.properties.city}/albopictus`;

//       //get the aegypti data
// fetch(urlAegypti, {
//   credentials: "include",
//   headers: {},
//   referrer: "https://maps.calsurv.org/invasive",
//   referrerPolicy: "no-referrer-when-downgrade",
//   body: null,
//   method: "GET",
//   mode: "cors"
// })
//         .then(response => response.json())
//         .then(aegyptiJson => {
//           aegyptiJson = aegyptiJson.map(d => {
//             simpleFeature = {
//               date: d.end_date,
//               "Ae. aegypti daily population growth":
//                 d["Ae. aegypti daily population growth"] || 0,
//               "Total Collections": d["Total collections"],
//               "Ae. aegypti": d["Ae. aegypti"]
//             };
//             return obj;
//           });
//           f.properties.data = aegyptiJson;
//           finalFeatures.push(f);
//           console.log(f.properties.city);
//           if (i === 25) console.log(finalFeatures);
//         })
//         .catch(err => console.log(err));
//     }
//   })
//   .catch(err => console.log(err));

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
  const url = `https://maps.calsurv.org/invasive/data/${f.agency}/${
    f.city
  }/${species}`;
  // console.log(url);
  // changeCity(f.city);

  // let cityData;
  // console.log(f.agency);

  fetch(url, {
    credentials: "include",
    headers: {},
    referrer: "https://maps.calsurv.org/invasive",
    referrerPolicy: "no-referrer-when-downgrade",
    body: null,
    method: "GET",
    mode: "cors"
  })
    .then(res => res.json())
    .then(json => {
      dataObj = json;
      changeCity(f.city);
    })
    .catch(err => console.log(err));

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
  // console.log("new city is " + city);
  // console.log(JSON.stringify(dataObj));
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
