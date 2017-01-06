'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var doubledPlacesTiles = path.join(__dirname, '/fixtures/doubledPlaces.mbtiles');
var doubledPlacesOpts = {
  bbox: [-6.2128544, 37.910414, -6.0945797, 37.996907],
  zoom: zoom
};
test('doubledPlaces', function(t) {
  t.plan(2);
  logInterceptor();
  processors.doubledPlaces(doubledPlacesOpts, doubledPlacesTiles, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.comment('Pass: ' + (i + 1));
      if (geoJSON.features.length > 0) {
        t.equal(geoJSON.features[0].properties._osmlint, 'doubledplaces', 'Should be doubledplaces');
        t.equal(geoJSON.features[0].geometry.type, 'Polygon', 'Should be polygon');
      }
    }
    t.end();
  });
});
