import { Fragment } from 'react'
import { Callout } from '../components/Card'
import ScriptedTerminal from '../components/ScriptedTerminal'
import BootSequence from '../components/BootSequence'
import LiveTerminalPlayground from '../components/LiveTerminalPlayground'
import CompareTable from '../components/CompareTable'
import PipelineDiagram from '../components/PipelineDiagram'
import { Stagger, Reveal } from '../components/PartHeader'
import Quiz from '../components/Quiz'
import DistroPicker from '../components/DistroPicker'
import ArchChips from '../components/ArchChips'
import DeployFlow from '../components/DeployFlow'
import Badge from '../components/Badge'
import PoisonPush, { ServerDashboard } from '../components/PoisonPush'
import PushDuel from '../components/PushDuel'
import DirectoryTree from '../components/DirectoryTree'
import PermissionExplorer from '../components/PermissionExplorer'
import SplitPanels from '../components/SplitPanels'
import RwxDiagram from '../components/RwxDiagram'
import PipeFlow from '../components/PipeFlow'
import CodeBlock from '../components/CodeBlock'
import Timeline from '../components/Timeline'
import KeyChip from '../components/KeyChip'
import StatementCard from '../components/StatementCard'
import SectionTitleCard from '../components/SectionTitleCard'
import QuestionChip from '../components/QuestionChip'
import ArchiveBox from '../components/ArchiveBox'
import PacketHop from '../components/PacketHop'
import ContainerStack from '../components/ContainerStack'
import SchedulerSim from '../components/SchedulerSim'
import DiskHeadSim from '../components/DiskHeadSim'
import PageFaultSim from '../components/PageFaultSim'
import FaultTypesCard from '../components/FaultTypesCard'
import SpinningPlatter from '../components/SpinningPlatter'
import ThrashingSim from '../components/ThrashingSim'
import { deckMeta } from '../content/scenes'

const asArray = (x) => (Array.isArray(x) ? x : [x])

