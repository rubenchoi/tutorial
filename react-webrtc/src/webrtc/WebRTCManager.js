/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react"

// localStorage.setItem('signaling', `ws://${window.location.hostname}:8080`);
const SIGNALING_SERVER_URL = localStorage.getItem('signaling') === null ? `ws://${window.location.hostname}:8080` : localStorage.getItem('signaling');

const RTC_CONFIG = {
    sdpSemantics: 'unified-plan',
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
}

const getConnectionId = () => {
    let temp_url = URL.createObjectURL(new Blob());
    let uuid = temp_url.toString();
    URL.revokeObjectURL(temp_url);
    return uuid.split(/[:/]/g).pop().toLowerCase();
}

const WebRTCManager = () => {
    const STATUS = {
        CONNECTING_TO_SIG_SERVER: `connecting to the signaling server...`,
        CONNECTED_TO_SIG_SERVER: `connected to the signaling server`,
        DISCONNECTED_TO_SIG_SERVER: `disconnected from the signaling server`,
        WEBRTC_OFFERING: `[webrtc] offering...`,
        WEBRTC_RECEIVED_OFFER: `[webrtc] received offer.`,
        WEBRTC_ANSWERING: `[webrtc] answering...`,
        WEBRTC_RECEIVED_ANSWER: `[webrtc] received answer.`,
    }

    const socketRef = useRef(null);
    const myVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const connectionId = useRef(null);
    const localDataChannelRef = useRef(null);
    const remoteDataChannelRef = useRef(null);

    const [status, setStatus] = useState(STATUS.CONNECTING_TO_SIG_SERVER);
    const [url,] = useState(SIGNALING_SERVER_URL);
    const [dataReceived, setDataReceived] = useState(undefined);
    const [dataSent, setDataSent] = useState(undefined);

    const getLocalMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            if (myVideoRef.current) {
                myVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (e) {
            // if (e instanceof PermissionDeniedError) window.alert('permission required');
            // if (e instanceof NotFoundError) console.log('no found');
            console.error(e);
        }
    }

    const setRemoteMedia = e => {
        console.log("setRemoteMedia", e.streams[0], e);
        remoteVideoRef.current.srcObject = e.streams[0];
    }

    const createPeer = async (enableDataChannel = true) => {
        const peer = new RTCPeerConnection(RTC_CONFIG);

        const stream = await getLocalMedia();
        stream.getTracks().forEach(track => peer.addTrack(track, stream));

        peer.onicecandidate = e => onLocalCandidate(e);
        peer.ontrack = e => setRemoteMedia(e);

        peer.onicegatheringstatechange = e => console.log(`*****ICE gathering state changed: ${peer.iceGatheringState}`);
        peer.onconnectionstatechange = e => console.log(`*****Connection state change: ${peer.connectionState}`);
        peer.onsignalingstatechange = e => console.log(`*****Signaling state change: ${peer.signalingState}`);
        peer.oniceconnectionstatechange = e => console.log(`*****ICE connection state change: ${peer.iceConnectionState}`);

        peer.ondatachannel = e => {
            remoteDataChannelRef.current = e.channel;
            remoteDataChannelRef.current.onmessage = e => setDataReceived(e.data);
        }


        if (enableDataChannel) {
            console.log("&&&&&&&&&&&&&&&&&&&& DATA CHANNEL")
            localDataChannelRef.current = peer.createDataChannel("localDataChannel");
            localDataChannelRef.current.onopen = e => console.log("==== data channel opened");
            localDataChannelRef.current.onclose = e => console.log("==== data channel closed");
        }
        return peer;
    }

    //------------------------------------------------------------------//
    //------------------------ Signaling Server ------------------------//
    //------------------------------------------------------------------//

    const connectToSignalingServer = () => {
        console.log(url)
        socketRef.current = new WebSocket(url);
        socketRef.current.onopen = () => createConnection();
        socketRef.current.onclose = () => deleteConnection();

        socketRef.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
                case "connect":
                    console.log(`connected to signaling server`, msg);
                    break;
                case "disconnect":
                    console.log(`got disconnect message`, msg);
                    break;
                case "offer":
                    onReceiveCall(msg);
                    break;
                case "answer":
                    onReceiveAnswer(msg);
                    break;
                case "candidate":
                    onRemoteCandidate(msg);
                    break;
                case "connectionstatechange":
                    console.log("WEBRTC READY", msg);
                    break;
                case "error":
                    console.error(`got error: ${msg.reason}`)
                    break;
                default:
                    console.log("-----------------ignored", msg);
                    break;
            }
        };
    }

    const createConnection = () => {
        console.log('createConnection');
        connectionId.current = connectionId.current || getConnectionId();
        const sendJson = JSON.stringify({ type: "connect", connectionId: connectionId.current });
        socketRef.current.send(sendJson);
        setStatus(STATUS.CONNECTED_TO_SIG_SERVER);
    }

    const deleteConnection = () => {
        console.log('deleteConnection ' + connectionId.current);
        const sendJson = JSON.stringify({ type: "disconnect", connectionId: connectionId.current });
        socketRef.current.send(sendJson);
        setStatus(STATUS.DISCONNECTED_TO_SIG_SERVER);
    }

    const makeCall = async () => {
        try {
            const offer = await createOffer();
            const payload = JSON.stringify({
                type: "offer",
                from: connectionId.current,
                data: {
                    connectionId: connectionId.current,
                    sdp: offer.sdp,
                    type: "offer"
                }
            });
            console.log(`[makeCall] sending offer...`);
            socketRef.current.send(payload);
            setStatus(STATUS.WEBRTC_OFFERING);
        } catch (e) {
            console.error(`makeCall failed`, e);
        }
    }

    const onReceiveCall = async (msg) => {
        try {
            console.log(`[onReceiveCall] received offer `, msg);
            const answer = await createAnswer(msg.data.sdp);

            const payload = JSON.stringify({
                type: "answer",
                from: connectionId.current,
                to: msg.from,
                data: {
                    connectionId: connectionId.current,
                    sdp: answer.sdp,
                    type: "answer",
                }
            });
            console.log(`[onReceiveCall] sending answer...`);
            socketRef.current.send(payload);
            setStatus(STATUS.WEBRTC_ANSWERING);
        } catch (e) {
            console.error(`onReceiveCall failed`, e);
        }
    }

    const onReceiveAnswer = async (msg) => {
        console.log(`[onReceiveAnswer] received answer `, msg);
        await handleAnswer(msg.data.sdp);
        setStatus(STATUS.WEBRTC_RECEIVED_ANSWER);
    }

    const onLocalCandidate = e => {
        if (e.candidate) {
            console.log(`[onLocalCandidate]`, e.candidate);
            const payload = JSON.stringify({
                type: "candidate",
                from: connectionId.current,
                data: {
                    connectionId: connectionId.current,
                    candidate: e.candidate.candidate,
                    sdpMLineIndex: e.candidate.sdpMLineIndex,
                    sdpMid: e.candidate.sdpMid,
                }
            });
            socketRef.current.send(payload);
        } else {
            console.log('[onLocalCandidate] Got final candidate!');
            return;
        }
    }

    const onRemoteCandidate = msg => {
        console.log("[onRemoteCandidate]", msg);
        handleCandidate(msg.data.candidate, msg.data.sdpMLineIndex, msg.data.sdpMid);
    }

    //------------------------------------------------------------------//
    //----------------------------- WebRTC -----------------------------//
    //------------------------------------------------------------------//
    const createOffer = async () => {
        if (!peerRef.current) peerRef.current = await createPeer();
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        console.log(`[createOffer]`, offer);
        return offer;
    }

    const handleAnswer = async (sessionDescription) => {
        let sdp = sessionDescription;
        try {
            await peerRef.current.setRemoteDescription(sdp);
        } catch (e) {
            console.error("handleAnswer: 1st error. Wrapping and try again...", e);
            sdp = new RTCSessionDescription({ sdp: sdp, type: "answer" });
            try {
                await peerRef.current.setRemoteDescription(sdp);
                console.error("handleAnswer: now is ok");
            } catch (e) {
                console.error("handleAnswer: finally failed!", e);
            }
        }
    }

    // [troubleshoot] do not use new RTCSessionDescription({ sdp: sdp, type: "offer" })
    // [troubleshoot] do not forget await! - cause state error
    const createAnswer = async (sessionDescription) => {
        try {
            if (!peerRef.current) peerRef.current = await createPeer(false);
            let sdp = sessionDescription;
            try {
                await peerRef.current.setRemoteDescription(sdp);
            } catch (e) {
                console.error("setRemoteDesciption error. Wrapping and try again...", e);
                sdp = new RTCSessionDescription({ sdp: sessionDescription, type: "offer" });
                try {
                    await peerRef.current.setRemoteDescription(sdp);
                    console.error("now is ok");
                } catch (e) {
                    console.error("something's wrong here!", e);
                }
            }
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            console.log(`[createAnswer]`, answer);
            return answer;
        } catch (e) {
            console.error(e);
        }
    }

    const handleCandidate = async (candidate, sdpMid, sdpMLineIndex) => {
        try {
            const option = {
                candidate: candidate,
                sdpMid: sdpMid,
                sdpMLineIndex: sdpMLineIndex
            };
            const r = new RTCIceCandidate(option);
            console.log(r);
            peerRef.current && await peerRef.current.addIceCandidate(r);
        } catch (e) {
            console.error("error adding received ice candidate", { candidate, sdpMid, sdpMLineIndex });
            console.error(e);
        }
    }

    const sendData = (text = "TEST data") => {
        if (localDataChannelRef.current) {
            localDataChannelRef.current.send(text);
            setDataSent(text);
        }
    }

    useEffect(() => {
        const init = async () => {
            peerRef.current = await createPeer();
        }
        init();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            if (peerRef.current) {
                peerRef.current.close();
            }
        }
    }, []);

    useEffect(() => {
        switch (status) {
            case STATUS.CONNECTING_TO_SIG_SERVER:
                connectToSignalingServer();
                break;
            case STATUS.CONNECTED_TO_SIG_SERVER:
            case STATUS.WEBRTC_OFFERING:
            case STATUS.WEBRTC_RECEIVED_OFFER:
            default:
                // console.log(`Status [${Object.keys(STATUS).find(key => STATUS[key] === status)}] ignored`);
                break;
        }
    }, [status]);

    return (<div style={{ margin: '1em' }}>
        <p>{`${status}  ${url}`}</p>
        {dataSent && <p>{`Data Sent: ${dataSent}`}</p>}
        {dataReceived && <p>{`Data Received: ${dataReceived}`}</p>}
        <button onClick={() => makeCall()}>Make Call</button>
        <br />
        <button onClick={() => sendData()}>Send Data</button>
        <p>{`WebRTC is ${status ? 'ready' : 'not ready'}`}</p>
        <video ref={remoteVideoRef} autoPlay style={{ border: '1px solid red', margin: '1%', width: "40%" }} />
        <video ref={myVideoRef} autoPlay style={{ border: '1px solid green', margin: '1%', width: "40%" }} />
    </div>)
}

export { WebRTCManager };
