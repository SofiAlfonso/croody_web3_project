import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  // Temporary: demo mode without real wallet connection
  const walletAddress: string | null = null;

  return <Dashboard walletAddress={walletAddress} />;
}