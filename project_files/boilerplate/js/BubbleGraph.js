class BubbleGraph {
    constructor(parentElement, mergedData) {
        this.parentElement = parentElement;
        this.mergedData = mergedData;
        this.sortByPopularity = true; // A flag to determine the sorting order
        this.groupColors = {
            group1: 'lightblue',
            group2: 'lightgreen',
            group3: 'lightpink',
            group4: 'lightyellow',
            group5: 'lightcoral',
        };
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
        vis.rows = vis.svg.append("g").attr("class", "rows");

        vis.wrangleData(true); // Initially, sort by popularity
    }

    wrangleData(sortByPopularity) {
        let vis = this;

        if (sortByPopularity) {
            vis.mergedData = vis.mergedData.sort((a, b) => b.track_pop - a.track_pop);
            if (!vis.initializedColors) {
                vis.colorGroups = {};

                for (let i = 0; i < 5; i++) {
                    const groupName = `group${i + 1}`;
                    vis.colorGroups[groupName] = vis.groupColors[groupName];
                    vis.colorGroups[groupName] = vis.mergedData.slice(i * 10, (i + 1) * 10);
                }

                vis.initializedColors = true;
            }

        } else {
            vis.mergedData = vis.mergedData.sort((a, b) => a.weeks_on_chart - b.weeks_on_chart);
        }

        // Reset the groups before regrouping the data
        vis.data = [];

        for (let i = 0; i < 5; i++) { // Change to 5 groups
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
        console.log("Button Clicked");

        vis.sortByPopularity = !vis.sortByPopularity; // Toggle the sorting order

        vis.wrangleData(vis.sortByPopularity); // Sort based on the new order
    }

    updateVisualization() {
        let vis = this;
        console.log("many", vis.data);
        console.log(vis.groupColors)

        // Define y scale to separate the rows
        vis.radius = 20;
        vis.padding = 10;

        vis.y = d3.scaleBand()
            .domain(['group1', 'group2', 'group3', 'group4', 'group5'])
            .range([vis.height, 0])
            .padding(0.1); // Adjust padding

        // Create a fixed x scale
        const xScale = d3.scaleLinear()
            .domain([0, 10 * (vis.radius + vis.padding)]) // Adjust the domain based on the number of circles
            .range([0, vis.width]);

        // Group circles within their respective groups
        const groups = vis.rows.selectAll(".matrix-row")
            .data(d3.group(vis.data, d => d.group).values(), d => d[0].group); // Group by 'group' property

        const groupsEnter = groups.enter()
            .append("g")
            .attr("class", "matrix-row")
            .attr("transform", (d) => `translate(100, ${30 + vis.y(d.group) || 0})`);
        groups.exit().remove();

        groups.transition()
            .duration(500)
            .attr("transform", (d) => `translate(100, ${30 + vis.y(d.group) || 0})`);

        // Use .join() to create circles and text
        const groupCircles = groups.merge(groupsEnter).selectAll(".bubble")
            .data(d => d, d => d.index);

        const groupText = groups.merge(groupsEnter).selectAll(".label")
            .data(d => d, d => d.index);

        // Enter
        groupCircles.enter()
            .append("circle")
            .attr("class", "bubble")
            .attr("r", vis.radius)
            .attr("cy", (d) => vis.y(d.group) + 20)
            .attr("fill", (d) => vis.groupColors[d.group])
            .merge(groupCircles) // Merge with existing circles
            .transition()
            .duration(500)
            .attr("cx", (d, i) => i * (50 + vis.radius + vis.padding));

        groupText.enter()
            .append("text")
            .attr("class", "label")
            .attr("dy", "0.35em")
            .attr("font-size", "8px")
            .merge(groupText) // Merge with existing text
            .transition()
            .duration(500)
            .attr("x", (d, i) => (i * (50 + vis.radius + vis.padding)) - 10)
            .attr("y", (d) => (vis.y(d.group) + 20 + vis.radius) - 10)
            .text((d) => d.track_name);

        // Exit
        groupCircles.exit()
            .transition()
            .duration(500)
            .remove();

        groupText.exit()
            .transition()
            .duration(500)
            .remove();
    }


}
