import '../scss/zika.scss';
import { invasiveMapOptions } from '../constants/mapSettings';
import { Map } from './map';
import { InvasiveGraph } from './invasiveChart';
import { DualSlider } from './slider';
import { timeFormat } from 'd3-time-format';
import axios from 'axios';
import 'babel-polyfill'; // for async await

const go = async () => {
  const geojson = await axios
    .get('https://s3-us-west-2.amazonaws.com/zika-map/separatedinvasive2.json')
    .then(res => res.data)
    .catch(err => console.error('wtf' + err));

    // Working version to get all noto data up to date:
  //   axios
  // .get("https://maps.calsurv.org/invasive/layer")
  // .then(res => {
  //   // console.log(res.data.features);
  //   const features = res.data.features;
  //   // console.log(features);
  //   let checkedCities = new Set();
  //   let badCharacters = [];

  //   const fetchOptions = {
  //     credentials: "include",
  //     headers: {},
  //     referrer: "https://maps.calsurv.org/invasive",
  //     referrerPolicy: "no-referrer-when-downgrade",
  //     body: null,
  //     method: "GET",
  //     mode: "cors"
  //   };

  //   function generateFeatures() {
  //     let finalFeatures = [];
  //     for (let i = 0; i < features.length; i++) {
  //       const feature = features[i]; // {geometry, properties}
  //       const city = feature.properties.city;
  //       const agency = feature.properties.agency;

  //       //if we are not going to make a request due to parameter names, just push empty data
  //       const parameters = city + " " + agency;
  //       if (parameters.includes("/") || parameters.includes("(")) {
  //         // console.log("found a bad character in " + city);
  //         badCharacters.push(city);
  //         // console.log(badCharacters);
  //         feature.properties.data = [];
  //         finalFeatures.push(feature);
  //         continue;
  //       }

  //       //lets get some collections and reproduction data!
  //       const aegyptiURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/aegypti`;
  //       const albosURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/albopictus`;
  //       const notoURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/notoscriptus`;
  //       const rrURL = `https://maps.calsurv.org/invasive/data/${agency}/${city}/rr`;

  //       let aegyptiData, albopictusData, notoscriptusData;

  //       async function getAndMergeData() {
  //         //grab the aegypti and the albos data
  //         aegyptiData = await fetch(aegyptiURL, fetchOptions)
  //           .then(res => res.json())
  //           .catch(err => console.log("aegypti fetch request fucked up"));

  //         albopictusData = await fetch(albosURL, fetchOptions)
  //           .then(res => res.json())
  //           .catch(err => console.log("albos fetch request fucked up"));

  //         notoscriptusData = await fetch(notoURL, fetchOptions)
  //           .then(res => res.json())
  //           .catch(err => console.log("noto fetch request fucked up"));

  //         let data = {};

  //         data["aegypti"] = aegyptiData.map(obj => {
  //           let simpler = {
  //             date: obj["end_date"],
  //             growth: obj["Ae. aegypti daily population growth"],
  //             species: obj["Ae. aegypti"],
  //             total: obj["Total collections"]
  //           };
  //           return simpler;
  //         });

  //         data["albopictus"] = albopictusData.map(obj => {
  //           let simpler = {
  //             date: obj["end_date"],
  //             growth: obj["Ae. albopictus daily population growth"],
  //             species: obj["Ae. albopictus"],
  //             total: obj["Total collections"]
  //           };
  //           return simpler;
  //         });

  //         data["notoscriptus"] = notoscriptusData.map(obj => {
  //           let simpler = {
  //             date: obj["end_date"],
  //             growth: 0,
  //             species: obj["Ae. notoscriptus"],
  //             total: obj["Total collections"]
  //           };
  //           return simpler;
  //         });

  //         //now either merge the data or just grab the reprostuff
  //         // let merged = [];
  //         // if (!aegyptiData && !albopictusData) {
  //         //   console.log(city + " only has rr data");
  //         //   merged = fetch(rrURL, fetchOptions)
  //         //     .then(res => (merged = res.json()))
  //         //     .catch(err => console.log("backup fetch fucked up" + err));
  //         // } else if (aegyptiData.length - albopictusData.length === 0){
  //         //   for (let i = 0; i < aegyptiData.length; i++) {
  //         //     let obj = Object.assign(aegyptiData[i], albopictusData[i]);
  //         //     merged.push(obj);
  //         //   }
  //         // } else { //less albopictus data than aegypti, have to push aegypti until the offset, then merge them together
  //         //   let offset = aegyptiData.length - albopictusData.length;
  //         //   for (let i = 0; i<offset; i++) {
  //         //     merged.push(aegyptiData[i]);
  //         //   }
  //         //   for (let j=0; j<albopictusData.length; j++) {
  //         //     let obj = Object.assign(aegyptidata[j+offset], albopictusData[j]);
  //         //     merged.push(obj);
  //         //   }
  //         // }
  //         // console.log("finished " + city + ", " + i);
  //         checkedCities.add(i);
  //         console.log(checkedCities.size);
  //         // console.log(`${city} has ${aegyptiData.length} aegyptis, ${albopictusData.length} albos`)
  //         if (checkedCities.size > 1285) {
  //           // if (checkedCities.size === 88) {
  //           console.log("just hit " + i);
  //           console.log(finalFeatures);
  //         }
  //         return data;
  //       }

  //       async function assignMergedDataToFeature() {
  //         feature.properties.data = await getAndMergeData();
  //       }
  //       assignMergedDataToFeature();
  //       finalFeatures.push(feature);
  //     }
  //     return finalFeatures;
  //   }

  //   async function generateGeoJson() {
  //     const features = await generateFeatures();
  //     console.log(
  //       "this is supposedly after waiting for generateFeatures to finish"
  //     );
  //     console.log(features);
  //   }
  //   generateGeoJson();
  // })
  // .catch(err => console.log(err));


  const formatDate = timeFormat('%b %d, %Y');


  const map = new google.maps.Map(document.getElementById('map'), invasiveMapOptions);

  //set up some state variables
  let city = 'Fresno';
  let species = 'aegypti';
  let idx;
  geojson.features.forEach((f, i) => {
    if (f.properties.city === city) idx = i;
  });
  let dataObj = geojson.features[idx].properties.data;
  let invasiveChart;
  let startDate, endDate;
  let chartWidth = document.querySelector('#chart--invasive').clientWidth;

  const invasiveMap = Map(map);
  invasiveMap.drawInvasiveMap(geojson);

  map.data.addListener('click', function(e) {
    showCityDetails(e.feature.f);
    const f = e.feature.f;
    const url = `https://maps.calsurv.org/invasive/data/${f.agency}/${f.city}/${species}`;
    geojson.features.forEach(feat => {
      if (feat.properties.city === f.city) {
        dataObj = feat.properties.data;
        // console.log(dataObj);
      }
    });
    invasiveMap.setInvasiveCity(f.city, species);

    invasiveChart = InvasiveGraph(dataObj, species, startDate, endDate, chartWidth);
  });

  function changeMosquito(mosquito) {
    if (mosquito === 'aegypti') {
      invasiveMap.showAegypti();
      species = 'aegypti';
    } else if (mosquito === 'albopictus') {
      invasiveMap.showAlbopictus();
      species = 'albopictus';
    } else if (mosquito === 'notoscriptus') {
      invasiveMap.showNotoscriptus();
      species = 'notoscriptus';
    }
    invasiveChart = InvasiveGraph(dataObj, species, startDate, endDate, chartWidth);
  }

  function changeCity(newCity) {
    city = newCity;
    geojson.features.forEach(d => {
      if (d.properties.city === newCity) {
        dataObj = d.properties.data;
      }
    });

    //to animate city name, need to remove old node, insert new node
    // const oldCityNode = document.getElementById("currentCity");
    // let newCityNode = oldCityNode.cloneNode(true);
    // newCityNode.innerHTML = newCity;
    // oldCityNode.parentNode.replaceChild(newCityNode, oldCityNode);
    // console.log("new city is " + city);
    // console.log(JSON.stringify(dataObj));

    invasiveChart = InvasiveGraph(dataObj, species, startDate, endDate, chartWidth);
  }

  function showCityDetails(props) {
    const website = props.website
      ? `<a href=${props.website}>${props.website}</a>`
      : 'No page available';

    document.getElementById('cityName').innerHTML = props.city;
    document.getElementById('aegypti_detections').innerHTML = props.aegypti_detections;
    document.getElementById('albopictus_detections').innerHTML = props.albopictus_detections;
    document.getElementById('aegypti_first_found').innerHTML = props.aegypti_first_found || 'N/A';
    document.getElementById('aegypti_last_found').innerHTML = props.aegypti_last_found || 'N/A';
    document.getElementById('albopictus_first_found').innerHTML =
      props.albopictus_first_found || 'N/A';
    document.getElementById('albopictus_last_found').innerHTML =
      props.albopictus_last_found || 'N/A';
    document.getElementById('notoscriptus_first_found').innerHTML =
      props.notoscriptus_first_found || 'N/A';
    document.getElementById('notoscriptus_last_found').innerHTML =
      props.notoscriptus_last_found || 'N/A';
    document.getElementById('notoscriptus_detections').innerHTML =
      props.notoscriptus_detections || '0';

    document.getElementById('agency').innerHTML = props.agency;
    document.getElementById('website').innerHTML = website;
  }

  //Add slider and its behavior
  let dates = [];
  for (let year = 2011; year < 2019; year++) {
    // const year = "201" + i;
    dates.push(new Date(`${year}-01-02`));
    dates.push(new Date(`${year}-04-02`));
    dates.push(new Date(`${year}-07-02`));
    dates.push(new Date(`${year}-11-02`));
  }

  DualSlider('dualslider', dates.length);

  // initialize slider
  function getVals() {
    // Get slider values
    var parent = this.parentNode;
    var slides = parent.getElementsByTagName('input');
    var slide1 = parseFloat(slides[0].value);
    var slide2 = parseFloat(slides[1].value);

    // Neither slider will clip the other, so make sure we determine which is larger
    if (slide1 > slide2) {
      var tmp = slide2;
      slide2 = slide1;
      slide1 = tmp;
    }
    startDate = dates[slide1];
    endDate = dates[slide2];

    // invasiveChart.setBrush(startDate, endDate);

    invasiveMap.changeDates(startDate, endDate, species);
    if (species == 'aegypti') {
      invasiveMap.showAegypti();
    } else if (species === 'albopictus') {
      invasiveMap.showAlbopictus();
    } else if (species === 'notoscriptus') {
      invasiveMap.showNotoscriptus();
    }
    // console.log(startDate, endDate);
    invasiveChart.setDates(startDate, endDate);

    var displayElement = parent.getElementsByClassName('rangeValues')[0];
    displayElement.innerHTML = formatDate(startDate) + ' - ' + formatDate(endDate);
    // invasiveMap.changeDates(startDate, endDate, species)
  }

  // Initialize Sliders

  function initSlider() {
    const sliderSections = document.getElementsByClassName('range-slider');
    for (var x = 0; x < sliderSections.length; x++) {
      var sliders = sliderSections[x].getElementsByTagName('input');
      for (var y = 0; y < sliders.length; y++) {
        // if (sliders[y].type === 'range') {
        sliders[y].oninput = getVals;
        // Manually trigger event first time to display values
        sliders[y].oninput();
        // }
      }
    }
  }

  const selectors = document.getElementsByClassName('selector__mosquitos--mosquito');
  for (let i = 0; i < selectors.length; i++) {
    let el = selectors[i];
    el.addEventListener('click', function() {
      //remove active classes from other elements, add active class to clicked, change mosquito styling for map
      if (!el.classList.contains('active')) {
        for (let j = 0; j < selectors.length; j++) {
          selectors[j].classList.remove('active');
        }
        el.classList.add('active');
        changeMosquito(el.id);
      }
    });
  }

  //initialize the chart with Fresno data
  changeCity('Fresno');
  showCityDetails(geojson.features[idx].properties);

  initSlider();

  //redraw the chart on window resizing
  window.addEventListener('resize', function() {
    // document.getElementById('chart--invasive').innerHTML = '';
    chartWidth = document.querySelector('#chart--invasive').clientWidth;
    invasiveChart = InvasiveGraph(dataObj, species, startDate, endDate, chartWidth);
  });
};

