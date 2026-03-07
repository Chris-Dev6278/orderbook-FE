// Global design system — imported once in App.tsx
// Every component uses var(--cyan), var(--bg1), etc.

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    /* Backgrounds — darkest to lightest */
    --bg:   #07080C;
    --bg1:  #0D0F18;
    --bg2:  #12151F;
    --bg3:  #181C2A;

    /* Borders */
    --border:        rgba(255, 255, 255, 0.07);
    --border-accent: rgba(0, 188, 212, 0.3);

    /* Text */
    --text:     #E8EAF0;
    --text-mid: #9CA3AF;
    --text-dim: #6B7280;

    /* Brand colors */
    --cyan:       #00BCD4;
    --cyan-dim:   rgba(0, 188, 212, 0.15);
    --green:      #10B981;
    --green-dim:  rgba(16, 185, 129, 0.12);
    --red:        #EF4444;
    --red-dim:    rgba(239, 68, 68, 0.12);
    --purple:     #7C3AED;
    --purple-dim: rgba(124, 58, 237, 0.15);
    --amber:      #F59E0B;

    /* Typography */
    --font-mono:    'Space Mono', monospace;
    --font-display: 'Syne', sans-serif;

    /* Shape */
    --radius:    6px;
    --radius-lg: 12px;
  }

  html, body, #root {
    height: 100%;
    background: var(--bg);
    color: var(--text);
  }

  body {
    font-family: var(--font-mono);
    font-size: 12px;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* Thin scrollbars */
  ::-webkit-scrollbar       { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* Remove number input arrows */
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }

  /* ── Animations used across the whole app ── */

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.3); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }

  @keyframes slideRight {
    from { opacity: 0; transform: translateX(16px); }
    to   { opacity: 1; transform: none; }
  }

  @keyframes rowFlash {
    0%   { background: rgba(0, 188, 212, 0.12); }
    100% { background: transparent; }
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

// Inject the CSS once at app root
export function GlobalStyles() {
    return <style dangerouslySetInnerHTML={{ __html: globalCSS }} />;
}
