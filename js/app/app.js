var ui = {
    controls_opener: null,
    control_panel: null,
    data_sets: null,
    timeline: null,
    timeline_slider: null,
    hospital_toggle: null,
    map: null,
    config_opener: null,
    config_overlay: null,
    store_data: null,
    config_closer: null,
    json_field: null,
    csv_field: null
};

var net = {
    get : function(url, callback){
        log("getting "+url);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true); 
        xhr.onreadystatechange=function(){
            if(xhr.readyState==4 && xhr.status==200){
                return callback(JSON.parse(xhr.responseText));
            }
            if(xhr.readyState==4 && xhr.status!=200){
                return callback({error:true});
            }
        }; 
        xhr.send();   
    }
};

var data_sets = [];
var times = [];
var time = 0;

function log(text){
    console.log(text);
}

function init_ui(){
    ui.controls_opener = document.getElementById("controls_opener");
    ui.control_panel = document.getElementById("control_panel");
    ui.data_sets = document.getElementById("data_sets");
    ui.timeline = document.getElementById("timeline");
    ui.timeline_slider = timeline.getElementsByTagName("div")[0];
    ui.map = document.getElementById("map");
    ui.config_opener = document.getElementById("add_data");
    ui.config_overlay = document.getElementById("config_overlay");
    ui.store_data = document.getElementById("store_data");
    ui.config_closer = document.getElementById("close_config");
    ui.json_field = document.getElementById("descriptor");
    ui.csv_field = document.getElementById("csv_data");
    ui.hospital_toggle = document.getElementById("show_hospitals");
    if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        toggle_controls(); 
    }
}

function bind_listeners(){
    ui.controls_opener.onclick = toggle_controls;
    ui.config_opener.onclick = toggle_config;
    ui.config_closer.onclick = toggle_config;
    ui.store_data.onclick = store_data;
}

function store_data(){
    var json = ui.json_field.value;
    var csv = ui.csv_field.value;
    
    var id = parseInt(new Date().getTime());
    var descriptor = JSON.parse(json);
    descriptor.spath = id;
    var stored_descriptors = localStorage.local_descriptors;
    var stored_data = localStorage.local_data;

    try{
        stored_descriptors = JSON.parse(stored_descriptors);
    }catch(err){stored_descriptors = [];}
    try{
        stored_data = JSON.parse(stored_data);
    }catch(err){stored_data = [];}

    stored_descriptors.push(descriptor);
    var data = {};
    data.id = id;
    data.csv = csv;
    stored_data.push(data);
    localStorage.local_data = JSON.stringify(stored_data);   
    localStorage.local_descriptors = JSON.stringify(stored_descriptors); 
    toggle_config();
    load_metadata();
}

function delete_local_dataset(id){
    var stored_descriptors = localStorage.local_descriptors;
    try{
        stored_descriptors = JSON.parse(stored_descriptors);
    }catch(err){stored_descriptors = [];}

    var stored_data = localStorage.local_data;
    try{
        stored_data = JSON.parse(stored_data);
    }catch(err){stored_data = [];}
 
    var new_descriptors = []; var new_data = [];
    for(var i = 0; i < stored_descriptors.length; i++){
        if(stored_descriptors[i].spath != id){
            new_descriptors.push(stored_descriptors[i]);
        }
    }
    for(var i = 0; i < stored_data.length; i++){
        if(stored_data[i].id != id){
            new_data.push(stored_data[i]);
        }
    }
    localStorage.local_descriptors = JSON.stringify(new_descriptors);
    localStorage.local_data = JSON.stringify(new_data);
    load_metadata();
}

function get_local_dataset(id){
    var stored_data = localStorage.local_data;
    try{
        stored_data = JSON.parse(stored_data);
    }catch(err){return null;}
    
    for(var i = 0; i < stored_data.length; i++){
        if(stored_data[i].id == id){
            return stored_data[i].csv;
        }
    }
    return null;
}

function load_metadata(){
    ui.data_sets.innerHTML = "";
    data_sets = [];

    var local_descriptors = localStorage.local_descriptors;
    try{
        local_descriptors = JSON.parse(local_descriptors);
    }catch(err){local_descriptors = [];}
 
    for(var i = 0; i < local_descriptors.length; i++){
        data_sets.push(local_descriptors[i]);        
    }

    net.get("data/descriptors.json", function(data){
        if(data.error != true){
            for(var i = 0; i < data.length; i++){
                data_sets.push(data[i]);
            }
        }
        log(data_sets);

        for(var i = 0; i < data_sets.length; i++){data_sets[i].id = i+1;}

        for(var i = 0; i < data_sets.length; i++){
            var e = "<li id='set_"+data_sets[i].id+"' >";
            e+='<span class="name" onclick="load_set('+data_sets[i].id+');">'+data_sets[i].name+"</span>";
            e+='<span class="source">'+data_sets[i].attribution_desc+"</span>";
            e+='<span class="org"><a href="'+data_sets[i].attribution_url+'" target="_blank">'+data_sets[i].attribution_org+"</a></span>";
            e+='<span class="type background '+data_sets[i].data_type+'">'+data_sets[i].data_type;
            if(data_sets[i].spath != undefined){
                e+='<span class="delete" onclick="delete_local_dataset('+data_sets[i].spath+');"></span>';
            }
            e+= '</span>';

            ui.data_sets.innerHTML += e+"</lI>";
        }
    });  
    
}

