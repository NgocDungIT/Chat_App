import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import MultipleSelector from '@/components/ui/multipleselect';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/api-client';
import { getColor } from '@/lib/utils';
import {
    addChannel,
    closeChat,
    leaveChannel,
    selectChatData,
    selectChatType,
    selectUserData,
    updateChannelName,
    updateChatData,
} from '@/store/slices';
import { ADD_MEMBERS_CHANNEL, GET_ALL_CONTACTS, LEAVE_CHANNEL } from '@/utils/constants';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { useEffect, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { RiCloseFill, RiInformation2Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const ChatHeader = () => {
    const dispatch = useDispatch();
    const socket = useSocket();
    const chatData = useSelector(selectChatData);
    const chatType = useSelector(selectChatType);
    const user = useSelector(selectUserData);

    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);

    const [openModalRename, setOpenModalRename] = useState(false);
    const [openModalAddMember, setOpenModalAddMember] = useState(false);
    const [openSheet, setOpenSheet] = useState(false);
    const [newNameChannel, setNewNameChannel] = useState(chatData?.name || '');

    const handleCloseChat = () => {
        dispatch(closeChat());
    };

    const submitRename = async () => {
        if (!newNameChannel.trim()) return;
        if (!chatData?._id.trim()) return;

        try {
            socket.emit('renameChannel', {
                channelId: chatData._id,
                newTitle: newNameChannel,
            });

            setOpenModalRename(false);
        } catch (error) {
            toast('Failed to rename channel');
            console.error(error);
        }
    };

    const submitAddMember = async () => {
        if (!selectedContacts.length) return;

        try {
            const res = await apiClient.post(
                ADD_MEMBERS_CHANNEL,
                {
                    channelId: chatData._id,
                    members: selectedContacts?.map((contact) => contact.value),
                },
                { withCredentials: true }
            );

            if (res.status === 200 && res?.data) {
                if (res.data?.channel) {
                    toast(res.data?.message);
                    socket.emit('createChannel', {
                        channel: res.data.channel,
                    });
                    setSelectedContacts([]);
                    dispatch(addChannel(res.data.channel));
                    dispatch(updateChatData(res.data.channel));
                }
                setOpenModalAddMember(false);
            }
        } catch (error) {
            toast('Failed to add members channel');
            console.error(error);
        }
    };

    const handleLeaveChannel = async () => {
        if (!chatData?._id.trim()) return;

        try {
            const res = await apiClient.post(
                LEAVE_CHANNEL,
                {
                    channelId: chatData._id,
                },
                { withCredentials: true }
            );

            if (res.status === 200 && res?.data) {
                toast(res?.data?.message);
                dispatch(
                    leaveChannel({
                        channelId: chatData._id,
                    })
                );
                setOpenSheet(false);
                dispatch(closeChat());
            }
        } catch (error) {
            toast('Failed to rename channel');
            console.error(error);
        }
    };

    const handleDeleteChannel = async () => {
        if (!chatData?._id.trim()) return;

        try {
            socket.emit('deleteChannel', {
                channelId: chatData._id,
            });

            setOpenSheet(false);
            dispatch(
                leaveChannel({
                    channelId: chatData._id,
                })
            );
            dispatch(closeChat());
        } catch (error) {
            toast('Failed to delete channel');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleChannelRenamed = (data) => {
            dispatch(
                updateChannelName({
                    channelId: data.channelId,
                    newTitle: data.title,
                })
            );
        };

        const handleChannelDeleted = (data) => {
            dispatch(
                leaveChannel({
                    channelId: data,
                })
            );
            if (chatData._id === data) {
                dispatch(closeChat());
            }
        };

        socket.on('channelRenamed', handleChannelRenamed);
        socket.on('channelDeleted', handleChannelDeleted);

        return () => {
            socket.off('channelRenamed', handleChannelRenamed);
            socket.off('channelDeleted', handleChannelDeleted);
        };
    }, [socket, dispatch]);

    useEffect(() => {
        const getData = async () => {
            const res = await apiClient.get(GET_ALL_CONTACTS, {
                withCredentials: true,
            });
            if (res?.data) {
                setAllContacts(res.data.contacts);
            }
        };
        getData();
    }, []);

    return (
        <>
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

                        {chatType === 'channel' && (
                            <button
                                className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                                onClick={() => setOpenSheet(true)}
                            >
                                <RiInformation2Fill className="text-3xl" />
                            </button>
                        )}
                        {chatType === 'channel' && (
                            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                                <SheetContent className="bg-[#1c1d25] border-[#2f303b]">
                                    <div className="w-full flex flex-col justify-center items-center">
                                        <div className="bg-[#ffffff22] h-[100px] w-[100px] flex rounded-full items-center justify-center">
                                            #
                                        </div>
                                        <div className="flex items-center justify-center gap-2 pb-4">
                                            <p className="text-white font-medium text-2xl mt-2">{chatData.name}</p>
                                            {user.id === chatData?.admin._id && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <FiEdit2
                                                                className="text-[#357fac] text-2xl font-medium cursor-pointer"
                                                                onClick={() => setOpenModalRename(true)}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-[#585858] border-none mb-2 p-3 text-white">
                                                            <p>Rename channel</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <div className="w-full border-t-2 border-[#2f303b]">
                                            <p className="pt-2 text-wrap text-white">{`Members (${
                                                chatData.members.length + 1
                                            })`}</p>
                                            <div className="w-full mt-2 flex flex-col gap-3" key={chatData?._id}>
                                                <div className="flex gap-3 items-center justify-start w-full">
                                                    <div className="h-8 w-8 relative rounded-full overflow-hidden">
                                                        <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                                                            {chatData.admin?.image ? (
                                                                <AvatarImage
                                                                    src={chatData.admin.image}
                                                                    alt="avatar"
                                                                    className="object-cover overflow-hidden rounded-full w-full h-full bg-transparent"
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`uppercase h-8 w-8 text-lg border-[1px] flex items-center justify-center rounded-full 
                                                                ${getColor(chatData.admin.color)}`}
                                                                >
                                                                    {chatData.admin?.firstName
                                                                        ? chatData.admin.firstName?.split('').shift()
                                                                        : chatData.admin.email?.split('').shift()}
                                                                </div>
                                                            )}
                                                        </Avatar>
                                                    </div>
                                                    <div className="text-xs text-white">
                                                        {chatData.admin.firstName && chatData.admin.lastName
                                                            ? `${chatData.admin.firstName} ${chatData.admin.lastName}`
                                                            : `${chatData.admin.email}`}
                                                        <span className="ml-2 font-bold text-sm text-[#357fac]">
                                                            (Admin)
                                                        </span>
                                                    </div>
                                                </div>
                                                {chatData?.members?.map((member) => (
                                                    <div
                                                        key={member._id}
                                                        className="flex gap-3 items-center justify-start w-full"
                                                    >
                                                        <div className="h-8 w-8 relative rounded-full">
                                                            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
                                                                {member?.image ? (
                                                                    <AvatarImage
                                                                        src={member.image}
                                                                        alt="avatar"
                                                                        className="object-cover w-full h-full bg-transparent"
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className={`uppercase h-8 w-8 text-lg border-[1px] flex items-center justify-center rounded-full 
                                                            ${getColor(member.color)}`}
                                                                    >
                                                                        {member?.firstName
                                                                            ? member.firstName?.split('').shift()
                                                                            : member.email?.split('').shift()}
                                                                    </div>
                                                                )}
                                                            </Avatar>
                                                        </div>
                                                        <div className="text-xs text-white">
                                                            {member.firstName && member.lastName
                                                                ? `${member.firstName} ${member.lastName}`
                                                                : `${member.email}`}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="w-full border-t-2 border-[#2f303b] flex flex-col gap-2 pt-2 mt-4">
                                            {user.id === chatData?.admin._id ? (
                                                <>
                                                    <Button
                                                        className="w-full bg-green-400 rounded-md flex items-center justify-center p-5 hover:bg-green-600 focus:bg-green-600 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                                                        onClick={() => setOpenModalAddMember(true)}
                                                    >
                                                        Add member
                                                    </Button>
                                                    <Button
                                                        className="w-full bg-red-500 rounded-md flex items-center justify-center p-5 hover:bg-red-600 focus:bg-red-600 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                                                        onClick={() => handleDeleteChannel()}
                                                    >
                                                        Delete channel
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    className="w-full bg-red-500 rounded-md flex items-center justify-center p-5 hover:bg-red-600 focus:bg-red-600 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                                                    onClick={() => handleLeaveChannel()}
                                                >
                                                    Leave channel
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}
                    </div>
                </div>
            </div>
            <div>
                <Dialog open={openModalRename} onOpenChange={setOpenModalRename}>
                    <DialogContent className="bg-[#1c1d25] border-[#2f303b]">
                        <DialogHeader>
                            <DialogTitle className="text-white font-medium text-2xl">Change name channel</DialogTitle>
                            <DialogDescription>
                                <div className="mt-4">
                                    <Input
                                        className="rounded-lg bg-[#2c2e3d] p-6 text-white"
                                        placeholder="New name channel"
                                        value={newNameChannel}
                                        onChange={(e) => setNewNameChannel(e.target.value)}
                                    />
                                </div>
                                <Button
                                    className="mt-2 bg-[#357fac] rounded-md flex items-center justify-center p-5 hover:bg-[#125b81] focus:bg-[#125b81] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                                    onClick={() => submitRename()}
                                >
                                    Save
                                </Button>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>

            <div>
                <Dialog open={openModalAddMember} onOpenChange={setOpenModalAddMember}>
                    <DialogContent className="bg-[#1c1d25] border-[#2f303b]">
                        <DialogHeader>
                            <DialogTitle className="text-white font-medium text-2xl">Add member</DialogTitle>
                            <DialogDescription>
                                <div className="mt-4">
                                    <MultipleSelector
                                        className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                                        defaultOptions={allContacts.filter(
                                            (item) => !chatData?.members?.some((obj) => obj._id === item.value)
                                        )}
                                        placeholder="Search Contacts"
                                        value={selectedContacts}
                                        onChange={setSelectedContacts}
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600">No results found.</p>
                                        }
                                    />
                                </div>
                                <Button
                                    className="mt-2 bg-green-400 rounded-md flex items-center justify-center p-5 hover:bg-green-600 focus:bg-green-600 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                                    onClick={() => submitAddMember()}
                                >
                                    Add member
                                </Button>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default ChatHeader;
