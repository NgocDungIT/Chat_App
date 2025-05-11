import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiClient } from '@/lib/api-client';
import { setDataChatBotSelected, addNewDataChatBot } from '@/store/slices';
import { CREATE_SESSION_CHAT_BOT } from '@/utils/constants';
import { FaPlus } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

const CreateChatBot = () => {
    const dispatch = useDispatch();

    const handleCreateChat = async () => {
        try {
            const res = await apiClient.post(
                CREATE_SESSION_CHAT_BOT,
                { title: 'New Chat', sessionType: 'text' },
                {
                    withCredentials: true,
                }
            );

            if (res.status === 201) {
                dispatch(addNewDataChatBot(res?.data?.sessionChat));
                dispatch(setDataChatBotSelected(res?.data?.sessionChat));
            }
        } catch (error) {
            toast(error?.message);
        }
    };

    const handleCreateImage = async () => {
        try {
            const res = await apiClient.post(
                CREATE_SESSION_CHAT_BOT,
                { title: 'Create new image', sessionType: 'image' },
                {
                    withCredentials: true,
                }
            );

            if (res.status === 201) {
                dispatch(addNewDataChatBot(res?.data?.sessionChat));
                dispatch(setDataChatBotSelected(res?.data?.sessionChat));
            }
        } catch (error) {
            toast(error?.message);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <FaPlus className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#585858] border-none mb-2 p-3 text-white">
                            <DropdownMenuLabel>New Chat AI</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleCreateChat}>AI Chat</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCreateImage}>AI Image Generator</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent className="bg-[#585858] border-none mb-2 p-3 text-white">
                    <p>New Chat</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default CreateChatBot;
