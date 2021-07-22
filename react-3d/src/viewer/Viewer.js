import React, { Fragment } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Character from '../character/Character.js';
import Decoration from './Decoration.js';

class Viewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scene: undefined,
            delta: 0,
        }
        this.clock = new THREE.Clock();
    }

    componentDidMount() {
        const canvas = this.props.canvas;

        const width = canvas ? canvas.clientWidth : window.innerWidth - 1;
        const height = canvas ? canvas.clientHeight : window.innerHeight - 1;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
        this.camera.position.set(0, 2, 30);
        this.scene.position.set(0, -3, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true, canvas: canvas });
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);

        let orbit = new OrbitControls(this.camera, this.renderer.domElement);
        orbit.enableZoom = true;
        orbit.enabled = true;

        if (!canvas) {
            this.drawingElement.appendChild(this.renderer.domElement);
        }

        this.setState({ scene: this.scene });
        this.animate();

        this.props.onInit && this.props.onInit(this.renderer.domElement);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.delta === nextState.delta;
    }

    animate = () => {
        this.setState({ delta: this.clock.getDelta() });

        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }

    resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    //Recommended style of parent element: {{ width: '100vw', height: '100vh', overflow: "hidden" }}>
    render() {
        return (
            <div style={{ position: 'relative' }}>
                {!this.props.canvas && <div ref={el => this.drawingElement = el} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }} />}

                {!this.props.domForDatGui && <div ref={el => this.domForDatGui = el} style={{ position: 'absolute', right: '30%', zIndex: 6 }} />}

                {this.state.scene &&
                    <>
                        <Character
                            scene={this.state.scene}
                            delta={this.state.delta}
                            showDetail={this.props.showDetail}
                            specs={this.props.specs}
                        />
                        <Decoration
                            scene={this.state.scene}
                            renderer={this.renderer}
                            showDetail={this.props.showDetail}
                        />
                    </>
                }
            </div>
        )
    }
}

export default Viewer;