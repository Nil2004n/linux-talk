/**
 * =============================================================================
 *  SCENE CONTENT — edit this file only. Never edit components for wording.
 * =============================================================================
 *
 *  Every entry is one scene. Most scenes need only these fields:
 *  {
 *    id:     'unique-id',              // stable, used as React key
 *    part:   'intro'|'A'|'B'|'C'|'D'|'closing',
 *    kind:   'part' | 'blocks',         // layout renderer
 *    badge:  'LIVE' | 'SLIDE' | 'TAKE-HOME',
 *    kicker: 'Part B · Terminal',      // small mono line above the title
 *    title:  'Scene title',             // rendered as the h2
 *    lead:   'optional one-liner',      // optional paragraph under the title
 *    command:'ls -la',                  // bottom-left command chip; click copies
 *    notes:  'Speaker notes. Shown in presenter mode (P).',
 *    bullets: ['One takeaway', ...],   // optional shortcut for one bullets block
 *    terminalScript: [                  // optional shortcut for one terminal
 *      { command: 'uname -m', output: 'x86_64', tone: 'green' }
 *    ],
 *    replayLabel: 'replay both pipelines', // optional label for replay controls
 *    cols:   2,                         // optional 2-column body layout
 *    body:   [ ...blocks ]              // full declarative model, when needed
 *  }
 *
 *  Block shapes
 *  ------------
  *  { type:'boot', title, subtitle, presenter }
  *  { type:'lead',    text }
  *  { type:'bullets', items: ['text' | { text, tone:'cyan|green|red|amber', glyph }] }
  *  { type:'cards', cols: 3, items: [{ title, subtitle, icon, tone, body }] }
  *  { type:'callout', tone:'warn|bad|good|info', icon, title, body }
  *  { type:'terminal', title, steps: [{ cmd, out, tone:'dim|green|red|amber|cyan' }] }
  *  { type:'playground', title }
  *  { type:'directory', nodes: [{ label, note, type, children }] }
  *  { type:'permissions', filename, initial }
  *  { type:'pipe' | 'pipeflow', cmd, stages: [{ cmd, out }], caption }
  *  { type:'distro', title, questions, results }
  *  { type:'arch', output }
  *  { type:'deploy', title, steps: [{ id, command, detail }] }
  *  { type:'table',    head, columns:[{title,tone}], rows:[{label, ...}] }
  *  { type:'pipeline', stages:[{ id, label, cmd, detail, status }] }
  *  { type:'push-duel', poisonous: {...}, healthy: {...} }
  *  { type:'quiz',     questions, results }
  *  { type:'question', question, answer }
  *  { type:'archive', source, archive, command }
  *  { type:'packet', from, to }
  *  { type:'containers', layers: [{ id, label, detail }] }
  *  { type:'scheduler', processes, algorithm, quantum }
  *  { type:'disk', requests, head }
  *  { type:'paging', frames, refs }
  *  { type:'fault-types' }
  *  { type:'keychip', text }
  *  { type:'glow', title, subtitle, accent, body }
  *  { type:'section-title', eyebrow, title, lead, part, badge }
 *
 *  NOTE: all example commands/outputs below use FAKE credentials and fake host
 *  names. Replace them with your own details before presenting.
 * =============================================================================
 */

export const deckMeta = {
  title: 'Linux and the Terminal: from first command to live website',
  subtitle: 'A live online session for first-year engineering students',
  author: 'YOUR NAME',
  handle: '@your-handle',
  contact: 'your.email@example.com',
  github: 'github.com/your-handle',
  linkedin: 'linkedin.com/in/your-handle',
  sessionDate: 'Session 1 · first-year engineering',
}

