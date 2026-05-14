// GameScreen.jsx
// 수정: canvas를 DOM에 직접 appendChild하면 React의 가상 DOM과 충돌한다.
// 왜: React는 자기가 관리하는 DOM 트리를 추적하는데,
// 외부에서 노드를 추가/제거하면 "이 노드 모르는데?" 하고 에러가 난다.
// 해결: canvas.toDataURL()로 이미지 데이터를 추출해서 일반 <img> 태그로 렌더링.
// React가 관리할 수 있는 선언적 방식이라 충돌 없음.

import { useState, useEffect } from 'react';

export default function GameScreen({
  question, streak, timeLeft, maxTime, pixelCanvas, isLoading, onAnswer,
}) {
  const [pixelDataUrl, setPixelDataUrl] = useState(null);
  const timerPercent = (timeLeft / maxTime) * 100;
  const isWarning = timeLeft <= 2 && timeLeft > 0;

  // pixelCanvas가 바뀔 때마다 data URL로 변환
  useEffect(() => {
    if (pixelCanvas) {
      setPixelDataUrl(pixelCanvas.toDataURL());
    } else {
      setPixelDataUrl(null);
    }
  }, [pixelCanvas]);

  return (
    <>
      <header className="header">
        <h1 className="header__title">Pixelect</h1>
      </header>

      <main className="game-area">
        <div className="image-container">
          {isLoading && <span className="image-placeholder">⏳</span>}
          {!isLoading && pixelDataUrl && (
            <img src={pixelDataUrl} alt="mosaic" style={{width:'100%',height:'100%',objectFit:'cover'}} />
          )}
          {!isLoading && !pixelDataUrl && <span className="image-placeholder">🖼️</span>}
        </div>

        <div className="game-info">
          <div className="info-row">
            <div className="score-badge">🔥 {streak}</div>
            <div className="timer">
              <div
                className={`timer__bar ${isWarning ? 'timer__bar--warning' : ''}`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>

          <div className="choices">
            {question.choices.map((choice) => (
              <button
                key={choice.index}
                className="choice-btn"
                onClick={() => onAnswer(choice)}
              >
                {choice.ko}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <span>© 2026 Pixelect</span>
      </footer>
    </>
  );
}