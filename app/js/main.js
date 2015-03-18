/*
  Main function calls
  @bsouthga
  03/02/15
*/

// Vendor dependencies
var d3 = require("../lib/d3.js"),
    pym = require("../lib/pym.js");

// Urban Scripts
var ColumnChart = require("./column.js"),
    loadCSVs = require("./load.js"),
    events = require("./events.js");
    tooltip = require("./tooltip.js")();

var defaults = urlParameters({
  "king" : "False",
  "scenario" : "current",
  "aca" : "True"
});

loadCSVs(["data/states.csv", "data/incomes.csv"], ready);

/*
  Override defaults with url parameters
*/
function urlParameters(defaults) {
  var query = location.search.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  for (var k in defaults) {
    if (k in result) {
      defaults[k] = result[k];
    }
  }
  return defaults;
}

function buildParameters(settings) {
  var p = [];
  for (var v in settings) {
    p.push(v + '=' + settings[v]);
  }
  return p.join('&');
}


function ready(e, data) {

  var states = data["data/states.csv"];
  var incomes = data["data/incomes.csv"];

  // Y domain for both charts
  var domain = [0, Math.max(
    d3.max(incomes, function(d) {return Number(d.rate);}),
    d3.max(states, function(d) {return Number(d.rate);})
  )*1.1];

  // model starting with defaults
  var model = events(defaults).on('change', update);
  var embed_modal = d3.select('#embed-modal');
  var about_modal = d3.select('#about-modal');

  var stateChart = new ColumnChart({
    "container" : d3.select("#states"),
    "tooltip" : tooltip,
    "title" : "Marketplace",
    "domain" : domain,
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
          "text" : "States with separate CHIP program"
        },
        "False" : {
          "color" : "rgb(27,109,142)",
          "text" : "States without separate CHIP program"
        }
      }
    },
    "xAxisRows" : [
      {
        "format" : d3.format(".1%"),
        "variable" : "weight",
        "text" : 'of children'
      }
    ]
  });

  var incomeChart = new ColumnChart({
    "container" : d3.select("#incomes"),
    "tooltip" : tooltip,
    "title" : "Income Level",
    "domain" : domain,
    "xAxisRows" : [
      {
        "format" : d3.format(".1%"),
        "variable" : "weight",
        "text" : 'of children'
      },
      {
        "variable" : "col_name",
        "text" : 'of FPL'
      }
    ]
  });

  /*
    Render charts with default settings
  */
  update(defaults);


  var pymChild = new pym.Child({
    renderCallback: render
  });

  /*
    bind modal behavior
  */
  d3.select('#about').on('click', function() {
    modalToggle(about_modal);
  });


  d3.select('#embed').on('click', function() {
    d3.select('#code-example').html(
      '&lt;script src="http://datatools.urban.org/features/embed.js"' +
      'data-viz="childrens-health-coverage-at-risk?' +
      buildParameters(model.get()) +
      '"&gt;&lt;/script&gt;'
    );
    modalToggle(embed_modal);
  });


  function modalToggle(modal) {
    var close_modal = modal.select('.close-modal');
    showModal(modal);
    close_modal.on('click', hideModal(modal));
  }

  function hideModal(modal) {
    return function() {
      modal
        .transition()
        .duration(300)
        .style('opacity', 0)
        .each('end', function(d, i) {
          if (!i) modal.style('display', 'none');
        });
    };
  }

  function showModal(modal) {
    modal
      .style('display', 'block')
      .transition()
      .duration(300)
      .style('opacity', 1);
  }

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
