/**
 * JS のエントリポイント。
 * 機能は src/js/modules/ に分け、ここでは「どれを動かすか」だけ書きます。
 * webpack に '@' -> src/js のエイリアスを設定してあるので、深い階層からでも同じ書き方ができます。
 */

import { applyDeviceClass } from '@/modules/device';
import { initViewportHeight } from '@/modules/viewport';
import { initSlider } from '@/modules/slider';

function main() {
  applyDeviceClass();
  initViewportHeight();
  initSlider();
}

// defer 相当の読み込みでも、直接開いた場合でも一度だけ走るようにする
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main, { once: true });
} else {
  main();
}
