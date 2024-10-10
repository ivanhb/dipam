class DIPAM_UNIT_VIEW {

  constructor() {
    this.unit_id = $("#control_body").data('id');
    this.value = null;
    this.settings = {
      "file_input": true,
      "multi_files": true,
      "direct_input": true,
    };
  }

  /**
  * This method is IS OVERWRITABLE
  * given a value generated from the HTML component(s) this should modify this.value
  * *NOTE: a  new value must be assigned to this.value
  */
  def_value(value) {
    this.value = value;
  }

  set_value(value) {
    this.value = value;
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
  * This method is NOT OVERWRITABLE
  * used to retrieve the data of a corresponding this data unit from the backend.
  get_value() {
    // a fetch() using endpoint API – backend2view()
  }
  */

  /**
  * This method is NOT OVERWRITABLE
  */
  save_value() {
    // a fetch() using endpoint API – view2backend()

    var input_value = null;
    // if both inputs are handled: check the active one currently
    if ((this.settings.file_input) && (this.settings.direct_input)) {
      input_value = $('.switch-input-btn').data('value');
    }else if (this.settings.file_input) {
      input_value = "file_input";
    }else if (this.settings.direct_input) {
      input_value = "direct_input";
    }

    if (input_value == "direct_input") {
      return {"value": this.value};
    }else if (input_value == "file_input") {
      const fileInput = document.getElementById('f_input');
      if (fileInput.files.length > 0) {
        return {"file":fileInput.files};
      }
    }
    return null;
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
      "INPUT_SECTION": $('#input_section'),
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
    DOMS.INPUT_SECTION.find('input, button').prop('disabled', true);
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
        DOMS.INPUT_SECTION.find('input, button').prop('disabled', false);
      } else {
        // in this case save values
        fetch('/runtime/save_unit', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  unit_id: node_id,
                  unit_type: node_type,
                  unit_class: node_class,
                  data: unit_view_instance.save_value()
              })
          })
          .then(response => response.text()) // Parse the response as JSON
          .then(data => {
              console.log('Success:', data);
              $(this).text('Edit').removeClass('btn-success').addClass('btn-primary');
              DOMS.CANCEL_BUTTON.hide();
              DOMS.REMOVE_BUTTON.hide();
              DOMS.INPUT_SECTION.find('input, button').prop('disabled', true);
          })
          .catch((error) => {
              console.error('Error:', error);
          });
      }
    });

    DOMS.CANCEL_BUTTON.on('click', function() {
      DOMS.EDIT_BUTTON.text('Edit').removeClass('btn-success').addClass('btn-primary');
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
