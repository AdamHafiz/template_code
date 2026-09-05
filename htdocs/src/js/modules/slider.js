import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

/**
 * Swiper のサンプル。
 * 必要なモジュールだけ読み込むことでバンドルサイズを抑えています
 *（旧テンプレートは Swiper 全体を読み込んでいました）。
 *
 * 該当要素が無いページでは何もせずに抜けるので、全ページ共通の JS に置いても安全です。
 */
export function initSlider(selector = '.js-slider') {
  const el = document.querySelector(selector);
  if (!el) return null;

  return new Swiper(el, {
    modules: [Navigation, Pagination],
    loop: true,
    speed: 600,
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: { el: '.swiper-pagination', clickable: true },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 24 },
    },
  });
}
