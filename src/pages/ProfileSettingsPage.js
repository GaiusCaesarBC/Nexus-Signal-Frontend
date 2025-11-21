// src/pages/ProfileSettingsPage.js - Complete Profile Customization

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Mail, Lock, Globe, Eye, EyeOff, Save, X,
    Camera, Upload, Check, AlertCircle, Settings,
    Shield, Bell, Palette, UserCircle, Image as ImageIcon,
    ChevronRight, Info, Sparkles, RefreshCw
} from 'lucide-react';
import usersAPI from '../api/users';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
`;

const Header = styled.div`
    max-width: 1200px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
`;

const ContentContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2rem;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

// ============ SIDEBAR (PREVIEW) ============
const PreviewCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 16px;
    padding: 2rem;
    position: sticky;
    top: 100px;
    animation: ${fadeIn} 0.6s ease-out;

    @media (max-width: 1024px) {
        position: relative;
        top: 0;
    }
`;

const PreviewHeader = styled.div`
    text-align: center;
    margin-bottom: 1.5rem;
`;

const PreviewTitle = styled.h3`
    color: #ffd700;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

const PreviewSubtitle = styled.p`
    color: #64748b;
    font-size: 0.9rem;
`;

const AvatarPreview = styled.div`
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: ${props => props.$src ? 
        `url(${props.$src}) center/cover` : 
        'linear-gradient(135deg, #ffd700, #ffed4e)'
    };
    border: 4px solid rgba(255, 215, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0a0e27;
    font-size: 3rem;
    font-weight: 900;
    margin: 0 auto 1.5rem;
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(255, 215, 0, 0.5);
    }
`;

const AvatarUploadOverlay = styled.div`
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;

    ${AvatarPreview}:hover & {
        opacity: 1;
    }
`;

const PreviewInfo = styled.div`
    text-align: center;
    margin-bottom: 1.5rem;
`;

const PreviewDisplayName = styled.div`
    color: #ffd700;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
`;

const PreviewUsername = styled.div`
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 1rem;
`;

const PreviewBio = styled.div`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.6;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 12px;
    min-height: 80px;
    margin-bottom: 1.5rem;
`;

const PreviewStats = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const PreviewStat = styled.div`
    text-align: center;
`;

const PreviewStatLabel = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const PreviewStatValue = styled.div`
    color: #ffd700;
    font-size: 1.2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
`;

// ============ MAIN CONTENT ============
const SettingsCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const Section = styled.div`
    margin-bottom: 2.5rem;
    padding-bottom: 2.5rem;
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);

    &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }
`;

const SectionTitle = styled.h3`
    color: #ffd700;
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
`;

const Label = styled.label`
    display: block;
    color: #e0e6ed;
    font-weight: 600;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
`;

const LabelInfo = styled.span`
    color: #64748b;
    font-weight: 400;
    font-size: 0.85rem;
    margin-left: 0.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
        box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
        box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const CharCount = styled.div`
    text-align: right;
    color: ${props => props.$over ? '#ef4444' : '#64748b'};
    font-size: 0.85rem;
    margin-top: 0.5rem;
`;

const ToggleGroup = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 10px;
    margin-bottom: 1rem;
`;

const ToggleInfo = styled.div`
    flex: 1;
`;

const ToggleLabel = styled.div`
    color: #e0e6ed;
    font-weight: 600;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const ToggleDescription = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const Toggle = styled.button`
    width: 56px;
    height: 32px;
    border-radius: 16px;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
        'rgba(100, 116, 139, 0.3)'
    };
    border: 2px solid ${props => props.$active ? '#10b981' : 'rgba(100, 116, 139, 0.5)'};
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &::after {
        content: '';
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        top: 2px;
        left: ${props => props.$active ? '26px' : '2px'};
        transition: left 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    &:hover {
        transform: scale(1.05);
    }
`;

const FileInput = styled.input`
    display: none;
`;

const FileInputLabel = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    background: rgba(255, 215, 0, 0.1);
    border: 2px dashed rgba(255, 215, 0, 0.3);
    border-radius: 10px;
    color: #ffd700;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 215, 0, 0.2);
        border-color: rgba(255, 215, 0, 0.5);
        transform: translateY(-2px);
    }
