const svg = d3.select('#chart')
              .append('svg')
                .attr('height', 400)
                .attr('width', 800) 
                .attr('class', 'card');

const margin    = {top: 20, right: 50, bottom: 110, left: 80}, 
      margin2   = {top: 320, right: 50, bottom: 40, left: 80},
      height    = +svg.attr('height') - margin.top - margin.bottom,
      width     = +svg.attr('width') - margin.left - margin.right,
      height2   = +svg.attr('height') - margin2.top - margin2.bottom;
      green     = '#4caf50',
      yellow    = '#fff176',
      red       = '#f44336',
      blue      = '#1565c0',
      lightblue = '#6ec6ff',
      lightred   = '#ef9a9a'; 

const parsedate = d3.timeParse("%m/%d/%Y %H:%M");
const formatDate = d3.timeFormat('%b %d, %Y');

function fetchData (city) {
    d3.json(`http://maps.calsurv.org/zika/risk/${city}`, (error, data) => {
        if (error) console.log(error);
        d3.select('#container').remove();
        drawGraph(data);
    });
}



function drawGraph(data) {

    // SET SCALES for each graph.  same for each, just height is different on smaller graph
    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLog().range([height, 0]).base(2).clamp(true),
        y2 = d3.scaleLinear().range([height2, 0]);

    // SET AXES, need 2 x's since the top one will change, but no second y axis on the bottom
    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y).tickValues([0, 0.1, 0.2, 0.5, 1.0, 2.0]);

    // INIT BRUSH just on X axis
    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    // INIT ZOOM
    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    // INIT TOP LINE
    var line = d3.line()
        .x( (d) =>  x(d.date) )
        .y( (d) =>  y(d.risk) );

    // INIT BOTTOM LINE
    var line2 = d3.line()
        .x( (d) =>  x2(d.date) )
        .y( (d) => y2(d.risk) );

    //make only the needed SVG visible
    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    const container = svg.append('g')
                        .attr('class', 'container')
                        .attr('id', 'container')
                        .attr('height', +svg.attr('height'))
                        .attr('width', +svg.attr('width'));

    //append the top clip path to the svg, give it the clip path attribute linked to the clip element above
    graph = container.append("g")
                       .attr("class", "graph")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                       .attr("clip-path", "url(#clip)");

    // append the top chart
    var focus = container.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // append the bottom chart
    var context = container.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    data.forEach( (d) => {
        d.date = new Date(d[0]);
        d.risk = +d[1];
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0.1, 2.5]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    //ADD IN GRADIENT FOR MAIN GRAPH
    graph.append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(0))
            .attr("x2", 0).attr("y2", y(3))
            .selectAll("stop")
            .data([
                {offset: "0%", color: blue},
                {offset: "50%", color: blue},
                {offset: "50%", color: lightblue},
                {offset: "72%", color: lightblue},
                {offset: "72%", color: lightred},
                {offset: "94%", color: lightred},
                {offset: "94%", color: red},
                {offset: "100%", color: red}
            ])
            .enter().append("stop")
            .attr("offset", (d) => d.offset )
            .attr("stop-color", (d) => d.color );

    //ADD GRADIENT FOR CONTEXT
    context.append("linearGradient")
        .attr("id", "context-line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(0))
        .attr("x2", 0).attr("y2", y(3))
        .selectAll("stop")
        .data([
            {offset: "0%", color: blue},
            {offset: "90%", color: blue},
            {offset: "90%", color: lightblue},
            {offset: "96%", color: lightblue},
            {offset: "96%", color: red},
            {offset: "100%", color: red}
        ])
        .enter().append("stop")
        .attr("offset", (d) => d.offset )
        .attr("stop-color", (d) => d.color );

    
    // append the x axis for the top chart
    focus.append("g")
           .attr("class", "axis axis--x")
           .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append('text')
          .attr('x', 300)
          .attr('y', 300)
          .attr('class', 'axis-label')
          .style('text-anchor', 'middle')
          .text('Date');
        
        // append the y axis for the top chart
    focus.append("g")
           .attr("class", "axis axis--y")
         .call(yAxis)
         .append('text')
            .attr('x', -100)
            .attr('y', -50)
            .attr('transform', () => 'rotate(-90)')
            .attr('class', 'axis-label')
            .text('Zika Risk Index');
        

    // append the path with its data to the clipPath container
    let path = graph.append("path")
                    .datum(data)
                      .attr("class", "line")
                      .attr("d", line);

    // animate the path in
    // const lineTransition = d3.transition().duration(1100).ease(d3.easeLinear);
    // const pathLength = path.node().getTotalLength();
    // path.attr('stroke-dasharray', `${pathLength} ${pathLength}`)
    //     .attr('stroke-dashoffset', pathLength)
    //     .transition(lineTransition)
    //         .attr('stroke-dashoffset', 0);

    function labelRisk(r) {
        if (r < 0.5) {
            return blue;
        } else if (r < 1.0) {
            return lightblue;
        } else if (r < 2.0) {
            return lightred;
        } else return red;
    }
    
    // ADD IN SCATTER points to be able to mouseover data
    graph.append('g')
            .attr('class', 'dots')
            .selectAll('.dots')
                .data(data)
                .enter()
                .append('circle')
                .attr('cx', (d) => x(d.date))
                .attr('cy', (d) => y(d.risk))
                .attr('r', 2)
                .on('mouseover', tipMouseover)
                .on('mouseout', tipMouseout)
                .style('cursor', 'pointer')
                .attr('fill', 'none')
                .attr('stroke', (d) => labelRisk(d.risk) );

    // bottom chart gets same path
    context.append("path")
        .datum(data)
        .attr("class", "context-line line")
        .attr("d", line2);

    // bottom chart gets x axis with xAxis2
    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    // big gray brush element is applied to the bottom chart    
    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    // allows zooming directly over the chart using the mouse scroll, add a zoom rectangle rectangle over the whole chart
    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

    //ADD TOOLTIP on hover
    const tooltip = d3.select('#chart').append('div')
            .attr('class', 'toolTip')
            .style('opacity', 0);

    function tipMouseover(d) {
        let color = labelRisk(d.risk);

        var html = `
            <div class='toolTip__risk' style='background:${color}'> <div> Risk Factor</div> <div class='toolTip__risk--value'> ${d.risk}</div> </div>
            <div class='toolTip__date'>${formatDate(d.date)}</div>
        `;
        tooltip.html(html)
                    .style('left', (d3.event.pageX + 15) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px')
                .transition()
                    .duration(500)
                    .style('opacity', .9)
    };

    function tipMouseout(d) {
        tooltip.transition()
                .duration(300)
                .style('opacity', 0)
    };
    
    function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    graph.select(".line").attr("d", line);
    graph.selectAll('circle')
                .attr('cx', (d) => x(d.date))
                .attr('cy', (d) => y(d.risk));
    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
    }

    function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    graph.select(".line").attr("d", line);
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    graph.selectAll('circle')
                .attr('cx', (d) => x(d.date))
                .attr('cy', (d) => y(d.risk));
    }
}

fetchData("Fresno");