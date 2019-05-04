
class dipam_interface {

    constructor(config_file, diagram_instance,interface_instance) {
        this.DOMTYPE = {
          'graphName': {'data_id': 'name','type':'input_box', 'title': 'Graph name', 'value':'name'},
          'edgeName': {'data_id': 'name', 'type':'input_box', 'title': 'Edge name', 'value':'id'},
          'dataName': {'data_id': 'name', 'type':'input_box', 'title': 'Data name', 'value':'name'},
          'toolName': {'data_id': 'name', 'type':'input_box', 'title': 'Tool name', 'value':'name'},
          'filePath': {'data_id': 'name', 'type':'input_file', 'title': 'File', 'value':'name'},
          'dataType': {'data_id': 'value', 'type': 'dropdown', 'title': 'Data type', 'value':[],'label':[]},
          'toolType': {'data_id': 'value', 'type': 'dropdown', 'title': 'Tool type', 'value':[],'label':[]},
          'editElem': {'position': 'divfoot', 'type':'light_button', 'title': 'Edit properties', 'value':'editoff', 'event':{'onclick':"[[INTERFACE]].after_editing();"}},
          'removeElem': {'position': 'divfoot', 'type':'light_button', 'title': 'Remove element', 'value':'',
                    'event':{'onclick':"[[DIAGRAM]].remove_elem([[id]]);[[INTERFACE]].after_removing();[[INTERFACE]].show_undo_redo([[DIAGRAM]].get_undo_redo().isUndoStackEmpty(),[[DIAGRAM]].get_undo_redo().isRedoStackEmpty());"}}
        };

        //"[[INTERFACE]].show_undo_redo([[DIAGRAM]].get_undo_redo().isUndoStackEmpty(),[[DIAGRAM]].get_undo_redo().isRedoStackEmpty());"

        this.OVERVIEW_SECTION = "graphName-editElem";
        this.INFO_SECTION = { tool: "toolName-toolType-editElem-removeElem", data:"dataName-dataType-filePath-editElem-removeElem", edge: "edgeName-removeElem"};

        this.info_section_html = "";
        this.overview_section_html = "";
        this.eventdom = {};
        this.workflow = null;

        this.DIAGRAM_INSTANCE = diagram_instance;
        this.INTERFACE_INSTANCE = interface_instance;

        //define the dom ids
        this.NAV_INFO = document.getElementById('nav_info_a');
        this.NAV_OVERVIEW = document.getElementById('nav_overview_a');
        this.DIAGRAM_EDITOR_CONTAINER = document.getElementById('diagram_editor');
        this.CONTROL_BTNS = document.getElementById('control_nav');
        this.CONTROL_CONTAINER = document.getElementById('control_body');
        this.CY_CONTAINER = document.getElementById('cy');
        this.ADD_TOOL = document.getElementById('add_tool');
        this.ADD_DATA = document.getElementById('add_data');
        this.RUN_WORKFLOW = document.getElementById('btn_run_workflow');
        this.TIMELINE_CONTAINER = document.getElementById('timeline_container');
        this.START_BLOCK = document.getElementById('start_block');
        this.TIMELINE_TEXT = document.getElementById('timeline_text');
        this.UNDO_BTN = document.getElementById('undo_btn');
        this.REDO_BTN = document.getElementById('redo_btn');
        this.DIAGRAM_ZOOM_CONTAINER= document.getElementById('diagram_zoom');
        this.ZOOMIN_BTN = document.getElementById('zoom_in_btn');
        this.ZOOMOUT_BTN = document.getElementById('zoom_out_btn');


        //Construct the DOM types
        if (config_file.hasOwnProperty('tool')) {
          for (var k_tool in config_file.tool) {
            this.DOMTYPE.toolType.value.push(k_tool);
            this.DOMTYPE.toolType.label.push(config_file.tool[k_tool].label);
          }
        }
        if (config_file.hasOwnProperty('data')) {
          for (var k_data in config_file.data) {
            this.DOMTYPE.dataType.value.push(k_data);
            this.DOMTYPE.dataType.label.push(config_file.data[k_data].label);
          }
        }

        //this.build_overview();
    }

