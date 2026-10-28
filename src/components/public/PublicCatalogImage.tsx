import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { fetchPublicPhoto } from '../../services/publicPhotos';

export default function PublicCatalogImage({ src, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [saved, setSaved] = useState<{ source: string; objectUrl: string }>();
  useEffect(() => {
    if (!src) return;
    let active = true;
    let objectUrl: string | undefined;
    // Every rendered public item is downloaded, even below the fold.
    void fetchPublicPhoto(src).then(blob => {
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setSaved({ source: src, objectUrl });
    });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);
  return <img {...props} loading="eager" src={saved && saved.source === src ? saved.objectUrl : navigator.onLine ? src : undefined}/>;
}
