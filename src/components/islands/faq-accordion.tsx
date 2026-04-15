/**
 * FaqAccordion — Story 2.8 (UX-DR8, AR27)
 *
 * React hydration root for the Tier-2 FaqSection. Consumes the shadcn
 * Accordion Tier-1 primitive (Radix-based — requires React state for
 * expand/collapse + keyboard nav), reads FAQ items from
 * landing.faq.items via t(), and renders them as a single-open
 * accordion per UX-DR8.
 *
 * This wrapper is a hydration root (pattern established in Story 2.5
 * inspection-story-scenes.tsx): the i18n strings cross the Astro ->
 * island boundary as a single Locale prop, and the React tree is
 * constructed entirely in this file so ReactNode children never have
 * to serialise through island props.
 *
 * i18n variance from AC3: the `items` payload is stored as a JSON
 * object keyed by stable slug ids (scope / vs-mechanic / privacy /
 * cost / platforms / accuracy / data-retention) rather than a JSON
 * array. Rationale: the `t()` helper's `resolveKey` returns only
 * terminal strings, so an array-shaped value is not retrievable via
 * dot-notation. Keying by slug lets the island call
 * `t('landing.faq.items.<slug>.question', locale)` cleanly while
 * preserving the stable slugs Epic 6 Story 6.2 needs for the
 * `FAQPage` JSON-LD `@id` values. The 7 canonical FR6 topics are
 * covered 1-to-1.
 *
 * Consumer contract: <FaqAccordion client:idle locale={locale} />
 */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { t, type Locale } from '@/lib/i18n';

export interface FaqAccordionProps {
  locale: Locale;
}

// Stable slug order — the seven canonical FR6 topics. The order here
// is the order of the rendered accordion items. Epic 6 Story 6.2 will
// use these slugs as `@id` values in the FAQPage JSON-LD graph.
const FAQ_ITEM_IDS = [
  'scope',
  'vs-mechanic',
  'privacy',
  'cost',
  'platforms',
  'accuracy',
  'data-retention',
] as const;

export default function FaqAccordion({ locale }: FaqAccordionProps) {
  const items = FAQ_ITEM_IDS.map((id) => ({
    id,
    question: t(`landing.faq.items.${id}.question`, locale),
    answer: t(`landing.faq.items.${id}.answer`, locale),
  }));

  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="text-[length:var(--text-lg)] text-[var(--color-primary)] hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-[length:var(--text-base)] leading-relaxed text-[var(--color-primary)]">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
