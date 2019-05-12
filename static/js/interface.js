class dipam_interface {

    constructor() {
        this.DOMTYPE = null;
        this.OVERVIEW_SECTION = {all: {}};
        this.INFO_SECTION = {nodes: {}, edges:{}};

        this.info_section_html = "";
        this.info_section_elem = {};
        this.overview_section_html = "";
        this.overview_section_elem = {};

        this.eventdom = {};
        this.workflow = null;

        this.DIAGRAM_INSTANCE_OBJ = null;

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
        this.SAVE_WORKFLOW = document.getElementById('btn_save_workflow');
        this.LOAD_WORKFLOW = document.getElementById('btn_load_workflow');
        this.TIMELINE_CONTAINER = document.getElementById('timeline_container');
        this.START_BLOCK = document.getElementById('start_block');
        this.TIMELINE_TEXT = document.getElementById('timeline_text');
        this.UNDO_BTN = document.getElementById('undo_btn');
        this.REDO_BTN = document.getElementById('redo_btn');
        this.DIAGRAM_ZOOM_CONTAINER= document.getElementById('diagram_zoom');
        this.ZOOMIN_BTN = document.getElementById('zoom_in_btn');
        this.ZOOMOUT_BTN = document.getElementById('zoom_out_btn');
        this.WORKFLOW_EXTRA = document.getElementById('workflow_extra');
    }

    set_corresponding_diagram(diagram){
      this.DIAGRAM_INSTANCE_OBJ = diagram;
      this.DIAGRAM_INSTANCE_CY = diagram.get_diagram_obj();
      //set values inside according to the given diagram
      /* ------------------------
      <elem>: 'nodes', 'edges', or 'diagram'
      <type>: the dom type
      <intro_lbl>: the intro label for the corresponding element
      <value>: the value should be a speicifc field of <elem>
      -------------------------- */
      /* The DOM types are:
      (1) input_box
      (2) dropdown: <elem_att>
      (3) input_file: <elem_att>
      (4) button: <action>
      */
      /*
        In case it modify one of the DIAGRAM-ELEMENT attribute this should be specified in [elem_att]. e.g: [name]
        Otherwise if it modifies an attribute associated to its config type, then [elem_att] should not be defined
      */
      this.DOMTYPE = {
        graphName: {elem: 'diagram', type:'input_box', elem_att: "name", intro_lbl: 'Graph name', value:''},
        edgeName:  {elem: 'edges', type:'input_box', elem_att: "name", intro_lbl: 'Edge name', value:''},
        dataName:  {elem: 'nodes', type:'input_box', elem_att: "name", intro_lbl: 'Data name', value:''},
        toolName:  {elem: 'nodes', type:'input_box', elem_att: "name", intro_lbl: 'Tool name', value:''},

        dataType: {elem: 'nodes', sub_elem: 'data', type: 'dropdown', intro_lbl: 'Data type', value:[], label:[], onchange:'dropdown'},
        toolType: {elem: 'nodes', sub_elem: 'tool', type: 'dropdown', intro_lbl: 'Tool type', value:[], label:[], onchange:'dropdown'},

        filePath: {elem: 'nodes', sub_elem: 'data', type:'input_file', elem_att: "file_source", intro_lbl: 'Select data', value:'', onchange:'fileselect' },

        //keep always these two DOMs
        editElem: {position: 'foot', type:'button', class:'btn btn-light', intro_lbl: 'Edit properties', value:'editoff', onclick:'edit'},
        removeElem: {position: 'foot', type:'button', class:'btn btn-light', intro_lbl: 'Remove element', value:'', onclick:'remove'}
      };

      //what to integrate in each section
      this.OVERVIEW_SECTION.all.diagram = "graphName-editElem";
      this.INFO_SECTION.nodes["tool"] = "toolName-toolType-editElem-removeElem";
      this.INFO_SECTION.nodes["data"] = "dataName-dataType-filePath-editElem-removeElem";
      this.INFO_SECTION.edges["edge"] = "edgeName-removeElem";

      //init the values of each DOM element
      for (var k_dom in this.DOMTYPE) {
        switch (k_dom) {
          case 'dataType':
            var res = this.DIAGRAM_INSTANCE_OBJ.get_conf_elems('data', ['[KEY]','label']);
            this.DOMTYPE[k_dom].value = res['[KEY]'];
            this.DOMTYPE[k_dom].label = res.label;
            break;
          case 'toolType':
            var res = this.DIAGRAM_INSTANCE_OBJ.get_conf_elems('tool', ['[KEY]','label']);
            this.DOMTYPE[k_dom].value = res['[KEY]'];
            this.DOMTYPE[k_dom].label = res.label;
            break;
          default:
        }
      }
    }


    //build the info panel on the left
    build_overview(elem, elem_class= 'all') {
      var elem_type = elem.data.type;
      //first decide what doms should be visualized (defined in DOMTYPE)
      this.overview_section_html = this.build_section(this.OVERVIEW_SECTION[elem_class][elem_type], elem);
      this.overview_section_elem['elem'] = elem;
      this.overview_section_elem['elem_class'] = elem_class;
    }

    build_info(elem, elem_class= 'nodes') {
      if('_private' in elem)
        elem = elem._private;
      var elem_type = elem.data.type;
      //first decide what doms should be visualized (defined in DOMTYPE)
      this.info_section_html = this.build_section(this.INFO_SECTION[elem_class][elem_type], elem);
      this.info_section_elem['elem'] = elem;
      this.info_section_elem['elem_class'] = elem_class;
    }


    build_section(dom_key, elem){

      var interface_instance = this;
      var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;

      var str_html= "";
      var dom_key_arr = dom_key.split("-");
      var doms_positions = ['head','body','foot'];
      for (var i = 0; i < doms_positions.length; i++) {
        //set each different position
        var a_pos = doms_positions[i];
        str_html = str_html + '<div id="control_'+a_pos+'">';

        //for each position populate it with corresponding doms
        for (var j = 0; j < dom_key_arr.length; j++) {
          var obj_dom = this.DOMTYPE[dom_key_arr[j]];
          if (!('position' in obj_dom)) {
            obj_dom['position'] = 'body';
          }
          if (obj_dom.position == a_pos) {
            obj_dom['id'] = dom_key_arr[j];
            str_html = str_html + this.build_a_dom(obj_dom, elem.data);
          }
        }

        //close position section
        str_html = str_html + '</div>';
      }
      return str_html;
    }
    //build a specific dom
    build_a_dom(obj_dom_type, elem){
      var str_html= "";

      var att_key = 'value';
      if ('elem_att' in obj_dom_type) {
        att_key = obj_dom_type['elem_att'];
      }
      var dom_value = elem[att_key];

      switch (obj_dom_type.type) {
        /* Attributes needed are: <value>:Array, <label>:Array */
        case 'dropdown':
              if(obj_dom_type.sub_elem == elem.type){
                var str_options = "";
                for (var j = 0; j < obj_dom_type.value.length; j++) {
                  var opt_val = obj_dom_type.value[j];
                  var opt_lbl = obj_dom_type.label[j];
                  var selected_val = "";
                  if (opt_val == dom_value) {
                    selected_val = "selected";
                  }
                  str_options = "<option data-select-target='"+obj_dom_type.id+"' value='"+opt_val+"' "+selected_val+">"+opt_lbl+"</option>"+str_options;

                };
                str_html = str_html + `
                <div class="input-group `+obj_dom_type.type+`">
                      <div class="input-group-prepend">
                        <label class="input-group-text">`+obj_dom_type.intro_lbl+`</label>
                      </div>
                      <select data-att-value="`+dom_value+`" data-id="`+elem.id+`" id="`+obj_dom_type.id+`" class="save-value custom-select" disabled>`+str_options+`</select>
                </div>
                `;
              }
        break;

        case 'input_file':
              var str_options = `<option id='`+obj_dom_type.id+`_optfile' value='file' selected>File\/s</option>
                                <option id='`+obj_dom_type.id+`_optdir' value='dir'>Directory</option>`;

              str_html = str_html +`
              <div class="input-group btn-group `+obj_dom_type.type+`">
                  <div class="input-group-prepend">
                    <label class="input-group-text">`+obj_dom_type.intro_lbl+`</label>
                  </div>
                  <select data-att-value="`+dom_value+`" data-id="`+elem.id+`" id="`+obj_dom_type.id+`" class="save-value custom-select" disabled>`+str_options+`</select>

                  <input data-id="`+elem.id+`" type="file" id="`+obj_dom_type.id+`_file" style="display: none;" multiple="true"/>
                  <input data-id="`+elem.id+`" type="file" id="`+obj_dom_type.id+`_dir" style="display: none;" webkitdirectory directory multiple="false"/>

                  <label id="`+obj_dom_type.id+`__lbl" class="input-group-text" value="">`+this.label_handler(obj_dom_type.id, {elem: dom_value, type: 'file'})+`</label>
              </div>
              `;
          break;

        case 'input_box':
          str_html = str_html + `
          <div class="input-group `+obj_dom_type.type+`">
            <div class="input-group-prepend">
              <label class="input-group-text">`+obj_dom_type.intro_lbl+`</label>
            </div>
            <input data-id="`+elem.id+`" id="`+obj_dom_type.id+`" class="save-value" data-att-value="`+dom_value+`" value="`+dom_value+`" data-att-value="`+dom_value+`" type="text" disabled></input>
          </div>
          `;
          break;

        case 'button':
          str_html = str_html + '<div class="foot-dom '+obj_dom_type.type+'"><button id="'+obj_dom_type.id+'" type="button" data-id="'+elem.id+'" class="btn btn-light" data-att-value="'+dom_value+'">'+obj_dom_type.intro_lbl+'</button></div>';
          break;
      }

      return str_html;
    }

    //set and define the events for the elements added in the section panel
    set_section_events(dom_key, elem){

      if ('_private' in elem) {
        elem = elem._private;
      }

      var interface_instance = this;
      var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;

      var dom_key_arr = dom_key.split("-");
      for (var i = 0; i < dom_key_arr.length; i++) {
        var obj_dom = this.DOMTYPE[dom_key_arr[i]];
        this.set_dom_event(obj_dom, elem);
      }

      //always do these default events
      $(document).on('keyup', 'input', function(){
          //document.getElementById(this.id).setAttribute('data-temp-value',$(this).val());
          document.getElementById(this.id).setAttribute('data-att-value',$(this).val());
      });
    }

    set_dom_event(a_dom_obj, corresponding_elem = null){
      var interface_instance = this;
      var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;

      if ('_private' in corresponding_elem) {
        corresponding_elem = corresponding_elem._private;
      }

      var set_of_events = {'onclick':'click','onchange':'change'};
      for (var k_event in set_of_events) {
        //check each event if is inside the DOM object
        if (k_event in a_dom_obj){
          var event_val = a_dom_obj[k_event];
          var event_key = set_of_events[k_event];

          //now switch according to the event value
          switch (event_val) {
            //Edit the fields in the section
            case 'edit':
              $( "#"+a_dom_obj.id).on("click", function() {
                interface_instance.editing();
              });
              break;
            case 'cancel':
              $( "#"+a_dom_obj.id).on("click", function() {
                interface_instance.editing("cancel");
              });
              break;
            case 'save':
              $( "#"+a_dom_obj.id).on("click", function() {
                interface_instance.reload_control_section(
                    diagram_instance.update_elem(corresponding_elem.data.id,
                    interface_instance.editing("save")));
              });
              break;
            //Remove an element from the CY
            case 'remove':
                $( "#"+a_dom_obj.id).on(event_key, function() {
                    diagram_instance.remove_elem(corresponding_elem.data.id);
                    interface_instance.removing();
                    interface_instance.show_undo_redo(
                      diagram_instance.get_undo_redo().isUndoStackEmpty(),
                      diagram_instance.get_undo_redo().isRedoStackEmpty()
                    );
                });
                break;
            case 'dropdown':
                  $( "#"+a_dom_obj.id).on(event_key, function(){
                      var arr_option_selected = $("#"+a_dom_obj.id+" option:selected");
                      if (arr_option_selected.length > 0) {
                        this.setAttribute('data-att-value',arr_option_selected[0].value)
                      }
                  });
                  break;
            case 'fileselect':
                  $( "#"+a_dom_obj.id).on(event_key, function(){
                      var arr_option_selected = $("#"+a_dom_obj.id+" option:selected");
                      if (arr_option_selected.length > 0) {
                        var opt_value = arr_option_selected[0].value;
                        console.log(opt_value);
                        $('#'+a_dom_obj.id+"_"+opt_value).trigger('click');
                      }
                  });

                  var a_dom_obj_lbl = document.getElementById(a_dom_obj.id+"__lbl");

                  $( "#"+a_dom_obj.id+"_file").on(event_key, function(){
                    if(this.files){
                        console.log(this.files);
                        var corresponding_lbl = interface_instance.label_handler(a_dom_obj.id, {elem: this, type: 'file'});
                        $( "#"+a_dom_obj.id)[0].setAttribute('data-att-value',corresponding_lbl);
                        a_dom_obj_lbl.innerHTML = corresponding_lbl;
                    }
                  });
                  $( "#"+a_dom_obj.id+"_dir").on(event_key, function(){
                    if(this.files){
                        console.log(this.files);
                        var corresponding_lbl = interface_instance.label_handler(a_dom_obj.id, {elem: this, type: 'dir'});
                        $("#"+a_dom_obj.id)[0].setAttribute('data-att-value',corresponding_lbl);
                        a_dom_obj_lbl.innerHTML = corresponding_lbl;
                    }
                  });

                  break;

            default:
          }
        }
      }
    }

    label_handler(dom_id, param){
      var str = "";
      switch (dom_id) {
        case 'filePath':
            if (param.elem.files != undefined) {
              switch (param.type) {
                case 'file':
                  if (param.elem.files.length == 1){
                    str = param.elem.files[0].name;
                  }else if (param.elem.files.length > 1){
                    str = param.elem.files.length+ " files" ;
                  }
                  break;
                case 'dir':
                  str = param.elem.files.length + " files from directory";
                  break;
                default:
              }
              break;
            }
        default:
      }
      return str;
    }


    click_on_node(node){
      if ('_private' in node) {
        node = node._private;
      }
      this.build_info(node,'nodes');
      this.click_info_nav();
    }

    click_on_edge(edge){
      if ('_private' in edge) {
        edge = edge._private;
      }
      this.build_info(edge, 'edges');
      this.click_info_nav();
    }

    click_info_nav() {
      this.switch_nav('nav_info');
      this.CONTROL_CONTAINER.innerHTML = this.info_section_html;
      var info_elem = this.info_section_elem;
      this.set_section_events(this.INFO_SECTION[info_elem.elem_class][info_elem.elem.data.type], info_elem.elem);
    }

    click_overview_nav() {
      this.switch_nav('nav_overview');
      this.CONTROL_CONTAINER.innerHTML = this.overview_section_html;
      var overview_elem = this.overview_section_elem;
      this.set_section_events(this.OVERVIEW_SECTION[overview_elem.elem_class][overview_elem.elem.data.type], overview_elem.elem);
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
      this.click_overview_nav();
    }

    editing(action = null){
      this._switch_edit_doms();
      return this.set_edit_section(action);
    }

    _switch_edit_doms(){
      var current_flag = false;
      var arr_doms_toedit = document.getElementsByClassName('save-value');
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

    set_edit_section(action = null){
      var res = 1;
      var editdom = document.getElementById('editElem');
      var data_elem_id = editdom.getAttribute('data-id');
      var original_inner_html = editdom.innerHTML;
      editdom.style.visibility = 'hidden';

      var edit_value = editdom.getAttribute('value');

      //if i am not yet in editing mode then the edit section should be built first
      if (edit_value == 'editon') {
        var two_buttons_dom = `<span id="edit_buttons" class="foot-dom">
                               <span><button id='edit_cancel' type='button' class='btn btn-default edit-switch'>Cancel</button></span>
                               <span>
                               <button id='edit_save' type='button' class='btn btn-default edit-switch'>Save</button></span>
                               </span>`;
        editdom.parentNode.innerHTML = two_buttons_dom + editdom.parentNode.innerHTML;
        //set events
        var corresponding_elem = this.DIAGRAM_INSTANCE_OBJ.get_gen_elem_by_id(data_elem_id);
        console.log(corresponding_elem);
        this.set_dom_event({id:'edit_cancel', onclick: 'cancel'}, corresponding_elem);
        this.set_dom_event({id:'edit_save', onclick: 'save'}, corresponding_elem);

      }else {
        //I am already in editing mode (the edit section have been already built)
        //check what action I should take now

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
            res = this.save();
            console.log(res);
            break;
          default:
        }
      }
      return res;
    }

    reload_control_section(new_elem = null){

      var active_nav = this.get_active_nav();

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
          if ('_private' in new_elem) {
            new_elem = new_elem._private;
          }
          this.build_info(new_elem);
        }
        document.getElementById('nav_info_a').click();
        //this.click_info_nav();
      }
    }

    save() {
      var arr_modified_doms = document.getElementsByClassName('save-value');

      var res_value = {};
      for (var i = 0; i < arr_modified_doms.length; i++) {
        var obj_dom = arr_modified_doms[i];
        var dom_def = this.DOMTYPE[obj_dom.getAttribute('id')];
        var ele_target_att = 'value';
        if ('elem_att' in dom_def) {
          ele_target_att = dom_def.elem_att;
        }
        res_value[ele_target_att] = obj_dom.getAttribute('data-att-value');
      }
      console.log(res_value);
      return res_value;
    }

  click_save_workflow(){

    var workflow_extra_container = this.WORKFLOW_EXTRA;

    workflow_extra_container.style.visibility = 'visible';
    workflow_extra_container.innerHTML = _save_section();

    $('#btn_dir_select').on({
        click: function(e) {
          e.preventDefault();
          $('#file_to_load').trigger('click');
        }
    });

    $('#dir_to_save_in').on({
        change: function(e) {
          console.log($('#dir_to_save_in')[0]);
        }
    });

    $('#btn_cancel_save').on({
        click: function(e) {
          workflow_extra_container.innerHTML =  "";
          workflow_extra_container.style.visibility = 'hidden';
        }
    });

    function _save_section(){
      return `<div id="workflow_save">
            <div class="input-group">
                  <button id="btn_dir_select" type="button" value="" class="btn btn-default">Choose directory</button>
                  <input id="dir_to_save_in" type="file" webkitdirectory mozdirectory msdirectory odirectory directory multiple="multiple" style="display: none;"></input>
                  <div class="input-group-prepend"><label class="input-group-text">Choose a name: </label></div>
                  <input id="input_workflow_save_name" type="text"></input>
            </div>
            <div class="panel-foot">
                  <button id="btn_cancel_save" type="button" value="" class="btn btn-default">Cancel</button>
                  <button id="btn_apply_save" type="button" value="" class="btn btn-default">Save workflow</button>
            </div>
        </div>`;
    }
  }
  click_load_workflow(){

  }


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
      var workflow_to_process = this.workflow;
      var index_processed = {};
      //process workflow
      _process_workflow(this,0);

    }else if (status == 'stop') {
      //Stop the execution and abort all the running functions"
      console.log("Stop the execution and abort all the running functions");
    }

    function _process_workflow(instance,i){

            var w_elem = workflow_to_process[i];

            console.log("Processing: ", workflow_to_process[i]);
            //call the server
            var data_to_post = {
              id: w_elem.id,
              method: w_elem.method,
              type: w_elem.type,
              param: "",
              input: JSON.stringify(w_elem.input),
              output: JSON.stringify(w_elem.output)
            };
            $.post( "/process",data_to_post).done(function() {
              instance.add_timeline_block(w_elem.id);
              //process next node
              if (i == workflow_to_process.length - 1) {
                console.log("Done All !!");
              }else {
                _process_workflow(instance,i+1);
              }
            });
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


  //************************************************************//
  //********* Events handlers **********************************//
  //************************************************************//
  //set all the interface events
  set_events(reload = false){

    if (reload){
      _elem_onclick_handle();
      return 1;
    }

    var interface_instance = this;
    var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;
    var diagram_cy = this.DIAGRAM_INSTANCE_CY;


    //ADD Node and Tool Buttons
    $('#'+this.ADD_DATA.getAttribute('id')).on({
      click: function(e) {
        diagram_instance.add_node('data');
        _elem_onclick_handle();
        interface_instance.show_undo_redo(diagram_instance.get_undo_redo().isUndoStackEmpty(),diagram_instance.get_undo_redo().isRedoStackEmpty());
        diagram_instance.get_diagram_obj().nodes()[diagram_instance.get_diagram_obj().nodes().length - 1].emit('click', []);
        document.getElementById('editElem').click();
      }
    });
    $('#'+this.ADD_TOOL.getAttribute('id')).on({
      click: function(e) {
        diagram_instance.add_node('tool');
        _elem_onclick_handle();
        interface_instance.show_undo_redo(diagram_instance.get_undo_redo().isUndoStackEmpty(),diagram_instance.get_undo_redo().isRedoStackEmpty());
        diagram_instance.get_diagram_obj().nodes()[diagram_instance.get_diagram_obj().nodes().length - 1].emit('click', []);
        document.getElementById('editElem').click();
      }
    });


    //the info section Nav menu
    $( "#"+this.NAV_OVERVIEW.getAttribute('id')).on("click", function() {
      interface_instance.click_overview_nav();
    });
    $( "#"+this.NAV_INFO.getAttribute('id')).on("click", function() {
      interface_instance.click_info_nav();
    });

    //the undo/redo Nav menu
    $( "#"+this.UNDO_BTN.getAttribute('id')).on("click", function() {
      diagram_instance.cy_undo_redo.undo();
      interface_instance.show_undo_redo(
                  diagram_instance.get_undo_redo().isUndoStackEmpty(),
                  diagram_instance.get_undo_redo().isRedoStackEmpty());
    });
    $( "#"+this.REDO_BTN.getAttribute('id')).on("click", function() {
      diagram_instance.cy_undo_redo.redo();
      interface_instance.show_undo_redo(
                  diagram_instance.get_undo_redo().isUndoStackEmpty(),
                  diagram_instance.get_undo_redo().isRedoStackEmpty());
    });

    //the zoom in/out Nav menu
    $( "#"+this.ZOOMIN_BTN.getAttribute('id')).on("click", function() {
      diagram_instance.zoom_in();
    });
    $( "#"+this.ZOOMOUT_BTN.getAttribute('id')).on("click", function() {
      diagram_instance.zoom_out();
    });


    /*The Workflow buttons and correlated events*/
    $( "#"+this.RUN_WORKFLOW.getAttribute('id')).on({
        click: function(e) {
              e.preventDefault();
              interface_instance.click_run_workflow();
              var status = this.value;
              setTimeout(function(){ interface_instance.handle_workflow(status,diagram_instance.build_nodes_topological_ordering()); }, 2000);
        }
    });

    $( "#"+this.SAVE_WORKFLOW.getAttribute('id')).on({
        click: function(e) {
          e.preventDefault();
          interface_instance.click_save_workflow();

          $('#btn_apply_save').on({
              click: function(e) {
                var input_text = document.getElementById("input_workflow_save_name").getAttribute("temp_value");
                if ((input_text != "" ) && (input_text != null)){
                  var workflow_data = diagram_instance.get_workflow_data();
                  $.post( "/saveworkflow", {
                    workflow_data: JSON.stringify(workflow_data),
                    path: "",
                    name: input_text,
                    load: "off"
                  });
                  interface_instance.WORKFLOW_EXTRA.style.visibility = 'hidden';
                }else {
                  //params not ok
                }
              }
          });

        }
    });

    $( "#"+this.LOAD_WORKFLOW.getAttribute('id')).on({
        click: function(e) {
          e.preventDefault();
          $('#file_to_load').trigger('click');
        }
    });
    $('#file_to_load').on({
        change: function(e) {
          var file = $('#file_to_load')[0].files[0];
          if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function(e) {
                var result = e.target.result;
                //console.log(result);
                $.post( "/loadworkflow", {
                  workflow_file: result
                }).done(function() {
                  //$.get("/");
                  location.reload();
                });
            };
          }
        }
    });

    _elem_onclick_handle();

    function _elem_onclick_handle(){
        //nodes on click handler
        diagram_cy.nodes().on('click', function(e){
            console.log("Node clicked !", this);
            diagram_instance.click_elem_style(this,'node');
            diagram_instance.check_node_compatibility(this);
            interface_instance.click_on_node(this);
        });

        //edges on click handler
        diagram_cy.edges().on('click', function(e){
            console.log("Edge clicked !", this);
            diagram_instance.click_elem_style(this,'edge');
            interface_instance.click_on_edge(this);
        });
      }

  }


}
