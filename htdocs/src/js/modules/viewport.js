/**
 * モバイルでアドレスバーの伸縮に影響されない 100vh を作る。
 * CSS 側では height: calc(var(--vh, 1vh) * 100) のように使います。
 * dvh が使えない古い端末向けのフォールバックです。
 */
export function initViewportHeight() {
  const set = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };

  set();

  // リサイズのたびに書き換えると重いので次の描画フレームまでまとめる
  let ticking = false;
  window.addEventListener('resize', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      set();
      ticking = false;
    });
  });
}
