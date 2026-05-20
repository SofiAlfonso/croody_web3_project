interface NotFoundStateProps {
  title: string;
  description: string;
  maxWidthClassName?: string;
}

export default function NotFoundState({
  title,
  description,
  maxWidthClassName = "max-w-6xl",
}: NotFoundStateProps) {
  return (
    <main className={`${maxWidthClassName} mx-auto px-6 py-16`}>
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
        <div className="text-lg font-semibold text-neutral-900">{title}</div>
        <div className="mt-2 text-sm text-neutral-700">{description}</div>
      </div>
    </main>
  );
}
