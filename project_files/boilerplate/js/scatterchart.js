class ScatterChart {
    constructor(parentElement, data, sizeElement) {
        this.parentElement = parentElement;
        this.data = data;
        this.sizeElement = sizeElement;

        this.initVis();
        this.updateVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 40, right: 60, bottom: 60, left: 260 };

        vis.width = document.getElementById(vis.sizeElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.sizeElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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


        //vis.updateVis(); // Initial rendering
    }

    updateVis() {
        let vis = this;

        vis.Xcategory = document.getElementById('XcategorySelector').value;
        vis.Ycategory = document.getElementById('YcategorySelector').value;


            // Add axis titles
        vis.svg.append("text")
                .attr("x", vis.width / 2)
                .attr("y", vis.height + vis.margin.bottom - 10)
                .style("text-anchor", "middle")
                .text(vis.Xcategory);

        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -vis.margin.left + 200)
            .attr("x", -vis.height / 2)
            .style("text-anchor", "middle")
            .text(vis.Ycategory);


        // Set domain for x, y, and legend scales based on the data
        vis.x.domain([0, d3.max(vis.data, d => d[vis.Xcategory])]);
        vis.y.domain([0, d3.max(vis.data, d => d[vis.Ycategory])]);

        vis.svg.select(".x-axis")
            .call(vis.xAxis);

        vis.svg.select(".y-axis")
            .call(vis.yAxis);

        vis.circles = vis.svg.selectAll("circle")
            .data(vis.data);

        vis.circles.enter().append("circle")
            .attr("cx", d => vis.x(d[vis.Xcategory]))
            .attr("cy", d => vis.y(d[vis.Ycategory]))
            .attr("fill", "lightblue") // Set fill color to light blue
            .attr("opacity", 0.7)
            .attr("stroke", "lightgrey") // Set border
            .attr("stroke-width", 2) // Set border width to 2 pixels
            .on("mouseover", function (event, d) {
                // Show tooltip on mouseover
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                vis.tooltip.html(
                    `Artist: ${d.artist_name}<br>
                     Peak Rank: ${d.peak_rank}<br>
                     Weeks on Chart: ${d.weeks_on_chart}<br>
                     Danceability: ${d.danceability.toFixed(2)}<br>
                     Acousticness: ${d.acousticness.toFixed(2)}<br>
                     Speechiness: ${d.speechiness.toFixed(2)}`
                )
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }).on("mouseout", function () {
            // Hide tooltip on mouseout
            vis.tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
            .merge(vis.circles);// Set opacity to 0.7


        vis.circles.exit().remove();



    }
}
