
class diagram {
  NODE_COLOR = {'tool': 'orange', 'data': '#74beda'};
  NODE_SHAPE = {'tool': 'diamond', 'data': 'round-rectangle'};
  NODE_ONCLICK_COLOR = '#663500';

  EDGE_COLOR = {'edge':'#bfbfbf'};
  EDGE_ONCLICK_COLOR = '#663500';

  COMPATIBLE_STYLE = {true: {'opacity': '1', 'overlay-opacity': '0'}, false:{'opacity': '0.3', 'overlay-opacity': '0'}};

  constructor(container_id, config, diagram_name) {
    this.CONFIG = config;

    this.DIAGRAM_CONTAINER = document.getElementById(container_id);

    this.DIAGRAM_GENERAL = {data: {id: 'diagram-01', name: diagram_name, type: 'general'}};

    this.ALL_NODES = [
      { data: { id: 'd-0001', name: 'Textual data (d1)', type: 'data', value: 'd0' } },
      { data: { id: 't-0001', name: 'Filter names (t1)', type: 'tool', value: 't-filter-names' } },
      { data: { id: 't-0002', name: 'Topic modeling (t2)', type: 'tool', value: 't-topic-lda' } },
      { data: { id: 't-0003', name: 'View bar chart (t3)', type: 'tool', value: 't-chart-bar' } }
    ];

    this.ALL_EDGES = [
      { data: {type: 'edge', id: 'e-0001', source: 'd-0001', target: 't-0001' } },
      { data: {type: 'edge', id: 'e-0002', source: 't-0001', target: 't-0002' } },
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

    this.get_nodes('tool').style(this.STYLE.node.tool);
    this.get_nodes('data').style(this.STYLE.node.data);
    this.get_edges().style(this.STYLE.edge.edge);
  }

  get_diagram_obj() {
    return this.cy;
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
  get_edges(){
    return this.cy.edges();
  }

  add_node(type) {
    var node_n = this.gen_node_data(type);
    node_n.group = 'nodes';
    this.cy.add(node_n);
  }
  gen_node_data(n_type) {
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

  after_add_edge(edge_data){
    console.log(edge_data);
    var flag_compatible = this.is_compatible(this.cy.nodes("node[id='"+edge_data.source+"']")[0], this.cy.nodes("node[id='"+edge_data.target+"']")[0]);
    //check also if there is another same edge
    if (!flag_compatible) {
      this.cy.remove(edge_data.id);
    }
    return edge_data;
  }
  gen_edge_data(source_id,target_id){
    var edge_obj = { data: { id: '', name: '', source:'', target:'', type: 'edge', value: '' }, group: 'edges'};
    edge_obj.data.id = this.gen_id('edge');
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
    return this.cy.remove("#"+elem_id);
  }

  //adapt the style of the clicked element:<elem> of type:<type>
  click_elem_style(elem,type){

    elem = elem._private.data;

    //first color all nodes
    var arr_elems = this.cy.nodes();
    for (var i = 0; i < arr_elems.length; i++) {
      var elem_obj = arr_elems[i];
      var org_bg_color = this.NODE_COLOR[elem_obj._private.data.type];
      this.cy.nodes('node[id="'+elem_obj._private.data.id+'"]').style({'background-color': org_bg_color})
    }

    arr_elems = this.cy.edges();
    for (var i = 0; i < arr_elems.length; i++) {
      var elem_obj = arr_elems[i];
      var org_bg_color = this.EDGE_COLOR[elem_obj._private.data.type];
      this.cy.edges('edge[id="'+elem_obj._private.data.id+'"]').style({'line-color': org_bg_color, 'target-arrow-color': org_bg_color});
    }

    if (type == 'node') {
      this.cy.nodes('node[id="'+elem.id+'"]').style({'background-color': this.NODE_ONCLICK_COLOR});
    }else if (type == 'edge') {
      this.cy.edges('edge[id="'+elem.id+'"]').style({'line-color': this.EDGE_ONCLICK_COLOR, 'target-arrow-color': this.EDGE_ONCLICK_COLOR});
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

}
