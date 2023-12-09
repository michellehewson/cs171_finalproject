// michelle
// got inspiration for this from week 7 lab
class BarChart {
    constructor(parentElement, spotifyData, tiktokData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.tiktokData = tiktokData;
        this.spotifyArtistCounts = [];
        this.tiktokArtistCounts = [];
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 10, bottom: 60, left: 60 };

        vis.width = 960 - vis.margin.left - vis.margin.right,
            vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#chart-area").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.infoBox = d3.select("#chart-area").append("svg")
            .attr("class", "info-box")
            .attr("width", 300)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(0, 10)");

        vis.infoBox.append("rect")
            .attr("width", 300)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("fill", "white");

        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.x);
        vis.yAxis = d3.axisLeft(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(vis.yAxis);

        vis.loadData();

        d3.select("#ranking-type").on("change", vis.switchRanking.bind(vis));

    }

    loadData() {
        let vis = this;

        let spotifyCounts = {};
        vis.spotifyData.forEach(function (song) {
            let artistName = song.artist_name;
            spotifyCounts[artistName] = (spotifyCounts[artistName] || 0) + 1;
        });

        vis.spotifyArtistCounts = Object.keys(spotifyCounts).map(key => ({
            artist: key,
            count: spotifyCounts[key]
        }));

        vis.spotifyArtistCounts.sort((a, b) => b.count - a.count);

        let tiktokCounts = {};
        vis.tiktokData.forEach(function (song) {
            let artistName = song.artist_name;
            tiktokCounts[artistName] = (tiktokCounts[artistName] || 0) + 1;
        });

        vis.tiktokArtistCounts = Object.keys(tiktokCounts).map(key => ({
            artist: key,
            count: tiktokCounts[key]
        }));

        vis.tiktokArtistCounts.sort((a, b) => b.count - a.count);

        vis.updateVisualization(vis.spotifyArtistCounts);
    }


    updateVisualization(data) {
        let vis = this;
        let top10Data = data.slice(0, 10);

        vis.x.domain(top10Data.map(d => d.artist));
        vis.y.domain([0, d3.max(top10Data, (d) => d.count)]);

        let bar = vis.svg.selectAll(".bar")
            .data(top10Data);

        bar.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.x(d.artist))
            .on("click", function (event, d) {
                vis.updateInfoBox(d.artist);
            })
            .merge(bar)
            .transition()
            .duration(1000)
            .attr("y", d => vis.y(d.count))
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.height - vis.y(d.count));

        bar.exit().remove();

        vis.svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(vis.yAxis);

        vis.svg.selectAll(".bar")
            .on("click", function (event, d) {
                console.log(d)
                vis.updateInfoBox(d);
            });
    }

    switchRanking() {
        let vis = this;
        let selectedValue = d3.select("#ranking-type").property("value");

        if (selectedValue === "tiktok") {
            vis.updateVisualization(vis.tiktokArtistCounts);
        } else if (selectedValue === "spotify") {
            vis.updateVisualization(vis.spotifyArtistCounts);
        }

        vis.svg.selectAll(".x-axis, .y-axis")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove();

        let selectedData = (selectedValue === "tiktok") ? vis.tiktokArtistCounts : vis.spotifyArtistCounts;

        vis.x.domain(selectedData.slice(0, 10).map(d => d.artist));
        vis.y.domain([0, d3.max(selectedData, (d) => d.count)]);

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "y-axis")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style("opacity", 1)
            .call(vis.yAxis);

        vis.updateVisualization(selectedData);
    }

    updateInfoBox(artistData) {
        let vis = this;

        vis.infoBox.selectAll("*").remove();

        let infoGroup = vis.infoBox.append("g");

        infoGroup.append("rect")
            .attr("width", 300)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("fill", "white");

        infoGroup.append("text")
            .attr("x", 10)
            .attr("y", 20)
            .attr("fill", "black")
            .attr("stroke", "black")
            .text("Artist: " + artistData.artist);

        infoGroup.append("text")
            .attr("x", 10)
            .attr("y", 40)
            .attr("fill", "black")
            .attr("stroke", "black")
            .text("Number of Songs: " + artistData.count);

    }


}