`;

const InfoBox = styled.div`
    padding: 1rem 1.25rem;
    background: ${props => {
        if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.1)';
        if (props.$type === 'success') return 'rgba(16, 185, 129, 0.1)';
        return 'rgba(0, 173, 237, 0.1)';
    }};
    border: 1px solid ${props => {
        if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.3)';
        if (props.$type === 'success') return 'rgba(16, 185, 129, 0.3)';
        return 'rgba(0, 173, 237, 0.3)';
    }};
    border-radius: 10px;
    color: ${props => {
        if (props.$type === 'warning') return '#f59e0b';
        if (props.$type === 'success') return '#10b981';
        return '#00adef';
    }};
    font-size: 0.9rem;
    display: flex;
    align-items: start;
    gap: 0.75rem;
    margin-top: 1rem;
`;

// ============ BUTTONS ============
const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 215, 0, 0.2);

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Button = styled.button`
    flex: 1;
    padding: 1rem 2rem;
    background: ${props => {
        if (props.$primary) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
        if (props.$danger) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        return 'rgba(100, 116, 139, 0.3)';
    }};
    border: none;
    border-radius: 12px;
    color: ${props => props.$primary || props.$danger ? '#0a0e27' : '#e0e6ed'};
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px ${props => {
            if (props.$primary) return 'rgba(255, 215, 0, 0.4)';
            if (props.$danger) return 'rgba(239, 68, 68, 0.4)';
            return 'rgba(100, 116, 139, 0.3)';
        }};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        animation: ${props => props.$loading ? spin : 'none'} 1s linear infinite;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
`;

const LoadingSpinner = styled(Settings)`
    animation: ${spin} 1s linear infinite;
    color: #ffd700;
