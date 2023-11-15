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
        vis.width = 1296;
        vis.height = 700;
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append('g');

        let legend = vis.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(450, 140)');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 7)
            .attr('r', 6)
            .style('fill', 'lightgrey');

        legend.append('circle')
            .attr('cx', 20)
            .attr('cy', 7)
            .attr('r', 6)
            .style('fill', 'grey');

        legend.append('circle')
            .attr('cx', 40)
            .attr('cy', 7)
            .attr('r', 6)
            .style('fill', 'black');


        vis.wrangleData();
        vis.updateVisualization();

        d3.select('#separate-button').on('click', () => {
            vis.separateBubbles();
        });
    }

    wrangleData() {
        let vis = this;
        let combinedArtistBubbleData = [];

        const spotifyArtists = vis.spotifyData.map(song => song.artist_name);
        let spotifyArtistCounts = {};
        spotifyArtists.forEach(artist => {
            spotifyArtistCounts[artist] = (spotifyArtistCounts[artist] || 0) + 1;
        });
        const totalSpotifySongs = spotifyArtists.length;

        vis.spotifyBubbleData = Object.keys(spotifyArtistCounts).map(artist => ({
            artist_name: artist,
            count: spotifyArtistCounts[artist],
            sizeRatio: spotifyArtistCounts[artist] / totalSpotifySongs,
            dataset: 'Spotify'
        }));

        const tiktokArtists = vis.tiktokData.map(song => song.artist_name);
        let tiktokArtistCounts = {};
        tiktokArtists.forEach(artist => {
            tiktokArtistCounts[artist] = (tiktokArtistCounts[artist] || 0) + 1;
        });
        const totalTiktokSongs = tiktokArtists.length;

        vis.tiktokBubbleData = Object.keys(tiktokArtistCounts).map(artist => ({
            artist_name: artist,
            count: tiktokArtistCounts[artist],
            sizeRatio: tiktokArtistCounts[artist] / totalTiktokSongs,
            dataset: 'TikTok'
        }));

        vis.spotifyBubbleData.forEach(spotifyArtist => {
            const matchingTikTokArtist = vis.tiktokBubbleData.find(tiktokArtist => tiktokArtist.artist_name === spotifyArtist.artist_name);

            if (matchingTikTokArtist) {
                // Create combined data
                let combinedData = {
                    artist_name: spotifyArtist.artist_name,
                    count: spotifyArtist.count,
                    sizeRatio: spotifyArtist.sizeRatio,
                    dataset: 'Combined'
                };

                combinedArtistBubbleData.push(combinedData);

                vis.spotifyBubbleData = vis.spotifyBubbleData.filter(artist => artist.artist_name !== spotifyArtist.artist_name);
                vis.tiktokBubbleData = vis.tiktokBubbleData.filter(artist => artist.artist_name !== spotifyArtist.artist_name);
            }
        });

        vis.allBubbleData = vis.spotifyBubbleData.concat(vis.tiktokBubbleData).concat(combinedArtistBubbleData);
        console.log(vis.allBubbleData)
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
            .force('x', d3.forceX(vis.width / 2).strength(0.03))
            .force('y', d3.forceY(vis.height / 2).strength(0.03))
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
                    return 'lightgrey';
                } else if (d.dataset === 'TikTok') {
                    return 'grey';
                } else {
                    return 'black';
                }
            });

     //   const labels = bubbleGroups.append('text')
      //      .attr('class', 'bubble-label')
       //     .attr('text-anchor', 'middle')
        //    .attr('dy', '0.35em')
         //   .text(d => d.artist_name);

        simulation.on('tick', () => {
            bubbles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

//            labels
//                .attr('x', d => d.x)
 //               .attr('y', d => d.y);
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

        const simulationSpotify = d3.forceSimulation(spotifyData)
            .force('x', d3.forceX(vis.width / 4).strength(0.2))
            .force('y', d3.forceY(vis.height / 2).strength(0.2))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        const simulationTikTok = d3.forceSimulation(tiktokData)
            .force('x', d3.forceX((vis.width / 4) * 3).strength(0.2))
            .force('y', d3.forceY(vis.height / 2).strength(0.2))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        const simulationCombined = d3.forceSimulation(combinedData)
            .force('x', d3.forceX(vis.width / 2).strength(0.2))
            .force('y', d3.forceY(vis.height / 2).strength(0.2))
            .force('collide', d3.forceCollide(d => radiusScale(d.sizeRatio) + 2));

        simulationSpotify.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .filter(d => d.dataset === 'Spotify')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

      //      vis.svg.selectAll('.bubble-label')
      //          .filter(d => d.dataset === 'Spotify')
       //         .attr('x', d => d.x)
        //        .attr('y', d => d.y);
        });

        simulationTikTok.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .filter(d => d.dataset === 'TikTok')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

     //       vis.svg.selectAll('.bubble-label')
      //          .filter(d => d.dataset === 'TikTok')
       //         .attr('x', d => d.x)
        //        .attr('y', d => d.y);
        });

        simulationCombined.on('tick', () => {
            vis.svg.selectAll('.bubble')
                .filter(d => d.dataset === 'Combined')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

     //       vis.svg.selectAll('.bubble-label')
     //           .filter(d => d.dataset === 'Combined')
     //           .attr('x', d => d.x)
      //          .attr('y', d => d.y);
        });
    }

}

