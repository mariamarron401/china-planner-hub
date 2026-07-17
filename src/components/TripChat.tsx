import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useTrip } from '@/context/TripContext';
import { answerQuestion, QUICK_SUGGESTIONS } from '@/lib/tripAssistant';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

const WELCOME =
  '¡Hola! 👋 Soy vuestro asistente del viaje a China. Preguntadme lo que queráis: hoteles, trenes, vuelos, entradas, presupuesto, apps... Tengo todos los datos del viaje y respondo al instante, incluso sin internet.';

/** Renderiza texto con **negritas**, enlaces y saltos de línea. */
function renderText(text: string) {
  return text.split('\n').map((line, i) => (
    <span key={i} className="block min-h-[0.5em]">
      {renderInline(line)}
    </span>
  ));
}

function renderInline(line: string) {
  // divide por **negritas** y por URLs
  const tokens = line.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (/^https?:\/\//.test(tok)) {
      return (
        <a key={i} href={tok} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
          abrir enlace
        </a>
      );
    }
    return <span key={i}>{tok}</span>;
  });
}

export default function TripChat() {
  const { data } = useTrip();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'assistant', text: WELCOME },
  ]);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const userMsg: ChatMessage = { id: nextId.current++, role: 'user', text: clean };
    const reply: ChatMessage = { id: nextId.current++, role: 'assistant', text: answerQuestion(clean, data) };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir asistente del viaje"
          className="fixed bottom-20 left-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-fade-in"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg h-[80vh] bg-background rounded-t-2xl shadow-2xl flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="gradient-hero px-4 py-3 rounded-t-2xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-primary-foreground">
                <Sparkles className="h-5 w-5" />
                <div>
                  <div className="font-semibold text-sm leading-tight">Asistente del viaje</div>
                  <div className="text-[11px] text-primary-foreground/80 leading-tight">Pregúntame lo que quieras 🇨🇳</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-primary-foreground/90 hover:text-primary-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border text-foreground rounded-bl-sm'
                    )}
                  >
                    {m.role === 'assistant' ? renderText(m.text) : m.text}
                  </div>
                </div>
              ))}

              {/* Sugerencias rápidas (solo al inicio) */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1.5 hover:bg-primary/20 transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Entrada de texto */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-border p-2.5 flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                aria-label="Enviar"
                disabled={!input.trim()}
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