`;

// ============ COMPONENT ============
const ProfileSettingsPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    
    // Form state
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [showPortfolio, setShowPortfolio] = useState(false);
    
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await usersAPI.getMyFullProfile();
            setProfile(data);
            
            // Set form fields
            setDisplayName(data.profile?.displayName || data.username || '');
            setBio(data.profile?.bio || '');
            setAvatar(data.profile?.avatar || '');
            setIsPublic(data.profile?.isPublic || false);
            setShowPortfolio(data.profile?.showPortfolio || false);
            
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image must be smaller than 5MB', 'Error');
                return;
            }

            setAvatarFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        
        try {
            // Validate
            if (displayName.length < 3) {
                toast.error('Display name must be at least 3 characters', 'Validation Error');
                setSaving(false);
                return;
            }

            if (bio.length > 500) {
                toast.error('Bio must be 500 characters or less', 'Validation Error');
                setSaving(false);
                return;
            }

            // Update profile
            const updateData = {
                displayName: displayName.trim(),
                bio: bio.trim(),
                isPublic,
                showPortfolio,
            };

            // If avatar was uploaded, add it (in real app, upload to cloud storage first)
            if (avatarPreview) {
                updateData.avatar = avatarPreview; // In production: upload to S3/Cloudinary first
            }

            await usersAPI.updateProfile(updateData);
            
            toast.success('Profile updated successfully!', 'Success');
            
            // Refresh profile data
            await fetchProfile();
            
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.response?.data?.msg || 'Failed to update profile', 'Error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original values
        setDisplayName(profile?.profile?.displayName || profile?.username || '');
        setBio(profile?.profile?.bio || '');
        setIsPublic(profile?.profile?.isPublic || false);
        setShowPortfolio(profile?.profile?.showPortfolio || false);
        setAvatarPreview('');
        setAvatarFile(null);
        
        toast.info('Changes discarded', 'Cancelled');
    };

    const getInitials = () => {
        if (!displayName) return '?';
        return displayName.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Loading settings...</div>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>
                    <Settings size={48} />
                    Profile Settings
                </Title>
                <Subtitle>Customize your public profile and privacy settings</Subtitle>
            </Header>

            <ContentContainer>
                {/* LIVE PREVIEW */}
                <PreviewCard>
                    <PreviewHeader>
                        <PreviewTitle>
                            <Eye size={20} />
                            Live Preview
                        </PreviewTitle>
                        <PreviewSubtitle>See how your profile looks</PreviewSubtitle>
                    </PreviewHeader>

                    <AvatarPreview $src={avatarPreview || avatar}>
                        {!avatarPreview && !avatar && getInitials()}
                        <AvatarUploadOverlay>
                            <Camera size={32} color="white" />
                        </AvatarUploadOverlay>
                    </AvatarPreview>

                    <PreviewInfo>
                        <PreviewDisplayName>
                            {displayName || 'Your Name'}
                        </PreviewDisplayName>
                        <PreviewUsername>
                            @{profile?.username || 'username'}
                        </PreviewUsername>
                        <PreviewBio>
                            {bio || 'Write something about yourself...'}
                        </PreviewBio>
                    </PreviewInfo>

                    <PreviewStats>
                        <PreviewStat>
                            <PreviewStatLabel>Visibility</PreviewStatLabel>
                            <PreviewStatValue>
                                {isPublic ? <Globe size={18} /> : <Lock size={18} />}
                                {isPublic ? 'Public' : 'Private'}
                            </PreviewStatValue>
                        </PreviewStat>
                        <PreviewStat>
                            <PreviewStatLabel>Portfolio</PreviewStatLabel>
                            <PreviewStatValue>
                                {showPortfolio ? <Eye size={18} /> : <EyeOff size={18} />}
                                {showPortfolio ? 'Visible' : 'Hidden'}
                            </PreviewStatValue>
                        </PreviewStat>
                    </PreviewStats>
                </PreviewCard>

                {/* SETTINGS FORM */}
                <SettingsCard>
                    {/* BASIC INFO */}
                    <Section>
                        <SectionTitle>
                            <UserCircle size={24} />
                            Basic Information
                        </SectionTitle>

                        <FormGroup>
                            <Label>
                                Display Name
                                <LabelInfo>(3-50 characters)</LabelInfo>
                            </Label>
                            <Input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                                maxLength={50}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>
                                Bio
                                <LabelInfo>(max 500 characters)</LabelInfo>
                            </Label>
                            <TextArea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell the community about yourself..."
                                maxLength={500}
                            />
                            <CharCount $over={bio.length > 500}>
                                {bio.length} / 500 characters
                            </CharCount>
                        </FormGroup>
                    </Section>

                    {/* AVATAR */}
                    <Section>
                        <SectionTitle>
                            <ImageIcon size={24} />
                            Profile Picture
                        </SectionTitle>

                        <FileInput
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <FileInputLabel htmlFor="avatar-upload">
                            <Upload size={20} />
                            {avatarFile ? avatarFile.name : 'Upload New Avatar'}
                        </FileInputLabel>

                        <InfoBox $type="info">
                            <Info size={18} />
                            <div>
                                Recommended: Square image, at least 400x400px. 
                                Max size: 5MB. Formats: JPG, PNG, GIF
                            </div>
                        </InfoBox>
                    </Section>

                    {/* PRIVACY */}
                    <Section>
                        <SectionTitle>
                            <Shield size={24} />
                            Privacy Settings
                        </SectionTitle>

                        <ToggleGroup>
                            <ToggleInfo>
                                <ToggleLabel>
                                    {isPublic ? <Globe size={18} /> : <Lock size={18} />}
                                    Public Profile
                                </ToggleLabel>
                                <ToggleDescription>
                                    {isPublic 
                                        ? 'Your profile is visible to everyone'
                                        : 'Only you can see your profile'
                                    }
                                </ToggleDescription>
                            </ToggleInfo>
                            <Toggle
                                $active={isPublic}
                                onClick={() => setIsPublic(!isPublic)}
                            />
                        </ToggleGroup>

                        <ToggleGroup>
                            <ToggleInfo>
                                <ToggleLabel>
                                    {showPortfolio ? <Eye size={18} /> : <EyeOff size={18} />}
                                    Show Portfolio
                                </ToggleLabel>
                                <ToggleDescription>
                                    {showPortfolio
                                        ? 'Others can see your trading stats'
                                        : 'Your trading stats are private'
                                    }
                                </ToggleDescription>
                            </ToggleInfo>
                            <Toggle
                                $active={showPortfolio}
                                onClick={() => setShowPortfolio(!showPortfolio)}
                            />
                        </ToggleGroup>

                        {!isPublic && (
                            <InfoBox $type="warning">
                                <AlertCircle size={18} />
                                <div>
                                    With a private profile, you won't appear in leaderboards 
                                    or discovery, and other users can't view your profile.
                                </div>
                            </InfoBox>
                        )}
                    </Section>

                    {/* BUTTONS */}
                    <ButtonGroup>
                        <Button onClick={handleCancel} disabled={saving}>
                            <X size={20} />
                            Cancel
                        </Button>
                        <Button $primary onClick={handleSave} disabled={saving} $loading={saving}>
                            {saving ? (
                                <>
                                    <RefreshCw size={20} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </ButtonGroup>
                </SettingsCard>
            </ContentContainer>
        </PageContainer>
    );
};

export default ProfileSettingsPage;