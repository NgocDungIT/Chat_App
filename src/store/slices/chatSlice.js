import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chatType: null,
    chatData: null,
    chatMessage: [],
    directMessagesContacts: [],
    isDownloading: false,
    isUploading: false,
    fileDownloadProgress: 0,
    fileUploadProgress: 0,
    channels: [],
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        updateChatData(state, action) {
            state.chatData = action.payload;
        },
        updateChatType(state, action) {
            state.chatType = action.payload;
        },
        updateChatMessage(state, action) {
            state.chatMessage = action.payload;
        },
        addDirectMessagesContacts(state, action) {
            if (action.payload?._id) {
                const index = state.directMessagesContacts.findIndex((item) => item._id === action.payload?._id);
                if (index === -1) {
                    state.directMessagesContacts.unshift(action.payload);
                }
            }
        },
        updateDirectMessagesContacts(state, action) {
            state.directMessagesContacts = action.payload;
        },
        updateIsDownloading(state, action) {
            state.isDownloading = action.payload;
        },
        updateIsUploading(state, action) {
            state.isUploading = action.payload;
        },
        updateFileDownloadProgress(state, action) {
            state.fileDownloadProgress = action.payload;
        },
        updateFileUploadProgress(state, action) {
            state.fileUploadProgress = action.payload;
        },
        addChat(state, action) {
            const chatMessage = state.chatMessage;
            const chatType = state.chatType;
            state.chatMessage = [
                ...chatMessage,
                {
                    ...action.payload,
                    recipient: chatType === 'channel' ? action.payload.recipient : action.payload.recipient._id,
                    sender: chatType === 'channel' ? action.payload.sender : action.payload.sender._id,
                },
            ];
        },
        closeChat(state) {
            state.chatType = null;
            state.chatData = null;
            state.chatMessage = [];
        },
        updateChannel(state, action) {
            state.channels = action.payload;
        },
        addChannel(state, action) {
            if (action?.payload) {
                const index = state.channels.findIndex((item) => item._id === action?.payload._id);
                if (index === -1) {
                    state.channels.unshift(action.payload);
                } else {
                    state.channels[index] = action.payload;
                }
            }
        },
        updateChannelName(state, action) {
            const { channelId, newTitle } = action.payload;
            const index = state.channels.findIndex((item) => item._id === channelId);
            if (index !== -1) {
                state.channels[index].name = newTitle;
                state.chatData.name = newTitle;
            }
        },
        leaveChannel(state, action) {
            const { channelId } = action.payload;
            const index = state.channels.findIndex((item) => item._id === channelId);
            if (index !== -1) {
                state.channels.splice(index, 1);
            }
        },
    },
});

export const {
    updateChatData,
    updateChatType,
    updateChatMessage,
    addDirectMessagesContacts,
    updateDirectMessagesContacts,
    updateIsUploading,
    updateIsDownloading,
    updateFileDownloadProgress,
    updateFileUploadProgress,
    addChat,
    closeChat,
    updateChannel,
    addChannel,
    updateChannelName,
    leaveChannel,
} = chatSlice.actions;

export const selectChatType = (state) => state.chat.chatType;
export const selectChatData = (state) => state.chat.chatData;
export const selectChatMessage = (state) => state.chat.chatMessage;
export const selectDirectMessagesContacts = (state) => state.chat.directMessagesContacts;
export const selectIsUploading = (state) => state.chat.isUploading;
export const selectIsDownloading = (state) => state.chat.isDownloading;
export const selectFileDownloadProgress = (state) => state.chat.fileDownloadProgress;
export const selectFileUploadProgress = (state) => state.chat.fileUploadProgress;
export const selectChannels = (state) => state.chat.channels;

export default chatSlice.reducer;
