var axios = require("axios");
var d3 = require("d3");
var fs = require("fs");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
  getDataById: id =>
    axios({
      url: `http://mathew.calsurv.org/api/zika/${id}`,
      validateStatus: function(status) {
        return status < 500;
      }
    })
};

async function getMyData() {
  let finalFeatures = [];

  try {
    const layer = await service.getFeatures(); // get an initial list of all cities in the gateway
    let features = layer.data.features;

    for (let i = 0; i < features.length; i++) {
      let feature = features[i];
      const id = feature.id;
      let cityData = await service.getDataById(id);

      if (cityData.data.length > 1 && cityData.status === 200) {
        let riskObj = cityData.data.map(datum => {
          return {
            date: datum.date,
            risk: datum.risk
          };
        });
        feature.properties.risk = riskObj;
        finalFeatures.push(feature);
        console.log(id);
      }
    }

    geoJson = {
      type: "FeatureCollection",
      features: finalFeatures
    };
    fs.writeFile("./risk2.json", JSON.stringify(geoJson), function(err) {
      if (err) console.log("writing to disk did not work");
    });
    console.log(
      "Finished 💣💣_ ahh yess!!  it worked.  Geojson data contains " +
        finalFeatures.length +
        " cities in the file"
    );
  } catch (err) {
    console.log("getData function error: " + err);
  }
}

getMyData();

// async function getData() {
//   let finalFeatures = [];
//   try {
//     let layer = await service.getFeatures();
//     let features = layer.data.features;

//     for (let i = 0; i < features.length; i++) {
//       let feature = features[i];
//       const city = feature.properties.city;
//       // const id = feature.id;
//       let cityData = await service.getData(city);

//       if (cityData.data.length > 1 && cityData.status === 200) {
//         feature.properties.risk = formatData(cityData.data);
//         finalFeatures.push(feature);
//         // console.log("pushed feature is ");
//         console.log(city);
//       }
//     }
//     // console.log(finalFeatures);
//     geoJson = {
//       type: "FeatureCollection",
//       features: finalFeatures
//     };
//     fs.writeFile("./risk.json", JSON.stringify(geoJson), function(err) {
//       if (err) console.log("writing to the disk did not work");
//     });
//     console.log(
//       "💣🚀🚀 FINISHED " + finalFeatures.length + " 🏙️ 🏛️ 🏠   cities in json"
//     );
//   } catch (err) {
//     console.log("getData() error: " + err);
//   }
// }

// // getData();

// var format = d3.timeFormat("%Y-%m-%d");

// function formatData(city) {
//   let bucketDate = new Date("2016-01-01T00:00:00.000Z");

//   Date.prototype.addDays = function(days) {
//     const date = new Date(this.valueOf());
//     date.setDate(date.getDate() + days);
//     return date;
//   };

//   let final = [[format(bucketDate), []]];
//   let bucket = 0; // bucket
//   for (let i = 0; i < city.length; i++) {
//     let currentDate = new Date(city[i][0]);
//     if (currentDate < bucketDate.addDays(7)) {
//       //WITHIN 7 DAYS
//       final[bucket][1].push(+city[i][1]);
//     } else {
//       // MORE THAN 7 DAYS
//       //Assign new bucket date, create new bucket with it and its first value is the current city value
//       bucketDate = bucketDate.addDays(7);
//       bucket++;
//       final.push([format(bucketDate), [+city[i][1]]]);
//     }
//   }
//   //calculate the avg risk for each bucket, format as object for API
//   final = final.map(week => {
//     let obj = {};
//     const avg =
//       week[1].reduce(function(a, b) {
//         return a + b;
//       }, 0) / week[1].length;
//     obj["date"] = new Date(week[0]);
//     obj["risk"] = +avg.toFixed(3);
//     return obj;
//   });
//   return final;
// }

module.exports = geoJson;
