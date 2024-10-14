class DIPAM_UNIT_VIEW {

  constructor() {
    this.unit_id = $("#control_body").data('id');
    this.settings = {
      "file_input": true,
      "multi_files": true,
      "direct_input": true,
    };
  }

  set_settings(obj_setup) {
    for (const _k in obj_setup) {
      if (_k in this.settings) {
        this.settings[_k] = obj_setup[_k]
      }
    }
    return this.settings;
  }

  /**
  * NOT OVERWRITABLE
  * This methods goes throught the interface of the visulized node and reads all the input(s)
  * inputs are converted into: "direct-input", "file-input", and all the metadata (e.g., label, description)
  */
  get_node_data_from_interface() {

    var res = {};

    // (1) get metadata
    $('[data-dipam-metavalue]').each(function() {
        var _id = $(this).attr('data-dipam-metavalue');
        res[_id] = $(this).val();
    });

    // (2) check for direct values
    var direct_values = {};
    $('#input_group').find('[data-dipam-value]').each(function() {
        direct_values[  $(this).attr('id')  ] = $(this).val();
    });
    if (Object.keys(direct_values).length > 0) {
      res["direct_input"] = direct_values;
    }

    // (3) check if a file input is given instead
    const fileInput = document.getElementById('f_input');
    if (fileInput != undefined) {
      if (fileInput.files.length > 0) {
        res["file_input"] = fileInput.files;
      }
    }

    return res;
  }

  /**
  * [NOT-OVERWRITABLE]
  * Set the values of the DOMs in the template part of the input-group container
  */
  set_node_interface_from_data(unit_id) {
    // take the view value from the diagram nodes
    let node = diagram_instance.get_node_by_id(unit_id);
    var current_value = node._private.data.value;

    $('[data-dipam-metavalue]').each(function() {
        var _id = $(this).attr('data-dipam-metavalue');
        $(this).val( current_value[_id] );
    });
    if ("direct_input" in current_value) {
      $('#input_group').find('[data-dipam-value]').each(function() {
          $(this).val(  current_value["direct_input"][$(this).attr('id')]  );
      });
    }else if ("file_input" in current_value) {
      $('#f_input_btn').val( current_value["file_input"]["file"].length.toString() +" files uploaded"  );
    }
    return true;
  }


  /**
  * This function is executed to run all default DOM creations and Events of the info control section;
  * This must be done here and DOMs need to be taken dynamically here.
  */
  run_defaults() {

    var unit_view_instance = this;
    /*
    Set the input section according to the values in dipam_unit_value.settings;
    by default both inputs are available and a switch button is used to handle them.
    */
    var DOMS = {
      // The base body
      "CONTROL_BODY": $("#control_body"),
      // INPUT part
      "NODE_DATA": $('#node_data'),
      "BTN_INPUT_SWITCH": $('.switch-input-btn'),
      "INPUT_GROUP": $('#input_group'),
      "INPUT_FILE":$('.file-upload-btn'),
      "INPUT_FILE_TRIGGER":$('#f_input'),
      // Edit part
      "EDIT_BUTTON":$('#edit_btn'),
      "CANCEL_BUTTON":$('#cancel_btn'),
      "REMOVE_BUTTON":$('#remove_btn'),
      //"EDIT_BUTTON_STATUS":$('#edit_btn_status'),
      "CONTROL_FOOT":$('#edit_buttons')
    }

    /*Node id, class, and type*/
    var node_id = DOMS.CONTROL_BODY.data('id');
    var node_class = DOMS.CONTROL_BODY.data('class');
    var node_type = DOMS.CONTROL_BODY.data('type');

    // Disable and don't display edit triggers in the control info panel
    DOMS.NODE_DATA.find('input, button').prop('disabled', true);
    DOMS.BTN_INPUT_SWITCH.css('display','none');
    DOMS.INPUT_FILE.css('display','none');
    DOMS.CONTROL_FOOT.css('display','none');
    DOMS.CANCEL_BUTTON.css('display','none');
    DOMS.REMOVE_BUTTON.css('display','none');

    // check if multiple files can be uploaded
    if (dipam_unit_value.settings.multi_files) {
      DOMS.INPUT_FILE_TRIGGER.prop('multiple', true);
    }

    if (!((dipam_unit_value.settings.file_input) && (dipam_unit_value.settings.direct_input))) {
      if (dipam_unit_value.settings.direct_input) {
        DOMS.INPUT_GROUP.css('display','inline');
      }
      if (dipam_unit_value.settings.file_input) {
        DOMS.INPUT_FILE.css('display','inline');
      }
      if (node_type != "diagram") {
        dipam_unit_value.set_node_interface_from_data(node_id);
      }
    }else {
      DOMS.BTN_INPUT_SWITCH.css('display','inline');
      DOMS.INPUT_GROUP.css('display','inline');

      DOMS.BTN_INPUT_SWITCH.on('click', function(){
        if (DOMS.INPUT_GROUP.css('display') === 'none' || DOMS.INPUT_GROUP.css('display') === '') {
            DOMS.INPUT_GROUP.css('display','inline');
            DOMS.INPUT_FILE.css('display','none');
            this.text('Switch to File Input');
            this.attr('data-value','direct_input');
        } else {
            DOMS.INPUT_GROUP.css('display','none');
            DOMS.INPUT_FILE.css('display','inline');
            this.text('Switch to Text Input');
            this.attr('data-value','direct_input');
        }
      });

    }

    // Toggle between "Edit" and "Save"
    DOMS.EDIT_BUTTON.on('click', function() {
      if ($(this).text() === 'Edit') {
        $(this).text('Save').removeClass('btn-primary').addClass('btn-success');
        DOMS.CANCEL_BUTTON.show();
        DOMS.REMOVE_BUTTON.show();
        // enable inputs and buttons
        DOMS.NODE_DATA.find('input, button').prop('disabled', false);
      } else {
        // in this case save values
        var node_data = unit_view_instance.get_node_data_from_interface();
        if (node_type == "diagram") {
          diagram_instance.update_diagram_data(node_data);
        }else{
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
            .then(response => response.text()) // Parse the response as JSON
            .then(data => {
                //console.log('Success:', data);
                $(this).text('Edit').removeClass('btn-success').addClass('btn-primary');
                DOMS.CANCEL_BUTTON.hide();
                DOMS.REMOVE_BUTTON.hide();
                DOMS.NODE_DATA.find('input, button').prop('disabled', true);
                // in case of success:
                // (1) update the node diagram value
                // (2) generate the template interface
                diagram_instance.set_node_data(node_id, node_data);
                unit_view_instance.set_node_interface_from_data(node_id);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
      }
    });

    DOMS.CANCEL_BUTTON.on('click', function() {
      DOMS.EDIT_BUTTON.text('Edit').removeClass('btn-success').addClass('btn-primary');
      DOMS.NODE_DATA.find('input, button').prop('disabled', true);
      DOMS.CANCEL_BUTTON.hide();
      DOMS.REMOVE_BUTTON.hide();
    });

    DOMS.REMOVE_BUTTON.on('click', function() {
      diagram_instance.remove_elem(node_id);
      diagram_instance.get_diagram_obj().emit('tap',[]);
    });

  }
}

var dipam_unit_value = new DIPAM_UNIT_VIEW();
