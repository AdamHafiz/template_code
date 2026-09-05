/**
 * 端末・ブラウザ判定。
 * body にクラスを付けて CSS から分岐できるようにします。
 *
 * 旧テンプレートは userAgent の if 分岐が一列に並んでいて条件が重複していました
 *（Android タブレットが SP 判定に吸われる、"isAndorid" の綴りミスなど）。
 * ここでは判定を関数に分け、タッチ有無とポインタ種別も見ています。
 */

const ua = navigator.userAgent.toLowerCase();
const hasTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

const isIos =
  /iphone|ipod/.test(ua) || /ipad/.test(ua) || (/macintosh/.test(ua) && hasTouch);
const isAndroid = /android/.test(ua);
const isPhone = /iphone|ipod/.test(ua) || (isAndroid && /mobile/.test(ua));
const isTablet = !isPhone && (isIos || isAndroid) && hasTouch;
const isPc = !isPhone && !isTablet;

const browser = (() => {
  if (/edg\//.test(ua)) return 'edge';
  if (/firefox/.test(ua)) return 'firefox';
  if (/chrome|crios/.test(ua)) return 'chrome';
  if (/safari/.test(ua)) return 'safari';
  return 'other';
})();

export const DEVICE = Object.freeze({
  isSp: isPhone,
  isTablet,
  isPc,
  isIos,
  isAndroid,
  hasTouch,
  browser,
});

/** body に is-sp / is-ios / is-chrome のようなクラスを付ける */
export function applyDeviceClass(target = document.body) {
  const classes = [
    isPhone && 'is-sp',
    isTablet && 'is-tablet',
    isPc && 'is-pc',
    isIos && 'is-ios',
    isAndroid && 'is-android',
    hasTouch && 'is-touch',
    `is-${browser}`,
  ].filter(Boolean);

  target.classList.add(...classes);
}

export default DEVICE;
