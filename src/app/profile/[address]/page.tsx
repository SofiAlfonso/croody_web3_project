/**
 * Pagina de perfil de usuario
 * Muestra NFTs del usuario y su actividad
 */
export default function ProfilePage({
  params,
}: {
  params: { address: string };
}) {
  // TODO: Implementar
  return (
    <div>
      <h1>Perfil: {params.address}</h1>
      {/* TODO: NFTs del usuario, historial de actividad */}
    </div>
  );
}
