
var q = require('queue-async')();

function load(files, callback) {

  files.forEach(function(f) { q.defer(d3.csv, f); });

  q.awaitAll(function(err, raw) {

    data = raw.reduce(function(o, e, i) {
      o[files[i]] = e;
      return o;
    }, {});

    callback(err, data);

  });

}

module.exports = load;