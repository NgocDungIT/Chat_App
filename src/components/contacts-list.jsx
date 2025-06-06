import { useDispatch, useSelector } from 'react-redux';
import {
    selectChatData,
    selectOnlineUsers,
    selectUserData,
    setDataChatBotSelected,
    updateChatData,
    updateChatMessage,
    updateChatType,
} from '@/store/slices';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { getColor } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { CiMenuKebab } from 'react-icons/ci';
import { useSocket } from '@/context/SocketContext';

const ContactsList = ({ isChannel = false, contacts }) => {
    const socket = useSocket();
    const dispatch = useDispatch();
    const chatData = useSelector(selectChatData);
    const onlineUsers = useSelector(selectOnlineUsers);
    const user = useSelector(selectUserData);

    const handleClick = (contact) => {
        dispatch(setDataChatBotSelected(null));
        if (isChannel) dispatch(updateChatType('channel'));
        else dispatch(updateChatType('contact'));

        dispatch(updateChatData(contact));

        if (chatData && chatData._id !== contact._id) {
            dispatch(updateChatMessage([]));
        }
    };

    const handleBlockUser = (id) => {
        socket.emit('blockUser', {
            idBlock: id,
            userId: user.id,
        });
    };

    return (
        <>
            {contacts.length > 0 && (
                <div className="mt-5">
                    {contacts.map((contact) => {
                        const isOnline = onlineUsers?.includes(contact?._id) || false;
                        return (
                            <div
                                key={contact._id}
                                className={`pl-10 py-2 transition-all duration-300 cursor-pointer flex items-center justify-between
                                        ${
                                            chatData && chatData._id === contact._id
                                                ? 'bg-[#357fac] hover:bg-[#357fac]'
                                                : 'hover:bg-[#585858]'
                                        }`}
                                onClick={() => handleClick(contact)}
                            >
                                <div className="flex gap-5 items-center justify-start text-neutral-300">
                                    {!isChannel ? (
                                        <Avatar className="h-10 w-10 rounded-full relative">
                                            {contact?.image ? (
                                                <AvatarImage
                                                    src={contact.image}
                                                    alt="avatar"
                                                    className="object-cover w-full h-full bg-transparent rounded-full rounded-full"
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
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 rounded-full w-3 h-3 bg-[#3FBB46]"></span>
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
                                {/* {!isChannel && (
                                    <div className="mr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <CiMenuKebab className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-[#585858] border-none mb-2 p-3 text-white">
                                                <DropdownMenuItem
                                                    onClick={() => handleBlockUser(contact._id)}
                                                    className="text-red-400"
                                                >
                                                    Block
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )} */}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default ContactsList;
