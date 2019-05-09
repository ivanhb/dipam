
class dipam_diagram {


  constructor(container_id, config_data, diagram_name, workflow={}) {

    this.DIAGRAM_DATA = config.graph.diagram_data;
    this.NODE_DATA = config.graph.node_data;
    this.EDGE_DATA = config.graph.edge_data;

    this.CONFIG = config;

    this.DIAGRAM_CONTAINER = document.getElementById(container_id);

    this.DIAGRAM_GENERAL = workflow.diagram;
    this.INIT_NODES = workflow.nodes;
    this.INIT_EDGES = workflow.edges;

    this.STYLE = {
      node: {
        tool: {'shape': 'diamond','background-color': 'orange'},
        data: {'shape': 'round-rectangle','background-color': '#74beda'},
      },
      edge:{
        edge: {'line-color': '#bfbfbf', 'target-arrow-color': '#bfbfbf'}
      }
    };

    this.ONCLICK_STYLE = {
      node: {
        tool: {'background-color': '#663500'},
        data: {'background-color': '#663500'},
      },
      edge:{
        edge: {'line-color': '#663500', 'target-arrow-color': '#663500'}
      }
    };

    this.COMPATIBLE_STYLE = {
          true: {'opacity': '1', 'overlay-opacity': '0'},
          false:{'opacity': '0.3', 'overlay-opacity': '0'}
    };

    this.cy = cytoscape({
              container: this.DIAGRAM_CONTAINER,

              layout: {
                name: 'grid',
                rows: 2,
                cols: 2
              },

              style: [
                {
                  selector: 'node[name]',
                  style: {
                    'content': 'data(name)'
                  }
                },

                {
                  selector: 'edge',
                  style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle'
                  }
                },

                // some style for the extension


                {
                  selector: '.eh-handle',
                  style: {
                    'background-color': 'red',
                    'width': 15,
                    'height': 15,
                    'shape': 'ellipse',
                    'overlay-opacity': 0,
                    'border-width': 10, // makes the handle easier to hit
                    'border-opacity': 0,
                    'opacity': 0.6,
                  }
                },

                {
                  selector: '.eh-hover',
                  style: {
                    'background-color': 'red'
                  }
                },

                {
                  selector: '.eh-source',
                  style: {
                    'border-width': 2,
                    'border-color': 'red'
                  }
                },

                {
                  selector: '.eh-target',
                  style: {
                    'border-width': 2,
                    'border-color': 'red'
                  }
                },

                {
                  selector: '.eh-preview, .eh-ghost-edge',
                  style: {
                    'background-color': 'red',
                    'line-color': 'red',
                    'target-arrow-color': 'red',
                    'source-arrow-color': 'red'
                  }
                },

                {
                  selector: '.eh-ghost-edge.eh-preview-active',
                  style: {
                    'opacity': 0
                  }
                }
              ],

              elements: {
                nodes: this.INIT_NODES,
                edges: this.INIT_EDGES
              }
    });
    var cy_undo_redo = this.cy.undoRedo(
        {
              isDebug: true, // Debug mode for console messages
              actions: {},// actions to be added
              undoableDrag: false, // Whether dragging nodes are undoable can be a function as well
              stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
              ready: function () { // callback when undo-redo is ready

              }
        }
    );
    this.cy_undo_redo = cy_undo_redo;

