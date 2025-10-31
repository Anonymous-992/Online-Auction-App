import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ Remove any trailing slashes from the API base URL
const BASE_URL = import.meta.env.VITE_API?.replace(/\/+$/, '');

console.log("Backend API URL:", BASE_URL); // For debugging (optional)

// ✅ Check if user is logged in
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${BASE_URL}/user`, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue("Not authenticated");
    }
});

// ✅ Login
export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
    try {
        await axios.post(`${BASE_URL}/auth/login`, { email, password }, { withCredentials: true });

        const response = await axios.get(`${BASE_URL}/user`, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Login failed");
    }
});

// ✅ Signup
export const signup = createAsyncThunk('auth/signup', async ({ name, email, password }, { rejectWithValue }) => {
    try {
        await axios.post(`${BASE_URL}/auth/signup`, { name, email, password }, { withCredentials: true });

        const response = await axios.get(`${BASE_URL}/user`, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Signup failed");
    }
});

// ✅ Logout
export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
        return null;
    } catch (error) {
        return rejectWithValue("Logout failed");
    }
});

// ✅ Initial auth state
const initialState = {
    user: null,
    loading: true,
    error: null,
};

// ✅ Auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, { payload }) => {
                state.user = payload;
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state, { payload }) => {
                state.user = null;
                state.error = payload;
                state.loading = false;
            })

            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, { payload }) => {
                state.user = payload;
                state.loading = false;
            })
            .addCase(login.rejected, (state, { payload }) => {
                state.user = null;
                state.error = payload;
                state.loading = false;
            })

            // Signup
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, { payload }) => {
                state.user = payload;
                state.loading = false;
            })
            .addCase(signup.rejected, (state, { payload }) => {
                state.user = null;
                state.error = payload;
                state.loading = false;
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, { payload }) => {
                state.error = payload;
            });
    },
});

export default authSlice.reducer;
