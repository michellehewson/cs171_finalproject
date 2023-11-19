// michelle
// https://observablehq.com/@d3/bubble-chart-component and
// https://gist.github.com/officeofjane/a70f4b44013d06b9c0a973f163d8ab7a
// for reference for most of the bubble code
class BubbleGraph {
    constructor(parentElement, spotifyData, tiktokData, spotifyartistcount, tiktokartistcount) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.tiktokData = tiktokData;
        this.topSpotifyArtists = spotifyartistcount;
        this.topTikTokArtists = tiktokartistcount;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.width = 1100;
        vis.height = 700;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .style("display", "block")
            .style("margin", "auto");

        vis.wrangleData();
        vis.updateVisualization(vis.allBubbleData);
        vis.createLegend();


        //linking the buttons from the html
        document.getElementById('form').addEventListener('submit', function(event) {
            event.preventDefault();
        });

        d3.select('#separate-radio').on('click', () => {
            vis.separateBubbles();
        });

        d3.select('#together-radio').on('click', () => {
            vis.togetherBubbles();
        });

        d3.select('#one-hit-wonders-radio').on('click', () => {
            vis.clusterOneHitWonders();
        });

        d3.select('#most-songs-radio').on('click', () => {
            vis.clusterTopArtists();
        });

        //search bar
        document.getElementById('searchButton').addEventListener('click', () => {
            vis.search();
        });
    }

    wrangleData() {
        let vis = this;
        let combinedArtistBubbleData = [];

        let spotifyArtistCounts = {};
        vis.spotifyArtists = vis.spotifyData.map(song => song.artist_name);

        vis.spotifyArtists.forEach(artist => {
            spotifyArtistCounts[artist] = (spotifyArtistCounts[artist] || 0) + 1;
        });
        vis.totalSpotifySongs = vis.spotifyArtists.length;


        //create bubble data for spotify (artist_name, count:number of songs, size_ratio: number of songs/total # of songs)
        vis.spotifyBubbleData = Object.keys(spotifyArtistCounts).map(artist => ({
            artist_name: artist,
            count: spotifyArtistCounts[artist],
            sizeRatio: spotifyArtistCounts[artist] / vis.totalSpotifySongs,
            dataset: 'Spotify'
        }));

        vis.tiktokArtists = vis.tiktokData.map(song => song.artist_name);
        let tiktokArtistCounts = {};

        vis.tiktokArtists.forEach(artist => {
            tiktokArtistCounts[artist] = (tiktokArtistCounts[artist] || 0) + 1;
        });
        vis.totalTiktokSongs = vis.tiktokArtists.length;

        //create bubble data for tiktok (artist_name, count:number of songs, size_ratio: number of songs/total # of songs)
        vis.tiktokBubbleData = Object.keys(tiktokArtistCounts).map(artist => ({
            artist_name: artist,
            count: tiktokArtistCounts[artist],
            sizeRatio: tiktokArtistCounts[artist] / vis.totalTiktokSongs,
            dataset: 'TikTok'
        }));

        // check if an artist is in both data sets
        vis.spotifyBubbleData.forEach(spotifyArtist => {
            const matchingTikTokArtist = vis.tiktokBubbleData.find(tiktokArtist => tiktokArtist.artist_name === spotifyArtist.artist_name);

            //create bubble data for artists that are in both data sets
            // (artist_name, count:number of songs, size_ratio: number of songs/total # of SPOTIFY songs)
            if (matchingTikTokArtist) {
                let combinedData = {
                    artist_name: spotifyArtist.artist_name,
                    count: spotifyArtist.count,
                    count2: matchingTikTokArtist.count,
                    sizeRatio: spotifyArtist.sizeRatio,
                    dataset: 'Combined'
                };

                //appending the artists to the combinedartistdata
                combinedArtistBubbleData.push(combinedData);

                //remove the artists that are in both datasets from the spotify and tiktok datasets
                vis.spotifyBubbleData = vis.spotifyBubbleData.filter(artist => artist.artist_name !== spotifyArtist.artist_name);
                vis.tiktokBubbleData = vis.tiktokBubbleData.filter(artist => artist.artist_name !== spotifyArtist.artist_name);
            }
        });

        vis.combinedArtistBubbleData = combinedArtistBubbleData;

        vis.allBubbleData = vis.spotifyBubbleData.concat(vis.tiktokBubbleData).concat(combinedArtistBubbleData);
        //  console.log(vis.allBubbleData)

    }

    updateVisualization(allBubbleData) {
        let vis = this;
        vis.drawBubbles(allBubbleData);
    }

    applyTick(simulation, dataset){
        //change the positions of the bubbles based on the filtering
        let vis = this;
        simulation.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .filter(d => d.dataset === dataset)
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        })
    }

    drawBubbles(data) {
        // this function draws the bubbles initially
        let vis = this;

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeRatio)])
            .range([5, 50]);

        // this moves the bubbles around (collision)
        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(vis.width / 2).strength(0.15)) // this puts the bubbles in the center of the svg
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        const bubbleGroups = vis.svg.selectAll('.bubble-group')
            .data(data)
            .enter().append('g')
            .attr('class', 'bubble-group');

        // color the bubbles based on what dataset they are in
        const bubbles = bubbleGroups.append('circle')
            .attr('class', 'bubble')
            .attr('r', d => radiusScale(d.sizeRatio))
            .style('fill', d => {
                if (d.dataset === 'Spotify') {
                    return '#ff0050';
                } else if (d.dataset === 'TikTok') {
                    return '#00f2ea';
                } else {
                    return 'black';
                }
            });

        simulation.on('tick', () => {
            bubbles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

        });

        //label below the bubbles
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 )
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on Spotify and TikTok')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');


        //tooltip for the bubbles
        const tooltip = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        bubbles.on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            let tooltipText = `Artist: ${d.artist_name}`;

            if (d.dataset === 'Spotify') {
                tooltipText += `<br>Top Songs in Spotify: ${d.count}`;
            } else if (d.dataset === 'TikTok') {
                tooltipText += `<br>Top Songs in TikTok: ${d.count}`;
            } else if (d.dataset === 'Combined') {
                const spotifyCount = d.count;
                const tiktokCount = d.count2;
                tooltipText += `<br>Top Songs in Spotify: ${spotifyCount}<br>Top Songs in TikTok: ${tiktokCount}`;
            }

            tooltip.html(tooltipText)
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 28 + "px");
        })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });

    }

    togetherBubbles() {
        // this moves the bubbles to 1 cluster
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        // collision/simulation
        const simulation = d3.forceSimulation(vis.allBubbleData)
            .force('x', d3.forceX(vis.width / 2).strength(0.15)) // puts bubbles in center of svg
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        simulation.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

        //label
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 )
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on Spotify and TikTok')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');
    }

    separateBubbles() {
        // this function moves the bubbles into 3 clusters based on what data set they are in
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        const spotifyData = vis.allBubbleData.filter(d => d.dataset === 'Spotify');
        const tiktokData = vis.allBubbleData.filter(d => d.dataset === 'TikTok');
        const combinedData = vis.allBubbleData.filter(d => d.dataset === 'Combined');

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const simulationSpotify = d3.forceSimulation(spotifyData)
            .force('x', d3.forceX(vis.width / 2 - 400).strength(0.15)) //offset the bubbles by 400 to the left
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));

        const simulationTikTok = d3.forceSimulation(tiktokData)
            .force('x', d3.forceX(vis.width / 2 + 400).strength(0.15)) //offset bubbles by 400 to the right
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));

        const simulationCombined = d3.forceSimulation(combinedData)
            .force('x', d3.forceX(vis.width / 2 ).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));

        vis.applyTick(simulationSpotify, 'Spotify');
        vis.applyTick(simulationTikTok, 'TikTok');
        vis.applyTick(simulationCombined, 'Combined');


        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 - 400)
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on Spotify')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 + 400)
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on TikTok')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2)
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on Both Platforms')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');
    }

    clusterOneHitWonders() {
        // this function separates artists that only have 1 song on the top charts and artists that have more
        // than 1
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        // filter for the above conditions
        const oneHitData = vis.allBubbleData.filter(
            d => d.count === 1
        );
        const aboveOneHitData = vis.allBubbleData.filter(
            d => d.count !== 1
        );

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const oneHitSimulation = d3.forceSimulation(oneHitData)
            .force('x', d3.forceX(vis.width / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));

        const aboveOneHitSimulation = d3.forceSimulation(aboveOneHitData)
            .force('x', d3.forceX((3 * vis.width) / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));


        vis.applyTick(oneHitSimulation, 'oneHit');
        vis.applyTick(aboveOneHitSimulation, 'aboveOneHit');

        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 4)
            .attr('y', vis.height - 20)
            .text('Artists with Only One Featured Song')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', (3 * vis.width) / 4)
            .attr('y', vis.height - 20)
            .text('Artists with More than One Song')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');
    }

    clusterTopArtists() {
        // this function filters the top 10 artists in the spotify and tittok datasets based on
        // the top 10 artists with the most songs in each dataset
        // we have to filter these artists from the spotify/tiktok_artist_counts.csv otherwise the combinedbubbledata
        // will mess this up... (i spent hours on that bug lol)

        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();

        // filtering
        const topSpotifyArtistsData = vis.topSpotifyArtists.slice(0, 10);
        const topTikTokArtistsData = vis.topTikTokArtists.slice(0, 10);

        const topArtists = topSpotifyArtistsData.concat(topTikTokArtistsData);
        console.log(topArtists)

        //filtering
        const topArtistsData = vis.allBubbleData.filter(d => topArtists.some(topArtist => topArtist.artist === d.artist_name));
        const remainingData = vis.allBubbleData.filter(d => !topArtists.some(topArtist => topArtist.artist === d.artist_name));

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        // collision and forces for the top artists
        const topArtistsSimulation = d3.forceSimulation(topArtistsData)
            .force('x', d3.forceX(vis.width / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));

        const remainingDataSimulation = d3.forceSimulation(remainingData)
            .force('x', d3.forceX((3 * vis.width) / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));


        vis.applyTick(topArtistsSimulation, 'topArtistsData');
        vis.applyTick(remainingDataSimulation, 'remainingData');

        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 4)
            .attr('y', vis.height - 20)
            .text('Artists with the Most Featured Songs')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', (3 * vis.width) / 4)
            .attr('y', vis.height - 20)
            .text('Artists with Less Featured Songs')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');
    }


    createLegend() {
        //creating the legend in another svg
        console.log("creating legend");
        let vis = this;

        let svgLegend = d3.select("#legend")
            .append("svg")
            .attr("width", 200)
            .attr("height", 250);

        let legend = svgLegend.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(20, 20)');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 7)
            .attr('r', 10)
            .style('fill', '#ff0050');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 47)
            .attr('r', 10)
            .style('fill', '#00f2ea');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 87)
            .attr('r', 10)
            .style('fill', 'black');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text('Spotify')
            .attr('class', 'legend-label');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 52)
            .text('TikTok')
            .attr('class', 'legend-label');

        legend.append('text')
            .attr('x', 20)
            .attr('y', 92)
            .text('Both')
            .attr('class', 'legend-label');

        let sizeLegend = svgLegend.append('g')
            .attr('class', 'size-legend')
            .attr('transform', 'translate(20, 150)');

        sizeLegend.append('circle')
            .attr('cx', 0)
            .attr('cy', 7)
            .attr('r', 5)
            .style('fill', 'none')
            .style('stroke', 'black');

        sizeLegend.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .text('Less Songs')
            .attr('class', 'legend-label');

        sizeLegend.append('circle')
            .attr('cx', 0)
            .attr('cy', 47)
            .attr('r', 15)
            .style('fill', 'none')
            .style('stroke', 'black');

        sizeLegend.append('text')
            .attr('x', 20)
            .attr('y', 50)
            .text('More Songs')
            .attr('class', 'legend-label');

    }

    search() {
        // this function lets the user search to see if their favorite artist is one of the bubbles
        let vis = this;
        const searchInput = document.getElementById('searchArtist');

        const searchTerm = (searchInput.value).toLowerCase(); // convert to lowercase or else we might
        // not find the artist

        const notFoundMessage = document.getElementById('notFoundMessage');


        console.log(searchTerm);
        vis.svg.selectAll('.bubble')
            .style('fill', d => {
                if (d.dataset === 'Spotify') {
                    return '#ff0050';
                } else if (d.dataset === 'TikTok') {
                    return '#00f2ea';
                } else {
                    return 'black';
                }
            });

        const searchedBubble = vis.allBubbleData.find(artist => artist.artist_name.toLowerCase() === searchTerm);
        //lowercase again

        //if the bubble is someone's favorite artist, turn it yellow!
        // otherwise, tell the user we didn't find the artist
        if (searchedBubble) {
            vis.svg.selectAll('.bubble')
                .filter(d => d.artist_name === searchedBubble.artist_name)
                .style('fill', 'yellow');
            notFoundMessage.style.display = 'none';
        } else {
            console.log('artist not found');
            notFoundMessage.style.display = 'block';
        }
    }


}
