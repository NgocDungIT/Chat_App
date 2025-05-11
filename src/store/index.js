import { configureStore } from '@reduxjs/toolkit';
import { authReducer, chatBotReducer, chatReducer } from './slices';

export const store = configureStore({
    reducer: {
        user: authReducer,
        chat: chatReducer,
        chatBot: chatBotReducer,
    },
});
