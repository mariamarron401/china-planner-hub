import { useState, useMemo } from 'react';
import { useTrip } from '@/context/TripContext';
import { useVideoTips } from '@/hooks/useVideoTips';
import { Plus, ExternalLink, Trash2, Video, ChevronDown, ChevronUp, Sparkles, Loader2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { VideoTip, VideoTipEntry, TipCategory } from '@/types/trip';

const platformLabels: Record<VideoTip['platform'], string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  other: 'Otro',
};

const CATEGORY_ORDER: TipCategory[] = ['restaurante', 'cafeteria', 'sitios_a_visitar', 'requisitos_ciudad', 'clip', 'otro'];
const CATEGORY_LABELS: Record<TipCategory, string> = {
  restaurante: '🍜 Restaurantes',
  cafeteria: '☕ Cafeterías',
  sitios_a_visitar: '📍 Sitios a visitar',
  requisitos_ciudad: '📋 Requisitos de la ciudad',
  clip: '🎬 Clips y trucos',
  otro: '✨ Otros',
};

const NO_CITY_KEY = '__sin_ciudad__';
const ANALYSIS_SERVER_URL = import.meta.env.VITE_VIDEO_ANALYSIS_SERVER_URL || 'https://china-video-analysis.onrender.com';

interface GroupedTip {
  text: string;
  video: VideoTip;
}

