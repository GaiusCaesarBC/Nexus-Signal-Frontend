import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Assuming useAuth provides login functionality or refreshes user state
import './RegisterPage.css'; // For styling - create this file too!

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth(); // Assuming useAuth has a login function to set user state upon successful registration
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'; // Use Render URL or local

    const validateForm = () => {
        if (!username || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        // Basic email regex
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email address is invalid.');
            return false;
        }
        setError(''); // Clear any previous errors
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError('');
        setSuccess('');
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                username,
                email,
                password,
            });

            setSuccess('Registration successful! Redirecting to login...');
            // Optionally, log the user in immediately or redirect to login
            // If your backend automatically logs in and returns a token:
            if (response.data.token) {
                // Assuming login function handles setting token/user context
                login(response.data.token);
                navigate('/dashboard'); // Redirect to dashboard
            } else {
                // If not auto-login, redirect to login page
                setTimeout(() => {
                    navigate('/login');
                }, 2000); // Redirect after 2 seconds
            }

        } catch (err) {
            console.error('Registration error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2>Register for Nexus Signal</h2>
                <p>Create your account to unlock advanced trading insights.</p>

                <form onSubmit={handleSubmit} className="register-form">
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            aria-label="Username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            aria-label="Email address"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            aria-label="Password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            aria-label="Confirm password"
                        />
                    </div>

                    <button type="submit" className="register-button" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;