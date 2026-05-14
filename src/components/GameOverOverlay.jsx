// GameOverOverlay.jsx
// 변경점: 원본 이미지 표시

export default function GameOverOverlay({ question, streak, bestStreak, imageUrl, onRestart }) {
  const isNewBest = streak > 0 && streak >= bestStreak;

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
          {imageUrl ? (
            <img src={imageUrl} alt={question.answer.ko} style={{width:'100%',height:'100%',objectFit:'cover'}} />
          ) : (
            <span className="image-placeholder">🖼️</span>
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
