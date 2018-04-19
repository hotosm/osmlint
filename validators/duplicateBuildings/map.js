'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');

module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var buildings = {};
  var bboxes = [];
  var output = {};
  var duplicateCount = 0;
  var osmlint = 'duplicatebuildings';
  for (var i = 0; i < layer.features.length; i++) {
    var val = layer.features[i];
    val.properties._osmlint = osmlint;
    if (val.geometry.type === 'Polygon' && val.properties.building) {
      var bboxBuilding = objBbox(val);
      bboxes.push(bboxBuilding);
      buildings[val.properties['@id']] = val;
    }
  }
  var buildingTraceTree = rbush(bboxes.length);
  buildingTraceTree.load(bboxes);
  for (var j = 0; j < bboxes.length; j++) {
    var bbox = bboxes[j];
    var buildingA = buildings[bbox.id];
    var areabuildingA = turf.area(buildingA);
    var overlaps = buildingTraceTree.search(bbox);
    for (var k = 0; k < overlaps.length; k++) {
      var overlap = overlaps[k];
      var buildingB = buildings[overlap.id];
      if (overlap.id !== bbox.id) {
        var difference = turf.difference(
          buildingA, buildingB
        );
        //detecting buildings that have > 90% overlap
        if (difference && (areabuildingA - turf.area(difference)) > (areabuildingA * 0.9)) {
          duplicateCount = duplicateCount + 1;
          //save detection
          output[overlap.id] = buildingA;
          output[bbox.id] = buildingB;
        }
      }
    }
  }

  var result = _.values(output);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }
  done(null, duplicateCount);
};

function objBbox(obj, id) {
  var bboxExtent = ['minX', 'minY', 'maxX', 'maxY'];
  var bbox = {};
  var valBbox = turf.bbox(obj);
  for (var d = 0; d < valBbox.length; d++) {
    bbox[id || bboxExtent[d]] = valBbox[d];
  }
  bbox.id = obj.properties['@id'];
  return bbox;
}
