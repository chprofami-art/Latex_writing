import React, { useState } from 'react';
import { AIStatus, SelectionRange } from '../types';
import { Sparkles, FileText, ArrowRight, BookOpen, Loader2, Wand2 } from 'lucide-react';

interface SidebarProps {
  selection: SelectionRange | null;
  onRewrite: () => void;
  onConvert: () => void;
  onSmartEdit: (instruction: string) => void;
  aiStatus: AIStatus;
  mode: 'RAW' | 'LATEX';
}

const Sidebar: React.FC<SidebarProps> = ({ selection, onRewrite, onConvert, onSmartEdit, aiStatus, mode }) => {
  const [instruction, setInstruction] = useState('');
  const hasSelection = selection && selection.text.length > 0;

  const handleSmartEdit = () => {
    if (!instruction.trim()) return;
    onSmartEdit(instruction);
    setInstruction('');
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-xl z-10">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">AI Assistant</h2>
        
        {/* Smart Edit Section */}
        <div className="mb-6">
            <label className="text-xs font-semibold text-gray-400 mb-2 block">SMART EDIT</label>
            <div className="relative">
                <textarea 
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500 resize-none h-24 bg-white"
                    placeholder="e.g. Add a conclusion about the ethics of AI..."
                />
                <button
                    onClick={handleSmartEdit}
                    disabled={aiStatus === AIStatus.LOADING || !instruction.trim()}
                    className="absolute bottom-2 right-2 p-1.5 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                    {aiStatus === AIStatus.LOADING ? <Loader2 className="animate-spin" size={14}/> : <ArrowRight size={14} />}
                </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
                Instruction will be applied to the entire document.
            </p>
        </div>
        
        <div className="space-y-3">
             <div className="flex items-center gap-2 mb-1">
                <span className="h-px bg-gray-200 flex-1"></span>
                <span className="text-[10px] text-gray-400 font-semibold">TOOLS</span>
                <span className="h-px bg-gray-200 flex-1"></span>
            </div>

            <button
              onClick={onConvert}
              disabled={aiStatus === AIStatus.LOADING}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                mode === 'RAW' 
                  ? 'bg-brand-50 border-brand-200 text-brand-900 hover:bg-brand-100' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-brand-500 hover:text-brand-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <span className="font-medium text-sm">Convert to LaTeX</span>
              </div>
            </button>

            <button
              onClick={onRewrite}
              disabled={!hasSelection || aiStatus === AIStatus.LOADING}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                hasSelection
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <span className="font-medium text-sm">Rewrite Selection</span>
              </div>
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Tips</h3>
        
        <div className="space-y-4">
             <TipCard 
                icon={<Wand2 size={16} />}
                title="Smart Edit"
                description="Type natural language instructions to modify content, fix equations, or reorganize sections automatically."
            />
            <TipCard 
                icon={<BookOpen size={16} />}
                title="Academic Tone"
                description="Select any paragraph and click 'Rewrite' to enhance its scholarly tone using Gemini 3."
            />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-center text-gray-400">
        Powered by Google Gemini 3
      </div>
    </div>
  );
};

const TipCard: React.FC<{icon: React.ReactNode, title: string, description: string}> = ({icon, title, description}) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-gray-800 font-medium mb-1">
            {icon}
            {title}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
            {description}
        </p>
    </div>
);

export default Sidebar;