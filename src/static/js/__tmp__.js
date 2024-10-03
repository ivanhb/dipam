//build the info panel on the left
build_overview(elem, elem_class= 'all') {
    this.overview_section_html = this.build_control_section(elem);
    this.overview_section_elem['elem'] = elem;
    this.overview_section_elem['elem_class'] = elem_class;
}

build_info(elem, elem_class= 'nodes', update_control_params = false) {
  if('_private' in elem)
    elem = elem._private;
  this.info_section_html = this.build_control_section(elem, update_control_params);
  this.info_section_elem['elem'] = elem;
  this.info_section_elem['elem_class'] = elem_class;
  this.DOMS.CONTROL.BASE.className = elem.data.type;
}

build_control_section(elem, update_control_params = false){
  var interface_instance = this;
  var diagram_instance = this.DIAGRAM_INSTANCE_OBJ;
  var res_str_html = "";
  var fixed_elems = ['id','type','source','target','class','input','output','compatible_input'];
  var foot_buttons = ['edit', 'remove', 'save'];
  if (elem.data.type == 'diagram') {
    //foot_buttons = ['edit'];
  }


  res_str_html = res_str_html + '<div id="control_mid">';
  var all_param_doms_str = "";
  for (var k_attribute in elem.data) {
    var a_dom_str = "";

    //check is not one of the fixed attributes
    if(fixed_elems.indexOf(k_attribute) == -1){

      //check if is a must-attribute
      switch (k_attribute) {
        case 'name':
          //is an input-box
          this.set_dipam_temp_val(k_attribute,elem.data.name);
          a_dom_str = _build_logo_dom(elem.data.type) + _build_a_dom("input-text", elem, k_attribute, {intro_lbl: "Name:"});
          break;
        case 'value':
          //is a dropdown
          this.set_dipam_temp_val(k_attribute,elem.data.value);
          var res_elem_type = diagram_instance.get_conf_elems(elem.data.type, ['[KEY]','label','input_ready','class_label']);
          if (elem.data.type == "edge") {
            res_elem_type = {'[KEY]': ["edge"],'label': ["Edge"],'input_ready':[true],'class_label':["General"]};
          }
          a_dom_str = _build_a_dom("select-value", elem, k_attribute, {intro_lbl: "Type:", value: res_elem_type['[KEY]'], input_ready: res_elem_type['input_ready'], label: res_elem_type['label'], class_label: res_elem_type['class_label']});
          break;

        case 'param':
          //is a param
          //var sorted_params = Object.keys(elem.data.param).sort();
          var l_conf_params = diagram_instance.get_conf_att(elem.data.type, elem.data.value, null)["param"];
          if (l_conf_params != undefined) {
            for (var k = 0; k < l_conf_params.length; k++) {
                  var k_param = l_conf_params[k];
                  var para_obj = diagram_instance.get_conf_att("param",k_param, null);
                  var para_val = para_obj.value;
                  if (para_val != -1) {
                    all_param_doms_str = all_param_doms_str + _build_a_dom(para_obj.handler, elem, k_param, {intro_lbl: para_obj.label, placeholder:para_obj.placeholder, value: para_obj.value, label: para_obj.value_label, group:para_obj.group}, true);
                    this.set_dipam_temp_val(k_param,elem.data.param[k_param]);
                 }
            }
            if (update_control_params) {
              var control_param_sec = document.getElementsByClassName("control-params");
              if (control_param_sec.length > 0) {
                control_param_sec = control_param_sec[0];
              }else {
                return -1;
              }
              control_param_sec.innerHTML = all_param_doms_str;
            }
          }
      }
      res_str_html = res_str_html + a_dom_str;
    }
  }

  //info and input output
  //corresponding info and details about it

  var input_output_info_str = "";
  var description_str = "";
  var elem_conf_obj = diagram_instance.get_conf_att(elem.data.type, elem.data.value, null);
  description_str = _build_description(elem_conf_obj['description']);
  if (description_str != "") {
    description_str = "<div class='info-box'>"+ description_str + "</div>";
  }
  input_output_info_str = _build_info(elem.data);
  if (input_output_info_str.length > 0) {
    input_output_info_str = "<div class='info-box'>"+ input_output_info_str + "</div>";
  }

  res_str_html = res_str_html + description_str + input_output_info_str + "<div class='control-params'>"+ all_param_doms_str + '</div></div>';
  //console.log(this.temp_dipam_value);

  //now the foot buttons
  var param_btn = {
    'edit': {intro_lbl: 'Edit properties'},
    'remove': {intro_lbl: 'Remove element'},
  };
  res_str_html = res_str_html + '<div id="control_foot">';
  for (var i = 0; i < foot_buttons.length; i++) {
    var btn_key = foot_buttons[i];
    a_dom_str = _build_a_dom(btn_key, elem, null, param_btn[btn_key]);
    res_str_html = res_str_html + a_dom_str;
  }
  res_str_html = res_str_html + '</div>';

  return res_str_html;

  function _build_description(str){
    if (str == undefined) {
      return "";
    }else {
      return _build_open_trigger("Description")+"<div class='content' style='display: none'>"+str+"</div>";
    }
  }
  function _build_info(elem_data){
    var input_output_info_str = "";
    if (elem_data.type == "tool") {
      var a_tool_obj = diagram_instance.get_conf_att("tool", elem_data.value, null);
      var inputs_index = []
      var optional_input_info_str = "";
      if ("optional_input" in a_tool_obj) {
        for (var u = 0; u < a_tool_obj["optional_input"].length; u++) {
          var a_data_obj = diagram_instance.get_conf_att("data", a_tool_obj["optional_input"][u], null);
          optional_input_info_str = optional_input_info_str +"&rarr; "+ a_data_obj["label"] + " (optional)<p>";
          inputs_index.push(a_data_obj["label"]);
        }
      }
      var required_input_info_str = "";
      for (var u = 0; u < a_tool_obj["compatible_input"].length; u++) {
        var a_data_obj = diagram_instance.get_conf_att("data", a_tool_obj["compatible_input"][u], null);
        if (inputs_index.indexOf(a_data_obj["label"]) == -1) {
          required_input_info_str = required_input_info_str +"&rarr; "+ a_data_obj["label"] +"<p>";
        }
      }
      var title_input = ""
      if ((required_input_info_str.length > 0) || (optional_input_info_str.length > 0)) {
        title_input = '<div class="title">Input:</div>'
      }
      input_output_info_str = title_input + required_input_info_str + optional_input_info_str;

      var output_info_str = "";
      if ("output" in a_tool_obj) {
        for (var u = 0; u < a_tool_obj["output"].length; u++) {
          var a_data_obj = diagram_instance.get_conf_att("data", a_tool_obj["output"][u], null);
          output_info_str = output_info_str +"&rarr; "+ a_data_obj["label"] +"<p>";
        }
      }
      title_input = ""
      if (output_info_str.length > 0){
        title_input = '<div class="title">Output:</div>'
      }
      input_output_info_str = _build_open_trigger("Inputs and Outputs")+"<div class='content' style='display: none'>"+ input_output_info_str + title_input + output_info_str+"</div>";
    }
    return input_output_info_str;
  }
  function _build_open_trigger(title){
    var svg_closed = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-up" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/></svg>';
    var svg_open = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>';
    var html_btn = `<button class="open-box-trigger" data-title="`+title+`" type="button">`+title+` `+svg_closed+`</button>`;
    return html_btn;
  }
  function _build_logo_dom(elem_type){
    var html_logo = "<div class='elem-logo'>";
    switch (elem_type) {
      case "tool":
        html_logo += '<svg class="bi bi-tools" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M0 1l1-1 3.081 2.2a1 1 0 0 1 .419.815v.07a1 1 0 0 0 .293.708L10.5 9.5l.914-.305a1 1 0 0 1 1.023.242l3.356 3.356a1 1 0 0 1 0 1.414l-1.586 1.586a1 1 0 0 1-1.414 0l-3.356-3.356a1 1 0 0 1-.242-1.023L9.5 10.5 3.793 4.793a1 1 0 0 0-.707-.293h-.071a1 1 0 0 1-.814-.419L0 1zm11.354 9.646a.5.5 0 0 0-.708.708l3 3a.5.5 0 0 0 .708-.708l-3-3z"/><path fill-rule="evenodd" d="M15.898 2.223a3.003 3.003 0 0 1-3.679 3.674L5.878 12.15a3 3 0 1 1-2.027-2.027l6.252-6.341A3 3 0 0 1 13.778.1l-2.142 2.142L12 4l1.757.364 2.141-2.141zm-13.37 9.019L3.001 11l.471.242.529.026.287.445.445.287.026.529L5 13l-.242.471-.026.529-.445.287-.287.445-.529.026L3 15l-.471-.242L2 14.732l-.287-.445L1.268 14l-.026-.529L1 13l.242-.471.026-.529.445-.287.287-.445.529-.026z"/></svg>';
        break;
      case "data":
        html_logo += '<svg class="bi bi-archive-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM6 7a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1H6zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/></svg>';
        break;
      case "diagram":
        html_logo += '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-diagram-2-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 11.5A1.5 1.5 0 0 1 4.5 10h1A1.5 1.5 0 0 1 7 11.5v1A1.5 1.5 0 0 1 5.5 14h-1A1.5 1.5 0 0 1 3 12.5v-1zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 9 12.5v-1zm-3-8A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6h-1A1.5 1.5 0 0 1 6 4.5v-1z"/><path fill-rule="evenodd" d="M8 5a.5.5 0 0 1 .5.5V7H11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 5 7h2.5V5.5A.5.5 0 0 1 8 5z"/></svg>';
        break;
      case "edge":
        html_logo += '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-up-left" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H3.5V9a.5.5 0 0 1-1 0V4z"/><path fill-rule="evenodd" d="M2.646 3.646a.5.5 0 0 1 .708 0l9 9a.5.5 0 0 1-.708.708l-9-9a.5.5 0 0 1 0-.708z"/></svg>';
        break;
      default:
    }
    html_logo += "</div>";
    return html_logo;
  }
  function _build_a_dom(dom_tag, elem, k_attribute, param = {}, is_param = false){
    var a_dom_id = k_attribute;
    var a_dom_class = dom_tag + "-trigger";
    var str_html = "";
    var dom_value = elem.data[k_attribute];
    if (is_param) {
      a_dom_class = a_dom_class+" "+ "param-att";
      dom_value = elem.data.param[k_attribute];
    }
    if (k_attribute == "value") {
      a_dom_class = a_dom_class+" "+ "data-elem-value";
    }
    var group_class = "";
    if ("group" in param) {
      if (param["group"] == true) {
        group_class = "group";
      }else {
        group_class = "ungroup";
      }
    }

    switch (dom_tag) {
      case 'select-value':
          var list_class_label = new Set(param.class_label);
          if (list_class_label.size == 0) {
            list_class_label.add("all");
          }

          var str_options = "";
          for (let a_class_label of list_class_label) {
            if (a_class_label != "all") {
              str_options = str_options + "<optgroup label='"+a_class_label+"'>";
            }
            for (var j = 0; j < param.value.length; j++) {
                var add_it = false;
                if (a_class_label == "all") {
                  add_it = true;
                }else if (param.class_label[j] == a_class_label){
                  add_it = true;
                }

                if (add_it) {
                      var add_opt = is_param;
                      if (!(add_opt)) {
                        if (param.input_ready[j]) {
                          add_opt = true;
                        }
                      }
                      if (add_opt) {
                        var selected_val = "";
                        if (param.value[j] == dom_value) {
                          selected_val = "selected";
                        }
                        str_options = str_options + "<option data-select-target='"+a_dom_id+"' value='"+param.value[j]+"' "+selected_val+">"+param.label[j]+"</option>";
                      }
                }

            };
            str_options = str_options + "</optgroup>";
          }

          str_html = str_html + `
          <div class="input-group `+dom_tag+` `+group_class+`">
                  <div class="input-group-prepend">
                    <label class="input-group-text">`+param.intro_lbl+`</label>
                  </div>
                  <select data-att-value="`+k_attribute+`" data-id="`+elem.data.id+`" id="`+a_dom_id+`" class="`+a_dom_class+` att-handler save-value custom-select" >`+str_options+`</select>
          </div>`;
          break;

      case 'check-value':
             var group_title = '';
             if (param.intro_lbl != null) {
               group_title = '<div class="input-group-prepend"><label class="input-group-text">'+param.intro_lbl+'</label></div>';
             }

             var selected_val = "";
             if (dom_value) {
               selected_val = "checked";
             }
             str_html = str_html +
                `<div class="input-group `+dom_tag+` `+group_class+`">`+
                group_title +
                `<input `+selected_val+` type="checkbox" class="`+a_dom_class+` save-value att-handler" data-att-value="`+k_attribute+`" data-id="`+elem.data.id+`" id="`+a_dom_id+`"><label>`+param.label+`</label>
                </div>`;
             break;

      case 'input-text':
            var placeholder_str = "";
            if (param.placeholder != undefined){
              placeholder_str = 'placeholder="'+param.placeholder+'"';
            }
            var input_value_html = "";
            if (dom_value != undefined){
              input_value_html = 'value="'+dom_value+'"';
            }
            str_html = str_html + `
            <div class="input-group `+dom_tag+` `+group_class+`">
              <div class="input-group-prepend">
                <label class="input-group-text">`+param.intro_lbl+`</label>
              </div>
              <input `+placeholder_str+` data-id="`+elem.data.id+`" id="`+a_dom_id+`" class="`+a_dom_class+` save-value att-handler" `+input_value_html+` data-att-value="`+k_attribute+`" type="text" ></input>
            </div>
            `;
            break;

      case 'input-text-large':
            var placeholder_str = "";
            if (param.placeholder != undefined){
              placeholder_str = 'placeholder="'+param.placeholder+'"';
            }
            var input_value_html = "";
            var str_value_html = "";
            if (dom_value != undefined){
              str_value_html = dom_value;
              input_value_html = 'value="'+dom_value+'"';
            }
            str_html = str_html + `
            <div class="input-group `+dom_tag+` `+group_class+`">
              <div class="input-group-prepend">
                <label class="input-group-text">`+param.intro_lbl+`</label>
              </div>
              <textarea `+placeholder_str+` data-id="`+elem.data.id+`" id="`+a_dom_id+`" class="`+a_dom_class+` save-value att-handler" `+input_value_html+` data-att-value="`+k_attribute+`" type="text" >`+ str_value_html.replace(/\\n/g,"&#13;&#10;")+`</textarea>
            </div>
            `;
            break;

      case 'input-text-group':
                  var g_inputs = `<div data-id="`+elem.data.id+`" id="`+a_dom_id+`" class="g-headers `+a_dom_class+` save-value att-handler" data-att-value="`+k_attribute+`">`;

                  //get the rows with their corresponding values
                  //att[[EQUALS]]ff[[ATT]]type[[EQUALS]][[ATT]]regex[[EQUALS]]
                  console.log(dom_value);
                  var rows = null;
                  var index_rows = new Array(1).fill(-1);
                  if (dom_value != null) {
                    rows = dom_value.split("[[RULE]]");
                    index_rows = new Array(rows.length).fill(-1);
                    for (var i = 0; i < rows.length; i++) {
                      var cells = rows[i].split("[[ATT]]");
                      for (var j = 0; j < cells.length; j++) {
                        var vals = cells[j].split("[[EQUALS]]");
                        if (index_rows[i] == -1) {
                          index_rows[i] = {};
                        }
                        index_rows[i][vals[0]] = vals[1];
                      }
                    }
                  }


                  var input_text_header = `<tr><td>`;
                  var columns = [];
                  for (var i = 0; i < param.label.length; i++) {
                    input_text_header = input_text_header + "<div>"+param.label[i]+"</div>";
                    if (columns.indexOf(param.value[i]) == -1) {
                      columns.push(param.value[i]);
                    }
                  }
                  input_text_header = input_text_header + `</td><td><button type="button" data-value="`+param.value+`" class="add_att_regex">+</button></td></tr>`;

                  var input_text_row_pattern = "";
                  for (var i = 0; i < index_rows.length; i++) {
                    input_text_row_pattern = input_text_row_pattern + `<tr><td>`;
                    var a_row = index_rows[i];
                    for (var j = 0; j < columns.length; j++) {
                      var input_val = a_row[columns[j]];
                      if (input_val == undefined) {
                        input_val = "";
                      }
                      var placeholder_str = "";
                      if (param.placeholder != undefined){
                        placeholder_str = 'placeholder="'+param.placeholder[j]+'"';
                      }

                      input_text_row_pattern = input_text_row_pattern + `<input `+placeholder_str+` value="`+input_val+`" class=`+columns[j]+` type="text"></input>`;
                    }
                    if (i > 0) {
                        input_text_row_pattern = input_text_row_pattern + `</td><td><button type="button" class="del_att_regex">-</button></td></tr>`+`</tr>`;
                    }else {
                        input_text_row_pattern = input_text_row_pattern + `</td><td></td></tr>`+`</tr>`;
                    }
                  }

                  str_html = str_html + `
                  <div class="input-group `+dom_tag+` `+group_class+`">
                    <div class="input-group-prepend">
                      <label class="input-group-text">`+param.intro_lbl+`</label>
                    </div>
                    `+g_inputs +`<table>`+ input_text_header + input_text_row_pattern + `</table></div>
                  </div>`;
            break;

      case 'select-file':
              dom_value = interface_instance.label_handler(a_dom_id, {value: dom_value, elem: elem});
              var str_options = `<option selected>Select source</option>
                                <option id='`+a_dom_id+`_optfile' value='file'>File\/s</option>
                                <option id='`+a_dom_id+`_optdir' value='dir'>Directory</option>`;

              str_html = str_html +`
              <div class="input-group btn-group `+dom_tag+` `+group_class+`">
                  <div class="input-group-prepend">
                    <label class="input-group-text">`+param.intro_lbl+`</label>
                  </div>
                  <select data-att-value="`+k_attribute+`" data-id="`+elem.data.id+`" id="`+a_dom_id+`" class="`+a_dom_class+` att-handler save-value custom-select" >`+str_options+`</select>
                  <input data-id="`+elem.data.id+`" type="file" id="`+a_dom_id+`_file" style="display: none;" multiple="true"/>
                  <input data-id="`+elem.data.id+`" type="file" id="`+a_dom_id+`_dir" style="display: none;" webkitdirectory directory multiple="false"/>

                  <label id="`+a_dom_id+`__lbl" class="input-group-text" value="">`+dom_value+`</label>
              </div>
              `;
              break;

      case 'edit':
              str_html = str_html + `
              <div class="foot-dom btn-edit">
              <button id="edit" value="editoff" type="button" data-id="`+elem.data.id+`" class="`+a_dom_class+` btn btn-light">
              `+param.intro_lbl+`</button></div>`;
              break;

      case 'remove':
              str_html = str_html + `
              <div class="foot-dom btn-remove">
              <button id="remove" type="button" data-id="`+elem.data.id+`" class="`+a_dom_class+` btn btn-light">
              `+param.intro_lbl+`</button></div>`;
              break;

      case 'save':
            str_html = str_html + `<div id="edit_buttons" class="foot-dom">
                                   <span><button id='cancel' type='button' class='cancel-trigger btn btn-default edit-switch'>Cancel</button></span>
                                   <span>
                                   <button id='save' type='button' class='save-trigger btn btn-default edit-switch'>Save</button></span>
                                   </div>`;
            break;
      default:
    }
    return str_html;
  }

}
