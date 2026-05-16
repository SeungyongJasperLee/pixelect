// src/utils/pixelate.js
//
// Canvas API로 이미지를 픽셀화(모자이크)하는 함수들.
//
// pixelateImage: 정적 모자이크 (게임 중 출제용)
// animateReveal: 모자이크를 점진적으로 해제하는 애니메이션 (정답/오답 시)
//
// 왜 Canvas를 쓰는가:
// CSS filter로는 진짜 픽셀 블록 모자이크를 만들 수 없다.
// Canvas는 이미지를 작게 줄였다가 크게 그려서 픽셀 블록 효과를 낸다.

/**
 * 정적 모자이크 이미지 생성
 */
export function pixelateImage(imageUrl, canvasSize = 280, pixelSize = 20) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      drawPixelated(canvas, img, canvasSize, pixelSize);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageUrl;
  });
}

/**
 * Canvas에 pixelSize 단위로 모자이크 그리기 (내부 유틸)
 */
function drawPixelated(canvas, img, canvasSize, pixelSize) {
  const ctx = canvas.getContext('2d');
  if (pixelSize <= 1) {
    // pixelSize 1 이하 = 원본 그대로
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
    return;
  }
  const smallW = Math.ceil(canvasSize / pixelSize);
  const smallH = Math.ceil(canvasSize / pixelSize);
  ctx.drawImage(img, 0, 0, smallW, smallH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, canvasSize, canvasSize);
}

/**
 * 모자이크 점진적 해제 애니메이션
 * @param {string} imageUrl - 원본 이미지 URL
 * @param {number} canvasSize - 캔버스 크기
 * @param {number} startPixelSize - 시작 모자이크 강도 (클수록 흐림)
 * @param {number} durationMs - 애니메이션 지속 시간 (밀리초)
 * @param {function} onFrame - 매 프레임마다 호출 (dataUrl을 인자로 받음)
 * @param {function} onComplete - 애니메이션 완료 시 호출
 * @returns {function} cancel - 애니메이션 취소 함수
 */
export function animateReveal(imageUrl, canvasSize, startPixelSize, durationMs, onFrame, onComplete) {
  let cancelled = false;
  const img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const startTime = performance.now();

    function step(now) {
      if (cancelled) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // easeOutCubic: 처음에 빠르게 해제되다가 끝에서 천천히
      // 왜: 초반에 "아 이게 뭔가!" 하는 인식 순간이 빨리 와야 쾌감
      const eased = 1 - Math.pow(1 - progress, 3);

      // pixelSize를 startPixelSize에서 1까지 줄임
      const currentPixelSize = Math.max(1, startPixelSize * (1 - eased));

      drawPixelated(canvas, img, canvasSize, currentPixelSize);
      onFrame(canvas.toDataURL());

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (onComplete) onComplete();
      }
    }

    requestAnimationFrame(step);
  };

  img.onerror = () => {
    if (onComplete) onComplete();
  };

  img.src = imageUrl;

  return () => { cancelled = true; };
}
