class HeatMap{
	constructor(container){
		this.itemSize = 22;
        this.cellSize = itemSize - 1;
        this.margin = {top: 120, right: 20, bottom: 20, left: 110};
          
    	this.width = 2000 - this.margin.right - this.margin.left;
       	this.height = 1000 - this.margin.top - this.margin.bottom;

       	this.canvas = container.attr("width", width + margin.left + margin.right)
        	.attr("height", height + margin.top + margin.bottom)
         	.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.canvas.append("g")
            .attr("class", "leftAxis");

        this.helper = this.canvas.append("g")
            .attr("class", "rightAxis");

        this.canvas.append("g")
            .attr("class", "topAxis");

        this.currData = [];
        this.xAxis = undefined;
        this.rightYAxis = undefined;
        this.leftYAxis = undefined;
        this.colorScale = undefined;
        this.leftYScale = undefined;
        this.rightYScale = undefined;
        this.xScale = undefined;
        this.rowLength = 0;
        this.columnLength = 0;

	}

	setData(newData){
		this.currData = newData;
	}

	updateHeatMap(xAxisColumnName, leftYAxisColumnName, rightYAxisColumnName, colors, colorScaleColumn){

		this.setXAxis(xAxisColumnName);
		this.setRightYAxis(rightYAxisColumnName);
		this.setLeftYAxis(leftYAxisColumnName);
		this.setColorScale(colors, colorScaleColumn);

		console.log(this.currData);

		var cells = this.canvas.selectAll(".block");
		cells.remove(); //.exit().remove() não está funcionando

		var heatmap = this;
		cells = this.canvas.selectAll(".block");
		cells.data(this.currData).enter().append('g')
			.attr("class", "block")
			.append('rect')
            .attr('class', 'cell')
            .attr('width', this.cellSize)
            .attr('height', this.cellSize)
            .attr('y', function(d) { 
            	return heatmap.rightYScale(d[rightYAxisColumnName]); 
            })
            .attr('x', function(d) { return heatmap.xScale(d[xAxisColumnName]); })
            .attr('fill', function(d) {
                if (d[colorScaleColumn] == 0){
                    return 'white';
                }
                return heatmap.colorScale(d[colorScaleColumn]);
            });

        console.log(this.columnLength);
        this.helper
            .attr("transform", "translate(" + (this.rowLength * this.itemSize) + "," + 0 + ")")
            .call(this.rightYAxis)
            .selectAll('text')
            .attr('font-weight', 'normal');

        d3.select(".leftAxis")
            .call(this.leftYAxis)
            .selectAll('text')
            .attr('font-weight', 'normal');


        d3.select(".topAxis")
            .call(this.xAxis)
            .selectAll('text')
            .attr('font-weight', 'normal')
            .style("text-anchor", "start")
            .attr("dx", ".8em")
            .attr("dy", ".5em")
            .attr("transform", function (d) {
                return "rotate(-65)";
            });
	}

	setXAxis(columnName){
		var elements = d3.set(this.currData.map(function( item ) { return item[columnName]; } )).values().sort();
		this.rowLength = elements.length;
		this.xScale = d3.scaleBand()
            .domain(elements)
            .range([0, elements.length * itemSize]);

        this.xAxis = d3.axisTop()
             .scale(this.xScale)
            .tickFormat(function (d) {
                return d;
            });
	}

	setLeftYAxis(columnName){
		var elements = d3.set(this.currData.map(function( item ) { return item[columnName]; } )).values().sort();
		this.leftYScale = d3.scaleBand()
            .domain(elements)
            .range([0, this.columnLength * itemSize]);

        this.leftYAxis = d3.axisLeft()
            .scale(this.leftYScale)
            .tickFormat(function (d) {
                return d;
            });
	}

	setRightYAxis(columnName){
		var elements = d3.set(this.currData.map(function( item ) { return item[columnName]; } )).values().sort();
		this.columnLength = elements.length;
		this.rightYScale = d3.scaleBand()
            .domain(elements)
            .range([0, elements.length * itemSize]);


        this.rightYAxis = d3.axisRight()
            .scale(this.rightYScale)
            .tickFormat(function (d) {
                return d;
            });
	}

	setColorScale(colors, columnName){
		var min = d3.min(this.currData, function(item){
                return item[columnName];
            });
        var max = d3.max(this.currData, function(item){
                return item[columnName];
            });

        this.colorScale = d3.scaleQuantize()
        .range(colors)
        .domain([min,max]);
	}
}