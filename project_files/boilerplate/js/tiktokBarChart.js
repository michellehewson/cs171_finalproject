//michelle
// simple bar chart that animates when a user loads the page
// tooltip is inspired from week 5 homework
class BarChart {
    constructor(parentElement) {
        this.parentElement = parentElement;
        this.initVis();
        this.loadData();

    };

    loadData() {
        let vis = this;

        d3.csv("data/tiktok_user_stats.csv").then(csv => {
            console.log('untouched')
            console.log(csv)
            vis.tiktokUserData = csv.map(d => ({
                Time: d['Time'],
                Value: parseFloat(d['Value'])
            }));
        console.log(vis.tiktokUserData)
            vis.updateVis();
        });
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 70, right: 10, bottom: 60, left: 60 };
        vis.width = 900 - vis.margin.left - vis.margin.right;
        vis.height = 600;
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append("text")
            .attr("x", vis.width / 2 - 40)
            .attr("y", (-vis.margin.top * 0.7) + 20)
            .attr("text-anchor", "middle")
            .text("Tracking the Surge of TikTok Downloads")
            .style("font-weight", "bold")
            .style("font-size", "34px");
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

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
            .attr("fill", '#ff0050')
            .transition()
            .delay((d, i) => i * 100) // this makes the cool animation that makes the bars appear intermittently
            .attr("y", d => vis.y(d.Value))
            .attr("height", d => vis.height - vis.y(d.Value))
            .duration(1500)


        vis.svg.selectAll(".bar")
            .on("mouseover", function (event, d) {
                vis.tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                vis.tooltip.html(`${d.Value} million downloads`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    updateVis() {
        let vis = this;
      //console.log(vis.tiktokUserData)
        let timeData = vis.tiktokUserData.map(d => d['Time']);
        let valueData = vis.tiktokUserData.map(d => parseFloat(d['Value']));

        vis.x.domain(timeData);
        vis.y.domain([0, d3.max(valueData)]);

        //axes
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

        //yaxis labels
        vis.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - vis.margin.left)
            .attr("x", 0 - (vis.height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("fill", "black")
            .text("Number of Downloads (millions)");

        vis.animateBars(vis.tiktokUserData);
    }

}
