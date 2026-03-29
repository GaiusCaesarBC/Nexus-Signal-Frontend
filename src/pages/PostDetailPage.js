// client/src/pages/PostDetailPage.js — Single Post View
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Heart, MessageSquare, Clock, User } from 'lucide-react';
import SEO from '../components/SEO';

const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;

const Page = styled.div`min-height:100vh;padding-top:80px;color:#e0e6ed;`;
const Container = styled.div`max-width:700px;margin:0 auto;padding:2rem;@media(max-width:768px){padding:1rem;}`;

const BackBtn = styled.button`
    display:flex;align-items:center;gap:.4rem;padding:.5rem 1rem;
    background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
    border-radius:8px;color:#94a3b8;font-size:.85rem;font-weight:600;
    cursor:pointer;transition:all .2s;margin-bottom:1.5rem;
    &:hover{color:#fff;border-color:rgba(255,255,255,.2);}
`;

const PostCard = styled.div`
    background:rgba(15,20,38,.8);border:1px solid rgba(255,255,255,.06);
    border-radius:16px;padding:1.5rem;animation:${fadeIn} .4s ease-out;
`;

const AuthorRow = styled.div`display:flex;align-items:center;gap:.75rem;margin-bottom:1rem;`;
const Avatar = styled.div`
    width:44px;height:44px;border-radius:50%;
    background:linear-gradient(135deg,#00adef,#8b5cf6);
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-weight:700;font-size:1rem;overflow:hidden;cursor:pointer;
    img{width:100%;height:100%;object-fit:cover;}
`;
const AuthorInfo = styled.div`flex:1;`;
const AuthorName = styled.div`font-weight:700;color:#e0e6ed;font-size:.95rem;cursor:pointer;&:hover{color:#00adef;}`;
const PostTime = styled.div`font-size:.75rem;color:#475569;display:flex;align-items:center;gap:.3rem;`;

const Content = styled.div`font-size:1rem;color:#c8d0da;line-height:1.7;margin-bottom:1.25rem;white-space:pre-wrap;`;

const StatsRow = styled.div`
    display:flex;align-items:center;gap:1.5rem;padding-top:1rem;
    border-top:1px solid rgba(255,255,255,.04);font-size:.85rem;color:#64748b;
`;
const Stat = styled.div`display:flex;align-items:center;gap:.35rem;`;

const CommentsSection = styled.div`margin-top:1.5rem;`;
const CommentTitle = styled.h3`font-size:1rem;font-weight:700;color:#e0e6ed;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem;`;

const Comment = styled.div`
    display:flex;gap:.6rem;padding:.75rem;margin-bottom:.5rem;
    background:rgba(255,255,255,.02);border-radius:10px;
`;
const CommentAvatar = styled.div`
    width:32px;height:32px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,#10b981,#06b6d4);
    display:flex;align-items:center;justify-content:center;
    color:#fff;font-weight:700;font-size:.7rem;
`;
const CommentBody = styled.div`flex:1;`;
const CommentUser = styled.span`font-weight:700;color:#e0e6ed;font-size:.85rem;cursor:pointer;&:hover{color:#00adef;}`;
const CommentText = styled.p`font-size:.85rem;color:#94a3b8;line-height:1.5;margin:.2rem 0 0;`;
const CommentTime = styled.span`font-size:.7rem;color:#475569;margin-left:.5rem;`;

const Loading = styled.div`text-align:center;padding:4rem;color:#475569;`;
const NotFound = styled.div`text-align:center;padding:4rem;color:#64748b;font-size:1.1rem;`;

const PostDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { api } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/posts/detail/${id}`);
            setPost(res.data);
        } catch (e) {
            setPost(null);
        }
        setLoading(false);
    };

    const timeAgo = (d) => {
        if (!d) return '';
        const s = Math.floor((Date.now() - new Date(d)) / 1000);
        if (s < 60) return 'just now';
        const m = Math.floor(s / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const goToProfile = (username) => {
        if (username) navigate(`/profile/${username}`);
    };

    if (loading) return <Page><Container><Loading>Loading post...</Loading></Container></Page>;
    if (!post) return (
        <Page><Container>
            <BackBtn onClick={() => navigate('/feed')}><ArrowLeft size={16}/> Back to Feed</BackBtn>
            <NotFound>Post not found or has been deleted.</NotFound>
        </Container></Page>
    );

    const author = post.user || {};
    const username = author.username || 'Unknown';
    const avatar = author.profile?.avatar;
    const initials = username.charAt(0).toUpperCase();

    return (
        <Page>
            <SEO title={`Post by ${username} — Nexus Signal`} />
            <Container>
                <BackBtn onClick={() => navigate('/feed')}><ArrowLeft size={16}/> Back to Feed</BackBtn>

                <PostCard>
                    <AuthorRow>
                        <Avatar onClick={() => goToProfile(username)}>
                            {avatar ? <img src={avatar} alt={username}/> : initials}
                        </Avatar>
                        <AuthorInfo>
                            <AuthorName onClick={() => goToProfile(username)}>{author.profile?.displayName || username}</AuthorName>
                            <PostTime><Clock size={12}/> {timeAgo(post.createdAt)}</PostTime>
                        </AuthorInfo>
                    </AuthorRow>

                    <Content>{post.content}</Content>

                    <StatsRow>
                        <Stat><Heart size={15}/> {post.likes?.length || 0} likes</Stat>
                        <Stat><MessageSquare size={15}/> {post.comments?.length || 0} comments</Stat>
                    </StatsRow>
                </PostCard>

                {post.comments?.length > 0 && (
                    <CommentsSection>
                        <CommentTitle><MessageSquare size={16}/> Comments ({post.comments.length})</CommentTitle>
                        {post.comments.map((c, i) => {
                            const cUser = c.user || {};
                            const cName = cUser.username || 'User';
                            return (
                                <Comment key={i}>
                                    <CommentAvatar>{cName.charAt(0).toUpperCase()}</CommentAvatar>
                                    <CommentBody>
                                        <div>
                                            <CommentUser onClick={() => goToProfile(cName)}>{cName}</CommentUser>
                                            <CommentTime>{timeAgo(c.createdAt)}</CommentTime>
                                        </div>
                                        <CommentText>{c.text}</CommentText>
                                    </CommentBody>
                                </Comment>
                            );
                        })}
                    </CommentsSection>
                )}
            </Container>
        </Page>
    );
};

export default PostDetailPage;
