/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-template */
/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable arrow-body-style */
/* eslint-disable no-alert */
import PropTypes from 'prop-types';
import { useContext, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { Badge, Button, Input, InputGroup, InputGroupText, Spinner } from 'reactstrap';
import { ModelContextStore } from '../model/ModelStore';

const DEFAULT_BASEDIR = 'F:\\22_SWARCH_PROJECT\\'; // 'C:\\swarchi\\license_plate_recognition\\video\\';

Preview.propTypes = {
	host: PropTypes.string,
	port: PropTypes.number,
	fitToWindow: PropTypes.bool,
	showDetail: PropTypes.bool,
};
// ----------------------------------------------------------------------

export default function Preview({ host, port, fitToWindow, showDetail }) {
	const { setCommand } = useContext(ModelContextStore);

	const [alprHost, setAlprHost] = useState(host || 'localhost');
	const [alprPort, setAlprPort] = useState(port || 8080);
	const [setting, setSetting] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

	const [datauri, setDatauri] = useState(undefined);
	const [video, setVideo] = useState('beaver1');
	const [baseDir, setBaseDir] = useState((localStorage.getItem('lgalpr_basedir') === undefined || localStorage.getItem('lgalpr_basedir') === null) ? DEFAULT_BASEDIR : localStorage.getItem('lgalpr_basedir'));
	const [interval, setInterval] = useState(10);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [log, setLog] = useState(undefined);

	const ws = useRef(null);

	useEffect(() => {
		if (baseDir !== undefined) {
			localStorage.setItem('lgalpr_basedir', baseDir);
		}
	}, [baseDir])

	useEffect(() => {
		const connect = () => {
			ws.current = new WebSocket(getUrl());
			ws.current.onopen = () => {
				console.log("connected!!");
				setIsConnected(true);
			};
			ws.current.onclose = () => {
				console.log("disconnected!!");
				setIsConnected(false);
				setTimeout(() => {
					connect();
				}, 1000);
			}
			ws.current.onmessage = message => {
				// console.log(message)
				try {
					const m = JSON.parse(message.data);
					if ('JPEG' in m) {
						const img = "data:image/jpeg;base64," + m.JPEG;
						setDatauri(img);
					} else if ('PLATE' in m) {
						console.log('found plate', m.PLATE);
						// onFoundPlate(m.PLATE);
						setCommand({ type: 'search', data: { keyword: m.PLATE } });
					} else if ('status' in m) {
						if (m.status === 'finished') {
							setIsPlaying(false);
						}
					}
				} catch (err) {
					console.error(err);
				}
			};
		}
		connect();
	}, []);

	useEffect(() => {
		if (datauri !== undefined) {
			isLoading && setIsLoading(false);
			!isPlaying && setIsPlaying(true);
		}
	}, [datauri]);

	const reconnect = () => {
		alert("TBD: reconnect");
	}

	const getUrl = () => { return 'ws://' + alprHost + ':' + alprPort }

	const sendRequest = () => {
		const param = isPlaying ?
			{ request: 'stop' } :
			{
				request: 'start',
				interval: "" + interval,
				filepath: (baseDir + video + '.avi')
			}
		const s = JSON.stringify(param);
		setIsLoading(!isPlaying);
		setIsPlaying(!isPlaying);
		ws.current.send(s);
		setLog("Request: " + (param.request + (isPlaying ? "" : " | " + interval + " | " + video)));
	}

	const getInfo = () => {
		return (isConnected ? "ALPR engine is ready [Connected to " : "★ALPR engine is unavailable [Disconnected from ") + getUrl() + "]";
	}

	return (<>
		<div style={{ position: 'relative', width: '100%', zIndex: 0 }} >

			<Draggable>
				<div style={fitToWindow ?
					{ position: 'absolute', margin: '1em', width: '500px', padding: '1em', borderRadius: '25px', background: 'rgba(255,255,255,0.7)', zIndex: 1 } :
					{ float: 'left', width: '40%', padding: '1em', zIndex: 1 }}>
					<Badge
						style={{ marginBottom: '1em', fontSize: "0.8em" }}
						color={isConnected ? 'primary' : 'danger'}
						onClick={() => setSetting(!setting)}>
						{getInfo()}
					</Badge>
					{setting &&
						<InputGroup size="sm" style={{ marginBottom: '1em' }}>
							<InputGroupText >
								alprHost
							</InputGroupText>
							<Input
								id="connect"
								name="connect"
								type="textfield"
								defaultValue={alprHost}
								onChange={e => setAlprHost(e.target.value)}
							/>
							<InputGroupText >
								alprPort
							</InputGroupText>
							<Input
								id="alprPort"
								name="alprPort"
								type="textfield"
								defaultValue={alprPort}
								onChange={e => setAlprPort(e.target.value)}
							/>
							<Button onClick={() => reconnect()}>
								Reconnect
							</Button>
						</InputGroup>
					}
					<InputGroup size="sm" style={{ marginBottom: '1em' }}>
						<InputGroupText >
							Filepath
						</InputGroupText>
						<Input
							id="selectVideoPath"
							name="selectPath"
							type="textfield"
							defaultValue={baseDir}
							onChange={e => setBaseDir(e.target.value)}
						/>
					</InputGroup>
					<InputGroup size="sm" style={{ marginBottom: '1em' }}>
						<InputGroupText >
							Preview Interval
						</InputGroupText>
						<Input
							id="interval"
							name="interval"
							type="textfield"
							defaultValue={interval}
							onChange={e => setInterval(e.target.value)}
						/>
					</InputGroup>
					<InputGroup size="sm">
						<InputGroupText >
							Select
						</InputGroupText>
						<Input
							id="selectVideo"
							name="select"
							type="select"
							defaultValue={video}
							onChange={e => setVideo(e.target.value)}
						>
							<option value='beaver1'>Beaver1</option>
							<option value='beaver2'>Beaver2</option>
							<option value='beaver3'>Beaver3</option>
							<option value='beaver4'>Beaver4</option>
						</Input>
						<Button onClick={() => sendRequest()} color="primary">{isPlaying ? 'Cancel' : 'Play'}</Button>
					</InputGroup>
					<>
						<p style={{ marginTop: '1em', fontSize: "0.8em" }}>{log && log}</p>
						{fitToWindow || <Badge style={{ width: 'fit-content' }} color="warning">←image received</Badge>}
					</>
					{(isLoading === true) && <h6 style={{ color: 'red' }}><Spinner /> Waiting for loading video...</h6>}
				</div>
			</Draggable>
			<div style={fitToWindow ? { position: 'relative', width: '100%' } : { float: 'left', width: '50%' }} >
				<img src={datauri} style={fitToWindow ? { height: '100%' } : { width: '80%' }} />
			</div>
		</div >
	</>);
}
