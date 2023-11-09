class BubbleGraph {
    constructor(parentElement, mergedData) {
        this.parentElement = parentElement;
        this.mergedData = mergedData;
        this.sortByPopularity = true; // A flag to determine the sorting order
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
        document.getElementById("sortButton").addEventListener("click", () => {
            vis.handleSortButtonClick();
        });
        vis.wrangleData(true); // Initially, sort by popularity
    }

    wrangleData(sortByPopularity) {
        let vis = this;

        if (sortByPopularity) {
            vis.mergedData = vis.mergedData.sort((a, b) => b.track_pop - a.track_pop);
        } else {
            vis.mergedData = vis.mergedData.sort((a, b) => a.weeks_on_chart - b.weeks_on_chart);
        }

        // Reset the groups before regrouping the data
        vis.data = [];

        for (let i = 0; i < 5; i++) {
            vis.data = vis.data.concat(
                vis.mergedData.slice(i * 10, (i + 1) * 10).map((d, j) => ({
                    ...d,
                    group: `group${i + 1}`,
                    index: j
                }))
            );
        }

        vis.updateVisualization();
    }

    handleSortButtonClick() {
        let vis = this;

        vis.sortByPopularity = !vis.sortByPopularity; // Toggle the sorting order

        vis.wrangleData(vis.sortByPopularity); // Sort based on the new order
        vis.updateVisualization();
    }

    updateVisualization() {
        let vis = this;

        // Define y scale to separate the rows

        let y = d3.scaleBand()
            .domain(['group1', 'group2', 'group3', 'group4', 'group5'])
            .range([vis.height, 0])
            .padding(0.05);

        // Create an x scale based on the sorting order
        let xScale;
        if (vis.sortByPopularity) {
            xScale = d3.scaleLinear()
                .domain([0, d3.max(vis.data, d => d.track_pop)])
                .range([0, vis.width]);
        } else {
            xScale = d3.scaleLinear()
                .domain([0, d3.max(vis.data, d => d.weeks_on_chart)])
                .range([0, vis.width]);
        }

        vis.rows = vis.svg.selectAll(".matrix-row")
            .data(vis.data, d => d.name);

        const rowEnter = vis.rows.enter()
            .append("g")
            .attr("class", "matrix-row")
            //.attr("transform", d => `translate(0, ${y(d.group)})`);

        // Smoothly remove any rows that are no longer in the data
        vis.rows.exit()
            .transition()
            .duration(500)
            .attr("transform", `translate(0, ${vis.height})`)
            .remove();

        // Update the positions of the rows smoothly
        vis.rows.transition()
            .duration(500)
           // .attr("transform", d => `translate(0, ${y(d.group)})`);

// Update the positions of the circles smoothly
        vis.rows.selectAll(".bubble")
            .transition()
            .duration(500)
            .attr("cx", d => xScale(vis.sortByPopularity ? d.track_pop : d.weeks_on_chart))
            .attr("cy", d => y(d.group));
        // Select and bind data to circles
        vis.rows.selectAll(".bubble")
            .data(d => [d]);

        // Create circles for the data
        const circles = rowEnter
            .append("circle")
            .attr("class", "bubble")
            .attr("r", 10)
            .attr("cx", d => xScale(vis.sortByPopularity ? d.track_pop : d.weeks_on_chart))
            .attr("cy", d => y(d.group))
            .attr("fill", 'blue');

        // Smoothly remove any extra circles
        circles.exit()
            .transition()
            .duration(500)
            .attr("r", 0)
            .remove();
    }
}
