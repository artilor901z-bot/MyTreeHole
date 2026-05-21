import { getSolarTerm } from '@/lib/solarTerms';

export default function TodayBlock() {
  const today = new Date();
  const term = getSolarTerm(today);
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');

  return (
    <section className="today">
      <div className="label">today</div>
      <div className="date">{y}.{m}.{d}</div>
      <div className="term">{term.name}</div>
      <div className="blurb">{term.blurb}</div>
      <div className="mood-hint">
        今日宜以「<strong>{term.mood}</strong>」为情绪基调
      </div>
    </section>
  );
}
