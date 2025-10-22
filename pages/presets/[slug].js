import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function PresetRedirect() {
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (slug) {
      router.replace(`/upload?p=${slug}`);
    }
  }, [slug]);

  return null;
}
