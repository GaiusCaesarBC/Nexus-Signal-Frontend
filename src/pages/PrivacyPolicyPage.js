// client/src/pages/PrivacyPolicyPage.js - LEGENDARY PRIVACY POLICY PAGE

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    Shield, Cookie, Mail, UserCheck, Lock, Eye, Database,
    FileText, CheckCircle, AlertTriangle, Globe, Server,
    Users, Settings, Bell, Clock, User, Activity
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

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: transparent;
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
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 136, 204, 0.2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(0, 173, 237, 0.3);

    @media (max-width: 768px) {
        width: 60px;
        height: 60px;
    }
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
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
    background: rgba(0, 173, 237, 0.15);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.9rem;
    font-weight: 600;
`;

const ContentWrapper = styled.div`
    max-width: 900px;
    margin: 0 auto;
`;

const TableOfContents = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out 0.2s backwards;
`;

const TOCTitle = styled.h3`
    color: #00adef;
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
        background: rgba(0, 173, 237, 0.05);
        border: 1px solid rgba(0, 173, 237, 0.2);
        border-radius: 10px;
        color: #94a3b8;
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(0, 173, 237, 0.15);
            border-color: rgba(0, 173, 237, 0.4);
            color: #00adef;
            transform: translateX(5px);
        }
    }
`;

const Section = styled.section`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.3);
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
        background: linear-gradient(90deg, #00adef, #00ff88);
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
    background: rgba(0, 173, 237, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00adef;
    flex-shrink: 0;
`;

const SectionTitle = styled.h2`
    color: #00adef;
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

const Subsection = styled.div`
    margin-top: 1.5rem;
    padding-left: 1rem;
    border-left: 3px solid rgba(0, 173, 237, 0.3);
`;

const SubsectionTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    font-weight: 700;
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
            background: #00adef;
            border-radius: 50%;
        }

        strong {
            color: #e0e6ed;
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

    a {
        color: #00adef;
        font-weight: 600;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
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

const DataTypeCard = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const DataTypeHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
`;

const DataTypeIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(0, 173, 237, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00adef;
`;

const DataTypeTitle = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    font-size: 1.1rem;
`;

const DataTypeDescription = styled.div`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.6;
`;

const ContactSection = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
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
const PrivacyPolicyPage = () => {
    return (
        <PageContainer>
            <Header>
                <TitleContainer>
                    <IconWrapper>
                        <Shield size={48} color="#00adef" />
                    </IconWrapper>
                    <Title>Privacy Policy</Title>
                </TitleContainer>
                <Subtitle>
                    Your privacy is critically important to us. This Privacy Policy describes how Nexus Signal.AI collects, 
                    uses, and protects your personal information when you use our platform.
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
                        <TOCItem><a href="#collect"><Database size={16} /> Information We Collect</a></TOCItem>
                        <TOCItem><a href="#use"><Settings size={16} /> How We Use Your Data</a></TOCItem>
                        <TOCItem><a href="#cookies"><Cookie size={16} /> Cookies & Tracking</a></TOCItem>
                        <TOCItem><a href="#sharing"><Users size={16} /> Data Sharing</a></TOCItem>
                        <TOCItem><a href="#security"><Lock size={16} /> Data Security</a></TOCItem>
                        <TOCItem><a href="#rights"><UserCheck size={16} /> Your Rights</a></TOCItem>
                        <TOCItem><a href="#children"><Shield size={16} /> Children's Privacy</a></TOCItem>
                        <TOCItem><a href="#changes"><Bell size={16} /> Policy Changes</a></TOCItem>
                    </TOCList>
                </TableOfContents>

                {/* SECTION 1 */}
                <Section id="collect">
                    <SectionHeader>
                        <SectionIcon>
                            <Database size={24} />
                        </SectionIcon>
                        <SectionTitle>1. Information We Collect</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            We collect various types of information to provide and improve our services. Here's what we collect:
                        </p>

                        <DataTypeCard>
                            <DataTypeHeader>
                                <DataTypeIcon>
                                    <User size={20} />
                                </DataTypeIcon>
                                <DataTypeTitle>Personal Information</DataTypeTitle>
                            </DataTypeHeader>
                            <DataTypeDescription>
                                When you register for an account or use our services, we collect:
                            </DataTypeDescription>
                            <BulletList>
                                <li><strong>Contact Information:</strong> Name, email address, phone number, and billing address</li>
                                <li><strong>Account Credentials:</strong> Username, password, and security information</li>
                                <li><strong>Payment Information:</strong> Credit card details (securely processed by Stripe)</li>
                                <li><strong>Communication Data:</strong> Messages you send to customer support</li>
                            </BulletList>
                        </DataTypeCard>

                        <DataTypeCard>
                            <DataTypeHeader>
                                <DataTypeIcon>
                                    <Activity size={20} />
                                </DataTypeIcon>
                                <DataTypeTitle>Usage Data</DataTypeTitle>
                            </DataTypeHeader>
                            <DataTypeDescription>
                                We automatically collect information about how you interact with our platform:
                            </DataTypeDescription>
                            <BulletList>
                                <li>IP address, browser type, and operating system</li>
                                <li>Pages viewed, features used, and time spent on the platform</li>
                                <li>Referring URLs and navigation patterns</li>
                                <li>Device information and connection data</li>
                            </BulletList>
                        </DataTypeCard>

                        <HighlightBox>
                            <HighlightIcon>
                                <CheckCircle size={24} />
                            </HighlightIcon>
                            <HighlightContent>
                                <strong>We're Transparent:</strong> We only collect data necessary to provide and improve our services. 
                                We never sell your personal information to third parties.
                            </HighlightContent>
                        </HighlightBox>
                    </SectionContent>
                </Section>

                {/* SECTION 2 */}
                <Section id="use">
                    <SectionHeader>
                        <SectionIcon>
                            <Settings size={24} />
                        </SectionIcon>
                        <SectionTitle>2. How We Use Your Information</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>We use the collected information for various purposes:</p>
                        <BulletList>
                            <li><strong>Service Delivery:</strong> To provide, operate, and maintain our platform</li>
                            <li><strong>Transactions:</strong> To process payments and manage your subscriptions</li>
                            <li><strong>Improvements:</strong> To improve, personalize, and expand our services</li>
                            <li><strong>Analytics:</strong> To understand and analyze how you use our platform</li>
                            <li><strong>Communication:</strong> For customer support, service updates, and marketing (with consent)</li>
                            <li><strong>Security:</strong> To detect and prevent fraud and illegal activities</li>
                            <li><strong>Compliance:</strong> To comply with legal obligations and enforce our terms</li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <Eye size={20} />
                            </InfoIcon>
                            <InfoContent>
                                You can control how we use your data for marketing by adjusting your preferences in your 
                                <a href="/settings"> Account Settings</a>.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 3 */}
                <Section id="cookies">
                    <SectionHeader>
                        <SectionIcon>
                            <Cookie size={24} />
                        </SectionIcon>
                        <SectionTitle>3. Cookies and Tracking Technologies</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            We use cookies and similar tracking technologies to enhance your experience and analyze platform usage. 
                            Cookies are small data files stored on your device.
                        </p>

                        <Subsection>
                            <SubsectionTitle>Types of Cookies We Use:</SubsectionTitle>
                            <BulletList>
                                <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how our services are used</li>
                                <li><strong>Security Cookies:</strong> Detect and prevent malicious activity</li>
                            </BulletList>
                        </Subsection>

                        <WarningBox>
                            <WarningIcon>
                                <AlertTriangle size={20} />
                            </WarningIcon>
                            <WarningContent>
                                <strong>Note:</strong> You can configure your browser to refuse cookies, but this may limit your ability 
                                to use certain features of our platform.
                            </WarningContent>
                        </WarningBox>
                    </SectionContent>
                </Section>

                {/* SECTION 4 */}
                <Section id="sharing">
                    <SectionHeader>
                        <SectionIcon>
                            <Users size={24} />
                        </SectionIcon>
                        <SectionTitle>4. Data Sharing and Disclosure</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>We may share your information in the following situations:</p>

                        <BulletList>
                            <li>
                                <strong>Service Providers:</strong> We share data with third-party providers who perform functions on our 
                                behalf (payment processing, hosting, analytics, customer support)
                            </li>
                            <li>
                                <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of company assets
                            </li>
                            <li>
                                <strong>Legal Requirements:</strong> When required by law or in response to valid legal requests
                            </li>
                            <li>
                                <strong>With Your Consent:</strong> For any other purpose with your explicit consent
                            </li>
                        </BulletList>

                        <HighlightBox>
                            <HighlightIcon>
                                <Shield size={24} />
                            </HighlightIcon>
                            <HighlightContent>
                                <strong>We Do Not Sell Your Data:</strong> We never sell, rent, or trade your personal information 
                                to third parties for their direct marketing purposes.
                            </HighlightContent>
                        </HighlightBox>
                    </SectionContent>
                </Section>

                {/* SECTION 5 */}
                <Section id="security">
                    <SectionHeader>
                        <SectionIcon>
                            <Lock size={24} />
                        </SectionIcon>
                        <SectionTitle>5. Data Security</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            The security of your data is critically important to us. We implement industry-standard security measures to 
                            protect your personal information:
                        </p>

                        <BulletList>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Secure authentication and access controls</li>
                            <li>Regular security audits and monitoring</li>
                            <li>Compliance with industry security standards</li>
                        </BulletList>

                        <WarningBox>
                            <WarningIcon>
                                <AlertTriangle size={20} />
                            </WarningIcon>
                            <WarningContent>
                                <strong>Important:</strong> While we strive to protect your data using commercially acceptable means, 
                                no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee 
                                absolute security.
                            </WarningContent>
                        </WarningBox>
                    </SectionContent>
                </Section>

                {/* SECTION 6 */}
                <Section id="rights">
                    <SectionHeader>
                        <SectionIcon>
                            <UserCheck size={24} />
                        </SectionIcon>
                        <SectionTitle>6. Your Data Protection Rights</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Depending on your location, you may have the following data protection rights:
                        </p>

                        <BulletList>
                            <li><strong>Access:</strong> The right to access and obtain copies of your personal data</li>
                            <li><strong>Rectification:</strong> The right to correct inaccurate or incomplete data</li>
                            <li><strong>Erasure:</strong> The right to request deletion of your personal data</li>
                            <li><strong>Restriction:</strong> The right to request limitation of processing</li>
                            <li><strong>Portability:</strong> The right to receive your data in a portable format</li>
                            <li><strong>Objection:</strong> The right to object to certain processing activities</li>
                            <li><strong>Withdraw Consent:</strong> The right to withdraw consent at any time</li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <Mail size={20} />
                            </InfoIcon>
                            <InfoContent>
                                To exercise any of these rights, please contact us using the details at the bottom of this page. 
                                We will respond to your request within 30 days.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 7 */}
                <Section id="children">
                    <SectionHeader>
                        <SectionIcon>
                            <Shield size={24} />
                        </SectionIcon>
                        <SectionTitle>7. Children's Privacy</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                            information from children under 18. If you are a parent or guardian and believe your child has provided 
                            us with personal information, please contact us immediately.
                        </p>
                        <WarningBox>
                            <WarningIcon>
                                <AlertTriangle size={20} />
                            </WarningIcon>
                            <WarningContent>
                                If we discover that we have collected personal information from a child under 18, we will take steps 
                                to delete that information as quickly as possible.
                            </WarningContent>
                        </WarningBox>
                    </SectionContent>
                </Section>

                {/* SECTION 8 */}
                <Section id="changes">
                    <SectionHeader>
                        <SectionIcon>
                            <Bell size={24} />
                        </SectionIcon>
                        <SectionTitle>8. Changes to This Privacy Policy</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            We may update our Privacy Policy from time to time to reflect changes in our practices or for legal, 
                            operational, or regulatory reasons. When we make changes:
                        </p>

                        <BulletList>
                            <li>We will update the "Last Updated" date at the top of this policy</li>
                            <li>For material changes, we will provide prominent notice on our platform</li>
                            <li>We may also notify you via email if you have opted in to notifications</li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <Eye size={20} />
                            </InfoIcon>
                            <InfoContent>
                                We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* CONTACT SECTION */}
                <ContactSection>
                    <ContactTitle>
                        <Mail size={24} />
                        Questions About Your Privacy?
                    </ContactTitle>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        If you have any questions or concerns about this Privacy Policy or how we handle your data, 
                        please don't hesitate to reach out.
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

export default PrivacyPolicyPage;
