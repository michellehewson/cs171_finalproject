class BarChart {
    constructor(parentElement, tiktokUserData) {
        this.parentElement = parentElement;
        this.tiktokUserData = tiktokUserData.map(d => ({
            Time: d['Time'],
            Value: parseFloat(d['Value'])
        }))
        this.initVis();
        this.updateVis();
    };

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 60, left: 60 };
        vis.width = 960 - vis.margin.left - vis.margin.right;
        vis.height = 600 - vis.margin.top - vis.margin.bottom;
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);
    }

    animateBars(data) {
        let vis = this;

        vis.svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => vis.x(d.Time))
            .attr("y", vis.height)
            .attr("width", vis.x.bandwidth())
            .attr("height", 0)
            .attr("fill", "steelblue")
            .transition()
            .delay((d, i) => i * 100)
            .attr("y", d => vis.y(d.Value))
            .attr("height", d => vis.height - vis.y(d.Value))
            .duration(1500);
    }

    updateVis() {
        let vis = this;
      //  console.log(vis.tiktokUserData)
        let timeData = vis.tiktokUserData.map(d => d['Time']);
        let valueData = vis.tiktokUserData.map(d => parseFloat(d['Value']));

        vis.x.domain(timeData);
        vis.y.domain([0, d3.max(valueData)]);

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(vis.yAxis);

        vis.animateBars(vis.tiktokUserData);
    }
}
