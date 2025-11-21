import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  X, MessageSquare, TrendingUp, Trophy, Target, 
  BookOpen, Send, Sparkles, Crown, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // ✅ IMPORT AUTH

// ============ ANIMATIONS ============
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// ============ STYLED COMPONENTS ============
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 39, 0.9);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 999;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Modal = styled.div`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 24px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.4s ease-out;
`;

const ModalHeader = styled.div`
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border-bottom: 2px solid rgba(255, 215, 0, 0.2);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  padding: 0.5rem;
  color: #ffd700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 215, 0, 0.2);
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.form`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PostTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const PostTypeButton = styled.button`
  padding: 1.25rem 1rem;
  background: ${props => props.$active ? 
    'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.15))' :
    'rgba(30, 41, 59, 0.5)'
  };
  border: 2px solid ${props => props.$active ? 
    'rgba(255, 215, 0, 0.5)' : 
    'rgba(100, 116, 139, 0.3)'
  };
  border-radius: 12px;
  color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.15));
    border-color: rgba(255, 215, 0, 0.5);
    color: #ffd700;
    transform: translateY(-2px);
  }

  svg {
    animation: ${props => props.$active ? pulse : 'none'} 2s ease-in-out infinite;
  }
`;

const TypeLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
`;

const TradeFormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
`;

const InputGroup = styled.div``;

const InputLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  color: #e0e6ed;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 215, 0, 0.5);
    background: rgba(30, 41, 59, 1);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 10px;
  color: #e0e6ed;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 215, 0, 0.5);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  color: #e0e6ed;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(255, 215, 0, 0.5);
    background: rgba(30, 41, 59, 1);
  }

  &::placeholder {
    color: #64748b;
  }
`;

const CharCounter = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.5rem;
`;

const VisibilityRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const VisibilityButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.$active ? 
    'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.15))' :
    'rgba(30, 41, 59, 0.5)'
  };
  border: 2px solid ${props => props.$active ? 
    'rgba(255, 215, 0, 0.5)' : 
    'rgba(100, 116, 139, 0.3)'
  };
  border-radius: 10px;
  color: ${props => props.$active ? '#ffd700' : '#94a3b8'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.15));
    border-color: rgba(255, 215, 0, 0.5);
    color: #ffd700;
  }
