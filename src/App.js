import React, { useEffect } from 'react';
import cytoscape from 'cytoscape';
import './App.css';

const Graph = () => {
  useEffect(() => {
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: {
        nodes: [
        ],
        edges: [
        ]
      },
    });

    let nodeList = [];
    let edgeList = [];
    const radius = 800; // Increase the radius for more space between nodes

    for (let i = 0; i <= 100; i++) {
      const angle = (2 * Math.PI * i) / 100;
      nodeList.push({
        group: 'nodes',
        data: { id: 'n' + i },
        position: {
          x: window.innerWidth / 2 + radius * Math.cos(angle),
          y: window.innerHeight / 2 + radius * Math.sin(angle),
        },
      });
      const connectionNumber = Math.floor(Math.random() * 10) + 1;
      for (let j = 0; j < connectionNumber; j++) {
        const target = Math.floor(Math.random() * 100);
        if (target !== i) {
          edgeList.push({
            group: 'edges',
            data: {
              id: 'n' + i + 'n' + target,
              source: 'n' + i,
              target: 'n' + target,
            },
          });
        }
      }

    }
    cy.add(nodeList);
    cy.add(edgeList);

    // Cleanup function to remove the graph when the component unmounts
    return () => {
      cy.destroy();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
      <div id="cyContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0 }}>
        <div id="cy" style={{ width: '100%', height: '100vh', margin: 0 }}></div>
      </div>
  );
};

export default Graph;
