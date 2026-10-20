/**
 * Headless UI verification for the main site + v3 archive.
 * Usage: npm run check:ui   (requires the preview server on :3000)
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = resolve('review');
mkdirSync(OUT, { recursive: true });

const results = [];
function log(name, pass, detail = '') {
  results.push({ name, pass });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
} catch {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
}

async function openPage(url, { mobile = false, label }) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: mobile,
    hasTouch: mobile
  });
  const page = await context.newPage();
  const errors = [];

  page.on('pageerror', (e) => errors.push('JS: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text());
  });
  page.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()));

  const response = await page.goto(url, { waitUntil: 'load' });
  log(`${label}: page loads`, !!response && response.ok(), `HTTP ${response?.status()}`);
  await page.waitForTimeout(800);

  const state = await page.evaluate(async () => {
    try {
      await document.fonts.ready;
    } catch {}
    return {
      bg: getComputedStyle(document.body).backgroundColor,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });

  log(`${label}: CSS applied`, state.bg !== 'rgba(0, 0, 0, 0)', state.bg);
  log(`${label}: no horizontal overflow`, state.overflow <= 1, `${state.overflow}px`);
  log(
    `${label}: no console/network errors`,
    errors.length === 0,
    errors.slice(0, 3).join(' | ') || 'none'
  );

  return { page, context };
}

/** Scroll through so all reveal animations fire (for full-page screenshots). */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(700);
}

/* ============================================================
   v3 archive — warm theme
   ============================================================ */
{
  const { page, context } = await openPage(`${BASE}/v3/`, { label: 'v3 archive' });

  const photo = await page.evaluate(() => {
    const img = document.querySelector('.hero-card__photo');
    return img ? { loaded: img.naturalWidth > 0, w: img.naturalWidth } : null;
  });
  log('v3: hero photo loads', !!photo && photo.loaded, photo ? `${photo.w}px` : 'not found');

  await scrollThrough(page);
  await page.screenshot({ path: `${OUT}/v3-desktop.png`, fullPage: true });

  await context.close();
}

/* ============================================================
   Main (dark) — desktop
   ============================================================ */
{
  const { page, context } = await openPage(`${BASE}/`, { label: 'main desktop' });

  const photo = await page.evaluate(() => {
    const img = document.querySelector('.portrait img');
    return img ? { loaded: img.naturalWidth > 0, w: img.naturalWidth } : null;
  });
  log('main: hero photo loads', !!photo && photo.loaded, photo ? `${photo.w}px` : 'not found');

  // stats: the counter itself must be full size, inline, and sit beside the "+"
  const stat = await page.evaluate(() => {
    const count = document.querySelector('.stat .count');
    const cs = getComputedStyle(count);
    const cr = count.getBoundingClientRect();
    const node = count.nextSibling;
    let plus = null;
    if (node && node.nodeType === 3) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const pr = range.getClientRects()[0];
      if (pr) plus = { left: pr.left, top: pr.top, right: pr.right, bottom: pr.bottom };
    }
    return {
      fontSize: parseFloat(cs.fontSize),
      display: cs.display,
      count: { left: cr.left, top: cr.top, right: cr.right, bottom: cr.bottom },
      plus
    };
  });
  log('main: stat number is full size', stat.fontSize >= 32, `${stat.fontSize}px`);
  log('main: stat number is inline', stat.display === 'inline', stat.display);
  const plusSameLine =
    stat.plus && stat.plus.top < stat.count.bottom && stat.plus.bottom > stat.count.top;
  const plusBeside = stat.plus && stat.plus.left >= stat.count.right - 2;
  log(
    'main: "+" sits beside the number',
    !!plusSameLine && !!plusBeside,
    JSON.stringify({ count: stat.count, plus: stat.plus })
  );

  // service rows: hover accent line must not touch the row number
  const service = await page.evaluate(() => {
    const row = document.querySelector('.service');
    const num = row.querySelector('.service__num');
    const cs = getComputedStyle(row);
    const rr = row.getBoundingClientRect();
    const nr = num.getBoundingClientRect();
    return { paddingLeft: parseFloat(cs.paddingLeft), gapToNumber: nr.left - rr.left };
  });
  log(
    'main: service row has breathing space before the number',
    service.paddingLeft >= 20 && service.gapToNumber >= 20,
    `${service.gapToNumber.toFixed(1)}px`
  );

  await scrollThrough(page);

  // badge overlap with the "From" label
  const badgeCheck = await page.evaluate(() => {
    const card = document.querySelector('.price--featured');
    const badge = card.querySelector('.price__badge');
    const from = card.querySelector('.price__amount small');
    const a = badge.getBoundingClientRect();
    const b = from.getBoundingClientRect();
    const overlap =
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return { overlap };
  });
  log('main: "Most popular" does not overlap "From"', badgeCheck.overlap === 0, JSON.stringify(badgeCheck));

  // stat dividers: space on both sides of the vertical line
  const statGap = await page.evaluate(() => {
    const stats = [...document.querySelectorAll('.stat')];
    return {
      firstRight: parseFloat(getComputedStyle(stats[0]).paddingRight),
      secondLeft: parseFloat(getComputedStyle(stats[1]).paddingLeft)
    };
  });
  log(
    'main: stat divider has breathing space on both sides',
    statGap.firstRight >= 24 && statGap.secondLeft >= 24,
    JSON.stringify(statGap)
  );

  await page.locator('#pricing').screenshot({ path: `${OUT}/main-pricing.png` });
  await page.screenshot({ path: `${OUT}/main-desktop.png`, fullPage: true });

  // back to top
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
  await page.waitForTimeout(300);
  await page.locator('.foot__links a[href="#top"]').click();
  let backToTop = false;
  try {
    await page.waitForFunction(() => window.scrollY < 5, null, { timeout: 6000 });
    backToTop = true;
  } catch {
    backToTop = false;
  }
  log('main: "Back to top" scrolls to the top', backToTop, `${await page.evaluate(() => window.scrollY)}px`);

  // custom select: mouse
  await page.locator('#topic-trigger').scrollIntoViewIfNeeded();
  await page.locator('#topic-trigger').click();
  await page.waitForTimeout(300);
  const menuOpen = await page.locator('.select__menu').isVisible();
  log('main: custom select opens', menuOpen);
  await page.screenshot({ path: `${OUT}/main-select.png` });

  await page.locator('.select__menu [role="option"]').nth(2).click();
  await page.waitForTimeout(250);
  const selection = await page.evaluate(() => ({
    text: document.getElementById('topic-value').textContent.trim(),
    value: document.getElementById('v2-topic').value,
    expanded: document.getElementById('topic-trigger').getAttribute('aria-expanded'),
    selectedCount: document.querySelectorAll('.select__menu [aria-selected="true"]').length
  }));
  log(
    'main: select choice updates the form and closes',
    selection.value.includes('E-commerce') &&
      selection.text.includes('E-commerce') &&
      selection.expanded === 'false' &&
      selection.selectedCount === 1,
    JSON.stringify(selection)
  );

  // custom select: keyboard
  await page.locator('#topic-trigger').focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  const kbOpen = await page.locator('.select__menu').isVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const kbValue = await page.evaluate(() => ({
    value: document.getElementById('v2-topic').value,
    expanded: document.getElementById('topic-trigger').getAttribute('aria-expanded')
  }));
  log(
    'main: select is keyboard operable',
    kbOpen && !!kbValue.value && kbValue.expanded === 'false',
    `selected "${kbValue.value}"`
  );

  await context.close();
}

