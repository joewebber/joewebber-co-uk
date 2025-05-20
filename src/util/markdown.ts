type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'italic'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; url: string }

type MarkdownNode =
  | { type: 'heading'; level: number; content: InlineNode[] }
  | { type: 'paragraph'; content: InlineNode[] }
  | { type: 'list'; ordered: boolean; items: InlineNode[][] }

function parseInline(text: string): InlineNode[] {
  const patterns: [RegExp, (match: RegExpMatchArray) => InlineNode][] = [
    [/\*\*(.+?)\*\*/g, (m) => ({ type: 'bold', text: m[1] })],
    [/__(.+?)__/g, (m) => ({ type: 'bold', text: m[1] })],
    [/\*(.+?)\*/g, (m) => ({ type: 'italic', text: m[1] })],
    [/_(.+?)_/g, (m) => ({ type: 'italic', text: m[1] })],
    [/`(.+?)`/g, (m) => ({ type: 'code', text: m[1] })],
    [
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (m) => ({ type: 'link', text: m[1], url: m[2] }),
    ],
  ]

  const result: InlineNode[] = []
  let remaining = text

  while (remaining.length > 0) {
    let matched = false

    for (const [pattern, creator] of patterns) {
      const match = pattern.exec(remaining)
      if (match && match.index === 0) {
        result.push(creator(match))
        remaining = remaining.slice(match[0].length)
        matched = true
        break
      }
    }

    if (!matched) {
      const nextSpecial = patterns
        .map(([r]) => r.exec(remaining)?.index ?? Infinity)
        .reduce((a, b) => Math.min(a, b), Infinity)
      const textPart =
        nextSpecial === Infinity ? remaining : remaining.slice(0, nextSpecial)
      result.push({ type: 'text', text: textPart })
      remaining = remaining.slice(textPart.length)
    }
  }

  return result
}

export function markdownToJson(markdown: string): MarkdownNode[] {
  const lines = markdown.split('\n')
  const result: MarkdownNode[] = []
  let currentParagraph: string[] = []
  let currentList: { ordered: boolean; items: string[][] } | null = null

  const flushParagraph = () => {
    if (currentParagraph.length) {
      const joined = currentParagraph.join(' ').trim()
      result.push({ type: 'paragraph', content: parseInline(joined) })
      currentParagraph = []
    }
  }

  const flushList = () => {
    if (currentList) {
      result.push({
        type: 'list',
        ordered: currentList.ordered,
        items: currentList.items.map((line) => parseInline(line.join(' '))),
      })
      currentList = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (/^#{1,6}\s/.test(trimmed)) {
      flushParagraph()
      flushList()
      const level = trimmed.match(/^#+/)![0].length
      const content = trimmed.replace(/^#+\s*/, '')
      result.push({ type: 'heading', level, content: parseInline(content) })
    } else if (/^(\*|-|\d+\.)\s+/.test(trimmed)) {
      flushParagraph()
      const ordered = /^\d+\.\s+/.test(trimmed)
      const item = trimmed.replace(/^(\*|-|\d+\.)\s+/, '')
      if (!currentList || currentList.ordered !== ordered) {
        flushList()
        currentList = { ordered, items: [] }
      }
      currentList.items.push([item])
    } else if (trimmed === '') {
      flushParagraph()
      flushList()
    } else {
      currentParagraph.push(trimmed)
    }
  }

  flushParagraph()
  flushList()

  return result
}

function renderInline(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
          return escapeHtml(node.text)
        case 'bold':
          return `<strong>${escapeHtml(node.text)}</strong>`
        case 'italic':
          return `<em>${escapeHtml(node.text)}</em>`
        case 'code':
          return `<code>${escapeHtml(node.text)}</code>`
        case 'link':
          return `<a href="${escapeHtml(node.url)}">${escapeHtml(node.text)}</a>`
      }
    })
    .join('')
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function markdownJsonToHtml(nodes: MarkdownNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'heading':
          return `<h${node.level}>${renderInline(node.content)}</h${node.level}>`
        case 'paragraph':
          return `<p>${renderInline(node.content)}</p>`
        case 'list':
          const tag = node.ordered ? 'ol' : 'ul'
          const itemsHtml = node.items
            .map((item) => `<li>${renderInline(item)}</li>`)
            .join('')
          return `<${tag}>${itemsHtml}</${tag}>`
      }
    })
    .join('\n')
}

export function markdownToHtml(markdown: string): string {
  const json = markdownToJson(markdown)
  return markdownJsonToHtml(json)
}
