import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { Input } from '@/components/ui/input';
import { FaPlus } from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useState } from 'react';
import Lottie from 'react-lottie';
import { useDispatch } from 'react-redux';
import { animationDefaultOptions, getColor } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { updateChatData, updateChatType } from '@/store/slices';
import { SEARCH_CONTACTS } from '@/utils/constants';

const NewDM = () => {
    const dispatch = useDispatch();

    const [isFeatching, setIsFeatching] = useState(false);
    const [openContactModal, setOpenContactModal] = useState(false);
    const [textSearchContacts, setTextSearchContacts] = useState('');
    const [searchContactsResult, setSearchContactsResult] = useState([]);

    const handleSearchContact = async (searchTerm) => {
        setTextSearchContacts(searchTerm);
        setSearchContactsResult([]);
        try {
            if (searchTerm.length > 0) {
                setIsFeatching(true);
                const res = await apiClient.post(SEARCH_CONTACTS, { searchTerm }, { withCredentials: true });

                if (res.status === 200) {
                    setSearchContactsResult(res.data.contacts);
                    setIsFeatching(false);
                }
            }
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleSelectContact = (contact) => {
        setOpenContactModal(false);
        dispatch(updateChatType('contact'));
        dispatch(updateChatData(contact));
    };

    return (
        <div>
            <Dialog open={openContactModal} onOpenChange={setOpenContactModal}>
                <DialogContent className="bg-[#181920] border-none md-2 p-3 text-white w-[400px] h-[400px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please select a contact</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            className="rounded-lg bg-[#2c2e3d] p-6 "
                            placeholder="Search contacts"
                            value={textSearchContacts}
                            onChange={(e) => handleSearchContact(e.target.value)}
                        />
                    </div>
                    {searchContactsResult.length > 0 && (
                        <ScrollArea className="h-[250px]">
                            <div className="flex flex-col gap-5">
                                {searchContactsResult.map((contact) => {
                                    return (
                                        <div
                                            key={contact.id}
                                            className="flex gap-3 items-center cursor-pointer hover:border-white"
                                            onClick={() => handleSelectContact(contact)}
                                        >
                                            <div className="h-12 w-12 relative rounded-full overflow-hidden">
                                                <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                                    {contact?.image ? (
                                                        <AvatarImage
                                                            src={contact.image}
                                                            alt="avatar"
                                                            className="object-cover w-full h-full bg-transparent"
                                                        />
                                                    ) : (
                                                        <div
                                                            className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full 
                                                            ${getColor(contact.color)}`}
                                                        >
                                                            {contact?.firstName
                                                                ? contact.firstName.split('').shift()
                                                                : contact.email.split('').shift()}
                                                        </div>
                                                    )}
                                                </Avatar>
                                            </div>
                                            <div className="flex flex-col">
                                                <span>
                                                    {contact.firstName && contact.lastName
                                                        ? `${contact.firstName} ${contact.lastName}`
                                                        : `${contact.email}`}
                                                </span>
                                                <span className="text-xs">{contact.email}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                    {textSearchContacts.length <= 0 && (
                        <div className="flex flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center duration-100 transition-all">
                            <Lottie
                                height={100}
                                width={100}
                                isClickToPauseDisabled={true}
                                options={animationDefaultOptions}
                            />
                            <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-2xl text-xl transition-all duration-300 text-center">
                                <h3 className="poppins-medium">
                                    Hi<span className="text-purple-500">!</span> Search new{' '}
                                    <span className="text-purple-500">Contact.</span>
                                </h3>
                            </div>
                        </div>
                    )}
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
                            onClick={() => setOpenContactModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
                        <p>Select New Contact</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default NewDM;
