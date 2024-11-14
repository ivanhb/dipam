

var workflow = JSON.parse(decode_json(workflow));

// Create the diagram
var diagram_instance = new dipam_diagram(workflow);
//diagram_instance.set_interface();

// Create the interface
var vw_interface = new dipam_interface(diagram_instance);
vw_interface.set_interface();

// Create the interface
var dipam_unit_value = new dipam_unit_view();


//******************************************//
//********** First Operations **************//
//******************************************//
diagram_instance.fit_diagram();
vw_interface.build_overview(  diagram_instance.get_diagram()  );
vw_interface.click_overview_nav();

$('.popupCloseButton').click(function(){
        $('.hover_bkgr_fricc').removeClass("not-active");
        $('.hover_bkgr_fricc').hide();
});



function decode_json(text){
  //var msg = decodeURIComponent(text.replace(/\+/g, '%20')+'');
  var msg = text;
  var parser = new DOMParser;
  var dom = parser.parseFromString('<!doctype html><body>' + msg,'text/html');
  msg = dom.body.textContent;
  //msg = msg.replace(/'/g, '"');
  msg = msg.replace(/[\n\r]/g, '\\n');
  msg = msg.replace(/\\/g, "\\\\");
  return msg;
}
