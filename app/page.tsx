'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getApiBaseUrl, getAuthToken, startGoogleOAuth } from '@/lib/auth';

const TOTAL_SLIDES = 5;

const stats = [
  ['2,047', 'PDF Documents'],
  ['312', 'Named Individuals'],
  ['94,820', 'Pages Indexed'],
  ['12', 'Data Sets Released'],
];

const docs = [
  ['INDICTMENT', 'SDNY Criminal Complaint 2019', '14 PGS · SEX TRAFFICKING CONSPIRACY'],
  ['DEPOSITION', 'Giuffre v. Maxwell · 418 Pages', 'UNSEALED 2022 · SDNY'],
  ['FLIGHT LOGS', 'Lolita Express Manifests', '89 PGS · PARTIALLY REDACTED'],
  ['AGREEMENT', 'Non-Prosecution Agreement', 'PALM BEACH · 2007 · ACOSTA'],
  ['FBI RECORDS', 'Bureau Interview Transcripts', 'PARTIALLY REDACTED'],
  ['DATASET 1-12', 'DOJ EFTA Full Disclosure', '2,047 FILES · MAY 2026'],
];

const timeline = [
  ['1994', 'Abuse Begins - Palm Beach, FL', 'EARLIEST DOCUMENTED INCIDENTS · VICTIM TESTIMONIES ON RECORD'],
  ['1996', 'FBI First Tipped Off - Maria Farmer', 'SURVIVOR REPORT FILED · OFFICIAL RESPONSE SCRUTINIZED'],
  ['2005', 'Palm Beach PD Investigation Opens', '53 IDENTIFIED VICTIMS · DET. JOSEPH RECAREY LEAD'],
  ['2007', 'DOJ Non-Prosecution Agreement - Sealed', 'ALEX ACOSTA · VICTIMS NOT NOTIFIED'],
  ['2019', 'Federal Arrest · SDNY Indictment', 'SEX TRAFFICKING CONSPIRACY · MCC MANHATTAN'],
  ['2021', 'Maxwell Convicted - 5 of 6 Counts', 'SDNY · DEC 29 · 20 YEARS FEDERAL SENTENCE'],
  ['2025-26', 'EFTA - 2,047 Documents Released', 'DOJ · 12 DATA SETS · JUSTICE.GOV/EPSTEIN'],
];

function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frame = 0;
    let raf = 0;
    const points = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.3 + 0.05,
      r: Math.random() * 1.1 + 0.2,
    }));
    const nodes = Array.from({ length: 22 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
    }));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(200,180,140,0.02)';
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0) node.x = w;
        if (node.x > w) node.x = 0;
        if (node.y < 0) node.y = h;
        if (node.y > h) node.y = 0;
      });

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 220) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(192,57,43,${(1 - d / 220) * 0.06})`;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(192,57,43,.18)';
        ctx.fill();
      });

      points.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0) point.x = w;
        if (point.x > w) point.x = 0;
        if (point.y < 0) point.y = h;
        if (point.y > h) point.y = 0;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,160,23,${point.a})`;
        ctx.fill();
      });

      const sy = ((frame * 0.35) % (h + 140)) - 70;
      const sweep = ctx.createLinearGradient(0, sy, 0, sy + 110);
      sweep.addColorStop(0, 'transparent');
      sweep.addColorStop(0.5, 'rgba(200,180,140,0.022)');
      sweep.addColorStop(1, 'transparent');
      ctx.fillStyle = sweep;
      ctx.fillRect(0, sy, w, 110);

      frame += 1;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
}

