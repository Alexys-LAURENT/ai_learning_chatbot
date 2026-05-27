'use client';

import { Button, Card, Chip, ProgressBar } from '@heroui/react';
import { useState } from 'react';
import type { QuizQuestion } from '@/app/tools/displayQuizTool';

type Props = {
  subject: string;
  questions: QuizQuestion[];
};

type AnswerState = 'idle' | 'correct' | 'wrong';

const toLabel = (i: number) => String.fromCharCode(65 + i);

export default function QuizComponent({ subject, questions }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const isLast = index === questions.length - 1;

  function handleSelect(choiceIndex: number) {
    if (answerState !== 'idle') return;
    setSelected(choiceIndex);
    const correct = choiceIndex === current.correctAnswerIndex;
    setAnswerState(correct ? 'correct' : 'wrong');
    if (correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswerState('idle');
  }

  function handleRestart() {
    setIndex(0);
    setSelected(null);
    setAnswerState('idle');
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const chipColor =
      pct >= 80 ? 'success' : pct >= 60 ? 'warning' : ('danger' as const);
    const chipLabel =
      pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué' : 'À retravailler';

    return (
      <Card className="w-full max-w-lg">
        <Card.Content className="flex flex-col items-center gap-6 py-10 text-center">
          <p className="text-muted text-sm">Score final — {subject}</p>
          <p className="text-6xl font-black">
            {score}
            <span className="text-muted text-3xl">/{questions.length}</span>
          </p>
          <p className="text-2xl font-bold">{pct}%</p>
          <Chip color={chipColor} variant="soft" size="lg">
            {chipLabel}
          </Chip>
          <Button variant="outline" onPress={handleRestart}>
            Recommencer
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-full md:max-w-lg overflow-hidden">
      <ProgressBar
        aria-label="Progression du quiz"
        value={index}
        minValue={0}
        maxValue={questions.length}
        size="sm"
        color="accent"
        className="rounded-none"
      >
        <ProgressBar.Track className="rounded-none">
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>

      <Card.Header className="flex-row items-center justify-between pt-5 pb-0">
        <Chip color="default" variant="soft" size="sm">
          {subject}
        </Chip>
        <span className="text-muted text-sm">
          {index + 1} / {questions.length}
        </span>
      </Card.Header>

      <Card.Content className="space-y-4 pt-4 px-3 md:px-4">
        <p className="text-sm md:text-lg leading-snug font-semibold whitespace-normal break-words">{current.question}</p>

        <div className="space-y-2">
          {current.choices.map((choice, i) => {
            const revealed = answerState !== 'idle';
            const isCorrect = i === current.correctAnswerIndex;
            const isSelected = selected === i;

            let variant: 'outline' | 'primary' | 'danger' | 'ghost' = 'outline';
            if (revealed) {
              if (isCorrect) variant = 'primary';
              else if (isSelected) variant = 'danger';
              else variant = 'ghost';
            }

            return (
              <Button
                key={i}
                variant={variant}
                onPress={() => handleSelect(i)}
                isDisabled={revealed && !isCorrect && !isSelected}
                fullWidth
                className="justify-start h-auto whitespace-normal break-words text-left text-xs md:text-sm py-2 md:py-3"
              >
                <span className="mr-1.5 font-bold flex-shrink-0">{toLabel(i)}.</span>
                <span className="text-left">{choice}</span>
              </Button>
            );
          })}
        </div>

        {answerState !== 'idle' && (
          <div className="space-y-1 rounded-lg border p-3 md:p-4 text-xs md:text-sm">
            <p className="font-semibold">
              {answerState === 'correct'
                ? '✓ Correct'
                : `✗ La bonne réponse était ${toLabel(current.correctAnswerIndex)}`}
            </p>
            <p className="text-muted whitespace-normal break-words">{current.explanation}</p>
          </div>
        )}
      </Card.Content>

      <Card.Footer className="pt-2 pb-5">
        {answerState !== 'idle' ? (
          <Button variant="primary" onPress={handleNext} fullWidth>
            {isLast ? 'Voir les résultats →' : 'Question suivante →'}
          </Button>
        ) : (
          <p className="text-muted w-full text-center text-sm">
            Sélectionne une réponse pour continuer
          </p>
        )}
      </Card.Footer>
    </Card>
  );
}
