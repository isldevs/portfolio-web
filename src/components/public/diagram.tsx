'use client';
import { useEffect, useId, useRef, useState } from 'react';
export function Diagram({ code }: { code: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, ''),
    target = useRef<HTMLDivElement>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'dark',
          suppressErrorRendering: true,
          themeVariables: {
            primaryColor: '#10251a',
            primaryTextColor: '#e8edf0',
            primaryBorderColor: '#2c6c49',
            lineColor: '#36e89b',
            fontFamily: 'monospace',
          },
        });
        const result = await mermaid.render(`diagram${id}`, code);
        if (active && target.current) target.current.innerHTML = result.svg;
      } catch {
        if (active) setError(true);
      }
    }
    void render();
    return () => {
      active = false;
    };
  }, [code, id]);
  return (
    <figure className="diagram" aria-label="Architecture diagram">
      {error ? (
        <>
          <p>Diagram could not be rendered.</p>
          <pre>{code}</pre>
        </>
      ) : (
        <div ref={target} role="img" aria-label="Technical architecture diagram">
          <span className="muted">Rendering diagram…</span>
        </div>
      )}
    </figure>
  );
}
