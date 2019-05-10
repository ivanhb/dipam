
class dipam_interface {

    constructor(diagram_instance, interface_instance) {
        this.DOMTYPE = null;
        this.OVERVIEW_SECTION = {all: {}};
        this.INFO_SECTION = {nodes: {}, edges:{}};

        this.info_section_html = "";
        this.overview_section_html = "";
        this.eventdom = {};
        this.workflow = null;

        this.DIAGRAM_INSTANCE = diagram_instance;
        this.INTERFACE_INSTANCE = interface_instance;
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
      this.DOMTYPE = {
        graphName: {elem: 'diagram', type:'input_box', elem_att: "name", intro_lbl: 'Graph name', value:''},
        edgeName:  {elem: 'edges', type:'input_box', elem_att: "name", intro_lbl: 'Edge name', value:''},
        dataName:  {elem: 'nodes', type:'input_box', elem_att: "name", intro_lbl: 'Data name', value:''},
        toolName:  {elem: 'nodes', type:'input_box', elem_att: "name", intro_lbl: 'Tool name', value:''},

        dataType: {elem: 'nodes', sub_elem: 'data', type: 'dropdown', elem_att: "data_class", intro_lbl: 'Data type', value:[], label:[]},
        toolType: {elem: 'nodes', sub_elem: 'tool', type: 'dropdown', elem_att: "function", intro_lbl: 'Tool type', value:[], label:[]},

        filePath: {elem: 'nodes', sub_elem: 'data', type:'input_file', elem_att: "source", intro_lbl: 'Select data', value:'', onchange:'select', multi:{ids:['file','dir'], param:['file','dir']} },

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
            var res = this.DIAGRAM_INSTANCE_OBJ.get_conf_elems('data', ['data_class','label']);
            this.DOMTYPE[k_dom].value = res.data_class;
            this.DOMTYPE[k_dom].label = res.label;
            break;
          case 'toolType':
            var res = this.DIAGRAM_INSTANCE_OBJ.get_conf_elems('tool', ['function','label']);
            this.DOMTYPE[k_dom].value = res.function;
            this.DOMTYPE[k_dom].label = res.label;
            break;
          default:
        }
      }
    }

    //set all the interface events
    set_events(){

      var interface_instance = this;
      var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;

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

    }


    __set__info_section_html(param){
      this.info_section_html = param;
    }

    __set__overview_section_html(param){
      this.overview_section_html = param;
    }



    __get__run_workflow_container(){
      return this.RUN_WORKFLOW;
    }

    __get__extra_workflow_container(){
      return this.WORKFLOW_EXTRA;
    }


    //build the info panel on the left
    build_overview(elem, elem_class= 'all') {
      var elem_type = elem.data.type;
      //first decide what doms should be visualized (defined in DOMTYPE)
      this.overview_section_html = this.build_section(this.OVERVIEW_SECTION[elem_class][elem_type], elem);
      //now set the events of the just added elements
      this.set_section_events(this.OVERVIEW_SECTION[elem_class][elem_type], elem);
    }

    build_info(elem, elem_class= 'nodes') {
      console.log(elem,elem_class);
      var elem_type = elem._private.data.type;
      //first decide what doms should be visualized (defined in DOMTYPE)
      this.info_section_html = this.build_section(this.INFO_SECTION[elem_class][elem_type], elem._private);
      //now set the events of the just added elements
      this.set_section_events(this.INFO_SECTION[elem_class][elem_type], elem._private);
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

      var dom_value = "";
      if ('value' in obj_dom_type) {
        dom_value = obj_dom_type.value;
      }
      if ('elem_att' in obj_dom_type) {
        if (obj_dom_type['elem_att'] in elem) {
          dom_value = elem[obj_dom_type['elem_att']];
        }
        else if (true) {
          //check maybe is in config
          var res = this.DIAGRAM_INSTANCE_OBJ.get_conf_att(elem.type, elem.value , obj_dom_type['elem_att']);
          if (res != -1) {
            dom_value = res;
          }
        }
      }

      console.log(obj_dom_type, elem, dom_value);

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
                  str_options = "<option value='"+opt_val+"' "+selected_val+">"+opt_lbl+"</option>"+str_options;

                };
                str_html = str_html + `
                <div class="input-group `+obj_dom_type.type+`">
                      <div class="input-group-prepend">
                        <label class="input-group-text">`+obj_dom_type.intro_lbl+`</label>
                      </div>
                      <select data-att-value="`+dom_value+`" data-id="`+elem.id+`" id="`+obj_dom_type.id+`" class="val-box custom-select" disabled>`+str_options+`</select>
                </div>
                `;
              }
        break;

        case 'input_file':
              str_html = str_html +`
              <div class="input-group btn-group `+obj_dom_type.type+`">
                  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">`+obj_dom_type.intro_lbl+`<span class="caret"></span></button>
                  <ul class="dropdown-menu" role="menu">
                    <li>
                        <a id="btn_`+obj_dom_type.id+`_file" onclick="document.getElementById('`+obj_dom_type.id+`_file').click()">File\/s</a>
                        <input data-id="`+elem.id+`" id="`+obj_dom_type.id+`_file" style="display: none;" multiple="true"/>
                    </li>
                    <li>
                        <a id="btn_`+obj_dom_type.id+`_dir" onclick="document.getElementById('`+obj_dom_type.id+`_dir').click()">Directory</a>
                        <input data-id="`+elem.id+`" id="`+obj_dom_type.id+`_dir" style="display: none;" webkitdirectory directory multiple="false"/>
                    </li>
                  </ul>
                  <label data-att-value="`+dom_value+`" id="lbl_`+obj_dom_type.id+`" class="val-box input-group-text" value=""></label>
              </div>
              `;
              console.log(str_html);
          break;

        case 'input_box':
          str_html = str_html + `
          <div class="input-group `+obj_dom_type.type+`">
            <div class="input-group-prepend">
              <label class="input-group-text">`+obj_dom_type.intro_lbl+`</label>
            </div>
            <input data-id="`+elem.id+`" id="`+obj_dom_type.id+`" class="val-box" data-att-value="`+dom_value+`" value="`+dom_value+`" data-temp-value="`+dom_value+`" type="text" disabled></input>
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
    set_section_events(dom_key, node){

      var interface_instance = this;
      var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;

      var dom_key_arr = dom_key.split("-");
      for (var i = 0; i < dom_key_arr.length; i++) {
        var doms_ids = [dom_key_arr[i]];
        var obj_dom = this.DOMTYPE[dom_key_arr[i]];

        //in case we got sub doms related to same element
        if ('multi' in obj_dom) {
          doms_ids = [];
          for (var j = 0; j < obj_dom.multi.ids; j++) {
            doms_ids[obj_dom.id+"_"+obj_dom.multi.ids[j]] = obj_dom.multi.param[j];
          }
        }

        //now set the events of these doms
        _set_dom_event(doms_ids);
      }

      //always do these default events
      $(document).on('keyup', 'input', function(){
          document.getElementById(this.id).setAttribute('data-temp-value',$(this).val());
      });

      function _set_dom_event(doms_ids){
        var set_of_events = {'onclick':'click','onchange':'change'};
        for (var k_event in set_of_events) {

          if (k_event in obj_dom){
            switch (obj_dom[set_of_events[k_event]]) {
              case 'edit':
                  for (var k_dom in doms_ids) {
                    $( "#"+k_dom).on(obj_dom[k_event], function() {
                      interface_instance.after_editing();
                    });
                  };
                break;
              case 'remove':
                  for (var k_dom in doms_ids) {
                    $( "#"+k_dom).on(obj_dom[k_event], function() {
                      diagram_instance.remove_elem(node._private.data.id);
                      interface_instance.after_removing();
                      interface_instance.show_undo_redo(
                        diagram_instance.get_undo_redo().isUndoStackEmpty(),
                        diagram_instance.get_undo_redo().isRedoStackEmpty()
                      );
                    });
                  };
                  break;
                case 'select':
                    for (var k_dom in doms_ids) {
                      $( "#"+k_dom).on(obj_dom[k_event], function() {
                        interface_instance.input_file_handler(doms_ids[k_dom],this, doms_ids[j]);
                      });
                    };
                    break;
              default:
            }
          }
        }
      }
    }




    input_file_handler(type, elem, id){
      document.getElementById("lbl_"+id).setAttribute('value', elem.files);
      var str = this._label_handler(type, elem, id);
      document.getElementById("lbl_"+id).innerHTML = str;

    }

    _label_handler(type, elem, id){
      var str = "";
      switch (type) {
        case 'file':
          if (elem.files.length == 1){
            str = elem.files[0].name;
          }else if (elem.files.length > 1){
            str = elem.files.length+ " files" ;
          }
          break;
        case 'dir':
          str = elem.files.length + " files from directory";
          break;
        default:
      }
      return str;
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
      var data_elem_id = editdom.getAttribute('data-id');
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
            case "input_file":
              var new_val = obj_dom.getAttribute('value');
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


  click_save_workflow(){

    var workflow_extra_container = this.__get__extra_workflow_container();

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

}
