import { useEffect, useMemo, useRef, useState } from 'react'
import TerminalWindow from './TerminalWindow'
import { PALETTE } from '../lib/constants'
import { playSound } from '../lib/sound'

const USER = 'student'
const HOST = 'laptop'
const HOME = '/home/student'
const MAX_LINES = 220

const DANGEROUS = [
  { match: /(^|;|&&|\|\|)\s*: *\(\s*\)\s*\{/, message: 'Blocked: that is a fork bomb pattern. It would try to create processes until the machine stops responding.' },
  { match: /\brm\s+.*-rf?\b.*(^|\s)(\/( |$)|(\/\*)|~($|\/)|\.($|\/))/, message: 'Blocked: deleting the filesystem root, home, or current directory is never a teaching exercise. Use a disposable demo folder instead.' },
  { match: /\b(mkfs|dd\s+[^|]*of=|> *\/dev\/)/, message: 'Blocked: writing directly to disks or devices can destroy the host. This playground only edits its pretend filesystem.' },
  { match: /\bchmod\s+(-R\s+)?777\s+(\/( |$)|~($|\/))/, message: 'Blocked: recursive world-writable permissions on the whole system would be a security incident, not a lesson.' },
]

function seedFileSystem() {
  return {
    type: 'dir',
    mode: 0o755,
    children: {
      home: {
        type: 'dir',
        mode: 0o755,
        children: {
          student: {
            type: 'dir',
            mode: 0o755,
            children: {
              'README.md': {
                type: 'file',
                mode: 0o644,
                content: '# website\n\nBuild this folder, then ship it.\n',
              },
              website: {
                type: 'dir',
                mode: 0o755,
                children: {
                  'index.html': {
                    type: 'file',
                    mode: 0o644,
                    content: '<!doctype html>\n<title>My first deploy</title>\n<h1>It works</h1>\n',
                  },
                },
              },
            },
          },
        },
      },
    },
  }
}

function seedTracked() {
  return new Set(['/home/student/README.md', '/home/student/website/index.html'])
}

function splitPath(path) {
  return path.split('/').filter(Boolean)
}

function resolvePath(cwd, input) {
  if (!input || input === '.') return cwd
  if (input === '~') return HOME
  if (input.startsWith('~/')) return `/home/student/${input.slice(2)}`
  if (input.startsWith('/')) return input
  if (input === '..') {
    const parts = splitPath(cwd)
    parts.pop()
    return parts.length ? `/${parts.join('/')}` : '/'
  }
  const base = cwd === '/' ? '' : cwd
  const parts = splitPath(`${base}/${input}`)
  const stack = []
  parts.forEach((part) => {
    if (part === '.') return
    if (part === '..') stack.pop()
    else stack.push(part)
  })
  return stack.length ? `/${stack.join('/')}` : '/'
}

function getNode(root, path) {
  if (path === '/') return root
  let node = root
  for (const part of splitPath(path)) {
    if (node?.type !== 'dir') return null
    node = node.children[part]
    if (!node) return null
  }
  return node
}

function parentPath(path) {
  if (path === '/') return null
  const parts = splitPath(path)
  parts.pop()
  return parts.length ? `/${parts.join('/')}` : '/'
}

function baseName(path) {
  const parts = splitPath(path)
  return parts[parts.length - 1] ?? '/'
}

function clone(node) {
  if (node.type === 'file') return { ...node }
  return {
    ...node,
    children: Object.fromEntries(Object.entries(node.children).map(([name, child]) => [name, clone(child)])),
  }
}

function modeString(mode, isDir) {
  const bits = [(mode >> 6) & 7, (mode >> 3) & 7, mode & 7]
  const text = bits.map((b) => `${b & 4 ? 'r' : '-'}${b & 2 ? 'w' : '-'}${b & 1 ? 'x' : '-'}`).join('')
  return `${isDir ? 'd' : '-'}${text}`
}

function tokenize(input) {
  const tokens = []
  let current = ''
  let quote = null
  for (const char of input) {
    if (quote) {
      if (char === quote) quote = null
      else current += char
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (/\s/.test(char)) {
      if (current) {
        tokens.push(current)
        current = ''
      }
    } else {
      current += char
    }
  }
  if (current) tokens.push(current)
  return tokens
}

/**
 * Interactive pretend terminal backed by an in-memory Linux filesystem.
 * Nothing executes: every command is interpreted by this component.
 */
export default function LiveTerminalPlayground({ title = 'practice terminal', reduced = false }) {
  const [fs, setFs] = useState(seedFileSystem)
  const [cwd, setCwd] = useState(HOME)
  const [history, setHistory] = useState([
    { type: 'out', tone: 'dim', text: 'Practice filesystem ready. Type `help` to see what works here.' },
  ])
  const [value, setValue] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [modified, setModified] = useState(new Set())
  const tracked = useMemo(seedTracked, [])
  const outputRef = useRef(null)

  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history])

  const push = (entries) => {
    setHistory((old) => [...old, ...entries].slice(-MAX_LINES))
  }

  const run = (raw) => {
    const input = raw.trim()
    push([{ type: 'cmd', text: input }])
    if (!input) return
    setCommandHistory((old) => [input, ...old].slice(0, 80))
    setHistoryIndex(-1)

    const blocked = DANGEROUS.find(({ match }) => match.test(input))
    if (blocked) {
      playSound('fail')
      push([{ type: 'out', tone: 'red', text: blocked.message }])
      return
    }

    const [name, ...args] = tokenize(input)
    const handlers = {
      pwd: () => cwd,
      ls: () => list(args),
      cd: () => changeDir(args),
      mkdir: () => makeDir(args),
      touch: () => touch(args),
      cat: () => cat(args),
      echo: () => echo(args, input),
      cp: () => copy(args, false),
      mv: () => move(args),
      rm: () => remove(args),
      grep: () => grep(args),
      chmod: () => chmod(args),
      whoami: () => USER,
      'uname -m': () => 'x86_64',
      uname: () => (args[0] === '-m' ? 'x86_64' : 'Linux'),
      uptime: () => 'load average: 0.31, 0.22, 0.19 (demo output)',
      help: () => 'pwd ls cd mkdir touch cat echo cp mv rm grep chmod whoami uname uptime git status clear',
      clear: () => '__CLEAR__',
      git: () => git(args),
    }

    if (name === 'uname' && args.join(' ') === '-m') {
      push([{ type: 'out', tone: 'dim', text: 'x86_64' }])
      return
    }

    const handler = handlers[name]
    if (!handler) {
      if (name === 'sudo') {
        push([{ type: 'out', tone: 'amber', text: 'This demo has no admin password. Everything here already runs as a safe practice user.' }])
        return
      }
      push([{ type: 'out', tone: 'red', text: `command not found: ${name}. Type help.` }])
      return
    }

    const result = handler()
    if (result === '__CLEAR__') setHistory([])
    else if (result) push(Array.isArray(result) ? result : [{ type: 'out', tone: 'dim', text: result }])
  }

  const list = (args) => {
    const long = args.includes('-l') || args.includes('-la') || args.includes('-al')
    const targetArg = args.find((arg) => !arg.startsWith('-')) ?? '.'
    const path = resolvePath(cwd, targetArg)
    const node = getNode(fs, path)
    if (!node) return { type: 'out', tone: 'red', text: `ls: cannot access '${targetArg}': No such file or directory` }
    if (node.type === 'file') {
      return {
        type: 'out',
        tone: 'dim',
        text: long ? `${modeString(node.mode, false)} ${USER} ${USER} ${node.content.length} ${baseName(path)}` : baseName(path),
      }
    }
    const names = Object.keys(node.children).sort()
    if (!long) return { type: 'out', tone: 'dim', text: names.join('  ') || '(empty directory)' }
    const lines = names.map((name) => {
      const child = node.children[name]
      const size = child.type === 'file' ? child.content.length : 4096
      return `${modeString(child.mode, child.type === 'dir')} ${USER} ${USER} ${String(size).padStart(5, ' ')} ${name}${child.type === 'dir' ? '/' : ''}`
    })
    return { type: 'out', tone: 'dim', text: lines.join('\n') || '(empty directory)' }
  }

  const changeDir = (args) => {
    const path = resolvePath(cwd, args[0] ?? HOME)
    const node = getNode(fs, path)
    if (!node) return { type: 'out', tone: 'red', text: `cd: no such file or directory: ${args[0] ?? ''}` }
    if (node.type !== 'dir') return { type: 'out', tone: 'red', text: `cd: not a directory: ${args[0]}` }
    setCwd(path)
    return null
  }

  const makeDir = (args) => {
    const targets = args.filter((arg) => !arg.startsWith('-'))
    if (!targets.length) return { type: 'out', tone: 'amber', text: 'usage: mkdir [-p] directory...' }
    const makeParents = args.includes('-p')
    const next = clone(fs)
    for (const target of targets) {
      const path = resolvePath(cwd, target)
      const parts = splitPath(path)
      let node = next
      for (let i = 0; i < parts.length; i += 1) {
        const child = node.children[parts[i]]
        if (!child) {
          if (!makeParents && i < parts.length - 1) {
            return { type: 'out', tone: 'red', text: `mkdir: cannot create directory '${target}': missing parent (try -p)` }
          }
          node.children[parts[i]] = { type: 'dir', mode: 0o755, children: {} }
          node = node.children[parts[i]]
        } else if (child.type !== 'dir') {
          return { type: 'out', tone: 'red', text: `mkdir: cannot create directory '${target}': File exists` }
        } else {
          node = child
        }
      }
    }
    setFs(next)
    return null
  }

  const touch = (args) => {
    const targets = args.filter((arg) => !arg.startsWith('-'))
    if (!targets.length) return { type: 'out', tone: 'amber', text: 'usage: touch file...' }
    const next = clone(fs)
    for (const target of targets) {
      const path = resolvePath(cwd, target)
      const parent = getNode(next, parentPath(path))
      if (!parent || parent.type !== 'dir') {
        return { type: 'out', tone: 'red', text: `touch: cannot touch '${target}': No such directory` }
      }
      const name = baseName(path)
      if (!parent.children[name]) parent.children[name] = { type: 'file', mode: 0o644, content: '' }
    }
    setFs(next)
    return null
  }

  const cat = (args) => {
    const target = args.find((arg) => !arg.startsWith('-'))
    if (!target) return { type: 'out', tone: 'amber', text: 'usage: cat file' }
    const node = getNode(fs, resolvePath(cwd, target))
    if (!node) return { type: 'out', tone: 'red', text: `cat: ${target}: No such file or directory` }
    if (node.type !== 'file') return { type: 'out', tone: 'red', text: `cat: ${target}: Is a directory` }
    return { type: 'out', tone: 'dim', text: node.content || '(empty file)' }
  }

  const echo = (args, input) => {
    const redirect = input.match(/^(.*?)\s*(>>|>)\s*(\S+)\s*$/)
    if (!redirect) {
      return { type: 'out', tone: 'dim', text: args.join(' ') }
    }
    const [, textSource, operator, target] = redirect
    const textTokens = tokenize(textSource.replace(/^echo\s+/, ''))
    const text = `${textTokens.join(' ')}\n`
    const path = resolvePath(cwd, target)
    const parent = getNode(fs, parentPath(path))
    if (!parent || parent.type !== 'dir') {
      return { type: 'out', tone: 'red', text: `echo: ${target}: No such directory` }
    }
    const next = clone(fs)
    const liveParent = getNode(next, parentPath(path))
    const name = baseName(path)
    const existing = liveParent.children[name]
    if (existing && existing.type !== 'file') {
      return { type: 'out', tone: 'red', text: `echo: ${target}: Is a directory` }
    }
    const current = existing?.content ?? ''
    liveParent.children[name] = {
      type: 'file',
      mode: existing?.mode ?? 0o644,
      content: operator === '>>' ? current + text : text,
    }
    setFs(next)
    if (tracked.has(path) && liveParent.children[name].content !== initialContent(path)) {
      setModified((old) => new Set(old).add(path))
    }
    return null
  }

  const initialContent = (path) => {
    const node = getNode(seedFileSystem(), path)
    return node?.content ?? ''
  }

  const copy = (args, fromMove) => {
    const flags = args.filter((arg) => arg.startsWith('-'))
    const operands = args.filter((arg) => !arg.startsWith('-'))
    if (operands.length < 2) {
      return { type: 'out', tone: 'amber', text: fromMove ? 'usage: mv source destination' : 'usage: cp [-r] source destination' }
    }
    const [sourceArg, destArg] = operands
    const sourcePath = resolvePath(cwd, sourceArg)
    const source = getNode(fs, sourcePath)
    if (!source) return { type: 'out', tone: 'red', text: `${fromMove ? 'mv' : 'cp'}: cannot stat '${sourceArg}': No such file or directory` }
    if (source.type === 'dir' && !flags.includes('-r') && !fromMove) {
      return { type: 'out', tone: 'red', text: `cp: -r not specified; omitting directory '${sourceArg}'` }
    }
    let destPath = resolvePath(cwd, destArg)
    const destNode = getNode(fs, destPath)
    if (destNode?.type === 'dir') destPath = `${destPath === '/' ? '' : destPath}/${baseName(sourcePath)}`
    if (destPath === sourcePath) {
      return { type: 'out', tone: 'amber', text: `${fromMove ? 'mv' : 'cp'}: '${sourceArg}' and '${destArg}' are the same file` }
    }
    if (destPath.startsWith(`${sourcePath}/`)) {
      return { type: 'out', tone: 'red', text: `${fromMove ? 'mv' : 'cp'}: cannot move a directory into itself` }
    }
    const parent = getNode(fs, parentPath(destPath))
    if (!parent || parent.type !== 'dir') {
      return { type: 'out', tone: 'red', text: `${fromMove ? 'mv' : 'cp'}: cannot move to '${destArg}': No such directory` }
    }
    const next = clone(fs)
    const liveParent = getNode(next, parentPath(destPath))
    const liveSourceParent = getNode(next, parentPath(sourcePath))
    liveParent.children[baseName(destPath)] = clone(getNode(next, sourcePath))
    if (fromMove) delete liveSourceParent.children[baseName(sourcePath)]
    setFs(next)
    return null
  }

  const move = (args) => copy(args, true)

  const remove = (args) => {
    const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr')
    const targets = args.filter((arg) => !arg.startsWith('-'))
    if (!targets.length) return { type: 'out', tone: 'amber', text: 'usage: rm [-r] file...' }
    const next = clone(fs)
    for (const target of targets) {
      const path = resolvePath(cwd, target)
      // The playground only owns paths inside the demo home. Anything at or
      // above it (`/`, `/home`, `~`, `..`) is refused instead of removed.
      if (path === HOME || !path.startsWith(`${HOME}/`)) {
        return { type: 'out', tone: 'red', text: `rm: refusing to remove '${target}': use a disposable demo path` }
      }
      const parent = getNode(next, parentPath(path))
      const node = parent?.children[baseName(path)]
      if (!node) return { type: 'out', tone: 'red', text: `rm: cannot remove '${target}': No such file or directory` }
      if (node.type === 'dir' && Object.keys(node.children).length > 0 && !recursive) {
        return { type: 'out', tone: 'red', text: `rm: cannot remove '${target}': Directory not empty (try rm -r)` }
      }
      delete parent.children[baseName(path)]
    }
    setFs(next)
    return null
  }

  const grep = (args) => {
    const operands = args.filter((arg) => !arg.startsWith('-'))
    if (operands.length < 1) return { type: 'out', tone: 'amber', text: 'usage: grep pattern [file]' }
    const [pattern, fileArg] = operands
    if (!fileArg) return { type: 'out', tone: 'amber', text: 'This demo searches files, not pipes. Try: grep pattern file' }
    const node = getNode(fs, resolvePath(cwd, fileArg))
    if (!node) return { type: 'out', tone: 'red', text: `grep: ${fileArg}: No such file or directory` }
    if (node.type !== 'file') return { type: 'out', tone: 'red', text: `grep: ${fileArg}: Is a directory` }
    const matches = node.content.split('\n').filter((line) => line.includes(pattern))
    return { type: 'out', tone: matches.length ? 'green' : 'dim', text: matches.join('\n') || '(no matches)' }
  }

  const chmod = (args) => {
    const operands = args.filter((arg) => !arg.startsWith('-'))
    if (operands.length < 2) return { type: 'out', tone: 'amber', text: 'usage: chmod 755 file' }
    const [modeText, target] = operands
    if (!/^[0-7]{3,4}$/.test(modeText)) {
      return { type: 'out', tone: 'amber', text: 'This demo accepts numeric modes such as 644, 600 or 755.' }
    }
    const path = resolvePath(cwd, target)
    const next = clone(fs)
    const node = getNode(next, path)
    if (!node) return { type: 'out', tone: 'red', text: `chmod: cannot access '${target}': No such file or directory` }
    node.mode = parseInt(modeText.slice(-3), 8)
    setFs(next)
    return null
  }

  const git = (args) => {
    if (args[0] !== 'status') {
      return { type: 'out', tone: 'amber', text: 'This demo supports `git status` only. Real repos also need add, commit and push.' }
    }
    const untracked = []
    const changed = [...modified]
    const walk = (node, path) => {
      if (node.type === 'file') {
        if (!tracked.has(path)) untracked.push(path)
        return
      }
      Object.entries(node.children).forEach(([name, child]) => walk(child, `${path === '/' ? '' : path}/${name}`))
    }
    walk(fs, '/')
    const lines = ['On branch main', 'Your branch is up to date.']
    if (changed.length) {
      lines.push('', 'Changes not staged for commit:', ...changed.map((path) => `\tmodified:   ${path}`))
    }
    if (untracked.length) {
      lines.push('', 'Untracked files:', ...untracked.map((path) => `\t${path}`))
    }
    if (!changed.length && !untracked.length) lines.push('', 'nothing to commit, working tree clean')
    return { type: 'out', tone: 'dim', text: lines.join('\n') }
  }

  const promptFor = () => {
    const short = cwd === HOME ? '~' : cwd === '/' ? '/' : baseName(cwd)
    return `${USER}@${HOST}:${short}$`
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      run(value)
      setValue('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIndex = Math.min(commandHistory.length - 1, historyIndex + 1)
      if (commandHistory[nextIndex]) {
        setHistoryIndex(nextIndex)
        setValue(commandHistory[nextIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = historyIndex - 1
      if (nextIndex < 0) {
        setHistoryIndex(-1)
        setValue('')
      } else {
        setHistoryIndex(nextIndex)
        setValue(commandHistory[nextIndex])
      }
    }
  }

  return (
    <TerminalWindow title={title} user={USER} host={HOST}>
      <div
        ref={outputRef}
        className="slide-rail max-h-[22rem] min-h-[16rem] overflow-y-auto pr-1"
        role="log"
        aria-label="Practice terminal output"
      >
        {history.map((entry, i) =>
          entry.type === 'cmd' ? (
            <p key={i} className="fs-term font-mono">
              <span style={{ color: PALETTE.cyan }}>{promptFor()} </span>
              <span className="font-semibold text-ink">{entry.text}</span>
            </p>
          ) : (
            <pre
              key={i}
              className="fs-term-out overflow-x-auto whitespace-pre-wrap font-mono"
              style={{
                color:
                  entry.tone === 'red'
                    ? PALETTE.red
                    : entry.tone === 'amber'
                      ? PALETTE.amber
                      : entry.tone === 'green'
                        ? PALETTE.green
                        : PALETTE.inkDim,
              }}
            >
              {entry.text}
            </pre>
          ),
        )}
      </div>
      <form
        className="mt-2 flex shrink-0 items-center gap-2 border-t border-line pt-2"
        onSubmit={(e) => {
          e.preventDefault()
          run(value)
          setValue('')
        }}
      >
        <label htmlFor="playground-input" className="sr-only">
          Type a Linux command
        </label>
        <span className="shrink-0 font-mono text-[clamp(0.95rem,1.2vw,1.2rem)]" style={{ color: PALETTE.cyan }}>
          {promptFor()}
        </span>
        <input
          id="playground-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          placeholder="try: ls -la"
          className="min-w-0 flex-1 bg-transparent font-mono text-[clamp(0.95rem,1.2vw,1.2rem)] text-ink outline-none placeholder:text-ink-faint"
        />
        <span className={reduced ? 'hidden' : 'caret shrink-0 text-green'} aria-hidden="true">
          ▊
        </span>
      </form>
    </TerminalWindow>
  )
}
