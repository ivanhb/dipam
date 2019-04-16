

//create an instance of the interface
var vw_interface = new vwbata(config, "diagram_instance", "vw_interface");

//init the interface
vw_interface.init_nav();

//init the diagram
var diagram_instance = new diagram("cy", config, "VWBATA");
var cy = diagram_instance.get_diagram_obj();
window.cy = cy;

//******************************************//
//**********Events Definer *****************//
//******************************************//

//add the edges event handler
var eh = cy.edgehandles();

vw_interface.__get__add_data_container().setAttribute("onclick",
            "diagram_instance.add_node('data');elem_onclick_handle();");
vw_interface.__get__add_tool_container().setAttribute("onclick",
            "diagram_instance.add_node('tool');elem_onclick_handle();");



//nodes on click handler
elem_onclick_handle();

//define all events handling functions
function elem_onclick_handle(){
  //nodes on click handler
  cy.nodes().on('click', function(e){
      var node = this._private.data;
      console.log(node);
      diagram_instance.click_elem_style(this,'node');
      vw_interface.click_on_node(node);
  });

  //edges on click handler
  cy.edges().on('click', function(e){
      var edge = this._private.data;
      console.log(edge);
      diagram_instance.click_elem_style(this,'edge');
      vw_interface.click_on_edge(edge);
  });
}


//******************************************//
//********** First Operations **************//
//******************************************//
vw_interface.build_overview(diagram_instance.get_diagram_gen_node());
vw_interface.click_overview_nav();