    __set__info_section_html(param){
      this.info_section_html = param;
    }

    __set__overview_section_html(param){
      this.overview_section_html = param;
    }

    init_interface_events(){
      this.init_nav();
      this.init_undo_redo();
      this.init_zoom();
    }

    init_nav() {
      this.NAV_OVERVIEW.setAttribute("href", "javascript:vw_interface.click_overview_nav()");
      this.NAV_INFO.setAttribute("href", "javascript:vw_interface.click_info_nav()");
    }

    init_undo_redo() {
      var str_html_btns = this.INTERFACE_INSTANCE+".show_undo_redo("+this.DIAGRAM_INSTANCE+".get_undo_redo().isUndoStackEmpty(),"+this.DIAGRAM_INSTANCE+".get_undo_redo().isRedoStackEmpty())";
      this.UNDO_BTN.setAttribute("href", "javascript:"+this.DIAGRAM_INSTANCE+".cy_undo_redo.undo(); "+str_html_btns);
      this.REDO_BTN.setAttribute("href", "javascript:"+this.DIAGRAM_INSTANCE+".cy_undo_redo.redo(); "+str_html_btns);
    }

    init_zoom() {
      var param_str = this.DIAGRAM_INSTANCE+".get_diagram_obj().zoom()";
      this.ZOOMIN_BTN.setAttribute("href", "javascript:"+this.DIAGRAM_INSTANCE+".get_diagram_obj().zoom("+param_str+")");
      this.ZOOMOUT_BTN.setAttribute("href", "javascript:"+this.DIAGRAM_INSTANCE+".get_diagram_obj().zoom("+param_str+")");
    }

    __get__add_tool_container(){
      return this.ADD_TOOL;
    }

    __get__add_data_container(){
      return this.ADD_DATA;
    }

    __get__run_workflow_container(){
      return this.RUN_WORKFLOW;
    }

    get_tools() {
        var all_tools = [];
        for (var i = 0; i < nodes.length; i++) {
          if(nodes[i].type == 'tool'){
            all_tools.push(nodes[i]);
          }
        }
        return all_tools;
    }

    build_overview(node_general) {
      //first decide what doms should be visualized (defined in DOMTYPE)
      var dom_key = this.OVERVIEW_SECTION;
      this.overview_section_html = this._build_section(dom_key, node_general);
    }

    build_info(elem) {
      //first decide what doms should be visualized (defined in DOMTYPE)
      var dom_key = this.INFO_SECTION[elem.type];
      this.info_section_html = this._build_section(dom_key, elem);
    }

