import Head from 'next/head';
import Link from 'next/link';
import presets from '../presets.json';

export default function Home() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sora 2 Improver",
    "description": "Upload and improve your Sora 2 videos with our easy presets."
  };
  return (
    <>
      <Head>
        <title>Sora 2 Improver – Enhance your videos</title>
        <meta name="description" content="Upload and improve your Sora 2 videos with our easy presets." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>
      <header>
        <h1>Sora 2 Improver</h1>
      </header>
      <main className="container">
        {presets.map((preset) => (
          <div key={preset.slug} className="card">
            <h2>{preset.title}</h2>
            <p>{preset.description}</p>
            <Link href={`/presets/${preset.slug}`}>Use {preset.title}</Link>
          </div>
        ))}
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Sora 2 Improver</p>
      </footer>
    </>
  );
}
