import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import {
  ArrowLeft, ArrowRight, BookOpen, ChartNoAxesCombined, ChevronDown, ChevronRight,
  CircleHelp, CirclePlay, Clock3, Cloud, Crown, Flag, GraduationCap, Home,
  Lightbulb, Menu, RotateCcw, Search, ShieldCheck, Sparkles, Timer, X,
} from 'lucide-react';
import { chapters, OPTION_KEYS, TOTAL_QUESTIONS, type Chapter, type OptionKey } from './data/questions';
import { isHandled, usePractice, type PracticeSession } from './hooks/usePractice';
import MathVisual from './components/MathVisual';

type Page = 'beranda' | 'bab' | 'progres' | 'petunjuk' | 'persiapan' | 'latihan' | 'ringkasan' | 'selesai';
type Modal = { kind: 'exit' | 'restart'; chapterId: number } | null;
type Navigate = (path: string) => void;

const navItems = [
  { page: 'beranda', label: 'Beranda', icon: Home },
  { page: 'bab', label: 'Daftar Bab', icon: BookOpen },
  { page: 'progres', label: 'Progres Belajar', icon: ChartNoAxesCombined },
  { page: 'petunjuk', label: 'Petunjuk Belajar', icon: CircleHelp },
];

function readPath() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (/^(beranda|bab|progres|petunjuk)$/.test(raw) || /^(persiapan|latihan|ringkasan|selesai)\/[1-9]$/.test(raw)) return raw;
  return 'beranda';
}

function MathText({ children }: { children: string }) {
  return children.split(/(\b(?:cm|m)2\b)/g).map((part, index) => /^(cm|m)2$/.test(part)
    ? <span key={index}>{part.slice(0, -1)}<sup>2</sup></span>
    : part);
}

function CrownMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 40 38" fill="none" aria-hidden="true">
    <path d="m5 12 9 7L20 7l7 12 9-7-4 20H9L5 12Z" fill="#F7BF53" />
    <path d="M11 28h19" stroke="#E4A533" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="5" cy="10" r="2.5" fill="#F7BF53" /><circle cx="20" cy="5" r="2.5" fill="#F7BF53" /><circle cx="36" cy="10" r="2.5" fill="#F7BF53" />
  </svg>;
}

function ChapterSymbol({ chapter, large = false }: { chapter: Chapter; large?: boolean }) {
  return <span className={`chapter-symbol color-${chapter.color} ${large ? 'symbol-large' : ''}`} aria-hidden="true">
    {chapter.icon === 'numbers' ? <span className="number-symbol">1<span>2</span>3</span> :
      chapter.icon === 'million' ? <span className="million-symbol">10<sup>6</sup></span> :
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {chapter.icon === 'network' && <><rect x="13" y="4" width="10" height="8" rx="2" /><rect x="2" y="24" width="10" height="8" rx="2" /><rect x="24" y="24" width="10" height="8" rx="2" /><path d="M18 12v6M7 24v-6h22v6" /></>}
        {chapter.icon === 'fraction' && <><path d="M18 3a15 15 0 1 0 15 15H18Z" fill="currentColor" opacity=".15" /><path d="M18 3a15 15 0 1 0 15 15H18Z" /><path d="M22 3v11h11A14 14 0 0 0 22 3Z" fill="currentColor" opacity=".8" stroke="none" /><path d="M7 25 18 18" /></>}
        {chapter.icon === 'perimeter' && <><rect x="5" y="7" width="26" height="23" rx="2" strokeDasharray="4 4" /><path d="M11 25V13h14" /><path d="m21 9 4 4-4 4" /></>}
        {chapter.icon === 'area' && <><rect x="5" y="5" width="26" height="26" rx="3" fill="currentColor" opacity=".12" /><rect x="5" y="5" width="26" height="26" rx="3" /><path d="M14 5v26M23 5v26M5 14h26M5 23h26" opacity=".65" /></>}
        {chapter.icon === 'angle' && <><path d="M4 28a14 14 0 0 1 28 0H4Z" fill="currentColor" opacity=".1" /><path d="M4 28a14 14 0 0 1 28 0H4ZM18 28 28 10M18 15v3M8 19l2 2M28 19l-2 2" /><circle cx="18" cy="28" r="2" fill="currentColor" /></>}
        {chapter.icon === 'shapes' && <><path d="m12 4 10 16H2L12 4Z" fill="currentColor" opacity=".15" /><path d="m12 4 10 16H2L12 4Z" /><rect x="17" y="17" width="16" height="15" rx="2" /><path d="M7 25a7 7 0 0 0 7 7" /></>}
        {chapter.icon === 'chart' && <><path d="M5 4v27h28" /><rect x="10" y="19" width="5" height="8" rx="1" fill="currentColor" opacity=".4" stroke="none" /><rect x="18" y="11" width="5" height="16" rx="1" fill="currentColor" opacity=".65" stroke="none" /><rect x="26" y="5" width="5" height="22" rx="1" fill="currentColor" opacity=".9" stroke="none" /></>}
      </svg>}
  </span>;
}

