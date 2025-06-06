import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { IoArrowBack } from 'react-icons/io5';
import { FaTrash } from 'react-icons/fa';
import { FiUpload } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { RiLoaderLine } from 'react-icons/ri';
import { DELETE_IMAGE, UPDATE_USER, UPLOAD_IMAGE } from '@/utils/constants';
import { selectUserData, updateUserData } from '@/store/slices';
import { colors, getColor } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUserData);
    const [hovered, setHovered] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const fileInputRef = useRef();

    const handleChangeFirstName = useCallback(
        (e) => {
            dispatch(updateUserData({ ...user, firstName: e.target.value }));
        },
        [dispatch, user]
    );

    const handleChangeLastName = useCallback(
        (e) => {
            dispatch(updateUserData({ ...user, lastName: e.target.value }));
        },
        [dispatch, user]
    );

    const handleOpenFileInput = () => {
        fileInputRef.current.click();
    };

    const handleChangeImage = async (event) => {
        const formData = new FormData();
        const file = event.target.files[0];

        if (file) {
            setLoadingImage(true);
            formData.append('image', file);
            await apiClient
                .post(UPLOAD_IMAGE, formData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then((response) => {
                    setLoadingImage(false);
                    dispatch(updateUserData({ ...user, image: response.data.url }));
                    toast('Upload avatar successfully');
                })
                .catch(() => {
                    setLoadingImage(false);
                    toast('Failed to load avatar. Please try again');
                });
        }
    };

    const handleDeleteImage = async () => {
        const idImage = user?.image.split('/').pop().split('.')[0];
        if (idImage) {
            setLoadingImage(true);
            await apiClient
                .post(DELETE_IMAGE, { idImage }, { withCredentials: true })
                .then((response) => {
                    setLoadingImage(false);
                    dispatch(updateUserData({ ...user, image: response.data.url }));
                    toast('Delete avatar successfully');
                })
                .catch(() => {
                    setLoadingImage(false);
                    toast('Failed to delete avatar. Please try again');
                });
        }
    };

    const handleBack = () => {
        if (user.profileSetup) {
            navigate('/chat');
        } else {
            toast('Please setup profile');
        }
    };

    const validateValue = () => {
        if (!user.firstName) {
            toast('Fist name is required!');
            return false;
        }

        if (!user.lastName) {
            toast('Last name is required!');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (validateValue()) {
            setLoadingSave(true);
            await apiClient
                .post(UPDATE_USER, { ...user, profileSetup: true }, { withCredentials: true })
                .then((response) => {
                    setLoadingSave(false);
                    dispatch(updateUserData(response.data.user));
                    toast('Updated user successfully');
                    navigate('/chat');
                })
                .catch(() => {
                    setLoadingSave(false);
                    toast('There was an error updating information. Please try again');
                });
        }
    };

    return (
        <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
            <div className="flex flex-col gap-10 w-[80vw] md:w-max">
                <div onClick={handleBack}>
                    <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer" />
                </div>
                <div className="grid grid-cols-2">
                    <div
                        className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center"
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
                            {user?.image ? (
                                <AvatarImage
                                    src={user.image}
                                    alt="avatar"
                                    className="object-cover w-full h-full bg-transparent rounded-full"
                                />
                            ) : (
                                <div
                                    className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full 
                                        ${getColor(user.color)}`}
                                >
                                    {user?.firstName ? user.firstName.split('').shift() : user.email.split('').shift()}
                                </div>
                            )}
                            {hovered && !loadingImage && (
                                <div
                                    onClick={user.image ? handleDeleteImage : handleOpenFileInput}
                                    className="h-32 w-32 md:w-48 md:h-48 absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full"
                                >
                                    {user?.image ? (
                                        <FaTrash className="text-white text-3xl cursor-pointer" />
                                    ) : (
                                        <FiUpload className="text-white text-3xl cursor-pointer" />
                                    )}
                                </div>
                            )}
                            {loadingImage && (
                                <div className="h-32 w-32 md:w-48 md:h-48 absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full">
                                    <AiOutlineLoading3Quarters className="text-white text-3xl cursor-pointer animate-spin" />
                                </div>
                            )}
                            <input
                                name="image"
                                ref={fileInputRef}
                                className="hidden"
                                type="file"
                                onChange={handleChangeImage}
                            />
                        </Avatar>
                    </div>
                    <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
                        <div className="w-full">
                            <Input
                                type="email"
                                placeholder="First Name"
                                defaultValue={user.email}
                                readOnly
                                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            />
                        </div>
                        <div className="w-full">
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={user.firstName}
                                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                                onChange={handleChangeFirstName}
                            />
                        </div>
                        <div className="w-full">
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={user.lastName}
                                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                                onChange={handleChangeLastName}
                            />
                        </div>
                        <div className="w-full flex gap-5">
                            {colors.map((color, index) => {
                                return (
                                    <div
                                        key={color}
                                        className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                                        ${user.color === index ? 'outline outline-white/80 outline-2' : ''}`}
                                        onClick={() => dispatch(updateUserData({ ...user, color: index }))}
                                    ></div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <Button
                        className="w-full h-16 bg-purple-800 hover:bg-purple-950 transition-all duration-300"
                        onClick={handleSave}
                    >
                        {loadingSave ? (
                            <RiLoaderLine className="text-white text-3xl cursor-pointer animate-spin" />
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
