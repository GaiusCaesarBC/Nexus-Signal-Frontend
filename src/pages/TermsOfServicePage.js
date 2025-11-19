// client/src/pages/TermsOfServicePage.js - LEGENDARY TERMS OF SERVICE PAGE

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    FileText, User, Lock, ExternalLink, MessageSquare, 
    Shield, CreditCard, AlertTriangle, CheckCircle,
    Scale, Clock, Mail, Globe, Bell
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
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(139, 92, 246, 0.3);

    @media (max-width: 768px) {
        width: 60px;
        height: 60px;
    }
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
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
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 20px;
    color: #a78bfa;
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
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out 0.2s backwards;
`;

const TOCTitle = styled.h3`
    color: #a78bfa;
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
        background: rgba(139, 92, 246, 0.05);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 10px;
        color: #94a3b8;
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(139, 92, 246, 0.15);
            border-color: rgba(139, 92, 246, 0.4);
            color: #a78bfa;
            transform: translateX(5px);
        }
    }
`;

const Section = styled.section`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.3);
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
        background: linear-gradient(90deg, #8b5cf6, #a78bfa);
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
    background: rgba(139, 92, 246, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a78bfa;
    flex-shrink: 0;
`;

const SectionTitle = styled.h2`
    color: #a78bfa;
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
    border-left: 3px solid rgba(139, 92, 246, 0.3);
`;

const SubsectionTitle = styled.h3`
    color: #e0e6ed;
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
    font-weight: 700;
`;

const List = styled.ol`
    list-style: none;
    counter-reset: item;
    padding-left: 0;
    margin: 1rem 0;

    li {
        counter-increment: item;
        margin-bottom: 1rem;
        padding-left: 2.5rem;
        position: relative;
        color: #cbd5e1;

        &::before {
            content: counter(item);
            position: absolute;
            left: 0;
            top: 0;
            width: 28px;
            height: 28px;
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a78bfa;
            font-weight: 700;
            font-size: 0.85rem;
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
            background: #a78bfa;
            border-radius: 50%;
        }
    }
`;

const HighlightBox = styled.div`
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    display: flex;
    gap: 1rem;
    align-items: start;
`;

const HighlightIcon = styled.div`
    color: #ef4444;
    flex-shrink: 0;
`;

const HighlightContent = styled.div`
    flex: 1;
    color: #fca5a5;
    line-height: 1.6;

    strong {
        color: #ef4444;
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
const TermsOfServicePage = () => {
    return (
        <PageContainer>
            <Header>
                <TitleContainer>
                    <IconWrapper>
                        <Scale size={48} color="#a78bfa" />
                    </IconWrapper>
                    <Title>Terms of Service</Title>
                </TitleContainer>
                <Subtitle>
                    Welcome to Nexus Signal.AI! These Terms of Service govern your access to and use of our platform. 
                    Please read them carefully before using our services.
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
                        <TOCItem><a href="#acceptance"><CheckCircle size={16} /> Acceptance of Terms</a></TOCItem>
                        <TOCItem><a href="#accounts"><User size={16} /> User Accounts</a></TOCItem>
                        <TOCItem><a href="#payments"><CreditCard size={16} /> Subscriptions & Payments</a></TOCItem>
                        <TOCItem><a href="#conduct"><Shield size={16} /> Prohibited Conduct</a></TOCItem>
                        <TOCItem><a href="#disclaimers"><AlertTriangle size={16} /> Disclaimers & Liability</a></TOCItem>
                        <TOCItem><a href="#ip"><Lock size={16} /> Intellectual Property</a></TOCItem>
                        <TOCItem><a href="#law"><Scale size={16} /> Governing Law</a></TOCItem>
                        <TOCItem><a href="#changes"><FileText size={16} /> Changes to Terms</a></TOCItem>
                    </TOCList>
                </TableOfContents>

                {/* SECTION 1 */}
                <Section id="acceptance">
                    <SectionHeader>
                        <SectionIcon>
                            <CheckCircle size={24} />
                        </SectionIcon>
                        <SectionTitle>1. Acceptance of Terms</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            By accessing or using Nexus Signal.AI, you agree to be bound by these Terms of Service and our 
                            <a href="/privacy-policy"> Privacy Policy</a>. If you do not agree to all the terms and conditions, 
                            you may not access or use our services.
                        </p>
                        <InfoBox>
                            <InfoIcon>
                                <AlertTriangle size={20} />
                            </InfoIcon>
                            <InfoContent>
                                <strong>Important:</strong> By creating an account or using our services, you acknowledge that you have read, 
                                understood, and agree to be bound by these Terms of Service.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 2 */}
                <Section id="accounts">
                    <SectionHeader>
                        <SectionIcon>
                            <User size={24} />
                        </SectionIcon>
                        <SectionTitle>2. User Accounts</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <List>
                            <li>
                                <strong>Account Creation:</strong> To access certain features of our service, you must register for an account. 
                                You agree to provide accurate, current, and complete information during the registration process and to update 
                                such information to keep it accurate, current, and complete.
                            </li>
                            <li>
                                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account password 
                                and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use 
                                of your password or account or any other breach of security.
                            </li>
                            <li>
                                <strong>Eligibility:</strong> You must be at least 18 years old to use our services. By using our services, 
                                you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into this agreement.
                            </li>
                        </List>
                    </SectionContent>
                </Section>

                {/* SECTION 3 */}
                <Section id="payments">
                    <SectionHeader>
                        <SectionIcon>
                            <CreditCard size={24} />
                        </SectionIcon>
                        <SectionTitle>3. Subscriptions and Payments</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <List>
                            <li>
                                <strong>Subscription Plans:</strong> Nexus Signal.AI offers various subscription plans. Details of these plans, 
                                including pricing and features, are available on our <a href="/pricing">Pricing Page</a>.
                            </li>
                            <li>
                                <strong>Billing:</strong> You agree to pay all fees associated with your chosen subscription plan. Payments are 
                                processed securely by third-party payment processors (e.g., Stripe). All fees are in USD unless otherwise specified.
                            </li>
                            <li>
                                <strong>Automatic Renewal:</strong> Subscriptions typically auto-renew at the end of each billing cycle unless 
                                canceled. You can manage your subscription settings and cancel at any time within your account settings.
                            </li>
                            <li>
                                <strong>Refunds:</strong> All sales are final. We do not offer refunds, except where required by law. Please 
                                carefully review your subscription before purchase.
                            </li>
                        </List>
                        <InfoBox>
                            <InfoIcon>
                                <CreditCard size={20} />
                            </InfoIcon>
                            <InfoContent>
                                You can view your billing history and manage your subscription at any time through your 
                                <a href="/settings"> Account Settings</a>.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 4 */}
                <Section id="conduct">
                    <SectionHeader>
                        <SectionIcon>
                            <Shield size={24} />
                        </SectionIcon>
                        <SectionTitle>4. Prohibited Conduct</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>You agree not to engage in any of the following prohibited activities:</p>
                        <BulletList>
                            <li>Use the service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                            <li>Engage in any activity that could damage, disable, overburden, or impair the service.</li>
                            <li>Attempt to gain unauthorized access to any part of the service, other accounts, computer systems, or networks.</li>
                            <li>Distribute or reproduce any content from Nexus Signal.AI without our express written permission.</li>
                            <li>Use our AI signals for purposes other than personal investment information.</li>
                            <li>Attempt to reverse-engineer, decompile, or discover the source code of our algorithms or models.</li>
                            <li>Scrape, spider, or use automated means to access the service without permission.</li>
                            <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with any person or entity.</li>
                        </BulletList>
                        <HighlightBox>
                            <HighlightIcon>
                                <AlertTriangle size={24} />
                            </HighlightIcon>
                            <HighlightContent>
                                <strong>Warning:</strong> Violation of these terms may result in immediate termination of your account and 
                                potential legal action.
                            </HighlightContent>
                        </HighlightBox>
                    </SectionContent>
                </Section>

                {/* SECTION 5 */}
                <Section id="disclaimers">
                    <SectionHeader>
                        <SectionIcon>
                            <AlertTriangle size={24} />
                        </SectionIcon>
                        <SectionTitle>5. Disclaimers and Limitation of Liability</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <InfoBox>
                            <InfoIcon>
                                <ExternalLink size={20} />
                            </InfoIcon>
                            <InfoContent>
                                Please refer to our separate <a href="/disclaimer">Disclaimer Page</a> for detailed information regarding 
                                investment risks, hypothetical performance, and other important disclaimers.
                            </InfoContent>
                        </InfoBox>
                        
                        <Subsection>
                            <SubsectionTitle>Limitation of Liability</SubsectionTitle>
                            <p>
                                To the maximum extent permitted by applicable law, Nexus Signal.AI and its affiliates, directors, employees, 
                                and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
                                including but not limited to:
                            </p>
                            <BulletList>
                                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                                <li>Your access to or use of or inability to access or use the service</li>
                                <li>Any conduct or content of any third party on the service</li>
                                <li>Any content obtained from the service</li>
                                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                            </BulletList>
                            <p>
                                Whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not 
                                we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to 
                                have failed of its essential purpose.
                            </p>
                        </Subsection>
                    </SectionContent>
                </Section>

                {/* SECTION 6 */}
                <Section id="ip">
                    <SectionHeader>
                        <SectionIcon>
                            <Lock size={24} />
                        </SectionIcon>
                        <SectionTitle>6. Intellectual Property</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            All content on Nexus Signal.AI, including text, graphics, logos, images, as well as the compilation thereof, 
                            and any software used on the site, is the property of Nexus Signal.AI or its suppliers and protected by copyright, 
                            trademark, and other laws that protect intellectual property and proprietary rights.
                        </p>
                        <Subsection>
                            <SubsectionTitle>Your License to Use</SubsectionTitle>
                            <p>
                                Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license 
                                to access and use the service for your personal, non-commercial use. This license does not include any:
                            </p>
                            <BulletList>
                                <li>Resale or commercial use of the service or its contents</li>
                                <li>Collection and use of any product listings, descriptions, or prices</li>
                                <li>Derivative use of the service or its contents</li>
                                <li>Downloading or copying of account information for the benefit of another merchant</li>
                                <li>Use of data mining, robots, or similar data gathering and extraction tools</li>
                            </BulletList>
                        </Subsection>
                    </SectionContent>
                </Section>

                {/* SECTION 7 */}
                <Section id="law">
                    <SectionHeader>
                        <SectionIcon>
                            <Scale size={24} />
                        </SectionIcon>
                        <SectionTitle>7. Governing Law</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            These Terms shall be governed and construed in accordance with the laws of the United States of America, 
                            without regard to its conflict of law provisions. Our failure to enforce any right or provision of these 
                            Terms will not be considered a waiver of those rights.
                        </p>
                        <Subsection>
                            <SubsectionTitle>Dispute Resolution</SubsectionTitle>
                            <p>
                                Any disputes arising out of or relating to these Terms or the service shall be resolved through binding 
                                arbitration in accordance with the rules of the American Arbitration Association. You agree to waive any 
                                right to a jury trial or to participate in a class action lawsuit.
                            </p>
                        </Subsection>
                    </SectionContent>
                </Section>

                {/* SECTION 8 */}
                <Section id="changes">
                    <SectionHeader>
                        <SectionIcon>
                            <FileText size={24} />
                        </SectionIcon>
                        <SectionTitle>8. Changes to Terms</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is 
                            material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes 
                            a material change will be determined at our sole discretion.
                        </p>
                        <InfoBox>
                            <InfoIcon>
                                <Bell size={20} />
                            </InfoIcon>
                            <InfoContent>
                                By continuing to access or use our service after those revisions become effective, you agree to be bound by 
                                the revised terms. If you do not agree to the new terms, please stop using the service.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* CONTACT SECTION */}
                <ContactSection>
                    <ContactTitle>
                        <MessageSquare size={24} />
                        Questions About These Terms?
                    </ContactTitle>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        If you have any questions about these Terms of Service, please don't hesitate to contact us.
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

export default TermsOfServicePage;