import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useSocket } from '@/context/SocketContext';
import { selectChatData, selectOnlineUsers, selectUserData } from '@/store/slices';
import { useRef, useEffect, useState } from 'react';
import { MdOutlineVideoCall, MdCallEnd, MdCall } from 'react-icons/md';
import { useSelector } from 'react-redux';
import Peer from 'simple-peer';
import { toast } from 'sonner';

function VideoCall() {
    const socket = useSocket();
    const chatData = useSelector(selectChatData);
    const user = useSelector(selectUserData);
    const onlineUsers = useSelector(selectOnlineUsers);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [startCall, setStartCall] = useState(false);
    const [infoCallData, setInfoCallData] = useState(null);
    const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'calling', 'ringing', 'in_call'
    const [callDuration, setCallDuration] = useState(0);

    const isOnline = onlineUsers?.includes(chatData?._id) || false;

    const clearCall = () => {
        setReceivingCall(false);
        setCallEnded(false);
        setCallAccepted(false);
        setCallerSignal(null);
        setStartCall(false);
        setInfoCallData(null);
        setCallStatus('idle');
        setCallDuration(0);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
    };

    // Format time for call duration display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Call duration timer
    useEffect(() => {
        let interval;
        if (callAccepted && !callEnded) {
            interval = setInterval(() => {
                setCallDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setCallDuration(0);
        }
        return () => clearInterval(interval);
    }, [callAccepted, callEnded]);

    const callUser = () => {
        if(!isOnline){
            toast('Người dùng không online. Vui lòng gọi lại sau.');
            return;
        }

        setStartCall(true);
        setCallStatus('calling');
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
            setCallStatus('in_call');
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallStatus('in_call');
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

        const messageData = {
            sender: infoCallData ? infoCallData.id : user.id,
            recipient: infoCallData ? user.id : chatData._id,
            messageType: 'call',
            content: undefined,
            fileUrl: undefined,
            callTime: formatTime(callDuration),
        };

        socket.emit('sendMessage', { message: messageData, contact: chatData });

        clearCall();
    };

    useEffect(() => {
        if (!socket) return;

        const handleCallUser = (data) => {
            setInfoCallData(data.from);
            setStartCall(true);
            setReceivingCall(true);
            setCallerSignal(data.signal);
            setCallStatus('ringing');
        };

        const handleCallEnded = () => {
            clearCall();
        };

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setStream(stream);
                myVideo.current.srcObject = stream;
            })
            .catch((err) => {
                console.error('Failed to get media devices', err);
            });

        socket.on('callUser', handleCallUser);

        socket.on('callEnded', handleCallEnded);

        return () => {
            socket.off('callEnded', handleCallEnded);
            socket.off('callUser', handleCallUser);
            if (connectionRef.current) {
                connectionRef.current.destroy();
            }
        };
    }, [socket]);

    return (
        <>
            <button
                onClick={callUser}
                className="text-neutral-500 focus:border-none focus:outline-none hover:text-white focus:text-white duration-300 transition-all"
                title="Start video call"
            >
                <MdOutlineVideoCall className="text-2xl" />
            </button>

            {/* Call Modal */}
            <div
                className="w-[100vw] h-[100vh] fixed top-0 left-0 flex flex-col justify-center items-center bg-slate-900/95 z-50"
                style={{ display: startCall ? 'flex' : 'none' }}
            >
                {/* Caller/Receiver Info */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        {callStatus === 'ringing'
                            ? 'Incoming Call'
                            : callStatus === 'calling'
                            ? 'Calling...'
                            : callStatus === 'in_call'
                            ? formatTime(callDuration)
                            : ''}
                    </h2>

                    <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                            {infoCallData ? (
                                <Avatar className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                    {infoCallData?.image ? (
                                        <AvatarImage
                                            src={infoCallData.image}
                                            alt="avatar"
                                            className="object-cover w-full h-full bg-transparent"
                                        />
                                    ) : (
                                        <span className="text-white text-5xl">
                                            {infoCallData?.firstName
                                                ? infoCallData?.firstName?.split('').shift()
                                                : infoCallData?.email?.split('').shift()}
                                        </span>
                                    )}
                                </Avatar>
                            ) : (
                                <Avatar className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                    {chatData?.image ? (
                                        <AvatarImage
                                            src={chatData.image}
                                            alt="avatar"
                                            className="object-cover w-full h-full bg-transparent"
                                        />
                                    ) : (
                                        <span className="text-white text-5xl">
                                            {chatData?.firstName
                                                ? chatData?.firstName?.split('').shift()
                                                : chatData?.email?.split('').shift()}
                                        </span>
                                    )}
                                </Avatar>
                            )}
                        </div>
                        <div className="text-left">
                            <p className="text-white font-semibold text-xl">
                                {callStatus === 'ringing'
                                    ? infoCallData?.firstName
                                    : callStatus === 'calling'
                                    ? chatData?.firstName
                                    : callStatus === 'in_call'
                                    ? chatData?.firstName
                                    : ''}
                            </p>
                            <p className="text-gray-300">
                                {callStatus === 'ringing'
                                    ? 'Video call...'
                                    : callStatus === 'calling'
                                    ? 'Ringing...'
                                    : callStatus === 'in_call'
                                    ? 'Active call'
                                    : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Video Streams */}
                <div className="flex flex-col-reverse md:flex-row h-auto w-auto gap-5 mb-8">
                    {/* Local Video */}
                    <div className="w-[200px] h-[150px] md:w-[300px] md:h-[225px] bg-gray-800 rounded-lg overflow-hidden relative">
                        {stream && (
                            <>
                                <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                    You
                                </div>
                            </>
                        )}
                    </div>

                    {/* Remote Video */}
                    <div className="w-full md:w-[500px] h-[300px] md:h-[375px] bg-gray-800 rounded-lg overflow-hidden relative flex items-center justify-center">
                        {callAccepted && !callEnded ? (
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <Avatar className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                    {infoCallData?.image ? (
                                        <AvatarImage
                                            src={infoCallData.image}
                                            alt="avatar"
                                            className="object-cover w-full h-full bg-transparent"
                                        />
                                    ) : (
                                        <span className="text-white text-5xl">
                                            {infoCallData?.firstName
                                                ? infoCallData?.firstName?.split('').shift()
                                                : infoCallData?.email?.split('').shift()}
                                        </span>
                                    )}
                                </Avatar>
                                <p className="text-white text-xl">
                                    {callStatus === 'ringing'
                                        ? 'Incoming Video Call'
                                        : callStatus === 'calling'
                                        ? 'Calling...'
                                        : ''}
                                </p>
                                {callStatus === 'calling' && (
                                    <p className="text-gray-300 mt-2 animate-pulse">Waiting for answer...</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Call Controls */}
                <div className="flex gap-5">
                    {callAccepted && !callEnded ? (
                        <button
                            onClick={leaveCall}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 flex items-center justify-center transition-all"
                            title="End call"
                        >
                            <MdCallEnd className="text-2xl" />
                        </button>
                    ) : null}

                    {receivingCall && !callAccepted ? (
                        <>
                            <button
                                onClick={leaveCall}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 flex items-center justify-center transition-all"
                                title="Decline"
                            >
                                <MdCallEnd className="text-2xl" />
                            </button>
                            <button
                                onClick={answerCall}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 flex items-center justify-center transition-all"
                                title="Accept"
                            >
                                <MdCall className="text-2xl" />
                            </button>
                        </>
                    ) : null}

                    {callStatus === 'calling' && !callAccepted && (
                        <button
                            onClick={leaveCall}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 flex items-center justify-center transition-all"
                            title="Cancel call"
                        >
                            <MdCallEnd className="text-2xl" />
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

export default VideoCall;
