'use strict';
var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
var duplicateCount = 0;

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
    .on('reduce', function(count) {
      duplicateCount = duplicateCount + count;
    })
    .on('end', function() {
      callback && callback(null, duplicateCount);
    });
};
