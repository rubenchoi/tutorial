import React from 'react';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

export default class Animations {
    constructor(aniObj) {
        this.aniObj = aniObj;
        this.animations = {}

        //TODO
        Object.values(['ani1, ani2, ani3']).forEach(s => this.animations[s] = []);
    }

    load = () => {
        let promises = []
        console.log("load " + this.aniObj.length + " animation objects");
        for (let i = 0; i < this.aniObj.length; i++) {
            promises.push(this.loadAnimation(i, this.aniObj[i].filepath));
        }
        return Promise.all(promises);
    }

    loadAnimation = (index, fullpath) => {
        console.log("Animation loading...", fullpath);
        return new Promise((resolve, reject) =>
            new FBXLoader().load(fullpath, (loaded) => {
                this.animations[this.aniObj[index].name].push(loaded.animations[0]);
                resolve();
            }, undefined, (err) => console.log(err))
        );
    }

    getByName = (name) => {
        // let animTalking = THREE.AnimationClip.findByName(model.animations, 'mixamo.com');
        let target = this.animations[name];
        let rand = Math.floor(Math.random() * target.length);
        return target[rand];
    }
}
