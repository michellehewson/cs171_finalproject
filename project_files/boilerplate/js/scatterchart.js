//Pluto Zhang
//The 2 scatter plots tiktok and spotify
//Reference: https://www.d3-graph-gallery.com/graph/scatter_basic.html
class ScatterChart {
    constructor(parentElement, tiktokdata, spotifydata, spotify) {
        this.parentElement = parentElement;
        this.data = tiktokdata;
        this.otherdata = spotifydata;
        this.spotify = spotify;

        if (this.spotify == "Spotify"){
            this.data = spotifydata;
            this.otherdata = tiktokdata;
        }
        this.initVis();
        this.updateVis('Danceability', 'Danceability');
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 50, right: 60, bottom: 90, left: 60 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0.5);

        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom(vis.x);
        vis.yAxis = d3.axisLeft(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis");

        vis.bartitle= "";

        if (vis.spotify == "Spotify"){
            vis.bartitle = 'Spotify Songs';
        } else {
            vis.bartitle = 'Tiktok Songs';

        }


        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text(vis.bartitle)
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .attr('transform', `translate(${(vis.width-vis.margin.left) / 2}, -20)`); // Rotate the text labels by -45 degrees;



    }

    updateVis(selectedX, selectedY) {
        let vis = this;
        let displayData = vis.data;

        vis.Xcategory = selectedX.toLowerCase();
        vis.Ycategory = selectedY.toLowerCase();

        let combinedXData = vis.data.map(d => d[vis.Xcategory]).concat(vis.otherdata.map(d => d[vis.Xcategory]));
        let combinedYData = vis.data.map(d => d[vis.Ycategory]).concat(vis.otherdata.map(d => d[vis.Ycategory]));

        // Set domain for x, y, and legend scales based on the data
        vis.x.domain([0, d3.max(combinedXData)]);
        vis.y.domain([0, d3.max(combinedYData)]);

        vis.svg.select(".x-axis")
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .call(vis.yAxis);

        vis.circles = vis.svg.selectAll("circle")
            .data(displayData);

        let duration_lag = displayData.length;
        duration_lag = 3000/duration_lag;

        // Enter
        vis.circles.enter().append("circle")
            .attr("cx", d => vis.x(d[vis.Xcategory]))
            .attr("cy", d => vis.y(d[vis.Ycategory]))
            .style('fill', (d) => vis.spotify === 'Spotify' ? '#ff0050' : '#00f2ea')
            .attr("r", 5) // Set the circle size
            .attr("opacity", 0.5) // Initial opacity set to 0 for fade-in effect
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", function (event, d) {
                // Show tooltip on mouseover
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                vis.tooltip.html(
                    `<div style="font-size: 16px;">Artist: ${d.artist_name}<br>
             Track name: ${d.track_name}<br>
             Danceability: ${d.danceability.toFixed(2)}<br>
             Acousticness: ${d.acousticness.toFixed(2)}<br>
             Tempo: ${d.tempo.toFixed(2)}<br>
             Energy: ${d.energy.toFixed(2)}<br>
             Liveness: ${d.liveness.toFixed(2)}<br>
             Speechiness: ${d.speechiness.toFixed(2)}`
                )
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .merge(vis.circles)
            .transition() // Apply transition for entering circles
            .duration(500)
            .delay((d, i) => i * duration_lag/10) // Delay for each element
            .ease(d3.easeBounceOut) // Set easing option
            .attr("opacity", 0.7); // Transition opacity to 0.7

        // Update
        vis.circles.transition() // Apply transition for updating circles
            .duration(500)
            .delay((d, i) => i * duration_lag/10) // Delay for each element
            .ease(d3.easeBounceOut) // Set easing option
            .attr("cx", d => vis.x(d[vis.Xcategory]))
            .attr("cy", d => vis.y(d[vis.Ycategory]));

        // Exit
        vis.circles.exit()
            .transition() // Apply transition for exiting circles
            .duration(500)
            .delay((d, i) => i * duration_lag/10) // Delay for each element
            .ease(d3.easeBounceOut) // Set easing option
            .attr("opacity", 0) // Transition opacity to 0 for fade-out effect
            .remove();


        let XselectedAttributeName =  selectedX;
        let YselectedAttributeName =  selectedY;

        //add the axis labels:
        // Append x-axis label
        vis.xAxisLabel = vis.svg.selectAll(".x-axis-label")
            .data([XselectedAttributeName]);

        // Enter
        vis.xAxisLabel.enter()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 45)
            .style("opacity", 0) // Set initial opacity to 0 for enter transition
            .text(XselectedAttributeName)
            .transition()
            .duration(500)
            .style("opacity", 1); // Transition to full opacity

        // Update
        vis.xAxisLabel
            .text(XselectedAttributeName);

        // Exit
        vis.xAxisLabel.exit()
            .transition()
            .duration(500)
            .style("opacity", 0) // Transition to opacity 0 for exit
            .remove();

        vis.yAxisLabel = vis.svg.selectAll(".y-axis-label")
            .data([YselectedAttributeName]);

        // Enter
        vis.yAxisLabel.enter()
            .append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 20)
            .style("opacity", 0) // Set initial opacity to 0 for enter transition
            .text(YselectedAttributeName)
            .transition()
            .duration(500)
            .style("opacity", 1); // Transition to full opacity

        // Update
        vis.yAxisLabel
            .text(YselectedAttributeName);

        // Exit
        vis.yAxisLabel.exit()
            .transition()
            .duration(500)
            .style("opacity", 0) // Transition to opacity 0 for exit
            .remove();

    }
}
