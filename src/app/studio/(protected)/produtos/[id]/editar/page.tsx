import { notFound } from "next/navigation";
import { ProductForm } from "@/components/studio/product-form";
import { getStudioProduct, listStudioCategories } from "@/server/queries/studio";

type Props={params:Promise<{id:string}>;searchParams:Promise<{erro?:string}>};
export default async function EditProduct({params,searchParams}:Props){const [{id},{erro}]=await Promise.all([params,searchParams]);const [product,categories]=await Promise.all([getStudioProduct(id),listStudioCategories()]);if(!product)notFound();return <><div className="studio-top"><h1>Editar produto</h1></div><ProductForm product={product} categories={categories} error={erro}/></>}
