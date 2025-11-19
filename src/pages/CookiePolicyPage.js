// client/src/pages/CookiePolicyPage.js - LEGENDARY COOKIE POLICY PAGE

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    Cookie, Shield, Eye, Settings, Lock, FileText,
    CheckCircle, AlertTriangle, Info, Clock, Mail,
    Globe, ToggleLeft, Database, Target, Zap
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

const float = keyframes`
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 6rem 2rem 4rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    max-width: 900px;
    margin: 0 auto 4rem;
    text-align: center;
    animation: ${fadeIn} 0.8s ease-out;
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(217, 119, 6, 0.2) 0%, rgba(180, 83, 9, 0.2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(217, 119, 6, 0.3);
    animation: ${float} 3s ease-in-out infinite;

    @media (max-width: 768px) {
        width: 60px;
        height: 60px;
    }
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 900;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        font-size: 1rem;
    }
`;

const LastUpdated = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(217, 119, 6, 0.15);
    border: 1px solid rgba(217, 119, 6, 0.3);
    border-radius: 20px;
    color: #f59e0b;
    font-size: 0.9rem;
    font-weight: 600;
`;

const ContentWrapper = styled.div`
    max-width: 900px;
    margin: 0 auto;
`;

const TableOfContents = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(217, 119, 6, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out 0.2s backwards;
`;

const TOCTitle = styled.h3`
    color: #f59e0b;
    font-size: 1.3rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const TOCList = styled.ul`
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const TOCItem = styled.li`
    a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: rgba(217, 119, 6, 0.05);
        border: 1px solid rgba(217, 119, 6, 0.2);
        border-radius: 10px;
        color: #94a3b8;
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(217, 119, 6, 0.15);
            border-color: rgba(217, 119, 6, 0.4);
            color: #f59e0b;
            transform: translateX(5px);
        }
    }
`;

const Section = styled.section`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(217, 119, 6, 0.3);
    border-radius: 16px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    animation: ${slideIn} 0.5s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #d97706, #f59e0b);
    }

    @media (max-width: 768px) {
        padding: 1.5rem;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: start;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
`;

const SectionIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(217, 119, 6, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f59e0b;
    flex-shrink: 0;
`;

const SectionTitle = styled.h2`
    color: #f59e0b;
    font-size: 1.8rem;
    font-weight: 700;
    flex: 1;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const SectionContent = styled.div`
    color: #cbd5e1;
    font-size: 1rem;
    line-height: 1.8;

    p {
        margin-bottom: 1rem;
    }

    strong {
        color: #e0e6ed;
        font-weight: 700;
    }

    a {
        color: #00adef;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;

        &:hover {
            color: #00ff88;
            text-decoration: underline;
        }
    }
`;

const BulletList = styled.ul`
    list-style: none;
    padding-left: 0;
    margin: 1rem 0;

    li {
        margin-bottom: 0.75rem;
        padding-left: 2rem;
        position: relative;
        color: #cbd5e1;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.6rem;
            width: 8px;
            height: 8px;
            background: #f59e0b;
            border-radius: 50%;
        }

        strong {
            color: #e0e6ed;
        }
    }
`;

const CookieTypeCard = styled.div`
    background: rgba(217, 119, 6, 0.05);
    border: 1px solid rgba(217, 119, 6, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(217, 119, 6, 0.1);
        border-color: rgba(217, 119, 6, 0.3);
        transform: translateX(5px);
    }
`;

const CookieTypeHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const CookieTypeTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const CookieTypeIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(217, 119, 6, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f59e0b;
`;

const CookieTypeName = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 1.1rem;
`;

const CookieTypeBadge = styled.div`
    padding: 0.25rem 0.75rem;
    background: ${props => props.$required ? 
        'rgba(16, 185, 129, 0.2)' : 
        'rgba(100, 116, 139, 0.2)'
    };
    border: 1px solid ${props => props.$required ? 
        'rgba(16, 185, 129, 0.5)' : 
        'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 12px;
    color: ${props => props.$required ? '#10b981' : '#94a3b8'};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
`;

const CookieTypeDescription = styled.div`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
`;

const CookieTypeDetails = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(217, 119, 6, 0.1);
`;

const InfoBox = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    display: flex;
    gap: 1rem;
    align-items: start;
`;

const InfoIcon = styled.div`
    color: #00adef;
    flex-shrink: 0;
`;

const InfoContent = styled.div`
    flex: 1;
    color: #94a3b8;
    line-height: 1.6;

    strong {
        color: #00adef;
    }

    a {
        color: #00adef;
        font-weight: 600;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
`;

const HighlightBox = styled.div`
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    display: flex;
    gap: 1rem;
    align-items: start;
`;

const HighlightIcon = styled.div`
    color: #10b981;
    flex-shrink: 0;
`;

const HighlightContent = styled.div`
    flex: 1;
    color: #6ee7b7;
    line-height: 1.6;

    strong {
        color: #10b981;
    }
`;

const WarningBox = styled.div`
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    display: flex;
    gap: 1rem;
    align-items: start;
`;

const WarningIcon = styled.div`
    color: #f59e0b;
    flex-shrink: 0;
`;

const WarningContent = styled.div`
    flex: 1;
    color: #fbbf24;
    line-height: 1.6;

    strong {
        color: #f59e0b;
    }
`;

const ContactSection = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2.5rem;
    margin-top: 3rem;
    text-align: center;
    animation: ${fadeIn} 0.8s ease-out;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #00adef, #00ff88);
    }
`;

const ContactTitle = styled.h3`
    color: #00adef;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
`;

const ContactInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
`;

const ContactItem = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    text-decoration: none;
    transition: all 0.3s ease;
    font-weight: 600;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        border-color: rgba(0, 173, 237, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.3);
    }
