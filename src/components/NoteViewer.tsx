import { useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import type { Note } from '@/types/database';

interface NoteViewerProps {
    note: Note;
}

export const NoteViewer = ({ note }: NoteViewerProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const messageId = `note-iframe-${note.id}`;

    // Listen for height messages from the iframe
    const handleMessage = useCallback((event: MessageEvent) => {
        if (event.data?.type === 'resize' && event.data?.id === messageId) {
            const iframe = iframeRef.current;
            if (iframe) {
                iframe.style.height = event.data.height + 'px';
            }
        }
        // Handle link clicks - open in parent window
        if (event.data?.type === 'navigate' && event.data?.id === messageId) {
            window.open(event.data.url, '_blank', 'noopener');
        }
    }, [messageId]);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !note.html_content) return;

        const sanitizedHTML = DOMPurify.sanitize(note.html_content, {
            ADD_TAGS: ['img', 'style', 'center', 'font'],
            ADD_ATTR: ['src', 'alt', 'style', 'class', 'width', 'height', 'align', 'face', 'size', 'color', 'id'],
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        });

        const srcdoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #1a1a1a;
    overflow: hidden;
    background: transparent;
  }
  img { max-width: 100%; height: auto; }
  a { color: #2563eb; }
</style>
${note.css_content ? `<style>${note.css_content}</style>` : ''}
</head>
<body>
${sanitizedHTML}
${note.js_content ? `<script>${note.js_content}<\/script>` : ''}
<script>
  // Send height to parent for auto-resize
  function sendHeight() {
    var height = document.documentElement.scrollHeight;
    parent.postMessage({ type: 'resize', id: '${messageId}', height: height }, '*');
  }
  sendHeight();
  // Observe DOM changes for dynamic content
  new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  // Also resize on image load
  document.querySelectorAll('img').forEach(function(img) {
    img.addEventListener('load', sendHeight);
  });
  window.addEventListener('resize', sendHeight);

  // Intercept link clicks and send to parent
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (link && link.href) {
      e.preventDefault();
      parent.postMessage({ type: 'navigate', id: '${messageId}', url: link.href }, '*');
    }
  });
<\/script>
</body>
</html>`;

        iframe.srcdoc = srcdoc;
    }, [note.html_content, note.css_content, note.js_content, messageId]);

    if (note.html_content) {
        return (
            <div className="w-full overflow-hidden">
                <iframe
                    ref={iframeRef}
                    sandbox="allow-scripts"
                    className="w-full border-0"
                    style={{ minHeight: '50px', overflow: 'hidden' }}
                    title={note.chapter_title}
                />
            </div>
        );
    }

    // Fallback for old notes without html_content
    return (
        <ul className="space-y-2">
            {(note.points as string[]).map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                    <span
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(point),
                        }}
                    />
                </li>
            ))}
        </ul>
    );
};
