import React, { useState, useEffect } from 'react';
import { Edit2, Save } from 'lucide-react';

interface CanvasCellProps {
  title: string;
  badge?: string;
  dataKey: string;
  content: string | string[];
  icon?: any;
  onUpdate: (key: string, value: string | string[]) => void;
}

export default function CanvasCell({ title, badge, dataKey, content, icon: Icon, onUpdate }: CanvasCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  
  useEffect(() => {
    if (Array.isArray(content)) setEditValue(content.join('\n- '));
    else setEditValue(content || '');
  }, [content]);

  const handleSave = () => {
    let newValue: string | string[] = editValue;
    if (Array.isArray(content)) {
      newValue = editValue.split('\n- ').map(s => s.replace(/^- /, '').trim()).filter(s => s !== '');
    }
    onUpdate(dataKey, newValue);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-[#141B31] p-5 rounded-2xl border border-gray-200 dark:border-[#2C3246] flex flex-col h-full hover:border-orange-500/50 transition-colors relative group">
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={18} className="text-gray-400" />}
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">
              {badge}
            </span>
          )}
          <button onClick={() => { isEditing ? handleSave() : setIsEditing(true); }} className="text-gray-400 hover:text-orange-500 p-1.5 bg-gray-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-colors">
            {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
          </button>
        </div>
      </div>
      
      <div className="flex-grow text-sm text-gray-600 dark:text-gray-300 font-medium">
        {isEditing ? (
          <textarea 
            className="w-full min-h-[120px] p-3 bg-white dark:bg-[#0A1128] border border-gray-300 dark:border-[#2C3246] rounded-xl outline-none text-sm focus:border-orange-500 text-gray-900 dark:text-white" 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)} 
            autoFocus 
          />
        ) : (
          <div className="whitespace-pre-wrap">
            {Array.isArray(content) ? (
              <ul className="list-disc pl-4 space-y-1.5">
                {content.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            ) : (
              <p>{content}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
