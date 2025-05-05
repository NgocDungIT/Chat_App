import { getColor } from '@/lib/utils';
import { closeChat, selectChatData, selectChatType } from '@/store/slices';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { RiCloseFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';

const ChatHeader = () => {
    const dispatch = useDispatch();
    const chatData = useSelector(selectChatData);
    const chatType = useSelector(selectChatType);

    const handleCloseChat = () => {
        dispatch(closeChat());
    };

    return (
        <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
            <div className="flex gap-5 w-full justify-between">
                <div className="flex gap3 items-center justify-center">
                    <div className="h-12 w-12 relative rounded-full overflow-hidden">
                        <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                            {chatData?.image ? (
                                <AvatarImage
                                    src={chatData.image}
                                    alt="avatar"
                                    className="object-cover w-full h-full bg-transparent"
                                />
                            ) : (
                                <>
                                    {chatType === 'contact' ? (
                                        <div
                                            className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full 
                                                            ${getColor(chatData.color)}`}
                                        >
                                            {chatData?.firstName
                                                ? chatData.firstName.split('').shift()
                                                : chatData.email.split('').shift()}
                                        </div>
                                    ) : (
                                        <div className="bg-[#ffffff22] h-12 w-12 flex rounded-full items-center justify-center">
                                            #
                                        </div>
                                    )}
                                </>
                            )}
                        </Avatar>
                    </div>
                    <div className="ml-2">
                        {chatType === 'channel' && (
                            <div className="flex flex-col ml-1">
                                <span>{chatData.name}</span>
                            </div>
                        )}
                        {chatType === 'contact' && (
                            <div className="flex flex-col ml-1">
                                <span>
                                    {chatData.firstName && chatData.lastName
                                        ? `${chatData.firstName} ${chatData.lastName}`
                                        : `${chatData.email}`}
                                </span>
                                <span className="text-xs">{chatData.email}</span>
                            </div>
                        )}
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
    );
};

export default ChatHeader;
