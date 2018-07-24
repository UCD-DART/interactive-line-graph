// import axios from "axios";

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
//         if (parameters.includes("/") || parameters.includes("(")) {
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

//           notoscriptusData = await fetch(notoURL, fetchOptions)
//             .then(res => res.json())
//             .catch(err => console.log("noto fetch request fucked up"));

//           let data = {};

//           data["aegypti"] = aegyptiData.map(obj => {
//             let simpler = {
//               date: obj["end_date"],
//               growth: obj["Ae. aegypti daily population growth"],
//               species: obj["Ae. aegypti"],
//               total: obj["Total collections"]
//             };
//             return simpler;
//           });

//           data["albopictus"] = albopictusData.map(obj => {
//             let simpler = {
//               date: obj["end_date"],
//               growth: obj["Ae. albopictus daily population growth"],
//               species: obj["Ae. albopictus"],
//               total: obj["Total collections"]
//             };
//             return simpler;
//           });

//           data["notoscriptus"] = notoscriptusData.map(obj => {
//             let simpler = {
//               date: obj["end_date"],
//               growth: 0,
//               species: obj["Ae. notoscriptus"],
//               total: obj["Total collections"]
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
//           if (checkedCities.size > 1285) {
//             // if (checkedCities.size === 88) {
//             console.log("just hit " + i);
//             console.log(finalFeatures);
//           }
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
//       console.log(
//         "this is supposedly after waiting for generateFeatures to finish"
//       );
//       console.log(features);
//     }
//     generateGeoJson();
//   })
//   .catch(err => console.log(err));

//   // now the invasive geojson should just be compiled as a final object once checkedcities gets big enough.  Then you can JSON.stringify that object and paste it in somewhere else.
//   // watch out though,

// console.log("linked");


// BABEL TRANSPILED CODE BELOW

"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var axios = require("axios");

