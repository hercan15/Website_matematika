import { expect, test, type Page } from '@playwright/test';
import { chapters, TOTAL_QUESTIONS } from '../src/data/questions';

const KEY = 'raja-jawab:progress:v1';

async function start(page: Page, chapter = 1) {
  await page.goto(`/#persiapan/${chapter}`);
  await page.getByRole('button', { name: 'Saya Mengerti, Mulai' }).click();
  await expect(page.locator('.question-content h2')).toHaveText(chapters[chapter - 1].questions[0].question);
}

async function readStore(page: Page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), KEY);
}

test('bank contains all 225 original questions, four distinct options, and 8/10/7 difficulty levels', () => {
  expect(chapters).toHaveLength(9);
  expect(TOTAL_QUESTIONS).toBe(225);
  const ids: string[] = [];
  for (const chapter of chapters) {
    expect(chapter.questions).toHaveLength(25);
    expect(new Set(chapter.questions.map(question => question.question)).size).toBe(25);
    expect(chapter.questions.filter(question => question.difficulty === 'Mudah')).toHaveLength(8);
    expect(chapter.questions.filter(question => question.difficulty === 'Sedang')).toHaveLength(10);
    expect(chapter.questions.filter(question => question.difficulty === 'Menantang')).toHaveLength(7);
    for (const question of chapter.questions) {
      ids.push(question.id);
      expect(question.chapter).toBe(chapter.id);
      expect(question.duration).toBe(60);
      expect(Object.keys(question.options)).toEqual(['A', 'B', 'C', 'D']);
      expect(new Set(Object.values(question.options)).size).toBe(4);
      expect(Object.values(question.options).every(option => option.length > 0)).toBe(true);
      expect(Object.keys(question).some(key => /correct|solution|answer|explanation|score/i.test(key))).toBe(false);
    }
  }
  expect(new Set(ids).size).toBe(225);
});

test('all 225 questions are reachable and answerable, and each of the nine chapters can finish', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const chapter of chapters) {
    await start(page, chapter.id);
    for (let index = 0; index < 25; index++) {
      if (index > 0) await page.getByRole('button', { name: `Buka soal ${index + 1}, belum diisi`, exact: true }).click();
      await expect(page.locator('.question-content h2')).toHaveText(chapter.questions[index].question);
      await expect(page.locator('.answer-option')).toHaveCount(4);
      await page.locator('.answer-option').first().click();
      await expect(page.locator('.answer-option').first()).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: 'Tinjau Latihan', exact: true }).first().click();
    await page.getByRole('button', { name: 'Selesaikan Latihan', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Latihan Selesai!' })).toBeVisible();
    const store = await readStore(page);
    expect(store.sessions[chapter.id].status).toBe('completed');
    expect(store.sessions[chapter.id].responses.filter((response: { answer: string | null }) => response.answer !== null)).toHaveLength(25);
    expect(store.activeClock).toBeNull();
    await expect(page.locator('.summary-stats > div').nth(2).locator('strong')).toHaveText('0');
  }
  expect(errors).toEqual([]);
});

