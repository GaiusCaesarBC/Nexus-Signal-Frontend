// ═══════════════════════════════════════════════════════════
// SOCIALFEED.JSX — Market Intelligence Feed (Redesigned)
// Preserves: All API logic, vault/border integration, reactions, comments, polls, create post modal
// ═══════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { useVault } from '../context/VaultContext';
import BadgeIcon from './BadgeIcon';
import AvatarWithBorder from './vault/AvatarWithBorder';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, MessageCircle, Heart, Share2, Bookmark,
    MoreHorizontal, Send, Image, Smile, Hash, AtSign, Users,
    Flame, Trophy, Target, BarChart2, Clock, Check, Plus,
    RefreshCw, ArrowUp, X, Copy, Zap, Activity, UserPlus,
    Link2, Flag, Trash2, BookmarkCheck, MessageSquare, ChevronDown,
    Award, Star, ArrowUpRight, ArrowDownRight, Eye, Radio,
    Shield, CheckCircle, ChevronRight, AlertTriangle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// BORDER COLOR MAP (Vault Integration — preserved)
// ═══════════════════════════════════════════════════════════
const BORDER_COLORS = {
    'border-bronze': { color: '#CD7F32', glow: 'rgba(205, 127, 50, 0.5)' },
    'border-silver': { color: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.5)' },
    'border-gold': { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.6)' },
    'border-emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
    'border-ruby': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.7)' },
    'border-platinum': { color: '#E5E4E2', glow: 'rgba(229, 228, 226, 0.7)' },
    'border-sapphire': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.7)' },
    'border-amethyst': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.7)' },
    'border-diamond': { color: '#00D4FF', glow: 'rgba(0, 212, 255, 0.8)' },
    'border-rainbow': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.9)' },
    'border-nexus': { color: '#00adef', glow: 'rgba(0, 173, 237, 1)' },
    'border-crimson-blade': { color: '#dc2626', glow: 'rgba(220, 38, 38, 0.7)' },
    'border-tsunami': { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.7)' },
    'border-ancient-oak': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.7)' },
    'border-phantom': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.7)' },
    'border-toxic-haze': { color: '#84cc16', glow: 'rgba(132, 204, 22, 0.8)' },
    'border-mystic-runes': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)' },
    'border-inferno-crown': { color: '#f97316', glow: 'rgba(249, 115, 22, 0.9)' },
    'border-lightning-fury': { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.9)' },
    'border-void-portal': { color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.9)' },
    'border-deaths-embrace': { color: '#4b5563', glow: 'rgba(75, 85, 99, 0.9)' },
    'border-dragon-wrath': { color: '#dc2626', glow: 'rgba(220, 38, 38, 1)' },
    'border-frozen-eternity': { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.9)' },
    'border-cosmic-destroyer': { color: '#6366f1', glow: 'rgba(99, 102, 241, 1)' },
    'border-blood-moon': { color: '#dc2626', glow: 'rgba(220, 38, 38, 0.95)' },
    'border-quantum-rift': { color: '#d946ef', glow: 'rgba(217, 70, 239, 0.9)' },
    'border-divine-ascension': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 1)' },
    'border-abyssal-terror': { color: '#0891b2', glow: 'rgba(8, 145, 178, 0.9)' },
    'border-supernova-core': { color: '#f97316', glow: 'rgba(249, 115, 22, 1)' },
    'border-all-seeing-eye': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.95)' },
    'border-prismatic-fury': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 1)' },
    'border-apex-predator': { color: '#dc2626', glow: 'rgba(220, 38, 38, 1)' },
    'border-reality-shatter': { color: '#ec4899', glow: 'rgba(236, 72, 153, 1)' },
    'border-eternal-sovereign': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 1)' },
    'border-architects-ring': { color: '#d4af37', glow: 'rgba(212, 175, 55, 1)' },
    'default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    null: { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    undefined: { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' }
};

// Trading-aware reactions
const REACTIONS = [
    { name: 'bull', emoji: '🐂', color: '#10b981', label: 'Bullish' },
    { name: 'bear', emoji: '🐻', color: '#ef4444', label: 'Bearish' },
    { name: 'like', emoji: '👀', color: '#0ea5e9', label: 'Watching' },
    { name: 'fire', emoji: '🔥', color: '#f59e0b', label: 'Fire' },
    { name: 'rocket', emoji: '🚀', color: '#3b82f6', label: 'Rocket' },
    { name: 'diamond', emoji: '💎', color: '#06b6d4', label: 'Diamond' },
    { name: 'money', emoji: '💰', color: '#fbbf24', label: 'Money' }
];

const BADGE_ICONS = {
    'badge-founder': '👑', 'badge-first-trade': '🎯', 'badge-week-warrior': '⭐',
    'badge-trade-master': '📊', 'badge-portfolio-builder': '🏗️', 'badge-profit-king': '💰',
    'badge-dedicated': '🔥', 'badge-prediction-master': '🔮', 'badge-level-50': '5️⃣0️⃣',
    'badge-whale': '🐋', 'badge-level-100': '💯', 'badge-millionaire': '💵'
};

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ═══════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;
const spin = keyframes`from{transform:rotate(0)}to{transform:rotate(360deg)}`;
const bounceIn = keyframes`0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}`;
const featuredGlow = keyframes`0%,100%{box-shadow:0 0 15px rgba(0,173,237,.06)}50%{box-shadow:0 0 30px rgba(0,173,237,.15)}`;

// ═══════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════
const PageContainer = styled.div`min-height:100vh;padding:5.5rem 1.5rem 3rem;max-width:1320px;margin:0 auto;@media(max-width:768px){padding:5rem .75rem 2rem;}`;
const MainContent = styled.div`display:grid;grid-template-columns:240px 1fr 300px;gap:1.25rem;@media(max-width:1200px){grid-template-columns:1fr 300px;}@media(max-width:900px){grid-template-columns:1fr;}`;

// ─── Left Sidebar ────────────────────────────────────────
const LeftSidebar = styled.div`display:flex;flex-direction:column;gap:1rem;position:sticky;top:5.5rem;height:fit-content;@media(max-width:1200px){display:none;}`;
const SideCard = styled.div`background:rgba(12,16,32,.9);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:1rem;`;
const SideCardTitle = styled.h3`font-size:.78rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;margin:0 0 .65rem;display:flex;align-items:center;gap:.35rem;`;
const NavItem = styled.button`
    width:100%;display:flex;align-items:center;gap:.5rem;padding:.55rem .7rem;
    border-radius:8px;border:none;font-size:.82rem;font-weight:600;cursor:pointer;
    transition:all .2s;text-align:left;
    background:${p=>p.$active?'rgba(0,173,237,.1)':'transparent'};
    color:${p=>p.$active?'#00adef':'#64748b'};
    &:hover{background:rgba(0,173,237,.06);color:#00adef;}
`;
const TrendTag = styled.div`
    display:flex;align-items:center;justify-content:space-between;
    padding:.4rem .55rem;border-radius:6px;cursor:pointer;
    transition:all .15s;&:hover{background:rgba(255,255,255,.03);}
`;
const TrendSymbol = styled.span`font-size:.78rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.3rem;`;
const TrendCount = styled.span`font-size:.65rem;color:#475569;`;

// ─── Center Feed ─────────────────────────────────────────
const FeedCol = styled.div`display:flex;flex-direction:column;gap:1rem;min-width:0;`;

// Page Header
const PageHeader = styled.div`animation:${fadeIn} .4s ease-out;margin-bottom:.25rem;`;
const PageTitle = styled.h1`font-size:1.35rem;font-weight:800;color:#fff;margin:0 0 .15rem;display:flex;align-items:center;gap:.5rem;`;
const PageSub = styled.p`font-size:.78rem;color:#64748b;margin:0;`;

// Filters
const FilterRow = styled.div`display:flex;gap:.35rem;flex-wrap:wrap;overflow-x:auto;padding-bottom:.25rem;`;
const FilterTab = styled.button`
    padding:.4rem .7rem;border-radius:7px;font-size:.72rem;font-weight:600;cursor:pointer;
    white-space:nowrap;transition:all .2s;
    background:${p=>p.$active?'rgba(0,173,237,.12)':'rgba(255,255,255,.02)'};
    border:1px solid ${p=>p.$active?'rgba(0,173,237,.3)':'rgba(255,255,255,.05)'};
    color:${p=>p.$active?'#00adef':'#64748b'};
    &:hover{border-color:rgba(0,173,237,.2);color:#00adef;}
`;
const RefreshBtn = styled.button`
    margin-left:auto;padding:.35rem .65rem;border-radius:7px;font-size:.72rem;font-weight:600;
    cursor:pointer;display:flex;align-items:center;gap:.25rem;
    background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);color:#64748b;
    transition:all .2s;&:hover{color:#00adef;}
    &.spinning svg{animation:${spin} .8s linear;}
`;

