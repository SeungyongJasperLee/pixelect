import { useState, useCallback, useRef, useEffect } from 'react';
import quizBank from '../data/quizBank.json';

const TIMER_SECONDS = 5;
const REVEAL_SECONDS = 3;

function generateQuestion(excludeIndices = []) {
  const available = quizBank
    .map((item, i) => ({ ...item, index: i }))
    .filter((_, i) => !excludeIndices.includes(i));

  if (available.length < 3) return null;

  const shuffled = [...available].sort(() => Math.random() - 0.5);
  const answer = shuffled[0];
  const wrongs = shuffled.slice(1, 3);
  const choices = [answer, ...wrongs].sort(() => Math.random() - 0.5);

  return { answer, choices, answerIndex: answer.index };
}

export function useGameState() {
  const [phase, setPhase] = useState('welcome');
  const [question, setQuestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try { return parseInt(localStorage.getItem('pixelect_best') || '0', 10); }
    catch { return 0; }
  });
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [revealCountdown, setRevealCountdown] = useState(REVEAL_SECONDS);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [usedIndices, setUsedIndices] = useState([]);

  const timerRef = useRef(null);
  const revealRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(revealRef.current);
  }, []);

  const startTimer = useCallback(() => {
    setTimeLeft(TIMER_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 타임아웃 → 오답 처리
  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing') {
      handleAnswer(null);
    }
  }, [timeLeft, phase]);

  const startGame = useCallback(() => {
    clearAllTimers();
    const q = generateQuestion();
    setQuestion(q);
    setStreak(0);
    setUsedIndices([q.answerIndex]);
    setSelectedChoice(null);
    setIsCorrect(null);
    setPhase('playing');
    startTimer();
  }, [startTimer, clearAllTimers]);

  const handleAnswer = useCallback((choice) => {
    if (phase !== 'playing') return;
    clearInterval(timerRef.current);

    const correct = choice && choice.index === question?.answer?.index;
    setSelectedChoice(choice);
    setIsCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setPhase('reveal');
      setRevealCountdown(REVEAL_SECONDS);

      // 3초 카운트다운 후 자동으로 다음 문제
      revealRef.current = setInterval(() => {
        setRevealCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(revealRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // 오답 → 바로 게임오버 (원본 공개와 함께)
      const finalStreak = streak;
      if (finalStreak > bestStreak) {
        setBestStreak(finalStreak);
        try { localStorage.setItem('pixelect_best', finalStreak.toString()); } catch {}
      }
      setPhase('gameover');
    }
  }, [question, streak, bestStreak, phase]);

  // reveal 카운트다운 끝나면 다음 문제
  useEffect(() => {
    if (revealCountdown === 0 && phase === 'reveal') {
      const newUsed = [...usedIndices];
      const q = generateQuestion(newUsed);
      if (!q) {
        // 풀 소진
        if (streak > bestStreak) {
          setBestStreak(streak);
          try { localStorage.setItem('pixelect_best', streak.toString()); } catch {}
        }
        setPhase('gameover');
        return;
      }
      setQuestion(q);
      setUsedIndices([...newUsed, q.answerIndex]);
      setSelectedChoice(null);
      setIsCorrect(null);
      setPhase('playing');
      startTimer();
    }
  }, [revealCountdown, phase]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return {
    phase, question, streak, bestStreak,
    timeLeft, maxTime: TIMER_SECONDS,
    revealCountdown,
    selectedChoice, isCorrect,
    startGame, handleAnswer,
  };
}
