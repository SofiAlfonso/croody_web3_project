import NftDetail from "@/components/nfts/NftDetail";

export default async function NftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NftDetail id={id} />;
}
