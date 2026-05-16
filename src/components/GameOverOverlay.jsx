// GameOverOverlay.jsx
//
// 수정: 원본 이미지를 바로 보여주던 것 → 모자이크 점진적 해제 애니메이션
// 왜: 오답 시에도 "아 이게 이거였구나" 하는 학습 피드백이 필요.
// 와이어프레임 p4/p8에 명시.

import { useState, useEffect, useRef } from 'react';
import { animateReveal } from '../utils/pixelate';

export default function GameOverOverlay({ question, streak, bestStreak, imageUrl, onRestart }) {
  const [revealDataUrl, setRevealDataUrl] = useState(null);
  const cancelRef = useRef(null);
  const isNewBest = streak > 0 && streak >= bestStreak;

  useEffect(() => {
    if (!imageUrl) return;

    if (cancelRef.current) cancelRef.current();

    const cancel = animateReveal(
      imageUrl,
      280,
      16,
      2500,     // 2.5초 — 게임오버는 급할 필요 없으니 좀 더 여유롭게
      (dataUrl) => setRevealDataUrl(dataUrl),
      () => {}
    );

    cancelRef.current = cancel;

    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [imageUrl]);

  const handleShare = async () => {
    const text = `🧩 Pixelect에서 ${streak}연속 정답! 🔥\n도전해보세요!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pixelect', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('결과가 클립보드에 복사되었습니다!');
      }
    } catch {}
  };

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

        <div className="modal">
          <div className="modal__icon">{isNewBest ? '🏆' : '💥'}</div>
          <h2 className="modal__title">
            {isNewBest ? '새로운 기록!' : '오답! 게임 끝'}
          </h2>
          <div className="score-display">
            <div className="score-display__row">
              <span className="score-display__label">현재 기록</span>
              <span className="score-display__value">{streak}</span>
            </div>
            <div className="score-display__row">
              <span className="score-display__label">최고 기록</span>
              <span className="score-display__value score-display__value--best">
                {Math.max(streak, bestStreak)}
              </span>
            </div>
          </div>
          <button className="btn-primary" onClick={onRestart}>
            다시 하기
          </button>
          <button className="btn-secondary" onClick={handleShare}>
            공유하기
          </button>
        </div>
      </div>
    </div>
  );
}
