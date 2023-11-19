class Histogram{
    constructor(_parentElement, _data, spotify="Spotify") {
        this.parentElement = _parentElement;
        this.data = _data;
        this.spotify = spotify;
        this.initVis();
    }
    initVis() {
        let vis = this;
        vis.margin = { top: 40, right: 60, bottom: 80, left: 60 };

        //console.log(vis.parentElement)

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

        // Add axis titles
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 20)
            .style("text-anchor", "middle");


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


        vis.updateVis(); // Initial rendering
    }

    updateVis(){


       let vis = this;

        //console.log(this.data)

           let selectedAttribute =  document.getElementById('categorySelector').value;
        //console.log(selectedAttribute)

        const bins = d3.bin()
            .thresholds(15)
            .value((d) => d[selectedAttribute])(vis.data);


            // Filter data based on the selected attribute
            let filteredData = vis.data.map(d => d[selectedAttribute]);


            // Update scales
            vis.x.domain([bins[0].x0, bins[bins.length - 1].x1]);
            vis.y.domain([0, d3.max(bins, (d) => d.length)]);

            // Update axes
            vis.svg.select(".x-axis").call(vis.xAxis);
            vis.svg.select(".y-axis").call(vis.yAxis);

        // Append x-axis label
        vis.xAxisLabel = vis.svg.selectAll(".x-axis-label")
            .data([selectedAttribute]);

        // Enter
        vis.xAxisLabel.enter()
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 30)
            .style("opacity", 0) // Set initial opacity to 0 for enter transition
            .text(selectedAttribute)
            .transition()
            .duration(500)
            .style("opacity", 1); // Transition to full opacity

        // Update
        vis.xAxisLabel
            .text(selectedAttribute);

        // Exit
        vis.xAxisLabel.exit()
            .transition()
            .duration(500)
            .style("opacity", 0) // Transition to opacity 0 for exit
            .remove();


        // Append y-axis label
        vis.svg.append("text")
            .attr("class", "count")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 20)
            .text("Count");

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
            .attr("height", (d) => vis.y(0) - vis.y(d.length));


        //Update
        vis.bars
            .attr("x", (d) => vis.x(d.x0)+1)
            .attr("width", (d) => vis.x(d.x1) - vis.x(d.x0)-2)
            .attr("y", (d) => vis.y(d.length))
            .attr("height", (d) => vis.y(0) - vis.y(d.length));



        // Exit
        vis.bars.exit().remove();


        }


}