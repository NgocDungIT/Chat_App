import { OpenAI } from 'openai';
import { apiClient } from './api-client';
import { UPLOAD_FILE } from '@/utils/constants';

const openaiChat = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY_IMAGE,
    dangerouslyAllowBrowser: true,
    baseOptions: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
});

// Function chat với GPT
export const chatWithGPT = async (messages) => {
    try {
        const completion = await openaiChat.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        return "Sorry, I couldn't process your request.";
    }
};

const openaiImage = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY_IMAGE,
    dangerouslyAllowBrowser: true,
    baseOptions: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
});

// Function tạo ảnh với DALL-E và upload lên server
export const generateImageWithGPT = async (prompt) => {
    try {
        // Bước 1: Tạo ảnh bằng DALL-E
        const result = await openaiImage.images.generate({
            model: 'gpt-image-1',
            prompt,
            size: 'auto',
            quality: 'low',
        });

        if (!result.data[0]?.b64_json) {
            return {
                success: false,
                message: 'Không nhận được dữ liệu ảnh từ DALL-E.',
            };
        }

        const base64Data = result.data[0].b64_json;
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: 'image/png' });
        const file = new File([blob], 'dalle-image.png', { type: 'image/png' });

        // Bước 3: Upload file lên server
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await apiClient.post(UPLOAD_FILE, formData, {
            withCredentials: true,
        });

        // Lấy URL từ phản hồi
        const imageUrl = uploadRes.data.data.filePath;
        return {
            success: true,
            url: imageUrl, // URL thực từ server của bạn
        };
    } catch (error) {
        console.error('Full error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack,
        });
        return {
            success: false,
            message: 'Xin lỗi, tôi không thể tạo hoặc tải lên ảnh.',
        };
    }
};

async function prepareImageFromUrl(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], 'image.png', { type: 'image/png' });
}

export const generateImageEditWithGPT = async (urlImage, prompt) => {
    try {
        const imageFile = await prepareImageFromUrl(urlImage);

        const result = await openaiImage.images.edit({
            model: 'gpt-image-1',
            prompt,
            size: 'auto',
            quality: 'low',
            image: [imageFile],
        });

        if (!result.data[0]?.b64_json) {
            return {
                success: false,
                message: 'Không nhận được dữ liệu ảnh từ DALL-E.',
            };
        }

        const base64Data = result.data[0].b64_json;
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);

            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: 'image/png' });
        const file = new File([blob], 'dalle-image.png', { type: 'image/png' });

        // Bước 3: Upload file lên server
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await apiClient.post(UPLOAD_FILE, formData, {
            withCredentials: true,
        });

        // Lấy URL từ phản hồi
        const imageUrl = uploadRes.data.data.filePath;
        return {
            success: true,
            url: imageUrl, // URL thực từ server của bạn
        };
    } catch (error) {
        console.error('Full error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack,
        });
        return {
            success: false,
            message: 'Xin lỗi, tôi không thể tạo hoặc tải lên ảnh.',
        };
    }
};
