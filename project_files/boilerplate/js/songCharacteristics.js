// michelle
class SongCharacteristics {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.width = 1500;
        vis.height = 550;
        vis.imageWidth = 250;
        vis.imageHeight = 160;
        vis.circleRadius = 110;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .style("display", "block")
            .style("margin", "auto");

        vis.svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "white");

        vis.images = [
            "img/acousticness.png",
            "img/danceability.png",
            "img/energy.png",
            "img/liveness.png",
            "img/speechiness.png",
            "img/tempo.png"
        ];

        vis.labels = [
            "Acousticness",
            "Danceability",
            "Energy",
            "Liveness",
            "Speechiness",
            "Tempo"
        ];

        vis.tooltiptext = [

            "Acousticness describes whether the song uses primarily acoustic instruments or electronic\n and electric instruments.A value of 1.0 indicates that a song is purely acoustic.",
            "Danceability describes how suitable a track is for dancing based on a combination of musical\n elements including tempo, rhythm stability, beat strength, and overall regularity.\nA value of 0.0 is least danceable and 1.0 is most danceable.",
            "Energy represents a measure of intensity and activity.\nTypically, energetic tracks feel fast, loud, and noisy.\nFor example, death metal has high energy, while a Bach prelude has lower energy.",
            "Liveness is the measure of a presence of an audience in the recording.\nHigher liveness values represent an increased probability that the track was performed live.\nA value above 0.8 provides strong likelihood that the track is live.",
            "Speechiness detects the presence of spoken words in a track.\nValues above 0.66 describe tracks that are probably made entirely of spoken words.\nValues between 0.33 and 0.66 describe tracks that may contain both music and speech, like rap music.",
            "Tempo is the beats per minute (BPM) of a track, which represents the speed or pace of a given piece."
        ];

        vis.totalWidth = vis.imageWidth * vis.images.length;
        vis.startX = (vis.width - vis.totalWidth) / 2 - 70;
        vis.topMargin = 0;

        vis.images.forEach((image, index) => {
            let circle = vis.svg.append("circle")
                .attr("cx", vis.startX + vis.imageWidth / 2 + index * vis.imageWidth + 60)
                .attr("cy", (vis.height / 2) - 100)
                .attr("r", vis.circleRadius)
                .attr("fill", "none")
                .attr("stroke", "#ff0050")
                .attr("stroke-width", 5);

            let tooltipText = vis.tooltiptext[index].split('\n');

            vis.svg.append("image")
                .attr("xlink:href", image)
                .attr("x", vis.startX + index * vis.imageWidth + 60)
                .attr("y", ((vis.height - vis.imageHeight) / 2) - 100)
                .attr("width", vis.imageWidth)
                .attr("height", vis.imageHeight)
                .on("mouseover", function () {
                    let tooltip = vis.svg.append("text")
                        .attr("id", "tooltip")
                        .attr("x", vis.width / 2)
                        .attr("y", (vis.height + vis.imageHeight) / 2 + 60)
                        .attr("text-anchor", "middle")
                        .style("font-size", "24px");

                    tooltipText.forEach((line, i) => {
                        tooltip.append('tspan')
                            .attr('x', vis.width / 2)
                            .attr('dy', i === 0 ? 0 : '1.2em')
                            .text(line);
                    });
                    circle.attr("stroke", "#00f2ea");
                })
                .on("mouseout", function () {
                    vis.svg.select("#tooltip").remove();
                    circle.attr("stroke", "#ff0050");
                });

            vis.svg.append("text")
                .attr("x", vis.startX + index * vis.imageWidth + 60 + vis.imageWidth / 2)
                .attr("y", (vis.height + vis.imageHeight) / 2 -20)
                .attr("text-anchor", "middle")
                .style("font-weight", "bold")
                .text(vis.labels[index]);
        });

}}
