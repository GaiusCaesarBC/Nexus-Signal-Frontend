// client/src/pages/SettingsPage.js - LEGENDARY SETTINGS PAGE WITH PRIVACY

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Mail, Lock, Bell, Palette, Shield, CreditCard,
    AlertTriangle, Save, Eye, EyeOff, Trash2, Calendar,
    Settings as SettingsIcon, Sparkles, Clock, Monitor,
    Zap, RefreshCw, Check, X, Globe, Star, MessageSquare
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const rotate = keyframes`
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
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 6rem 2rem 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    max-width: 1200px;
    margin: 0 auto 3rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
`;

const ContentContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const TabsContainer = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 2px;
    }
`;

const Tab = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
        transform: translateY(-2px);
    }
`;

const Section = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, #00adef, #00ff88);
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    color: #00adef;
    font-weight: 700;
`;

const SectionDescription = styled.p`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormRow = styled.div`
    display: grid;
    grid-template-columns: ${props => props.$columns || '1fr'};
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const InputWrapper = styled.div`
    position: relative;
`;

const Input = styled.input`
    padding: 0.75rem 1rem;
    padding-right: ${props => props.$hasIcon ? '3rem' : '1rem'};
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    width: 100%;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &:disabled {
        background: rgba(30, 41, 59, 0.5);
        cursor: not-allowed;
        color: #64748b;
        border-color: rgba(100, 116, 139, 0.3);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const TextArea = styled.textarea`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const Select = styled.select`
    padding: 0.75rem 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #e0e6ed;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    option {
        background: #1a1f3a;
        color: #e0e6ed;
    }
`;

const IconButton = styled.button`
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        color: #00adef;
    }
`;

const ToggleWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 10px;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
    }
`;

const ToggleLabel = styled.div`
    flex: 1;
`;

const ToggleLabelText = styled.div`
    color: #e0e6ed;
    font-weight: 600;
    margin-bottom: 0.25rem;
`;

