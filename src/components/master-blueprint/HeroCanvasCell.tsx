import React, { useState, useEffect } from 'react';
import { Edit2, Save } from 'lucide-react';

interface HeroCanvasCellProps {
  title: string;
  dataKey: string;
  content: string;
  onUpdate: (key: string, value: string) => void;
}

const HeroCanvasCell: React.FC<HeroCanvasCellProps> = ({ title, dataKey, content, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  useEffect(() => setEditValue(content || ''), [content]);
  
  const handleSave = () => {
    onUpdate(dataKey, editValue);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-[#141B31] p-6 md:p-8 lg:p-10 rounded-[12px] border-2 border-gray-200 dark:border-[#2C3246] outline-none transition-all duration-200 relative mb-8 md:mb-10 text-gray-900 dark:text-white flex flex-col shadow-gray-200 dark:shadow-black/50 hover:shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white font-heading">{title}</h2>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="px-5 py-2 rounded-xl font-bold text-sm shrink-0 transition-all bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 shadow-sm flex items-center gap-2 self-start sm:self-auto">
          {isEditing ? (
            <><Save size={16} /> <span className="text-xs font-bold font-heading">Simpan</span></>
          ) : (
            <><Edit2 size={16} /> <span className="text-xs font-bold font-heading">Edit</span></>
          )}
        </button>
      </div>

      <div className="relative z-10 w-full flex flex-col">
        {isEditing ? (
          <textarea 
            className="w-full min-h-[140px] p-4 md:p-5 bg-white dark:bg-black border-2 border-gray-900 dark:border-white/50 rounded-xl outline-none text-gray-900 dark:text-white text-lg md:text-xl font-bold focus:bg-white dark:focus:bg-gray-900 transition-colors placeholder-gray-500 dark:placeholder-gray-400 shadow-sm resize-y" 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)} 
            autoFocus 
          />
        ) : (
          <p className="text-xl md:text-[22px] lg:text-[26px] font-black text-gray-900 dark:text-white leading-[1.4] font-heading tracking-tight w-full">
            "{content}"
          </p>
        )}
      </div>
    </div>
  );
};

export default HeroCanvasCell;
