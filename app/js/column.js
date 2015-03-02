/*
  column chart with wire overlay
*/


var d3 = require('../lib/d3.js');

function column() {


  function chart(selection) {




    return selection;
  }


  // configuration defaults
  var config = {
    y : function(d) { return d; },
    x : function(d) { return d; },
    eventID : 'column'
  }

  // create getter / setter functions for config
  for (var prop in config) {
    (function(p) {
      chart[p] = function(value) {
        if (!value) {return config[p];}
        else {
          config[p] = value;
          return chart;
        }
      }
    })(prop)
  }

  return chart;
}

module.exports = column;