const ToggleDescription = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
`;

const Toggle = styled.button`
    width: 50px;
    height: 28px;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
        'rgba(100, 116, 139, 0.3)'
    };
    border: none;
    border-radius: 14px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;

    &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        top: 4px;
        left: ${props => props.$active ? '26px' : '4px'};
        transition: left 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    &:hover {
        transform: scale(1.05);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const Button = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const DangerButton = styled(Button)`
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);

    &:hover:not(:disabled) {
        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
    }
`;

const SecondaryButton = styled(Button)`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    color: #00adef;

    &:hover:not(:disabled) {
        background: rgba(0, 173, 237, 0.2);
        box-shadow: none;
    }
`;

const DangerZone = styled.div`
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 2rem;
`;

const DangerZoneTitle = styled.h3`
    color: #ef4444;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 1.2rem;
`;

const DangerZoneDescription = styled.p`
    color: #94a3b8;
    margin-bottom: 1rem;
    font-size: 0.9rem;
`;

const InfoBox = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    align-items: start;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const InfoIcon = styled.div`
    color: #00adef;
    flex-shrink: 0;
    margin-top: 0.15rem;
`;

const InfoText = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    line-height: 1.5;
`;

const StatCard = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: rgba(0, 173, 237, 0.2);
    color: #00adef;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatContent = styled.div`
    flex: 1;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
    color: #e0e6ed;
    font-size: 1.2rem;
    font-weight: 700;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    gap: 1rem;
`;

const LoadingSpinner = styled(Sparkles)`
    animation: ${rotate} 1s linear infinite;
    color: #00adef;
`;

const LoadingText = styled.div`
    color: #94a3b8;
    font-size: 1.1rem;
`;

// ============ COMPONENT ============
const SettingsPage = () => {
    const { logout, api, user } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [showPortfolio, setShowPortfolio] = useState(true);
    
    const [form, setForm] = useState({
    username: '',
    email: '',
    displayName: '',  // ✅ Add this
    bio: '',          // ✅ Add this
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    notifications: {
        email: true,
        push: false,
        dailySummary: true,
        priceAlerts: true,
        portfolioUpdates: true
    },
    appPreferences: {
        theme: 'dark',
        defaultView: 'dashboard',
        refreshInterval: 5,
        language: 'en',
        timezone: 'America/New_York'
    }
});

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
    try {
        setLoading(true);
        const res = await api.get('/auth/me');
        const userData = res.data;

        setForm(prevForm => ({
            ...prevForm,
            username: userData.username || userData.name || (userData.email ? userData.email.split('@')[0] : ''),
            email: userData.email,
            displayName: userData.profile?.displayName || '',  // ✅ Add this
            bio: userData.profile?.bio || '',                  // ✅ Add this
            notifications: userData.notifications || prevForm.notifications,
            appPreferences: userData.appPreferences || prevForm.appPreferences,
        }));
        
        setIsPublic(userData.profile?.isPublic ?? true);
        setShowPortfolio(userData.profile?.showPortfolio ?? true);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        toast.error('Failed to load settings', 'Error');
        if (err.response && err.response.status === 401) {
            logout();
        }
    } finally {
        setLoading(false);
    }
};

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('notifications.')) {
            const subFieldName = name.split('.')[1];
            setForm(prevForm => ({
                ...prevForm,
                notifications: {
                    ...prevForm.notifications,
                    [subFieldName]: value
                }
            }));
        } else if (name.startsWith('appPreferences.')) {
            const subFieldName = name.split('.')[1];
            setForm(prevForm => ({
                ...prevForm,
                appPreferences: {
                    ...prevForm.appPreferences,
                    [subFieldName]: value
                }
            }));
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const toggleNotification = (key) => {
        setForm(prevForm => ({
            ...prevForm,
            notifications: {
                ...prevForm.notifications,
                [key]: !prevForm.notifications[key]
            }
        }));
    };

    const handleTogglePublic = async (newValue) => {
        try {
            await api.put('/social/profile', {
                isPublic: newValue
            });
            setIsPublic(newValue);
            toast.success(
                newValue ? 'Profile is now public' : 'Profile is now private',
                'Privacy Updated'
            );
        } catch (error) {
            console.error('Error updating privacy:', error);
            toast.error('Failed to update privacy settings', 'Error');
        }
    };

    const handleTogglePortfolio = async (newValue) => {
        try {
            await api.put('/social/profile', {
                showPortfolio: newValue
            });
            setShowPortfolio(newValue);
            toast.success(
                newValue ? 'Portfolio is now visible' : 'Portfolio is now hidden',
                'Portfolio Updated'
            );
        } catch (error) {
            console.error('Error updating portfolio settings:', error);
            toast.error('Failed to update portfolio settings', 'Error');
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword) {
        if (form.newPassword !== form.confirmNewPassword) {
            toast.warning('New passwords do not match', 'Password Error');
            return;
        }
        if (form.newPassword.length < 6) {
            toast.warning('Password must be at least 6 characters', 'Password Error');
            return;
        }
        if (!form.currentPassword) {
            toast.warning('Current password is required', 'Password Error');
            return;
        }
    }

    const updateData = {
        username: form.username,
        email: form.email,
        notifications: form.notifications,
        appPreferences: form.appPreferences
    };

    if (form.newPassword) {
        updateData.currentPassword = form.currentPassword;
        updateData.newPassword = form.newPassword;
    }

    try {
        // Update basic profile info
        await api.put('/auth/update-profile', updateData);
        
        // ✅ ADD THIS - Update public profile (display name & bio)
        await api.put('/social/profile', {
            displayName: form.displayName,
            bio: form.bio
        });
        
        toast.success('Settings saved successfully!', 'Saved');
        setForm(prevForm => ({
            ...prevForm,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        }));
    } catch (err) {
        console.error('Error updating settings:', err);
        toast.error(err.response?.data?.msg || 'Failed to update settings', 'Error');
    }
};

    const handleDeleteAccount = () => {
        if (window.confirm('Are you absolutely sure? This action cannot be undone and will permanently delete your account and all data.')) {
            if (window.confirm('Last chance! Type "DELETE" in the next prompt to confirm.')) {
                const confirmation = prompt('Type "DELETE" to confirm account deletion:');
                if (confirmation === 'DELETE') {
                    toast.info('Account deletion is not yet implemented', 'Coming Soon');
                } else {
                    toast.info('Account deletion cancelled', 'Cancelled');
                }
            }
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <LoadingSpinner size={64} />
                    <LoadingText>Loading settings...</LoadingText>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Header>
                <Title>Settings</Title>
                <Subtitle>Customize your trading experience</Subtitle>
            </Header>

            <ContentContainer>
                <TabsContainer>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <Tab
                                key={tab.id}
                                $active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </Tab>
                        );
                    })}
                </TabsContainer>

                <Form onSubmit={handleSubmit}>
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <>
                            <Section>
                                <SectionHeader>
                                    <User size={24} />
                                    <SectionTitle>Profile Information</SectionTitle>
                                </SectionHeader>
                                <SectionDescription>
                                    Update your personal information and profile details
                                </SectionDescription>

                                <FormRow $columns="1fr 1fr">
                                    <FormGroup>
                                        <Label>
                                            <User size={16} />
                                            Username
                                        </Label>
                                        <Input
                                            type="text"
                                            name="username"
                                            value={form.username}
                                            onChange={handleChange}
                                            placeholder="Enter username"
                                        />
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>
                                            <Mail size={16} />
                                            Email Address
                                        </Label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="Enter email"
                                        />
                                    </FormGroup>
                                </FormRow>

                                <FormRow $columns="1fr 1fr">
                                    <StatCard>
                                        <StatIcon>
                                            <Shield size={24} />
                                        </StatIcon>
                                        <StatContent>
                                            <StatLabel>User ID</StatLabel>
                                            <StatValue>{user?._id?.substring(0, 12)}...</StatValue>
                                        </StatContent>
                                    </StatCard>

                                    <StatCard>
                                        <StatIcon>
                                            <Calendar size={24} />
                                        </StatIcon>
                                        <StatContent>
                                            <StatLabel>Member Since</StatLabel>
                                            <StatValue>
                                                {user?.date ? new Date(user.date).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                }) : 'Recently'}
                                            </StatValue>
                                        </StatContent>
                                    </StatCard>
                                </FormRow>
                            </Section>


                               <Section>
    <SectionHeader>
        <User size={24} />
        <SectionTitle>Public Profile</SectionTitle>
    </SectionHeader>
    <SectionDescription>
        Customize how you appear to other traders
    </SectionDescription>

    <FormGroup>
        <Label>
            <Star size={16} />
            Display Name
        </Label>
        <Input
            type="text"
            name="displayName"
            value={form.displayName || ''}
            onChange={handleChange}
            placeholder="How you want to be known"
            maxLength={50}
        />
    </FormGroup>

    <FormGroup>
        <Label>
            <MessageSquare size={16} />
            Bio
        </Label>
        <TextArea
            name="bio"
            value={form.bio || ''}
            onChange={handleChange}
            placeholder="Tell other traders about yourself, your trading strategy, or what you're interested in..."
            maxLength={500}
            rows={4}
        />
        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {(form.bio || '').length}/500 characters
        </div>
    </FormGroup>
</Section>                     



                            <Section>
                                <SectionHeader>
                                    <Globe size={24} />
                                    <SectionTitle>Profile Privacy</SectionTitle>
                                </SectionHeader>
                                <SectionDescription>
                                    Control who can see your profile and trading activity
                                </SectionDescription>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <ToggleWrapper>
                                        <ToggleLabel>
                                            <ToggleLabelText style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {isPublic ? <Eye size={18} /> : <EyeOff size={18} />}
                                                Public Profile
                                            </ToggleLabelText>
                                            <ToggleDescription>
                                                {isPublic 
                                                    ? 'Your profile is visible to everyone on the leaderboard and discovery page'
                                                    : 'Your profile is hidden from public view'
                                                }
                                            </ToggleDescription>
                                        </ToggleLabel>
                                        <Toggle
                                            type="button"
                                            $active={isPublic}
                                            onClick={() => handleTogglePublic(!isPublic)}
                                        />
                                    </ToggleWrapper>

                                    <ToggleWrapper>
                                        <ToggleLabel>
                                            <ToggleLabelText style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {showPortfolio ? <Eye size={18} /> : <EyeOff size={18} />}
                                                Show Portfolio
                                            </ToggleLabelText>
                                            <ToggleDescription>
                                                {showPortfolio 
                                                    ? 'Your trades and portfolio are visible on your profile'
                                                    : 'Only your stats are visible, trades are hidden'
                                                }
                                            </ToggleDescription>
                                        </ToggleLabel>
                                        <Toggle
                                            type="button"
                                            $active={showPortfolio}
                                            onClick={() => handleTogglePortfolio(!showPortfolio)}
                                        />
                                    </ToggleWrapper>
                                </div>
                            </Section>
                        </>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <>
                            <Section>
                                <SectionHeader>
                                    <Lock size={24} />
                                    <SectionTitle>Password & Security</SectionTitle>
                                </SectionHeader>
                                <SectionDescription>
                                    Manage your password and account security settings
                                </SectionDescription>

                                <InfoBox>
                                    <InfoIcon>
                                        <Shield size={20} />
                                    </InfoIcon>
                                    <InfoText>
                                        For your security, we recommend using a strong password with at least 8 characters, 
                                        including uppercase, lowercase, numbers, and special characters.
                                    </InfoText>
                                </InfoBox>

                                <FormGroup>
                                    <Label>
                                        <Lock size={16} />
                                        Current Password
                                    </Label>
                                    <InputWrapper>
                                        <Input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={form.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Enter current password"
                                            $hasIcon
                                        />
                                        <IconButton
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </IconButton>
                                    </InputWrapper>
                                </FormGroup>

                                <FormRow $columns="1fr 1fr">
                                    <FormGroup>
                                        <Label>
                                            <Lock size={16} />
                                            New Password
                                        </Label>
                                        <InputWrapper>
                                            <Input
                                                type={showNewPassword ? 'text' : 'password'}
                                                name="newPassword"
                                                value={form.newPassword}
                                                onChange={handleChange}
                                                placeholder="Enter new password"
                                                $hasIcon
                                            />
                                            <IconButton
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </IconButton>
                                        </InputWrapper>
                                    </FormGroup>

                                    <FormGroup>
                                        <Label>
                                            <Lock size={16} />
                                            Confirm New Password
                                        </Label>
                                        <InputWrapper>
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                name="confirmNewPassword"
                                                value={form.confirmNewPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm new password"
                                                $hasIcon
                                            />
                                            <IconButton
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </IconButton>
                                        </InputWrapper>
                                    </FormGroup>
                                </FormRow>
                            </Section>

                            <DangerZone>
                                <DangerZoneTitle>
                                    <AlertTriangle size={20} />
                                    Danger Zone
                                </DangerZoneTitle>
                                <DangerZoneDescription>
                                    Once you delete your account, there is no going back. Please be certain.
                                </DangerZoneDescription>
                                <DangerButton type="button" onClick={handleDeleteAccount}>
                                    <Trash2 size={18} />
                                    Delete Account
                                </DangerButton>
                            </DangerZone>
                        </>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <Section>
                            <SectionHeader>
                                <Bell size={24} />
                                <SectionTitle>Notification Preferences</SectionTitle>
                            </SectionHeader>
                            <SectionDescription>
                                Choose how you want to be notified about important updates
                            </SectionDescription>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <ToggleWrapper>
                                    <ToggleLabel>
                                        <ToggleLabelText>Email Notifications</ToggleLabelText>
                                        <ToggleDescription>Receive important updates via email</ToggleDescription>
                                    </ToggleLabel>
                                    <Toggle
                                        type="button"
                                        $active={form.notifications.email}
                                        onClick={() => toggleNotification('email')}
                                    />
                                </ToggleWrapper>

                                <ToggleWrapper>
                                    <ToggleLabel>
                                        <ToggleLabelText>Push Notifications</ToggleLabelText>
                                        <ToggleDescription>Get instant alerts on your device (Coming Soon)</ToggleDescription>
                                    </ToggleLabel>
                                    <Toggle
                                        type="button"
                                        $active={form.notifications.push}
                                        onClick={() => toggleNotification('push')}
                                    />
                                </ToggleWrapper>

                                <ToggleWrapper>
                                    <ToggleLabel>
                                        <ToggleLabelText>Daily Market Summary</ToggleLabelText>
                                        <ToggleDescription>Receive a daily summary of market activity</ToggleDescription>
                                    </ToggleLabel>
                                    <Toggle
                                        type="button"
                                        $active={form.notifications.dailySummary}
                                        onClick={() => toggleNotification('dailySummary')}
                                    />
                                </ToggleWrapper>

                                <ToggleWrapper>
                                    <ToggleLabel>
                                        <ToggleLabelText>Price Alerts</ToggleLabelText>
                                        <ToggleDescription>Get notified when stocks hit your target prices</ToggleDescription>
                                    </ToggleLabel>
                                    <Toggle
                                        type="button"
                                        $active={form.notifications.priceAlerts}
                                        onClick={() => toggleNotification('priceAlerts')}
                                    />
                                </ToggleWrapper>

                                <ToggleWrapper>
                                    <ToggleLabel>
                                        <ToggleLabelText>Portfolio Updates</ToggleLabelText>
                                        <ToggleDescription>Receive notifications about portfolio changes</ToggleDescription>
                                    </ToggleLabel>
                                    <Toggle
                                        type="button"
                                        $active={form.notifications.portfolioUpdates}
                                        onClick={() => toggleNotification('portfolioUpdates')}
                                    />
                                </ToggleWrapper>
                            </div>
                        </Section>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <Section>
                            <SectionHeader>
                                <Palette size={24} />
                                <SectionTitle>Application Preferences</SectionTitle>
                            </SectionHeader>
                            <SectionDescription>
                                Customize how the application looks and behaves
                            </SectionDescription>

                            <FormRow $columns="1fr 1fr">
                                <FormGroup>
                                    <Label>
                                        <Monitor size={16} />
                                        Theme
                                    </Label>
                                    <Select
                                        name="appPreferences.theme"
                                        value={form.appPreferences.theme}
                                        onChange={handleChange}
                                    >
                                        <option value="dark">Dark Mode (Active)</option>
                                        <option value="light" disabled>Light Mode (Coming Soon)</option>
                                        <option value="auto" disabled>Auto (Coming Soon)</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Zap size={16} />
                                        Default View
                                    </Label>
                                    <Select
                                        name="appPreferences.defaultView"
                                        value={form.appPreferences.defaultView}
                                        onChange={handleChange}
                                    >
                                        <option value="dashboard">Dashboard</option>
                                        <option value="portfolio">Portfolio</option>
                                        <option value="watchlist">Watchlist</option>
                                        <option value="predict">AI Predictions</option>
                                    </Select>
                                </FormGroup>
                            </FormRow>

                            <FormRow $columns="1fr 1fr">
                                <FormGroup>
                                    <Label>
                                        <RefreshCw size={16} />
                                        Data Refresh Interval
                                    </Label>
                                    <Select
                                        name="appPreferences.refreshInterval"
                                        value={form.appPreferences.refreshInterval}
                                        onChange={handleChange}
                                    >
                                        <option value={1}>1 Minute</option>
                                        <option value={5}>5 Minutes (Recommended)</option>
                                        <option value={10}>10 Minutes</option>
                                        <option value={30}>30 Minutes</option>
                                    </Select>
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Clock size={16} />
                                        Timezone
                                    </Label>
                                    <Select
                                        name="appPreferences.timezone"
                                        value={form.appPreferences.timezone}
                                        onChange={handleChange}
                                    >
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        <option value="UTC">UTC</option>
                                    </Select>
                                </FormGroup>
                            </FormRow>
                        </Section>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === 'billing' && (
                        <Section>
                            <SectionHeader>
                                <CreditCard size={24} />
                                <SectionTitle>Subscription & Billing</SectionTitle>
                            </SectionHeader>
                            <SectionDescription>
                                Manage your subscription and billing information
                            </SectionDescription>

                            <InfoBox>
                                <InfoIcon>
                                    <Sparkles size={20} />
                                </InfoIcon>
                                <InfoText>
                                    You're currently on the <strong>Free Plan</strong>. Upgrade to unlock premium features, 
                                    advanced AI predictions, and priority support.
                                </InfoText>
                            </InfoBox>

                            <FormRow $columns="1fr 1fr">
                                <StatCard>
                                    <StatIcon>
                                        <CreditCard size={24} />
                                    </StatIcon>
                                    <StatContent>
                                        <StatLabel>Current Plan</StatLabel>
                                        <StatValue>Free</StatValue>
                                    </StatContent>
                                </StatCard>

                                <StatCard>
                                    <StatIcon>
                                        <Calendar size={24} />
                                    </StatIcon>
                                    <StatContent>
                                        <StatLabel>Next Billing Date</StatLabel>
                                        <StatValue>N/A</StatValue>
                                    </StatContent>
                                </StatCard>
                            </FormRow>

                            <ButtonGroup>
                                <Button type="button" onClick={() => window.location.href = '/pricing'}>
                                    <Sparkles size={18} />
                                    Upgrade to Premium
                                </Button>
                                <SecondaryButton type="button" onClick={() => toast.info('Coming soon!', 'Feature')}>
                                    View Billing History
                                </SecondaryButton>
                            </ButtonGroup>
                        </Section>
                    )}

                    {/* SAVE BUTTON */}
                    {activeTab !== 'billing' && activeTab !== 'profile' && (
                        <ButtonGroup>
                            <Button type="submit">
                                <Save size={18} />
                                Save Changes
                            </Button>
                            <SecondaryButton type="button" onClick={() => window.location.reload()}>
                                <X size={18} />
                                Cancel
                            </SecondaryButton>
                        </ButtonGroup>
                    )}
                    
                    {activeTab === 'profile' && (
                        <ButtonGroup>
                            <Button type="submit">
                                <Save size={18} />
                                Save Profile Changes
                            </Button>
                            <SecondaryButton type="button" onClick={() => window.location.reload()}>
                                <X size={18} />
                                Cancel
                            </SecondaryButton>
                        </ButtonGroup>
                    )}
                </Form>
            </ContentContainer>
        </PageContainer>
    );
};

export default SettingsPage;