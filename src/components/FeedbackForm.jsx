/**
 * Student feedback form embedded at the end of the page.
 * The Google Form link is also provided as a plain anchor for environments
 * where iframes are blocked.
 */
export default function FeedbackForm({ url, title = 'Student feedback' }) {
  return (
    <div className="flex w-full max-w-[56rem] flex-col gap-3">
      <p className="fs-body-sm text-ink-dim">
        This session is student-run and improves with your notes. Two minutes, no sign-in.
      </p>
      <iframe
        title={title}
        src={url}
        loading="lazy"
        className="h-[32rem] w-full rounded-md border border-line bg-abyss"
      />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="font-mono text-[0.9rem] tracking-[0.04em] text-cyan underline-offset-4 hover:underline"
      >
        Open the form in a new tab ↗
      </a>
    </div>
  )
}
