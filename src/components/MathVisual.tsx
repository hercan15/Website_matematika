import { BookOpen } from 'lucide-react';
import type { Visual } from '../data/questions';

function ShapeVisual({ visual }: { visual: Extract<Visual, { kind: 'shape' }> }) {
  const { shape, labels = [] } = visual;
  const paths: Record<typeof shape, string> = {
    square: 'M90 28 H210 V148 H90 Z',
    rectangle: 'M55 40 H245 V140 H55 Z',
    triangle: 'M60 145 L130 25 L245 145 Z',
    parallelogram: 'M95 40 H255 L210 145 H50 Z',
    trapezoid: 'M105 35 H195 L250 145 H50 Z',
    rhombus: 'M150 18 L245 88 L150 158 L55 88 Z',
    kite: 'M150 18 L215 70 L150 160 L85 70 Z',
    pentagon: 'M150 20 L220 72 L195 150 H105 L80 72 Z',
    combined: 'M55 30 H185 V75 H245 V150 H55 Z',
  };
  const isTriangleHeight = shape === 'triangle' && labels[1]?.startsWith('tinggi');
  const isParallelHeight = shape === 'parallelogram' && labels[1]?.startsWith('tinggi');
  return (
    <svg viewBox="0 0 320 205" className="shape-visual" role="img" aria-label={`Gambar ${shape}: ${labels.join(', ')}`}>
      <defs><pattern id="math-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#eaf0fa" strokeWidth="1" /></pattern></defs>
      <rect width="320" height="190" fill="url(#math-grid)" rx="10" />
      <path d={paths[shape]} fill="#edf2ff" stroke="#5073de" strokeWidth="2.5" strokeLinejoin="round" />
      {isTriangleHeight && <path d="M130 25V145 M130 135H140V145" fill="none" stroke="#f0ac42" strokeWidth="2" strokeDasharray="5 4" />}
      {isParallelHeight && <path d="M95 40V145 M95 135H105V145" fill="none" stroke="#f0ac42" strokeWidth="2" strokeDasharray="5 4" />}
      {shape === 'trapezoid' && labels.length > 0 ? <>
        <text x="150" y="23" textAnchor="middle">{labels[0]}</text>
        <text x="150" y="169" textAnchor="middle">{labels[1]}</text>
        <path d="M105 35V145" stroke="#f0ac42" strokeWidth="2" strokeDasharray="5 4" />
        <text x="100" y="96" textAnchor="end">{labels[2]}</text>
      </> : shape === 'combined' ? <>
        <text x="150" y="177" textAnchor="middle">{labels[0]}</text>
        <text x="45" y="94" textAnchor="end">{labels[1]}</text>
        <text x="218" y="63" textAnchor="middle">{labels[2]}</text>
        <text x="176" y="55" textAnchor="end">{labels[3]}</text>
      </> : <>
        {labels[0] && <text x="150" y="180" textAnchor="middle">{labels[0]}</text>}
        {labels[1] && <text x={isTriangleHeight || isParallelHeight ? 122 : 270} y="95" textAnchor={isTriangleHeight || isParallelHeight ? 'end' : 'middle'}>{labels[1]}</text>}
        {labels[2] && <text x="83" y="85" textAnchor="end">{labels[2]}</text>}
      </>}
      <text x="160" y="202" textAnchor="middle" className="visual-caption">Gambar tidak selalu sesuai skala</text>
    </svg>
  );
}

export default function MathVisual({ visual }: { visual: Visual }) {
  if (visual.kind === 'shape') return <ShapeVisual visual={visual} />;
  if (visual.kind === 'fraction') return (
    <div className="fraction-visual" role="img" aria-label={`${visual.filled} dari ${visual.total} bagian sama besar diwarnai`}>
      {Array.from({ length: visual.total }, (_, index) => <span key={index} className={index < visual.filled ? 'filled' : ''} />)}
    </div>
  );
  if (visual.kind === 'angle') {
    const x = 90 + 120 * Math.cos(visual.degrees * Math.PI / 180);
    const y = 145 - 120 * Math.sin(visual.degrees * Math.PI / 180);
    const arcX = 90 + 35 * Math.cos(visual.degrees * Math.PI / 180);
    const arcY = 145 - 35 * Math.sin(visual.degrees * Math.PI / 180);
    return <svg viewBox="0 0 300 185" className="angle-visual" role="img" aria-label={`Ilustrasi sudut ${visual.degrees} derajat`}>
      <path d={`M125 145 A35 35 0 ${visual.degrees > 180 ? 1 : 0} 0 ${arcX} ${arcY} L90 145Z`} fill="#ffedc7" />
      <path d={`M230 145H90L${x} ${y}`} stroke="#5073de" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="90" cy="145" r="4" fill="#345dd3" />
      <text x="80" y="166">O</text><text x="235" y="151">A</text><text x={x - 6} y={y - 10}>B</text>
    </svg>;
  }
  if (visual.kind === 'table') return <div className="table-visual"><table><thead><tr>{visual.headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{visual.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
  if (visual.kind === 'pictogram') return <div className="pictogram-visual">
    {visual.labels.map((label, index) => <div className="pictogram-row" key={label}><strong>{label}</strong><span>{Array.from({ length: visual.values[index] }, (_, item) => <BookOpen key={item} size={22} aria-hidden="true" />)}</span></div>)}
    <p><BookOpen size={17} /> = {visual.unit} buku</p>
  </div>;
  const max = Math.max(...visual.values, ...(visual.secondary || []));
  const upper = Math.ceil(max / 5) * 5;
  const step = upper > 20 ? 10 : upper > 10 ? 5 : 2;
  const grid = Array.from({ length: Math.floor(upper / step) + 1 }, (_, index) => index * step);
  return <figure className={`bars-visual ${visual.horizontal ? 'horizontal-chart' : ''}`}>
    <figcaption>{visual.title}</figcaption>
    {visual.legends && <div className="chart-legend">{visual.legends.map((legend, index) => <span key={legend}><i className={index === 1 ? 'secondary' : ''} />{legend}</span>)}</div>}
    {visual.horizontal ? <div className="horizontal-bars">
      {visual.labels.map((label, index) => <div key={label}><span>{label}</span><div className="horizontal-track"><i style={{ width: `${visual.values[index] / upper * 100}%` }} /><b>{visual.values[index]}</b></div></div>)}
    </div> : <svg viewBox="0 0 380 205" role="img" aria-label={`${visual.title}. ${visual.labels.map((label, index) => `${label}: ${visual.values[index]}${visual.secondary ? ` dan ${visual.secondary[index]}` : ''}`).join('; ')}`}>
      {grid.map(value => <g key={value}><line x1="35" x2="365" y1={165 - value / upper * 135} y2={165 - value / upper * 135} stroke="#e8edf6" /><text x="25" y={169 - value / upper * 135} textAnchor="end">{value}</text></g>)}
      {visual.labels.map((label, index) => {
        const center = 35 + (index + 0.5) * 330 / visual.labels.length;
        const width = visual.secondary ? 25 : 38;
        const height = visual.values[index] / upper * 135;
        const otherHeight = (visual.secondary?.[index] || 0) / upper * 135;
        return <g key={label}>
          <rect x={center - (visual.secondary ? 27 : 19)} y={165 - height} width={width} height={height} rx="3" fill="#6385e9" />
          {visual.secondary && <rect x={center + 3} y={165 - otherHeight} width={width} height={otherHeight} rx="3" fill="#f5bf61" />}
          <text x={center} y="185" textAnchor="middle">{label}</text>
        </g>;
      })}
    </svg>}
  </figure>;
}