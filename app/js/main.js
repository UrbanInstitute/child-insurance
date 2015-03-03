/*
  Main function calls
  @bsouthga
  03/02/15
*/


// Vendor dependencies
var d3 = require('../lib/d3.js'),
    pym = require('../lib/pym.js');

// Urban Scripts
var ColumnChart = require('./column.js');


/*
  Initialize Column Charts
*/
var marketChart = new ColumnChart({
  "container" : d3.select("#market-place")
});



