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
  curveCardinal,
  line as d3line,
  zoom as d3zoom,
  transition,
  event,
  zoomIdentity
} from "d3";
import * as d3 from "d3";
import { colors } from "./helpers";

const formatDate = timeFormat("%b %d, %Y");

export const InvasiveGraph = function(dataObj, species) {
  document.getElementById("chart--invasive").innerHTML = ""; // short term emptying thing for non-existent cities
  // if (document.getElementById("svg")) {
  //   document.getElementById("svg").remove();
  // }

  let divWidth = document.getElementById("chart--invasive").clientWidth;

  let svg = select("#chart--invasive")
    .append("svg")
    .attr("height", 400) // height should stay constant or else the axes get difficult to work with
    .attr("width", divWidth) //chart width depends on
    .attr("class", "card")
    .attr("id", "svg");

  const margin = { top: 40, right: 0, bottom: 110, left: 70 }, // for main graph
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
    obj.collections = +d["Total collections"] || 0;
    if (species === "aegypti") {
      obj.growth = +d["Ae. aegypti daily population growth"] || 0;
      obj.aegypti = +d["Ae. aegypti"] || 0;
    } else {
      obj.growth = +d["Ae. albopictus daily population growth"] || 0;
      obj.aegypti = +d["Ae. albopictus"] || 0;
    }
    data.push(obj);
  });

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
  y.domain([0, d3.max(data, d => d.growth) * 1.1]);
  y2.domain(y.domain());

  //SET AXES
  const xAxis = axisBottom(x),
    xAxis2 = axisBottom(x2).ticks(5),
    yAxis = axisLeft(y);

  const growthLine = d3line()
    .curve(curveCardinal)
    .x(d => x(d.date))
    .y(d => y(d.growth));

  // const area = d3
  //   .area()
  //   .curve(d3.curveMonotoneX)
  //   .x(d => x(d.date))
  //   .y1(d => y(d.growth))
  //   .y0(height);
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
      growth: d.growth
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
      .select(".line")
      .attr("d", growthLine);
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
      .select(".line")
      .attr("d", growthLine);

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
    .attr("transform", "rotate(-90), translate(-10,35)")
    .attr("y", 0)
    .attr("dy", "0.7em")
    .attr("text-anchor", "end")
    .text("Daily Population Growth (%)");

  let mini = context
    .append("path")
    .datum(startingArea)
    .attr("class", "area context-area")
    .attr("fill", colors["cyan"])
    .attr("d", area2)
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
    .call(xAxis2)
    .selectAll("text")
    .attr("transform", "rotate(-20)")
    .style("text-anchor", "end");

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

  brushStart = x(new Date("04-15-2017"));
  brushEnd = x(new Date("11-15-2017"));

  function setBrush() {
    select(".brush").call(brush.move, [brushStart, brushEnd]);
  }
  // const tooltip = select("#graph")
  //     .append("div")
  //     .attr("class", "toolTip")
  //     .style("opacity", 0);

  // function tipMouseover(d) {
  //   // redrawTooltip();
  //   // let color = labelZikaRisk(d.risk);

  //   const html = `<div>hello</hello>`

  //   // const html = `
  //   //           <div class='toolTip__risk' style='background:$'>
  //   //           <div class='toolTip__risk--title'> Risk Factor</div>
  //   //           <div class='toolTip__risk--value'> ${d.risk}
  //   //           </div>
  //   //           </div>
  //   //           <div class='toolTip__date'>${formatDate(d.date)}</div>
  //   //       `;
  //   tooltip
  //     .html(html)
  //     .style("left", event.pageX + 15 + "px")
  //     .style("top", event.pageY - 28 + "px")
  //     .transition()
  //     .duration(500)
  //     .style("opacity", 0.9);
  // }

  // function tipMouseout(tooltip) {
  //   tooltip
  //     .transition()
  //     .duration(300)
  //     .style("opacity", 0);
  // }

  setBrush();

  //append the area element
  // let growthArea = graph
  //   .append("path")
  //   .datum(startingArea)
  //   .attr("class", "area focus-area")
  //   .attr("fill", "none")
  //   .attr("d", area)
  //   .transition()
  //   .duration(1000)
  //   .attrTween("d", function() {
  //     const interpolator = d3.interpolateArray(startingArea, data);
  //     return function(t) {
  //       return area(interpolator(t));
  //     };
  //   });

  //add hover events for the area graph to make it easier to see
  // select(".focus-area")
  //   .on("mouseover", highlightArea)
  //   .on("mouseout", resetArea);

  const labelTransition = d3
    .transition()
    .delay(0)
    .duration(1000);

  // function highlightArea(d) {
  //   select(".focus-area").moveToFront();
  //   select(".area").classed("areaHighlighted", true);
  //   select(".context-area").classed("areaHighlighted", true);

  //   select("#growth-label")
  //     .transition(labelTransition)
  //     .attr("fill", colors["dark-blue"])
  //     .style("font-size", "24px")
  //     .attr("transform", "rotate(-90), translate(-150, 30)");
  //   select("#collections-label")
  //     .transition(labelTransition)
  //     .style("font-size", "12px")
  //     .attr("fill", colors["light-blue"])
  //     .attr("transform", "rotate(-90), translate(-200, -40)");
  // }

  // function resetArea(d, i) {
  //   select(".focus-area").moveToBack();
  //   select(".area").classed("areaHighlighted", false);
  //   select(".context-area").classed("areaHighlighted", false);
  //   select("#growth-label")
  //     .transition(labelTransition)
  //     .attr("fill", colors["light-blue"])
  //     .style("font-size", "12px")
  //     .attr("transform", "rotate(-90), translate(-200, 30)");

  //   select("#collections-label")
  //     .transition(labelTransition)
  //     .style("font-size", "24px")
  //     .attr("fill", colors["dark-blue"])
  //     .attr("transform", "rotate(-90), translate(-140, -40)");
  // }

  //draw the stacked bars
  const stack = d3.stack().keys(["aegypti", "collections"]);
  let dataStack = stack(data);

  let yMax = d3.max(dataStack, y => d3.max(y, d => d[1]));
  if (yMax < 10) yMax = 10;

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
    .attr("transform", "rotate(-90), translate(0,-45)")
    // .attr("class", "collections--label")
    .attr("id", "collections-label")
    .text("Collections");

  function calculateAWeek() {
    // the x scaled version of one week minus one pixel
    return x(new Date("2018-01-08")) - x(new Date("2018-01-01"));
  }

  // console.log("one weeks width is " + oneWeek);
  var barColors = [colors["dark-red"], colors["purple"]];
  if (species !== "aegypti") barColors[0] = colors["blue"];
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
        return "collectionBar collectionBar__aegypti";
      } else return "collectionBar collectionBar__total";
    })
    // .on("mouseover", d => console.log(d));
    .on("mouseover", d => tipMouseover(d))
    .on("mouseout", d => tipMouseout(tooltip));

  // .on('mouseover', d => {
  //   tooltip.transition().duration(200).style("opacity", .9);
  //   tooltip.html(formatDate(d.date) + "<br/>" + d.aegypti)
  //   .style("left", (event.pageX) + "px")
  //   .style("top", (event.pageY - 28) + "px");
  //   console.log('moused over!')
  // });
  // .on('mouseout');

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
        return "miniCollectionBar miniCollectionBar__aegypti";
      } else return "miniCollectionBar miniCollectionBar__total";
    });

  let startingLine = [[0, 0], [200, 100]];

  let growthLineElement = graph
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", growthLine)
    .style("stroke", colors["light-blue"]);

  var t = d3
    .transition()
    .delay(1000)
    .duration(1000);

  d3
    .selectAll(".collectionBar__aegypti")
    .transition(t)
    .attr("height", d => height - collectionsScale(d[1] - d[0]))
    .attr("y", d => collectionsScale(d[1]));
  d3
    .selectAll(".collectionBar__total")
    .transition()
    .delay(1800)
    .duration(800)
    .attr("height", d => height - collectionsScale(d[1] - d[0]))
    .attr("y", d => collectionsScale(d[1]));

  let tooltip = select("#chart--invasive")
    .append("div")
    .attr("class", "toolTip toolTip-invasive")
    .style("opacity", 0);

  // function redrawTooltip() {
  //   if (document.querySelector(".toolTip")) {
  //     select(".toolTip").remove();
  //   }

  //   tooltip = select("#chart--invasive")
  //     .append("div")
  //     .attr("class", "toolTip")
  //     .style("opacity", 0);
  // }

  // console.log(window.visualViewport.width);
  function tipMouseover(d) {
    // const rightEdge = window.visualViewport.width;

    // let leftPos = event.pageX + 300 > rightEdge ? rightEdge - 300 : event.pageX;

    // if (event.pageX + 300 > rightEdge) {
    //   leftPos = rightEdge - 300;
    // } else leftPos = event.pageX;

    const html = `
        <div class="toolTip-invasive__data">
          <div class="toolTip-invasive__data--collections">
            <div class="toolTip-invasive__data--collections--total"> ${
              d.data.collections
            } Other Collections</div>
            <div class="toolTip-invasive__data--collections--aegypti"> ${
              d.data.aegypti
            } Aegypti Collections</div>
          </div>
          <div class="toolTip-invasive__data--growth">
            <div class="toolTip-invasive__data--growth--value">${
              d.data.growth
            }%</div>
            <div class="toolTip-invasive__data--growth--label">Projected Growth</div>
          </div>
        </div>
        <div class="toolTip-invasive__date">
          ${formatDate(d.data.date)}
        </div>
    `;

    tooltip
      .html(html)
      .style("left", "800px")
      .style("top", "200px")
      .transition()
      .duration(500)
      .style("opacity", 0.9);
  }

  function tipMouseout(tooltip) {
    tooltip
      .transition()
      .duration(300)
      .style("opacity", 0);
  }
};
