import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import { ParsedElement } from '../types';
import { extractMetadata } from '../utils/latexParser';

interface LivePreviewProps {
  elements: ParsedElement[];
  rawLatex: string;
}

const LivePreview: React.FC<LivePreviewProps> = ({ elements, rawLatex }) => {
  const meta = extractMetadata(rawLatex);

  return (
    <div className="h-full overflow-y-auto bg-gray-200 p-8 custom-scrollbar flex justify-center print:p-0 print:overflow-visible print:bg-white print:block">
        {/* A4 Paper Container */}
        <div 
            id="pdf-preview-container"
            className="bg-white shadow-2xl min-h-[297mm] w-[210mm] p-[25mm] relative print:shadow-none print:w-full print:min-h-0 print:p-[20mm] print:absolute print:left-0 print:top-0"
            style={{ boxSizing: 'border-box' }}
        >
            <div className="space-y-6">
                {/* Document Title Block */}
                <div className="text-center mb-12 border-b pb-6 border-gray-100 print:border-gray-300">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{meta.title}</h1>
                {meta.author && <div className="text-lg text-gray-700">{meta.author}</div>}
                {meta.date && <div className="text-sm text-gray-500 mt-1">{meta.date}</div>}
                </div>

                {/* Content */}
                {elements.map((el) => (
                <PreviewElement key={el.id} element={el} />
                ))}

                {elements.length === 0 && (
                    <div className="text-gray-400 italic text-center mt-20 print:hidden">
                        Click "Compile" to generate the document preview.
                    </div>
                )}
            </div>
      </div>
      <style>{`
        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            body, html {
                height: auto !important;
                overflow: visible !important;
                background-color: white !important;
            }
            /* Hide Sidebar, Header, Editor */
            header, nav, aside, .overflow-hidden {
                display: none !important;
                overflow: visible !important;
                height: auto !important;
            }
            /* Reset the main workspace layout */
            #root > div {
                display: block !important;
                height: auto !important;
                overflow: visible !important;
            }
            /* Explicitly show the preview container */
            #pdf-preview-container {
                display: block !important;
                visibility: visible !important;
            }
            /* Hide any other children of the preview pane wrapper */
            #pdf-preview-container ~ * {
                display: none;
            }
        }
      `}</style>
    </div>
  );
};

const PreviewElement: React.FC<{ element: ParsedElement }> = ({ element }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (element.type === 'math' && containerRef.current) {
      try {
        katex.render(element.content, containerRef.current, {
          throwOnError: false,
          displayMode: true,
          strict: false,
          trust: true // Allow color commands
        });
      } catch (e) {
        console.error("KaTeX error:", e);
        if (containerRef.current) {
            containerRef.current.textContent = element.raw;
            containerRef.current.className = "text-red-500 font-mono text-sm py-2 text-center bg-red-50 rounded";
        }
      }
    }
  }, [element]);

  // Enhanced Text Formatter using Regex replacement
  const formatText = (text: string): React.ReactNode[] => {
    // 1. Split by Math ($...$)
    const parts = text.split(/(\$(?:\\.|[^$])+\$)/g);

    return parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1);
            return <InlineMath key={index} math={math} />;
        }

        // 2. Text Formatting Logic (Naive recursive-like replacement via string manipulation)
        let html = part;

        // Escape HTML to prevent XSS before we add our own tags, 
        // though strictly we trust the local input here for the demo.
        html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Bold: \textbf{...}
        html = html.replace(/\\textbf\{(.*?)\}/g, "<strong>$1</strong>");
        
        // Italic: \textit{...} or \emph{...}
        html = html.replace(/\\textit\{(.*?)\}/g, "<em>$1</em>");
        html = html.replace(/\\emph\{(.*?)\}/g, "<em>$1</em>");
        
        // Underline: \underline{...}
        html = html.replace(/\\underline\{(.*?)\}/g, "<u>$1</u>");

        // Color: \textcolor{red}{...}
        // This is a simple regex that assumes no nested braces inside the content
        html = html.replace(/\\textcolor\{([a-zA-Z]+)\}\{(.*?)\}/g, "<span style='color:$1'>$2</span>");
        
        // Links: \href{url}{text} (Basic support)
        html = html.replace(/\\href\{(.*?)\}\{(.*?)\}/g, "<a href='$1' class='text-blue-600 underline'>$2</a>");

        return <span key={index} dangerouslySetInnerHTML={{__html: html}} />;
    });
  };

  switch (element.type) {
    case 'section':
      return <h2 className="text-2xl font-bold font-serif text-gray-900 mt-8 mb-4 border-b border-gray-300 pb-2 leading-tight">{element.content}</h2>;
    case 'subsection':
      return <h3 className="text-xl font-bold font-serif text-gray-800 mt-6 mb-3 leading-tight">{element.content}</h3>;
    case 'math':
      return <div ref={containerRef} className="my-6" />;
    case 'paragraph':
      return <p className="leading-7 text-gray-800 font-serif mb-4 text-justify">{formatText(element.content)}</p>;
    default:
      return null;
  }
};

const InlineMath: React.FC<{ math: string }> = ({ math }) => {
    const ref = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        if (ref.current) {
            try {
                katex.render(math, ref.current, { 
                    throwOnError: false, 
                    displayMode: false,
                    strict: false,
                    trust: true
                });
            } catch (e) {
                if(ref.current) {
                    ref.current.textContent = `$${math}$`;
                    ref.current.className = "text-red-500 font-mono text-sm px-1";
                }
            }
        }
    }, [math]);
    
    return <span ref={ref} className="px-0.5" />;
};

export default LivePreview;