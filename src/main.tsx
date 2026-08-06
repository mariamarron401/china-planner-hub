import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";

createRoot(document.getElementById("root")!).render(<App />);

// Deja la app guardada en el móvil para que arranque sin red (imprescindible en China,
// donde github.io va lento o no responde). Ver src/lib/registerServiceWorker.ts.
registerServiceWorker();
