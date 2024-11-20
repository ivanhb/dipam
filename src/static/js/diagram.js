
class dipam_diagram {


  constructor(workflow={}) {

    this.DIAGRAM_MAIN = workflow.diagram;

    this.SELECT_COLOR = function(alpha = 1) {
      return `rgba(82,177,82,${alpha})`;
    };
    this.DATA_COLOR = function(alpha = 1) {
      return `rgba(32,109,107,${alpha})`;
    };
    this.TOOL_COLOR = function(alpha = 1) {
      return `rgba(153,88,103,${alpha})`;
    };

    this.STYLE = {
      node: {
        tool: {
          'font-family': 'sans-serif',
          'font-weight':"lighter",
          'font-size':'10px',
          'shape': 'diamond',
          'background-image': gen_svg_gradient(this.TOOL_COLOR(0.7),this.TOOL_COLOR()),
          'background-fit': 'cover',
          'background-image-opacity': 1,
          'border-color': null,
          'border-width': 0,
          'label': function (ele) {
                    return ele.data('view_value').label; // Access nested label
                    //return ele.data('label'); // Access nested label
                },
          'text-valign': 'top',
          'text-halign': 'center',
          'text-outline-color': this.TOOL_COLOR(), // Outline color around the text
          'text-outline-width': 0.3, // Thickness of the text outline
          'color': this.TOOL_COLOR(0.9)
        },
        data: {
          'font-family': 'sans-serif',
          'font-weight':"lighter",
          'font-size':'10px',
          'shape': 'round-rectangle',
          'background-image': gen_svg_gradient(this.DATA_COLOR(0.7),this.DATA_COLOR()),
          'background-fit': 'cover',
          'background-image-opacity': 1,
          'border-color': null,
          'border-width': 0,
          'label': function (ele) {
                    return ele.data('view_value').label; // Access nested label
                    //return ele.data('label'); // Access nested label
                },
          'text-valign': 'top',
          'text-halign': 'center',
          'text-outline-color': this.DATA_COLOR(), // Outline color around the text
          'text-outline-width': 0.3, // Thickness of the text outline
          'color': this.DATA_COLOR(0.9)
        },
      },
      edge:{
        edge: {
          'line-fill': 'linear-gradient',
          // 'line-color': 'rgb(118,118,118)',
          //'line-gradient-stop-colors': 'rgba(79,79,79,1) rgba(169,169,169,1)',
          //'target-arrow-color': 'rgba(169,169,169,1)',
          'target-arrow-shape': 'triangle',
          'width': 2,
          'curve-style': 'bezier',
          'target-arrow-color': 'rgba(169,169,169,1)',
          'line-gradient-stop-colors': 'rgba(79,79,79,1) rgba(169,169,169,1)',
          'line-gradient-stop-positions': '30% 100%'
        }
      }
    };

    this.ONCLICK_STYLE = {
      node: {
        tool: {
          'background-color': '#90505E',
          'border-color': this.SELECT_COLOR(),
          'border-width': 2
        },
        data: {
          'background-color': '#247D7A',
          'border-color': this.SELECT_COLOR(),
          'border-width': 2
        },
      },
      edge:{
        edge: {
          'line-fill': 'linear-gradient',
          //'line-gradient-stop-colors': this.SELECT_COLOR()+" "+this.SELECT_COLOR(),
          'target-arrow-color': this.SELECT_COLOR(),
          // 'line-color': this.SELECT_COLOR(),
          'line-gradient-stop-colors': this.SELECT_COLOR(1)+' '+this.SELECT_COLOR(0.5),
          'width': 3
        }
      }
    };


    this.COMPATIBLE_STYLE = {
          true: {'opacity': '1', 'overlay-opacity': '0'},
          false:{'opacity': '0.15', 'overlay-opacity': '0'}
    };

    this.cy = cytoscape({
              container: document.getElementById('cy'),

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
                  style: this.STYLE.edge["edge"]
                },

                {
                  selector: '.eh-handle',
                  style: {
                    'background-color': this.SELECT_COLOR(0.85),
                    'width': 15,
                    'height': 15,
                    'shape': 'ellipse',
                    'overlay-opacity': 0,
                    'border-width': 0, // makes the handle easier to hit
                    'border-opacity': 0,
                    'opacity': 0.2
                  }
                },

                {
                  selector: '.eh-hover',
                  style: {
                    'background-color': this.SELECT_COLOR(0.85),
                  }
                },

                {
                  selector: '.eh-source',
                  style: {
                    'border-width': 1,
                    'border-color': this.SELECT_COLOR(),
                  }
                },

                {
                  selector: '.eh-target',
                  style: {
                    'border-width': 1,
                    'border-color': this.SELECT_COLOR(),
                  }
                },

                {
                  selector: '.eh-preview, .eh-ghost-edge',
                  style: {
                    'background-color': this.SELECT_COLOR(),
                    'line-color': this.SELECT_COLOR(),
                    'target-arrow-color': this.SELECT_COLOR(),
                    'source-arrow-color': this.SELECT_COLOR()
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
                nodes: workflow.nodes,
                edges: workflow.edges
              }
    });

    // Initialize Edgehandles plugin with the styles you want
    // Enable edge creation with the handle
    const eh = this.cy.edgehandles({});
    eh.enable();

    this.set_diagram_layout(workflow);
    this.cy_undo_redo = this.cy.undoRedo(
        {
              isDebug: true, // Debug mode for console messages
              actions: {},// actions to be added
              undoableDrag: false, // Whether dragging nodes are undoable can be a function as well
              stackSizeLimit: undefined, // Size limit of undo stack, note that the size of redo stack cannot exceed size of undo stack
              ready: function () { // callback when undo-redo is ready

              }
        }
    );
  }

