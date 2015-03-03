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
  "scenario" : "noschip",
  "aca" : "True"
};

loadCSVs(['data/states.csv', 'data/incomes.csv'], ready);

function ready(e, data) {

  var states = data['data/states.csv'];
  var incomes = data['data/incomes.csv'];

  // model starting with defaults
  var model = events(defaults);

  var stateChart = new ColumnChart({
    "container" : d3.select("#states"),
    "title" : "MARKETPLACE",
    "domain" : [
      0, d3.max(states, function(d) {return Number(d.rate);})*1.1
    ],
    "margin" : {"top" : 65},
    "brackets" : [
      {
        "extent" : [0,2],
        "title" : "FEDERAL MARKET PLACE",
      },
      {
        "extent" : [2, 4],
        "title" : "STATE MARKETPLACE"
      }
    ],
    "legend" : {
      "category" : "schip",
      "values" : {
        "True" : {
          "color" : "rgb(29, 175, 236)",
          "text" : "States with a separate child's health insurance program"
        },
        "False" : {
          "color" : "rgb(27,109,142)",
          "text" : "States without a separate child's health insurance program"
        }
      }
    },
    "xAxisRows" : [
      {
        "format" : d3.format(".1%"),
        "variable" : "weight",
        "text" : 'Share of all children'
      }
    ]
  });

  var incomeChart = new ColumnChart({
    "container" : d3.select("#incomes"),
    "title" : "INCOME LEVEL",
    "domain" : [
      0, d3.max(incomes, function(d) {return Number(d.rate);})*1.1
    ],
    "xAxisRows" : [
      {
        "format" : d3.format(".1%"),
        "variable" : "weight",
        "text" : 'Share of all children'
      },
      {
        "variable" : "col_name",
        "text" : '% above FPL'
      }
    ]
  });


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

}


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