go();

// axios
//   .get('https://maps.calsurv.org/invasive/layer')
//   .then(res => {
//     // console.log(res.data.features);
//     const features = res.data.features;
//     // console.log(features);
//     let checkedCities = new Set();
//     let badCharacters = [];
    
//     const fetchOptions = {
//       credentials: 'include',
//       headers: {},
//       referrer: 'https://maps.calsurv.org/invasive',
//       referrerPolicy: 'no-referrer-when-downgrade',
//       body: null,
//       method: 'GET',
//       mode: 'cors'
//     };

//     function generateFeatures() {
//       let finalFeatures = [];

//       for (let i = 0; i < features.length; i++) {
//         const feature = features[i]; // {geometry, properties}
//         const city = feature.properties.city;
//         const agency = feature.properties.agency;
//         //if we are not going to make a request due to parameter names, just push empty data
//         const parameters = city + ' ' + agency;
//         if (parameters.includes('/') || parameters.includes('(') || parameters.includes('.')) {
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
//             .catch(err => console.log('aegypti fetch request fucked up'));
//           albopictusData = await fetch(albosURL, fetchOptions)
//             .then(res => res.json())
//             .catch(err => console.log('albos fetch request fucked up'));
//           // notoscriptusData = await fetch(notoURL, fetchOptions)
//           //   .then(res => res.json())
//           //   .catch(err => console.log("noto fetch request fucked up"));
//           let data = {};
//           data['aegypti'] = aegyptiData.map(obj => {
//             let simpler = {
//               date: obj['end_date'],
//               growth: obj['Ae. aegypti daily population growth'],
//               species: obj['Ae. aegypti'],
//               total: obj['Total collections']
//             };
//             return simpler;
//           });
//           data['albopictus'] = albopictusData.map(obj => {
//             let simpler = {
//               date: obj['end_date'],
//               growth: obj['Ae. albopictus daily population growth'],
//               species: obj['Ae. albopictus'],
//               total: obj['Total collections']
//             };
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
//             // if (checkedCities.size === 88) {
//             console.log('just hit ' + i);
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
//       console.log('this is supposedly after waiting for generateFeatures to finish');
//       console.log(features);
//     }
//     generateGeoJson();
//   })
//   .catch(err => console.log(err));
