// michelle
// got inspiration for this from week 7 lab
class BarChart {
    constructor(parentElement, spotifyData, tiktokData) {
        // Constructor to initialize the BarChart object with necessary data
        this.parentElement = parentElement; // HTML element to which the chart will be appended
        this.spotifyData = spotifyData; // Spotify data for the chart
        this.tiktokData = tiktokData; // TikTok data for the chart
        this.spotifyArtistCounts = []; // Array to store Spotify artist counts
        this.tiktokArtistCounts = []; // Array to store TikTok artist counts
        this.initVis(); // Call the initialization method
    }

    initVis() {
        // Method to set up the initial structure of the visualization
        let vis = this;

        // Define margins and dimensions
        vis.margin = { top: 40, right: 10, bottom: 60, left: 60 };
        vis.width = 960 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        // Create SVG container for the chart
        vis.svg = d3.select("#chart-area").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Create an info box for additional details
        vis.infoBox = d3.select("#chart-area").append("svg")
            .attr("class", "info-box")
            .attr("width", 300)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(0, 10)");

        // Draw a white background for the info box
        vis.infoBox.append("rect")
            .attr("width", 300)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("fill", "white");

        // Set up scales for x and y axes
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // Initialize x and y axes
        vis.xAxis = d3.axisBottom(vis.x);
        vis.yAxis = d3.axisLeft(vis.y);

        // Append x and y axes to the chart
        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(vis.yAxis);

        // Load data and set up event listener for ranking type change
        vis.loadData();
        d3.select("#ranking-type").on("change", vis.switchRanking.bind(vis));
    }

    loadData() {
        // Method to process Spotify and TikTok data and update the visualization
        let vis = this;

        // Process Spotify data
        let spotifyCounts = {};
        vis.spotifyData.forEach(function (song) {
            let artistName = song.artist_name;
            spotifyCounts[artistName] = (spotifyCounts[artistName] || 0) + 1;
        });

        // Convert Spotify counts to an array of objects
        vis.spotifyArtistCounts = Object.keys(spotifyCounts).map(key => ({
            artist: key,
            count: spotifyCounts[key]
        }));

        // Sort Spotify data by count in descending order
        vis.spotifyArtistCounts.sort((a, b) => b.count - a.count);

        // Process TikTok data similarly
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

        // Update the visualization with Spotify data by default
        vis.updateVisualization(vis.spotifyArtistCounts);
    }

    updateVisualization(data) {
        // Method to update the bar chart visualization
        let vis = this;
        let top10Data = data.slice(0, 10);

        // Update x and y domains based on the data
        vis.x.domain(top10Data.map(d => d.artist));
        vis.y.domain([0, d3.max(top10Data, (d) => d.count)]);

        // Join data to bars
        let bar = vis.svg.selectAll(".bar")
            .data(top10Data);

        // Enter new bars and update existing ones
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

        // Remove bars that are no longer in the data
        bar.exit().remove();

        // Update x and y axes with transitions
        vis.svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .transition()
            .duration(1000)
            .call(vis.yAxis);

        // Add click event listener to bars for additional information
        vis.svg.selectAll(".bar")
            .on("click", function (event, d) {
                console.log(d)
                vis.updateInfoBox(d);
            });
    }

    switchRanking() {
        // Method to switch between Spotify and TikTok rankings
        let vis = this;
        let selectedValue = d3.select("#ranking-type").property("value");

        // Update visualization based on selected ranking type
        if (selectedValue === "tiktok") {
            vis.updateVisualization(vis.tiktokArtistCounts);
        } else if (selectedValue === "spotify") {
            vis.updateVisualization(vis.spotifyArtistCounts);
        }

        // Remove and re-add x and y axes with transitions
        vis.svg.selectAll(".x-axis, .y-axis")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove();

        // Select the appropriate data based on the selected ranking type
        let selectedData = (selectedValue === "tiktok") ? vis.tiktokArtistCounts : vis.spotifyArtistCounts;

        // Update x and y domains based on the selected data
        vis.x.domain(selectedData.slice(0, 10).map(d => d.artist));
        vis.y.domain([0, d3.max(selectedData, (d) => d.count)]);

        // Re-append x and y axes with transitions
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

        // Update the visualization with the selected data
        vis.updateVisualization(selectedData);
    }

    updateInfoBox(artistData) {
        // Method to update the info box with details about a selected artist
        let vis = this;

        // Remove existing elements from the info box
        vis.infoBox.selectAll("*").remove();

        // Create a group for new elements in the info box
        let infoGroup = vis.infoBox.append("g");

        // Draw a white background for the info box
        infoGroup.append("rect")
            .attr("width", 300)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr("fill", "white");

        // Add text elements with artist information
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
