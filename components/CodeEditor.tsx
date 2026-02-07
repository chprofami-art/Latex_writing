import React, { useRef, useEffect, useState } from 'react';
import { SelectionRange } from '../types';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onSelect: (range: SelectionRange) => void;
  isReadOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onSelect, isReadOnly }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);

  const handleSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value.substring(start, end);
      onSelect({ start, end, text });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      // Sync line number scroll
      const lineNums = document.getElementById('line-numbers');
      if (lineNums) {
          lineNums.scrollTop = e.currentTarget.scrollTop;
      }
  };

  return (
    <div className="relative flex h-full font-mono text-sm border-r border-gray-200 bg-white">
      {/* Line Numbers */}
      <div 
        id="line-numbers"
        className="hidden md:block w-12 bg-gray-50 border-r border-gray-100 text-right pr-2 pt-4 text-gray-400 select-none overflow-hidden h-full"
      >
        {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
          <div key={i} className="leading-6">{i + 1}</div>
        ))}
      </div>

      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onSelect={handleSelect}
        onScroll={handleScroll}
        readOnly={isReadOnly}
        className="flex-1 w-full h-full p-4 resize-none focus:outline-none custom-scrollbar leading-6 bg-transparent text-gray-800"
        spellCheck={false}
        placeholder="Enter your LaTeX code here..."
      />
    </div>
  );
};

export default CodeEditor;