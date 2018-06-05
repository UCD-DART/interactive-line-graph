var map, mapCanvas, bounds;
var layers = [];
var markers = [];

var color = function(type) {
  var values = {
    "Ae. aegypti": "#f4a582",
    "Ae. aegypti daily population growth": "#ca0020",
    "Ae. albopictus": "#92c5de",
    "Ae. albopictus daily population growth": "#0571b0",
    "Total collections": "grey",
    both: "#b2abd2",
    surveillance: "#b8e186"
  };
  return values[type];
};

depthOf = function(object) {
  var level = 1;
  var key;
  for (key in object) {
    if (!object.hasOwnProperty(key)) continue;

    if (typeof object[key] == "object") {
      var depth = depthOf(object[key]) + 1;
      level = Math.max(depth, level);
    }
  }
  return level;
};

function _decodeCoordinates(coordinates) {
  if (typeof coordinates.point == "undefined") {
    if (coordinates.constructor == Array) {
      var container = [];
      for (i in coordinates) {
        var g = _decodeCoordinates(coordinates[i]);
        container.push(g);
      }
      return container;
    }
  } else {
    var points = google.maps.geometry.encoding.decodePath(coordinates.point);
    var pointContainer = [];
    for (point in points) {
      pointContainer.push([points[point].lng(), points[point].lat()]);
    }
    return pointContainer;
  }
}

function decodeGeometry(geometry) {
  var g = geometry;
  var newCoordinates = _decodeCoordinates(geometry.coordinates);
  if (depthOf(newCoordinates) == 3) {
    g.type = "Polygon";
  } else {
    g.type = "MultiPolygon";
  }
  g.coordinates = newCoordinates;
  return g;
}

