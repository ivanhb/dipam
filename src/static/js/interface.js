class dipam_interface {

    constructor() {

      const selector = {
          DIAGRAM: {
              CONTAINER: '#cy',
              // diagram editor (add nodes)
              EDITOR_CONTAINER: '#diagram_editor',
              ADD_TOOL_BTN: '#add_tool',
              ADD_DATA_BTN: '#add_data',
              ADD_UNIT_LIST: '#list_options_unit_add',

              // undo-redo
              UNDO_REDO_CONTAINER: '#diagram_undo_redo',
              UNDO_BTN: '#undo_btn',
              REDO_BTN: '#redo_btn',
              // zoom
              ZOOM_CONTAINER: '#diagram_zoom',
              ZOOMIN_BTN: '#zoom_in_btn',
              ZOOMOUT_BTN: '#zoom_out_btn',
              // fit
              FIT_CONTAINER: '#diagram_fit',
              FIT_BTN: '#fit_btn',
              // remove elem
              REMOVE_ELEM_CONTAINER: '#remove_elem',
          },
          CONTROL: {
              GUI: '#gui',
              BASE: '#control',
              NAV_CONTAINER: '#control_nav',
              INFO_BTN: '#nav_info_a',
              OVERVIEW_BTN: '#nav_overview_a',
          },
          WORKFLOW: {
              // buttons
              OPT_TRIGGER: '#list_options_trigger',
              OPT_LIST: '#list_options_menu',
              RUN_BTN: '#btn_run_workflow',
              HELP_TOOL_BTN: '#btn_help_tool',
              SAVE_BTN: '#btn_save_workflow',
              SAVE_BTN_DOWNLOAD: '#btn_save_workflow_a',
              EXPORT_BTN: '#btn_export_work',
              EXPORT_BTN_DOWNLOAD: '#a_export_work',
              IMPORT_BTN: '#btn_import_work',
              IMPORT_BTN_FORM: '#form_import_work',
              IMPORT_BTN_INPUT: '#input_work_to_load',
              // timeline
              POPUP_CONTAINER: '#popup_container',
              TIMELINE_CONTAINER: '#timeline_container',
              START_BLOCK: '#start_block',
              END_BLOCK: '#end_block',
              // extra section
              EXTRA_CONTAINER: '#workflow_extra',
              // notifications
              NOTE_BADGE: '#badge_notification',
          }
        };

        function _create_DOM(selectors) {
          const DOM = {};
          function traverse(obj, target) {
              Object.entries(obj).forEach(([key, value]) => {
                  if (typeof value === 'object') {
                      target[key] = {};
                      traverse(value, target[key]);
                  } else {
                      Object.defineProperty(target, key, {
                          get: () => $(value)
                      });
                  }
              });
          }
          traverse(selectors, DOM);
          return DOM;
        }

        this.DOM = _create_DOM(selector);

        this.workflow = null;
        this.request_status_on = true;
        this.in_loading_status = false;

        this.init_opr();
    }
    // initial operations
    init_opr(){
      this.set_events();
      this.show_undo(false);
      this.show_redo(false);
      this.show_listoptions(false);

      // first operatios to be done on the diagram view
      diagram_instance.fit_diagram();
      diagram_instance.click_elem_style();
      this.click_on_diagram( diagram_instance.get_diagram() );
    }

    /****
    * Methods to execute on click
    ****/
    click_on_diagram(diagram_node){
      this.build_info(diagram_node,'diagram');
    }
    click_on_node(node){
      if ('_private' in node) {
        node = node._private;
      }

      // Rebuild info only if its a new node
      if (jquery2js(this.DOM.CONTROL.BASE).children.length === 0) {
        this.build_info(node,'node');
      }else{
        const CONTROL_CONTAINER = document.getElementById('control_body');
        if (CONTROL_CONTAINER.getAttribute('data-id') != node.data.id) {
          jquery2js(this.DOM.CONTROL.BASE).innerHTML = "";
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
    click_run_workflow() {
        var new_status = -1;
        var new_lbl_status = -1;
        var workflow_status = jquery2js(this.DOM.WORKFLOW.RUN_BTN).value;
        var instance = this;

        if (workflow_status == 'ready') {
          _disable_divs(true,true);
          new_status = 'run';
          new_lbl_status = '<i class="fas fa-stop me-2"></i>Stop process';

        }else if (workflow_status == 'run') {
          _disable_divs(true,false);
          new_status = 'stop';
          new_lbl_status = '<i class="fas fa-edit me-2"></i>Back to edit';

        }else if (workflow_status == 'stop') {
          _disable_divs(false,true);
          new_status = "ready";
          new_lbl_status = '<i class="fas fa-play me-2"></i>Run workflow';
        }
        _style_workflow_btn(new_status,new_lbl_status);

        return new_status;

        function _style_workflow_btn(new_status,new_lbl_status) {
          //instance.DOM.WORKFLOW.RUN_BTN.style["width"] = new_width;
          jquery2js(instance.DOM.WORKFLOW.RUN_BTN).style["opacity"] = '1';
          jquery2js(instance.DOM.WORKFLOW.RUN_BTN).style["pointer-events"] = "auto";
          jquery2js(instance.DOM.WORKFLOW.RUN_BTN).value = new_status;
          jquery2js(instance.DOM.WORKFLOW.RUN_BTN).style["background-color"] = "var(--on-"+new_status+")";
          jquery2js(instance.DOM.WORKFLOW.RUN_BTN).innerHTML = new_lbl_status;
        }
        function _disable_divs(disable,reset_timeline){
          var p_event = 'none';
          var opacity_val = '0.8';
          if (!(disable)) {
            p_event = '';
            opacity_val = '';
          }
          //set all single nodes style
          var all_nodes = diagram_instance.get_nodes();
          for (var i = 0; i < all_nodes.length; i++) {
            all_nodes[i].style({"opacity" : '0.3'});
          }

          var elements = [
            jquery2js(interface_instance.DOM.DIAGRAM.CONTAINER),
            jquery2js(interface_instance.DOM.DIAGRAM.ADD_TOOL_BTN),
            jquery2js(interface_instance.DOM.DIAGRAM.ADD_DATA_BTN),
            jquery2js(interface_instance.DOM.DIAGRAM.UNDO_REDO_CONTAINER),
            jquery2js(interface_instance.DOM.CONTROL.GUI),
            jquery2js(interface_instance.DOM.CONTROL.BASE),
            jquery2js(interface_instance.DOM.DIAGRAM.REMOVE_ELEM_CONTAINER)
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
          jquery2js(interface_instance.DOM.WORKFLOW.END_BLOCK).style.visibility = 'hidden';
        }
    }

    /****
    * Methods to build interface parts
    ****/
    build_info(elem, elem_class= 'node') {
      /* Build info will call the back end to get the html to read for generating the section */

      console.log("Elem <",elem.data.id,"> of type:",elem_class,", has been clicked. Data:", elem.data);

      /*build info only if the */
      fetch("/runtime/get_template?id="+elem.data.id)
          .then(response => { return response.json(); })
          .then(data => {
              if ( !(interface_instance.show_popupmsg(data)) ) {
                  return false;
              }
              var view_data = data["data"];

              // (1) Set HTML and Script contents
              jquery2js(this.DOM.CONTROL.BASE).innerHTML = view_data["html_content"];
              const unit_template_script = document.getElementById("unit_template_js");
              if (unit_template_script) {
                  unit_template_script.remove();
              }
              var script = document.createElement('script');
              script.id = "unit_template_js";
              if (view_data["script_content"]) {
                script.textContent = view_data["script_content"];
              }
              document.body.appendChild(script);

              // (2) if this is the first time this element is visulized;
              //  > its corresponding view value must be initialized
              if (!(elem.data.hasOwnProperty('view_value'))) {
                elem.data["view_value"] = dipam_unit_value.get_node_view_value_from_interface( elem.data.id, elem.data.type );
              }

              // (3) Run the default template operations
              dipam_unit_value.init_opr();
              dipam_unit_value.set_events();
          });
    }
    show_undo_redo(undo_empty, redo_empty){
      this.show_undo(!undo_empty);
      this.show_redo(!redo_empty);
    }
    show_undo(flag= true){
      jquery2js(this.DOM.DIAGRAM.UNDO_BTN).style["pointer-events"] = "auto";
      jquery2js(this.DOM.DIAGRAM.UNDO_BTN).style["opacity"] = 1;
      if (!(flag)) {
        jquery2js(this.DOM.DIAGRAM.UNDO_BTN).style["pointer-events"] = "none";
        jquery2js(this.DOM.DIAGRAM.UNDO_BTN).style["opacity"] = 0.3;
      }
    }
    show_redo(flag= true){
      jquery2js(this.DOM.DIAGRAM.REDO_BTN).style["pointer-events"] = "auto";
      jquery2js(this.DOM.DIAGRAM.REDO_BTN).style["opacity"] = 1;
      if (!(flag)) {
        jquery2js(this.DOM.DIAGRAM.REDO_BTN).style["pointer-events"] = "none";
        jquery2js(this.DOM.DIAGRAM.REDO_BTN).style["opacity"] = 0.3;
      }
    }
    show_popupmsg_warning(data){
      return interface_instance.show_popupmsg(data, true, false);
    }
    show_popupmsg_all(data){
      return interface_instance.show_popupmsg(data, true, true);
    }
    show_popupmsg(data, show_warning = false, show_info = false){
      var keep_process_alive = true;
      var msg_to_show = null;
      var msg_type = null;
      if (data != undefined) {
          if ("log_type" in data) {
            if ((data["log_type"] != undefined) && (data["log_type"] != null)) {
                msg_type = data["log_type"];
                if (data["log_type"] == "error") {
                    msg_to_show = "<h3>["+_upper(data["log_type"]) +"]</h3> "+ data["log_msg"];
                    keep_process_alive = false;
                }else if (data["log_type"] == "warning") {
                  if (show_warning) {
                    msg_to_show = "<h3>["+_upper(data["log_type"]) +"]</h3> "+ data["log_msg"];
                  }
                }else if (show_info) {
                  msg_to_show = "<h3>["+_upper(data["log_type"]) +"]</h3> "+ data["log_msg"];
                }

            }
          }
      }else {
        msg_type = "error";
        msg_to_show = "<h3>["+"ERROR" +"]</h3> "+ "the provided data is undefined";
        keep_process_alive = false;
      }

      if (msg_to_show != null) {
        var popup_msg_container = jquery2js(this.DOM.WORKFLOW.POPUP_CONTAINER);
        popup_msg_container.style.display = "block";
        popup_msg_container.innerHTML = msg_to_show;
        popup_msg_container.className = "text-"+msg_type;
        setTimeout(function() {
          popup_msg_container.style.display = "none";
        }, 5000);
      }
      return keep_process_alive;

      function _upper(str) {return str.toUpperCase();}
      function _lower(str) {return str.toLowerCase();}
    }
    show_removebtn(show = true) {
      if (!(show)) {show = "none";}else {show = "block";}
      jquery2js(this.DOM.DIAGRAM.REMOVE_ELEM_CONTAINER).style.display = show;
    }
    show_listoptions(show = true){
      if (!(show)) {show = "none";}else {show = "block";}
      jquery2js(this.DOM.WORKFLOW.OPT_LIST).style.display = show;
      jquery2js(this.DOM.DIAGRAM.ADD_UNIT_LIST).style.display = show;
    }
    show_addunits_list(unit_type, show = true) {
      jquery2js(this.DOM.WORKFLOW.OPT_LIST).style.display = "none";
      var ADD_UNIT_LIST = jquery2js(this.DOM.DIAGRAM.ADD_UNIT_LIST);
      if (((!(show)) || (ADD_UNIT_LIST.style.display != "none")) && (ADD_UNIT_LIST.classList.contains("list-options-"+unit_type))) {
        ADD_UNIT_LIST.style.display = "none";
        return 0;
      }else {
        fetch("/runtime/units?type="+unit_type)
            .then(response => { return response.json(); })
            .then(data => {

                var family = {};
                for (let i = 0; i < data.length; i++) {
                  var elem = data[i];
                  if (!(elem.family in family)) {
                    family[elem.family] = [];
                  }
                  family[elem.family].push('<li><a class="dropdown-additem" data-type="'+elem.type+'" data-value="'+elem.unit_class+'">'+elem.label+'</a></li>');
                }

                var html_content = "";
                for (const _f in family) {
                  html_content += "<li class='li-header'>"+_f.toUpperCase()+"</li>" + family[_f].join('');
                }

                ADD_UNIT_LIST.innerHTML = "<ul>"+html_content+"</ul>";
                ADD_UNIT_LIST.style.display = "block";
                ADD_UNIT_LIST.className = "list-options list-options-"+unit_type;
                $(ADD_UNIT_LIST).width($('#diagram_elems').width());

                $(".dropdown-additem").on("click", function() {

                    fetch('/runtime/add_unit?type='+this.getAttribute("data-type")+"&class="+this.getAttribute("data-value"))
                            .then(response => {return response.json();})
                            .then(data => {
                                console.log("New node added (id = "+data["id"]+") Data = ", data);
                                if (! (interface_instance.show_popupmsg(data)) ) {
                                    return false;
                                }
                                //add a node to the diagram of a specific <type> with the corresponding <data>
                                diagram_instance.add_node(type, data);
                                // update diagram events (e.g. clicks)
                                interface_instance.diagram_onclick_handler();

                                // Click the added node (last one added)
                                const cy_nodes = diagram_instance.get_diagram_cy().nodes();
                                cy_nodes[cy_nodes.length - 1].select();
                                cy_nodes[cy_nodes.length - 1].emit('click',[]);

                                // Fit the diagram
                                //diagram_instance.fit_diagram();

                                ADD_UNIT_LIST.style.display = "none";
                            })
                            .catch(error => {
                                interface_instance.show_popupmsg({
                                    "data": null,
                                    "log_type": "error",
                                    "log_msg": "Error in the DIPAM API while creating a new data unit – "+error
                                });
                            });
                });
            })
      }
    }

    /****
    * Methods to create event handlers
    ****/
    set_events(reload = false){

      this.diagram_onclick_handler();
      // if (reload){return 1;}

      // List of options
      this.DOM.WORKFLOW.OPT_TRIGGER.on({
        click: function(e) {
          interface_instance.DOM.DIAGRAM.ADD_UNIT_LIST.css("display", "none");
          const display_val = interface_instance.DOM.WORKFLOW.OPT_LIST.css("display");
          if (display_val == "none") {
            interface_instance.DOM.WORKFLOW.OPT_LIST.css("display", "block");
          }else {
            interface_instance.DOM.WORKFLOW.OPT_LIST.css("display", "none");
          }
        }
      });
      this.DOM.DIAGRAM.ADD_DATA_BTN.on({
        click: function(e) {interface_instance.show_addunits_list("data");}
      });
      this.DOM.DIAGRAM.ADD_TOOL_BTN.on({
        click: function(e) {interface_instance.show_addunits_list("tool");}
      });

      //the info section Nav menu
      this.DOM.CONTROL.OVERVIEW_BTN.on("click", function() {
        diagram_instance.click_elem_style();
        interface_instance.DOM.DIAGRAM.REMOVE_ELEM_CONTAINER.css("display", "none");
      });
      this.DOM.CONTROL.INFO_BTN.on("click", function() {
        interface_instance.click_info_nav();
      });

      //the undo/redo Nav menu
      this.DOM.DIAGRAM.UNDO_BTN.on("click", function() {
        diagram_instance.cy_undo_redo.undo();
        interface_instance.show_undo_redo(
                    diagram_instance.get_undo_redo().isUndoStackEmpty(),
                    diagram_instance.get_undo_redo().isRedoStackEmpty());
      });
      this.DOM.DIAGRAM.REDO_BTN.on("click", function() {
        diagram_instance.cy_undo_redo.redo();
        interface_instance.show_undo_redo(
                    diagram_instance.get_undo_redo().isUndoStackEmpty(),
                    diagram_instance.get_undo_redo().isRedoStackEmpty());
      });

      //the zoom in/out Nav menu
      this.DOM.DIAGRAM.ZOOMIN_BTN.on("click", function() {
        diagram_instance.zoom_in();
      });
      this.DOM.DIAGRAM.ZOOMOUT_BTN.on("click", function() {
        diagram_instance.zoom_out();
      });

      //the fit diagram
      this.DOM.DIAGRAM.FIT_BTN.on("click", function() {
        diagram_instance.fit_diagram();
      });

      /*The Workflow buttons and correlated events*/
      this.DOM.WORKFLOW.RUN_BTN.on({
          click: function(e) {
                e.preventDefault();
                diagram_instance.fit_diagram();
                var status = interface_instance.click_run_workflow();
                console.log(diagram_instance.cy_topological_sort());
                //setTimeout(function(){ interface_instance.handle_workflow(status,diagram_instance.build_nodes_topological_ordering()); }, 2000);
          }
      });

      this.DOM.WORKFLOW.SAVE_BTN.on("click", function() {
            //e.preventDefault();
            document.getElementById('list_options_trigger').click();
            var _data = diagram_instance.save_workflow( true, interface_instance.show_popupmsg_warning);
      });

      this.DOM.WORKFLOW.EXPORT_BTN.on("click", function() {
            console.log("Export all the work ... ");
            //document.getElementById('list_options_trigger').click();
            jquery2js(interface_instance.DOM.WORKFLOW.EXPORT_BTN_DOWNLOAD).click();
      });

      this.DOM.WORKFLOW.IMPORT_BTN.on("click", function() {
            console.log("Import a new work ... ");
            var form = jquery2js(interface_instance.DOM.WORKFLOW.IMPORT_BTN_FORM);
            var f_input = jquery2js(interface_instance.DOM.WORKFLOW.IMPORT_BTN_INPUT);

            f_input.click();
            f_input.addEventListener('change', function() {
                if (f_input.files.length > 0) {
                    form.submit();
                }
            });
      });
    }
    diagram_onclick_handler() {

        var diagram_cy_instance = diagram_instance.get_diagram_cy();

        //diagram on click handler
        diagram_cy_instance.on('tap', function(event){
          if (Object.keys(event.target).length == 1) {
            let diagram_node = diagram_instance.get_diagram();
            diagram_instance.click_elem_style();
            interface_instance.show_listoptions(false);
            interface_instance.click_on_diagram(diagram_node);
            interface_instance.show_removebtn(false);
          }
        });

        //nodes on click handler
        diagram_cy_instance.nodes().on('click', function(e){
            diagram_instance.click_elem_style(this,'node');
            diagram_instance.apply_node_compatibility(this);
            interface_instance.show_listoptions(false);
            interface_instance.click_on_node(this);
            interface_instance.show_removebtn(true);
        });

        //edges on click handler
        diagram_cy_instance.edges().on('click', function(e){
            diagram_instance.click_elem_style(this,'edge');
            interface_instance.show_listoptions(false);
            interface_instance.click_on_edge(this);
            interface_instance.show_removebtn(true);
        });
    }
}
