'use strict';

var tileReduce = require('@mapbox/tile-reduce');
var path = require('path');
var _ = require('lodash');

var wayIds = [];

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
    .on('reduce', function(ids) {
      if (ids.length) {
        Array.prototype.push.apply(wayIds, ids);
      }
    })
    .on('end', function() {
      callback && callback(null, _.uniq(wayIds).length);
    });
};
