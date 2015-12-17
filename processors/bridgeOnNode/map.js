'use strict'
var turf = require('turf');

module.exports = function(tileLayers, tile, writeData, done) {
    var layer = tileLayers.osm.osm;
    var result = layer.features.filter(function(val) {
        return (val.properties.bridge && (val.geometry.type === 'Point'));
    });

    if (result.length > 0) {
        var fc = turf.featurecollection(result);
        writeData(JSON.stringify(fc) + '\n');
    }

    done(null, null);
};