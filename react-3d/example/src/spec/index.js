import { MetaWoman } from './MetaWoman';
import { Dummy } from './Dummy';

export default class Spec { }

Spec.MetaWoman = MetaWoman;
Spec.Dummy = Dummy;

Spec.info = [
    { title: 'Meta Woman', spec: Spec.MetaWoman },
    { title: 'Dummy', spec: Spec.Dummy },
]

Spec.default = Spec.MetaWoman;

Spec.basedir = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/character/';