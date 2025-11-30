// client/src/context/AuthContext.js - FIXED WITH TOKEN STORAGE

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const toast = useToast();

    // Logout Function
    const logout = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await API.post('/auth/logout');
            
            // ✅ CLEAR TOKEN FROM LOCALSTORAGE
            localStorage.removeItem('token');
            
            console.log("Logout successful");
            toast.info('You have been logged out', 'Goodbye');
        } catch (err) {
            console.error('Logout error:', err.message);
            toast.error('Logout failed. Please try again.', 'Error');
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
            navigate('/login');
        }
    }, [navigate, toast]);

    // Load user from cookie
    const loadUser = useCallback(async () => {
        try {
            const res = await API.get('/auth/me');
            setUser(res.data);
            setIsAuthenticated(true);
            setError(null);
            console.log("User loaded:", res.data.email);
            return true;
        } catch (err) {
            console.log("Not authenticated");
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
    }, []);

    // Initial auth check - ONLY once on mount
    useEffect(() => {
        let isMounted = true;

        const checkInitialAuth = async () => {
            console.log('Checking auth status...');
            setLoading(true);

            const isLoggedIn = await loadUser();

            if (isMounted) {
                setLoading(false);
                console.log(`Auth check complete. Authenticated: ${isLoggedIn}`);
            }
        };

        checkInitialAuth();

        return () => {
            isMounted = false;
        };
    }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

    // Login
    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            // ✅ Use API instance (has correct baseURL with /api)
            const response = await API.post('/auth/login', { email, password });
            
            // ✅ SAVE TOKEN TO LOCALSTORAGE
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log("Token saved to localStorage");
            }
            
            console.log("Login successful, loading user...");

            const userLoaded = await loadUser();

            if (userLoaded) {
                toast.success('Welcome back! 🎉', 'Login Successful');
                navigate('/dashboard');
                return { success: true };
            } else {
                setError("Failed to establish session");
                toast.error('Failed to establish session', 'Error');
                return { success: false, error: "Session error" };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.msg || err.message;
            console.error("Login failed:", errorMessage);
            setError(errorMessage);
            setIsAuthenticated(false);
            setUser(null);
            
            // ✅ SPECIFIC ERROR TOASTS
            if (errorMessage.includes('Invalid credentials') || errorMessage.includes('password')) {
                toast.error('Invalid email or password', 'Login Failed');
            } else if (errorMessage.includes('not found')) {
                toast.error('Account not found. Please register.', 'Login Failed');
            } else {
                toast.error(errorMessage, 'Login Failed');
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [loadUser, navigate, toast]);

    // Register
    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            // ✅ Use API instance (has correct baseURL with /api)
            const response = await API.post('/auth/register', userData);
            
            // ✅ SAVE TOKEN TO LOCALSTORAGE
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log("Token saved to localStorage");
            }
            
            console.log("Registration successful, loading user...");

            const userLoaded = await loadUser();

            if (userLoaded) {
                toast.success('Account created successfully! Welcome! 🎉', 'Registration Complete');
                navigate('/dashboard');
                return { success: true };
            } else {
                setError("Failed to establish session");
                toast.error('Failed to establish session', 'Error');
                return { success: false, error: "Session error" };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.msg || err.message;
            console.error("Registration failed:", errorMessage);
            setError(errorMessage);
            setIsAuthenticated(false);
            setUser(null);
            
            // ✅ SPECIFIC ERROR TOASTS
            if (errorMessage.includes('already exists')) {
                toast.error('This email is already registered. Try logging in.', 'Registration Failed');
            } else if (errorMessage.includes('password')) {
                toast.error('Password must be at least 8 characters', 'Weak Password');
            } else if (errorMessage.includes('email')) {
                toast.error('Please enter a valid email address', 'Invalid Email');
            } else {
                toast.error(errorMessage, 'Registration Failed');
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [loadUser, navigate, toast]);

    const value = {
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        api: API,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};