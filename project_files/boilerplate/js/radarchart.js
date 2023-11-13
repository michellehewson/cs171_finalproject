class RadarChart {
    constructor(parentElement, spotifyData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.initVis();


    }

    initVis() {
        let vis = this;
        vis.NUM_OF_SIDES = 5;
        vis.NUM_OF_LEVEL = 4;
        const size = Math.min(window.innerWidth, window.innerHeight, 400);
        const offset = Math.PI;
        const polyangle = (Math.PI * 2) / vis.NUM_OF_SIDES;
        const r = 0.8 * size;
        const r_0 = r / 2;
        const center = {
            x: size / 2,
            y: size / 2
        };

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // You can choose a different color scheme


    //    const tooltip = d3.select(".tooltip");

        const desiredColumns = ['danceability', 'energy', 'speechiness', 'acousticness', 'liveness'];

        // Fetch Spotify data and extract relevant columns
        vis.spotifySubset = vis.spotifyData.slice(0, 1);

        const dataset = [];

// Iterate over each attribute and create the dataset
        vis.spotifySubset.forEach(row => {
            const data = {
                track: row.track_name,
                values: desiredColumns.map(attribute => ({
                    name: attribute,
                    value: row[attribute]
                }))
            };
            dataset.push(data);
        });

        // Scale for mapping data to chart size
        const scale = d3.scaleLinear()
            .domain([0, 1]) // Assuming your data is in the range of 0 to 1
            .range([0, r_0]);

        // Generate ticks for chart levels
        const genTicks = levels => {
            const ticks = [];
            const step = 100 / levels;
            for (let i = 0; i <= levels; i++) {
                const num = step * i;
                if (Number.isInteger(step)) {
                    ticks.push(num);
                } else {
                    ticks.push(num.toFixed(2));
                }
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

        const generatePoint = ({ length, angle }) => {
            const point = {
                x: center.x + (length * Math.sin(offset - angle)),
                y: center.y + (length * Math.cos(offset - angle))
            };
            return point;
        };

        let points = [];
        const length = 100;

        // Iterate over each attribute in the dataset and create points
        desiredColumns.forEach((attribute, i) => {
            if (dataset[0] && dataset[0].values && dataset[0].values[i]) {
                const attributeValue = dataset[0].values[i].value;
                const theta = i * polyangle;
                const len = scale(attributeValue);

                points.push(generatePoint({ length: len, angle: theta }));
            } else {
                console.error('Error accessing dataset or values:', dataset);
            }
        });

        const drawPath = (points, parent, strokeColor = "black", fillColor = "none", fillOpacity = 1) => {
            const lineGenerator = d3.line()
                .x(d => d.x)
                .y(d => d.y);

            parent.append("path")
                .attr("d", lineGenerator(points))
                .attr("fill", fillColor)
                .attr("fill-opacity", fillOpacity)
                .attr("stroke", strokeColor);
        };


         vis.generateAndDrawLevels = (levelsCount, sideCount) => {
            const levelsGroup = vis.g.append("g").attr("class", "levels-group");

            for (let level = 1; level <= levelsCount; level++) {
                const hyp = (level / levelsCount) * r_0;

                const points = [];
                for (let vertex = 0; vertex < sideCount; vertex++) {
                    const theta = vertex * polyangle;

                    points.push(generatePoint({ length: hyp, angle: theta }));
                }
                drawPath([...points, points[0]], levelsGroup, "black"); // Set stroke color to black
            }
        };

         vis.generateAndDrawLines = (sideCount) => {
            const group = vis.g.append("g").attr("class", "grid-lines");
            for (let vertex = 1; vertex <= sideCount; vertex++) {
                const theta = vertex * polyangle;
                const point = generatePoint({ length: r_0, angle: theta });

                drawPath([center, point], group);
            }
        };

        vis.generateAndDrawLines(vis.NUM_OF_SIDES);
        vis.generateAndDrawLevels(vis.NUM_OF_LEVEL, vis.NUM_OF_SIDES);
        points = [...points, points[0]];
        drawPath(points, vis.g, "black", "lightblue", 0.3);


        const drawCircles = (points) => {
          //  const mouseEnter = (event, d) => {
            //    tooltip.style("opacity", 1);
            //    const { x, y } = d3.pointer(event);
           //     tooltip.style("top", `${y - 20}px`);
           //     tooltip.style("left", `${x + 15}px`);
           //     tooltip.html(`<strong>Track:</strong> ${dataset[0].track}<br><strong>Data Point:</strong> ${d.value}`);
         //   };

          //  const mouseLeave = () => {
          //      tooltip.style("opacity", 0);
         //   };

            const circlesGroup = vis.g.append("g").attr("class", "circles-group");

            circlesGroup
                .selectAll("circle")
                .data(points)
                .enter()
                .append("circle")
                .attr("cx", d => {
                    if (!isNaN(d.x)) return d.x; // Check if x is a valid number
                    else console.error('Invalid x-coordinate:', d.x);
                })
                .attr("cy", d => {
                    if (!isNaN(d.y)) return d.y; // Check if y is a valid number
                    else console.error('Invalid y-coordinate:', d.y);
                })
                .attr("r", 4)
               // .on("mouseenter", (event, d) => mouseEnter(event, d))
                //.on("mouseleave", mouseLeave);
        };

         vis.drawData = (dataset, n) => {
             if (!dataset || dataset.length === 0) {
                 console.error('Dataset is empty or undefined');
                 return;
             }
             const pathsGroup = vis.g.append("g").attr("class", "shape-group");
             const circlesGroup = vis.g.append("g").attr("class", "circles-group");
             dataset.forEach((d, i) => {
                 const trackGroup = vis.g.append("g").attr("class", "track-group"); // Create a group for each track

                 let points = []; // Move points array inside the loop

                 desiredColumns.forEach((column, j) => {
                     const len = scale(d[column]); // Access data directly using the column name
                     const theta = j * (2 * Math.PI / n);

                     const point = generatePoint({ length: len, angle: theta });

                     // Log values for debugging
                     console.log(`Track: ${d.track}, Column: ${column}, Length: ${len}, Theta: ${theta}, Point:`, point);

                     points.push(point);
                 });

                 // Append path to the paths group
                 const pathGroup = pathsGroup.append("g").attr("class", "shape");
                 drawPath([...points, points[0]], pathGroup, "black", colorScale(d.track), 0.5);

                 // Append circles to the circles group
                 const circleGroup = circlesGroup.append("g").attr("class", "indic");
                 drawCircles(points, circleGroup, d.track);

                 // Append circles to the track group
                 const circleGroupTrack = trackGroup.append("g").attr("class", "indic");
                 drawCircles(points, circleGroupTrack, d.track);
             });
        };

        const drawText = ( text, point, isAxis, group ) =>
        {
            if ( isAxis )
            {
                const xSpacing = text.toString().includes( "." ) ? 30 : 22;
                group.append( "text" )
                    .attr( "x", point.x - xSpacing )
                    .attr( "y", point.y + 5 )
                    .html( text )
                    .style( "text-anchor", "middle" )
                    .attr( "fill", "darkgrey" )
                    .style( "font-size", "12px" )
                    .style( "font-family", "sans-serif" );
            }
            else
            {
                group.append( "text" )
                    .attr( "x", point.x )
                    .attr( "y", point.y )
                    .html( text )
                    .style( "text-anchor", "middle" )
                    .attr( "fill", "darkgrey" )
                    .style( "font-size", "12px" )
                    .style( "font-family", "sans-serif" );
            }

        };

        vis.drawLabels = (dataset, sideCount) => {
            const groupL = vis.g.append("g").attr("class", "labels");
            for (let vertex = 0; vertex < sideCount; vertex++) {
                const angle = vertex * polyangle;
                const label = desiredColumns[vertex]; // Use desiredColumns to access column names
                const point = generatePoint({ length: 0.9 * (size / 2), angle });

                drawText(label, point, false, groupL);
            }
        };

        vis.drawData(dataset, vis.NUM_OF_SIDES );
        vis.drawLabels(dataset, vis.NUM_OF_SIDES );

        vis.initializeNoUiSlider();

        // Draw the initial visualization
        vis.updateVisualization();
        console.log('Dataset:', dataset);
        console.log('Attribute values:', dataset[0].values);
        console.log('Points:', points);

    }

    initializeNoUiSlider() {
        let vis = this;
        let slider = document.getElementById("song-slider");
        let startLabel = document.getElementById("start-label");
        let endLabel = document.getElementById("end-label");
        let minValue = 0; // Adjust as needed
        let maxValue = Math.min(5, vis.spotifyData.length - 1); // Set the maximum value to 5 or the length of the data, whichever is smaller

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

            // Update the subset of Spotify data based on the slider values
            vis.spotifySubset = vis.spotifyData.slice(start, end + 1);

            console.log(vis.spotifySubset); // Log the subset data

            // Update the visualization
            vis.updateVisualization();
        });
    }

    updateVisualization() {
        console.log("Updating visualization");
        let vis = this;

        // Clear the existing chart
        vis.g.selectAll("*").remove();

        vis.generateAndDrawLines(vis.NUM_OF_SIDES);
        vis.generateAndDrawLevels(vis.NUM_OF_LEVEL, vis.NUM_OF_SIDES);
        // Redraw the chart with the updated subset of data
        vis.drawData(vis.spotifySubset, vis.NUM_OF_SIDES); // Use vis.spotifySubset instead of vis.dataset
        vis.drawLabels(vis.spotifySubset, vis.NUM_OF_SIDES); // Use vis.spotifySubset instead of vis.dataset
    }

}