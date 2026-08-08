import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { loginAction, signUpAction } from "@/server/actions/auth-actions";
import { getSiteSettings } from "@/server/queries/public";

type Props = { searchParams: Promise<{ erro?: string; mensagem?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const [{ erro, mensagem }, settings] = await Promise.all([searchParams, getSiteSettings()]);
  return (
    <main className="login-page">
      <section className="login-card studio-login-card">
        <Link href="/" className="login-back"><ArrowLeft size={16}/> Voltar ao site</Link>
        <div className="login-logo">
          <span>{settings.logo_url ? <img src={settings.logo_url} alt={settings.brand_name}/> : <>H&amp;S</>}</span>
          <div><strong>Studio</strong><small>{settings.brand_name}</small></div>
        </div>
        <span className="section-kicker"><ShieldCheck size={15}/> Área protegida</span>
        <h1>Entre no painel</h1>
        <p>Gerencie produtos, importações, banners, personalização e analytics.</p>
        {erro ? <div className="message error"><LockKeyhole size={18}/><span>{erro}</span></div> : null}
        {mensagem ? <div className="message success"><Sparkles size={18}/><span>{mensagem}</span></div> : null}
        <form className="stack">
          <label>E-mail<input type="email" name="email" required autoComplete="email" placeholder="seuemail@exemplo.com"/></label>
          <label>Senha<input type="password" name="password" required minLength={8} autoComplete="current-password" placeholder="Mínimo de 8 caracteres"/></label>
          <button formAction={loginAction} className="button primary wide">Entrar no Studio</button>
          <button formAction={signUpAction} className="button secondary wide">Criar primeira conta</button>
        </form>
        <p className="login-help">A criação direta é usada apenas na configuração inicial. Depois disso, novos integrantes devem ser convidados pelo proprietário.</p>
      </section>
    </main>
  );
}
