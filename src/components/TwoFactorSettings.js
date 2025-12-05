// client/src/components/TwoFactorSettings.js - 2FA Settings Component
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    Shield, Mail, Smartphone, Eye, EyeOff, RefreshCw, Key,
    Check, X, AlertCircle, Copy, Download, Lock
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

// ============ STYLED COMPONENTS ============
const Container = styled.div`
    animation: ${fadeIn} 0.3s ease-out;
`;

const StatusCard = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background: ${props => props.$enabled
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(239, 68, 68, 0.1)'};
    border: 1px solid ${props => props.$enabled
        ? 'rgba(16, 185, 129, 0.3)'
        : 'rgba(239, 68, 68, 0.3)'};
    border-radius: 12px;
    margin-bottom: 20px;
`;

const StatusInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`;

const StatusIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.$enabled
        ? 'rgba(16, 185, 129, 0.2)'
        : 'rgba(239, 68, 68, 0.2)'};
    color: ${props => props.$enabled ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatusText = styled.div``;

const StatusTitle = styled.div`
    font-weight: 600;
    font-size: 15px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 4px;
`;

const StatusDesc = styled.div`
    font-size: 13px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const MethodBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(0, 173, 237, 0.15);
    border-radius: 20px;
    font-size: 12px;
    color: #00adef;
    font-weight: 600;
    margin-left: 8px;
`;

const SetupSection = styled.div`
    padding: 20px;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 12px;
    margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 8px;
`;

const MethodSelector = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    @media (max-width: 500px) {
        flex-direction: column;
    }
`;

const MethodCard = styled.button`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px;
    background: ${props => props.$selected
        ? 'rgba(0, 173, 237, 0.15)'
        : 'rgba(255, 255, 255, 0.03)'};
    border: 2px solid ${props => props.$selected
        ? '#00adef'
        : 'rgba(100, 116, 139, 0.2)'};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.5);
    }
`;

const MethodIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.$selected
        ? 'rgba(0, 173, 237, 0.2)'
        : 'rgba(100, 116, 139, 0.1)'};
    color: ${props => props.$selected ? '#00adef' : '#64748b'};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
`;

const MethodName = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: ${props => props.$selected
        ? '#00adef'
        : props.theme.text?.primary || '#e0e6ed'};
`;

const MethodDescription = styled.div`
    font-size: 12px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    text-align: center;
`;

const FormGroup = styled.div`
    margin-bottom: 16px;
`;

const Label = styled.label`
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    margin-bottom: 8px;
`;

const InputWrapper = styled.div`
    position: relative;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 16px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const CodeInputContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 20px 0;
`;

const CodeInput = styled.input`
    width: 48px;
    height: 56px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid ${props => props.hasValue ? 'rgba(0, 173, 237, 0.6)' : 'rgba(100, 116, 139, 0.25)'};
    border-radius: 10px;
    color: #f8fafc;
    transition: all 0.2s ease;

    &:focus {
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
        outline: none;
    }
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    svg.spinning {
        animation: ${spin} 1s linear infinite;
    }
`;

const SecondaryButton = styled(Button)`
    background: rgba(100, 116, 139, 0.2);
    border: 1px solid rgba(100, 116, 139, 0.3);

    &:hover:not(:disabled) {
        background: rgba(100, 116, 139, 0.3);
        box-shadow: none;
    }
`;

const DangerButton = styled(Button)`
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.25);
        box-shadow: none;
    }
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 12px;
    margin-top: 16px;

    @media (max-width: 500px) {
        flex-direction: column;
    }
`;

const BackupCodesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 16px 0;

    @media (max-width: 400px) {
        grid-template-columns: 1fr;
    }
`;

const BackupCode = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 8px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 13px;
    color: ${props => props.$used ? '#64748b' : '#e0e6ed'};
    text-decoration: ${props => props.$used ? 'line-through' : 'none'};
`;

const CopyButton = styled.button`
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;

    &:hover {
        color: #00adef;
    }
`;

const Message = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 10px;
    margin-bottom: 16px;
    font-size: 13px;
    animation: ${fadeIn} 0.3s ease-out;

    background: ${props => props.$type === 'error'
        ? 'rgba(239, 68, 68, 0.15)'
        : props.$type === 'success'
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(0, 173, 237, 0.15)'};
    border: 1px solid ${props => props.$type === 'error'
        ? 'rgba(239, 68, 68, 0.3)'
        : props.$type === 'success'
            ? 'rgba(16, 185, 129, 0.3)'
            : 'rgba(0, 173, 237, 0.3)'};
    color: ${props => props.$type === 'error'
        ? '#ef4444'
        : props.$type === 'success'
            ? '#10b981'
            : '#00adef'};
`;

const DisableSection = styled.div`
    padding: 20px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    margin-top: 16px;
`;

const StepIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
`;

const Step = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.$active
        ? '#00adef'
        : props.$completed
            ? '#10b981'
            : '#64748b'};
    font-size: 13px;
    font-weight: ${props => props.$active ? '600' : '400'};
`;

const StepNumber = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    background: ${props => props.$active
        ? '#00adef'
        : props.$completed
            ? '#10b981'
            : 'rgba(100, 116, 139, 0.2)'};
    color: ${props => (props.$active || props.$completed) ? 'white' : '#64748b'};
`;

const StepLine = styled.div`
    flex: 1;
    height: 2px;
    background: ${props => props.$completed
        ? '#10b981'
        : 'rgba(100, 116, 139, 0.2)'};
`;

// ============ COMPONENT ============
const TwoFactorSettings = () => {
    const toast = useToast();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    // Setup state
    const [setupStep, setSetupStep] = useState(0); // 0: choose method, 1: verify phone, 2: enter code, 3: backup codes
    const [selectedMethod, setSelectedMethod] = useState('email');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [backupCodes, setBackupCodes] = useState([]);
    const [setupLoading, setSetupLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Disable state
    const [disablePassword, setDisablePassword] = useState('');
    const [showDisableSection, setShowDisableSection] = useState(false);

    const inputRefs = useRef([]);

    // Fetch 2FA status
    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await api.get('/api/2fa/status');
            setStatus(response.data);
        } catch (err) {
            console.error('Error fetching 2FA status:', err);
            toast.error('Failed to load 2FA status');
        } finally {
            setLoading(false);
        }
    };

    // Handle code input
    const handleCodeChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        setMessage({ type: '', text: '' });

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Start setup
    const startSetup = async () => {
        setSetupLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post('/api/2fa/setup/init', {
                method: selectedMethod,
                phone: selectedMethod !== 'email' ? phoneNumber : undefined
            });

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: `Verification code sent to your ${selectedMethod === 'email' ? 'email' : 'phone'}!`
                });
                setSetupStep(2);
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.msg || err.response?.data?.error || 'Failed to start setup'
            });
        } finally {
            setSetupLoading(false);
        }
    };

    // Verify setup
    const verifySetup = async () => {
        const code = verificationCode.join('');
        if (code.length !== 6) {
            setMessage({ type: 'error', text: 'Please enter all 6 digits' });
            return;
        }

        setSetupLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post('/api/2fa/setup/verify', { code });

            if (response.data.success) {
                setBackupCodes(response.data.backupCodes || []);
                setSetupStep(3);
                toast.success('2FA enabled successfully!');
                fetchStatus();
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.msg || err.response?.data?.error || 'Verification failed'
            });
            setVerificationCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setSetupLoading(false);
        }
    };

    // Disable 2FA
    const disable2FA = async () => {
        if (!disablePassword) {
            setMessage({ type: 'error', text: 'Please enter your password' });
            return;
        }

        setSetupLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post('/api/2fa/disable', { password: disablePassword });

            if (response.data.success) {
                toast.success('2FA has been disabled');
                setShowDisableSection(false);
                setDisablePassword('');
                fetchStatus();
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.msg || err.response?.data?.error || 'Failed to disable 2FA'
            });
        } finally {
            setSetupLoading(false);
        }
    };

    // Regenerate backup codes
    const regenerateBackupCodes = async () => {
        setSetupLoading(true);

        try {
            const response = await api.post('/api/2fa/regenerate-backup-codes');

            if (response.data.success) {
                setBackupCodes(response.data.backupCodes);
                toast.success('New backup codes generated!');
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to regenerate codes');
        } finally {
            setSetupLoading(false);
        }
    };

    // Copy backup codes
    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        toast.success('Backup codes copied to clipboard!');
    };

    // Download backup codes
    const downloadBackupCodes = () => {
        const codesText = `Nexus Signal 2FA Backup Codes\n${'='.repeat(30)}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`;
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'nexus-signal-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Backup codes downloaded!');
    };

    // Reset setup
    const resetSetup = () => {
        setSetupStep(0);
        setSelectedMethod('email');
        setPhoneNumber('');
        setVerificationCode(['', '', '', '', '', '']);
        setBackupCodes([]);
        setMessage({ type: '', text: '' });
    };

    if (loading) {
        return (
            <Container>
                <StatusCard $enabled={false}>
                    <StatusInfo>
                        <StatusIcon $enabled={false}>
                            <RefreshCw size={24} className="spinning" />
                        </StatusIcon>
                        <StatusText>
                            <StatusTitle>Loading...</StatusTitle>
                            <StatusDesc>Checking 2FA status</StatusDesc>
                        </StatusText>
                    </StatusInfo>
                </StatusCard>
            </Container>
        );
    }

    return (
        <Container>
            {/* Status Card */}
            <StatusCard $enabled={status?.enabled}>
                <StatusInfo>
                    <StatusIcon $enabled={status?.enabled}>
                        {status?.enabled ? <Check size={24} /> : <Shield size={24} />}
                    </StatusIcon>
                    <StatusText>
                        <StatusTitle>
                            Two-Factor Authentication
                            {status?.enabled && (
                                <MethodBadge>
                                    {status.method === 'email' && <><Mail size={12} /> Email</>}
                                    {status.method === 'sms' && <><Smartphone size={12} /> SMS</>}
                                    {status.method === 'both' && <><Shield size={12} /> Both</>}
                                </MethodBadge>
                            )}
                        </StatusTitle>
                        <StatusDesc>
                            {status?.enabled
                                ? 'Your account is protected with 2FA'
                                : 'Add an extra layer of security to your account'
                            }
                        </StatusDesc>
                    </StatusText>
                </StatusInfo>
            </StatusCard>

            {message.text && (
                <Message $type={message.type}>
                    {message.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                    {message.text}
                </Message>
            )}

            {/* SETUP FLOW - When 2FA is not enabled */}
            {!status?.enabled && (
                <>
                    {/* Step 0: Choose Method */}
                    {setupStep === 0 && (
                        <SetupSection>
                            <SectionTitle>
                                <Shield size={18} />
                                Choose Verification Method
                            </SectionTitle>

                            <MethodSelector>
                                <MethodCard
                                    $selected={selectedMethod === 'email'}
                                    onClick={() => setSelectedMethod('email')}
                                >
                                    <MethodIcon $selected={selectedMethod === 'email'}>
                                        <Mail size={24} />
                                    </MethodIcon>
                                    <MethodName $selected={selectedMethod === 'email'}>Email</MethodName>
                                    <MethodDescription>
                                        Receive codes via email
                                    </MethodDescription>
                                </MethodCard>

                                {/* SMS options - uncomment when Twilio is configured
                                <MethodCard
                                    $selected={selectedMethod === 'sms'}
                                    onClick={() => setSelectedMethod('sms')}
                                >
                                    <MethodIcon $selected={selectedMethod === 'sms'}>
                                        <Smartphone size={24} />
                                    </MethodIcon>
                                    <MethodName $selected={selectedMethod === 'sms'}>SMS</MethodName>
                                    <MethodDescription>
                                        Receive codes via text
                                    </MethodDescription>
                                </MethodCard>

                                <MethodCard
                                    $selected={selectedMethod === 'both'}
                                    onClick={() => setSelectedMethod('both')}
                                >
                                    <MethodIcon $selected={selectedMethod === 'both'}>
                                        <Shield size={24} />
                                    </MethodIcon>
                                    <MethodName $selected={selectedMethod === 'both'}>Both</MethodName>
                                    <MethodDescription>
                                        Choose at login
                                    </MethodDescription>
                                </MethodCard>
                                */}
                            </MethodSelector>

                            {(selectedMethod === 'sms' || selectedMethod === 'both') && (
                                <FormGroup>
                                    <Label>Phone Number</Label>
                                    <Input
                                        type="tel"
                                        placeholder="+1 (555) 123-4567"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </FormGroup>
                            )}

                            <Button
                                onClick={startSetup}
                                disabled={setupLoading || ((selectedMethod === 'sms' || selectedMethod === 'both') && !phoneNumber)}
                            >
                                {setupLoading ? (
                                    <>
                                        <RefreshCw size={18} className="spinning" />
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        <Shield size={18} />
                                        Enable 2FA
                                    </>
                                )}
                            </Button>
                        </SetupSection>
                    )}

                    {/* Step 2: Enter Code */}
                    {setupStep === 2 && (
                        <SetupSection>
                            <StepIndicator>
                                <Step $completed>
                                    <StepNumber $completed><Check size={14} /></StepNumber>
                                    Method
                                </Step>
                                <StepLine $completed />
                                <Step $active>
                                    <StepNumber $active>2</StepNumber>
                                    Verify
                                </Step>
                                <StepLine />
                                <Step>
                                    <StepNumber>3</StepNumber>
                                    Backup
                                </Step>
                            </StepIndicator>

                            <SectionTitle>
                                <Key size={18} />
                                Enter Verification Code
                            </SectionTitle>

                            <CodeInputContainer>
                                {verificationCode.map((digit, index) => (
                                    <CodeInput
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleCodeChange(index, e.target.value)}
                                        onKeyDown={e => handleKeyDown(index, e)}
                                        hasValue={digit !== ''}
                                    />
                                ))}
                            </CodeInputContainer>

                            <ButtonRow>
                                <SecondaryButton onClick={resetSetup}>
                                    <X size={18} />
                                    Cancel
                                </SecondaryButton>
                                <Button
                                    onClick={verifySetup}
                                    disabled={setupLoading || verificationCode.some(d => d === '')}
                                >
                                    {setupLoading ? (
                                        <>
                                            <RefreshCw size={18} className="spinning" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Verify
                                        </>
                                    )}
                                </Button>
                            </ButtonRow>
                        </SetupSection>
                    )}

                    {/* Step 3: Backup Codes */}
                    {setupStep === 3 && (
                        <SetupSection>
                            <StepIndicator>
                                <Step $completed>
                                    <StepNumber $completed><Check size={14} /></StepNumber>
                                    Method
                                </Step>
                                <StepLine $completed />
                                <Step $completed>
                                    <StepNumber $completed><Check size={14} /></StepNumber>
                                    Verify
                                </Step>
                                <StepLine $completed />
                                <Step $active>
                                    <StepNumber $active>3</StepNumber>
                                    Backup
                                </Step>
                            </StepIndicator>

                            <SectionTitle>
                                <Key size={18} />
                                Save Your Backup Codes
                            </SectionTitle>

                            <Message $type="info">
                                <AlertCircle size={18} />
                                Store these codes safely. Each code can only be used once to access your account if you lose your phone.
                            </Message>

                            <BackupCodesGrid>
                                {backupCodes.map((code, index) => (
                                    <BackupCode key={index}>
                                        {code}
                                        <CopyButton onClick={() => {
                                            navigator.clipboard.writeText(code);
                                            toast.success('Code copied!');
                                        }}>
                                            <Copy size={14} />
                                        </CopyButton>
                                    </BackupCode>
                                ))}
                            </BackupCodesGrid>

                            <ButtonRow>
                                <SecondaryButton onClick={copyBackupCodes}>
                                    <Copy size={18} />
                                    Copy All
                                </SecondaryButton>
                                <SecondaryButton onClick={downloadBackupCodes}>
                                    <Download size={18} />
                                    Download
                                </SecondaryButton>
                            </ButtonRow>

                            <Button onClick={resetSetup} style={{ marginTop: 16 }}>
                                <Check size={18} />
                                Done
                            </Button>
                        </SetupSection>
                    )}
                </>
            )}

            {/* MANAGE 2FA - When 2FA is enabled */}
            {status?.enabled && (
                <>
                    <SetupSection>
                        <SectionTitle>
                            <Key size={18} />
                            Backup Codes
                        </SectionTitle>

                        <Button onClick={regenerateBackupCodes} disabled={setupLoading}>
                            {setupLoading ? (
                                <>
                                    <RefreshCw size={18} className="spinning" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={18} />
                                    Generate New Backup Codes
                                </>
                            )}
                        </Button>

                        {backupCodes.length > 0 && (
                            <>
                                <BackupCodesGrid style={{ marginTop: 16 }}>
                                    {backupCodes.map((code, index) => (
                                        <BackupCode key={index}>
                                            {code}
                                            <CopyButton onClick={() => {
                                                navigator.clipboard.writeText(code);
                                                toast.success('Code copied!');
                                            }}>
                                                <Copy size={14} />
                                            </CopyButton>
                                        </BackupCode>
                                    ))}
                                </BackupCodesGrid>

                                <ButtonRow>
                                    <SecondaryButton onClick={copyBackupCodes}>
                                        <Copy size={18} />
                                        Copy All
                                    </SecondaryButton>
                                    <SecondaryButton onClick={downloadBackupCodes}>
                                        <Download size={18} />
                                        Download
                                    </SecondaryButton>
                                </ButtonRow>
                            </>
                        )}
                    </SetupSection>

                    {/* Disable 2FA */}
                    {!showDisableSection ? (
                        <DangerButton onClick={() => setShowDisableSection(true)}>
                            <Lock size={18} />
                            Disable Two-Factor Authentication
                        </DangerButton>
                    ) : (
                        <DisableSection>
                            <SectionTitle>
                                <AlertCircle size={18} style={{ color: '#ef4444' }} />
                                Disable 2FA
                            </SectionTitle>

                            <FormGroup>
                                <Label>Enter your password to confirm</Label>
                                <Input
                                    type="password"
                                    placeholder="Your password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                />
                            </FormGroup>

                            <ButtonRow>
                                <SecondaryButton onClick={() => {
                                    setShowDisableSection(false);
                                    setDisablePassword('');
                                    setMessage({ type: '', text: '' });
                                }}>
                                    <X size={18} />
                                    Cancel
                                </SecondaryButton>
                                <DangerButton onClick={disable2FA} disabled={setupLoading || !disablePassword}>
                                    {setupLoading ? (
                                        <>
                                            <RefreshCw size={18} className="spinning" />
                                            Disabling...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Disable 2FA
                                        </>
                                    )}
                                </DangerButton>
                            </ButtonRow>
                        </DisableSection>
                    )}
                </>
            )}
        </Container>
    );
};

export default TwoFactorSettings;
