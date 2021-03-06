import React from 'react';
import * as THREE from 'three';

class Viewer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const width = 300;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    this.element.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.cube = cube;
    this.animate();
  }

  animate = () => {
    this.renderer.render(this.scene, this.camera);
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    requestAnimationFrame(this.animate);
  }

  render() {
    return (
      <div ref={el => this.element = el} />
    );
  }
}

export default Viewer;
