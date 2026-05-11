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
    startGame, handleAnswer,
  } = useGameState();

  return (
    <div className="app">
      {/* 게임 중 화면 — reveal/gameover 시에도 뒤에 깔림 */}
      {phase !== 'welcome' && question && (
        <GameScreen
          question={question}
          streak={streak}
          timeLeft={phase === 'playing' ? timeLeft : 0}
          maxTime={maxTime}
          onAnswer={phase === 'playing' ? handleAnswer : () => {}}
        />
      )}

      {/* 오버레이들 */}
      {phase === 'welcome' && (
        <WelcomeModal onStart={startGame} />
      )}

      {phase === 'reveal' && question && (
        <RevealOverlay
          question={question}
          countdown={revealCountdown}
        />
      )}

      {phase === 'gameover' && question && (
        <GameOverOverlay
          question={question}
          streak={streak}
          bestStreak={bestStreak}
          onRestart={startGame}
        />
      )}
    </div>
  );
}