export default function VideoTips() {
  const { data, orderedCities } = useTrip();
  const { videoTips, addVideoTip, deleteVideoTip } = useVideoTips();

  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showVideoList, setShowVideoList] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newPlatform, setNewPlatform] = useState<VideoTip['platform']>('tiktok');
  const [newTitle, setNewTitle] = useState('');
  const [newTips, setNewTips] = useState('');
  const [newTipCategory, setNewTipCategory] = useState<TipCategory>('otro');
  const [newCityId, setNewCityId] = useState('');

  const resetModalState = () => {
    setNewUrl(''); setNewPlatform('tiktok'); setNewTitle(''); setNewTips(''); setNewTipCategory('otro'); setNewCityId('');
  };

  const handleAnalyze = async () => {
    if (!analyzeUrl.trim()) {
      toast({ title: 'Pega primero la URL del vídeo', variant: 'destructive' });
      return;
    }
    setAnalyzing(true);
    try {
      const res = await fetch(`${ANALYSIS_SERVER_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
      toast({ title: 'Vídeo analizado ✅', description: `"${data.title}" · ${data.tips?.length ?? 0} tips` });
      setAnalyzeUrl('');
    } catch (err: any) {
      toast({
        title: 'No se pudo analizar el vídeo',
        description: err.message?.includes('Instagram')
          ? 'Instagram ha bloqueado la descarga de este vídeo (protección anti-bot). Prueba con TikTok o pégalo a mano con el botón "+".'
          : err.message,
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAdd = async () => {
    if (!newUrl.trim() || !newTitle.trim()) {
      toast({ title: 'URL y título son obligatorios', variant: 'destructive' });
      return;
    }
    const tipsList: VideoTipEntry[] = newTips.split('\n').map(t => t.trim()).filter(Boolean)
      .map(text => ({ text, category: newTipCategory }));
    const now = new Date().toISOString();
    await addVideoTip({
      id: `vt-${Date.now()}`,
      url: newUrl.trim(),
      platform: newPlatform,
      title: newTitle.trim(),
      tips: tipsList,
      cityId: newCityId || undefined,
      status: tipsList.length > 0 ? 'reviewed' : 'pending_review',
      createdAt: now,
      updatedAt: now,
    });
    toast({ title: 'Tip de vídeo añadido ✅' });
    setShowAdd(false);
    resetModalState();
  };

  const cityName = (cityId?: string) => data.cities.find(c => c.id === cityId)?.cityName;

  // Agrupa todos los tips de todos los vídeos por ciudad y, dentro de cada ciudad, por temática.
  const grouped = useMemo(() => {
    const map = new Map<string, Map<TipCategory, GroupedTip[]>>();
    videoTips.forEach(v => {
      const cityKey = v.cityId || NO_CITY_KEY;
      if (!map.has(cityKey)) map.set(cityKey, new Map());
      const catMap = map.get(cityKey)!;
      v.tips.forEach(t => {
        if (!catMap.has(t.category)) catMap.set(t.category, []);
        catMap.get(t.category)!.push({ text: t.text, video: v });
      });
    });
    return map;
  }, [videoTips]);

  const cityOrder = [...orderedCities.map(c => c.id), NO_CITY_KEY].filter(id => grouped.has(id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tips de vídeos</h1>
            <p className="text-sm text-muted-foreground mt-1">{videoTips.length} vídeos analizados</p>
          </div>
          <button
            onClick={() => { resetModalState(); setShowAdd(true); }}
            aria-label="Añadir tip de vídeo"
            className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-sm flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Analizar automáticamente */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">Analizar vídeo automáticamente</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Pega el enlace de un vídeo público de TikTok (Instagram a veces lo bloquea) y se transcribe y guarda solo, ya clasificado por ciudad y temática. Puede tardar hasta 1-2 minutos si el servidor llevaba un rato dormido.
          </p>
          <div className="flex gap-2">
            <Input
              value={analyzeUrl}
              onChange={e => setAnalyzeUrl(e.target.value)}
              placeholder="https://vm.tiktok.com/..."
              disabled={analyzing}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analizar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tips agrupados por ciudad y temática */}
      <div className="px-4 space-y-4">
        {videoTips.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">
            Aún no hay tips guardados. Pega arriba el enlace de un vídeo público sobre China y aparecerá aquí, ya clasificado.
          </div>
        )}
        {cityOrder.map(cityKey => {
          const catMap = grouped.get(cityKey)!;
          const label = cityKey === NO_CITY_KEY ? 'Sin ciudad concreta' : cityName(cityKey) || cityKey;
          return (
            <div key={cityKey}>
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">{label}</h2>
              </div>
              <div className="space-y-3">
                {CATEGORY_ORDER.filter(cat => catMap.has(cat)).map(cat => (
                  <div key={cat} className="bg-card rounded-xl border border-border p-3.5 shadow-sm">
                    <h3 className="text-xs font-semibold text-foreground mb-2">{CATEGORY_LABELS[cat]}</h3>
                    <ul className="space-y-1.5">
                      {catMap.get(cat)!.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start justify-between gap-2">
                          <span className="flex-1">• {item.text}</span>
                          <a
                            href={item.video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Ver vídeo: ${item.video.title}`}
                            className="text-primary flex-shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vídeos analizados (para borrar o ver la transcripción original) */}
      {videoTips.length > 0 && (
        <div className="px-4 mt-6">
          <button
            onClick={() => setShowVideoList(!showVideoList)}
            className="text-xs font-medium text-muted-foreground flex items-center gap-1"
          >
            {showVideoList ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Vídeos analizados ({videoTips.length})
          </button>
          {showVideoList && (
            <div className="space-y-2 mt-2">
              {videoTips.map(v => (
                <div key={v.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Video className="h-4 w-4 text-primary flex-shrink-0" />
                      <h3 className="font-medium text-sm text-foreground truncate">{v.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {platformLabels[v.platform]}
                      </span>
                      <button onClick={() => deleteVideoTip(v.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {v.status === 'pending_review' && (
                    <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-travel-pending-bg text-travel-pending">
                      Pendiente de revisar transcripción
                    </span>
                  )}
                  {(v.transcript || v.caption) && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                        className="text-[10px] text-primary flex items-center gap-1"
                      >
                        {expandedId === v.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {expandedId === v.id ? 'Ocultar transcripción' : 'Ver transcripción / caption original'}
                      </button>
                      {expandedId === v.id && (
                        <div className="mt-2 space-y-2">
                          {v.caption && (
                            <p className="text-xs text-muted-foreground bg-muted rounded-md p-2 whitespace-pre-wrap">{v.caption}</p>
                          )}
                          {v.transcript && (
                            <p className="text-xs text-muted-foreground bg-muted rounded-md p-2 whitespace-pre-wrap">{v.transcript}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {cityName(v.cityId) && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">{cityName(v.cityId)}</span>
                    )}
                    <a href={v.url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-primary flex items-center gap-1 ml-auto">
                      Ver vídeo original <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add modal */}
      <Dialog open={showAdd} onOpenChange={v => { if (!v) { setShowAdd(false); resetModalState(); } }}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo tip de vídeo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">URL del vídeo *</label>
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} className="mt-1" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Plataforma</label>
              <div className="flex gap-2 mt-1">
                {(Object.keys(platformLabels) as VideoTip['platform'][]).map(p => (
                  <button key={p} onClick={() => setNewPlatform(p)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${newPlatform === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {platformLabels[p]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título / resumen corto *</label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Temática de estos tips</label>
              <select value={newTipCategory} onChange={e => setNewTipCategory(e.target.value as TipCategory)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CATEGORY_ORDER.map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tips (uno por línea)</label>
              <textarea value={newTips} onChange={e => setNewTips(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ciudad (opcional)</label>
              <select value={newCityId} onChange={e => setNewCityId(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Ninguna</option>
                {data.cities.map(c => <option key={c.id} value={c.id}>{c.cityName}</option>)}
              </select>
            </div>
            <Button onClick={handleAdd} className="w-full">Añadir tip</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
