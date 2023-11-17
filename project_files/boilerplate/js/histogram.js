class Histogram{


    constructor(parentElement, data, sizeElement) {
        this.parentElement = parentElement;
        this.data = data;
        this.sizeElement = sizeElement;

        this.initVis();
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

        // Add axis titles
        vis.svg.append("text")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 10)
            .style("text-anchor", "middle");

        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -vis.margin.left + 200)
            .attr("x", -vis.height / 2)
            .style("text-anchor", "middle");

        vis.updateVis(); // Initial rendering
    }

    updateVis(){


    }
}