function load_set(set_id){
    var set = null;
    for(var i = 0; i < data_sets.length; i++){
        if(data_sets[i].id == set_id){
            set=data_sets[i];
            if(document.getElementById("set_"+set.id).className.indexOf("ticked")>-1){return;}
            add_class(document.getElementById("set_"+set.id), "ticked");
        }
        else{
            remove_class(document.getElementById("set_"+data_sets[i].id), "ticked");
        }
    }
    if(set.data_type == "timeseries"){
        show_hospital_toggle();
        show_timeline();       
    }   
    else if(set.data_type == "multivariate"){
        hide_hospital_toggle();
        hide_timeline();
    }
    else if(set.data_type == "univariate"){
        show_hospital_toggle();
        hide_timeline();
    }
    new_data(set);
}

function show_timeline(){
    if(ui.timeline.className.indexOf("shown") == -1){
        times = get_fields();
        ui.timeline_slider.style.left = "100%";
        setTimeout(function(){
            // Give time for times to load
            ui.timeline_slider.innerHTML = times[times.length-1];
        },500);
        time = 0;
        add_class(ui.timeline, "shown"); 
        ui.timeline.onclick = function(event){
            var rect = ui.timeline.getBoundingClientRect();
            if(event.pageX > rect.left-25 && event.pageX < rect.right-25){
                ui.timeline_slider.style.left = event.pageX-25+"px"; 
                calculate_time(event);
            }
        };
        var flag = -1;
        ui.timeline.addEventListener("mousedown", function(){
            flag = 0;
        }, false);
        document.addEventListener("mousemove", function(event){
            if(flag == 0){
                var rect = ui.timeline.getBoundingClientRect();
                if(event.pageX > rect.left-25 && event.pageX < rect.right-25){
                    ui.timeline_slider.style.left = event.pageX-25+"px"; 
                    calculate_time(event);
                }
            }
        }, false);
        document.addEventListener("mouseup", function(){
            flag = -1;
        }, false);
    }
}

function hide_timeline(){
    remove_class(ui.timeline, "shown");
}

function show_hospital_toggle(){
    if(ui.hospital_toggle.className.indexOf("shown") == -1){
        add_class(ui.hospital_toggle, "shown");
        ui.hospital_toggle.getElementsByTagName("span")[0].innerHTML = "Show hospitals";
        remove_class(ui.hospital_toggle, "enabled");

        ui.hospital_toggle.onclick = function(){
            if(ui.hospital_toggle.className.indexOf("enabled") == -1){
                add_class(ui.hospital_toggle, "enabled");
                show_hospitals(true); 
            }
            else{
                remove_class(ui.hospital_toggle, "enabled");
                show_hospitals(false);
            }
        }
    }
}

function hide_hospital_toggle(){
    remove_class(ui.hospital_toggle, "shown");
}

function calculate_time(event){
    var rect = ui.timeline.getBoundingClientRect();
    var length = rect.right - rect.left;
    var interval_size = length / times.length;
    var thing = 0;
    for(var i = 0; i < times.length; i++){
        if(event.pageX > i* interval_size){
            thing = i;       
        }
    }
    var new_time = times[thing];
    if(new_time != time){
        time = new_time;
        ui.timeline_slider.innerHTML = time;                   
        set_time(time);
    }
}



function toggle_controls(){
    toggle_class(ui.control_panel, "open");
    toggle_class(ui.controls_opener, "open");
}

function toggle_config(){
    toggle_class(ui.config_overlay, "shown");
    ui.json_field.value = document.getElementById("template").value;
    ui.csv_field.value = "";
}

function toggle_class(el, name){
    if(el.className.indexOf(name) == -1){
        add_class(el, name);
    }
    else{
        remove_class(el, name);
    }
}

function add_class(el, name){
    el.className += ' '+name;   
}

function remove_class(el, name){
    var elClass = ' '+el.className+' ';
    while(elClass.indexOf(' '+name+' ') != -1)
         elClass = elClass.replace(' '+name+' ', '');
    el.className = elClass;
}


init_ui();
bind_listeners();  
load_metadata();
