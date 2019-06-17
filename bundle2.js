(function (d3) {
  'use strict';

  const svg1 = d3.select("." + "barchart1");
  console.log(svg1);

  const width1 = +svg1.attr('width');
  const height1 = +svg1.attr('height');

  const render1 = data => {
    const xValue1 = d => d.Wineries;
    const yValue1 = d => d.State;
    const margin1 = { top: 20, right:0, bottom: 20, left: 80 };
    const innerWidth1 = width1 - margin1.left - margin1.right;
    const innerHeight1 = height1 - margin1.top - margin1.bottom;
    
    const xScale1 = d3.scaleLinear()
      // .domain([0, d3.max(data,xValue1)])
      .domain([0, 99])
      .range([0, innerWidth1]);
    
    const yScale1 = d3.scaleBand()
      .domain(data.map(yValue1))
      .range([0, innerHeight1])
      .padding(0.1);
    
    const g1 = svg1.append('g')
      .attr('transform', `translate(${margin1.left},${margin1.top})`);
    
    g1.append('g').call(d3.axisLeft(yScale1));
    g1.append('g').call(d3.axisBottom(xScale1))
      .attr('transform', `translate(0,${innerHeight1})`);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    /*g1.selectAll('text').data(data)
      .enter().append("text")
      .attr("class","label")
      .attr("x", d => xScale1(xValue1(d)) - 30)
      .attr("y", yScale1.bandwidth()/2)
      .attr("text-anchor", "end")
      .text(function(thisElement){
          return thisElement.Wineries;
      });*/
    
    g1.selectAll('rect').data(data)
      .enter().append('rect')
        .attr('y', d => yScale1(yValue1(d)))
        .attr('width', d => xScale1(xValue1(d)))
        .attr('height', yScale1.bandwidth())
        .attr("class", "rectWineries")
        .on("mouseover", function(thisElement){
                //Display tooltip
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html("Number of Wineries: " + thisElement.Wineries)  
                    .style("left", (d3.event.pageX + 10) + "px")     
                    .style("top", (d3.event.pageY - 5) + "px");

                //hightlight the current rect
                svg1.selectAll("." + "rectWineries")
                    .attr("opacity", 0.2); // grey out all rect
                d3.select(this) // hightlight the rect hovering on
                    .attr("opacity", 0.8);
            })
        .on("mouseout", function(thisElement, index){
          // restore all rect to normal mode
                svg1.selectAll("." + "rectWineries") 
                    .attr("opacity", 1);
            // fade tooltip
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);
            });

  };

  const svg2 = d3.select("." + "barchart2");
  console.log(svg2);

  const width2 = +svg2.attr('width');
  const height2 = +svg2.attr('height');

  const render2 = data => {
    const xValue2 = d => d.Ratings;
    const yValue2 = d => d.State;
    const margin2 = { top: 20, right:0, bottom: 20, left: 80 };
    const innerWidth2 = width2 - margin2.left - margin2.right;
    const innerHeight2 = height2 - margin2.top - margin2.bottom;
    
    const xScale2 = d3.scaleLinear()
      // .domain([0, d3.max(data, xValue2)])
      .domain([0, 95])
      .range([0, innerWidth2]);
    
    const yScale2 = d3.scaleBand()
      .domain(data.map(yValue2))
      .range([0, innerHeight2])
      .padding(0.1);
    
    const g2 = svg2.append('g')
      .attr('transform', `translate(${margin2.left},${margin2.top})`);
    
    g2.append('g').call(d3.axisLeft(yScale2));
    g2.append('g').call(d3.axisBottom(xScale2))
      .attr('transform', `translate(0,${innerHeight2})`);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "floatinglabel")               
        .style("opacity", 0);

    g2.selectAll('text').data(data)
      .enter().append("text")
      .attr("id",function(d){
          return "T" + d.State;
      })
      .attr("x", d => xScale2(xValue2(d)) - 30)
      .attr("y", yScale2.bandwidth()/2)
      // .attr("text-anchor", "middle")
      .text(function(thisElement){
          return thisElement.Ratings;
      });
    
    g2.selectAll('rect').data(data)
      .enter().append('rect')
        .attr('y', d => yScale2(yValue2(d)))
        .attr('width', d => xScale2(xValue2(d)))
        .attr('height', yScale2.bandwidth())
        .attr('class','rectRatings')
        .on("mouseover", function(thisElement){
                //Display tooltip
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html("Ratings: " + thisElement.Ratings + "/100")  
                    .style("left", (d3.event.pageX + 10) + "px")     
                    .style("top", (d3.event.pageY - 5) + "px");

                //hightlight the current rect
                svg2.selectAll("." + "rectRatings")
                    .attr("opacity", 0.2); // grey out all rect
                d3.select(this) // hightlight the rect hovering on
                    .attr("opacity", 0.8);
            })
        .on("mouseout", function(thisElement, index){
          // restore all rect to normal mode
                svg2.selectAll("." + "rectRatings") 
                    .attr("opacity", 1);
            // fade tooltip
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);
            });
  };

  d3.csv('StateWineData.csv', function(data){
    console.log(data);
    /*data.forEach(d => {
      d.population = +d.population * 1000;
    });*/
    data.sort(function(x, y){
      return d3.descending(+x.Wineries, +y.Wineries);
    });
    console.log(data);
    render1(data);
    data.sort(function(x, y){
      return d3.descending(+x.Ratings, +y.Ratings);
    });
    render2(data);
    });
  

}(d3));