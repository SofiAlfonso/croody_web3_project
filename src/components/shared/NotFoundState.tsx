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
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
        <div className="text-lg font-semibold text-neutral-900">{title}</div>
        <div className="text-sm text-neutral-500 mt-2">{description}</div>
      </div>
    </main>
  );
}
