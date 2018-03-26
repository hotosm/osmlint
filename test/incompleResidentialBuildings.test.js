'use strict';
var test = require('tape');
var path = require('path');
var processors = require('../index.js');
var mbtiles = path.join(__dirname, '/fixtures/incompleteResidentialBuildings.mbtiles');
var commonOpts = {
  zoom: 12
};
test('incompleResidentialBuildings', function(t) {
  t.plan(3);
  processors.incompleteResidentialBuildings(commonOpts, mbtiles, function(err, data) {
    t.equal(
        data.buildingYes,
        1,
        'building=yes count should be 1'
    );
    t.equal(
        data.buildingResidentialIncomplete,
        1,
        'Incomplete residential buildings should be 1'
    );
    t.equal(
        data.totalBuildings,
        3,
        'Total buildings should be 3'
    );
    t.end();
  });
});
