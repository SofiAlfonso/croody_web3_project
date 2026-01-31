/**
 * Pagina de detalle de subasta
 * Muestra la subasta activa con temporizador y formulario de puja
 */
export default function AuctionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // TODO: Implementar
  return (
    <div>
      <h1>Subasta #{params.id}</h1>
      {/* TODO: AuctionTimer, BidForm, BidHistory */}
    </div>
  );
}
