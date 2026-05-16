// RevealOverlay.jsx
//
// 수정: 원본 이미지를 바로 보여주던 것 → 모자이크 점진적 해제 애니메이션
// 왜: 와이어프레임 p3/p7에 명시된 기능. "이게 이거였어!" 하는 순간의
// 쾌감이 이 게임의 핵심 리텐션 포인트.
//
// 어떻게: animateReveal 함수가 pixelSize를 16→1로 줄이면서
// 매 프레임 data URL을 생성 → state로 업데이트 → img 렌더링.
// 컴포넌트 언마운트 시 cancel 함수로 애니메이션 정리.

import { useState, useEffect, useRef } from 'react';
import { animateReveal } from '../utils/pixelate';

export default function RevealOverlay({ question, countdown, imageUrl }) {
  const [revealDataUrl, setRevealDataUrl] = useState(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;

    // 이전 애니메이션이 있으면 취소
    if (cancelRef.current) cancelRef.current();

    const cancel = animateReveal(
      imageUrl,
      280,      // 캔버스 크기
      16,       // 시작 pixelSize (게임 중과 동일한 모자이크 강도)
      2000,     // 2초 동안 해제 (3초 대기 중 2초는 해제, 1초는 원본 감상)
      (dataUrl) => setRevealDataUrl(dataUrl),
      () => {}
    );

    cancelRef.current = cancel;

    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [imageUrl]);

  return (
    <div className="overlay">
      <div className="reveal-layout">
        <div className="reveal-image">
          {revealDataUrl ? (
            <img src={revealDataUrl} alt={question.answer.ko} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          ) : (
            <span className="image-placeholder">⏳</span>
          )}
          <p className="reveal-image__label">{question.answer.ko}</p>
        </div>

        <div className="reveal-popup">
          <div className="reveal-popup__ring">
            <svg viewBox="0 0 100 100" className="ring-svg">
              <circle cx="50" cy="50" r="44" className="ring-bg" />
              <circle
                cx="50" cy="50" r="44"
                className="ring-progress"
                style={{
                  strokeDasharray: `${2 * Math.PI * 44}`,
                  strokeDashoffset: `${2 * Math.PI * 44 * (1 - countdown / 3)}`,
                }}
              />
            </svg>
            <span className="ring-text">✅</span>
          </div>
          <h2 className="reveal-popup__title">정답!</h2>
          <p className="reveal-popup__sub">
            {countdown}초 뒤 다음 문제가 나옵니다
          </p>
        </div>
      </div>
    </div>
  );
}
