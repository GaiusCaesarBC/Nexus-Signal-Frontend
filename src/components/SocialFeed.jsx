import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Heart, TrendingUp, Users, Plus, Filter, Sparkles, Flame, Zap } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import { useAuth } from '../context/AuthContext';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  padding-top: 80px;
  background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
  color: #e0e6ed;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-bottom: 2rem;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 3rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const TopBar = styled.div`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${shimmer} 3s linear infinite;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const TitleIcon = styled.div`
  animation: ${float} 3s ease-in-out infinite;
`;

const CreateButton = styled.button`
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  border-radius: 12px;
  color: #0a0e27;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: 0.75rem 1.25rem;
  background: ${props => props.$active ? 
    'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%)' :
    'rgba(30, 41, 59, 0.5)'
  };
  border: 1px solid ${props => props.$active ? 'rgba(255, 215, 0, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
  border-radius: 12px;
  color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 215, 0, 0.15) 100%);
    border-color: rgba(255, 215, 0, 0.5);
    color: #ffd700;
    transform: translateY(-2px);
  }
`;

const FeedContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 215, 0, 0.2);
  border-top-color: #ffd700;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const EmptyIcon = styled.div`
  width: 150px;
  height: 150px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px dashed rgba(255, 215, 0, 0.4);
  animation: ${float} 3s ease-in-out infinite;
`;

const EmptyTitle = styled.h2`
  color: #ffd700;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const EmptyText = styled.p`
  color: #94a3b8;
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const EmptyButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  border: none;
  border-radius: 12px;
  color: #0a0e27;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);
  }
`;

const EndMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const SocialFeed = () => {
  const { api, isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, following, trending
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const observerTarget = useRef(null);

  // ✅ FIXED: Fetch feed using correct backend endpoints
  const fetchFeed = async (filterType = filter, pageNum = 1, append = false) => {
    try {
      setLoading(true);

      let endpoint = '/feed'; // Default: personalized feed (following)
      
      // Map filter to correct endpoint
      if (filterType === 'trending' || filterType === 'all') {
        endpoint = '/feed/discover'; // Discover/trending feed
      } else if (filterType === 'following') {
        endpoint = '/feed'; // Personalized feed
      }

      const response = await api.get(`${endpoint}?limit=20&skip=${(pageNum - 1) * 20}`);
      
      const newPosts = response.data.posts || [];

      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(newPosts.length === 20); // If we got 20, there might be more
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feed:', error);
      setPosts([]);
      setHasMore(false);
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchFeed(filter, 1, false);
    }
  }, [filter, isAuthenticated]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
          fetchFeed(filter, page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, page, filter]);

  // ✅ FIXED: Handle like using api instance
  const handleLike = async (postId) => {
    try {
      // Check if already liked by looking at current state
      const post = posts.find(p => p._id === postId);
      const isCurrentlyLiked = post?.likes?.includes(user?._id);

      if (isCurrentlyLiked) {
        // Unlike
        await api.delete(`/feed/${postId}/like`);
        setPosts(posts.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                likes: p.likes.filter(id => id !== user._id),
                likesCount: p.likesCount - 1 
              }
            : p
        ));
      } else {
        // Like
        await api.post(`/feed/${postId}/like`);
        setPosts(posts.map(p => 
          p._id === postId 
            ? { 
                ...p, 
                likes: [...(p.likes || []), user._id],
                likesCount: p.likesCount + 1 
              }
            : p
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // ✅ FIXED: Handle comment using api instance
  const handleComment = async (postId, text) => {
    try {
      const response = await api.post(`/feed/${postId}/comment`, { text });

      // Update post in state
      setPosts(posts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              comments: [...(post.comments || []), response.data.comment],
              commentsCount: response.data.commentsCount 
            }
          : post
      ));

      return response.data.comment;
    } catch (error) {
      console.error('Error commenting:', error);
      throw error;
    }
  };

  // ✅ FIXED: Handle delete post using api instance
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/feed/${postId}`);

      // Remove post from state
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  // Handle new post created
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreateModal(false);
  };

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <TopBar>
          <TitleRow>
            <Title>
              <TitleIcon>
                <Sparkles size={40} color="#ffd700" />
              </TitleIcon>
              Social Feed
            </Title>
            <CreateButton onClick={() => setShowCreateModal(true)}>
              <Plus size={20} />
              Create Post
            </CreateButton>
          </TitleRow>

          {/* Filter Tabs */}
          <FiltersContainer>
            <FilterChip
              $active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              <Filter size={18} />
              Discover
            </FilterChip>
            <FilterChip
              $active={filter === 'following'}
              onClick={() => setFilter('following')}
            >
              <Users size={18} />
              Following
            </FilterChip>
            <FilterChip
              $active={filter === 'trending'}
              onClick={() => setFilter('trending')}
            >
              <Flame size={18} />
              Trending
            </FilterChip>
          </FiltersContainer>
        </TopBar>
      </Header>

      {/* Feed Content */}
      <FeedContent>
        {/* Posts */}
        <PostsContainer>
          {Array.isArray(posts) && posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDeletePost}
            />
          ))}
        </PostsContainer>

        {/* Loading Indicator */}
        {loading && posts.length === 0 && (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        )}

        {/* Infinite Scroll Trigger */}
        <div ref={observerTarget} style={{ height: '20px' }} />

        {/* Loading More */}
        {loading && posts.length > 0 && (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        )}

        {/* No More Posts */}
        {!hasMore && posts.length > 0 && (
          <EndMessage>
            <Zap size={20} color="#ffd700" />
            You've reached the end! 🎉
          </EndMessage>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <EmptyState>
            <EmptyIcon>
              <MessageCircle size={80} color="#ffd700" />
            </EmptyIcon>
            <EmptyTitle>
              {filter === 'following' ? 'No posts from people you follow' : 'No posts yet'}
            </EmptyTitle>
            <EmptyText>
              {filter === 'following' 
                ? 'Follow some traders to see their posts here!'
                : 'Be the first to share something with the community!'}
            </EmptyText>
            <EmptyButton onClick={() => setShowCreateModal(true)}>
              <Plus size={20} style={{ marginRight: '0.5rem' }} />
              Create First Post
            </EmptyButton>
          </EmptyState>
        )}
      </FeedContent>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </PageContainer>
  );
};

export default SocialFeed;