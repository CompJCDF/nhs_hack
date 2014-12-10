
function change_area() {
    d3.select('#download').html("");
    var resolution_select = document.getElementById('resolution');
    units = resolution_select.options[resolution_select.selectedIndex].value;

    var f = 'json/topo_' + units + '.json';
    d3.select('#download').attr('href', f).attr('target', '_blank').text('download topoJSON');
    load_data(f, units);
}

d3.select("#resolution").on('change', function(){
    change_area();
});

change_area();

