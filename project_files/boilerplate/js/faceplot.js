class FacePlot {
    constructor(parentElement, tiktokData) {
        this.parentElement = parentElement;
        this.tiktokData = tiktokData.sort((a, b) => b.artist_pop - a.artist_pop);
        this.uniqueArtists = Array.from(new Set(this.tiktokData.map(entry => entry.artist_name)));
        this.tiktokSubset = this.uniqueArtists.slice(0, 9);
        this.initVis();
    }

    showTracksForArtist(selectedArtist) {
        // Filter the full TikTok dataset for rows matching the selected artist
        const artistTracks = this.tiktokData.filter(entry => entry.artist_name === selectedArtist);

        // Display track names in the artist-name-container
        const tracksHtml = artistTracks.map(entry => `<p>${entry.track_name}</p>`).join('');
        d3.select('#artist-name-container').html(`<h4>Tracks for ${selectedArtist}:</h4>${tracksHtml}`);

        // Update your visualization as needed
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
            .style('stroke', 'black')
            .style('stroke-width', '2')
            .on('mouseover', function (event, d) {
                // Display artist's name and tracks when hovering over the circle
                d3.select(this)
                    .style('filter', 'url(#drop-shadow)'); // Apply shadow filter

                d3.select('#artist-name-container').text(d);

                // Show tracks for the artist
                vis.showTracksForArtist(d);
            })
            .on('mouseout', function () {
                // Clear the artist's name and remove shadow when not hovering
                d3.select(this)
                    .style('filter', null); // Remove shadow filter
                d3.select('#artist-name-container').text('');
            })
            .on('click', function (event, d) {
                // Handle click event to show track names for the selected artist
                vis.showTracksForArtist(d);
            });

        vis.svg.append('defs')
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%')
            .append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 4)
            .attr('stdDeviation', 4);

        this.wrangleData();
    }

    wrangleData() {
        // Additional data wrangling if needed
    }

}