
var d3 = require('../lib/d3.js');


function windowScrollTop() {
  return (window.pageYOffset !== undefined) ?
          window.pageYOffset :
          (document.documentElement ||
           document.body.parentNode ||
           document.body).scrollTop;
}

function tooltip() {

  var tt = d3.select('#tooltip');
  var self = {
    position: position,
    text : text,
    classed : tt.classed.bind(tt)
  };

  // center tooltip above svg node
  function position(node, svg, no_transition) {

    var x, y, ctm, c_Y, c_X,
        scrollTop, p, width,
        nw, nx, svgw, svgh,
        tt_bb, svg_bb, node_bb,
        node_width, node_heigth;

    if (node) {

      scrollTop = windowScrollTop();
      node_bb = node.getBBox ? node.getBBox() : node.getBoundingClientRect();
      tt_bb = tt.node().getBoundingClientRect();
      ctm = node.getScreenCTM ? node.getScreenCTM() : {e : 0, f : 0};
      c_X = ctm.e;
      c_Y = ctm.f;
      svg_bb = svg ? svg.getBoundingClientRect() : {
        width : Infinity, height: Infinity
      };
      nw = node_bb.width;
      nx = (node_bb.x !== undefined ? node_bb.x : node_bb.left);
      ny = (node_bb.y !== undefined ? node_bb.y : node_bb.top);
      svgw = svg_bb.width;
      svgh = svg_bb.height;

      // bound node width by width of container
      // svg element. Used to prevent bar tooltips
      // from appearing off screen for long bars
      if ( (nx >= 0) && (nw > svgw/2) ) {
        node_width = svgw/2;
      } else if ( (nx <= 0) && (nw > svgw/2) ) {
        // if the node x coordinate is negative,
        // we need to add it into the width
        node_width = Math.abs(nx)*2 + svgw/2;
      } else if ( (nx === 0) && (nw > svgw) ) {
        node_width = svgw;
      } else {
        node_width = nw;
      }

      node_height = Math.max(-5, Math.min(ny, svgh));

      /*
        c_X = svg X offset relative to window
        node_bb.x || node_bb.left = node X offset relative to svg
        node_width = width of svg node
        tt_bb.width = width of tooltip div
      */
      x = (
        c_X
        + nx
        + node_width/2
        - tt_bb.width/2
      );

      /*
        c_Y = svg Y offset relative to window
        node_bb.y = node Y offset relative to svg
        tt_bb.height = height of tooltip div
        scrollTop = current offset of window top
      */
      y = (
        c_Y
        + node_height
        - tt_bb.height
        + scrollTop
        - 10 // extra 10 pixels to padd for tooltip arrow
      );

    } else {
      // move off screen otherwise
      x = y = -9999;
    }

    console.log(x, y);

    // absolutely position tooltip
    var pos = {
      'top' : y + 'px',
      'left' : x + 'px'
    };

    // if hiding / showing transition must
    // come before / after style
    if (no_transition) {
      tt.style(pos).style('opacity', node ? 1 : 0);
    } else {
      if (node) {
        tt.style(pos)
          .style('opacity', 0)
          .transition()
          .duration(100)
          .style('opacity', 1);
      } else {
        tt.transition()
          .duration(100)
          .style('opacity', 0)
          .each('end', function(d, i) {
            if (!i) tt.style(pos);
          });
      }
    }


    return this;
  }

  function text(data) {
    tt.html(data);
    return this;
  }

  return self;
}

module.exports = tooltip;