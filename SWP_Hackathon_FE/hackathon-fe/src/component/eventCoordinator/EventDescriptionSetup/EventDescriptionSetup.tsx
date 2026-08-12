import { PlusCircle, Trash2 } from 'lucide-react';
import type { Description, prizes } from '../../../types/hackathonEvent/Hackathon';

interface EventDescriptionSetupProps {
  description: Description;
  onChange: (description: Description) => void;
}

export default function EventDescriptionSetup({ description, onChange }: EventDescriptionSetupProps) {

  const updateField = (field: keyof Description, value: any) => {
    onChange({ ...description, [field]: value });
  };

  const handleAddStringList = (field: keyof Description) => {
    const list = description[field] as string[];
    updateField(field, [...list, '']);
  };

  const handleUpdateStringList = (field: keyof Description, index: number, value: string) => {
    const list = [...(description[field] as string[])];
    list[index] = value;
    updateField(field, list);
  };

  const handleRemoveStringList = (field: keyof Description, index: number) => {
    const list = [...(description[field] as string[])];
    list.splice(index, 1);
    updateField(field, list);
  };

  const handleAddPrize = () => {
    updateField('prizes', [...description.prizes, { title: '', reward: '' }]);
  };

  const handleUpdatePrize = (index: number, field: keyof prizes, value: string) => {
    const newPrizes = [...description.prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    updateField('prizes', newPrizes);
  };

  const handleRemovePrize = (index: number) => {
    const newPrizes = [...description.prizes];
    newPrizes.splice(index, 1);
    updateField('prizes', newPrizes);
  };

  const renderStringList = (title: string, field: keyof Description, placeholder: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider">{title}</label>
        <button type="button" onClick={() => handleAddStringList(field)} className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
          <PlusCircle className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {(description[field] as string[]).map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={e => handleUpdateStringList(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
          />
          <button type="button" onClick={() => handleRemoveStringList(field, index)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {(description[field] as string[]).length === 0 && (
        <p className="text-[11px] text-slate-400 italic">No items added yet.</p>
      )}
    </div>
  );

  return (
    <section className="scroll-mt-24 space-y-4" id="section-description">
      <div>
        <h3 className="text-base font-semibold text-slate-900 leading-tight">Event Description & Rules</h3>
        <p className="text-xs text-slate-400 mt-1">Provide detailed information about your hackathon.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-8">

        {/* Introduction */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase font-mono tracking-wider">Introduction</label>
          <textarea
            rows={4}
            value={description.introduction}
            onChange={e => updateField('introduction', e.target.value)}
            placeholder="Welcome to our hackathon..."
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all leading-normal"
          />
        </div>

        {/* Prizes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-500 uppercase font-mono tracking-wider">Prizes</label>
            <button type="button" onClick={handleAddPrize} className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Add Prize
            </button>
          </div>
          {description.prizes.map((prize, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={prize.title}
                onChange={e => handleUpdatePrize(index, 'title', e.target.value)}
                placeholder="e.g. 1st Place"
                className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
              />
              <input
                type="text"
                value={prize.reward}
                onChange={e => handleUpdatePrize(index, 'reward', e.target.value)}
                placeholder="e.g. $5000"
                className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
              />
              <button type="button" onClick={() => handleRemovePrize(index)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {description.prizes.length === 0 && (
            <p className="text-[11px] text-slate-400 italic">No prizes added yet.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderStringList('Participant Benefits', 'participantBenefits', 'e.g. Free swags')}
          {renderStringList('Disqualification Rules', 'disqualificationRules', 'e.g. Plagiarism is strictly prohibited')}
          {renderStringList('Competition Rules', 'competitionRules', 'e.g. Teams must consist of 1-4 members')}
          {renderStringList('FAQ', 'faq', 'e.g. Q: Who can join? A: Anyone.')}
        </div>
      </div>
    </section>
  );
}