    _build_section(dom_key, node){

      this.eventdom = {};
      //now populate the html page
      //first the body
      var domfoot_key_arr = [];
      var str_html= "";
      var dom_key_arr = dom_key.split("-");
      for (var i = 0; i < dom_key_arr.length; i++) {
        var obj_dom = this.DOMTYPE[dom_key_arr[i]];
        obj_dom['id'] = dom_key_arr[i];
        if (obj_dom.event != undefined) {
            this.eventdom[dom_key_arr[i]] = this.__normalize_eventdom(obj_dom,node);
        }
        if (obj_dom.position != 'divfoot') {
          str_html = str_html + this.__build_corresponding_dom(obj_dom, node);
        }else {
          domfoot_key_arr.push(obj_dom);
        }
      }

      //now the foot
      str_html = str_html + '<div id="control_foot">';
      for (var i = 0; i < domfoot_key_arr.length; i++) {
        var obj_dom = domfoot_key_arr[i];
        str_html = str_html + this.__build_corresponding_dom(obj_dom, node);
      }
      str_html = str_html + '</div>';

      return str_html;
    }
    __normalize_eventdom(obj_dom, node){
      var res_dom = JSON.parse(JSON.stringify(obj_dom));
      for (var k_event_type in obj_dom.event) {
        var event_func = obj_dom.event[k_event_type];

        //var arr_regex = [/\[\[(DIAGRAM)\]\]/gi,/\[\[(INTERFACE)\]\]/gi,/\[\[(.*)\]\]/gi];
        var str = event_func;

        var founds = __apply_regex(/\[\[(.{2,12})\]\]/gi,str);
        for (var i = 0; i < founds.length; i++) {
            //str = str.replace("[["+founds[i]+"]]","");
            var replacer = "";
            switch (founds[i]) {
              case 'DIAGRAM':
                replacer = this.DIAGRAM_INSTANCE;
                break;
              case 'INTERFACE':
                replacer = this.INTERFACE_INSTANCE;
                break;
              default:
                replacer = "'"+node[founds[i]]+"'";
            }
            res_dom.event[k_event_type] = res_dom.event[k_event_type].replace("[["+founds[i]+"]]",replacer);
        }
      }

      return res_dom;

      function __apply_regex(regex,str){
          var m;
          var founds = [];
          while ((m = regex.exec(str)) !== null) {
            founds.push(m[1])
          }
          return founds;
      }
    }
    __build_corresponding_dom(obj_dom_type, node){
      var str_html= "";

      //check if there is an event handler for the dom
      var str_html_event = "";
      if(obj_dom_type.id in this.eventdom){
        var event_obj = this.eventdom[obj_dom_type.id].event;
        for (var k_event in event_obj) {
          str_html_event = str_html_event+' '+k_event+'="'+event_obj[k_event]+'"';
        }
      }

      switch (obj_dom_type.type) {
        case 'dropdown':
              var str_options = "";
              for (var j = 0; j < obj_dom_type.value.length; j++) {
                var opt_val = obj_dom_type.value[j];
                var opt_lbl = obj_dom_type.label[j];
                var selected_val = "";
                if (opt_val == node.value) {
                  selected_val = "selected";
                }
                str_options = "<option value='"+opt_val+"' "+selected_val+">"+opt_lbl+"</option>"+str_options;

              };
              str_html = str_html + `
              <div class="input-group">
                    <div class="input-group-prepend">
                      <label class="input-group-text">`+obj_dom_type.title+`</label>
                    </div>
                    <select data_elem_id="`+node.id+`"`+str_html_event+` id="`+obj_dom_type.id+`" class="val-box custom-select `+obj_dom_type.type+`" disabled>`+str_options+`</select>
              </div>
              `;
        break;
        case 'input_file':
          str_html = str_html + `
          <div class="input-group">
            <label class="input-group-text">`+obj_dom_type.title+`</label>
            <input data_elem_id="`+node.id+`" id="`+obj_dom_type.id+`" type="file" name="myFile" value="" />
          </div>
          `;
        break;
        case 'input_box':
          str_html = str_html + `
          <div class="input-group">
            <div class="input-group-prepend">
              <label class="input-group-text">`+obj_dom_type.title+`</label>
            </div>
            <input data_elem_id="`+node.id+`" `+str_html_event+` id="`+obj_dom_type.id+`" class="val-box `+obj_dom_type.type+`" value="`+node[obj_dom_type.value]+`" temp_value="`+node[obj_dom_type.value]+`" type="text" disabled></input>
          </div>
          `;

          $(document).on('keyup', 'input', function(){
              document.getElementById(this.id).setAttribute('temp_value',$(this).val());
          });


        break;
        case 'light_button':
          str_html = str_html + '<span class="foot-dom"><button '+str_html_event+' id="'+obj_dom_type.id+'" type="button" data_elem_id="'+node.id+'" class="btn btn-light '+obj_dom_type.type+'">'+obj_dom_type.title+'</button></span>';
          break;
      }

      return str_html;
    }

    __get__eventdom_containers(){
      var containers = [];
      for (var k_eventelem in this.eventdom) {
        containers.push(document.getElementById(this.eventdom[k_eventelem].id));
      }
      return containers;
    }

    click_on_node(node){
      this.build_info(node);
      this.click_info_nav();
    }

