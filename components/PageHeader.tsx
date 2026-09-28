type Props = {
  eyebrow: string;
  title: React.ReactNode;
  /** Intro copy under the title; kept to a readable measure on wide screens. */
  children?: React.ReactNode;
  /** Buttons under the intro — stacked full-width on phones, in a row from `sm`. */
  actions?: React.ReactNode;
  /** Optional panel shown beside the title from `lg`, below it on smaller screens. */
  aside?: React.ReactNode;
  className?: string;
};

/** The shared top of every page: centred eyebrow, then title, intro and optional aside. */
export default function PageHeader({ eyebrow, title, children, actions, aside, className = '' }: Props) {
  return (
    <header className={`mb-8 md:mb-10 ${className}`}>
      <p className="eyebrow text-center">{eyebrow}</p>
      <div
        className={`mt-6 md:mt-8 ${
          aside
            ? 'grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end xl:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] xl:gap-16'
            : ''
        }`}
      >
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight text-neutral-50 sm:text-3xl xl:text-4xl">
            {title}
          </h1>
          {children && <div className="mt-4 max-w-2xl text-neutral-600 xl:max-w-3xl">{children}</div>}
          {actions && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">{actions}</div>
          )}
        </div>
        {aside}
      </div>
    </header>
  );
}
