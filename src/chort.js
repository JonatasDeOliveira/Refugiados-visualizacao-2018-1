class Chort {
	
	constructor(container, year) {
		this.year = year;
		this.container = container;
		this.cond = true;
		this.groupIndex = 1;
		this.width = 650;
		this.height = 650;
		this.outerPadding = 150;
		this.labelPadding = 5;
		this.chordPadding = 0.03;
		this.arcThickness = 30;
		this.opacity = 1;
		this.fadedOpacity = 0.1;
		this.transitionDuration = 300;
		this.outerRadius = this.width / 2 - this.outerPadding;
		this.innerRadius = this.outerRadius - this.arcThickness;
		this.valueFormat = d3.format(",");


		this.svg = container.append("svg")
			.attr("width", this.width)
			.attr("height", this.height);
		this.g = this.svg.append("g")
			.attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
		this.ribbonsG =this.g.append("g");
		this.groupsG =this.g.append("g");
		this.setYear(this.year);
	}
	
	setYear(year) {
		this.year = year;
		
		var ribbon = d3.ribbon()
			.radius(this.innerRadius),
		  chord = d3.chord()
			.padAngle(this.chordPadding)
			.sortSubgroups(d3.descending),
		  arc = d3.arc()
			.innerRadius(this.innerRadius)
			.outerRadius(this.outerRadius),
		  color = d3.scaleOrdinal()
			.range(d3.schemeCategory20);

		var popoverOptions = {
		html : true,
		template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><div class="popover-content"></div></div>'
		};
		var chort = this;
		function render(data){

		var matrix = generateMatrix(data),
			chords = chord(matrix);

		color.domain(matrix.map(function (d, i){
		  return i;
		}));
		var aux1 = chort.ribbonsG.selectAll("path")
			.data(chords);
		aux1.exit().remove();
		aux1.enter().append("path")
			.merge(aux1)
			.attr("class", "ribbon")
			.attr("d", ribbon)
			.style("fill", function(d) {
			  return color(d.source.index);
			})
			.style("stroke", function(d) {
			  return d3.rgb(color(d.source.index)).darker();
			})
			.style("opacity", chort.opacity)
			.on("mouseenter", function(d){
				if(chort.groupIndex==d.source.index||chort.groupIndex==d.target.index||chort.cond) {
				  var src = matrix.names[d.source.index];
				  var dest = matrix.names[d.target.index];
				  popoverOptions.content = [
					"<strong>" + src +" to " + dest +"</strong>",
					chort.valueFormat(d.target.value),
					"<br><strong>" + dest +" to " + src +"</strong>",
					chort.valueFormat(d.source.value)
				  ].join("<br>");
				  $(this).popover(popoverOptions);
				  $(this).popover("show");
				}
			}) 
			.on("mouseleave", function (d){
				if(chort.groupIndex==d.source.index||chort.groupIndex==d.target.index||chort.cond) {
					$(this).popover("hide");
				}
			})


		var groups = chort.groupsG
		  .selectAll("g")
			.data(chords.groups);
			
		groups.exit().remove();
		
		groups.enter().append("g");

		groups
		  .append("path")
		  	.merge(groups)
			.attr("class", "arc")
			.attr("d", arc)
			.style("fill", function(group) {
			  return color(group.index);
			})
			.style("stroke", function(group) {
			  return d3.rgb(color(group.index)).darker();
			})
			.style("opacity", chort.opacity)
			.call(groupHover);

		var angle = d3.local(),
			flip = d3.local();
		groups
		  .append("text")
			.each(function(d) {
			  angle.set(this, (d.startAngle + d.endAngle) / 2)
			  flip.set(this, angle.get(this) > Math.PI);
			})
			.attr("transform", function(d) {
			  return [
				"rotate(" + (angle.get(this) / Math.PI * 180 - 90) + ")",
				"translate(" + (chort.outerRadius + chort.labelPadding) + ")",
				flip.get(this) ? "rotate(180)" : ""
			  ].join("");
			})
			.attr("text-anchor", function(d) {
			  return flip.get(this) ? "end" : "start";
			})
			.text(function(d) {
			  return matrix.names[d.index];
			})
			.attr("alignment-baseline", "central")
			.style("font-family", '"Helvetica Neue", Helvetica')
			.style("font-size", "7pt")
			.style("cursor", "default")
			.call(groupHover);
		}


		function groupHover(selection){
		selection
		  .on("click", function (group){
			if(chort.cond) {
				chort.cond = false;
				chort.g.selectAll(".ribbon")
				    .filter(function(ribbon) {
				      return (
				        (ribbon.source.index !== group.index) &&
				        (ribbon.target.index !== group.index)
				      );
				    })
				  .transition().duration(chort.transitionDuration)
				    .style("opacity", chort.fadedOpacity);
					this.groupIndex = group.index;
			} else {
				chort.cond = true;
				chort.g.selectAll(".ribbon")
				  .transition().duration(chort.transitionDuration)
				    .style("opacity", chort.opacity);
			}
		  });
		}

		function generateMatrix(data){
		var nameToIndex = {},
			names = [],
			matrix = [],
			n = 0, i, j;


		function recordName(name){
		  if( !(name in nameToIndex) ){
			nameToIndex[name] = n++;
			names.push(name);
		  }
		}

		data.forEach(function (d){
		  recordName(d["origin region"]);
		  recordName(d["asylum region"]);
		});

		for(i = 0; i < n; i++){
		  matrix.push([]);
		  for(j = 0; j < n; j++){
			matrix[i].push(0);
		  }
		}
		data.forEach(function (d){
		  i = nameToIndex[d["origin region"]];
		  j = nameToIndex[d["asylum region"]];
		  if(d["Year"] == year) {
			matrix[j][i] += parseFloat(d["Refugees (incl. refugee-like situations)"]);
		  } else {
			matrix[j][i] += 0.0;
		  }
		});

		matrix.names = names;

		return matrix;
		}

		d3.csv("regions_dataset.csv", type, function (dataForCountries){console.log(dataForCountries);
			render(dataForCountries);
		});

		function type(d){
		d.count = +d.count;
		return d;
		}


		function aggregate(data, hierarchy){
		var links = {},
			parent = {},
			descendants = d3.hierarchy(hierarchy).descendants();

		descendants.forEach(function (node){
		  if(node.parent){
			parent[node.data.data.id] = node.parent.data.data.id;
		  }
		});
		
		function getLink(origin, destination){
		  var key = origin + "|" + destination;
		  return (key in links) ? links[key] : (links[key] = {
			origin: origin,
			destination: destination,
			count: 0
		  });
		}

		data.forEach(function (d){
		  getLink(parent[d["origin region"]], parent[d["asylum region"]]).count += parseFloat(d["Refugees (incl. refugee-like situations)"]);

		  //console.log(d.origin + " is in " + parent[d.origin]);
		  //console.log(d.destination + " is in " + parent[d.destination]);
		});

		return Object.keys(links).map(function (key){
		  return links[key];
		});

		}
	}
}
