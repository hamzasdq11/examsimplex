import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import type { Note } from '@/types/database';

interface NoteViewerProps {
    note: Note;
}

export const NoteViewer = ({ note }: NoteViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!note.js_content || !containerRef.current) return;

        // Create a new script element
        const script = document.createElement('script');
        script.text = note.js_content;
        script.async = true;

        // Append it to the container to execute it
        // We append to the specific container to try to keep it scoped-ish, 
        // though JS is always global window scope unless using shadow DOM or iframes.
        containerRef.current.appendChild(script);

        return () => {
            // Cleanup script if needed? 
            // Usually removing the script tag doesn't undo the JS execution, 
            // but it keeps the DOM clean.
            if (containerRef.current && containerRef.current.contains(script)) {
                containerRef.current.removeChild(script);
            }
        };
    }, [note.js_content]);

    if (note.html_content) {
        return (
            <div ref={containerRef} className="space-y-4 w-full overflow-hidden" id={`note-content-${note.id}`}>
                {note.css_content && (
                    <style dangerouslySetInnerHTML={{
                        __html: `@scope (#note-content-${note.id}) {
                            ${note.css_content}
                        }`
                    }} />
                )}
                <div
                    className="prose prose-sm max-w-none dark:prose-invert w-full overflow-x-auto"
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(note.html_content, {
                            ADD_TAGS: ['img', 'style', 'center', 'font'],
                            ADD_ATTR: ['src', 'alt', 'style', 'class', 'width', 'height', 'align', 'face', 'size', 'color', 'id'],
                            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                        }),
                    }}
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
