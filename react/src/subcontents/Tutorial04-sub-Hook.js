import React from 'react';
import * as THREE from 'three';

function Viewer() {
  const refDiv = React.useRef(null);

  React.useEffect(() => {
    const width = 300;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    refDiv.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    const animate = () => {
      renderer.render(scene, camera);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <div ref={refDiv} />
  );
}

export default Viewer;
