// src/components/ManualHoldings.js - Manual Portfolio Holdings Management
import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import api from '../api/axios';
import {
    Plus,
    Trash2,
    Edit3,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Search,
    X,
    Check,
    AlertCircle,
    PenLine
} from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
`;

const Title = styled.h3`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: ${p => p.theme.text?.primary || '#e0e6ed'};
    margin: 0;
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem 0.6rem;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    color: #a78bfa;
`;

const SummaryRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
`;

const SummaryCard = styled.div`
    background: ${p => p.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${p => p.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const SummaryLabel = styled.span`
    font-size: 0.75rem;
    font-weight: 600;
    color: ${p => p.theme.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

const SummaryValue = styled.span`
    font-size: 1.15rem;
    font-weight: 800;
    color: ${p => p.$color || p.theme.text?.primary || '#e0e6ed'};
`;

const ActionRow = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const Btn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    color: white;
    background: ${p => {
        if (p.$variant === 'danger') return p.theme.error || '#ef4444';
        if (p.$variant === 'secondary') return p.theme.bg?.card || 'rgba(30, 41, 59, 0.5)';
        if (p.$variant === 'ghost') return 'transparent';
        return 'linear-gradient(135deg, #8b5cf6, #6366f1)';
    }};
    ${p => p.$variant === 'secondary' && css`
        color: ${p.theme.text?.secondary || '#94a3b8'};
        border: 1px solid ${p.theme.border || 'rgba(255, 255, 255, 0.1)'};
    `}
    ${p => p.$variant === 'ghost' && css`
        color: ${p.theme.text?.tertiary || '#64748b'};
        padding: 0.3rem 0.5rem;
    `}
    &:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.9; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
    svg { ${p => p.$loading && css`animation: ${spin} 1s linear infinite;`} }
`;

const HoldingsTable = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const HoldingRow = styled.div`
    background: ${p => p.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${p => p.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 10px;
    padding: 0.75rem 1rem;
    display: grid;
    grid-template-columns: minmax(80px, 1fr) repeat(4, minmax(80px, 1fr)) 70px;
    gap: 0.75rem;
    align-items: center;
    animation: ${fadeIn} 0.3s ease-out;

    @media (max-width: 768px) {
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
    }
`;

const CellLabel = styled.span`
    font-size: 0.65rem;
    font-weight: 600;
    color: ${p => p.theme.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    display: none;
    @media (max-width: 768px) { display: block; }
`;

const CellValue = styled.span`
    font-weight: 700;
    font-size: 0.9rem;
    color: ${p => p.$color || p.theme.text?.primary || '#e0e6ed'};
`;

const SymbolCell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
`;

const SymbolName = styled.span`
    font-size: 0.72rem;
    color: ${p => p.theme.text?.tertiary || '#64748b'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
`;

const TableHeader = styled.div`
    display: grid;
    grid-template-columns: minmax(80px, 1fr) repeat(4, minmax(80px, 1fr)) 70px;
    gap: 0.75rem;
    padding: 0 1rem 0.25rem;
    @media (max-width: 768px) { display: none; }
`;

const HeaderCell = styled.span`
    font-size: 0.7rem;
    font-weight: 700;
    color: ${p => p.theme.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

// Modal overlay
const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
`;

const ModalBox = styled.div`
    background: ${p => p.theme.bg?.secondary || '#1a1f2e'};
    border: 1px solid ${p => p.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 440px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
`;

const ModalHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.25rem;
`;

const ModalTitle = styled.h3`
    font-size: 1.15rem;
    font-weight: 700;
    color: ${p => p.theme.text?.primary || '#e0e6ed'};
    margin: 0;
`;

const CloseBtn = styled.button`
    background: none; border: none; cursor: pointer; padding: 0.25rem;
    color: ${p => p.theme.text?.tertiary || '#64748b'};
    &:hover { color: ${p => p.theme.text?.primary || '#e0e6ed'}; }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
`;

const Label = styled.label`
    font-size: 0.82rem;
    font-weight: 600;
    color: ${p => p.theme.text?.secondary || '#94a3b8'};
`;

const Input = styled.input`
    padding: 0.7rem 1rem;
    background: ${p => p.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${p => p.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    color: ${p => p.theme.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
    &:focus { outline: none; border-color: #8b5cf6; }
    &::placeholder { color: ${p => p.theme.text?.tertiary || '#64748b'}; }
`;

const Select = styled.select`
    padding: 0.7rem 1rem;
    background: ${p => p.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${p => p.theme.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 8px;
    color: ${p => p.theme.text?.primary || '#e0e6ed'};
    font-size: 0.9rem;
    &:focus { outline: none; border-color: #8b5cf6; }
`;

const ErrorMsg = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 0.82rem;
    margin-bottom: 1rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 2.5rem 1rem;
    color: ${p => p.theme.text?.tertiary || '#64748b'};
`;

const EmptyTitle = styled.div`
    font-size: 1rem;
    font-weight: 700;
    color: ${p => p.theme.text?.secondary || '#94a3b8'};
    margin: 0.75rem 0 0.25rem;
`;

const EmptyText = styled.div`
    font-size: 0.85rem;
    max-width: 340px;
    margin: 0 auto 1rem;
    line-height: 1.5;
`;

const Note = styled.div`
    font-size: 0.75rem;
    color: ${p => p.theme.text?.tertiary || '#64748b'};
    text-align: center;
    margin-top: 0.5rem;
    line-height: 1.4;
`;

// ============================================================
// ManualHoldings Component
// ============================================================

const ManualHoldings = () => {
    const [holdings, setHoldings] = useState([]);
    const [summary, setSummary] = useState({ totalValue: 0, totalCost: 0, totalGainLoss: 0, totalGainLossPercent: 0 });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingHolding, setEditingHolding] = useState(null);
    const [error, setError] = useState(null);

    // Form state
    const [formSymbol, setFormSymbol] = useState('');
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState('stock');
    const [formQty, setFormQty] = useState('');
    const [formCost, setFormCost] = useState('');
    const [formSaving, setFormSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const fetchHoldings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/brokerage/manual/holdings');
            if (res.data.success) {
                setHoldings(res.data.holdings || []);
                setSummary({
                    totalValue: res.data.totalValue || 0,
                    totalCost: res.data.totalCost || 0,
                    totalGainLoss: res.data.totalGainLoss || 0,
                    totalGainLossPercent: res.data.totalGainLossPercent || 0
                });
            }
        } catch (err) {
            console.error('Error fetching manual holdings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

    const syncPrices = async () => {
        try {
            setSyncing(true);
            await api.post('/brokerage/manual/sync');
            await fetchHoldings();
        } catch (err) {
            console.error('Error syncing:', err);
        } finally {
            setSyncing(false);
        }
    };

    const openAdd = () => {
        setEditingHolding(null);
        setFormSymbol('');
        setFormName('');
        setFormType('stock');
        setFormQty('');
        setFormCost('');
        setFormError(null);
        setShowAddModal(true);
    };

    const openEdit = (holding) => {
        setEditingHolding(holding);
        setFormSymbol(holding.symbol);
        setFormName(holding.name || '');
        setFormType(holding.assetType || 'stock');
        setFormQty(String(holding.quantity));
        setFormCost(String(holding.costBasis));
        setFormError(null);
        setShowAddModal(true);
    };

    const handleSave = async () => {
        const qty = parseFloat(formQty);
        const cost = parseFloat(formCost);
        if (!formSymbol.trim()) return setFormError('Symbol is required');
        if (isNaN(qty) || qty <= 0) return setFormError('Quantity must be a positive number');
        if (isNaN(cost) || cost < 0) return setFormError('Cost basis must be non-negative');

        try {
            setFormSaving(true);
            setFormError(null);

            if (editingHolding) {
                await api.put(`/brokerage/manual/holdings/${editingHolding.id}`, {
                    quantity: qty,
                    costBasis: cost,
                    name: formName,
                    assetType: formType
                });
            } else {
                await api.post('/brokerage/manual/holdings', {
                    symbol: formSymbol.trim(),
                    name: formName.trim(),
                    assetType: formType,
                    quantity: qty,
                    costBasis: cost
                });
            }

            setShowAddModal(false);
            await fetchHoldings();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Failed to save holding');
        } finally {
            setFormSaving(false);
        }
    };

    const handleDelete = async (holdingId) => {
        if (!window.confirm('Remove this holding?')) return;
        try {
            await api.delete(`/brokerage/manual/holdings/${holdingId}`);
            await fetchHoldings();
        } catch (err) {
            console.error('Error removing holding:', err);
        }
    };

    const fmtUSD = (v) => `$${(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtPct = (v) => `${(v || 0) >= 0 ? '+' : ''}${(v || 0).toFixed(2)}%`;
    const gainColor = (v) => (v || 0) >= 0 ? '#10b981' : '#ef4444';

    if (loading) {
        return <Container><Note>Loading manual holdings...</Note></Container>;
    }

    return (
        <Container>
            <Header>
                <Title>
                    <PenLine size={20} />
                    Manual Portfolio
                    <Badge><PenLine size={10} /> Self-Reported</Badge>
                </Title>
                <ActionRow>
                    <Btn onClick={syncPrices} disabled={syncing || holdings.length === 0} $loading={syncing} $variant="secondary">
                        <RefreshCw size={14} />
                        {syncing ? 'Syncing...' : 'Refresh Prices'}
                    </Btn>
                    <Btn onClick={openAdd}>
                        <Plus size={14} />
                        Add Holding
                    </Btn>
                </ActionRow>
            </Header>

            {holdings.length > 0 && (
                <SummaryRow>
                    <SummaryCard>
                        <SummaryLabel>Total Value</SummaryLabel>
                        <SummaryValue>{fmtUSD(summary.totalValue)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard>
                        <SummaryLabel>Total Cost</SummaryLabel>
                        <SummaryValue>{fmtUSD(summary.totalCost)}</SummaryValue>
                    </SummaryCard>
                    <SummaryCard>
                        <SummaryLabel>Gain / Loss</SummaryLabel>
                        <SummaryValue $color={gainColor(summary.totalGainLoss)}>
                            {fmtUSD(summary.totalGainLoss)}
                        </SummaryValue>
                    </SummaryCard>
                    <SummaryCard>
                        <SummaryLabel>Return</SummaryLabel>
                        <SummaryValue $color={gainColor(summary.totalGainLossPercent)}>
                            {fmtPct(summary.totalGainLossPercent)}
                        </SummaryValue>
                    </SummaryCard>
                </SummaryRow>
            )}

            {holdings.length === 0 ? (
                <EmptyState>
                    <PenLine size={48} style={{ opacity: 0.4 }} />
                    <EmptyTitle>No holdings yet</EmptyTitle>
                    <EmptyText>
                        Add your holdings from Webull, Coinbase, Interactive Brokers, 
                        or any other platform to track everything in one place.
                    </EmptyText>
                    <Btn onClick={openAdd}>
                        <Plus size={14} />
                        Add Your First Holding
                    </Btn>
                </EmptyState>
            ) : (
                <HoldingsTable>
                    <TableHeader>
                        <HeaderCell>Asset</HeaderCell>
                        <HeaderCell>Qty / Cost</HeaderCell>
                        <HeaderCell>Price</HeaderCell>
                        <HeaderCell>Value</HeaderCell>
                        <HeaderCell>Gain/Loss</HeaderCell>
                        <HeaderCell></HeaderCell>
                    </TableHeader>

                    {holdings.map(h => (
                        <HoldingRow key={h.id}>
                            <SymbolCell>
                                <CellLabel>Asset</CellLabel>
                                <CellValue>{h.symbol}</CellValue>
                                <SymbolName>{h.name || h.assetType}</SymbolName>
                            </SymbolCell>
                            <div>
                                <CellLabel>Qty / Cost</CellLabel>
                                <CellValue style={{ fontSize: '0.82rem' }}>{h.quantity}</CellValue>
                                <SymbolName>@ {fmtUSD(h.costBasis)}</SymbolName>
                            </div>
                            <div>
                                <CellLabel>Price</CellLabel>
                                <CellValue style={{ fontSize: '0.85rem' }}>{fmtUSD(h.currentPrice)}</CellValue>
                            </div>
                            <div>
                                <CellLabel>Value</CellLabel>
                                <CellValue>{fmtUSD(h.currentValue)}</CellValue>
                            </div>
                            <div>
                                <CellLabel>Gain/Loss</CellLabel>
                                <CellValue $color={gainColor(h.gainLoss)} style={{ fontSize: '0.85rem' }}>
                                    {fmtUSD(h.gainLoss)}
                                </CellValue>
                                <SymbolName style={{ color: gainColor(h.gainLossPercent) }}>
                                    {fmtPct(h.gainLossPercent)}
                                </SymbolName>
                            </div>
                            <ActionRow style={{ justifyContent: 'flex-end' }}>
                                <Btn $variant="ghost" onClick={() => openEdit(h)} title="Edit">
                                    <Edit3 size={14} />
                                </Btn>
                                <Btn $variant="ghost" onClick={() => handleDelete(h.id)} title="Remove" style={{ color: '#ef4444' }}>
                                    <Trash2 size={14} />
                                </Btn>
                            </ActionRow>
                        </HoldingRow>
                    ))}
                </HoldingsTable>
            )}

            <Note>
                Prices update automatically. Holdings are managed by you.
                {holdings.length > 0 && holdings[0].lastPriceUpdate && (
                    <> Last price update: {new Date(holdings[0].lastPriceUpdate).toLocaleString()}</>
                )}
            </Note>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <Overlay onClick={() => setShowAddModal(false)}>
                    <ModalBox onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{editingHolding ? 'Edit Holding' : 'Add Holding'}</ModalTitle>
                            <CloseBtn onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </CloseBtn>
                        </ModalHeader>

                        {formError && (
                            <ErrorMsg>
                                <AlertCircle size={14} />
                                {formError}
                            </ErrorMsg>
                        )}

                        <FormGroup>
                            <Label>Symbol / Ticker</Label>
                            <Input
                                type="text"
                                placeholder="e.g. AAPL, BTC, ETH"
                                value={formSymbol}
                                onChange={e => setFormSymbol(e.target.value.toUpperCase())}
                                disabled={!!editingHolding}
                                style={editingHolding ? { opacity: 0.6 } : {}}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Name (optional)</Label>
                            <Input
                                type="text"
                                placeholder="e.g. Apple Inc."
                                value={formName}
                                onChange={e => setFormName(e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Asset Type</Label>
                            <Select value={formType} onChange={e => setFormType(e.target.value)}>
                                <option value="stock">Stock</option>
                                <option value="crypto">Crypto</option>
                                <option value="etf">ETF</option>
                                <option value="other">Other</option>
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>Quantity</Label>
                            <Input
                                type="number"
                                step="any"
                                min="0"
                                placeholder="Number of shares/units"
                                value={formQty}
                                onChange={e => setFormQty(e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Cost Basis (per unit)</Label>
                            <Input
                                type="number"
                                step="any"
                                min="0"
                                placeholder="Average cost per share/unit"
                                value={formCost}
                                onChange={e => setFormCost(e.target.value)}
                            />
                        </FormGroup>

                        <ActionRow style={{ marginTop: '0.5rem' }}>
                            <Btn $variant="secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                                Cancel
                            </Btn>
                            <Btn onClick={handleSave} disabled={formSaving} $loading={formSaving} style={{ flex: 1 }}>
                                {formSaving ? (
                                    <><RefreshCw size={14} /> Saving...</>
                                ) : editingHolding ? (
                                    <><Check size={14} /> Save Changes</>
                                ) : (
                                    <><Plus size={14} /> Add Holding</>
                                )}
                            </Btn>
                        </ActionRow>
                    </ModalBox>
                </Overlay>
            )}
        </Container>
    );
};

export default ManualHoldings;
