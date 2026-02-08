import React, { useState, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import LivePreview from './components/LivePreview';
import Sidebar from './components/Sidebar';
import { INITIAL_LATEX } from './constants';
import { AIStatus, SelectionRange, ParsedElement } from './types';
import { rewriteContent, convertToLatex, editContent } from './services/geminiService';
import { parseLatexToElements } from './utils/latexParser';
import { Layout, Maximize2, Minimize2, FileCode, Eye, Play, Download } from 'lucide-react';

const App: React.FC = () => {
  const [latexCode, setLatexCode] = useState(INITIAL_LATEX);
  const [parsedElements, setParsedElements] = useState<ParsedElement[]>([]);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus>(AIStatus.IDLE);
  const [mode, setMode] = useState<'RAW' | 'LATEX'>('LATEX');
  
  // Mobile/Layout state
  const [showSidebar, setShowSidebar] = useState(true);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);

  // Initial parse on load
  useEffect(() => {
    handleCompile();
  }, []);

  const handleCompile = () => {
      setParsedElements(parseLatexToElements(latexCode));
  };

  const handleDownloadPDF = () => {
      window.print();
  };

  const handleRewrite = async () => {
    if (!selection || !selection.text) return;
    
    setAiStatus(AIStatus.LOADING);
    try {
      const rewrittenText = await rewriteContent(selection.text);
      
      // Replace text in the editor
      const before = latexCode.substring(0, selection.start);
      const after = latexCode.substring(selection.end);
      const newCode = before + rewrittenText + after;
      
      setLatexCode(newCode);
      setAiStatus(AIStatus.SUCCESS);
      setSelection(null); 
    } catch (error) {
      setAiStatus(AIStatus.ERROR);
      console.error(error);
    } finally {
      setTimeout(() => setAiStatus(AIStatus.IDLE), 2000);
    }
  };

  const handleConvert = async () => {
      setAiStatus(AIStatus.LOADING);
      try {
          const newLatex = await convertToLatex(latexCode);
          setLatexCode(newLatex);
          setAiStatus(AIStatus.SUCCESS);
          setMode('LATEX');
      } catch (error) {
          setAiStatus(AIStatus.ERROR);
      } finally {
        setTimeout(() => setAiStatus(AIStatus.IDLE), 2000);
      }
  };

  const handleSmartEdit = async (instruction: string) => {
      setAiStatus(AIStatus.LOADING);
      try {
          const newLatex = await editContent(latexCode, instruction);
          setLatexCode(newLatex);
          setAiStatus(AIStatus.SUCCESS);
      } catch (error) {
          setAiStatus(AIStatus.ERROR);
      } finally {
          setTimeout(() => setAiStatus(AIStatus.IDLE), 2000);
      }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20 print-hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-serif font-bold">
            S
          </div>
          <span className="font-serif font-bold text-gray-800 tracking-tight">Scholarly AI</span>
        </div>

        <div className="flex items-center gap-3">
             {/* Compilation Controls */}
            <button 
                onClick={handleCompile}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium text-sm"
            >
                <Play size={14} fill="currentColor"/>
                Compile
            </button>
            
            <button 
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-sm"
            >
                <Download size={14} />
                PDF
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-md transition-colors ${showSidebar ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                title="Toggle Assistant"
            >
                <Layout size={18} />
            </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        <div className={`flex flex-col transition-all duration-300 ${previewCollapsed ? 'flex-1' : 'w-1/2'} border-r border-gray-200 relative print-hidden`}>
             <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
                 <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                     <FileCode size={14} className="text-brand-600"/>
                     Source Code
                 </div>
                 {previewCollapsed && (
                     <button onClick={() => setPreviewCollapsed(false)} className="text-gray-500 hover:text-brand-600">
                         <Maximize2 size={14} />
                     </button>
                 )}
             </div>
             <div className="flex-1 relative">
                <CodeEditor 
                    code={latexCode} 
                    onChange={setLatexCode} 
                    onSelect={setSelection}
                />
             </div>
        </div>

        {/* Preview Pane */}
        {!previewCollapsed && (
             <div className={`flex flex-col w-1/2 transition-all duration-300 bg-gray-200`}>
                 <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10">
                     <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                         <Eye size={14} className="text-brand-600"/>
                         PDF Preview
                     </div>
                     <button onClick={() => setPreviewCollapsed(true)} className="text-gray-500 hover:text-brand-600" title="Maximize Editor">
                         <Minimize2 size={14} />
                     </button>
                 </div>
                 <div className="flex-1 overflow-hidden relative">
                    <LivePreview elements={parsedElements} rawLatex={latexCode} />
                 </div>
            </div>
        )}

        {/* Sidebar (AI Tools) */}
        {showSidebar && (
            <Sidebar 
                selection={selection} 
                onRewrite={handleRewrite} 
                onConvert={handleConvert}
                onSmartEdit={handleSmartEdit}
                aiStatus={aiStatus}
                mode={mode}
                setMode={() => {}} // Mode setting not strictly needed for sidebar now
                className="print-hidden"
            />
        )}
      </div>
    </div>
  );
};

export default App;
