var ui = {
    controls_opener: null,
    control_panel: null,
    data_sets: null
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
        data_sets = [
            {name:'Set 1', id:1, enabled: false},
            {name:'Set 2', id:2, enabled: false},
            {name:'Set 3', id:3, enabled: false},
            {name:'Set 4', id:4, enabled: false},
            {name:'Set 5', id:5, enabled: false}
        ];

        for(var i = 0; i < data_sets.length; i++){
            var e = "<li id='set_"+data_sets[i].id+"' onclick='toggle_set("+data_sets[i].id+");'>"+data_sets[i].name+"</li>";
            ui.data_sets.innerHTML += e;
        }
        bind_listeners();
    });   
}

function toggle_set(set_id){
    var set = null;
    for(var i = 0; i < data_sets.length; i++){
        if(data_sets[i].id == set_id){
            set=data_sets[i];
            add_class(document.getElementById("set_"+set.id), "ticked");
        }
        else{
            remove_class(document.getElementById("set_"+data_sets[i].id), "ticked");
        }
    }
    set.enabled = !set.enabled;
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
