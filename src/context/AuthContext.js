// client/src/context/AuthContext.js - FIXED (No circular import)

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Logout Function
    const logout = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            await API.post('/auth/logout');
            console.log("Logout successful");
        } catch (err) {
            console.error('Logout error:', err.message);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
            navigate('/login');
        }
    }, [navigate]);

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
    }, []); // ✅ Empty deps - only run once on mount

    // Login
    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            await API.post('/auth/login', { email, password });
            console.log("Login successful, loading user...");

            const userLoaded = await loadUser();

            if (userLoaded) {
                navigate('/dashboard');
                return { success: true };
            } else {
                setError("Failed to establish session");
                return { success: false, error: "Session error" };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.msg || err.message;
            console.error("Login failed:", errorMessage);
            setError(errorMessage);
            setIsAuthenticated(false);
            setUser(null);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [loadUser, navigate]);

    // Register
    const register = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            await API.post('/auth/register', userData);
            console.log("Registration successful, loading user...");

            const userLoaded = await loadUser();

            if (userLoaded) {
                navigate('/dashboard');
                return { success: true };
            } else {
                setError("Failed to establish session");
                return { success: false, error: "Session error" };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.msg || err.message;
            console.error("Registration failed:", errorMessage);
            setError(errorMessage);
            setIsAuthenticated(false);
            setUser(null);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [loadUser, navigate]);

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