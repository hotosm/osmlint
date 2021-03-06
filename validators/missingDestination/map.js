'use strict';
var turf = require('@turf/turf');
var _ = require('underscore');
var rbush = require('rbush');
// Check the missing exit and entrance motorway_links in the block are mapped with destination=* or destination:ref=* tagsß
module.exports = function(tileLayers, tile, writeData, done) {
  var layer = tileLayers.osm.osm;
  var bboxes = [];
  var highways = {};
  var output = {};
  var majorRoads = {
    motorway: true,
    trunk: true,
    primary: true,
    secondary: true,
    tertiary: true,
    motorway_link: true,
    trunk_link: true,
    primary_link: true,
    secondary_link: true,
    tertiary_link: true
  };
  var minorRoads = {
    unclassified: true,
    residential: true,
    living_street: true,
    service: true,
    road: true
  };
  var pathRoads = {
    track: true,
    footway: true,
    path: true,
    cycleway: true,
    steps: true
  };

  var preserveType = {};
  preserveType = _.extend(preserveType, majorRoads);
  preserveType = _.extend(preserveType, minorRoads);
  preserveType = _.extend(preserveType, pathRoads);
  var osmlint = 'missingdestination';
  for (var z = 0; z < layer.features.length; z++) {
    var val = layer.features[z];
    if (
      val.geometry.type === 'LineString' &&
      preserveType[val.properties.highway]
    ) {
      var bboxA = objBbox(val);
      bboxes.push(bboxA);
      highways[val.properties['@id']] = val;
    }
  }

  var highwaysTree = rbush(bboxes.length);
  highwaysTree.load(bboxes);
  for (var i = 0; i < bboxes.length; i++) {
    var valueBbox = bboxes[i];
    var valueHighway = highways[valueBbox.id];
    valueHighway.properties._osmlint = osmlint;
    if (
      valueHighway.properties.highway === 'motorway_link' &&
      (!valueHighway.properties.destination &&
        !valueHighway.properties['destination:ref'])
    ) {
      var overlaps = highwaysTree.search(valueBbox);
      for (var k = 0; k < overlaps.length; k++) {
        var overlap = overlaps[k];
        var overlapHighway = highways[overlap.id];
        if (
          valueHighway.properties['@id'] !== overlapHighway.properties['@id']
        ) {
          var firstCoord = valueHighway.geometry.coordinates[0];
          //entrance
          if (overlapHighway.properties.highway !== 'motorway_link') {
            var overlapCoords = _.flatten(overlapHighway.geometry.coordinates);
            if (_.intersection(overlapCoords, firstCoord).length === 2) {
              output[valueHighway.properties['@id']] = valueHighway;
            }
          }
        }
      }
    }
  }

  var result = _.values(output);
  if (result.length > 0) {
    var fc = turf.featureCollection(result);
    writeData(JSON.stringify(fc) + '\n');
  }

  done(null, null);
};

function objBbox(obj, id) {
  var bboxExtent = ['minX', 'minY', 'maxX', 'maxY'];
  var bbox = {};
  var valBbox = turf.bbox(obj);
  for (var d = 0; d < valBbox.length; d++) {
    bbox[bboxExtent[d]] = valBbox[d];
  }
  bbox.id = id || obj.properties['@id'];
  return bbox;
}