`;

// ============ COMPONENT ============
const CookiePolicyPage = () => {
    return (
        <PageContainer>
            <Header>
                <TitleContainer>
                    <IconWrapper>
                        <Cookie size={48} color="#f59e0b" />
                    </IconWrapper>
                    <Title>Cookie Policy</Title>
                </TitleContainer>
                <Subtitle>
                    Learn about how Nexus Signal.AI uses cookies and similar technologies to enhance your 
                    experience and analyze platform usage.
                </Subtitle>
                <LastUpdated>
                    <Clock size={16} />
                    Last Updated: October 01, 2025
                </LastUpdated>
            </Header>

            <ContentWrapper>
                {/* TABLE OF CONTENTS */}
                <TableOfContents>
                    <TOCTitle>
                        <FileText size={20} />
                        Quick Navigation
                    </TOCTitle>
                    <TOCList>
                        <TOCItem><a href="#what-are-cookies"><Cookie size={16} /> What Are Cookies?</a></TOCItem>
                        <TOCItem><a href="#how-we-use"><Target size={16} /> How We Use Cookies</a></TOCItem>
                        <TOCItem><a href="#types"><Database size={16} /> Types of Cookies</a></TOCItem>
                        <TOCItem><a href="#third-party"><Globe size={16} /> Third-Party Cookies</a></TOCItem>
                        <TOCItem><a href="#manage"><Settings size={16} /> Managing Cookies</a></TOCItem>
                        <TOCItem><a href="#contact"><Mail size={16} /> Contact Us</a></TOCItem>
                    </TOCList>
                </TableOfContents>

                {/* SECTION 1 */}
                <Section id="what-are-cookies">
                    <SectionHeader>
                        <SectionIcon>
                            <Cookie size={24} />
                        </SectionIcon>
                        <SectionTitle>1. What Are Cookies?</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you 
                            visit a website. They are widely used to make websites work more efficiently and provide information to 
                            website owners.
                        </p>

                        <HighlightBox>
                            <HighlightIcon>
                                <Info size={24} />
                            </HighlightIcon>
                            <HighlightContent>
                                <strong>Good to Know:</strong> Cookies help us remember your preferences, understand how you use our 
                                platform, and improve your overall experience. Most cookies do not collect personal information that 
                                identifies you.
                            </HighlightContent>
                        </HighlightBox>

                        <p><strong>Cookies typically contain:</strong></p>
                        <BulletList>
                            <li>The name of the website that placed the cookie</li>
                            <li>An expiration date (some cookies only last for the duration of your visit)</li>
                            <li>A unique random number to identify your device</li>
                            <li>Information about your preferences and settings</li>
                        </BulletList>
                    </SectionContent>
                </Section>

                {/* SECTION 2 */}
                <Section id="how-we-use">
                    <SectionHeader>
                        <SectionIcon>
                            <Target size={24} />
                        </SectionIcon>
                        <SectionTitle>2. How We Use Cookies</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            At Nexus Signal.AI, we use cookies to provide you with the best possible experience and to help us 
                            improve our services. Here's how we use them:
                        </p>

                        <BulletList>
                            <li>
                                <strong>Authentication:</strong> To identify you when you log in and keep you signed in across multiple pages
                            </li>
                            <li>
                                <strong>Security:</strong> To detect and prevent fraud, abuse, and unauthorized access to your account
                            </li>
                            <li>
                                <strong>Preferences:</strong> To remember your settings, such as theme preferences and display options
                            </li>
                            <li>
                                <strong>Performance:</strong> To analyze how our platform is used and identify areas for improvement
                            </li>
                            <li>
                                <strong>Functionality:</strong> To enable features like watchlists, portfolios, and personalized content
                            </li>
                            <li>
                                <strong>Analytics:</strong> To understand user behavior and optimize the platform experience
                            </li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <Shield size={20} />
                            </InfoIcon>
                            <InfoContent>
                                <strong>Your Privacy Matters:</strong> We use cookies responsibly and in accordance with our 
                                <a href="/privacy-policy"> Privacy Policy</a>. We never sell your data to third parties.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 3 */}
                <Section id="types">
                    <SectionHeader>
                        <SectionIcon>
                            <Database size={24} />
                        </SectionIcon>
                        <SectionTitle>3. Types of Cookies We Use</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>We use several different types of cookies on our platform:</p>

                        {/* Essential Cookies */}
                        <CookieTypeCard>
                            <CookieTypeHeader>
                                <CookieTypeTitle>
                                    <CookieTypeIcon>
                                        <Lock size={20} />
                                    </CookieTypeIcon>
                                    <CookieTypeName>Essential Cookies</CookieTypeName>
                                </CookieTypeTitle>
                                <CookieTypeBadge $required>Required</CookieTypeBadge>
                            </CookieTypeHeader>
                            <CookieTypeDescription>
                                These cookies are necessary for the platform to function properly. They enable core functionality 
                                such as security, network management, and accessibility. You cannot opt out of these cookies.
                            </CookieTypeDescription>
                            <CookieTypeDetails>
                                <strong>Examples:</strong> Authentication tokens, session management, security features
                            </CookieTypeDetails>
                        </CookieTypeCard>

                        {/* Preference Cookies */}
                        <CookieTypeCard>
                            <CookieTypeHeader>
                                <CookieTypeTitle>
                                    <CookieTypeIcon>
                                        <Settings size={20} />
                                    </CookieTypeIcon>
                                    <CookieTypeName>Preference Cookies</CookieTypeName>
                                </CookieTypeTitle>
                                <CookieTypeBadge>Optional</CookieTypeBadge>
                            </CookieTypeHeader>
                            <CookieTypeDescription>
                                These cookies allow the platform to remember your choices and provide enhanced, personalized features. 
                                For example, remembering your username, theme preferences, or language settings.
                            </CookieTypeDescription>
                            <CookieTypeDetails>
                                <strong>Examples:</strong> Theme settings, language preferences, display options
                            </CookieTypeDetails>
                        </CookieTypeCard>

                        {/* Analytics Cookies */}
                        <CookieTypeCard>
                            <CookieTypeHeader>
                                <CookieTypeTitle>
                                    <CookieTypeIcon>
                                        <Eye size={20} />
                                    </CookieTypeIcon>
                                    <CookieTypeName>Analytics Cookies</CookieTypeName>
                                </CookieTypeTitle>
                                <CookieTypeBadge>Optional</CookieTypeBadge>
                            </CookieTypeHeader>
                            <CookieTypeDescription>
                                These cookies help us understand how visitors interact with our platform by collecting and reporting 
                                information anonymously. This helps us improve the platform experience.
                            </CookieTypeDescription>
                            <CookieTypeDetails>
                                <strong>Examples:</strong> Page views, session duration, feature usage, error tracking
                            </CookieTypeDetails>
                        </CookieTypeCard>

                        {/* Performance Cookies */}
                        <CookieTypeCard>
                            <CookieTypeHeader>
                                <CookieTypeTitle>
                                    <CookieTypeIcon>
                                        <Zap size={20} />
                                    </CookieTypeIcon>
                                    <CookieTypeName>Performance Cookies</CookieTypeName>
                                </CookieTypeTitle>
                                <CookieTypeBadge>Optional</CookieTypeBadge>
                            </CookieTypeHeader>
                            <CookieTypeDescription>
                                These cookies collect information about how you use our platform, such as which pages you visit most 
                                often and if you receive error messages. All information collected is aggregated and anonymous.
                            </CookieTypeDescription>
                            <CookieTypeDetails>
                                <strong>Examples:</strong> Load times, page speed, browser compatibility
                            </CookieTypeDetails>
                        </CookieTypeCard>
                    </SectionContent>
                </Section>

                {/* SECTION 4 */}
                <Section id="third-party">
                    <SectionHeader>
                        <SectionIcon>
                            <Globe size={24} />
                        </SectionIcon>
                        <SectionTitle>4. Third-Party Cookies</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            In addition to our own cookies, we may also use various third-party cookies to help us analyze platform 
                            usage and provide additional functionality.
                        </p>

                        <p><strong>Third-party services we use may include:</strong></p>
                        <BulletList>
                            <li>
                                <strong>Google Analytics:</strong> To analyze website traffic and user behavior
                            </li>
                            <li>
                                <strong>Payment Processors (Stripe):</strong> To securely process payments and subscriptions
                            </li>
                            <li>
                                <strong>Content Delivery Networks (CDNs):</strong> To deliver content quickly and efficiently
                            </li>
                            <li>
                                <strong>Customer Support Tools:</strong> To provide live chat and support services
                            </li>
                        </BulletList>

                        <WarningBox>
                            <WarningIcon>
                                <AlertTriangle size={20} />
                            </WarningIcon>
                            <WarningContent>
                                <strong>Note:</strong> Third-party cookies are subject to the privacy policies of those third parties. 
                                We recommend reviewing their privacy policies to understand how they use cookies.
                            </WarningContent>
                        </WarningBox>
                    </SectionContent>
                </Section>

                {/* SECTION 5 */}
                <Section id="manage">
                    <SectionHeader>
                        <SectionIcon>
                            <Settings size={24} />
                        </SectionIcon>
                        <SectionTitle>5. Managing Your Cookie Preferences</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences 
                            through your browser settings or through our cookie consent tool.
                        </p>

                        <p><strong>Browser Settings:</strong></p>
                        <p>
                            Most web browsers allow you to control cookies through their settings. Here's how to manage cookies in 
                            popular browsers:
                        </p>
                        <BulletList>
                            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                            <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                            <li><strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <ToggleLeft size={20} />
                            </InfoIcon>
                            <InfoContent>
                                <strong>Account Settings:</strong> You can also manage cookie preferences through your 
                                <a href="/settings"> Account Settings</a> page.
                            </InfoContent>
                        </InfoBox>

                        <WarningBox>
                            <WarningIcon>
                                <AlertTriangle size={20} />
                            </WarningIcon>
                            <WarningContent>
                                <strong>Important:</strong> If you choose to disable all cookies, some features of our platform may not 
                                function properly. Essential cookies are required for basic functionality and cannot be disabled.
                            </WarningContent>
                        </WarningBox>

                        <p><strong>Mobile Devices:</strong></p>
                        <BulletList>
                            <li><strong>iOS:</strong> Settings → Safari → Block All Cookies</li>
                            <li><strong>Android:</strong> Settings → Site settings → Cookies</li>
                        </BulletList>
                    </SectionContent>
                </Section>

                {/* SECTION 6 */}
                <Section id="changes">
                    <SectionHeader>
                        <SectionIcon>
                            <FileText size={24} />
                        </SectionIcon>
                        <SectionTitle>6. Changes to This Cookie Policy</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our 
                            business practices. When we make changes:
                        </p>

                        <BulletList>
                            <li>We will update the "Last Updated" date at the top of this policy</li>
                            <li>For significant changes, we will provide prominent notice on our platform</li>
                            <li>We may also notify you via email if you have opted in to notifications</li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <CheckCircle size={20} />
                            </InfoIcon>
                            <InfoContent>
                                We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* CONTACT SECTION */}
                <ContactSection id="contact">
                    <ContactTitle>
                        <Mail size={24} />
                        Questions About Cookies?
                    </ContactTitle>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        If you have any questions about our use of cookies or this Cookie Policy, please don't hesitate to contact us.
                    </p>
                    <ContactInfo>
                        <ContactItem href="mailto:support@nexussignal.ai">
                            <Mail size={18} />
                            support@nexussignal.ai
                        </ContactItem>
                        <ContactItem href="/contact">
                            <Globe size={18} />
                            Visit Our Contact Page
                        </ContactItem>
                    </ContactInfo>
                </ContactSection>
            </ContentWrapper>
        </PageContainer>
    );
};

export default CookiePolicyPage;