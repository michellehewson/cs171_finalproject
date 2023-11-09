// michelle
// got inspiration for this from week 7 lab
// i'll put this in a class soon

let margin = {top: 40, right: 10, bottom: 60, left: 60};

let width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Scales
let x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

let y = d3.scaleLinear()
    .range([height, 0]);

let xAxis = d3.axisBottom(x);
let yAxis = d3.axisLeft(y);

let spotifydata;
let tiktokdata;

// Initialize data
loadData();

function loadData() {
    d3.csv("data/spotify_artist_counts.csv").then(csv => {
        csv.forEach(function (d) {
            d.count = +d.count;
        });

        spotifydata = csv.sort((a, b) => b.count - a.count);

        updateVisualization(spotifydata);
    });

    d3.csv("data/tiktok_artist_counts.csv").then(csv => {
        csv.forEach(function (d) {
            d.count = +d.count;
        });

        tiktokdata = csv.sort((a, b) => b.count - a.count);

    });
}

function updateVisualization(data) {

    let top10Data = data.slice(0, 10);

    x.domain(top10Data.map(d => d.artist));
    y.domain([0, d3.max(top10Data, (d) => d.count)]);

    let bar = svg.selectAll(".bar")
        .data(top10Data);

    bar.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.artist))
        .transition()
        .duration(1000)
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count));

    bar.merge(bar)
        .attr("x", d => x(d.artist))
        .transition()
        .duration(1000)
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count));

    bar.exit().remove();

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .transition()
        .duration(500)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .transition()
        .duration(500)
        .call(yAxis);

    svg.select(".x-axis")
        .transition()
        .duration(500)
        .call(xAxis);

    // Update the y-axis
    svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(yAxis);

    d3.select("#ranking-type").on("change", switchRanking);
}

function switchRanking() {
    let selectedValue = d3.select("#ranking-type").property("value");

    if (selectedValue === "tiktok") {
        data = tiktokdata.sort((a, b) => b.count - a.count);
    } else if (selectedValue === "spotify") {
        data = spotifydata.sort((a, b) => b.count - a.count);
    }

    svg.selectAll(".x-axis")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();

    svg.selectAll(".y-axis")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .remove();

    x.domain(data.slice(0, 10).map(d => d.artist));
    y.domain([0, d3.max(data, (d) => d.count)]);


    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .style("opacity", 0)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .call(yAxis);

    updateVisualization(data);
}
