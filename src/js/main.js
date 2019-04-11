

//create an instance of the interface
var vw_interface = new vwbata(config);

//init the interface
vw_interface.init_nav();

//init the diagram
var diagram_instance = new diagram("cy", config);
var cy = diagram_instance.get_diagram_obj();
window.cy = cy;


//******************************************//
//**********Events Definer *****************//
//******************************************//

//add the edges event handler
var eh = cy.edgehandles();

vw_interface.__get__add_data_container().setAttribute("onclick", "diagram_instance.add_node('data');node_onclick_handle();");
vw_interface.__get__add_tool_container().setAttribute("onclick", "diagram_instance.add_node('tool');node_onclick_handle();");

//nodes on click handler
node_onclick_handle();






//define all events handling functions
function node_onclick_handle(){
  //nodes on click handler
  cy.nodes().on('click', function(e){
      var node = this._private.data;
      console.log(node);
      vw_interface.click_on_node(node);
  });
}







/*
document.querySelector('#draw-on').addEventListener('click', function() {
    eh.enableDrawMode();
    cy.fit();
});

document.querySelector('#draw-off').addEventListener('click', function() {
    eh.disableDrawMode();
});

document.querySelector('#start').addEventListener('click', function() {
    eh.start( cy.$('node:selected') );
});
*/
