import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface GalleryImage {
  id: string;
  imageUrl: string;
}

interface Props {
  images: GalleryImage[];
  title?: string;
}

export default function GalleryViewer({ images, title }: Props) {
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Imágenes no disponibles automáticamente
      </div>
    );
  }

  return (
    <>
      {title && <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h3>}
      <div className="grid grid-cols-2 gap-2">
        {images.map((img, idx) => (
          <GalleryThumb key={img.id} src={img.imageUrl} onClick={() => setFullscreenIdx(idx)} />
        ))}
      </div>

      {fullscreenIdx !== null && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <button onClick={() => setFullscreenIdx(null)} className="absolute top-4 right-4 z-10 p-2 bg-card rounded-full border border-border">
            <X className="h-5 w-5 text-foreground" />
          </button>
          {fullscreenIdx > 0 && (
            <button onClick={() => setFullscreenIdx(fullscreenIdx - 1)} className="absolute left-2 z-10 p-2 bg-card rounded-full border border-border">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          {fullscreenIdx < images.length - 1 && (
            <button onClick={() => setFullscreenIdx(fullscreenIdx + 1)} className="absolute right-2 z-10 p-2 bg-card rounded-full border border-border">
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          )}
          <img
            src={images[fullscreenIdx].imageUrl}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-6 text-xs text-muted-foreground">
            {fullscreenIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

function GalleryThumb({ src, onClick }: { src: string; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer hover-scale" onClick={onClick}>
      {!loaded && !error && <Skeleton className="absolute inset-0" />}
      {error ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-xs text-muted-foreground">
          Sin conexión
        </div>
      ) : (
        <img
          src={src}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
