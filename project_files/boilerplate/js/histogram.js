//Pluto Zhang
//The 2 histograms for tiktok and spotify
//Reference: https://d3-graph-gallery.com/graph/histogram_basic.html
class Histogram{
    constructor(_parentElement, tiktokdata, spotifydata, spotify) {
        this.parentElement = _parentElement;
        this.data = tiktokdata;
        this.otherdata = spotifydata;
        this.spotify = spotify;

        if (this.spotify == "Spotify"){
            this.data = spotifydata;
            this.otherdata = tiktokdata;
        }

        this.initVis();
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
            vis.bartitle = 'Spotify Song Distribution';
        } else {
            vis.bartitle = 'Tiktok Song Distribution';
        }

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text(vis.bartitle)
            .style("font-size", "24px")
            .style("font-weight", "bold")
            .attr('transform', `translate(${(vis.width - vis.margin.left) / 2}, -20)`); // Rotate the text labels by -45 degrees;

        vis.svg.append('g')
            .append("text")
            .attr("class", ".y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 20)
            .text('Count')

        vis.updateVis('Danceability'); // Initial rendering
    }

    updateVis(selectedCategory){


       let vis = this;

        //console.log(this.data)

        let selectedAttributeName =  selectedCategory;
        let selectedAttribute =  selectedAttributeName.toLowerCase();


        // Combine data from both sources based on the selected attribute
        let combinedData = vis.data.map(d => d[selectedAttribute]).concat(vis.otherdata.map(d => d[selectedAttribute]));

        const combinedbins = d3.bin()
            .thresholds(15) // Use 15 bins
            .value((d) => d)(combinedData);

        let filteredData = vis.data.map(d => d[selectedAttribute]);

        const bins = d3.bin()
            .thresholds(15)
            .value((d) => d)(filteredData);

        let filtered_otherData = vis.otherdata.map(d => d[selectedAttribute]);

        const otherbins = d3.bin()
            .thresholds(15)
            .value((d) => d)(filtered_otherData);

        const ymax = Math.max(d3.max(bins, (d) => d.length), d3.max(otherbins, (d) => d.length));

        // Update scales
        vis.x.domain([combinedbins[0].x0, combinedbins[combinedbins.length - 1].x1]);
        vis.y.domain([0, ymax]);
        // Filter data based on the selected attribute

        // Add a tooltip div
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);



        // Update axes
        vis.svg.select(".x-axis").call(vis.xAxis)
            .selectAll("text") // select all the text elements in the x-axis
            .attr("transform", "rotate(-30)") // rotate the text 90 degrees
            .attr("text-anchor", "end") // set the text-anchor to end for proper alignment
            .attr("dy", "0.5em"); // adjust the position of the text;

        vis.svg.select(".y-axis").call(vis.yAxis);

        // Append x-axis label
        vis.xAxisLabel = vis.svg.selectAll(".x-axis-label")
            .data([selectedAttributeName]);

        // Enter
        vis.xAxisLabel.enter()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 45)
            .style("opacity", 0) // Set initial opacity to 0 for enter transition
            .text(selectedAttributeName)
            .transition()
            .duration(500)
            .style("opacity", 1); // Transition to full opacity

        // Update
        vis.xAxisLabel
            .text(selectedAttributeName);

        // Exit
        vis.xAxisLabel.exit()
            .transition()
            .duration(500)
            .style("opacity", 0) // Transition to opacity 0 for exit
            .remove();


        // add the bars

        // Update bars
        vis.bars = vis.svg.selectAll('.bar')
            .data(bins);

        // Enter
        vis.bars.enter()
            .append('rect')
            .attr("class", "bar")
            .style('fill', (d) => vis.spotify === 'Spotify' ? '#ff0050' : '#00f2ea')
            .attr("x", (d) => vis.x(d.x0)+1)
            .attr("width", (d) => vis.x(d.x1) - vis.x(d.x0)-2)
            .attr("y", (d) => vis.y(d.length))
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(
                    `<div style="font-size: 16px;">Range: ${d.x0} - ${d.x1}<br/>Count: ${d.length}</div>`
                )
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition() // Add transition to the enter selection
            .duration(500) // Set the duration of the transition
            .attr("height", (d) => vis.y(0) - vis.y(d.length));


        //Update
        vis.bars
            .transition() // Add transition to the update selection
            .duration(500) // Set the duration of the transition
            .delay((d, i) => i * 100) // this makes the cool animation that makes the bars appear intermittently
            .attr("x", (d) => vis.x(d.x0)+1)
            .attr("width", (d) => vis.x(d.x1) - vis.x(d.x0)-2)
            .attr("y", (d) => vis.y(d.length))
            .attr("height", (d) => vis.y(0) - vis.y(d.length));



        // Exit
        vis.bars.exit()
            .transition() // Add transition to the exit selection
            .duration(500) // Set the duration of the transition
            .attr("height", 0)
            .remove();


        }


}