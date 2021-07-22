import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import DatGuiHandler from './DatGuiHandler.js';
import Spec from './spec/index.js';
import Animations from './Animations.js';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import Draggable from 'react-draggable';

class Character extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spec: props.specs ? props.specs.default : Spec.MetaWoman,
            datGuiItems: undefined,
            selectCharacter: false,
            enableAnimation: false
        }

        this.target = { joints: {}, morphTargets: {} };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        const character = await this.loadCharacter();
        this.props.scene.add(character);

        if (this.state.enableAnimation) {   //TODO - update in progress
            this.animations = await this.loadAnimation();
            this.animationMixer = new THREE.AnimationMixer(character);
            try {
                this.action = this.animationMixer.clipAction(this.animations.getByName('Happy Idle'));
                this.action.clampWhenFinished = true;
                this.action.play();
            } catch (err) {
                console.log("Error on Animation", err);
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.delta !== this.props.delta && this.animationMixer) {
            this.animationMixer.update(this.props.delta);
        } else if (prevState.datGuiItems !== this.state.datGuiItems) {
            const element = <DatGuiHandler
                datGuiItems={this.state.datGuiItems}
                name={this.state.name}
                onChangeAnimation={this.changeAnimation}
            />;
            ReactDOM.render(element, this.datGuiElement);
        }
    }

    loadCharacter = () => {
        let fullpath = this.state.spec.filepath;
        console.log("Character loading...", fullpath);

        let manager = new THREE.LoadingManager();
        manager.addHandler(/\.tga$/i, new TGALoader());
        manager.addHandler(/\.dds$/i, new DDSLoader());

        let loader = undefined;
        if (fullpath.includes('fbx') || fullpath.includes('FBX')) {
            loader = new FBXLoader(manager);
        } else if (fullpath.includes('glb') || fullpath.includes('GLB')) {
            loader = new GLTFLoader();
        }

        if (loader !== undefined) {
            return new Promise((resolve, reject) =>
                loader.load(fullpath, (obj) => {
                    let character = obj.scene ? obj.scene : obj;
                    this.controller = [];
                    character.traverse(this.parseRig);
                    this.postprocess(character);
                    console.log("-------------3D character loaded: ", character);
                    this.setState({ datGuiItems: this.controller });
                    character.name = 'character';
                    resolve(character);
                })
            );
        } else {
            //Test purpose - when given file is .MTL/.OBJ
            return new Promise((resolve, reject) => {
                new MTLLoader(manager)
                    .setPath(Spec.basedir)
                    .load('woman.mtl', (materials) => {
                        materials.preload();
                        new OBJLoader(manager)
                            .setMaterials(materials)
                            .setPath(Spec.basedir)
                            .load('woman.obj', (obj) => {
                                let character = obj.scene ? obj.scene : obj;
                                this.controller = [];
                                character.traverse(this.parseRig);
                                this.postprocess(character);
                                console.log("-------------3D character loaded: ", character);
                                this.setState({ datGuiItems: this.controller });
                                character.name = 'character';
                                resolve(character);

                            }, undefined, (err) => reject(err));

                    })
            });
        }
    }

    parseRig = (obj) => {
        try {
            obj.frustumCulled = false;

            if (!this.preprocessRig(obj)) {
                return;
            }

            switch (obj.type) {
                case "Mesh":
                case "SkinnedMesh":
                    if (this.target.morphTargets[obj.name] !== undefined) {
                        return;
                    }
                    if (obj.morphTargetDictionary) {
                        this.controller.push({ bone: obj, isMorphTarget: true });
                        this.target.morphTargets[obj.name] = obj;
                    } else {
                        this.controller.push({ bone: obj, isMorphTarget: false });
                    }
                    break;
                case "Bone":
                    if (this.target.joints[obj.name] !== undefined) {
                        return;
                    }
                    this.target.joints[obj.name] = obj;

                    this.controller.push({ bone: obj, isMorphTarget: false });
                    break;
                default:
                    //console.log("skipped " + obj.type + " name:" + obj.name);
                    return;
            }
        } catch (e) { }
    }

    preprocessRig = (obj) => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }

        if (obj.type.indexOf('ight') > 0) {
            obj.intensity = 0
        }

        if (this.state.spec.rigIncludes !== undefined && !obj.name.includes(this.spec.rigIncludes)) {
            return false;
        }

        if (this.state.spec.rigExcludes !== undefined && obj.name.includes(this.spec.rigExcludes)) {
            return false;
        }
        return true;
    }

    postprocess = (character) => {
        if (this.state.spec.positionOffset) {
            character.position.x += this.spec.positionOffset.x;
            character.position.y += this.spec.positionOffset.y;
            character.position.z += this.spec.positionOffset.z;
        }

        if (this.state.spec.rotationOffset) {
            character.rotation.x += this.spec.rotationOffset.x;
            character.rotation.y += this.spec.rotationOffset.y;
            character.rotation.z += this.spec.rotationOffset.z;
        }

        const scale = this.state.spec.scale;
        character.scale.set(scale, scale, scale);

        try {
            //for Mixamo, alphaMap is null so that it looks transparent
            character.children[1].material.alphaMap = null;
        } catch (err) { }
    }

    loadAnimation = () => {
        return new Promise((resolve, reject) => {
            const anim = new Animations(this.state.spec.animations);
            anim.load().then(() => {
                console.log("Animations loaded");
                resolve(anim);
            }).catch((err) => console.log('loadAnimation ERROR:', err));
        });
    }

    changeAnimation = (type) => {
        console.log("changeAnimation", type);
        try {
            if (type === 'stop') {
                this.action.stop();
                return;
            }

            if (this.action !== undefined) {
                this.action.fadeOut(0.5);
            }

            //TODO
            let clip = this.animations.getByName('Happy Idle');

            this.action = this.animationMixer.clipAction(clip);
            this.action.clampWhenFinished = true;
            this.action.reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(0.5)
                .play();
        } catch (err) {
            console.log('ERROR : change animation', err);
        }
    }

    move = (keyStr, value) => {
        try {
            let key = keyStr.split(':')[0]
            let type = keyStr.split(':')[1]
            let xyz = keyStr.split(':')[2]
            switch (type) {
                case 'r':
                case 'p':
                    this.moveJoint(key, xyz, type == 'r', value);
                    break;
                case 'm':
                    this.moveMorph(key, xyz, value)
                    break;
                default:
                    console.log("Invalid type : " + type);
                    break;
            }
        } catch (err) {
            console.log("ERROR: " + keyStr, err);

        }
    }

    moveJoint = (key, xyz, isRotation, value) => {
        this.target.joints[key][isRotation ? 'rotation' : 'position'][xyz] = isRotation ? value * 3.14 / 180 : value * 0.05;
    }

    moveMorph = (key, name, v) => {
        this.target.morphTargets[key].morphTargetInfluences[name] = v * 0.1;
    }

    resetCharacter = (spec) => {
        // alert("Sorry. Change character feature is in progress");
        try {
            this.props.scene.traverse(child => {
                if (child.name && child.name === 'character') {
                    this.props.scene.remove(child);
                }
            })
        } catch (err) { }
        this.setState({ spec: spec }, () => this.load());
    }

    getSelectCharacter = () => {
        let rows = [];
        const target = this.props.specs ? this.props.specs.info : Spec.info;
        target.forEach((item, i) => {
            rows.push(<DropdownItem onClick={() => this.resetCharacter(item.spec)} key={i}>{item.title}</DropdownItem>);
        })
        return rows;
    }

    render() {
        return (<>
            <div ref={el => this.datGuiElement = el} style={{
                position: 'absolute', top: '80%', left: '70%',
                visibility: this.props.showDetail ? 'visible' : 'hidden',
                padding: '1em',
                background: 'rgba(255, 204, 204, 0.5)',
                zIndex: 99
            }} />

            {this.props.showDetail &&
                <Draggable>
                    <div style={{ position: 'relative', width: '200px', padding: '1em', zIndex: 2, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                        <p style={{ fontSize: '0.85em' }}>{this.state.spec.name}</p>
                        <Dropdown isOpen={this.state.selectCharacter} toggle={() => this.setState({ selectCharacter: !this.state.selectCharacter })}>
                            <DropdownToggle color="primary" style={{ fontSize: '0.8em' }} caret>
                                Select Character
                            </DropdownToggle>
                            <DropdownMenu style={{ fontSize: '0.8em' }}>
                                {this.getSelectCharacter()}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </Draggable>
            }
        </>);
    }
}

export default Character;