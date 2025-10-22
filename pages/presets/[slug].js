import Head from 'next/head';
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: preset.title,
    description: preset.description,
  };
  return (
    <>
      <Head>
        <title>{preset.title} – Sora 2 Improver</title>
        <meta name="description" content={preset.description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      <header>
        <h1>{preset.title}</h1>
      </header>
      <main className="container">
        <div className="card">
          <p>{preset.description}</p>
          <Link href={`/upload?p=${preset.slug}`}>Try {preset.title}</Link>
        </div>
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Sora 2 Improver</p>
      </footer>
    </>
  );
}
