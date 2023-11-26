// michelle
// https://observablehq.com/@d3/bubble-chart-component and
// https://gist.github.com/officeofjane/a70f4b44013d06b9c0a973f163d8ab7a
// for reference for most of the bubble code
class BubbleGraph {
    constructor(parentElement, combinedArtistData, topSpotifyArtists, topTikTokArtists) {
        this.parentElement = parentElement;
        this.combinedArtistData = combinedArtistData;
        this.topSpotifyArtists = topSpotifyArtists;
        this.topTikTokArtists = topTikTokArtists;
        this.initVis();
        console.log('combined')
        console.log(this.combinedArtistData[0].sizeratio)
        console.log(this.combinedArtistData[0].data_src)

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

        //linking the buttons from the html
        document.getElementById('form').addEventListener('submit', function(event) {
            event.preventDefault();
        });

        d3.select('#separate-radio').on('click', () => {
            vis.separateBubbles(vis.combinedArtistData);
        });

        d3.select('#together-radio').on('click', () => {
            vis.togetherBubbles(vis.combinedArtistData);
        });

        d3.select('#one-hit-wonders-radio').on('click', () => {
            vis.clusterOneHitWonders(vis.combinedArtistData);
        });

        d3.select('#most-songs-radio').on('click', () => {
            vis.clusterTopArtists(vis.combinedArtistData);
        });

        //search bar
        document.getElementById('searchButton').addEventListener('click', () => {
            vis.search(vis.combinedArtistData);
        });
        vis.updateVisualization();
        vis.createLegend()
    }

    updateVisualization() {
        let vis = this;
        vis.drawBubbles(vis.combinedArtistData);
    }

