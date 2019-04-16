
class diagram {
  NODE_COLOR = {'tool': 'orange', 'data': '#74beda'};
  NODE_SHAPE = {'tool': 'diamond', 'data': 'round-rectangle'};
  NODE_ONCLICK_COLOR = '#663500';

  EDGE_COLOR = {'edge':'gray'};
  EDGE_ONCLICK_COLOR = '#663500';

  constructor(container_id, config, diagram_name) {
    this.CONFIG = config;

    this.DIAGRAM_CONTAINER = document.getElementById(container_id);

    this.DIAGRAM_GENERAL = {id: 'diagram-01', name: diagram_name, type: 'general'};

    this.ALL_NODES = [
      { style: {'shape': this.NODE_SHAPE.data,'background-color': this.NODE_COLOR.data}, data: { id: 'd-0001', name: 'Textual data (d1)', type: 'data', value: 'd0' } },
      { style: {'shape': this.NODE_SHAPE.tool,'background-color': this.NODE_COLOR.tool}, data: { id: 't-0001', name: 'Filter names (t1)', type: 'tool', value: 't-filter-names' } },
      { style: {'shape': this.NODE_SHAPE.tool,'background-color': this.NODE_COLOR.tool}, data: { id: 't-0002', name: 'Topic modeling (t2)', type: 'tool', value: 't-topic-lda' } },
      { style: {'shape': this.NODE_SHAPE.tool,'background-color': this.NODE_COLOR.tool}, data: { id: 't-0003', name: 'View bar chart (t3)', type: 'tool', value: 't-chart-bar' } }
    ];

    this.ALL_EDGES = [
      { data: {type: 'edge', id: 'e-0001', source: 'd-0001', target: 't-0001' } },
      { data: {type: 'edge', id: 'e-0002', source: 'd-0001', target: 't-0003' } },
      { data: {type: 'edge', id: 'e-0003',source: 't-0002', target: 't-0003' } }
    ];

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
  }
  gen_edge(source_id,target_id){
    var edge_obj = { data: { id: '', name: '', source:'', target:'', type: 'edge', value: '' }, group: 'edges'};
    edge_obj.data.id = this.gen_id('edge');
    edge_obj.data.name = this.gen_id('edge');
    edge_obj.data.source = source_id;
    edge_obj.data.target = target_id;
    return JSON.parse(JSON.stringify(edge_obj));
  }

  editelem(elem_id){
    var corresponding_elem = this._search_for_elem(elem_id);
    console.log(corresponding_elem);
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
    if (this.DIAGRAM_GENERAL.id == elem_id) {
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
      console.log(base_color[elem_obj._private.data.type]);
      var org_bg_color = base_color[elem_obj._private.data.type];
      elem_obj.style({'background-color': org_bg_color});
    }

    arr_elems = this.cy.edges();
    base_color = this.EDGE_COLOR;
    for (var i = 0; i < arr_elems.length; i++) {
      var elem_obj = arr_elems[i];
      var org_bg_color = base_color[elem_obj._private.data.type];
      elem_obj.style({'background-color': org_bg_color});
    }


    if (type == 'node') {
      elem.style({'background-color': this.NODE_ONCLICK_COLOR});
    }else if (type == 'edge') {
      elem.style({'background-color': this.EDGE_ONCLICK_COLOR});
    }
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
}
