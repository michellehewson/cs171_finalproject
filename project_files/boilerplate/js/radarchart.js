class RadarChart {
    constructor(parentElement, chartData, sortingCriteria) {
        this.parentElement = parentElement;
        this.chartData = chartData;
        this.sortingCriteria = sortingCriteria;
        this.chartData.sort((a, b) => {
            if (this.sortingCriteria === 'tiktok') {
                return b.track_pop - a.track_pop;
            } else if (this.sortingCriteria === 'spotify') {
                if (a.peak_rank !== b.peak_rank) {
                    return a.peak_rank - b.peak_rank;
                } else {
                    return b.weeks_on_chart - a.weeks_on_chart;
                }
            }
        });

        this.chartSubset = this.chartData.slice(0, 9);
        this.desiredColumns = ['danceability', 'energy', 'speechiness', 'acousticness', 'liveness'];

        this.dataset = [];

        this.spotifyColors = [
            "#00f2ea",
            "#00f2ea",
            "#18ccc6",
            "#0e807c",
            "#05807a",
            "#1c7c7b"
        ];

        this.tiktokColors = [
            "#ff0050",
            "#ff5e91",
            "#bd315d",
            "#6b0a29",
            "#662b3e",
            "#edabc0"
        ]

// Create a custom color scale with the defined colors
        if (this.sortingCriteria === 'spotify') {
            this.colorScale = d3.scaleOrdinal().range(this.spotifyColors);
        } else {
            this.colorScale = d3.scaleOrdinal().range(this.tiktokColors);
        }


        this.chartSubset.forEach(row => {
            const data = {
                track: row.track_name,
                values: this.desiredColumns.map(attribute => ({
                    name: attribute,
                    value: row[attribute]
                }))
            };
            this.dataset.push(data);
        });

        this.drawPath = (points, parent, strokeColor = "black", fillColor = "none", fillOpacity = 1) => {
            const lineGenerator = d3.line()
                .x(d => d.x)
                .y(d => d.y);

            parent.append("path")
                .attr("d", lineGenerator(points))
                .attr("fill", fillColor)
                .attr("fill-opacity", fillOpacity)
                .attr("stroke", strokeColor);
        };

        this.initVis();

    }

    initVis() {
        let vis = this;
        vis.NUM_OF_SIDES = 5;
        vis.NUM_OF_LEVEL = 4;
        const size = 400;
        const offset = Math.PI;
        const polyangle = (Math.PI * 2) / vis.NUM_OF_SIDES;
        const r = 0.8 * size;
        vis.r_0 = r / 2;
        const center = {
            x: size / 2,
            y: size / 2
        };
        vis.scale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.r_0]);

        const dataset = [];

        // Iterate over each attribute and create the dataset
        vis.chartSubset.forEach(row => {
            const data = {
                track: row.track_name,
                values: vis.desiredColumns.map(attribute => ({
                    name: attribute,
                    value: row[attribute]
                }))
            };
            dataset.push(data);
        });

        // Generate ticks for chart levels
        const genTicks = levels => {
            const ticks = [];
            const step = 100 / levels;
            for (let i = 0; i <= levels; i++) {
                const num = step * i;
                ticks.push(Number.isInteger(step) ? num : num.toFixed(2));
            }
            return ticks;
        };

        const ticks = genTicks(vis.NUM_OF_LEVEL);

        // Append SVG and create group element
        const wrapper = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", size)
            .attr("height", size);

        vis.g = wrapper.append("g");

         vis.generatePoint = ({ length, angle }) => {
            return {
                x: center.x + (length * Math.sin(offset - angle)),
                y: center.y + (length * Math.cos(offset - angle))
            };
        };
        vis.drawText = function(text, point, isAxis, group) {
            if (isAxis) {
                const xSpacing = text.toString().includes(".") ? 30 : 22;
                group.append("text")
                    .attr("x", point.x - xSpacing)
                    .attr("y", point.y + 5)
                    .html(text)
                    .style("text-anchor", "middle")
                    .style("font-size", "12px")
            } else {
                group.append("text")
                    .attr("x", point.x)
                    .attr("y", point.y)
                    .html(text)
                    .style("text-anchor", "middle")
                    .style("font-size", "12px")
            }
        }

        // Initialize points array with the first song data


        vis.drawLabels = (dataset, sideCount) => {
            const groupL = vis.g.append("g").attr("class", "labels");
            for (let vertex = 0; vertex < sideCount; vertex++) {
                const angle = vertex * polyangle;
                const label = vis.desiredColumns[vertex];
                const point = vis.generatePoint({ length: 0.9 * (size / 2), angle });
                vis.drawText(label, point, false, groupL);

            }
        };


        vis.generateAndDrawLines = (sideCount) => {
            const group = vis.g.append("g").attr("class", "grid-lines");
            for (let vertex = 1; vertex <= sideCount; vertex++) {
                const theta = vertex * polyangle;
                const point = vis.generatePoint({ length: vis.r_0, angle: theta });
                vis.drawPath([center, point], group);
            }
        };

        vis.generateAndDrawLevels = (levelsCount, sideCount) => {
            const levelsGroup = vis.g.append("g").attr("class", "levels-group");
            for (let level = 1; level <= levelsCount; level++) {
                const hyp = (level / levelsCount) * vis.r_0;
                const points = [];
                for (let vertex = 0; vertex < sideCount; vertex++) {
                    const theta = vertex * polyangle;
                    points.push(vis.generatePoint({ length: hyp, angle: theta }));
                }
                vis.drawPath([...points, points[0]], levelsGroup, "black");
            }
        };

        vis.generateAndDrawLines(vis.NUM_OF_SIDES);
        vis.generateAndDrawLevels(vis.NUM_OF_LEVEL, vis.NUM_OF_SIDES);
        vis.drawLabels(dataset, vis.NUM_OF_SIDES);
        const initialTrackName = vis.chartSubset[0].track;
        let trackNamesDiv = d3.select("#" + vis.sortingCriteria + "-track-names");
        trackNamesDiv.append("p")
            .text(initialTrackName)
            .attr("class", "track-name");

        vis.initializeNoUiSlider();
    }

    initializeNoUiSlider() {
        let vis = this;
        let slider, startLabel, endLabel;

        if (this.sortingCriteria === 'spotify') {
            slider = document.getElementById("spotify-slider");
            startLabel = document.getElementById("start-label-s");
            endLabel = document.getElementById("end-label-s");
        } else {
            slider = document.getElementById("tiktok-slider");
            startLabel = document.getElementById("start-label-t");
            endLabel = document.getElementById("end-label-t");
            slider.classList.add('tiktok-slider');

        }

        startLabel.textContent = 0;
        endLabel.textContent = 1;

        let minValue = 0;
        let maxValue = Math.min(9, vis.chartData.length - 1);


        noUiSlider.create(slider, {
            start: [0, 0],
            connect: true,
            step: 1,
            range: {
                'min': minValue,
                'max': maxValue
            },
            behaviour: 'drag',
        });

        slider.noUiSlider.on('slide', function (values) {
            const [start, end] = values.map(value => parseInt(value, 10));

            startLabel.textContent = start + 1;
            endLabel.textContent = end + 1;

            d3.select("#" + vis.sortingCriteria + "-track-names").html("");
            vis.chartSubset = vis.chartData.slice(start, end + 1);
            const trackNamesDiv = d3.select("#" + vis.sortingCriteria + "-track-names");
            trackNamesDiv.style("text-align", "center");
            vis.chartSubset.forEach((row) => {
                trackNamesDiv.append("h5")
                    .text(row.track_name)

                    .attr("class", "track-name");
            })

            vis.updateVisualization();
        });

    }

    updateVisualization() {
        let vis = this;
        // Clear the existing chart
        vis.g.selectAll("*").remove();

        vis.generateAndDrawLines(vis.NUM_OF_SIDES);
        vis.generateAndDrawLevels(vis.NUM_OF_LEVEL, vis.NUM_OF_SIDES);
        if (vis.chartSubset.length > 0) {

            vis.chartSubset.forEach((row, i) => {
                const points = [];
                vis.desiredColumns.forEach((attribute, j) => {
                    const attributeValue = row[attribute];
                    const theta = j * (2 * Math.PI / vis.NUM_OF_SIDES);
                    const len = vis.scale(attributeValue);
                    const point = vis.generatePoint({length: len, angle: theta});
                    const circleGroup = vis.g.append("g").attr("class", "circle-group");
                    circleGroup.append("circle")
                        .attr("cx", point.x)
                        .attr("cy", point.y)
                        .attr("r", 4)
                        .attr("fill", vis.colorScale(row.track_name))

                    points.push(point);
                });
                const pathGroup = vis.g.append("g").attr("class", "shape");
                const color = vis.colorScale(row.track_name);
                vis.drawPath([...points, points[0]], pathGroup, "black", color, 0.3);
            });

            vis.drawLabels(vis.chartSubset, vis.NUM_OF_SIDES);
        }
    }
}