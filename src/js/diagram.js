
class diagram {
  NODE_COLOR = {'tool': 'orange', 'data': '#74beda'};
  NODE_SHAPE = {'tool': 'diamond', 'data': 'round-rectangle'};

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
      { data: {id: 'e-0001', source: 'd-0001', target: 't-0001' } },
      { data: {id: 'e-0002', source: 'd-0001', target: 't-0003' } },
      { data: {id: 'e-0003',source: 't-0002', target: 't-0003' } }
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

  get_diagram_obj() {
    return this.cy;
  }


  add_node(type) {
    var node_n = this.gen_node(type);

    //var data_node = {'data': JSON.parse(JSON.stringify(node_n.data))};
    this.ALL_NODES.push(JSON.parse(JSON.stringify(node_n)));

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

          var str_prefix = "";
          var num_id = null;
          switch (n_type) {
            case 'tool':
              str_prefix = "t-";
              num_id = this.get_tools().length + 1;
              break;
            case 'data':
              str_prefix = "d-";
              num_id = this.get_data().length + 1;
              break;
          }

          var num_zeros = 3 - num_id/10;
          var str_zeros = "";
          for (var i = 0; i < num_zeros; i++) {
            str_zeros= str_zeros + "0";
          }
          node_obj.data.id = str_prefix+str_zeros+num_id;
          node_obj.data.name = str_prefix+str_zeros+num_id;
      }
    }
    return node_obj;
  }


  editelem(elem_id){
    var corresponding_elem = this._search_for_elem(elem_id);
    console.log(corresponding_elem);
  }

  removeelem(elem_id){
    var corresponding_elem = this._search_for_elem(elem_id);
    console.log(corresponding_elem);
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

}