function renderBlock(block, key, ctx) {
  const { reduced } = ctx
  switch (block.type) {
    case 'lead':
      return (
        <p
          key={key}
          className="fs-lead max-w-[62ch] text-ink-dim"
        >
          {block.text}
        </p>
      )

    case 'bullets':
      return (
        <Stagger key={key} className="flex flex-col" gap={reduced ? 0 : 0.05}>
          {asArray(block.items).map((item, i) => {
            const text = typeof item === 'string' ? item : item.text
            return (
              <p
                key={i}
                className="fs-body border-b border-line py-2 leading-relaxed text-ink last:border-b-0"
              >
                {text}
              </p>
            )
          })}
        </Stagger>
      )

    case 'cards':
      return (
        <Stagger key={key} className="flex flex-col" gap={reduced ? 0 : 0.05}>
          {asArray(block.items).map((c, i) => (
            <div
              key={c.title ?? i}
              className="flex items-baseline gap-4 border-b border-line py-2.5 last:border-b-0"
            >
              <span
                aria-hidden="true"
                className="shrink-0 font-display text-[clamp(1.75rem,2.5vw,2.25rem)] font-semibold leading-none tabular-nums text-ink-faint"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="fs-h3 font-display font-semibold leading-tight text-ink">
                  {c.title}
                  {c.subtitle ? (
                    <span className="font-mono text-[0.62em] font-normal tracking-[0.04em] text-ink-faint">
                      {' '}
                      · {c.subtitle}
                    </span>
                  ) : null}
                </p>
                {c.body ? (
                  <p className="fs-card mt-0.5 leading-snug text-ink-dim">{c.body}</p>
                ) : null}
              </div>
            </div>
          ))}
        </Stagger>
      )

    case 'callout':
      return (
        <Reveal key={key}>
          <Callout {...block}>
            {block.body ?? block.text}
          </Callout>
        </Reveal>
      )

    case 'terminal':
      return (
        <ScriptedTerminal
          key={key}
          title={block.title}
          user={block.user}
          host={block.host}
          prompt={block.prompt}
          steps={block.steps}
          reduced={reduced}
        />
      )

    case 'boot':
      return (
        <BootSequence
          key={key}
          title={block.title ?? deckMeta.title}
          subtitle={block.subtitle ?? deckMeta.subtitle}
          presenter={block.presenter ?? deckMeta.author}
          user={block.user}
          host={block.host}
          reduced={reduced}
        />
      )

    case 'playground':
      return <LiveTerminalPlayground key={key} title={block.title} reduced={reduced} />

    case 'table':
      return <CompareTable key={key} {...block} />

    case 'poison':
      return <PoisonPush key={key} {...block} reduced={reduced} />

    case 'push-duel':
      return <PushDuel key={key} {...block} reduced={reduced} />

    case 'dashboard':
      return <ServerDashboard key={key} {...block} reduced={reduced} />

    case 'tree':
    case 'directory':
      return <DirectoryTree key={key} {...block} reduced={reduced} />

    case 'permissions':
      return <PermissionExplorer key={key} {...block} reduced={reduced} />

    case 'distro':
      return <DistroPicker key={key} {...block} />

    case 'arch':
      return <ArchChips key={key} {...block} reduced={reduced} />

    case 'deploy':
      return <DeployFlow key={key} {...block} reduced={reduced} />

    case 'timeline':
      return <Timeline key={key} {...block} reduced={reduced} />

    case 'code':
      return <CodeBlock key={key} {...block} reduced={reduced} />

    case 'rwx':
      return <RwxDiagram key={key} {...block} reduced={reduced} />

    case 'pipe':
    case 'pipeflow':
      return <PipeFlow key={key} {...block} reduced={reduced} />

    case 'keychip':
      return <KeyChip key={key} {...block}>{block.text ?? block.children}</KeyChip>

    case 'keychips':
      return (
        <div key={key} className="flex flex-wrap items-center gap-2" role="group" aria-label="Keyboard shortcuts">
          {(block.items ?? []).map((item, i) => (
            <KeyChip key={i}>{item.text ?? item.children}</KeyChip>
          ))}
        </div>
      )

    case 'glow':
      return <StatementCard key={key} {...block}>{block.body ?? block.text}</StatementCard>

    case 'section-title':
      return <SectionTitleCard key={key} {...block} reduced={reduced} />

    case 'question':
      return <QuestionChip key={key} {...block} reduced={reduced} />

    case 'archive':
      return <ArchiveBox key={key} {...block} reduced={reduced} />

    case 'packet':
      return <PacketHop key={key} {...block} reduced={reduced} />

    case 'containers':
      return <ContainerStack key={key} {...block} reduced={reduced} />

    case 'scheduler':
      return <SchedulerSim key={key} {...block} reduced={reduced} />

    case 'disk':
      return <DiskHeadSim key={key} {...block} reduced={reduced} />

    case 'paging':
      return <PageFaultSim key={key} {...block} reduced={reduced} />

    case 'fault-types':
      return <FaultTypesCard key={key} reduced={reduced} />

    case 'platter':
      return <SpinningPlatter key={key} reduced={reduced} />

    case 'thrashing':
      return <ThrashingSim key={key} reduced={reduced} />

    case 'split-panels':
      return <SplitPanels key={key} {...block} reduced={reduced} />

    case 'pipeline':
      return <PipelineDiagram key={key} {...block} reduced={reduced} />

    case 'quiz':
      return <Quiz key={key} {...block} />

    case 'terminal-typing':
      return (
        <ScriptedTerminal
          key={key}
          title={block.title}
          user={block.user}
          host={block.host}
          prompt={block.prompt}
          steps={[{ command: block.cmd, output: block.out, tone: block.tone ?? 'green' }]}
          reduced={reduced}
        />
      )

    case 'badge':
      return <Badge key={key} kind={block.kind} size={block.size} />

    default:
      if (typeof block === 'string' || typeof block === 'number') {
        return (
          <p key={key} className="fs-card text-ink-dim">
            {block}
          </p>
        )
      }
      return null
  }
}

export default function Blocks({ blocks = [], reduced = false, className = '' }) {
  const list = Array.isArray(blocks) ? blocks : [blocks]
  return (
    <div className={`flex min-h-0 flex-col ${className}`} style={{ gap: 'var(--gap-slide)' }}>
      {list.map((block, i) => (
        <Fragment key={block.key ?? block.type ?? i}>{renderBlock(block, i, { reduced })}</Fragment>
      ))}
    </div>
  )
}
