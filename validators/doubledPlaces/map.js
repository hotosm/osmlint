'use strict';
var turf = require('turf');
var _ = require('underscore');

// Identify object with the same name.
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var resultPoints = [];
  var objnames = {};
  var osmlint = 'doubledplaces';

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    var evaluateTags = val.properties.historic || val.properties.leisure || val.properties.landuse || val.properties.shop;
    var evaluateGeom = val.geometry.type === 'Point' || val.geometry.type === 'Polygon';
    var avoidTags = !val.properties.public_transport && !val.properties.railway && !val.properties.highway && !val.properties.place && !val.properties['addr:housenumber'];
    var exceptionsTags = val.properties.amenity !== 'bus_station' && val.properties.amenity !== 'parking_entrance';
    if (val.properties.name && evaluateTags && evaluateGeom && avoidTags && exceptionsTags) {
      var nlc = val.properties.name.toLowerCase();
      if (!objnames[nlc]) {
        objnames[nlc] = val;
      } else if (objnames[nlc] && objnames[nlc].properties['@id'] !== val.properties['@id'] && objnames[nlc].properties.name.toLowerCase() === nlc && objnames[nlc].geometry.type !== val.geometry.type && getDistance(objnames[nlc], val) < 0.03 && ((objnames[nlc].properties.historic !== undefined && val.properties.historic !== undefined && objnames[nlc].properties.historic === val.properties.historic) || (objnames[nlc].properties.leisure !== undefined && val.properties.leisure !== undefined && objnames[nlc].properties.leisure === val.properties.leisure) || (objnames[nlc].properties.landuse !== undefined && val.properties.landuse !== undefined && objnames[nlc].properties.landuse === val.properties.landuse) || (objnames[nlc].properties.shop !== undefined && val.properties.shop !== undefined && objnames[nlc].properties.shop === val.properties.shop))) {
        objnames[nlc].properties._osmlint = osmlint;
        val.properties._osmlint = osmlint;
        resultPoints.push(objnames[nlc]);
        resultPoints.push(val);
      }
    }
  }

  var result = _.values(resultPoints);
  if (result.length > 0) {
    var fc = turf.featurecollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);

};

function getDistance(o1, o2) {
  var p, pp;
  if (o1.geometry.type === 'Polygon') {
    pp = turf.centroid(o1);
    p = o2;
  } else {
    pp = turf.centroid(o2);
    p = o1;
  }
  return turf.distance(pp, p, 'kilometers');
}
