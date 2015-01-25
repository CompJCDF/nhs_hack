

// get the width of the area we're displaying in
var width;
// but we're using the full window height
var height;

// variables for drawing
var svg, g;
var margin;

// variables for map drawing
var projection, path;
var boundaries, units;

// data variables
var fields = [];
var data;

// data descriptors
var name;
var area; //health board or local authority or...
var datatype;

var lad_lookup = [{"LAD12NM": "Isle of Anglesey", "LAD12CD": "W06000001"}, {"LAD12NM": "Gwynedd", "LAD12CD": "W06000002"}, {"LAD12NM": "Conwy", "LAD12CD": "W06000003"}, {"LAD12NM": "Denbighshire", "LAD12CD": "W06000004"}, {"LAD12NM": "Flintshire", "LAD12CD": "W06000005"}, {"LAD12NM": "Wrexham", "LAD12CD": "W06000006"}, {"LAD12NM": "Powys", "LAD12CD": "W06000023"}, {"LAD12NM": "Ceredigion", "LAD12CD": "W06000008"}, {"LAD12NM": "Pembrokeshire", "LAD12CD": "W06000009"}, {"LAD12NM": "Carmarthenshire", "LAD12CD": "W06000010"}, {"LAD12NM": "Swansea", "LAD12CD": "W06000011"}, {"LAD12NM": "Neath Port Talbot", "LAD12CD": "W06000012"}, {"LAD12NM": "Bridgend", "LAD12CD": "W06000013"}, {"LAD12NM": "The Vale of Glamorgan", "LAD12CD": "W06000014"}, {"LAD12NM": "Rhondda Cynon Taf", "LAD12CD": "W06000016"}, {"LAD12NM": "Merthyr Tydfil", "LAD12CD": "W06000024"}, {"LAD12NM": "Caerphilly", "LAD12CD": "W06000018"}, {"LAD12NM": "Blaenau Gwent", "LAD12CD": "W06000019"}, {"LAD12NM": "Torfaen", "LAD12CD": "W06000020"}, {"LAD12NM": "Monmouthshire", "LAD12CD": "W06000021"}, {"LAD12NM": "Newport", "LAD12CD": "W06000022"}, {"LAD12NM": "Cardiff", "LAD12CD": "W06000015"}];
var lhb_lookup = [{"LHBCD": "W11000023", "LHBNM": "Betsi Cadwaladr University"}, {"LHBCD": "W11000024", "LHBNM": "Powys Teaching"}, {"LHBCD": "W11000025", "LHBNM": "Hywel Dda"}, {"LHBCD": "W11000026", "LHBNM": "Abertawe Bro Morgannwg University"}, {"LHBCD": "W11000029", "LHBNM": "Cardiff and Vale University"}, {"LHBCD": "W11000027", "LHBNM": "Cwm Taf"}, {"LHBCD": "W11000028", "LHBNM": "Aneurin Bevan"}];

function lad_lookup_by_name(name) {
    for(var i = 0; i < lad_lookup.length; i++) {
        if(lad_lookup[i].LAD12NM === name){
            return lad_lookup[i].LAD12CD;
        }
    }
}

function lhb_lookup_by_name(name) {
    for(var i = 0; i < lhb_lookup.length; i++) {
        if(lhb_lookup[i].LHBNM === name){
            return lhb_lookup[i].LHBCD;
        }
    }   
}

var rateById = d3.map();

var quantize = d3.scale.quantize()
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));


// add new data to the visualisation
function new_data(descriptor) {
    d3.select("svg").remove();
    // extract the descriptors
    fpath = descriptor.fpath;
    area = descriptor.mapdesc.type;
    name = descriptor.name;
    datatype = descriptor.data_type;

    // check what resolution of data we're dealing with
    if(area === "local_authority") {
        if(datatype !== "multivariate") {
            load_boundaries("json/topo/lad.json", "lad");    
        }
        load_data(fpath);
    } else if(area === "health_board") {
        if(datatype !== "multivariate") {
            load_boundaries("json/topo/lhb.json", "lhb");    
        }
        load_data(fpath);
    }
}

function load_data(data_file) {
    d3.csv(data_file, function(d) {
        var f = Object.getOwnPropertyNames(d[0]);
        var index = f.indexOf(area);
        if (index > -1) {
            f.splice(index, 1);
        }
        times = f;
        fields = f;
        data = d;
        draw_data(times[0]);
    });   
}

function draw_data(field) {
    max = 0;
    min = data[0][field]; 
    
    for(var i = 0; i < data.length; i++) {
        if (area === "local_authority") {
            key = lad_lookup_by_name(data[i][area]);
        } else if (area === "health_board") {
            key = lhb_lookup_by_name(data[i][area])
        }
        if(+data[i][field] > max) {
            max = +data[i][field];
        }
        if(+data[i][field] < min) {
            min = +data[i][field];
        }
        rateById.set(key, +data[i][field]);
        quantize.domain([min, max]);
    }
    redraw();
}

