window.onload = function(){
	//variables
	var svg = d3.select("." + "scatterplot");
    console.log(svg);
    var svgBubble = d3.select("." + "bubblechart");
    var svgBar = d3.select("." + "barchart3");

	var outerWidth  = +svg.attr('width');
    var outerHeight = +svg.attr('height');
    var margin = { left: 20, top: 20, right: 10, bottom: 20 };
    var innerWidth  = outerWidth  - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top  - margin.bottom;
    console.log(innerHeight);
    console.log(innerWidth);

    const marginBar = { top: 20, right:0, bottom: 20, left: 140 };
    const innerWidthBar = outerWidth - marginBar.left - marginBar.right;
    const innerHeightBar = outerHeight - marginBar.top - marginBar.bottom;

    var g = svg.append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gBubble = svgBubble.append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        	// .attr("transform", "translate(0,0)");

    var gBar = svgBar.append("g")
        	.attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");


    // add region label
    var activeRegion = "Victoria";

    svgBubble.append("text")
				        .attr("id", "regionLabel")
				        // .attr("x", 470)
				        // .attr("y", 200)
				        .attr("transform",
	            			  "translate(" + (innerWidth/2 + 62) + " ," + 
	                           (margin.top) + ")")
				        // .attr("text-anchor", "start")
				        .text(activeRegion);

	svgBar.append("text")
				        .attr("id", "regionLabel")
				        // .attr("x", 470)
				        // .attr("y", 200)
				        .attr("transform",
	            			  "translate(" + (innerWidth/2 + 62) + " ," + 
	                           (margin.top) + ")")
				        // .attr("text-anchor", "start")
				        .text(activeRegion);

    var activeGrape;

    var activeWinery;

	var nestedRegionGrape;

	var nestedRegionWinery;

	//mapVariables
	var mymap;
	mymap = L.map('mapid').setView([-37.4430229,144.0975613], 7);
    var svgMap;
	svgMap = d3.select(mymap.getPanes().overlayPane).append("svg");
    var gMap;
    gMap = svgMap.append("g").attr("class", "leaflet-zoom-hide")
    var bounds;
    var padding = 200;
    var pointPositions = [];
    var circles;
    var scaleSVG = true;
    var radius = 100;
    var regionCentroid = [
        {key: "Rutherglen", coords: [-36.35953094, 146.2273009]},
        {key: "Heathcote", coords: [-36.9028954, 144.636540557143]},
        {key: "Yarra Valley", coords: [-37.68561769, 145.3540926]},
        {key: "Goulburn Valley", coords: [-37.711133, 141.496798]},
        {key: "Pyrenees", coords: [-37.01887265, 143.3377873]},
        {key: "Grampians", coords: [-37.25394885, 143.0062695]},
        {key: "Nagambie Lakes", coords: [-36.836604, 145.1240786]},
        {key: "Mornington Peninsula", coords: [-38.3330084, 145.0757997]},
        {key: "Bendigo", coords: [-37.01403672, 144.2596048]}
    ];
    	
    var greenIcon = L.icon({
	    iconUrl: 'grapes.svg',
	    // shadowUrl: 'leaf-shadow.png',

	    iconSize:     [25, 25], // size of the icon
	    // shadowSize:   [50, 64], // size of the shadow
	    iconAnchor:   [25, 10], // point of the icon which will correspond to marker's location
	    // shadowAnchor: [4, 62],  // the same for the shadow
	    popupAnchor:  [-5, 0] // point from which the popup should open relative to the iconAnchor
	});

	// Barchart Render
	const renderBar = data => {
    const xValueBar = d => d.WineryPoints;
    const yValueBar = d => d.Winery;
    
    const xScaleBar = d3.scaleLinear()
      // .domain([0, d3.max(data, xValue2)])
      .domain([80, 95])
      .range([0, innerWidthBar]);
    
    const yScaleBar = d3.scaleBand()
      .domain(data.map(yValueBar))
      .range([0, innerHeightBar])
      .padding(0.1);
    
    gBar.append('g').call(d3.axisLeft(yScaleBar))
    	.attr('class',"wineryBarAxis");
    gBar.append('g').call(d3.axisBottom(xScaleBar))
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('class', "wineryBarAxis");

    // Define the div for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip3")               
        .style("opacity", 0);
    
    gBar.selectAll('rect').data(data)
      .enter().append('rect')
        .attr('y', d => yScaleBar(yValueBar(d)))
        .attr('width', d => xScaleBar(xValueBar(d)))
        .attr('height', yScaleBar.bandwidth())
        .attr('class','rectWineryRatings')
        .attr('id', function(thisElement){
        	/*var index = thisElement.Winery.length;
        	var firstHalf = thisElement.Winery.substring(0,3);
        	var secondHalf = thisElement.Winery.substring(index - 3, index);
        	return firstHalf + secondHalf;*/
        	return thisElement.Winery.substring(0,1) + thisElement.Winery.substring(thisElement.Winery.length - 3, thisElement.Winery.length);
        })
        .on("mouseover", function(thisElement){
                //Display tooltip
                div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
                div.html("Ratings: " + thisElement.WineryPoints + "/100" + "<br/>"  + "Click to find me on the map!")  
                    .style("left", (d3.event.pageX + 10) + "px")     
                    .style("top", (d3.event.pageY - 5) + "px");

                //hightlight the current rect
                svgBar.selectAll("." + "rectWineryRatings")
                    .attr("opacity", 0.2); // grey out all rect
                d3.select(this) // hightlight the rect hovering on
                    .attr("opacity", 0.8);
        })
        .on("mouseout", function(thisElement, index){
          // restore all rect to normal mode
                svgBar.selectAll("." + "rectWineryRatings") 
                    .attr("opacity", 1);
            // fade tooltip
                div.transition()        
                    .duration(500)      
                    .style("opacity", 0);
        })
        .on("click", function(thisElement){
        	// highlight the selected winery on map

        	d3.selectAll('.winerydot')
        		.attr('fill', 'purple')
        		.attr('stroke-width', 1)
        		.attr('stroke', 'purple')

        	activeWinery = thisElement.Winery;
        	var activeWineryLength = activeWinery.length;

        	if (activeRegion === "Victoria") {
        		var regionArray = data.filter(function(d) {
		        		return d.Winery === activeWinery;
		    		});
        		var region = regionArray[0].Region;
        		// console.log(region);
        		d3.select("#" + region.substring(0,2) + activeWinery.substring(0,1) + activeWinery.substring(activeWineryLength - 3, activeWineryLength))
        	  		.attr('fill', 'yellow')
        	  		.attr('stroke-width', 15)
        	  		.attr('stroke', 'yellow')
        	}
        	else{
        		d3.select("#" + activeRegion.substring(0,2) + activeWinery.substring(0,1) + activeWinery.substring(activeWineryLength - 3, activeWineryLength))
        	  		.attr('fill', 'yellow')
        	  		.attr('stroke-width', 15)
        	  		.attr('stroke', 'yellow')
        	}
        	
        
        })
        ;

	    gBar.selectAll(".rank")
	    	.data(data)
	    	.enter()
	    	.append("text")
	    	.attr("class",'rank')
	    	.attr('x', d => xScaleBar(xValueBar(d)) + 5)
	    	.attr('y', d => yScaleBar(yValueBar(d)) + yScaleBar.bandwidth()/2 + 5)
	    	.text(function(thisElement, i){
	    		return i + 1;
	    	})
	    };

    d3.csv('data.csv', function (data) {
    	var oldData = data;
    	console.log(oldData);

    	var uniqueRegionList = d3.map(data, function(d){return d.Region;}).keys();
    	console.log(uniqueRegionList);
    	
    	var uniqueRegiontoplot = d3.map(data, function(d){return d.Region;}).values();
    	console.log(uniqueRegiontoplot);

    	var uniqueGrapetoplot = d3.map(data, function(d){return d.GrapeVariety;}).values();
    	console.log(uniqueGrapetoplot);

    	nestedRegionGrape = d3.nest().key(function(d){
    		return d.Region
    	}).key(function(d){
    		return d.GrapeVariety
    	}).entries(oldData)
    	// console.log(nestedRegionGrape);

    	var val = nestedRegionGrape[0].values;
    	console.log(val);

    	/*nestedRegionWinery = d3.nest().key(function(d){
    		return d.Region
    	}).key(function(d){
    		return d.Winery
    	}).entries(oldData)
    	console.log(nestedRegionWinery);*/
    	
    	var uniqueWineriesToPlot = d3.map(data, function(d){return d.Winery;}).values();
    	console.log(uniqueWineriesToPlot);

    	uniqueWineriesToPlot.sort(function(x, y){
	      return d3.descending(+x.WineryPoints, +y.WineryPoints);
	    });
	    console.log(uniqueWineriesToPlot);

    	var topUniqueWineriesToPlot = uniqueWineriesToPlot.slice(0,20);
    	console.log(topUniqueWineriesToPlot);

    	renderBar(topUniqueWineriesToPlot);



    	// Define the div for the tooltip
        var div = d3.select("body").append("div")   
            .attr("class", "tooltip2")               
            .style("opacity", 0);

		// Scales
	  //var colorScale = d3.scale.category20()
	  var myColor = d3.scaleOrdinal().domain(data).range(d3.schemeCategory20);
	  var myColorB = d3.scaleOrdinal().domain(data).range(d3.schemeCategory20b);
	  var myColorC = d3.scaleOrdinal().domain(data).range(d3.schemeCategory20c);
	  // var myColorS = d3.scaleSequential().domain([35,1]).interpolator(d3.interpolateBuPu);
	  var myColorS = d3.scaleSequential().domain([35,1]).interpolator(d3.interpolatePuRd);

	  var xScale = d3.scaleLinear()
	    .domain([
	    	86.5,
	    	92
	    	])
	    .range([0,innerWidth])

	  // var yScale = d3.scaleLinear()
	  //   .domain([
	  //   	0,
	  //   	d3.max(data,function (d) { return d.NoOfWineries })
	  //   	])
	  //   .range([innerHeight,0]).nice()

	    var yScale = d3.scaleLinear()
	    .domain([
	    	0,
	    	20
	    	])
	    .range([innerHeight,0]).nice()
	    // console.log(d3.max(data,function (d) { return d.NoOfWineries }))

		//add scale to axis
		/*//X-axis
		var xAxis = d3.axisBottom(xScale)

	  	//Y-axis
		var yAxis = d3.axisLeft(yScale)

		g.append('g').call(xAxis)
    	g.append('g').call(yAxis).attr('transform', `translate(0,${innerHeight})`)*/

    	//rScale for the bubble chart
    	var rMin = 10; // "r" stands for radius
      	var rMax = 40;

      	// Victoria bubble rScale
      	var rScale = d3.scaleSqrt().range([rMin, rMax]);
      	rScale.domain([0, d3.max(data, function (d){ return + d.NoOfWineriesPlantedTotal; })]);
      	console.log(d3.max(data, function (d){ return + d.NoOfWineriesPlantedTotal; }));

      	// bubble rScale by Region
      	var rMinRegion = 10; // "r" stands for radius
      	var rMaxRegion = 50;
      	var rScaleRegion = d3.scaleSqrt().range([rMinRegion, rMaxRegion]);
      	rScaleRegion.domain([0, d3.max(data, function (d){ return + d.NoOfWineriesPlantedByRegion; })]);
      	console.log(d3.max(data, function (d){ return + d.NoOfWineriesPlantedByRegion; }));


      	// Bubble force simulation is a collection of forces
      	// about where we want our circles to go
      	// and how we want our circles to interact
      	// Now they all get to the middle
      	// Goal: don't have the bubbles collide
      	var simulation = d3.forceSimulation()
      	 .force('x', d3.forceX(innerWidth/2).strength(0.05))
      	 .force('y', d3.forceY(innerHeight/2 + 20).strength(0.05))
      	 .force('collide', d3.forceCollide(function(d){
            	return rScale(d.NoOfWineriesPlantedTotal) + 2;
            }))

      	/*var simulationRegion = d3.forceSimulation()
      	 .force('x', d3.forceX(innerWidth/2).strength(0.05))
      	 .force('y', d3.forceY(innerHeight/2 + 20).strength(0.05))
      	 .force('collide', d3.forceCollide(function(d){
      	 		console.log(d.values[0].NoOfWineriesPlantedByRegion);
            	return rScale(d.values[0].NoOfWineriesPlantedByRegion) + 2;
            }))*/
      	
    	//add x-axis and y-axis to the scatter plot
	    g.append('g').call(d3.axisLeft(yScale))
	      ;

	    g.append('g').call(d3.axisBottom(xScale))
	      .attr('transform', `translate(0,${innerHeight})`)
	      ;

	    //Draw Scatterplot
	    // Circles
		var circles = g.selectAll('circle')
	      .data(uniqueRegiontoplot)
	      .enter()
	      .append('circle')
	      .attr('cx',function (d) { return xScale(d.RegionPoints) })
	      .attr('cy',function (d) { return yScale(d.NoOfWineries) })
	      .attr('r','10')
	      .attr('stroke','black')
	      .attr('stroke-width',1)
	      .attr('class', function(d){
                return d.Region.slice(0,4);
            })
	      .attr('fill',function (d,i) { return myColor(i) })
	      .on('mouseover', function (thisElement) {
	      	//display tooltip
	      	div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
            div.html("Wine Region: " + thisElement.Region+ "<br/>"  + 
                     "Number of Wineries: " + thisElement.NoOfWineries + "<br/>"  + 
                     "Average Rating: " + thisElement.RegionPoints + "/100" + "<br/>"  +
                     "Click me to see more details!")  
                    .style("left", (d3.event.pageX + 10) + "px")     
                    .style("top", (d3.event.pageY - 5) + "px");

	      	//zoom in this circle
	        d3.select(this)
	          .transition()
	          .duration(500)
	          .attr('r',20)
	          .attr('stroke-width',3)
	      })
	      .on('mouseout', function (thisElement) {
	      	//zoom out this circle
	        d3.select(this)
	          .transition()
	          .duration(500)
	          .attr('r',10)
	          .attr('stroke-width',1)

	        // fade tooltip display
	        div.transition()        
                    .duration(500)      
                    .style("opacity", 0);

            /*//remove label
            d3.select("#regionLabel").remove();*/

            /*//restore the opacity of the wineries
            svgMap.selectAll(".winerydot") 
                    .attr("opacity", 0.8);*/

	      })
	      .on('click', function (thisElement) {
	      	//remove label
            d3.selectAll("#regionLabel").remove();

	      	//set active region value
	      	activeRegion = thisElement.Region;
	      	console.log(activeRegion);
	      	svgBubble.append("text")
				        .attr("id", "regionLabel")
				        // .attr("x", 470)
				        // .attr("y", 200)
				        .attr("transform",
	            			  "translate(" + (innerWidth/2 + 62) + " ," + 
	                           (margin.top) + ")")
				        // .attr("text-anchor", "start")
				        .text(activeRegion);

			svgBar.append("text")
				        .attr("id", "regionLabel")
				        // .attr("x", 470)
				        // .attr("y", 200)
				        .attr("transform",
	            			  "translate(" + (innerWidth/2 + 62) + " ," + 
	                           (margin.top) + ")")
				        // .attr("text-anchor", "start")
				        .text(activeRegion);


			//remove all bubbles
			d3.selectAll(".bubble").remove();

			var newUniqueGrapetoplot = filterBubbleChart(nestedRegionGrape,activeRegion);
			console.log(newUniqueGrapetoplot);
			// var a = newUniqueGrapetoplot[0].values[0].NoOfWineriesPlantedByRegion;
			// console.log(a);
			// console.log(newUniqueGrapetoplot[0].values[0]);

			var simulationRegion = d3.forceSimulation()
	      	 .force('x', d3.forceX(innerWidth/2).strength(0.05))
	      	 .force('y', d3.forceY(innerHeight/2 + 20).strength(0.05))
	      	 .force('collide', d3.forceCollide(function(d){
	      	 		// console.log(d.values[0].NoOfWineriesPlantedByRegion);
	            	return rScaleRegion(d.values[0].NoOfWineriesPlantedByRegion) + 2;
	            }))
	      	 // Before drawing the new bubble chart,
	      	 // remove the grape annotations
	      	 d3.selectAll('.annotationWhite').remove();

			//draw bubblechart again for selected region
			var bubbles = gBubble.selectAll(".bubble")
				.data(newUniqueGrapetoplot).enter().append("circle")
				.attr("class", "bubble")
				.attr('id', function(thisElement){
					var grapeLength = thisElement.values[0].GrapeVariety.length;
					return thisElement.values[0].GrapeVariety.substring(0,2) + thisElement.values[0].GrapeVariety.substring(grapeLength - 3, grapeLength)
				})
				// .attr('cx',400)
	   //          .attr('cy',200)
				.attr('r', function(d){
	            	return rScaleRegion(d.values[0].NoOfWineriesPlantedByRegion);
	            })
	            .attr('fill',function (d,i) { return myColorS(i) })
	            .on('mouseover', function (thisElement) {
		      	//display tooltip
		      		div.transition()        
	                    .duration(200)      
	                    .style("opacity", .9);      
	            	div.html("Grape Variety: " + thisElement.values[0].GrapeVariety+ "<br/>"  + 
	                     "Number of Wineries: " + thisElement.values[0].NoOfWineriesPlantedByRegion + "<br/>" +
	                     "Click me to check out the wineries!")  
	                    .style("left", (d3.event.pageX + 10) + "px")     
	                    .style("top", (d3.event.pageY - 5) + "px");

	            //fade out all wineries bars
		      		d3.selectAll('.rectWineryRatings').attr('opacity', 0.2);

		        //zoom in this circle
			        d3.select(this)
			          .transition()
			          .duration(500)
			          .attr('r',60)
			          .attr('stroke-width', .5)
			          .attr('stroke', 'black')
				})
		      	.on('mouseout', function (thisElement) {
		        	// fade tooltip display
		        	div.transition()        
	                    .duration(500)      
	                    .style("opacity", 0);

	                // set winery bar opacity back
	                d3.selectAll('.rectWineryRatings').attr('opacity', 1);

	                // resume the wineries dots on the map
	                d3.selectAll('.winerydot')
		        		.attr('fill', 'purple')
		        		.attr('stroke-width', 1)
		        		.attr('stroke', 'purple')

	                //zoom out this circle
			        d3.select(this)
			          .transition()
			          .duration(500)
			          .attr('r',function(d){
		            	return rScaleRegion(d.values[0].NoOfWineriesPlantedByRegion);
		            })
			          .attr('stroke-width', .1)
			          .attr('stroke', 'lightgrey')
				      	})
		      	.on('click', function(thisElement){
		      		activeGrape = thisElement.values[0].GrapeVariety;
		      		console.log(activeGrape);

		      		// hightlight related wineries
		      		var wineryTarget = oldData.filter(function(d) {
		        		return d.Region === activeRegion && d.GrapeVariety ===activeGrape;
		    		});
		    		console.log(wineryTarget);

		    		var length = wineryTarget.length;
		    		// console.log(length);

		    		for (var i = 0; i < length; i++) {
			    		var wineryName =  wineryTarget[i].Winery;
			    		var wineryNameLength = wineryName.length;
			    		var wineryID1 = wineryName.substring(0,1); 
			    		var wineryID2 = wineryName.substring(wineryNameLength - 3, wineryNameLength);
			    		var wineryID = wineryID1 + wineryID2;
			    		// console.log(wineryName);
			    		// console.log(wineryID);
			    		// highlight related wineries in the bar chart
	                    d3.select("#" + wineryID) 
	                        .attr("opacity", 0.8); 
	                    // hightlight related wineries on the map
	                    d3.select("#" + activeRegion.substring(0,2) + wineryName.substring(0,1) + wineryName.substring(wineryNameLength - 3, wineryNameLength))
		        	  		.attr('fill', 'yellow')
		        	  		.attr('stroke-width', 15)
		        	  		.attr('stroke', 'yellow')


	                }

		      	})

	        simulationRegion.nodes(newUniqueGrapetoplot)
	        	.on('tick', tickedRegionBubble)

	        function tickedRegionBubble(){
        	bubbles
        		.attr('cx', function(d){
        			return d.x
        		})
        		.attr('cy', function(d){
        			return d.y
        		})
        	}

        	// remove all top wineries barchart and their labels
        	d3.selectAll(".wineryBarAxis").remove();
        	d3.selectAll(".rectWineryRatings").remove();
        	d3.selectAll(".rank").remove();

        	//replot top winery barchart for the selected region
        	var newTopUniqueWineriesToPlot = filterBarChart(uniqueWineriesToPlot,activeRegion);
        	console.log(newTopUniqueWineriesToPlot);
        	renderBar(newTopUniqueWineriesToPlot);


        	//toggle the opacity of the wineries on the map
        	// First, fade out all the wineries
        	svgMap.selectAll(".winerydot")
                    .attr("opacity", 0.2)
                    .attr('fill', 'purple')
                    .attr('stroke', 'purple')
                    .attr('stroke-width', 1);
            console.log(svgMap.selectAll(".winerydot"));
        	// Second, highlight all the wineries in the selected wine region
        	var lengthWineMap = newTopUniqueWineriesToPlot.length;

    		for (var i = 0; i < lengthWineMap; i++) {
	    		var wineryMapName =  newTopUniqueWineriesToPlot[i].Winery;
	    		var regionMapName =  newTopUniqueWineriesToPlot[i].Region;
	    		var wineryMapNameLength = wineryMapName.length;
	    		var wineryMapID3 = regionMapName.substring(0,2);
	    		var wineryMapID1 = wineryMapName.substring(0,1); 
	    		var wineryMapID2 = wineryMapName.substring(wineryMapNameLength - 3, wineryMapNameLength);
	    		var wineryMapID = wineryMapID3+ wineryMapID1 + wineryMapID2;
	    		// console.log(wineryName);
	    		// console.log(wineryID);
                d3.select("#" + wineryMapID) 
                    .attr("opacity", 0.8); 
            }
        	// d3.select("#" + thisElement.Region.substring(0,2) + thisElement.Winery.substring(0,1) + thisElement.Winery.substring(thisElement.Winery.length - 3, thisElement.Winery.length)) // hightlight connected nodes
                        // .attr("opacity", 0.8);
            // console.log("#" + thisElement.Region.substring(0,2) + thisElement.Winery.substring(0,1) + thisElement.Winery.substring(thisElement.Winery.length - 3, thisElement.Winery.length));
            // console.log(d3.select("#" + thisElement.Region.substring(0,2)));

	      })

		// Add annotations for scatter plot
		// Outlier 1: Yarra Valley
		   svg.append('text')
		      .attr('class', 'outlierAnnotation')
		      .attr('x', 150)
		      .attr('y',40)
		      // .attr('fill', 'blue')
		      .text('Yarra Valley')

		// Outlier 2: Rutherglen
		   svg.append('text')
		      .attr('class', 'outlierAnnotation')
		      .attr("transform",
		            "translate(" + (innerWidth/1.15 + 25) + " ," + 
		                           (innerHeight - 54) + ")")
		      .text('Rutherglen')

		   // text label for the x axis
		  svg.append("text")             
		      .attr("transform",
		            "translate(" + (innerWidth/1.25) + " ," + 
		                           (innerHeight + margin.top - 10) + ")")
		      .text("Average Ratings");

		    // text label for the y axis
		  svg.append("text")
		      .attr("transform", "rotate(-90)")
		      .attr("y", margin.left)
		      .attr("x",-89)
		      .attr("dy", "1em")
		      .style("text-anchor", "middle")
		      .text("Number of Wineries");

		  //add title for scatterplot  
		   svg.append("text")
		      .attr("class", "title")
		      .attr("transform",
	            			  "translate(" + (innerWidth/2) + " ," + 
	                           (margin.top) + ")")
		      .attr("text-anchor", "middle")
		      .text("Victorian Wine Regions Overview");

		  //add title for bubblechart
		  svgBubble.append("text")
		      .attr("class", "title")
		      .attr("transform",
	            			  "translate(" + (innerWidth/2 - 20) + " ," + 
	                           (margin.top) + ")")
		      .attr("text-anchor", "middle")
		      .text("Grape Varieties Grown in ");

		    //add outlier label for bubblechart
		    // Outlier 1: Shiraz
		  svgBubble.append("text")
		      .attr('class', 'annotationWhite')
		      .attr('x', 210)
		      .attr('y', 170)
		      .text("Shiraz");

		      // Outlier 2: Pinot Noir
		  svgBubble.append("text")
		      .attr('class', 'annotationWhite')
		      .attr('x', 120)
		      .attr('y', 108)
		      .text("Pinot Noir");
		  /*svgBubble.append("text")
		      .attr('class', 'annotationWhite')
		      .attr('x', 140)
		      .attr('y', 105)
		      .text("Noir");*/

		      // Outlier 3: Chardonnay
		  svgBubble.append("text")
		      .attr('class', 'annotationWhite')
		      .attr('x', 155)
		      .attr('y', 305)
		      .text("Chardonnay");

		    // add title for map
		    svgMap.append("text")
		      .attr("class", "title")
		      .attr("transform",
	            			  "translate(" + (innerWidth/2 - 20) + " ," + 
	                           (margin.top) + ")")
		      .attr("text-anchor", "middle")
		      .text("Wineries on the map");

		  //add title for barchart
		  svgBar.append("text")
		      .attr("class", "title")
		      .attr("transform",
	            			  "translate(" + (innerWidth/2) + " ," + 
	                           (margin.top) + ")")
		      .attr("text-anchor", "middle")
		      .text("Winery Rankings in ");

		     // text label for the x axis in bar chart
		  svgBar.append("text")             
		      .attr("transform",
		            "translate(" + (innerWidth - 10) + " ," + 
		                           (innerHeight + margin.top - 5) + ")")
		      .attr('class', 'winebaraxis')
		      .text("Ratings");


		//Draw bubblechart
		var bubbles = gBubble.selectAll(".bubble")
			.data(uniqueGrapetoplot).enter().append("circle")
			.attr("class", "bubble")
			.attr('id', function(thisElement){
					var grapeLength = thisElement.GrapeVariety.length;
					return thisElement.GrapeVariety.substring(0,2) + thisElement.GrapeVariety.substring(grapeLength - 3, grapeLength)
				})
			// .attr('cx',400)
   //          .attr('cy',200)
			.attr('r', function(d){
            	return rScale(d.NoOfWineriesPlantedTotal);
            })
            .attr('fill',function (d,i) { return myColorS(i) })
            .on('mouseover', function (thisElement) {
	      	//display tooltip
	      	div.transition()        
                    .duration(200)      
                    .style("opacity", .9);      
            div.html("Grape Variety: " + thisElement.GrapeVariety+ "<br/>"  + 
                     "Number of Wineries: " + thisElement.NoOfWineriesPlantedTotal + "<br/>")  
                    .style("left", (d3.event.pageX + 10) + "px")     
                    .style("top", (d3.event.pageY - 5) + "px");

            //zoom in this circle
	        d3.select(this)
	          .transition()
	          .duration(500)
	          .attr('r',5)
	          .attr('stroke-width', .5)
	          .attr('stroke', 'black')
	      
	      })
	      .on('mouseout', function (thisElement) {
	        // fade tooltip display
	        div.transition()        
                    .duration(500)      
                    .style("opacity", 0);

            //zoom out this circle
	        d3.select(this)
	          .transition()
	          .duration(500)
	          .attr('r',function(d){
            	return rScale(d.NoOfWineriesPlantedTotal);
            })
	          .attr('stroke-width', .1)
	          .attr('stroke', 'lightgrey')

	      })

        simulation.nodes(uniqueGrapetoplot)
        	.on('tick', ticked)

        function ticked(){
        	bubbles
        		.attr('cx', function(d){
        			return d.x
        		})
        		.attr('cy', function(d){
        			return d.y
        		})
        }

        /*// add text to bubbles
        svgBubble.selectAll('.bubble')
        		.data(uniqueGrapetoplot).enter()
				.append('text')
				.attr('class', 'bubbleLabel')
				.attr('id', function(thisElement){
					var grapeLength = thisElement.GrapeVariety.length;
					return thisElement.GrapeVariety.substring(0,2) + thisElement.GrapeVariety.substring(grapeLength - 3, grapeLength);
				})
				.attr('x', function(thisElement){
					return thisElement.cx;
				})
				.attr('y', function(thisElement){
					return thisElement.cy;
				})
				.attr('fill', 'blue')
				.text(function(thisElement){
					return thisElement.GrapeVariety;
				})*/

       function filterBubbleChart(nestedRegionGrape, activeRegion){
       		for (var i = 0; i < nestedRegionGrape.length; i++) {
                if (nestedRegionGrape[i].key === activeRegion) {
                    break;
                }
            }
			var value = nestedRegionGrape[i].values;
			console.log(value);
			return value;
		}

		function filterBarChart(uniqueWineriesToPlot, activeRegion){
			var value = uniqueWineriesToPlot.filter(function(d) {
        		return d.Region === activeRegion;
    		});

			console.log(value);

			var sortedValues = value.sort(function(x, y){
		      return d3.descending(+x.WineryPoints, +y.WineryPoints);
		    });
			console.log(sortedValues);

			return sortedValues;
			/*if (value.length > 10) {
				var topTenWineries = value.slice(0,10);
				return topTenWineries;
			}
			else{
				return value;
			}*/

			/*value.forEach(function(thisElement){
				var Winery = new Array();
				var WineryPoints = new Array();
				
				var WineryItem = thisElement.key;
				var WineryPointsItem = thisElement.values[0].WineryPoints;

				Winery.push(Winery);
				WineryPoints.push(WineryPoints);

				console.log(thisElement);

			})*/
		}

		// Draw top winery barchart


		// Draw map
	
	    // initMap();
	    loadTestData(uniqueWineriesToPlot);
	    // loadTestData(data);
	    
	    // function initMap()
	    // {
	        //map is centered on melbourne
	        // mymap = L.map('mapid').setView([-37.81422,144.96316], 7);

	        //mapbox tiles need an access token (retrievable via free mapbox account)
	       /* L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> </a>',
	            maxZoom: 15
	        }).addTo(mymap);*/

	        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			    maxZoom: 18,
			    id: 'mapbox.streets',
			    accessToken: 'pk.eyJ1IjoiYW5uaWtheHkiLCJhIjoiY2p3bHYwaXZ1MDh0cDQzbXdsaWRqam00ciJ9.1ylbJBT2NCzddcGJmxZGHg'
			}).addTo(mymap);

	        //add marker
	        // L.marker([-37.81422,144.96316], {icon: greenIcon}).addTo(mymap).bindPopup("Melbourne");
	        regionCentroid.forEach(addMarker);

	        mymap.on('viewreset', updateView);
	        mymap.on('zoom', updateView);
	        //this svg holds the d3 visualizations
	        /*svgMap = d3.select(mymap.getPanes().overlayPane).append("svg");
	        gMap = svgMap.append("g")
	        			.attr("class", "leaflet-zoom-hide")*/
	        			// .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	        // defs = svg.append("defs");
	    // }

	    function addMarker(d){
	    	L.marker([d.coords[0], d.coords[1]], {icon: greenIcon}).addTo(mymap).bindPopup(d.key);
	    }

	    function loadTestData(indata)
	    {
	
	        //create lat/lng coords for each data item
	        indata.forEach(createLatLng);
	        circles = gMap.selectAll("circle")
	            .data(indata)
	            .enter()
	            .append("circle")
	            .attr("r", radius)
	            .attr('class',"winerydot")
	            .attr('id',function(thisElement){
                return thisElement.Region.substring(0,2) + 
                	thisElement.Winery.substring(0,1) + 
                	thisElement.Winery.substring(thisElement.Winery.length - 3, thisElement.Winery.length);
            })
	            .attr('fill', 'purple')
	            .attr('stroke', 'purple')
	            .attr('stroke-width',1)
	            .on('mouseover', function (thisElement) {
		      	//display tooltip
		      	div.transition()        
	                    .duration(200)      
	                    .style("opacity", .9);      
	            div.html("Winery: " + thisElement.Winery + "<br/>"  + 
	            		 "Winery Rating: " + thisElement.WineryPoints + "/100" + "<br/>"  +
	                     "Wine Region: " + thisElement.Region + "<br/>")  
	                    .style("left", (d3.event.pageX + 10) + "px")     
	                    .style("top", (d3.event.pageY - 5) + "px");
			      })
			      .on('mouseout', function (thisElement) {
			        // fade tooltip display
			        div.transition()        
		                    .duration(500)      
		                    .style("opacity", 0);
		            // turn the dot to purple
		            d3.selectAll('.winerydot')
		        		.attr('fill', 'purple')
		        		.attr('stroke-width', 1)
		        		.attr('stroke', 'purple')
			      })
	            ;

	        updateView();
	    }

	    //assigns each input object a new LatLng variable based on a given x/y coordinate
	    //TODO: adapt to input data in terms of coordinate access
	    function createLatLng(d)
	    {
	        d.LatLng = new L.LatLng(d["Winery-lat"], d["Winery-long"]);
	        // console.log(d["Winery-lat"]);
	        // console.log(d["Winery-long"]);
	    }
	    //calculate the projection of gis coordinates to the leaflet map layer (canvas coordinates)
	    function updatePosition(d)
	    {
	        var newpoint = mymap.latLngToLayerPoint(d.LatLng);
	        pointPositions.push(newpoint);
	    }
	    //triggered when zooming: projection to map and bounds need to be updated
	    function updateView()
	    {
	        //clear old positions
	        pointPositions = [];

	        //use unique winery data 
	        uniqueWineriesToPlot.forEach(updatePosition);
	        // data.forEach(updatePosition);

	        circles.attr("cx",function(d) { return mymap.latLngToLayerPoint(d.LatLng).x});
	        circles.attr("cy",function(d) { return mymap.latLngToLayerPoint(d.LatLng).y});
	        if(scaleSVG) circles.attr("r",function(d) { return radius/2500*Math.pow(2,mymap.getZoom())});
	        bounds = calculateDataBounds(pointPositions);
	        var topLeft = bounds[0];
	        var bottomRight = bounds[1];
	        svgMap .attr("width", bottomRight.x - topLeft.x + 2*padding)
	            .attr("height", bottomRight.y- topLeft.y + 2*padding)   
	           	.style("left", topLeft.x-padding + "px")
	            .style("top", topLeft.y-padding + "px");
	        gMap .attr("transform", "translate(" + (-topLeft.x+padding) + ","
	            + (-topLeft.y+padding) + ")");
	    }
	    //calculate top left and bottom right extents of given features/shapes
	    function calculateDataBounds(features)
	    {
	        var minx = 0, miny = 0, maxx = 0, maxy = 0;
	        //find maxima
	        for(var i=0; i<features.length; i++)
	        {
	            if(features[i].x > maxx) maxx = features[i].x;
	            if(features[i].y > maxy) maxy = features[i].y;
	        }
	        minx = maxx;
	        miny = maxy;
	        //find minima
	        for(var i=0; i<features.length; i++)
	        {
	            if(features[i].x < minx) minx = features[i].x;
	            if(features[i].y < miny) miny = features[i].y;
	        }
	        var topleft = {};
	        topleft.x = minx;
	        topleft.y = miny;
	        var bottomright = {};
	        bottomright.x = maxx;
	        bottomright.y = maxy;
	        var bounds = [];
	        bounds[0] = topleft;
	        bounds[1] = bottomright;
	        return bounds;
	    }
        
	});
  
}