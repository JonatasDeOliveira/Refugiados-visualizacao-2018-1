// Configuration parameters.
var width = 960,
  height = 960,
  outerPadding = 150,
  labelPadding = 5,
  chordPadding = 0.03,
  arcThickness = 30,
  opacity = 0.5,
  fadedOpacity = 0.01,
  transitionDuration = 300,
  outerRadius = width / 2 - outerPadding,
  innerRadius = outerRadius - arcThickness,
  valueFormat = d3.format(",");

// DOM Elements.
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"),
  ribbonsG = g.append("g"),
  groupsG = g.append("g");

// D3 layouts, shapes and scales.
var ribbon = d3.ribbon()
    .radius(innerRadius),
  chord = d3.chord()
    .padAngle(chordPadding)
    .sortSubgroups(d3.descending),
  arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius),
  color = d3.scaleOrdinal()
    .range(d3.schemeCategory20);

var popoverOptions = {
html : true,
template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><div class="popover-content"></div></div>'
};

// Renders the given data as a chord diagram.
function render(data){

var matrix = generateMatrix(data),
    chords = chord(matrix);

color.domain(matrix.map(function (d, i){
  return i;
}));

// Render the ribbons.
ribbonsG.selectAll("path")
    .data(chords)
  .enter().append("path")
    .attr("class", "ribbon")
    .attr("d", ribbon)
    .style("fill", function(d) {
      return color(d.source.index);
    })
    .style("stroke", function(d) {
      return d3.rgb(color(d.source.index)).darker();
    })
    .style("opacity", opacity)
    .on("mouseenter", function(d){
      var src = matrix.names[d.source.index];
      var dest = matrix.names[d.target.index];
      popoverOptions.content = [
        "<strong>" + src +" to " + dest +"</strong>",
        valueFormat(d.target.value),
        "<br><strong>" + dest +" to " + src +"</strong>",
        valueFormat(d.source.value)
      ].join("<br>");
      $(this).popover(popoverOptions);
      $(this).popover("show");
    }) 
    .on("mouseleave", function (d){
      $(this).popover("hide");
    })


// Scaffold the chord groups.
var groups = groupsG
  .selectAll("g")
    .data(chords.groups)
  .enter().append("g");

// Render the chord group arcs.
groups
  .append("path")
    .attr("class", "arc")
    .attr("d", arc)
    .style("fill", function(group) {
      return color(group.index);
    })
    .style("stroke", function(group) {
      return d3.rgb(color(group.index)).darker();
    })
    .style("opacity", opacity)
    .call(groupHover);

// Render the chord group labels.
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
        "translate(" + (outerRadius + labelPadding) + ")",
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
    .style("font-size", "10pt")
    .style("cursor", "default")
    .call(groupHover);
}

// Sets up hover interaction to highlight a chord group.
// Used for both the arcs and the text labels.
function groupHover(selection){
selection
  .on("mouseover", function (group){
    g.selectAll(".ribbon")
        .filter(function(ribbon) {
          return (
            (ribbon.source.index !== group.index) &&
            (ribbon.target.index !== group.index)
          );
        })
      .transition().duration(transitionDuration)
        .style("opacity", fadedOpacity);
  })
  .on("mouseout", function (){
    g.selectAll(".ribbon")
      .transition().duration(transitionDuration)
        .style("opacity", opacity);
  });
}

// Generates a matrix (2D array) from the given data, which is expected to
// have fields {origin, destination, count}. The matrix data structure is required
// for use with the D3 Chord layout.
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
  matrix[j][i] = parseFloat(d["Refugees (incl. refugee-like situations)"]);
});

matrix.names = names;

return matrix;
}

d3.csv("regions_dataset.csv", type, function (dataForCountries){console.log(dataForCountries);
    render(dataForCountries);
});

// Parses a single row of the input table.
function type(d){
d.count = +d.count;
return d;
}

// Aggregates data from countries to regions.
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