  set_events(){
    var eh = this.cy.edgehandles();
    this.cy.on('ehshow', (event, sourceNode) => {
          if (sourceNode._private.selected == false) {
            eh.hide();
          }
    });
  }

  // Diagram
  get_diagram(){

      /**
      * Get the entire diagram object (i.e. this.DIAGRAM_MAIN)
      */
      if (Object.keys(this.DIAGRAM_MAIN).length === 0) {
          fetch('/runtime/add_unit?type=diagram')
                  .then(response => {return response.json();})
                  .then(data => {
                      console.log("Diagram data retrieved from DIPAM",data);
                      this.set_diagram_data(data)
                      return this.DIAGRAM_MAIN;
                  })
                  .catch(error => {});
      }else {
          return this.DIAGRAM_MAIN;
      }
  }
  get_diagram_cy(){
    return this.cy;
  }
  get_cy_elem_by_id(id){
    if (this.get_diagram().data.id == id) {
      return this.get_diagram();
    }else if (this.cy.nodes('node[id = "'+id+'"]').length > 0) {
      return this.cy.nodes('node[id = "'+id+'"]')[0];
    }else if (this.cy.edges('edge[id = "'+id+'"]').length > 0) {
      return this.cy.edges('edge[id = "'+id+'"]')[0];
    }
    return null;
  }
  get_undo_redo() {
    return this.cy_undo_redo;
  }
  remove_elem(elem_id,  f_callback = null){
    /**
    * Remove an element using its id:<elem_id> from the diagram;
    * Removing elements such as: data("d-NN"), tool("t-NN"), or edges("e-NN");
    * Note: must be triggered always for removing
    * @param {elem_id} - id of the node to remove
    * @returns: the removed element
    */
    var api_call = "";

    if ((elem_id.startsWith("d-")) || (elem_id.startsWith("t-"))){
      api_call = "/runtime/delete_unit?value="+elem_id;
    }
    else if (elem_id.startsWith("e-")) {
      var edge_obj = this.cy.$("#"+elem_id);
      var source_id = edge_obj.data("source");
      var target_id = edge_obj.data("target");
      api_call = "/runtime/delete_link?source="+source_id+"&target="+target_id;
    }
    console.log("Removing ",elem_id," calling:",api_call);
    fetch(api_call)
      .then(response => response.json())
      .then(data => {
          console.log(data);
          this.cy.remove("#"+elem_id);
          if (f_callback != null) { f_callback(data); }
          return data;
        })
        .catch(error => {
          if (f_callback != null) {
            return f_callback( {"data":null, "log_type":"error", "log_msg":""} );
          }
        });

    // TODO: check this from dipam v1.0
    //this.cy_undo_redo.do("remove", this.cy.$("#"+elem_id));
    //this.save_workflow();
  }
  set_diagram_data(data) {
    this.DIAGRAM_MAIN["data"] = data;
  }
  save_workflow( store_checkpoint = false, f_callback = null ){
    fetch("/save/workflow?time="+(new Date().getTime()).toString(), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          workflow_data: _get_workflow_data(),
          store_checkpoint: store_checkpoint
        })
    })
    .then(response => response.json())
    .then(data => {
      if (f_callback != null) {
        f_callback(data);
      }
      return data;
    })
    .catch(error => { return {"data":null, "log_type":"error", "log_msg":""} });


    function _get_workflow_data(){

      var workflow_to_save = {
        'diagram': diagram_instance.DIAGRAM_MAIN,
        'nodes': [],
        'edges': [],
      };
      // build the nodes
      var diagram_nodes = diagram_instance.get_nodes();
      for (var i = 0; i < diagram_nodes.length; i++) {
        workflow_to_save.nodes.push( _normalize_data_to_save(diagram_nodes[i], true) );
      }
      // build the edges
      var diagram_edges = diagram_instance.get_edges();
      for (var i = 0; i < diagram_edges.length; i++) {
        workflow_to_save.edges.push( _normalize_data_to_save(diagram_edges[i]) );
      }

      return workflow_to_save;

      function _normalize_data_to_save(an_elem, is_node = false) {
        var res_obj = an_elem._private.data;

        //gen the graph data of elem
        if (is_node) {
          if (!('graph' in res_obj)) {
            res_obj["graph"] = {};
          }
          res_obj.graph["position"] = an_elem._private.position;
        }
        return {"data":res_obj};
      }

    }
  }
  cy_topological_sort() {

      const orderedList = [];
      const inDegree = new Map(); // Map to track in-degree of each node
      const sources = []; // Queue to store nodes with no incoming edges

      // Initialize in-degree map
      this.cy.nodes().forEach(node => {
          inDegree.set(node.id(), node.incomers('edge').length);
          if (node.incomers('edge').length === 0) {
              sources.push(node); // Node with no incoming edges
          }
      });

      while (sources.length > 0) {
          const source = sources.shift(); // Take a node with no incoming edges
          orderedList.push(source._private.data);

          // Reduce the in-degree of all neighbors
          source.outgoers('node').forEach(targetNode => {
              const targetId = targetNode.id();
              inDegree.set(targetId, inDegree.get(targetId) - 1);

              if (inDegree.get(targetId) === 0) {
                  sources.push(targetNode); // Add to sources if in-degree becomes 0
              }
          });
      }
      // Check if there are nodes left with non-zero in-degree (indicating a cycle)
      if (orderedList.length !== this.cy.nodes().length) {
          console.error("Graph contains a cycle, topological sorting not possible.");
          return null;
      }
      return orderedList; // Return the ordered list of nodes
  }

  set_diagram_layout(workflow) {
    var list_nodes = workflow.nodes;

    for (var i = 0; i < list_nodes.length; i++) {
      if ("graph" in list_nodes[i].data) {
        if ("position" in list_nodes[i].data.graph) {
          var a_node = this.cy.nodes('node[id = "'+list_nodes[i].data.id+'"]');
          var a_pos = JSON.parse(JSON.stringify(list_nodes[i].data.graph.position));
          a_node.position("x",a_pos.x);
          a_node.position("y",a_pos.y);
        }
      }
    }
    this.highlight_diagram();
  }
  init_elem_style(elem=null,type){
    //this.highlight_diagram();
    if ((elem != null))  {
      elem = elem.data;
      if (type == 'node') {
        this.cy.nodes('node[id="'+elem.id+'"]').style(this.STYLE.node[elem.type]);
      }else if (type == 'edge') {
        this.cy.edges('edge[id="'+elem.id+'"]').style(this.STYLE.edge[elem.type]);
      }
    }
  }
  click_elem_style(elem=null,type=null){
    //adapt the style of the clicked element:<elem> of type:<type>
    //first color all nodes
    this.highlight_diagram();

    if ((elem != null) && (type != null))  {
      elem = elem._private.data;
      if (type == 'node') {
        this.cy.nodes('node[id="'+elem.id+'"]').style(this.ONCLICK_STYLE.node[elem.type]);
      }else if (type == 'edge') {
        this.cy.edges('edge[id="'+elem.id+'"]').style(this.ONCLICK_STYLE.edge[elem.type]);
      }
    }
  }
  highlight_diagram(){
    this.get_nodes('tool').style(this.STYLE.node.tool);
    this.get_nodes('data').style(this.STYLE.node.data);
    this.get_edges().style(this.STYLE.edge.edge);
    this.activate_nodes(null,true);
    this.activate_edges(null,true);
  }
  zoom_in(){
    this.cy.zoom(this.cy.zoom() + 0.1);
  }
  zoom_out(){
    this.cy.zoom(this.cy.zoom() - 0.1);
  }
  fit_diagram(){
    this.cy.fit();
  }

  // Nodes
  get_nodes(type = null){
    if (type != null) {
      return this.cy.nodes('node[type = "'+type+'"]');
    }
    return this.cy.nodes('node[type = "data"]').union(this.cy.nodes('node[type = "tool"]'));
  }
  get_node_view_value(n_id){
    var node = this.get_cy_elem_by_id(n_id);
    return node._private.data.view_value;
  }
  set_node_view_value(n_type, n_id, n_data){
    if (n_type == "diagram") {
      this.set_diagram_data(n_data);
    }
    var nodes = this.cy.nodes('node[id = "'+n_id+'"]');
    if (nodes.length == 1) {
      for (const _k in n_data) {
        nodes[0]._private.data.view_value[_k] = n_data[_k];
      }
    }
    return nodes[0]._private.data.view_value;
  }
  add_node(n_type, n_data) {
    /**
    * Add a node (data or tool) to the diagram
    * @param {string} n_type – the type of the node to be added, it's either "data" or "tool"
    * @param {json} n_data – the data of the node to be added (retrieved from the backend)
    */

    // (1) create the node data – style, position, and view data
    var node_n = _gen_node_data(n_type, n_data);
    // (2) add node to cy diagram
    this.cy.add(node_n);
    this.init_elem_style( node_n,"node" );
    // (3) set undo/redo
    this.cy_undo_redo.do("add", this.cy.$("#"+node_n.data.id));

    function _gen_node_data(n_type, n_data, a_value = null) {
      var node_obj = {
        group: "nodes",
        style: diagram_instance.STYLE.node[n_type],
        position: { x: 0, y: 0},
        data: n_data
      };

      // update the position of the node in the digram view
      var info_box = diagram_instance.cy.extent();
      node_obj.position.x = info_box.x1 + Math.abs(info_box.x1/3);
      node_obj.position.y = info_box.y1 + Math.abs(info_box.y1/2);
      for (var i = 0; i < diagram_instance.cy.nodes().length; i++) {
        var a_node_added = diagram_instance.cy.nodes()[i];
        if((a_node_added.position('x') == node_obj.position.x) && (a_node_added.position('y') == node_obj.position.y)){
          node_obj.position.y = node_obj.position.y + a_node_added.height();
          i = 0;
        }
      }
      return node_obj;
    }
  }
  apply_node_compatibility(node){
    /**
     * Takes a seed node and a json representing all the nodes of the diagram;
     * each node is accomanied by a true/false value representing its compatibility with the root node.
     *
     * @param {node_seed} - id of the root node
     * @param {nodes_compatibility} - a json with all compatible nodes
     */
    var node_data = node._private.data;
    var node_seed = node_data.id;
    var node_type = node_data.type;
    fetch("/runtime/check_compatibility?value="+node_seed)
          .then(response => { return response.json(); })
          .then(data => {
            var nodes_compatibility = data;

            // (1) deactivate all all nodes of the diagram
            this.activate_nodes(null,false);
            this.activate_edges(null,false);
            // (2) activate only the root node
            this.activate_nodes("node[id='"+node_seed+"']", true);
            this.activate_edges(node_seed,true);
            // (3) activate compatible nodes
            for (var _a_node in nodes_compatibility) {
              if (nodes_compatibility[_a_node] == true) {
                this.activate_nodes("node[id='"+_a_node+"']", true);
              }else {
                /* in case not compatible check if it is connected with {node_seed};
                in this case its edges must be removed as well;
                Check both directions (source or target with node_seed), and remove edges; */

                //var edges = this.cy.edges(`[source = "${node_seed}"][target = "${_a_node}"], [source = "${_a_node}"][target = "${node_seed}"]`);
                //if (edges.length > 0) {
                //    this.cy.remove(edges);
                //}
                ; //pass
              }
            }
          });
  }
  activate_nodes(selector= null, active = true){
    //activate/deactivate the diagram nodes. a subset could be defined through <selector>
    //returns the activated/deactivated nodes
    var target_element = this.cy.nodes();
    if (selector != null) {
      target_element = this.cy.nodes(selector);
    }
    for (var i = 0; i < target_element.length; i++) {
      target_element[i].style(this.COMPATIBLE_STYLE[active]);
      target_element[i]._private.active = active;
    }
    return target_element;
  }
  activate_edges(source_id= null, active = true){

    var target_element = this.cy.edges();
    if (source_id != null) {
      target_element = this.cy.edges('edge[source="'+source_id+'"]');
    }
    for (var i = 0; i < target_element.length; i++) {
      target_element[i].style(this.COMPATIBLE_STYLE[active]);
      target_element[i]._private.active = active;
    }
    return target_element;
  }
  // update_node_style(n_id,data){
  //   if ("label" in data) {
  //     var node = this.get_cy_elem_by_id(n_id);
  //     node._private.data.label = data["label"];
  //   }
  //   return true;
  // }

  // Edges
  get_edges(){
    return this.cy.edges();
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
  remove_edge(id){
    /**
    * Things to do after an edge is created;
    * an API call is done to create the link between the two units;
    * if the two units are compatible and the graph is not a cycle then the Edge persists
    */
    this.cy.remove('#'+id);
    var edge = this.get_cy_elem_by_id(id);
    var source_node = edge._private.data.source;
    var target_node = edge._private.data.target;
    var target_node_input = target_node._private.data.view_value.input;
    if (source_node in target_node_input) {
        delete target_node_input[source_node];
    }
    return true;
  }
  after_add_edge(edge_data){
    /**
    * This method is automatically called after adding an edge into the diagram.
    */
    var source_node = this.cy.nodes("node[id='"+edge_data.source+"']")[0];
    var target_node = this.cy.nodes("node[id='"+edge_data.target+"']")[0];

    if (!(target_node._private.active)) {
      console.log("Can't connect to non-active nodes");
      this.remove_edge(edge_data.id);
    }

    // API call to check compatibility
    fetch("/runtime/check_compatibility?value="+edge_data.source+"&value_to_check="+edge_data.target)
          .then(response => { return response.json(); })
          .then(data => {
            var node_compatibility = data[edge_data.target];
            if (node_compatibility) {
              //check if the diagram is still a DAG
              var is_cycle = _check_cycle(this.get_target_nodes(source_node), source_node);
              if (is_cycle) {
                diagram_instance.remove_edge(edge_data.id);
                console.log("New edge creates a cycle!");
              }else {
                // API to create the link between the two units
                fetch("/runtime/add_link?source="+edge_data.source+"&target="+edge_data.target)
                  .then(response => response.json())
                  .then(data => {
                    console.log("Edge added between:",source_node._private.data.id," and ",target_node._private.data.id);
                    // target_node._private.data["input"][ source_node._private.data["class"] ] = edge_data.source;
                    interface_instance.diagram_onclick_handler();
                  })
                  .catch(error => {
                    diagram_instance.remove_edge(edge_data.id);
                    return {"data":null, "log_type":"error", "log_msg":""} });
              }
            }else {
              diagram_instance.remove_edge(edge_data.id);
            }
          });

    //is cycle starting from node N
    function _check_cycle(arr_nodes, origin){

        //check if one of the nodes is origin
        for (var i = 0; i < arr_nodes.length; i++) {
          var node = arr_nodes[i];
          if (__is_same_node(node, origin)) {
            return true;
          }
        }

        var res = false;
        for (var i = 0; i < arr_nodes.length; i++) {
          var node = arr_nodes[i];
          var out_nodes = diagram_instance.get_target_nodes(node);
          if (out_nodes.length != 0) {
              res = res || is_cycle(out_nodes , origin);
          }
        }

        return res;

        function __is_same_node(n_a, n_b){
          return (n_a._private.data.id == n_b._private.data.id);
        }
      }
  }

  gen_edge_data(source_id,target_id){
    const EDGE_DATA = {id: "", name: "", type: "", view_value:"", source: "", target:""};
    var edge_obj = { data: JSON.parse(JSON.stringify(EDGE_DATA)) , group: 'edges'};
    edge_obj.data.id = "e-"+source_id+"_"+target_id;
    edge_obj.data.type = 'edge';
    edge_obj.data.name = edge_obj.data.id;
    edge_obj.data.source = source_id;
    edge_obj.data.target = target_id;
    //console.log("new edge data:",edge_obj);
    return JSON.parse(JSON.stringify(edge_obj));
  }

}
