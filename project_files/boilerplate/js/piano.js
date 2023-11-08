// michelle

let translateX = 120;
let translateY = 260;

let whiteKeys = [1, 3, 5, 6, 8, 10, 12];
let blackKeys = [2, 4, 7, 9, 11]

let pianoMargin = { top: 40, right: 10, bottom: 60, left: 60 };
let pianoWidth = 960 - pianoMargin.left - pianoMargin.right;
let pianoHeight = 400 - pianoMargin.top - pianoMargin.bottom;
let keyWidth = (pianoWidth / whiteKeys.length) - 27
let blackKeyWidth = 60;
let blackKeyHeight = 200

let svgPiano = d3.select("#piano").append("svg")
    .attr("width", 1000)
    .attr("height", 900)
    .append("g")
    .attr("transform", "translate(" + pianoMargin.left + "," + pianoMargin.top + ")");

svgPiano.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1000)
    .attr("height", 600)
    .style("fill", "#4d4d4d");

svgPiano.append("rect")
    .attr("x", 210)
    .attr("y", 20)
    .attr("width", 500)
    .attr("height", 200)
    .style("fill", "#0099ff")
    .style("stroke", '#000099')
    .style("stroke-width", 2);

svgPiano.append("text")
    .attr("class", "pianoTextInit")
    .attr("x", 240)
    .attr("y", 140)
    .text("PRESS A KEY")
    .style("font-size", "40px")
    .style("fill", "#000099");

let pianoWhiteKeys = svgPiano.selectAll(".pianoWhiteKey")
    .data(whiteKeys)
    .enter()
    .append("rect")
    .attr("class", "pianoWhiteKey pianoKey")
    .attr("key", function(d) { return d; })
    .attr("x", function (d, i) {
        return i * keyWidth;
    })
    .attr("y", 0)
    .attr("width", keyWidth)
    .attr("height", pianoHeight)
    .style("stroke", 'black')
    .style("stroke-width", 2);

let pianoBlackKeys = svgPiano.selectAll(".pianoBlackKey")
    .data(blackKeys)
    .enter()
    .append("rect")
    .attr("class", "pianoBlackKey pianoKey")
    .attr("key", function(d) { return d; })
    .attr("x", function (d, i) {
        if (i > 1) {
            return i * keyWidth + 170;
        } else {
            return i * keyWidth + 70;
        }
    })
    .attr("y", 0)
    .attr("width", blackKeyWidth)
    .attr("height", blackKeyHeight)
    .style("stroke", 'black')
    .style("stroke-width", 2);

let distBtn = svgPiano.append("circle")
    .attr("class", "distributionBtn")
    .attr("cx", 100)
    .attr("cy", 100)
    .attr("r", 20)
    .style("fill", "green")


svgPiano.selectAll(".pianoWhiteKey, .pianoBlackKey")
    .attr("transform", "translate(" + translateX + "," + translateY + ")");

pianoWhiteKeys.on("click", function (d) {
    let key = d3.select(this).attr("key");
    d3.select(".pianoTextInit")
        .text('key '+ key)
        .style("font-size", "20px");

});

pianoBlackKeys.on("click", function (d) {
    let key = d3.select(this).attr("key");
    console.log(key)
    d3.select(".pianoTextInit")
        .text('key ' + key)
        .style("font-size", "20px");
});


distBtn.on("click", function () {
    d3.select(".pianoTextInit")
        .text("need to add histogram")
        .style("font-size", "20px");
});

