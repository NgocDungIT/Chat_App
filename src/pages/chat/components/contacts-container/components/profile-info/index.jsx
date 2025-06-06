import { getColor } from '@/lib/utils';
import { selectUserData, updateUserData } from '@/store/slices';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FiEdit2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { IoPowerSharp } from 'react-icons/io5';
import { apiClient } from '@/lib/api-client';
import { LOGOUT_ROUTE } from '@/utils/constants';

const ProfileInfo = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUserData);

    const handleLogout = async () => {
        try {
            const res = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });

            if (res.status === 200) {
                dispatch(updateUserData({}));
                navigate('/login');
            }
        } catch (e) {
            console.error('Error: ', e.message);
        }
    };

    return (
        <div className="relative mt-auto h-16 flex items-center justify-between px-10 w-full bg-[#2a2b33]">
            <div className="flex gap-3 items-center justify-center">
                <div className="h-12 w-12 relative rounded-full">
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {user?.image ? (
                            <AvatarImage
                                src={user.image}
                                alt="avatar"
                                className="object-cover w-full h-full bg-transparent rounded-full"
                            />
                        ) : (
                            <div
                                className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full 
                                                            ${getColor(user.color)}`}
                            >
                                {user?.firstName ? user.firstName.split('').shift() : user.email.split('').shift()}
                            </div>
                        )}
                    </Avatar>
                </div>
                <div className="text-xs">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ''}</div>
            </div>
            <div className="flex gap-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <FiEdit2 className="text-[#357fac] text-xl font-medium" onClick={() => navigate('/profile')} />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#585858] border-none text-white">
                            <p>Edit Profile</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <IoPowerSharp className="text-red-500 text-xl font-medium" onClick={handleLogout} />
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#585858] border-none text-white">
                            <p>Logout</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

export default ProfileInfo;
