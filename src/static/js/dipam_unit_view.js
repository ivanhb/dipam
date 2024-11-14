class dipam_unit_view {

  constructor() {}

  /**
  * This methods goes throught the interface of the visulized node and reads all the input(s)
  * inputs are converted into: "direct-input", "file-input", and all the metadata (e.g., label, description)
  */
  get_node_view_value_from_interface( node_id, node_type, include_metadata = false ) {

    // select all DOMs that update the ONLY view value
    var view_value = {};
    $('#input_section [data-dipam-value]:not(#input_group [data-dipam-value])').each(function() {
        var _id = $(this).attr('data-dipam-value');
        view_value[_id] = $(this).attr('value');
    });

    // select all DOMs that update the backend value
    var app_value = {};
    $('#input_group').find('[data-dipam-value]').each(function() {
        if (!("vinput" in app_value)) {
          app_value["vinput"] = {};
        }
        var _id = $(this).attr('data-dipam-value');
        app_value["vinput"][_id] = $(this).attr('value');
    });

    const dom_finput = document.getElementById('f_input');
    console.log(dom_finput);
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

  /**
  * Set the values of the DOMs in the template part of the input-group container
  */
  set_node_interface_from_view_value( unit_id, unit_type) {
    // take the view value from the diagram nodes
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
        var a_val = current_value["vinput"][_id];
        if ((a_val != undefined) || (a_val != null)) {
            this.value = __normal_html_value( a_val );
        }
    });

    return true;

    function __normal_html_value(_val) {
      _val = _val.replace(/\\n/g, '\n');
      return _val;
    }
  }

  /**
  * This function is executed to run all default DOM creations and Events of the info control section;
  * This must be done here and DOMs need to be taken dynamically here.
  */
  set_interface() {

    var DOMS = {
      // The base body
      "CONTROL_BODY": $("#control_body"),
      // INPUT part
      "NODE_DATA": $('#node_data'),
      "INPUT_SECTION": $('#input_section'),
      "INPUT_SWITCH_CONTAINER": $('#switch_data_input_btn'),
      "INPUT_SWITCH_BTN": $('#switch_input'),
      "META_VIEW_VALUES": $('#input_section [data-dipam-value]:not(#input_group [data-dipam-value])'),
      "INPUT_GROUP_VALUES": $('#input_group'),
      "VIEW_VALUES": $('#input_group').find('[data-dipam-value]'),
      // EDIT part
      "EDIT_BUTTON":$('#edit_btn'),
      "CANCEL_BUTTON":$('#cancel_btn'),
      "REMOVE_BUTTON":$('#remove_btn')
    }

    /*Node id, class, type, and settings*/
    const node_id = DOMS.CONTROL_BODY.data('id');
    const node_class = DOMS.CONTROL_BODY.data('class');
    const node_type = DOMS.CONTROL_BODY.data('type');

    /*Find and disable all <data-dipam-value>(s) */
    DOMS.NODE_DATA.addClass('disabled');
    DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);

    DOMS.EDIT_BUTTON.on('click', function() {
      if ($(this).text() === 'Edit') {
        $(this).text('Save').removeClass('btn-primary').addClass('btn-success');
        DOMS.CANCEL_BUTTON.show();
        DOMS.REMOVE_BUTTON.show();
        // enable inputs and buttons
        DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', false);
        DOMS.NODE_DATA.removeClass('disabled');
      } else {
        // in this case save values
        var node_view_value = diagram_instance.get_node_view_value(node_id);
        console.log("Save data view=",node_view_value);

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
              console.log("Data to save", data);
              // in case of success:
              // (1) update the node diagram value
              // (2) generate the template interface

              // diagram_instance.set_node_data(node_type, node_id, node_data);

              // show all returned messages;
              // in case of error
              // Note: previous code updating the interface is done anyway
              if (! (vw_interface.show_popupmsg_all(data)) ) {
                  return false;
              }
              __rm_edit_mode();

              // save also the new diagram workflow
              //diagram_instance.save_workflow( false, vw_interface.show_popupmsg_warning);
          })
          .catch((error) => {
              vw_interface.show_popupmsg({
                  "data": null,
                  "log_type": "error",
                  "log_msg": "Error in the DIPAM API while saving the data of a unit – "+error
              });
          });

          function __rm_edit_mode() {
            DOMS.EDIT_BUTTON.text('Edit').removeClass('btn-success').addClass('btn-primary');
            DOMS.CANCEL_BUTTON.hide();
            DOMS.REMOVE_BUTTON.hide();
            DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);
            DOMS.NODE_DATA.addClass('disabled');
          }
      }
    });

    DOMS.CANCEL_BUTTON.on('click', function() {
      DOMS.EDIT_BUTTON.text('Edit').removeClass('btn-success').addClass('btn-primary');
      DOMS.NODE_DATA.find('input, button, [data-dipam-value]').prop('disabled', true);
      DOMS.NODE_DATA.addClass('disabled');
      DOMS.CANCEL_BUTTON.hide();
      DOMS.REMOVE_BUTTON.hide();
    });

    DOMS.REMOVE_BUTTON.on('click', function() {
      diagram_instance.remove_elem( node_id, vw_interface.show_popupmsg_all );
      diagram_instance.save_workflow( false );
      diagram_instance.get_diagram_cy().emit('tap',[]);
    });

    DOMS.META_VIEW_VALUES.on('input', function() {
      let view_value = {};
      view_value[$(this).attr('data-dipam-value')] = $(this).val();
      diagram_instance.set_node_view_value( node_type, node_id, view_value);
    });
    DOMS.VIEW_VALUES.on('input', function() {
      let view_value = {};
      if (! ("vinput" in view_value)) {
        view_value["vinput"] = {};
      }
      view_value["vinput"][$(this).attr('data-dipam-value')] = $(this).val();
      diagram_instance.set_node_view_value( node_type, node_id, view_value);
    });

    dipam_unit_value.set_node_interface_from_view_value(  node_id,node_type );

    if (node_type == "data") {

      //DOMS.INPUT_SECTION.css('display','inline');

      var direct_input = null;
      var file_input = null;
      DOMS.VIEW_VALUES.each(function() {
        let data_dipam_value = $(this).attr('data-dipam-value');
        if ( data_dipam_value == "FINPUT") {
          file_input = {};
          file_input["multi"] = $(this).attr('data-multi');
          file_input["ext"] = $(this).attr('data-ext');
          file_input["description"] = $(this).attr('data-description');
          $(this).remove();
        }else {
          direct_input = {};
          direct_input[data_dipam_value] = true;
        }
      });


      // in case a FINPUT is specified then create its DOM
      if (file_input != null) {
        const button = $('<button>', { id: 'f_input_btn',class: 'file-upload-btn', text: 'Load File', click: function() { $('#f_input').click(); } });
        const fileInput = $('<input>', { type: 'file', id: 'f_input', name: 'f_input', style: 'display:none', accept: '.txt'});
        const finput_ul = __build_finput_ul(node_id, "init");
        const divWrapper = $('<div id="input_file"></div>').append(button, fileInput, finput_ul);
        DOMS.INPUT_SECTION.append(divWrapper);

        $('#f_input').on('change', function(event) {
            const selected_files = event.target.files;
            let view_value = {};
            view_value["finput"] = selected_files;
            diagram_instance.set_node_view_value( node_type, node_id, view_value);
            console.log(__build_finput_ul(node_id, "update"));
        });
      }

      if ((direct_input) && (file_input)){

        // display values input only
        $("#input_file").css('display','none');

        // display the switch button
        DOMS.INPUT_SWITCH_CONTAINER.css('display','inline');
        DOMS.INPUT_SWITCH_CONTAINER.after('<br style="height: 20px;">');

        DOMS.INPUT_SWITCH_BTN.on('change', function() {
            if (this.checked) {
                // here is "upload file"
                DOMS.INPUT_GROUP_VALUES.css('display','none');
                $("#input_file").css('display','inline');
                diagram_instance.set_node_view_value( node_type, node_id, { "selected_input": "finput" });
            } else {
                // here is "insert values"
                DOMS.INPUT_GROUP_VALUES.css('display','inline');
                $("#input_file").css('display','none');
                diagram_instance.set_node_view_value( node_type, node_id, { "selected_input": "vinput" });
            }
        });

        DOMS.INPUT_SECTION.css('display','inline');

      }
    }


    function __build_finput_ul(node_id, res = "init") {
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

  }

}