// ─── Most Discussed Signal ───────────────────────────────
const FeaturedSignal = styled.div`
    background:rgba(12,16,32,.92);border:1px solid rgba(0,173,237,.15);
    border-radius:14px;padding:1.15rem;animation:${featuredGlow} 4s ease-in-out infinite;
    cursor:pointer;transition:all .25s;
    &:hover{border-color:rgba(0,173,237,.35);transform:translateY(-2px);}
`;
const FSLabel = styled.div`font-size:.62rem;font-weight:700;color:#00adef;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.5rem;display:flex;align-items:center;gap:.3rem;`;
const FSRow = styled.div`display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;`;
const FSLeft = styled.div`display:flex;align-items:center;gap:.6rem;`;
const FSSymbol = styled.span`font-size:1.15rem;font-weight:900;color:#fff;`;
const FSDir = styled.span`
    padding:.2rem .55rem;border-radius:5px;font-size:.7rem;font-weight:800;
    background:${p=>p.$long?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
`;
const FSConf = styled.span`font-size:.75rem;font-weight:700;color:${p=>p.$c||'#10b981'};`;
const FSRight = styled.div`text-align:right;`;
const FSMeta = styled.div`font-size:.68rem;color:#475569;`;
const FSCta = styled.div`
    display:flex;align-items:center;gap:.25rem;margin-top:.4rem;
    font-size:.72rem;font-weight:600;color:#00adef;
`;

// ─── Composer ────────────────────────────────────────────
const ComposerBox = styled.div`
    background:rgba(12,16,32,.9);border:1px solid rgba(255,255,255,.06);
    border-radius:14px;padding:1rem;
`;
const ComposerTop = styled.div`display:flex;align-items:center;gap:.65rem;margin-bottom:.65rem;`;
const ComposerInput = styled.div`
    flex:1;padding:.6rem .85rem;border-radius:25px;
    background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
    color:#64748b;font-size:.85rem;cursor:pointer;
    transition:all .2s;&:hover{border-color:rgba(0,173,237,.2);color:#94a3b8;}
`;
const QuickActions = styled.div`display:flex;gap:.5rem;flex-wrap:wrap;`;
const QuickBtn = styled.button`
    display:flex;align-items:center;gap:.3rem;padding:.35rem .65rem;
    border-radius:7px;border:1px solid rgba(255,255,255,.05);
    background:rgba(255,255,255,.02);color:${p=>p.$c||'#64748b'};
    font-size:.72rem;font-weight:600;cursor:pointer;transition:all .2s;
    &:hover{background:${p=>p.$hc||'rgba(0,173,237,.06)'};color:${p=>p.$c||'#00adef'};border-color:${p=>`${p.$c||'#00adef'}30`};}
`;

// ─── Post Card ───────────────────────────────────────────
const PostCard = styled.div`
    background:rgba(12,16,32,.9);border:1px solid rgba(255,255,255,.06);
    border-radius:14px;overflow:hidden;transition:all .2s;
    animation:${slideUp} .35s ease-out;
    ${p=>p.$isPinned&&'border-color:rgba(245,158,11,.2);'}
    &:hover{border-color:rgba(255,255,255,.1);}
`;
const PostHeader = styled.div`display:flex;align-items:center;justify-content:space-between;padding:1rem 1.15rem .5rem;`;
const PostAuthor = styled.div`display:flex;align-items:center;gap:.6rem;flex:1;min-width:0;`;
const AuthorInfo = styled.div`flex:1;min-width:0;`;
const AuthorName = styled.div`
    font-size:.85rem;font-weight:700;color:#e0e6ed;cursor:pointer;display:flex;align-items:center;gap:.3rem;
    &:hover{color:#00adef;}
`;
const VerifiedBadge = styled.span`display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:#00adef;color:#fff;flex-shrink:0;`;
const LevelBadge = styled.span`font-size:.58rem;padding:.1rem .3rem;border-radius:3px;background:rgba(0,173,237,.1);color:#0ea5e9;font-weight:700;`;
const BadgesContainer = styled.div`display:flex;align-items:center;gap:.15rem;margin-left:.15rem;`;
const MiniBadge = styled.span`display:flex;align-items:center;`;
const MoreBadgesIndicator = styled.span`font-size:.55rem;color:#475569;font-weight:600;`;
const AuthorMeta = styled.div`display:flex;align-items:center;gap:.35rem;font-size:.72rem;color:#475569;`;
const Username = styled.span`cursor:pointer;&:hover{color:#00adef;}`;
const PostTime = styled.span`display:flex;align-items:center;gap:.15rem;`;
const PostTypeBadge = styled.span`
    padding:.1rem .35rem;border-radius:3px;font-size:.55rem;font-weight:700;text-transform:uppercase;letter-spacing:.3px;
    background:${p=>p.$bg||'rgba(0,173,237,.08)'};color:${p=>p.$c||'#0ea5e9'};
`;

const PostMenu = styled.div`position:relative;`;
const MenuButton = styled.button`background:none;border:none;color:#475569;cursor:pointer;padding:.25rem;border-radius:6px;&:hover{background:rgba(255,255,255,.05);color:#94a3b8;}`;
const MenuDropdown = styled.div`
    position:absolute;right:0;top:100%;z-index:50;min-width:160px;
    background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.1);border-radius:10px;
    padding:.35rem;box-shadow:0 8px 24px rgba(0,0,0,.4);
`;
const MenuItem = styled.button`
    width:100%;display:flex;align-items:center;gap:.5rem;padding:.5rem .65rem;
    border-radius:7px;border:none;background:none;font-size:.78rem;font-weight:500;
    color:${p=>p.$danger?'#ef4444':'#94a3b8'};cursor:pointer;text-align:left;
    &:hover{background:rgba(255,255,255,.04);color:${p=>p.$danger?'#ef4444':'#e0e6ed'};}
`;

// Post Content
const PostContent = styled.div`padding:.35rem 1.15rem .75rem;`;
const PostText = styled.div`font-size:.9rem;color:#c8d0da;line-height:1.65;word-break:break-word;`;
const Hashtag = styled.span`color:#00adef;font-weight:600;cursor:pointer;&:hover{text-decoration:underline;}`;
const Mention = styled.span`color:#a78bfa;font-weight:600;cursor:pointer;&:hover{text-decoration:underline;}`;
const TickerMention = styled.span`color:#10b981;font-weight:700;cursor:pointer;&:hover{text-decoration:underline;}`;

// Trade Attachment
const TradeAttachment = styled.div`
    margin-top:.65rem;border-radius:10px;overflow:hidden;
    background:${p=>p.$profitable?'rgba(16,185,129,.04)':'rgba(239,68,68,.04)'};
    border:1px solid ${p=>p.$profitable?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};
`;
const TradeHeader = styled.div`display:flex;align-items:center;justify-content:space-between;padding:.75rem .85rem;`;
const TradeSymbol = styled.div`display:flex;align-items:center;gap:.5rem;`;
const SymbolIcon = styled.div`width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(0,173,237,.1);color:#00adef;font-size:.7rem;font-weight:800;`;
const SymbolInfo = styled.div``;
const SymbolName = styled.div`font-size:.88rem;font-weight:700;color:#e0e6ed;display:flex;align-items:center;gap:.35rem;`;
const TradeDirection = styled.span`padding:.1rem .35rem;border-radius:3px;font-size:.55rem;font-weight:700;background:${p=>p.$type==='LONG'?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};color:${p=>p.$type==='LONG'?'#10b981':'#ef4444'};`;
const SymbolCompany = styled.div`font-size:.68rem;color:#475569;`;
const TradePnL = styled.div`text-align:right;`;
const PnLValue = styled.div`font-size:1rem;font-weight:800;color:${p=>p.$positive?'#10b981':'#ef4444'};`;
const PnLPercent = styled.div`font-size:.72rem;font-weight:600;color:${p=>p.$positive?'#10b981':'#ef4444'};`;
const TradeDetails = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:.35rem;padding:0 .85rem .65rem;`;
const TradeDetail = styled.div`text-align:center;`;
const DetailLabel = styled.div`font-size:.55rem;color:#475569;text-transform:uppercase;letter-spacing:.3px;`;
const DetailValue = styled.div`font-size:.78rem;font-weight:700;color:#c8d0da;`;
const CopyTradeButton = styled.button`
    width:100%;padding:.5rem;border:none;border-top:1px solid rgba(255,255,255,.04);
    background:rgba(0,173,237,.04);color:#0ea5e9;font-size:.75rem;font-weight:600;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.3rem;
    transition:all .2s;&:hover{background:rgba(0,173,237,.1);}
`;

