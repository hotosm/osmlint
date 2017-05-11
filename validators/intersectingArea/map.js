'use strict';
var turf = require('turf');
var polygonToLineString = require('@turf/polygon-to-linestring');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var natural = {};
  var bboxes = [];
  var output = {};
  var result = [];
  var osmlint = 'intersectingarea';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    if ((val.properties.natural || val.properties.leisure || val.properties.landuse) && (val.geometry.type === 'LineString' || val.geometry.type === 'Polygon')) {
      if (val.geometry.type === 'Polygon') {
        var line = polygonToLineString(val);
        line.properties = val.properties;
        val = line;
      }
      var valBbox = turf.bbox(val);
      valBbox.push(val.properties['@id']);
      bboxes.push(valBbox);
      natural[val.properties['@id']] = val;
    }
  }

  var naturalTraceTree = rbush(bboxes.length);
  naturalTraceTree.load(bboxes);
  for (var z = 0; z < bboxes.length; z++) {
    var bbox = bboxes[z];
    var valueObjt = natural[bbox[4]];
    var overlaps = naturalTraceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      var valueOverlap = natural[overlap[4]];
      if (overlap[4] !== bbox[4]) {
        var intersect = turf.intersect(valueOverlap, valueObjt);
        if (intersect) {
          intersect.properties = valueObjt.properties;
          intersect._osmlint = osmlint;
          result.push(intersect);
          // if (parseInt(valueObjt.properties['@id']) > parseInt(valueOverlap.properties['@id'])) {
          //   output[valueObjt.properties['@id'] + valueOverlap.properties['@id']] = intersect;
          // } else {
          //   output[valueOverlap.properties['@id'] + valueObjt.properties['@id']] = intersect;
          // }
        }
      }
    }
  }

  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, null);
};
