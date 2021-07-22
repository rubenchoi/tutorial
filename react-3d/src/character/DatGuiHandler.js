import React, { Fragment } from 'react';
import * as dat from 'three/examples/js/libs/dat.gui.min.js';

const ROT_MIN = 0;
const ROT_MAX = 7;
const POS_MIN = -10;
const POS_MAX = 10;
const MORPH_MIN = 0;
const MORPH_MAX = 10;

class DatGuiHandler extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.generateGuiDat(this.props.datGuiItems, this.props.name);
        this.generateSelectAnimation(this.props.onChangeAnimation);
        this.mount.appendChild(this.gui.domElement);
    }

    generateGuiDat = (items, modelName) => {
        if (!this.gui) {
            this.gui = new dat.GUI();
        }
        let guiCharacter = this.gui.addFolder(modelName);
        let guiCharacterMorph;

        try {
            items.forEach((item) => {
                let bone = item.bone;
                if (item.isMorphTarget) {
                    try {
                        Object.keys(bone.morphTargetDictionary).forEach((key, idx) => {
                            if (!guiCharacterMorph) {
                                guiCharacterMorph = guiCharacter.addFolder('MorphTarget');
                            }
                            guiCharacterMorph.add(bone.morphTargetInfluences, idx, MORPH_MIN, MORPH_MAX)
                                .name(bone.name + "[" + key + "]");
                        });
                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    let guiCharacterXyz = guiCharacter.addFolder(bone.name);
                    ['x', 'y', 'z'].forEach(xyz => {
                        guiCharacterXyz.add(bone.position, xyz, POS_MIN, POS_MAX)
                            .name(bone.name + "[pos_" + xyz + "]");
                    });
                    ['x', 'y', 'z'].forEach(xyz => {
                        guiCharacterXyz.add(bone.rotation, xyz, ROT_MIN, ROT_MAX)
                            .name(bone.name + "[rot_" + xyz + "]");
                    });
                }
            });
        } catch (err) {
            console.log("ERROR on " + modelName);
        }
    }

    generateSelectAnimation = (callback) => {
        let guiAnimation = this.gui.addFolder('Animation');
        Object.values(['ani1, ani2, ani3']).forEach((type) => {
            guiAnimation.add({ btn: () => callback(type) }, 'btn').name(type);
        });
    }

    render() {
        return (<div ref={el => this.mount = el} />)
    }
}

export default DatGuiHandler;