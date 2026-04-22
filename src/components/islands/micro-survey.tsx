/**
 * MicroSurvey — Story 3.6 (AC4, FR17)
 *
 * React island: single-question radio-card survey that POSTs the
 * visitor's answer to /api/micro-survey for Loops drip segmentation.
 * Strictly non-blocking — failures are silently swallowed and the
 * visitor always sees a "Thanks" message.
 *
 * Consumer: <MicroSurvey client:visible email={email} question={...} ... />
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MicroSurveyProps {
  email?: string;
  question: string;
  options: string[];
  sendLabel: string;
  skipLabel: string;
  thanksMessage: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Status = 'idle' | 'submitting' | 'done';

export default function MicroSurvey({
  email,
  question,
  options,
  sendLabel,
  skipLabel,
  thanksMessage,
}: MicroSurveyProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  // If no email, the survey cannot correlate with a Loops contact — render nothing.
  if (!email) return null;

  // ── Done state ─────────────────────────────────────────────────────────
  if (status === 'done') {
    return (
      <div className="mt-8 text-center" role="status" aria-live="polite">
        <p className="text-[length:var(--text-base)] text-[var(--color-primary)]">
          {thanksMessage}
        </p>
      </div>
    );
  }

  // ── Submit handler ─────────────────────────────────────────────────────
  async function handleSend() {
    if (!selectedOption) return;
    setStatus('submitting');
    try {
      await fetch('/api/micro-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, answer: selectedOption }),
      });
    } catch {
      // Failure is silently swallowed — survey answers are non-critical.
    }
    setStatus('done');
  }

  function handleSkip() {
    setStatus('done');
  }

  const questionId = 'micro-survey-question';

  return (
    <section className="mt-10" aria-labelledby={questionId}>
      <h2
        id={questionId}
        className="font-display mb-4 text-center text-[length:var(--text-lg)] font-semibold text-[var(--color-primary)]"
      >
        {question}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby={questionId}
        className="flex flex-col gap-3"
      >
        {options.map((option, index) => {
          const isSelected = selectedOption === option;
          const inputId = `survey-option-${index}-${option.replace(/\s+/g, '-').toLowerCase()}`;

          return (
            <label
              key={option}
              htmlFor={inputId}
              className={cn(
                'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
                'focus-within:ring-2 focus-within:ring-[var(--color-teal)] focus-within:ring-offset-2',
                isSelected
                  ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/10 text-[var(--color-primary)]'
                  : 'border-[var(--color-border,#e5e5e5)] text-[var(--color-primary)] hover:border-[var(--color-teal)]/50'
              )}
            >
              <input
                type="radio"
                id={inputId}
                name="micro-survey"
                value={option}
                checked={isSelected}
                onChange={() => setSelectedOption(option)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-[var(--color-teal)] bg-[var(--color-teal)]'
                    : 'border-[var(--color-border,#c5c5c5)]'
                )}
              >
                {isSelected && (
                  <span className="block h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <span>{option}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          type="button"
          onClick={handleSend}
          disabled={!selectedOption || status === 'submitting'}
          className="min-h-[44px] min-w-[100px]"
        >
          {status === 'submitting' ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {sendLabel}
            </span>
          ) : (
            sendLabel
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          className="min-h-[44px]"
        >
          {skipLabel}
        </Button>
      </div>
    </section>
  );
}
