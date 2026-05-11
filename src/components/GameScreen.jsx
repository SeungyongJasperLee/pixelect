export default function GameScreen({
  question, streak, timeLeft, maxTime, onAnswer,
}) {
  const timerPercent = (timeLeft / maxTime) * 100;
  const isWarning = timeLeft <= 3 && timeLeft > 0;

  return (
    <>
      <header className="header">
        <h1 className="header__title">Pixelect</h1>
      </header>

      <main className="game-area">
        <div className="image-container">
          {/* TODO: Unsplash 이미지 + Canvas 픽셀화 */}
          <span className="image-placeholder">🖼️</span>
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
