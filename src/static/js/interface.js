class dipam_interface {

    constructor() {
        this.DIAGRAM_INSTANCE_OBJ = null;
        this.DOMS = {
          "DIAGRAM": {
              "CONTAINER": document.getElementById('cy'),
              //diagram editor (add nodes)
              "EDITOR_CONTAINER": document.getElementById('diagram_editor'),
              "ADD_TOOL_BTN": document.getElementById('add_tool'),
              "ADD_DATA_BTN": document.getElementById('add_data'),
              "ADD_UNIT_LIST": document.getElementById('list_options_unit_add'),
              //undo-redo
              "UNDO_REDO_CONTAINER": document.getElementById('diagram_undo_redo'),
              "UNDO_BTN": document.getElementById('undo_btn'),
              "REDO_BTN": document.getElementById('redo_btn'),
              //zoom
              "ZOOM_CONTAINER": document.getElementById('diagram_zoom'),
              "ZOOMIN_BTN": document.getElementById('zoom_in_btn'),
              "ZOOMOUT_BTN": document.getElementById('zoom_out_btn'),
              //fit
              "FIT_CONTAINER": document.getElementById('diagram_fit'),
              "FIT_BTN": document.getElementById('fit_btn'),
              //remove elem
              "REMOVE_ELEM_CONTAINER": document.getElementById('remove_elem'),
          },
          "CONTROL": {
              "GUI": document.getElementById('gui'),
              "BASE": document.getElementById('control'),
              //"CONTAINER": document.getElementById('control_body'),
              //"CONTAINER_MID": document.getElementById('control_mid'),
              //menu navigator
              "NAV_CONTAINER": document.getElementById('control_nav'),
              "INFO_BTN": document.getElementById('nav_info_a'),
              "OVERVIEW_BTN": document.getElementById('nav_overview_a'),
          },
          "WORKFLOW": {
              //buttons
              "OPT_TRIGGER": document.getElementById('list_options_trigger'),
              "OPT_LIST": document.getElementById('list_options'),
              "RUN_BTN": document.getElementById('btn_run_workflow'),
              "HELP_TOOL_BTN": document.getElementById('btn_help_tool'),
              "SAVE_BTN": document.getElementById('btn_save_workflow'),
              "SAVE_BTN_DOWNLOAD": document.getElementById('btn_save_workflow_a'),
              "EXPORT_BTN": document.getElementById('btn_export_work'),
              "EXPORT_BTN_DOWNLOAD": document.getElementById('a_export_work'),
              "IMPORT_BTN": document.getElementById('btn_import_work'),
              "IMPORT_BTN_FORM": document.getElementById('form_import_work'),
              "IMPORT_BTN_INPUT": document.getElementById('input_work_to_load'),
              //"SHUTDOWN_BTN": document.getElementById('shutdown_btn'),
              //timeline
              "TIMELINE_CONTAINER": document.getElementById('timeline_container'),
              "START_BLOCK": document.getElementById('start_block'),
              "END_BLOCK": document.getElementById('end_block'),
              //extra section
              "EXTRA_CONTAINER": document.getElementById('workflow_extra'),
              //notifications
              "NOTE_BADGE": document.getElementById('badge_notification'),
          }
        };

        this.info_section_html = "";
        this.info_section_elem = {};
        this.overview_section_html = "";
        this.overview_section_elem = {};

        this.workflow = null;
        this.request_status_on = true;
        this.in_loading_status = false;

        this.DOMS.DIAGRAM.UNDO_BTN.style["pointer-events"] = "none";
        this.DOMS.DIAGRAM.UNDO_BTN.style["opacity"] = 0.3;
        this.DOMS.DIAGRAM.REDO_BTN.style["pointer-events"] = "none";
        this.DOMS.DIAGRAM.REDO_BTN.style["opacity"] = 0.3;
    }

    set_corresponding_diagram(diagram){
      this.DIAGRAM_INSTANCE_OBJ = diagram;
      this.DIAGRAM_INSTANCE_CY = diagram.get_diagram_obj();
      //a temp internal data structure
      this.temp_dipam_value = {};

      //The doms that should trigger events
      this.DOM_EVENT_ELEMS = {
          'edit-trigger':{},
          'remove-trigger': {},
          'cancel-trigger': {},
          'save-trigger': {},
          'input-text-trigger': {},
          'input-text-large-trigger': {},
          'input-text-group-trigger': {},
          'select-file-trigger': {},
          'select-value-trigger': {},
          'check-value-trigger': {}
      };

      this.DIAGRAM_INSTANCE_OBJ.fit_diagram();
    }

    set_dipam_temp_val(key, new_val){
      this.temp_dipam_value[key] = new_val;
    }
    get_dipam_temp_val(key){
      if (key in this.temp_dipam_value) {
        return this.temp_dipam_value[key];
      }
      return -1;
    }

    check_version(){
      var interface_instance = this;
      $.ajax({
        url: "/check_tool",
        type: 'GET',
        success: function(data) {
              data = JSON.parse(data);
              console.log(data);
              if (!(data["is_ready"])) {
                interface_instance.DOMS.WORKFLOW.NOTE_BADGE.style.display = "block";
              }else {
                interface_instance.DOMS.WORKFLOW.NOTE_BADGE.style.display = "none";
              }
          }
      });
    }

    //build the info panel on the left
    build_overview(elem, elem_class= 'all') {
        //this.overview_section_html = this.build_control_section(elem);
        this.overview_section_elem['elem'] = elem;
        this.overview_section_elem['elem_class'] = elem_class;
    }

    /** DIPAM v2.0
    * Build info will call the back end to get the html to read for generating the section
    */
    build_info(elem, elem_class= 'node') {

      var elem_id = null;
      var elem_data = null;
      if ((elem_class == "node") || (elem_class == "edge")){
        elem_data = elem.data;
        elem_id = elem_data.id;
      }else if (elem_class == "diagram") {
        elem_data = diagram_instance.get_diagram();
        elem_id = "diagram";
      }
      /*build info only if the */
      fetch("/runtime/get_template?id="+elem_id)
          .then(response => { return response.json(); })
          .then(data => {
              // (1) Set HTML and Script contents
              this.DOMS.CONTROL.BASE.innerHTML = data["html_content"];
              const unit_template_script = document.getElementById("unit_template_js");
              if (unit_template_script) {
                  unit_template_script.remove();
              }
              var script = document.createElement('script');
              script.id = "unit_template_js";
              script.textContent = data["script_content"];
              document.body.appendChild(script);

              // (2) if this is the first time this element is visulized;
              //    then: its corresponding view value must be initialized
              if (!(elem_data.hasOwnProperty('value'))) {
                elem_data["value"] = dipam_unit_value.get_node_data_from_interface();
              }

              // (3) Run the default template operations
              dipam_unit_value.run_defaults();
          });
    }

    /*on click methods*/
    click_on_node(node){
      if ('_private' in node) {
        node = node._private;
      }
      console.log("Node clicked:",node);

      // Rebuild info only if its a new node
      if (this.DOMS.CONTROL.BASE.children.length === 0) {
        this.build_info(node,'node');
      }else{
        const CONTROL_CONTAINER = document.getElementById('control_body');
        if (CONTROL_CONTAINER.getAttribute('data-id') != node.data.id) {
          this.DOMS.CONTROL.BASE.innerHTML = "";
          this.build_info(node, 'node');
        }
      }
    }
    click_on_edge(edge){
      if ('_private' in edge) {
        edge = edge._private;
      }
      this.build_info(edge, 'edge');
    }

    click_overview_nav() {
      this.switch_nav('nav_overview');
      this.DOMS.CONTROL.BASE.className = "diagram";
      var overview_elem = this.overview_section_elem;
      //document.getElementById('edit').click();
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


    label_handler(dom_id, param){
      var str = "";
      switch (dom_id) {
        case 'p-file':
            if (param.value != undefined) {
                    if (param.value == {}) {
                      str = "";
                    }else if (param.value.length == 1){
                      str = param.value[0].name;
                    }else if (param.value.length > 1){
                      str = param.value.length+ " files" ;
                    }
            }
        default:
      }
      return str;
    }


    get_active_nav(){
      for (var i = 0; i < document.getElementsByClassName('nav-btn').length; i++) {
        if (document.getElementsByClassName('nav-btn')[i].className == "nav-btn active") {
          return document.getElementsByClassName('nav-btn')[i].id.replace("nav_","").replace("a_","");
        }
      }
      return -1;
    }


    removing(){
      this.info_section_html = "";
      $( "#"+this.DOMS.DIAGRAM.REMOVE_ELEM_CONTAINER.getAttribute('id')).css("display", "none");
      this.click_overview_nav();
    }

    editing(action = null){
      //this._switch_edit_doms();
      return this.set_edit_section(action);
    }

    _switch_edit_doms(){
      var current_flag = false;
      var arr_doms_toedit = document.getElementsByClassName('att-handler');
      /*
      for (var i = 0; i < arr_doms_toedit.length; i++) {
        if (i == 0) {
           current_flag = arr_doms_toedit[i].disabled;
        }
        arr_doms_toedit[i].disabled = !current_flag;
      }
      */
      var newflag = "editon";
      if (!current_flag == true) {
        newflag = "editoff";
      }
      document.getElementById('edit').setAttribute('value',newflag);
    }

    set_edit_section(action = null){
      //do the corresponding function corresponding to the choice/action made
      switch (action) {
          case 'cancel':
            //editdom.setAttribute('value','editoff');
            this.reload_control_section();
            break;
          case 'save':
            //editdom.setAttribute('value','editoff');
            return this.save();
          default:
        }
      return 1;
    }

    reload_control_section(new_elem = null, update_control_params = false){

      var active_nav = this.get_active_nav();

      //check in which section I was
      if (active_nav == 'overview'){
        //in case the overview attributes have been updated/edited
        if (new_elem != null) {
          this.build_overview(new_elem);
        }
        //this.click_overview_nav();

      }else if (active_nav == 'info') {
        //in case an element (node/edge) have been updated/edited
        if (new_elem != null) {
          if ('_private' in new_elem) {
            new_elem = new_elem._private;
          }
          this.build_info(new_elem, 'node', update_control_params);
        }
        this.click_info_nav();
        //this.DOMS.CONTROL.INFO_BTN.click();
      }
    }

    save() {
      var arr_modified_doms = document.getElementsByClassName('save-value');

      var res_value = {};
      for (var i = 0; i < arr_modified_doms.length; i++) {
        var obj_dom = arr_modified_doms[i];
        var ele_target_att = obj_dom.getAttribute('data-att-value');
        res_value[ele_target_att] = this.get_dipam_temp_val(ele_target_att);
      }
      return res_value;
    }

  click_load_workflow(){

  }


  click_run_workflow(){
    var new_status = -1;
    var new_lbl_status = -1;
    var workflow_status = this.DOMS.WORKFLOW.RUN_BTN.value;
    var instance = this;

    if (workflow_status == 'ready') {
      _disable_divs(this,true,true);
      new_status = 'run';
      new_lbl_status = "Stop process";

    }else if (workflow_status == 'run') {
      _disable_divs(this,true,false);
      new_status = 'stop';
      new_lbl_status = "Get back to edit";

    }else if (workflow_status == 'stop') {
      _disable_divs(this,false,true);
      new_status = "ready";
      new_lbl_status = '<svg class="bi bi-play-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/></svg>Run workflow';
    }
    _style_workflow_btn(new_status,new_lbl_status);

    return new_status;

    function _style_workflow_btn(new_status,new_lbl_status) {
      var new_bg_color = "var(--bg-color)";
      var new_width = "25%";
      if (new_status == "run") {
        //new_bg_color = "var(--running)";
        new_width = "50%";
      }
      if (new_status == "stop") {
        new_width = "50%";
      }

      instance.DOMS.WORKFLOW.RUN_BTN.style["background-color"] = new_bg_color;
      //instance.DOMS.WORKFLOW.RUN_BTN.style["width"] = new_width;
      instance.DOMS.WORKFLOW.RUN_BTN.style["opacity"] = '1';
      instance.DOMS.WORKFLOW.RUN_BTN.style["pointer-events"] = "auto";
      instance.DOMS.WORKFLOW.RUN_BTN.value = new_status;
      instance.DOMS.WORKFLOW.RUN_BTN.innerHTML = new_lbl_status;
    }
    function _disable_divs(instance,disable,reset_timeline){
      var p_event = 'none';
      var opacity_val = '0.8';
      if (!(disable)) {
        p_event = '';
        opacity_val = '';
      }
      //set all single nodes style
      var all_nodes = instance.DIAGRAM_INSTANCE_OBJ.get_nodes();
      for (var i = 0; i < all_nodes.length; i++) {
        all_nodes[i].style({"opacity" : '0.3'});
      }

      var elements = [
        instance.DOMS.DIAGRAM.CONTAINER,
        instance.DOMS.DIAGRAM.ADD_TOOL_BTN,
        instance.DOMS.DIAGRAM.ADD_DATA_BTN,
        instance.DOMS.DIAGRAM.UNDO_REDO_CONTAINER,
        instance.DOMS.CONTROL.NAV_CONTAINER,
        instance.DOMS.CONTROL.CONTAINER,
        instance.DOMS.DIAGRAM.REMOVE_ELEM_CONTAINER
      ]
      for (var i = 0; i < elements.length; i++) {
        elements[i].style["opacity"] =  opacity_val;
        elements[i].style["pointer-events"] =  p_event;
      }

      var control_inputs = document.getElementsByClassName('check-value-trigger');
      //console.log(control_inputs);
      for (var i = 0; i < control_inputs.length; i++) {
        control_inputs[i].disabled = true;
      }

      //instance.TIMELINE_CONTAINER.innerHTML = "";
      if (reset_timeline) {
        [...document.getElementsByClassName('timeline-block-inner')].map(n => n && n.remove());
      }
      //instance.TIMELINE_TEXT.innerHTML = "Workflow timeline ...";
      instance.DOMS.WORKFLOW.END_BLOCK.style.visibility = 'hidden';
    }
  }

  //Executes all the workflow
  handle_workflow(status, param){
    var interface_instance = this;
    if (status == 'run') {
      this.request_status_on = true;
      this.workflow = param;
      var workflow_to_process = this.workflow;
      var index_processed = {};
      var terminals = this.DIAGRAM_INSTANCE_OBJ.get_terminal_tools();
      //console.log(terminals);

      //process workflow
      $.ajax({
        url: "/reset",
        type: 'GET',
        success: function(data) {
              //console.log("reset temp data");
              if (data.startsWith("Error:")) {
                console.log("Could not reset temp data!");
              }else {
                _process_workflow(interface_instance,0,terminals);
              }
          }
      });

    }else if (status == 'stop') {
      //Stop the execution and abort all the running functions
      window.stop();
      this.request_status_on = false;
      console.log("Process stopped!");
    }else if (status == 'ready') {
      this.request_status_on = true;
      console.log("Ready again!");
    }

    function _process_workflow(instance,i,terminals, pending_index = 0){

            var w_elem = workflow_to_process[i];
            console.log("Process: ", w_elem)
            //check if is a terminal

            //call the server
            var request_status = "done";
            var form_data = _gen_form_data(w_elem, pending_index);
            var data_to_post = form_data["post_data"];
            var new_index = form_data["new_index"];
            console.log(data_to_post, new_index);

            $.ajax({
              url: "/process",
              timeout: 0, // 24 hours (24 * 60 * 60 * 1000). Set the timeout value in milliseconds or 0 for unlimited
              data: data_to_post,
              processData: false,
              contentType: false,
              type: 'POST',
              success: function(data) {
                    if (data.startsWith("Success:Waiting data !")) {
                      //process the same item again (modified version)
                      _process_workflow(instance,i,terminals, new_index);
                    }else {
                        if (data.startsWith("Error:")) {
                          instance.add_timeline_block(w_elem.id, w_elem.type, w_elem.name, true, data);
                        }else {
                          instance.in_light_node(w_elem.id);
                          instance.add_timeline_block(w_elem.id, w_elem.type, w_elem.name);
                          //process next node
                          if (i == workflow_to_process.length - 1) {
                            console.log("Done All !!");
                            instance.process_terminals(terminals);
                            instance.DOMS.WORKFLOW.END_BLOCK.style.visibility = 'visible';
                            instance.DOMS.WORKFLOW.RUN_BTN.innerHTML = "Get back to edit";
                            instance.DOMS.WORKFLOW.RUN_BTN.value = "stop";
                          }else {
                            if (instance.request_status_on) {
                              _process_workflow(instance,i+1,terminals);
                            }
                          }
                        }
                    }
                }
            });

            /*normalize the file list in a form type*/
            function _gen_form_data(elem_data, files_start_index = 0){
              var post_data = new FormData();
              var request_status = "done";
              var new_index = null;
              var MAX_NUM_FILES = 500;
              /*The array and object elements should be normalized for Post*/
              /* The node data are:
                1) The MUST-ATT: id, name, value, type
                2) The WORKFLOW-ATT: class, input, output, compatible_input
                3) The PARAM-ATT: e.g: 'p-file'
                4) The GRAPH-ATT: e.g: 'position'
              */
              for (var an_att in elem_data) {
                  var list_att = {};
                  list_att[an_att] = elem_data[an_att];

                  if ((an_att == 'workflow') || (an_att == 'param') || (an_att == 'graph')) {
                    list_att = elem_data[an_att];
                    for (var v_att in elem_data[an_att]) {
                      post_data.append(an_att+'[]', v_att);
                    }
                  }

                  for (var a_k in list_att) {
                    var val_of_att = list_att[a_k];
                    if (a_k == 'p-file') {

                      //the maximum supported number of files
                      Array.prototype.forEach.call(val_of_att, function(file,index) { if((index>=files_start_index) && (index-files_start_index<MAX_NUM_FILES)){post_data.append(a_k+'[]', file);} });

                      // check if the posted data exceeds the maximum number of supported chars
                      if (val_of_att.length - files_start_index > MAX_NUM_FILES){
                        request_status = "pending";
                        new_index = files_start_index + MAX_NUM_FILES;
                      }

                    }else {
                      if (Array.isArray(val_of_att)) {
                        //form_data.append(a_k, JSON.stringify(w_elem[a_k]));
                        // Append files to files array
                        for (let i = 0; i < val_of_att.length; i++) {
                          let elem_i = val_of_att[i];
                          post_data.append(a_k+'[]', elem_i);
                        }
                      }else if (val_of_att instanceof Object) {
                        post_data.append(a_k, JSON.stringify(w_elem[a_k]));
                      }else {
                        post_data.append(a_k, val_of_att);
                      }
                    }
                  }
              }
              post_data.append("request_status", request_status);
              return {"post_data": post_data, "new_index": new_index};
            }
      }
  }
  process_terminals(terminals){
    var interface_instance = this;
    for (var i = 0; i < terminals.length; i++) {
      var node_id = terminals[i].id;

      var dom_elems = document.getElementsByClassName('timeline-block-inner');
      var last_dom = this.DOMS.WORKFLOW.START_BLOCK;
      for (var j = 0; j < dom_elems.length; j++) {
        last_dom = dom_elems[j];
        if(last_dom.getAttribute('data-value') == node_id){
          break;
        }
      }

      /*switch according to the terminal tool value*/
      var a_linker_dom = null;
      switch (terminals[i].value) {
        case "t-save-files":
          a_linker_dom = document.createElement("a");
          a_linker_dom.setAttribute("value",node_id);
          a_linker_dom.target = "_blank";
          a_linker_dom.innerHTML = '<svg class="bi bi-download" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M.5 8a.5.5 0 01.5.5V12a1 1 0 001 1h12a1 1 0 001-1V8.5a.5.5 0 011 0V12a2 2 0 01-2 2H2a2 2 0 01-2-2V8.5A.5.5 0 01.5 8z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M5 7.5a.5.5 0 01.707 0L8 9.793 10.293 7.5a.5.5 0 11.707.707l-2.646 2.647a.5.5 0 01-.708 0L5 8.207A.5.5 0 015 7.5z" clip-rule="evenodd"/><path fill-rule="evenodd" d="M8 1a.5.5 0 01.5.5v8a.5.5 0 01-1 0v-8A.5.5 0 018 1z" clip-rule="evenodd"/></svg>';
          a_linker_dom.href = "/download/"+node_id+"?time="+(new Date().getTime()).toString();
          last_dom.innerHTML = last_dom.innerHTML + "<div class='inner-timeline-block'>"+a_linker_dom.outerHTML+"</div>";
          break;

        case "t-doctopics-view":
          a_linker_dom = document.createElement("a");
          a_linker_dom.setAttribute("value",node_id);
          a_linker_dom.innerHTML = '<svg class="bi bi-display" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.75 13.5c.167-.333.25-.833.25-1.5h4c0 .667.083 1.167.25 1.5H11a.5.5 0 010 1H5a.5.5 0 010-1h.75z"/><path fill-rule="evenodd" d="M13.991 3H2c-.325 0-.502.078-.602.145a.758.758 0 00-.254.302A1.46 1.46 0 001 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 00.538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 00.254-.302 1.464 1.464 0 00.143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 00-.302-.254A1.46 1.46 0 0013.99 3zM14 2H2C0 2 0 4 0 4v6c0 2 2 2 2 2h12c2 0 2-2 2-2V4c0-2-2-2-2-2z" clip-rule="evenodd"/></svg>';
          a_linker_dom.href = "/gettoolfile?id="+node_id+"&type=img&result=file&time="+(new Date().getTime()).toString();
          a_linker_dom.setAttribute("data-lightbox",node_id);
          last_dom.innerHTML = last_dom.innerHTML + "<div class='inner-timeline-block'>"+a_linker_dom.outerHTML+"</div>";
          //$.get( "/gettoolfile?id="+node_id+"&type=img&result=file").done(function(res) {interface_instance.build_linker_timelineblock(node_id,res)});
          break;

        case "t-topics-view":
          a_linker_dom = document.createElement("a");
          a_linker_dom.setAttribute("value",node_id);
          a_linker_dom.innerHTML = "Show";
          a_linker_dom.href = "/gettoolfile?id="+node_id+"&type=img&result=file&time="+(new Date().getTime()).toString();
          a_linker_dom.setAttribute("data-lightbox",node_id);
          last_dom.innerHTML = last_dom.innerHTML + "<div class='inner-timeline-block'>"+a_linker_dom.outerHTML+"</div>";
          //$.get( "/gettoolfile?id="+node_id+"&type=img&result=file").done(function(res) {interface_instance.build_linker_timelineblock(node_id,res)});
          break;
        default:
      }
    }
  }

  in_light_node(node_id){
    this.DIAGRAM_INSTANCE_OBJ.get_gen_elem_by_id(node_id).style({"opacity": "1"})
  }

  //add a html block to timeline and update percentage
  add_timeline_block(node_id, node_type, node_name, is_error = false, error_msg = ""){
    var extra_class = node_type+"-block";
    if (is_error) {
      extra_class = "error-block"
    }
    //this.TIMELINE_TEXT.innerHTML = "Workflow Done";
    var block_to_add = document.createElement("div");
    block_to_add.setAttribute("class", "timeline-block-inner "+extra_class);
    block_to_add.setAttribute("data-value", node_id);
    block_to_add.innerHTML = '<span class="tooltiptext">'+node_name+'</span>';


    var starting_block = this.DOMS.WORKFLOW.START_BLOCK;
    var found = false;

    var dom_elems = document.getElementsByClassName('timeline-block-inner');
    var last_dom = this.DOMS.WORKFLOW.START_BLOCK;
    for (var i = 0; i < dom_elems.length; i++) {
      last_dom = dom_elems[i];
      if(last_dom.getAttribute('data-value') == node_id){
        found = true;
      }
    }
    if (!found) {
      //_insert_after(block_to_add,this.DOMS.WORKFLOW.START_BLOCK);
      _insert_after(block_to_add,last_dom);
      if (is_error) {
        var err_block_msg = document.createElement("div");
        err_block_msg.setAttribute("class", "timeline-block-inner text-block");
        err_block_msg.setAttribute("data-value", node_id);
        err_block_msg.innerHTML = "<label>"+error_msg+"</label>";
        _insert_after(err_block_msg,block_to_add);
      }
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
    this.DOMS.DIAGRAM.UNDO_BTN.style["pointer-events"] = "auto";
    this.DOMS.DIAGRAM.UNDO_BTN.style["opacity"] = 1;
    if (!(flag)) {
      this.DOMS.DIAGRAM.UNDO_BTN.style["pointer-events"] = "none";
      this.DOMS.DIAGRAM.UNDO_BTN.style["opacity"] = 0.3;
    }
  }

  show_redo(flag= true){
    this.DOMS.DIAGRAM.REDO_BTN.style["pointer-events"] = "auto";
    this.DOMS.DIAGRAM.REDO_BTN.style["opacity"] = 1;
    if (!(flag)) {
      this.DOMS.DIAGRAM.REDO_BTN.style["pointer-events"] = "none";
      this.DOMS.DIAGRAM.REDO_BTN.style["opacity"] = 0.3;
    }
  }


  //************************************************************//
  //********* Events handlers **********************************//
  //************************************************************//
  //set all the interface events
  set_events(reload = false){

    var interface_instance = this;
    var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;
    var diagram_cy = this.DIAGRAM_INSTANCE_CY;

    if (reload){
      _elem_onclick_handle();
      return 1;
    }

    // List of options
    $( "#"+this.DOMS.WORKFLOW.OPT_TRIGGER.getAttribute('id')).on({
      click: function(e) {
        var display_val = $( "#"+interface_instance.DOMS.WORKFLOW.OPT_LIST.getAttribute('id')).css("display");
        if (display_val == "none") {
          $( "#"+interface_instance.DOMS.WORKFLOW.OPT_LIST.getAttribute('id')).css("display", "block");
        }else {
          $( "#"+interface_instance.DOMS.WORKFLOW.OPT_LIST.getAttribute('id')).css("display", "none");
        }
      }
    });


    /**
    * This function calls the "/runtime/add_unit" API to create a dipam unit of a specific <type>
    * optionally the exact element to add could be specified (<id>)
    * @param None
    */
    function __apicall_add_unit(type, unit_class = null) {
      var api_call = '/runtime/add_unit?type='+type
      if (unit_class != null) {
        api_call = api_call+"&class="+unit_class
      }
      fetch(api_call)
              .then(response => {return response.json();})
              .then(data => {
                  console.log("New node added (id = "+data["id"]+") Data = ", data);
                  //add a node to the diagram of a specific <type> with the corresponding <data>
                  diagram_instance.add_node(type, data);
                  _elem_onclick_handle();
                  diagram_instance.get_diagram_obj().nodes()[diagram_instance.get_diagram_obj().nodes().length - 1].emit('click',[]);

                  // TODO v1.0
                  //interface_instance.show_undo_redo(diagram_instance.get_undo_redo().isUndoStackEmpty(),diagram_instance.get_undo_redo().isRedoStackEmpty());
                  //diagram_instance.get_diagram_obj().nodes()[diagram_instance.get_diagram_obj().nodes().length - 1].emit('click', []);
                  //document.getElementById('edit').click();
              })
              .catch(error => {
                  console.error('[ERROR] There has been a problem in the API to create a new data unit – ', error);
              });
    }
    $('#'+this.DOMS.DIAGRAM.ADD_DATA_BTN.getAttribute('id')).on({
      click: function(e) {__build_dropdown_opts("data");}
    });
    $('#'+this.DOMS.DIAGRAM.ADD_TOOL_BTN.getAttribute('id')).on({
      click: function(e) {__build_dropdown_opts("tool");}
    });
    function __build_dropdown_opts(unit_type) {
      const ADD_UNIT_LIST = interface_instance.DOMS.DIAGRAM.ADD_UNIT_LIST;
      if (ADD_UNIT_LIST.style.display != "block") {
        fetch("/runtime/all_unit?type="+unit_type)
            .then(response => { return response.json(); })
            .then(data => {
                var html_content = "";
                for (let i = 0; i < data.length; i++) {
                  var elem = data[i];
                  html_content += '<a class="dropdown-item" data-type="'+elem.type+'" data-value="'+elem.unit_class+'">'+elem.label+'</a>';
                }
                ADD_UNIT_LIST.innerHTML = html_content;
                ADD_UNIT_LIST.style.display = "block";
                ADD_UNIT_LIST.classList.add(unit_type+"-unit");
                $("#"+ADD_UNIT_LIST.getAttribute('id')+" .dropdown-item").click(function(){
                    __apicall_add_unit(unit_type, this.getAttribute("data-value"));
                    ADD_UNIT_LIST.style.display = "none";
                });
            })
      }else {
        ADD_UNIT_LIST.style.display = "none";
      }
    }


    //the info section Nav menu
    $( "#"+this.DOMS.CONTROL.OVERVIEW_BTN.getAttribute('id')).on("click", function() {
      //interface_instance.click_overview_nav();
      diagram_instance.click_elem_style();
      $( "#"+interface_instance.DOMS.DIAGRAM.REMOVE_ELEM_CONTAINER.getAttribute('id')).css("display", "none");
    });
    $( "#"+this.DOMS.CONTROL.INFO_BTN.getAttribute('id')).on("click", function() {
      interface_instance.click_info_nav();
    });

    //the undo/redo Nav menu
    $(this.DOMS.DIAGRAM.UNDO_BTN).on("click", function() {
      diagram_instance.cy_undo_redo.undo();
      interface_instance.show_undo_redo(
                  diagram_instance.get_undo_redo().isUndoStackEmpty(),
                  diagram_instance.get_undo_redo().isRedoStackEmpty());
    });
    $(this.DOMS.DIAGRAM.REDO_BTN).on("click", function() {
      diagram_instance.cy_undo_redo.redo();
      interface_instance.show_undo_redo(
                  diagram_instance.get_undo_redo().isUndoStackEmpty(),
                  diagram_instance.get_undo_redo().isRedoStackEmpty());
    });

    //the zoom in/out Nav menu
    $(this.DOMS.DIAGRAM.ZOOMIN_BTN).on("click", function() {
      diagram_instance.zoom_in();
    });
    $(this.DOMS.DIAGRAM.ZOOMOUT_BTN).on("click", function() {
      diagram_instance.zoom_out();
    });

    //the fit diagram
    $(this.DOMS.DIAGRAM.FIT_BTN).on("click", function() {
      diagram_instance.fit_diagram();
    });


    /*The Workflow buttons and correlated events*/
    $(this.DOMS.WORKFLOW.RUN_BTN).on({
        click: function(e) {
              e.preventDefault();
              diagram_instance.fit_diagram();
              var status = interface_instance.click_run_workflow();
              setTimeout(function(){ interface_instance.handle_workflow(status,diagram_instance.build_nodes_topological_ordering()); }, 2000);
        }
    });

    $(this.DOMS.WORKFLOW.SAVE_BTN).on("click", function() {
          //e.preventDefault();
          document.getElementById('list_options_trigger').click();
          //interface_instance.click_save_workflow();
          var workflow_data = diagram_instance.get_workflow_data();
          console.log("Saving ... ",workflow_data);

          // Use the fetch API to send a POST request
          fetch("/save/workflow?time="+(new Date().getTime()).toString(), {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({workflow_data: workflow_data})
          })
          .then(response => {return response;})
          .then(data => {
            console.log('Success:', data);
            interface_instance.DOMS.WORKFLOW.SAVE_BTN_DOWNLOAD.click();
          })
          .catch(error => {console.error('Error:', error);});
    });

    $(this.DOMS.WORKFLOW.EXPORT_BTN).on("click", function() {
          console.log("Export all the work ... ");
          //document.getElementById('list_options_trigger').click();
          interface_instance.DOMS.WORKFLOW.EXPORT_BTN_DOWNLOAD.click();
    });

    $(this.DOMS.WORKFLOW.IMPORT_BTN).on("click", function() {
          console.log("Import a new work ... ");
          var form = interface_instance.DOMS.WORKFLOW.IMPORT_BTN_FORM;
          var f_input = interface_instance.DOMS.WORKFLOW.IMPORT_BTN_INPUT;

          f_input.click();
          f_input.addEventListener('change', function() {
              if (f_input.files.length > 0) {
                  form.submit();
              }
          });
    });

    // $( "#"+this.DOMS.WORKFLOW.SHUTDOWN_BTN.getAttribute('id')).on({
    //     click: function(e) {
    //       e.preventDefault();
    //       fetch('/shutdown');
    //       window.close();
    //     }
    // });

    $( "#"+this.DOMS.DIAGRAM.REMOVE_ELEM_CONTAINER.getAttribute('id')+" button").on('click', function(e){
      document.getElementById('remove_btn').click();
      $( "#"+interface_instance.DOMS.DIAGRAM.REMOVE_ELEM_CONTAINER.getAttribute('id')).css("display", "none");
    });

    _elem_onclick_handle();


    function _elem_onclick_handle(){

        //diagram on click handler
        diagram_cy.on('tap', function(event){
          // target holds a reference to the originator
          // of the event (core or element)
          var evtTarget = event.target;
          if (Object.keys(evtTarget).length == 1) {
            $( "#"+interface_instance.DOMS.CONTROL.OVERVIEW_BTN.getAttribute('id')).click();
            diagram_instance.highlight_diagram();
            interface_instance.build_info(
              diagram_instance.get_diagram(),
              'diagram'
            );
          }
        });

        //nodes on click handler
        diagram_cy.nodes().on('click', function(e){
            diagram_instance.click_elem_style(this,'node');
            // DIPAM v2.0
            diagram_instance.apply_node_compatibility(this);
            interface_instance.click_on_node(this);
            // DIPAM v2.0
            elem_remove_handler();
        });

        //edges on click handler
        diagram_cy.edges().on('click', function(e){
            //console.log("Edge clicked !", this._private.data.id,this);
            diagram_instance.click_elem_style(this,'edge');
            interface_instance.click_on_edge(this);
            elem_remove_handler();
        });

        function elem_remove_handler() {
          $( "#"+interface_instance.DOMS.DIAGRAM.REMOVE_ELEM_CONTAINER.getAttribute('id')).css("display", "block");
        }
    }

  }
}
