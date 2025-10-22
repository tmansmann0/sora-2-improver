import { useRouter } from 'next/router';
import Link from 'next/link';
import presets from '../../presets.json';

export default function PresetPage() {
  const router = useRouter();
  const { slug } = router.query;
  const preset = presets.find((p) => p.slug === slug);

  if (!preset) {
    return <div>Preset not found</div>;
  }

  return (
    <div>
      <h1>{preset.title}</h1>
      <p>{preset.description}</p>
      <Link href={`/upload?p=${preset.slug}`}>
        Try {preset.title}
      </Link>
    </div>
  );
}
