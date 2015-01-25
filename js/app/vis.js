

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
var legend_name;
var area; //health board or local authority or...
var datatype;

var hospitals = {"Llandudno General Hospital": [53.311447, -3.827714], "Powys Teaching LHB MIUs": [52.008661, -3.259053], "Cwm Taf LHB MIUs": [51.636495, -3.450172], "Morriston Hospital": [51.684662, -3.935273], "Powys Teaching LHB MIUs": [52.008661, -3.259053], "Morriston Hospital": [51.684662, -3.935273], "Cwm Taf LHB MIUs": [51.636495, -3.450172], "Llandudno General Hospital": [53.311447, -3.827714], "Betsi Cadwaladr University LHB MIUs": [53.209002, -4.15959], "Aneurin Bevan LHB MIUs": [55.865604, -3.998619], "Princess Of Wales Hospital": [51.517463, -3.571647], "Ysbyty Glan Clwyd": [53.272107, -3.495894], "Aneurin Bevan LHB MIUs": [55.865604, -3.998619], "University Hospital Of Wales": [51.507018, -3.190343], "Prince Philip Hospital": [51.691615, -4.135931], "The Royal Glamorgan Hospital": [51.546934, -3.391817], "The Royal Glamorgan Hospital": [51.546934, -3.391817], "Bronglais General Hospital": [52.416036, -4.071668], "Wrexham Maelor Hospital": [53.046918, -3.008389], "Glangwili General Hospital": [51.868218, -4.28396], "Ysbyty Gwynedd": [53.209007, -4.15982], "Hywel Dda LHB MIUs": [51.877202, -4.582024], "Ysbyty Glan Clwyd": [53.272107, -3.495894], "Prince Charles Hospital": [51.763922, -3.385956], "Royal Gwent Hospital": [51.579779, -2.994478], "Betsi Cadwaladr University LHB MIUs": [53.209002, -4.15959], "Nevill Hall Hospital": [51.825082, -3.034565], "Withybush General Hospital": [51.812668, -4.965219], "Wrexham Maelor Hospital": [53.046918, -3.008389], "University Hospital Of Wales": [51.507018, -3.190343], "Ysbyty Ystrad Fawr": [51.63363, -3.235645], "Singleton Hospital": [51.609647, -3.985408], "Prince Philip Hospital": [51.691615, -4.135931], "Nevill Hall Hospital": [51.825082, -3.034565], "Cardiff and Vale University LHB MIUs": [51.449635, -3.203941], "Cardiff and Vale University LHB MIUs": [51.449635, -3.203941], "Bronglais General Hospital": [52.416036, -4.071668], "Hywel Dda LHB MIUs": [51.877202, -4.582024], "Prince Charles Hospital": [51.763922, -3.385956], "Ysbyty Gwynedd": [53.209007, -4.15982], "Glangwili General Hospital": [51.868218, -4.28396], "Princess Of Wales Hospital": [51.517463, -3.571647], "Neath Port Talbot Hospital": [51.599336, -3.800879], "Neath Port Talbot Hospital": [51.599336, -3.800879], "Ysbyty Ystrad Fawr": [51.63363, -3.235645], "Withybush General Hospital": [51.812668, -4.965219], "Singleton Hospital": [51.609647, -3.985408], "Royal Gwent Hospital": [51.579779, -2.994478]}

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
    legend_name = descriptor.attributes[0].name;

    // check what resolution of data we're dealing with
    if(area === "local_authority") {
        if(datatype !== "multivariate") {
            load_boundaries("json/topo/lad.json", "lad");    
        }
    } else if(area === "health_board") {
        if(datatype !== "multivariate") {
            load_boundaries("json/topo/lhb.json", "lhb");    
        }
    }
    if(descriptor.spath !== undefined) {
        spath = descriptor.spath;
        load_local_data(get_local_dataset(spath));
    } else {
        load_data(fpath)
    }
}

