import AuctionDetail from "@/components/auction/AuctionDetail";

export default async function AuctionDetailPage({
   params 
  }: { 
  params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuctionDetail id={id} />;
}