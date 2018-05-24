import {
  timeFormat,
  scaleTime,
  scaleLog,
  scaleLinear,
  extent,
  select,
  axisBottom,
  axisLeft,
  axisRight,
  brushX,
  zoom as d3zoom,
  line as d3line,
  curveCardinal,
  curveCatmullRom,
  transition,
  easeLinear,
  event,
  zoomIdentity
} from "d3";
import * as d3 from "d3";
import { colors } from "./helpers";

const formatDate = timeFormat("%b %d, %Y");

export const InvasiveGraph = function(divId, dataObj, divWidth) {
  if (document.getElementById("svg")) {
    document.getElementById("svg").remove();
  }

  let svg = select("#chart--invasive")
    .append("svg")
    .attr("height", 400) // height should stay constant or else the axes get difficult to work with
    .attr("width", divWidth) //chart width depends on
    .attr("class", "card")
    .attr("id", "svg");

  const margin = { top: 20, right: 0, bottom: 110, left: 50 }, // for main graph
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
    obj.growth =
      d["Ae. aegypti daily population growth"] > 0
        ? +d["Ae. aegypti daily population growth"]
        : 1;
    if (d.year >= 2016) data.push(obj);
  });

  console.log(data);

  //draw the g container
  const g = svg
    .append("g")
    .attr("class", "container")
    .attr("transform", `translate( ${margin.left}, ${margin.top})`);

  //set the scales
  const x = scaleTime().rangeRound([0, chartWidth]);
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
    .y0(height2);

  // INIT ZOOM
  const zoom = d3zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  // INIT BRUSH just on X axis
  let brushStart, brushEnd;
  const brush = brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

  function brushed() {
    if (
      document.readyState == "complete" &&
      event.selection[0] > 5 &&
      event.selection[1] < width
    ) {
      brushStart = event.selection[0];
      brushEnd = event.selection[1];
    }

    if (event.sourceEvent && event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    const s = event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    select(".graph")
      .select(".area")
      .attr("d", area);
    select(".graph")
      .selectAll("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.growth));
    select(".focus")
      .select(".axis--x")
      .call(xAxis);
    svg
      .select(".zoom")
      .call(
        zoom.transform,
        zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
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
    select(".context")
      .select(".brush")
      .call(brush.move, x.range().map(t.invertX, t));
    select(".graph")
      .selectAll("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.growth));
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
    .call(axisBottom(x).ticks(6));
  focus
    .append("g")
    .call(axisRight(y))
    .attr("transform", `translate( ${chartWidth}, 0)`)
    .append("text")
    .attr("id", "growth-label")
    .attr("fill", colors["light-blue"])
    .attr("transform", "rotate(-90), translate(0,20)")
    .attr("y", 6)
    .attr("dy", "0.7em")
    .attr("text-anchor", "end")
    .text("Aegypti Growth (%)");

  //append the area element
  const growthArea = graph
    .append("path")
    .datum(data)
    .attr("class", "area focus-area")
    .attr("fill", colors["light-blue"])
    .attr("d", area);

  let mini = context
    .append("path")
    .datum(data)
    .attr("class", "area context-area")
    .attr("fill", colors["light-blue"])
    .attr("d", area2);

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

  // console.log("original values are " + brushStart + "and " + brushEnd);

  function setBrush() {
    select(".brush").call(brush.move, [brushStart, brushEnd]);
  }

  setBrush();
};
