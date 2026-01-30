import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

interface StreamingTextProps {
  content: string;
  speed?: number; // characters per frame
  onComplete?: () => void;
  className?: string;
}

const formatMarkdown = (text: string): string => {
  // Clean up any remaining system artifacts
  let cleaned = text
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^(Risk Level|Confidence|Strategy Type|Bottleneck):.*$/gm, '')
    .trim();

  // Natural markdown formatting
  let formatted = cleaned
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-foreground/90">$1</em>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-base font-semibold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-sm font-medium text-foreground mt-4 mb-1.5">$1</h3>')
    .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-muted-foreground leading-relaxed">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 list-decimal text-muted-foreground leading-relaxed">$2</li>')
    .replace(/\n\n/g, '</p><p class="mb-3 text-muted-foreground leading-relaxed">')
    .replace(/\n/g, '<br />');
  
  const html = `<p class="mb-3 text-muted-foreground leading-relaxed">${formatted}</p>`;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['class'],
  });
};

const StreamingText = ({ content, speed = 8, onComplete, className }: StreamingTextProps) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef(content);
  const frameRef = useRef<number>();

  useEffect(() => {
    // Reset if content changes
    if (content !== contentRef.current) {
      contentRef.current = content;
      setDisplayedLength(0);
      setIsComplete(false);
    }
  }, [content]);

  useEffect(() => {
    if (displayedLength >= content.length) {
      if (!isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    // Variable speed - faster for spaces/punctuation, slower for words
    const currentChar = content[displayedLength];
    const delay = currentChar === ' ' || currentChar === '\n' ? 5 : 
                  currentChar === '.' || currentChar === '!' || currentChar === '?' ? 50 : 15;

    const timeoutId = setTimeout(() => {
      setDisplayedLength(prev => Math.min(prev + speed, content.length));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [displayedLength, content, speed, isComplete, onComplete]);

  const displayedContent = content.substring(0, displayedLength);
  const formattedContent = formatMarkdown(displayedContent);

  return (
    <div 
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

export default StreamingText;
