// src/hooks/useGameState.js
//
// 변경: 이미지 로딩 실패 시 해당 문제를 건너뛰고 다음 문제로 자동 전환
// 왜: Unsplash 검색 결과가 없거나 네트워크 에러 시 게임이 멈추면 안 된다.
// 최대 3번까지 재시도하고, 그래도 실패하면 게임오버 처리.

import { useState, useCallback, useRef, useEffect } from 'react';
import quizBank from '../data/quizBank.json';
import { fetchImage } from '../utils/unsplash';
import { pixelateImage } from '../utils/pixelate';

const TIMER_SECONDS = 5;
const REVEAL_SECONDS = 3;
const PIXEL_SIZE = 16;
const MAX_LOAD_RETRIES = 3; // 이미지 로딩 실패 시 최대 재시도 횟수

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
  const [imageUrl, setImageUrl] = useState(null);
  const [pixelCanvas, setPixelCanvas] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  // 이미지 로드 시도 — 실패하면 다른 문제로 재시도
  const loadQuestionWithImage = useCallback(async (excludeIndices, retries = 0) => {
    if (retries >= MAX_LOAD_RETRIES) return null; // 3번 실패 → 포기

    const q = generateQuestion(excludeIndices);
    if (!q) return null; // 키워드 풀 소진

    try {
      const url = await fetchImage(q.answer.query);
      if (!url) throw new Error('No image found');

      const canvas = await pixelateImage(url, 280, PIXEL_SIZE);
      return { question: q, imageUrl: url, pixelCanvas: canvas };
    } catch (err) {
      console.warn(`이미지 로딩 실패 (${q.answer.ko}), 다음 키워드로 재시도...`, err);
      // 실패한 키워드를 제외하고 다시 시도
      return loadQuestionWithImage(
        [...excludeIndices, q.answerIndex],
        retries + 1
      );
    }
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && phase === 'playing') {
      handleAnswer(null);
    }
  }, [timeLeft, phase]);

  const startGame = useCallback(async () => {
    clearAllTimers();
    setPhase('loading');
    setStreak(0);

    const result = await loadQuestionWithImage([]);
    if (!result) {
      // 로딩 완전 실패 → welcome으로 복귀
      setPhase('welcome');
      return;
    }

    setQuestion(result.question);
    setImageUrl(result.imageUrl);
    setPixelCanvas(result.pixelCanvas);
    setUsedIndices([result.question.answerIndex]);
    setSelectedChoice(null);
    setIsCorrect(null);
    setPhase('playing');
    startTimer();
  }, [startTimer, clearAllTimers, loadQuestionWithImage]);

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
      revealRef.current = setInterval(() => {
        setRevealCountdown((prev) => {
          if (prev <= 1) { clearInterval(revealRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      const finalStreak = streak;
      if (finalStreak > bestStreak) {
        setBestStreak(finalStreak);
        try { localStorage.setItem('pixelect_best', finalStreak.toString()); } catch {}
      }
      setPhase('gameover');
    }
  }, [question, streak, bestStreak, phase]);

  useEffect(() => {
    if (revealCountdown === 0 && phase === 'reveal') {
      (async () => {
        const newUsed = [...usedIndices];
        setPhase('loading');

        const result = await loadQuestionWithImage(newUsed);
        if (!result) {
          // 풀 소진 또는 로딩 실패
          if (streak > bestStreak) {
            setBestStreak(streak);
            try { localStorage.setItem('pixelect_best', streak.toString()); } catch {}
          }
          setPhase('gameover');
          return;
        }

        setQuestion(result.question);
        setImageUrl(result.imageUrl);
        setPixelCanvas(result.pixelCanvas);
        setUsedIndices([...newUsed, result.question.answerIndex]);
        setSelectedChoice(null);
        setIsCorrect(null);
        setPhase('playing');
        startTimer();
      })();
    }
  }, [revealCountdown, phase]);

  useEffect(() => { return () => clearAllTimers(); }, [clearAllTimers]);

  return {
    phase, question, streak, bestStreak,
    timeLeft, maxTime: TIMER_SECONDS,
    revealCountdown, selectedChoice, isCorrect,
    imageUrl, pixelCanvas, isLoading,
    startGame, handleAnswer,
  };
}
