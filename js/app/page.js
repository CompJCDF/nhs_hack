var ui = {
    controls_opener: null,
    control_panel: null
}

function log(text){
    console.log(text);
}

function init_ui(){
    ui.controls_opener = document.getElementById("controls_opener");
    ui.control_panel = document.getElementById("control_panel");
}

function bind_listeners(){
    ui.controls_opener.onclick = toggle_controls;
}

function toggle_controls(){
    if(ui.control_panel.className.indexOf("open") == -1){
        add_class(ui.control_panel, "open");
    }
    else{
        remove_class(ui.control_panel, "open");   
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
