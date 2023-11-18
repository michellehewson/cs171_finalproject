// https://observablehq.com/@d3/bubble-chart-component for reference
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

        vis.tiktokBubbleData = Object.keys(tiktokArtistCounts).map(artist => ({
            artist_name: artist,
            count: tiktokArtistCounts[artist],
            sizeRatio: tiktokArtistCounts[artist] / vis.totalTiktokSongs,
            dataset: 'TikTok'
        }));

        vis.spotifyBubbleData.forEach(spotifyArtist => {
            const matchingTikTokArtist = vis.tiktokBubbleData.find(tiktokArtist => tiktokArtist.artist_name === spotifyArtist.artist_name);

            if (matchingTikTokArtist) {
                let combinedData = {
                    artist_name: spotifyArtist.artist_name,
                    count: spotifyArtist.count,
                    count2: matchingTikTokArtist.count,
                    sizeRatio: spotifyArtist.sizeRatio,
                    dataset: 'Combined'
                };

                combinedArtistBubbleData.push(combinedData);

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

    drawBubbles(data) {
        let vis = this;

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeRatio)])
            .range([5, 50]);

        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(vis.width / 2).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        const bubbleGroups = vis.svg.selectAll('.bubble-group')
            .data(data)
            .enter().append('g')
            .attr('class', 'bubble-group');

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

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 )
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on Spotify and TikTok')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');


        const tooltip = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        bubbles.on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            let tooltipText = `Artist: ${d.artist_name}, `;

            if (d.dataset === 'Spotify') {
                tooltipText += `Songs in Spotify: ${d.count}`;
            } else if (d.dataset === 'TikTok') {
                tooltipText += `Songs in TikTok: ${d.count}`;
            } else if (d.dataset === 'Combined') {
                const spotifyCount = d.count;
                const tiktokCount = d.count2;
                tooltipText += `Songs in Spotify: ${spotifyCount}, Songs in TikTok: ${tiktokCount}`;
            }

            tooltip.text(tooltipText)
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 28 + "px");
        })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });

    }

    togetherBubbles() {
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const simulation = d3.forceSimulation(vis.allBubbleData)
            .force('x', d3.forceX(vis.width / 2).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        simulation.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 )
            .attr('y', vis.height - 20)
            .text('Artists with Top Songs on Spotify and TikTok')
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');
    }

    separateBubbles() {
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        const spotifyData = vis.allBubbleData.filter(d => d.dataset === 'Spotify');
        const tiktokData = vis.allBubbleData.filter(d => d.dataset === 'TikTok');
        const combinedData = vis.allBubbleData.filter(d => d.dataset === 'Combined');

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const separateSimulation = (data, xOffset) => {
            return d3.forceSimulation(data)
                .force('x', d3.forceX(vis.width / 2 + xOffset).strength(0.15))
                .force('y', d3.forceY(vis.height / 2).strength(0.15))
                .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));
        };

        const simulationSpotify = separateSimulation(spotifyData, -400);
        const simulationTikTok = separateSimulation(tiktokData, 400);
        const simulationCombined = separateSimulation(combinedData, 0);

        const applyTick = (simulation, dataset) => {
            simulation.on('tick', () => {
                vis.svg.selectAll('.bubble')
                    .filter(d => d.dataset === dataset)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
            });
        };

        applyTick(simulationSpotify, 'Spotify');
        applyTick(simulationTikTok, 'TikTok');
        applyTick(simulationCombined, 'Combined');

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


    search() {
        let vis = this;
        const searchInput = document.getElementById('searchArtist');

        const searchTerm = (searchInput.value).toLowerCase();

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

    clusterOneHitWonders() {
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


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

        const applyTick = (simulation, dataset) => {
            simulation.on('tick', () => {
                vis.svg.selectAll('.bubble')
                    .filter(d => d.dataset === dataset)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
            });
        };

        applyTick(oneHitSimulation, 'oneHit');
        applyTick(aboveOneHitSimulation, 'aboveOneHit');

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
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        const topSpotifyArtistsData = vis.topSpotifyArtists.slice(0, 10);
        const topTikTokArtistsData = vis.topTikTokArtists.slice(0, 10);

        const topArtists = topSpotifyArtistsData.concat(topTikTokArtistsData);
        console.log(topArtists)

        const topArtistsData = vis.allBubbleData.filter(d => topArtists.some(topArtist => topArtist.artist === d.artist_name));
        const remainingData = vis.allBubbleData.filter(d => !topArtists.some(topArtist => topArtist.artist === d.artist_name));

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const topArtistsSimulation = d3.forceSimulation(topArtistsData)
            .force('x', d3.forceX(vis.width / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));

        const remainingDataSimulation = d3.forceSimulation(remainingData)
            .force('x', d3.forceX((3 * vis.width) / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 1));

        const applyTick = (simulation, dataset) => {
            simulation.on('tick', () => {
                vis.svg.selectAll('.bubble')
                    .filter(d => d.dataset === dataset)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
            });
        };

        applyTick(topArtistsSimulation, 'topArtistsData');
        applyTick(remainingDataSimulation, 'remainingData');

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


}
