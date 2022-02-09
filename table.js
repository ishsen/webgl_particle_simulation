var stateColorMap = {
  "latent": "peachpuff", 
  "asymptomatic": "lightsalmon",
  "infected": "coral", 
  "susceptible": "lightsteelblue",
  "recovered":"mediumpurple",
  "dead": "black"
  }

  class SimulationTable {
    constructor(id, initStats, height, width) {
      this.tableCount = d3
      .select("#" + id)
      .append("div")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "simtable")
      const xOffset = 30
      const yOffset = 30

        // create circles for each label in table
   /*      this.tableCount.selectAll("mydots")
            .data(Object.keys(initStats))
            .enter()
            .append("circle")
            .attr("cx", xOffset)
            .attr("cy", function(d,i){ return yOffset - 1 + i*25}) 
            .attr("r", 7)
            .style("fill", function(d){ return stateColorMap[d]}); */

        // create labels for table
        this.tableCount.selectAll("mylabels")
            .data(Object.keys(initStats))
            .enter()
            .append("div")
            .attr("id", "labelID")

            .text(function(d){ return d})
            
            .style('grid-column', '1')
            .style('border-bottom', '1px solid #eee')
            .style('grid-row', function(d,i){return i + 1})
//  .style("color", function(d){ return stateColorMap[d]})

        // create initial counts for table (Probably should of done this and labels at the same time)
        this.tableCount.selectAll("mycounts")
            .data(Object.keys(initStats))
            .enter()
            .append("div")
                .attr("id", "tableCountID")
            
            .style("color", function(d){ return stateColorMap[d]})
            .text(function(d){ return initStats[d]})
            .attr("text-anchor", "left")
            .style('border-bottom', '1px solid #eee')
            .style('grid-column', '2')
            .style('grid-row', function(d,i){return i + 1})
          /*   .style("alignment-baseline", "middle")
            .attr("x", xOffset + 130)
            .attr("y", function(d,i){ return yOffset + i*25})  */


          
    }

    update(stats) {
      // update table counts
      this.tableCount.selectAll("#tableCountID")
          .data(Object.values(stats))
          .text(function(d){ return d});
    }
}


function getStats() {
    const stats = new Stats();
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";
    document.getElementById("stats").appendChild(stats.domElement);
    return stats;
}