function load_local_data(dataset) {
    d = d3.csv.parse(dataset);
    log(d);
    var f = Object.getOwnPropertyNames(d[0]);
    var index = f.indexOf(area);
    if (index > -1) {
        f.splice(index, 1);
    }
    times = f;
    fields = f;
    data = d;
    draw_data(times[0]);
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
        for(var j = 0; j < fields.length; j++) {
            if(+data[i][fields[j]] > max) {
                max = +data[i][fields[j]];
            }
            if(+data[i][fields[j]] < min) {
                min = +data[i][fields[j]];
            }           
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

    if(width > 500) {
        var x_pos = 100;
    } else {
        var x_pos = 20;
    }

    legend.append("rect")
        .attr("x", x_pos)
        .attr("y", function(d, i){ return height/2 - (i*ls_h) - 2*ls_h;})
        .attr("width", ls_w)
        .attr("height", ls_h)
        .attr("class", function(d, i) { return quantize.range()[i]; })
        .style("opacity", 0.8);

    legend.append("text")
        .attr("x", x_pos + 22)
        .attr("y", function(d, i){ return height/2 - (i*ls_h) - ls_h - 4;})
        .text(function(d, i){ return quantize.invertExtent(quantize.range()[i])[0].toFixed(2) + "-" + quantize.invertExtent(quantize.range()[i])[1].toFixed(2); });

    legend.append("text")
        .attr("x", x_pos)
        .attr("y", height/4 - 40)
        .text(name);

    legend.append("text")
        .attr("x", x_pos)
        .attr("y", height/2)
        .text(legend_name);

}

function draw_hospitals() {
    d3.json("data/lookup/hospitals_latlong_lookup.json", function(json) {
        g.selectAll("path")
             .data(Object.keys(json))
           .enter().append("circle")
             .attr("r", 5)
             .style("fill", "#fff")
             .attr("transform", function(d) {return "translate(" + projection([json[d][1], json[d][0]]) + ")";})
            
        g.selectAll("path")
        .data(Object.keys(json))
           .enter().append("text")
            .attr("transform", function(d) {return "translate(" + projection([json[d][1], json[d][0]]) + ")";})
            .style("fill", "#ccc")
            .style("font-size", "0.6em")
            .text(function(d) { return d;});

     });
}

function draw_hospitals() {
  d3.json("data/lookup/hospitals_latlong_lookup.json", function(json) {
  // create paths for each region using the json data
  // and the geo path generator to draw the shapes
  //
  // paint region polygon elements
  g.selectAll("path")
      .data(Object.keys(json))
    .enter().append("rect")
      .attr("x", function (key) {json[key][1]})
      .attr("y", function (key) {json[key][0]})
      .attr("width", 10) 
      .attr("height", 10);
  }


  //
  // add text labels (region name) to regions
  regions_labels.selectAll("text")
    .data(json.features)
    .enter()
    .append("svg:text")
    .text(function(d){
        return d.properties.name_abbr;
    })
    .attr("x", function(d){
        right = path.bounds(d)[1][0]+2.0;
        // [​[left, bottom], [right, top]​]
        // API reference:
        //   https://github.com/mbostock/d3/wiki/Geo-Paths#bounds
        //   https://github.com/mbostock/d3/wiki/Geo-Paths#path_bounds
        // hard-code specific adjustments to some labels
        if(d.properties.name_abbr=="P-C-W"){
          right += 2;
        }
        return right;
    })
    .attr("y", function(d){
        cent = path.centroid(d)[1];
        // hard-code specific adjustments to some labels
        if($.inArray(d.properties.name_abbr, ["H-TW-SL", "P-C-W", "A-SS-R", "C-N-E", "M-SP-B"]) != -1) {
          cent += 8;
        }
        return cent;
    })
    .attr("text-anchor","middle")
    .attr('font-size','6pt');
  });
}

function draw_bar() {

    if(width > 500) {
        var margin_right = parseInt(d3.select('#control_panel').style("width"));    
    } else {
        var margin_right = 0;
    }
    

    var w = width - margin_right - 40;
    var h = height - 200;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, w], .1)

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([h, 0]);

    var color = d3.scale.ordinal()
        .range(["#2171B5", "#6BAED6", "#C6DBEF", "#F7FBFF"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));


  var fieldNames = d3.keys(data[0]).filter(function(key) { return key !== area; });

  data.forEach(function(d) {
    d.fields = fieldNames.map(function(name) { return {name: name, value: +d[name]}; });
  });

  x0.domain(data.map(function(d) { return d[area]; }));
  x1.domain(fieldNames).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(d.fields, function(d) { return d.value; }); })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (h) + ")")
      .call(xAxis)
      .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-45)" 
            });;

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 12)
      .attr("x", 0)
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
      .attr("y", function(d, i){ return h/4 - (i*48);})
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", w - 58)
      .attr("y", function(d, i){ return h/4 - (i*44);})
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
        draw_hospitals(); 
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


