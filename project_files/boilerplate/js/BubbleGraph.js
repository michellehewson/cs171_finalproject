class BubbleGraph {
    constructor(parentElement, tiktokData, spotifyData) {
        this.parentElement = parentElement;
        this.tiktokData = tiktokData;
        this.spotifyData = spotifyData;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.data = [];
        vis.margin = { top: 10, right: 10, bottom: 60, left: 60 };
        vis.width = 960 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.spotifyData = vis.spotifyData.sort((a, b) => b.weeks_on_chart - a.weeks_on_chart);
        vis.tiktokData = vis.tiktokData.sort((a, b) => b.track_pop - a.track_pop);

        vis.data = [
            ...vis.spotifyData.slice(0, 10).map(d => ({ ...d, group: 'group1' })),
            ...vis.tiktokData.slice(0, 10).map(d => ({ ...d, group: 'group1' })),
            ...vis.spotifyData.slice(10, 20).map(d => ({ ...d, group: 'group2' })),
            ...vis.tiktokData.slice(10, 20).map(d => ({ ...d, group: 'group2' })),
            ...vis.spotifyData.slice(20, 30).map(d => ({ ...d, group: 'group3' })),
            ...vis.tiktokData.slice(20, 30).map(d => ({ ...d, group: 'group3' })),
            ...vis.spotifyData.slice(30, 40).map(d => ({ ...d, group: 'group4' })),
            ...vis.tiktokData.slice(30, 40).map(d => ({ ...d, group: 'group4' })),
            ...vis.spotifyData.slice(40, 50).map(d => ({ ...d, group: 'group5' })),
            ...vis.tiktokData.slice(40, 50).map(d => ({ ...d, group: 'group5' })),
        ];

        vis.updateVisualization();
    }

    updateVisualization() {
        let vis = this;

        // Define y scale to separate the rows
        let y = d3.scaleBand()
            .domain(['group1', 'group2', 'group3', 'group4', 'group5'])
            .range([vis.height, 0])
            .padding(0.1);

        // Create a separate x scale for each group
        let xScales = {
            group1: d3.scaleLinear().domain([0, d3.max(vis.data, d => d.x)]).range([0, vis.width / 5]),
            group2: d3.scaleLinear().domain([0, d3.max(vis.data, d => d.x)]).range([vis.width / 5, (2 * vis.width) / 5]),
            group3: d3.scaleLinear().domain([0, d3.max(vis.data, d => d.x)]).range([(2 * vis.width) / 5, (3 * vis.width) / 5]),
            group4: d3.scaleLinear().domain([0, d3.max(vis.data, d => d.x)]).range([(3 * vis.width) / 5, (4 * vis.width) / 5]),
            group5: d3.scaleLinear().domain([0, d3.max(vis.data, d => d.x)]).range([(4 * vis.width) / 5, vis.width]),
        };

        vis.rows = vis.svg.selectAll(".matrix-row")
            .data(vis.displayData, d => d.name);

        const rowEnter = vis.rows.enter()
            .append("g")
            .attr("class", "matrix-row")
            .attr("transform", (d, i) => `translate(80, ${100 + i * (vis.cellHeight + vis.cellPadding)})`);

        vis.rows.exit().remove();

        // Update the positions of the rows
        vis.rows.transition()
            .duration(500) // Add transition for a smooth update
            .attr("transform", (d, i) => `translate(80, ${100 + i * (vis.cellHeight + vis.cellPadding)})`);


        // Select and bind data to circles
        vis.rows.selectAll(".bubble")
            .data(vis.data);

        // Create circles for the data
        vis.rows.enter()
            .append("circle")
            .attr("class", "bubble")
            .attr("r", 10)
            .attr("cx", (d,i) => xScales[d.group](d.x) + i +10)
            .attr("cy", d => y(d.group))
            .attr("fill", 'blue');

        // Remove any extra circles
        circles.exit().remove();
    }
}