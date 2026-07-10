import VerticalLanding from "@/components/VerticalLanding";
export const revalidate = 60;
export const metadata = { title: "Clothing — AndumPola" };
export default function Page() {
  return <VerticalLanding vertical="clothing" />;
}
