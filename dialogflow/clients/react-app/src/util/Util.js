import React from 'react';
import { Badge, Spinner, CardBody, Card, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import Status from '../core/Status.js';

export const LoadPref = (m, v) => {
    if (localStorage.getItem(m) === null || localStorage.getItem(m) === undefined)
        localStorage.setItem(m, v);
    return localStorage.getItem(m);
}

export function Setting(props) {
    const update = (key, callback) => {
        let v = document.getElementById(key).value;
        localStorage.setItem(key, v);
        callback(key, v);
    }

    const getInputGroup = ({ key, title, defVal, callback }, idx) => {
        let defaultValue = key ? LoadPref(key, defVal) : defVal;
        return (
            <InputGroup key={idx} style={{ marginBottom: "0.5em" }}>
                <InputGroupAddon addonType="prepend">{title}</InputGroupAddon>
                <Input id={key} defaultValue={defaultValue} />
                <InputGroupAddon addonType="append" onClick={() => update(key, callback)}>Set</InputGroupAddon>
            </InputGroup>
        )
    }

    const getContents = () => {
        let rows = [];
        props.items.forEach((item, i) => {
            rows.push(getInputGroup(item, i));
        })
        return rows;
    }

    return (
        <Card>
            <CardBody>
                <p style={{ fontSize: '1em' }}>{props.title}</p>
                <p style={{ fontSize: '0.7em' }}>{props.subtitle}</p>
                {getContents()}
            </CardBody>
        </Card>
    );
}

export function StatusLog(props) {
    let inProgress = (props.status !== undefined && props.status.includes('...'));
    let color;
    switch (props.status) {
        case Status.INITIALIZING:
            color = "warning";
            break;
        case Status.LISTENING:
            color = "success";
            break;
        case Status.SPEAKING:
            color = "danger";
            break;
        case Status.IDLE:
        default:
            color = "primary";
            break;
    }
    return (
        <div style={{ fontSize: '1em', margin: '0.5em' }}>
            <Badge color={color}>
                {inProgress && <Spinner size='sm' animation="border" variant="warning" style={{ marginRight: '0.6em' }} />}
                {props.status}
            </Badge>
            {props.log && <div style={{ color: 'red', fontSize: '0.8em' }}>{props.log}</div>}
        </div >
    );
}


export default {
    Setting, LoadPref
}