`;

const VisibilityTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const VisibilityDesc = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const CancelButton = styled(Button)`
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #94a3b8;

  &:hover {
    background: rgba(100, 116, 139, 0.3);
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border: none;
  color: #0a0e27;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { api, isAuthenticated } = useAuth(); // ✅ USE AUTH CONTEXT
  const [postType, setPostType] = useState('status');
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);

  const [tradeData, setTradeData] = useState({
    symbol: '',
    action: 'buy',
    shares: '',
    price: '',
    profit: '',
    profitPercent: ''
  });

  const postTypes = [
    { id: 'status', icon: MessageSquare, label: 'Status' },
    { id: 'trade', icon: TrendingUp, label: 'Trade' },
    { id: 'achievement', icon: Trophy, label: 'Achievement' },
    { id: 'milestone', icon: Target, label: 'Milestone' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Check authentication
    if (!isAuthenticated) {
      alert('You must be logged in to create a post');
      return;
    }

    setLoading(true);

    try {
      const content = { text: text.trim() };

      if (postType === 'trade') {
        content.trade = {
          symbol: tradeData.symbol,
          action: tradeData.action,
          shares: parseFloat(tradeData.shares),
          price: parseFloat(tradeData.price),
          profit: tradeData.profit ? parseFloat(tradeData.profit) : undefined,
          profitPercent: tradeData.profitPercent ? parseFloat(tradeData.profitPercent) : undefined,
        };
      }

      // ✅ Use api instance from context - no tokens needed!
      const response = await api.post('/feed/post', {
        type: postType,
        content,
        visibility
      });

      // Success!
      onPostCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.msg || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (postType === 'trade') {
      return tradeData.symbol && tradeData.shares && tradeData.price;
    }
    return text.trim().length > 0;
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Sparkles size={28} />
            Create Post
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody onSubmit={handleSubmit}>
          {/* Post Type Selection */}
          <Section>
            <SectionLabel>Post Type</SectionLabel>
            <PostTypeGrid>
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <PostTypeButton
                    key={type.id}
                    type="button"
                    $active={postType === type.id}
                    onClick={() => setPostType(type.id)}
                  >
                    <Icon size={24} />
                    <TypeLabel>{type.label}</TypeLabel>
                  </PostTypeButton>
                );
              })}
            </PostTypeGrid>
          </Section>

          {/* Trade-specific fields */}
          {postType === 'trade' && (
            <Section>
              <SectionLabel>Trade Details</SectionLabel>
              <TradeFormGrid>
                <InputGroup>
                  <InputLabel>Symbol *</InputLabel>
                  <Input
                    type="text"
                    value={tradeData.symbol}
                    onChange={(e) => setTradeData({...tradeData, symbol: e.target.value.toUpperCase()})}
                    placeholder="AAPL"
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel>Action *</InputLabel>
                  <Select
                    value={tradeData.action}
                    onChange={(e) => setTradeData({...tradeData, action: e.target.value})}
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </Select>
                </InputGroup>

                <InputGroup>
                  <InputLabel>Shares *</InputLabel>
                  <Input
                    type="number"
                    value={tradeData.shares}
                    onChange={(e) => setTradeData({...tradeData, shares: e.target.value})}
                    placeholder="100"
                    min="0"
                    step="any"
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel>Price *</InputLabel>
                  <Input
                    type="number"
                    value={tradeData.price}
                    onChange={(e) => setTradeData({...tradeData, price: e.target.value})}
                    placeholder="150.00"
                    min="0"
                    step="0.01"
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel>Profit (optional)</InputLabel>
                  <Input
                    type="number"
                    value={tradeData.profit}
                    onChange={(e) => setTradeData({...tradeData, profit: e.target.value})}
                    placeholder="500.00"
                    step="0.01"
                  />
                </InputGroup>

                <InputGroup>
                  <InputLabel>Profit % (optional)</InputLabel>
                  <Input
                    type="number"
                    value={tradeData.profitPercent}
                    onChange={(e) => setTradeData({...tradeData, profitPercent: e.target.value})}
                    placeholder="15.5"
                    step="0.01"
                  />
                </InputGroup>
              </TradeFormGrid>
            </Section>
          )}

          {/* Text Content */}
          <Section>
            <SectionLabel>
              {postType === 'trade' ? 'Additional Notes (optional)' : 'What\'s on your mind?'}
            </SectionLabel>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                postType === 'trade' 
                  ? 'Share your trading strategy or thoughts...'
                  : 'Share your thoughts with the community...'
              }
              maxLength={500}
            />
            <CharCounter>{text.length}/500 characters</CharCounter>
          </Section>

          {/* Visibility */}
          <Section>
            <SectionLabel>Who can see this?</SectionLabel>
            <VisibilityRow>
              <VisibilityButton
                type="button"
                $active={visibility === 'public'}
                onClick={() => setVisibility('public')}
              >
                <VisibilityTitle>Public</VisibilityTitle>
                <VisibilityDesc>Everyone can see</VisibilityDesc>
              </VisibilityButton>
              
              <VisibilityButton
                type="button"
                $active={visibility === 'followers'}
                onClick={() => setVisibility('followers')}
              >
                <VisibilityTitle>Followers</VisibilityTitle>
                <VisibilityDesc>Only followers</VisibilityDesc>
              </VisibilityButton>
              
              <VisibilityButton
                type="button"
                $active={visibility === 'private'}
                onClick={() => setVisibility('private')}
              >
                <VisibilityTitle>Private</VisibilityTitle>
                <VisibilityDesc>Only you</VisibilityDesc>
              </VisibilityButton>
            </VisibilityRow>
          </Section>

          {/* Action Buttons */}
          <ActionButtons>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={!isFormValid() || loading}>
              {loading ? 'Posting...' : <><Send size={20} /> Post</>}
            </SubmitButton>
          </ActionButtons>
        </ModalBody>
      </Modal>
    </Overlay>
  );
};

export default CreatePostModal;