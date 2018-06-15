import {
  timeFormat,
  scaleTime,
  scaleLinear,
  extent,
  select,
  selectAll,
  axisBottom,
  axisLeft,
  axisRight,
  brushX,
  zoom as d3zoom,
  transition,
  event,
  zoomIdentity
} from "d3";
import * as d3 from "d3";
import { colors } from "./helpers";

// const formatDate = timeFormat("%b %d, %Y");

export const InvasiveGraph = function(dataObj, species) {
  if (document.getElementById("svg")) {
    document.getElementById("svg").remove();
  }

  let divWidth = document.getElementById("chart--invasive").clientWidth;

  let svg = select("#chart--invasive")
    .append("svg")
    .attr("height", 400) // height should stay constant or else the axes get difficult to work with
    .attr("width", divWidth) //chart width depends on
    .attr("class", "card")
    .attr("id", "svg");

  const margin = { top: 20, right: 0, bottom: 110, left: 70 }, // for main graph
    margin2 = { top: 320, right: 50, bottom: 40, left: 50 }, //for context
    height = +svg.attr("height") - margin.top - margin.bottom,
    width = +svg.attr("width") - margin.left - margin.right,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom,
    chartWidth = width - margin.left - margin.right;

  let graph;

  let data = [];
  dataObj.forEach(d => {
    let obj = {};
    obj.date = new Date(d.start_date);
    if (d["Ae. aegypti daily population growth"]) {
      obj.growth =
        d["Ae. aegypti daily population growth"] > 0
          ? +d["Ae. aegypti daily population growth"]
          : 0;
    } else {
      obj.growth =
        d["Ae. albopictus daily population growth"] > 0
          ? +d["Ae. albopictus daily population growth"]
          : 0;
    }
    obj.aegypti = d["Ae. aegypti"] || 0;
    obj.collections = d["Total collections"] || 0;
    data.push(obj);
  });

  // console.log(data);

  // add to the selection prototype methods
  d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
      this.parentNode.appendChild(this);
    });
  };
  d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
      var firstChild = this.parentNode.firstChild;
      if (firstChild) {
        this.parentNode.insertBefore(this, firstChild);
      }
    });
  };

  //draw the g container
  const g = svg
    .append("g")
    .attr("class", "container")
    .attr("transform", `translate( ${margin.left}, ${margin.top})`);

  //set the scales for the area graphs
  const x = scaleTime().range([0, chartWidth]);
  const x2 = scaleTime().range([0, chartWidth]);
  const y = scaleLinear()
    .range([height, 0])
    .clamp(true);
  // y.domain(extent(data, d => d.growth));
  const y2 = scaleLinear()
    .range([height2, 0])
    .clamp(true);

  x.domain(extent(data, d => d.date));
  x2.domain(x.domain());
  y.domain([0, d3.max(data, d => d.growth)]);
  y2.domain(y.domain());

  //SET AXES
  const xAxis = axisBottom(x),
    xAxis2 = axisBottom(x2),
    yAxis = axisLeft(y);

  const area = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x(d => x(d.date))
    .y1(d => y(d.growth))
    .y0(height);
  const area2 = d3
    .area()
    .curve(d3.curveMonotoneX)
    .x(d => x2(d.date))
    .y1(d => y2(d.growth))
    // .y1(height2)
    .y0(height2);

  const startingArea = data.map(d => {
    return {
      date: d.date,
      growth: 0
    };
  });

  // INIT ZOOM
  const zoom = d3zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [chartWidth, height]])
    .extent([[0, 0], [chartWidth, height]])
    .on("zoom", zoomed);

  // INIT BRUSH just on X axis
  let brushStart, brushEnd;
  const brush = brushX()
    .extent([[0, 0], [chartWidth, height2]])
    .on("brush end", brushed);

  function brushed() {
    if (event.sourceEvent && event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    const s = event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    select(".graph")
      .datum(data)
      .select(".area")
      .attr("d", area);
    // console.log(area);

    d3.selectAll(".collectionBar").attr("x", d => x(d.data.date));
    selectAll(".miniCollectionBar").attr("x", d => x2(d.data.date));

    select(".focus")
      .select(".axis--x")
      .call(xAxis);
    svg
      .select(".zoom")
      .call(
        zoom.transform,
        zoomIdentity.scale(chartWidth / (s[1] - s[0])).translate(-s[0], 0)
      );
  }

  function zoomed() {
    if (event.sourceEvent && event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    const t = event.transform;
    x.domain(t.rescaleX(x2).domain());

    select(".graph")
      .select(".area")
      .attr("d", area);

    select(".focus")
      .select(".axis--x")
      .call(xAxis);

    selectAll(".collectionBar").attr("x", d => x(d.data.date));
    // This call here was messing up the brush.  Works on Zika map.  IF brush is broken, this might be necessary
    select(".context")
      .select(".brush")
      .call(brush.move, x.range().map(t.invertX, t));
  }

  const container = svg
    .append("g")
    .attr("class", "chartContainer")
    .attr("id", "chartContainer")
    .attr("height", +svg.attr("height"))
    .attr("width", +svg.attr("width"));

  //make only the needed SVG visible
  //append the top clip path to the svg, give it the clip path attribute linked to the clip element above
  const clip = container
    .append("defs")
    .append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", chartWidth)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

  graph = container
    .append("g")
    .attr("class", "graph")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("clip-path", "url(#clip)");

  // append the top chart
  const focus = container
    .append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // append the bottom chart
  const context = container
    .append("g")
    .attr("class", "context")
    .attr("id", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  //draw the axes
  focus
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "axis--x")
    .call(axisBottom(x).ticks(6));
  focus
    .append("g")
    .call(axisRight(y))
    .attr("transform", `translate( ${chartWidth}, 0)`)
    .attr("class", "axis axis--growth")
    .append("text")
    .attr("id", "growth-label")
    .attr("fill", colors["cyan"])
    .attr("transform", "rotate(-90), translate(-160,30)")
    .attr("y", 6)
    .attr("dy", "0.7em")
    .attr("text-anchor", "end")
    .text("Growth (%)");

  let mini = context
    .append("path")
    .datum(startingArea)
    .attr("class", "area context-area")
    .attr("fill", colors["cyan"])
    .attr("d", area)
    .transition()
    .duration(2500)
    .attrTween("d", function() {
      const interpolator = d3.interpolateArray(startingArea, data);
      return function(t) {
        return area2(interpolator(t));
      };
    });

  // bottom chart gets x axis with xAxis2
  context
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

  // big gray brush element is applied to the bottom chart
  context
    .append("g")
    .attr("class", "brush")
    .call(brush)
    .call(brush.move, x.range());

  svg
    .append("rect")
    .attr("class", "zoom")
    .attr("width", chartWidth)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);

  brushStart = x(new Date("04-15-2016"));
  brushEnd = x(new Date("11-15-2016"));

  function setBrush() {
    select(".brush").call(brush.move, [brushStart, brushEnd]);
  }

  setBrush();

  //append the area element
  let growthArea = graph
    .append("path")
    .datum(startingArea)
    .attr("class", "area focus-area")
    .attr("fill", colors["cyan"])
    .attr("d", area)
    .transition()
    .duration(1000)
    .attrTween("d", function() {
      const interpolator = d3.interpolateArray(startingArea, data);
      return function(t) {
        return area(interpolator(t));
      };
    });

  //add hover events for the area graph to make it easier to see
  select(".focus-area")
    .on("mouseover", highlightArea)
    .on("mouseout", resetArea);

  function highlightArea(d) {
    select(".focus-area").moveToFront();
    select(".area").classed("areaHighlighted", true);
    select(".context-area").classed("areaHighlighted", true);
    select("#growth-label")
      .attr("fill", colors["dark-blue"])
      .attr("stroke-width", 4);
  }

  function resetArea(d, i) {
    select(".focus-area").moveToBack();
    select(".area").classed("areaHighlighted", false);
    select(".context-area").classed("areaHighlighted", false);
    select("#growth-label")
      .attr("fill", colors["light-blue"])
      .attr("stroke-width", 4);
  }

  //draw the stacked bars
  const stack = d3.stack().keys(["aegypti", "collections"]);
  let dataStack = stack(data);

  let yMax = d3.max(dataStack, y => d3.max(y, d => d[1]));
  let collectionsScale = d3
    .scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);
  let collectionsAxis = d3.axisLeft(collectionsScale);
  let miniCollectionsScale = scaleLinear()
    .domain([0, yMax])
    .range([height2, 0]);

  focus
    .append("g")
    .call(collectionsAxis)
    .attr("class", "axis")
    .append("text")
    .attr("transform", "rotate(-90), translate(-160,-50)")
    .attr("class", "collections--label")
    .text("Collections");

  function calculateAWeek() {
    return x(new Date("2018-01-06")) - x(new Date("2018-01-01"));
  }

  // console.log("one weeks width is " + oneWeek);
  var barColors = [colors["dark-red"], colors["deep-purple"]];
  var series = graph
    .selectAll(".series")
    .data(dataStack)
    .enter()
    .append("g")
    .attr("fill", (d, i) => barColors[i])
    .attr("id", (d, i) => i);

  var rect = series
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => x(new Date(d.data.date)))
    // .attr("y", d => collectionsScale(d[1]))
    .attr("y", d => collectionsScale(d[0]))
    .attr("width", calculateAWeek())
    // .attr("height", d => height - collectionsScale(d[1] - d[0]))
    .attr("height", 0)
    .attr("class", function() {
      if (this.parentElement.id == 0) {
        return "collectionBar aegypti";
      } else return "collectionBar total";
    });

  var miniSeries = context
    .selectAll(".series")
    .data(dataStack)
    .enter()
    .append("g")
    .attr("fill", (d, i) => barColors[i])
    .attr("id", (d, i) => `mini${i}`);

  var miniRects = miniSeries
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => x2(new Date(d.data.date)))
    .attr("y", d => miniCollectionsScale(d[1]))
    .attr("width", 1)
    .attr("height", d => height2 - miniCollectionsScale(d[1] - d[0]))
    .attr("class", function() {
      if (this.parentElement.id == "mini1") {
        return "miniCollectionBar miniAegypti";
      } else return "miniCollectionBar miniTotal";
    });

  var t = d3
    .transition()
    .delay(1000)
    .duration(1000);

  d3
    .selectAll(".aegypti")
    .transition(t)
    .attr("height", d => height - collectionsScale(d[1] - d[0]))
    .attr("y", d => collectionsScale(d[1]));
  d3
    .selectAll(".total")
    .transition()
    .delay(1800)
    .duration(800)
    .attr("height", d => height - collectionsScale(d[1] - d[0]))
    .attr("y", d => collectionsScale(d[1]));
};
