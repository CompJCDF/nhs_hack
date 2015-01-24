

// get the width of the area we're displaying in
var width;
// but we're using the full window height
var height;

// variables for map drawing
var projection, svg, path, g;
var boundaries, units;
var margin;

var times = [];
var data;

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
        if(lhb_lookup.LHBNM === name){
            return lhb_lookup.LHBCD;
        }
    }   
}

var rateById = d3.map();

var quantize = d3.scale.quantize()
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

function new_data(descriptor) {
    fpath = descriptor.fpath;
    type = descriptor.mapdesc.type;
    if(type === "local_authority") {
        load_boundaries("json/topo/lad.json", "lad");
        load_lad_data(fpath);
    } else if(type === "local_health_board") {
        load_boundaries("json/topo/lhb.json", "lhb");
    }
    
}

function load_lad_data(data_file) {
    d3.csv(data_file, function(d) {
        var fields = Object.getOwnPropertyNames(d[0]);
        var index = fields.indexOf("local_authority");
        if (index > -1) {
            fields.splice(index, 1);
        }
        times = fields;
        data = d;
        log(times);
        draw_data(times[0]);
    });
}

function draw_data(year) {
    max = 0;
    min = data[0][year]; 
    
    for(var i = 0; i < data.length; i++) {
        lad = lad_lookup_by_name(data[i].local_authority);
        if(+data[i][year] > max) {
            max = +data[i][year];
        }
        if(+data[i][year] < min) {
            min = +data[i][year];
        }
        rateById.set(lad, +data[i][year]);
        quantize.domain([min, max]);
    }
}


function get_times() {
     return times;
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
/*
// select a map area
function select(d) {
    // get the id of the selected map area
    var id = "#" + d.id;
    // remove the selected class from any other selected areas
    d3.selectAll(".selected")
        .attr("class", "area")
        .attr("class", function(d) { return quantize(rateById.get(d.id)); })
    // and add it to this area
    d3.select(id)
        .attr("class", "selected area")
}
*/

// draw our map on the SVG element
function draw(boundaries) {

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
    /*
      var legend = svg.selectAll("g.legend")
        .data(rateById.values())
        .enter().append("g")
        .attr("class", "legend");

      var ls_w = 20, ls_h = 20;

      legend.append("rect")
      .attr("x", 20)
      .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
      .attr("width", ls_w)
      .attr("height", ls_h)
      .attr("class", function(d, i) { return quantize(rateById.values()[i]); })
      .style("opacity", 0.8);

      legend.append("text")
      .attr("x", 50)
      .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;});
      //.text(function(d, i){ return legend_labels[i]; });
    */
}

// called to redraw the map - removes map completely and starts from scratch
function redraw() {
    compute_size();

    d3.select("svg").remove();

    init(width, height);
    draw(boundaries);
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


