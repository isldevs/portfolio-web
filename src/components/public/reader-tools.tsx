'use client';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { motion, useScroll, useReducedMotion } from 'motion/react';
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false),
    [failed, setFailed] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }
  return (
    <button className="copy-code" onClick={copy} aria-label="Copy code">
      {copied ? <Check size={12} /> : <Copy size={12} />}{' '}
      {copied ? 'Copied' : failed ? 'Select to copy' : 'Copy'}
    </button>
  );
}
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  return reduced ? null : (
    <motion.div className="reading-progress" style={{ scaleX: scrollYProgress }} />
  );
}
