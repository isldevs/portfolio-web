import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Load only the languages this CMS supports, rather than Shiki's full language/theme registry.
let highlighter: ReturnType<typeof createHighlighterCore> | undefined;
export async function highlightCode(code: string, options: { lang: string; theme: string }) {
  highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/github-dark-default.mjs')],
    langs: [
      import('shiki/langs/java.mjs'),
      import('shiki/langs/sql.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/yaml.mjs'),
      import('shiki/langs/xml.mjs'),
      import('shiki/langs/bash.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/javascript.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return (await highlighter).codeToHtml(code, options);
}
