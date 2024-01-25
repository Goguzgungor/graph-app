import React, { useEffect, useState } from 'react';
import cytoscape from 'cytoscape';

import './App.css';

const Graph = () => {
  const [cy, setCy] = useState(null);
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    const radius = 800;

    const nodeList = [];
    const edgeList = [];

    for (let i = 0; i <= 100; i++) {
      const angle = (2 * Math.PI * i) / 100;
      nodeList.push({
        group: 'nodes',
        data: {
          id: 'n' + i,
          heuristic: Math.floor(Math.random() * 10) + 1, // Add a heuristic value
        },
        position: {
          x: window.innerWidth / 2 + radius * Math.cos(angle),
          y: window.innerHeight / 2 + radius * Math.sin(angle),
        },
      });

      const connectionNumber = Math.floor(Math.random() * 10) + 1;
      for (let j = 0; j < connectionNumber; j++) {
        const target = Math.floor(Math.random() * 100);
        const weight = Math.floor(Math.random() * 10) + 1;
        if (target !== i) {
          edgeList.push({
            group: 'edges',
            data: {
              id: 'n' + i + 'n' + target,
              source: 'n' + i,
              target: 'n' + target,
              weight: weight,
            },
          });
        }
      }
    }

    const newCy = cytoscape({
      container: document.getElementById('cy'),
      boxSelectionEnabled: false,
      autounselectify: true,
      style: cytoscape.stylesheet()
          .selector('node')
          .style({
            'content': 'data(id)',
          })
          .selector('edge')
          .style({
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'width': 4,
            'line-color': '#ddd',
            'target-arrow-color': '#ddd',
            'label': 'data(weight)',
          })
          .selector('.highlighted')
          .style({
            'background-color': '#61bffc',
            'line-color': '#61bffc',
            'target-arrow-color': '#61bffc',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.5s',
          })
          .selector('.finalNode')
          .style({
            'background-color': 'red',
            'color': 'white',
          }),

      elements: {
        nodes: nodeList,
        edges: edgeList,
      },

      layout: {
        name: 'breadthfirst',
        directed: true,
        roots: '#n100',
        padding: 10,
      },
    });

    setCy(newCy);

    // Cleanup function to remove the graph when the component unmounts
    return () => {
      newCy.destroy();
    };
  }, []);

  const ANIMATION_SPEED = 0;

  const resetGraph = () => {
    if (cy) {
      cy.elements().removeClass('highlighted finalNode');
      cy.edges().style('line-color', '#ddd');
      cy.edges().style('target-arrow-color', '#ddd');
      cy.edges().style('label', '');
      setIteration(0);
    }
  };

  const startAlgorithm = (algorithm) => {
    resetGraph();

    if (cy) {
      let iterator;
      let startNode;
      switch (algorithm) {
        case 'bfs':
          iterator = cy.elements().bfs({root: '#n100', directed: true});
          break;
        case 'dfs':
          iterator = cy.elements().dfs({root: '#n100', directed: true});
          break;
        case 'dijkstra':
           startNode = cy.$('#n100');
          const dijkstraResult = cy.elements().dijkstra(startNode);
          iterator = {
            pathTo: (node) => dijkstraResult.pathTo(node).select(),
          };
          break;
        case 'astar':
          iterator = cy.elements().aStar({
            root: '#n100',
            goal: '#n0',
            heuristic: (node) => node.data('heuristic'),
          });
          break;
        case 'floydWarshall':
          const floydWarshallResult = cy.elements().floydWarshall();
          iterator = {
            pathTo: (fromNode, toNode) => floydWarshallResult.path(fromNode, toNode).select(),
          };
          break;
        case 'bellmanFord':
          const bellmanFordResult = cy.elements().bellmanFord({ root: "#n100",directed: true });
          iterator = {
            pathTo: (node) => bellmanFordResult.pathTo(node).select(),
          };
          break;
        case 'hierholzer':
          iterator = cy.elements().hierholzer({ root: "#n100" });
          break;
          default:
          return;
      }

      let i = 0;
      const highlightNextEle = function () {
        if (algorithm === 'dijkstra' || algorithm === 'floydWarshall' || algorithm === 'bellmanFord' || algorithm === 'hierholzer') {
          let path;
          if (algorithm === 'floydWarshall') {
            path = iterator.pathTo(cy.$('#n100'), cy.$('#n0'));
          } else if (algorithm === 'dijkstra' || algorithm === 'bellmanFord') {
            path = iterator.pathTo(cy.$('#n0'));
          }
          else if (algorithm === 'hierholzer') {
            let isFound = iterator.found;
            setIteration('its not a eulerian graph')
            if (isFound) {
              path = iterator.trail.select();
            }
          }
          if (path && i < path.length) {
            const currentElement = path[i];
            setIteration(i);
            currentElement.addClass('highlighted');

            if (currentElement.id() === 'n0') {
              currentElement.style('background-color', 'red');
              currentElement.style('color', 'red');
              cy.edges(`[target='${currentElement.id()}']`).style('line-color', 'red');
              cy.edges(`[target='${currentElement.id()}']`).style('target-arrow-color', 'red');
              return;
            }

            i++;

            if (i < path.length) {
              setTimeout(highlightNextEle, ANIMATION_SPEED);
            }
          }
        } else {
          if (iterator && i < iterator.path.length) {
            const currentElement = iterator.path[i];
            setIteration(i);
            currentElement.addClass('highlighted');

            if (currentElement.id() === 'n0') {
              currentElement.style('background-color', 'red');
              currentElement.style('color', 'red');
              cy.edges(`[target='${currentElement.id()}']`).style('line-color', 'red');
              cy.edges(`[target='${currentElement.id()}']`).style('target-arrow-color', 'red');
              return;
            }

            i++;

            if (i < iterator.path.length) {
              setTimeout(highlightNextEle, ANIMATION_SPEED);
            }
          }
        }
      };

      // Kick off first highlight when the button is clicked
      highlightNextEle();
    }
  };

  return (
      <div>
        <div id="cyContainer" style={{ position: 'relative', width: '80%', height: '80vh', margin: '0 auto' }}>
          <div id="cy" style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button style={{ margin: '10px' }} onClick={() => startAlgorithm('bfs')}>
            Start BFS
          </button>
          <button style={{ margin: '10px' }} onClick={() => startAlgorithm('dfs')}>
            Start DFS
          </button>
          <button style={{ margin: '10px' }} onClick={() => startAlgorithm('dijkstra')}>
            Start Dijkstra
          </button>
          <button style={{ margin: '10px' }} onClick={() => startAlgorithm('astar')}>
            Start A*
          </button>
          <button style={{ margin: '10px' }} onClick={() => startAlgorithm('floydWarshall')}>
            Start Floyd-Warshall
          </button>
          <button style={{ margin: '10px' }} onClick={() => startAlgorithm('bellmanFord')}>
            Start Bellman-Ford
          </button>
          <button style={{ margin: '10px' }} onClick={() => startAlgorithm('hierholzer')}>
            Start Hierholzer
          </button>

          <button style={{ margin: '10px' }} onClick={resetGraph}>
            Reset Graph
          </button>
          <h4>Iteration: {iteration}</h4>
        </div>
      </div>
  );
};

export default Graph;
