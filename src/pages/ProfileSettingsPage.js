// src/pages/ProfileSettingsPage.js - Modern Profile Customization

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Lock, Globe, Eye, EyeOff, Save, X,
    Camera, Upload, AlertCircle, Settings,
    Shield, UserCircle, Image as ImageIcon,
    Info, RefreshCw, Check, Sparkles
} from 'lucide-react';
import usersAPI from '../api/users';

const ProfileSettingsPage = () => {
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    
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

    // Track changes
    useEffect(() => {
        if (profile) {
            const originalDisplayName = profile.profile?.displayName || profile.username || '';
            const originalBio = profile.profile?.bio || '';
            const originalIsPublic = profile.profile?.isPublic || false;
            const originalShowPortfolio = profile.profile?.showPortfolio || false;
            
            const changed = 
                displayName !== originalDisplayName ||
                bio !== originalBio ||
                isPublic !== originalIsPublic ||
                showPortfolio !== originalShowPortfolio ||
                avatarPreview !== '';
            
            setHasChanges(changed);
        }
    }, [displayName, bio, isPublic, showPortfolio, avatarPreview, profile]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await usersAPI.getMyFullProfile();
            setProfile(data);
            
            setDisplayName(data.profile?.displayName || data.username || '');
            setBio(data.profile?.bio || '');
            setAvatar(data.profile?.avatar || '');
            setIsPublic(data.profile?.isPublic || false);
            setShowPortfolio(data.profile?.showPortfolio || false);
            
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be smaller than 5MB');
                return;
            }

            setAvatarFile(file);
            
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
            if (displayName.length < 3) {
                toast.error('Display name must be at least 3 characters');
                setSaving(false);
                return;
            }

            if (bio.length > 500) {
                toast.error('Bio must be 500 characters or less');
                setSaving(false);
                return;
            }

            const updateData = {
                displayName: displayName.trim(),
                bio: bio.trim(),
                isPublic,
                showPortfolio,
            };

            if (avatarPreview) {
                updateData.avatar = avatarPreview;
            }

            await usersAPI.updateProfile(updateData);
            
            toast.success('Profile updated successfully!');
            setHasChanges(false);
            await fetchProfile();
            
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.response?.data?.msg || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setDisplayName(profile?.profile?.displayName || profile?.username || '');
        setBio(profile?.profile?.bio || '');
        setIsPublic(profile?.profile?.isPublic || false);
        setShowPortfolio(profile?.profile?.showPortfolio || false);
        setAvatarPreview('');
        setAvatarFile(null);
        setHasChanges(false);
        
        toast.info('Changes discarded');
    };

    const getInitials = () => {
        if (!displayName) return '?';
        return displayName.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <PageContainer>
                <LoadingState>
                    <Spinner />
                    <span>Loading profile settings...</span>
                </LoadingState>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentWrapper>
                {/* Header */}
                <PageHeader>
                    <HeaderIcon>
                        <UserCircle size={28} />
                    </HeaderIcon>
                    <HeaderText>
                        <PageTitle>Profile Settings</PageTitle>
                        <PageSubtitle>Customize your public profile and privacy</PageSubtitle>
                    </HeaderText>
                    {hasChanges && (
                        <UnsavedBadge>
                            <Sparkles size={14} />
                            Unsaved Changes
                        </UnsavedBadge>
                    )}
                </PageHeader>

                <SettingsGrid>
                    {/* Live Preview Sidebar */}
                    <PreviewCard>
                        <PreviewHeader>
                            <Eye size={18} />
                            <span>Live Preview</span>
                        </PreviewHeader>
                        
                        <PreviewContent>
                            <AvatarPreview 
                                onClick={() => document.getElementById('avatar-upload').click()}
                            >
                                {avatarPreview || avatar ? (
                                    <AvatarImage src={avatarPreview || avatar} alt="Avatar" />
                                ) : (
                                    <AvatarPlaceholder>{getInitials()}</AvatarPlaceholder>
                                )}
                                <AvatarOverlay>
                                    <Camera size={24} />
                                </AvatarOverlay>
                            </AvatarPreview>

                            <PreviewName>{displayName || 'Your Name'}</PreviewName>
                            <PreviewUsername>@{profile?.username || 'username'}</PreviewUsername>
                            
                            <PreviewBio>
                                {bio || 'Write something about yourself...'}
                            </PreviewBio>

                            <PreviewStats>
                                <PreviewStat>
                                    <StatIcon $active={isPublic}>
                                        {isPublic ? <Globe size={16} /> : <Lock size={16} />}
                                    </StatIcon>
                                    <StatInfo>
                                        <StatLabel>Profile</StatLabel>
                                        <StatValue>{isPublic ? 'Public' : 'Private'}</StatValue>
                                    </StatInfo>
                                </PreviewStat>
                                <PreviewStat>
                                    <StatIcon $active={showPortfolio}>
                                        {showPortfolio ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </StatIcon>
                                    <StatInfo>
                                        <StatLabel>Portfolio</StatLabel>
                                        <StatValue>{showPortfolio ? 'Visible' : 'Hidden'}</StatValue>
                                    </StatInfo>
                                </PreviewStat>
                            </PreviewStats>
                        </PreviewContent>

                        <ViewProfileButton onClick={() => navigate(`/trader/${profile?.username}`)}>
                            View Public Profile
                        </ViewProfileButton>
                    </PreviewCard>

                    {/* Main Settings */}
                    <MainSettings>
                        {/* Basic Info Section */}
                        <SettingsSection>
                            <SectionHeader>
                                <User size={20} />
                                <span>Basic Information</span>
                            </SectionHeader>
                            
                            <SectionContent>
                                <FormGroup>
                                    <Label>
                                        Display Name
                                        <LabelHint>3-50 characters</LabelHint>
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
                                        <LabelHint>Tell others about yourself</LabelHint>
                                    </Label>
                                    <TextArea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="I'm a trader interested in..."
                                        maxLength={500}
                                    />
                                    <CharCount $warning={bio.length > 450} $over={bio.length > 500}>
                                        {bio.length}/500
                                    </CharCount>
                                </FormGroup>
                            </SectionContent>
                        </SettingsSection>

                        {/* Avatar Section */}
                        <SettingsSection>
                            <SectionHeader>
                                <ImageIcon size={20} />
                                <span>Profile Picture</span>
                            </SectionHeader>
                            
                            <SectionContent>
                                <FileInput
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                
                                <UploadArea htmlFor="avatar-upload">
                                    <Upload size={24} />
                                    <UploadText>
                                        {avatarFile ? avatarFile.name : 'Click to upload avatar'}
                                    </UploadText>
                                    <UploadHint>JPG, PNG or GIF • Max 5MB • Square recommended</UploadHint>
                                </UploadArea>

                                {avatarPreview && (
                                    <SuccessBanner>
                                        <Check size={16} />
                                        New avatar selected - save to apply
                                    </SuccessBanner>
                                )}
                            </SectionContent>
                        </SettingsSection>

                        {/* Privacy Section */}
                        <SettingsSection>
                            <SectionHeader>
                                <Shield size={20} />
                                <span>Privacy Settings</span>
                            </SectionHeader>
                            
                            <SectionContent>
                                <ToggleRow>
                                    <ToggleInfo>
                                        <ToggleIcon $active={isPublic}>
                                            {isPublic ? <Globe size={20} /> : <Lock size={20} />}
                                        </ToggleIcon>
                                        <ToggleText>
                                            <ToggleTitle>Public Profile</ToggleTitle>
                                            <ToggleDesc>
                                                {isPublic 
                                                    ? 'Anyone can view your profile and find you in search'
                                                    : 'Your profile is hidden from other users'
                                                }
                                            </ToggleDesc>
                                        </ToggleText>
                                    </ToggleInfo>
                                    <Toggle $active={isPublic} onClick={() => setIsPublic(!isPublic)}>
                                        <ToggleKnob $active={isPublic} />
                                    </Toggle>
                                </ToggleRow>

                                <ToggleRow>
                                    <ToggleInfo>
                                        <ToggleIcon $active={showPortfolio}>
                                            {showPortfolio ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </ToggleIcon>
                                        <ToggleText>
                                            <ToggleTitle>Show Portfolio Stats</ToggleTitle>
                                            <ToggleDesc>
                                                {showPortfolio
                                                    ? 'Your trading performance is visible to others'
                                                    : 'Your trading stats are private'
                                                }
                                            </ToggleDesc>
                                        </ToggleText>
                                    </ToggleInfo>
                                    <Toggle $active={showPortfolio} onClick={() => setShowPortfolio(!showPortfolio)}>
                                        <ToggleKnob $active={showPortfolio} />
                                    </Toggle>
                                </ToggleRow>

                                {!isPublic && (
                                    <WarningBanner>
                                        <AlertCircle size={18} />
                                        <div>
                                            <strong>Private Mode Active</strong>
                                            <p>You won't appear in leaderboards, search results, or discovery. Other users cannot view your profile.</p>
                                        </div>
                                    </WarningBanner>
                                )}
                            </SectionContent>
                        </SettingsSection>

                        {/* Action Buttons */}
                        <ActionBar>
                            <CancelButton onClick={handleCancel} disabled={saving || !hasChanges}>
                                <X size={18} />
                                Discard Changes
                            </CancelButton>
                            <SaveButton onClick={handleSave} disabled={saving || !hasChanges}>
                                {saving ? (
                                    <>
                                        <RefreshCw size={18} className="spinning" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </SaveButton>
                        </ActionBar>
                    </MainSettings>
                </SettingsGrid>
            </ContentWrapper>
        </PageContainer>
    );
};

// Animations
const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    animation: ${fadeIn} 0.4s ease-out;

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const PageHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    flex-wrap: wrap;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, 
        ${props => props.theme.brand?.primary || '#00adef'}20 0%, 
        ${props => props.theme.brand?.accent || '#06b6d4'}20 100%
    );
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}40;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const HeaderText = styled.div`
    flex: 1;
`;

const PageTitle = styled.h1`
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const PageSubtitle = styled.p`
    margin: 4px 0 0 0;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 14px;
`;

const UnsavedBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 20px;
    color: #f59e0b;
    font-size: 13px;
    font-weight: 500;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 24px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

// Preview Card
const PreviewCard = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
    height: fit-content;
    position: sticky;
    top: 100px;

    @media (max-width: 900px) {
        position: static;
    }
`;

const PreviewHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;

    svg {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const PreviewContent = styled.div`
    padding: 24px 20px;
    text-align: center;
`;

const AvatarPreview = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 16px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    border: 3px solid ${props => props.theme.brand?.primary || '#00adef'};
    box-shadow: 0 0 20px ${props => props.theme.brand?.primary || '#00adef'}30;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 0 30px ${props => props.theme.brand?.primary || '#00adef'}50;
    }
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, 
        ${props => props.theme.brand?.primary || '#00adef'} 0%, 
        ${props => props.theme.brand?.accent || '#06b6d4'} 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: 700;
    color: white;
`;

const AvatarOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;

    ${AvatarPreview}:hover & {
        opacity: 1;
    }
`;

const PreviewName = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 4px;
`;

const PreviewUsername = styled.div`
    font-size: 13px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    margin-bottom: 16px;
`;

const PreviewBio = styled.div`
    font-size: 13px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    line-height: 1.6;
    padding: 12px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 10px;
    min-height: 60px;
    margin-bottom: 16px;
`;

const PreviewStats = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
`;

const PreviewStat = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 10px;
`;

const StatIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$active 
        ? `${props.theme.success || '#10b981'}20` 
        : `${props.theme.text?.tertiary || '#64748b'}20`};
    color: ${props => props.$active 
        ? props.theme.success || '#10b981' 
        : props.theme.text?.tertiary || '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatInfo = styled.div`
    text-align: left;
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const StatValue = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ViewProfileButton = styled.button`
    width: 100%;
    padding: 14px;
    background: transparent;
    border: none;
    border-top: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    color: ${props => props.theme.brand?.primary || '#00adef'};
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}10;
    }
`;

// Main Settings
const MainSettings = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SettingsSection = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};

    svg {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const SectionContent = styled.div`
    padding: 20px;
`;

const FormGroup = styled.div`
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Label = styled.label`
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;
    font-weight: 500;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
`;

const LabelHint = styled.span`
    font-weight: 400;
    font-size: 12px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${props => props.theme.brand?.primary || '#00adef'}20;
    }

    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    padding: 12px 16px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${props => props.theme.brand?.primary || '#00adef'}20;
    }

    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const CharCount = styled.div`
    text-align: right;
    font-size: 12px;
    margin-top: 6px;
    color: ${props => 
        props.$over ? '#ef4444' : 
        props.$warning ? '#f59e0b' : 
        props.theme.text?.tertiary || '#64748b'
    };
`;

