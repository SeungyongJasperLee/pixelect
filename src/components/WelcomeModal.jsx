export default function WelcomeModal({ onStart }) {
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal__icon">🧩</div>
        <h1 className="modal__title">Pixelect</h1>
        <p className="modal__desc">
          모자이크 처리된 이미지를 보고<br />
          3개의 선택지 중 정답을 맞춰보세요!<br /><br />
          ⏱ 제한 시간: 5초<br />
          🔥 연속으로 맞추면 스트릭 UP!
        </p>
        <button className="btn-primary" onClick={onStart}>
          게임 시작
        </button>
      </div>
    </div>
  );
}
