

workflow = JSON.parse(decode_json(workflow));
config = JSON.parse(decode_json(config));


//init the diagram
var diagram_instance = new dipam_diagram("cy", config, "Dipam for Catarsi", workflow);
var cy = diagram_instance.get_diagram_obj();
//window.cy = cy;


//create an instance of the interface, it takes:
// The configuration file
// The string name of the diagram instance (which it will be created later)
// The string name of the interface instance (the variable name)
var vw_interface = new dipam_interface("diagram_instance", "vw_interface");
vw_interface.set_corresponding_diagram(diagram_instance)
vw_interface.set_events();
console.log(vw_interface);





//************************************************************//
//********* First Define the Events handlers *****************//
//************************************************************//

//add the edges event handler
var eh = cy.edgehandles();
this.cy.on('ehshow', (event, sourceNode) => {
      if (sourceNode._private.selected == false) {
        eh.hide();
      }
});



$('#add_data').on({
  click: function(e) {
    diagram_instance.add_node('data');
    elem_onclick_handle();
    vw_interface.show_undo_redo(diagram_instance.get_undo_redo().isUndoStackEmpty(),diagram_instance.get_undo_redo().isRedoStackEmpty());
    diagram_instance.get_diagram_obj().nodes()[diagram_instance.get_diagram_obj().nodes().length - 1].emit('click', []);
    editdom = document.getElementById('editElem').click();
  }
});

$('#add_tool').on({
  click: function(e) {
    diagram_instance.add_node('tool');
    elem_onclick_handle();
    vw_interface.show_undo_redo(diagram_instance.get_undo_redo().isUndoStackEmpty(),diagram_instance.get_undo_redo().isRedoStackEmpty());
    diagram_instance.get_diagram_obj().nodes()[diagram_instance.get_diagram_obj().nodes().length - 1].emit('click', []);
    editdom = document.getElementById('editElem').click();
  }
});

//vw_interface.__get__run_workflow_container().setAttribute("onclick","vw_interface.click_run_workflow();vw_interface.handle_workflow(this.value,diagram_instance.build_workflow());");
$('#btn_run_workflow').on({
    click: function(e) {
          e.preventDefault();
          vw_interface.click_run_workflow();
          var status = this.value;
          setTimeout(function(){ vw_interface.handle_workflow(status,diagram_instance.build_nodes_topological_ordering()); }, 2000);
    }
});

$('#btn_save_workflow').on({
    click: function(e) {
      e.preventDefault();
      vw_interface.click_save_workflow();

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
              vw_interface.__get__extra_workflow_container().style.visibility = 'hidden';
            }else {
              //params not ok
            }
          }
      });

    }
});

$('#btn_load_workflow').on({
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
            result = e.target.result;
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


//nodes on click handler
elem_onclick_handle();

//define all events handling functions
function elem_onclick_handle(){
  //nodes on click handler
  cy.nodes().on('click', function(e){
      console.log(this);
      diagram_instance.click_elem_style(this,'node');
      diagram_instance.check_node_compatibility(this);
      vw_interface.click_on_node(this._private.data);
  });

  //edges on click handler
  cy.edges().on('click', function(e){
      console.log(this);
      diagram_instance.click_elem_style(this,'edge');
      vw_interface.click_on_edge(this._private.data);
  });
}


//******************************************//
//********** First Operations **************//
//******************************************//

//vw_interface.build_overview(diagram_instance.get_gen_elem('diagram'));
//vw_interface.click_overview_nav();

vw_interface.build_info(diagram_instance.get_gen_elem('data')[0], "nodes");
vw_interface.click_info_nav();

function decode_json(text){
  //var msg = decodeURIComponent(text.replace(/\+/g, '%20')+'');
  var msg = text;
  var parser = new DOMParser;
  var dom = parser.parseFromString('<!doctype html><body>' + msg,'text/html');
  msg = dom.body.textContent;
  msg = msg.replace(/'/g, '"');
  return msg;
}
