import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ ADD THIS
import styled, { keyframes } from 'styled-components';
import { 
  Heart, MessageCircle, TrendingUp, Trophy, Target, 
  BookOpen, MoreVertical, Trash2, Share2, ArrowUpCircle,
  ArrowDownCircle, Crown, Flame, Zap
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const likeAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

// ============ STYLED COMPONENTS ============
const CardContainer = styled.div`
  background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 215, 0, 0.4);
    box-shadow: 0 12px 40px rgba(255, 215, 0, 0.2);
  }
`;

const PostHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$src ? 
    `url(${props.$src}) center/cover` : 
    'linear-gradient(135deg, #ffd700, #ffed4e)'
  };
  border: 2px solid rgba(255, 215, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0e27;
  font-weight: 900;
  font-size: ${props => props.$src ? '0' : '1.2rem'}; // ✅ Hide text when image exists
  flex-shrink: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
`;

const AvatarInitials = styled.div`
  position: relative;
  z-index: 1;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DisplayName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #e0e6ed;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer; // ✅ ADD THIS
  transition: color 0.2s ease; // ✅ ADD THIS

  &:hover {
    color: #ffd700; // ✅ ADD THIS
  }
`;

const Username = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ReturnBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${props => props.$positive ? 
    'rgba(16, 185, 129, 0.2)' : 
    'rgba(239, 68, 68, 0.2)'
  };
  border: 1px solid ${props => props.$positive ? 
    'rgba(16, 185, 129, 0.4)' : 
    'rgba(239, 68, 68, 0.4)'
  };
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

const MenuButton = styled.button`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  color: #ffd700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.2);
  }
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: rgba(30, 41, 59, 0.98);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 0.5rem;
  min-width: 180px;
  z-index: 10;
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

const PostContent = styled.div`
  padding: 1.5rem;
`;

const TradeCard = styled.div`
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const TradeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TradeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$action === 'buy' ? 
    'rgba(16, 185, 129, 0.2)' :
    'rgba(239, 68, 68, 0.2)'
  };
  border: 2px solid ${props => props.$action === 'buy' ? 
    'rgba(16, 185, 129, 0.4)' : 
    'rgba(239, 68, 68, 0.4)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$action === 'buy' ? '#10b981' : '#ef4444'};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const TradeInfo = styled.div``;

const TradeAction = styled.div`
  font-size: 1.3rem;
  font-weight: 900;
  color: #e0e6ed;
  text-transform: uppercase;
`;

const TradeDetails = styled.div`
  color: #64748b;
  font-size: 0.9rem;
`;

const TradeProfit = styled.div`
  text-align: right;
`;

const ProfitAmount = styled.div`
  font-size: 1.5rem;
  font-weight: 900;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ProfitPercent = styled.div`
  font-size: 0.9rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

const AchievementCard = styled.div`
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const AchievementHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const AchievementIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0e27;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const AchievementText = styled.div`
  flex: 1;
`;

const AchievementTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #ffd700;
`;

const AchievementName = styled.div`
  font-size: 1.2rem;
  font-weight: 900;
  color: #e0e6ed;
`;

const AchievementDescription = styled.div`
  color: #94a3b8;
`;

const PostText = styled.p`
  color: #e0e6ed;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const EngagementBar = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EngagementButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const EngagementButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: ${props => props.$active ? 'rgba(255, 215, 0, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.$active ? 'rgba(255, 215, 0, 0.4)' : 'rgba(100, 116, 139, 0.3)'};
  border-radius: 10px;
  color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.4);
    color: #ffd700;
  }

  svg {
    animation: ${props => props.$active && props.$type === 'like' ? likeAnimation : 'none'} 0.3s ease;
  }
`;

const ShareButton = styled.button`
  padding: 0.625rem;
  background: transparent;
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.1);
    color: #ffd700;
  }
`;

const CommentsSection = styled.div`
  border-top: 1px solid rgba(255, 215, 0, 0.1);
  background: rgba(10, 14, 39, 0.4);