    click_on_edge(edge){
      this.build_info(edge);
      this.click_info_nav();
    }

    click_info_nav() {
      this.switch_nav('nav_info');
      this.CONTROL_CONTAINER.innerHTML = this.info_section_html;
    }

    after_removing(){
      this.__set__info_section_html("");
      this.click_overview_nav();
    }

    after_editing(action = null){
      this._switch_edit_doms();
      return this._cancel_save_btns(action);
    }

    _switch_edit_doms(){
      var current_flag = false;
      var arr_doms_toedit = document.getElementsByClassName('val-box');
      for (var i = 0; i < arr_doms_toedit.length; i++) {
        if (i == 0) {
           current_flag = arr_doms_toedit[i].disabled;
        }
        arr_doms_toedit[i].disabled = !current_flag;
      }
      var newflag = "editon";
      if (!current_flag == true) {
        newflag = "editoff";
      }
      document.getElementById('editElem').setAttribute('value',newflag);
    }

    _cancel_save_btns(action = null){
      var res = 1;
      var editdom = document.getElementById('editElem');
      var data_elem_id = editdom.getAttribute('data_elem_id');
      var original_inner_html = editdom.innerHTML;
      editdom.style.visibility = 'hidden';

      var edit_value = editdom.getAttribute('value');
      if (edit_value == 'editon') {
        var two_buttons_dom = `<span id="edit_buttons" class="foot-dom">
                               <span><button id='edit_cancel' onclick='`+this.INTERFACE_INSTANCE+`.after_editing("cancel");' type='button' class='btn btn-default edit-switch'>Cancel</button></span>
                               <span>
                               <button id='edit_save'
                                        onclick='`+this.INTERFACE_INSTANCE+`.reload_control_section(`+this.DIAGRAM_INSTANCE+`.update_elem("`+data_elem_id+`",`+this.INTERFACE_INSTANCE+`.after_editing("save")));'`
                                        +`type='button' class='btn btn-default edit-switch'>Save</button></span>
                               </span>`;
        editdom.parentNode.innerHTML = two_buttons_dom + editdom.parentNode.innerHTML;
      }else {

        //remove the edit buttons
        if (document.getElementById('edit_buttons') != undefined) {
          document.getElementById('edit_buttons').remove();
        }

        //finish editing the doms
        //editdom.setAttribute('value','editoff');

        editdom.style.visibility = 'visible';

        //do the corresponding function corresponding to the choice/action made
        switch (action) {
          case 'cancel':
            editdom.setAttribute('value','editoff');
            this.reload_control_section();
            break;
          case 'save':
            editdom.setAttribute('value','editoff');
            res = this._save();
            break;
          default:
        }
      }
      return res;
    }

    reload_control_section(new_elem = null){

      var active_nav = this.active_nav();

      //check in which section I was
      if (active_nav == 'overview'){
        //in case the overview attributes have been updated/edited
        if (new_elem != null) {
          this.build_overview(new_elem.data);
        }
        document.getElementById('nav_overview_a').click();
        //this.click_overview_nav();
      }else if (active_nav == 'info') {
        //in case an element (node/edge) have been updated/edited
        if (new_elem != null) {
          new_elem = new_elem._private;
          this.build_info(new_elem.data);
        }
        document.getElementById('nav_info_a').click();
        //this.click_info_nav();
      }
    }

    _save() {
      var arr_modified_doms = document.getElementsByClassName('val-box');

      var res_value = {};
      for (var i = 0; i < arr_modified_doms.length; i++) {
        var obj_dom = arr_modified_doms[i];
        var dom_value_type = this.DOMTYPE[obj_dom.id].type;
        var dom_data_target = this.DOMTYPE[obj_dom.id].data_id;

        switch (dom_value_type) {
            case 'dropdown':
              var arr_options = obj_dom.childNodes;
              for (var j = 0; j < arr_options.length; j++) {
                if(arr_options[j].selected){
                  res_value[dom_data_target] = arr_options[j].getAttribute('value');
                  break;
                }
              }
            break;
            case 'input_box':
              var new_val = obj_dom.getAttribute('temp_value');
              obj_dom.setAttribute('value',new_val);
              res_value[dom_data_target] = new_val;
            break;
          default:
        }
      }
      return res_value;
    }


