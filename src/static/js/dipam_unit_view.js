class dipam_unit_view {

  constructor() {

    // Dynamically define getters for each selector
    this.DOM = {};

    // Define a mapping of keys to their corresponding selectors
    const selectors = {
      CONTROL_BODY: "#control_body",
      NODE_DATA: "#node_data",
      INPUT_SECTION: "#input_section",
      INPUT_SWITCH_CONTAINER: "#switch_data_input_btn",
      INPUT_SWITCH_BTN: "#switch_input",
      META_VIEW_VALUES: "#input_section [data-dipam-value]:not(#input_group [data-dipam-value])",
      INPUT_GROUP_VALUES: "#input_group",
      VIEW_VALUES: "#input_group [data-dipam-value]",
      EDIT_BUTTON: "#edit_btn",
      CANCEL_BUTTON: "#cancel_btn",
      REMOVE_BUTTON: "#remove_btn"
    };

    Object.entries(selectors).forEach(([key, selector]) => {
      Object.defineProperty(this.DOM, key, { get: () => $(selector) });
    });
  }

  init_opr(){
    /*Node id, class, type, and settings*/
    const node_id = this.DOM.CONTROL_BODY.data('id');
    const node_class = this.DOM.CONTROL_BODY.data('class');
    const node_type = this.DOM.CONTROL_BODY.data('type');
    this.set_node_interface_from_view_value(  node_id,node_type );

    if (node_type == "data") {

      //this.DOM.INPUT_SECTION.css('display','inline');

      var selected_input = new Set();
      var file_input = null;
      this.DOM.VIEW_VALUES.each(function() {
        let data_dipam_value = $(this).attr('data-dipam-value');
        if ( data_dipam_value == "FINPUT") {
          file_input = {};
          file_input["multi"] = $(this).attr('data-multi');
          file_input["ext"] = $(this).attr('data-ext');
          file_input["description"] = $(this).attr('data-description');
          $(this).remove();
          selected_input.add("finput");
        }else {
          selected_input.add("vinput");
        }
      });


      // in case a FINPUT is specified then create its DOM
      if (selected_input.has("finput")) {
        const button = $('<button>', { id: 'f_input_btn',class: 'file-upload-btn', text: 'Load File', click: function() { $('#f_input').click(); } });
        const fileInput = $('<input>', { type: 'file', id: 'f_input', name: 'f_input', style: 'display:none', accept: '.txt'});
        const finput_ul = this.build_finput_ul(node_id, "init");
        const divWrapper = $('<div id="input_file"></div>').append(button, fileInput, finput_ul);
        this.DOM.INPUT_SECTION.append(divWrapper);

        $('#f_input').on('change', function(event) {
            const selected_files = event.target.files;
            let view_value = {};
            view_value["finput"] = selected_files;
            diagram_instance.set_node_view_value( node_type, node_id, view_value);
            dipam_unit_value.build_finput_ul(node_id, "update");
        });
      }

      const node_view_value = diagram_instance.get_node_view_value(node_id);

      if ((selected_input.has("finput")) && (selected_input.has("vinput"))){

        this.DOM.INPUT_SECTION.css('display','inline');

        // display values input only
        $("#input_file").css('display','none');

        // display the switch button
        this.DOM.INPUT_SWITCH_CONTAINER.css('display','inline');
        this.DOM.INPUT_SWITCH_CONTAINER.after('<br style="height: 20px;">');

        this.DOM.INPUT_SWITCH_BTN.on('change', function() {
            var input_type = "vinput";
            if (this.checked) {
                input_type = "finput";
            }
            dipam_unit_value.toggle_input(input_type);
            diagram_instance.set_node_view_value( node_type, node_id, { "selected_input": input_type });
        });

        if ("selected_input" in node_view_value) {
          this.toggle_input(node_view_value["selected_input"]);
        }
      }

      // set <selected_input> in case its first time
      if (!("selected_input" in node_view_value)) {
        var input_type = "vinput";
        if (selected_input.size == 1) {
          input_type = selected_input.values().next().value;
        }
        diagram_instance.set_node_view_value( node_type, node_id, { "selected_input": input_type });
      }

    }
  }

  /**
  * This methods goes throught the interface of the visulized node and reads all the input(s)
  * inputs are converted into: "direct-input", "file-input", and all the metadata (e.g., label, description)
  */
  get_node_view_value_from_interface( node_id, node_type ) {

    // select all DOMs that update the ONLY view value
    var view_value = {};
    $('#input_section [data-dipam-value]:not(#input_group [data-dipam-value])').each(function() {
        var _id = $(this).attr('data-dipam-value');
        const corresponding_value = $(this).attr('value');
        if (corresponding_value != undefined) {
          view_value[_id] = $(this).attr('value');
        }
    });
    // in case of a tool the initial view value must include the input and the output element
    if (node_type == "tool") {
      view_value["input"] = {}
      view_value["output"] = {}
    }

    // select all DOMs that update the backend value
    var app_value = {};
    $('#input_group').find('[data-dipam-value]').each(function() {
        var _id = $(this).attr('data-dipam-value');
        const corresponding_value = $(this).attr('value');
        if (corresponding_value != undefined) {
          if (!("vinput" in app_value)) {
            app_value["vinput"] = {};
          }
          app_value["vinput"][_id] = $(this).attr('value');
        }
    });

    const dom_finput = document.getElementById('f_input');
    if (dom_finput != undefined) {
      if (dom_finput.files.length > 0) {
        app_value["finput"] = dom_finput.files;
      }
    }
    // var res = {};
    // res["app_value"] = app_value;
    // res["view_value"] = view_value;
    return Object.assign({}, view_value, app_value);
  }


  /****
  * Methods to build interface parts
  ****/
  set_node_interface_from_view_value( unit_id, unit_type) {
    /* Set the values of the DOMs in the template part of the input-group container */
    var elem = null;
    var current_value = null;
    if ( (unit_type == "data") || (unit_type == "tool") ) {
      elem = diagram_instance.get_cy_elem_by_id(unit_id);
      current_value = elem._private.data.view_value;
    }
    if (unit_type == "diagram") {
      elem = diagram_instance.get_diagram();
      current_value = elem.data.view_value;
    }

    $('#input_section [data-dipam-value]:not(#input_group [data-dipam-value])').each(function() {
        var _id = $(this).attr('data-dipam-value');
        var a_val = current_value[_id];

        if ((a_val != undefined) || (a_val != null)) {
            this.value = __normal_html_value( a_val );
        }
    });

    $('#input_group').find('[data-dipam-value]').each(function() {
        var _id = $(this).attr('data-dipam-value');
        if ("vinput" in current_value) {
          var a_val = current_value["vinput"][_id];
          if ((a_val != undefined) || (a_val != null)) {
              this.value = __normal_html_value( a_val );
          }
        }
    });

    return true;

    function __normal_html_value(_val) {
      _val = _val.replace(/\\n/g, '\n');
      return _val;
    }
  }
  toggle_input(input_type){
    if (input_type == "finput") {
      this.DOM.INPUT_SWITCH_BTN.prop('checked', true);
      this.DOM.INPUT_GROUP_VALUES.css('display','none');
      $("#input_file").css('display','inline');
    }else if (input_type == "vinput") {
      this.DOM.INPUT_SWITCH_BTN.prop('checked', false);
      this.DOM.INPUT_GROUP_VALUES.css('display','inline');
      $("#input_file").css('display','none');
    }
  }
  build_finput_ul(node_id, res = "init") {
    var finput_li = "";
    var view_value = diagram_instance.get_node_view_value(node_id);
    if ("finput" in view_value) {
      const selected_files = view_value["finput"];
      finput_li = Array.from(selected_files).map(file => `<li>${file.name}</li>`).join('');
      finput_li = "<li class='li-header'>Files loaded:</li>" + finput_li;
    }
    if (res == "init") {
      return $('<ul>', { id: 'finput_ul', class: 'finput-ul', html: finput_li});
    }
    $("#finput_ul").html(finput_li);
    return finput_li;
  }

  /**
  * This function is executed to run all default DOM creations and Events of the info control section;
  * This must be done here and DOMs need to be taken dynamically here.
  */
  set_events() {

    /*Find and disable all <data-dipam-value>(s) */
    this.DOM.NODE_DATA.addClass('disabled');
    this.DOM.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);

    this.DOM.EDIT_BUTTON.on('click', function() {
      const node_id = dipam_unit_value.DOM.CONTROL_BODY.data('id');
      const node_class = dipam_unit_value.DOM.CONTROL_BODY.data('class');
      const node_type = dipam_unit_value.DOM.CONTROL_BODY.data('type');
      if ($(this).text() === 'Edit') {
        $(this).text('Save').removeClass('btn-primary').addClass('btn-success');
        dipam_unit_value.DOM.CANCEL_BUTTON.show();
        dipam_unit_value.DOM.REMOVE_BUTTON.show();
        // enable inputs and buttons
        dipam_unit_value.DOM.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', false);
        dipam_unit_value.DOM.NODE_DATA.removeClass('disabled');
      } else {
        // in this case save values
        var node_view_value = diagram_instance.get_node_view_value(node_id);
        console.log("Save data: ",node_view_value);

        fetch('/runtime/save_unit', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  unit_id: node_id,
                  unit_type: node_type,
                  unit_class: node_class,
                  data: node_view_value
              })
          })
          .then(response => {return response.json();})
          .then(data => {
              console.log("Data saved: ", data);
              // in case of success:
              // (1) update the node diagram value
              // (2) generate the template interface

              // diagram_instance.set_node_data(node_type, node_id, node_data);

              // show all returned messages;
              // in case of error
              // Note: previous code updating the interface is done anyway
              if (! (interface_instance.show_popupmsg_all(data)) ) {
                  return false;
              }
              __rm_edit_mode();

              // save also the new diagram workflow
              //diagram_instance.save_workflow( false, interface_instance.show_popupmsg_warning);
          })
          .catch((error) => {
              interface_instance.show_popupmsg({
                  "data": null,
                  "log_type": "error",
                  "log_msg": "Error in the DIPAM API while saving the data of a unit – "+error
              });
          });

          function __rm_edit_mode() {
            dipam_unit_value.DOM.EDIT_BUTTON.text('Edit').removeClass('btn-success').addClass('btn-primary');
            dipam_unit_value.DOM.CANCEL_BUTTON.hide();
            dipam_unit_value.DOM.REMOVE_BUTTON.hide();
            dipam_unit_value.DOM.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);
            dipam_unit_value.DOM.NODE_DATA.addClass('disabled');
          }
      }
    });

    this.DOM.CANCEL_BUTTON.on('click', function() {
      dipam_unit_value.DOM.EDIT_BUTTON.text('Edit').removeClass('btn-success').addClass('btn-primary');
      dipam_unit_value.DOM.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);
      dipam_unit_value.DOM.NODE_DATA.addClass('disabled');
      dipam_unit_value.DOM.CANCEL_BUTTON.hide();
      dipam_unit_value.DOM.REMOVE_BUTTON.hide();
    });

    this.DOM.REMOVE_BUTTON.on('click', function() {
      const node_id = dipam_unit_value.DOM.CONTROL_BODY.data('id');
      diagram_instance.remove_elem( node_id, interface_instance.show_popupmsg_all );
      diagram_instance.save_workflow( false );
      diagram_instance.get_diagram_cy().emit('tap',[]);
    });

    this.DOM.META_VIEW_VALUES.on('input', function() {
      let view_value = {};
      const node_id = dipam_unit_value.DOM.CONTROL_BODY.data('id');
      const node_type = dipam_unit_value.DOM.CONTROL_BODY.data('type');
      view_value[$(this).attr('data-dipam-value')] = $(this).val();
      diagram_instance.set_node_view_value( node_type, node_id, view_value);
    });
    this.DOM.VIEW_VALUES.on('input', function() {
      const node_id = dipam_unit_value.DOM.CONTROL_BODY.data('id');
      const node_type = dipam_unit_value.DOM.CONTROL_BODY.data('type');
      let view_value = {};
      if (! ("vinput" in view_value)) {
        view_value["vinput"] = {};
      }
      view_value["vinput"][$(this).attr('data-dipam-value')] = $(this).val();
      diagram_instance.set_node_view_value( node_type, node_id, view_value);
    });

  }

}
