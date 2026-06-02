import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export default function RichEditor({ value, onChange }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Custom toolbar options
    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ];

    const quill = new Quill(containerRef.current, {
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: 'Yazı içeriğini buraya girin...',
      theme: 'snow'
    });

    quillRef.current = quill;

    // Set initial content
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value);
    }

    // Handle change
    quill.on('text-change', () => {
      const html = containerRef.current.querySelector('.ql-editor').innerHTML;
      // Prevent infinite loop by checking if value is actually different
      if (html !== value) {
        onChange(html);
      }
    });

    return () => {
      // Cleanup (Quill doesn't have an explicit destroy, but clearing helps prevent memory leaks)
      quillRef.current = null;
    };
  }, []);

  // Update content if value changes from outside (e.g., loaded from API after mount)
  useEffect(() => {
    if (quillRef.current && value) {
      const currentHtml = containerRef.current.querySelector('.ql-editor').innerHTML;
      if (value !== currentHtml) {
        const selection = quillRef.current.getSelection();
        quillRef.current.clipboard.dangerouslyPasteHTML(value);
        if (selection) {
          quillRef.current.setSelection(selection);
        }
      }
    }
  }, [value]);

  return (
    <div className="rich-editor-wrapper bg-black/10 border border-white/10 rounded-lg overflow-hidden">
      <div ref={containerRef} className="min-h-[300px] text-[#f5f0eb]" />
      
      {/* Dark theme adjustments for Quill via inline style */}
      <style>{`
        .ql-toolbar.ql-snow {
          background-color: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.1) !important;
          border-top: none;
          border-left: none;
          border-right: none;
        }
        .ql-container.ql-snow {
          border-color: transparent !important;
          font-family: inherit;
        }
        .ql-editor {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #f5f0eb;
        }
        .ql-editor.ql-blank::before {
          color: #6b6b6b !important;
          font-style: normal;
        }
        .ql-snow .ql-stroke {
          stroke: #b0b0b0 !important;
        }
        .ql-snow .ql-fill {
          fill: #b0b0b0 !important;
        }
        .ql-snow .ql-picker {
          color: #b0b0b0 !important;
        }
        .ql-snow .ql-picker-options {
          background-color: #1e1e1e !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ql-snow .ql-picker-item {
          color: #b0b0b0 !important;
        }
        .ql-snow .ql-picker-item:hover, .ql-snow .ql-picker-item.ql-selected {
          color: #white !important;
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
