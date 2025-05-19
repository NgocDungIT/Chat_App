import { chatWithGPT, generateImageWithDALLE } from '@/lib/chatgpt';
import { motion, AnimatePresence } from 'framer-motion';
import {
    closeChat,
    selectDataChatBotSelected,
    setDataChatBotSelected,
    updateChatBotMessage,
    updateTitleSession,
} from '@/store/slices';
import { Avatar } from '@radix-ui/react-avatar';
import { useEffect, useRef, useState } from 'react';
import { IoCloseSharp, IoSend } from 'react-icons/io5';
import { RiCloseFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '@/store';
import { apiClient } from '@/lib/api-client';
import { ADD_MESSAGE_SESSION, HOST } from '@/utils/constants';
import { IoMdArrowDown } from 'react-icons/io';
import Lottie from 'react-lottie';
import dotsLoadingAnimation from '@/assets/animation-loading.json';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const ChatBotContainer = () => {
    const dispatch = useDispatch();
    const dataChatBotSelected = useSelector(selectDataChatBotSelected);

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendText = async () => {
        if (!message.trim()) return;

        try {
            // Thêm tin nhắn người dùng vào conversation
            const userMessage = { role: 'user', content: message };

            if (!dataChatBotSelected.isUpdateTitle) {
                dispatch(updateTitleSession(message));
            }

            dispatch(
                updateChatBotMessage({
                    newMessage: userMessage,
                })
            );
            setIsLoading(true);

            await apiClient.post(
                ADD_MESSAGE_SESSION,
                {
                    sessionId: dataChatBotSelected._id,
                    newMessage: userMessage,
                    isUpdateTitle: dataChatBotSelected.isUpdateTitle,
                },
                {
                    withCredentials: true,
                }
            );

            const conversation = store.getState().chatBot.dataChatBotSelected?.messages.map((mess) => {
                return {
                    role: mess.role,
                    content: mess.content,
                };
            });
            if (conversation.length) {
                // Gọi API ChatGPT
                const response = await chatWithGPT(conversation);

                // Thêm phản hồi vào conversation
                const assistantMessage = { role: 'assistant', content: response };
                dispatch(
                    updateChatBotMessage({
                        newMessage: assistantMessage,
                    })
                );
                await apiClient.post(
                    ADD_MESSAGE_SESSION,
                    {
                        sessionId: dataChatBotSelected._id,
                        newMessage: assistantMessage,
                    },
                    {
                        withCredentials: true,
                    }
                );
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setMessage('');
            setIsLoading(false);
        }
    };

    const handleCreateImage = async () => {
        if (!message.trim()) return;

        try {
            const userMessage = { role: 'user', content: message, messageType: 'text' };

            if (!dataChatBotSelected.isUpdateTitle) {
                dispatch(updateTitleSession(message));
            }

            dispatch(
                updateChatBotMessage({
                    newMessage: userMessage,
                })
            );
            setIsLoading(true);

            await apiClient.post(
                ADD_MESSAGE_SESSION,
                {
                    sessionId: dataChatBotSelected._id,
                    newMessage: userMessage,
                    isUpdateTitle: dataChatBotSelected.isUpdateTitle,
                },
                {
                    withCredentials: true,
                }
            );

            // Khi cần tạo ảnh từ prompt
            const imageResponse = await generateImageWithDALLE(message);

            if (imageResponse.success) {
                const assistantMessage = {
                    role: 'assistant',
                    imageUrl: imageResponse.url,
                    messageType: 'image',
                };
                dispatch(
                    updateChatBotMessage({
                        newMessage: assistantMessage,
                    })
                );
                await apiClient.post(
                    ADD_MESSAGE_SESSION,
                    {
                        sessionId: dataChatBotSelected._id,
                        newMessage: assistantMessage,
                    },
                    {
                        withCredentials: true,
                    }
                );
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setMessage('');
            setIsLoading(false);
        }
    };

    const handleCloseChat = () => {
        dispatch(setDataChatBotSelected(null));
        dispatch(closeChat());
    };

    return (
        <div className="flex top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex-col md:static md:flex-1">
            {/* Header */}
            <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
                <div className="flex gap-5 w-full justify-between">
                    <div className="flex gap3 items-center justify-center">
                        <div className="h-12 w-12 -min-h-12 min-w-12 relative rounded-full overflow-hidden">
                            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                <div className="bg-[#ffffff22] h-12 w-12 flex rounded-full items-center justify-center">
                                    #
                                </div>
                            </Avatar>
                        </div>
                        <div className="ml-2">
                            <span className="text-xm truncate block max-w-[300px]">{dataChatBotSelected?.title}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-5">
                        <button
                            onClick={handleCloseChat}
                            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                        >
                            <RiCloseFill className="text-3xl" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-transparent">
                {dataChatBotSelected?.messages?.map((msg, index) => {
                    return (
                        <ItemMessage key={msg.id} msg={msg} index={index} sessionType={dataChatBotSelected.sessionType} />
                    );
                })}
                {isLoading && (
                    <div className="text-left flex justify-start items-start w-[80px] h-[40px]">
                        <Lottie
                            height={40}
                            width={80}
                            isClickToPauseDisabled={true}
                            options={{
                                loop: true,
                                autoplay: true,
                                animationData: dotsLoadingAnimation,
                                rendererSettings: {
                                    preserveAspectRatio: 'xMidYMid slice',
                                },
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 md-6 gap-6">
                <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                    <input
                        type="text"
                        className={`flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Enter Message"
                        value={message}
                        disabled={isLoading}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault(); // Ngăn xuống dòng (nếu là textarea)
                                dataChatBotSelected?.sessionType === 'text' && !isLoading && handleSendText();
                                dataChatBotSelected?.sessionType === 'image' && !isLoading && handleCreateImage();
                            }
                        }}
                    />
                </div>
                {dataChatBotSelected?.sessionType === 'text' && (
                    <button
                        className={`bg-[#357fac] rounded-md flex items-center justify-center p-5 hover:bg-[#125b81] focus:bg-[#125b81] focus:border-none focus:outline-none focus:text-white duration-300 transition-all ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !isLoading && handleSendText()}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <AiOutlineLoading3Quarters className="text-white text-2xl cursor-pointer animate-spin" />
                        ) : (
                            <IoSend className="text-2xl" />
                        )}
                    </button>
                )}

                {dataChatBotSelected?.sessionType === 'image' && (
                    <button
                        className={`bg-[#9eae4e] rounded-md flex items-center justify-center p-5 hover:bg-[#125b81] focus:bg-[#125b81] focus:border-none focus:outline-none focus:text-white duration-300 transition-all ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !isLoading && handleCreateImage()}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <AiOutlineLoading3Quarters className="text-white text-2xl cursor-pointer animate-spin" />
                        ) : (
                            <IoSend className="text-2xl" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

const ItemMessage = ({ msg, index, sessionType }) => {
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

    if (sessionType === 'text') {
        return (
            msg?.content && (
                <div key={msg._id || index} className={`${msg.role !== 'user' ? 'text-left' : 'text-right'}`}>
                    <div
                        className={`${
                            msg.role === 'user'
                                ? 'bg-[#357fac]/5 text-[#357fac]/90 border-[#357fac]/50'
                                : 'bg-[#2a2b33]/5 text-white/90 border-[#ffffff]/20'
                        } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
                    >
                        <p>{msg.content}</p>
                    </div>
                </div>
            )
        );
    }

    // Tin nhắn hình ảnh
    if (sessionType === 'image') {
        return (
            <>
                <div key={msg._id || index} className={`${msg.role !== 'user' ? 'text-left' : 'text-right'}`}>
                    <div
                        className={`${
                            msg.role === 'user'
                                ? 'bg-[#357fac]/5 text-[#357fac]/90 border-[#357fac]/50'
                                : 'bg-[#2a2b33]/5 text-white/90 border-[#ffffff]/20'
                        } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
                    >
                        {msg.messageType === 'text' && <p>{msg.content}</p>}
                        {msg.messageType === 'image' && (
                            <div className="cursor-pointer" onClick={() => handleShowImage(msg.imageUrl)}>
                                <img width={300} height={300} src={`${HOST}/${msg.imageUrl}`} />
                            </div>
                        )}
                    </div>
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
    }

    // Fallback cho các trường hợp khác
    return null;
};

export default ChatBotContainer;
