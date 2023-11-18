class ScatterChart {
    constructor(parentElement, data, spotify) {
        this.parentElement = parentElement;
        this.data = data;
        this.spotify = spotify;
        this.initVis();
        this.updateVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 60, bottom: 60, left: 60 };

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
            vis.bartitle = 'Spotify Stats';
        } else {
            vis.bartitle = 'Tiktok Stats';

        }


        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text(vis.bartitle)
            .attr('transform', `translate(${vis.width / 2}, -10)`); // Rotate the text labels by -45 degrees;


        //vis.updateVis(); // Initial rendering
    }

    updateVis() {
        let vis = this;

        let displayData = vis.data;

        vis.Xcategory = document.getElementById('XcategorySelector').value;
        vis.Ycategory = document.getElementById('YcategorySelector').value;



        // Set domain for x, y, and legend scales based on the data
        vis.x.domain([0, d3.max(displayData, d => d[vis.Xcategory])]);
        vis.y.domain([0, d3.max(displayData, d => d[vis.Ycategory])]);

        vis.svg.select(".x-axis")
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .call(vis.yAxis);

        vis.circles = vis.svg.selectAll("circle")
            .data(displayData);

        // Enter
        vis.circles.enter().append("circle")
            .attr("cx", d => vis.x(d[vis.Xcategory]))
            .attr("cy", d => vis.y(d[vis.Ycategory]))
            .attr("fill", "lightblue")
            .attr("r", 3) // Set the circle size to 0.5
            .attr("opacity", 0.5) // Initial opacity set to 0 for fade-in effect
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", function (event, d) {
                // Show tooltip on mouseover
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                vis.tooltip.html(
                    `Artist: ${d.artist_name}<br>
             Danceability: ${d.danceability.toFixed(2)}<br>
             Acousticness: ${d.acousticness.toFixed(2)}<br>
             Speechiness: ${d.speechiness.toFixed(2)}`
                )
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .merge(vis.circles)
            .transition() // Apply transition for entering circles
            .duration(1000) // Set the duration of the transition
            .attr("opacity", 0.7); // Transition opacity to 0.7

// Update
        vis.circles.transition() // Apply transition for updating circles
            .duration(1000)
            .attr("cx", d => vis.x(d[vis.Xcategory]))
            .attr("cy", d => vis.y(d[vis.Ycategory]));

// Exit
        vis.circles.exit()
            .transition() // Apply transition for exiting circles
            .duration(1000)
            .attr("opacity", 0) // Transition opacity to 0 for fade-out effect
            .remove();



    }
}