export const scenes = [
  /* ---------------------------------------------------------------- INTRO */
  {
    id: 'boot',
    part: 'intro',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Opening · boot sequence',
    title: null,
    command: 'whoami',
    notes:
      'Let the boot play once, or press any key to skip. Ask who has opened a terminal before, then type whoami live.',
    body: [
      {
        type: 'boot',
        presenter: 'YOUR NAME',
      },
    ],
  },

  {
    id: 'hook',
    part: 'intro',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'The hook',
    title: 'Linux runs the internet. The terminal is how you drive it.',
    lead: 'One inventor made the kernel and the version-control tool. Hosting came later.',
    command: 'uname -a',
    notes:
      'Type both commands live. Linus Torvalds created Linux in 1991 and Git in 2005; GitHub is a separate company built on top of Git.',
    body: [
      {
        type: 'terminal',
        title: 'the machine',
        steps: [{ cmd: 'uname -a', out: 'Linux student 6.8.0-generic x86_64 GNU/Linux' }],
      },
      {
        type: 'terminal',
        title: 'the history',
        steps: [{ cmd: 'git log --oneline', out: 'a1b2c3d Add homepage\n9f8e7d6 Fix header' }],
      },
      {
        type: 'bullets',
        items: [
          { text: 'Linus Torvalds created Linux and Git.', tone: 'green' },
          { text: 'GitHub is a separate company built on Git.', tone: 'cyan' },
        ],
      },
    ],
  },

  /* --------------------------------------------------------- PART A HEADER */
  {
    id: 'part-a',
    part: 'A',
    kind: 'part',
    badge: 'SLIDE',
    title: 'Why Linux',
    notes: 'Keep it fast: reasons, comparison, architectures, distros, quiz, where it runs, Torvalds.',
    agenda: [
      'Why use Linux · why it beats Windows for developers',
      'CPU architectures · distro families · choose your OS',
      'Where Linux runs · and the Linus Torvalds connection',
    ],
  },

  /* ------------------------------------------------------------- PART A: 1 */
  {
    id: 'why-linux',
    part: 'A',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part A · topic 1',
    title: 'Why use Linux',
    lead: 'Four properties make it the engineer’s default.',
    command: 'uname -o',
    notes:
      'Land each card in one sentence: free/open, scriptable, lightweight, and already running the internet.',
    body: [
      {
        type: 'cards',
        cols: 2,
        items: [
          { title: 'Free and open', icon: '🔓', tone: 'good', body: 'No licence. Readable, auditable code.' },
          { title: 'Scriptable', icon: '🤖', tone: 'info', body: 'Text in, text out. CI is built on pipes.' },
          { title: 'Lightweight', icon: '🪶', tone: 'info', body: 'Small installs fit servers and CI runners.' },
          { title: 'Runs the internet', icon: '☁️', tone: 'good', body: 'Cloud, routers and containers choose Linux.' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART A: 2 */
  {
    id: 'why-linux-vs-windows',
    part: 'A',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part A · topic 2',
    title: 'Better for developers and servers',
    lead: 'Use the right tool. Linux wins deployment; Windows wins desktop.',
    command: 'diff <(echo windows) <(echo linux)',
    notes:
      'Say it plainly: Linux is better for developers and servers, not for everyone. Windows keeps mainstream software and many games.',
    body: [
      {
        type: 'question',
        question: 'If Windows has great apps and games, why learn Linux?',
        answer: 'Because deployment speaks Linux: servers, cloud, containers and CI.',
      },
      {
        type: 'table',
        head: 'Dimension',
        columns: [
          { key: 'left', title: 'Windows', tone: 'left' },
          { key: 'right', title: 'Linux', tone: 'right' },
        ],
        rows: [
          { label: 'Servers & cloud', left: 'rarely', right: 'the default' },
          { label: 'Packages', left: 'winget / choco', right: 'apt, dnf, pacman' },
          { label: 'Automation', left: 'PowerShell', right: 'bash, built for pipes' },
          { label: 'File names', left: 'backslashes', right: 'slashes' },
          { label: 'Case sensitivity', left: 'no', right: 'yes' },
          { label: 'Desktop & games', left: 'the better choice' },
        ],
        caption: 'Verdict: Linux is the better tool for developers and servers. Windows remains a fine desktop OS.',
      },
    ],
  },

  /* ------------------------------------------------------------- PART A: 3 */
  {
    id: 'cpu-architectures',
    part: 'A',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part A · topic 3',
    title: 'CPU architectures: x86_64, ARM, RISC-V',
    lead: 'One portable kernel runs all three. Prove it:',
    command: 'uname -m',
    notes:
      'Run uname -m live. The kernel is portable, so one codebase runs everywhere; RISC-V is company-neutral.',
    body: [
      {
        type: 'arch',
        output: 'x86_64',
      },
    ],
  },

  /* ------------------------------------------------------------- PART A: 4 */
  {
    id: 'distro-types',
    part: 'A',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part A · topic 4',
    title: 'Same kernel, different personalities',
    lead: 'A distro adds packages, defaults and tools around Linux.',
    command: 'cat /etc/os-release',
    notes:
      'Ubuntu and Fedora differ in userspace, not kernel. This file identifies the system for scripts.',
    body: [
      {
        type: 'question',
        question: 'If the kernel is shared, why do distros feel different?',
        answer: 'Package manager, defaults, release model and bundled tools.',
      },
      {
        type: 'directory',
        nodes: [
          {
            label: 'linux kernel',
            note: 'shared foundation',
            children: [
              { label: 'Debian family', note: 'Ubuntu · Mint · Kali · apt', color: 'cyan' },
              { label: 'Red Hat family', note: 'Fedora · RHEL · dnf', color: 'green' },
              { label: 'Arch family', note: 'Arch · Manjaro · rolling DIY', color: 'amber' },
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART A: 5 */
  {
    id: 'choose-your-os',
    part: 'A',
    kind: 'blocks',
    tight: true,
    badge: 'SLIDE',
    kicker: 'Part A · topic 5',
    title: 'Choosing your OS',
    lead: 'Five questions. Then compare with the room.',
    command: 'lsb_release -a',
    notes:
      'Let the room answer out loud, then click. Nobody is ever "wrong" — the point is that the choice is a trade-off. Kali is for security learning, not for daily driving; say that explicitly.',
    body: [
      {
        type: 'distro',
        title: 'Which distro are you?',
        questions: [
          {
            id: 'q1',
            q: 'Time spent fixing your OS?',
            options: [
              { id: 'a', label: 'None, it must work', hint: 'no admin please', scores: { ubuntu: 3, mint: 2 } },
              { id: 'b', label: 'A little is fine', hint: 'some is fine', scores: { fedora: 2, mint: 1, ubuntu: 1 } },
              { id: 'c', label: 'I enjoy the ritual', hint: 'bring a project', scores: { arch: 3 } },
            ],
          },
          {
            id: 'q2',
            q: 'What do you work with?',
            options: [
              { id: 'a', label: 'Web, backend, cloud', hint: 'web + cloud', scores: { ubuntu: 2, fedora: 2, arch: 1 } },
              { id: 'b', label: 'Data and tooling', hint: 'current tooling', scores: { fedora: 3, arch: 2 } },
              { id: 'c', label: 'Security labs', hint: 'security labs', scores: { kali: 4, arch: 1 } },
            ],
          },
          {
            id: 'q3',
            q: 'How do you learn best?',
            options: [
              { id: 'a', label: 'A guided path', hint: 'guided path', scores: { ubuntu: 2, mint: 2, fedora: 1 } },
              { id: 'b', label: 'Wiki and trial/error', hint: 'trial and error', scores: { arch: 3 } },
            ],
          },
          {
            id: 'q4',
            q: 'Which software world should work immediately?',
            options: [
              { id: 'a', label: 'Huge app collection and guides', hint: 'apps and guides', scores: { ubuntu: 2, mint: 3 } },
              { id: 'b', label: 'Newest developer tools', hint: 'newest tools', scores: { fedora: 3, kali: 1 } },
              { id: 'c', label: 'Build it package by package', hint: 'build it myself', scores: { arch: 3 } },
            ],
          },
          {
            id: 'q5',
            q: 'Which change style suits you?',
            options: [
              { id: 'a', label: 'Keep a familiar base', hint: 'familiar base', scores: { ubuntu: 2, mint: 3 } },
              { id: 'b', label: 'Take supplied upgrades', hint: 'supplied upgrades', scores: { fedora: 3, kali: 1 } },
              { id: 'c', label: 'Assemble the newest pieces', hint: 'newest pieces', scores: { arch: 3 } },
            ],
          },
        ],
        results: {
          ubuntu: {
            name: 'Ubuntu',
            tagline: 'Beginner: the safe, well-documented default.',
            tone: 'good',
          },
          mint: {
            name: 'Linux Mint',
            tagline: 'Beginner: Ubuntu with a calmer desktop.',
            tone: 'good',
          },
          fedora: {
            name: 'Fedora',
            tagline: 'Developers: current tools in a polished system.',
            tone: 'info',
          },
          arch: {
            name: 'Arch Linux',
            tagline: 'Advanced: you assemble and understand the system.',
            tone: 'warn',
          },
          kali: {
            name: 'Kali Linux',
            tagline: 'Security: specialist toolkit, not daily driving.',
            tone: 'bad',
          },
        },
      },
      {
        type: 'table',
        head: 'Distro',
        columns: [
          { key: 'level', title: 'Level', tone: 'left' },
          { key: 'why', title: 'Why', tone: 'right' },
        ],
        rows: [
          { label: 'Ubuntu / Mint', level: 'beginner', why: 'Docs, drivers and cloud parity' },
          { label: 'Fedora', level: 'developers', why: 'Current tools, stable polish' },
          { label: 'Arch', level: 'advanced', why: 'DIY system teaches internals' },
          { label: 'Kali', level: 'security', why: 'Toolkit for labs, preferably virtual' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART A: 6 */
  {
    id: 'where-linux-runs',
    part: 'A',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part A · topic 6',
    title: 'Where Linux is used',
    lead: 'Networked machines usually hide a Linux kernel.',
    command: 'docker run --rm alpine echo "hi"',
    notes:
      'Point at the CI runner in this very pipeline: it is a Linux container. That closes the loop from Part A all the way to Part D.',
    body: [
      {
        type: 'cards',
        cols: 3,
        items: [
          { title: 'Cloud servers', icon: '☁️', tone: 'good', body: 'Default VM and container host.' },
          { title: 'Android phones', icon: '📱', tone: 'good', body: 'Linux kernel, phone userspace.' },
          { title: 'Routers', icon: '📡', tone: 'info', body: 'Switches, firewalls and OpenWrt.' },
          { title: 'IoT & embedded', icon: '🔌', tone: 'info', body: 'Tiny boards and smart TVs.' },
          { title: 'Supercomputers', icon: '🧮', tone: 'info', body: 'Top machines run Linux.' },
          { title: 'CI runners', icon: '⚙️', tone: 'good', body: 'Push-tested Linux containers.' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART A: 7 */
  {
    id: 'linus-torvalds',
    part: 'A',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part A · topic 7',
    title: 'Git and Linux share one inventor',
    lead: 'Torvalds made Linux and Git. GitHub hosts Git repositories.',
    command: 'git log --oneline | wc -l',
    notes:
      'Facts: Linux 1991 (a student hobby project), Git 2005 (after BitKeeper free licence withdrawal). GitHub launched 2008, is a separate company, acquired by Microsoft in 2018. Git itself is free software under GPLv2 and is not owned by any company.',
    body: [
      {
        type: 'timeline',
        events: [
          {
            year: '1991',
            title: 'Linux',
            text: 'Student Linus Torvalds announces a hobby kernel.',
            tone: 'good',
          },
          {
            year: '1991 → 1994',
            title: 'The kernel grows up',
            text: 'A hobby project becomes internet infrastructure.',
            tone: 'info',
          },
          {
            year: '2005',
            title: 'Git',
            text: 'Torvalds writes distributed version control for kernel work.',
            tone: 'good',
          },
          {
            year: '2008 → today',
            title: 'GitHub',
            text: 'A separate company hosts Git repositories; Git remains free software.',
            tone: 'warn',
          },
        ],
      },
    ],
  },

  /* --------------------------------------------------------- PART B HEADER */
  {
    id: 'part-b',
    part: 'B',
    kind: 'part',
    badge: 'LIVE',
    title: 'Terminal fundamentals',
    notes: 'This part is mostly live typing. Keep the pace up: one command, one sentence, move on.',
    agenda: [
      'Navigation · the directory tree · files and folders',
      'Editing · PATH and sudo · permissions · pipes and text tools',
      'Archives · packages and npm',
    ],
  },

  /* ------------------------------------------------------------- PART B: 8 */
  {
    id: 'navigation',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'Part B · topic 8',
    title: 'Navigation and basic commands',
    lead: 'Five commands cover daily movement and help.',
    command: 'ls -la',
    notes:
      'LIVE: cd around, use pwd, ls -la. Then man ls and --help. Emphasise that man exists and is searchable: /pattern then n for next match.',
    body: [
      {
        type: 'terminal',
        title: 'baseline',
        steps: [
          { cmd: 'pwd', out: '/home/student/site' },
          { cmd: 'ls', out: 'index.html  notes.txt' },
          { cmd: 'ls -la', out: 'total 16\ndrwxr-xr-x student student index.html notes.txt' },
          { cmd: 'cd ..', out: '' },
          { cmd: 'man ls', out: 'LS(1)\nNAME\n     ls - list directory contents' },
          { cmd: 'ls --help', out: 'Usage: ls [OPTION]... [FILE]...\nTry: man ls' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART B: 9 */
  {
    id: 'directory-hierarchy',
    part: 'B',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part B · topic 9',
    title: 'Directory hierarchy',
    lead: 'Everything starts at root. No drive letters.',
    command: 'ls /',
    notes:
      'LIVE: ls / then explore each one. Emphasise /etc = configuration, /var = variable data (logs, databases), /home = users, /usr = read-only userland programs (programs live in /usr/bin, not /bin on modern systems).',
    cols: 'split',
    body: [
      {
        type: 'terminal',
        title: 'the root directory',
        steps: [
          { cmd: 'ls /', out: 'bin  etc  home  tmp  usr  var' },
          { cmd: 'ls -d /bin /etc /var /home /usr', out: '/bin  /etc  /home  /usr  /var' },
        ],
      },
      {
        type: 'tree',
        nodes: [
          {
            label: '/',
            note: 'everything starts here',
            children: [
              { label: '/bin', note: 'essential commands', color: 'cyan' },
              { label: '/etc', note: 'system configuration', color: 'cyan' },
              { label: '/var', note: 'logs and changing data', color: 'amber' },
              { label: '/home', note: 'one folder per user', color: 'green' },
              {
                label: '/usr',
                note: 'installed programs and libraries',
                color: 'green',
                children: [
                  { label: '/usr/bin', note: 'everyday commands' },
                  { label: '/usr/lib', note: 'libraries' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 10 */
  {
    id: 'files-directories',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    tight: true,
    badge: 'LIVE',
    kicker: 'Part B · topic 10',
    title: 'Create, move, copy, rename, delete',
    lead: 'Full file lifecycle—and one irreversible command.',
    command: 'mkdir -p demo/src',
    notes:
      'Create a folder, touch a file, copy it, rename with mv, verify with pwd + ls, then demonstrate safe deletion (rm -i for files, rm -r for the disposable demo folder). There is no undo.',
    body: [
      {
        type: 'question',
        question: 'What happens if rm runs in the wrong folder?',
        answer: 'Files vanish without trash or confirmation. Verify with pwd and ls; prefer rm -i.',
      },
      {
        type: 'terminal',
        title: 'create / copy / move / delete',
        steps: [
          { cmd: 'mkdir -p demo/src', out: '' },
          { cmd: 'touch demo/src/main.c', out: '' },
          { cmd: 'cp demo/src/main.c demo/main.c', out: '' },
          { cmd: 'mv demo/main.c demo/entry.c', out: '' },
          { cmd: 'ls demo demo/src', out: 'entry.c  src\nsrc\nmain.c' },
          { cmd: 'pwd && ls demo', out: '/home/student\nentry.c  src' },
          { cmd: 'rm -i demo/entry.c', out: "rm: remove regular file 'demo/entry.c'? y" },
          { cmd: 'rm -r demo && ls', out: 'index.html  notes.txt' },
        ],
      },
      {
        type: 'table',
        head: 'Command',
        columns: [
          { key: 'does', title: 'What it does', tone: 'left' },
          { key: 'safe', title: 'Safe example', tone: 'right' },
        ],
        rows: [
          { label: 'mkdir -p', does: 'Create folders, parents too', safe: 'mkdir -p demo/src' },
          { label: 'touch', does: 'Create an empty file', safe: 'touch demo/src/main.c' },
          { label: 'cp', does: 'Copy a file', safe: 'cp demo/src/main.c demo/main.c' },
          { label: 'mv', does: 'Move or rename a file', safe: 'mv demo/main.c demo/entry.c' },
          { label: 'pwd + ls', does: 'Verify location before deleting', safe: 'pwd && ls demo' },
          { label: 'rm -i', does: 'Delete a file, ask first', safe: 'rm -i demo/entry.c' },
          { label: 'rm -r', does: 'Delete a folder tree', safe: 'rm -r demo (disposable only)' },
        ],
        caption: 'Verify with pwd + ls first. rm has no undo — rm -i asks, rm -r removes folders.',
      },
      {
        type: 'callout',
        tone: 'bad',
        icon: '☠️',
        title: 'rm -rf has no undo',
        body: 'Check the path first, then remove. Destructive commands deserve rm -i.',
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 11 */
  {
    id: 'editing-files',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'Part B · topic 11',
    title: 'Editing files with nano and mousepad',
    lead: 'Use nano today. Recognize mousepad and vim.',
    command: 'nano notes.txt',
    notes:
      'Open nano live, type two lines, save with Ctrl+O, exit with Ctrl+X. The caret means Ctrl. Mention vim only; do not teach it.',
    body: [
      {
        type: 'terminal',
        title: 'nano session',
        steps: [
          { cmd: 'nano notes.txt', out: 'GNU nano notes.txt\n^ means Ctrl' },
          { cmd: 'cat notes.txt', out: 'first line\nsecond line' },
        ],
      },
      { type: 'keychip', text: 'Ctrl + O · save' },
      { type: 'keychip', text: 'Ctrl + X · exit' },
      {
        type: 'bullets',
        items: [
          { text: 'mousepad handles quick graphical edits.', tone: 'cyan' },
          { text: 'vim lives on servers; learn it later.', tone: 'amber' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 12 */
  {
    id: 'no-mouse-challenge',
    part: 'B',
    kind: 'blocks',
    tight: true,
    badge: 'LIVE',
    kicker: 'Part B · topic 12',
    title: 'Coding without an IDE: the no-mouse challenge',
    lead: 'Keyboard only: folder, page, preview, commit.',
    command: 'python3 -m http.server 8000',
    notes:
      'Assign the exact checklist: folder, index.html in nano, local preview, commit. Circulate while they type every character.',
    body: [
      {
        type: 'split-panels',
        tight: true,
        cols: 2,
        panels: [
          {
            key: 'do',
            title: 'Do this',
            tone: 'good',
            subtitle: 'keyboard only',
            commands: [
              { cmd: 'mkdir -p site', note: 'make a folder' },
              { cmd: 'nano site/index.html', note: 'create the page' },
              { cmd: 'python3 -m http.server 8000', note: 'preview it' },
              { cmd: 'git add site/index.html && git commit', note: 'commit it' },
            ],
          },
          {
            key: 'not',
            title: 'Not allowed',
            tone: 'bad',
            subtitle: 'this is the point',
            commands: [
              { cmd: 'the mouse', note: 'not one click', danger: 'no IDE, no autocomplete' },
              { cmd: 'copy-paste', note: 'type it out', danger: 'this is the muscle memory part' },
              { cmd: 'asking me', note: 'try it yourself first', danger: 'then I will help' },
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 13 */
  {
    id: 'shell-basics',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'Part B · topic 13',
    title: 'Shell basics: PATH, variables, redirects, sudo',
    lead: 'Names resolve through PATH. sudo borrows admin power once.',
    command: 'echo $PATH',
    notes:
      'PATH lists command directories. Show the missing-command error, fix PATH or install the package, then show sudo for one privileged command.',
    body: [
      {
        type: 'question',
        question: 'Why is a program “not found” when its file exists?',
        answer: 'Its directory is outside PATH. Add the directory or install the package.',
      },
      {
        type: 'terminal',
        title: 'shell mechanics',
        steps: [
          { cmd: 'deploy', out: 'command not found: deploy' },
          { cmd: 'echo $PATH', out: '/usr/bin:/bin:/home/student/.local/bin' },
          { cmd: 'export PATH="$HOME/.local/bin:$PATH"', out: '' },
          { cmd: 'deploy', out: 'deploying demo site...' },
          { cmd: 'ls > listing.txt', out: 'stdout overwrites the file' },
          { cmd: 'ls >> listing.txt', out: 'this form appends instead' },
          { cmd: 'sudo whoami', out: 'root (one command only)' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 14 */
  {
    id: 'permissions',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    tight: true,
    badge: 'LIVE',
    kicker: 'Part B · topic 14',
    title: 'File permissions: chmod and chown',
    lead: 'Toggle the bits. Watch the chmod number follow.',
    command: 'chmod 754 deploy.sh',
    notes:
      'Toggle owner, group and other bits live. Read with ls -l, set with chmod 754, change owner with sudo chown. Symbolic forms (u+x, o-w) are in the table. Explain one triple at a time, then show why world-writable 777 is poisonous.',
    body: [
      {
        type: 'permissions',
        filename: 'deploy.sh',
      },
      {
        type: 'terminal',
        title: 'read / set / own',
        steps: [
          { cmd: 'ls -l deploy.sh', out: '-rwxr-xr-x student student deploy.sh' },
          { cmd: 'chmod 754 deploy.sh', out: '' },
          { cmd: 'sudo chown student:www-data deploy.sh', out: '' },
          { cmd: 'ls -l deploy.sh', out: '-rwxr-xr-- student www-data deploy.sh' },
        ],
      },
      {
        type: 'table',
        head: 'Command',
        columns: [
          { key: 'does', title: 'What it does', tone: 'left' },
          { key: 'safe', title: 'Safe example', tone: 'right' },
        ],
        rows: [
          { label: 'ls -l', does: 'Show mode + owner', safe: 'ls -l deploy.sh' },
          { label: 'chmod 754', does: 'Set rwxr-xr-- numerically', safe: 'chmod 754 deploy.sh' },
          { label: 'chmod u+x / o-w', does: 'Tune bits symbolically', safe: 'chmod o-w deploy.sh' },
          { label: 'chown', does: 'Change owner (needs sudo)', safe: 'sudo chown student:www-data deploy.sh' },
          { label: 'id + groups', does: 'Show who you are', safe: 'id; groups' },
        ],
        caption: 'Least privilege: each class gets only what it needs. Never 777.',
      },
      {
        type: 'callout',
        tone: 'bad',
        icon: '☠️',
        title: 'chmod 777 is a poisonous habit',
        body: 'Everyone can read, change and run the file. Grant minimum access instead.',
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 15 */
  {
    id: 'text-processing',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'Part B · topic 15',
    title: 'Text processing and pipes',
    lead: 'Stdout becomes stdin. Small tools compose answers.',
    command: 'cat access.log | grep 404 | sort | uniq -c',
    notes:
      'Play the pipe funnel live. Then show grep, sort, uniq, head, tail, wc, cut, plus an awk first-field teaser.',
    body: [
      {
        type: 'question',
        question: 'Why chain small commands instead of opening an editor?',
        answer: 'Each tool does one job; pipes answer questions without temporary files.',
      },
      {
        type: 'pipe',
        cmd: 'cat access.log | grep 404 | sort | uniq -c',
        stages: [
          { cmd: 'cat access.log', out: '200 /index.html\n404 /missing.html\n200 /style.css\n404 /missing.html' },
          { cmd: 'grep 404', out: '404 /missing.html\n404 /missing.html' },
          { cmd: 'sort', out: '404 /missing.html\n404 /missing.html' },
          { cmd: 'uniq -c', out: '2 404 /missing.html' },
        ],
        caption:
          'stdout of one command becomes stdin of the next. grep selects, sort orders, uniq -c counts.',
      },
      {
        type: 'terminal',
        title: 'real logs',
        steps: [
          { cmd: 'grep " 500 " access.log | wc -l', out: '17' },
          { cmd: 'cut -d" " -f1 access.log | sort | uniq -c | sort -rn | head -3', out: '  842 203.0.113.7\n  233 198.51.100.22\n   91 203.0.113.9' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 16 */
  {
    id: 'archiving',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'Part B · topic 16',
    title: 'Archiving and compressing',
    lead: 'Bundle a folder, shrink it, reopen it.',
    command: 'tar -czvf project.tar.gz project/',
    notes:
      'Compress live, show the smaller file, then extract it. Name the tar flags: create, extract, gzip, verbose, file.',
    body: [
      {
        type: 'archive',
        source: 'project/',
        archive: 'project.tar.gz',
        command: 'tar -czvf project.tar.gz project/',
      },
      {
        type: 'terminal',
        title: 'tar and zip',
        steps: [
          { cmd: 'tar -czvf project.tar.gz project/', out: 'project/\nproject/src/main.c' },
          { cmd: 'ls -lh project.tar.gz', out: '1.1K project.tar.gz' },
          { cmd: 'tar -xzvf project.tar.gz', out: 'x project/src/main.c' },
          { cmd: 'zip -r notes.zip notes/', out: 'adding: notes.txt' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------ PART B: 17 */
  {
    id: 'packages',
    part: 'B',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'Part B · topic 17',
    title: 'Package management and npm',
    lead: 'One command installs software. Trust is the cost.',
    command: 'sudo apt install -y git',
    notes:
      'LIVE: apt update, apt install. Then the same idea with npm. The supply-chain warning is the real lesson: 4000 transitive dependencies means you are trusting a lot of strangers. Lockfiles and npm ci exist for exactly this reason.',
    body: [
      {
        type: 'terminal',
        title: 'three package ecosystems',
        steps: [
          { cmd: 'sudo apt update', out: 'Hit:1 archive.ubuntu.com InRelease' },
          { cmd: 'sudo apt install -y git', out: 'Setting up git...' },
          { cmd: 'sudo snap install htop', out: 'htop installed' },
          { cmd: 'npm install', out: 'added 412 packages' },
          { cmd: 'npm ci', out: 'exact versions from lockfile' },
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        icon: '⛓️',
        title: 'Supply-chain risk',
        body: 'Thousands of strangers can publish install scripts. Use lockfiles and npm ci.',
      },
    ],
  },

  /* --------------------------------------------------------- PART C HEADER */
  {
    id: 'part-c',
    part: 'C',
    kind: 'part',
    badge: 'SLIDE',
    title: 'Servers and system',
    notes: 'This part is the "what is actually running on that server" tour.',
    agenda: [
      'uptime, free, df, top — what is the machine doing right now',
      'Processes and background jobs · systemd services · SSH',
      'A shell script that CI will reuse later',
    ],
  },

  /* ------------------------------------------------------------- PART C: 18 */
  {
    id: 'server-review',
    part: 'C',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part C · topic 18',
    title: 'Server review: uptime, memory, disk, top',
    lead: 'Ask healthy first. Touch nothing until it answers.',
    command: 'uptime && free -h && df -h',
    notes:
      'LIVE on your own machine, then show a real CI/VM screenshot if you have one. free -h human readable. df -h shows the disk that fills up, usually the container overlay. top/htop for live view.',
    cols: 'split',
    body: [
      {
        type: 'dashboard',
        metrics: [
          { label: 'CPU', value: 23 },
          { label: 'Memory', value: 41 },
          { label: 'Disk /', value: 23 },
          { label: 'Swap', value: 0 },
        ],
        processes: [
          { pid: '20451', cmd: 'node vite', cpu: 18 },
          { pid: '19388', cmd: 'python3 -m http.server', cpu: 6 },
          { pid: '18204', cmd: 'sshd', cpu: 3 },
          { pid: '17422', cmd: 'containerd', cpu: 2 },
          { pid: '1', cmd: 'systemd', cpu: 1 },
        ],
      },
      {
        type: 'terminal',
        title: 'health check',
        steps: [
          { cmd: 'uptime', out: 'load average: 0.31, 0.22, 0.19' },
          { cmd: 'free -h', out: 'Mem:  15Gi total, 3.2Gi used, 11Gi available' },
          { cmd: 'df -h /', out: '/dev/nvme0n1p2  456G  98G  334G  23% /' },
          { cmd: 'htop', out: '# q quits · F9 kills' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 19 */
  {
    id: 'processes',
    part: 'C',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part C · topic 19',
    title: 'Process management: ps and kill',
    lead: 'Find the PID. Stop it cleanly. Use & for background.',
    command: 'ps aux | grep vite',
    notes:
      'LIVE: start a long running command, background it with &, find the PID with ps, kill it. Also mention Ctrl+Z to suspend and fg to bring back, and that a background job dies when you close the terminal unless you nohup it.',
    body: [
      {
        type: 'terminal',
        title: 'ps, & and kill',
        steps: [
          { cmd: 'python3 -m http.server 8000 &', out: '[1] 20451   # running in background' },
          { cmd: 'jobs', out: '[1]+  running    python3 -m http.server 8000' },
          { cmd: 'ps aux | grep http.server', out: 'you  20451  0.0  0.1  0.1  python3 -m http.server' },
          { cmd: 'kill 20451', out: '# SIGTERM: polite, allows cleanup' },
          { cmd: 'kill -9 20451', out: '# SIGKILL: no cleanup, last resort' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 20 */
  {
    id: 'systemd',
    part: 'C',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part C · topic 20',
    title: 'Services with systemd',
    lead: 'Check status. Read logs. Restart with intent.',
    command: 'systemctl status ssh',
    notes:
      'Show systemctl status ssh, then journalctl -u ssh -n 20 --no-pager. Explain that "systemctl enable --now" means start it now and on every boot. Mention systemctl list-units --failed as the first thing to check when something is wrong.',
    body: [
      {
        type: 'terminal',
        title: 'supervising services',
        steps: [
          { cmd: 'systemctl status ssh', out: '● ssh.service - OpenBSD Secure Shell server\n   Active: active (running) since Mon 14:10' },
          { cmd: 'systemctl enable --now nginx', out: 'Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service.' },
          { cmd: 'journalctl -u ssh -n 20 --no-pager', out: 'Accepted publickey for you from 203.0.113.7 port 51234' },
          { cmd: 'systemctl list-units --failed', out: '0 loaded units listed. 0 failed.' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 21 */
  {
    id: 'networking-ssh',
    part: 'C',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part C · topic 21',
    title: 'Networking and SSH',
    lead: 'Reach it, fetch it, shell into it, copy from it.',
    command: 'ssh student@203.0.113.7',
    notes:
      'Ping, curl and ip first, then SSH and scp. Keys beat passwords; Part D automates this same hop.',
    body: [
      { type: 'packet', from: 'laptop', to: 'server' },
      {
        type: 'terminal',
        title: 'network tools',
        steps: [
          { cmd: 'ping -c 2 1.1.1.1', out: '2 transmitted, 2 received, 0% loss' },
          { cmd: 'curl -sI https://example.com', out: 'HTTP/2 200' },
          { cmd: 'ip a', out: 'inet 192.168.1.42/24' },
          { cmd: 'ssh student@203.0.113.7', out: 'Welcome to Ubuntu 24.04' },
          { cmd: 'scp report.txt student@203.0.113.7:/tmp/', out: 'report.txt 100% 12KB' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 22 */
  {
    id: 'shell-scripting',
    part: 'C',
    kind: 'blocks',
    cols: 'split',
    badge: 'LIVE',
    kicker: 'Part C · topic 22',
    title: 'Shell scripting',
    lead: 'Variables, loop, condition. CI reuses this script.',
    command: 'bash build.sh',
    notes:
      'Type it live, run it, break it on purpose. Then say: "this file is going to appear inside .github/workflows as a step." Set -e is the line that matters — stop on the first error instead of pretending the build passed.',
    body: [
      {
        type: 'terminal',
        title: 'build.sh',
        steps: [
          {
            cmd: 'cat build.sh',
            out: '#!/usr/bin/env bash\nset -euo pipefail\n\nTARGET="dist"\nfor dir in src public; do\n  if [ -d "$dir" ]; then echo "checking $dir"; fi\ndone\n[ -d "$TARGET" ] && echo "build ready" || echo "no output"',
            tone: 'cyan',
          },
          { cmd: './build.sh', out: 'checking src\nchecking public\nno output', tone: 'green' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 23 */
  {
    id: 'containers',
    part: 'C',
    kind: 'blocks',
    badge: 'SLIDE',
    badgeNote: 'explained as a picture, not typed',
    kicker: 'Part C · topic 23',
    title: 'Containers and Docker',
    lead: 'CI runners are throwaway Linux containers.',
    command: 'docker run --rm node:20 npm run build',
    notes:
      'A container is a process with its own filesystem view, sharing the host kernel. Files, permissions and paths still apply inside.',
    body: [
      { type: 'containers' },
      {
        type: 'terminal',
        title: 'runner command',
        steps: [{ cmd: 'docker run --rm node:20 npm run build', out: 'dist/ ready' }],
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 24 */
  {
    id: 'user-management',
    part: 'C',
    kind: 'blocks',
    badge: 'TAKE-HOME',
    kicker: 'Part C · topic 24 · take-home',
    title: 'User management',
    lead: 'Machines host people plus service accounts.',
    command: 'getent passwd | tail -5',
    notes:
      'Not covered live. Point at the take-home list: getent passwd, whoami, id, groups, adduser, sudo -l, /etc/passwd vs /etc/shadow, and the service accounts that own everything in Part D.',
    body: [
      {
        type: 'table',
        head: 'Concept',
        columns: [{ key: 'left', title: 'What to read', tone: 'left' }],
        rows: [
          { label: 'Who am I', left: 'whoami, id, groups' },
          { label: 'The user database', left: '/etc/passwd, /etc/shadow, /etc/group' },
          { label: 'Creating users', left: 'adduser, useradd, usermod, deluser' },
          { label: 'Admin power', left: 'sudo -l, /etc/sudoers.d' },
          { label: 'Service accounts', left: 'why nobody owns the web server process' },
        ],
        caption: 'Take-home. Explains why the Part D deploy logs in as a user.',
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 25 */
  {
    id: 'links',
    part: 'C',
    kind: 'blocks',
    cols: 'split',
    badge: 'TAKE-HOME',
    kicker: 'Part C · topic 25 · take-home',
    title: 'Soft links and hard links',
    lead: 'Two ways to share bytes under names.',
    command: 'ls -li file.txt link.txt',
    notes:
      'Not covered live. Hard link = another directory entry to the same inode, cannot cross filesystems, deleting one name keeps the data. Soft/symbolic link = a text file holding a path, survives file moves, breaks when the target goes away. ls -li is the command that shows the inode number and proves it.',
    body: [
      {
        type: 'table',
        head: '',
        columns: [
          { key: 'hard', title: 'Hard link', tone: 'left' },
          { key: 'soft', title: 'Soft (symbolic) link', tone: 'right' },
        ],
        rows: [
          { label: 'What it is', hard: 'another name for the same inode', soft: 'a file containing a path' },
          { label: 'Create', hard: 'ln file.txt hard.txt', soft: 'ln -s file.txt soft.txt' },
          { label: 'Cross filesystem', hard: 'not possible', soft: 'possible' },
          { label: 'Target deleted', hard: 'data survives until last link is gone', soft: 'link breaks, dangling' },
          { label: 'Inode number', hard: 'identical', soft: 'different' },
        ],
        caption: 'Proof: ls -li shows one shared inode number.',
      },
    ],
  },

  /* ------------------------------------------------------------- PART C: 26 */
  {
    id: 'disks-filesystems',
    part: 'C',
    kind: 'blocks',
    cols: 'split',
    badge: 'TAKE-HOME',
    kicker: 'Part C · topic 26 · take-home',
    title: 'Disks, filesystems, LVM and booting',
    lead: 'From power button to shell prompt.',
    command: 'lsblk -f',
    notes:
      'Not covered live. Learn block devices, partitions, filesystems, LVM pooling, UEFI and GRUB as a follow-up path.',
    body: [
      {
        type: 'table',
        head: 'Layer',
        columns: [{ key: 'left', title: 'Linux name', tone: 'left' }, { key: 'right', title: 'What it does', tone: 'right' }],
        rows: [
          { label: 'Block device', left: '/dev/sda', right: 'the raw disk' },
          { label: 'Partition', left: '/dev/sda1', right: 'a slice of it' },
          { label: 'Filesystem', left: 'ext4, xfs', right: 'bytes into files' },
          { label: 'Mount', left: 'mount /dev/sda1 /', right: 'attaches a directory' },
          { label: 'LVM', left: 'pv, vg, lv', right: 'pool disks, resize later' },
          { label: 'Boot', left: 'UEFI, GRUB, systemd', right: 'loader loads the kernel' },
        ],
        caption: 'Take-home. lsblk -f prints this chain in one line.',
      },
    ],
  },

  /* --------------------------------------------- PART C2: title card */
  {
    id: 'c2-title',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · Inside the OS',
    title: 'Three referees, one machine',
    lead: 'One CPU, one slow disk, limited RAM — hundreds of takers. The OS referees.',
    command: 'uptime',
    notes:
      'Frame the part: every program wants the same three resources. Scheduling, disk order and memory mapping are the referee calls.',
    body: [
      {
        type: 'section-title',
        eyebrow: 'Part C2 · Inside the OS',
        title: 'Three referees, one machine',
        lead: 'One CPU, one slow disk, limited RAM — hundreds of takers.',
        part: 'C2',
        badge: 'SLIDE',
      },
    ],
  },

  /* --------------------------------------------------- C2.1 scheduler */
  {
    id: 'c2-scheduler-what',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · CPU scheduling',
    title: 'Many processes, one CPU',
    lead: 'The scheduler picks who runs next, slice after slice.',
    command: 'ps -eo pid,comm --sort=pid | head -5',
    notes:
      'Define four words: process, ready queue, context switch, preemption. Takeaway: running everything at once is an illusion the OS maintains.',
    body: [
      {
        type: 'cards',
        cols: 2,
        items: [
          { title: 'Process', icon: '📦', tone: 'info', body: 'A running program with its own memory.' },
          { title: 'Ready queue', icon: '📋', tone: 'info', body: 'The line of processes waiting for CPU.' },
          { title: 'Context switch', icon: '🔀', tone: 'warn', body: 'Pausing one process to resume another.' },
          { title: 'Preemption', icon: '⏸️', tone: 'warn', body: 'The OS can interrupt a running process.' },
        ],
      },
    ],
  },

  /* --------------------------------------------------- C2.2 algorithms */
  {
    id: 'c2-scheduler-algos',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · CPU scheduling',
    title: 'Four classic schedulers',
    lead: 'Every rule is a trade-off. Read the weakness column.',
    command: 'ps -eo pid,ni,comm | head -5',
    notes:
      'Walk the weakness of each: FCFS blocks, SJF needs burst times and starves, quantum size rules Round Robin, Priority needs aging.',
    body: [
      {
        type: 'cards',
        cols: 2,
        items: [
          { title: 'FCFS', subtitle: 'first come, first served', icon: '1️⃣', tone: 'info', body: 'Best: simple. Weakness: long jobs block short ones.' },
          { title: 'SJF', subtitle: 'shortest job first', icon: '⚡', tone: 'good', body: 'Best: minimal waiting. Weakness: needs burst times, starves long jobs.' },
          { title: 'Round Robin', subtitle: 'take turns', icon: '🔁', tone: 'good', body: 'Best: fair. Weakness: quantum size matters.' },
          { title: 'Priority', subtitle: 'urgent first', icon: '🚨', tone: 'warn', body: 'Best: flexible. Weakness: needs aging to avoid starvation.' },
        ],
      },
    ],
  },

  /* --------------------------------------------------- C2.3 scheduler sim */
  {
    id: 'c2-scheduler-sim',
    part: 'C2',
    kind: 'blocks',
    tight: true,
    badge: 'LIVE',
    kicker: 'Part C2 · CPU scheduling',
    title: 'Watch the schedulers race',
    lead: 'Same processes, different rules. Compare the waiting times.',
    command: 'ps -eo pid,ni,pri,comm --sort=-pri | head',
    notes:
      'Run FCFS, then SJF, then Round Robin on the defaults. Toggle compare and ask the room which wins before revealing metrics.',
    body: [
      {
        type: 'scheduler',
      },
    ],
  },

  /* --------------------------------------------------- C2.4 Linux CFS */
  {
    id: 'c2-linux-cfs',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · how Linux does it',
    title: 'Linux shares fairly, then hurries the urgent',
    lead: 'Tasks get a fair share of CPU time. EEVDF gives short, latency-sensitive tasks earlier deadlines. Nice values still shape each share.',
    command: 'uname -r',
    notes:
      'Three sentences only: fair share since CFS in 2.6.23; EEVDF from kernel 6.6 adds earlier deadlines for latency-sensitive tasks; nice still influences shares.',
    body: [
      {
        type: 'glow',
        title: 'CFS, then EEVDF',
        subtitle: 'fair since 2.6.23 · EEVDF since 6.6',
        accent: 'cyan',
        body: 'Fair shares for everyone, earlier deadlines for the urgent, nice values tilt the balance.',
      },
    ],
  },

  /* --------------------------------------------------- C2.5 proof: CPU */
  {
    id: 'c2-proof-cpu',
    part: 'C2',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part C2 · live proof',
    title: 'See scheduling on this machine',
    lead: 'Priorities are just numbers you can read and change.',
    command: 'uname -r; ps -eo pid,ni,pri,comm --sort=-pri | head -6; nice -n 10 sleep 60 &; renice -n 5 -p 20487; chrt -p $$; yes > /dev/null &; top -b -n 1 | head -8; kill %2',
    notes:
      'Type it live. PIDs here are examples. Stress: higher nice value means lower priority. Kill the CPU hog before moving on.',
    body: [
      {
        type: 'terminal',
        title: 'priorities are numbers',
        steps: [
          { cmd: 'uname -r', out: '6.8.0-45-generic' },
          { cmd: 'ps -eo pid,ni,pri,comm --sort=-pri | head -6', out: 'PID NI PRI COMMAND\n20451  0  20 node\n18204  0  20 sshd\n  940  0  20 systemd' },
          { cmd: 'nice -n 10 sleep 60 &', out: '[1] 20487' },
          { cmd: 'renice -n 5 -p 20487', out: '20487 (process ID) old priority 10, new priority 5' },
          { cmd: 'chrt -p $$', out: "pid 1803's current scheduling policy: SCHED_OTHER" },
          { cmd: 'yes > /dev/null &', out: '[2] 20492' },
          { cmd: 'top -b -n 1 | head -8', out: '%Cpu(s): 25.3 us\nPID USER %CPU COMMAND\n20492 student 99.7 yes\n20451 student 18.2 node' },
          { cmd: 'kill %2', out: '[2]+  Terminated              yes > /dev/null' },
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        icon: '⚖️',
        title: 'Nice values are upside down',
        body: 'Higher nice value means lower priority. Nice 19 yields; nice -20 demands.',
      },
    ],
  },

  /* --------------------------------------------------- C2.6 disk why */
  {
    id: 'c2-disk-why',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · disk scheduling',
    title: 'Disks are slow movers',
    lead: 'Every read pays three travel costs before one byte flows.',
    command: 'lsblk -d -o NAME,ROTA,SIZE',
    notes:
      'Point at each cost on the platter: the arm glides, the disk spins, then bits flow. Takeaway: order matters because movement is expensive.',
    body: [
      {
        type: 'platter',
      },
    ],
  },

  /* --------------------------------------------------- C2.7 disk algos */
  {
    id: 'c2-disk-algos',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · disk scheduling',
    title: 'Five ways to sweep a disk',
    lead: 'Same requests, different travel. Read each weakness.',
    command: 'cat /sys/block/sda/queue/scheduler',
    notes:
      'One line each: FCFS wanders, SSTF can starve far requests, SCAN is the elevator, C-SCAN jumps back, LOOK turns at the last request.',
    body: [
      {
        type: 'cards',
        cols: 3,
        items: [
          { title: 'FCFS', icon: '1️⃣', tone: 'info', body: 'No reordering. Weakness: the head wanders.' },
          { title: 'SSTF', icon: '🎯', tone: 'good', body: 'Nearest first. Weakness: far requests can starve.' },
          { title: 'SCAN', icon: '🛗', tone: 'info', body: 'The elevator algorithm. Weakness: rides to the end anyway.' },
          { title: 'C-SCAN', icon: '🔄', tone: 'info', body: 'One-way sweeps. Weakness: the jump back costs travel.' },
          { title: 'LOOK', icon: '👀', tone: 'good', body: 'Turns at the last request. Weakness: direction changes cost turns.' },
        ],
      },
    ],
  },

  /* --------------------------------------------------- C2.8 disk sim */
  {
    id: 'c2-disk-sim',
    part: 'C2',
    kind: 'blocks',
    tight: true,
    badge: 'LIVE',
    kicker: 'Part C2 · disk scheduling',
    title: 'Race the disk head',
    lead: 'Same queue, two algorithms. Green travels less.',
    command: 'cat /sys/block/sda/queue/scheduler',
    notes:
      'Run FCFS first, note 640 cylinders, then SSTF for 236. Toggle compare, then flip HDD vs SSD and ask when ordering stops mattering.',
    body: [
      {
        type: 'disk',
      },
    ],
  },

  /* --------------------------------------------------- C2.9 Linux I/O */
  {
    id: 'c2-linux-iosched',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · how Linux does it',
    title: 'Linux calls them I/O schedulers',
    lead: 'Four schedulers, four jobs. Match the device.',
    command: 'cat /sys/block/sda/queue/scheduler',
    notes:
      'Plain roles: none skips reordering for NVMe, mq-deadline gives deadlines for SATA/HDD, bfq shares bandwidth fairly, kyber targets latency on fast devices.',
    body: [
      {
        type: 'table',
        head: 'Scheduler',
        columns: [
          { key: 'role', title: 'Job', tone: 'left' },
        ],
        rows: [
          { label: 'none', role: 'no reordering; NVMe has deep queues' },
          { label: 'mq-deadline', role: 'deadlines so none starves; SATA/HDD default' },
          { label: 'bfq', role: 'fair bandwidth per process; desktops, spinning disks' },
          { label: 'kyber', role: 'lightweight latency targets; fast devices' },
        ],
      },
      {
        type: 'table',
        head: 'Device',
        columns: [
          { key: 'pick', title: 'Pick', tone: 'right' },
        ],
        rows: [
          { label: 'NVMe', pick: 'none' },
          { label: 'SATA SSD', pick: 'mq-deadline' },
          { label: 'HDD / desktop', pick: 'bfq or mq-deadline' },
        ],
        caption: 'Recommendation table worth screenshotting.',
      },
    ],
  },

  /* --------------------------------------------------- C2.10 proof: disk */
  {
    id: 'c2-proof-disk',
    part: 'C2',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part C2 · live proof',
    title: 'Read your own scheduler',
    lead: 'ROTA tells spinning from flash. Brackets mark the active scheduler.',
    command: 'lsblk -d -o NAME,ROTA,SIZE; cat /sys/block/sda/queue/scheduler',
    notes:
      'ROTA 1 means spinning, 0 means flash. Changing schedulers needs root and resets on reboot — test machines only.',
    body: [
      {
        type: 'terminal',
        title: 'this machine’s disks',
        steps: [
          { cmd: 'lsblk -d -o NAME,ROTA,SIZE', out: 'NAME ROTA  SIZE\nsda       1  456G\nnvme0n1   0  931G' },
          { cmd: 'cat /sys/block/sda/queue/scheduler', out: 'none mq-deadline [bfq] kyber' },
          { cmd: 'echo mq-deadline | sudo tee /sys/block/sda/queue/scheduler', out: 'mq-deadline' },
        ],
      },
      {
        type: 'callout',
        tone: 'bad',
        icon: '⚠️',
        title: 'Only on a test machine',
        body: 'Changing the scheduler needs root, affects every process, and resets on reboot.',
      },
    ],
  },

  /* --------------------------------------------------- C2.11 VM picture */
  {
    id: 'c2-vm-picture',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · virtual memory',
    title: 'Every process gets a private illusion',
    lead: 'Pages, typically 4 KB, map to RAM frames or disk.',
    command: 'getconf PAGESIZE',
    notes:
      'Each process believes it owns all memory. The page table maps virtual pages to frames or disk. Takeaway: isolation is a mapping trick.',
    body: [
      {
        type: 'table',
        head: 'Virtual page',
        columns: [
          { key: 'where', title: 'Lives in', tone: 'right' },
        ],
        rows: [
          { label: 'Page 0 · code', where: 'frame 7 · RAM' },
          { label: 'Page 1 · data', where: 'frame 2 · RAM' },
          { label: 'Page 2 · idle', where: 'disk · swapped out' },
          { label: 'Page 3 · stack', where: 'frame 9 · RAM' },
        ],
        caption: 'The page table is this mapping, per process.',
      },
    ],
  },

  /* --------------------------------------------------- C2.12 fault kinds */
  {
    id: 'c2-fault-kinds',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · virtual memory',
    title: 'A page fault is usually not an error',
    lead: 'Faults are normal events — except the invalid kind.',
    command: 'ps -o pid,min_flt,maj_flt,comm -p $$',
    notes:
      'Separate the three kinds, then land the punchline: only invalid faults kill programs, as Segmentation fault.',
    body: [
      {
        type: 'fault-types',
      },
      {
        type: 'callout',
        tone: 'bad',
        icon: '💥',
        title: 'Segmentation fault',
        body: 'An invalid fault: your program touched memory it never owned.',
      },
    ],
  },

  /* --------------------------------------------------- C2.13 replacement */
  {
    id: 'c2-replacement',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · virtual memory',
    title: 'Three eviction strategies',
    lead: 'RAM is full. Somebody must leave.',
    command: 'free -h',
    notes:
      'FIFO evicts the oldest, LRU the unused, Optimal the never-needed. Optimal needs the future, so it cannot exist.',
    body: [
      {
        type: 'cards',
        cols: 3,
        items: [
          { title: 'FIFO', icon: '📥', tone: 'info', body: 'Evicts longest resident. Ignores usefulness.' },
          { title: 'LRU', icon: '🕰️', tone: 'good', body: 'Evicts least recently used. Tracking costs work.' },
          { title: 'Optimal', icon: '🔮', tone: 'warn', body: 'Evicts latest-needed. Impossible without foresight.' },
        ],
      },
    ],
  },

  /* --------------------------------------------------- C2.14 paging sim */
  {
    id: 'c2-paging-sim',
    part: 'C2',
    kind: 'blocks',
    tight: true,
    badge: 'LIVE',
    kicker: 'Part C2 · virtual memory',
    title: 'Fault your way through memory',
    lead: 'Step the reference string. Green is a hit, red is a fault.',
    command: 'free -h; vmstat 1 5',
    notes:
      'Step manually first so hits and evictions land, then autoplay. Finish with the Belady demo: more frames, more faults.',
    body: [
      {
        type: 'paging',
      },
    ],
  },

  /* --------------------------------------------------- C2.15 thrashing */
  {
    id: 'c2-thrashing',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · virtual memory',
    title: 'Thrashing: all swap, no work',
    lead: 'Too many processes, too few frames — useful CPU collapses.',
    command: 'vmstat 1 5',
    notes:
      'Watch useful CPU fall while faults explode. Fixes: more RAM, fewer processes, or swap tuning.',
    body: [
      {
        type: 'thrashing',
      },
    ],
  },

  /* --------------------------------------------------- C2.16 proof: memory */
  {
    id: 'c2-proof-mem',
    part: 'C2',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part C2 · live proof',
    title: 'Count real page faults',
    lead: 'The OS counts every fault for you.',
    command: 'free -h; vmstat 1 5; ps -o pid,min_flt,maj_flt,comm -p $$; swapon --show',
    notes:
      'Read free, then vmstat swap columns si/so, then per-process counters, then faults for one command, then swap devices.',
    body: [
      {
        type: 'terminal',
        title: 'memory receipts',
        steps: [
          { cmd: 'free -h', out: 'Mem:   15Gi  3.2Gi  11Gi\nSwap:  4.0Gi     0B  4.0Gi' },
          { cmd: 'vmstat 1 5', out: 'procs memory  swap\nr b free si so\n1 0 11Gi  0  0\n0 0 11Gi  0  0' },
          { cmd: 'ps -o pid,min_flt,maj_flt,comm -p $$', out: 'PID MINFL MAJFL COMMAND\n1803  2841    12 bash' },
          { cmd: '/usr/bin/time -v ls 2>&1 | grep -i "page faults"', out: 'Minor (reclaiming a frame) faults: 89\nMajor (requiring I/O) faults: 0' },
          { cmd: 'swapon --show', out: 'NAME TYPE SIZE\n/swapfile file 4.0G' },
        ],
      },
    ],
  },

  /* --------------------------------------------------- C2.17 bridge */
  {
    id: 'c2-bridge',
    part: 'C2',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part C2 · bridge',
    title: 'Three referees, one machine',
    lead: 'These three decide how fast your live site feels.',
    command: 'uptime; free -h; df -h',
    notes:
      'Connect back to server review and forward to deployment: CPU, disk and memory referees shape every response time.',
    body: [
      {
        type: 'cards',
        cols: 3,
        items: [
          { title: 'CPU referee', icon: '🧠', tone: 'info', body: 'The scheduler shares time. Watch it with top.' },
          { title: 'Disk referee', icon: '💽', tone: 'warn', body: 'The I/O scheduler orders seeks. Watch it with df.' },
          { title: 'Memory referee', icon: '🧮', tone: 'good', body: 'Paging maps and swaps. Watch it with free.' },
        ],
      },
    ],
  },

  /* --------------------------------------------------------- PART D HEADER */
  {
    id: 'part-d',
    part: 'D',
    kind: 'part',
    badge: 'LIVE',
    title: 'GitHub to deploy',
    notes: 'Entirely live. Have the repo, the deploy platform and the CI secrets ready before you start.',
    agenda: [
      'Folder to live URL · platform and classic server routes',
      'Pipeline YAML: push, scan, test, build, deploy, verify',
      'Poisonous versus healthy pushes and four defenses',
      'Pipelines as attack surfaces and safe defaults',
    ],
  },

  /* ------------------------------------------------------------- PART D: 27 */
  {
    id: 'deploy-plan',
    part: 'D',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part D · topic 27',
    title: 'From folder to live URL',
    lead: 'Folder, GitHub, build, live address.',
    command: 'git push origin main',
    notes:
      'Map the whole journey before typing: local folder, version control, hosted build, public URL. Every later scene fills one hop.',
    body: [
      {
        type: 'pipeline',
        stages: [
          { id: 'folder', label: 'Folder', cmd: 'site/', detail: 'local project' },
          { id: 'github', label: 'GitHub', cmd: 'git push', detail: 'main branch' },
          { id: 'build', label: 'Build', cmd: 'npm run build', detail: 'Vite to dist/' },
          { id: 'live', label: 'Live URL', cmd: 'curl -I', detail: 'public address' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART D: 28 */
  {
    id: 'build-page',
    part: 'D',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part D · topic 28',
    title: 'Build the page in the terminal',
    lead: 'Folder, file, local preview.',
    command: 'python3 -m http.server 8000',
    notes:
      'Make the folder, create index.html in nano, serve it locally, then verify with curl. Keep the page tiny.',
    body: [
      {
        type: 'terminal',
        title: 'local page',
        steps: [
          { cmd: 'mkdir -p site', out: '' },
          { cmd: 'nano site/index.html', out: 'editing index.html' },
          { cmd: 'python3 -m http.server 8000', out: 'Serving HTTP on 8000...' },
          { cmd: 'curl -s localhost:8000', out: '<h1>My first deploy</h1>' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART D: 29 */
  {
    id: 'version-control',
    part: 'D',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part D · topic 29',
    title: 'Put it under version control',
    lead: 'Init, add, commit, connect, push.',
    command: 'git push -u origin main',
    notes:
      'Type the canonical sequence exactly. Emphasize that remote add connects history to GitHub; push publishes it.',
    body: [
      {
        type: 'terminal',
        title: 'publish history',
        steps: [
          { cmd: 'git init', out: 'Initialized empty Git repository' },
          { cmd: 'git add site/index.html', out: '' },
          { cmd: 'git commit -m "Add first page"', out: '[main abc1234] Add first page' },
          { cmd: 'git remote add origin github.com/student/site.git', out: '' },
          { cmd: 'git push -u origin main', out: 'main -> main' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART D: 30 */
  {
    id: 'link-repo',
    part: 'D',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part D · topic 30',
    title: 'Link the repo and go live',
    lead: 'Antideploy builds main into a public URL.',
    command: 'npm run build',
    notes:
      'Connect the repo, choose main, set npm run build and dist/, then watch GitHub, build and live URL tick in order.',
    body: [
      {
        type: 'deploy',
        title: 'antideploy flow',
        steps: [
          { id: 'push', command: 'git push origin main', detail: 'GitHub receives main' },
          { id: 'build', command: 'npm run build', detail: 'Platform builds Vite into dist/' },
          { id: 'live', command: 'curl -I https://student-site.example', detail: 'Live URL answers 200' },
        ],
      },
      {
        type: 'bullets',
        items: [
          { text: 'Track main; build on every merge.', tone: 'cyan' },
          { text: 'Keep secrets in the platform, not the repo.', tone: 'green' },
        ],
      },
    ],
  },

  /* ------------------------------------------- PART D: 30 · classic route */
  {
    id: 'server-deploy',
    part: 'D',
    kind: 'blocks',
    badge: 'LIVE',
    kicker: 'Part D · topic 30 · classic route',
    title: 'Classic route: scp plus nginx',
    lead: 'Copy files, serve them, verify the service.',
    command: 'curl -I http://203.0.113.7',
    notes:
      'Show the non-platform route: copy the folder, check nginx with systemctl, then verify over HTTP with curl.',
    body: [
      {
        type: 'deploy',
        title: 'linux server flow',
        steps: [
          { id: 'copy', command: 'scp -r site/ student@203.0.113.7:/var/www/site', detail: 'Files land in the web root' },
          { id: 'service', command: 'systemctl status nginx', detail: 'Service is active and enabled' },
          { id: 'verify', command: 'curl -I http://203.0.113.7', detail: 'Server answers 200' },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART D: 31 */
  {
    id: 'pipeline-yaml',
    part: 'D',
    kind: 'blocks',
    badge: 'LIVE',
    tight: true,
    kicker: 'Part D · topic 31',
    title: 'CI/CD: automatic checks on every push',
    lead: 'Test every push. Ship only what passes.',
    command: 'cat .github/workflows/ci.yml',
    notes:
      'Start on the diagram: every push travels the same six stages in order. Then open the real ci.yml and read it top to bottom. Call out permissions: contents: read and the SHA-pinned actions. Close honestly: this file was drafted with OpenCode, which is exactly why the secret scan is mandatory — automation needs guardrails.',
    cols: 'split',
    body: [
      {
        type: 'pipeline',
        stages: [
          { id: 'push', label: 'Push', cmd: 'git push', detail: 'publish main' },
          { id: 'scan', label: 'Secret scan', cmd: 'gitleaks detect --redact', detail: 'stop leaks first' },
          { id: 'test', label: 'Test', cmd: 'npm test', detail: 'fail fast if broken' },
          { id: 'build', label: 'Build', cmd: 'npm run build', detail: 'make dist/ from source' },
          { id: 'deploy', label: 'Deploy', cmd: 'deploy hook', detail: 'only when all green' },
          { id: 'verify', label: 'Verify', cmd: 'curl -I', detail: 'live URL answers 200' },
        ],
      },
      {
        type: 'code',
        file: '.github/workflows/ci.yml',
        caption: 'Excerpt from this deck. Drafted with OpenCode, reviewed by a human.',
        lines: [
          "name: ci # pipeline name",
          "on: [push, pull_request] # every push and PR",
          "permissions: # shrink the token",
          "  contents: read # read-only by default",
          "jobs:",
          "  build: # one fresh runner",
          "    runs-on: ubuntu-latest # clean VM",
          "    steps:",
          "      - uses: actions/checkout@<sha> # pinned, not @v4",
          "      - run: gitleaks detect --redact # secrets first",
          "      - run: npm ci # exact dependencies",
          "      - run: npm test # fail fast",
          "      - run: npm run build # produce dist/",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------- PART D: 32 */
  {
    id: 'poisonous-vs-healthy',
    part: 'D',
    kind: 'blocks',
    badge: 'LIVE',
    tight: true,
    kicker: 'Part D · topic 32',
    title: 'Poisonous push vs healthy push',
    lead: 'Same repo, same change, two outcomes.',
    command: 'git log --oneline -1',
    replayLabel: 'replay both pipelines',
    notes:
      'Left: a clearly fake demo API key in .env, caught at secret scan, deploy blocked. Right: the same change with the real value in CI secrets. Use Replay, then Swap.',
    body: [
      {
        type: 'push-duel',
        stepInterval: 0.45,
        poisonous: {
          title: 'Poisonous push',
          subtitle: 'secret committed by accident',
          file: '.env',
          fileLines: [
            '# DEMO FILE · VALUES ARE FAKE',
            'NODE_ENV=production',
            'API_KEY=FAKE_DEMO_KEY_DO_NOT_USE',
            'DATABASE_URL=postgres://demo:FAKE_DEMO_PASSWORD_DO_NOT_USE@db:5432/demo',
          ],
          stages: [
            { id: 'push', label: 'Push', cmd: 'git push', status: 'pass' },
            { id: 'scan', label: 'Secret scan', cmd: 'gitleaks detect --redact', status: 'fail' },
            { id: 'build', label: 'Build', cmd: 'npm run build', status: 'skip' },
            { id: 'deploy', label: 'Deploy', cmd: 'deploy hook', status: 'skip' },
          ],
          log: ['git commit -m "config"', 'git push origin main', 'gitleaks: 3 leaks found', 'BLOCKED'],
          outcome: {
            title: 'Deploy blocked',
            text: 'The key is in the git history and on GitHub. Now someone has to rotate it before anyone else does.',
          },
        },
        healthy: {
          title: 'Healthy push',
          subtitle: 'same feature, secret kept out',
          file: '.env.example',
          fileLines: [
            '# copy to .env and fill in locally',
            'NODE_ENV=production',
            'API_KEY=',
            'DATABASE_URL=postgres://user:password@localhost:5432/db',
          ],
          stages: [
            { id: 'push', label: 'Push', cmd: 'git push', status: 'pass' },
            { id: 'scan', label: 'Secret scan', cmd: 'gitleaks detect --redact', status: 'pass' },
            { id: 'build', label: 'Build', cmd: 'npm run build', status: 'pass' },
            { id: 'deploy', label: 'Deploy', cmd: 'deploy hook', status: 'pass' },
            { id: 'verify', label: 'Verify', cmd: 'curl -I', status: 'pass' },
          ],
          log: ['git commit -m "config"', 'git push origin main', 'scan: clean', 'deploy: live', 'verify: 200'],
          outcome: {
            title: 'Live without leaking secrets',
            text: 'The real key sits in the CI secret store. The repository holds a template with blank values.',
          },
        },
      },
    ],
  },

  /* ------------------------------------------------------------ D: SAFE PUSH */
  {
    id: 'safe-to-push',
    part: 'D',
    kind: 'blocks',
    cols: 'split',
    badge: 'SLIDE',
    kicker: 'Part D · what is safe to push',
    title: 'What is safe to push',
    lead: 'A table you can screenshot. This is the one page worth keeping.',
    command: 'git diff --staged --name-only',
    notes:
      'Walk the never column left to right. The tricky ones: .env.example is safe because it has no values, unreviewed AI code is not safe because a plausible-looking diff can still be wrong, and node_modules is never safe because it is 40 MB of someone else\'s code.',
    body: [
      {
        type: 'table',
        head: 'Item',
        columns: [
          { key: 'never', title: 'Never push', tone: 'bad' },
          { key: 'safe', title: 'Safe to push', tone: 'good' },
        ],
        rows: [
          { label: 'Env files', never: '.env, .env.production', safe: '.env.example (blank)' },
          { label: 'Credentials', never: 'API keys, tokens, passwords', safe: 'references to CI secrets' },
          { label: 'Keys', never: 'id_rsa, *.pem', safe: 'public keys only' },
          { label: 'Database', never: 'dumps, .sql, backups', safe: 'migrations' },
          { label: 'Dependencies', never: 'node_modules', safe: 'package-lock.json' },
          { label: 'AI code', never: 'unreviewed chatbot diffs', safe: 'code you read and tested' },
        ],
        caption: 'If a secret reaches the remote, rotating it is the fix. Deleting the commit is not.',
      },
    ],
  },

  /* -------------------------------------------------------- D: SECURITY LAYERS */
  {
    id: 'security-layers',
    part: 'D',
    kind: 'blocks',
    cols: 'split',
    badge: 'SLIDE',
    kicker: 'Part D · defence in depth',
    title: 'Four layers of protection',
    lead: 'Assume the first one fails. That is what layers are for.',
    command: 'git config core.hooksPath .githooks',
    notes:
      'Layer 1 is the only one you always have. Layer 2 is on by default on GitHub for supported secret patterns. Layer 3 is this pipeline. Layer 4 is dependency scanning. Finish on the note: pin third-party GitHub Actions to a commit SHA, because a pipeline is an attack surface and a tag can be moved under you.',
    body: [
      {
        type: 'pipeline',
        orientation: 'vertical',
        stages: [
          { id: 'l1', label: 'Layer 1 · local', cmd: '.gitignore + pre-commit', detail: 'before it leaves your machine' },
          { id: 'l2', label: 'Layer 2 · GitHub', cmd: 'push protection', detail: 'server side, blocks known patterns' },
          { id: 'l3', label: 'Layer 3 · CI', cmd: 'gitleaks detect', detail: 'inside your pipeline, every push' },
          { id: 'l4', label: 'Layer 4 · dependencies', cmd: 'npm audit + dependabot', detail: 'the code you depend on' },
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        icon: '🔗',
        title: 'Pin third-party GitHub Actions to a commit SHA',
        body: 'A movable tag can be repointed to malicious code. Pin the full SHA and note its version.',
      },
    ],
  },

  /* --------------------------------------- D: PIPELINE ATTACK SURFACE */
  {
    id: 'pipeline-attack-surface',
    part: 'D',
    kind: 'blocks',
    badge: 'SLIDE',
    kicker: 'Part D · warning',
    title: 'Pipelines are attack surfaces too',
    lead: 'Pin actions. Shrink tokens. Review automation.',
    command: 'git diff -- .github/workflows/',
    notes:
      'Pipelines run powerful automation on every push. Pin third-party actions to SHAs and grant workflows the smallest token scope that works.',
    body: [
      {
        type: 'code',
        file: '.github/workflows/ci.yml',
        caption: 'Two hardening lines worth copying.',
        lines: [
          'permissions:',
          '  contents: read # smallest workable scope',
          '- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2',
        ],
      },
      {
        type: 'bullets',
        items: [
          { text: 'Tags move; SHAs do not.', tone: 'amber' },
          { text: 'Tokens should read, not write, by default.', tone: 'cyan' },
        ],
      },
    ],
  },

  /* --------------------------------------------------------- CLOSING HEADER */
  {
    id: 'part-closing',
    part: 'closing',
    kind: 'part',
    badge: 'SLIDE',
    title: 'Closing',
    notes: 'Wrap up with the roadmap, challenge and thank-you.',
  },

  {
    id: 'take-home-launch',
    part: 'closing',
    kind: 'blocks',
    badge: 'LIVE',
    tight: true,
    kicker: 'Take-home · topic 33',
    title: 'Take the controls home',
    lead: 'Learn the branches. Install Linux. Say thanks.',
    command: 'echo "Thank you"',
    notes:
      'Present this live: walk the three roadmap branches, set the install challenge, then thank the room. The five roadmap slides after this one are take-home, not presented — point at them and assign one branch each.',
    body: [
      {
        type: 'table',
        head: 'Roadmap branch',
        columns: [
          { key: 'focus', title: 'Focus', tone: 'left' },
          { key: 'commands', title: 'Commands', tone: 'right' },
        ],
        rows: [
          { label: 'Users', focus: 'accounts and admin power', commands: 'id · groups · sudo -l' },
          { label: 'Links', focus: 'hard versus symbolic names', commands: 'ln · ln -s · ls -li' },
          { label: 'Disks and boot', focus: 'devices, volumes, loader', commands: 'lsblk · mount · GRUB' },
        ],
        caption: 'Based on the roadmap.sh Linux path.',
      },
      {
        type: 'bullets',
        items: [
          { text: 'Install Linux, use a VM, or enable WSL.', tone: 'green' },
          { text: 'Report distro plus architecture from uname -a.', tone: 'cyan' },
        ],
      },
      {
        type: 'terminal',
        title: 'sign off',
        steps: [
          { cmd: 'echo "Thank you"', out: 'Thank you', tone: 'green' },
          { cmd: 'cat contact.txt', out: 'github   github.com/your-handle\nlinkedin linkedin.com/in/your-handle\nemail    your.email@example.com' },
          { cmd: 'exit', out: 'logout' },
        ],
      },
    ],
  },

  {
    id: 'linux-roadmap',
    part: 'closing',
    kind: 'blocks',
    badge: 'TAKE-HOME',
    tight: true,
    kicker: 'Take-home · roadmap overview',
    title: 'Where to go next: the Linux roadmap',
    lead: 'One map. Learn it branch by branch.',
    command: 'curl -Ls roadmap.sh/linux',
    notes:
      'Point at the interactive map, not the poster PDF. Study order: basics, text and shell, processes and users, packages and services, disks boot and network, then containers. Credit roadmap.sh; the table below is a distilled study order.',
    body: [
      {
        type: 'table',
        head: 'Roadmap branch',
        columns: [
          { key: 'focus', title: 'Focus', tone: 'left' },
          { key: 'commands', title: 'Try first', tone: 'right' },
        ],
        rows: [
          { label: 'Basics', focus: 'navigation, files, permissions', commands: 'ls · cd · chmod' },
          { label: 'Text & shell', focus: 'pipes, grep, scripting', commands: 'grep · cut · for' },
          { label: 'Processes & users', focus: 'jobs, signals, accounts', commands: 'ps · kill · sudo' },
          { label: 'Packages & services', focus: 'installs, systemd units', commands: 'apt · systemctl' },
          { label: 'Disks, boot & network', focus: 'mounts, logs, DNS, SSH', commands: 'lsblk · journalctl · ssh' },
          { label: 'Containers & beyond', focus: 'limits, runtime, Docker', commands: 'docker · roadmap.sh' },
        ],
        caption: 'Distilled from the roadmap.sh Linux poster. Interactive version at roadmap.sh/linux.',
      },
      {
        type: 'bullets',
        items: [
          { text: 'Work one branch at a time on the interactive map.', tone: 'green' },
          { text: 'Finished Linux? Continue with DevOps · Docker · Kubernetes · Backend.', tone: 'cyan' },
        ],
      },
    ],
  },

  {
    id: 'roadmap-basics',
    part: 'closing',
    kind: 'blocks',
    badge: 'TAKE-HOME',
    tight: true,
    kicker: 'Take-home · roadmap 1 of 4',
    title: 'Roadmap: basics and files',
    lead: 'Navigate, edit, redirect, permit.',
    command: 'ls -la ~/ | head',
    notes:
      'Poster sections: Navigation Basics plus Working with Files. Survival kit only: move around, read the manual, edit and quit, redirect output, flip permission bits.',
    body: [
      {
        type: 'table',
        head: 'Branch',
        columns: [
          { key: 'focus', title: 'Focus', tone: 'left' },
          { key: 'commands', title: 'Try first', tone: 'right' },
        ],
        rows: [
          { label: 'Navigation', focus: 'move, create, remove, hierarchy', commands: 'pwd · cd · mkdir · rm' },
          { label: 'Shell basics', focus: 'path, env, help, redirects, root', commands: 'echo $PATH · man · sudo' },
          { label: 'Editing', focus: 'Vim and Nano survival', commands: 'nano · vim' },
          { label: 'Permissions', focus: 'read, write, execute', commands: 'ls -l · chmod · chown' },
          { label: 'Archive & links', focus: 'compress, copy, hard vs soft', commands: 'tar · cp · ln -s' },
          { label: 'Text processing', focus: 'stdin/out/err, filters, pipes', commands: 'grep · sort · cut · |' },
        ],
        caption: 'Poster: Basic Commands, Directory Hierarchy, Vim/Nano, File Permissions, Archiving, Links, cut/grep/awk.',
      },
    ],
  },

  {
    id: 'roadmap-system',
    part: 'closing',
    kind: 'blocks',
    badge: 'TAKE-HOME',
    kicker: 'Take-home · roadmap 2 of 4',
    title: 'Roadmap: processes, users, services',
    lead: 'Run it, own it, keep it alive.',
    command: 'ps aux --sort=-%cpu | head',
    notes:
      'Poster sections: Process, User, Service and Package Management. The daily-admin loop: inspect a process, signal it, check who you are, control the unit, install from a repo.',
    body: [
      {
        type: 'table',
        head: 'Branch',
        columns: [
          { key: 'focus', title: 'Focus', tone: 'left' },
          { key: 'commands', title: 'Try first', tone: 'right' },
        ],
        rows: [
          { label: 'Processes', focus: 'background, find, signals, priority', commands: 'jobs · ps · kill · nice' },
          { label: 'Users', focus: 'create, groups, permissions', commands: 'id · groups · sudo -l' },
          { label: 'Services', focus: 'systemd units, logs, start/stop', commands: 'systemctl · journalctl' },
          { label: 'Packages', focus: 'repos, install, upgrade, snap', commands: 'apt · snap' },
        ],
        caption: 'Poster: Background/Foreground, Signals, Users & Groups, systemd units, Repositories, Snap.',
      },
    ],
  },

  {
    id: 'roadmap-infra',
    part: 'closing',
    kind: 'blocks',
    badge: 'TAKE-HOME',
    kicker: 'Take-home · roadmap 3 of 4',
    title: 'Roadmap: disks, boot, network',
    lead: 'Store it, boot it, reach it.',
    command: 'lsblk && ip -br addr',
    notes:
      'Poster sections: Disks and Filesystems, Booting Linux, Networking, Server Review. Read bottom-up when stuck: is it the disk, the boot, or the wire?',
    body: [
      {
        type: 'table',
        head: 'Branch',
        columns: [
          { key: 'focus', title: 'Focus', tone: 'left' },
          { key: 'commands', title: 'Try first', tone: 'right' },
        ],
        rows: [
          { label: 'Disks', focus: 'inodes, filesystems, mounts, LVM', commands: 'lsblk · mount · df -h' },
          { label: 'Boot', focus: 'loaders, boot logs', commands: 'GRUB · journalctl -b' },
          { label: 'Network', focus: 'TCP/IP, subnets, DNS, SSH', commands: 'ping · traceroute · ssh' },
          { label: 'Observe', focus: 'uptime, auth logs, memory', commands: 'uptime · free -h · netstat' },
        ],
        caption: 'Poster: Swap, Mounts, Boot Loaders, Subnetting, DHCP, DNS, Netfilter, File Transfer, Uptime.',
      },
    ],
  },

  {
    id: 'roadmap-code',
    part: 'closing',
    kind: 'blocks',
    badge: 'TAKE-HOME',
    kicker: 'Take-home · roadmap 4 of 4',
    title: 'Roadmap: script it, ship it',
    lead: 'Automate, contain, keep learning.',
    command: 'docker run --rm hello-world',
    notes:
      'Poster sections: Shell Programming, Troubleshooting, Containerization, related roadmaps. Variables before loops, loops before containers; tcpdump only after ping and netstat make sense.',
    body: [
      {
        type: 'table',
        head: 'Branch',
        columns: [
          { key: 'focus', title: 'Focus', tone: 'left' },
          { key: 'commands', title: 'Try first', tone: 'right' },
        ],
        rows: [
          { label: 'Shell programs', focus: 'literals, variables, loops, ifs', commands: 'for · if · bash -x' },
          { label: 'Troubleshoot', focus: 'ICMP, trace, packet capture', commands: 'ping · netstat · tcpdump' },
          { label: 'Containers', focus: 'ulimits, cgroups, runtime', commands: 'ulimit · docker' },
          { label: 'Keep going', focus: 'DevOps, Backend, K8s maps', commands: 'roadmap.sh' },
        ],
        caption: 'Poster: Literals, Conditionals, Debugging, Packet Analysis, Container Runtime, related roadmaps.',
      },
    ],
  },

  {
    id: 'student-feedback',
    part: 'closing',
    kind: 'blocks',
    badge: 'TAKE-HOME',
    kicker: 'Closing · feedback',
    title: 'Student feedback: two minutes',
    lead: 'Tell us what landed and what to fix before next semester.',
    command: 'echo "thanks for coming"',
    notes: 'Leave this scene open while students file out; the form is embedded here as well as linked below.',
    body: [
      { type: 'feedback', url: 'https://forms.gle/hLpzKbThQ17wNZSD6', title: 'Student feedback form' },
    ],
  },
]

/** Derived index of the first scene in each part, used by number-key jumps. */
export const partIndex = scenes.reduce((acc, s, i) => {
  if (!(s.part in acc)) acc[s.part] = i
  return acc
}, {})
