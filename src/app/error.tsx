"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="login-page"><section className="login-card"><h1>Não foi possível carregar</h1><p>Ocorreu um erro inesperado. Nenhum detalhe técnico foi exposto.</p><button onClick={reset} className="button primary">Tentar novamente</button></section></main>;
}
