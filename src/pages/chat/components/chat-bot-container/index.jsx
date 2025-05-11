import { chatWithGPT, generateImageWithDALLE } from '@/lib/chatgpt';
import {
    closeChat,
    selectDataChatBotSelected,
    setDataChatBotSelected,
    updateChatBotMessage,
    updateTitleSession,
} from '@/store/slices';
import { Avatar } from '@radix-ui/react-avatar';
import { useState } from 'react';
import { IoSend } from 'react-icons/io5';
import { RiCloseFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '@/store';
import { apiClient } from '@/lib/api-client';
import { ADD_MESSAGE_SESSION } from '@/utils/constants';

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

    // Render conversation
    const renderMessages = () => {
        return dataChatBotSelected?.messages?.map((msg, index) => {
            if (dataChatBotSelected?.sessionType === 'text') {
                return (
                    <div
                        key={index}
                        className={`my-2 p-3 rounded-lg max-w-[70%] w-fit ${
                            msg.role === 'user' ? 'bg-blue-900 ml-auto' : 'bg-gray-700 mr-auto'
                        }`}
                    >
                        {msg.content}
                    </div>
                );
            } else if (dataChatBotSelected?.sessionType === 'image') {
                return <>He he Image</>;
            }
        });
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
                {renderMessages()}
                {isLoading && <div className="text-center">Đang xử lý...</div>}
            </div>

            {/* Footer */}
            <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 md-6 gap-6">
                <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                    <input
                        type="text"
                        className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
                        placeholder="Enter Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                {dataChatBotSelected?.sessionType === 'text' && (
                    <button
                        className="bg-[#357fac] rounded-md flex items-center justify-center p-5 hover:bg-[#125b81] focus:bg-[#125b81] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                        onClick={() => handleSendText()}
                    >
                        <IoSend className="text-2xl" />
                    </button>
                )}

                {dataChatBotSelected?.sessionType === 'image' && (
                    <button
                        className="bg-[#9eae4e] rounded-md flex items-center justify-center p-5 hover:bg-[#125b81] focus:bg-[#125b81] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                        onClick={() => handleCreateImage()}
                    >
                        <IoSend className="text-2xl" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatBotContainer;
