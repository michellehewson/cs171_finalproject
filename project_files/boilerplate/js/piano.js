// michelle
// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext and https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Migrating_from_webkitAudioContext for playing the sounds
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/tspan for additional text
class Piano {
    constructor(parentElement, spotify_keys, tiktok_keys) {
        this.parentElement = parentElement;
        this.whiteKeys = [0, 2, 4, 5, 7, 9, 11];
        this.blackKeys = [1, 3, 6, 8, 10];
        this.whiteKeysDict = {0:"C", 2:"D", 4:"E", 5:"F", 7:"G", 9:"A", 11:"B"};
        this.blackKeysDict = {1:"C#", 3:"D#", 6:"F#", 8:"G#", 10:"A#"};
        this.spotify_keys = spotify_keys;
        this.tiktok_keys = tiktok_keys;
        this.initVis()
    }
    initVis() {
        let vis = this;

        // necessary variables and function for playing sounds
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let soundFiles = {
            0: 'sounds/C.wav',
            1: 'sounds/C2.wav',
            2: 'sounds/D.wav',
            3: 'sounds/D2.wav',
            4: 'sounds/E.wav',
            5: 'sounds/F.wav',
            6: 'sounds/F2.wav',
            7: 'sounds/G.wav',
            8: 'sounds/G2.wav',
            9: 'sounds/A.wav',
            10: 'sounds/A2.wav',
            11: 'sounds/B.wav',
        };


        function playSound(key) {
            let source = audioContext.createBufferSource();
            let soundFile = soundFiles[key]

            fetch(soundFile)
                .then(response => response.arrayBuffer())
                .then(buffer => audioContext.decodeAudioData(buffer))
                .then(audioBuffer => {
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.start();
                })
        }

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
            .attr("height", 700)
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
            .text('hello')
            .attr("cx", 100)
            .attr("cy", 100)
            .attr("r", 20)
            .style("fill", "green")


        vis.svgPiano.selectAll(".pianoWhiteKey, .pianoBlackKey")
            .attr("transform", "translate(" + vis.translateX + "," + vis.translateY + ")");

        vis.pianoWhiteKeys.on("click", function (d) {
            let key = d3.select(this).attr("key");
            console.log(key)
            playSound(key);
            vis.keyText = vis.updatePianoText(key)
            vis.textContainer = d3.select(".pianoTextInit");
            vis.textContainer.text("");

            vis.textContainer.append("tspan")
                .text(vis.keyText.keyLtrStr)
                .attr("x", 218)
                .attr("dy", "1.2em")
                .style("font-size", "36px");

            vis.textContainer.append("tspan")
                .text(vis.keyText.spotifyPercentageStr)
                .attr("x", 218)
                .attr("dy", "1.2em")
                .style("font-size", "12px");

            vis.textContainer.append("tspan")
                .text(vis.keyText.tiktokPercentageStr)
                .attr("x", 218)
                .attr("dy", "1.2em")
                .style("font-size", "12px");
        });


        vis.pianoBlackKeys.on("click", function (d) {
            let key = d3.select(this).attr("key");
            console.log(key)
            playSound(key);
            vis.keyText = vis.updatePianoText(key)
            vis.textContainer = d3.select(".pianoTextInit");
            vis.textContainer.text("");

            vis.textContainer.append("tspan")
                .text(vis.keyText.keyLtrStr)
                .attr("x", 218)
                .attr("dy", "1.2em")
                .style("font-size", "36px");

            vis.textContainer.append("tspan")
                .text(vis.keyText.spotifyPercentageStr)
                .attr("x", 218)
                .attr("dy", "1.2em")
                .style("font-size", "12px");

            vis.textContainer.append("tspan")
                .text(vis.keyText.tiktokPercentageStr)
                .attr("x", 218)
                .attr("dy", "1.2em")
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
        console.log(vis.tiktok_keys)
        let spotifyPercentage = vis.spotify_keys[key].percentage;
        let tiktokPercentage = vis.tiktok_keys[key].percentage;

        if (vis.whiteKeys.includes(parseInt(key))) {
            vis.keyLtr = vis.whiteKeysDict[key];
            return {
                tiktokPercentageStr: tiktokPercentage + '% of top songs on TikTok',
                spotifyPercentageStr: spotifyPercentage + '% of top songs on Spotify',
                keyLtrStr: vis.keyLtr
            };
        } else if (vis.blackKeys.includes(parseInt(key))) {
            vis.keyLtr = vis.blackKeysDict[key] || '';
            console.log(vis.keyLtr)
            return {
                tiktokPercentageStr: tiktokPercentage + '% of top songs on TikTok',
                spotifyPercentageStr: spotifyPercentage + '% of top songs on Spotify',
                keyLtrStr: vis.keyLtr
            };
    }

}}