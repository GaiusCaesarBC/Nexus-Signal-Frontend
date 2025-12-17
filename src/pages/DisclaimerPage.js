// client/src/pages/DisclaimerPage.js - LEGENDARY DISCLAIMER PAGE

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    ShieldAlert, Info, AlertTriangle, TrendingDown, DollarSign,
    FileText, Clock, Mail, Globe, BarChart3, AlertCircle,
    CheckCircle, ExternalLink
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
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(249, 115, 22, 0.3);
    animation: ${pulse} 2s ease-in-out infinite;

    @media (max-width: 768px) {
        width: 60px;
        height: 60px;
    }
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
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
    background: rgba(249, 115, 22, 0.15);
    border: 1px solid rgba(249, 115, 22, 0.3);
    border-radius: 20px;
    color: #fb923c;
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
    border: 1px solid rgba(249, 115, 22, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out 0.2s backwards;
`;

const TOCTitle = styled.h3`
    color: #fb923c;
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
        background: rgba(249, 115, 22, 0.05);
        border: 1px solid rgba(249, 115, 22, 0.2);
        border-radius: 10px;
        color: #94a3b8;
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
            background: rgba(249, 115, 22, 0.15);
            border-color: rgba(249, 115, 22, 0.4);
            color: #fb923c;
            transform: translateX(5px);
        }
    }
`;

const CriticalWarning = styled.div`
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
    border: 2px solid rgba(239, 68, 68, 0.5);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out 0.4s backwards;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #ef4444, #dc2626);
    }
`;

const WarningHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const WarningIconWrapper = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(239, 68, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const WarningTitle = styled.h3`
    color: #ef4444;
    font-size: 1.5rem;
    font-weight: 700;
`;

const WarningContent = styled.div`
    color: #fca5a5;
    font-size: 1.1rem;
    line-height: 1.8;

    strong {
        color: #ef4444;
    }