function CornerMarks() {
  return (
    <div className="pointer-events-none absolute inset-[18px]">
      <span className="absolute left-0 top-0 h-4 w-4 border-l border-t border-[#8a6610]" />
      <span className="absolute right-0 top-0 h-4 w-4 border-r border-t border-[#8a6610]" />
      <span className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-[#8a6610]" />
      <span className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-[#8a6610]" />
    </div>
  );
}

function DocumentPreview({ label, index }: { label: string; index: number }) {
  return (
    <div className="relative h-[90px] overflow-hidden bg-[#121212]">
      <div className="absolute inset-0 opacity-70">
        {Array.from({ length: 9 }).map((_, row) => (
          <span
            key={row}
            className="absolute h-px bg-[#ede5d5]/20"
            style={{
              left: 10,
              top: 12 + row * 8,
              width: `${32 + ((row * 23 + index * 11) % 62)}%`,
            }}
          />
        ))}
        {Array.from({ length: 5 }).map((_, row) => (
          <span
            key={row}
            className="absolute h-1.5 bg-[#5a524a]/60"
            style={{
              left: `${18 + row * 12}%`,
              top: 18 + row * 13,
              width: `${12 + row * 4}%`,
            }}
          />
        ))}
      </div>
      <div className="absolute left-0 top-0 h-[3px] w-full bg-[#c0392b]/60" />
      <div className="absolute left-2 top-2 font-terminal text-[7px] font-bold uppercase text-[#c0392b]">
        {label}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#060606]/10 to-[#060606]/75" />
    </div>
  );
}

function NetworkGraph() {
  type NodeDatum = {
    id: number;
    name: string;
    role: string;
    status: string;
    tier: number;
    color: string;
  };
  type GraphNode = NodeDatum & {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    pulse: number;
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const hoveredRef = useRef<number | null>(null);
  const selectedRef = useRef<number | null>(0);
  const draggingRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<null | {
    x: number;
    y: number;
    name: string;
    role: string;
    status: string;
    color: string;
    links: string;
  }>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !wrap || !ctx) return;

    const nodeData: NodeDatum[] = [
      { id: 0, name: 'JEFFREY EPSTEIN', role: 'Convicted Sex Offender / Financier', status: 'DECEASED · AUG 10, 2019', tier: 0, color: '#c0392b' },
      { id: 1, name: 'GHISLAINE MAXWELL', role: 'Co-Conspirator / Convicted', status: 'CONVICTED · 20 YRS FEDERAL', tier: 1, color: '#c0392b' },
      { id: 2, name: 'JEAN-LUC BRUNEL', role: 'Modeling Agent / Co-Charged', status: 'DECEASED · FEB 19, 2022', tier: 1, color: '#a93226' },
      { id: 3, name: 'ALAN DERSHOWITZ', role: 'Defense Attorney', status: 'NAMED IN COURT DOCS', tier: 1, color: '#d4a017' },
      { id: 4, name: 'LESLIE WEXNER', role: 'Billionaire / L Brands CEO', status: 'FINANCIAL TIES DOCUMENTED', tier: 1, color: '#d4a017' },
      { id: 5, name: 'ALEX ACOSTA', role: 'Fmr. Secretary of Labor', status: 'NEGOTIATED 2007 NPA DEAL', tier: 1, color: '#d4a017' },
      { id: 6, name: 'VIRGINIA GIUFFRE', role: 'Key Witness / Survivor', status: 'PRIMARY PLAINTIFF', tier: 2, color: '#8a7e72' },
      { id: 7, name: 'SARAH KELLEN', role: 'Epstein Personal Assistant', status: 'NAMED IN FILES', tier: 2, color: '#8a7e72' },
      { id: 8, name: 'PALM BEACH PD', role: 'Investigating Agency · 2005', status: '53 VICTIMS IDENTIFIED', tier: 2, color: '#5a7a8a' },
      { id: 9, name: 'SDNY PROSECUTORS', role: 'Southern District of New York', status: '2019 INDICTMENT', tier: 2, color: '#5a7a8a' },
      { id: 10, name: 'LITTLE ST. JAMES', role: 'Private Island · USVI', status: 'PRIMARY LOCATION', tier: 2, color: '#6a5a2a' },
      { id: 11, name: '[REDACTED]', role: 'Classified Subject', status: 'IDENTITY SEALED', tier: 2, color: '#3a3430' },
    ];
    const edges: Array<[number, number, string, number]> = [
      [0, 1, 'OPERATED TOGETHER', 3],
      [0, 2, 'SUPPLIED VICTIMS', 2],
      [0, 3, 'LEGAL DEFENSE', 1],
      [0, 4, 'FINANCIAL TIES', 2],
      [0, 5, 'NPA 2007', 2],
      [0, 6, 'ALLEGED ABUSE', 3],
      [0, 7, 'STAFF', 2],
      [0, 8, 'INVESTIGATED BY', 2],
      [0, 9, 'INDICTED BY', 3],
      [0, 10, 'OWNED', 2],
      [0, 11, 'LINKED', 1],
      [1, 2, 'CO-ACCUSED', 2],
      [1, 6, 'RECRUITED', 3],
      [1, 7, 'SUPERVISED', 2],
      [5, 0, 'NPA DEAL', 2],
      [9, 1, 'CONVICTED', 2],
    ];

    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let frame = 0;
    let raf = 0;

    const connections = (id: number) =>
      edges
        .filter(([from, to]) => from === id || to === id)
        .map(([from, to]) => nodeData[from === id ? to : from].name);

    const initNodes = () => {
      const tierOne = nodeData.filter((node) => node.tier === 1);
      const tierTwo = nodeData.filter((node) => node.tier === 2);
      nodesRef.current = nodeData.map((node) => {
        if (node.tier === 0) {
          return { ...node, x: centerX, y: centerY, vx: 0, vy: 0, r: 22, pulse: Math.random() * Math.PI * 2 };
        }

        const ring = node.tier === 1 ? tierOne : tierTwo;
        const index = ring.findIndex((item) => item.id === node.id);
        const angle = (index / ring.length) * Math.PI * 2 - Math.PI / 2;
        const radius = Math.min(width, height) * (node.tier === 1 ? 0.28 : 0.43);
        return {
          ...node,
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 18,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 18,
          vx: 0,
          vy: 0,
          r: node.tier === 1 ? 14 : node.name.startsWith('[') ? 10 : 11,
          pulse: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      centerX = width / 2;
      centerY = height / 2;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    };

    const tick = () => {
      const graphNodes = nodesRef.current;
      graphNodes.forEach((node, i) => {
        if (node.id === draggingRef.current) return;
        let fx = 0;
        let fy = 0;

        graphNodes.forEach((other, j) => {
          if (i === j) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const d2 = dx * dx + dy * dy + 1;
          const force = 2600 / d2;
          fx += force * dx;
          fy += force * dy;
        });

        edges.forEach(([from, to, , strength]) => {
          if (from !== node.id && to !== node.id) return;
          const other = graphNodes[from === node.id ? to : from];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.1;
          const rest = node.tier === 0 || other.tier === 0 ? 132 : 104;
          const force = 0.018 * (d - rest) * strength;
          fx += (force * dx) / d;
          fy += (force * dy) / d;
        });

        fx += (centerX - node.x) * 0.008 * (node.tier === 0 ? 3 : 1);
        fy += (centerY - node.y) * 0.008 * (node.tier === 0 ? 3 : 1);
        node.vx = (node.vx + fx * 0.1) * 0.82;
        node.vy = (node.vy + fy * 0.1) * 0.82;
        node.x += node.vx;
        node.y += node.vy;
        const pad = node.r + 12;
        node.x = Math.max(pad, Math.min(width - pad, node.x));
        node.y = Math.max(pad, Math.min(height - pad, node.y));
      });
    };

    const draw = () => {
      const graphNodes = nodesRef.current;
      ctx.clearRect(0, 0, width, height);
      frame += 1;
      tick();

      ctx.strokeStyle = 'rgba(200,180,140,0.025)';
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      edges.forEach(([from, to, label, strength]) => {
        const a = graphNodes[from];
        const b = graphNodes[to];
        const selected = selectedRef.current !== null && (a.id === selectedRef.current || b.id === selectedRef.current);
        const hovered = hoveredRef.current !== null && (a.id === hoveredRef.current || b.id === hoveredRef.current);

        if (selected) {
          const t = (frame * 0.02) % 1;
          ctx.beginPath();
          ctx.arc(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212,160,23,0.8)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = selected ? 'rgba(212,160,23,.7)' : hovered ? 'rgba(200,180,140,.5)' : 'rgba(200,180,140,.18)';
        ctx.lineWidth = selected ? strength * 1.8 : strength;
        ctx.stroke();

        if (hovered) {
          ctx.font = '7px monospace';
          ctx.fillStyle = 'rgba(138,126,114,.9)';
          ctx.fillText(label, (a.x + b.x) / 2 + 3, (a.y + b.y) / 2 - 3);
        }
      });

      graphNodes.forEach((node) => {
        node.pulse += 0.04;
        const selected = selectedRef.current === node.id;
        const hovered = hoveredRef.current === node.id;
        const radius = node.r + (node.tier === 0 ? Math.sin(node.pulse) * 2 : 0);

        if (selected || hovered) {
          const glow = ctx.createRadialGradient(node.x, node.y, node.r, node.x, node.y, node.r * 3.5);
          glow.addColorStop(0, selected ? 'rgba(212,160,23,.22)' : 'rgba(200,180,140,.12)');
          glow.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        if (node.tier === 0) {
          [1.8, 2.6, 3.4].forEach((multiplier, index) => {
            const alpha = Math.max(0, ((Math.sin(node.pulse - index * 0.8) + 1) / 2) * 0.12);
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r * multiplier, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(192,57,43,${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          });
        }

        const gradient = ctx.createRadialGradient(node.x - node.r * 0.3, node.y - node.r * 0.3, 0, node.x, node.y, radius);
        if (node.tier === 0) {
          gradient.addColorStop(0, '#e85040');
          gradient.addColorStop(1, '#7a1a10');
        } else if (node.color === '#d4a017') {
          gradient.addColorStop(0, '#d4a017');
          gradient.addColorStop(1, '#8a6610');
        } else {
          gradient.addColorStop(0, node.color);
          gradient.addColorStop(1, node.tier === 1 ? '#7a1a10' : '#0d0d0d');
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = selected ? '#d4a017' : hovered ? 'rgba(200,180,140,.65)' : `${node.color}88`;
        ctx.lineWidth = selected ? 1.5 : 0.8;
        ctx.stroke();

        const words = node.name.split(' ');
        const fontSize = node.tier === 0 ? 11 : node.tier === 1 ? 9 : 8;
        const lineHeight = fontSize + 2;
        const above = node.y < centerY;
        const startY = above ? node.y - radius - 5 - words.length * lineHeight : node.y + radius + 10;
        ctx.font = `${node.tier === 0 ? 700 : 600} ${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,.9)';
        ctx.shadowBlur = 6;
        words.forEach((word, index) => {
          ctx.fillStyle = node.tier === 0 ? '#f0e8d8' : node.tier === 1 ? '#b0a898' : '#6a6258';
          ctx.fillText(word, node.x, startY + index * lineHeight + fontSize);
        });
        ctx.shadowBlur = 0;
      });

      ctx.textAlign = 'left';
      ctx.font = '7px monospace';
      ctx.fillStyle = 'rgba(90,82,74,.5)';
      ctx.fillText(`EPSTEIN NETWORK · ${nodeData.length} NODES · ${edges.length} CONNECTIONS`, 10, height - 10);

      raf = requestAnimationFrame(draw);
    };

    const canvasPoint = (event: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const point = 'touches' in event ? event.touches[0] : event;
      return { x: point.clientX - rect.left, y: point.clientY - rect.top, clientX: point.clientX, clientY: point.clientY };
    };

    const hitTest = (x: number, y: number) => {
      for (let i = nodesRef.current.length - 1; i >= 0; i -= 1) {
        const node = nodesRef.current[i];
        const dx = x - node.x;
        const dy = y - node.y;
        if (dx * dx + dy * dy <= (node.r + 10) * (node.r + 10)) return node.id;
      }
      return null;
    };

    const showTooltip = (node: GraphNode, clientX: number, clientY: number) => {
      const links = connections(node.id);
      setTooltip({
        x: clientX + 16,
        y: clientY + 8,
        name: node.name,
        role: node.role,
        status: node.status,
        color: node.color,
        links: links.slice(0, 3).join(' · ') + (links.length > 3 ? '...' : ''),
      });
    };

    const onMouseMove = (event: MouseEvent) => {
      const point = canvasPoint(event);
      const hit = hitTest(point.x, point.y);
      hoveredRef.current = hit;
      canvas.style.cursor = hit !== null ? 'pointer' : draggingRef.current !== null ? 'grabbing' : 'grab';

      if (draggingRef.current !== null) {
        const node = nodesRef.current[draggingRef.current];
        node.x = point.x + dragOffsetRef.current.x;
        node.y = point.y + dragOffsetRef.current.y;
      }

      if (hit !== null) showTooltip(nodesRef.current[hit], point.clientX, point.clientY);
      else if (draggingRef.current === null) setTooltip(null);
    };

    const onMouseDown = (event: MouseEvent) => {
      const point = canvasPoint(event);
      const hit = hitTest(point.x, point.y);
      if (hit === null) {
        selectedRef.current = null;
        return;
      }
      draggingRef.current = hit;
      selectedRef.current = hit;
      const node = nodesRef.current[hit];
      node.vx = 0;
      node.vy = 0;
      dragOffsetRef.current = { x: node.x - point.x, y: node.y - point.y };
    };

    const onMouseUp = () => {
      draggingRef.current = null;
    };

    const onTouchStart = (event: TouchEvent) => {
      event.preventDefault();
      const point = canvasPoint(event);
      const hit = hitTest(point.x, point.y);
      if (hit === null) return;
      draggingRef.current = hit;
      selectedRef.current = hit;
      const node = nodesRef.current[hit];
      dragOffsetRef.current = { x: node.x - point.x, y: node.y - point.y };
      showTooltip(node, point.clientX, point.clientY);
    };

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      if (draggingRef.current === null) return;
      const point = canvasPoint(event);
      const node = nodesRef.current[draggingRef.current];
      node.x = point.x + dragOffsetRef.current.x;
      node.y = point.y + dragOffsetRef.current.y;
    };

    const onTouchEnd = () => {
      draggingRef.current = null;
      setTooltip(null);
    };

    resize();
    draw();
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full min-h-[330px] w-full max-w-5xl">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full cursor-grab" />
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 min-w-48 border border-[#c8b48c33] bg-[#080606]/95 px-3.5 py-2.5 shadow-[0_14px_40px_rgba(0,0,0,.35)]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="[font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-lg uppercase tracking-[0.16em] text-[#ede5d5]">
            {tooltip.name}
          </div>
          <div className="mt-1 font-terminal text-[8px] uppercase tracking-[0.08em] text-[#5a524a]">
            {tooltip.role}
          </div>
          <div className="mt-1 font-terminal text-[8px] uppercase tracking-[0.08em]" style={{ color: tooltip.color }}>
            {tooltip.status}
          </div>
          <div className="mt-2 border-t border-[#c8b48c1a] pt-1.5 font-terminal text-[7px] uppercase tracking-[0.08em] text-[#5a524a]">
            Links: {tooltip.links}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [locked, setLocked] = useState(false);
  const touchStart = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (code) {
      const callbackUrl = new URL('/auth/callback', getApiBaseUrl());
      callbackUrl.searchParams.set('code', code);
      callbackUrl.searchParams.set('redirect_to', window.location.origin);
      window.location.replace(callbackUrl.toString());
      return;
    }

    if (error) {
      const successUrl = new URL('/auth/success', window.location.origin);
      params.forEach((value, key) => successUrl.searchParams.set(key, value));
      window.location.replace(successUrl.toString());
    }
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (locked || next < 0 || next >= TOTAL_SLIDES) return;
      setLocked(true);
      setCurrent(next);
      window.setTimeout(() => setLocked(false), 950);
    },
    [locked],
  );

  const handleLaunchTerminal = async () => {
    if (getAuthToken()) {
      window.location.assign('/terminal');
      return;
    }

    await startGoogleOAuth(getApiBaseUrl());
  };

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      goTo(current + (event.deltaY > 0 ? 1 : -1));
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goTo(current + 1);
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goTo(current - 1);
      }
    };
    const onTouchStart = (event: TouchEvent) => {
      touchStart.current = event.touches[0].clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const delta = touchStart.current - event.changedTouches[0].clientY;
      if (Math.abs(delta) > 38) goTo(current + (delta > 0 ? 1 : -1));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [current, goTo]);

  return (
    <main className="relative h-screen overflow-hidden bg-[#060606] text-[#ede5d5]">
      <BackgroundCanvas />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(200,180,140,0.018)_2px,rgba(200,180,140,0.018)_4px)]" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.92)_100%)]" />
      <div className="fixed left-0 top-0 z-50 h-0.5 bg-gradient-to-r from-[#c0392b] to-[#d4a017] transition-[width] duration-700" style={{ width: `${(current / (TOTAL_SLIDES - 1)) * 100}%` }} />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[#c8b48c1a] bg-[#060606]/95 px-4 py-3 backdrop-blur-md sm:px-7">
        <div className="font-terminal text-sm font-bold uppercase tracking-[0.34em]">GOV<span className="text-[#c0392b]">TRANSPARENCY</span></div>
        <div className="hidden items-center gap-2 font-terminal text-[9px] uppercase tracking-[0.24em] text-[#5a524a] sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c0392b]" />LIVE · DOJ RECORDS</div>
        <div className="font-terminal text-[10px] uppercase tracking-[0.18em] text-[#d4a017]">2,047 FILES</div>
      </header>

      <nav className="fixed right-5 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3">
        {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => goTo(index)}
            className={`h-1.5 w-1.5 rounded-full transition ${current === index ? 'scale-150 border border-[#d4a017] bg-transparent shadow-[0_0_10px_#8a6610]' : 'bg-[#5a524a]'}`}
          />
        ))}
      </nav>

      <button
        onClick={() => goTo(current + 1)}
        className={`fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 transition ${current === TOTAL_SLIDES - 1 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <span className="font-terminal text-[8px] uppercase tracking-[0.28em] text-[#5a524a]">SWIPE UP TO INVESTIGATE</span>
        <span className="h-3.5 w-3.5 rotate-45 border-b border-r border-[#d4a017]" />
      </button>

      <div className="relative z-10 h-screen transition-transform duration-1000 ease-[cubic-bezier(.77,0,.175,1)]" style={{ transform: `translateY(-${current * 100}vh)` }}>
        <section className="relative flex h-screen flex-col items-center justify-center px-7 py-20 text-center">
          <CornerMarks />
          <div className="mb-7 border border-[#c0392b]/45 px-5 py-1.5 font-terminal text-[9px] uppercase tracking-[0.42em] text-[#c0392b]">CLASSIFIED · FOIA RELEASE · DOJ/EPSTEIN FILES TRANSPARENCY ACT</div>
          <h1 className="[font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-[clamp(62px,11vw,124px)] uppercase leading-[.86] tracking-[.09em]">EPSTEIN<span className="block text-[#c0392b]">FILES</span></h1>
          <p className="mt-5 font-terminal text-[9px] uppercase tracking-[0.28em] text-[#5a524a]">2,000+ court records · depositions · federal indictments · flight logs</p>
          <div className="mt-9 grid w-full max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label}><div className="[font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-5xl tracking-wide text-[#d4a017]">{value}</div><div className="mt-1 font-terminal text-[8px] uppercase tracking-[0.2em] text-[#5a524a]">{label}</div></div>
            ))}
          </div>
          <div className="mt-8 h-11 w-px bg-gradient-to-b from-transparent via-[#8a6610] to-transparent" />
          <p className="mt-5 font-terminal text-[8px] uppercase tracking-[0.28em] text-[#5a524a]">RAG-powered intelligence · Pinecone vector search · Claude AI · cited sources</p>
        </section>

        <section className="relative flex h-screen flex-col items-center justify-center px-5 py-16">
          <CornerMarks />
          <div className="font-terminal text-[8px] uppercase tracking-[0.5em] text-[#c0392b]">Connection Network · DOJ Case Files</div>
          <h2 className="mb-2 mt-3 [font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-5xl uppercase tracking-[0.16em]">Persons Of Interest</h2>
          <NetworkGraph />
          <div className="mt-3 flex flex-wrap justify-center gap-5 font-terminal text-[8px] uppercase tracking-[0.12em] text-[#5a524a]">
            <span className="before:mr-2 before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[#c0392b]">Subject / Convicted</span>
            <span className="before:mr-2 before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[#d4a017]">Named In Docs</span>
            <span className="before:mr-2 before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[#5a7a8a]">Agency / Location</span>
            <span className="before:mr-2 before:inline-block before:h-2 before:w-2 before:rounded-full before:bg-[#3a3430]">Redacted</span>
          </div>
        </section>

        <section className="relative flex h-screen flex-col items-center justify-center px-5 py-16">
          <CornerMarks />
          <div className="font-terminal text-[8px] uppercase tracking-[0.5em] text-[#c0392b]">Declassified Record Archive</div>
          <h2 className="mb-7 mt-3 [font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-5xl uppercase tracking-[0.16em]">Case Documents</h2>
          <div className="grid w-full max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-3">
            {docs.map(([type, title, meta], index) => (
              <motion.div key={title} className="border border-[#c8b48c1a] bg-[#0d0d0d] transition hover:border-[#c8b48c33]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <DocumentPreview label={type} index={index} />
                <div className="p-3"><div className="font-terminal text-[7px] uppercase tracking-[0.22em] text-[#c0392b]">▹ {type}</div><div className="mt-1 text-sm font-semibold leading-tight">{title}</div><div className="mt-1 font-terminal text-[7px] uppercase tracking-[0.1em] text-[#5a524a]">{meta}</div></div>
              </motion.div>
            ))}
          </div>
          <p className="mt-5 font-terminal text-[8px] uppercase tracking-[0.22em] text-[#8a7e72]">All records sourced from <span className="text-[#d4a017]">justice.gov/epstein</span> · public domain · FOIA</p>
        </section>

        <section className="relative flex h-screen flex-col items-center justify-center px-5 py-16">
          <CornerMarks />
          <div className="font-terminal text-[8px] uppercase tracking-[0.5em] text-[#c0392b]">Case Chronology</div>
          <h2 className="mb-7 mt-3 [font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-5xl uppercase tracking-[0.16em]">Key Events</h2>
          <div className="relative w-full max-w-2xl">
            <div className="absolute bottom-1 left-[72px] top-1 w-px bg-gradient-to-b from-transparent via-[#c8b48c1f] to-transparent" />
            {timeline.map(([year, title, detail], index) => (
              <motion.div key={title} className="relative mb-5 flex items-start gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <div className="w-14 pt-0.5 text-right font-terminal text-[10px] text-[#d4a017]">{year}</div>
                <div className="relative z-10 mt-1 h-2 w-2 shrink-0 rounded-full border border-[#c0392b] bg-[#060606]" />
                <div><div className="text-sm font-semibold leading-tight">{title}</div><div className="mt-1 font-terminal text-[7px] uppercase leading-relaxed tracking-[0.12em] text-[#5a524a]">{detail}</div></div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative flex h-screen flex-col items-center justify-center px-5 py-16 text-center">
          <CornerMarks />
          <div className="font-terminal text-[8px] uppercase tracking-[0.5em] text-[#c0392b]">Intelligence Terminal</div>
          <div className="relative mt-7 w-full max-w-xl overflow-hidden border border-[#c8b48c1a] bg-[#0d0d0d] px-8 py-10">
            <div className="absolute left-[10%] right-[10%] top-0 h-px bg-gradient-to-r from-transparent via-[#c0392b] to-transparent" />
            <div className="absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-[#8a6610] to-transparent" />
            <h2 className="[font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-5xl uppercase leading-none tracking-[0.16em]">Enter The Archive</h2>
            <p className="mx-auto mt-4 max-w-md text-sm font-light leading-7 text-[#8a7e72]">Query 2,000+ declassified DOJ documents using natural language AI. Every answer is source-cited and linked to retrieved filings.</p>
            <button type="button" onClick={handleLaunchTerminal} className="mt-8 inline-flex bg-[#d4a017] px-10 py-3 [font-family:Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-xl uppercase tracking-[0.28em] text-[#060606] transition hover:bg-[#e8b825] hover:tracking-[0.34em]">Launch Terminal</button>
            <p className="mt-5 font-terminal text-[7px] uppercase tracking-[0.22em] text-[#c0392b]/70">Public record · FOIA released · justice.gov/epstein · H.R. 4405</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 font-terminal text-[8px] uppercase tracking-[0.2em] text-[#5a524a]">
            {['Pinecone', 'Claude', 'RAG', 'Justice.gov', '2,047 Docs'].map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>
      </div>
    </main>
  );
}
