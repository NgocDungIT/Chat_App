import { useEffect } from 'react';
import NewDM from './components/new-dm';
import ProfileInfo from './components/profile-info';
import { apiClient } from '@/lib/api-client';
import { GET_DM_CONTACTS, GET_USER_CHANNELS } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { selectChannels, selectDirectMessagesContacts, updateChannel, updateDirectMessagesContacts } from '@/store/slices';
import ContactsList from '@/components/contacts-list';
import CreateChannel from '../create-channel';

const ContactsContainer = () => {
    const dispatch = useDispatch();
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
    }, [dispatch]);

    return (
        <div className="realtive md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] flex flex-col">
            <div className="pt-3">
                <Logo />
            </div>
            <div className="my-5">
                <div className="flex items-center justify-between pr-10">
                    <Title text="Direct Messages" />
                    <NewDM />
                </div>
                <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
                    <ContactsList contacts={directMessagesContacts} />
                </div>
            </div>
            <div className="my-5">
                <div className="flex items-center justify-between pr-10">
                    <Title text={'Channels'} />
                    <CreateChannel />
                </div>
                <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
                    <ContactsList isChannel={true} contacts={channels} />
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
    return <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">{text}</h6>;
};
