// client/src/components/AvatarUpload.jsx - Profile Picture Upload Component

import React, { useState } from 'react';
import axios from 'axios';

const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentAvatar || '');
    const [error, setError] = useState('');

    // Handle file selection and preview
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload the file
        await uploadAvatar(file);
    };

    // Upload avatar to backend
    const uploadAvatar = async (file) => {
        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/upload-avatar`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true // Important for cookie-based auth
                }
            );

            if (response.data.success) {
                setPreviewUrl(response.data.avatarUrl);
                if (onAvatarUpdate) {
                    onAvatarUpdate(response.data.avatarUrl);
                }
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setError(err.response?.data?.msg || 'Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    // Delete avatar
    const handleDeleteAvatar = async () => {
        if (!window.confirm('Are you sure you want to delete your profile picture?')) {
            return;
        }

        setUploading(true);
        setError('');

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/delete-avatar`,
                { withCredentials: true }
            );

            if (response.data.success) {
                setPreviewUrl('');
                if (onAvatarUpdate) {
                    onAvatarUpdate('');
                }
            }
        } catch (err) {
            console.error('Error deleting avatar:', err);
            setError(err.response?.data?.msg || 'Failed to delete avatar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="avatar-upload-container">
            <div className="avatar-preview">
                {previewUrl ? (
                    <img 
                        src={previewUrl} 
                        alt="Profile" 
                        className="avatar-image"
                    />
                ) : (
                    <div className="avatar-placeholder">
                        <svg 
                            className="avatar-placeholder-icon" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="avatar-actions">
                <label htmlFor="avatar-input" className="upload-button">
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                    <input
                        id="avatar-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>

                {previewUrl && (
                    <button
                        onClick={handleDeleteAvatar}
                        disabled={uploading}
                        className="delete-button"
                    >
                        Delete Photo
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <style jsx>{`
                .avatar-upload-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                }

                .avatar-preview {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid #e0e0e0;
                }

                .avatar-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .avatar-placeholder-icon {
                    width: 80px;
                    height: 80px;
                    color: white;
                }

                .avatar-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .upload-button,
                .delete-button {
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    border: none;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .upload-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .upload-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .delete-button {
                    background: #ef4444;
                    color: white;
                }

                .delete-button:hover:not(:disabled) {
                    background: #dc2626;
                }

                .upload-button:disabled,
                .delete-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .error-message {
                    color: #ef4444;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default AvatarUpload;