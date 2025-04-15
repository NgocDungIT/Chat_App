import { selectChatType, selectUserData } from '@/store/slices';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ChatContainer from './components/chat-container';
import ContactsContainer from './components/contacts-container';
import EmptyChatContainer from './components/empty-chat-container';

const Chat = () => {
    const navigate = useNavigate();
    const user = useSelector(selectUserData);
    const chatType = useSelector(selectChatType);

    useEffect(() => {
        if (!user.profileSetup) {
            toast('Please setup profile to cotinute.');
            navigate('/profile');
        }
    }, [navigate, user]);

    return (
        <div className="flex h-[100vh] text-white overflow-hidden">
            <ContactsContainer />
            {chatType == null ? <EmptyChatContainer /> : <ChatContainer />}
        </div>
    );
};

export default Chat;