// Poll
const PollContainer = styled.div`margin-top:.65rem;`;
const PollQuestion = styled.div`font-size:.88rem;font-weight:700;color:#e0e6ed;margin-bottom:.5rem;`;
const PollOption = styled.button`
    width:100%;position:relative;padding:.6rem .75rem;margin-bottom:.35rem;
    border-radius:8px;border:1px solid ${p=>p.$selected?'rgba(0,173,237,.3)':'rgba(255,255,255,.06)'};
    background:rgba(255,255,255,.02);cursor:${p=>p.$voted?'default':'pointer'};
    text-align:left;transition:all .2s;overflow:hidden;
    ${p=>!p.$voted&&'&:hover{border-color:rgba(0,173,237,.2);background:rgba(0,173,237,.04);}'}
`;
const PollProgressBar = styled.div`position:absolute;left:0;top:0;height:100%;width:${p=>p.$percent}%;background:rgba(0,173,237,.08);border-radius:8px;transition:width .5s;`;
const PollOptionContent = styled.div`position:relative;display:flex;align-items:center;justify-content:space-between;`;
const PollOptionText = styled.span`font-size:.82rem;color:#e0e6ed;font-weight:500;`;
const PollOptionPercent = styled.span`font-size:.78rem;font-weight:700;color:#00adef;`;
const PollStats = styled.div`display:flex;gap:.5rem;font-size:.7rem;color:#475569;margin-top:.25rem;`;
const ImageGrid = styled.div`display:grid;grid-template-columns:${p=>p.$count===1?'1fr':'repeat(2,1fr)'};gap:.35rem;margin-top:.65rem;border-radius:10px;overflow:hidden;`;
const PostImage = styled.img`width:100%;${p=>p.$single?'max-height:400px;':'height:200px;'}object-fit:cover;border-radius:6px;`;

// Post Stats & Actions
const PostStats = styled.div`display:flex;align-items:center;justify-content:space-between;padding:.35rem 1.15rem;font-size:.72rem;color:#475569;`;
const StatsLeft = styled.div`display:flex;align-items:center;gap:.35rem;`;
const StatsRight = styled.div`display:flex;gap:.75rem;`;
const StatItem = styled.span`cursor:pointer;&:hover{text-decoration:underline;color:#94a3b8;}`;
const ReactionsList = styled.div`display:flex;`;
const ReactionBubble = styled.span`width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;margin-left:-4px;&:first-child{margin-left:0;}`;
const ReactionCount = styled.span`margin-left:.35rem;`;

const PostActions = styled.div`
    display:flex;align-items:center;gap:.25rem;padding:.35rem .75rem;
    border-top:1px solid rgba(255,255,255,.04);
`;
const ActionButton = styled.button`
    flex:1;display:flex;align-items:center;justify-content:center;gap:.35rem;
    padding:.5rem;border-radius:8px;border:none;background:none;
    font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s;position:relative;
    color:${p=>p.$active?p.$activeColor||'#0ea5e9':'#64748b'};
    &:hover{background:${p=>p.$hoverBg||'rgba(255,255,255,.04)'};color:${p=>p.$hoverColor||'#94a3b8'};}
`;
const ReactionsPopup = styled.div`
    position:absolute;bottom:100%;left:50%;transform:translateX(-50%);
    display:flex;gap:.15rem;padding:.35rem .5rem;
    background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.1);
    border-radius:25px;box-shadow:0 8px 24px rgba(0,0,0,.5);
    animation:${bounceIn} .2s ease-out;z-index:100;
`;
const ReactionButton = styled.button`
    width:32px;height:32px;border-radius:50%;border:none;background:none;
    font-size:1.2rem;cursor:pointer;transition:all .15s;
    ${p=>p.$active&&'background:rgba(255,255,255,.08);'}
    &:hover{transform:scale(1.3);background:rgba(255,255,255,.06);}
`;

// Comments
const CommentsSection = styled.div`border-top:1px solid rgba(255,255,255,.04);padding:.85rem 1.15rem;background:rgba(15,23,42,.2);`;
const CommentsList = styled.div`max-height:300px;overflow-y:auto;margin-bottom:.75rem;`;
const Comment = styled.div`display:flex;gap:.6rem;margin-bottom:.75rem;&:last-child{margin-bottom:0;}`;
const CommentContent = styled.div`flex:1;`;
const CommentBubble = styled.div`background:rgba(30,41,59,.6);border-radius:12px;padding:.55rem .75rem;`;
const CommentAuthor = styled.span`font-weight:700;color:#e0e6ed;margin-right:.4rem;cursor:pointer;font-size:.82rem;&:hover{color:#00adef;}`;
const CommentText = styled.span`color:#c8d0da;font-size:.82rem;`;
const CommentMeta = styled.div`display:flex;gap:.75rem;margin-top:.15rem;padding-left:.35rem;color:#475569;font-size:.68rem;`;
const CommentAction = styled.button`background:none;border:none;color:#475569;font-size:.68rem;font-weight:600;cursor:pointer;&:hover{color:#00adef;}`;
const CommentInput = styled.div`display:flex;gap:.6rem;align-items:center;`;
const CommentTextarea = styled.input`
    flex:1;padding:.55rem .85rem;background:rgba(15,23,42,.5);
    border:1px solid rgba(255,255,255,.06);border-radius:25px;
    color:#e0e6ed;font-size:.85rem;outline:none;
    &:focus{border-color:rgba(0,173,237,.3);}
    &::placeholder{color:#475569;}
`;
const SendBtn = styled.button`
    width:34px;height:34px;border-radius:50%;border:none;
    background:linear-gradient(135deg,#00adef,#0090d0);color:#fff;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all .2s;&:hover{transform:scale(1.05);}&:disabled{opacity:.4;cursor:not-allowed;}
`;

// ─── Right Sidebar ───────────────────────────────────────
const RightSidebar = styled.div`display:flex;flex-direction:column;gap:1rem;position:sticky;top:5.5rem;height:fit-content;@media(max-width:900px){display:none;}`;

const TrendingSignalCard = styled.div`
    display:flex;align-items:center;justify-content:space-between;
    padding:.5rem .6rem;border-radius:8px;cursor:pointer;
    transition:all .15s;&:hover{background:rgba(255,255,255,.03);}
`;
const TSLeft = styled.div`display:flex;align-items:center;gap:.4rem;`;
const TSSymbol = styled.span`font-size:.82rem;font-weight:700;color:#e0e6ed;`;
const TSDir = styled.span`
    padding:.1rem .3rem;border-radius:3px;font-size:.5rem;font-weight:700;
    background:${p=>p.$long?'rgba(16,185,129,.1)':'rgba(239,68,68,.1)'};
    color:${p=>p.$long?'#10b981':'#ef4444'};
`;
const TSRight = styled.div`text-align:right;`;
const TSConf = styled.div`font-size:.72rem;font-weight:700;color:#10b981;`;
const TSMentions = styled.div`font-size:.58rem;color:#475569;`;

const SentimentBar = styled.div`margin-bottom:.6rem;`;
const SentimentLabel = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:.25rem;`;
const SentimentSymbol = styled.span`font-size:.78rem;font-weight:700;color:#e0e6ed;`;
const SentimentPct = styled.span`font-size:.68rem;font-weight:600;color:${p=>p.$c||'#10b981'};`;
const SentimentTrack = styled.div`height:4px;border-radius:2px;background:rgba(239,68,68,.15);overflow:hidden;`;
const SentimentFill = styled.div`height:100%;border-radius:2px;width:${p=>p.$w}%;background:linear-gradient(90deg,#10b981,#059669);`;

const TopTraderRow = styled.div`
    display:flex;align-items:center;gap:.5rem;padding:.45rem .5rem;
    border-radius:8px;cursor:pointer;transition:all .15s;
    &:hover{background:rgba(255,255,255,.03);}
`;
const TraderRank = styled.span`font-size:.65rem;font-weight:800;width:18px;text-align:center;color:${p=>p.$rank===1?'#fbbf24':p.$rank===2?'#C0C0C0':'#CD7F32'};`;
const TraderName = styled.span`font-size:.78rem;font-weight:600;color:#e0e6ed;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`;
const TraderReturn = styled.span`font-size:.72rem;font-weight:700;color:#10b981;`;
const FollowSmall = styled.button`
    padding:.2rem .45rem;border-radius:5px;font-size:.6rem;font-weight:700;
    background:rgba(0,173,237,.08);border:1px solid rgba(0,173,237,.15);
    color:#00adef;cursor:pointer;transition:all .15s;
    &:hover{background:rgba(0,173,237,.15);}
`;

