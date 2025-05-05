import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChat, selectUserData } from '@/store/slices';
import { HOST } from '@/utils/constants';
import { store } from '@/store';

const SocketContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
    return useContext(SocketContext)?.socket;
};

const SocketProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUserData);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (user) {
            console.log('🔄 Initializing socket...');
            const newSocket = io(HOST, {
                withCredentials: true,
                query: { userId: user.id },
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected:', newSocket.id);
                setSocket(newSocket); // Cập nhật state để trigger re-render
            });

            const handleRecieveMessage = (message) => {
                const chatData = store.getState().chat.chatData;
                const chatType = store.getState().chat.chatType;

                if (
                    chatType !== undefined &&
                    (chatData?._id === message?.sender._id || chatData?._id === message?.recipient._id)
                ) {
                    dispatch(addChat(message));
                }
            };

            const handleRecieveChannelMessage = (message) => {};

            newSocket.on('recieveMessage', handleRecieveMessage);
            newSocket.on('recieveChannelMessage', handleRecieveChannelMessage);

            return () => {
                console.log('🔌 Disconnecting socket...');
                newSocket.disconnect();
            };
        } else {
            setSocket(null); // Reset khi user logout
        }
    }, [dispatch, user]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
