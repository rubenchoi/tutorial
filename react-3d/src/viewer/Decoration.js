import React, { Fragment } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import * as THREE from 'three';
import Draggable from 'react-draggable';

const hdriInfo = [
    { title: 'Night', filepath: 'hdri/dikhololo_night.jpg' },
]

class Decoration extends React.Component {
    constructor(props) {
        super(props);
        this.scene = props.scene;
        this.renderer = props.renderer;

        this.state = {
            selectHdri: false,
            showExample: true,
        }
    }

    componentDidMount() {
        this.setLight();
        this.props.title && this.setTitle(this.props.title);
        this.setGround();
        this.setExample();
        this.setBackgroundHdri();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.selectHdri !== nextState.selectHdri
            || this.state.showExample !== nextState.showExample) {
            return true;
        }
        return false;
    }

    setBackgroundMono = () => {
        this.scene.background = new THREE.Color(0x050055);
        this.scene.fog = new THREE.Fog(this.scene.background, 500, 10000);
    }

    setBackgroundHdri = (filepath = hdriInfo[0].filepath) => {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(
            filepath,
            () => {
                const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
                rt.fromEquirectangularTexture(this.renderer, texture);
                this.scene.background = rt.texture;
            }
        );
    }

    setTitle = (title = '') => {
        let loader = new THREE.FontLoader();
        loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            var textGeometry = new THREE.TextGeometry(title, {
                font: font,
                size: 1,
                height: 0.5,
                curveSegments: 10,
                bevelThickness: 0.1,
                bevelSize: 0.1,
                bevelEnabled: true
            });

            let textMaterial = new THREE.MeshPhongMaterial({ color: 0x909399, specular: 0xffffff });
            this.scene.remove(this.textMesh);
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
            this.textMesh.position.set(title.length / 2 - 1, -5, 6);
            this.scene.add(this.textMesh);
        });
    }

    setLight = () => {
        let ambLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambLight);
    }

    setGround = () => {
        let floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20, 1, 1), new THREE.MeshPhongMaterial({ color: 0xffffff, opacity: 0.1, transparent: true }));
        floor.rotation.x = -0.5 * Math.PI;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    getSelectHdri = () => {
        let rows = [];
        hdriInfo.forEach((item, i) => {
            rows.push(<DropdownItem onClick={() => this.setBackgroundHdri(item.filepath)} key={i}>{item.title}</DropdownItem>);
        })
        return rows;
    }

    setVideo = (video) => {
        const texturebg = new THREE.VideoTexture(video);
        texturebg.minFilter = THREE.LinearFilter;
        texturebg.maxFilter = THREE.LinearFilter;
        texturebg.format = THREE.RGBFormat;
        this.scene.background = texturebg;
    }

    setExample = (show = true) => {
        let sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), new THREE.MeshBasicMaterial({ color: 0x02ce2e }));
        sphere.position.set(0, -3, -10);
        let exampleGroup = new THREE.Group();
        exampleGroup.add(sphere);
        exampleGroup.name = "example";
        exampleGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xfff000 })));

        if (show) {
            this.scene.add(exampleGroup);
        } else {
            this.scene.traverse((child) => {
                if (child.name === 'example') {
                    this.scene.remove(child);
                }
            })
        }
    }

    toggleExample = () => {
        let newVal = !this.state.showExample;
        this.setState({ showExample: newVal });
        try {
            this.setExample(newVal);
        } catch (err) { }
    }

    render() {
        return (<>
            {this.props.showDetail &&
                <Draggable>
                    <div style={{ position: 'relative', width: '200px', padding: '1em', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                        <Dropdown isOpen={this.state.selectHdri} toggle={() => this.setState({ selectHdri: !this.state.selectHdri })}>
                            <DropdownToggle color="primary" style={{ fontSize: '0.8em' }} caret>
                                Select HDRI
                            </DropdownToggle>
                            <DropdownMenu style={{ fontSize: '0.8em' }}>
                                {this.getSelectHdri()}
                            </DropdownMenu>
                        </Dropdown>
                        <hr />
                        <Button color={this.state.showExample ? 'secondary' : 'success'} style={{ fontSize: '0.8em' }}
                            onClick={this.toggleExample}>{this.state.showExample ? 'Hide examples' : 'Show examples'}</Button>
                    </div>
                </Draggable>
            }
        </>);
    }
}

export default Decoration;