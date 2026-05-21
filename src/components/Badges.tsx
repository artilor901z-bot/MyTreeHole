import { getMood, getWeather } from '@/lib/moods';
import { getSolarTermByName } from '@/lib/solarTerms';

export function SolarTermBadge({ name }: { name?: string }) {
  if (!name) return null;
  const t = getSolarTermByName(name);
  if (!t) return <span className="badge">{name}</span>;
  return (
    <span className="badge" title={t.blurb}>
      <span className="sym">◐</span>
      {t.name}
    </span>
  );
}

export function MoodBadge({ value }: { value?: string }) {
  if (!value) return null;
  const m = getMood(value);
  if (!m) return <span className="badge">{value}</span>;
  return (
    <span className="badge">
      <span className="sym">{m.symbol}</span>
      {m.label}
    </span>
  );
}

export function WeatherBadge({ value }: { value?: string }) {
  if (!value) return null;
  const w = getWeather(value);
  if (!w) return <span className="badge">{value}</span>;
  return (
    <span className="badge">
      <span className="sym">{w.symbol}</span>
      {w.label}
    </span>
  );
}
