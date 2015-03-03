/*
  column chart with wire overlay
*/


var d3 = require('../lib/d3.js');


function ColumnChart(opts) {
  this.opts = opts;
  this.container = opts.container;
  this.rendered = false;
}


/*
  update bar heights and label positions
*/
ColumnChart.prototype.update = function(bar_data, line_data) {
  bar_data = this.bar_data = bar_data || this.bar_data;
  if (!this.rendered) return this.render(bar_data, line_data);

  var y = this.y;
  var h = this.height;
  var barWidths = this.barWidths;
  var pct = d3.format('%');
  var pop = d3.format('s');
  duration = 300;

  this.bars.data(bar_data).select('.bar')
    .transition()
    .duration(duration)
    .attr('y', function(d) { return y(Number(d.rate)); })
    .attr('height', function(d) { return h - y(Number(d.rate)); });

  this.bars.select('.bar-label')
    .text(function(d) { return pct(Number(d.rate)); })
    .transition()
    .duration(duration)
    .attr('y', function(d) {
      var bb = this.getBBox();
      return y(Number(d.rate)) + bb.height + 2;
    })
    .attr('x', function(d, i) {
      var bb = this.getBBox();
      return barWidths[i]/2 - bb.width/2;
    });

  return this;
};


/*
  completely (re)render the chart
*/
ColumnChart.prototype.render = function(bar_data, line_data) {

  var self = this;

  bar_data = this.bar_data = bar_data || this.bar_data;
  line_data = this.line_data = line_data || this.line_data;

  this.rendered = true;

  var con = this.container;
  var bb = con.node().getBoundingClientRect();
  var m = this.margin = { top: 10, right: 10, bottom: 40, left: 80 };
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
        var pad = self.barPad(i);
        return "translate(" + pad + ",0)";
      });

  this.bars.append('rect')
    .attr('class', 'bar')
    .attr('width', function(d, i) {return (barWidths[i] - 2) + 'px';});

  var pct = d3.format('.1%');
  var maxTextHeight = 0;
  this.bars.append('text')
    .attr('class', 'axis-text')
    .text(function(d) { return pct(Number(d.weight)); })
    .attr('y', function() {
      var t_height = this.getBBox().height;
      if (t_height > maxTextHeight) maxTextHeight = t_height;
      return t_height + h;
    })
    .attr('x', function(d, i) {
      var bb = this.getBBox();
      return barWidths[i]/2 - bb.width/2;
    });
  this.maxTextHeight = maxTextHeight;

  svg.append('text')
    .attr('class', 'line-title')
    .text('Share of all children')
    .attr('y', h + maxTextHeight)
    .attr('x', function() {
      return 20 - this.getBBox().width;
    });


  svg.append('text')
    .attr('class', 'chart-title')
    .text(this.opts.title)
    .attr('y', function() {
      return this.getBBox().height;
    })
    .attr('x', function() {
      return (w - this.getBBox().width) / 2;
    });

  this.bars.append('text')
    .attr('class', 'bar-label');

  for (var title in line_data) {
    this.addLine(line_data[title], title);
  }

  if (this.opts.brackets) {
    this.opts.brackets.forEach(function(b) {
      self.axisBracket(b.extent, b.title);
    });
  }

  return this.update(bar_data);
};


/*
  add a column outline for a given set of points
*/
ColumnChart.prototype.addLine = function(line_data, text) {

  var self = this;

  var y = this.y;
  var barWidths = this.barWidths;

  var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

  // generate line data using bar widths
  var line_points = [];
  line_data.forEach(function(p, i) {
    var width = barWidths[i] - 2;
    var pad = self.barPad(i);
    line_points.push({x : pad - 1, y : y(Number(p.rate))});
    line_points.push({x : pad + 1 + width, y : y(Number(p.rate))});
  });

  this.svg.append('g').append('path')
    .datum(line_points)
    .attr('class', 'line')
    .attr('d', line);

  if (text) {
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
  }

};


ColumnChart.prototype.barPad = function(barIndex) {
  var barWidths = this.barWidths;
  var pad = 0;
  while(barIndex--) pad += barWidths[barIndex];
  return pad;
};


ColumnChart.prototype.axisBracket = function(barIndexRange, text) {

  var svg = this.svg;
  var pad = 5;
  var h = this.height + this.maxTextHeight + 3;
  var extent = barIndexRange.map(this.barPad.bind(this));

  // constrict range of bracket
  extent[0] += 5;
  extent[1] -= 5;

  var ext_width = extent[1] - extent[0];
  var bracketPoints = [
    {"x" : extent[0], y : h},
    {"x" : extent[0], y : h + pad},
    {"x" : extent[1], y : h + pad},
    {"x" : extent[1], y : h},
  ];

  var line = d3.svg.line()
    .interpolate('basis')
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

  svg.append('g').append('path')
    .datum(bracketPoints)
    .attr('class', 'bracket')
    .attr('d', line);

  svg.append('text')
    .attr('class', 'bracket-title')
    .text(text)
    .attr('y', function() {
      var height = this.getBBox().height;
      return height + h + pad;
    })
    .attr('x', function() {
      var width = this.getBBox().width;
      return extent[0] + ext_width/2 - width/2;
    });

};

module.exports = ColumnChart;