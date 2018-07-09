class Map {
	constructor(year) {
		this.year = year;
		this.origin = "!";
		this.lastClicked = true;
		this.map = L.map('map');
		if (L.Browser.mobile) {
		  this.map.setView([15, -21.95], 2);
		} else {
		  this.map.setView([0, 0], 2);
		}
		this.setYear(this.year);
		
	}
	
	setYear(year) {
		this.year = year;
		this.origin = "!";
		var m = this;
		m.map.eachLayer(function (layer) {
			m.map.removeLayer(layer);
		});
		L.esri.basemapLayer('Topographic').addTo(m.map);
		Papa.parse('datasets/regions_dataset.csv', {
		  download: true,
		  header: true,
		  dynamicTyping: true,
		  skipEmptyLines: true,
		  complete: function(results) {
			var geoJsonFeatureCollection = {
			  type: 'FeatureCollection',
			  features: results.data.filter(function(datum){
				return datum["Year"] == m.year;
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
			}).addTo(m.map);
			// since this demo is using the optional "pathDisplayMode" as "selection",
			// it is up to the developer to wire up a click or mouseover listener
			// and then call the "selectFeaturesForPathDisplay()" method to inform the layer
			// which Bezier paths need to be drawn
			oneToManyFlowmapLayer.on('click', function(e) {
				m.origin = e.sharedOriginFeatures[0].properties['origin abbreviation'];
				m.lastClicked = true;
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
	}
}

