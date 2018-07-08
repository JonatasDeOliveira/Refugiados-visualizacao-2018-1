var map = L.map('map');
if (L.Browser.mobile) {
  map.setView([15, -21.95], 2);
} else {
  map.setView([0, 0], 2);
}
L.esri.basemapLayer('Topographic').addTo(map);
Papa.parse('regions_dataset.csv', {
  download: true,
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function(results) {
    var geoJsonFeatureCollection = {
      type: 'FeatureCollection',
      features: results.data.filter(function(datum){
        return datum["Year"] == "2017";
      }).map(function(datum) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [datum["origin longitude"], datum["origin latitude"]]
          },
          properties: datum
        }
      })
    };
    console.log(geoJsonFeatureCollection);
    var oneToManyFlowmapLayer = L.canvasFlowmapLayer(geoJsonFeatureCollection, {
      originAndDestinationFieldIds: {
        originUniqueIdField: 'origin abbreviation',
        originGeometry: {
          x: 'origin longitude',
          y: 'origin latitude'
        },
        destinationUniqueIdField: 'asylum abbreviation',
        destinationGeometry: {
          x: 'asylum longitude',
          y: 'asylum latitude'
        }
      },
      pathDisplayMode: 'selection',
      animationStarted: true,
      animationEasingFamily: 'Cubic',
      animationEasingType: 'In',
      animationDuration: 2000
    }).addTo(map);
    // since this demo is using the optional "pathDisplayMode" as "selection",
    // it is up to the developer to wire up a click or mouseover listener
    // and then call the "selectFeaturesForPathDisplay()" method to inform the layer
    // which Bezier paths need to be drawn
    oneToManyFlowmapLayer.on('click', function(e) {
        //console.log(e.sharedOriginFeatures[0].properties['Year']);
      if (e.sharedOriginFeatures.length) {
        oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedOriginFeatures, 'SELECTION_NEW');
      }
      /*if (e.sharedDestinationFeatures.length) {
        oneToManyFlowmapLayer.selectFeaturesForPathDisplay(e.sharedDestinationFeatures, 'SELECTION_NEW');
      }*/
    });
    // immediately select an origin point for Bezier path display,
    // instead of waiting for the first user click event to fire
    //oneToManyFlowmapLayer.selectFeaturesForPathDisplayById('origin abbreviation', 'US', true, 'SELECTION_NEW');
  }
});


/*
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
        if(d["origin abbreviation"]!=d["asylum abbreviation"] && d["Year"] == "2008" && d["Origin"]=="Zambia") {
            L.Polyline.Arc(
                [parseFloat(d["origin latitude"]), parseFloat(d["origin longitude"])],
                [parseFloat(d["asylum latitude"]), parseFloat(d["asylum longitude"])], {
                    color: 'blue',
                    vertices: 200,
                    weight: 2,
                    opacity: 0.5,
                    smoothFactor: 1
                }).addTo(map);
        }
    });
}
*/

