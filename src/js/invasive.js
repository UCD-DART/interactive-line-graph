import '../scss/zika.scss';
import { invasiveMapOptions } from '../constants/mapSettings';
import { Map } from './map';
import { InvasiveGraph } from './invasiveChart';
import { DualSlider } from './slider';
import { timeFormat } from 'd3-time-format';
import axios from 'axios';
import 'babel-polyfill'; // for async await
// import * as geojson from '../constants/separatedTest.json';
// import * as geojson from '../constants/separatedInvasive.json';

// console.log(geojson);

const go = async () => {
  const geojson = await axios
    .get('https://s3-us-west-2.amazonaws.com/zika-map/separatedinvasive.json')
    .then(res => res.data)
    .catch(err => console.error('wtf' + err));

  console.log(geojson);

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
    invasiveChart = InvasiveGraph(dataObj, species, startDate, endDate);
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
    // console.log(dataObj);
    // if (species != "notoscriptus")
    invasiveChart = InvasiveGraph(dataObj, species, startDate, endDate);
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

    invasiveChart = InvasiveGraph(dataObj, species, startDate, endDate);
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
    console.log('slider init');
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
};

go();
