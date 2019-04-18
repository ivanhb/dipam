
class diagram {
  NODE_COLOR = {'tool': 'orange', 'data': '#74beda'};
  NODE_SHAPE = {'tool': 'diamond', 'data': 'round-rectangle'};
  NODE_ONCLICK_COLOR = '#663500';

  EDGE_COLOR = {'edge':'gray'};
  EDGE_ONCLICK_COLOR = '#663500';

  COMPATIBLE_STYLE = {true: {'opacity': '1'}, false:{'opacity': '0.3'}};

  constructor(container_id, config, diagram_name) {
    this.CONFIG = config;

    this.DIAGRAM_CONTAINER = document.getElementById(container_id);

    this.DIAGRAM_GENERAL = {data: {id: 'diagram-01', name: diagram_name, type: 'general'}};

    this.ALL_NODES = [
      //style: {'shape': this.NODE_SHAPE.data,'background-color': this.NODE_COLOR.data},
      { data: { id: 'd-0001', name: 'Textual data (d1)', type: 'data', value: 'd0' } },
      // style: {'shape': this.NODE_SHAPE.tool,'background-color': this.NODE_COLOR.tool},
      { data: { id: 't-0001', name: 'Filter names (t1)', type: 'tool', value: 't-filter-names' } },
      { data: { id: 't-0002', name: 'Topic modeling (t2)', type: 'tool', value: 't-topic-lda' } },
      { data: { id: 't-0003', name: 'View bar chart (t3)', type: 'tool', value: 't-chart-bar' } }
    ];

    this.ALL_EDGES = [
      { data: {type: 'edge', id: 'e-0001', source: 'd-0001', target: 't-0001' } },
      { data: {type: 'edge', id: 'e-0002', source: 'd-0001', target: 't-0003' } },
      { data: {type: 'edge', id: 'e-0003',source: 't-0002', target: 't-0003' } }
    ];

    this.STYLE = {
      node: {
        tool: {'shape': this.NODE_SHAPE.tool,'background-color': this.NODE_COLOR.tool},
        data: {'shape': this.NODE_SHAPE.data,'background-color': this.NODE_COLOR.data},
      },
      edge:{
        edge: {'line-color': this.EDGE_COLOR.edge}
      }
    }

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
                    'width': 12,
                    'height': 12,
                    'shape': 'ellipse',
                    'overlay-opacity': 0,
                    'border-width': 12, // makes the handle easier to hit
                    'border-opacity': 0
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
                nodes: this.ALL_NODES,
                edges: this.ALL_EDGES
              }
    });

    this.cy.nodes('node[type="tool"]').style(this.STYLE.node.tool);
    this.cy.nodes('node[type="data"]').style(this.STYLE.node.data);
  }

  get_diagram_gen_node(){
    return this.DIAGRAM_GENERAL;
  }

  get_tools(){
    var ret_arr = [];
    for (var k in this.ALL_NODES) {
      if (this.ALL_NODES.hasOwnProperty(k)) {
          if(this.ALL_NODES[k].data.type == 'tool'){
            ret_arr.push(this.ALL_NODES[k]);
          }
      }
    }
    return ret_arr;
  }

  get_data(){
    var ret_arr = [];
    for (var k in this.ALL_NODES) {
      if (this.ALL_NODES.hasOwnProperty(k)) {
          if(this.ALL_NODES[k].data.type == 'data'){
            ret_arr.push(this.ALL_NODES[k]);
          }
      }
    }
    return ret_arr;
  }

  get_edges(){
    var ret_arr = [];
    for (var k in this.ALL_EDGES) {
      if (this.ALL_EDGES.hasOwnProperty(k)) {
          if(this.ALL_EDGES[k].data.type == 'edge'){
            ret_arr.push(this.ALL_EDGES[k]);
          }
      }
    }
    return ret_arr;
  }

  get_diagram_obj() {
    return this.cy;
  }


  add_node(type) {
    var node_n = this.gen_node(type);
    //var data_node = {'data': JSON.parse(JSON.stringify(node_n.data))};
    //this.ALL_NODES.push(JSON.parse(JSON.stringify(node_n)));
    this.ALL_NODES.push(node_n);

    node_n.group = 'nodes';
    this.cy.add(node_n);
  }
  gen_node(n_type) {
    var node_obj = {
      style: null,
      position: { x: 0, y: 0},
      data: { id: '', name: '', type: n_type, value: '' }
    };

    //generate style
    node_obj.style = {'background-color': this.NODE_COLOR[n_type], 'shape': this.NODE_SHAPE[n_type]};

    //generate position (NOTE: width and height are not correct)
    var info_box = this.DIAGRAM_CONTAINER.getBoundingClientRect();
    node_obj.position.x = info_box.x;
    node_obj.position.y = info_box.y + info_box.height/2;

    //generate data
    if (n_type in this.CONFIG) {
      if (Object.keys(this.CONFIG[n_type]).length > 0){
          node_obj.data.value = Object.keys(this.CONFIG[n_type])[0];
          node_obj.data.id = this.gen_id(n_type);
          node_obj.data.name = this.gen_id(n_type);
      }
    }
    return node_obj;
  }

  add_edge(edge_obj){
    this.ALL_EDGES.push(edge_obj);

    var flag_compatible = this.is_compatible(this._search_for_elem(edge_obj.data.source), this._search_for_elem(edge_obj.data.target));
    if (!flag_compatible) {
      this.removeelem(edge_obj.data.id);
    }
  }
  gen_edge(source_id,target_id){
    var edge_obj = { data: { id: '', name: '', source:'', target:'', type: 'edge', value: '' }, group: 'edges'};
    edge_obj.data.id = this.gen_id('edge');
    edge_obj.data.name = this.gen_id('edge');
    edge_obj.data.source = source_id;
    edge_obj.data.target = target_id;
    return JSON.parse(JSON.stringify(edge_obj));
  }


  //Update an element
  // (1) Its data in this Class
  // (2) Its data in the cy diagram
  // (3) Its style in the cy diagram
  // (4) The realtime correlated items (Remove edges in case not suitable anymore)
  // (5) The real time compatible elements of the cy diagram
  update_elem(id,data){

    // (1) Its data in this Class
    var target_elem = this._search_for_elem(id);
    for (var k_data in data) {
      if (target_elem.data.hasOwnProperty(k_data)) {
        target_elem.data[k_data] = data[k_data];
      }
    }

    // (2 ... 5) now all the cy correlated data
    var d_node = this.cy.getElementById(target_elem.data.id);

    // (2) Its data in the cy diagram
    d_node.data(target_elem.data);

    // (3) Its style in the cy diagram
    this.update_style(d_node, target_elem.data.type, target_elem.data.value);

    // (4) The realtime correlated items (Remove edges in case not suitable anymore)
    this.check_connected_edges(target_elem);

    // (5) The real time compatible elements of the cy diagram
    this.check_node_compatibility(target_elem.data);

    return target_elem;
  }

  update_style(elems, elem_type, type){
    try {
      set_compatibility(selector= null, active = true)

      if (elem_type == "node") {
        elems.cy.nodes(elem_type+'[type="'+type+'"]').style(this.STYLE[elem_type][type]);
      }else if (elem_type == "edge") {
        elems.cy.edges(elem_type+'[type="'+type+'"]').style(this.STYLE[elem_type][type]);
      }
    } catch (e) {
      return -1;
    }
  }

  removeelem(elem_id){
    var corresponding_elem = this._search_for_elem(elem_id);
    console.log(corresponding_elem);
    switch (corresponding_elem.data.type) {
          case 'tool': this.ALL_NODES.splice(this.index_of_elem(elem_id),1); break;
          case 'data': this.ALL_NODES.splice(this.index_of_elem(elem_id),1); break;
          case 'edge': this.ALL_EDGES.splice(this.index_of_elem(elem_id),1); break;
    }
    this.cy.remove("#"+corresponding_elem.data.id);
  }

  _search_for_elem(elem_id){
    //check if is the DIAGRAM_GENERAL
    if (this.DIAGRAM_GENERAL.data.id == elem_id) {
      return this.DIAGRAM_GENERAL;
    }

    //check ALL_NODES
    for (var i = 0; i < this.ALL_NODES.length; i++) {
      if(this.ALL_NODES[i].data.id == elem_id){
        return this.ALL_NODES[i];
      }
    }

    //check ALL_EDGES
    for (var i = 0; i < this.ALL_EDGES.length; i++) {
      if(this.ALL_EDGES[i].data.id == elem_id){
        return this.ALL_EDGES[i];
      }
    }

    return -1;
  }

  index_of_elem(elem_id){
    //check ALL_NODES
    for (var i = 0; i < this.ALL_NODES.length; i++) {
      if(this.ALL_NODES[i].data.id == elem_id){
        return i;
      }
    }

    //check ALL_EDGES
    for (var i = 0; i < this.ALL_EDGES.length; i++) {
      if(this.ALL_EDGES[i].data.id == elem_id){
        return i;
      }
    }

    return -1;
  }

  click_elem_style(elem,type){

    //first color all nodes
    var arr_elems = this.cy.nodes();
    var base_color = this.NODE_COLOR;
    for (var i = 0; i < arr_elems.length; i++) {
      var elem_obj = arr_elems[i];
      var org_bg_color = base_color[elem_obj._private.data.type];
      this.cy.nodes('node[id="'+elem_obj._private.data.id+'"]').style({'background-color': org_bg_color})
    }

    arr_elems = this.cy.edges();
    base_color = this.EDGE_COLOR;
    for (var i = 0; i < arr_elems.length; i++) {
      var elem_obj = arr_elems[i];
      var org_bg_color = base_color[elem_obj._private.data.type];
      this.cy.edges('edge[id="'+elem_obj._private.data.id+'"]').style({'line-color': org_bg_color, 'target-arrow-color': org_bg_color});
    }

    if (type == 'node') {
      this.cy.nodes('node[id="'+elem.id+'"]').style({'background-color': this.NODE_ONCLICK_COLOR});
      //elem.style({'background-color': this.NODE_ONCLICK_COLOR});
    }else if (type == 'edge') {
      this.cy.edges('edge[id="'+elem.id+'"]').style({'line-color': this.EDGE_ONCLICK_COLOR, 'target-arrow-color': this.EDGE_ONCLICK_COLOR});
      console.log(this.cy.edges());
      //elem.style({'background-color': this.EDGE_ONCLICK_COLOR});
    }
  }

  check_connected_edges(node){

    //var connected_edges = node.connectedEdges());
    //connected_edges[i].connectedNodes();
    //var connected_nodes = a.neighborhood();

    var sel_node_conf_obj = this.CONFIG[node.data.type][node.data.value];

    var edges_to_remove = [];

    //the outcoming edges
    var outcoming_edges = cy.edges('[source = "'+node.data.id+'"]');
    for (var i = 0; i < outcoming_edges.length; i++) {
      var c_node = outcoming_edges[i].target();
      var c_node_compatible_input = this.get_compatible_input(this._search_for_elem(c_node._private.data.id));
      var sel_node_output = this.get_output(node);
      console.log(c_node_compatible_input, sel_node_output);
      for (var j = 0; j < c_node_compatible_input.length; j++) {
        if (sel_node_output.indexOf(c_node_compatible_input[j]) == -1){
          edges_to_remove.push(outcoming_edges[i]);
        }
      }
    }

    //the incoming edges
    var incoming_edges = cy.edges('[target = "'+node.data.id+'"]');
    for (var i = 0; i < incoming_edges.length; i++) {
      var c_node = incoming_edges[i].source();
      var c_node_output = this.get_output(this._search_for_elem(c_node._private.data.id));
      var sel_node_compatible_input = this.get_compatible_input(node);
      for (var j = 0; j < c_node_output.length; j++) {
        if (sel_node_compatible_input.indexOf(c_node_output[j]) == -1 ){
          edges_to_remove.push(incoming_edges[i]);
        }
      }
    }

    for (var i = 0; i < edges_to_remove.length; i++) {
      this.cy.remove(edges_to_remove[i]);
    }

    return edges_to_remove;
  }

  check_node_compatibility(node){

    var all_diagram_nodes = this.cy.nodes();

    //first make all transparent
    this.set_compatibility(null,false);
    //activate selected node
    this.set_compatibility("node[id='"+node.id+"']", true);

    //first check if the giving node have a specific output or is 'data' node type
    var output_sel_node = this.CONFIG[node.type][node.value].output;
    if ((output_sel_node != undefined) || (node.type == 'data')) {

      //in case is a 'data' node the output_data is itself
      if (node.type == 'data') {
        output_sel_node = node.value;
      }

      //enable the compatible ones
      var compatible_nodes = [];
      for (var i = 0; i < all_diagram_nodes.length; i++) {

        var d_node = all_diagram_nodes[i];
        var d_node_type = d_node._private.data.type;

        if ((d_node_type == 'tool') || (d_node_type == 'data')) {
          var d_node_value = d_node._private.data.value;
          var d_node_id = d_node._private.data.id;

          var compatible_input = this.CONFIG[d_node_type][d_node_value].compatible_input;

          if (compatible_input != undefined) {
            for (var j = 0; j < compatible_input.length; j++) {
              if(output_sel_node.indexOf(compatible_input[j]) != -1){
                //activate again the node
                this.set_compatibility("node[id='"+d_node_id+"']",true);
              }
            }
          }
        }
      }
    }else {
      //is a terminal node
    }
  }

  set_compatibility(selector= null, active = true){
    var target_element = this.cy.nodes();
    if (selector != null) {
      target_element = this.cy.nodes(selector);
    }
    target_element.style(this.COMPATIBLE_STYLE[active]);
    target_element.active(active);
  }

  gen_id(type){

      var str_prefix = "";
      var num_id = null;
      var arr_elems = null;
      switch (type) {
            case 'tool': str_prefix = "t-"; arr_elems= this.get_tools(); break;
            case 'data': str_prefix = "d-"; arr_elems= this.get_data(); break;
            case 'edge': str_prefix = "e-"; arr_elems= this.get_edges(); break;
      }

      var ids_taken = [];
      for (var i = 0; i < arr_elems.length; i++) {
          ids_taken.push(parseInt(arr_elems[i].data.id.substring(2)));
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
  get_output(node){
    var res = [];
    var node_type = node.data.type;
    var node_value = node.data.value;
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
  get_compatible_input(node){
    var res = [];
    var node_type = node.data.type;
    var node_value = node.data.value;
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

}
