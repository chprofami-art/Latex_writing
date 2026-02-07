import { ParsedElement } from '../types';

/**
 * A robust "best-effort" parser to visualize LaTeX structure.
 * Handles paragraphs, sections, and various math environments.
 */
export const parseLatexToElements = (latex: string): ParsedElement[] => {
  const lines = latex.split('\n');
  const elements: ParsedElement[] = [];
  let currentParagraph = '';
  
  // State for block parsing
  let inMathBlock = false;
  let mathBuffer = '';

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      elements.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'paragraph',
        content: currentParagraph.trim(),
        raw: currentParagraph
      });
      currentParagraph = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 1. Handle Math Blocks
    // Start of block
    if (!inMathBlock && (
        line.startsWith('$$') || 
        line.startsWith('\\[') || 
        line.startsWith('\\begin{equation}') || 
        line.startsWith('\\begin{align}') ||
        line.startsWith('\\begin{gather}')
    )) {
        flushParagraph();
        inMathBlock = true;
        mathBuffer = line;

        // Check for single-line block case
        const endMarkers = ['$$', '\\]', '\\end{equation}', '\\end{align}', '\\end{gather}'];
        const hasEndOnSameLine = endMarkers.some(marker => line.endsWith(marker) && line !== marker && line.length > marker.length);
        
        // Special case: '$$' is both start and end, so strictly check if length > 2
        if (line === '$$' || line === '\\[') {
            // Just start, continue to next line
        } else if (hasEndOnSameLine || (line.startsWith('$$') && line.endsWith('$$') && line.length > 2)) {
             inMathBlock = false;
             // Clean content for KaTeX
             let content = mathBuffer
                .replace(/^(\$\$|\\\[)/, '')
                .replace(/(\$\$|\\\])$/, '');
             
             // Keep environment commands (\begin...) intact as KaTeX needs them
             if (mathBuffer.startsWith('\\begin')) {
                 content = mathBuffer;
             }

             elements.push({ id: `math-${i}`, type: 'math', content: content.trim(), raw: mathBuffer });
             mathBuffer = '';
        }
        continue;
    }

    // Inside block
    if (inMathBlock) {
        mathBuffer += '\n' + line;
        
        if (
            line.endsWith('$$') || 
            line.endsWith('\\]') || 
            line.endsWith('\\end{equation}') || 
            line.endsWith('\\end{align}') ||
            line.endsWith('\\end{gather}')
        ) {
             inMathBlock = false;
             
             let content = mathBuffer;
             // Strip delimiters if standard display math
             if (content.startsWith('$$')) content = content.slice(2);
             if (content.startsWith('\\[')) content = content.slice(2);
             if (content.endsWith('$$')) content = content.slice(0, -2);
             if (content.endsWith('\\]')) content = content.slice(0, -2);
             
             // Don't strip if it's an environment like \begin{equation}
             if (mathBuffer.trim().startsWith('\\begin')) {
                 content = mathBuffer;
             }

             elements.push({ id: `math-${i}`, type: 'math', content: content.trim(), raw: mathBuffer });
             mathBuffer = '';
        }
        continue;
    }

    // 2. Structure Commands
    if (line.startsWith('\\section{')) {
      flushParagraph();
      const content = line.match(/\\section\{(.*?)\}/)?.[1] || '';
      elements.push({ id: `sec-${i}`, type: 'section', content, raw: line });
    } else if (line.startsWith('\\subsection{')) {
      flushParagraph();
      const content = line.match(/\\subsection\{(.*?)\}/)?.[1] || '';
      elements.push({ id: `subsec-${i}`, type: 'subsection', content, raw: line });
    } else if (line.startsWith('\\maketitle')) {
        flushParagraph();
        elements.push({
            id: `title-${i}`,
            type: 'unknown',
            content: 'TITLE_PLACEHOLDER',
            raw: line
        });
    } else if (
        line.startsWith('\\begin{document}') || 
        line.startsWith('\\end{document}') || 
        line.startsWith('\\documentclass') || 
        line.startsWith('\\usepackage') ||
        line.startsWith('\\title') || 
        line.startsWith('\\author') || 
        line.startsWith('\\date')
    ) {
       // Ignore metadata/preamble lines in the flow
    } else {
      // 3. Paragraph accumulation
      if (line === '') {
        flushParagraph();
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + line;
      }
    }
  }
  flushParagraph();
  return elements;
};

// Helper to extract metadata from preamble
export const extractMetadata = (latex: string) => {
    const titleMatch = latex.match(/\\title\{(.*?)\}/);
    const authorMatch = latex.match(/\\author\{(.*?)\}/);
    const dateMatch = latex.match(/\\date\{(.*?)\}/);

    return {
        title: titleMatch ? titleMatch[1] : 'Untitled Document',
        author: authorMatch ? authorMatch[1] : '',
        date: dateMatch ? dateMatch[1] : ''
    };
};