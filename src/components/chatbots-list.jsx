import { apiClient } from '@/lib/api-client';
import {
    closeChat,
    deleteDataChatBot,
    selectDataChatBot,
    selectDataChatBotSelected,
    setDataChatBot,
    setDataChatBotSelected,
} from '@/store/slices';
import { DELETE_SESSION, GET_ALL_SESSIONS } from '@/utils/constants';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { CiMenuKebab } from 'react-icons/ci';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner';

const ChatBotList = () => {
    const dispatch = useDispatch();
    const dataChatBot = useSelector(selectDataChatBot);
    const dataChatBotSelected = useSelector(selectDataChatBotSelected);

    const handleSelected = (item) => {
        dispatch(closeChat());
        dispatch(setDataChatBotSelected(item));
    };

    const handleDeleteSession = async (id) => {
        if (!id) {
            toast('Vui lòng thử lại.');
        }
        const res = await apiClient.post(
            DELETE_SESSION,
            {
                sessionId: id,
            },
            {
                withCredentials: true,
            }
        );

        if (res.status === 200) {
            dispatch(deleteDataChatBot(id));
        }
    };

    useEffect(() => {
        const getSessions = async () => {
            const res = await apiClient.get(GET_ALL_SESSIONS, {
                withCredentials: true,
            });

            if (res?.data?.data) {
                dispatch(setDataChatBot(res.data.data));
            }
        };

        getSessions();
    }, [dispatch]);

    return (
        <div className="mt-5">
            {dataChatBot?.map((item) => {
                return (
                    <div
                        key={item._id}
                        className={`pl-10 pr-3 py-2 transition-all duration-300 cursor-pointer
                        ${dataChatBotSelected?._id === item._id ? 'bg-[#357fac] hover:bg-[#357fac]' : 'hover:bg-[#585858]'}
                        `}
                        onClick={() => handleSelected(item)}
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className="w-full">
                                    <div className="flex gap-2 justify-between items-center">
                                        <div className="flex flex-1 overflow-hidden gap-5 items-center justify-start text-neutral-300">
                                            <div className="bg-[#ffffff22] h-10 w-10 min-h-10 min-w-10 flex rounded-full items-center justify-center">
                                                #
                                            </div>
                                            <span className="truncate overflow-hidden whitespace-nowrap text-ellipsis mr-4">
                                                {item.title.split(' ').length >= 4
                                                    ? `${item.title.split(' ').slice(0, 4).join(' ')} ...`
                                                    : item.title}
                                            </span>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <CiMenuKebab className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-[#585858] border-none mb-2 p-3 text-white">
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteSession(item._id)}
                                                    className="text-red-400"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#585858] border-none mb-2 p-3 text-white">
                                    <p>{item.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatBotList;
