import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { SIGNUP_ROUTE, VERIFY_OTP } from '@/utils/constants';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [timeOpt, setTimeOpt] = useState(0);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateValue = () => {
        if (!email) {
            toast('Email is required!');
            return false;
        }

        if (!isValidEmail(email)) {
            toast('Email is not in correct format!');
            return;
        }

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

    const handleSign = async () => {
        if (validateValue()) {
            setIsLoading(true);
            const res = await apiClient.post(SIGNUP_ROUTE, { email, password }, { withCredentials: true });
            if (res?.status == 200 && res?.data?.success) {
                setTimeOpt(10 * 60); // Set time for OTP to 10 minutes
                setIsConfirmed(true);
            }
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast('OTP is required!');
            return;
        }

        setIsLoading(true);
        const res = await apiClient.post(`${VERIFY_OTP}`, { email, password, otp }, { withCredentials: true });
        if (res?.status == 201 && res?.data?.data) {
            toast('Register successfully.');
            navigate('/login');
        } else {
            toast(res?.data?.message || 'Failed to verify OTP.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (timeOpt <= 0) return;

        const interval = setInterval(() => {
            setTimeOpt((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval); // cleanup
    }, [timeOpt]);

    return (
        <div className="h-[100vh] items-center flex justify-center px-5 lg:px-0">
            <div className="max-w-screen-xl bg-white border shadow sm:rounded-lg flex justify-center flex-1">
                <div className="flex-1 bg-blue-900 text-center hidden md:flex">
                    <div
                        className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(https://www.tailwindtap.com/assets/common/marketing.svg)`,
                        }}
                    ></div>
                </div>
                <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
                    <div className=" flex flex-col items-center">
                        <div className="text-center">
                            <h1 className="text-2xl xl:text-4xl font-extrabold text-blue-900">Sign up</h1>
                        </div>
                        <div className="w-full flex-1 mt-8">
                            {!isConfirmed ? (
                                <div className="mx-auto max-w-xs flex flex-col gap-4">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => !isLoading && setEmail(e.target.value)}
                                    />

                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => !isLoading && setPassword(e.target.value)}
                                    />

                                    <Input
                                        type="password"
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => !isLoading && setConfirmPassword(e.target.value)}
                                    />

                                    <button
                                        onClick={!isLoading && handleSign}
                                        className="mt-2 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                                    >
                                        {isLoading ? (
                                            <AiOutlineLoading3Quarters className="text-white text-2xl cursor-pointer animate-spin m-auto" />
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-6 h-6 -ml-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                    <circle cx="8.5" cy="7" r="4" />
                                                    <path d="M20 8v6M23 11h-6" />
                                                </svg>
                                                <span className="ml-3">Sign Up</span>
                                            </>
                                        )}
                                    </button>
                                    <p className="mt-6 text-xs text-gray-600 text-center">
                                        Already have an account?{' '}
                                        <Link to="/login" className="text-blue-900 font-semibold" variant="link">
                                            Login
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <div className="mx-auto min-h-56 max-w-xs flex flex-col gap-4">
                                    <Input
                                        type="number"
                                        placeholder="Enter your OTP"
                                        value={otp}
                                        onChange={(e) => !isLoading && setOtp(e.target.value)}
                                    />

                                    <div className="mt-[-12px]">
                                        {timeOpt > 0 ? (
                                            <p className="mt-2 text-sm text-blue-800">
                                                Resend OTP in {Math.floor(timeOpt / 60)}:{('0' + (timeOpt % 60)).slice(-2)}
                                            </p>
                                        ) : (
                                            <div
                                                className="cursor-pointer w-fit mt-2 text-sm text-blue-600 hover:text-blue-700"
                                                onClick={() => !isLoading && handleSign()}
                                            >
                                                Resend OTP
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={!isLoading && handleVerifyOtp}
                                        className="mt-2 tracking-wide font-semibold bg-green-500 text-gray-100 w-full py-3 rounded-lg hover:bg-green-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                                    >
                                        {isLoading ? (
                                            <AiOutlineLoading3Quarters className="text-white text-2xl cursor-pointer animate-spin m-auto" />
                                        ) : (
                                            <span className="ml-3">Verify OTP</span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
