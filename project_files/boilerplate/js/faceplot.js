class FacePlot {
    constructor(parentElement, spotifyData, tiktokData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.tiktokData = tiktokData;
        this.currentArtist = null;
        this.initVis();


    }

    initVis() {
        let vis = this;

        vis.music_embed = {
            'Harry Styles': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4Dvkj6JhhA12EX05fT7y2e?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowFullScreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Ed Sheeran': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/7qiZfU4dY1lWllzX7mPBI3?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Shawn Mendes': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/0TK2YIli7K1leLovkQiNik?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            '24kGoldn': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4jPy3l0RUwlUI9T5XHBW2m?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Post Malone': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/3KkXRkHbMCARz0aVfEt68P?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'The Weeknd': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/0VjIjW4GlUZAMYd2vXMi3b?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Ariana Grande': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/35mvY5S1H3J2QZyna3TFe0?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Tones And I': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/2XU0oxnq2qxCpomAAuJY8K?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Kendrick Lamar': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/7KXjTSCq5nL1LoYtL7XAwS?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Drake': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/3F5CgOj3wFlRv51JsHbxhe?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Justin Bieber': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4iJyoBOLtHqaGxP12qzhQI?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Rauw Alejandro': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/4fSIb4hdOQ151TILNsSEaF?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Bad Bunny': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/47EiUVwUp4C9fGccaPuUCS?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Doja Cat': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/6Uj1ctrBOjOas8xZXGqKk4?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>',
            'Imagine Dragons': '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/1r9xUipOqoNwggBpENDsvJ?utm_source=generator&theme=0" width="60%" height="200" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>'
        }


        vis.margin = { top: 40, right: 10, bottom: 60, left: 60 };


        vis.width = 900;
        vis.height = 440;
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

        d3.select('#showSpotifyButton').on('click', function () {
            vis.getTopArtistsFromSpotify();
            d3.select('#showSpotifyButton').text('Top Spotify Artists');
            d3.select('#showTiktokButton').text('Show TikTok Artists');
            vis.updateVis();
        });

        d3.select('#showTiktokButton').on('click', function () {
            vis.getTopArtistsFromTiktok();
            d3.select('#showTiktokButton').text('Top TikTok Artists');
            d3.select('#showSpotifyButton').text('Show Spotify Artists');
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
                const translateX = colIndex * (vis.cellSize.width ) + vis.cellSize.width / 2;
                const translateY = rowIndex * (vis.cellSize.height)+ vis.cellSize.height / 2;
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
            .attr('width', 150)
            .attr('height', 150)
            .attr('xlink:href', d => `img/${d}.png`);

        cells.append('circle')
            .attr('r', 70) // Adjust the radius as needed
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

        if (vis.uniqueArtists.length > vis.numDisplayedArtists) {
            vis.numDisplayedArtists = vis.uniqueArtists.length;
        }

        vis.svg.append('defs')
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%')
            .attr('dx', 0)
            .attr('dy', 4)
            .attr('stdDeviation', 4);

        vis.artistNameContainer = d3.select('#artist-name-container');

        vis.updateVis();
    }


    showTracksForArtist(selectedArtist) {
        let vis = this;
        let artistTracks;
        let source;

        if (vis.isShowingTikTok) {
            artistTracks = vis.tiktokData.filter(entry => entry.artist_name === selectedArtist);
            source = 'TikTok';
        } else {
            artistTracks = vis.spotifyData.filter(entry => entry.artist_name === selectedArtist);
            source = 'Spotify';
        }

        const spotifyEmbed = vis.generateSpotifyEmbed(selectedArtist);

        if (selectedArtist !== vis.currentArtist) {
            const tracksHtml = artistTracks.map(entry => `<p>${entry.track_name}</p>`).join(''); //chatgpt helped me create this
            const tracksContainer = d3.select('#artist-name-container');
            const spotifyEmbedContainer = d3.select('#spotify-music-embed');


            tracksContainer.html('');
            spotifyEmbedContainer.html('');


            tracksContainer.append('h4')
                .text(`Tracks for ${selectedArtist} (from ${source}):`);

            tracksContainer.append('div')
                .html(tracksHtml);

            spotifyEmbedContainer.append('div')
                .attr('class', 'spotify-embed')
                .html(spotifyEmbed);

            vis.currentArtist = selectedArtist;
        }
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

    handleMouseEvents() {
        let vis = this;
        vis.newCells.selectAll('circle')
            .on('mouseover', function (event, d) {
                d3.select(this).style('filter', 'url(#drop-shadow)'); // Apply shadow filter
                vis.showTracksForArtist(d);
            })
            .on('mouseleave', function () {
                const circle = d3.select(this);
                circle.style('filter', null);
            });
    }


    updateVis() {
        let vis = this;
        const cells = vis.svg.selectAll('.cell')
            .data(vis.subset);

        d3.select('#showSpotifyButton')
            .on('click', function () {
                d3.select(this)
                    .classed('button-selected', true); // Add the selected class
                d3.select('#showTiktokButton')
                    .classed('button-selected', false); // Remove the selected class from the other button

                vis.getTopArtistsFromSpotify();
                vis.updateVis();
            });

        d3.select('#showTiktokButton')
            .on('click', function () {
                d3.select(this)
                    .classed('button-selected', true); // Add the selected class
                d3.select('#showSpotifyButton')
                    .classed('button-selected', false); // Remove the selected class from the other button

                vis.getTopArtistsFromTiktok();
                vis.updateVis();
            });

        cells.exit()
            .transition()
            .duration(500)
            .remove();

         vis.newCells = cells.enter()
            .append('g')
            .merge(cells) // Merge the enter and update selections
            .attr('class', 'cell')
            .attr('transform', (d, i) => {
                const colIndex = i % vis.cols;
                const rowIndex = Math.floor(i / vis.cols);
                const translateX = colIndex * (vis.cellSize.width ) + vis.cellSize.width / 2;
                const translateY = rowIndex * (vis.cellSize.height )+ vis.cellSize.height / 2;
                return `translate(${translateX},${translateY})`;
            });

        const patterns = vis.newCells.selectAll('.pattern')
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

        vis.newCells.select('circle')
            .style('fill', (d, i) => `url(#pattern-${i})`)
            .style('stroke', 'black')
            .style('stroke-width', '2');

        vis.svg.append('defs')
            .append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '130%')
            .append('feDropShadow')
            .attr('dx', 0)
            .attr('dy', 4)
            .attr('stdDeviation', 4);

        vis.newCells.each(function () {
            const circle = d3.select(this).select('circle');

            if (circle.classed('mouse-out')) {
                circle.style('filter', null);
                circle.classed('mouse-out', false);
            }
        });

        vis.handleMouseEvents();
    }

    generateSpotifyEmbed(artistName) {
        let vis = this;
        vis.embedHTML = this.music_embed[artistName]; //dictionary of the embedded songs from Spotify (click share on a song and you can embed it)
        return `<div class="spotify-embed">${vis.embedHTML}</div>`;
        }

}