function get_fields() {
     return fields;
}

function set_time(year) {
    draw_data(year);
}

function compute_size() {
    margin = parseInt(d3.select("header").style("height"));
    width = parseInt(d3.select("#map").style("width"));
    height = parseInt(d3.select("#map").style("height"));
}

compute_size();
// initialise the map
init(width, height);


// remove any data when we lose selection of a map unit
function deselect() {
    d3.selectAll(".selected")
        .attr("class", "area"); 
    d3.select("#data_table")
        .html("");      
}


function init(width, height) {

    // pretty boring projection
    projection = d3.geo.albers()
        .rotate([0, 0]);

    path = d3.geo.path()
        .projection(projection);

    // create the svg element for drawing onto
    svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    // graphics go here
    g = svg.append("g").attr("x", 0);

    // add a white rectangle as background to enable us to deselect a map selection
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#72BBBF")
        //.on('click', deselect);
}


// draw our map on the SVG element
function draw_map() {

    projection
        .scale(1)
        .translate([0,0]);

    // compute the correct bounds and scaling from the topoJSON
    var b = path.bounds(topojson.feature(boundaries, boundaries.objects[units]));
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    
    projection
        .scale(s)
        .translate(t);

    // add an area for each feature in the topoJSON
    g.selectAll(".area")
        .data(topojson.feature(boundaries, boundaries.objects[units]).features)
        .enter().append("path")
        .attr("class", "area")
        .attr("class", function(d) { return quantize(rateById.get(d.id)); })
        .attr("id", function(d) {return d.id})
        .attr("d", path)
        //.on("click", function(d){ return select(d)});

    // add a boundary between areas
    g.append("path")
        .datum(topojson.mesh(boundaries, boundaries.objects[units], function(a, b){ return a !== b }))
        .attr('d', path)
        .attr('class', 'boundary');

    var legend = svg.selectAll("g.legend")
        .data(quantize.range())
        .enter().append("g")
        .attr("class", "legend");

    var ls_w = 20, ls_h = 20;

    legend.append("rect")
        .attr("x", 100)
        .attr("y", function(d, i){ return height/2 - (i*ls_h) - 2*ls_h;})
        .attr("width", ls_w)
        .attr("height", ls_h)
        .attr("class", function(d, i) { return quantize.range()[i]; })
        .style("opacity", 0.8);

    legend.append("text")
        .attr("x", 140)
        .attr("y", function(d, i){ return height/2 - (i*ls_h) - ls_h - 4;})
        .text(function(d, i){ return quantize.invertExtent(quantize.range()[i])[0].toFixed(2) + "-" + quantize.invertExtent(quantize.range()[i])[1].toFixed(2); });

    legend.append("text")
        .attr("x", 120)
        .attr("y", height/2)
        .text(name);
}

function draw_bar() {

    var margin_right = parseInt(d3.select('#control_panel').style("width"));
    var w = width - margin_right - 20;
    var h = height - 30;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, w], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([h, 0]);

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

log(width);
log(height);

  var fieldNames = d3.keys(data[0]).filter(function(key) { return key !== area; });

  data.forEach(function(d) {
    d.fields = fieldNames.map(function(name) { return {name: name, value: +d[name]}; });
  });

  x0.domain(data.map(function(d) { return d[area]; }));
  x1.domain(fieldNames).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(d.fields, function(d) { return d.value; }); })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", 12)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Number of Patients");

  var region = svg.selectAll(".region")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d[area]) + ",0)"; });

  region.selectAll("rect")
      .data(function(d) { return d.fields; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return h - y(d.value); })
      .style("fill", function(d) { return color(d.name); });

  var legend = svg.selectAll(".legend")
      .data(fieldNames.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", w - 40)
      .attr("y", function(d, i){ return h/2 - (i*48);})
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", w - 58)
      .attr("y", function(d, i){ return h/2 - (i*48);})
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

}

// called to redraw the map - removes map completely and starts from scratch
function redraw() {
    compute_size();

    d3.select("svg").remove();

    init(width, height);
    if (datatype === "timeseries") {
        draw_map();    
    }
    else if (datatype === "multivariate") {
        draw_bar()
    }
    
}

// loads data from the given file and redraws the map
function load_boundaries(filename, u) {
    // clear any selection
    deselect();

    units = u;
    var f = filename;

    d3.json(f, function(error, b) {
        if (error) return console.error(error);
        boundaries = b;
        redraw();
    });    
}

// when the window is resized, redraw the map
window.addEventListener('resize', redraw);
load_boundaries("json/topo/lhb.json", "lhb")


