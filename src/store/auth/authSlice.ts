import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    login: boolean;
    type: "general" | "google" | "kakao" | null;
}

const initialState: AuthState = {
    login: false,
    type: "general",
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthState>) => {
            state.login = true;
            state.type = action.payload.type;
        },
        logout: (state) => {
            state.login = false;
            state.type = null;
        }
    }
});

export const {login, logout} = authSlice.actions;

export default authSlice.reducer;