// Loading / Empty
const LoadingBox = styled.div`text-align:center;padding:3rem;color:#475569;`;
const Spinner = styled.div`width:32px;height:32px;border:3px solid rgba(0,173,237,.15);border-top-color:#00adef;border-radius:50%;animation:${spin} .8s linear infinite;margin:0 auto .75rem;`;
const EmptyState = styled.div`text-align:center;padding:3rem 1.5rem;`;
const EmptyIcon = styled.div`margin-bottom:.75rem;`;
const EmptyTitle = styled.div`font-size:1rem;font-weight:700;color:#e0e6ed;margin-bottom:.35rem;`;
const EmptyText = styled.div`font-size:.82rem;color:#64748b;margin-bottom:1rem;`;
const EmptyBtn = styled.button`
    padding:.55rem 1.2rem;border-radius:10px;border:none;
    background:linear-gradient(135deg,#00adef,#0090d0);color:#fff;
    font-weight:700;font-size:.85rem;cursor:pointer;
    display:inline-flex;align-items:center;gap:.35rem;
    &:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,173,237,.3);}
`;
const EndMsg = styled.div`text-align:center;padding:1.5rem;font-size:.78rem;color:#475569;display:flex;align-items:center;justify-content:center;gap:.35rem;`;

// ─── Create Post Modal ───────────────────────────────────
const ModalOverlay = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;`;
const Modal = styled.div`background:rgba(15,23,42,.98);border:1px solid rgba(255,255,255,.1);border-radius:18px;width:90%;max-width:540px;max-height:90vh;overflow-y:auto;`;
const ModalHeader = styled.div`display:flex;align-items:center;justify-content:space-between;padding:1.15rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.06);`;
const ModalTitle = styled.h2`font-size:1rem;font-weight:700;color:#e0e6ed;margin:0;`;
const CloseBtn = styled.button`background:none;border:none;color:#64748b;cursor:pointer;&:hover{color:#e0e6ed;}`;
const ModalBody = styled.div`padding:1.25rem;`;
const PostTypeSelector = styled.div`display:flex;gap:.35rem;margin-bottom:.85rem;flex-wrap:wrap;`;
const PostTypeChip = styled.button`
    display:flex;align-items:center;gap:.3rem;padding:.4rem .7rem;
    border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;
    background:${p=>p.$active?'rgba(0,173,237,.12)':'rgba(255,255,255,.03)'};
    border:1px solid ${p=>p.$active?'rgba(0,173,237,.3)':'rgba(255,255,255,.06)'};
    color:${p=>p.$active?'#00adef':'#64748b'};transition:all .2s;
    &:hover{border-color:rgba(0,173,237,.2);}
`;
const TextArea = styled.textarea`
    width:100%;min-height:120px;padding:.85rem;background:rgba(255,255,255,.02);
    border:1px solid rgba(255,255,255,.06);border-radius:10px;
    color:#e0e6ed;font-size:.9rem;line-height:1.6;resize:vertical;outline:none;
    &:focus{border-color:rgba(0,173,237,.25);}
    &::placeholder{color:#475569;}
`;
const CharCount = styled.div`text-align:right;font-size:.65rem;color:${p=>p.$over?'#ef4444':'#475569'};margin-top:.25rem;`;
const AttachmentPreview = styled.div`margin-top:.85rem;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:10px;overflow:hidden;`;
const AttachmentHeader = styled.div`display:flex;align-items:center;justify-content:space-between;padding:.65rem .85rem;border-bottom:1px solid rgba(255,255,255,.04);`;
const AttachmentTitle = styled.div`display:flex;align-items:center;gap:.35rem;font-size:.82rem;font-weight:600;color:#e0e6ed;`;
const RemoveAttachment = styled.button`background:none;border:none;color:#64748b;cursor:pointer;&:hover{color:#ef4444;}`;
const TradeForm = styled.div`padding:.85rem;`;
const FormRow = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.6rem;`;
const FormGroup = styled.div``;
const FormLabel = styled.label`display:block;font-size:.65rem;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.25rem;font-weight:600;`;
const FormInput = styled.input`
    width:100%;padding:.55rem .7rem;background:rgba(15,23,42,.5);
    border:1px solid rgba(255,255,255,.06);border-radius:8px;
    color:#e0e6ed;font-size:.85rem;outline:none;
    &:focus{border-color:rgba(0,173,237,.3);}&::placeholder{color:#475569;}
`;
const FormSelect = styled.select`
    width:100%;padding:.55rem .7rem;background:rgba(15,23,42,.5);
    border:1px solid rgba(255,255,255,.06);border-radius:8px;
    color:#e0e6ed;font-size:.85rem;outline:none;cursor:pointer;
    option{background:#1e293b;}
`;
const PollForm = styled.div`padding:.85rem;`;
const PollOptionInput = styled.div`display:flex;gap:.4rem;margin-bottom:.5rem;`;
const OptionInput = styled.input`
    flex:1;padding:.55rem .7rem;background:rgba(15,23,42,.5);
    border:1px solid rgba(255,255,255,.06);border-radius:8px;
    color:#e0e6ed;font-size:.85rem;outline:none;
    &:focus{border-color:rgba(0,173,237,.3);}&::placeholder{color:#475569;}
`;
const RemoveOptionBtn = styled.button`width:36px;height:36px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);border-radius:8px;color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;&:hover{background:rgba(239,68,68,.15);}`;
const AddOptionBtn = styled.button`
    width:100%;padding:.55rem;background:none;border:1px dashed rgba(0,173,237,.25);
    border-radius:8px;color:#00adef;font-weight:600;font-size:.78rem;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.35rem;
    &:hover{background:rgba(0,173,237,.06);}
`;
const ModalFooter = styled.div`display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.25rem;border-top:1px solid rgba(255,255,255,.06);`;
const FooterActions = styled.div`display:flex;gap:.35rem;`;
const FooterBtn = styled.button`
    width:36px;height:36px;background:none;border:1px solid rgba(255,255,255,.06);
    border-radius:8px;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;
    &:hover{border-color:rgba(0,173,237,.2);color:#00adef;}
`;
const PostButton = styled.button`
    padding:.6rem 1.5rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;border-radius:10px;color:#fff;font-weight:700;font-size:.88rem;
    cursor:pointer;display:flex;align-items:center;gap:.35rem;
    &:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,173,237,.3);}
    &:disabled{opacity:.4;cursor:not-allowed;}
`;

// ═══════════════════════════════════════════════════════════
// HELPER: Author Badges
// ═══════════════════════════════════════════════════════════
const AuthorBadges = ({ badges, maxDisplay = 3 }) => {
    if (!badges || badges.length === 0) return null;
    const display = badges.slice(0, maxDisplay);
    const remaining = badges.length - maxDisplay;
    return (
        <BadgesContainer>
            {display.map(id => (<MiniBadge key={id} title={id.replace('badge-','').replace(/-/g,' ')}><BadgeIcon badgeId={id} size={20} showParticles={false}/></MiniBadge>))}
            {remaining > 0 && <MoreBadgesIndicator>+{remaining}</MoreBadgesIndicator>}
        </BadgesContainer>
    );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const SocialFeed = () => {
    const { api, isAuthenticated, user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const theme = useStyledTheme();
    const { profileThemeId, getAvatarBorderForUser } = useThemeContext();
    const { equipped } = useVault();

    // ─── State ───────────────────────────────────────────
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPostsCount, setNewPostsCount] = useState(0);
    const [expandedComments, setExpandedComments] = useState({});
    const [activeReactionPicker, setActiveReactionPicker] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    const [postType, setPostType] = useState('text');
    const [postText, setPostText] = useState('');
    const [tradeData, setTradeData] = useState({ symbol: '', direction: 'LONG', entryPrice: '', exitPrice: '', quantity: '', pnl: '' });
    const [pollData, setPollData] = useState({ question: '', options: ['', ''] });
    const [commentInputs, setCommentInputs] = useState({});

    const [trendingTags, setTrendingTags] = useState([]);
    const [topTraders, setTopTraders] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [featuredSignal, setFeaturedSignal] = useState(null);
    const [activeSignals, setActiveSignals] = useState([]);

    const observerTarget = useRef(null);

    // ─── Helpers ─────────────────────────────────────────
    const currentUserBorderId = useMemo(() => {
        return user?.vault?.equippedBorder || equipped?.border?.id || equipped?.border || 'border-bronze';
    }, [user?.vault?.equippedBorder, equipped?.border]);

    const getAvatarBorderColor = useCallback((borderId) => {
        if (!borderId) return BORDER_COLORS['default'];
        if (BORDER_COLORS[borderId]) return BORDER_COLORS[borderId];
        const normalized = borderId.startsWith('border-') ? borderId : `border-${borderId}`;
        return BORDER_COLORS[normalized] || BORDER_COLORS['default'];
    }, []);

    const formatTimeAgo = useCallback((date) => {
        const m = Math.floor((Date.now() - new Date(date)) / 60000);
        if (m < 1) return 'Just now';
        if (m < 60) return `${m}m`;
        if (m < 1440) return `${Math.floor(m / 60)}h`;
        if (m < 10080) return `${Math.floor(m / 1440)}d`;
        return new Date(date).toLocaleDateString();
    }, []);

    const renderPostContent = useCallback((content) => {
        if (!content) return null;
        return content.split(/(\$[A-Z]+|\#\w+|\@\w+)/g).map((part, i) => {
            if (part.startsWith('$')) return <TickerMention key={i} onClick={() => navigate(`/stock/${part.slice(1)}`)}>{part}</TickerMention>;
            if (part.startsWith('#')) return <Hashtag key={i}>{part}</Hashtag>;
            if (part.startsWith('@')) return <Mention key={i} onClick={() => navigate(`/profile/${part.slice(1)}`)}>{part}</Mention>;
            return part;
        });
    }, [navigate]);

    const getPostTypeLabel = (post) => {
        if (post.type === 'trade') return { label: 'Trade Result', bg: 'rgba(16,185,129,.08)', c: '#10b981' };
        if (post.type === 'prediction') return { label: 'Signal Reaction', bg: 'rgba(0,173,237,.08)', c: '#0ea5e9' };
        if (post.type === 'poll') return { label: 'Market Poll', bg: 'rgba(139,92,246,.08)', c: '#a78bfa' };
        // Detect insight-like posts
        if (post.tickers?.length > 0 || post.content?.match(/\$[A-Z]/)) return { label: 'Insight', bg: 'rgba(245,158,11,.08)', c: '#f59e0b' };
        return null;
    };

    // ─── API Functions (preserved) ───────────────────────
    const fetchFeed = useCallback(async (filterType = filter, pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            let endpoint = '/feed';
            let extraParams = '';

            if (filterType === 'trending' || filterType === 'all' || filterType === 'reactions' || filterType === 'ideas' || filterType === 'insights' || filterType === 'results') {
                endpoint = '/feed/discover';
                // "All Activity" should show ALL public posts without a time
                // cutoff. Other discover-type filters (trending, reactions,
                // ideas, etc.) keep the default 24h window.
                const timeframe = filterType === 'all' ? 'all' : '24h';
                extraParams = `&timeframe=${timeframe}&filter=${filterType}`;
            }

            const response = await api.get(`${endpoint}?limit=20&skip=${(pageNum - 1) * 20}${extraParams}`);
            const newPosts = response.data.posts || [];
            if (append) { setPosts(prev => [...prev, ...newPosts]); } else { setPosts(newPosts); }
            setHasMore(newPosts.length === 20);
        } catch (error) {
            console.error('Error fetching feed:', error);
            if (!append) setPosts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api, filter]);

    const fetchSidebarData = useCallback(async () => {
        try {
            const tagsRes = await api.get('/feed/trending/hashtags?limit=5');
            if (tagsRes.data.hashtags) {
                setTrendingTags(tagsRes.data.hashtags.map(h => ({ tag: h.tag, count: h.count > 1000 ? `${(h.count/1000).toFixed(1)}K` : h.count })));
            }
            const tradersRes = await api.get('/social/leaderboard?sortBy=totalReturnPercent&limit=5');
            if (tradersRes.data) {
                setTopTraders(tradersRes.data.slice(0, 5).map(t => ({
                    id: t.userId, name: t.displayName, username: t.username, avatar: t.avatar,
                    return: `+${t.totalReturn?.toFixed(0) || 0}%`, equippedBorder: t.equippedBorder || null
                })));
            }
        } catch (error) { console.error('[Social] Sidebar error:', error); }
    }, [api]);

    // Fetch active signals for sidebar + featured
    const fetchSignals = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/predictions/recent?limit=10`);
            if (res.ok) {
                const data = await res.json();
                const sigs = Array.isArray(data) ? data : [];
                setActiveSignals(sigs.filter(s => !s.result && s.confidence >= 55).slice(0, 6));
                // Featured: highest confidence active
                const best = sigs.filter(s => !s.result && s.confidence >= 60).sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
                if (best) setFeaturedSignal(best);
            }
        } catch (e) { /* silent */ }
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        setNewPostsCount(0);
        fetchFeed(filter, 1, false);
    }, [filter, fetchFeed]);

    const handleReaction = async (postId, reactionType) => {
        try {
            const response = await api.post(`/feed/${postId}/react`, { type: reactionType });
            setPosts(posts.map(post => post._id === postId ? { ...post, reactions: response.data.reactions, userReaction: response.data.userReaction } : post));
            setActiveReactionPicker(null);
        } catch (error) { handleLike(postId); }
    };

    const handleLike = async (postId) => {
        try {
            const post = posts.find(p => p._id === postId);
            const isLiked = post?.likes?.includes(user?._id);
            if (isLiked) { await api.delete(`/feed/${postId}/like`); } else { await api.post(`/feed/${postId}/like`); }
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const newLikes = isLiked ? p.likes.filter(id => id !== user._id) : [...(p.likes || []), user._id];
                    return { ...p, likes: newLikes, likesCount: newLikes.length };
                }
                return p;
            }));
        } catch (error) { console.error('Error liking:', error); }
    };

    const handleComment = async (postId) => {
        const text = commentInputs[postId];
        if (!text?.trim()) return;
        try {
            const response = await api.post(`/feed/${postId}/comment`, { text });
            setPosts(posts.map(post => post._id === postId ? { ...post, comments: [...(post.comments || []), response.data.comment], commentsCount: (post.commentsCount || 0) + 1 } : post));
            setCommentInputs(prev => ({ ...prev, [postId]: '' }));
            toast.success('Comment posted!');
        } catch (error) { toast.error('Failed to post comment'); }
    };

    const handleShare = async (postId) => {
        try {
            await api.post(`/feed/${postId}/share`);
            setPosts(posts.map(post => post._id === postId ? { ...post, sharesCount: (post.sharesCount || 0) + 1 } : post));
            toast.success('Post shared!');
        } catch (error) {
            navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
            toast.success('Link copied!');
        }
    };

    const handleBookmark = async (postId) => {
        try {
            const post = posts.find(p => p._id === postId);
            const isBookmarked = post?.bookmarkedBy?.includes(user?._id);
            if (isBookmarked) { await api.delete(`/feed/${postId}/bookmark`); } else { await api.post(`/feed/${postId}/bookmark`); }
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const nb = isBookmarked ? (p.bookmarkedBy || []).filter(id => id !== user._id) : [...(p.bookmarkedBy || []), user._id];
                    return { ...p, bookmarkedBy: nb };
                }
                return p;
            }));
            toast.success(isBookmarked ? 'Removed from saved' : 'Saved!');
        } catch (error) { console.error('Error bookmarking:', error); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Delete this post?')) return;
        try { await api.delete(`/feed/${postId}`); setPosts(posts.filter(p => p._id !== postId)); toast.success('Post deleted'); }
        catch (error) { toast.error('Failed to delete post'); }
    };

    const handleCreatePost = async () => {
        if (!postText.trim() && postType === 'text') { toast.error('Write something first!'); return; }
        try {
            const payload = { content: postText, type: postType };
            if (postType === 'trade') payload.trade = tradeData;
            else if (postType === 'poll') payload.poll = pollData;
            const response = await api.post('/feed', payload);
            setPosts([response.data.post, ...posts]);
            setShowCreateModal(false);
            setPostText('');
            setPostType('text');
            setTradeData({ symbol: '', direction: 'LONG', entryPrice: '', exitPrice: '', quantity: '', pnl: '' });
            setPollData({ question: '', options: ['', ''] });
            toast.success('Posted!');
        } catch (error) { toast.error('Failed to create post'); }
    };

    const handlePollVote = async (postId, optionIndex) => {
        try {
            const response = await api.post(`/feed/${postId}/vote`, { optionIndex });
            setPosts(posts.map(post => post._id === postId ? { ...post, poll: response.data.poll, userVote: optionIndex } : post));
        } catch (error) { console.error('Error voting:', error); }
    };

    const toggleComments = (postId) => setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));

    // ─── Effects ─────────────────────────────────────────
    useEffect(() => {
        if (isAuthenticated) { fetchFeed(filter, 1, false); fetchSidebarData(); fetchSignals(); }
    }, [filter, isAuthenticated, fetchFeed, fetchSidebarData, fetchSignals]);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prev => prev + 1);
                fetchFeed(filter, page + 1, true);
            }
        }, { threshold: 0.1 });
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [hasMore, loading, page, filter, fetchFeed]);

    useEffect(() => {
        const handleClick = () => { setActiveMenu(null); setActiveReactionPicker(null); };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Compute sentiment from active signals
    const sentimentData = useMemo(() => {
        if (!activeSignals.length) return [];
        return activeSignals.slice(0, 3).map(s => {
            const sym = s.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || s.symbol;
            const isLong = s.direction === 'UP';
            const bullPct = isLong ? Math.min(85, 50 + (s.confidence - 50) * 0.7) : Math.max(15, 50 - (s.confidence - 50) * 0.7);
            return { symbol: sym, long: isLong, bullPct: Math.round(bullPct), bearPct: Math.round(100 - bullPct) };
        });
    }, [activeSignals]);

    // ─── Render ──────────────────────────────────────────
    return (
        <PageContainer>
            <MainContent>
                {/* ═══ LEFT SIDEBAR ═══ */}
                <LeftSidebar>
                    <SideCard>
                        <SideCardTitle><Zap size={13}/> Navigation</SideCardTitle>
                        <NavItem $active={filter === 'all'} onClick={() => setFilter('all')}><Radio size={15}/> All Activity</NavItem>
                        <NavItem $active={filter === 'reactions'} onClick={() => setFilter('reactions')}><Target size={15}/> Signal Reactions</NavItem>
                        <NavItem $active={filter === 'ideas'} onClick={() => setFilter('ideas')}><TrendingUp size={15}/> Trade Ideas</NavItem>
                        <NavItem $active={filter === 'results'} onClick={() => setFilter('results')}><CheckCircle size={15}/> Results</NavItem>
                        <NavItem $active={filter === 'following'} onClick={() => setFilter('following')}><Users size={15}/> Following</NavItem>
                        <NavItem onClick={() => navigate('/signals')}><Activity size={15}/> Live Signals</NavItem>
                        <NavItem onClick={() => navigate('/leaderboard')}><Trophy size={15}/> Leaderboard</NavItem>
                    </SideCard>

                    {trendingTags.length > 0 && (
                        <SideCard>
                            <SideCardTitle><Flame size={13}/> Trending Topics</SideCardTitle>
                            {trendingTags.map((t, i) => (
                                <TrendTag key={i}>
                                    <TrendSymbol><Hash size={12}/> {t.tag}</TrendSymbol>
                                    <TrendCount>{t.count}</TrendCount>
                                </TrendTag>
                            ))}
                        </SideCard>
                    )}
                </LeftSidebar>

                {/* ═══ CENTER FEED ═══ */}
                <FeedCol>
                    {/* Header */}
                    <PageHeader>
                        <PageTitle><Activity size={20} color="#00adef"/> Market Activity & Insights</PageTitle>
                        <PageSub>Real-time reactions, trade ideas, and signal confirmations from the Nexus community.</PageSub>
                    </PageHeader>

                    {/* Filters */}
                    <FilterRow>
                        {[
                            { key: 'all', label: 'All Activity', icon: <Radio size={12}/> },
                            { key: 'reactions', label: 'Signal Reactions', icon: <Target size={12}/> },
                            { key: 'ideas', label: 'Trade Ideas', icon: <TrendingUp size={12}/> },
                            { key: 'insights', label: 'Insights', icon: <Eye size={12}/> },
                            { key: 'results', label: 'Results', icon: <CheckCircle size={12}/> },
                            { key: 'following', label: 'Following', icon: <Users size={12}/> },
                        ].map(f => (
                            <FilterTab key={f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>
                                {f.icon} {f.label}
                            </FilterTab>
                        ))}
                        <RefreshBtn className={refreshing ? 'spinning' : ''} onClick={handleRefresh}>
                            <RefreshCw size={12}/> Refresh
                        </RefreshBtn>
                    </FilterRow>

                    {/* Most Discussed Signal */}
                    {featuredSignal && (
                        <FeaturedSignal onClick={() => navigate(`/signal/${featuredSignal._id}`)}>
                            <FSLabel><Flame size={12}/> Most Active Signal Right Now</FSLabel>
                            <FSRow>
                                <FSLeft>
                                    <FSSymbol>{featuredSignal.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || featuredSignal.symbol}</FSSymbol>
                                    <FSDir $long={featuredSignal.direction === 'UP'}>{featuredSignal.direction === 'UP' ? 'LONG' : 'SHORT'}</FSDir>
                                    <FSConf $c={featuredSignal.confidence >= 70 ? '#10b981' : '#f59e0b'}>{Math.min(95, Math.round(featuredSignal.confidence))}%</FSConf>
                                </FSLeft>
                                <FSRight>
                                    <FSMeta>{featuredSignal.assetType === 'crypto' ? 'Crypto' : 'Stock'} Signal</FSMeta>
                                    <FSCta>View Signal <ChevronRight size={13}/></FSCta>
                                </FSRight>
                            </FSRow>
                        </FeaturedSignal>
                    )}

                    {/* Composer */}
                    <ComposerBox>
                        <ComposerTop>
                            <AvatarWithBorder src={user?.profile?.avatar} name={user?.name} size={42} borderId={currentUserBorderId}/>
                            <ComposerInput onClick={() => setShowCreateModal(true)}>
                                Share a trade idea or react to a signal...
                            </ComposerInput>
                        </ComposerTop>
                        <QuickActions>
                            <QuickBtn $c="#0ea5e9" $hc="rgba(0,173,237,.06)" onClick={() => { setPostType('text'); setShowCreateModal(true); }}>
                                <Target size={13}/> React to Signal
                            </QuickBtn>
                            <QuickBtn $c="#10b981" $hc="rgba(16,185,129,.06)" onClick={() => { setPostType('trade'); setShowCreateModal(true); }}>
                                <TrendingUp size={13}/> Post Trade Idea
                            </QuickBtn>
                            <QuickBtn $c="#f59e0b" $hc="rgba(245,158,11,.06)" onClick={() => { setPostType('trade'); setShowCreateModal(true); }}>
                                <Award size={13}/> Share Result
                            </QuickBtn>
                            <QuickBtn $c="#a78bfa" $hc="rgba(139,92,246,.06)" onClick={() => { setPostType('poll'); setShowCreateModal(true); }}>
                                <BarChart2 size={13}/> Add Insight
                            </QuickBtn>
                        </QuickActions>
                    </ComposerBox>

                    {/* Posts */}
                    {loading && posts.length === 0 ? (
                        <LoadingBox><Spinner/><div>Scanning the community for active market conversations...</div></LoadingBox>
                    ) : posts.length === 0 ? (
                        <EmptyState>
                            <EmptyIcon><Activity size={48} color="#00adef"/></EmptyIcon>
                            <EmptyTitle>{filter === 'following' ? 'No posts from traders you follow' : 'No market activity yet'}</EmptyTitle>
                            <EmptyText>{filter === 'following' ? 'Follow active traders to see their reactions and ideas.' : 'Be the first to share a trade idea or react to a signal.'}</EmptyText>
                            <EmptyBtn onClick={() => setShowCreateModal(true)}><Plus size={16}/> Share a Trade Idea</EmptyBtn>
                        </EmptyState>
                    ) : (
                        posts.map(post => {
                            const typeLabel = getPostTypeLabel(post);
                            return (
                                <PostCard key={post._id} $isPinned={post.isPinned}>
                                    <PostHeader>
                                        <PostAuthor>
                                            <AvatarWithBorder src={post.author?.avatar} name={post.author?.displayName} username={post.author?.username} size={42} borderId={post.author?.equippedBorder || 'border-bronze'} onClick={() => navigate(`/profile/${post.author?.username}`)}/>
                                            <AuthorInfo>
                                                <AuthorName onClick={() => navigate(`/profile/${post.author?.username}`)}>
                                                    {post.author?.displayName || 'Anonymous'}
                                                    {post.author?.verified && <VerifiedBadge><Check size={10}/></VerifiedBadge>}
                                                    {post.author?.level && <LevelBadge>Lv {post.author.level}</LevelBadge>}
                                                    <AuthorBadges badges={post.author?.equippedBadges} maxDisplay={3}/>
                                                </AuthorName>
                                                <AuthorMeta>
                                                    <Username onClick={() => navigate(`/profile/${post.author?.username}`)}>@{post.author?.username}</Username>
                                                    <span>·</span>
                                                    <PostTime><Clock size={10}/> {formatTimeAgo(post.createdAt)}</PostTime>
                                                    {typeLabel && <PostTypeBadge $bg={typeLabel.bg} $c={typeLabel.c}>{typeLabel.label}</PostTypeBadge>}
                                                </AuthorMeta>
                                            </AuthorInfo>
                                        </PostAuthor>
                                        <PostMenu onClick={e => e.stopPropagation()}>
                                            <MenuButton onClick={() => setActiveMenu(activeMenu === post._id ? null : post._id)}><MoreHorizontal size={18}/></MenuButton>
                                            {activeMenu === post._id && (
                                                <MenuDropdown>
                                                    <MenuItem onClick={() => { handleBookmark(post._id); setActiveMenu(null); }}>
                                                        {post.bookmarkedBy?.includes(user?._id) ? <><BookmarkCheck size={14}/> Saved</> : <><Bookmark size={14}/> Save Post</>}
                                                    </MenuItem>
                                                    <MenuItem onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`); toast.success('Link copied!'); setActiveMenu(null); }}>
                                                        <Link2 size={14}/> Copy Link
                                                    </MenuItem>
                                                    {post.author?._id === user?._id && <MenuItem $danger onClick={() => { handleDeletePost(post._id); setActiveMenu(null); }}><Trash2 size={14}/> Delete</MenuItem>}
                                                    {post.author?._id !== user?._id && <MenuItem onClick={() => setActiveMenu(null)}><Flag size={14}/> Report</MenuItem>}
                                                </MenuDropdown>
                                            )}
                                        </PostMenu>
                                    </PostHeader>

                                    <PostContent>
                                        <PostText>{renderPostContent(post.content)}</PostText>

                                        {post.type === 'trade' && post.trade && (
                                            <TradeAttachment $profitable={parseFloat(post.trade.pnl) >= 0}>
                                                <TradeHeader>
                                                    <TradeSymbol>
                                                        <SymbolIcon>{post.trade.symbol?.slice(0, 2)}</SymbolIcon>
                                                        <SymbolInfo>
                                                            <SymbolName>${post.trade.symbol}<TradeDirection $type={post.trade.direction}>{post.trade.direction}</TradeDirection></SymbolName>
                                                            <SymbolCompany>Paper Trade</SymbolCompany>
                                                        </SymbolInfo>
                                                    </TradeSymbol>
                                                    <TradePnL>
                                                        <PnLValue $positive={parseFloat(post.trade.pnl) >= 0}>{parseFloat(post.trade.pnl) >= 0 ? '+' : ''}${Math.abs(parseFloat(post.trade.pnl)).toFixed(2)}</PnLValue>
                                                        <PnLPercent $positive={parseFloat(post.trade.pnlPercent) >= 0}>{parseFloat(post.trade.pnlPercent) >= 0 ? '+' : ''}{post.trade.pnlPercent}%</PnLPercent>
                                                    </TradePnL>
                                                </TradeHeader>
                                                <TradeDetails>
                                                    <TradeDetail><DetailLabel>Entry</DetailLabel><DetailValue>${post.trade.entryPrice}</DetailValue></TradeDetail>
                                                    <TradeDetail><DetailLabel>Exit</DetailLabel><DetailValue>${post.trade.exitPrice}</DetailValue></TradeDetail>
                                                    <TradeDetail><DetailLabel>Shares</DetailLabel><DetailValue>{post.trade.quantity}</DetailValue></TradeDetail>
                                                    <TradeDetail><DetailLabel>Duration</DetailLabel><DetailValue>{post.trade.duration || 'N/A'}</DetailValue></TradeDetail>
                                                </TradeDetails>
                                                <CopyTradeButton><Copy size={14}/> Copy Trade Setup</CopyTradeButton>
                                            </TradeAttachment>
                                        )}

                                        {post.type === 'poll' && post.poll && (
                                            <PollContainer>
                                                <PollQuestion>{post.poll.question}</PollQuestion>
                                                {post.poll.options.map((option, index) => {
                                                    const totalVotes = post.poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
                                                    const percent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                                                    const hasVoted = post.userVote !== undefined;
                                                    return (
                                                        <PollOption key={index} $selected={post.userVote === index} $voted={hasVoted} onClick={() => !hasVoted && handlePollVote(post._id, index)}>
                                                            {hasVoted && <PollProgressBar $percent={percent}/>}
                                                            <PollOptionContent><PollOptionText>{option.text}</PollOptionText>{hasVoted && <PollOptionPercent>{percent}%</PollOptionPercent>}</PollOptionContent>
                                                        </PollOption>
                                                    );
                                                })}
                                                <PollStats><span>{post.poll.totalVotes || 0} votes</span><span>·</span><span>{post.poll.endsIn || '24h left'}</span></PollStats>
                                            </PollContainer>
                                        )}

                                        {post.images?.length > 0 && (
                                            <ImageGrid $count={post.images.length}>
                                                {post.images.map((img, i) => <PostImage key={i} src={img} alt="" $single={post.images.length === 1}/>)}
                                            </ImageGrid>
                                        )}
                                    </PostContent>

                                    <PostStats>
                                        <StatsLeft>
                                            <ReactionsList>{REACTIONS.slice(0, 3).map((r, i) => <ReactionBubble key={i}>{r.emoji}</ReactionBubble>)}</ReactionsList>
                                            <ReactionCount>{post.totalReactions || post.likesCount || post.likes?.length || 0} reactions</ReactionCount>
                                        </StatsLeft>
                                        <StatsRight>
                                            <StatItem onClick={() => toggleComments(post._id)}>{post.commentsCount || 0} comments</StatItem>
                                            <StatItem>{post.sharesCount || 0} shares</StatItem>
                                        </StatsRight>
                                    </PostStats>

                                    <PostActions>
                                        <ActionButton
                                            $active={post.userReaction || post.likes?.includes(user?._id)}
                                            $activeColor={post.userReaction ? (REACTIONS.find(r => r.name === post.userReaction)?.color || '#0ea5e9') : '#0ea5e9'}
                                            onMouseEnter={() => setActiveReactionPicker(post._id)}
                                            onMouseLeave={() => setTimeout(() => setActiveReactionPicker(null), 500)}
                                            onClick={() => handleReaction(post._id, 'bull')}
                                        >
                                            {post.userReaction ? (
                                                <span style={{fontSize:'18px'}}>{REACTIONS.find(r => r.name === post.userReaction)?.emoji || '🐂'}</span>
                                            ) : '🐂'}
                                            {post.userReaction ? REACTIONS.find(r => r.name === post.userReaction)?.label || 'Bullish' : 'Bullish'}
                                            {activeReactionPicker === post._id && (
                                                <ReactionsPopup onMouseEnter={() => setActiveReactionPicker(post._id)} onMouseLeave={() => setActiveReactionPicker(null)} onClick={e => e.stopPropagation()}>
                                                    {REACTIONS.map((r, i) => (
                                                        <ReactionButton key={i} $active={post.userReaction === r.name} onClick={e => { e.stopPropagation(); handleReaction(post._id, r.name); }}>
                                                            {r.emoji}
                                                        </ReactionButton>
                                                    ))}
                                                </ReactionsPopup>
                                            )}
                                        </ActionButton>
                                        <ActionButton onClick={() => toggleComments(post._id)}><MessageCircle size={18}/> Comment</ActionButton>
                                        <ActionButton onClick={() => handleShare(post._id)}><Share2 size={18}/> Share</ActionButton>
                                        <ActionButton $active={post.isBookmarked || post.bookmarkedBy?.includes(user?._id)} $activeColor="#f59e0b" onClick={() => handleBookmark(post._id)}>
                                            {(post.isBookmarked || post.bookmarkedBy?.includes(user?._id)) ? <BookmarkCheck size={18}/> : <Bookmark size={18}/>}
                                            Save
                                        </ActionButton>
                                    </PostActions>

                                    {expandedComments[post._id] && (
                                        <CommentsSection>
                                            {post.comments?.length > 0 && (
                                                <CommentsList>
                                                    {post.comments.slice(-5).map((comment, i) => (
                                                        <Comment key={i}>
                                                            <AvatarWithBorder src={comment.author?.avatar} name={comment.author?.displayName} username={comment.author?.username} size={30} borderId={comment.author?.equippedBorder || 'border-bronze'} onClick={() => navigate(`/profile/${comment.author?.username}`)}/>
                                                            <CommentContent>
                                                                <CommentBubble>
                                                                    <CommentAuthor onClick={() => navigate(`/profile/${comment.author?.username}`)}>{comment.author?.displayName}</CommentAuthor>
                                                                    <CommentText>{comment.text}</CommentText>
                                                                </CommentBubble>
                                                                <CommentMeta><span>{formatTimeAgo(comment.createdAt)}</span><CommentAction>Like</CommentAction><CommentAction>Reply</CommentAction></CommentMeta>
                                                            </CommentContent>
                                                        </Comment>
                                                    ))}
                                                </CommentsList>
                                            )}
                                            <CommentInput>
                                                <AvatarWithBorder src={user?.profile?.avatar} name={user?.name} size={32} borderId={currentUserBorderId}/>
                                                <CommentTextarea
                                                    placeholder="Add a comment..."
                                                    value={commentInputs[post._id] || ''}
                                                    onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                    onKeyPress={e => e.key === 'Enter' && handleComment(post._id)}
                                                />
                                                <SendBtn onClick={() => handleComment(post._id)} disabled={!commentInputs[post._id]?.trim()}><Send size={15}/></SendBtn>
                                            </CommentInput>
                                        </CommentsSection>
                                    )}
                                </PostCard>
                            );
                        })
                    )}

                    <div ref={observerTarget} style={{height:'20px'}}/>
                    {loading && posts.length > 0 && <LoadingBox><Spinner/></LoadingBox>}
                    {!hasMore && posts.length > 0 && <EndMsg><Shield size={14}/> You've seen all recent market activity</EndMsg>}
                </FeedCol>

                {/* ═══ RIGHT SIDEBAR ═══ */}
                <RightSidebar>
                    {/* Trending Signals */}
                    {activeSignals.length > 0 && (
                        <SideCard>
                            <SideCardTitle><Zap size={13} color="#f59e0b"/> Trending Signals</SideCardTitle>
                            {activeSignals.slice(0, 5).map((s, i) => {
                                const sym = s.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || s.symbol;
                                const long = s.direction === 'UP';
                                return (
                                    <TrendingSignalCard key={i} onClick={() => navigate(`/signal/${s._id}`)}>
                                        <TSLeft>
                                            <TSSymbol>{sym}</TSSymbol>
                                            <TSDir $long={long}>{long ? 'LONG' : 'SHORT'}</TSDir>
                                        </TSLeft>
                                        <TSRight>
                                            <TSConf>{Math.min(95, Math.round(s.confidence))}%</TSConf>
                                        </TSRight>
                                    </TrendingSignalCard>
                                );
                            })}
                        </SideCard>
                    )}

                    {/* Sentiment Snapshot */}
                    {sentimentData.length > 0 && (
                        <SideCard>
                            <SideCardTitle><BarChart2 size={13} color="#0ea5e9"/> Sentiment Snapshot</SideCardTitle>
                            {sentimentData.map((s, i) => (
                                <SentimentBar key={i}>
                                    <SentimentLabel>
                                        <SentimentSymbol>{s.symbol} {s.long ? 'LONG' : 'SHORT'}</SentimentSymbol>
                                        <SentimentPct $c={s.bullPct > 50 ? '#10b981' : '#ef4444'}>{s.bullPct}% bullish</SentimentPct>
                                    </SentimentLabel>
                                    <SentimentTrack><SentimentFill $w={s.bullPct}/></SentimentTrack>
                                </SentimentBar>
                            ))}
                        </SideCard>
                    )}

                    {/* Top Traders */}
                    {topTraders.length > 0 && (
                        <SideCard>
                            <SideCardTitle><Trophy size={13} color="#fbbf24"/> Top Performing Traders</SideCardTitle>
                            {topTraders.map((t, i) => (
                                <TopTraderRow key={t.id} onClick={() => navigate(`/profile/${t.username}`)}>
                                    <TraderRank $rank={i + 1}>{i + 1}</TraderRank>
                                    <AvatarWithBorder src={t.avatar} name={t.name} username={t.username} size={30} borderId={t.equippedBorder || 'border-bronze'}/>
                                    <TraderName>{t.name}</TraderName>
                                    <TraderReturn>{t.return}</TraderReturn>
                                </TopTraderRow>
                            ))}
                        </SideCard>
                    )}
                </RightSidebar>
            </MainContent>

            {/* ═══ CREATE POST MODAL ═══ */}
            {showCreateModal && (
                <ModalOverlay onClick={() => setShowCreateModal(false)}>
                    <Modal onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>Share with the Community</ModalTitle>
                            <CloseBtn onClick={() => setShowCreateModal(false)}><X size={18}/></CloseBtn>
                        </ModalHeader>
                        <ModalBody>
                            <PostTypeSelector>
                                <PostTypeChip $active={postType === 'text'} onClick={() => setPostType('text')}><MessageSquare size={14}/> Text</PostTypeChip>
                                <PostTypeChip $active={postType === 'trade'} onClick={() => setPostType('trade')}><TrendingUp size={14}/> Trade</PostTypeChip>
                                <PostTypeChip $active={postType === 'poll'} onClick={() => setPostType('poll')}><BarChart2 size={14}/> Poll</PostTypeChip>
                                <PostTypeChip $active={postType === 'image'} onClick={() => setPostType('image')}><Image size={14}/> Media</PostTypeChip>
                            </PostTypeSelector>
                            <TextArea
                                placeholder={postType === 'trade' ? "Share your trade story..." : postType === 'poll' ? "Ask the community..." : "Share a trade idea or market insight..."}
                                value={postText} onChange={e => setPostText(e.target.value)} maxLength={1000}
                            />
                            <CharCount $over={postText.length > 1000}>{postText.length}/1000</CharCount>

                            {postType === 'trade' && (
                                <AttachmentPreview>
                                    <AttachmentHeader>
                                        <AttachmentTitle><TrendingUp size={15} color="#10b981"/> Trade Details</AttachmentTitle>
                                        <RemoveAttachment onClick={() => setPostType('text')}><X size={15}/></RemoveAttachment>
                                    </AttachmentHeader>
                                    <TradeForm>
                                        <FormRow>
                                            <FormGroup><FormLabel>Symbol</FormLabel><FormInput placeholder="e.g. AAPL" value={tradeData.symbol} onChange={e => setTradeData({...tradeData, symbol: e.target.value.toUpperCase()})}/></FormGroup>
                                            <FormGroup><FormLabel>Direction</FormLabel><FormSelect value={tradeData.direction} onChange={e => setTradeData({...tradeData, direction: e.target.value})}><option value="LONG">Long (Buy)</option><option value="SHORT">Short (Sell)</option></FormSelect></FormGroup>
                                        </FormRow>
                                        <FormRow>
                                            <FormGroup><FormLabel>Entry Price</FormLabel><FormInput type="number" placeholder="0.00" value={tradeData.entryPrice} onChange={e => setTradeData({...tradeData, entryPrice: e.target.value})}/></FormGroup>
                                            <FormGroup><FormLabel>Exit Price</FormLabel><FormInput type="number" placeholder="0.00" value={tradeData.exitPrice} onChange={e => setTradeData({...tradeData, exitPrice: e.target.value})}/></FormGroup>
                                        </FormRow>
                                        <FormRow>
                                            <FormGroup><FormLabel>Quantity</FormLabel><FormInput type="number" placeholder="0" value={tradeData.quantity} onChange={e => setTradeData({...tradeData, quantity: e.target.value})}/></FormGroup>
                                            <FormGroup><FormLabel>P&L ($)</FormLabel><FormInput type="number" placeholder="0.00" value={tradeData.pnl} onChange={e => setTradeData({...tradeData, pnl: e.target.value})}/></FormGroup>
                                        </FormRow>
                                    </TradeForm>
                                </AttachmentPreview>
                            )}

                            {postType === 'poll' && (
                                <AttachmentPreview>
                                    <AttachmentHeader>
                                        <AttachmentTitle><BarChart2 size={15} color="#a78bfa"/> Poll Options</AttachmentTitle>
                                        <RemoveAttachment onClick={() => setPostType('text')}><X size={15}/></RemoveAttachment>
                                    </AttachmentHeader>
                                    <PollForm>
                                        {pollData.options.map((opt, i) => (
                                            <PollOptionInput key={i}>
                                                <OptionInput placeholder={`Option ${i+1}`} value={opt} onChange={e => { const o = [...pollData.options]; o[i] = e.target.value; setPollData({...pollData, options: o}); }}/>
                                                {pollData.options.length > 2 && <RemoveOptionBtn onClick={() => setPollData({...pollData, options: pollData.options.filter((_,j) => j !== i)})}><X size={15}/></RemoveOptionBtn>}
                                            </PollOptionInput>
                                        ))}
                                        {pollData.options.length < 4 && <AddOptionBtn onClick={() => setPollData({...pollData, options: [...pollData.options, '']})}><Plus size={15}/> Add Option</AddOptionBtn>}
                                    </PollForm>
                                </AttachmentPreview>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <FooterActions>
                                <FooterBtn><Image size={16}/></FooterBtn>
                                <FooterBtn><Smile size={16}/></FooterBtn>
                                <FooterBtn><Hash size={16}/></FooterBtn>
                                <FooterBtn><AtSign size={16}/></FooterBtn>
                            </FooterActions>
                            <PostButton onClick={handleCreatePost} disabled={!postText.trim() && postType === 'text'}><Send size={15}/> Post</PostButton>
                        </ModalFooter>
                    </Modal>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default SocialFeed;
