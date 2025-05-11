import { useEffect } from 'react';
import NewDM from './components/new-dm';
import ProfileInfo from './components/profile-info';
import { apiClient } from '@/lib/api-client';
import { GET_DM_CONTACTS, GET_USER_CHANNELS } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
    addDirectMessagesContacts,
    selectChannels,
    selectDirectMessagesContacts,
    updateChannel,
    updateDirectMessagesContacts,
} from '@/store/slices';
import ContactsList from '@/components/contacts-list';
import CreateChannel from '../create-channel';
import CreateChatBot from '../create-chatbot';
import ChatBotList from '@/components/chatbots-list';
import { useSocket } from '@/context/SocketContext';

const ContactsContainer = () => {
    const dispatch = useDispatch();
    const socket = useSocket();
    const directMessagesContacts = useSelector(selectDirectMessagesContacts);
    const channels = useSelector(selectChannels);

    useEffect(() => {
        const getContacts = async () => {
            const res = await apiClient.get(GET_DM_CONTACTS, {
                withCredentials: true,
            });

            if (res.data.data) {
                dispatch(updateDirectMessagesContacts(res.data.data));
            }
        };

        const getChannels = async () => {
            const res = await apiClient.get(GET_USER_CHANNELS, {
                withCredentials: true,
            });

            if (res.data.channels) {
                dispatch(updateChannel(res.data.channels));
            }
        };

        getChannels();
        getContacts();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleChannelRenamed = (contact) => {
            dispatch(dispatch(addDirectMessagesContacts(contact)));
        };

        socket.on('addDirectContact', handleChannelRenamed);

        return () => {
            socket.off('addDirectContact', handleChannelRenamed);
        };
    }, [socket, dispatch]);

    return (
        <div className="realtive max-h-[100vh] md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] flex flex-col">
            <div className="pt-3">
                <Logo />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-500 scrollbar-track-transparent">
                <div className="my-5">
                    <div className="flex items-center justify-between pr-10">
                        <Title text="Chat AI" />
                        <CreateChatBot />
                    </div>
                    <div className="scrollbar-hidden">
                        <ChatBotList />
                    </div>
                </div>
                <div className="my-5">
                    <div className="flex items-center justify-between pr-10">
                        <Title text="Direct Messages" />
                        <NewDM />
                    </div>
                    <div className="scrollbar-hidden">
                        <ContactsList contacts={directMessagesContacts} />
                    </div>
                </div>
                <div className="my-5">
                    <div className="flex items-center justify-between pr-10">
                        <Title text={'Channels'} />
                        <CreateChannel />
                    </div>
                    <div className="scrollbar-hidden">
                        <ContactsList isChannel={true} contacts={channels} />
                    </div>
                </div>
            </div>
            <ProfileInfo />
        </div>
    );
};

export default ContactsContainer;

const Logo = () => {
    return (
        <div className="flex p-5 justify-start bg-transparent items-center gap-2">
            <img className="w-full h-full bg-transparent" alt="logo" src="./public/logo2.jpg" />
        </div>
    );
};

const Title = ({ text }) => {
    return <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-medium text-opacity-90 text-sm">{text}</h6>;
};