function initialize() {
  $(".legend-minimizer, .legend-maximizer").click(function() {
    $(this)
      .parent()
      .parent()
      .toggleClass("legendMaximized", 1000);
    $(this)
      .parent()
      .parent()
      .toggleClass("legendMinimized", 1000);
  });
  $(".layersCheckbox").click(function() {
    if ($(this).is(":checked")) {
      showLayer(layers[$(this).attr("id")]);
    } else {
      hideLayer(layers[$(this).attr("id")]);
    }
  });
  mapCanvas = document.getElementById("map");
  var mapOptions = {
    center: new google.maps.LatLng(37, -120.65161),
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(mapCanvas, mapOptions);

  $("#page_loader").show();
  //map.data.loadGeoJson('/invasive/layer/', null, function(df) { console.log(df);$('#page_loader').hide(); });
  var promise = $.getJSON("/invasive/layer");
  promise.then(function(data) {
    cachedGeoJson = data; //save the geojson in case we want to update its values
    for (var i = 0; i < cachedGeoJson.features.length; i++) {
      var g = decodeGeometry(cachedGeoJson.features[i].geometry);
      cachedGeoJson.features[i].geometry = g;
    }
    map.data.addGeoJson(cachedGeoJson);
    $("#page_loader").hide();
  });
  map.data.addListener("click", function(e) {
    if (!map.infoWindow) map.infoWindow = new google.maps.InfoWindow();
    var city = e.feature.getProperty("city");
    var agency = e.feature.getProperty("agency");

    var myHTML =
      "</strong><br/>City: <strong>" +
      e.feature.getProperty("city") +
      "</strong><br/>County: <strong>" +
      e.feature.getProperty("county") +
      "</strong><br/>Agency: <strong>" +
      e.feature.getProperty("agency") +
      "</strong>";
    if (e.feature.getProperty("website")) {
      myHTML +=
        '<br/>Website: <strong><a href="' +
        e.feature.getProperty("website") +
        '" target="_blank">' +
        e.feature.getProperty("website") +
        "</a></strong>";
    }
    if (e.feature.getProperty("surveillance_start")) {
      myHTML +=
        "<br/>Surveillance Start: <strong>" +
        e.feature.getProperty("surveillance_start") +
        "</strong>";

      var shown = false;
      if (parseInt(e.feature.getProperty("aegypti_detections")) > 0) {
        shown = true;
        myHTML +=
          "<br/><br/><strong>Ae. aegypti</strong><br/>Detections: <strong>" +
          e.feature.getProperty("aegypti_detections") +
          "</strong><br/>First Found: <strong>" +
          e.feature.getProperty("aegypti_first_found") +
          "</strong><br/>Last Found: <strong>" +
          e.feature.getProperty("aegypti_last_found") +
          "</strong>";
        if (LOGGED_IN)
          myHTML +=
            '<br/><a href="/invasive/data/' +
            agency +
            "/" +
            city +
            '/aegypti" class="chartLink">Chart (BETA)</a>';
      }
      if (parseInt(e.feature.getProperty("albopictus_detections")) > 0) {
        shown = true;
        myHTML +=
          "<br/><br/><strong>Ae. albopictus</strong><br/>Detections: <strong>" +
          e.feature.getProperty("albopictus_detections") +
          "</strong><br/>First Found: <strong>" +
          e.feature.getProperty("albopictus_first_found") +
          "</strong><br/>Last Found: <strong>" +
          e.feature.getProperty("albopictus_last_found") +
          "</strong>";
        if (LOGGED_IN)
          myHTML +=
            '<br/><a href="/invasive/data/' +
            agency +
            "/" +
            city +
            '/albopictus" class="chartLink">Chart (BETA)</a>';
      }
      if (LOGGED_IN && !shown) {
        myHTML +=
          '<br/><br/><a href="/invasive/data/' +
          agency +
          "/" +
          city +
          '/s" class="chartLink">Chart (BETA)</a>';
      } else if (!LOGGED_IN) {
        myHTML +=
          '<br/><br/><a href="/invasive/data/' +
          agency +
          "/" +
          city +
          '/rr" class="chartLink">Chart (BETA)</a>';
      }
    } else {
      myHTML +=
        '<br/><br/><a href="/invasive/data/' +
        agency +
        "/" +
        city +
        '/rr" class="chartLink">Chart (BETA)</a>';
    }
    map.infoWindow.setContent("<div>" + myHTML + "</div>");
    map.infoWindow.setPosition(e.latLng);
    map.infoWindow.open(map);
    map.infoWindow.addListener("domready", function() {
      $(".chartLink")
        .unbind("click")
        .click(function() {
          var split = $(this)
            .attr("href")
            .split("/")
            .slice(-3);
          var agency = split[0];
          var city = split[1];
          var type = split[2];
          getInfo(agency, city, type);
          return false;
        });
    });
  });
  map.data.setStyle(function(feature) {
    var aegypti = parseInt(feature.getProperty("aegypti_detections")) > 0;
    var albopictus = parseInt(feature.getProperty("albopictus_detections")) > 0;
    var surveillance = feature.getProperty("surveillance_start");
    var c;
    if (aegypti && albopictus) {
      c = "purple";
    } else if (aegypti) {
      c = "red";
    } else if (albopictus) {
      c = "blue";
    } else if (surveillance) {
      c = "green";
    } else {
      c = "gray";
    }

    return {
      fillColor: c,
      strokeWeight: 1,
      strokeColor: c
    };
  });
  initAutocomplete();
}

function initAutocomplete() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById("pac-input");
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", function() {
    searchBox.setBounds(map.getBounds());
  });

  // [START region_getplaces]
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
  // [END region_getplaces]
}

