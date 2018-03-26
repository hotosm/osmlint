'use strict';
var test = require('tape');
var logInterceptor = require('log-interceptor');
var path = require('path');
var processors = require('../index.js');
var zoom = 12;
var filterResidentialBuildings = path.join(__dirname, '/fixtures/filterResidentialBuildings.mbtiles');
var commonOpts = {
  zoom: zoom
};

test('filterResidentialBuildings', function(t) {
  t.plan(3);
  logInterceptor();
  processors.filterResidentialBuildings(commonOpts, filterResidentialBuildings, function() {
    var logs = logInterceptor.end();
    for (var i = 0; i < logs.length; i++) {
      var geoJSON = JSON.parse(logs[i]);
      t.equal(
          geoJSON.features.length,
          2,
          'Should return 2 features'
      );

      for (var j = 0; j < geoJSON.features.length; j++) {
        t.comment('Feature: ' + j);
        t.equal(
          geoJSON.features[j].properties._osmlint,
          'filterresidentialbuildings',
          'Should be filterresidentialbuildings'
        );
      }
    }
    t.end();
  });
});
