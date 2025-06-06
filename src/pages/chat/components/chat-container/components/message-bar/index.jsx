import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/api-client';
import { selectChatData, selectChatType, selectUserData, updateFileUploadProgress, updateIsUploading } from '@/store/slices';
import { UPLOAD_FILE } from '@/utils/constants';
import EmojiPicker from 'emoji-picker-react';
import { useState, useRef, useEffect } from 'react';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';

const MessageBar = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUserData);
    const chatType = useSelector(selectChatType);
    const chatData = useSelector(selectChatData);

    const socket = useSocket();
    const emojiRef = useRef();
    const fileInputRef = useRef();

    const [message, setMessage] = useState('');
    const [openEmoji, setOpenEmoji] = useState(false);

    const handleAddEmoji = (emoji) => {
        if (emoji) {
            setMessage((msg) => msg + emoji.emoji);
        }
    };

    const handleSendMessage = async () => {
        if (message) {
            if (chatType === 'contact') {
                const messageData = {
                    sender: user.id,
                    recipient: chatData._id,
                    messageType: 'text',
                    content: message,
                    fileUrl: undefined,
                    callTime: undefined,
                };
                socket.emit('sendMessage', { message: messageData, contact: user });
            } else if (chatType === 'channel') {
                const messageData = {
                    sender: user.id,
                    channelId: chatData._id,
                    messageType: 'text',
                    content: message,
                    fileUrl: undefined,
                    callTime: undefined,
                };
                socket.emit('sendChannelMessage', messageData);
            }
            setMessage('');
        }
    };

    const handleAttachmentClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAttachmentChange = async (event) => {
        try {
            const file = event.target.files[0];

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                dispatch(updateIsUploading(true));

                const res = await apiClient.post(UPLOAD_FILE, formData, {
                    withCredentials: true,
                    onUploadProgress: (data) => {
                        dispatch(updateFileUploadProgress(Math.round((data.loaded * 100) / data.total)));
                    },
                });

                if (res.status === 200 && res.data) {
                    dispatch(updateIsUploading(false));
                    if (chatType === 'contact') {
                        const messageData = {
                            sender: user.id,
                            recipient: chatData._id,
                            messageType: 'file',
                            content: null,
                            fileUrl: res.data.data.filePath,
                            callTime: undefined,
                        };
                        socket.emit('sendMessage', { message: messageData, contact: user });
                    } else if (chatType === 'channel') {
                        const messageData = {
                            sender: user.id,
                            channelId: chatData._id,
                            messageType: 'file',
                            content: null,
                            fileUrl: res.data.data.filePath,
                            callTime: undefined,
                        };
                        socket.emit('sendChannelMessage', messageData);
                    }
                }
            }
        } catch (error) {
            dispatch(updateIsUploading(false));
            console.error('Upload file error: ' + error);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setOpenEmoji(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [emojiRef]);

    return (
        <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 md-6 gap-6">
            <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                <input
                    type="text"
                    className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
                    placeholder="Enter Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault(); // Ngăn xuống dòng (nếu là textarea)
                            handleSendMessage();
                        }
                    }}
                />
                <button
                    className="text-neutral-500 focus:border-none focus:outline-none hover:text-white focus:text-white duration-300 transition-all"
                    onClick={handleAttachmentClick}
                >
                    <GrAttachment className="text-2xl" />
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleAttachmentChange} />
                <div className="realtive">
                    <button
                        className="text-neutral-500 focus:border-none focus:outline-none hover:text-white focus:text-white duration-300 transition-all"
                        onClick={() => setOpenEmoji(true)}
                    >
                        <RiEmojiStickerLine className="text-2xl" />
                    </button>
                    <div ref={emojiRef} className="absolute bottom-16 right-0">
                        <EmojiPicker theme="dark" open={openEmoji} onEmojiClick={handleAddEmoji} autoFocusSearch={false} />
                    </div>
                </div>
            </div>
            <button
                className="bg-[#357fac] rounded-md flex items-center justify-center p-5 hover:bg-[#125b81] focus:bg-[#125b81] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                onClick={handleSendMessage}
            >
                <IoSend className="text-2xl" />
            </button>
        </div>
    );
};

export default MessageBar;
