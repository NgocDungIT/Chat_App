import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FaPlus } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { GET_ALL_CONTACTS, CREATE_CHANNEL } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import MultipleSelector from '@/components/ui/multipleselect';
import { toast } from 'sonner';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { addChannel } from '@/store/slices';

const CreateChannel = () => {
    const dispatch = useDispatch();
    const [isFeatching, setIsFeatching] = useState(false);
    const [openChannelModal, setOpenChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState('');

    const handleCreateChannel = async () => {
        try {
            if (!channelName) {
                toast('Vui lòng nhập tên channel.');
                return;
            }

            if (selectedContacts.length <= 0) {
                toast('Vui lòng chọn các thành viên.');
                return;
            }
            setIsFeatching(true);
            const res = await apiClient.post(
                CREATE_CHANNEL,
                {
                    name: channelName,
                    members: selectedContacts?.map((contact) => contact.value),
                },
                {
                    withCredentials: true,
                }
            );

            if (res.status === 201) {
                dispatch(addChannel(res.data.channel));
                setChannelName('');
                setSelectedContacts([]);
                setIsFeatching(false);
                setTimeout(() => setOpenChannelModal(false), 300);
            }
        } catch (err) {
            setIsFeatching(false);
            toast(err?.message);
            console.log('Error: ', err);
        }
    };

    useEffect(() => {
        const getData = async () => {
            setIsFeatching(true);
            const res = await apiClient.get(GET_ALL_CONTACTS, {
                withCredentials: true,
            });
            if (res?.data) {
                setIsFeatching(false);
                setAllContacts(res.data.contacts);
            }
        };
        getData();
    }, []);

    return (
        <div>
            <Dialog open={openChannelModal} onOpenChange={setOpenChannelModal}>
                <DialogContent className="bg-[#181920] border-none md-2 p-3 text-white w-[400px] h-[400px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please fill up the details for channel.</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            className="rounded-lg bg-[#2c2e3d] p-6 "
                            placeholder="New Channel Name"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                        />
                    </div>
                    <div>
                        <MultipleSelector
                            className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                            defaultOptions={allContacts}
                            placeholder="Search Contacts"
                            value={selectedContacts}
                            onChange={setSelectedContacts}
                            emptyIndicator={
                                <p className="text-center text-lg leading-10 text-gray-600">No results found.</p>
                            }
                        />
                    </div>

                    <div className="mt-auto">
                        <Button
                            className="w-full bg-[#357fac] hover:bg-[#125b81] transition-all duration-300"
                            onClick={handleCreateChannel}
                        >
                            Create Channel
                        </Button>
                    </div>
                    {isFeatching && (
                        <div className="flex items-center justify-center w-full h-full">
                            <AiOutlineLoading3Quarters className="text-3xl flex items-center justify-center animate-spin" />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus
                            className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
                            onClick={() => setOpenChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
                        <p>Create new channel</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default CreateChannel;
