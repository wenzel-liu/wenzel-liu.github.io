// Static article content is already in the HTML. Only shared controls need JavaScript.
import { applyThemeToDocument, normalizeThemePreference, persistThemePreference, readStoredTheme } from '@/lib/theme';
import { initializeSearch } from '@/lib/search-ui';
import { initializeAnchorNavigation } from '@/lib/anchor-navigation';

document.querySelectorAll<HTMLElement>('[data-search-widget]').forEach(root => initializeSearch(root));

const control = document.querySelector<HTMLElement>('[data-theme-control]')!;
const themeToggle = control.querySelector<HTMLButtonElement>('[data-theme-toggle]')!;
const themeLabel = control.querySelector<HTMLElement>('[data-theme-current]')!;
const themeOptions = [...control.querySelectorAll<HTMLButtonElement>('[data-theme-option]')];
let preference = readStoredTheme();

function closeTheme() {
  control.classList.remove('open');
  themeToggle.setAttribute('aria-expanded', 'false');
}
function updateTheme() {
  applyThemeToDocument(preference);
  themeLabel.textContent = preference.charAt(0).toUpperCase() + preference.slice(1);
  for (const option of themeOptions) {
    const active = option.dataset.themeOption === preference;
    option.classList.toggle('active', active);
    option.setAttribute('aria-pressed', String(active));
    if (active) {
      const icon = option.querySelector('svg')?.cloneNode(true) as SVGElement | undefined;
      if (icon) { icon.setAttribute('width', '16'); icon.setAttribute('height', '16'); themeToggle.querySelector('svg')?.replaceWith(icon); }
    }
  }
}
themeToggle.addEventListener('click', () => {
  const open = control.classList.toggle('open');
  themeToggle.setAttribute('aria-expanded', String(open));
});
themeOptions.forEach(option => option.addEventListener('click', () => {
  preference = normalizeThemePreference(option.dataset.themeOption);
  persistThemePreference(preference);
  updateTheme(); closeTheme(); themeToggle.focus();
}));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
updateTheme();

const mobileToggle = document.querySelector<HTMLButtonElement>('.mobile-toggle')!;
const mobileNav = document.querySelector<HTMLElement>('#mobile-nav')!;
function closeNavigation() { mobileNav.classList.remove('open'); mobileToggle.setAttribute('aria-expanded', 'false'); }
mobileToggle.addEventListener('click', () => mobileToggle.setAttribute('aria-expanded', String(mobileNav.classList.toggle('open'))));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('click', event => {
  const target = event.target as Node;
  if (!control.contains(target)) closeTheme();
  if (!mobileNav.contains(target) && !mobileToggle.contains(target)) closeNavigation();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (control.classList.contains('open')) { closeTheme(); themeToggle.focus(); }
  if (mobileNav.classList.contains('open')) { closeNavigation(); mobileToggle.focus(); }
});
window.addEventListener('resize', () => { if (innerWidth > 980) closeNavigation(); });
const contents = document.querySelector<HTMLDetailsElement>('[data-article-toc]');
if (contents && matchMedia('(max-width: 720px)').matches) contents.open = false;
initializeAnchorNavigation();
