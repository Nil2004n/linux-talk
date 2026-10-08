import Quiz from './Quiz'
import { PALETTE } from '../lib/constants'

/**
 * Five-question distribution picker.
 *
 * This is a purpose-built wrapper around the generic quiz: it expects five
 * scored questions and five result cards, then shows the winning
 * beginner/developer/advanced/security recommendation with one reason.
 */
export default function DistroPicker({ title = 'Which distro are you?', questions = [], results = {} }) {
  const valid =
    questions.length === 5 &&
    ['ubuntu', 'mint', 'fedora', 'arch', 'kali'].every((key) => results[key]?.name)

  if (!valid) {
    return (
      <div className="rounded-md border border-line bg-abyss p-4" role="note">
        <p className="font-mono text-[0.9rem] tracking-[0.04em]" style={{ color: PALETTE.amber }}>
          Distro picker needs five questions
        </p>
        <p className="mt-1 text-[1rem] text-ink-dim">
          Add one question for experience, workload, learning style, software and update preference.
        </p>
      </div>
    )
  }

  return <Quiz title={title} questions={questions} results={results} accent={PALETTE.cyan} />
}