    click_overview_nav() {
      this.switch_nav('nav_overview');
      this.CONTROL_CONTAINER.innerHTML = this.overview_section_html;
    }

    switch_nav(nav_node_id) {
      for (var i = 0; i < document.getElementsByClassName('nav-btn').length; i++) {
        var obj = document.getElementsByClassName('nav-btn')[i];
        if(obj.id == nav_node_id){
          document.getElementsByClassName('nav-btn')[i].className = "nav-btn active";
        }else {
          document.getElementsByClassName('nav-btn')[i].className = "nav-btn";
        }
      }
    }

    active_nav(){
      for (var i = 0; i < document.getElementsByClassName('nav-btn').length; i++) {
        if (document.getElementsByClassName('nav-btn')[i].className == "nav-btn active") {
          return document.getElementsByClassName('nav-btn')[i].id.replace("nav_","").replace("a_","");
        }
      }
      return -1;
    }


  click_save_workflow(){}
  click_load_workflow(){}
  click_run_workflow(){

    if (this.RUN_WORKFLOW.value == 'stop') {
      _disable_divs(this,false);
      this.RUN_WORKFLOW.value = 'run';
      this.RUN_WORKFLOW.innerHTML = "Stop process";
    }else {
      _disable_divs(this,true);
      this.RUN_WORKFLOW.value = 'stop';
      this.RUN_WORKFLOW.innerHTML = "Run workflow";
    }

    function _disable_divs(instance,enable=false){
      var p_event = 'none';
      var opacity_val = '0.6';
      if (enable) {
        p_event = '';
        opacity_val = '';
      }

      instance.CY_CONTAINER.style["pointer-events"] = p_event;
      instance.CY_CONTAINER.style["opacity"] = opacity_val;

      instance.DIAGRAM_EDITOR_CONTAINER.style["pointer-events"] = p_event;
      instance.DIAGRAM_EDITOR_CONTAINER.style["opacity"] = opacity_val;

      instance.DIAGRAM_ZOOM_CONTAINER.style["pointer-events"] = p_event;
      instance.DIAGRAM_ZOOM_CONTAINER.style["opacity"] = opacity_val;

      instance.CONTROL_BTNS.style["pointer-events"] = p_event;
      instance.CONTROL_BTNS.style["opacity"] = opacity_val;

      instance.CONTROL_CONTAINER.style["pointer-events"] = p_event;
      instance.CONTROL_CONTAINER.style["opacity"] = opacity_val;

      //instance.TIMELINE_CONTAINER.innerHTML = "";
      if (enable) {
        [...document.getElementsByClassName('timeline-block-inner')].map(n => n && n.remove());
      }
      instance.TIMELINE_TEXT.innerHTML = "Workflow timeline ...";
    }
  }

