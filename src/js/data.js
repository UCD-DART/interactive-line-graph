var axios = require("axios");
// import { timeFormat } from "d3";
var d3 = require("d3");
var fs = require("fs");
require("ssl-root-cas").inject();

let geoJson;

const service = {
  getFeatures: () => axios({ url: "http://maps.calsurv.org/zika/layer" }),
  getData: city =>
    axios({
      url: `http://maps.calsurv.org/zika/risk/${city}`,
      validateStatus: function(status) {
        return status < 500;
      }
    }),
  logData: () => console.log(finalFeatures)
};

async function getData() {
  let finalFeatures = [];
  try {
    let layer = await service.getFeatures();
    let features = layer.data.features;

    for (let i = 0; i < features.length; i++) {
      let feature = features[i];
      const city = feature.properties.city;
      let cityData = await service.getData(city);

      if (cityData.data.length > 1 && cityData.status === 200) {
        console.log(cityData.data);
        feature.properties.risk = formatData(cityData.data);
        finalFeatures.push(feature);
        console.log("pushed feature is ");
        console.log(feature);
      }
    }
    console.log(finalFeatures);
    geoJson = {
      type: "FeatureCollection",
      features: finalFeatures
    };
    fs.writeFile("./risk.json", JSON.stringify(geoJson), function(err) {
      if (err) console.log("writing to the disk did not work");
    });
  } catch (err) {
    console.log("here is the error " + err);
  }
}

getData();
service.logData();

var format = d3.timeFormat("%Y-%m-%d");

function formatData(city) {
  let bucketDate = new Date("2016-01-02");

  Date.prototype.addDays = function(days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  let final = [[format(bucketDate), []]];
  let bucket = 0; // bucket
  for (let i = 0; i < city.length; i++) {
    let currentDate = new Date(city[i][0]);
    if (currentDate < bucketDate.addDays(7)) {
      //WITHIN 7 DAYS
      final[bucket][1].push(+city[i][1]);
    } else {
      // MORE THAN 7 DAYS

      //sum up the current bucket
      final[bucket][1] =
        final[bucket][1].reduce(function(a, b) {
          return a + b;
        }, 0) / final[bucket][1].length;
      //Assign new bucket date, create new bucket with it and its first value is the current city value
      bucketDate = bucketDate.addDays(7);
      bucket++;
      final.push([format(bucketDate), [+city[i][1]]]);
    }
  }

  return final;
}

module.exports = geoJson;
