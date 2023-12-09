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
        vis.height = 800;

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

        vis.radiusScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.sizeratio)])
            .range([5, 50]);

        // this moves the bubbles around (collision)
        let simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(vis.width / 2).strength(0.15)) // this puts the bubbles in the center of the svg
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 2));

        let bubbleGroups = vis.svg.selectAll('.bubble-group')
            .data(data)
            .enter().append('g')
            .attr('class', 'bubble-group');

        // color the bubbles based on what dataset they are in
        let bubbles = bubbleGroups.append('circle')
            .attr('class', 'bubble')
            .attr('r', d => vis.radiusScale(d.sizeratio))
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
            .style("font-size", "22px")
            .attr('fill', 'black');


        //tooltip for the bubbles
        let tooltip = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        bubbles.on("mouseover", function (event, d) {

            d3.select(this).style('opacity', .3);


            tooltip.transition().duration(200).style("opacity", 1);
            let tooltipText = `<strong>${d.artist_name}</strong>`;

            if (d.data_src === 'spotify') {
                tooltipText += `<br>Top Songs in Spotify: ${d.count_spotify}`;
            } else if (d.data_src === 'tiktok') {
                tooltipText += `<br>Top Songs in TikTok: ${d.count_tiktok}`;
            } else if (d.data_src === 'both') {
                let spotifyCount = d.spotify_count;
                let tiktokCount = d.tiktok_count;
                tooltipText += `<br>Top Songs in Spotify: ${spotifyCount}<br>Top Songs in TikTok: ${tiktokCount}`;
            }

            tooltip.html(tooltipText)
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 28 + "px")
                .style('font-size', 18)

        })
            .on("mouseout", function () {
                vis.svg.selectAll('.bubble').style('opacity', 1);
                tooltip.transition().duration(500).style("opacity", 0);
            });

    }

    togetherBubbles(data) {
        // this moves the bubbles to 1 cluster
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();
        

        // collision/simulation
        let simulation = d3.forceSimulation(data)
            .force('x', d3.forceX(vis.width / 2).strength(0.15)) // puts bubbles in center of svg
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 2));

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
            .style("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.selectAll('.bubble')
            .style('fill', d => {
                if (d.data_src === 'spotify') {
                    return '#ff0050';
                } else if (d.data_src === 'tiktok') {
                    return '#00f2ea';
                } else if (d.data_src === 'both') {
                    return 'black';
                }
            })
            .attr('r', d => {
                return vis.radiusScale(d.sizeratio);
            });
    }

    separateBubbles(data) {
        // this function moves the bubbles into 3 clusters based on what data set they are in
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();


        let spotifyData = data.filter(d => d.data_src === 'spotify');
        let tiktokData = data.filter(d => d.data_src === 'tiktok');
        let combinedData = data.filter(d => d.data_src === 'both');

        let simulationSpotify = d3.forceSimulation(spotifyData)
            .force('x', d3.forceX(vis.width / 2 - 350).strength(0.15)) //offset the bubbles by 400 to the left
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 1));

        let simulationTikTok = d3.forceSimulation(tiktokData)
            .force('x', d3.forceX(vis.width / 2 + 350).strength(0.15)) //offset bubbles by 400 to the right
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 1));

        let simulationCombined = d3.forceSimulation(combinedData)
            .force('x', d3.forceX(vis.width / 2 ).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 1));

        vis.applyTick(simulationSpotify, 'Spotify');
        vis.applyTick(simulationTikTok, 'TikTok');
        vis.applyTick(simulationCombined, 'Combined');


        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 - 400)
            .attr('y', vis.height - 40)
            .attr('text-anchor', 'middle')
            .style("font-size", "21px")
            .attr('fill', 'black')
            .text('Artists with Top Songs')
            .append('tspan')
            .attr('x', vis.width / 2 - 400)
            .attr('dy', '1.2em')
            .text('on Spotify');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2 + 400)
            .attr('y', vis.height - 40)
            .attr('text-anchor', 'middle')
            .style("font-size", "21px")
            .attr('fill', 'black')
            .text('Artists with Top Songs')
            .append('tspan')
            .attr('x', vis.width / 2 + 400)
            .attr('dy', '1.2em')
            .text('on TikTok');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 2)
            .attr('y', vis.height - 40)
            .attr('text-anchor', 'middle')
            .style("font-size", "21px")
            .attr('fill', 'black')
            .text('Artists with Top Songs')
            .append('tspan')
            .attr('x', vis.width / 2)
            .attr('dy', '1.2em')
            .text('on Both Platforms');


        vis.svg.selectAll('.bubble')
            .style('fill', d => {
                if (d.data_src === 'spotify') {
                    return '#ff0050';
                } else if (d.data_src === 'tiktok') {
                    return '#00f2ea';
                } else if (d.data_src === 'both') {
                    return 'black';
                }
            })
            .attr('r', d => {
                return vis.radiusScale(d.sizeratio);
            });
    }

    clusterOneHitWonders(data) {
        // this function separates artists that only have 1 song on the top charts and artists that have more
        // than 1
        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();
        
        // filter for the above conditions
        let oneHitData = data.filter(
            d => (
                (d.count_spotify === 0 && d.count_tiktok === 1)) ||
                (d.count_spotify === 1 && d.count_tiktok === 0) ||
                (d.spotify_count === 1 && d.tiktok_count === 1) &&
                d.data_src === 'both'
        );

        let aboveOneHitData = data.filter(
            d => !oneHitData.includes(d)
        );

        let oneHitSimulation = d3.forceSimulation(oneHitData)
            .force('x', d3.forceX(vis.width / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 1));

        let aboveOneHitSimulation = d3.forceSimulation(aboveOneHitData)
            .force('x', d3.forceX((3 * vis.width) / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 1));


        vis.applyTick(oneHitSimulation, 'oneHit');
        vis.applyTick(aboveOneHitSimulation, 'aboveOneHit');

        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 4)
            .attr('y', vis.height - 20)
            .text('Artists with Only One Featured Song')
            .style("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', (3 * vis.width) / 4)
            .attr('y', vis.height - 20)
            .text('Artists with More than One Song')
            .style("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        vis.svg.selectAll('.bubble')
            .style('fill', d => {
                if (d.data_src === 'spotify') {
                    return '#ff0050';
                } else if (d.data_src === 'tiktok') {
                    return '#00f2ea';
                } else if (d.data_src === 'both') {
                    return 'black';
                }
            })
            .attr('r', d => {
                return vis.radiusScale(d.sizeratio);
            });
    }

    clusterTopArtists(data) {
        // this function filters the top 20 artists in the combined data based on their sizeratio
        // aka the 20 artists with the largest size ratio because a higher size ratio means that they have more songs 
        // in comparison to other artists
        // (every other way to sort was super buggy)

        let vis = this;
        vis.svg.selectAll('.cluster-label').remove();

        //sorting
        data.sort((a, b) => {
            return parseFloat(b.sizeratio) - parseFloat(a.sizeratio);
        });

        // filtering
        let topArtists = data.slice(0, 30);

        console.log(topArtists)

        let remainingData = data.filter(d => !topArtists.some(topArtist => topArtist.artist_name === d.artist_name));

        console.log(remainingData)

        // collision and forces for the top artists
        let topArtistsSimulation = d3.forceSimulation(topArtists)
            .force('x', d3.forceX(vis.width / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 1));

        let remainingDataSimulation = d3.forceSimulation(remainingData)
            .force('x', d3.forceX((3 * vis.width) / 4).strength(0.15))
            .force('y', d3.forceY(vis.height / 2).strength(0.15))
            .force('collide', d3.forceCollide(d => vis.radiusScale(d.sizeratio) + 1));


        vis.applyTick(topArtistsSimulation, 'topArtists');
        vis.applyTick(remainingDataSimulation, 'remainingData');

        //labels
        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', vis.width / 4)
            .attr('y', vis.height - 20)
            .style("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .text('Artists with the Most Featured Songs');

        vis.svg.append('text')
            .attr('class', 'cluster-label')
            .attr('x', (3 * vis.width) / 4)
            .attr('y', vis.height - 20)
            .style("font-size", "20px")
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .text('Artists with Less Featured Songs');

        vis.svg.selectAll('.bubble')
            .style('fill', d => {
                if (d.data_src === 'spotify') {
                    return '#ff0050';
                } else if (d.data_src === 'tiktok') {
                    return '#00f2ea';
                } else if (d.data_src === 'both') {
                    return 'black';
                }
            })
            .attr('r', d => {
                return vis.radiusScale(d.sizeratio);
            });

    }


    createLegend() {
        //creating the legend in another svg
        console.log("creating legend");
        let vis = this;

        let svgLegend = d3.select("#legend")
            .append("svg")
            .attr("width", 400)
            .attr("height", 230);

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

        vis.searchInput = document.getElementById('searchArtist');

        vis.searchTerm = (vis.searchInput.value).toLowerCase(); // convert to lowercase or else we might
        // not find the artist

        vis.notFoundMessage = document.getElementById('notFoundMessage');

        console.log(vis.searchTerm);
        vis.svg.selectAll('.bubble')
            .style('fill', d => {
                if (d.data_src === 'spotify') {
                    return '#ff0050';
                } else if (d.data_src === 'tiktok') {
                    return '#00f2ea';
                } else if (d.data_src === 'both') {
                    return 'black';
                }
            })
            .attr('r', d => {
                return vis.radiusScale(d.sizeratio);
            });

        vis.searchedBubble = data.find(artist => artist.artist_name.toLowerCase() === vis.searchTerm);
        //lowercase again

        //if the bubble is someone's favorite artist, turn it green and the rest black!
        // otherwise, tell the user we didn't find the artist
        if (vis.searchedBubble) {
            vis.svg.selectAll('.bubble')
                .filter(d => d.artist_name === vis.searchedBubble.artist_name)
                .style('fill', '#32CD32')
                .attr('r', d => {
                    return vis.radiusScale(d.sizeratio) * 1;
                });
            vis.svg.selectAll('.bubble')
                .filter(d => d.artist_name !== vis.searchedBubble.artist_name)
                .style('fill', 'black')
                .attr('r', d => {
                    return vis.radiusScale(d.sizeratio) * 1;
                });
            vis.notFoundMessage.style.display = 'none';
        } else {
            vis.notFoundMessage.style.display = 'block';
        }
    }



}
