var axios = require("axios");
var fs = require("fs");
var cities = require("./clovisInvasive");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let geoJson;

async function getMyData() {
  let finalFeatures = [];

  let starterCities = ["Fresno", "San Diego", "Rancho Cucamonga", "Bakersfield", "Delano", "Clovis", "Newport Beach", "Tulare"];

  try {
    const layer = await axios({
      url: "http://maps.calsurv.org/invasive/layer"
    });
    let features = layer.data.features;

    for (let i = 0; i < features.length; i++) {

      

      let f = features[i].properties;
      if (starterCities.indexOf(f.city) === -1) continue;

      f.data = cities[f.city];
      

      console.log(f.city);
      // let aegyptiurl = `https://maps.calsurv.org/invasive/data/${f.agency}/${
      //   f.city
      // }/aegypti`;
      // let albourl = `https://maps.calsurv.org/invasive/data/${f.agency}/${
      //   f.city
      // }/albopictus`;

      // //grab aetypti data and push it into collections
      // let aegyptiData = await axios({
      //   url: aegyptiurl,
      //   validateStatus: status => status < 500
      // })
      //   .then(res => {
      //     if (res.data.length > 1 && res.status === 200) {
      //       let collections = res.data.map(d => {
      //         return {
      //           date: d.end_date,
      //           aegyptiGrowth: +d["Ae. aegypti daily population growth"]
      //         };
      //       });
      //       f["aegypti"] = collections;
      //     }
      //   })
      //   .catch(err => console.log(`${f.city} didnt work with their aegypti req, error: ${err}`));

      // let albosData = await axios({
      //   url: albourl,
      //   validateStatus: status => status < 500
      // })
      // .then(res => {
      //   if (res.data.length > 1 && res.status ===200) {
      //     let growth = res.data.map(d => {
      //       return {
      //         date: d.end_date,
      //         albopictusGrowth: +d["Ae. albopictus daily population growth"]
      //       };
      //     });
      //     f["albopictus"] = growth;
      //   }
      // }).catch(err => console.log(`${f.city} didnt work with their albos req, error: ${err}`));

      //grab albos data and push it into the collections
      // let albosData = await axios({
      //   url: albourl,
      //   validateStatus: status => status < 500
      // }).catch(err => console.log(`${f.city} didnt work with error: ${err}`));
      // if (albosData.data.length > 1 && albosData.status === 200) {
      //   let collections = albosData.data.map(d => {
      //     return {
      //       date: d.end__date,
      //       albopictusGrowth: +d["Ae. albopictus daily population growth"]
      //     };
      //   });
      //   f["albopictus"] = collections;
      // }

      finalFeatures.push(f);
    }

    geoJson = {
      type: "FeatureCollection",
      features: finalFeatures
    };

    fs.writeFile("./invasiveData3.json", JSON.stringify(geoJson), function(err) {
      if (err) console.log("writing to disk did not work");
    });
    console.log("finished?  see if the file is there...");
  } catch (err) {
    console.log("getData function error: " + err);
  }
}

getMyData();
