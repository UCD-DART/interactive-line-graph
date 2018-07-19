import "../scss/zika.scss";
import { invasiveMapOptions } from "../constants/mapSettings";
// import * as data from "../constants/invasiveGeo";
// import {
  // clovisData,
  // delanoData,
  // sdAegypti,
  // sdAlbopictus,
  // bakersfieldData,
//   fresnoData,
//   SanDiego
// } from "../constants/clovisInvasive";
// import { colors } from "./helpers";
import { Map } from "./map";
import { InvasiveGraph } from "./invasiveChart";
// import * as geojson from "../constants/invasiveData3.json";
import { Slider } from "./slider";
import { timeFormat } from "d3-time-format";
import axios from "axios";
import "babel-polyfill"; // for async await
import * as geojson from "../constants/separatedinvasive.json"

console.log(geojson);

const formatDate = timeFormat("%b %d, %Y");

const map = new google.maps.Map(
  document.getElementById("map"),
  invasiveMapOptions
);

// axios
//   .get("https://maps.calsurv.org/invasive/layer")
//   .then(res => {
//     // console.log(res.data.features);
//     const features = res.data.features;
//     // console.log(features);
//     let checkedCities = new Set();
//     let badCharacters = [];

//     const fetchOptions = {
//       credentials: "include",
//       headers: {},
//       referrer: "https://maps.calsurv.org/invasive",
//       referrerPolicy: "no-referrer-when-downgrade",
//       body: null,
//       method: "GET",
//       mode: "cors"
//     };

//     function generateFeatures() {
//       let finalFeatures = [];
//       for (let i = 0; i < features.length; i++) {
//         const feature = features[i]; // {geometry, properties}
//         const city = feature.properties.city;
//         const agency = feature.properties.agency;

//         //if we are not going to make a request due to parameter names, just push empty data
//         const parameters = city + " " + agency;
//         if (
//           parameters.includes("/") ||
//           parameters.includes("(") ||
//           parameters.includes(".")
//         ) {
//           // console.log("found a bad character in " + city);
//           badCharacters.push(city);
//           // console.log(badCharacters);
//           feature.properties.data = [];
//           finalFeatures.push(feature);
//           continue;
//         }

//         //lets get some collections and reproduction data!
//         const aegyptiURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/aegypti`;
//         const albosURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/albopictus`;
//         const notoURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/notoscriptus`;
//         const rrURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/rr`;

//         let aegyptiData, albopictusData, notoscriptusData;

//         async function getAndMergeData() {
//           //grab the aegypti and the albos data
//           aegyptiData = await fetch(aegyptiURL, fetchOptions)
//             .then(res => res.json())
//             .catch(err => console.log("aegypti fetch request fucked up"));

//           albopictusData = await fetch(albosURL, fetchOptions)
//             .then(res => res.json())
//             .catch(err => console.log("albos fetch request fucked up"));

//           // notoscriptusData = await fetch(notoURL, fetchOptions)
//           //   .then(res => res.json())
//           //   .catch(err => console.log("noto fetch request fucked up"));
          
//           let data = {};

//           data["aegypti"] = aegyptiData.map(obj => {
//             let simpler = {
//               "date": obj["end_date"],
//               "growth": obj["Ae. aegypti daily population growth"],
//               "species": obj["Ae. aegypti"],
//               "total": obj["Total collections"]
//             }
//             return simpler;
//           });
//           data["albopictus"] = albopictusData.map(obj => {
//             let simpler = {
//               "date": obj["end_date"],
//               "growth": obj["Ae. albopictus daily population growth"],
//               "species": obj["Ae. albopictus"],
//               "total": obj["Total collections"]
//             }
//             return simpler;
//           });

//           //now either merge the data or just grab the reprostuff
//           // let merged = [];
//           // if (!aegyptiData && !albopictusData) {
//           //   console.log(city + " only has rr data");
//           //   merged = fetch(rrURL, fetchOptions)
//           //     .then(res => (merged = res.json()))
//           //     .catch(err => console.log("backup fetch fucked up" + err));
//           // } else if (aegyptiData.length - albopictusData.length === 0){
//           //   for (let i = 0; i < aegyptiData.length; i++) {              
//           //     let obj = Object.assign(aegyptiData[i], albopictusData[i]);
//           //     merged.push(obj);
//           //   }
//           // } else { //less albopictus data than aegypti, have to push aegypti until the offset, then merge them together
//           //   let offset = aegyptiData.length - albopictusData.length;
//           //   for (let i = 0; i<offset; i++) {
//           //     merged.push(aegyptiData[i]);
//           //   }
//           //   for (let j=0; j<albopictusData.length; j++) {
//           //     let obj = Object.assign(aegyptidata[j+offset], albopictusData[j]);
//           //     merged.push(obj);
//           //   }
//           // }
//           // console.log("finished " + city + ", " + i);
//           checkedCities.add(i);
//           console.log(checkedCities.size);
//           // console.log(`${city} has ${aegyptiData.length} aegyptis, ${albopictusData.length} albos`)
//           if (checkedCities.size > 1280) {
//           // if (checkedCities.size === 88) {
//             console.log("just hit " + i);
//             console.log(finalFeatures);
//           }
//           // let simplified = merged.map(obj => {
//           //   let simple = {
//           //     "aegypti": obj["Ae. aegypti"] || 0,
//           //     "aegyptiGrowth": obj["Ae. aegypti daily population growth"] || 0,
//           //     "albo": obj["Ae. albopictus"] || 0,
//           //     "alboGrowth": obj["Ae. albopictus daily population growth"] || 0,
//           //     "Total Collections": obj["Total collections"] || 0,
//           //     "date": obj["end_date"]
//           //   };
//           //   return simple;
//           // })
//           // return simplified;
//           return data;
//         }

