

//create an instance of the interface, it takes:
// The configuration file
// The string name of the diagram instance (which it will be created later)
// The string name of the interface instance (the variable name)
var vw_interface = new vwbata(config, "diagram_instance", "vw_interface");

//init the interface
vw_interface.init_interface_events();

//init the diagram
var diagram_instance = new diagram("cy", config, "Dipam for Catarsi");
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
  }
});

$('#add_tool').on({
  click: function(e) {
    diagram_instance.add_node('tool');
    elem_onclick_handle();
    vw_interface.show_undo_redo(diagram_instance.get_undo_redo().isUndoStackEmpty(),diagram_instance.get_undo_redo().isRedoStackEmpty());
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
