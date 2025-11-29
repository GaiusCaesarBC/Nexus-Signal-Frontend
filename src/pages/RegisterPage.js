// client/src/pages/RegisterPage.js - THE MOST LEGENDARY REGISTER PAGE EVER CREATED
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { UserPlus, User, Mail, Lock, ArrowRight, Zap, Shield, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ============ INSANE ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
`;

const buttonGlow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.5); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 1); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-120vh) translateX(80px) scale(0) rotate(360deg); opacity: 0; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const neonGlow = keyframes`
    0%, 100% {
        text-shadow: 
            0 0 10px rgba(0, 173, 237, 0.8),
            0 0 20px rgba(0, 173, 237, 0.6),
            0 0 40px rgba(0, 173, 237, 0.4);
    }
    50% {
        text-shadow: 
            0 0 20px rgba(0, 173, 237, 1),
            0 0 40px rgba(0, 173, 237, 0.8),
            0 0 80px rgba(0, 173, 237, 0.6);
    }
`;

const ripple = keyframes`
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const progressFill = keyframes`
    from { width: 0%; }
    to { width: 100%; }
`;

// ============ STYLED COMPONENTS ============
const RegisterPageContainer = styled.div`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding-top: 100px;
    background: transparent;
    color: ${({ theme }) => theme.text?.primary || '#f8fafc'};
    position: relative;
    overflow: hidden;
    padding: 2rem;
    z-index: 1;
`;

// Animated background particles
const ParticleContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background: ${props => props.color};
    border-radius: 50%;
    animation: ${particles} ${props => props.duration}s linear infinite;
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    bottom: 0;
    opacity: 0.7;
    filter: blur(1px);
    box-shadow: 0 0 20px ${props => props.color};
`;

// Floating geometric shapes
const FloatingShape = styled.div`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    border: 2px solid ${props => props.color};
    border-radius: ${props => props.rounded ? '50%' : '0'};
    opacity: 0.1;
    animation: ${float} ${props => props.duration}s ease-in-out infinite;
    animation-delay: ${props => props.delay}s;
    top: ${props => props.top}%;
    left: ${props => props.left}%;
    z-index: 0;
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 550px;
`;

const RegisterFormCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 3.5rem 3rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    border: 2px solid rgba(0, 173, 237, 0.4);
    text-align: center;
    width: 100%;
    animation: ${fadeIn} 1s ease-out forwards;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
        z-index: 0;
    }

    @media (max-width: 768px) {
        padding: 2.5rem 2rem;
    }
`;

const CardContent = styled.div`
    position: relative;
    z-index: 1;
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, #00adef, #0088cc);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 173, 237, 0.5);
    animation: ${float} 3s ease-in-out infinite, ${pulse} 2s ease-in-out infinite;
    position: relative;

    &::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: inherit;
        border-radius: inherit;
        opacity: 0;
        animation: ${ripple} 2s ease-out infinite;
    }
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #00adef;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
    animation: ${neonGlow} 3s ease-in-out infinite;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2rem;
    }
`;

const Subtitle = styled.p`
    font-size: 1rem;
    color: #94a3b8;
    margin-bottom: 2.5rem;
`;

const FormGroup = styled.div`
    margin-bottom: 1.5rem;
    text-align: left;
    position: relative;
    animation: ${slideInLeft} 0.6s ease-out;
    animation-delay: ${props => props.delay}s;
    animation-fill-mode: backwards;

    label {
        display: block;
        font-size: 0.95rem;
        color: #cbd5e1;
        margin-bottom: 0.6rem;
        font-weight: 600;
    }
`;

const InputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const InputIcon = styled.div`
    position: absolute;
    left: 1.2rem;
    color: #64748b;
    display: flex;
    align-items: center;
    z-index: 2;
    transition: all 0.3s ease;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 1rem 1.2rem 1rem 3.5rem;
    background: rgba(10, 14, 39, 0.8);
    border: 2px solid ${props => {
        if (props.$hasError) return 'rgba(239, 68, 68, 0.5)';
        if (props.$hasSuccess) return 'rgba(16, 185, 129, 0.5)';
        return 'rgba(0, 173, 237, 0.3)';
    }};
    border-radius: 12px;
    color: #f8fafc;
    font-size: 1rem;
    transition: all 0.3s ease;
    font-weight: 500;

    &:focus {
        border-color: ${props => props.$hasError ? '#ef4444' : '#00adef'};
        box-shadow: 0 0 0 4px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 173, 237, 0.2)'};
        outline: none;
        background: rgba(10, 14, 39, 0.95);
    }

    &:focus + ${InputIcon} {
        color: ${props => props.$hasError ? '#ef4444' : '#00adef'};
    }

    &::placeholder {
        color: #64748b;
    }
`;

const PasswordToggle = styled.button`
    position: absolute;
    right: 1.2rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    z-index: 2;
    transition: all 0.3s ease;

    &:hover {
        color: #00adef;
    }
`;

const ValidationIcon = styled.div`
    position: absolute;
    right: ${props => props.hasToggle ? '3.5rem' : '1.2rem'};
    display: flex;
    align-items: center;
    z-index: 2;
`;

const PasswordStrengthBar = styled.div`
    height: 6px;
    background: rgba(100, 116, 139, 0.3);
    border-radius: 3px;
    margin-top: 0.5rem;
    overflow: hidden;
    position: relative;
`;

const PasswordStrengthFill = styled.div`
    height: 100%;
    width: ${props => props.strength}%;
    background: ${props => {
        if (props.strength < 33) return 'linear-gradient(90deg, #ef4444, #dc2626)';
        if (props.strength < 66) return 'linear-gradient(90deg, #f59e0b, #d97706)';
        return 'linear-gradient(90deg, #10b981, #059669)';
    }};
    border-radius: 3px;
    transition: all 0.3s ease;
    animation: ${progressFill} 0.5s ease-out;
`;

const PasswordStrengthLabel = styled.div`
    font-size: 0.85rem;
    color: ${props => {
        if (props.strength < 33) return '#ef4444';
        if (props.strength < 66) return '#f59e0b';
        return '#10b981';
    }};
    margin-top: 0.3rem;
    font-weight: 600;
`;

const ErrorMessage = styled.div`
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #ef4444;
    padding: 0.9rem 1.2rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    animation: ${fadeIn} 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SuccessMessage = styled.div`
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #10b981;
    padding: 0.9rem 1.2rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    animation: ${fadeIn} 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StyledButton = styled.button`
    width: 100%;
    padding: 1.2rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    border-radius: 12px;
    color: #f8fafc;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1rem;
    box-shadow: 0 8px 25px rgba(0, 173, 237, 0.5);
    animation: ${buttonGlow} 2s infinite ease-in-out, ${slideInRight} 0.6s ease-out 0.6s backwards;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, #0088cc 0%, #00adef 100%);
        box-shadow: 0 12px 35px rgba(0, 173, 237, 0.7);
        transform: translateY(-3px) scale(1.02);
    }

    &:active:not(:disabled) {
        transform: translateY(-1px) scale(1);
    }

    &:disabled {
        background: linear-gradient(135deg, #4a5568, #374151);
        cursor: not-allowed;
        box-shadow: none;
        animation: none;
    }
`;

const LinksContainer = styled.div`
    margin-top: 2rem;
    font-size: 0.95rem;
    animation: ${fadeIn} 0.8s ease-out 0.8s backwards;
`;

const StyledLink = styled(Link)`
    color: #00adef;
    text-decoration: none;
    transition: all 0.3s ease;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 8px;

    &:hover {
        color: #f8fafc;
        background: rgba(0, 173, 237, 0.1);
    }
`;

const FeatureBadges = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    flex-wrap: wrap;
`;

const FeatureBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
    animation: ${fadeIn} 0.8s ease-out;
    animation-delay: ${props => props.delay}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-3px);
        background: rgba(0, 173, 237, 0.2);
        box-shadow: 0 8px 20px rgba(0, 173, 237, 0.3);
    }
`;

// ============ COMPONENT ============
const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [particles, setParticles] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [validations, setValidations] = useState({
        username: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const { login } = useAuth();
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

    // Generate background particles and shapes on mount
    useEffect(() => {
        const newParticles = Array.from({ length: 35 }, (_, i) => ({
            id: i,
            size: Math.random() * 6 + 3,
            left: Math.random() * 100,
            duration: Math.random() * 8 + 12,
            delay: Math.random() * 5,
            color: ['#00adef', '#8b5cf6', '#00ff88', '#10b981'][Math.floor(Math.random() * 4)]
        }));
        setParticles(newParticles);

        const newShapes = Array.from({ length: 7 }, (_, i) => ({
            id: i,
            size: Math.random() * 150 + 50,
            top: Math.random() * 100,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 3,
            rounded: Math.random() > 0.5,
            color: ['rgba(0, 173, 237, 0.3)', 'rgba(139, 92, 246, 0.3)', 'rgba(16, 185, 129, 0.3)'][Math.floor(Math.random() * 3)]
        }));
        setShapes(newShapes);
    }, []);

    // Calculate password strength
    useEffect(() => {
        if (!password) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 10) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 15;
        if (/[^a-zA-Z\d]/.test(password)) strength += 10;

        setPasswordStrength(Math.min(strength, 100));
    }, [password]);

    // Validate fields in real-time
    useEffect(() => {
        setValidations({
            username: username.length >= 3,
            email: /\S+@\S+\.\S+/.test(email),
            password: password.length >= 6,
            confirmPassword: confirmPassword && password === confirmPassword
        });
    }, [username, email, password, confirmPassword]);

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
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email address is invalid.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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

            setSuccess('🎉 Registration successful! Redirecting to dashboard...');

            if (response.data.token) {
                login(response.data.token);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            console.error('Registration error:', err.response ? err.response.data : err.message);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength < 33) return 'Weak';
        if (passwordStrength < 66) return 'Medium';
        return 'Strong';
    };

    return (
        <RegisterPageContainer>
            {/* Animated Background Elements */}
            <ParticleContainer>
                {particles.map(particle => (
                    <Particle
                        key={particle.id}
                        size={particle.size}
                        left={particle.left}
                        duration={particle.duration}
                        delay={particle.delay}
                        color={particle.color}
                    />
                ))}
                {shapes.map(shape => (
                    <FloatingShape
                        key={shape.id}
                        size={shape.size}
                        top={shape.top}
                        left={shape.left}
                        duration={shape.duration}
                        delay={shape.delay}
                        rounded={shape.rounded}
                        color={shape.color}
                    />
                ))}
            </ParticleContainer>

            <ContentWrapper>
                <RegisterFormCard>
                    <CardContent>
                        <IconWrapper>
                            <UserPlus size={40} color="white" />
                        </IconWrapper>
                        <Title>Join Nexus Signal</Title>
                        <Subtitle>Create your account to unlock advanced trading insights</Subtitle>

                        <form onSubmit={handleSubmit}>
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

                            <FormGroup delay={0.2}>
                                <label htmlFor="username">Username</label>
                                <InputWrapper>
                                    <StyledInput
                                        type="text"
                                        id="username"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        $hasSuccess={username && validations.username}
                                        required
                                    />
                                    <InputIcon>
                                        <User size={20} />
                                    </InputIcon>
                                    {username && (
                                        <ValidationIcon>
                                            {validations.username ? (
                                                <CheckCircle size={20} color="#10b981" />
                                            ) : (
                                                <XCircle size={20} color="#ef4444" />
                                            )}
                                        </ValidationIcon>
                                    )}
                                </InputWrapper>
                            </FormGroup>

                            <FormGroup delay={0.3}>
                                <label htmlFor="email">Email Address</label>
                                <InputWrapper>
                                    <StyledInput
                                        type="email"
                                        id="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        $hasSuccess={email && validations.email}
                                        $hasError={email && !validations.email}
                                        required
                                    />
                                    <InputIcon>
                                        <Mail size={20} />
                                    </InputIcon>
                                    {email && (
                                        <ValidationIcon>
                                            {validations.email ? (
                                                <CheckCircle size={20} color="#10b981" />
                                            ) : (
                                                <XCircle size={20} color="#ef4444" />
                                            )}
                                        </ValidationIcon>
                                    )}
                                </InputWrapper>
                            </FormGroup>

                            <FormGroup delay={0.4}>
                                <label htmlFor="password">Password</label>
                                <InputWrapper>
                                    <StyledInput
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        $hasSuccess={password && validations.password}
                                        $hasError={password && !validations.password}
                                        required
                                    />
                                    <InputIcon>
                                        <Lock size={20} />
                                    </InputIcon>
                                    <PasswordToggle
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </PasswordToggle>
                                </InputWrapper>
                                {password && (
                                    <>
                                        <PasswordStrengthBar>
                                            <PasswordStrengthFill strength={passwordStrength} />
                                        </PasswordStrengthBar>
                                        <PasswordStrengthLabel strength={passwordStrength}>
                                            {getPasswordStrengthLabel()}
                                        </PasswordStrengthLabel>
                                    </>
                                )}
                            </FormGroup>

                            <FormGroup delay={0.5}>
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <InputWrapper>
                                    <StyledInput
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        $hasSuccess={confirmPassword && validations.confirmPassword}
                                        $hasError={confirmPassword && !validations.confirmPassword}
                                        required
                                    />
                                    <InputIcon>
                                        <Lock size={20} />
                                    </InputIcon>
                                    {confirmPassword && (
                                        <ValidationIcon hasToggle>
                                            {validations.confirmPassword ? (
                                                <CheckCircle size={20} color="#10b981" />
                                            ) : (
                                                <XCircle size={20} color="#ef4444" />
                                            )}
                                        </ValidationIcon>
                                    )}
                                    <PasswordToggle
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </PasswordToggle>
                                </InputWrapper>
                            </FormGroup>

                            <StyledButton type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <div style={{ animation: `${rotate} 1s linear infinite` }}>
                                            <Zap size={20} />
                                        </div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </StyledButton>
                        </form>

                        <LinksContainer>
                            Already have an account?{' '}
                            <StyledLink to="/login">
                                Login here
                            </StyledLink>
                        </LinksContainer>

                        <FeatureBadges>
                            <FeatureBadge delay={1.0}>
                                <Shield size={14} />
                                Secure & Encrypted
                            </FeatureBadge>
                            <FeatureBadge delay={1.1}>
                                <Zap size={14} />
                                Instant Setup
                            </FeatureBadge>
                        </FeatureBadges>
                    </CardContent>
                </RegisterFormCard>
            </ContentWrapper>
        </RegisterPageContainer>
    );
};

export default RegisterPage;