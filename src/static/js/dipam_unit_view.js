class dipam_unit_view {

  constructor() {
    this.settings = {
      "data":{},
      "tool":{}
    };
  }

  /**
  * NOT OVERWRITABLE
  */
  set_settings(obj_setup) {
    const unit_id = $("#control_body").data('id');
    const unit_type = $("#control_body").data('type');
    const unit_class = $("#control_body").data('class');
    for (const _k in obj_setup) {
      this.settings[unit_type][_k] = obj_setup[_k]
    }
    return this.settings[unit_type];
  }

  /**
  * NOT OVERWRITABLE
  * This methods goes throught the interface of the visulized node and reads all the input(s)
  * inputs are converted into: "direct-input", "file-input", and all the metadata (e.g., label, description)
  */
  get_node_data_from_interface( node_id, node_type, include_metadata = false ) {

    var res = {};

    $('#input_section').find('[data-dipam-value]').each(function() {
        var _id = $(this).attr('data-dipam-value');
        res[_id] = $(this).attr('value');
        //Object.assign(res, __create_nested_obj( _id.split('.'), $(this).val()) );
    });

    const dom_finput = document.getElementById('finput_dipam');
    if (dom_finput != undefined) {
      if (dom_finput.files.length > 0) {
        res["finput_dipam"] = dom_finput.files;
      }
    }

    return res;

    // function __create_nested_obj(keys, value) {
    //   const result = {};
    //   let currentLevel = result;
    //   keys.forEach((key, index) => {
    //     if (index === keys.length - 1) {
    //       currentLevel[key] = value;
    //     } else {
    //       currentLevel[key] = {};
    //       currentLevel = currentLevel[key];
    //     }
    //   });
    //   return result;
    // }
  }

  /**
  * [NOT-OVERWRITABLE]
  * Set the values of the DOMs in the template part of the input-group container
  */
  set_node_interface_from_data( unit_id, unit_type) {
    // take the view value from the diagram nodes
    var elem = null;
    var current_value = null;
    if ( (unit_type == "data") || (unit_type == "tool") ) {
      elem = diagram_instance.get_node_by_id(unit_id);
      current_value = elem._private.data.view_value;
    }
    if (unit_type == "diagram") {
      elem = diagram_instance.get_diagram();
      current_value = elem.data.view_value;
    }

    $('[data-dipam-value]').each(function() {
        var _id = $(this).attr('data-dipam-value');
        var a_val = current_value[_id];
        
        if ((a_val != undefined) || (a_val != null)) {
            this.value = __normal_html_value( a_val );
        }

        // if ("file_input" in current_value) {
        //   $('#f_input_btn').val( current_value["file_input"]["file"].length.toString() +" files uploaded"  );
        // }
    });
    return true;

    function __normal_html_value(_val) {
      _val = _val.replace(/\\n/g, '\n');
      return _val;
    }
  }

  /**
  * [NOT-OVERWRITABLE]
  * This function is executed to run all default DOM creations and Events of the info control section;
  * This must be done here and DOMs need to be taken dynamically here.
  */
  set_events() {

    var unit_view_instance = this;

    var DOMS = {
      // The base body
      "CONTROL_BODY": $("#control_body"),
      // INPUT part
      "NODE_DATA": $('#node_data'),
      "BTN_INPUT_SWITCH": $('.switch-input-btn'),
      "INPUT_SECTION": $('#input_section'),
      // Edit part
      "EDIT_BUTTON":$('#edit_btn'),
      "CANCEL_BUTTON":$('#cancel_btn'),
      "REMOVE_BUTTON":$('#remove_btn'),
      //"EDIT_BUTTON_STATUS":$('#edit_btn_status'),
      "CONTROL_FOOT":$('#edit_buttons')
    }

    /*Node id, class, type, and settings*/
    const node_id = $("#control_body").data('id');
    const node_class = $("#control_body").data('class');
    const node_type = $("#control_body").data('type');

    var node_settings = dipam_unit_value.settings[node_type];


    if ((node_type == "tool") || (node_type == "data") || (node_type == "diagram")) {
      // Disable and don't display edit triggers in the control info panel
      DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);
      DOMS.BTN_INPUT_SWITCH.css('display','none');
      DOMS.CONTROL_FOOT.css('display','none');
      DOMS.CANCEL_BUTTON.css('display','none');
      DOMS.REMOVE_BUTTON.css('display','none');
    }

    DOMS.EDIT_BUTTON.on('click', function() {
      if ($(this).text() === 'Edit') {
        $(this).text('Save').removeClass('btn-primary').addClass('btn-success');
        DOMS.CANCEL_BUTTON.show();
        DOMS.REMOVE_BUTTON.show();
        // enable inputs and buttons
        DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', false);
      } else {
        // in this case save values
        var node_data = unit_view_instance.get_node_data_from_interface( node_id, node_type );
        console.log("Save data view=",node_data);
        fetch('/runtime/save_unit', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  unit_id: node_id,
                  unit_type: node_type,
                  unit_class: node_class,
                  data: node_data
              })
          })
          .then(response => {return response.json();})
          .then(data => {
              console.log("Data to save", data);
              $(this).text('Edit').removeClass('btn-success').addClass('btn-primary');
              DOMS.CANCEL_BUTTON.hide();
              DOMS.REMOVE_BUTTON.hide();
              DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);

              // in case of success:
              // (1) update the node diagram value
              // (2) generate the template interface
              diagram_instance.set_node_data(node_type, node_id, node_data);
              unit_view_instance.set_node_interface_from_data(  node_id,node_type );

              // show all returned messages;
              // in case of error
              // Note: previous code updating the interface is done anyway
              if (! (vw_interface.show_popupmsg_all(data)) ) {
                  return false;
              }

              // save also the new diagram workflow
              diagram_instance.save_workflow( false, vw_interface.show_popupmsg_warning);
          })
          .catch((error) => {
              vw_interface.show_popupmsg({
                  "data": null,
                  "log_type": "error",
                  "log_msg": "Error in the DIPAM API while saving the data of a unit – "+error
              });
          });

      }
    });

    DOMS.CANCEL_BUTTON.on('click', function() {
      DOMS.EDIT_BUTTON.text('Edit').removeClass('btn-success').addClass('btn-primary');
      DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);
      DOMS.CANCEL_BUTTON.hide();
      DOMS.REMOVE_BUTTON.hide();
    });

    DOMS.REMOVE_BUTTON.on('click', function() {
      diagram_instance.remove_elem( node_id, vw_interface.show_popupmsg_all );
      diagram_instance.save_workflow( false );
      diagram_instance.get_diagram_cy().emit('tap',[]);
    });

    $('#input_section').find('[data-dipam-value]').on('input', function() {
      let view_value = {};
      view_value[$(this).attr('data-dipam-value')] = $(this).val();
      diagram_instance.set_node_view_value( node_type, node_id, view_value);
    });

    dipam_unit_value.set_node_interface_from_data(  node_id,node_type );


    if (node_type == "data") {

      // a particular element for file

      var direct_input = false;
      direct_input = DOMS.INPUT_SECTION.find('[data-dipam-value]').each(function() {
        DOMS.INPUT_SECTION.css('display','inline');
        return true;
      });

      var file_input = false;
      DOMS.INPUT_SECTION.find('[data-dipam-filevalue]').each(function() {
          const html_content_file =`<button id="f_input_btn" class="file-upload-btn" onclick="document.getElementById('f_input').click();">Load File</button><input type="file" id="f_input" name="f_input" style="display:none" accept=".txt" />`;
          this.replaceWith(html_content_file);
          // to stop at first replace
          $('.file-upload-btn').css('display','inline');

          if (this.attr('data-multiple') !== undefined) {
              $('#f_input').prop('multiple', true);
          }
          return true;
      });

      if ((direct_input) && (file_input)){
        // both input types must be handled
        DOMS.BTN_INPUT_SWITCH.css('display','inline');
        DOMS.INPUT_SECTION.css('display','inline');

        DOMS.BTN_INPUT_SWITCH.on('click', function(){
          if (this.text() == 'Switch to Direct Input Interface') {
            DOMS.INPUT_SECTION.find('[data-dipam-value]').each(function() {
              this.css('display','inline');
            });
            $('.file-upload-btn').css('display','none');
            this.text('Switch to File(s) Input Interface');
          }
          else if (this.text() == 'Switch to File(s) Input Interface') {
            DOMS.INPUT_SECTION.find('[data-dipam-value]').each(function() {
              this.css('display','none');
            });
            $('.file-upload-btn').css('display','inline');
            this.text('Switch to Direct Input Interface');
          }
        });
      }
    }
  }

}