//         async function assignMergedDataToFeature() {
//           feature.properties.data = await getAndMergeData();
//         }
//         assignMergedDataToFeature();
//         finalFeatures.push(feature);
//       }
//       return finalFeatures;
//     }

//     async function generateGeoJson() {
//       const features = await generateFeatures();
//       console.log('this is supposedly after waiting for generateFeatures to finish')
//       console.log(features);
//     }
//     generateGeoJson();
//   })
//   .catch(err => console.log(err));

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
let city = "Fresno";
let species = "aegypti";
let idx;
geojson.features.forEach((f,i) => {
  if (f.properties.city === city) idx = i;
})
let dataObj = geojson.features[idx].properties.data; 
let invasiveGraph;
let startDate, endDate;

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
  geojson.features.forEach(feat => {
    if (feat.properties.city === f.city) {
      dataObj = feat.properties.data;
      console.log(dataObj)
    }
  });
  invasiveChart = InvasiveGraph(dataObj, species);
  // console.log(url);
  // changeCity(f.city);

  // let cityData;
  // console.log(f.agency);

  // fetch(url, {
  //   credentials: "include",
  //   headers: {},
  //   referrer: "https://maps.calsurv.org/invasive",
  //   referrerPolicy: "no-referrer-when-downgrade",
  //   body: null,
  //   method: "GET",
  //   mode: "cors"
  // })
  //   .then(res => res.json())
  //   .then(json => {
  //     dataObj = json;
  //     changeCity(f.city);
  //   })
  //   .catch(err => console.log(err));

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

// const mosquitoToggle = document.getElementById("changeMosquito");
// mosquitoToggle.addEventListener("change", function() {
//   if (this.checked) {
//     changeMosquito("albopictus");
//   } else changeMosquito("aegypti");
// });

document.getElementById("pickAegypti").addEventListener("click", function() {
  console.log('clicked');
  changeMosquito("aegypti");
});
document.getElementById("pickAlbo").addEventListener("click", function() {
  changeMosquito("albopictus");
});
document.getElementById("pickNoto").addEventListener("click", () => changeMosquito("notoscriptus"));

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
    return;
  }
  console.log(dataObj);
  if (species != "notoscriptus") invasiveGraph = InvasiveGraph(dataObj, species);
}

function changeCity(newCity) {
  city = newCity;
  geojson.features.forEach(d => {
    if (d.properties.city === newCity) {
      dataObj = d.properties.data;
      console.log(dataObj);
    }
  });

    //to animate city name, need to remove old node, insert new node
  // const oldCityNode = document.getElementById("currentCity");
  // let newCityNode = oldCityNode.cloneNode(true);
  // newCityNode.innerHTML = newCity;
  // oldCityNode.parentNode.replaceChild(newCityNode, oldCityNode);
  // console.log("new city is " + city);
  // console.log(JSON.stringify(dataObj));
  
  invasiveGraph = InvasiveGraph(dataObj, species);
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

// const Slider = Slider('slider', dates.length)


//initialize slider
// function getVals(){
//   // Get slider values
//   var parent = this.parentNode;
//   var slides = parent.getElementsByTagName("input");
//     var slide1 = parseFloat( slides[0].value );
//     var slide2 = parseFloat( slides[1].value );
//   // Neither slider will clip the other, so make sure we determine which is larger
//   if( slide1 > slide2 ){ var tmp = slide2; slide2 = slide1; slide1 = tmp; }
//   startDate = dates[slide1];
//   endDate = dates[slide2];
//   invasiveMap.changeDates(startDate, endDate, species);
  
//   var displayElement = parent.getElementsByClassName("rangeValues")[0];
//       displayElement.innerHTML = formatDate(startDate) + " - " + formatDate(endDate);
//       // invasiveMap.changeDates(startDate, endDate, species)
// }

//   // Initialize Sliders
// var sliderSections = document.getElementsByClassName("range-slider");
// for( var x = 0; x < sliderSections.length; x++ ){
//   var sliders = sliderSections[x].getElementsByTagName("input");
//   for( var y = 0; y < sliders.length; y++ ){
//     if( sliders[y].type ==="range" ){
//       sliders[y].oninput = getVals;
//       // Manually trigger event first time to display values
//       sliders[y].oninput();
//     }
//   }
// }

Slider("slider", dates.length - 1);
document.getElementById("pickDate").oninput = e => changeDate(e.target.value);
document.getElementById("pickDate").classList.add("slider-invasive");

function changeDate(idx) {
  let newDate = dates[idx];
  invasiveMap.changeDate(newDate);
  if (species === "aegypti") {
    invasiveMap.showAegypti()
  } else if (species === "albopictus") {
    invasiveMap.showAlbopictus();
  } else if (species === "notoscriptus") {
    invasiveMap.showNotoscriptus();
  }

  document.getElementById("selected-date").innerHTML = formatDate(newDate);
}

//initialize the chart with Fresno data
changeCity("Fresno");
showCityDetails(geojson.features[idx].properties);
invasiveGraph = InvasiveGraph(dataObj, species);
