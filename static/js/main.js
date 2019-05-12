
//load json files
var workflow = JSON.parse(decode_json(workflow));
var config = JSON.parse(decode_json(config));
function decode_json(text){
  //var msg = decodeURIComponent(text.replace(/\+/g, '%20')+'');
  var msg = text;
  var parser = new DOMParser;
  var dom = parser.parseFromString('<!doctype html><body>' + msg,'text/html');
  msg = dom.body.textContent;
  msg = msg.replace(/'/g, '"');
  return msg;
}

//init the diagram
var diagram_instance = new dipam_diagram("cy", config, "Dipam for Catarsi", workflow);
diagram_instance.set_events();


//create an instance of the interface, it takes:
// The configuration file
// The string name of the diagram instance (which it will be created later)
// The string name of the interface instance (the variable name)
var vw_interface = new dipam_interface("diagram_instance", "vw_interface");
vw_interface.set_corresponding_diagram(diagram_instance)
vw_interface.set_events();


//******************************************//
//********** First Operations **************//
//******************************************//
vw_interface.build_overview(diagram_instance.get_gen_elem('diagram'));
vw_interface.click_overview_nav();

//*** Example ****//
//vw_interface.build_info(diagram_instance.get_gen_elem('data')[0], "nodes");
//vw_interface.click_info_nav();
