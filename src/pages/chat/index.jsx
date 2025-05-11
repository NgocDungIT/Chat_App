import {
    selectChatType,
    selectDataChatBotSelected,
    selectFileDownloadProgress,
    selectFileUploadProgress,
    selectIsDownloading,
    selectIsUploading,
    selectUserData,
} from '@/store/slices';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ChatContainer from './components/chat-container';
import ContactsContainer from './components/contacts-container';
import EmptyChatContainer from './components/empty-chat-container';
import ChatBotContainer from './components/chat-bot-container';

const Chat = () => {
    const navigate = useNavigate();
    const user = useSelector(selectUserData);
    const chatType = useSelector(selectChatType);
    const isDownloading = useSelector(selectIsDownloading);
    const isUploading = useSelector(selectIsUploading);
    const fileDownloadProgress = useSelector(selectFileDownloadProgress);
    const fileUploadProgress = useSelector(selectFileUploadProgress);
    const dataChatBotSelected = useSelector(selectDataChatBotSelected);

    useEffect(() => {
        if (!user.profileSetup) {
            toast('Please setup profile to cotinute.');
            navigate('/profile');
        }
    }, [navigate, user]);

    return (
        <div className="flex h-[100vh] text-white overflow-hidden">
            {isUploading && (
                <div className="h-[100vh] w-[100vw] fixed top-0 left-0 z-10 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
                    <h5 className="text-5xl animate-pulse">Uploading file</h5>
                    {fileUploadProgress}%
                </div>
            )}
            {isDownloading && (
                <div className="h-[100vh] w-[100vw] fixed top-0 left-0 z-10 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
                    <h5 className="text-5xl animate-pulse">Downloading file</h5>
                    {fileDownloadProgress}%
                </div>
            )}
            <ContactsContainer />
            {
                dataChatBotSelected ? 
                <ChatBotContainer />
                : chatType == null ? <EmptyChatContainer /> : <ChatContainer />
            }
        </div>
    );
};

export default Chat;
