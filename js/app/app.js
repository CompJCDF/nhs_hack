var ui = {
    controls_opener: null,
    control_panel: null,
    data_sets: null,
    timeline: null,
    timeline_slider: null
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

function log(text){
    console.log(text);
}

function init_ui(){
    ui.controls_opener = document.getElementById("controls_opener");
    ui.control_panel = document.getElementById("control_panel");
    ui.data_sets = document.getElementById("data_sets");
    ui.timeline = document.getElementById("timeline");
    ui.timeline_slider = timeline.getElementsByTagName("div")[0];
    if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        add_class(ui.control_panel, "open");
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
            e+='<span class="name" onclick="toggle_set('+data_sets[i].id+');">'+data_sets[i].name+"</span>";
            e+='<span class="source">'+data_sets[i].attribution_desc+"</span>";
            e+='<span class="source"><a href="'+data_sets[i].attribution_url+'" target="_blank">'+data_sets[i].attribution_org+"</a></span>";

            ui.data_sets.innerHTML += e+"</lI>";
        }
        bind_listeners();
    });  
}

function toggle_set(set_id){
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
    if(set.attributes[0].field_indx.length > 1){
        show_timeline();       
    }   
    else{hide_timeline();}
    new_data(set);
}

function show_timeline(){
    if(ui.timeline.className.indexOf("shown") == -1){
        add_class(ui.timeline, "shown"); 
        var element = ui.timeline;
        var flag = -1;
        element.addEventListener("mousedown", function(){
            flag = 0;
        }, false);
        document.addEventListener("mousemove", function(event){
            if(flag == 0){
                var rect = element.getBoundingClientRect();
                if(event.pageX > rect.left-25 && event.pageX < rect.right-25){
                    ui.timeline_slider.style.left = event.pageX-25+"px"; 
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

function toggle_controls(){
    toggle_class(ui.control_panel, "open");
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
