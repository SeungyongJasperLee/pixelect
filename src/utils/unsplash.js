// src/utils/unsplash.js
//
// Unsplash API에서 키워드로 이미지를 검색하는 함수.
// 왜 이렇게 하는가:
// - 직접 fetch하면 매번 네트워크 요청 → 세션 내 캐시로 중복 요청 방지
// - &w=400으로 작은 이미지를 받아 로딩 속도 확보 (원본은 4000px+)
// - 결과 중 랜덤 1장을 고르면 같은 키워드라도 매번 다른 이미지 가능

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const cache = {};

export async function fetchImage(query) {
  // 캐시에 있으면 재사용 (API 요청 절약)
  if (cache[query]) return cache[query];

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
    );

    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);

    const data = await res.json();

    if (data.results.length === 0) return null;

    // 상위 5개 중 랜덤 1장 선택
    const photo = data.results[Math.floor(Math.random() * data.results.length)];

    // small 사이즈 (400px) — 픽셀화할 거라 고해상도 불필요
    const url = photo.urls.small;

    cache[query] = url;
    return url;
  } catch (err) {
    console.error('Unsplash fetch failed:', err);
    return null;
  }
}
