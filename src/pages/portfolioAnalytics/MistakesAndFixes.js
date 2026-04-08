// client/src/pages/portfolioAnalytics/MistakesAndFixes.js
//
// Combined "What you're doing wrong" + "What to do next" card. The
// signature value-add of the redesign — surfaces concrete mistakes and
// the matching corrective action.

import React from 'react';
import styled from 'styled-components';
import {
    AlertTriangle, ArrowRight, ShieldAlert, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { detectMistakes, buildFixes } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, t,
} from '../marketReports/styles';

const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;

    @media (max-width: 760px) {
        grid-template-columns: 1fr;
    }
`;

const Col = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const ColTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) =>
        p.$kind === 'mistakes' ? t(p, 'error', '#ef4444')
      : t(p, 'success', '#10b981')};
`;

const Item = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.85rem 1rem;
    border-radius: 10px;
    background: ${(p) =>
        p.$severity === 'high' ? 'rgba(239, 68, 68, 0.10)'
      : p.$severity === 'med'  ? 'rgba(245, 158, 11, 0.10)'
      : p.$kind === 'fixes'    ? 'rgba(16, 185, 129, 0.10)'
      : 'rgba(100, 116, 139, 0.10)'};
    border: 1px solid ${(p) =>
        p.$severity === 'high' ? 'rgba(239, 68, 68, 0.35)'
      : p.$severity === 'med'  ? 'rgba(245, 158, 11, 0.35)'
      : p.$kind === 'fixes'    ? 'rgba(16, 185, 129, 0.35)'
      : 'rgba(100, 116, 139, 0.30)'};

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) =>
            p.$severity === 'high' ? t(p, 'error', '#ef4444')
          : p.$severity === 'med'  ? t(p, 'warning', '#f59e0b')
          : p.$kind === 'fixes'    ? t(p, 'success', '#10b981')
          : t(p, 'text.secondary', '#94a3b8')};
    }

    .body {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        min-width: 0;
    }
    .title {
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        font-weight: 800;
        font-size: 0.9rem;
        line-height: 1.35;
    }
    .detail {
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        font-size: 0.8rem;
        line-height: 1.45;
    }
`;

const Empty = styled.div`
    padding: 1.25rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.30)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.88rem;
    line-height: 1.5;
`;

const SeverityIcon = ({ severity }) => {
    if (severity === 'high') return <ShieldAlert size={16} />;
    if (severity === 'med')  return <AlertCircle size={16} />;
    return <AlertTriangle size={16} />;
};

const MistakesAndFixes = ({ analytics }) => {
    const { theme } = useTheme();
    const mistakes = detectMistakes(analytics);
    const fixes = buildFixes(mistakes);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <AlertTriangle size={14} /> Mistakes & Fixes
                </SectionTitle>
            </SectionHeader>

            <TwoCol>
                <Col>
                    <ColTitle theme={theme} $kind="mistakes">
                        <AlertTriangle size={11} /> What you're doing wrong
                    </ColTitle>
                    {mistakes.length === 0 ? (
                        <Empty theme={theme}>
                            Nothing major flagged. Keep your discipline tight and review again after your next 10 trades.
                        </Empty>
                    ) : (
                        mistakes.map((m) => (
                            <Item key={m.id} theme={theme} $severity={m.severity} $kind="mistakes">
                                <SeverityIcon severity={m.severity} />
                                <div className="body">
                                    <div className="title">{m.title}</div>
                                    <div className="detail">{m.detail}</div>
                                </div>
                            </Item>
                        ))
                    )}
                </Col>

                <Col>
                    <ColTitle theme={theme} $kind="fixes">
                        <ArrowRight size={11} /> What to do next
                    </ColTitle>
                    {fixes.length === 0 ? (
                        <Empty theme={theme}>
                            No urgent fixes. Stay on the current process and keep logging trades.
                        </Empty>
                    ) : (
                        fixes.map((f, i) => (
                            <Item key={i} theme={theme} $kind="fixes">
                                <CheckCircle2 size={16} />
                                <div className="body">
                                    <div className="title">{f.title}</div>
                                </div>
                            </Item>
                        ))
                    )}
                </Col>
            </TwoCol>
        </SectionCard>
    );
};

export default MistakesAndFixes;
