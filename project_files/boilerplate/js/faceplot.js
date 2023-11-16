class FacePlot {
    constructor(parentElement, spotifyData, tiktokData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.tiktokData = tiktokData;
        this.initVis();

    }

    showTracksForArtist(selectedArtist) {
        let artistTracks;
        let source;

        if (this.isShowingTikTok) {
            // If currently showing TikTok data, use TikTok data
            artistTracks = this.tiktokData.filter(entry => entry.artist_name === selectedArtist);
            source = 'TikTok';
        } else {
            // If currently showing Spotify data, use Spotify data
            artistTracks = this.spotifyData.filter(entry => entry.artist_name === selectedArtist);
            source = 'Spotify';
        }

        // Create HTML for tracks
        const tracksHtml = artistTracks.map(entry => `<p>${entry.track_name}</p>`).join('');

        // Display tracks in the artist-name-container
        d3.select('#artist-name-container').html(`<h4>Tracks for ${selectedArtist} (from ${source}):</h4>${tracksHtml}`);
    }

    initVis() {
        console.log("Initializing visualization");
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
        vis.cols = 3;

        // Calculate the width and height of each cell
        vis.cellSize = {
            width: vis.width / vis.cols - 50,
            height: vis.height / rows
        };

        d3.select('#showTopArtistsButton').text('Show Spotify Data');

        d3.select('#showTopArtistsButton').on('click', function () {
            console.log('Button Clicked');
            if (vis.isShowingTikTok) {
                vis.getTopArtistsFromSpotify();
                d3.select(this).text('Show TikTok Data'); // Change button text
            } else {
                vis.getTopArtistsFromTiktok();
                d3.select(this).text('Show Spotify Data'); // Change button text
            }
            console.log('Subset after getTopArtistsFromSpotify:', vis.subset);

            vis.updateVis();
        });


        vis.getTopArtistsFromTiktok();

        const cells = vis.svg.selectAll('.cell')
            .data(vis.subset) // Make sure vis.subset is defined
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', (d, i) => {
                const colIndex = i % vis.cols;
                const rowIndex = Math.floor(i / vis.cols);
                const translateX = colIndex * vis.cellSize.width + vis.cellSize.width / 2;
                const translateY = rowIndex * vis.cellSize.height + vis.cellSize.height / 2;

                return `translate(${translateX},${translateY})`;
            });

        vis.defs = vis.svg.append('defs');

        vis.defs.append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%')
            .append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 4)
            .attr('stdDeviation', 4);

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

        cells.append('circle')
            .attr('r', 60) // Adjust the radius as needed
            .style('fill', (d, i) => `url(#pattern-${i})`)
            .style('stroke', 'black')
            .style('stroke-width', '2')
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .style('filter', 'url(#drop-shadow)'); // Apply shadow filter

                d3.select('#artist-name-container').text(d);
                vis.showTracksForArtist(d);
            })
            .on('mouseout', function () {
                d3.select(this)
                    .style('filter', null); // Remove shadow filter
                d3.select('#artist-name-container').text('');
            })
            .on('click', function (event, d) {
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

        // Initialize the subset and update the visualization
        vis.updateVis();
    }

    getTopArtistsFromTiktok() {
        let vis = this;
        vis.isShowingTikTok = true;
        vis.tiktokData.sort((a, b) => b.artist_pop - a.artist_pop);
        vis.uniqueArtists = Array.from(new Set(vis.tiktokData.map(entry => entry.artist_name)));
        vis.subset = vis.uniqueArtists.slice(0, 9);
    }

    getTopArtistsFromSpotify() {
        console.log("hereeee")
        let vis = this;
        vis.isShowingTikTok = false;
        vis.spotifyData.sort((a, b) => {
            if (a.peak_rank !== b.peak_rank) {
                return a.peak_rank - b.peak_rank;
            } else {
                return b.weeks_on_chart - a.weeks_on_chart;
            }
        });
        console.log('Subset after sorting spotifyData:', vis.subset);

        vis.uniqueArtists = Array.from(new Set(vis.spotifyData.map(entry => entry.artist_name)));
        vis.subset = vis.uniqueArtists.slice(0, 9);
        console.log(vis.subset)
    }

    updateVis() {
        let vis = this;

        // Update the data binding for cells
        const cells = vis.svg.selectAll('.cell')
            .data(vis.subset);

        // Exit
        cells.exit()
            .transition() // Add transition for exit
            .duration(500) // Set the duration of the transition in milliseconds
            .remove();

        // Enter + Update
        const newCells = cells.enter()
            .append('g')
            .merge(cells) // Merge the enter and update selections
            .attr('class', 'cell')
            .attr('transform', (d, i) => {
                const colIndex = i % vis.cols;
                const rowIndex = Math.floor(i / vis.cols);
                const translateX = colIndex * vis.cellSize.width + vis.cellSize.width / 2;
                const translateY = rowIndex * vis.cellSize.height + vis.cellSize.height / 2;

                return `translate(${translateX},${translateY})`;
            });

        // Append <defs> and <pattern> elements
        const patterns = newCells.selectAll('.pattern')
            .data(d => [d]);

        patterns.exit().remove(); // Remove unnecessary patterns

        const newPatterns = patterns.enter()
            .append('defs')
            .append('pattern')
            .attr('id', (d, i) => `pattern-${i}`)
            .attr('class', 'pattern')
            .attr('width', 1)
            .attr('height', 1)
            .merge(patterns) // Merge the enter and update selections
            .select('image')
            .attr('xlink:href', d => `img/${d}.png`);


        newCells.select('circle')
            .style('fill', (d, i) => `url(#pattern-${i})`)
            .style('stroke', 'black')
            .style('stroke-width', '2')
            .transition() // Add transition for update
            .duration(500)
            .attr('r', 60) // Adjust the radius as needed
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .style('filter', 'url(#drop-shadow)') // Apply shadow filter
                    .transition() // Add transition for mouseover
                    .duration(200) // Set the duration of the transition in milliseconds
                    .attr('r', 70);
                d3.select('#artist-name-container').text(d);
                vis.showTracksForArtist(d);
            })
            .on('mouseout', function () {
                d3.select(this)
                    .style('filter', null) // Remove shadow filter
                    .transition() // Add transition for mouseout
                    .duration(200) // Set the duration of the transition in milliseconds
                    .attr('r', 60);
                d3.select('#artist-name-container').text('');
            })
            .on('click', function (event, d) {
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
    }
}