// client/src/components/dashboard/NewsFeedCard.js - FIXED to match backend data
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Newspaper } from 'lucide-react';
import Loader from '../Loader';

const pulseGlow = keyframes`
    0% { box-shadow: 0 0 5px rgba(255, 107, 107, 0.4); }
    50% { box-shadow: 0 0 20px rgba(255, 107, 107, 0.8); }
    100% { box-shadow: 0 0 5px rgba(255, 107, 107, 0.4); }
`;

const Card = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
    position: relative;
`;

const NewsFeedHeader = styled.h3`
    font-size: 1.6rem;
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
`;

const NewsList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    overflow-y: auto;
    max-height: 500px;
    scrollbar-width: thin;
    scrollbar-color: #00adef #1e293b;

    &::-webkit-scrollbar {
        width: 8px;
    }
    &::-webkit-scrollbar-track {
        background: #1e293b;
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #00adef;
        border-radius: 10px;
        border: 2px solid #1e293b;
    }
`;

const NewsItem = styled.li`
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: flex-start;
    gap: 1rem;

    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
    }

    img {
        width: 100px;
        height: 75px;
        object-fit: cover;
        border-radius: 6px;
        flex-shrink: 0;
        border: 1px solid rgba(0, 173, 237, 0.2);
    }

    div {
        flex-grow: 1;
    }

    a {
        color: #00adef;
        text-decoration: none;
        font-weight: 600;
        display: block;
        font-size: 1.05rem;
        line-height: 1.4;
        margin-bottom: 0.5rem;

        &:hover {
            text-decoration: underline;
            color: #4ddbff;
        }
    }
    
    .summary {
        font-size: 0.9rem;
        color: #94a3b8;
        margin: 0.5rem 0;
        line-height: 1.5;
    }
    
    .meta {
        font-size: 0.8rem;
        color: #64748b;
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
`;

const CenteredMessage = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    text-align: center;
    font-size: 1.1rem;
    color: #94a3b8;
`;

const StyledLoader = styled(Loader)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
`;

const ErrorMessage = styled(CenteredMessage)`
    color: #ff6b6b;
    font-weight: bold;
    animation: ${pulseGlow} 1.5s infinite alternate;
`;

const NewsFeedCard = ({ news, loading, error }) => {
    return (
        <Card>
            <NewsFeedHeader>
                <Newspaper size={24} color="#00adef" />
                Latest Market News
            </NewsFeedHeader>

            {loading && <StyledLoader />}
            {error && <ErrorMessage>{error}</ErrorMessage>}

            {!loading && !error && (
                <NewsList>
                    {news && news.length > 0 ? (
                        news.map((item) => (
                            <NewsItem key={item.id || item.headline}>
                                {item.image && <img src={item.image} alt={item.headline} />}
                                <div>
                                    {item.url ? (
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            {item.headline}
                                        </a>
                                    ) : (
                                        <span style={{ 
                                            color: '#00adef', 
                                            fontWeight: '600', 
                                            display: 'block', 
                                            fontSize: '1.05rem', 
                                            lineHeight: '1.4',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {item.headline}
                                        </span>
                                    )}
                                    {item.summary && <p className="summary">{item.summary}</p>}
                                    <div className="meta">
                                        {item.source && <span>{item.source}</span>}
                                        {item.datetime && <span>• {item.datetime}</span>}
                                    </div>
                                </div>
                            </NewsItem>
                        ))
                    ) : (
                        <CenteredMessage>No news available at the moment.</CenteredMessage>
                    )}
                </NewsList>
            )}
        </Card>
    );
};

export default NewsFeedCard;