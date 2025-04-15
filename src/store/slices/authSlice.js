import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {},
};

export const authSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUserData (state, action) {
            state.user = action.payload
        },
    },
});

export const { updateUserData } = authSlice.actions;

export const selectUserData = (state) => state.user.user;

export default authSlice.reducer;