function Sidebar({ page, navigate, mobileOpen, close }: { page: Page; navigate: Navigate; mobileOpen: boolean; close: () => void }) {
  const activePage = ['persiapan', 'latihan', 'ringkasan', 'selesai'].includes(page) ? 'bab' : page;
  return <>
    {mobileOpen && <button className="sidebar-backdrop" onClick={close} aria-label="Tutup menu" />}
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Menu utama">
      <button className="brand" onClick={() => navigate('beranda')} aria-label="Raja Jawab, beranda">
        <CrownMark className="brand-crown" /><span><span className="brand-name">raja jawab<span className="brand-dot">.</span></span><span className="brand-tagline">Belajar. Berani. Bisa.</span></span>
      </button>
      <button className="mobile-close icon-button" onClick={close} aria-label="Tutup menu"><X size={21} /></button>
      <div className="nav-label">RUANG BELAJARMU</div>
      <nav className="main-nav">{navItems.map(({ page: itemPage, label, icon: Icon }) =>
        <a href={`#${itemPage}`} key={itemPage} className={activePage === itemPage ? 'nav-link active' : 'nav-link'} aria-current={activePage === itemPage ? 'page' : undefined}
          onClick={event => { event.preventDefault(); navigate(itemPage); }}>
          <Icon size={19} strokeWidth={1.8} /><span>{label}</span>{activePage === itemPage && <i />}
        </a>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-doodle" aria-hidden="true"><svg viewBox="0 0 110 73" fill="none"><path d="M26 49c8-4 19-3 28 2V23c-9-5-20-6-28-2v28Zm28 2c9-5 20-6 28-2V21c-8-4-19-3-28 2v28Z" fill="#eaf0ff" stroke="#7291e6" strokeWidth="1.7" strokeLinejoin="round" /><path d="m31 28 15 3M31 35l15 3M62 31l13-3M62 38l13-3" stroke="#9cb0e7" strokeWidth="1.5" strokeLinecap="round" /><path d="m83 10 3 5 6-1-4 5 2 6-6-3-5 4 1-7-4-4 6-1 1-4Z" fill="#f8cb76" /><path d="m18 26-2 4m-1-8-4 1M91 43l5 2" stroke="#f0bd66" strokeWidth="2" strokeLinecap="round" /></svg></div>
        <p>Jago itu bukan bakat.<br /><strong>Jago itu karena latihan.</strong></p>
        <span className="sidebar-bottom-line" />
        <span className="sidebar-subject"><GraduationCap size={16} />Matematika Kelas V SD</span>
        <span className="sidebar-version">Ruang kecil untuk mimpi besar.</span>
      </div>
    </aside>
  </>;
}

function Header({ page, navigate, toggleMenu, storageError }: { page: Page; navigate: Navigate; toggleMenu: () => void; storageError: boolean }) {
  const label = navItems.find(item => item.page === page)?.label || (page === 'latihan' ? 'Ruang Latihan' : page === 'persiapan' ? 'Persiapan Latihan' : 'Latihanmu');
  return <header className="topbar">
    <button className="icon-button menu-toggle" onClick={toggleMenu} aria-label="Buka menu utama"><Menu size={23} /></button>
    <div className="breadcrumb"><Home size={16} /><ChevronRight size={12} /><span>{label}</span></div>
    <div className="topbar-right">
      <span className={`storage-status ${storageError ? 'storage-warning' : ''}`}><Cloud size={16} />{storageError ? 'Penyimpanan tidak tersedia' : 'Progres tersimpan otomatis'}</span>
      <button className="icon-button header-help" onClick={() => navigate('petunjuk')} aria-label="Bantuan dan petunjuk belajar"><CircleHelp size={20} /></button>
      <div className="profile"><span className="profile-avatar"><GraduationCap size={22} /></span><span>Halo, Pelajar!<small>Siap jadi lebih hebat?</small></span></div>
    </div>
  </header>;
}

function Hero({ navigate }: { navigate: Navigate }) {
  return <section className="hero" aria-labelledby="page-heading">
    <motion.div className="hero-art" initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: 'easeOut' }} role="img" aria-label="Maskot pensil Raja Jawab bermahkota di atas buku bersama busur derajat" />
    <div className="hero-content">
      <motion.div className="hero-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .5 }}><span />RUANG BELAJAR KELAS V SD</motion.div>
      <motion.h1 id="page-heading" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .6 }}>Berani mencoba?<br />Jadi <span>Raja Jawab.</span></motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3, duration: .6 }}>Belajar matematika jadi lebih seru,<br className="hero-break" /> satu soal, satu langkah lebih maju.</motion.p>
      <motion.div className="hero-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4, duration: .5 }}>
        <button className="button button-primary" onClick={() => document.getElementById('chapter-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Mulai Belajar<ArrowRight size={17} /></button>
        <button className="button button-hero-secondary" onClick={() => navigate('petunjuk')}><CirclePlay size={19} />Cara bermain</button>
      </motion.div>
    </div>
  </section>;
}

function ChapterList({ sessions, onChapter, navigate, standalone = false }: { sessions: Record<number, PracticeSession>; onChapter: (chapter: Chapter) => void; navigate: Navigate; standalone?: boolean }) {
  const [filter, setFilter] = useState('Semua Bab');
  const [query, setQuery] = useState('');
  const filters = ['Semua Bab', 'Belum Dimulai', 'Sedang Berjalan', 'Selesai'];
  const filtered = chapters.filter(chapter => {
    const session = sessions[chapter.id];
    const matchesFilter = filter === 'Semua Bab' || (filter === 'Belum Dimulai' && !session) || (filter === 'Sedang Berjalan' && session?.status === 'in-progress') || (filter === 'Selesai' && session?.status === 'completed');
    return matchesFilter && `${chapter.title} ${chapter.description} bab ${chapter.id}`.toLowerCase().includes(query.toLowerCase().trim());
  });
  return <section className={`chapter-section page-content ${standalone ? 'standalone-chapters' : ''}`} id="chapter-list">
    <div className="section-heading"><div>
      {standalone && <div className="eyebrow">PETUALANGAN MATEMATIKA</div>}
      {standalone ? <h1 id="page-heading">Mau belajar apa hari ini?</h1> : <h2>Pilih bab, mulai petualanganmu.</h2>}
      <p>9 bab seru dan {TOTAL_QUESTIONS} soal siap kamu jelajahi. Mulai dari yang kamu suka!</p>
    </div>{!standalone && <button className="text-link view-all" onClick={() => navigate('bab')}>Lihat semua bab<ArrowRight size={16} /></button>}</div>
    <div className="chapter-toolbar">
      <div className="chapter-tabs" role="tablist" aria-label="Filter status bab">{filters.map(item => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <label className="search-field"><Search size={17} /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari materi..." aria-label="Cari materi bab" /><kbd>/</kbd></label>
    </div>
    <div className="chapter-grid" role="tabpanel" aria-label={`${filter}, ${filtered.length} bab`}>
      {filtered.map((chapter, index) => {
        const session = sessions[chapter.id];
        const answered = session?.responses.filter(response => response.answer !== null).length || 0;
        return <motion.button key={chapter.id} className={`chapter-card ${session ? 'has-progress' : ''}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, delay: Math.min(index, 5) * .045 }} whileHover={{ y: -4 }} whileTap={{ scale: .99 }}
          onClick={() => onChapter(chapter)} aria-label={`${session?.status === 'completed' ? 'Lihat ringkasan' : session ? 'Lanjutkan Mengerjakan' : 'Mulai Mengerjakan'} Bab ${chapter.id}: ${chapter.title}`}>
          <span className="chapter-card-top"><ChapterSymbol chapter={chapter} /><span className="chapter-number">BAB {String(chapter.id).padStart(2, '0')}{session?.status === 'completed' && <span className="chapter-completed">Selesai</span>}</span></span>
          <h3>{chapter.title}</h3><p>{chapter.description}</p>
          {session && session.status !== 'completed' && <span className="card-progress"><i style={{ width: `${answered / 25 * 100}%` }} /></span>}
          <span className="chapter-card-bottom"><span><BookOpen size={13} />25 soal<span className="meta-dot">&#183;</span><Clock3 size={13} />60 detik/soal</span><span className="chapter-card-arrow"><ArrowRight size={17} /></span></span>
          {session?.status === 'in-progress' && <span className="card-resume-label">Lanjutkan latihan <span>{answered}/25 terisi</span></span>}
        </motion.button>;
      })}
    </div>
    {filtered.length === 0 && <div className="empty-state"><Search size={34} /><h3>{query ? 'Materinya belum ketemu.' : 'Belum ada bab di sini.'}</h3><p>{query ? 'Coba kata kunci yang lebih singkat, seperti "pecahan".' : 'Petualanganmu bisa dimulai dari bab mana saja.'}</p><button className="text-link" onClick={() => { setQuery(''); setFilter('Semua Bab'); }}>Tampilkan semua bab<ArrowRight size={16} /></button></div>}
    <div className="learning-note"><ShieldCheck size={20} /><p><strong>Di sini, yang penting berani mencoba.</strong><span>Tanpa nilai dan koreksi jawaban. Fokus pada proses belajarmu.</span></p><span className="note-decoration" aria-hidden="true"><Sparkles size={19} /></span></div>
  </section>;
}

const rules = [
  { icon: BookOpen, title: '25 soal, satu petualangan', text: 'Setiap bab berisi 25 soal pilihan ganda. Selesaikan semuanya untuk menuntaskan bab.' },
  { icon: Timer, title: 'Satu menit untuk setiap soal', text: 'Waktu dimulai saat soal dibuka. Jika habis, kamu akan berpindah otomatis ke soal berikutnya.' },
  { icon: Flag, title: 'Pilih jawaban versimu', text: 'Klik A, B, C, atau D. Kamu boleh mengganti pilihan selama waktu soal masih tersedia.' },
  { icon: RotateCcw, title: 'Bebas berpindah, waktu tetap tersimpan', text: 'Gunakan tombol navigasi atau peta soal. Kembali ke soal tidak akan mengulang waktu dari awal.' },
  { icon: ShieldCheck, title: 'Belajar tanpa tekanan nilai', text: 'Tidak ada nilai, koreksi, kunci jawaban, atau pembahasan. Semua pilihanmu disimpan sebagai respons latihan.' },
];

function Intro({ chapter, session, navigate }: { chapter: Chapter; session?: PracticeSession; navigate: Navigate }) {
  return <div className="intro-page page-content">
    <button className="back-link" onClick={() => navigate('bab')}><ArrowLeft size={16} />Kembali ke daftar bab</button>
    <div className="intro-heading"><ChapterSymbol chapter={chapter} large /><div><div className="eyebrow">BAB {String(chapter.id).padStart(2, '0')} <span>&#183;</span> KELAS V SD</div><h1 id="page-heading">{chapter.title}</h1><p>Siapkan rasa ingin tahumu. Kamu pasti bisa!</p></div></div>
    <div className="intro-columns"><section className="intro-rules"><h2>Sebelum mulai, kenali caranya.</h2>{rules.map(({ icon: Icon, title, text }) => <div className="rule-row" key={title}><span><Icon size={20} /></span><div><h3>{title}</h3><p>{text}</p></div></div>)}</section>
      <aside className="intro-topics"><span className="eyebrow">YANG AKAN KAMU JELAJAHI</span><ol>{chapter.topics.map((topic, index) => <li key={topic}><span>0{index + 1}</span>{topic}</li>)}</ol><div className="intro-reminder"><Lightbulb size={23} /><p>Tidak harus sempurna.<br /><strong>Mulai saja dulu.</strong></p></div></aside></div>
    <div className="intro-start"><span><Cloud size={16} />{session ? 'Progres sebelumnya siap dilanjutkan.' : 'Progres tersimpan di perangkat ini.'}</span><button className="button button-primary" onClick={() => navigate(`latihan/${chapter.id}`)}>{session ? 'Lanjutkan Latihan' : 'Saya Mengerti, Mulai'}<ArrowRight size={18} /></button></div>
  </div>;
}

function Quiz({ chapter, session, onQuestion, onAnswer, onSummary, onExit }: { chapter: Chapter; session: PracticeSession; onQuestion: (index: number) => void; onAnswer: (option: OptionKey) => void; onSummary: () => void; onExit: () => void }) {
  const index = session.currentIndex;
  const question = chapter.questions[index];
  const response = session.responses[index];
  const answered = session.responses.filter(item => item.answer !== null).length;
  const seconds = Math.ceil(response.remainingMs / 1000);
  const expired = response.remainingMs === 0;
  const next = () => index === 24 ? onSummary() : onQuestion(index + 1);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.matches('input, textarea, [contenteditable="true"]') || document.querySelector('[role="dialog"]') || event.ctrlKey || event.metaKey || event.altKey) return;
      const letter = event.key.toUpperCase() as OptionKey;
      if (OPTION_KEYS.includes(letter)) { event.preventDefault(); onAnswer(letter); }
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); onQuestion(index - 1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });
  return <div className="quiz-page page-content">
    <div className="quiz-page-heading"><div><div className="eyebrow">BAB {String(chapter.id).padStart(2, '0')} <span>&#183;</span> RUANG LATIHAN</div><h1 id="page-heading">{chapter.title}</h1><p>Satu soal setiap waktu. Lakukan yang terbaik versimu.</p></div><button className="button button-white exit-button" onClick={onExit}><Cloud size={16} />Simpan &amp; keluar</button></div>
    <div className="quiz-layout"><section className="question-panel" aria-label="Soal latihan">
      <div className="question-topline"><span>Soal <strong>{String(index + 1).padStart(2, '0')}</strong><span className="question-total"> / 25</span></span><div className={`time-display ${seconds <= 10 ? 'time-low' : ''}`} role="timer" aria-label={`Sisa waktu ${seconds} detik`}><Timer size={18} /><span>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</span></div></div>
      <div className="question-time-track"><motion.span animate={{ width: `${seconds / 60 * 100}%` }} transition={{ duration: .4 }} /></div>
      <motion.div key={question.id} className="question-content" initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .15 }}>
        <span className="question-type">PILIH SATU JAWABAN</span><h2><MathText>{question.question}</MathText></h2>
        {question.visual && <div className="question-visual"><MathVisual visual={question.visual} /></div>}
        <div className={`answer-grid ${Object.values(question.options).some(option => option.length > 44) ? 'long-answers' : ''}`} role="group" aria-label="Pilihan jawaban">
          {OPTION_KEYS.map(option => <motion.button key={option} className={`answer-option ${response.answer === option ? 'is-selected' : ''}`} disabled={expired} aria-pressed={response.answer === option} onClick={() => onAnswer(option)} whileTap={expired ? {} : { scale: .985 }}><span className="answer-letter">{option}</span><span><MathText>{question.options[option]}</MathText></span>{response.answer === option && <span className="selected-dot" aria-label="Dipilih" />}</motion.button>)}
        </div>
        <div className="answer-save-note" aria-live="polite">{expired ? <><Clock3 size={15} />Waktu soal ini sudah habis. Responsmu tetap tersimpan.</> : response.answer ? <><Cloud size={15} />Pilihan {response.answer} tersimpan. Kamu masih boleh menggantinya.</> : <><Cloud size={15} />Pilihanmu akan tersimpan otomatis.</>}</div>
      </motion.div>
      <div className="question-navigation"><button className="button button-white" disabled={index === 0} onClick={() => onQuestion(index - 1)}><ArrowLeft size={17} />Sebelumnya</button><button className="button button-primary" onClick={next}>{index === 24 ? 'Tinjau Latihan' : 'Selanjutnya'}<ArrowRight size={17} /></button></div>
    </section><aside className="quiz-sidebar"><section className="question-map"><div className="map-heading"><h2>Peta soal</h2><span>25 soal</span></div><p>Kamu boleh melompat ke soal lain.</p><div className="question-number-grid">{session.responses.map((item, itemIndex) => <button key={itemIndex} onClick={() => onQuestion(itemIndex)} className={`${item.answer ? 'is-answered' : ''} ${itemIndex === index ? 'is-current' : ''} ${item.remainingMs === 0 ? 'is-expired' : ''}`} aria-current={itemIndex === index ? 'step' : undefined} aria-label={`Buka soal ${itemIndex + 1}, ${item.answer ? 'sudah diisi' : 'belum diisi'}${item.remainingMs === 0 ? ', waktu habis' : ''}`} title={item.remainingMs === 0 ? 'Waktu habis' : item.answer ? 'Sudah diisi' : 'Belum diisi'}>{itemIndex + 1}{item.remainingMs === 0 && <i />}</button>)}</div>
      <div className="map-legend"><span><i className="legend-answered" />Terisi</span><span><i />Belum</span><span><i className="legend-current" />Aktif</span></div>
      <div className="map-progress"><div><span>Jawaban tersimpan</span><strong>{answered}<small>/25</small></strong></div><div className="progress-track"><motion.span animate={{ width: `${answered / 25 * 100}%` }} /></div><p>{Math.round(answered / 25 * 100)}% perjalananmu terisi</p></div>
      <button className="text-link map-review" onClick={onSummary}>Tinjau latihan<ArrowRight size={15} /></button></section>
      <div className="quiz-encouragement"><span><Lightbulb size={21} /></span><div><h3>Tenang, kamu bisa.</h3><p>Baca pelan-pelan dan pilih jawaban yang menurutmu paling tepat.</p></div></div>
      <p className="keyboard-note">Tips: gunakan tombol <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> <kbd>D</kbd> untuk memilih.</p>
    </aside></div>
  </div>;
}

function SessionSummary({ chapter, session, completed, navigate, onQuestion, onFinish, onRestart }: { chapter: Chapter; session: PracticeSession; completed: boolean; navigate: Navigate; onQuestion: (index: number) => void; onFinish: () => void; onRestart: () => void }) {
  const answered = session.responses.filter(response => response.answer !== null).length;
  const pending = session.responses.flatMap((response, index) => isHandled(response) ? [] : [index]);
  const ready = pending.length === 0;
  return <div className="summary-page page-content"><motion.div className={`summary-mark ${completed ? 'completed-mark' : ''}`} initial={{ rotate: -12, scale: .8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 12 }}>{completed ? <CrownMark /> : <Flag size={36} strokeWidth={1.7} />}</motion.div>
    <div className="eyebrow">{completed ? 'SATU LANGKAH LEBIH HEBAT' : 'LIHAT KEMBALI PERJALANANMU'}</div><h1 id="page-heading">{completed ? 'Latihan Selesai!' : 'Tinjau latihanmu.'}</h1><p className="summary-subtitle">{completed ? 'Terima kasih sudah berani mencoba hari ini.' : ready ? 'Semua soal sudah kamu lalui. Siap menuntaskan bab ini?' : 'Masih ada soal yang menunggu untuk kamu jelajahi.'}</p>
    <div className="summary-chapter"><ChapterSymbol chapter={chapter} /><span><small>BAB {String(chapter.id).padStart(2, '0')}</small><strong>{chapter.title}</strong></span></div>
    <div className="summary-stats"><div><strong>25</strong><span>Total soal</span></div><div><strong>{answered}</strong><span>Sudah dijawab</span></div><div><strong>{25 - answered}</strong><span>Belum dijawab</span></div></div>
    {!completed && !ready && <div className="pending-notice"><Lightbulb size={21} /><div><h3>{pending.length} soal belum dituntaskan</h3><p>Pilih jawaban atau gunakan waktu yang tersedia pada semua soal agar bab dapat diselesaikan.</p><div className="pending-questions">{pending.map(index => <button key={index} onClick={() => onQuestion(index)} aria-label={`Lanjutkan soal ${index + 1}`}>{index + 1}</button>)}</div></div></div>}
    <p className="summary-privacy"><ShieldCheck size={17} />Ini bukan tentang nilai. Ini tentang keberanianmu untuk belajar.</p>
    <div className="summary-actions">{completed ? <><button className="button button-primary" onClick={() => navigate('bab')}>Kembali ke Daftar Bab<ArrowRight size={17} /></button><button className="button button-white" onClick={onRestart}><RotateCcw size={17} />Ulangi Latihan</button></> : <><button className="button button-primary" onClick={ready ? onFinish : () => onQuestion(pending[0])}>{ready ? 'Selesaikan Latihan' : 'Lanjutkan Mengerjakan'}{ready ? <Flag size={17} /> : <ArrowRight size={17} />}</button><button className="button button-white" onClick={() => onQuestion(session.currentIndex)}><ArrowLeft size={17} />Kembali ke Soal</button></>}</div>
    {!completed && <button className="text-link summary-exit" onClick={() => navigate('bab')}><Cloud size={15} />Simpan dan lanjutkan nanti</button>}
  </div>;
}

function ProgressPage({ sessions, onChapter }: { sessions: Record<number, PracticeSession>; onChapter: (chapter: Chapter) => void }) {
  const completed = Object.values(sessions).filter(session => session.status === 'completed').length;
  const totalAnswered = Object.values(sessions).reduce((sum, session) => sum + session.responses.filter(response => response.answer !== null).length, 0);
  return <div className="progress-page page-content"><div className="eyebrow">PERJALANAN BELAJARMU</div><h1 id="page-heading">Setiap langkahmu berarti.</h1><p className="page-description">Tidak perlu membandingkan diri. Lihat sejauh mana kamu sudah mencoba.</p>
    <div className="overall-progress"><div><span><Crown size={21} />{completed} dari 9 bab selesai</span><strong>{totalAnswered}<small> / {TOTAL_QUESTIONS} jawaban tersimpan</small></strong></div><div className="progress-track"><motion.span initial={{ width: 0 }} animate={{ width: `${completed / 9 * 100}%` }} transition={{ duration: .8 }} /></div></div>
    <div className="progress-list">{chapters.map(chapter => {
      const session = sessions[chapter.id];
      const count = session?.responses.filter(response => response.answer !== null).length || 0;
      return <button className="progress-row" onClick={() => onChapter(chapter)} key={chapter.id}><ChapterSymbol chapter={chapter} /><span className="progress-row-title"><small>BAB {String(chapter.id).padStart(2, '0')}</small><strong>{chapter.title}</strong></span><span className="progress-row-status"><span>{session?.status === 'completed' ? 'Bab selesai' : session ? `${count} dari 25 soal terisi` : 'Belum dimulai'}</span><span className="progress-track"><i style={{ width: `${session?.status === 'completed' ? 100 : count / 25 * 100}%` }} /></span></span><span className="progress-row-action">{session?.status === 'completed' ? 'Lihat ringkasan' : session ? 'Lanjutkan' : 'Mulai belajar'}<ArrowRight size={17} /></span></button>;
    })}</div><p className="progress-device-note"><Cloud size={17} />Progres tersimpan di browser dan perangkat ini, tanpa akun. Menghapus data browser juga akan menghapus progresmu.</p>
  </div>;
}

const faqs = [
  ['Apakah jawabanku akan dinilai?', 'Tidak. Raja Jawab hanya menyimpan pilihanmu sebagai respons latihan. Tidak ada skor, penanda benar atau salah, kunci jawaban, maupun pembahasan.'],
  ['Apa yang terjadi kalau waktunya habis?', 'Jawaban terakhir tetap tersimpan, atau dibiarkan kosong jika belum dipilih. Sistem lalu membuka soal berikutnya. Soal yang waktunya habis dapat dilihat kembali, tetapi jawabannya tidak bisa diubah.'],
  ['Bisakah aku berhenti dan melanjutkan nanti?', 'Bisa. Pilih "Simpan & keluar". Semua pilihan dan sisa waktu tiap soal tersimpan di perangkat ini. Saat kembali, pilih bab yang sama lalu "Lanjutkan Latihan". Waktu juga dijeda saat tab tidak terlihat.'],
  ['Kapan sebuah bab dianggap selesai?', 'Semua 25 soal harus sudah dikerjakan: pilih jawaban atau tunggu sampai waktu soal habis. Setelah itu, buka tinjauan dan tekan "Selesaikan Latihan". Hanya mengunjungi soal tanpa menjawab belum menuntaskan soal tersebut.'],
  ['Dari mana materi latihan ini?', 'Materi mengikuti sembilan topik yang diberikan untuk Matematika SD/MI Kelas V, terbitan Kementerian Pendidikan tahun 2022. Seluruh soal di sini disusun mandiri sebagai latihan pendamping, bukan salinan soal dari buku.'],
];

function HelpPage({ navigate }: { navigate: Navigate }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return <div className="help-page page-content"><div className="eyebrow">KENALAN DULU, YUK</div><h1 id="page-heading">Belajar nyaman, makin percaya diri.</h1><p className="page-description">Di Raja Jawab, kamu punya ruang untuk mencoba. Begini cara memulainya.</p><div className="help-rules">{rules.map(({ icon: Icon, title, text }, index) => <div className="help-rule" key={title}><span className="help-rule-number">0{index + 1}</span><Icon size={23} strokeWidth={1.6} /><div><h2>{title}</h2><p>{text}</p></div></div>)}</div><section className="faq-section"><h2>Mungkin kamu ingin tahu.</h2>{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button aria-expanded={openFaq === index} aria-controls={`faq-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<ChevronDown size={19} /></button><AnimatePresence initial={false}>{openFaq === index && <motion.div id={`faq-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .2 }}><p>{answer}</p></motion.div>}</AnimatePresence></div>)}</section><div className="help-cta"><span>Sudah siap untuk langkah pertamamu?</span><button className="button button-primary" onClick={() => navigate('bab')}>Yuk, Mulai Belajar<ArrowRight size={17} /></button></div></div>;
}

function Dialog({ title, children, onCancel, onConfirm, confirmLabel }: { title: string; children: ReactNode; onCancel: () => void; onConfirm: () => void; confirmLabel: string }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    cancelRef.current?.focus();
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCancel(); }
      if (event.key !== 'Tab') return;
      const elements = dialogRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keyHandler);
    return () => { document.removeEventListener('keydown', keyHandler); previous?.focus(); };
  }, [onCancel]);
  return <motion.div className="dialog-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}><motion.div ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-heading" aria-describedby="dialog-description" initial={{ y: 18, scale: .97 }} animate={{ y: 0, scale: 1 }} onClick={event => event.stopPropagation()}><span className="dialog-icon"><Cloud size={28} /></span><h2 id="dialog-heading">{title}</h2><div id="dialog-description">{children}</div><div className="dialog-actions"><button ref={cancelRef} className="button button-white" onClick={onCancel}>Kembali</button><button className="button button-primary" onClick={onConfirm}>{confirmLabel}<ArrowRight size={16} /></button></div></motion.div></motion.div>;
}

function Footer() {
  return <footer className="footer"><span><CrownMark />raja jawab<span className="footer-dot">.</span><span className="footer-message">Langkah kecil, mimpi besar.</span></span><span>Dibuat untuk pelajar hebat Indonesia.</span></footer>;
}

export default function App() {
  const [path, setPath] = useState(readPath);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [timeoutChapter, setTimeoutChapter] = useState<number | null>(null);
  const practice = usePractice(setTimeoutChapter);
  const [pageString, chapterString] = path.split('/');
  const page = pageString as Page;
  const chapterId = Number(chapterString) || 1;
  const chapter = chapters[chapterId - 1];
  const session = practice.sessions[chapterId];

  const navigate = useCallback((next: string) => {
    practice.pause();
    setMobileOpen(false);
    setPath(next);
    if (window.location.hash !== `#${next}`) window.location.hash = next;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [practice.pause]);

  useEffect(() => {
    const hashChange = () => { setPath(readPath()); setMobileOpen(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', hashChange);
    return () => window.removeEventListener('hashchange', hashChange);
  }, []);

  useEffect(() => {
    if (page === 'latihan' && !modal && !mobileOpen && !document.hidden) {
      if (practice.sessions[chapterId]?.status === 'completed') navigate(`selesai/${chapterId}`);
      else practice.begin(chapterId);
    } else practice.pause();
    document.title = `${page === 'beranda' ? 'Berani Mencoba, Makin Bisa' : page === 'latihan' ? chapter.title : navItems.find(item => item.page === page)?.label || chapter.shortTitle} | Raja Jawab`;
  }, [path, modal, mobileOpen, practice.begin, practice.pause]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) practice.pause();
      else if (page === 'latihan' && !modal && !mobileOpen) practice.begin(chapterId);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [page, chapterId, modal, mobileOpen, practice.pause, practice.begin]);

  useEffect(() => {
    if (!mobileOpen && !modal) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeMenu = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', closeMenu);
    return () => { document.body.style.overflow = oldOverflow; window.removeEventListener('keydown', closeMenu); };
  }, [mobileOpen, modal]);

  useEffect(() => {
    if (timeoutChapter !== null) { navigate(`ringkasan/${timeoutChapter}`); setTimeoutChapter(null); }
  }, [timeoutChapter, navigate]);

  useEffect(() => {
    const handleSearch = (event: KeyboardEvent) => {
      if (event.key === '/' && !(event.target as HTMLElement)?.matches('input, textarea')) {
        const input = document.querySelector<HTMLInputElement>('.search-field input');
        if (input) { event.preventDefault(); input.focus(); }
      }
    };
    window.addEventListener('keydown', handleSearch);
    return () => window.removeEventListener('keydown', handleSearch);
  }, []);

  const selectChapter = (selected: Chapter) => navigate(practice.sessions[selected.id]?.status === 'completed' ? `selesai/${selected.id}` : `persiapan/${selected.id}`);
  const openQuestion = (index: number) => {
    if (page !== 'latihan') navigate(`latihan/${chapterId}`);
    practice.openQuestion(chapterId, index);
  };
  const cancelModal = useCallback(() => {
    setModal(null);
    if (page === 'latihan') practice.begin(chapterId);
  }, [page, chapterId, practice.begin]);
  const confirmModal = () => {
    if (!modal) return;
    if (modal.kind === 'restart') { practice.begin(modal.chapterId, true); navigate(`latihan/${modal.chapterId}`); }
    else navigate('bab');
    setModal(null);
  };

  let content: ReactNode;
  if (page === 'beranda') content = <><Hero navigate={navigate} /><ChapterList sessions={practice.sessions} onChapter={selectChapter} navigate={navigate} /></>;
  else if (page === 'bab') content = <ChapterList sessions={practice.sessions} onChapter={selectChapter} navigate={navigate} standalone />;
  else if (page === 'progres') content = <ProgressPage sessions={practice.sessions} onChapter={selectChapter} />;
  else if (page === 'petunjuk') content = <HelpPage navigate={navigate} />;
  else if (page === 'latihan' && session) content = <Quiz chapter={chapter} session={session} onQuestion={openQuestion} onAnswer={option => practice.chooseAnswer(chapterId, option)} onSummary={() => navigate(`ringkasan/${chapterId}`)} onExit={() => { practice.pause(); setModal({ kind: 'exit', chapterId }); }} />;
  else if ((page === 'ringkasan' || page === 'selesai') && session) content = <SessionSummary chapter={chapter} session={session} completed={session.status === 'completed'} navigate={navigate} onQuestion={openQuestion} onFinish={() => { if (practice.finish(chapterId)) navigate(`selesai/${chapterId}`); }} onRestart={() => setModal({ kind: 'restart', chapterId })} />;
  else content = <Intro chapter={chapter} session={session} navigate={navigate} />;

  return <MotionConfig reducedMotion="user"><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Langsung ke konten</a><div className="app-shell"><Sidebar page={page} navigate={navigate} mobileOpen={mobileOpen} close={() => setMobileOpen(false)} /><div className="main-shell"><Header page={page} navigate={navigate} toggleMenu={() => setMobileOpen(!mobileOpen)} storageError={practice.storageError} /><main className="main-content" id="main-content" tabIndex={-1}>
    {practice.storageError && <div className="storage-error" role="alert">Penyimpanan browser tidak tersedia. Progres masih bisa digunakan selama halaman ini terbuka, tetapi belum aman untuk dimuat ulang.</div>}
    <motion.div key={path} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>{content}</motion.div>
  </main><Footer /></div></div><AnimatePresence>{modal && <Dialog title={modal.kind === 'exit' ? 'Istirahat sebentar?' : 'Mulai petualangan dari awal?'} onCancel={cancelModal} onConfirm={confirmModal} confirmLabel={modal.kind === 'exit' ? 'Simpan & keluar' : 'Ya, Ulangi Latihan'}>{modal.kind === 'exit' ? <p>Jawaban dan sisa waktumu sudah disimpan. Kamu bisa kembali dan melanjutkan kapan saja di perangkat ini.</p> : <p>Jawaban dan progres bab ini akan diganti dengan sesi baru. Bab lain tidak akan berubah.</p>}</Dialog>}</AnimatePresence></MotionConfig>;
}