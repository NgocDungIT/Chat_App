import { Link, useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { CHANGE_PASSWORD, SEND_OTP, VERIFY_EMAIL } from '@/utils/constants';

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isVerifySuccess, setIsVerifySuccess] = useState(false);
    const [timeOpt, setTimeOpt] = useState(0);
    const [otp, setOtp] = useState('');

    const validateValue = () => {
        if (!password) {
            toast('Password is required!');
            return false;
        }

        if (password.trim().length < 6) {
            toast('Password must be at least 6 characters long!');
            return false;
        }

        if (!confirmPassword) {
            toast('Confirm password is required!');
            return false;
        }

        if (password.trim() !== confirmPassword.trim()) {
            toast('Passwords do not match!');
            return false;
        }

        return true;
    };

    const handleSendOTP = async () => {
        if (!email) {
            toast('Email is required!');
            return;
        }

        if (!isValidEmail(email)) {
            toast('Email is not in correct format!');
            return;
        }

        const res = await apiClient.post(SEND_OTP, { email }, { withCredentials: true });
        if (res?.status == 200 && res?.data?.success) {
            setTimeOpt(10 * 60);
            setIsConfirmed(true);
        } else {
            toast(res?.data?.message);
        }
    };

    const handleVerifyEmail = async () => {
        if (!otp) {
            toast('OTP is required!');
            return;
        }

        const res = await apiClient.post(VERIFY_EMAIL, { email, otp }, { withCredentials: true });
        if (res?.status == 200 && res?.data) {
            if (res?.data?.status) {
                setIsVerifySuccess(true);
                setTimeOpt(0);
                setIsConfirmed(false);
            } else {
                toast(res?.data?.message);
            }
        }
    };

    const handleChangePassword = async () => {
        if (validateValue()) {
            const res = await apiClient.post(CHANGE_PASSWORD, { email, otp, password }, { withCredentials: true });
            if (res?.status == 200 && res?.data) {
                if (res?.data?.success) {
                    toast('Change password successfully.');
                    setIsVerifySuccess(false);
                    setTimeOpt(0);
                    setIsConfirmed(false);
                    navigate('/login');
                } else {
                    toast(res?.data?.message);
                }
            }
        }
    };

    useEffect(() => {
        if (timeOpt <= 0) return;

        const interval = setInterval(() => {
            setTimeOpt((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval); // cleanup
    }, [timeOpt]);

    return (
        <div className="flex items-center justify-center h-screen w-full px-5 sm:px-0">
            <div className="flex bg-white rounded-lg shadow-lg border overflow-hidden max-w-sm lg:max-w-4xl w-full">
                <div
                    className="hidden md:block lg:w-1/2 bg-cover bg-blue-700"
                    style={{
                        backgroundImage: `url(https://www.tailwindtap.com//assets/components/form/userlogin/login_tailwindtap.jpg)`,
                    }}
                ></div>
                <div className="w-full p-8 lg:w-1/2">
                    <p className="text-4xl font-bold text-gray-600 text-center">Welcome!</p>
                    <p className="font-medium text-gray-600 text-center">Fill in details to retrieve password !</p>

                    {!isConfirmed && !isVerifySuccess && (
                        <>
                            <div className="mt-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={handleSendOTP}
                                    className="bg-blue-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600"
                                >
                                    Send OTP
                                </button>
                            </div>
                        </>
                    )}

                    {isConfirmed && !isVerifySuccess && (
                        <div className="mt-4 flex flex-col justify-between">
                            <div className="flex justify-between">
                                <label className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
                            </div>
                            <Input
                                type="number"
                                placeholder="Enter your OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />

                            <div className="mb-1">
                                {timeOpt > 0 ? (
                                    <p className="mt-2 text-sm text-blue-800">
                                        Resend OTP in {Math.floor(timeOpt / 60)}:{('0' + (timeOpt % 60)).slice(-2)}
                                    </p>
                                ) : (
                                    <div
                                        className="cursor-pointer w-fit mt-2 text-sm text-blue-600 hover:text-blue-700"
                                        onClick={() => handleSendOTP()}
                                    >
                                        Resend OTP
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleVerifyEmail}
                                className="bg-green-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-green-600"
                            >
                                Confirm
                            </button>
                        </div>
                    )}

                    {isVerifySuccess && (
                        <>
                            <div className="mt-4 flex flex-col justify-between">
                                <div className="flex justify-between">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Password New</label>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Password new"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="mt-4 flex flex-col justify-between">
                                <div className="flex justify-between">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleChangePassword}
                                className="bg-green-700 mt-4 text-white font-bold py-2 px-4 w-full rounded hover:bg-green-600"
                            >
                                Save
                            </button>
                        </>
                    )}

                    <div className="mt-4 flex items-center w-full text-center">
                        <a href="#" className="text-xs text-gray-500 capitalize text-center w-full">
                            Already have an account?
                            <Link to="/register" className="text-blue-700" variant="link">
                                {' '}
                                Login
                            </Link>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
