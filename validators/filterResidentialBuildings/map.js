'use strict';
var turf = require('@turf/turf');
var moment = require('moment');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var osmlint = 'filterresidentialbuildings';
  var result = [];
  var timeBuckets = {};

  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if (val.properties.hasOwnProperty('building') && val.properties['building'] === 'residential') {
      val.properties._osmlint = osmlint;
      result.push(val);

      // populate timeBucket( for edit recency analysis
      var timestamp = moment(val.properties['@timestamp'] * 1000);
      var year = timestamp.year();
      var month = timestamp.month();
      var key = String(year) + String(month);
      if (!timeBuckets.hasOwnProperty(key)) {
        timeBuckets[key] = 1;
      } else {
        timeBuckets[key] = timeBuckets[key] + 1;
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, timeBuckets);
};
