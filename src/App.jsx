// App.jsx
// 변경점: loading phase 추가, imageUrl/pixelCanvas를 컴포넌트에 전달
// 왜 loading phase가 필요한가:
// Unsplash API에서 이미지를 가져오고 Canvas로 픽셀화하는 데 1-2초 걸린다.
// 이 동안 유저에게 로딩 표시를 보여줘야 타이머가 이미지 없이 돌지 않는다.

import './App.css';
import { useGameState } from './hooks/useGameState';
import WelcomeModal from './components/WelcomeModal';
import GameScreen from './components/GameScreen';
import RevealOverlay from './components/RevealOverlay';
import GameOverOverlay from './components/GameOverOverlay';

export default function App() {
  const {
    phase, question, streak, bestStreak,
    timeLeft, maxTime, revealCountdown,
    selectedChoice, isCorrect,
    imageUrl, pixelCanvas, isLoading,
    startGame, handleAnswer,
  } = useGameState();

  return (
    <div className="app">
      {/* 게임 중 화면 — loading/playing/reveal/gameover 시 배경으로 깔림 */}
      {phase !== 'welcome' && question && (
        <GameScreen
          question={question}
          streak={streak}
          timeLeft={phase === 'playing' ? timeLeft : 0}
          maxTime={maxTime}
          pixelCanvas={pixelCanvas}
          isLoading={phase === 'loading'}
          onAnswer={phase === 'playing' ? handleAnswer : () => {}}
        />
      )}

      {/* 오버레이들 */}
      {phase === 'welcome' && (
        <WelcomeModal onStart={startGame} />
      )}

      {phase === 'loading' && (
        <div className="overlay">
          <div className="modal">
            <div className="modal__icon">⏳</div>
            <h2 className="modal__title">Loading...</h2>
            <p className="modal__desc">이미지를 불러오는 중</p>
          </div>
        </div>
      )}

      {phase === 'reveal' && question && (
        <RevealOverlay
          question={question}
          countdown={revealCountdown}
          imageUrl={imageUrl}
        />
      )}

      {phase === 'gameover' && question && (
        <GameOverOverlay
          question={question}
          streak={streak}
          bestStreak={bestStreak}
          imageUrl={imageUrl}
          onRestart={startGame}
        />
      )}
    </div>
  );
}
