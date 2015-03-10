
var d3 = require('../lib/d3.js');

function controller(defaults) {

  var model = defaults || {};

  var dispatch = d3.dispatch('change');
  var king_toggle = d3.selectAll('#king-toggle .option');
  var scenario_toggle = d3.selectAll('#scenarios .urban-button');

  // set buttons to given defaults
  updateKing(model);
  updateScenario(model);

  // register button click events
  king_toggle.on('click', function() {
    model.king = this.id;
    updateKing(model);
    dispatch.change(model);
  });

  scenario_toggle.on('click', function() {
    model.scenario = this.id;
    updateScenario(model);
    dispatch.change(model);
  });

  function updateKing(model) {
    king_toggle.classed('selected', function() {
      return model.king === this.id;
    });
  }

  function updateScenario(model) {
    scenario_toggle.classed('selected', function() {
      return model.scenario === this.id;
    });
  }

  return {
    on : function() {
      dispatch.on.apply(dispatch, [].slice.call(arguments));
      return this;
    },
    get : function() { return model; }
  };
}

module.exports = controller;