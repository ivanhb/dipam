
class vwbata {

    GENERAL = {'name': 'My Catarsi Diagram'};

    DOMTYPE = {
      'graphName': {'type':'input_box', 'title': 'Graph name', 'value':'name'},
      'dataName': {'type':'input_box', 'title': 'Data name', 'value':'name'},
      'toolName': {'type':'input_box', 'title': 'Tool name', 'value':'name'},
      'toolType': {'type': 'dropdown', 'title': 'Tool type', 'value':[],'label':[]},
      'editElem': {'position': 'divfoot', 'type':'light_button', 'title': 'Edit properties', 'value':''},
      'removeElem': {'position': 'divfoot', 'type':'light_button', 'title': 'Remove element', 'value':''},
    }

    OVERVIEW_SECTION = "graphName-editElem";
    INFO_SECTION = { tool: "toolName-toolType-editElem-removeElem", data:"dataName-editElem-removeElem"};

    info_section_html = "";
    overview_section_html = "";

    constructor(config_file) {

        //define the dom ids
        this.NAV_INFO = document.getElementById('nav_info_a');
        this.NAV_OVERVIEW = document.getElementById('nav_overview_a');
        this.CONTROL_CONTAINER = document.getElementById('control_body');
        this.ADD_TOOL = document.getElementById('add_tool');
        this.ADD_DATA = document.getElementById('add_data');

        //Construct the DOM types
        if (config_file.hasOwnProperty('tool')) {
          for (var k_tool in config_file.tool) {
            this.DOMTYPE.toolType.value.push(k_tool);
            this.DOMTYPE.toolType.label.push(config_file.tool[k_tool].label);
          }
        }

        this.build_overview();
    }

    init_nav() {
      this.NAV_OVERVIEW.setAttribute("href", "javascript:vw_interface.click_overview_nav()");
      this.NAV_INFO.setAttribute("href", "javascript:vw_interface.click_info_nav()");
    }

    __get__add_tool_container(){
      return this.ADD_TOOL;
    }

    __get__add_data_container(){
      return this.ADD_DATA;
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

    build_overview() {
      //first decide what doms should be visualized (defined in DOMTYPE)
      var dom_key = this.OVERVIEW_SECTION;
      this.overview_section_html = this._build_section(dom_key, this.GENERAL);
    }

    build_info(node) {
      //first decide what doms should be visualized (defined in DOMTYPE)
      var dom_key = this.INFO_SECTION[node.type];
      this.info_section_html = this._build_section(dom_key, node);
    }

    _build_section(dom_key, node){

      //now populate the html page
      //first the body
      var domfoot_key_arr = [];
      var str_html= "";
      var dom_key_arr = dom_key.split("-");
      for (var i = 0; i < dom_key_arr.length; i++) {
        var obj_dom = this.DOMTYPE[dom_key_arr[i]];
        if (obj_dom.position != 'divfoot') {
          str_html = str_html + this.__build_corresponding_dom(obj_dom, node);
        }else {
          domfoot_key_arr.push(obj_dom);
        }
      }

      //now the foot
      str_html = str_html + '<div id="control_foot">';
      for (var i = 0; i < domfoot_key_arr.length; i++) {
        var obj_dom = domfoot_key_arr[i];
        str_html = str_html + this.__build_corresponding_dom(obj_dom, node);
      }
      str_html = str_html + '</div>';

      return str_html;
    }
    __build_corresponding_dom(obj_dom_type, node){
      var str_html= "";
      switch (obj_dom_type.type) {
        case 'dropdown':
              var str_options = "";
              for (var j = 0; j < obj_dom_type.value.length; j++) {
                var opt_val = obj_dom_type.value[j];
                var opt_lbl = obj_dom_type.label[j];
                var selected_val = "";
                if (opt_val == node.value) {
                  selected_val = "selected";
                }
                str_options = "<option value='"+opt_val+"' "+selected_val+">"+opt_lbl+"</option>"+str_options;

              };
              str_html = str_html + `
              <div class="input-group">
                    <div class="input-group-prepend">
                      <label class="input-group-text">`+obj_dom_type.title+`</label>
                    </div>
                    <select class="val-box custom-select `+obj_dom_type.type+`" disabled>`+str_options+`</select>
              </div>
              `;
        break;
        case 'input_box':
          str_html = str_html + `
          <div class="input-group">
            <div class="input-group-prepend">
              <label class="input-group-text">`+obj_dom_type.title+`</label>
            </div>
            <input class="val-box `+obj_dom_type.type+`" value="`+node[obj_dom_type.value]+`" type="text" disabled></input>
          </div>
          `;
        break;
        case 'light_button':
          str_html = str_html + '<span><button type="button" class="btn btn-light '+obj_dom_type.type+'">'+obj_dom_type.title+'</button></span>';
          break;
      }

      return str_html;
    }

    click_on_node(node){
      this.build_info(node);
      this.click_info_nav();
    }

    click_info_nav() {
      this.switch_nav('nav_info');
      this.CONTROL_CONTAINER.innerHTML = this.info_section_html;
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

}
