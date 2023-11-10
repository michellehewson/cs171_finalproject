class RadarChart {
    constructor(parentElement, spotifyData) {
        this.parentElement = parentElement;
        this.spotifyData = spotifyData;
        this.initVis();


    }



    initVis() {
        let vis = this;
        const NUM_OF_SIDES = 5;
        const NUM_OF_LEVEL = 4;
        const size = Math.min(window.innerWidth, window.innerHeight, 400);
        const offset = Math.PI;
        const polyangle = (Math.PI * 2) / NUM_OF_SIDES;
        const r = 0.8 * size;
        const r_0 = r / 2;
        const center = {
            x: size / 2,
            y: size / 2
        };

        const tooltip = d3.select(".tooltip");

        const desiredColumns = ['danceability', 'energy', 'speechiness', 'instrumentalness', 'liveness'];

        // Fetch Spotify data and extract relevant columns
        const spotifySubset = vis.spotifyData.slice(0, 1);

        const dataset = [];

// Iterate over each attribute and create the dataset
        desiredColumns.forEach(attribute => {
            const data = spotifySubset.map(entry => ({
                name: attribute,
                value: entry[attribute] // Use the actual attribute value from the data
            }));
            dataset.push(...data);
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

        const ticks = genTicks(NUM_OF_LEVEL);

        // Append SVG and create group element
        const wrapper = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", size)
            .attr("height", size);

        const g = wrapper.append("g");

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
            const attributeValue = dataset[i].value; // Assuming dataset has been correctly constructed
            const theta = i * polyangle;

            points.push(generatePoint({
                length: scale(attributeValue),
                angle: theta
            }));
        });

        const drawPath = (points, parent, strokeColor = "black") => {
            const lineGenerator = d3.line()
                .x(d => d.x)
                .y(d => d.y);

            parent.append("path")
                .attr("d", lineGenerator(points))
                .attr("fill", "none") // Set fill to none
                .attr("stroke", strokeColor); // Set stroke color
        };

        points = [...points, points[0]];
        drawPath(points, g, "black"); // Set stroke color to black

        const generateAndDrawLevels = ( levelsCount, sideCount ) =>
        {

            for ( let level = 1; level <= levelsCount; level++ )
            {
                const hyp = ( level / levelsCount ) * r_0;

                const points = [];
                for ( let vertex = 0; vertex < sideCount; vertex++ )
                {
                    const theta = vertex * polyangle;

                    points.push( generatePoint( { length: hyp, angle: theta } ) );

                }
                const group = g.append( "g" ).attr( "class", "levels" );
                drawPath([...points, points[0]], group, "black"); // Set stroke color to black

            }


        };

        generateAndDrawLevels( NUM_OF_LEVEL, NUM_OF_SIDES );

        const generateAndDrawLines = ( sideCount ) =>
        {

            const group = g.append( "g" ).attr( "class", "grid-lines" );
            for ( let vertex = 1; vertex <= sideCount; vertex++ )
            {
                const theta = vertex * polyangle;
                const point = generatePoint( { length: r_0, angle: theta } );

                drawPath( [ center, point ], group );
            }

        };


        generateAndDrawLevels( NUM_OF_LEVEL, NUM_OF_SIDES );
        generateAndDrawLines( NUM_OF_SIDES );
        const drawCircles = points => {
            const mouseEnter = (event, d) => {
                tooltip.style("opacity", 1);
                const { x, y } = d3.pointer(event);
                tooltip.style("top", `${y - 20}px`);
                tooltip.style("left", `${x + 15}px`);
                tooltip.text(d.value);
            };

            const mouseLeave = () => {
                tooltip.style("opacity", 0);
            };

            g.append("g")
                .attr("class", "indic")
                .selectAll("circle")
                .data(points)
                .enter()
                .append("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 8)
                .on("mouseenter", mouseEnter)
                .on("mouseleave", mouseLeave);
        };

        const drawData = ( dataset, n ) =>
        {
            const points = [];
            dataset.forEach( ( d, i ) =>
            {
                const len = scale( d.value );
                const theta = i * ( 2 * Math.PI / n );

                points.push(
                    {
                        ...generatePoint( { length: len, angle: theta } ),
                        value: d.value
                    } );
            } );

            const group = g.append( "g" ).attr( "class", "shape" );

            drawPath( [ ...points, points[ 0 ] ], group );
            drawCircles( points );
        };

        generateAndDrawLevels( NUM_OF_LEVEL, NUM_OF_SIDES );
        generateAndDrawLines( NUM_OF_SIDES );
        //drawAxis( ticks, NUM_OF_LEVEL );
        drawData( dataset, NUM_OF_SIDES );

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

        const drawLabels = ( dataset, sideCount ) =>
        {
            const groupL = g.append( "g" ).attr( "class", "labels" );
            for ( let vertex = 0; vertex < sideCount; vertex++ )
            {

                const angle = vertex * polyangle;
                const label = dataset[ vertex ].name;
                const point = generatePoint( { length: 0.9 * ( size / 2 ), angle } );

                drawText( label, point, false, groupL );
            }
        };

        generateAndDrawLevels( NUM_OF_LEVEL, NUM_OF_SIDES );
        generateAndDrawLines( NUM_OF_SIDES );
        //drawAxis( ticks, NUM_OF_LEVEL );
        drawData( dataset, NUM_OF_SIDES );
        drawLabels( dataset, NUM_OF_SIDES );

        vis.wrangleData();

    }

    wrangleData() {


    }

    updateVisualization() {
        let vis = this;

    }
}