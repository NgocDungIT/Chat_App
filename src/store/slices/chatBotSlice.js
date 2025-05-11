import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    dataChatBot: [],
    dataChatBotSelected: null,
};

export const chatBotSlice = createSlice({
    name: 'chatBot',
    initialState,
    reducers: {
        setDataChatBot(state, action) {
            state.dataChatBot = action.payload;
        },
        addNewDataChatBot(state, action) {
            state.dataChatBot.unshift(action.payload);
        },
        deleteDataChatBot(state, action) {
            const chatIndex = state.dataChatBot.findIndex((chat) => chat._id === action.payload);
            if (chatIndex !== -1) {
                state.dataChatBot.splice(chatIndex, 1);
                state.dataChatBotSelected = null;
            }
        },
        setDataChatBotSelected(state, action) {
            state.dataChatBotSelected = action.payload;
        },
        updateChatBotMessage(state, action) {
            const { newMessage } = action.payload;
            const chatId = state.dataChatBotSelected?._id;

            if (!chatId) return;

            state.dataChatBotSelected = {
                ...state.dataChatBotSelected,
                messages: [...state.dataChatBotSelected.messages, newMessage],
            };

            const chatIndex = state.dataChatBot.findIndex((chat) => chat._id === chatId);
            if (chatIndex !== -1) {
                state.dataChatBot[chatIndex] = {
                    ...state.dataChatBot[chatIndex],
                    messages: [...state.dataChatBot[chatIndex].messages, newMessage],
                };
            }
        },
        updateTitleSession(state, action) {
            const chatId = state.dataChatBotSelected?._id;
            if (!chatId) return;

            state.dataChatBotSelected = {
                ...state.dataChatBotSelected,
                title: action.payload,
            };

            const chatIndex = state.dataChatBot.findIndex((chat) => chat._id === chatId);
            if (chatIndex !== -1) {
                state.dataChatBot[chatIndex] = {
                    ...state.dataChatBot[chatIndex],
                    title: action.payload,
                };
            }
        },
    },
});

export const { setDataChatBot, addNewDataChatBot, setDataChatBotSelected, updateChatBotMessage, updateTitleSession, deleteDataChatBot } =
    chatBotSlice.actions;

export const selectDataChatBot = (state) => state.chatBot.dataChatBot;
export const selectDataChatBotSelected = (state) => state.chatBot.dataChatBotSelected;

export default chatBotSlice.reducer;