    drawBubbles(data) {
        // this function draws the bubbles initially
        let vis = this;

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeratio)])
            .range([5, 50]);

        // this moves the bubbles around (collision)
        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(vis.width / 2).strength(0.15)) // this puts the bubbles in the center of the svg
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 2));

        const bubbleGroups = vis.svg.selectAll('.bubble-group')
            .data(data)
            .enter().append('g')
            .attr('class', 'bubble-group');

        // color the bubbles based on what dataset they are in
        const bubbles = bubbleGroups.append('circle')
            .attr('class', 'bubble')
            .attr('r', d => radiusScale(d.sizeratio))
            .style('fill', d => {
                if (d.data_src === 'spotify') {
                    return '#ff0050';
                } else if (d.data_src === 'tiktok') {
                    return '#00f2ea';
                } else if (d.data_src === 'both'){
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
            .style("font-size", "24px")
            .attr('fill', 'black');


        //tooltip for the bubbles
        const tooltip = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        bubbles.on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            let tooltipText = `<strong>${d.artist_name}</strong>`;

            if (d.data_src === 'spotify') {
                tooltipText += `<br>Top Songs in Spotify: ${d.count_spotify}`;
            } else if (d.data_src === 'tiktok') {
                tooltipText += `<br>Top Songs in TikTok: ${d.count_tiktok}`;
            } else if (d.data_src === 'both') {
                const spotifyCount = d.spotify_count;
                const tiktokCount = d.tiktok_count;
                tooltipText += `<br>Top Songs in Spotify: ${spotifyCount}<br>Top Songs in TikTok: ${tiktokCount}`;
            }

            tooltip.html(tooltipText)
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 28 + "px")
                .style('font-size', 18)
                .style("font-family", "Times New Roman, sans-serif");
        })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });

    }

    togetherBubbles(data) {
        // this moves the bubbles to 1 cluster
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeratio)])
            .range([5, 50]);

        // collision/simulation
        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(vis.width / 2).strength(0.15)) // puts bubbles in center of svg
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 2));

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
            .style("font-size", "24px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');
    }

    separateBubbles(data) {
        // this function moves the bubbles into 3 clusters based on what data set they are in
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        const spotifyData = data.filter(d => d.data_src === 'spotify');
        const tiktokData = data.filter(d => d.data_src === 'tiktok');
        const combinedData = data.filter(d => d.data_src === 'both');

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeratio)])
            .range([5, 50]);

        const simulationSpotify = d3.forceSimulation(spotifyData)
            .force('x', d3.forceX(vis.width / 2 - 400).strength(0.15)) //offset the bubbles by 400 to the left
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 1));

        const simulationTikTok = d3.forceSimulation(tiktokData)
            .force('x', d3.forceX(vis.width / 2 + 400).strength(0.15)) //offset bubbles by 400 to the right
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 1));

        const simulationCombined = d3.forceSimulation(combinedData)
            .force('x', d3.forceX(vis.width / 2 ).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 1));

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
            .style("font-size", "21px")
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 + 400)
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on TikTok')
            .attr('text-anchor', 'middle')
            .style("font-size", "21px")
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2)
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on Both Platforms')
            .attr('text-anchor', 'middle')
            .style("font-size", "21px")
            .attr('fill', 'black');
    }

    clusterOneHitWonders(data) {
        // this function separates artists that only have 1 song on the top charts and artists that have more
        // than 1
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeratio)])
            .range([5, 50]);

        // filter for the above conditions
        const oneHitData = data.filter(
            d => (
                (d.count_spotify === 0 && d.count_tiktok === 1)) ||
                (d.count_spotify === 1 && d.count_tiktok === 0) ||
                (d.spotify_count === 1 && d.tiktok_count === 1) &&
                d.data_src === 'both'
        );

        const aboveOneHitData = data.filter(
            d => !oneHitData.includes(d)
        );

        const oneHitSimulation = d3.forceSimulation(oneHitData)
            .force('x', d3.forceX(vis.width / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 1));

        const aboveOneHitSimulation = d3.forceSimulation(aboveOneHitData)
            .force('x', d3.forceX((3 * vis.width) / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 1));


        vis.applyTick(oneHitSimulation, 'oneHit');
        vis.applyTick(aboveOneHitSimulation, 'aboveOneHit');

        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 4)
            .attr('y', vis.height - 20)
            .text('Artists with Only One Featured Song')
            .style("font-size", "24px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', (3 * vis.width) / 4)
            .attr('y', vis.height - 20)
            .text('Artists with More than One Song')
            .style("font-size", "24px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');
    }

    clusterTopArtists(data) {
        // this function filters the top 10 artists in the spotify and tittok datasets based on
        // the top 10 artists with the most songs in each dataset
        // we have to filter these artists from the spotify/tiktok_artist_counts.csv otherwise the combinedArtistData
        // will mess this up... (i spent hours on that bug lol)

        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();

        // filtering
        const topSpotifyArtistsData = vis.topSpotifyArtists.slice(0, 10);
        const topTikTokArtistsData = vis.topTikTokArtists.slice(0, 10);

        const topArtists = topSpotifyArtistsData.concat(topTikTokArtistsData);
        console.log(topArtists)

        //filtering
        const topArtistsData = data.filter(d => topArtists.some(topArtist => topArtist.artist === d.artist_name));
        const remainingData = data.filter(d => !topArtists.some(topArtist => topArtist.artist === d.artist_name));

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeratio)])
            .range([5, 50]);

        // collision and forces for the top artists
        const topArtistsSimulation = d3.forceSimulation(topArtistsData)
            .force('x', d3.forceX(vis.width / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 1));

        const remainingDataSimulation = d3.forceSimulation(remainingData)
            .force('x', d3.forceX((3 * vis.width) / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeratio) + 1));


        vis.applyTick(topArtistsSimulation, 'topArtistsData');
        vis.applyTick(remainingDataSimulation, 'remainingData');

        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 4)
            .attr('y', vis.height - 20)
            .text('Artists with the Most Featured Songs')
            .style("font-size", "24px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', (3 * vis.width) / 4)
            .attr('y', vis.height - 20)
            .text('Artists with Less Featured Songs')
            .style("font-size", "24px")
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
            .text('Both Platforms')
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
            .text('Less Songs Featured')
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
            .text('More Songs Featured')
            .attr('class', 'legend-label');

    }

    applyTick(simulation){
        //change the positions of the bubbles based on the filtering
        let vis = this;
        simulation.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        })
    }

    search(data) {
        // this function lets the user search to see if their favorite artist is one of the bubbles
        let vis = this;
        const searchInput = document.getElementById('searchArtist');

        const searchTerm = (searchInput.value).toLowerCase(); // convert to lowercase or else we might
        // not find the artist

        const notFoundMessage = document.getElementById('notFoundMessage');


        console.log(searchTerm);
        vis.svg.selectAll('.bubble')
            .style('fill', d => {
                if (d.data_src === 'spotify') {
                    return '#ff0050';
                } else if (d.data_src === 'tiktok') {
                    return '#00f2ea';
                } else if (d.data_src === 'both') {
                    return 'black';
                }
            });

        const searchedBubble = data.find(artist => artist.artist_name.toLowerCase() === searchTerm);
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