const FileInput = styled.input`
    display: none;
`;

const UploadArea = styled.label`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 32px 20px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border: 2px dashed ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}10;
        border-color: ${props => props.theme.brand?.primary || '#00adef'}50;
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const UploadText = styled.div`
    font-weight: 500;
    font-size: 14px;
`;

const UploadHint = styled.div`
    font-size: 12px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const SuccessBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 10px;
    color: #10b981;
    font-size: 13px;
    margin-top: 12px;
`;

// Toggle Components
const ToggleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 12px;
    margin-bottom: 12px;

    &:last-of-type {
        margin-bottom: 0;
    }
`;

const ToggleInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`;

const ToggleIcon = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${props => props.$active 
        ? `${props.theme.success || '#10b981'}15` 
        : `${props.theme.text?.tertiary || '#64748b'}15`};
    color: ${props => props.$active 
        ? props.theme.success || '#10b981' 
        : props.theme.text?.tertiary || '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
`;

const ToggleText = styled.div``;

const ToggleTitle = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
    margin-bottom: 2px;
`;

const ToggleDesc = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 12px;
    max-width: 280px;
`;

const Toggle = styled.button`
    width: 52px;
    height: 28px;
    border-radius: 14px;
    background: ${props => props.$active 
        ? props.theme.success || '#10b981' 
        : props.theme.text?.tertiary || '#64748b'}30;
    border: none;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;

    &:hover {
        transform: scale(1.05);
    }
`;

