// src/utils/unsplash.js
//
// Unsplash API에서 키워드로 이미지를 검색하는 함수.
//
// 왜 첫 번째 결과만 쓰는가:
// Unsplash는 검색 결과를 관련도 순으로 정렬한다.
// 1번째가 가장 정확하고, 3~5번째로 갈수록 느슨하게 연관된 이미지가 섞인다.
// 랜덤으로 고르면 "강아지"를 검색했는데 개 사료 사진이 나오는 식.
//
// content_filter=high:
// Unsplash의 자체 필터로, 부적절하거나 관련성 낮은 이미지를 걸러준다.

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const cache = {};

export async function fetchImage(query) {
  if (cache[query]) return cache[query];

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&content_filter=high&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${ACCESS_KEY}` } }
    );

    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);

    const data = await res.json();

    if (data.results.length === 0) return null;

    // 첫 번째 결과 = 가장 관련성 높은 이미지
    const photo = data.results[0];
    const url = photo.urls.small;

    cache[query] = url;
    return url;
  } catch (err) {
    console.error('Unsplash fetch failed:', err);
    return null;
  }
}
