/* eslint-disable react/prop-types */
import React, { createContext, useEffect, useState } from 'react';

export const ModelContextStore = createContext();

const MAX_CACHE = 10;

const ModelContext = (props) => {
    const [command, setCommand] = useState();
    const [response, setResponse] = useState();
    const [cache, setCache] = useState([]);

    const UserInfo = {
        command,
        setCommand,
        response,
        setResponse,
        cache
    }

    useEffect(() => {
        if (response !== undefined) {
            const c = cache;
            c.push(response.data);
            if (c.length > MAX_CACHE) {
                c.shift();
            }
            console.log('modelstore.....', c);
            setCache(c);
        }
    }, [response]);

    return (
        <ModelContextStore.Provider value={UserInfo}>
            {props.children}
        </ModelContextStore.Provider>
    );
};

export default ModelContext;