// client/src/pages/calculators/WhatThisMeans.js
//
// Plain-English explanation block. Takes a list of sentences (from
// derive.interpretFor) and renders them as a bulleted explanation.

import React from 'react';
import styled from 'styled-components';
import { MessageSquare } from 'lucide-react';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    padding: 1rem 1.15rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.12), rgba(0, 173, 237, 0.04));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const List = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const Item = styled.li`
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.92rem;
    line-height: 1.5;

    &::before {
        content: '';
        flex: 0 0 auto;
        width: 6px;
        height: 6px;
        margin-top: 0.55rem;
        border-radius: 50%;
        background: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const Verdict = styled.div`
    margin-top: 0.25rem;
    padding-top: 0.6rem;
    border-top: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.25)')};
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.85rem;
    line-height: 1.5;
    font-style: italic;
`;

const WhatThisMeans = ({ interpretation, theme }) => {
    if (!interpretation || (!interpretation.sentences?.length && !interpretation.verdict)) return null;

    return (
        <Wrap theme={theme}>
            <Header theme={theme}>
                <MessageSquare size={12} /> What this means
            </Header>
            {interpretation.sentences?.length > 0 && (
                <List>
                    {interpretation.sentences.map((s, i) => (
                        <Item key={i} theme={theme}>{s}</Item>
                    ))}
                </List>
            )}
            {interpretation.verdict && (
                <Verdict theme={theme}>{interpretation.verdict}</Verdict>
            )}
        </Wrap>
    );
};

export default WhatThisMeans;
