import { useState, useCallback, useMemo } from "react";
import type { Exercise, ExerciseAttempt, MatchingPair } from "@mahfuz/shared/types";
import { useTranslation } from "~/hooks/useTranslation";

interface MatchingExerciseProps {
  exercise: Exercise & { pairs: MatchingPair[] };
  onAnswer: (attempt: ExerciseAttempt) => void;
  exerciseNumber: number;
  totalExercises: number;
}

/** Tap-to-pair matching exercise: user selects one from left column, then one from right */
export function MatchingExercise({
  exercise,
  onAnswer,
  exerciseNumber,
  totalExercises,
}: MatchingExerciseProps) {
  const { t } = useTranslation();

  // Shuffle left and right columns independently
  const shuffledLeft = useMemo(() => {
    const arr = exercise.pairs.map((p, i) => ({ label: p.left, pairIndex: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [exercise.id]);

  const shuffledRight = useMemo(() => {
    const arr = exercise.pairs.map((p, i) => ({ label: p.right, pairIndex: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [exercise.id]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null); // pairIndex
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const handleLeftTap = useCallback(
    (pairIndex: number) => {
      if (matched.has(pairIndex)) return;
      setWrongPair(null);
      setSelectedLeft(pairIndex);

      // If right is already selected, check match
      if (selectedRight !== null) {
        if (pairIndex === selectedRight) {
          // Correct match
          setMatched((prev) => new Set([...prev, pairIndex]));
          setSelectedLeft(null);
          setSelectedRight(null);

          // Check if all matched
          if (matched.size + 1 === exercise.pairs.length) {
            onAnswer({
              exerciseId: exercise.id,
              selectedOptionIndex: 0,
              isCorrect: mistakes === 0,
              timestamp: Date.now(),
            });
          }
        } else {
          // Wrong match
          setWrongPair({ left: pairIndex, right: selectedRight });
          setMistakes((m) => m + 1);
          setTimeout(() => {
            setWrongPair(null);
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 800);
        }
      }
    },
    [selectedRight, matched, exercise, mistakes, onAnswer],
  );

  const handleRightTap = useCallback(
    (pairIndex: number) => {
      if (matched.has(pairIndex)) return;
      setWrongPair(null);
      setSelectedRight(pairIndex);

      // If left is already selected, check match
      if (selectedLeft !== null) {
        if (pairIndex === selectedLeft) {
          // Correct match
          setMatched((prev) => new Set([...prev, pairIndex]));
          setSelectedLeft(null);
          setSelectedRight(null);

          // Check if all matched
          if (matched.size + 1 === exercise.pairs.length) {
            onAnswer({
              exerciseId: exercise.id,
              selectedOptionIndex: 0,
              isCorrect: mistakes === 0,
              timestamp: Date.now(),
            });
          }
        } else {
          // Wrong match
          setWrongPair({ left: selectedLeft, right: pairIndex });
          setMistakes((m) => m + 1);
          setTimeout(() => {
            setWrongPair(null);
            setSelectedLeft(null);
            setSelectedRight(null);
          }, 800);
        }
      }
    },
    [selectedLeft, matched, exercise, mistakes, onAnswer],
  );

  const remaining = exercise.pairs.length - matched.size;

  return (
    <div className="rounded-2xl bg-[var(--theme-bg-primary)] p-6 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] text-[var(--theme-text-tertiary)]">
          {exerciseNumber}/{totalExercises}
        </span>
        <span className="text-[12px] font-medium text-primary-600">
          +{exercise.sevapPointReward} {t.learn.pointLabel}
        </span>
      </div>

      <p className="mb-1 text-[14px] font-medium text-[var(--theme-text)]">
        {t.learn.matching.instruction}
      </p>
      <p className="mb-4 text-[12px] text-[var(--theme-text-tertiary)]">
        {remaining} {t.learn.matching.pairsLeft}
      </p>

      {/* Two-column matching grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left column — Arabic letters */}
        <div className="flex flex-col gap-2">
          {shuffledLeft.map((item) => {
            const isMatched = matched.has(item.pairIndex);
            const isSelected = selectedLeft === item.pairIndex;
            const isWrong = wrongPair?.left === item.pairIndex;

            return (
              <button
                key={`l-${item.pairIndex}`}
                onClick={() => handleLeftTap(item.pairIndex)}
                disabled={isMatched}
                className={`rounded-xl border-2 px-3 py-3 text-center text-[18px] font-semibold transition-all ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : isWrong
                      ? "border-red-400 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-950/20 dark:text-red-400"
                      : isSelected
                        ? "border-primary-500 bg-primary-50 text-[var(--theme-text)] shadow-sm dark:bg-primary-950/20"
                        : "border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] hover:bg-[var(--theme-hover-bg)] active:scale-[0.97]"
                }`}
              >
                <span className="arabic-text" dir="rtl">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right column — Latin names */}
        <div className="flex flex-col gap-2">
          {shuffledRight.map((item) => {
            const isMatched = matched.has(item.pairIndex);
            const isSelected = selectedRight === item.pairIndex;
            const isWrong = wrongPair?.right === item.pairIndex;

            return (
              <button
                key={`r-${item.pairIndex}`}
                onClick={() => handleRightTap(item.pairIndex)}
                disabled={isMatched}
                className={`rounded-xl border-2 px-3 py-3 text-center text-[15px] font-medium transition-all ${
                  isMatched
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : isWrong
                      ? "border-red-400 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-950/20 dark:text-red-400"
                      : isSelected
                        ? "border-primary-500 bg-primary-50 text-[var(--theme-text)] shadow-sm dark:bg-primary-950/20"
                        : "border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] hover:bg-[var(--theme-hover-bg)] active:scale-[0.97]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
