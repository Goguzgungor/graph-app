import React, { useEffect } from 'react';
import cytoscape from 'cytoscape';
import './App.css';

const Graph = () => {
  useEffect(() => {
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: {
        nodes: [
          { data: { id: 'a' } },
          { data: { id: 'b' } },
        ],
        edges: [
          { data: { id: 'ab', weight: 1, source: 'a', target: 'b' } },
        ]
      },
    });

    cy.add([
      { group: 'nodes', data: { id: 'n0' }, position: { x: 300, y: 200 } },
      { group: 'nodes', data: { id: 'n1' }, position: { x: 300, y: 300 } },
      { group: 'edges', data: { id: 'e0', source: 'n0', target: 'n1' } },
      { group: 'edges', data: { id: 'n1b', source: 'n1', target: 'b' } },
    ]);

    // Cleanup function to remove the graph when the component unmounts
    return () => {
      cy.destroy();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
      <div id="cyContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div id="cy" style={{ width: '1200px', height: '800px' }}></div>
      </div>
  );
};

export default Graph;