`;

const Section = styled.section`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid rgba(249, 115, 22, 0.3);
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
        background: linear-gradient(90deg, #f97316, #fb923c);
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
    background: rgba(249, 115, 22, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fb923c;
    flex-shrink: 0;
`;

const SectionTitle = styled.h2`
    color: #fb923c;
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

    em {
        color: #fb923c;
        font-style: italic;
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
            background: #f97316;
            border-radius: 50%;
        }

        strong {
            color: #e0e6ed;
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

    strong {
        color: #00adef;
    }
`;

const RiskMeter = styled.div`
    margin: 1.5rem 0;
    padding: 1.5rem;
    background: rgba(249, 115, 22, 0.05);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 12px;
`;

const RiskMeterTitle = styled.div`
    color: #fb923c;
    font-weight: 700;
    margin-bottom: 1rem;
    font-size: 1.1rem;
`;

const RiskBar = styled.div`
    height: 12px;
    background: rgba(239, 68, 68, 0.2);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
`;

const RiskFill = styled.div`
    height: 100%;
    width: ${props => props.$level || '0%'};
    background: linear-gradient(90deg, #fbbf24 0%, #f97316 50%, #ef4444 100%);
    border-radius: 6px;
    transition: width 1s ease-out;
`;

const RiskLabels = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #94a3b8;
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
const DisclaimerPage = () => {
    return (
        <PageContainer>
            <Header>
                <TitleContainer>
                    <IconWrapper>
                        <ShieldAlert size={48} color="#fb923c" />
                    </IconWrapper>
                    <Title>Important Disclaimers</Title>
                </TitleContainer>
                <Subtitle>
                    Please read these disclaimers carefully before using Nexus Signal.AI or relying on any information 
                    or signals provided by our platform.
                </Subtitle>
                <LastUpdated>
                    <Clock size={16} />
                    Last Updated: December 16, 2025
                </LastUpdated>
            </Header>

            <ContentWrapper>
                {/* CRITICAL WARNING */}
                <CriticalWarning>
                    <WarningHeader>
                        <WarningIconWrapper>
                            <AlertTriangle size={24} />
                        </WarningIconWrapper>
                        <WarningTitle>CRITICAL: Read Before Trading</WarningTitle>
                    </WarningHeader>
                    <WarningContent>
                        <p>
                            <strong>Trading involves substantial risk of loss.</strong> All investments carry risk, and you could lose 
                            some or all of your invested capital. Past performance does not guarantee future results. The information 
                            provided by Nexus Signal.AI is for educational and informational purposes only and should not be considered 
                            financial advice.
                        </p>
                    </WarningContent>
                </CriticalWarning>

                {/* TABLE OF CONTENTS */}
                <TableOfContents>
                    <TOCTitle>
                        <FileText size={20} />
                        Quick Navigation
                    </TOCTitle>
                    <TOCList>
                        <TOCItem><a href="#investment"><ShieldAlert size={16} /> Investment Disclaimer</a></TOCItem>
                        <TOCItem><a href="#performance"><BarChart3 size={16} /> Hypothetical Performance</a></TOCItem>
                        <TOCItem><a href="#risk"><TrendingDown size={16} /> Risk of Loss</a></TOCItem>
                        <TOCItem><a href="#accuracy"><AlertCircle size={16} /> Accuracy of Information</a></TOCItem>
                        <TOCItem><a href="#third-party"><ExternalLink size={16} /> Third-Party Links</a></TOCItem>
                        <TOCItem><a href="#changes"><FileText size={16} /> Changes to Disclaimer</a></TOCItem>
                    </TOCList>
                </TableOfContents>

                {/* SECTION 1 */}
                <Section id="investment">
                    <SectionHeader>
                        <SectionIcon>
                            <ShieldAlert size={24} />
                        </SectionIcon>
                        <SectionTitle>1. General Investment Disclaimer</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Nexus Signal LLC ("Company," "we," "us," or "our"), operating as Nexus Signal.AI, provides AI-generated signals
                            and market analysis for <strong>informational purposes only</strong>. We are <em>not</em> a registered investment
                            advisor, broker-dealer, or financial analyst. The information provided should not be considered as:
                        </p>
                        <BulletList>
                            <li>Financial advice or investment recommendations</li>
                            <li>An offer to buy or sell any securities or financial products</li>
                            <li>A guarantee of future performance or results</li>
                            <li>Professional financial, legal, or tax advice</li>
                        </BulletList>

                        <HighlightBox>
                            <HighlightIcon>
                                <AlertTriangle size={24} />
                            </HighlightIcon>
                            <HighlightContent>
                                <strong>Important:</strong> All trading involves risk, and you can lose money. Past performance is not 
                                indicative of future results. The value of investments and the income from them can go down as well as up. 
                                You may not get back the amount you invested.
                            </HighlightContent>
                        </HighlightBox>

                        <InfoBox>
                            <InfoIcon>
                                <Info size={20} />
                            </InfoIcon>
                            <InfoContent>
                                <strong>Recommendation:</strong> Always consult with a qualified financial advisor before making any 
                                investment decisions. Consider your individual financial situation, investment objectives, and risk tolerance.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 2 */}
                <Section id="performance">
                    <SectionHeader>
                        <SectionIcon>
                            <BarChart3 size={24} />
                        </SectionIcon>
                        <SectionTitle>2. Hypothetical Performance Disclaimer</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Any performance figures, charts, or simulations displayed on this website or within the platform are 
                            <strong> hypothetical, backtested results</strong> and <em>do not represent actual trading</em>.
                        </p>

                        <p><strong>Key Limitations of Hypothetical Performance:</strong></p>
                        <BulletList>
                            <li>
                                <strong>No Actual Trading:</strong> Results are based on simulated trades, not real market executions
                            </li>
                            <li>
                                <strong>Market Factors:</strong> Does not reflect the impact of liquidity, slippage, and execution costs
                            </li>
                            <li>
                                <strong>Hindsight Bias:</strong> Simulated programs are often designed with the benefit of hindsight
                            </li>
                            <li>
                                <strong>Perfect Execution:</strong> Assumes trades are executed at ideal prices without delays or failures
                            </li>
                            <li>
                                <strong>Survivorship Bias:</strong> May exclude stocks that were delisted or failed during the test period
                            </li>
                        </BulletList>

                        <HighlightBox>
                            <HighlightIcon>
                                <AlertCircle size={24} />
                            </HighlightIcon>
                            <HighlightContent>
                                <strong>No Guarantee:</strong> No representation is being made that any account will or is likely to achieve 
                                profits or losses similar to those shown. Individual results <em>may vary significantly</em>.
                            </HighlightContent>
                        </HighlightBox>
                    </SectionContent>
                </Section>

                {/* SECTION 3 */}
                <Section id="risk">
                    <SectionHeader>
                        <SectionIcon>
                            <TrendingDown size={24} />
                        </SectionIcon>
                        <SectionTitle>3. Risk of Loss</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Trading in financial markets carries a <strong>high level of risk</strong>. You should be aware of all 
                            the risks associated with trading and seek advice from an independent financial advisor if you have any doubts.
                        </p>

                        <RiskMeter>
                            <RiskMeterTitle>Trading Risk Level: VERY HIGH</RiskMeterTitle>
                            <RiskBar>
                                <RiskFill $level="85%" />
                            </RiskBar>
                            <RiskLabels>
                                <span>Low Risk</span>
                                <span>Medium Risk</span>
                                <span>High Risk</span>
                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Very High Risk</span>
                            </RiskLabels>
                        </RiskMeter>

                        <p><strong>Key Risk Factors:</strong></p>
                        <BulletList>
                            <li>
                                <strong>Capital Loss:</strong> You can lose some or all of your invested capital
                            </li>
                            <li>
                                <strong>Leverage Risk:</strong> Leverage can magnify both profits and losses
                            </li>
                            <li>
                                <strong>Market Volatility:</strong> Sudden price movements can result in significant losses
                            </li>
                            <li>
                                <strong>Liquidity Risk:</strong> You may not be able to exit positions at desired prices
                            </li>
                            <li>
                                <strong>Emotional Risk:</strong> Emotional decisions can lead to poor trading outcomes
                            </li>
                        </BulletList>

                        <HighlightBox>
                            <HighlightIcon>
                                <DollarSign size={24} />
                            </HighlightIcon>
                            <HighlightContent>
                                <strong>Golden Rule:</strong> Do not invest money you cannot afford to lose. Only risk capital you can 
                                afford to lose without affecting your lifestyle.
                            </HighlightContent>
                        </HighlightBox>
                    </SectionContent>
                </Section>

                {/* SECTION 4 */}
                <Section id="accuracy">
                    <SectionHeader>
                        <SectionIcon>
                            <AlertCircle size={24} />
                        </SectionIcon>
                        <SectionTitle>4. Accuracy of Information</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            While we strive to provide accurate and timely information, Nexus Signal LLC <strong>does not guarantee</strong>
                            the accuracy, completeness, or timeliness of the information or signals provided.
                        </p>

                        <BulletList>
                            <li>
                                <strong>Market Changes:</strong> Market conditions can change rapidly, and information may become outdated
                            </li>
                            <li>
                                <strong>Data Sources:</strong> We rely on third-party data sources which may contain errors or delays
                            </li>
                            <li>
                                <strong>AI Limitations:</strong> AI models are based on historical data and may not predict future events accurately
                            </li>
                            <li>
                                <strong>Technical Issues:</strong> System outages or technical problems may affect data accuracy
                            </li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <CheckCircle size={20} />
                            </InfoIcon>
                            <InfoContent>
                                <strong>Your Responsibility:</strong> We are not responsible for any errors or omissions, or for any results 
                                obtained from the use of this information. Always verify information from multiple sources before making 
                                trading decisions.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 5 */}
                <Section id="third-party">
                    <SectionHeader>
                        <SectionIcon>
                            <ExternalLink size={24} />
                        </SectionIcon>
                        <SectionTitle>5. Third-Party Links</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Our website may contain links to third-party websites or services that are not owned or controlled by
                            Nexus Signal LLC. We have no control over, and assume no responsibility for, the content, privacy policies,
                            or practices of any third-party websites or services.
                        </p>

                        <BulletList>
                            <li>We do not endorse or assume responsibility for third-party content</li>
                            <li>Third-party sites have their own terms of service and privacy policies</li>
                            <li>We are not liable for any damage caused by third-party services</li>
                            <li>Use third-party links at your own risk</li>
                        </BulletList>

                        <InfoBox>
                            <InfoIcon>
                                <Info size={20} />
                            </InfoIcon>
                            <InfoContent>
                                We strongly advise you to read the terms and conditions and privacy policies of any third-party websites 
                                or services that you visit.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* SECTION 6 */}
                <Section id="changes">
                    <SectionHeader>
                        <SectionIcon>
                            <FileText size={24} />
                        </SectionIcon>
                        <SectionTitle>6. Changes to This Disclaimer</SectionTitle>
                    </SectionHeader>
                    <SectionContent>
                        <p>
                            Nexus Signal LLC reserves the right to modify or replace this Disclaimer at any time. We will provide notice
                            of any changes by posting the new Disclaimer on this page and updating the "Last Updated" date.
                        </p>

                        <InfoBox>
                            <InfoIcon>
                                <AlertTriangle size={20} />
                            </InfoIcon>
                            <InfoContent>
                                <strong>Your Agreement:</strong> Your continued use of the service after any such changes constitutes your 
                                acceptance of the new Disclaimer. We encourage you to review this Disclaimer periodically.
                            </InfoContent>
                        </InfoBox>
                    </SectionContent>
                </Section>

                {/* CONTACT SECTION */}
                <ContactSection>
                    <ContactTitle>
                        <Mail size={24} />
                        Questions About These Disclaimers?
                    </ContactTitle>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        If you have any questions about these disclaimers or need clarification, please contact us.
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

export default DisclaimerPage;
