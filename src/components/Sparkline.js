// client/src/components/Sparkline.js
// Tiny, dependency-free SVG sparkline. Optionally overlays pattern key levels
// (support / resistance / neckline / target) when `pattern` prop is provided.

import React, { useMemo } from 'react';

const Sparkline = ({
    data = [],
    width = 140,
    height = 36,
    bias = 'long',          // 'long' | 'short' | 'neutral'
    pattern = null,         // optional: { points, target } for hover overlay
    showPattern = false,    // toggle pattern overlay
    strokeWidth = 1.5
}) => {
    const { path, area, ymin, yrange, color } = useMemo(() => {
        if (!data || data.length < 2) {
            return { path: '', area: '', ymin: 0, yrange: 1, color: '#64748b' };
        }
        const ymin = Math.min(...data);
        const ymax = Math.max(...data);
        const yrange = (ymax - ymin) || 1;
        const xstep = width / (data.length - 1);

        const points = data.map((v, i) => {
            const x = i * xstep;
            const y = height - ((v - ymin) / yrange) * height;
            return [x, y];
        });

        const path = points.reduce(
            (acc, [x, y], i) => acc + (i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : ` L${x.toFixed(1)},${y.toFixed(1)}`),
            ''
        );
        const area = `${path} L${width.toFixed(1)},${height} L0,${height} Z`;

        const color = bias === 'long' ? '#10b981'
            : bias === 'short' ? '#ef4444'
            : '#64748b';

        return { path, area, ymin, yrange, color };
    }, [data, width, height, bias]);

    // Map a price value to the sparkline's Y coordinate
    const priceToY = (price) => {
        if (price === null || price === undefined) return null;
        return height - ((price - ymin) / yrange) * height;
    };

    // Pattern level overlays (rendered when showPattern is true)
    const overlays = [];
    if (showPattern && pattern?.points) {
        const pts = pattern.points;
        const neckline = pts.neckline;
        const target = pattern.target;

        if (typeof neckline === 'number') {
            const y = priceToY(neckline);
            if (y !== null && y >= 0 && y <= height) {
                overlays.push(
                    <line
                        key="neckline"
                        x1={0}
                        x2={width}
                        y1={y}
                        y2={y}
                        stroke="#a78bfa"
                        strokeWidth="1"
                        strokeDasharray="3 2"
                        opacity="0.85"
                    />
                );
            }
        }
        if (typeof target === 'number') {
            const y = priceToY(target);
            if (y !== null && y >= 0 && y <= height) {
                overlays.push(
                    <line
                        key="target"
                        x1={0}
                        x2={width}
                        y1={y}
                        y2={y}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.7"
                    />
                );
            }
        }
    }

    if (!path) return null;

    const gradientId = `sparkGrad-${Math.random().toString(36).slice(2, 8)}`;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ display: 'block' }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} />
            <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            {overlays}
        </svg>
    );
};

export default Sparkline;
