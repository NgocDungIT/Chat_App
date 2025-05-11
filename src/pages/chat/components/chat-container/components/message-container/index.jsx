import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowDown } from 'react-icons/io';
import { selectChatData, selectChatMessage, selectChatType, selectUserData, updateChatMessage } from '@/store/slices';
import { apiClient } from '@/lib/api-client';
import { GET_ALL_MESSAGES, GET_CHANNEL_MESSAGES, HOST } from '@/utils/constants';
import { IoCloseSharp } from 'react-icons/io5';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/lib/utils';

function checkIfImage(fliePath) {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(fliePath);
}

const MessageContainer = () => {
    let lastDate = null;
    const dispatch = useDispatch();
    const scrollRef = useRef();
    const chatData = useSelector(selectChatData);
    const chatType = useSelector(selectChatType);
    const chatMessage = useSelector(selectChatMessage);

    useEffect(() => {
        const getMessages = async () => {
            try {
                const res = await apiClient.post(GET_ALL_MESSAGES, { id: chatData._id }, { withCredentials: true });
                if (res.data?.data) {
                    dispatch(updateChatMessage(res.data.data));
                }
            } catch (err) {
                console.err('Error feat message: ', err.message);
            }
        };

        const getChannelMessages = async () => {
            try {
                const res = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${chatData._id}`, { withCredentials: true });
                if (res.data?.messages) {
                    dispatch(updateChatMessage(res.data.messages));
                }
            } catch (err) {
                console.err('Error feat message: ', err.message);
            }
        };

        if (chatData._id) {
            if (chatType == 'contact') getMessages();
            if (chatType == 'channel') getChannelMessages();
        }
    }, [chatData, chatType, dispatch]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessage]);

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-transparent">
            {chatMessage.map((message) => {
                const messageDate = moment(message.timestamp).format('YYYY-MM-DD');
                const showDate = messageDate !== lastDate;
                lastDate = messageDate;
                return (
                    <div key={message._id}>
                        {showDate && (
                            <div className="text-center text-gray-500 my-2">{moment(message.timestamp).format('LL')}</div>
                        )}
                        {chatType == 'contact' && <DMMessage chatData={chatData} message={message} />}
                        {chatType == 'channel' && <ChannelMessage message={message} />}
                    </div>
                );
            })}
            <div ref={scrollRef}></div>
        </div>
    );
};

const DMMessage = ({ chatData, message }) => {
    const imageRef = useRef();
    const [showImage, setShowImage] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    const handleDownloadFile = async (url) => {
        const res = await apiClient.get(`${HOST}/${url}`, {
            responseType: 'blob',
        });
        const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = urlBlob;
        link.setAttribute('download', url.split('/').pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(urlBlob);
    };

    const handleShowImage = (url) => {
        setShowImage(true);
        setImageUrl(url);
    };

    const handleCloseShowImage = () => {
        setShowImage(false);
        setImageUrl(null);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (imageRef.current && !imageRef.current.contains(event.target)) {
                setShowImage(false);
                setImageUrl(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className={`${message.sender === chatData._id ? 'text-left' : 'text-right'}`}>
                <div
                    className={`${
                        message.sender !== chatData._id
                            ? 'bg-[#357fac]/5 text-[#357fac]/90 border-[#357fac]/50'
                            : 'bg-[#2a2b33]/5 text-white/90 border-[#ffffff]/20'
                    } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
                >
                    {message.messageType == 'text' && <p>{message.content}</p>}
                    {message.messageType == 'file' && (
                        <>
                            {checkIfImage(message.fileUrl) ? (
                                <div className="cursor-pointer" onClick={() => handleShowImage(message.fileUrl)}>
                                    <img width={300} height={300} src={`${HOST}/${message.fileUrl}`} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-white/8 text-3xl rounded-full">
                                        <MdFolderZip />
                                    </span>
                                    <span>{message.fileUrl.split('/').pop()}</span>
                                    <span
                                        className="bg-[#4c7189] p-2 text-xl rounded-full hover:bg-[#4c7189]/50 cursor-pointer transition-all duration-300"
                                        onClick={() => handleDownloadFile(message.fileUrl)}
                                    >
                                        <IoMdArrowDown />
                                    </span>
                                </div>
                            )}
                            <span>{message.fileUrl.split('/').pop()}</span>
                        </>
                    )}
                </div>
                <div className="text-xs text-gray-600">{moment(message.timestamp).format('LT')}</div>
            </div>
            <AnimatePresence>
                {showImage && imageUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center flex-col bg-black/80 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img ref={imageRef} className="h-[80vh] w-full bg-cover" src={`${HOST}/${imageUrl}`} />
                        </motion.div>

                        <div className="flex gap-5 fixed top-5 right-10">
                            <motion.span
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-[#4c7189] p-2 text-xl rounded-full hover:bg-[#4c7189]/50 cursor-pointer transition-all duration-300"
                                onClick={() => handleDownloadFile(imageUrl)}
                            >
                                <IoMdArrowDown />
                            </motion.span>

                            <motion.span
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-[#4c7189] p-2 text-xl rounded-full hover:bg-[#4c7189]/50 cursor-pointer transition-all duration-300"
                                onClick={handleCloseShowImage}
                            >
                                <IoCloseSharp />
                            </motion.span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const ChannelMessage = ({ message }) => {
    const userData = useSelector(selectUserData);
    const chatData = useSelector(selectChatData);

    const imageRef = useRef();
    const [showImage, setShowImage] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    const handleDownloadFile = async (url) => {
        const res = await apiClient.get(`${HOST}/${url}`, {
            responseType: 'blob',
        });
        const urlBlob = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = urlBlob;
        link.setAttribute('download', url.split('/').pop());
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(urlBlob);
    };

    const handleShowImage = (url) => {
        setShowImage(true);
        setImageUrl(url);
    };

    const handleCloseShowImage = () => {
        setShowImage(false);
        setImageUrl(null);
    };

    useEffect(() => {
        function handleClickOutsideImage(event) {
            if (imageRef.current && !imageRef.current.contains(event.target)) {
                setShowImage(false);
                setImageUrl(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutsideImage);

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideImage);
        };
    }, []);

    return (
        <>
            <div className={`mt-5 ${message.sender._id !== userData.id ? 'text-left' : 'text-right'}`}>
                <div
                    className={`${
                        message.sender._id !== userData.id
                            ? 'bg-[#2a2b33]/5 text-white/90 border-[#ffffff]/20'
                            : 'bg-[#357fac]/5 text-[#357fac]/90 border-[#357fac]/50'
                    } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
                >
                    {message.messageType == 'text' && <p>{message.content}</p>}
                    {message.messageType == 'file' && (
                        <>
                            {checkIfImage(message.fileUrl) ? (
                                <div className="cursor-pointer" onClick={() => handleShowImage(message.fileUrl)}>
                                    <img width={300} height={300} src={`${HOST}/${message.fileUrl}`} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-4">
                                    <span className="text-white/8 text-3xl rounded-full">
                                        <MdFolderZip />
                                    </span>
                                    <span>{message.fileUrl.split('/').pop()}</span>
                                    <span
                                        className="bg-[#4c7189] p-2 text-xl rounded-full hover:bg-[#4c7189]/50 cursor-pointer transition-all duration-300"
                                        onClick={() => handleDownloadFile(message.fileUrl)}
                                    >
                                        <IoMdArrowDown />
                                    </span>
                                </div>
                            )}
                            <span>{message.fileUrl.split('/').pop()}</span>
                        </>
                    )}
                </div>
                {message.sender._id !== userData.id ? (
                    <div className="flex items-center justify-start gap-3">
                        <Avatar className="h-6 w-6 rounded-full overflow-hidden">
                            {message.sender?.image ? (
                                <AvatarImage
                                    src={message.sender.image}
                                    alt="avatar"
                                    className="object-cover w-full h-full bg-transparent"
                                />
                            ) : (
                                <AvatarFallback
                                    className={`uppercase h-6 w-6 text-[12px] flex items-center justify-center rounded-full ${getColor(
                                        message.sender.color
                                    )}`}
                                >
                                    {message.sender.firstName
                                        ? message.sender.firstName.split('').shift()
                                        : message.sender.email.split('').shift()}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        {message?.sender?.firstName && message?.sender?.lastName ? (
                            <span className="text-sm text-white/60">
                                {`${message.sender.firstName} ${message.sender.lastName}`}
                            </span>
                        ) : (
                            <span className="text-sm text-white/60">{`${message.email}`}</span>
                        )}
                        <span className="text-sm text-white/60">{moment(message.timestamp).format('LT')}</span>
                        {chatData.admin._id === message.sender._id && (
                            <span className="text-sm font-bold text-white/80">(Admin)</span>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-white/60 ml-1">{moment(message.timestamp).format('LT')}</div>
                )}
            </div>
            <AnimatePresence>
                {showImage && imageUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center flex-col bg-black/80 backdrop-blur-lg"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img ref={imageRef} className="h-[80vh] w-full bg-cover" src={`${HOST}/${imageUrl}`} />
                        </motion.div>

                        <div className="flex gap-5 fixed top-5 right-10">
                            <motion.span
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-[#4c7189] p-2 text-xl rounded-full hover:bg-[#4c7189]/50 cursor-pointer transition-all duration-300"
                                onClick={() => handleDownloadFile(imageUrl)}
                            >
                                <IoMdArrowDown />
                            </motion.span>

                            <motion.span
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-[#4c7189] p-2 text-xl rounded-full hover:bg-[#4c7189]/50 cursor-pointer transition-all duration-300"
                                onClick={handleCloseShowImage}
                            >
                                <IoCloseSharp />
                            </motion.span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
export default MessageContainer;
