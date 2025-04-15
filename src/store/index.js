import { configureStore } from '@reduxjs/toolkit';
import { authReducer, chatReducer } from './slices';

export const store = configureStore({
    reducer: {
        user: authReducer,
        chat: chatReducer,
    },
});
