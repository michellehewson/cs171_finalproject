// https://observablehq.com/@d3/bubble-chart-component for reference
class BubbleGraph {
    constructor(parentElement, spotifyData, tiktokData, mergedData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.tiktokData = tiktokData;
        this.mergedData = mergedData;
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
        vis.updateVisualization();
        vis.createLegend();

        document.getElementById('form').addEventListener('submit', function(event) {
            event.preventDefault();
        });

        d3.select('#separate-button').on('click', () => {
            vis.separateBubbles();
        });

        d3.select('#together-button').on('click', () => {
            vis.togetherBubbles();
        });

        d3.select('#one-hit-wonders-button').on('click', () => {
            vis.oneHitWonders();
        });

        d3.select('#everyone-button').on('click', () => {
            vis.everyone();
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

        vis.allBubbleData = vis.spotifyBubbleData.concat(vis.tiktokBubbleData).concat(combinedArtistBubbleData);
        //  console.log(vis.allBubbleData)
    }

    updateVisualization() {
        let vis = this;
        vis.drawBubbles(vis.allBubbleData);
    }

    drawBubbles(data) {
        let vis = this;

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeRatio)])
            .range([5, 50]);

        const simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(vis.width / 2).strength(0.05))
            .force('y', d3.forceY(vis.height / 2).strength(0.05))
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

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const simulation = d3.forceSimulation(vis.allBubbleData)
            .force('x', d3.forceX(vis.width / 2).strength(0.05))
            .force('y', d3.forceY(vis.height / 2).strength(0.05))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        simulation.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });
    }

    separateBubbles() {
        let vis = this;

        const spotifyData = vis.allBubbleData.filter(d => d.dataset === 'Spotify');
        const tiktokData = vis.allBubbleData.filter(d => d.dataset === 'TikTok');
        const combinedData = vis.allBubbleData.filter(d => d.dataset === 'Combined');

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const separateSimulation = (data, xOffset) => {
            return d3.forceSimulation(data)
                .force('x', d3.forceX(vis.width / 2 + xOffset).strength(0.08))
                .force('y', d3.forceY(vis.height / 2).strength(0.08))
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

    oneHitWonders() {
        let vis = this;

        const oneHitWondersData = vis.allBubbleData.filter(d => d.count === 1);

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const simulation = d3.forceSimulation(vis.allBubbleData)
            .force('x', d3.forceX(vis.width / 2).strength(d => {
                return (d.count === 1) ? 0.25 : 0.05;
            }))
            .force('y', d3.forceY(vis.height / 2).strength(d => {
                return (d.count === 1) ? 0.25 : 0.05;
            }))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        simulation.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .style('display', d => {
                    return (d.count === 1) ? 'block' : 'none';
                });
        });
    }

    everyone() {
        let vis = this;

        const radiusScale = d3.scaleLinear()
            .domain([0, d3.max(vis.allBubbleData, d => d.sizeRatio)])
            .range([5, 50]);

        const simulation = d3.forceSimulation(vis.allBubbleData)
            .force('x', d3.forceX(vis.width / 2).strength(0.05))
            .force('y', d3.forceY(vis.height / 2).strength(0.05))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        simulation.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

        vis.svg.selectAll('.bubble')
            .style('display', 'block');
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