`;

const CommentsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const Comment = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.05);
  display: flex;
  gap: 0.75rem;
`;

const CommentAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$src ? 
    `url(${props.$src}) center/cover` : 
    'linear-gradient(135deg, #ffd700, #ffed4e)'
  };
  border: 2px solid rgba(255, 215, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0e27;
  font-weight: 900;
  font-size: ${props => props.$src ? '0' : '0.9rem'}; // ✅ Hide text when image exists
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const CommentAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
`;

const CommentAvatarInitials = styled.div`
  position: relative;
  z-index: 1;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.span`
  font-weight: 700;
  color: #e0e6ed;
  cursor: pointer; // ✅ ADD THIS
  transition: color 0.2s ease;

  &:hover {
    color: #ffd700;
  }
`;

const CommentTime = styled.span`
  font-size: 0.75rem;
  color: #64748b;
`;

const CommentText = styled.p`
  color: #94a3b8;
  font-size: 0.9rem;
`;

const CommentInputSection = styled.form`
  padding: 1rem 1.5rem;
`;

const CommentInputWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.8)'};
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  color: #e0e6ed;

  &:focus {
    outline: none;
    border-color: rgba(255, 215, 0, 0.5);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const CommentSubmit = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border: none;
  border-radius: 10px;
  color: #0a0e27;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const CharCounter = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.5rem;
`;

const PostCard = ({ post, onLike, onComment, onDelete }) => {
  const navigate = useNavigate(); // ✅ ADD THIS
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isOwnPost = post.user._id === currentUserId;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  // ✅ ADD THIS - Navigate to profile
  const handleProfileClick = (username) => {
    navigate(`/trader/${username}`);
  };

  // Helper to get user initials
  const getInitials = (user) => {
    const displayName = user?.profile?.displayName || user?.username || 'U';
    return displayName.charAt(0).toUpperCase();
  };

  const renderPostContent = () => {
    switch (post.type) {
      case 'trade':
        return (
          <TradeCard>
            <TradeHeader>
              <TradeLeft>
                <ActionIcon $action={post.content.trade.action}>
                  {post.content.trade.action === 'buy' ? (
                    <ArrowUpCircle size={28} />
                  ) : (
                    <ArrowDownCircle size={28} />
                  )}
                </ActionIcon>
                <TradeInfo>
                  <TradeAction>
                    {post.content.trade.action} {post.content.trade.symbol}
                  </TradeAction>
                  <TradeDetails>
                    {post.content.trade.shares} shares @ ${post.content.trade.price.toFixed(2)}
                  </TradeDetails>
                </TradeInfo>
              </TradeLeft>
              
              {post.content.trade.profit !== undefined && (
                <TradeProfit>
                  <ProfitAmount $positive={post.content.trade.profit >= 0}>
                    {post.content.trade.profit >= 0 ? '+' : ''}
                    ${Math.abs(post.content.trade.profit).toFixed(2)}
                  </ProfitAmount>
                  <ProfitPercent $positive={post.content.trade.profitPercent >= 0}>
                    {post.content.trade.profitPercent >= 0 ? '+' : ''}
                    {post.content.trade.profitPercent.toFixed(2)}%
                  </ProfitPercent>
                </TradeProfit>
              )}
            </TradeHeader>
            {post.content.text && <PostText>{post.content.text}</PostText>}
          </TradeCard>
        );

      case 'achievement':
        return (
          <AchievementCard>
            <AchievementHeader>
              <AchievementIcon>
                <Trophy size={24} />
              </AchievementIcon>
              <AchievementText>
                <AchievementTitle>Achievement Unlocked!</AchievementTitle>
                <AchievementName>{post.content.achievement.name}</AchievementName>
              </AchievementText>
            </AchievementHeader>
            <AchievementDescription>
              {post.content.achievement.description}
            </AchievementDescription>
          </AchievementCard>
        );

      default:
        return post.content.text && <PostText>{post.content.text}</PostText>;
    }
  };

  return (
    <CardContainer>
      <PostHeader>
        <HeaderTop>
          <UserSection>
            {/* ✅ UPDATED: Clickable Avatar */}
            <Avatar onClick={() => handleProfileClick(post.user.username)}>
              {post.user.profile?.avatar ? (
                <AvatarImage 
                  src={post.user.profile.avatar} 
                  alt={post.user.profile?.displayName || post.user.username}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <AvatarInitials>
                  {getInitials(post.user)}
                </AvatarInitials>
              )}
            </Avatar>
            
            <UserInfo>
              {/* ✅ UPDATED: Clickable Display Name */}
              <DisplayName onClick={() => handleProfileClick(post.user.username)}>
                {post.user.profile?.displayName || post.user.username}
                {post.user.stats?.rank === 1 && <Crown size={16} color="#ffd700" />}
              </DisplayName>
              <Username>
                <span>@{post.user.username}</span>
                <span>•</span>
                <span>{post.timeAgo}</span>
                {post.user.stats?.totalReturnPercent !== undefined && (
                  <>
                    <span>•</span>
                    <ReturnBadge $positive={post.user.stats.totalReturnPercent >= 0}>
                      {post.user.stats.totalReturnPercent >= 0 ? '+' : ''}
                      {post.user.stats.totalReturnPercent.toFixed(1)}%
                    </ReturnBadge>
                  </>
                )}
              </Username>
            </UserInfo>
          </UserSection>

          {isOwnPost && (
            <div style={{ position: 'relative' }}>
              <MenuButton onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical size={20} />
              </MenuButton>
              
              {showMenu && (
                <Menu>
                  <MenuItem onClick={() => {
                    onDelete(post._id);
                    setShowMenu(false);
                  }}>
                    <Trash2 size={16} />
                    Delete Post
                  </MenuItem>
                </Menu>
              )}
            </div>
          )}
        </HeaderTop>
      </PostHeader>

      <PostContent>
        {renderPostContent()}
      </PostContent>

      <EngagementBar>
        <EngagementButtons>
          <EngagementButton
            $active={post.isLiked}
            $type="like"
            onClick={() => onLike(post._id)}
          >
            <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
            <span>{post.likesCount}</span>
          </EngagementButton>

          <EngagementButton
            $active={showComments}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={20} />
            <span>{post.commentsCount}</span>
          </EngagementButton>
        </EngagementButtons>

        <ShareButton>
          <Share2 size={20} />
        </ShareButton>
      </EngagementBar>

      {showComments && (
        <CommentsSection>
          <CommentsList>
            {post.comments.map((comment) => (
              <Comment key={comment._id}>
                {/* ✅ UPDATED: Clickable Comment Avatar */}
                <CommentAvatar onClick={() => handleProfileClick(comment.user.username)}>
                  {comment.user.profile?.avatar ? (
                    <CommentAvatarImage 
                      src={comment.user.profile.avatar} 
                      alt={comment.user.profile?.displayName || comment.user.username}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <CommentAvatarInitials>
                      {getInitials(comment.user)}
                    </CommentAvatarInitials>
                  )}
                </CommentAvatar>
                <CommentContent>
                  <CommentHeader>
                    {/* ✅ UPDATED: Clickable Comment Author */}
                    <CommentAuthor onClick={() => handleProfileClick(comment.user.username)}>
                      {comment.user.profile?.displayName || comment.user.username}
                    </CommentAuthor>
                    <CommentTime>
                      {new Date(comment.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </CommentTime>
                  </CommentHeader>
                  <CommentText>{comment.text}</CommentText>
                </CommentContent>
              </Comment>
            ))}
          </CommentsList>

          <CommentInputSection onSubmit={handleCommentSubmit}>
            <CommentInputWrapper>
              <CommentInput
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={300}
              />
              <CommentSubmit type="submit" disabled={!commentText.trim()}>
                Post
              </CommentSubmit>
            </CommentInputWrapper>
            <CharCounter>{commentText.length}/300 characters</CharCounter>
          </CommentInputSection>
        </CommentsSection>
      )}
    </CardContainer>
  );
};

export default PostCard;