var width = 500;
var height = 500;
dataG = []
dataLines = []

function style2(data) {
	return {
		fillColor: 'blue',
		weight: 2,
		opacity: 1,
		color: 'blue',
		dashArray: '3',
		fillOpacity: 0.7
	};
}


var map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		    maxZoom: 18,
		    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		    id: 'mapbox.streets'
    }).addTo(map);
	

d3.json("countries.geojson", function (error, data) {
        dataG = data;
        hey();
});

d3.csv("new_dataset.csv", function(error,data) {
        dataLines = data;
        hey2();
});
    
function hey() {
	    L.geoJson(dataG).addTo(map);
}

function hey2() {
    dataLines.forEach( function(d) {
        //console.log(d);
        if(d["origin abbreviation"]!=d["asylum abbreviation"] && d["Year"] == "2008") {
            L.Polyline.Arc(
                [parseFloat(d["origin latitude"]), parseFloat(d["origin longitude"])],
                [parseFloat(d["asylum latitude"]), parseFloat(d["asylum longitude"])], {
                    color: 'blue',
                    vertices: 200,
                    weight: 0.5,
                    opacity: 0.5,
                    smoothFactor: 1
                }).addTo(map);
        }
    });
}