    this.get_nodes('tool').style(this.STYLE.node.tool);
    this.get_nodes('data').style(this.STYLE.node.data);
    this.get_edges().style(this.STYLE.edge.edge);
  }

  get_diagram_obj() {
    return this.cy;
  }
  get_undo_redo() {
    return this.cy_undo_redo;
  }
  get_diagram(){
    return this.DIAGRAM_GENERAL;
  }
  get_nodes(type = null){
    if (type != null) {
      return this.cy.nodes('node[type = "'+type+'"]');
    }
    return this.cy.nodes('node[type = "data"]').union(this.cy.nodes('node[type = "tool"]'));
  }
  get_target_nodes(node){
    var out_nodes = this.cy.edges('edge[source="'+node._private.data.id+'"]').targets();
    var out_nodes_normalized = out_nodes.nodes('node[type = "data"]').union(out_nodes.nodes('node[type = "tool"]'));
    return out_nodes_normalized;
  }
  get_source_nodes(node){
    var in_nodes = this.cy.edges('edge[target="'+node._private.data.id+'"]').sources();
    var in_nodes_normalized = in_nodes.nodes('node[type = "data"]').union(in_nodes.nodes('node[type = "tool"]'));
    return in_nodes_normalized;
  }
  get_nodes_att_values(arr_nodes, att){
    var arr_att = [];
    for (var i = 0; i < arr_nodes.length; i++) {
      arr_att.push(arr_nodes[i]._private.data[att]);
    }
    return arr_att;
  }
  get_edges(){
    return this.cy.edges();
  }

  get_workflow_data(){
    var workflow_to_save = {
      'diagram': this.DIAGRAM_GENERAL,
      'nodes': [],
      'edges': [],
    };
    // build the nodes
    var diagram_nodes = this.get_nodes();
    for (var i = 0; i < diagram_nodes.length; i++) {
      workflow_to_save.nodes.push({"data": JSON.parse(JSON.stringify(diagram_nodes[i]._private.data))});
    }
    // build the edges
    var diagram_edges = this.get_edges();
    for (var i = 0; i < diagram_edges.length; i++) {
      workflow_to_save.edges.push({"data": JSON.parse(JSON.stringify(diagram_edges[i]._private.data))});
    }

    return workflow_to_save;
  }

  add_node(type) {
    var node_n = this.gen_node_data(type);
    node_n.group = 'nodes';
    this.cy.add(node_n);
    this.cy_undo_redo.do("add", this.cy.$("#"+node_n.data.id));
  }
  gen_node_data(n_type) {
    var node_obj = {
      style: this.STYLE.node[n_type],
      position: { x: 0, y: 0},
      data: JSON.parse(JSON.stringify(this.NODE_DATA))
    };

    //generate position (NOTE: width and height are not correct)
    var info_box = this.DIAGRAM_CONTAINER.getBoundingClientRect();
    node_obj.position.x = info_box.x;
    node_obj.position.y = info_box.y + info_box.height/2;
    for (var i = 0; i < this.cy.nodes().length; i++) {
      var a_node_added = this.cy.nodes()[i];
      if((a_node_added.position('x') == node_obj.position.x) && (a_node_added.position('y') == node_obj.position.y)){
        node_obj.position.y = node_obj.position.y + a_node_added.height();
        i = 0;
      }
    }


    //in case there is another node there

    //Init the essential data: id, name, value
    if (n_type in this.CONFIG) {
      if (Object.keys(this.CONFIG[n_type]).length > 0){
          var new_id = this.gen_id(n_type);
          node_obj.data.value = Object.keys(this.CONFIG[n_type])[0];
          node_obj.data.id = new_id;
          node_obj.data.name = new_id;
          node_obj.data.type = n_type;
      }
    }
    console.log(node_obj);
    return node_obj;
  }

  after_add_edge(edge_data){
    var source_node = this.cy.nodes("node[id='"+edge_data.source+"']")[0];
    var target_node = this.cy.nodes("node[id='"+edge_data.target+"']")[0];
    var flag_compatible = this.is_compatible(source_node, target_node);

    //check if the diagram is still a DAG
    var flag_is_cycle = is_cycle(this.get_target_nodes(source_node), source_node, this.cy);

    //check also if there is another same edge
    if ((!flag_compatible) || flag_is_cycle)  {
      console.log('Edge not compatible! ');
      this.cy.remove('#'+edge_data.id);
    }else {
      //if flag_compatible add it to log file
      this.cy_undo_redo.do("add", this.cy.$("#"+edge_data.id));
    }

    return edge_data;

    //is cycle starting from node N
    function is_cycle(arr_nodes, origin, cy_instance){

      for (var i = 0; i < arr_nodes.length; i++) {
        var node = arr_nodes[i];
        //check the target nodes of the selected node <node>
        var out_nodes = cy_instance.edges('edge[source="'+node._private.data.id+'"]').targets();
        out_nodes = out_nodes.nodes('node[type = "data"]').union(out_nodes.nodes('node[type = "tool"]'));
        console.log(node, out_nodes);
        if (out_nodes.length == 0) {
          return __is_same_node(node, origin);
        }else {
          return __is_same_node(node, origin) || is_cycle(out_nodes, origin, cy_instance);
        }
      }

      function __is_same_node(n_a, n_b){
        return (n_a._private.data.id == n_b._private.data.id);
      }
    }
  }
  gen_edge_data(source_id,target_id){
    var edge_obj = { data: JSON.parse(JSON.stringify(this.EDGE_DATA)) , group: 'edges'};
    edge_obj.data.id = this.gen_id('edge');
    edge_obj.data.type = 'edge';
    edge_obj.data.name = this.gen_id('edge');
    edge_obj.data.source = source_id;
    edge_obj.data.target = target_id;
    return JSON.parse(JSON.stringify(edge_obj));
  }


  //Update an element
  // (1) Its data in the cy diagram
  // (2) Its style in the cy diagram
  // (3) The realtime correlated items (Remove edges in case not suitable anymore)
  // (4) The real time compatible elements of the cy diagram
  update_elem(id,data){

    //first check if it's the Diagram
    if (id == this.DIAGRAM_GENERAL.data.id) {
      for (var k_data in data) {
        if (this.DIAGRAM_GENERAL.data.hasOwnProperty(k_data)) {
          this.DIAGRAM_GENERAL.data[k_data] = data[k_data];
        }
      }
      return this.DIAGRAM_GENERAL;
    }

    var d_node = this.cy.getElementById(id);

    // (1) update it's data first
    for (var k_data in data) {
      if (d_node._private.data.hasOwnProperty(k_data)) {
        d_node._private.data[k_data] = data[k_data];
      }
    }

    // (2) Its style in the cy diagram
    console.log(this.adapt_style(d_node));

    // (3) The realtime correlated items (Remove neighborhood edges in case not suitable anymore)
    this.check_node_compatibility(d_node, true);

    // (4) The real time compatible elements of the cy diagram
    this.check_node_compatibility(d_node);

    //update diagram
    cy.style().update();

    return d_node;
  }

  //adapt the style to an element:<elem>
  //returns the new style of the element
  adapt_style(elem){
    var elem_type = 'node';
    if(elem.isEdge()){
      elem_type = 'edge';
    }
    var elem_style = this.STYLE[elem_type][elem._private.data.type];
    elem.style(elem_style);
    return elem_style;
  }

  //Remove an element by taking its id:<elem_id> from the diagram
  //returns the removed element
  remove_elem(elem_id){
    this.cy_undo_redo.do("remove", this.cy.$("#"+elem_id));
    return this.cy.remove("#"+elem_id);
  }

  //adapt the style of the clicked element:<elem> of type:<type>
  click_elem_style(elem,type){

    elem = elem._private.data;

    //first color all nodes
    var arr_elems = this.cy.nodes();
    for (var i = 0; i < arr_elems.length; i++) {
      var elem_obj = arr_elems[i];
      this.cy.nodes('node[id="'+elem_obj._private.data.id+'"]').style(this.STYLE.node[elem_obj._private.data.type]);
    }

    arr_elems = this.cy.edges();
    for (var i = 0; i < arr_elems.length; i++) {
      var elem_obj = arr_elems[i];
      this.cy.edges('edge[id="'+elem_obj._private.data.id+'"]').style(this.STYLE.edge[elem_obj._private.data.type]);
    }

    if (type == 'node') {
      this.cy.nodes('node[id="'+elem.id+'"]').style(this.ONCLICK_STYLE.node[elem.type]);
    }else if (type == 'edge') {
      this.cy.edges('edge[id="'+elem.id+'"]').style(this.ONCLICK_STYLE.edge[elem.type]);
    }
  }

  //adapt the node compatibility status regarding it's neighborhood nodes
  //returns the neighborhood nodes
  check_node_compatibility(node, neighborhood = false){

    var node_id = node._private.data.id;

    //first make all transparent
    this.activate_nodes(null,false, true);
    //activate selected node
    this.activate_nodes("node[id='"+node_id+"']", true, true);
    //get the nodes i must check
    var nodes_to_check = {
      'all_nodes': this.cy.nodes('[type = "data"]').union(this.cy.nodes('[type = "tool"]')).difference(this.cy.nodes("node[id='"+node_id+"']")),
      'target_nodes': this.cy.edges('[source = "'+node_id+'"]').target(),
      'source_nodes': this.cy.edges('[target = "'+node_id+'"]').source()
    };

    //in case we want to check only the neighborhood nodes (the connected nodes)
    if (neighborhood) {
      nodes_to_check.all_nodes = [];
    } else {
      nodes_to_check.target_nodes = [];
      nodes_to_check.source_nodes = [];
    }

    for (var k_nodes in nodes_to_check) {
      if (nodes_to_check[k_nodes] != undefined) {
        for (var i = 0; i < nodes_to_check[k_nodes].length; i++) {
          var node_to_check_obj = nodes_to_check[k_nodes][i];
          var node_to_check_obj_id = node_to_check_obj._private.data.id;
          var flag_compatible = false;
          if (k_nodes == 'target_nodes') {
            flag_compatible = this.is_compatible(node, node_to_check_obj);
            if (!(flag_compatible)){
              this.cy.remove(this.cy.edges('edge[source="'+node_id+'"]').edges('edge[target="'+node_to_check_obj_id+'"]') );
            }
          }
          else if (k_nodes == 'source_nodes') {
            flag_compatible = this.is_compatible(node_to_check_obj, node);
            if (!(flag_compatible)){
              this.cy.remove(this.cy.edges('edge[source="'+node_id+'"]').edges('edge[target="'+node_to_check_obj_id+'"]') );
            }
          }
          else if (k_nodes == 'all_nodes') {
            flag_compatible = this.is_compatible(node, node_to_check_obj);
          }
          this.activate_nodes("node[id='"+node_to_check_obj_id+"']",flag_compatible, flag_compatible);
        }
      }
    }

    return nodes_to_check;
  }

  //activate/deactivate the diagram nodes. a subset could be defined through <selector>
  //returns the activated/deactivated nodes
  activate_nodes(selector= null, active = true, flag_interaction= true){
    var target_element = this.cy.nodes();
    if (selector != null) {
      target_element = this.cy.nodes(selector);
    }
    for (var i = 0; i < target_element.length; i++) {
      target_element[i].style(this.COMPATIBLE_STYLE[active]);
      target_element[i]._private.active = active;
      //this.set_node_interaction(target_element[i], 'selectable', flag_interaction);
    }
    return target_element;
  }

  //set selectable, draggable values
  set_node_interaction(elem, type, flag){
      elem._private[type] = flag;
  }

  //Generate an ID for a giving type of element
  //type: tool | data | edge
  //returns an ID with t- | d- | e- followed by a 4-digit. e.g: t-0012
  gen_id(type){

      var str_prefix = "";
      var num_id = null;
      var arr_elems = null;
      switch (type) {
            case 'tool': str_prefix = "t-"; arr_elems= this.get_nodes('tool'); break;
            case 'data': str_prefix = "d-"; arr_elems= this.get_nodes('data'); break;
            case 'edge': str_prefix = "e-"; arr_elems= this.get_edges(); break;
      }

      var ids_taken = [];
      for (var i = 0; i < arr_elems.length; i++) {
          ids_taken.push(parseInt(arr_elems[i]._private.data.id.substring(2)));
      }

      var num_id = 1;
      while (num_id <= arr_elems.length) {
        if (ids_taken.indexOf(num_id) == -1) {
          break;
        }else {
          num_id++;
        }
      }

      var num_zeros = 3 - num_id/10;
      var str_zeros = "";
      for (var i = 0; i < num_zeros; i++) {
            str_zeros= str_zeros + "0";
      }
      return str_prefix+str_zeros+num_id;
  }

  //takes a class node
  //returns an array of all the output data IDs
  get_output(node){
    var res = [];
    var node_type = node._private.data.type;
    var node_value = node._private.data.value;
    if (node_type == 'data') {
      res.push(node_value);
    }else {
      var node_conf_obj = this.CONFIG[node_type][node_value];
      if (node_conf_obj != undefined) {
        if (node_conf_obj.output != undefined) {
          res = node_conf_obj.output;
        }
      }
    }

    return res;
  }

  //takes a class node
  //returns an array of all the compatible-input data IDs
  get_compatible_input(node){
    var res = [];
    var node_type = node._private.data.type;
    var node_value = node._private.data.value;
    if (node_type != 'data') {
      var node_conf_obj = this.CONFIG[node_type][node_value];
      if (node_conf_obj != undefined) {
        if (node_conf_obj.compatible_input != undefined) {
          res = node_conf_obj.compatible_input;
        }
      }
    }
    return res;
  }

  //is compatible
  //returns true if the output of <source_node> is acceptable (compatible) for the <target_node>
  is_compatible(source_node, target_node){
    //check if the edge is compatible
    var compatible_input = this.get_compatible_input(target_node);
    var output = this.get_output(source_node);
    for (var i = 0; i < output.length; i++) {
      if(compatible_input.indexOf(output[i]) != -1){
        return true;
      }
    }
    return false;
  }

  //build the topological execution order of the nodes
  build_nodes_topological_ordering(){
    var topological_ordered_list = [];

    //get all nodes
    var all_nodes = this.get_nodes();

    //Start processing
    var i = 0;
    while (i < all_nodes.length) {
      var a_node = all_nodes[i];
      var a_node_config = this.CONFIG[a_node._private.data.type][a_node._private.data.value];
      if (in_arr_obj(topological_ordered_list, "id", a_node._private.data.id)) {
        i++;
      }else {
        //define the node method for both cases
        var a_node_method = null;
        if (a_node._private.data.type == 'tool') {
          a_node_method = a_node_config.function;
        }else if (a_node._private.data.type == 'data') {
          a_node_method = a_node_config.data_class;
        }

        _process_node(
          //node-fields
          a_node._private.data.id,
          a_node._private.data.type,
          a_node_method,
          a_node._private.data.param,
          //node-inputs
          this.get_nodes_att_values(this.get_source_nodes(a_node),'id'),
          //node-outputs
          this.get_nodes_att_values(this.get_target_nodes(a_node),'id'),
          //the current index
          i
        );
        i = 0;
      }
    }


    return topological_ordered_list;

    function _process_node(node_id, node_type, node_value, node_param, inputs, outputs, current_index){
      var add_it = false;
      if (inputs.length == 0) {
        //is a root node
        add_it = true;
      }else {
        //check if all its inputs are inside the index_processed
        var all_processed;
        for (var j = 0; j < inputs.length; j++) {
          if(in_arr_obj(topological_ordered_list, "id", inputs[j])){
            all_processed = true;
          }else {
            all_processed = false;
            break;
          }
        }
        if (all_processed) {
          add_it = true;
        }
      }

      if (add_it) {
        topological_ordered_list.push({
            "id": node_id,
            "type": node_type,
            "method": node_value,
            "param": node_param,
            "input": inputs,
            "output": outputs
        });
      }
    }
    function in_arr_obj(arr, att, val){
      for (var i = 0; i < arr.length; i++) {
        if(arr[i][att] == val){
          return true;
        }
      }
      return false;
    }
  }

  //generate an id for a new path. In case the path is born from another specify its father id in <start_point>
  // returns a new id in the format: p-1
  gen_path_id(paths){
    var new_path_id = Object.keys(paths).length;
    return 'p-'+'['+new_path_id+']';
  }


  //is the given node a crossbreed
  //returns true or false
  is_crossbreed(node){
    return this.incoming_edges(node).length > 1;
  }

  //is the given node a root
  //returns true or false
  is_root(node){
    return this.incoming_edges(node).length == 0;
  }

  //is the given node a leaf
  //returns true or false
  is_leaf(node){
    return this.outgoing_edges(node).length == 0;
  }

  //the ougoing edges of a given node
  // an array of edges or [] if empty
  outgoing_edges(node){
    var outgoing_edges_arr = this.cy.edges('edge[source = "'+node._private.data.id+'"]');
    if (outgoing_edges_arr.length == 0) {
      return [];
    }
    return outgoing_edges_arr;
  }

  //the incoming edges of a given node
  // an array of edges or [] if empty
  incoming_edges(node){
    var incoming_edges_arr = this.cy.edges('edge[target ="'+node._private.data.id+'"]');
    if (incoming_edges_arr.length == 0) {
      return [];
    }
    return incoming_edges_arr;
  }

  //normalize the workflow path
  normalize_path(paths_obj){
    var normalize_paths = {};
    for (var k_path in paths_obj) {
      normalize_paths[k_path] = {nodes_ids:[]};
      for (var i = 0; i < paths_obj[k_path].nodes.length; i++) {
        normalize_paths[k_path].nodes_ids.push(paths_obj[k_path].nodes[i].id());
      }
    }
    return normalize_paths;
  }

}
