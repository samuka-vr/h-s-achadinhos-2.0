import { Crown, ShieldCheck } from "lucide-react";
import { bootstrapOwnerAction } from "@/server/actions/auth-actions";
import { requireUser } from "@/server/auth";
import { getSiteSettings } from "@/server/queries/public";

type Props = { searchParams: Promise<{ erro?: string }> };

export default async function BootstrapPage({ searchParams }: Props) {
  await requireUser();
  const [{ erro }, settings] = await Promise.all([searchParams, getSiteSettings()]);
  return (
    <main className="login-page">
      <section className="login-card bootstrap-card">
        <div className="login-logo bootstrap-brand">
          <span>{settings.logo_url ? <img src={settings.logo_url} alt={settings.brand_name}/> : <>H&amp;S</>}</span>
          <div><strong>Studio</strong><small>{settings.brand_name}</small></div>
        </div>
        <span className="bootstrap-icon"><Crown size={28}/></span>
        <span className="section-kicker"><ShieldCheck size={15}/> Configuração inicial</span>
        <h1>Definir proprietário</h1>
        <p>Esta ação transforma a primeira conta administrativa em proprietária do Studio.</p>
        <div className="bootstrap-notice"><strong>Importante</strong><span>O processo só funciona enquanto ainda não existir outro proprietário cadastrado.</span></div>
        {erro ? <div className="message error">{erro}</div> : null}
        <form action={bootstrapOwnerAction}><button className="button primary wide">Tornar esta conta proprietária</button></form>
      </section>
    </main>
  );
}