test('answer changes, independent timers, reload persistence, timeout, and exit pause work', async ({ page }) => {
  await page.clock.install();
  await start(page);
  await page.locator('.answer-option').nth(0).click();
  await page.locator('.answer-option').nth(3).click();
  await expect(page.locator('.answer-option').nth(3)).toHaveAttribute('aria-pressed', 'true');
  await page.clock.fastForward(11_000);
  let store = await readStore(page);
  expect(store.sessions[1].responses[0].remainingMs).toBeLessThan(50_000);
  expect(store.sessions[1].responses[0].answer).toBe('D');
  await page.getByRole('button', { name: 'Selanjutnya', exact: true }).click();
  await expect(page.locator('.question-content h2')).toHaveText(chapters[0].questions[1].question);
  await page.clock.fastForward(6_000);
  store = await readStore(page);
  const secondRemaining = store.sessions[1].responses[1].remainingMs;
  const firstRemaining = store.sessions[1].responses[0].remainingMs;
  expect(secondRemaining).toBeLessThan(55_000);
  await page.getByRole('button', { name: 'Sebelumnya', exact: true }).click();
  await expect(page.locator('.answer-option').nth(3)).toHaveAttribute('aria-pressed', 'true');
  store = await readStore(page);
  expect(store.sessions[1].responses[0].remainingMs).toBeLessThanOrEqual(firstRemaining);
  expect(store.sessions[1].responses[0].remainingMs).toBeGreaterThan(firstRemaining - 2000);
  await page.reload();
  await expect(page.locator('.answer-option').nth(3)).toHaveAttribute('aria-pressed', 'true');
  store = await readStore(page);
  expect(store.sessions[1].responses[0].remainingMs).toBeLessThan(50_000);
  await page.clock.fastForward(51_000);
  await expect(page.locator('.question-content h2')).toHaveText(chapters[0].questions[1].question);
  store = await readStore(page);
  expect(store.sessions[1].responses[0].remainingMs).toBe(0);
  expect(store.sessions[1].responses[1].remainingMs).toBeLessThanOrEqual(secondRemaining);
  expect(store.sessions[1].responses[1].remainingMs).toBeGreaterThan(secondRemaining - 3000);
  await page.getByRole('button', { name: 'Buka soal 1, sudah diisi, waktu habis', exact: true }).click();
  await expect(page.getByRole('timer')).toHaveText('00:00');
  for (const option of await page.locator('.answer-option').all()) await expect(option).toBeDisabled();
  await page.getByRole('button', { name: 'Selanjutnya', exact: true }).click();
  await page.getByRole('button', { name: 'Simpan & keluar', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  store = await readStore(page);
  const paused = store.sessions[1].responses[1].remainingMs;
  expect(store.activeClock).toBeNull();
  await page.clock.fastForward(20_000);
  store = await readStore(page);
  expect(store.sessions[1].responses[1].remainingMs).toBe(paused);
  await page.getByRole('dialog').getByRole('button', { name: 'Simpan & keluar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mau belajar apa hari ini?' })).toBeVisible();
  await page.clock.fastForward(20_000);
  store = await readStore(page);
  expect(store.sessions[1].responses[1].remainingMs).toBe(paused);
  await page.locator('.chapter-card').first().click();
  await page.getByRole('button', { name: 'Lanjutkan Latihan', exact: true }).click();
  await expect(page.locator('.question-content h2')).toHaveText(chapters[0].questions[1].question);
  store = await readStore(page);
  expect(store.activeClock.chapterId).toBe(1);
  expect(store.sessions[1].responses[1].remainingMs).toBeLessThanOrEqual(paused);
  expect(store.sessions[1].responses[1].remainingMs).toBeGreaterThan(paused - 2000);
});

test('skipping directly to question 25 cannot mark an incomplete chapter as finished', async ({ page }) => {
  await start(page, 2);
  await page.getByRole('button', { name: 'Buka soal 25, belum diisi', exact: true }).click();
  await page.locator('.answer-option').nth(1).click();
  await page.getByRole('button', { name: 'Tinjau Latihan', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: '24 soal belum dituntaskan' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Selesaikan Latihan', exact: true })).toHaveCount(0);
  expect((await readStore(page)).sessions[2].status).toBe('in-progress');
  await page.getByRole('button', { name: 'Lanjutkan Mengerjakan', exact: true }).click();
  await expect(page.locator('.question-content h2')).toHaveText(chapters[1].questions[0].question);
});

test('last timeout opens review, counts unanswered without a score, and restart only resets that chapter', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.evaluate(key => {
    const responses = Array.from({ length: 25 }, (_, index) => ({ answer: index === 24 ? null : 'B', remainingMs: index === 24 ? 1500 : 30000, visited: true }));
    localStorage.setItem(key, JSON.stringify({ version: 1, activeClock: null, sessions: {
      3: { chapterId: 3, currentIndex: 24, responses, status: 'in-progress', startedAt: Date.now(), updatedAt: Date.now() },
      4: { chapterId: 4, currentIndex: 0, responses: Array.from({length: 25}, () => ({answer: 'A', remainingMs: 45000, visited: true})), status: 'in-progress', startedAt: Date.now(), updatedAt: Date.now() },
    }}));
  }, KEY);
  await page.reload();
  await page.goto('/#latihan/3');
  await expect(page.locator('.question-content h2')).toHaveText(chapters[2].questions[24].question);
  await page.clock.fastForward(2000);
  await expect(page.getByRole('heading', { name: 'Tinjau latihanmu.' })).toBeVisible();
  await expect(page.locator('.summary-stats > div').nth(1).locator('strong')).toHaveText('24');
  await expect(page.locator('.summary-stats > div').nth(2).locator('strong')).toHaveText('1');
  await page.getByRole('button', { name: 'Selesaikan Latihan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Latihan Selesai!' })).toBeVisible();
  await expect(page.locator('.main-content')).not.toContainText(/skor|jawaban benar|jawaban salah|kunci jawaban/i);
  await page.getByRole('button', { name: 'Ulangi Latihan', exact: true }).click();
  await page.getByRole('button', { name: 'Ya, Ulangi Latihan', exact: true }).click();
  await expect(page.locator('.question-content h2')).toHaveText(chapters[2].questions[0].question);
  const store = await readStore(page);
  expect(store.sessions[3].responses.filter((response: { answer: string | null }) => response.answer !== null)).toHaveLength(0);
  expect(store.sessions[3].responses[0].remainingMs).toBeGreaterThan(58000);
  expect(store.sessions[4].responses[0].answer).toBe('A');
});

test('chapter search, filters, help accordion, mobile navigation and responsive quiz work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.chapter-card')).toHaveCount(9);
  await page.getByRole('searchbox', { name: 'Cari materi bab' }).fill('pecahan');
  await expect(page.locator('.chapter-card')).toHaveCount(1);
  await expect(page.locator('.chapter-card h3')).toHaveText('Bilangan Pecahan');
  await page.getByRole('searchbox', { name: 'Cari materi bab' }).fill('zzzz');
  await expect(page.getByRole('heading', { name: 'Materinya belum ketemu.' })).toBeVisible();
  await page.getByRole('button', { name: 'Tampilkan semua bab' }).click();
  await expect(page.locator('.chapter-card')).toHaveCount(9);
  await page.getByRole('tab', { name: 'Selesai', exact: true }).click();
  await expect(page.locator('.chapter-card')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Buka menu utama' }).click();
  await page.getByRole('link', { name: 'Petunjuk Belajar' }).click();
  await expect(page.getByRole('heading', { name: 'Belajar nyaman, makin percaya diri.' })).toBeVisible();
  await page.getByRole('button', { name: 'Apa yang terjadi kalau waktunya habis?' }).click();
  await expect(page.getByRole('button', { name: 'Apa yang terjadi kalau waktunya habis?' })).toHaveAttribute('aria-expanded', 'true');
  await start(page, 8);
  await page.getByRole('button', { name: 'Buka soal 18, belum diisi', exact: true }).click();
  await expect(page.locator('.bars-visual')).toBeVisible();
  await page.locator('.answer-option').nth(2).click();
  await expect(page.locator('.answer-option').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: 'artifacts/quiz-mobile.png', fullPage: true });
  for (const width of [320, 390, 540, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth }));
    expect(sizes.scroll, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(sizes.inner);
  }
});

test('keyboard shortcuts work after clicking, and opening the mobile menu pauses the clock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.install();
  await start(page, 6);
  await page.locator('.answer-option').first().click();
  await page.keyboard.press('d');
  await expect(page.locator('.answer-option').nth(3)).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.question-content h2')).toHaveText(chapters[5].questions[1].question);
  await page.getByRole('button', { name: 'Buka menu utama' }).click();
  let store = await readStore(page);
  expect(store.activeClock).toBeNull();
  const remaining = store.sessions[6].responses[1].remainingMs;
  await page.clock.fastForward(10_000);
  expect((await readStore(page)).sessions[6].responses[1].remainingMs).toBe(remaining);
  await page.keyboard.press('Escape');
  store = await readStore(page);
  expect(store.activeClock.chapterId).toBe(6);
  await page.clock.fastForward(5000);
  store = await readStore(page);
  expect(store.sessions[6].responses[1].remainingMs).toBeLessThan(remaining - 4500);
});