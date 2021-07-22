import { MetaWoman } from './MetaWoman';
import { MetaWomanMtl } from './MetaWomanMtl';
import { Dummy } from './Dummy';

export default class Spec { }

Spec.MetaWoman = MetaWoman;
Spec.MetaWomanMtl = MetaWomanMtl;
Spec.Dummy = Dummy;

Spec.info = [
    { title: 'Meta Woman(GLB)', spec: Spec.MetaWoman },
    { title: 'Dummy', spec: Spec.Dummy },
    { title: 'Metal Woman(MTL)', spec: Spec.MetaWomanMtl },
]

Spec.default = Spec.MetaWoman;

Spec.basedir = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/character/';