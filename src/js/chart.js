import {
  timeFormat,
  scaleTime,
  scaleLog,
  scaleLinear,
  extent,
  select,
  axisBottom,
  axisLeft,
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

import { colors, labelZikaRisk } from "./helpers";

const formatDate = timeFormat("%b %d, %Y");

export const Chart = function(divId, riskObj, divWidth, initDate) {
  //remove an SVG if already present
  if (document.getElementById("svg")) {
    document.getElementById("svg").remove();
  }
  let svg = select("#chart")
    .append("svg")
    .attr("height", 400) // height should stay constant or else the axes get difficult to work with
    .attr("width", divWidth) //chart width depends on
    .attr("class", "card")
    .attr("id", "svg");

  const margin = { top: 20, right: 50, bottom: 110, left: 80 }, // for main graph
    margin2 = { top: 320, right: 50, bottom: 40, left: 80 }, //for context
    height = +svg.attr("height") - margin.top - margin.bottom,
    width = +svg.attr("width") - margin.left - margin.right,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

  // SET SCALES for each graph.  same for each, just height is different on smaller graph
  const x = scaleTime().range([0, width]),
    x2 = scaleTime().range([0, width]),
    y = scaleLog()
      .range([height, 0])
      .base(2)
      .clamp(true),
    y2 = scaleLinear().range([height2, 0]);

  riskObj.forEach(d => {
    if (d.risk === null) d.risk = 0;
    (d.date = new Date(d.date)), (d.risk = +d.risk.toFixed(3));
  });

  x.domain(
    extent(riskObj, function(d) {
      return d.date;
    })
  );
  y.domain([0.1, 2.5]); // explicitly set the y axis scale to start at .1 and go up to 2.5
  x2.domain(x.domain());
  y2.domain(y.domain());

  let dots, graph, tooltip;

  function tipMouseover(d) {
    redrawTooltip();
    let color = labelZikaRisk(d.risk);

    const html = `
              <div class='toolTip__risk' style='background:${color}'> 
              <div class='toolTip__risk--title'> Risk Factor</div> 
              <div class='toolTip__risk--value'> ${d.risk}
              </div> 
              </div>
              <div class='toolTip__date'>${formatDate(d.date)}</div>
          `;
    tooltip
      .html(html)
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 28 + "px")
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

  // SET AXES, need 2 x's since the top one will change, but no second y axis on the bottom
  const xAxis = axisBottom(x),
    xAxis2 = axisBottom(x2),
    yAxis = axisLeft(y).tickValues([0, 0.1, 0.25, 0.5, 1.0, 2.0]);

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
      .select(".line")
      .attr("d", line);
    select(".graph")
      .selectAll("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.risk));
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

  // INIT TOP LINE
  const line = d3line()
    .curve(curveCatmullRom)
    .x(d => x(d.date))
    .y(d => y(d.risk));

  // INIT BOTTOM LINE
  const line2 = d3line()
    .curve(curveCardinal)
    .x(d => x2(d.date))
    .y(d => y2(d.risk));

  function zoomed() {
    if (event.sourceEvent && event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    const t = event.transform;
    x.domain(t.rescaleX(x2).domain());
    select(".graph")
      .select(".line")
      .attr("d", line);
    select(".focus")
      .select(".axis--x")
      .call(xAxis);
    select(".context")
      .select(".brush")
      .call(brush.move, x.range().map(t.invertX, t));
    select(".graph")
      .selectAll("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.risk));
  }

  // animate the path in
  function animateLine(line, time) {
    const lineTransition = transition()
      .duration(time)
      .ease(easeLinear);
    let pathLength = line.node().getTotalLength();

    line
      .attr("stroke-dasharray", `${pathLength} ${pathLength}`)
      .attr("stroke-dashoffset", pathLength)
      .transition(lineTransition)
      .attr("stroke-dashoffset", 0);
  }

  function drawGraph() {
    // select("#chartContainer").remove();

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
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    //ADD TOOLTIP on hover
    if (document.querySelector(".toolTip")) {
      select(".toolTip").remove();
    }

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

    //ADD IN GRADIENT FOR MAIN GRAPH
    graph
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(3))
      .selectAll("stop")
      .data([
        { offset: "0%", color: colors["dark-blue"] },
        { offset: "50%", color: colors["dark-blue"] },
        { offset: "50%", color: colors["light-blue"] },
        { offset: "72%", color: colors["light-blue"] },
        { offset: "72%", color: colors["light-red"] },
        { offset: "94%", color: colors["light-red"] },
        { offset: "94%", color: colors["dark-red"] },
        { offset: "100%", color: colors["dark-red"] }
      ])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    //ADD GRADIENT FOR CONTEXT
    context
      .append("linearGradient")
      .attr("id", "context-line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(3))
      .selectAll("stop")
      .data([
        { offset: "0%", color: colors["dark-blue"] },
        { offset: "90%", color: colors["dark-blue"] },
        { offset: "90%", color: colors["light-blue"] },
        { offset: "92%", color: colors["light-colors['dark-blue']"] },
        { offset: "92%", color: colors["dark-red"] },
        { offset: "100%", color: colors["dark-red"] }
      ])
      .enter()
      .append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    // append the x axis for the top chart
    focus
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("x", 300)
      .attr("y", 300)
      .attr("class", "axis-label")
      .style("text-anchor", "middle")
      .text("Date");

    // append the y axis for the top chart
    focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(yAxis)
      .append("text")
      .attr("x", -100)
      .attr("y", -50)
      .attr("transform", () => "rotate(-90)")
      .attr("class", "axis-label")
      .text("Zika Risk Index");

    // append the path with its data to the clipPath container
    let path = graph
      .append("path")
      .datum(riskObj)
      .attr("class", "line")
      .attr("d", line);

    // ADD IN SCATTER points to be able to mouseover data
    dots = graph
      .append("g")
      .attr("class", "dots")
      .selectAll(".dots")
      .data(riskObj)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.risk))
      .attr("r", 5)
      .on("mouseover", d => tipMouseover(d))
      .on("mouseout", d => tipMouseout(tooltip))
      .style("cursor", "pointer")
      .attr("fill", d => labelZikaRisk(d.risk))
      .attr("stroke", d => labelZikaRisk(d.risk));

    // bottom chart gets same path
    let mini = context
      .append("path")
      .datum(riskObj)
      .attr("class", "context-line line")
      .attr("d", line2);

    animateLine(mini, 2000);

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

    // allows zooming directly over the chart using the mouse scroll, add a zoom rectangle rectangle over the whole chart
    svg
      .append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    const initialMarkerPlace = x2(
      riskObj[document.querySelector("#pickDate").value].date
    );

    const marker = select("#context")
      .append("line")
      .attr("id", "marker")
      .attr("y1", 0)
      .attr("y2", height2)
      .attr("x1", initialMarkerPlace)
      .attr("x2", initialMarkerPlace);

    setBrush();
  } // END of drawgraph

  function moveLine(dateObj) {
    const newSpot = x2(dateObj);
    let sixMonths = x2(new Date(dateObj.setMonth(dateObj.getMonth() + 6)));
    //convert that time into a distance from the new spot to adjust the brush with
    sixMonths = sixMonths - newSpot;

    if (newSpot > brushEnd) {
      brushStart = newSpot;
      brushEnd = newSpot + sixMonths;
      setBrush();
    } else if (newSpot < brushStart) {
      brushEnd = newSpot;
      brushStart = newSpot - sixMonths;
      setBrush();
    }
    select("#marker")
      .attr("x1", newSpot)
      .attr("x2", newSpot);
  }

  function drawCircles(riskObj, week) {
    select(".dots").remove();

    const selectedDate = riskObj[week].date || initDate;

    dots = graph
      .append("g")
      .attr("class", "dots")
      .selectAll(".dots")
      .data(riskObj)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.risk))
      .attr("r", function(d) {
        if (d.date == selectedDate) {
          return 10;
        } else return 5;
      })
      .on("mouseover", tipMouseover)
      .on("mouseout", tipMouseout)
      .style("cursor", "pointer")
      .attr("fill", d => labelZikaRisk(d.risk))
      .attr("stroke", d => labelZikaRisk(d.risk));
  }

  function redrawTooltip() {
    if (document.querySelector(".toolTip")) {
      select(".toolTip").remove();
    }

    tooltip = select("#chart")
      .append("div")
      .attr("class", "toolTip")
      .style("opacity", 0);
  }

  brushStart = x(new Date(initDate.setMonth(initDate.getMonth() - 3)));
  brushEnd = x(new Date(initDate.setMonth(initDate.getMonth() + 6)));

  // console.log("original values are " + brushStart + "and " + brushEnd);

  function setBrush() {
    select(".brush").call(brush.move, [brushStart, brushEnd]);
  }

  setBrush();

  return {
    drawGraph: drawGraph,
    moveLine: moveLine,
    drawCircles: drawCircles,
    setBrush: setBrush
  };
};
