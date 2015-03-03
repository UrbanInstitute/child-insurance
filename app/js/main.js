/*
  Main function calls
  @bsouthga
  03/02/15
*/

// Vendor dependencies
var d3 = require('../lib/d3.js'),
    pym = require('../lib/pym.js');

// Urban Scripts
var ColumnChart = require('./column.js'),
    loadCSVs = require('./load.js'),
    events = require('./events.js');

var defaults = {
  'king' : "False",
  "scenario" : "current",
  "aca" : "True"
};

// model starting with defaults
var model = events(defaults);

var stateChart = new ColumnChart({
  "container" : d3.select("#states")
});

var incomeChart = new ColumnChart({
  "container" : d3.select("#incomes")
});


loadCSVs([
    'data/states.csv',
    'data/incomes.csv'
  ], function(e, data) {

  var states = data['data/states.csv'];
  var incomes = data['data/incomes.csv'];

  update(defaults);

  model.on('change', update);

  d3.select(window).on('resize', function() {
    update(model.get(), true);
  });

  function update(model_state, rerender) {
    var method = rerender ? 'render' : 'update';
    stateChart[method](
      prepData(states, model_state),
      lineData("states", states)
    );
    incomeChart[method](
      prepData(incomes, model_state),
      lineData("incomes", incomes)
    );
  }

});




function lineData(chart, data) {
  return {
    "Pre-ACA" : prepData(data, {
      "chart" : chart,
      "aca" : "False",
      "king" : "False",
      "scenario" : "current"
    }),
    "Current ACA" : prepData(data, {
      "chart" : chart,
      "aca" : "True",
      "king" : "False",
      "scenario" : "current"
    }),
  };
}


function prepData(data, model_state) {
  return data.filter(function(r) {
    for (var e in model_state) {
      if (r[e] !== model_state[e]) {
        return false;
      }
    }
    return r.group !== "all";
  });
}
