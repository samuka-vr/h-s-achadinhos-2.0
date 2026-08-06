import { ProductForm } from "@/components/studio/product-form";
import { listStudioCategories } from "@/server/queries/studio";

type Props={searchParams:Promise<{erro?:string}>};
export default async function NewProduct({searchParams}:Props){const [categories,{erro}]=await Promise.all([listStudioCategories(),searchParams]);return <><div className="studio-top"><h1>Novo produto</h1></div><ProductForm categories={categories} error={erro}/></>}
