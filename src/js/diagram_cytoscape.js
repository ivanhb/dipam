var vw_interface = null;

document.addEventListener('DOMContentLoaded', function(){

        vw_interface = new vwbata(config);

        vw_interface.init_nav();

        var cy = window.cy = cytoscape({
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
            nodes: [
              { data: { id: 'd-0001', name: 'Textual data (d1)', type: 'data', value: 'd0' } },
              { data: { id: 't-0001', name: 'Filter names (t1)', type: 'tool', value: 't-filter-names' } },
              { data: { id: 't-0002', name: 'Topic modeling (t2)', type: 'tool', value: 't-topic-lda' } },
              { data: { id: 't-0003', name: 'View bar chart (t3)', type: 'tool', value: 't-chart-bar' } }
            ],
            edges: [
              { data: { source: 'd-0001', target: 't-0001' } },
              { data: { source: 'd-0001', target: 't-0003' } },
              { data: { source: 't-0002', target: 't-0003' } }
            ]
          }
        });

        cy.nodes().on('click', function(e){
          var node = this._private.data;
          console.log(node);
          vw_interface.click_on_node(node);
        });

        var eh = cy.edgehandles();

        document.querySelector('#draw-on').addEventListener('click', function() {
          eh.enableDrawMode();
          cy.fit();
        });

        document.querySelector('#draw-off').addEventListener('click', function() {
          eh.disableDrawMode();
        });

        document.querySelector('#start').addEventListener('click', function() {
          eh.start( cy.$('node:selected') );
        });

});
