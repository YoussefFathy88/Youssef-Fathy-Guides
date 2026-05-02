const fs = require('fs');
const files = [
  'content/sessions/module-1/02-tokens-context-window.mdx',
  'content/sessions/module-1/03-embeddings.mdx',
  'content/sessions/module-1/04-why-transformer.mdx',
  'content/sessions/module-1/04-transformer-attention.mdx',
  'content/sessions/module-1/03-how-llms-are-trained.mdx',
  'content/sessions/module-2/06-agent-memory-types.mdx',
  'content/sessions/module-2/07-rag.mdx',
  'content/sessions/module-2/08-tools-and-function-calling.mdx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    const text = fs.readFileSync(f, 'utf8');
    const match = text.match(/<NodeFlowDiagram[\s\S]*?\/>/);
    if (match) {
      console.log(`\n\n--- FILE: ${f} ---`);
      console.log(match[0]);
    }
  }
});
