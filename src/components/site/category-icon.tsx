import {
  Baby,
  Car,
  CookingPot,
  HeartPulse,
  Home,
  LampDesk,
  PawPrint,
  Plug,
  Shirt,
  Sparkles,
  SprayCan,
  Wrench,
} from "lucide-react";

export function CategoryIcon({ name, size = 22 }: { name: string; size?: number }) {
  const value = name.toLowerCase();
  if (value.includes("cozinha")) return <CookingPot size={size} />;
  if (value.includes("limpeza") || value.includes("lavanderia")) return <SprayCan size={size} />;
  if (value.includes("eletr") || value.includes("áudio") || value.includes("carreg")) return <Plug size={size} />;
  if (value.includes("beleza") || value.includes("cabelo")) return <Sparkles size={size} />;
  if (value.includes("saúde") || value.includes("bem-estar")) return <HeartPulse size={size} />;
  if (value.includes("auto")) return <Car size={size} />;
  if (value.includes("pet")) return <PawPrint size={size} />;
  if (value.includes("bebê") || value.includes("infantil")) return <Baby size={size} />;
  if (value.includes("moda")) return <Shirt size={size} />;
  if (value.includes("ferrament")) return <Wrench size={size} />;
  if (value.includes("ilumina") || value.includes("decora")) return <LampDesk size={size} />;
  return <Home size={size} />;
}
