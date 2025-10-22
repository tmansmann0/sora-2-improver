import presets from '../presets.json';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Sora 2 Improver</h1>
      <ul>
        {presets.map((preset) => (
          <li key={preset.slug}>
            <Link href={`/presets/${preset.slug}`}>{preset.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
