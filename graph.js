class SimulationGraph {
  constructor(id, numTicks, numParticles, height, width) {
    // append the svg object to the body of the page
    var svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    // Add axes
    this.x = d3.scaleLinear().domain([0, numTicks]).range([0, width]);
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(this.x));
    this.y = d3.scaleLinear().domain([0, numParticles]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(this.y));

    // Add the areas for each compartment
    for (const stateLabel in stateColorMap) {
      svg
        .append("path")
        .attr("fill", stateColorMap[stateLabel])
        .attr("id", stateLabel);
    }

    this.logNum = 0;
    this.infectedCounts = [];
    this.deadCounts = [];
    this.asymptomaticCounts = [];
    this.latentCounts = [];
    this.susceptibleCounts = [];
    this.recoveredCounts = [];
    this.times = [];
    this.logCounts = [];
    this.numParticles = numParticles;
  }


  update(stats, time) {
      this.susceptibleCounts.push(stats["susceptible"]);
      this.infectedCounts.push(stats["infected"]);
      this.latentCounts.push(stats["latent"]);
      this.asymptomaticCounts.push(stats["asymptomatic"]);
      this.recoveredCounts.push(stats["recovered"]);
      this.deadCounts.push(stats["dead"]);
      this.times.push(time);
      this.logCounts.push(this.logNum);
      this.logNum += 1;
      this.plot()
      
  }

  plot() {
      // plot realtime graph
      d3.select("#infected")
          .datum(this.logCounts)
          .attr("d", d3.area()
              .x(function(d) { return this.x(this.times[d]) }.bind(this))
              .y0(this.y(0))
              .y1(function(d) { return this.y(this.infectedCounts[d]) }.bind(this))
              )

      d3.select("#asymptomatic")
          .datum(this.logCounts)
          .attr("d", d3.area()
              .x(function(d) { return this.x(this.times[d]) }.bind(this))
              .y0(function(d) { return this.y(this.infectedCounts[d] ) }.bind(this))
              .y1(function(d) { return this.y(this.infectedCounts[d] + this.asymptomaticCounts[d]) }.bind(this))
              )
      d3.select("#latent")
          .datum(this.logCounts)
          .attr("d", d3.area()
              .x(function(d) { return this.x(this.times[d]) }.bind(this))
              .y0(function(d) { return this.y(this.infectedCounts[d] + this.asymptomaticCounts[d] ) }.bind(this))
              .y1(function(d) { return this.y(this.infectedCounts[d] + this.asymptomaticCounts[d] + this.latentCounts[d]) }.bind(this))
              )
      d3.select("#susceptible")
          .datum(this.logCounts)
          .attr("d", d3.area()
              .x(function(d) { return this.x(this.times[d]) }.bind(this))
              .y0(function(d) { return this.y(this.infectedCounts[d] + this.asymptomaticCounts[d] + this.latentCounts[d]) }.bind(this))
              .y1(function(d) { return this.y(this.infectedCounts[d] + this.asymptomaticCounts[d] + this.latentCounts[d]+ this.susceptibleCounts[d]) }.bind(this))
              )

      d3.select("#recovered")
          .datum(this.logCounts)
          .attr("d", d3.area()
              .x(function(d) { return this.x(this.times[d]) }.bind(this))
              .y0(function(d) { return this.y(this.numParticles - this.recoveredCounts[d]- this.deadCounts[d])  }.bind(this))
              .y1(function(d) { return this.y(this.numParticles - this.deadCounts[d]) }.bind(this))
              )
      d3.select("#dead")
          .datum(this.logCounts)
          .attr("d", d3.area()
              .x(function(d) { return this.x(this.times[d]) }.bind(this))
              .y0(function(d) { return this.y(this.numParticles - this.deadCounts[d])  }.bind(this))
              .y1(function(d) { return this.y(this.numParticles) }.bind(this))
              )
  }

  clear() {
      this.logNum = 0;
      this.infectedCounts = [];
      this.deadCounts = [];
      this.latentCounts = [];
      this.asymptomaticCounts = [];
      this.susceptibleCounts = [];
      this.recoveredCounts = [];
      this.times = [];
      this.logCounts = [];
      this.plot()

  }
}

