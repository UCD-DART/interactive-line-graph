var axios = require("axios");
var fs = require("fs");
var cities = require("./clovisInvasive");
require("isomorphic-fetch");
var request = require("request");
var jar = request.jar();
var rp = require("request-promise");
var tough = require("tough-cookie");
var Cookie = tough.Cookie;
// var cookie = Cookie.parse(header);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let geoJson;

async function getMyData() {
  let finalFeatures = [];

  let starterCities = [
    "Fresno",
    "San Diego",
    "Rancho Cucamonga",
    "Bakersfield",
    "Delano",
    "Clovis",
    "Newport Beach",
    "Tulare",
    "Palm Springs",
    "Chino Hills",
    "Madera",
    "Arvin",
    "Pico Rivera"
  ];

  try {
    const layer = await axios({
      url: "http://maps.calsurv.org/invasive/layer"
    });
    let features = layer.data.features;

    for (let i = 0; i < 1; i++) {
      let f = features[i];
      if (starterCities.indexOf(f.properties.city) > -1) {
        f.properties.data = cities[f.properties.city];
      }
      console.log(f.properties.city);
      let url = `https://maps.calsurv.org/invasive/data/${
        f.properties.agency
      }/${f.properties.city}/aegypti`;

      // const options = {
      //   method: "POST",
      //   uri: "https://gateway.calsurv.org",
      //   jar: jar,
      //   form: {
      //     txt_loginName: "mathew",
      //     pwd_loginPass: "02zE86OndBsYLh@s90uv",
      //     sbt_loginSubmit: "tt"
      //   },
      //   resolveWithFullResponse: true
      // };

      // rp(options)
      //   .then(res => console.log(res))
      //   .catch(err => console.log("fuck"));

      request(
        {
          url: "https://gateway.calsurv.org",
          jar: jar
        },
        async function(error, response, body, a) {
          // console.log("error:", error); // Print the error if one occurred
          // console.log("statusCode:", response.socket._httpMessage._header); // Print the response status code if a response was received

          request.post(
            {
              url: "https://gateway.calsurv.org",
              jar: jar,
              form: {
                txt_loginName: "mathew",
                pwd_loginPass: "02zE86OndBsYLh@s90uv",
                sbt_loginSubmit: "tt"
              }
            },
            await function(error, response, body) {
              if (error) console.log("error:", error); // Print the error if one occurred
              // console.log("statusCode2:", response);
              // console.log(jar);
              if (response) {
                // console.log(jar);
                let cookies;
                if (Array.isArray(response.headers["set-cookie"])) {
                  cookies = response.headers["set-cookie"];
                } else cookies = [Cookie.parse(response.headers["set-cookie"])];
                // console.log(cookies);

                let singles = [];
                cookies.forEach(item =>
                  item.split(";").forEach(single => singles.push(single))
                );
                // console.log(singles);
                // let finalCookie = {
                //   GATEWAYSESSID: singles[0].split("=")[1],
                //   domain: "https://maps.calsurv.org",
                //   username: "mathew",
                //   loginid: "715",
                //   authtoken: singles[9].split("=")[1]
                //   // httpOnly: true,
                //   // maxAge: 31536000
                // };
                // finalCookie.GATEWAYSESSID = "testy";
                // console.log(singles.join(""));

                let cookieJar = rp.jar();
                let finalCookie = singles.join(";");
                cookieJar.setCookie(
                  singles.join(""),
                  "https://maps.calsurv.org"
                );

                // console.log(cookieJar);

                const options = {
                  uri:
                    "https://maps.calsurv.org/invasive/data/Consolidated%20MAD/Clovis/aegypti",
                  jar: cookieJar,
                  json: true
                  // resolveWithFullResponse: true
                };

                rp(options)
                  .then(body => console.log(body))
                  .catch(err => console.log("no"));
              }
              // if (response) {
              //   // rp("https://maps.calsurv.org/invasive/data/Consolidated%20MAD/Clovis/aegypti")
              //   let options = {
              //     uri:
              //       "https://maps.calsurv.org/invasive/data/Consolidated%20MAD/Clovis/aegypti",
              //     json: true
              //   };
              //   rp(options)
              //     .then(res => console.log(res))
              //     .catch(err => console.log("god dammit"));
              // }
            }
          );
        }
      );

      // axios
      //   .post("https://gateway.calsurv.org/", {
      //     txt_loginName: "mathew",
      //     pwd_loginPass: "02zE86OndBsYLh@s90uv",
      //     sbt_loginSubmit: "Log in..."
      //   })
      //   .then(res => console.log(res))
      //   .catch(err => console.log(err));

      // axios({
      //   method: "post",
      //   url: "https://gateway.calsurv.org",
      //   data: formData,
      //   config: {
      //     headers: {
      //       "Content-Type": "multipart/form-data"
      //     }
      //   }
      // })
      //   .then(res => console.log(res))
      //   .catch(err => console.log(err));

      // axios({
      //   method: "get",
      //   url,
      //   rejectUnauthorized: false,
      //   auth: {
      //     username: "mathew",
      //     password: "02zE86OndBsYLh@s90uv"
      //   }
      // })
      //   .then(res => console.log(res))
      //   .catch(err => console.log(err));

      // fetch(
      //   `https://maps.calsurv.org/invasive/data/${f.properties.agency}/${
      //     f.properties.city
      //   }/aegypti`,
      //   {
      //     credentials: "include",
      //     headers: {},
      //     referrer: "https://maps.calsurv.org/invasive",
      //     referrerPolicy: "no-referrer-when-downgrade",
      //     body: JSON.stringify(),
      //     method: "GET",
      //     mode: "cors"
      //   }
      // )
      //   .then(res => res.json())
      //   .then(data => console.log(data))
      //   .catch(err => (err = console.log(data)));

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
      //           aegyptiGrowth: +d["Aecd ... aegypti daily population growth"]
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

    // geoJson = {
    //   type: "FeatureCollection",
    //   features: finalFeatures
    // };

    fs.writeFile("./invasiveData.json", JSON.stringify(geoJson), function(err) {
      if (err) console.log("writing to disk did not work");
    });
    console.log("finished?  see if the file is there...");
  } catch (err) {
    console.log("getData function error: " + err);
  }
}

getMyData();
