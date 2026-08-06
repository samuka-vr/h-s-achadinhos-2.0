import { bootstrapOwnerAction } from "@/server/actions/auth-actions";
import { requireUser } from "@/server/auth";

type Props={searchParams:Promise<{erro?:string}>};
export default async function BootstrapPage({searchParams}:Props){await requireUser();const {erro}=await searchParams;return <main className="login-page"><section className="login-card"><h1>Configurar proprietário</h1><p>Esta ação funciona somente quando ainda não existe nenhum papel administrativo cadastrado. A primeira conta se tornará <strong>owner</strong>.</p>{erro?<div className="message error">{erro}</div>:null}<form action={bootstrapOwnerAction}><button className="button primary">Tornar esta conta proprietária</button></form></section></main>}
