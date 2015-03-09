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
    tooltip = require('./tooltip.js')();

var defaults = {
  'king' : "False",
  "scenario" : "noschip",
  "aca" : "True"
};

loadCSVs(['data/states.csv', 'data/incomes.csv'], ready);

function ready(e, data) {

  var states = data['data/states.csv'];
  var incomes = data['data/incomes.csv'];

  var max_max = Math.max(
    d3.max(incomes, function(d) {return Number(d.rate);}),
    d3.max(states, function(d) {return Number(d.rate);})
  );

  // model starting with defaults
  var model = events(defaults);

  var stateChart = new ColumnChart({
    "container" : d3.select("#states"),
    "tooltip" : tooltip,
    "title" : "Marketplace",
    "domain" : [
      0, max_max*1.1
    ],
    "margin" : {"top" : 65},
    "brackets" : [
      {
        "extent" : [0,2],
        "title" : "Federal Marketplace",
      },
      {
        "extent" : [2, 4],
        "title" : "State Marketplace"
      }
    ],
    "legend" : {
      "category" : "schip",
      "values" : {
        "True" : {
          "color" : "rgb(29, 175, 236)",
          "text" : "States with pre-existing S-CHIP program"
        },
        "False" : {
          "color" : "rgb(27,109,142)",
          "text" : "States without pre-existing S-CHIP program"
        }
      }
    },
    "xAxisRows" : [
      {
        "format" : d3.format(".1%"),
        "variable" : "weight",
        "text" : 'of all children'
      }
    ]
  });

  var incomeChart = new ColumnChart({
    "container" : d3.select("#incomes"),
    "tooltip" : tooltip,
    "title" : "Income Level",
    "domain" : [
      0, max_max*1.1
    ],
    "xAxisRows" : [
      {
        "format" : d3.format(".1%"),
        "variable" : "weight",
        "text" : 'of all children'
      },
      {
        "variable" : "col_name",
        "text" : 'FPL'
      }
    ]
  });


  update(defaults);

  var pymChild = new pym.Child({
    renderCallback: render
  });

  d3.select(window).on('resize', render);

  model.on('change', update);

  var plexiglass = d3.select('.plexiglass');
  var close_modal = d3.select('.close-modal');

  var hideModal = function() {
    plexiglass
      .transition()
      .duration(300)
      .style('opacity', 0)
      .each('end', function(d, i) {
        if (!i) plexiglass.style('display', 'none');
      });
  };

  d3.select('#embed').on('click', function() {
    plexiglass
      .style('display', 'block')
      .transition()
      .duration(300)
      .style('opacity', 1);
    close_modal.on('click', hideModal);
  });

  plexiglass.on('click', hideModal);

  function render() {
    update(model.get(), true);
  }

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
    "Without ACA" : prepData(data, {
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
