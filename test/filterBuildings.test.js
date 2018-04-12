'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var filterBuildings = path.join(__dirname, '/fixtures/filterBuildings.mbtiles');
var commonOpts = {
  zoom: zoom
};

test('filterBuildings', function(t) {
  t.plan(4);
  logInterceptor();
  processors.filterBuildings(commonOpts, filterBuildings, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(
          geoJSON.features.length,
          3,
          'Should return 3 features'
      );

      for (var j = 0; j < geoJSON.features.length; j++) {
        t.comment('Feature: ' + j);
        t.equal(
          geoJSON.features[j].properties._osmlint,
          'filterbuildings',
          'Should be filterbuildings'
        );
      }
    }
    t.end();
  });
});
