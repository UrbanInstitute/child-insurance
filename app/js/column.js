/*
  column chart with wire overlay
*/


var d3 = require('../lib/d3.js');


function ColumnChart(opts) {
  this.opts = opts;
  this.container = opts.container;
  this.rendered = false;
}

ColumnChart.prototype.update = function(data) {
  data = this.data = data || this.data;
  if (!this.rendered) return this.render(data);

  return this;
};

ColumnChart.prototype.render = function(data) {

  this.rendered = true;

  var con = this.container;
  var bb = con.node().getBoundingClientRect();
  var m = this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
  var w = this.width = bb.width - m.left - m.right;
  var h = this.height = bb.height - m.top - m.bottom;

  var svg = this.svg = con.append('svg')
      .attr('width', w + m.left + m.right)
      .attr('height', h + m.top + m.bottom)
    .append('g')
      .attr('transform', 'translate(' + m.left + ',' + m.top + ')');

  this.x = d3.scale.linear();

  this.x_axis_g = svg.append('g');
  this.y_axis_g = svg.append('g');
  this.bars = svg.append('g');
  data = this.data = data || this.data;

  return this.update(data);
};


module.exports = ColumnChart;