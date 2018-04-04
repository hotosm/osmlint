'use strict';
var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
var _ = require('lodash');

var timeBins = {};

module.exports = function(opts, mbtilesPath, callback) {
  tileReduce({
    bbox: opts.bbox,
    zoom: opts.zoom,
    map: path.join(__dirname, '/map.js'),
    sources: [
      {
        name: 'osm',
        mbtiles: mbtilesPath,
        raw: false
      }
    ]
  })
    .on('reduce', function(timeBucket) {
      // aggregate the time buckets
      _.reduce(timeBucket, function(result, value, key) {
        if (timeBins.hasOwnProperty(key)) {
          timeBins[key] = timeBins[key] + value;
        } else {
          timeBins[key] = value;
        }
      }, timeBins);
    })
    .on('end', function() {
      callback && callback(null, timeBins);
    });
};
