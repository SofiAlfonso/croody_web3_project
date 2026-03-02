import AuctionDetail from "@/components/AuctionDetail";

export default async function AuctionDetailPage({
   params 
  }: { 
  params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuctionDetail id={id} />;
}