  //Executes all the workflow
  handle_workflow(status, param){
    if (status == 'run') {
      console.log(param);
      this.workflow = JSON.parse(JSON.stringify(param));

      var paths_res = {};
      var process_queue = JSON.parse(JSON.stringify(param.queue));

      for (var i = 0; i < param.queue.length; i++) {
        var p_id = param.queue[i];
        var p_obj = param.paths[p_id];
        paths_res[p_id] = {
            status:'processing',
            nodes_to_process: JSON.parse(JSON.stringify(p_obj.nodes_ids)),
            result: []
        };
      }

      for (var p_id in paths_res) {
        console.log("Processing: ", p_id);
        _process_path(p_id, this);
      }

      var last_path = paths_res[Object.keys(paths_res)[Object.keys(paths_res).length -1]];
      console.log("\n The final result is: "+last_path.result[0]);

    }else if (status == 'stop') {
      //Stop the execution and abort all the running functions"
      console.log("Stop the execution and abort all the running functions");
    }

    function _process_path(path_id, instance){
      var nodes_to_process = paths_res[path_id].nodes_to_process;

      if (nodes_to_process.length > 0) {
        var node_id = nodes_to_process.shift();

        //the last node to process
        if (nodes_to_process.length == 0) {

          //check if it is a merging intersection node
          if (node_id in param.merge_intersections_nodes){
            var intersection_node = param.merge_intersections_nodes[node_id];
            //check if i am processing the merging path
            if (intersection_node.out_path != path_id) {
              //give my result to the merging path
              paths_res[intersection_node.out_path].result.push(paths_res[path_id].result[0]);
              //setTimeout(function(){ return _process_path(path_id,instance);}, 400);
              return _process_path(path_id,instance);
            }
          }
        }

        ////merge the results in one if  i am the path of the merging node
        if (node_id in param.merge_intersections_nodes){
          var intersection_node = param.merge_intersections_nodes[node_id];
          //check if i am processing the merging path
          if (intersection_node.out_path == path_id) {
            var merge_results = paths_res[path_id].result[0];
            for (var i = 1; i < paths_res[path_id].result.length; i++) {
              merge_results = merge_results +","+ paths_res[path_id].result[i];
            }
            paths_res[path_id].result = ["["+merge_results+"]"];
          }
        }

        //process the node by giving the current result to the node as input

        //This case is possible only for 'Data' nodes
        //the server need to populate this properly
        if (paths_res[path_id].result.length == 0) {
          console.log("Process node: "+node_id+" with input:"+paths_res[path_id].result);
          paths_res[path_id].result.push("["+node_id+":data]");
          instance.add_timeline_block(node_id);
        }else {
          //else process regularly the node
          console.log("Process node: "+node_id+" with input:"+paths_res[path_id].result);
          paths_res[path_id].result[0] = "[Process("+paths_res[path_id].result+")by:"+node_id+"]";
          instance.add_timeline_block(node_id);
          //change this with the corresponding server call
        }

        //check if it is a splitting intersection node, right afer i have executed the current node
        if (node_id in param.split_intersections_nodes){
          var intersection_node = param.split_intersections_nodes[node_id];
          //check if i am processing the splitting path
          if (intersection_node.in_path == path_id) {
            for (var i = 0; i < intersection_node.out_paths.length; i++) {
              var out_path_id = intersection_node.out_paths[i];
              paths_res[out_path_id].result.push(paths_res[path_id].result[0]);
            }
          }
          //else i am a splitted path and i got the results already
        }
        //setTimeout(function(){ return _process_path(path_id,instance);}, 400);
        return _process_path(path_id,instance);

      }

      paths_res[path_id].status = 'done';
      return paths_res[path_id];
    }
  }

  //add a html block to timeline and update percentage
  add_timeline_block(node_id){
    console.log("Add Block !");
    this.TIMELINE_TEXT.innerHTML = "Workflow Done";
    var block_to_add = document.createElement("div");
    block_to_add.setAttribute("class", "timeline-block-inner");
    block_to_add.setAttribute("data-value", node_id);

    var starting_block = this.START_BLOCK;
    var found = false;
    for (var i = 0; i < document.getElementsByClassName('timeline-block-inner').length; i++) {
      if(document.getElementsByClassName('timeline-block-inner')[i].getAttribute('data-value') == node_id){
        found = true;
      }
    }
    if (!found) {
      _insert_after(block_to_add,this.START_BLOCK);
    }

    function _insert_after(newNode, referenceNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
  }

  show_undo_redo(undo_empty, redo_empty){
    this.show_undo(!undo_empty);
    this.show_redo(!redo_empty);
  }

  show_undo(flag= true){
    this.UNDO_BTN.style.visibility = 'visible';
    if (!(flag)) {
      this.UNDO_BTN.style.visibility = 'hidden';
    }
  }

  show_redo(flag= true){
    this.REDO_BTN.style.visibility = 'visible';
    if (!(flag)) {
      this.REDO_BTN.style.visibility = 'hidden';
    }
  }

}
