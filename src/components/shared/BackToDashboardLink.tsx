import Link from "next/link";

export default function BackToDashboardLink() {
  return (
    <Link className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900" href="/dashboard">
      Back to Dashboard
    </Link>
  );
}
