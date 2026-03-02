import HomeClient from "@/components/HomeClient";

export default function Home() {
  // In real use, this can come from cookies/session/db on the server.
  const initialWalletAddress: string | null = null;

  return <HomeClient initialWalletAddress={initialWalletAddress} />;
}
