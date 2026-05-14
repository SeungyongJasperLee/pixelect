// src/utils/pixelate.js
//
// Canvas API로 이미지를 픽셀화(모자이크)하는 함수.
// 왜 Canvas를 쓰는가:
// - CSS filter로는 진짜 모자이크 효과를 낼 수 없다
// - Canvas는 이미지를 아주 작게 줄인 뒤 다시 크게 그리는 방식으로
//   "진짜 픽셀 블록" 효과를 만든다
// - pixelSize가 클수록 모자이크가 강함 (알아보기 어려움)

/**
 * 이미지 URL을 받아 pixelSize 단위로 모자이크 처리한 canvas를 반환
 * @param {string} imageUrl - 원본 이미지 URL
 * @param {number} canvasSize - 출력 캔버스 크기 (px, 정사각형)
 * @param {number} pixelSize - 모자이크 블록 크기 (클수록 더 흐릿)
 * @returns {Promise<HTMLCanvasElement>}
 */
export function pixelateImage(imageUrl, canvasSize = 280, pixelSize = 20) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Unsplash 이미지는 CORS 허용됨

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');

      // 핵심 트릭:
      // 1) 이미지를 아주 작게 그린다 (pixelSize만큼 축소)
      // 2) imageSmoothingEnabled = false로 보간 끄기
      // 3) 작은 이미지를 다시 크게 그린다 → 픽셀 블록이 생김

      const smallW = Math.ceil(canvasSize / pixelSize);
      const smallH = Math.ceil(canvasSize / pixelSize);

      // Step 1: 작게 그리기
      ctx.drawImage(img, 0, 0, smallW, smallH);

      // Step 2: 보간 끄기 (픽셀이 뭉개지지 않고 딱딱하게 확대됨)
      ctx.imageSmoothingEnabled = false;

      // Step 3: 작은 걸 다시 크게
      ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, canvasSize, canvasSize);

      resolve(canvas);
    };

    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageUrl;
  });
}
