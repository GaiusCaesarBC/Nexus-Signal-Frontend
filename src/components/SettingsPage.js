// client/src/pages/SettingsPage.js - Modern Settings Page

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    User, Mail, Lock, Bell, Palette, Shield, CreditCard,
    AlertTriangle, Save, Eye, EyeOff, Trash2, Calendar,
    Settings as SettingsIcon, Clock, Monitor,
    Zap, RefreshCw, X, Globe, Star, MessageSquare,
    ChevronRight, Check, Sparkles
} from 'lucide-react';
import TwoFactorSettings from './TwoFactorSettings';

const SettingsPage = () => {
    const { logout, api, user } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [showPortfolio, setShowPortfolio] = useState(true);
    
    const [form, setForm] = useState({
        username: '',
        email: '',
        displayName: '',
        bio: '',
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
                displayName: userData.profile?.displayName || '',
                bio: userData.profile?.bio || '',
                notifications: userData.notifications || prevForm.notifications,
                appPreferences: userData.appPreferences || prevForm.appPreferences,
            }));
            
            setIsPublic(userData.profile?.isPublic ?? true);
            setShowPortfolio(userData.profile?.showPortfolio ?? true);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            toast.error('Failed to load settings');
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
            await api.put('/social/profile', { isPublic: newValue });
            setIsPublic(newValue);
            toast.success(newValue ? 'Profile is now public' : 'Profile is now private');
        } catch (error) {
            console.error('Error updating privacy:', error);
            toast.error('Failed to update privacy settings');
        }
    };

    const handleTogglePortfolio = async (newValue) => {
        try {
            await api.put('/social/profile', { showPortfolio: newValue });
            setShowPortfolio(newValue);
            toast.success(newValue ? 'Portfolio is now visible' : 'Portfolio is now hidden');
        } catch (error) {
            console.error('Error updating portfolio settings:', error);
            toast.error('Failed to update portfolio settings');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        if (form.newPassword) {
            if (form.newPassword !== form.confirmNewPassword) {
                toast.error('New passwords do not match');
                setSaving(false);
                return;
            }
            if (form.newPassword.length < 6) {
                toast.error('Password must be at least 6 characters');
                setSaving(false);
                return;
            }
            if (!form.currentPassword) {
                toast.error('Current password is required');
                setSaving(false);
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
            await api.put('/auth/update-profile', updateData);
            await api.put('/social/profile', {
                displayName: form.displayName,
                bio: form.bio
            });
            
            toast.success('Settings saved successfully!');
            setForm(prevForm => ({
                ...prevForm,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
        } catch (err) {
            console.error('Error updating settings:', err);
            toast.error(err.response?.data?.msg || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
            const confirmation = prompt('Type "DELETE" to confirm account deletion:');
            if (confirmation === 'DELETE') {
                toast.info('Account deletion is not yet implemented');
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
                <LoadingState>
                    <Spinner />
                    <span>Loading settings...</span>
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
                        <SettingsIcon size={28} />
                    </HeaderIcon>
                    <div>
                        <PageTitle>Settings</PageTitle>
                        <PageSubtitle>Manage your account and preferences</PageSubtitle>
                    </div>
                </PageHeader>

                {/* Tabs */}
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
                                <span>{tab.label}</span>
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
                                    <User size={20} />
                                    <span>Account Information</span>
                                </SectionHeader>
                                
                                <SectionContent>
                                    <FormGrid>
                                        <FormGroup>
                                            <Label>Username</Label>
                                            <Input
                                                type="text"
                                                name="username"
                                                value={form.username}
                                                onChange={handleChange}
                                                placeholder="Enter username"
                                            />
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>Email Address</Label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="Enter email"
                                            />
                                        </FormGroup>
                                    </FormGrid>

                                    <StatsRow>
                                        <StatCard>
                                            <StatIcon><Shield size={20} /></StatIcon>
                                            <StatInfo>
                                                <StatLabel>User ID</StatLabel>
                                                <StatValue>{user?._id?.substring(0, 12)}...</StatValue>
                                            </StatInfo>
                                        </StatCard>
                                        <StatCard>
                                            <StatIcon><Calendar size={20} /></StatIcon>
                                            <StatInfo>
                                                <StatLabel>Member Since</StatLabel>
                                                <StatValue>
                                                    {user?.date ? new Date(user.date).toLocaleDateString('en-US', { 
                                                        month: 'short', year: 'numeric' 
                                                    }) : 'Recently'}
                                                </StatValue>
                                            </StatInfo>
                                        </StatCard>
                                    </StatsRow>
                                </SectionContent>
                            </Section>

                            <Section>
                                <SectionHeader>
                                    <Star size={20} />
                                    <span>Public Profile</span>
                                </SectionHeader>
                                
                                <SectionContent>
                                    <FormGroup>
                                        <Label>Display Name</Label>
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
                                        <Label>Bio</Label>
                                        <TextArea
                                            name="bio"
                                            value={form.bio || ''}
                                            onChange={handleChange}
                                            placeholder="Tell other traders about yourself..."
                                            maxLength={500}
                                        />
                                        <CharCount>{(form.bio || '').length}/500</CharCount>
                                    </FormGroup>
                                </SectionContent>
                            </Section>

                            <Section>
                                <SectionHeader>
                                    <Globe size={20} />
                                    <span>Privacy</span>
                                </SectionHeader>
                                
                                <SectionContent>
                                    <ToggleRow>
                                        <ToggleInfo>
                                            <ToggleIcon $active={isPublic}>
                                                {isPublic ? <Eye size={20} /> : <EyeOff size={20} />}
                                            </ToggleIcon>
                                            <ToggleText>
                                                <ToggleTitle>Public Profile</ToggleTitle>
                                                <ToggleDesc>
                                                    {isPublic 
                                                        ? 'Your profile is visible on leaderboards and search'
                                                        : 'Your profile is hidden from other users'
                                                    }
                                                </ToggleDesc>
                                            </ToggleText>
                                        </ToggleInfo>
                                        <Toggle $active={isPublic} onClick={() => handleTogglePublic(!isPublic)} type="button">
                                            <ToggleKnob $active={isPublic} />
                                        </Toggle>
                                    </ToggleRow>

                                    <ToggleRow>
                                        <ToggleInfo>
                                            <ToggleIcon $active={showPortfolio}>
                                                {showPortfolio ? <Eye size={20} /> : <EyeOff size={20} />}
                                            </ToggleIcon>
                                            <ToggleText>
                                                <ToggleTitle>Show Portfolio</ToggleTitle>
                                                <ToggleDesc>
                                                    {showPortfolio
                                                        ? 'Your trades and stats are visible to others'
                                                        : 'Your trading activity is private'
                                                    }
                                                </ToggleDesc>
                                            </ToggleText>
                                        </ToggleInfo>
                                        <Toggle $active={showPortfolio} onClick={() => handleTogglePortfolio(!showPortfolio)} type="button">
                                            <ToggleKnob $active={showPortfolio} />
                                        </Toggle>
                                    </ToggleRow>
                                </SectionContent>
                            </Section>

                            <ActionBar>
                                <SaveButton type="submit" disabled={saving}>
                                    {saving ? <RefreshCw size={18} className="spinning" /> : <Save size={18} />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </SaveButton>
                            </ActionBar>
                        </>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <>
                            {/* Two-Factor Authentication Section */}
                            <Section>
                                <SectionHeader>
                                    <Shield size={20} />
                                    <span>Two-Factor Authentication</span>
                                </SectionHeader>

                                <SectionContent>
                                    <TwoFactorSettings />
                                </SectionContent>
                            </Section>

                            <Section>
                                <SectionHeader>
                                    <Lock size={20} />
                                    <span>Change Password</span>
                                </SectionHeader>

                                <SectionContent>
                                    <InfoBanner>
                                        <Shield size={18} />
                                        <span>Use a strong password with at least 8 characters including uppercase, lowercase, and numbers.</span>
                                    </InfoBanner>

                                    <FormGroup>
                                        <Label>Current Password</Label>
                                        <InputWrapper>
                                            <Input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                name="currentPassword"
                                                value={form.currentPassword}
                                                onChange={handleChange}
                                                placeholder="Enter current password"
                                            />
                                            <InputIcon onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </InputIcon>
                                        </InputWrapper>
                                    </FormGroup>

                                    <FormGrid>
                                        <FormGroup>
                                            <Label>New Password</Label>
                                            <InputWrapper>
                                                <Input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    name="newPassword"
                                                    value={form.newPassword}
                                                    onChange={handleChange}
                                                    placeholder="Enter new password"
                                                />
                                                <InputIcon onClick={() => setShowNewPassword(!showNewPassword)}>
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </InputIcon>
                                            </InputWrapper>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label>Confirm New Password</Label>
                                            <InputWrapper>
                                                <Input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    name="confirmNewPassword"
                                                    value={form.confirmNewPassword}
                                                    onChange={handleChange}
                                                    placeholder="Confirm new password"
                                                />
                                                <InputIcon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </InputIcon>
                                            </InputWrapper>
                                        </FormGroup>
                                    </FormGrid>
                                </SectionContent>
                            </Section>

                            <DangerSection>
                                <SectionHeader $danger>
                                    <AlertTriangle size={20} />
                                    <span>Danger Zone</span>
                                </SectionHeader>
                                <SectionContent>
                                    <DangerText>
                                        Once you delete your account, there is no going back. All your data will be permanently removed.
                                    </DangerText>
                                    <DangerButton type="button" onClick={handleDeleteAccount}>
                                        <Trash2 size={18} />
                                        Delete Account
                                    </DangerButton>
                                </SectionContent>
                            </DangerSection>

                            <ActionBar>
                                <SaveButton type="submit" disabled={saving}>
                                    {saving ? <RefreshCw size={18} className="spinning" /> : <Save size={18} />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </SaveButton>
                            </ActionBar>
                        </>
                    )}

                    {/* NOTIFICATIONS TAB */}
                    {activeTab === 'notifications' && (
                        <>
                            <Section>
                                <SectionHeader>
                                    <Bell size={20} />
                                    <span>Notification Preferences</span>
                                </SectionHeader>
                                
                                <SectionContent>
                                    {[
                                        { key: 'email', title: 'Email Notifications', desc: 'Receive important updates via email' },
                                        { key: 'push', title: 'Push Notifications', desc: 'Get instant alerts on your device' },
                                        { key: 'dailySummary', title: 'Daily Market Summary', desc: 'Receive a daily summary of market activity' },
                                        { key: 'priceAlerts', title: 'Price Alerts', desc: 'Get notified when stocks hit your targets' },
                                        { key: 'portfolioUpdates', title: 'Portfolio Updates', desc: 'Notifications about portfolio changes' },
                                    ].map(item => (
                                        <ToggleRow key={item.key}>
                                            <ToggleInfo>
                                                <ToggleText>
                                                    <ToggleTitle>{item.title}</ToggleTitle>
                                                    <ToggleDesc>{item.desc}</ToggleDesc>
                                                </ToggleText>
                                            </ToggleInfo>
                                            <Toggle 
                                                $active={form.notifications[item.key]} 
                                                onClick={() => toggleNotification(item.key)}
                                                type="button"
                                            >
                                                <ToggleKnob $active={form.notifications[item.key]} />
                                            </Toggle>
                                        </ToggleRow>
                                    ))}
                                </SectionContent>
                            </Section>

                            <ActionBar>
                                <SaveButton type="submit" disabled={saving}>
                                    {saving ? <RefreshCw size={18} className="spinning" /> : <Save size={18} />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </SaveButton>
                            </ActionBar>
                        </>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === 'preferences' && (
                        <>
                            <Section>
                                <SectionHeader>
                                    <Palette size={20} />
                                    <span>Application Preferences</span>
                                </SectionHeader>
                                
                                <SectionContent>
                                    <FormGrid>
                                        <FormGroup>
                                            <Label><Monitor size={16} /> Theme</Label>
                                            <Select
                                                name="appPreferences.theme"
                                                value={form.appPreferences.theme}
                                                onChange={handleChange}
                                            >
                                                <option value="dark">Dark Mode</option>
                                                <option value="light" disabled>Light Mode (Coming Soon)</option>
                                            </Select>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label><Zap size={16} /> Default View</Label>
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
                                    </FormGrid>

                                    <FormGrid>
                                        <FormGroup>
                                            <Label><RefreshCw size={16} /> Refresh Interval</Label>
                                            <Select
                                                name="appPreferences.refreshInterval"
                                                value={form.appPreferences.refreshInterval}
                                                onChange={handleChange}
                                            >
                                                <option value={1}>1 Minute</option>
                                                <option value={5}>5 Minutes</option>
                                                <option value={10}>10 Minutes</option>
                                                <option value={30}>30 Minutes</option>
                                            </Select>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label><Clock size={16} /> Timezone</Label>
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
                                    </FormGrid>
                                </SectionContent>
                            </Section>

                            <ActionBar>
                                <SaveButton type="submit" disabled={saving}>
                                    {saving ? <RefreshCw size={18} className="spinning" /> : <Save size={18} />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </SaveButton>
                            </ActionBar>
                        </>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === 'billing' && (
                        <Section>
                            <SectionHeader>
                                <CreditCard size={20} />
                                <span>Subscription & Billing</span>
                            </SectionHeader>
                            
                            <SectionContent>
                                <InfoBanner $highlight>
                                    <Sparkles size={18} />
                                    <span>You're on the <strong>Free Plan</strong>. Upgrade to unlock premium features!</span>
                                </InfoBanner>

                                <StatsRow>
                                    <StatCard>
                                        <StatIcon><CreditCard size={20} /></StatIcon>
                                        <StatInfo>
                                            <StatLabel>Current Plan</StatLabel>
                                            <StatValue>Free</StatValue>
                                        </StatInfo>
                                    </StatCard>
                                    <StatCard>
                                        <StatIcon><Calendar size={20} /></StatIcon>
                                        <StatInfo>
                                            <StatLabel>Next Billing</StatLabel>
                                            <StatValue>N/A</StatValue>
                                        </StatInfo>
                                    </StatCard>
                                </StatsRow>

                                <ActionBar>
                                    <UpgradeButton onClick={() => window.location.href = '/pricing'}>
                                        <Sparkles size={18} />
                                        Upgrade to Premium
                                    </UpgradeButton>
                                </ActionBar>
                            </SectionContent>
                        </Section>
                    )}
                </Form>
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

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ContentWrapper = styled.div`
    max-width: 900px;
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

const TabsContainer = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    overflow-x: auto;
    padding-bottom: 8px;

    &::-webkit-scrollbar {
        height: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme.brand?.primary || '#00adef'}40;
        border-radius: 2px;
    }
`;

const Tab = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: ${props => props.$active 
        ? `${props.theme.brand?.primary || '#00adef'}15` 
        : 'transparent'};
    border: 1px solid ${props => props.$active 
        ? `${props.theme.brand?.primary || '#00adef'}50` 
        : props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.$active 
        ? props.theme.brand?.primary || '#00adef' 
        : props.theme.text?.secondary || '#94a3b8'};
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}15;
        border-color: ${props => props.theme.brand?.primary || '#00adef'}50;
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const Section = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
`;

const DangerSection = styled(Section)`
    border-color: rgba(239, 68, 68, 0.3);
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    font-weight: 600;
    color: ${props => props.$danger ? '#ef4444' : props.theme.text?.primary || '#e0e6ed'};

    svg {
        color: ${props => props.$danger ? '#ef4444' : props.theme.brand?.primary || '#00adef'};
    }
`;

const SectionContent = styled.div`
    padding: 20px;
`;

const FormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 16px;

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 13px;

    svg {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const InputWrapper = styled.div`
    position: relative;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    padding-right: ${props => props.$hasIcon ? '44px' : '16px'};
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

const InputIcon = styled.button`
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 4px;

    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
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
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const Select = styled.select`
    width: 100%;
    padding: 12px 16px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
    }

    option {
        background: ${props => props.theme.bg?.card || '#1e293b'};
        color: ${props => props.theme.text?.primary || '#e0e6ed'};
    }
`;

const StatsRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 16px;

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const StatCard = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 10px;
`;

const StatIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.theme.brand?.primary || '#00adef'}15;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatInfo = styled.div``;

const StatLabel = styled.div`
    font-size: 12px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const StatValue = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ToggleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 12px;
    margin-bottom: 12px;

    &:last-child {
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
    max-width: 300px;
`;

const Toggle = styled.button`
    width: 52px;
    height: 28px;
    border-radius: 14px;
    background: ${props => props.$active 
        ? props.theme.success || '#10b981' 
        : `${props.theme.text?.tertiary || '#64748b'}30`};
    border: none;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
`;

const ToggleKnob = styled.div`
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: ${props => props.$active ? '27px' : '3px'};
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const InfoBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: ${props => props.$highlight 
        ? `${props.theme.brand?.primary || '#00adef'}10` 
        : `${props.theme.text?.tertiary || '#64748b'}10`};
    border: 1px solid ${props => props.$highlight 
        ? `${props.theme.brand?.primary || '#00adef'}30` 
        : `${props.theme.text?.tertiary || '#64748b'}20`};
    border-radius: 10px;
    margin-bottom: 20px;

    svg {
        color: ${props => props.$highlight 
            ? props.theme.brand?.primary || '#00adef' 
            : props.theme.text?.tertiary || '#64748b'};
        flex-shrink: 0;
    }

    span {
        font-size: 13px;
        color: ${props => props.theme.text?.secondary || '#94a3b8'};
        line-height: 1.5;
    }

    strong {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const DangerText = styled.p`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 13px;
    margin-bottom: 16px;
    line-height: 1.5;
`;

const ActionBar = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
`;

const SaveButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
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
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    .spinning {
        animation: ${spin} 1s linear infinite;
    }
`;

const UpgradeButton = styled(SaveButton)`
    width: 100%;
`;

const DangerButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #ef4444;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
    }
`;

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

export default SettingsPage;