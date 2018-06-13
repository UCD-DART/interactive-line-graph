var axios = require("axios");
var fs = require("fs");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let geoJson;

async function getMyData() {
  let finalFeatures = [];

  try {
    const layer = await axios({
      url: "http://maps.calsurv.org/invasive/layer"
    });
    let features = layer.data.features;

    for (let i = 0; i < 10; i++) {
      let f = features[i].properties;
      const url = `https://maps.calsurv.org/invasive/data/${f.agency}/${
        f.city
      }/aegypti`;
      let cityData = await axios({
        url: url,
        validateStatus: status => status < 500
      });

      if (cityData.data.length > 1 && cityData.status === 200) {
        let collections = cityData.data.map(d => {
          return {
            date: d.end_date,
            growth: d["Ae. aegypti daily population growth"]
          };
        });
        f.properties.invasive = collections;
        finalFeatures.push(f);
        console.log(f.city);
      }
    }

    geoJson = {
      type: "FeatureCollection",
      features: features
    };

    fs.writeFile("./invasiveData.json", JSON.stringify(geoJson), function(err) {
      if (err) console.log("writing to disk did not work");
    });
    console.log("finished?  see if the file is there...");
  } catch (err) {
    console.log("getData function error: " + err);
  }
}

getMyData();
