// client/src/components/TwoFactorModal.js - 2FA Verification Modal
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Shield, Mail, Smartphone, RefreshCw, Key, X, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api/axios';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(50px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border-radius: 24px;
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    border: 2px solid rgba(0, 173, 237, 0.4);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(0, 173, 237, 0.15);
    position: relative;
    animation: ${slideUp} 0.4s ease-out;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
        z-index: 0;
        pointer-events: none;
    }
`;

const ModalContent = styled.div`
    position: relative;
    z-index: 1;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 2;

    &:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
    }
`;

const IconWrapper = styled.div`
    width: 70px;
    height: 70px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, #00adef, #0088cc);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 173, 237, 0.4);
    animation: ${pulse} 2s ease-in-out infinite;
`;

const Title = styled.h2`
    font-size: 1.75rem;
    color: #f8fafc;
    text-align: center;
    margin-bottom: 0.5rem;
    font-weight: 700;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 0.95rem;
    line-height: 1.5;
`;

const MethodBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 173, 237, 0.15);
    border: 1px solid rgba(0, 173, 237, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    color: #00adef;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
`;

const CodeInputContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const CodeInput = styled.input`
    width: 48px;
    height: 56px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    background: rgba(10, 14, 39, 0.8);
    border: 2px solid ${props => props.hasValue ? 'rgba(0, 173, 237, 0.6)' : 'rgba(0, 173, 237, 0.25)'};
    border-radius: 12px;
    color: #f8fafc;
    transition: all 0.2s ease;
    caret-color: #00adef;

    &:focus {
        border-color: #00adef;
        box-shadow: 0 0 0 4px rgba(0, 173, 237, 0.2);
        outline: none;
        background: rgba(10, 14, 39, 0.95);
    }

    &::placeholder {
        color: #475569;
    }

    @media (max-width: 400px) {
        width: 42px;
        height: 50px;
        font-size: 1.25rem;
    }
`;

const ErrorMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const SuccessMessage = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: #22c55e;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    border-radius: 12px;
    color: #f8fafc;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 25px rgba(0, 173, 237, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(0, 173, 237, 0.5);
    }

    &:disabled {
        background: linear-gradient(135deg, #4a5568, #374151);
        cursor: not-allowed;
        box-shadow: none;
    }
`;

const SecondaryActions = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const ResendButton = styled.button`
    background: none;
    border: none;
    color: ${props => props.disabled ? '#64748b' : '#00adef'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        background: rgba(0, 173, 237, 0.1);
    }

    svg {
        animation: ${props => props.loading ? `${spin} 1s linear infinite` : 'none'};
    }
`;

const BackupCodeLink = styled.button`
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    transition: all 0.3s ease;

    &:hover {
        color: #f8fafc;
    }
`;

const MethodSelector = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    justify-content: center;
`;

const MethodButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: ${props => props.active ? 'rgba(0, 173, 237, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    border: 2px solid ${props => props.active ? '#00adef' : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 10px;
    color: ${props => props.active ? '#00adef' : '#94a3b8'};
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
        border-color: #00adef;
        color: #00adef;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// ============ COMPONENT ============
const TwoFactorModal = ({
    isOpen,
    onClose,
    onSuccess,
    tempToken,
    method,
    email,
    phone
}) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isBackupMode, setIsBackupMode] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState(method === 'both' ? 'email' : method);
    const inputRefs = useRef([]);
    const initialCodeSent = useRef(false);

    // Sync selectedMethod with method prop when it changes
    useEffect(() => {
        if (method) {
            setSelectedMethod(method === 'both' ? 'email' : method);
        }
    }, [method]);

    // Focus first input and auto-send code on mount
    useEffect(() => {
        if (isOpen && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        // Auto-send verification code when modal opens (only once)
        // Use method prop directly as fallback if selectedMethod not yet synced
        const methodToUse = selectedMethod || (method === 'both' ? 'email' : method);
        console.log('[2FA Modal] Effect running:', { isOpen, hasTempToken: !!tempToken, methodToUse, isBackupMode, initialCodeSent: initialCodeSent.current });

        if (isOpen && tempToken && methodToUse && !isBackupMode && !initialCodeSent.current) {
            initialCodeSent.current = true;
            const sendInitialCode = async () => {
                console.log('[2FA Modal] Auto-sending verification code...');
                setResendLoading(true);
                try {
                    await api.post('/2fa/send-login-code', {
                        tempToken,
                        method: methodToUse
                    });
                    console.log('[2FA Modal] Verification code sent successfully');
                    setSuccess(`Code sent to your ${selectedMethod === 'email' ? 'email' : 'phone'}!`);
                    setCountdown(60);
                    setTimeout(() => setSuccess(''), 3000);
                } catch (err) {
                    console.error('[2FA Modal] Failed to send initial code:', err.response?.data || err.message);
                    setError(err.response?.data?.error || 'Failed to send verification code');
                } finally {
                    setResendLoading(false);
                }
            };
            sendInitialCode();
        }

        // Reset the flag when modal closes
        if (!isOpen) {
            initialCodeSent.current = false;
        }
    }, [isOpen, tempToken, isBackupMode, selectedMethod, method]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Handle code input
    const handleCodeChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits entered
        if (value && index === 5 && newCode.every(d => d !== '')) {
            handleVerify(newCode.join(''));
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newCode = pastedData.split('');
            setCode(newCode);
            inputRefs.current[5]?.focus();
            handleVerify(pastedData);
        }
    };

    // Verify code
    const handleVerify = async (codeString) => {
        const verifyCode = codeString || code.join('');

        if (!isBackupMode && verifyCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        if (isBackupMode && !backupCode.trim()) {
            setError('Please enter your backup code');
            return;
        }

        setLoading(true);
        setError('');

        console.log('[2FA Modal] Verifying code...');

        try {
            const response = await api.post('/2fa/verify-login', {
                tempToken,
                code: isBackupMode ? backupCode.trim() : verifyCode,
                isBackupCode: isBackupMode
            });

            console.log('[2FA Modal] Response:', response.data);

            if (response.data.success) {
                setSuccess('Verification successful!');
                console.log('[2FA Modal] Verification successful, calling onSuccess...');
                setTimeout(() => {
                    onSuccess(response.data);
                }, 500);
            }
        } catch (err) {
            console.error('[2FA Modal] Verification error:', err.response?.data || err.message);
            const errorMsg = err.response?.data?.msg || err.response?.data?.error || 'Verification failed';
            setError(errorMsg);

            // Clear code on error
            if (!isBackupMode) {
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } finally {
            setLoading(false);
        }
    };

    // Resend code
    const handleResend = async () => {
        if (countdown > 0 || resendLoading) return;

        setResendLoading(true);
        setError('');

        try {
            await api.post('/2fa/send-login-code', {
                tempToken,
                method: selectedMethod
            });

            setSuccess(`Code sent to your ${selectedMethod === 'email' ? 'email' : 'phone'}!`);
            setCountdown(60); // 60 second cooldown
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    // Switch to backup code mode
    const toggleBackupMode = () => {
        setIsBackupMode(!isBackupMode);
        setError('');
        setCode(['', '', '', '', '', '']);
        setBackupCode('');
    };

    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <CloseButton onClick={onClose}>
                    <X size={20} />
                </CloseButton>

                <ModalContent>
                    <IconWrapper>
                        <Shield size={35} color="white" />
                    </IconWrapper>

                    <Title>{isBackupMode ? 'Backup Code' : 'Two-Factor Authentication'}</Title>
                    <Subtitle>
                        {isBackupMode
                            ? 'Enter one of your backup codes to verify your identity'
                            : `Enter the 6-digit code sent to your ${selectedMethod === 'email' ? 'email' : 'phone'}`
                        }
                    </Subtitle>

                    {/* Method selector for 'both' */}
                    {method === 'both' && !isBackupMode && (
                        <MethodSelector>
                            <MethodButton
                                active={selectedMethod === 'email'}
                                onClick={() => setSelectedMethod('email')}
                            >
                                <Mail size={18} />
                                Email
                            </MethodButton>
                            <MethodButton
                                active={selectedMethod === 'sms'}
                                onClick={() => setSelectedMethod('sms')}
                            >
                                <Smartphone size={18} />
                                SMS
                            </MethodButton>
                        </MethodSelector>
                    )}

                    {/* Method badge */}
                    {!isBackupMode && method !== 'both' && (
                        <div style={{ textAlign: 'center' }}>
                            <MethodBadge>
                                {method === 'email' ? <Mail size={16} /> : <Smartphone size={16} />}
                                {method === 'email' ? email : phone}
                            </MethodBadge>
                        </div>
                    )}

                    {error && (
                        <ErrorMessage>
                            <AlertCircle size={18} />
                            {error}
                        </ErrorMessage>
                    )}

                    {success && (
                        <SuccessMessage>
                            <CheckCircle size={18} />
                            {success}
                        </SuccessMessage>
                    )}

                    {isBackupMode ? (
                        // Backup code input
                        <div style={{ marginBottom: '1.5rem' }}>
                            <CodeInput
                                as="input"
                                type="text"
                                style={{ width: '100%', height: 'auto', padding: '1rem' }}
                                placeholder="Enter backup code"
                                value={backupCode}
                                onChange={(e) => {
                                    setBackupCode(e.target.value);
                                    setError('');
                                }}
                                hasValue={backupCode.length > 0}
                            />
                        </div>
                    ) : (
                        // 6-digit code input
                        <CodeInputContainer onPaste={handlePaste}>
                            {code.map((digit, index) => (
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
                                    placeholder="•"
                                />
                            ))}
                        </CodeInputContainer>
                    )}

                    <SubmitButton
                        onClick={() => handleVerify()}
                        disabled={loading || (!isBackupMode && code.some(d => d === '')) || (isBackupMode && !backupCode.trim())}
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={20} style={{ animation: `${spin} 1s linear infinite` }} />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <Shield size={20} />
                                Verify
                            </>
                        )}
                    </SubmitButton>

                    <SecondaryActions>
                        {!isBackupMode && (
                            <ResendButton
                                onClick={handleResend}
                                disabled={countdown > 0 || resendLoading}
                                loading={resendLoading}
                            >
                                <RefreshCw size={16} />
                                {countdown > 0
                                    ? `Resend in ${countdown}s`
                                    : resendLoading
                                        ? 'Sending...'
                                        : 'Resend Code'
                                }
                            </ResendButton>
                        )}

                        <BackupCodeLink onClick={toggleBackupMode}>
                            <Key size={14} />
                            {isBackupMode ? 'Use verification code instead' : 'Use backup code'}
                        </BackupCodeLink>
                    </SecondaryActions>
                </ModalContent>
            </Modal>
        </Overlay>
    );
};

export default TwoFactorModal;