const ToggleKnob = styled.div`
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: ${props => props.$active 
        ? props.theme.success || '#10b981' 
        : props.theme.text?.secondary || '#94a3b8'};
    top: 3px;
    left: ${props => props.$active ? '27px' : '3px'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const WarningBanner = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 10px;
    margin-top: 16px;

    svg {
        color: #f59e0b;
        flex-shrink: 0;
        margin-top: 2px;
    }

    strong {
        display: block;
        color: #f59e0b;
        font-size: 13px;
        margin-bottom: 4px;
    }

    p {
        margin: 0;
        color: ${props => props.theme.text?.secondary || '#94a3b8'};
        font-size: 12px;
        line-height: 1.5;
    }
`;

// Action Buttons
const ActionBar = styled.div`
    display: flex;
    gap: 12px;
    padding: 20px;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;

    @media (max-width: 500px) {
        flex-direction: column;
    }
`;

const CancelButton = styled.button`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    background: transparent;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #ef4444;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SaveButton = styled.button`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    background: linear-gradient(135deg, 
        ${props => props.theme.brand?.primary || '#00adef'} 0%, 
        ${props => props.theme.brand?.accent || '#06b6d4'} 100%
    );
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px ${props => props.theme.brand?.primary || '#00adef'}40;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: ${spin} 1s linear infinite;
    }
`;

// Loading State
const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 60vh;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.3)'};
    border-top-color: ${props => props.theme.brand?.primary || '#00adef'};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

export default ProfileSettingsPage;