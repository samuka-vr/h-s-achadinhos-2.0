"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="pt-BR"><body><main className="login-page"><section className="login-card"><h1>Falha inesperada</h1><p>Não foi possível iniciar a aplicação.</p><button onClick={reset} className="button primary">Tentar novamente</button></section></main></body></html>;
}
