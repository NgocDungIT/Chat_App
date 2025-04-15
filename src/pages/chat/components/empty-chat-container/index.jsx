import Lottie from 'react-lottie';
import { animationDefaultOptions } from '@/lib/utils';

const EmptyChatContainer = () => {
    return (
        <div className="flex top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex-col md:static md:flex-1 justify-center items-center duration-1000 translate-x-0">
            <Lottie height={200} width={200} isClickToPauseDisabled={true} options={animationDefaultOptions} />
            <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
                <h3 className="poppins-medium">
                    Hi <span className="text-purple-500">!</span>
                    {' '}Welcome to <span className="text-purple-500">Bear </span>
                    {' '}Chat App <span className="text-purple-500">.</span>
                </h3>
            </div>
        </div>
    );
};

export default EmptyChatContainer;
