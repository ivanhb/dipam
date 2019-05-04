

workflow = JSON.parse(decode_json(workflow));
config = JSON.parse(decode_json(config));


//create an instance of the interface, it takes:
// The configuration file
// The string name of the diagram instance (which it will be created later)
// The string name of the interface instance (the variable name)
var vw_interface = new dipam_interface(config, "diagram_instance", "vw_interface");

//init the interface
vw_interface.init_interface_events();

//init the diagram
var diagram_instance = new dipam_diagram("cy", config, "Dipam for Catarsi", workflow);
var cy = diagram_instance.get_diagram_obj();

window.cy = cy;




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
          setTimeout(function(){ vw_interface.handle_workflow(status,diagram_instance.build_workflow()); }, 2000);
    }
});

$('#btn_save_workflow').on({
    click: function(e) {
      e.preventDefault();
      vw_interface.click_save_workflow();
    }
});

$('#btn_load_workflow').on({
    click: function(e) {
      e.preventDefault();
      vw_interface.click_load_workflow();
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
vw_interface.build_overview(diagram_instance.get_diagram().data);
vw_interface.click_overview_nav();


diagram_instance.build_workflow();


function decode_json(text){
  //var msg = decodeURIComponent(text.replace(/\+/g, '%20')+'');
  var msg = text;
  var parser = new DOMParser;
  var dom = parser.parseFromString('<!doctype html><body>' + msg,'text/html');
  msg = dom.body.textContent;
  msg = msg.replace(/'/g, '"');
  return msg;
}