/* ============================================================
   Main (dark) — mobile: menu, close (X), closing behaviour
   ============================================================ */
{
  const { page, context } = await openPage(`${BASE}/`, { mobile: true, label: 'main mobile' });

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

  const burgerVisible = await page.locator('.burger').isVisible();
  log('main mobile: burger visible', burgerVisible);

  await page.locator('.burger').click();
  await page.waitForTimeout(600);

  const openState = await page.evaluate(() => {
    const burger = document.querySelector('.burger');
    const menu = document.querySelector('.menu');
    const bars = [...burger.querySelectorAll('span')].map((s) => {
      const cs = getComputedStyle(s);
      return { transform: cs.transform, opacity: cs.opacity };
    });
    return {
      expanded: burger.getAttribute('aria-expanded'),
      menuVisible: getComputedStyle(menu).visibility,
      menuOpen: menu.classList.contains('is-open'),
      bars
    };
  });

  log(
    'main mobile: menu opens',
    openState.expanded === 'true' && openState.menuOpen && openState.menuVisible === 'visible',
    openState.menuVisible
  );
  const bothBarsRotated =
    openState.bars.length === 2 &&
    openState.bars.every((b) => b.opacity !== '0' && b.transform !== 'none' && b.transform.includes('matrix'));
  log('main mobile: close (X) icon visible', bothBarsRotated, JSON.stringify(openState.bars));

  await page.screenshot({ path: `${OUT}/main-mobile-menu.png` });

  await page.locator('.menu a[href="#services"]').click();
  await page.waitForTimeout(700);
  const closed = await page.evaluate(() => ({
    expanded: document.querySelector('.burger').getAttribute('aria-expanded'),
    open: document.querySelector('.menu').classList.contains('is-open')
  }));
  log('main mobile: menu closes after choosing a link', closed.expanded === 'false' && !closed.open);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await scrollThrough(page);
  await page.screenshot({ path: `${OUT}/main-mobile.png`, fullPage: true });

  await context.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
console.log(`Screenshots saved in: ${OUT}`);
process.exit(failed.length ? 1 : 0);
