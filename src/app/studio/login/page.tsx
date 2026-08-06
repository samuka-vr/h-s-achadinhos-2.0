import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { loginAction, signUpAction } from "@/server/actions/auth-actions";

type Props = { searchParams: Promise<{ erro?: string; mensagem?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { erro, mensagem } = await searchParams;
  return (
    <main className="login-page">
      <section className="login-card studio-login-card">
        <Link href="/" className="login-back"><ArrowLeft size={16}/> Voltar ao site</Link>
        <div className="login-logo"><span>H&amp;S</span><div><strong>Studio</strong><small>Central de gestão</small></div></div>
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
