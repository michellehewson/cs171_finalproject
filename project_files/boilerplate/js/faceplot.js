class FacePlot {
    constructor(parentElement, spotifyData, tiktokData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.tiktokData = tiktokData;
        this.currentArtist = null; // Initialize the currently displayed artist
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.margin = { top: 40, right: 10, bottom: 60, left: 60 };
        vis.width = 960 - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        const rows = 3;
        vis.cols = 3;
        vis.cellSize = {
            width: vis.width / vis.cols - 50,
            height: vis.height / rows
        };

        d3.select('#showTopArtistsButton').text('Show Spotify Data');

        d3.select('#showTopArtistsButton').on('click', function () {
            if (vis.isShowingTikTok) {
                vis.getTopArtistsFromSpotify();
                d3.select(this).text('Show TikTok Data'); // Change button text
            } else {
                vis.getTopArtistsFromTiktok();
                d3.select(this).text('Show Spotify Data'); // Change button text
            }
            vis.updateVis();
        });

        vis.getTopArtistsFromTiktok();

        vis.defs = vis.svg.append('defs');

        vis.defs.append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%')
            .append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 4)
            .attr('stdDeviation', 4);

        const cells = vis.svg.selectAll('.cell')
            .data(vis.subset)
            .enter()
            .append('g')
            .attr('class', 'cell')
            .attr('transform', (d, i) => {
                const colIndex = i % vis.cols;
                const rowIndex = Math.floor(i / vis.cols);
                const translateX = colIndex * (vis.cellSize.width + 50) + vis.cellSize.width / 2;
                const translateY = rowIndex * vis.cellSize.height + vis.cellSize.height / 2;
                return `translate(${translateX},${translateY})`;
            });

        const patterns = cells.append('defs')
            .append('pattern')
            .attr('id', (d, i) => `pattern-${i}`)
            .attr('class', 'pattern')
            .attr('width', 1)
            .attr('height', 1)
            .append('image')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 120)
            .attr('height', 120)
            .attr('xlink:href', d => `img/${d}.png`);

        cells.append('circle')
            .attr('r', 60) // Adjust the radius as needed
            .style('fill', (d, i) => `url(#pattern-${i})`)
            .style('stroke', 'black')
            .style('stroke-width', '2')
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .style('filter', 'url(#drop-shadow)'); // Apply shadow filter
                vis.showTracksForArtist(d);
            })
            .on('mouseout', function () {
                const circle = d3.select(this);
                circle.style('filter', null);
            });

        vis.svg.append('defs')
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%')
            .attr('dx', 0)
            .attr('dy', 4)
            .attr('stdDeviation', 4);

        vis.scrollbarHeight = 50; // Adjust the height of the scrollbar
        vis.numDisplayedArtists = 9; // Number of artists to display in the visualization


        vis.scrollbar = vis.svg.append('rect')
            .attr('class', 'scrollbar')
            .attr('x', vis.width ) // Position the scrollbar at the right edge of the SVG, considering container width
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', vis.scrollbarHeight) // Set the height to cover the #artist-name-container
            .style('fill', 'lightgray')
            .call(d3.drag().on('drag', function () {
                // Handle drag events
                const mouseY = d3.event.y;
                const scrollPosition = Math.max(0, Math.min(vis.scrollbarHeight, mouseY));
                const percentScrolled = scrollPosition / vis.scrollbarHeight;
                // Update the subset of songs based on the scrollbar position
                const totalSongs = vis.uniqueArtists.length;
                const startIndex = Math.floor(percentScrolled * (totalSongs - vis.numDisplayedArtists));
                const endIndex = startIndex + vis.numDisplayedArtists;
                vis.subset = vis.uniqueArtists.slice(startIndex, endIndex);

                vis.updateVis();

                // Get the artist name at the center of the subset (or adjust as needed)
                const centerIndex = Math.floor(vis.subset.length / 2);
                const selectedArtist = vis.subset[centerIndex];
                vis.showTracksForArtist(selectedArtist);
                vis.scrollbar.attr('y', scrollPosition);
            }));

        vis.svgBar = d3.select('#bar-chart')
            .append("svg")
            .attr("width", 350)
            .attr("height", 350);


        vis.updateVis();
    }

    drawBarChart(averageValues) {
        let vis = this;
        const attributes = ['Danceability', 'Energy', 'Acousticness'];
        const barWidth = 75;

        // Calculate the maximum height based on the height of #tracks-container
        const maxBarHeight = parseInt(d3.select('#tracks-container').style('max-height'));

        const barHeightScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, maxBarHeight]); // Adjust the range to fit within the height of #tracks-container

        // Clear existing elements in the SVG container
        vis.svgBar.selectAll('*').remove();

        // Create a container for the bar chart
        const chartContainer = vis.svgBar.append("g")
            .attr("class", "chart-container");

        // Append new bars
        chartContainer.selectAll(".bar")
            .data(attributes)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d, i) => i * (barWidth + 10))
            .attr("y", d => maxBarHeight - barHeightScale(averageValues[d])) // Adjust the y attribute
            .attr("width", barWidth)
            .attr("height", d => barHeightScale(averageValues[d]));

        // Append labels for each bar
        chartContainer.selectAll(".bar-label")
            .data(attributes)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", (d, i) => i * (barWidth + 10) + barWidth / 2)
            .attr("y", maxBarHeight + 20) // Adjust the y attribute for label positioning
            .attr("text-anchor", "middle")
            .text(d => d);
    }


    showTracksForArtist(selectedArtist) {
        let vis = this
        let artistTracks;
        let source;

        if (vis.isShowingTikTok) {
            // If currently showing TikTok data, use TikTok data
            artistTracks = vis.tiktokData.filter(entry => entry.artist_name === selectedArtist);
            source = 'TikTok';
        } else {
            // If currently showing Spotify data, use Spotify data
            artistTracks = vis.spotifyData.filter(entry => entry.artist_name === selectedArtist);
            source = 'Spotify';
        }

        if (selectedArtist !== vis.currentArtist) {
            const tracksHtml = artistTracks.map(entry => `<p>${entry.track_name}</p>`).join('');
            d3.select('#artist-name-container')
                .html(`<h4>Tracks for ${selectedArtist} (from ${source}):</h4>`)
                .append('div')
                .attr('id', 'tracks-container')
                .style('max-height', '200px') // Set the maximum height for the container
                .style('overflow-y', 'auto') // Enable vertical scrolling
                .html(tracksHtml);
            vis.currentArtist = selectedArtist;
        }

        const averageValues = vis.calculateAverageValues(artistTracks);
        this.drawBarChart(averageValues);
    }

     calculateAverageValues(tracks) {
        const numTracks = tracks.length;
        const sumDanceability = tracks.reduce((sum, track) => sum + track.danceability, 0);
        const sumEnergy = tracks.reduce((sum, track) => sum + track.energy, 0);
        const sumAcousticness = tracks.reduce((sum, track) => sum + track.acousticness, 0);

        return {
            Danceability: sumDanceability / numTracks,
            Energy: sumEnergy / numTracks,
            Acousticness: sumAcousticness / numTracks
        };
    }

    getTopArtistsFromTiktok() {
        let vis = this;
        vis.isShowingTikTok = true;
        vis.tiktokData.sort((a, b) => b.artist_pop - a.artist_pop);
        vis.uniqueArtists = Array.from(new Set(vis.tiktokData.map(entry => entry.artist_name)));
        vis.subset = vis.uniqueArtists.slice(0, 9);
    }

    getTopArtistsFromSpotify() {
        let vis = this;
        vis.isShowingTikTok = false;
        vis.spotifyData.sort((a, b) => {
            if (a.peak_rank !== b.peak_rank) {
                return a.peak_rank - b.peak_rank;
            } else {
                return b.weeks_on_chart - a.weeks_on_chart;
            }
        });
        vis.uniqueArtists = Array.from(new Set(vis.spotifyData.map(entry => entry.artist_name)));
        vis.subset = vis.uniqueArtists.slice(0, 9);
        console.log(vis.subset)
    }

    updateVis() {
        let vis = this;
        vis.scrollbar.attr('height',20);

        // Update the data binding for cells
        const cells = vis.svg.selectAll('.cell')
            .data(vis.subset);

        // Exit
        cells.exit()
            .transition() // Add transition for exit
            .duration(500) // Set the duration of the transition in milliseconds
            .remove();

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
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .style('filter', 'url(#drop-shadow)'); // Apply shadow filter
                vis.showTracksForArtist(d);
            })
            .on('mouseout', function () {
                const circle = d3.select(this);
                circle.style('filter', null);

            });

        vis.svg.append('defs')
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%')
            .append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 4)
            .attr('stdDeviation', 4);

        newCells.each(function () {
            const circle = d3.select(this).select('circle');

            if (circle.classed('mouse-out')) {
                circle.style('filter', null);
                circle.classed('mouse-out', false);
            }
        });
    }


}