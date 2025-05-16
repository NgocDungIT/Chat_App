import { useSocket } from '@/context/SocketContext';
import { selectChatData, selectUserData } from '@/store/slices';
import { useRef, useEffect, useState, useCallback } from 'react';
import { MdOutlineVideoCall } from 'react-icons/md';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';

function VideoCall() {
    const socket = useSocket();
    const chatData = useSelector(selectChatData);
    const user = useSelector(selectUserData);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    const callUser = useCallback(() => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socket.emit('callUser', {
                signalData: data,
                from: user,
                userToCall: chatData,
            });
        });

        peer.on('stream', (stream) => {
            userVideo.current.srcObject = stream;
        });

        socket.on('callAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    }, [chatData, socket, stream, user]);

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: chatData });
        });

        peer.on('stream', (stream) => {
            userVideo.current.srcObject = stream;
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        socket.emit('callEnded', { to: chatData });
        setCallEnded(true);
        connectionRef.current.destroy();
    };

    useEffect(() => {
        if (!socket) return;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            setStream(stream);
            myVideo.current.srcObject = stream;
        });

        socket.on('callUser', (data) => {
            setReceivingCall(true);
            setCallerSignal(data.signal);
        });

        socket.on('callEnded', () => {
            setCallEnded(true);
            connectionRef.current.destroy();
        });
    }, [socket]);

    return (
        <div className="w-[100vw] h-[100vh] fixed top-0 left-0 flex flex-col justify-center items-center bg-slate-800">
            <div className="flex h-auto w-auto gap-5">
                <div className="w-[300px] h-[300px] bg-orange-300">
                    {stream && <video playsInline muted ref={myVideo} autoPlay className="w-full h-full" />}
                </div>
                <div className="w-[300px] h-[300px] bg-orange-300">
                    {callAccepted && !callEnded ? (
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full" />
                    ) : null}
                </div>
            </div>

            <div className="flex h-auto w-auto gap-5">
                {callAccepted && !callEnded ? (
                    <button
                        onClick={leaveCall}
                        className="text-neutral-500 focus:border-none focus:outline-none hover:text-white focus:text-white duration-300 transition-all"
                    >
                        Kết thúc
                    </button>
                ) : (
                    <button
                        onClick={callUser}
                        className="text-neutral-500 focus:border-none focus:outline-none hover:text-white focus:text-white duration-300 transition-all"
                    >
                        Gọi điện
                    </button>
                )}
                {receivingCall && !callAccepted ? (
                    <button
                        onClick={answerCall}
                        className="text-neutral-500 focus:border-none focus:outline-none hover:text-white focus:text-white duration-300 transition-all"
                    >
                        Chấp nhận
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default VideoCall;
