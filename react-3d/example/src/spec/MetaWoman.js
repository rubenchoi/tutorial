const BASE_DIR = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/character/';

export const MetaWoman = {
    name: 'Meta Woman Glb',
    filepath: BASE_DIR + 'woman.glb',
    scale: 50.0,
    animations: [
        { filepath: BASE_DIR + 'Arm Stretching.fbx', name: 'Arm Stretching' },
        { filepath: BASE_DIR + 'Happy Idle.fbx', name: 'Happy Idle' },
    ]
}