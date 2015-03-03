/*
  column chart with wire overlay
*/


var d3 = require('../lib/d3.js');


function ColumnChart(opts) {
  this.opts = opts;
  this.container = opts.container;
  this.rendered = false;
}

ColumnChart.prototype.update = function(bar_data, line_data) {
  bar_data = this.bar_data = bar_data || this.bar_data;
  if (!this.rendered) return this.render(bar_data, line_data);
  var y = this.y;
  var h = this.height;
  this.bars.data(bar_data)
    .select('.bar')
    .transition()
    .duration(300)
    .attr('y', function(d) { return y(Number(d.rate)); })
    .attr('height', function(d) { return h - y(Number(d.rate)); });

  return this;
};


ColumnChart.prototype.render = function(bar_data, line_data) {

  bar_data = this.bar_data = bar_data || this.bar_data;
  line_data = this.line_data = line_data || this.line_data;

  this.rendered = true;

  var con = this.container;
  var bb = con.node().getBoundingClientRect();
  var m = this.margin = { top: 10, right: 10, bottom: 20, left: 65 };
  var w = this.width = bb.width - m.left - m.right;
  var h = this.height = bb.height - m.top - m.bottom;

  var svg = this.svg = con.html('').append('svg')
      .attr('width', w + m.left + m.right)
      .attr('height', h + m.top + m.bottom)
    .append('g')
      .attr('transform', 'translate(' + m.left + ',' + m.top + ')');

  var y = this.y = d3.scale.linear()
    .range([h, 0])
    .domain([0, 0.2]);

  // calculate widths for bar chart
  var barWidths = this.barWidths = bar_data.map(function(r) {
    return Number(r.weight)*w;
  });

  this.bars = svg.append('g')
    .selectAll('g')
    .data(bar_data)
    .enter().append('g')
      .attr("transform", function(d, i) {
        var pad = 0;
        while(i--) {
          pad += barWidths[i];
        }
        return "translate(" + pad + ",0)";
      });

  this.bars.append('rect')
    .attr('class', 'bar')
    .attr('width', function(d, i) {return (barWidths[i] - 2) + 'px';});

  var pct = d3.format('.1%');
  this.bars.append('text')
    .attr('class', 'axis-text')
    .text(function(d) { return pct(Number(d.weight)); })
    .attr('y', function() {
      var bb = this.getBBox();
      return bb.height + h;
    })
    .attr('x', function(d, i) {
      var bb = this.getBBox();
      return barWidths[i]/2 - bb.width/2;
    });

  for (var title in line_data) {
    this.addLine(line_data[title], title);
  }

  return this.update(bar_data);
};


ColumnChart.prototype.addLine = function(line_data, text) {

  var y = this.y;
  var barWidths = this.barWidths;

  var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

  // generate line data using bar widths
  var line_points = [];
  line_data.forEach(function(p, i) {
    var width = barWidths[i] - 2;
    var pad = 0;
    while(i--) {
      pad += barWidths[i];
    }
    line_points.push({x : pad, y : y(Number(p.rate))});
    line_points.push({x : pad + width, y : y(Number(p.rate))});
  });

  this.svg.append('g').append('path')
    .datum(line_points)
    .attr('class', 'line')
    .attr('d', line);

  this.svg.append('text')
    .attr('class', 'line-title')
    .text(text)
    .attr('y', function() {
      var bb = this.getBBox();
      return line_points[0].y + bb.height/4;
    })
    .attr('x', function() {
      var bb = this.getBBox();
      return -bb.width - 5;
    });

};


module.exports = ColumnChart;