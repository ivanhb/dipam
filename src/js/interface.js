
class vwbata {

    var CONTROL_CONTAINER = document.getElementById('control');

    var DOMTYPE = {
      'name': {'type':'input_box'},
      'toolType': {'type': 'dropdown','value':[],'lael':[]}
    }

    constructor(config_file) {
        this.nodes = [];
        this.edges = [];

        //Construct the DOM types
        if (config_file.hasOwnProperty('tool')) {
          for (var k_tool in config_file.tool) {
            DOMTYPE.toolType.value.push(k_tool);
            DOMTYPE.toolType.label.push(config_file.tool[k_tool].label);
          }
        }
    }

    add_node(n) {
      this.nodes.push(n);
    }

    add_edge(e) {
      this.nodes.push(e);
    }

    get_tools() {
        var all_tools = [];
        for (var i = 0; i < nodes.length; i++) {
          if(nodes[i].type == 'tool'){
            all_tools.push(nodes[i]);
          }
        }
        return all_tools;
    }

    build_info(node) {
      //first decide what doms should be visualized (defined in DOMTYPE)
      var dom_key = "";
      switch (node.type) {
        case 'tool':
          dom_key = "name-toolType";
          break;
        case 'data':
          dom_key = "name";
          break;
      }

      //now populate the html page
      var str_html= "";
      var dom_key_arr = dom_key.split("-");
      for (var i = 0; i < dom_key_arr.length; i++) {
        var obj_dom_type = DOMTYPE[dom_key_arr[i]];
        switch (obj_dom_type.type) {
          case 'dropdown':
                var str_options = "";
                for (var j = 0; j < obj_dom_type.value.length; j++) {
                  var opt_val = obj_dom_type.value[j];
                  var opt_lbl = obj_dom_type.label[j];
                  var selected_val = "selected";
                  if (j > 0) {selected_val = "";}
                  str_options = str_options + "<option value='"+opt_val+"' "+selected_val+">"+opt_lbl+"</option>";
                };
                str_html = str_html + `
                <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <label class="input-group-text" for="inputGroupSelect01">Options</label>
                      </div>
                      <select class="custom-select" id="inputGroupSelect01">
                        `+str_options+`
                      </select>
                </div>
                `;
          break;
          case 'input_box':
            str_html = str_html + `
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="inputGroup-sizing-default">`+node.type " name"+`</span>
              </div>
              <input value="`+node.name+`" type="text" class="form-control" aria-label="Default" aria-describedby="inputGroup-sizing-default">
            </div>
            `;
          break;
        }
      }

      CONTROL_CONTAINER.innerHTML = str_html;

    }
}
