import { useState } from 'react';
import { useVideoTips } from '@/hooks/useVideoTips';
import { useTrip } from '@/context/TripContext';
import { Plus, ExternalLink, Trash2, Video, Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { VideoTip } from '@/types/trip';

const platformLabels: Record<VideoTip['platform'], string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  other: 'Otro',
};

const ANALYSIS_SERVER_URL = import.meta.env.VITE_VIDEO_ANALYSIS_SERVER_URL || 'http://localhost:8787';

export default function VideoTips() {
  const { videoTips, addVideoTip, deleteVideoTip } = useVideoTips();
  const { data } = useTrip();

  const [analyzeUrl, setAnalyzeUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newPlatform, setNewPlatform] = useState<VideoTip['platform']>('tiktok');
  const [newTitle, setNewTitle] = useState('');
  const [newTips, setNewTips] = useState('');
  const [newCityId, setNewCityId] = useState('');
  const [draftTranscript, setDraftTranscript] = useState('');
  const [draftCaption, setDraftCaption] = useState('');

  const resetModalState = () => {
    setNewUrl(''); setNewPlatform('tiktok'); setNewTitle(''); setNewTips(''); setNewCityId('');
    setDraftTranscript(''); setDraftCaption('');
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
      if (!res.ok) throw new Error(data.detail || data.error || 'Error desconocido');

      setNewUrl(analyzeUrl.trim());
      setNewPlatform(data.platform || 'other');
      setNewTitle(data.title || '');
      setNewTips('');
      setDraftTranscript(data.transcript || '');
      setDraftCaption(data.caption || '');
      setShowAdd(true);
      setAnalyzeUrl('');
      toast({ title: 'Vídeo transcrito ✅', description: 'Revisa la transcripción y anota los tips antes de guardar.' });
    } catch (err: any) {
      toast({
        title: 'No se pudo analizar el vídeo',
        description: err.message?.includes('fetch')
          ? 'No se puede conectar con el servidor local de análisis. ¿Está arrancado con "node execution/video-tips-server.mjs"?'
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
    const tipsList = newTips.split('\n').map(t => t.trim()).filter(Boolean);
    await addVideoTip({
      id: `vt-${Date.now()}`,
      url: newUrl.trim(),
      platform: newPlatform,
      title: newTitle.trim(),
      tips: tipsList,
      cityId: newCityId || undefined,
      transcript: draftTranscript || undefined,
      caption: draftCaption || undefined,
      status: tipsList.length > 0 ? 'reviewed' : 'pending_review',
      createdAt: '',
      updatedAt: '',
    });
    toast({ title: 'Tip de vídeo añadido ✅' });
    setShowAdd(false);
    resetModalState();
  };

  const cityName = (cityId?: string) => data.cities.find(c => c.id === cityId)?.cityName;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Tips de vídeos</h1>
        <p className="text-sm text-muted-foreground mt-1">{videoTips.length} vídeos analizados</p>
      </div>

      {/* Analizar automáticamente */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">Analizar vídeo automáticamente</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Pega el enlace de un vídeo público de TikTok/Instagram/YouTube y se descarga y transcribe solo. Requiere tener arrancado en este ordenador <code className="bg-muted px-1 rounded">node execution/video-tips-server.mjs</code>. Puede tardar 1-3 minutos.
          </p>
          <div className="flex gap-2">
            <Input
              value={analyzeUrl}
              onChange={e => setAnalyzeUrl(e.target.value)}
              placeholder="https://www.tiktok.com/..."
              disabled={analyzing}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analizar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-2">
        {videoTips.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">
            Aún no hay tips guardados. Manda un enlace de un vídeo público de TikTok/Instagram sobre China y se transcribe y resume aquí.
          </div>
        )}
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
            {v.tips.length > 0 && (
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {v.tips.map((t, i) => (
                  <li key={i} className="text-xs text-muted-foreground">{t}</li>
                ))}
              </ul>
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

      {/* FAB */}
      <button
        onClick={() => { resetModalState(); setShowAdd(true); }}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>

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
            {(draftCaption || draftTranscript) && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Transcripción / caption (referencia, para sacar los tips)</label>
                <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-input bg-muted p-2 text-xs text-muted-foreground whitespace-pre-wrap">
                  {draftCaption && <p className="mb-2">{draftCaption}</p>}
                  {draftTranscript && <p>{draftTranscript}</p>}
                </div>
              </div>
            )}
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
