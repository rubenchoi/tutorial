import React, { Fragment } from 'react';
import Character from './Character.js';

const MultiCharacter = (props) => {
    const characters = props.models;
    return (<>
        {characters.map((character, idx) => {
            return <Character {...props} character={character} key={idx} />
        })}
    </>);
}

export default MultiCharacter;