class FacePlot {
    constructor(parentElement, tiktokData, imageFolder) {
        this.parentElement = parentElement;
        this.tiktokData = tiktokData.sort((a, b) => b.artist_pop - a.artist_pop);
        this.uniqueArtists = Array.from(new Set(this.tiktokData.map(entry => entry.artist_name)));
        this.tiktokSubset = this.uniqueArtists.slice(0, 9);
        this.imageFolder = imageFolder;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 40, right: 10, bottom: 60, left: 60 };

        vis.width = 960 - vis.margin.left - vis.margin.right,
            vis.height = 500 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        const rows = 3;
        const cols = 3;

        // Calculate the width and height of each cell
        console.log("new face", vis.tiktokSubset)

        const cellSize = {
            width: vis.width / cols - 50,
            height: vis.height / rows
        };

        const cells = vis.svg.selectAll('.cell')
            .data(vis.tiktokSubset)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', (d, i) => {
                const colIndex = i % cols;
                const rowIndex = Math.floor(i / cols);
                const translateX = colIndex * cellSize.width + cellSize.width / 2;
                const translateY = rowIndex * cellSize.height + cellSize.height / 2;

                return `translate(${translateX},${translateY})`;
            });

// Add a pattern for each artist's face image
        const patterns = cells.append('defs')
            .append('pattern')
            .attr('id', (d, i) => `pattern-${i}`)
            .attr('class', 'pattern')
            .attr('width', 1)
            .attr('height', 1)
            .append('image')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 120) // Adjust the width to match the circle's radius * 2
            .attr('height', 120) // Adjust the height to match the circle's radius * 2
            .attr('xlink:href', d => `img/${d}.png`);

// Add a circle for each artist's face image
        cells.append('circle')
            .attr('r', 60) // Adjust the radius as needed
            .style('fill', (d, i) => `url(#pattern-${i})`) // Reference the pattern using the index
            .style('stroke', 'white')
            .style('stroke-width', '2');

        this.wrangleData();
    }

    wrangleData() {
        // Additional data wrangling if needed
    }
}