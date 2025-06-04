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
    onlineUsers: [],
};

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        updateOnlineUsers(state, action) {
            state.onlineUsers = action.payload;
        },
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
            if (action.payload?._id && action.payload?.idUser) {
                const index = state.directMessagesContacts.findIndex((item) => item._id === action.payload?._id);
                if (index === -1 && action.payload?._id !== action.payload?.idUser) {
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
        updateChannelMembers(state, action) {
            const { channelId, userId } = action.payload;
            if (action?.payload && channelId && userId) {
                const index = state.channels.findIndex((item) => item._id === channelId);
                if (index !== -1) {
                    state.channels[index].members = state.channels[index].members.filter((member) => member._id !== userId);
                }
                if (state.chatData) {
                    state.chatData.members = state.chatData.members.filter((member) => member._id !== userId);
                }
            }
        },
        updateChannelName(state, action) {
            const { channelId, newTitle } = action.payload;
            const index = state.channels.findIndex((item) => item._id === channelId);
            if (index !== -1) {
                state.channels[index].name = newTitle;

                if (state.chatData?._id === channelId) {
                    state.chatData.name = newTitle;
                }
            }
        },
        leaveChannel(state, action) {
            const { channelId } = action.payload;
            const index = state.channels.findIndex((item) => item._id === channelId);
            if (index !== -1) {
                state.channels.splice(index, 1);
            }
        },
        updateChannelImage(state, action) {
            const { channelId, url } = action.payload;
            const index = state.channels.findIndex((item) => item._id === channelId);
            if (index !== -1) {
                state.channels[index].image = url;
                if (state.chatData?._id === channelId) {
                    state.chatData.image = url;
                }
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
    updateChannelImage,
    updateChannelMembers,
    updateOnlineUsers,
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
export const selectOnlineUsers = (state) => state.chat.onlineUsers;

export default chatSlice.reducer;