axios.get("https://maps.calsurv.org/invasive/layer").then(function (res) {
  var generateGeoJson = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var features;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return generateFeatures();

            case 2:
              features = _context3.sent;

              console.log("this is supposedly after waiting for generateFeatures to finish");
              console.log(features);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function generateGeoJson() {
      return _ref3.apply(this, arguments);
    };
  }();

  // console.log(res.data.features);
  var features = res.data.features;
  // console.log(features);
  var checkedCities = new Set();
  var badCharacters = [];

  var fetchOptions = {
    credentials: "include",
    headers: {},
    referrer: "https://maps.calsurv.org/invasive",
    referrerPolicy: "no-referrer-when-downgrade",
    body: null,
    method: "GET",
    mode: "cors"
  };

  function generateFeatures() {
    var finalFeatures = [];

    var _loop = function _loop(i) {
      var getAndMergeData = function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var data;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return fetch(aegyptiURL, fetchOptions).then(function (res) {
                    return res.json();
                  }).catch(function (err) {
                    return console.log("aegypti fetch request fucked up");
                  });

                case 2:
                  aegyptiData = _context.sent;
                  _context.next = 5;
                  return fetch(albosURL, fetchOptions).then(function (res) {
                    return res.json();
                  }).catch(function (err) {
                    return console.log("albos fetch request fucked up");
                  });

                case 5:
                  albopictusData = _context.sent;
                  _context.next = 8;
                  return fetch(notoURL, fetchOptions).then(function (res) {
                    return res.json();
                  }).catch(function (err) {
                    return console.log("noto fetch request fucked up");
                  });

                case 8:
                  notoscriptusData = _context.sent;
                  data = {};


                  data["aegypti"] = aegyptiData.map(function (obj) {
                    var simpler = {
                      date: obj["end_date"],
                      growth: obj["Ae. aegypti daily population growth"],
                      species: obj["Ae. aegypti"],
                      total: obj["Total collections"]
                    };
                    return simpler;
                  });

                  data["albopictus"] = albopictusData.map(function (obj) {
                    var simpler = {
                      date: obj["end_date"],
                      growth: obj["Ae. albopictus daily population growth"],
                      species: obj["Ae. albopictus"],
                      total: obj["Total collections"]
                    };
                    return simpler;
                  });

                  data["notoscriptus"] = notoscriptusData.map(function (obj) {
                    var simpler = {
                      date: obj["end_date"],
                      growth: 0,
                      species: obj["Ae. notoscriptus"],
                      total: obj["Total collections"]
                    };
                    return simpler;
                  });

                  //now either merge the data or just grab the reprostuff
                  // let merged = [];
                  // if (!aegyptiData && !albopictusData) {
                  //   console.log(city + " only has rr data");
                  //   merged = fetch(rrURL, fetchOptions)
                  //     .then(res => (merged = res.json()))
                  //     .catch(err => console.log("backup fetch fucked up" + err));
                  // } else if (aegyptiData.length - albopictusData.length === 0){
                  //   for (let i = 0; i < aegyptiData.length; i++) {
                  //     let obj = Object.assign(aegyptiData[i], albopictusData[i]);
                  //     merged.push(obj);
                  //   }
                  // } else { //less albopictus data than aegypti, have to push aegypti until the offset, then merge them together
                  //   let offset = aegyptiData.length - albopictusData.length;
                  //   for (let i = 0; i<offset; i++) {
                  //     merged.push(aegyptiData[i]);
                  //   }
                  //   for (let j=0; j<albopictusData.length; j++) {
                  //     let obj = Object.assign(aegyptidata[j+offset], albopictusData[j]);
                  //     merged.push(obj);
                  //   }
                  // }
                  // console.log("finished " + city + ", " + i);
                  checkedCities.add(i);
                  console.log(checkedCities.size);
                  // console.log(`${city} has ${aegyptiData.length} aegyptis, ${albopictusData.length} albos`)
                  if (checkedCities.size > 1285) {
                    // if (checkedCities.size === 88) {
                    console.log("just hit " + i);
                    console.log(finalFeatures);
                  }
                  return _context.abrupt("return", data);

                case 17:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        return function getAndMergeData() {
          return _ref.apply(this, arguments);
        };
      }();

      var assignMergedDataToFeature = function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return getAndMergeData();

                case 2:
                  feature.properties.data = _context2.sent;

                case 3:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        return function assignMergedDataToFeature() {
          return _ref2.apply(this, arguments);
        };
      }();

      var feature = features[i]; // {geometry, properties}
      var city = feature.properties.city;
      var agency = feature.properties.agency;

      //if we are not going to make a request due to parameter names, just push empty data
      var parameters = city + " " + agency;
      if (parameters.includes("/") || parameters.includes("(")) {
        // console.log("found a bad character in " + city);
        badCharacters.push(city);
        // console.log(badCharacters);
        feature.properties.data = [];
        finalFeatures.push(feature);
        return "continue";
      }

      //lets get some collections and reproduction data!
      var aegyptiURL = "https://maps.calsurv.org/invasive/data/" + agency + "/" + city + "/aegypti";
      var albosURL = "https://maps.calsurv.org/invasive/data/" + agency + "/" + city + "/albopictus";
      var notoURL = "https://maps.calsurv.org/invasive/data/" + agency + "/" + city + "/notoscriptus";
      var rrURL = "https://maps.calsurv.org/invasive/data/" + agency + "/" + city + "/rr";

      var aegyptiData = void 0,
          albopictusData = void 0,
          notoscriptusData = void 0;

      assignMergedDataToFeature();
      finalFeatures.push(feature);
    };

    for (var i = 0; i < features.length; i++) {
      var _ret = _loop(i);

      if (_ret === "continue") continue;
    }
    return finalFeatures;
  }

  generateGeoJson();
}).catch(function (err) {
  return console.log(err);
});

//   // now the invasive geojson should just be compiled as a final object once checkedcities gets big enough.  Then you can JSON.stringify that object and paste it in somewhere else.
//   // watch out though,

// console.log("linked");