function getInfo(agency, city, type) {
  tb_show();

  TB_WIDTH = 1000;
  TB_HEIGHT = 550;
  var type_name;

  if (type == "aegypti" || type == "rr" || type == "s")
    type_name = "Ae. aegypti";
  else if (type == "albopictus") type_name = "Ae. albopictus";

  var $tbLoad = $("#TB_load");
  var $tbWindow = $("#TB_window").css("max-width", "auto");
  var $tbBody = $('<div class="chart-body"></div>').appendTo($tbWindow);
  var tbBody = $tbBody[0];
  var $tbCaption = $(
    '<div id="TB_caption"><div id="TB_secondLine"></div></div>'
  ).appendTo($tbWindow);
  var $tbCloseDiv = $(
    '<div id="TB_closeWindow"><a href="#" id="TB_closeWindowButton" title="Close">close</a> or Esc Key</div>'
  ).appendTo($tbWindow);

  var width = 980;
  var height = 500;
  var margin = { top: 20, right: 50, bottom: 110, left: 50 };
  var margin2 = { top: 430, right: 50, bottom: 30, left: 50 };
  var chartWidth = width - margin.left - margin.right;
  var chartHeight = height - margin.top - margin.bottom;
  var chartHeight2 = height - margin2.top - margin2.bottom;

  var container = d3.select(tbBody);
  container
    .append("h1")
    .attr("class", "cityTitle")
    .html(city);

  var x = d3.scaleTime().range([0, chartWidth]);
  var y = d3.scaleLinear().rangeRound([chartHeight, 0]);
  var yRR = d3.scaleLinear().rangeRound([chartHeight, 0]);

  var xOverview = d3.scaleTime().range([0, chartWidth]);
  var yRROverview = d3.scaleLinear().rangeRound([chartHeight2, 0]);
  var yOverview = d3.scaleLinear().rangeRound([chartHeight2, 0]);

  var xAxis = d3.axisBottom(x),
    xAxisOverview = d3.axisBottom(xOverview),
    yAxis = d3.axisLeft(y),
    yRRAxis = d3.axisRight(yRR);

  var parseDate = d3.timeParse("%Y-%m-%d");

  var types = type == "rr" ? [] : [type_name, "Total collections"];
  if (type == "s") types = ["Total collections"];
  var reproductiveRates =
    type == "rr" || type == "s"
      ? [
          "Ae. aegypti daily population growth",
          "Ae. albopictus daily population growth"
        ]
      : [type_name + " daily population growth"];

  var tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-10, 0])
    .html(function(d, a, b, c) {
      if (!d) return;
      var output =
        "<strong>Year:</strong> <span>" +
        d.year +
        "</span><br/><strong>Week:</strong> <span>" +
        d.week +
        "</span>";
      var total = 0;

      for (i in types) {
        var t = types[i];
        var value = t in d ? d[t] : 0;
        total += value;
        output += "<br/><strong>" + t + ":</strong> <span>" + value + "</span>";
      }

      if (type == "rr" || type == "s") {
        aegypti = d["Ae. aegypti daily population growth"]
          ? d["Ae. aegypti daily population growth"].toFixed(1) + "%"
          : "No Data Available";
        albopictus = d["Ae. albopictus daily population growth"]
          ? d["Ae. albopictus daily population growth"].toFixed(1) + "%"
          : "No Data Available";
        output +=
          "<br/><br/><strong>Ae. aegypti daily population growth:</strong> <span>" +
          aegypti +
          "</span><br/><strong>Ae. albopictus daily population growth:</strong> <span>" +
          albopictus +
          "</span>";
      } else {
        output += "<br/><strong>Total:</strong> <span>" + total + "</span>";

        value = d[type_name + " daily population growth"]
          ? d[type_name + " daily population growth"].toFixed(1) + "%"
          : "No Data Available";
        output +=
          "<br/><br/><strong>" +
          type_name +
          " daily population growth:</strong> <span>" +
          value +
          "</span>";
      }
      return output;
    });

  var brush = d3
    .brushX()
    .extent([[0, 0], [chartWidth, chartHeight2]])
    .on("brush", brushed);

  var legendContainer = container
    .append("svg")
    .attr("class", "legendContainer")
    .attr("width", 252)
    .attr("height", 125);

  var legendG = legendContainer.append("g").attr("class", "legendG");

  var svg = container
    .append("svg")
    .attr("class", "chart")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", chartWidth)
    .attr("height", chartHeight);

  svg
    .select("defs")
    .append("clipPath")
    .attr("id", "clipOverview")
    .append("rect")
    .attr("width", chartWidth)
    .attr("height", chartHeight2);

  var blurFilter = svg
    .select("defs")
    .append("filter")
    .attr("id", "drop-shadow")
    .attr("height", "130%");

  blurFilter
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 1)
    .attr("result", "blur");

  blurFilter
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", 1)
    .attr("dy", 1)
    .attr("result", "offsetBlur");

  var feMerge = blurFilter.append("feMerge");

  feMerge.append("feMergeNode").attr("in", "offsetBlur");

  feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  svg.call(tip);

  var main = svg
    .append("g")
    .attr("class", "main")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var overview = svg
    .append("g")
    .attr("class", "overview")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  var reproductiveRate = d3
    .line()
    .x(function(d) {
      return x(parseDate(d.end_date));
    })
    .y(function(d) {
      return yRR(d[type_name + " daily population growth"]);
    })
    .curve(d3.curveMonotoneX);

  var reproductiveRateOverview = d3
    .line()
    .x(function(d) {
      return x(parseDate(d.end_date));
    })
    .y(function(d) {
      return yRROverview(d[type_name + " daily population growth"]);
    })
    .curve(d3.curveMonotoneX);

  var bars = main.insert("g").attr("class", "bars");
  var reproductiveRate2, reproductiveRate2Overview;

  var reproductiveRatePath = main.append("path");
  var oReproductiveRatePath;

  var reproductiveRatePath2 = main.append("path");
  var oReproductiveRatePath2;

  if (type == "rr" || type == "s") {
    reproductiveRate2 = d3
      .line()
      .x(function(d) {
        return x(parseDate(d.end_date));
      })
      .y(function(d) {
        return yRR(d["Ae. albopictus daily population growth"]);
      })
      .curve(d3.curveMonotoneX);

    reproductiveRate2Overview = d3
      .line()
      .x(function(d) {
        return x(parseDate(d.end_date));
      })
      .y(function(d) {
        return yRROverview(d["Ae. albopictus daily population growth"]);
      })
      .curve(d3.curveMonotoneX);
  }

  d3.json("/invasive/data/" + agency + "/" + city + "/" + type, function(data) {
    var stack = d3.stack().keys(types);
    var stackedData = stack(data);

    x.domain(
      d3.extent(data, function(d) {
        return parseDate(d.end_date);
      })
    );
    y.domain([
      0,
      d3.max(data, function(d) {
        var total = 0;
        for (c in types) {
          total += d[types[c]];
        }
        return total;
      })
    ]);

    yRR.domain([
      0,
      d3.max(data, function(d) {
        if (type == "rr" || type == "s") {
          return d["Ae. albopictus daily population growth"] >
            d["Ae. aegypti daily population growth"]
            ? d["Ae. albopictus daily population growth"]
            : d["Ae. aegypti daily population growth"];
        } else return d[type_name + " daily population growth"];
      })
    ]);
    xOverview.domain(x.domain());
    yOverview.domain(y.domain());
    yRROverview.domain(yRR.domain());

    main
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(xAxis);

    var yx = main
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("fill", "#000");
    if (type != "rr" && type != "ss") {
      yx.text("Count");
    }

    main
      .append("g")
      .attr("class", "yrr axis")
      .attr("transform", "translate(" + chartWidth + ",0)")
      .call(yRRAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 35)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("fill", "#000")
      .text("Daily Population Growth (%)");

    main
      .append("rect")
      .attr("class", "overlay")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .on("mouseover", function() {
        tip.show();
      })
      .on("mouseout", function() {
        tip.hide();
      })
      .on("mousemove", mousemove);

    bars
      .selectAll(".bar.stack")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "bar stack")
      .attr("fill", function(d) {
        return color(d.key);
      })
      .selectAll("rect")
      .data(function(d) {
        return d;
      })
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("width", chartWidth / data.length)
      .attr("x", function(d) {
        return x(parseDate(d.data.start_date));
      })
      .attr("y", function(d) {
        return y(d[1]);
      })
      .attr("height", function(d) {
        return y(d[0]) - y(d[1]);
      })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .attr("actualdata", function(d) {
        return d.data.start_date + " " + d.data.end_date;
      })
      .attr("end_date", function(d) {
        return d.data.end_date;
      });

    overview
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + chartHeight2 + ")")
      .call(xAxisOverview);

    overview
      .append("g")
      .attr("class", "bars")
      .selectAll(".bar.stack")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "bar stack")
      .attr("fill", function(d) {
        return color(d.key);
      })
      .selectAll("rect")
      .data(function(d) {
        return d;
      })
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return xOverview(parseDate(d.data.end_date));
      })
      .attr("width", chartWidth / data.length)
      .attr("y", function(d) {
        return yOverview(d[1]);
      })
      .attr("height", function(d) {
        return yOverview(d[0]) - yOverview(d[1]);
      });

    oReproductiveRatePath = overview.append("path");
    oReproductiveRatePath2 = overview.append("path");

    overview
      .append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", chartHeight2 + 7);

    // add daily population growths

    if (type == "rr" || type == "s") {
      reproductiveRatePath
        .data([data])
        .attr("d", reproductiveRate)
        .attr("stroke", color("Ae. aegypti daily population growth"))
        .style("filter", "url(#drop-shadow)")
        .attr("class", "poly RR aegyptiRR");

      oReproductiveRatePath
        .data([data])
        .attr("d", reproductiveRateOverview)
        .attr("stroke", color("Ae. aegypti daily population growth"))
        .style("filter", "url(#drop-shadow)")
        .attr("class", "poly RR aegyptiRR");

      reproductiveRatePath2
        .data([data])
        .attr("d", reproductiveRate2)
        .attr("stroke", color("Ae. albopictus daily population growth"))
        .style("filter", "url(#drop-shadow)")
        .attr("class", "poly RR albopictusRR");

      oReproductiveRatePath2
        .data([data])
        .attr("d", reproductiveRate2Overview)
        .attr("stroke", color("Ae. albopictus daily population growth"))
        .style("filter", "url(#drop-shadow)")
        .attr("class", "poly RR albopictusRR");
    } else {
      reproductiveRatePath
        .data([data])
        .attr("d", reproductiveRate)
        .attr("stroke", color(type_name + " daily population growth"))
        .style("filter", "url(#drop-shadow)")
        .attr("class", "poly RR " + type + "RR");

      oReproductiveRatePath
        .data([data])
        .attr("d", reproductiveRateOverview)
        .attr("stroke", color(type_name + " daily population growth"))
        .style("filter", "url(#drop-shadow)")
        .attr("class", "poly RR " + type + "RR");
    }

    var legendBox = legendG
      .append("rect")
      .attr("x", 10)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", "1px")
      .attr("width", 210)
      .attr("height", 95);

    var legendText = legendG
      .append("text")
      .attr("x", 15)
      .attr("y", 17)
      .style("font", "15px sans-serif")
      .style("font-weight", "bold")
      .text("Legend");

    var legend = legendG
      .selectAll(".legend")
      .data(types.concat(reproductiveRates))
      .enter()
      .append("g")
      .attr("x", 15)
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        return "translate(0," + parseInt(25 + i * 20) + ")";
      })
      .style("font", "10px sans-serif");

    legend
      .append("rect")
      .attr("x", 210 - 18)
      .attr("width", 18)
      .attr("height", function(d) {
        return d.match(/daily population growth/) ? 1.5 : 18;
      })
      .attr("transform", function(d) {
        return d.match(/daily population growth/) ? "translate(0, 8)" : "";
      })
      .attr("fill", color);

    legend
      .append("text")
      .attr("x", 15)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) {
        return d;
      });

    //brush.extent([[xOverview.invert(.2*chartWidth),0], [xOverview.invert(.7*chartWidth), chartHeight2]]);
    startDate = new Date(new Date().getFullYear() - 1, 0, 1);
    d3.select(".brush").call(brush.move, [x(startDate), chartWidth]);
  });

  function brushed() {
    var s = d3.event.selection || xOverview.range();
    x.domain(s.map(xOverview.invert, xOverview));
    main
      .selectAll(".bar.stack rect")
      .attr("x", function(d) {
        return x(parseDate(d.data.start_date));
      })
      .attr("width", function(d) {
        var ed = parseDate(d.data.end_date);
        ed.setDate(ed.getDate() + 1);
        return x(ed) - x(parseDate(d.data.start_date));
      });

    if (type == "rr" || type == "s") {
      main.selectAll("path.aegyptiRR").attr("d", reproductiveRate);
      main.selectAll("path.albopictusRR").attr("d", reproductiveRate2);
    } else {
      main.selectAll("path." + type + "RR").attr("d", reproductiveRate);
    }
    main.select(".x.axis").call(xAxis);
  }

  var bisectDate = d3.bisector(function(d) {
    return parseDate(d.end_date);
  }).left;

  function mousemove() {
    var data = reproductiveRatePath.data()[0];
    var mouse = d3.mouse(this);
    var x0 = x.invert(mouse[0]);
    var i = bisectDate(data, x0);
    var d0 = data[i - 1];
    var d1 = data[i];
    var d = x0 - parseDate(d0.date) > parseDate(d1.date) - x0 ? d1 : d0;
    if (d) tip.show(d);
  }

  $("#TB_closeWindowButton").bind("click.thickbox", function() {
    tb_remove();
  });
  $(document).keyup(function(e) {
    if (e.keyCode === 27) $("#TB_closeWindowButton").trigger("click.thickbox"); // esc
  });
  $tbLoad.remove();
  $tbWindow.show();
  tb_position();

  return false;
}

google.maps.event.addDomListener(window, "load", initialize);
