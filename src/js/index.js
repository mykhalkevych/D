import * as d3 from "d3";

import '../sass/main.scss'

console.log(d3)

const json = require('./data.json');
console.log(json)

var svg = d3.select("svg"),
    margin = 20,
    svgWidth = parseInt(svg.style('width')),
    svgHeight = parseInt(svg.style('height')),
    diameter = svgWidth < svgHeight ? svgWidth : svgHeight,
    g = svg.append("g").attr("transform", "translate(" + svgWidth / 2 + "," + svgHeight / 2 + ")");
console.log(svg.style('width'))
// Define the div for the tooltip
var tooltip = d3.select(".bubbles").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var popup = d3.select(".bubbles").append("div")
    .attr("class", "popup")
    .style("opacity", 0);
var popupOverlay = d3.select(".bubbles").append("div")
    .attr("class", "popupOverlay")
    .style("display", "none");

var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

var root = d3.hierarchy(json)
    .sum(function (d) { return d.size; })
    .sort(function (a, b) { return b.value - a.value; });
console.log(root)
var focus = root,
    nodes = pack(root).descendants(),
    view;
var image = g.selectAll("image")
    .data(nodes)
    .enter()
    .append("svg:image")
    .attr("xlink:href", 'https://www.w3schools.com/w3css/img_lights.jpg')
    .attr("width", 40)
    .attr("height", 40)
    .attr("x", 0)
    .attr("y", 0);

var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
    .style("fill", function (d) { return d.children ? d.data.color ? d.data.color : color(d.depth) : null; })
    .style("fill-opacity", function (d) { return d.parent && d.children || !d.parent ? 1 : 0; })
    // .style("display", function (d) { return d.parent === root && d.children || !d.parent ? "inline" : "none"; })
    .on("click", function (d) {
        console.log(d, focus);
        if (focus !== d) {
            d3.event.stopPropagation();
            if (d.children)
                zoom(d);
        }
    })
    .on("mouseover", function (d) {
        d3.event.stopPropagation();
        console.log(d);
        var name = d.data.name,
            children = d.data.children.length,
            size = d.value
        popup.transition()
            .duration(200)
            .style("opacity", .9)
            .style("margin-left", diameter / 2 + "px")
            .style("z-index", 10);
        popup.html(
            ` 
            <h3>Title: ${name}</h3>
            <p>Children: ${children} </p>
            <p>Size: ${size} </p>
            `
        );
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(d.data.name)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        d3.event.stopPropagation();
    })

    .on("mousemove", function (d) {
        if (d !== root) {
            tooltip
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }

    })
    .on("mouseout", function (d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("class", "label")
    .style("fill-opacity", function (d) { return d.parent === root ? 1 : 0; })
    .style("display", function (d) { return d.parent === root ? "inline" : "none"; })
    .text(function (d) { return d.data.name; });

var node = g.selectAll("circle,text");

svg
    .style("background", color(-1))
    .on("click", function () { zoom(root); });

zoomTo([root.x, root.y, root.r * 2 + margin]);

function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 3500 : 750)
        .tween("zoom", function (d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
            return function (t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
        .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
        .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });

    transition.selectAll("circle")
        .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function (d) { return d.parent === focus ? d.parent ? 1 : 0 : 1 })
        .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function (d) { if (d.parent !== focus && !d.children) this.style.display = "none"; });
}

function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function (d) {
        return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
    });
    circle.attr("r", function (d) { return d.r * k; });
}