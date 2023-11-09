// michelle
class Piano {
    constructor(parentElement, spotify_keys, tiktok_keys) {
        this.parentElement = parentElement;
        this.whiteKeys = [1, 3, 5, 6, 8, 10, 12];
        this.blackKeys = [2, 4, 7, 9, 11];
        this.spotify_keys = spotify_keys;
        this.tikok_keys = tiktok_keys;
        this.initVis()
    }
    initVis() {
        let vis = this;
        vis.translateX = 120;
        vis.translateY = 260;

        vis.pianoMargin = { top: 40, right: 10, bottom: 60, left: 60 };
        vis.pianoWidth = 960 - vis.pianoMargin.left - vis.pianoMargin.right;
        vis.pianoHeight = 400 - vis.pianoMargin.top - vis.pianoMargin.bottom;
        vis.keyWidth = (vis.pianoWidth / vis.whiteKeys.length) - 27
        vis.blackKeyWidth = 60;
        vis.blackKeyHeight = 200

        vis.svgPiano = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", 1000)
            .attr("height", 900)
            .append("g")
            .attr("transform", "translate(" + vis.pianoMargin.left + "," + vis.pianoMargin.top + ")");

        vis.svgPiano.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 1000)
            .attr("height", 600)
            .style("fill", "#4d4d4d");

        vis.svgPiano.append("rect")
            .attr("x", 210)
            .attr("y", 20)
            .attr("width", 500)
            .attr("height", 200)
            .style("fill", "#0099ff")
            .style("stroke", '#000099')
            .style("stroke-width", 2);

        vis.svgPiano.append("text")
            .attr("class", "pianoTextInit")
            .attr("x", 240)
            .attr("y", 140)
            .text("PRESS A KEY")
            .style("font-size", "40px")
            .style("fill", "#000099");

        vis.pianoWhiteKeys = vis.svgPiano.selectAll(".pianoWhiteKey")
            .data(vis.whiteKeys)
            .enter()
            .append("rect")
            .attr("class", "pianoWhiteKey pianoKey")
            .attr("key", function(d) { return d; })
            .attr("x", function (d, i) {
                return i * vis.keyWidth;
            })
            .attr("y", 0)
            .attr("width", vis.keyWidth)
            .attr("height", vis.pianoHeight)
            .style("stroke", 'black')
            .style("stroke-width", 2);

        vis.pianoBlackKeys = vis.svgPiano.selectAll(".pianoBlackKey")
            .data(vis.blackKeys)
            .enter()
            .append("rect")
            .attr("class", "pianoBlackKey pianoKey")
            .attr("key", function(d) { return d; })
            .attr("x", function (d, i) {
                if (i > 1) {
                    return i * vis.keyWidth + 170;
                } else {
                    return i * vis.keyWidth + 70;
                }
            })
            .attr("y", 0)
            .attr("width", vis.blackKeyWidth)
            .attr("height", vis.blackKeyHeight)
            .style("stroke", 'black')
            .style("stroke-width", 2);

        vis.distBtn = vis.svgPiano.append("circle")
            .attr("class", "distributionBtn")
            .attr("cx", 100)
            .attr("cy", 100)
            .attr("r", 20)
            .style("fill", "green")


        vis.svgPiano.selectAll(".pianoWhiteKey, .pianoBlackKey")
            .attr("transform", "translate(" + vis.translateX + "," + vis.translateY + ")");

        vis.pianoWhiteKeys.on("click", function (d) {
            let key = d3.select(this).attr("key");
            d3.select(".pianoTextInit")
                .text(vis.updatePianoText(key))
                .style("font-size", "12px");

        });

        vis.pianoBlackKeys.on("click", function (d) {
            let key = d3.select(this).attr("key");
            d3.select(".pianoTextInit")
                .text(vis.updatePianoText(key))
                .style("font-size", "12px");
        });


        vis.distBtn.on("click", function () {
            d3.select(".pianoTextInit")
                .text("need to add histogram")
                .style("font-size", "12px");
        });


    }

    updatePianoText(key) {
        let vis = this;
        let spotifyPercentage = vis.spotify_keys[key].percentage;
        //let tiktokPercentage = vis.tiktok_keys[key].percentage;
        //console.log(vis.tiktok_keys[key].percentage)
        return (spotifyPercentage + '% of top songs on Spotify are in key ' + key)
    }
    }