import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        return "Sorry, I couldn't process your request.";
    }
};

// Function mới cho tạo ảnh
export const generateImageWithDALLE = async (prompt) => {
    try {
        const result = await openai.images.generate({
            model: "gpt-image-1",
            prompt: prompt,
            size: "auto",
            background: "transparent",
            quality: "low",
        });
        

        console.log('🚀 ~ generateImageWithDALLE ~ response:', result);

        return {
            success: true,
            url: result.data[0].b64_json
        };
    } catch (error) {
        console.error('Full error:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack,
        });
        return {
            success: false,
            message: "Sorry, I couldn't generate the image.",
        };
    }
};
