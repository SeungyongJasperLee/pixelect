export default function RevealOverlay({ question, countdown }) {
  return (
    <div className="overlay">
      <div className="reveal-layout">
        <div className="reveal-image">
          {/* TODO: 원본 이미지 (모자이크 점진적 해제 애니메이션) */}
          <span className="image-placeholder">🖼️</span>
          <p className="reveal-image__label">{question.answer.ko}</p>
        </div>

        <div className="reveal-popup">
          <div className="reveal-popup__ring">
            <svg viewBox="0 0 100 100" className="ring-svg">
              <circle
                cx="50" cy="50" r="44"
                className="ring-bg"
              />
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
