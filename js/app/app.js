var ui = {
    controls_opener: null,
    control_panel: null,
    data_sets: null,
    timeline: null,
    timeline_slider: null,
    map: null,
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
    if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        toggle_controls(); 
    }
}

function bind_listeners(){
    ui.controls_opener.onclick = toggle_controls;
}

function load_metadata(){
    net.get("data/descriptors.json", function(data){
        log(data); 
        if(data.error == true){return;}
        data_sets = data;
        for(var i = 0; i < data_sets.length; i++){data_sets[i].id = i+1;}


        for(var i = 0; i < data_sets.length; i++){
            var e = "<li id='set_"+data_sets[i].id+"' >";
            e+='<span class="name" onclick="load_set('+data_sets[i].id+');">'+data_sets[i].name+"</span>";
            e+='<span class="source">'+data_sets[i].attribution_desc+"</span>";
            e+='<span class="org"><a href="'+data_sets[i].attribution_url+'" target="_blank">'+data_sets[i].attribution_org+"</a></span>";
            e+='<span class="type background '+data_sets[i].data_type+'">'+data_sets[i].data_type+'</span>';

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
        show_timeline();       
    }   
    else if(set.data_type == "multivariate"){
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
        },100);
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

function hide_timeline(){
    remove_class(ui.timeline, "shown");
}

function toggle_controls(){
    toggle_class(ui.control_panel, "open");
    toggle_class(ui.controls_opener, "open");
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
