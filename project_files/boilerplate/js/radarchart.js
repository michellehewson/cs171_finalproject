class RadarChart {
    constructor(parentElement, spotifyData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;

        this.spotifySubset = this.spotifyData.slice(0, 10);
        this.desiredColumns = ['danceability', 'energy', 'speechiness', 'acousticness', 'liveness'];

        this.dataset = [];
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10); // Move colorScale here
        this.spotifySubset.sort((a, b) => b.track_pop - a.track_pop);


        this.spotifySubset.forEach(row => {
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
        const size = 800;
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
        vis.spotifySubset.forEach(row => {
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
                    .attr("fill", "darkgrey")
                    .style("font-size", "12px")
                    .style("font-family", "sans-serif");
            } else {
                group.append("text")
                    .attr("x", point.x)
                    .attr("y", point.y)
                    .html(text)
                    .style("text-anchor", "middle")
                    .attr("fill", "darkgrey")
                    .style("font-size", "12px")
                    .style("font-family", "sans-serif");
            }
        }

        // Initialize points array with the first song data
        vis.spotifySubset.forEach((row, i) => {
            const points = [];
            vis.desiredColumns.forEach((attribute, j) => {
                const attributeValue = row[attribute];
                const theta = j * polyangle;
                const len = vis.scale(attributeValue);
                points.push(vis.generatePoint({ length: len, angle: theta }));
            });

            // Draw the chart with the points
            const pathGroup = vis.g.append("g").attr("class", "shape");
            const color = vis.colorScale(dataset[i].track);
            vis.drawPath([...points, points[0]], pathGroup, "black", color, 0.5);


        });

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
        const initialTrackName = vis.spotifySubset[0].track;
        const trackNamesDiv = d3.select("#track-names");
        trackNamesDiv.append("p")
            .text(initialTrackName)
            .attr("class", "track-name");

        vis.initializeNoUiSlider();
    }

    initializeNoUiSlider() {
        let vis = this;
        let slider = document.getElementById("song-slider");
        let startLabel = document.getElementById("start-label");
        let endLabel = document.getElementById("end-label");
        let minValue = 0; // Adjust as needed
        let maxValue = Math.min(10, vis.spotifyData.length - 1); // Set the maximum value to 5 or the length of the data, whichever is smaller

        noUiSlider.create(slider, {
            start: [0, 0], // Set initial range to show only the first song
            connect: true,
            step: 1,
            range: {
                'min': minValue,
                'max': maxValue
            },
            behaviour: 'drag',
        });

        // Set initial labels
        startLabel.textContent = 0;
        endLabel.textContent = 0;

        // Update the subset and visualization for the initial values
        vis.spotifySubset = vis.spotifyData.slice(0, 1);
        vis.updateVisualization();

        slider.noUiSlider.on('slide', function (values) {
            const [start, end] = values.map(value => parseInt(value, 10));
            startLabel.textContent = start;
            endLabel.textContent = end;

            // Clear the existing content of the track-names div
            d3.select("#track-names").html("");

            // Update the subset of Spotify data based on the slider values
            vis.spotifySubset = vis.spotifyData.slice(start, end + 1);
            const trackNamesDiv = d3.select("#track-names");
            vis.spotifySubset.forEach((row) => {
                trackNamesDiv.append("p")
                    .text(row.track_name)
                    .attr("class", "track-name");
            })

            // Update the visualization
            vis.updateVisualization();
        });
    }

    updateVisualization() {
        let vis = this;
        // Clear the existing chart
        vis.g.selectAll("*").remove();

        // Redraw the chart with the updated subset of data
        vis.generateAndDrawLines(vis.NUM_OF_SIDES);
        vis.generateAndDrawLevels(vis.NUM_OF_LEVEL, vis.NUM_OF_SIDES);

        // Update the visualization with the new subset of data
        vis.spotifySubset.forEach((row, i) => {
            const points = [];
            vis.desiredColumns.forEach((attribute, j) => {
                const attributeValue = row[attribute];
                const theta = j * (2 * Math.PI / vis.NUM_OF_SIDES);
                const len = vis.scale(attributeValue);
                const point = vis.generatePoint({ length: len, angle: theta });

                // Draw a circle at each point
                const circleGroup = vis.g.append("g").attr("class", "circle-group");
                circleGroup.append("circle")
                    .attr("cx", point.x)
                    .attr("cy", point.y)
                    .attr("r", 4)
                    .attr("fill", vis.colorScale(row.track_name))
                    .on("mouseenter", () => {
                        // Add any tooltip or interaction logic here
                        console.log(`Mouse entered: ${row.track_name}`);
                    })
                    .on("mouseleave", () => {
                        // Add any tooltip or interaction logic here
                        console.log(`Mouse left: ${row.track_name}`);
                    });

                points.push(point);
            });

            // Draw the radar shape
            const pathGroup = vis.g.append("g").attr("class", "shape");
            const color = vis.colorScale(row.track_name);
            vis.drawPath([...points, points[0]], pathGroup, "black", color, 0.5);
        });

        // Draw labels
        vis.drawLabels(vis.spotifySubset, vis.NUM_OF_SIDES);
    }

}