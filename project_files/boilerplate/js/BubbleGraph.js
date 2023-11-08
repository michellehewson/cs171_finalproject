class BubbleGraph {
    constructor(parentElement, tiktokData, spotifyData) {
        this.parentElement = parentElement;
        this.tiktokData = tiktokData;
        this.spotifyData = spotifyData;
        this.initVis()
    }

    initVis() {
        let vis = this;
        vis.data = [];
        vis.margin = { top: 40, right: 10, bottom: 60, left: 60 };
        vis.width = 960 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        console.log(vis.spotifyData)
        vis.spotifyData = vis.spotifyData.sort((a, b) => b.weeks_on_chart - a.weeks_on_chart);
        vis.popGroup(vis.spotifyData);
        vis.tiktokData = vis.tiktokData.sort((a, b) => b.track_pop - a.track_pop);
        vis.popGroup(vis.tiktokData);

        function popGroup(data) {
            vis.data.push({
                group1: data.slice(0, 10),
                group2: data.slice(11, 20),
                group3: data.slice(21, 30),
                group4: data.slice(31, 40),
                group5: data.slice(41, 50)
            });
        }

        vis.updateVisualization();
    }

    updateVisualization() {
        let vis = this;

        let top50Data = vis.data.slice(0, 50);

        // Define x and y scales here
        let x = d3.scaleLinear().domain([/* your domain values */]).range([0, vis.width]);
        let y = d3.scaleLinear().domain([/* your domain values */]).range([vis.height, 0]);

        let bubble = vis.svg.selectAll(".bubble")
            .data(top50Data);

        bubble.enter().append("circle")
            .attr("r", 10)
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y))
            .attr("fill", 'blue');

        // Update bubbles
        bubble.transition()
            .duration(500)
            .attr("r", 10)
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y))
            .attr("fill", 'blue');

        bubble.exit().remove();

    }
}
