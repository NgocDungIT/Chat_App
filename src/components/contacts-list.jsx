import { useDispatch, useSelector } from 'react-redux';
import { selectChatData, setDataChatBotSelected, updateChatData, updateChatMessage, updateChatType } from '@/store/slices';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { getColor } from '@/lib/utils';

const ContactsList = ({ isChannel = false, contacts }) => {
    const dispatch = useDispatch();
    const chatData = useSelector(selectChatData);

    const handleClick = (contact) => {
        dispatch(setDataChatBotSelected(null));
        if (isChannel) dispatch(updateChatType('channel'));
        else dispatch(updateChatType('contact'));

        dispatch(updateChatData(contact));

        if (chatData && chatData._id !== contact._id) {
            dispatch(updateChatMessage([]));
        }
    };

    return (
        <>
            {contacts.length > 0 && (
                <div className="mt-5">
                    {contacts.map((contact) => {
                        return (
                            <div
                                key={contact._id}
                                className={`pl-10 py-2 transition-all duration-300 cursor-pointer
                                        ${
                                            chatData && chatData._id === contact._id
                                                ? 'bg-[#357fac] hover:bg-[#357fac]'
                                                : 'hover:bg-[#585858]'
                                        }`}
                                onClick={() => handleClick(contact)}
                            >
                                <div className="flex gap-5 items-center justify-start text-neutral-300">
                                    {!isChannel ? (
                                        <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                            {contact?.image ? (
                                                <AvatarImage
                                                    src={contact.image}
                                                    alt="avatar"
                                                    className="object-cover w-full h-full bg-transparent"
                                                />
                                            ) : (
                                                <div
                                                    className={`uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full 
                                                            ${
                                                                chatData && chatData._id === contact._id
                                                                    ? 'bg-[#ffffff22] border border-white/70'
                                                                    : getColor(contact.color)
                                                            }`}
                                                >
                                                    {contact?.firstName
                                                        ? contact.firstName.split('').shift()
                                                        : contact.email.split('').shift()}
                                                </div>
                                            )}
                                        </Avatar>
                                    ) : (
                                        <div className="flex gap-2 justify-between items-center w-full mr-3">
                                            <div className="flex flex-1 overflow-hidden gap-5 items-center justify-start text-neutral-300">
                                                <div className="bg-[#ffffff22] h-10 w-10 flex rounded-full items-center justify-center">
                                                    #
                                                </div>
                                                <span>{contact.name}</span>
                                            </div>
                                        </div>
                                    )}
                                    {!isChannel && <span>{`${contact.firstName} ${contact.lastName}`}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default ContactsList;
