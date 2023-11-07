// michelle

let whiteKeys = [1, 3, 5, 6, 8, 10, 12];

let pianoMargin = { top: 40, right: 10, bottom: 60, left: 60 };
let pianoWidth = 960 - pianoMargin.left - pianoMargin.right;
let pianoHeight = 400 - pianoMargin.top - pianoMargin.bottom;
let keyWidth = pianoWidth / whiteKeys.length;

let svgPiano = d3.select("#piano").append("svg")
    .attr("width", pianoWidth + pianoMargin.left + pianoMargin.right)
    .attr("height", pianoHeight + pianoMargin.top + pianoMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + pianoMargin.left + "," + pianoMargin.top + ")");

let pianoWhiteKeys = svgPiano.selectAll(".pianoWhiteKey")
    .data(whiteKeys)
    .enter()
    .append("rect")
    .attr("class", "pianoWhiteKey")
    .attr("x", function (d, i) {
        return i * keyWidth;
    })
    .attr("y", 0)
    .attr("width", keyWidth)
    .attr("height", pianoHeight)
    .style("fill", 'blue');
