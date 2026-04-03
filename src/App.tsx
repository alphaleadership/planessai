/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Download, 
  ChevronRight, 
  Layout,
  Type,
  RotateCcw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { CATEGORIES, type EssayPlan, type Argument } from './types';

const INITIAL_PLAN: EssayPlan = {
  subject: '',
  introduction: {
    accroche: '',
    problematique: '',
    annoncePlan: '',
  },
  development: [
    {
      id: 'part-1',
      title: 'Thèse (Première partie)',
      subParts: [
        { id: 'sub-1-1', content: '' },
        { id: 'sub-1-2', content: '' }
      ]
    },
    {
      id: 'part-2',
      title: 'Antithèse (Deuxième partie)',
      subParts: [
        { id: 'sub-2-1', content: '' },
        { id: 'sub-2-2', content: '' }
      ]
    }
  ],
  conclusion: {
    synthese: '',
    reponse: '',
    ouverture: '',
  }
};

export default function App() {
  const [plan, setPlan] = useState<EssayPlan>(INITIAL_PLAN);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [isLoadingArgs, setIsLoadingArgs] = useState(true);
  const [showSubjectBank, setShowSubjectBank] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingArgs(true);
      const allArgs: Argument[] = [];
      
      try {
        // Fetch arguments
        for (const cat of CATEGORIES) {
          const fileName = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const response = await fetch(`/data/${fileName}.txt`);
          if (response.ok) {
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim() !== '');
            lines.forEach((line, index) => {
              allArgs.push({
                id: `${fileName}-${index}`,
                category: cat,
                text: line.trim()
              });
            });
          }
        }
        setArgumentsList(allArgs);

        // Fetch subjects
        const subResponse = await fetch('/data/sujets.txt');
        if (subResponse.ok) {
          const subText = await subResponse.text();
          setSubjectsList(subText.split('\n').filter(line => line.trim() !== ''));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingArgs(false);
      }
    };

    fetchData();
  }, []);

  const categories = ['All', ...CATEGORIES];

  const filteredArguments = selectedCategory === 'All' 
    ? argumentsList 
    : argumentsList.filter(a => a.category === selectedCategory);

  const filteredSubjects = subjectsList.filter(s => 
    s.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const addPart = () => {
    const newId = `part-${plan.development.length + 1}`;
    setPlan(prev => ({
      ...prev,
      development: [...prev.development, { id: newId, title: 'Nouvelle partie', subParts: [{ id: `${newId}-1`, content: '' }] }]
    }));
  };

  const addSubPart = (partId: string) => {
    setPlan(prev => ({
      ...prev,
      development: prev.development.map(p => 
        p.id === partId 
          ? { ...p, subParts: [...p.subParts, { id: `${p.id}-${p.subParts.length + 1}`, content: '' }] }
          : p
      )
    }));
  };

  const updateSubPart = (partId: string, subId: string, content: string) => {
    setPlan(prev => ({
      ...prev,
      development: prev.development.map(p => 
        p.id === partId 
          ? { ...p, subParts: p.subParts.map(s => s.id === subId ? { ...s, content } : s) }
          : p
      )
    }));
  };

  const exportPlan = () => {
    const content = `SUJET : ${plan.subject}\n\n` +
      `I. INTRODUCTION\n` +
      `Accroche : ${plan.introduction.accroche}\n` +
      `Problématique : ${plan.introduction.problematique}\n` +
      `Annonce du plan : ${plan.introduction.annoncePlan}\n\n` +
      `II. DÉVELOPPEMENT\n` +
      plan.development.map((p, i) => 
        `${i + 1}. ${p.title}\n` + 
        p.subParts.map((s, j) => `   ${i + 1}.${j + 1}. ${s.content}`).join('\n')
      ).join('\n\n') +
      `\n\nIII. CONCLUSION\n` +
      `Synthèse : ${plan.conclusion.synthese}\n` +
      `Réponse : ${plan.conclusion.reponse}\n` +
      `Ouverture : ${plan.conclusion.ouverture}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plan-dissertation-${plan.subject.slice(0, 20)}.txt`;
    a.click();
  };

  const selectSubject = (s: string) => {
    setPlan({ ...plan, subject: s });
    setShowSubjectBank(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Planificateur d'Essai</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Méthodologie & Structure</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <button 
                onClick={() => setActiveTab('edit')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'edit' ? "bg-white shadow-sm text-indigo-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Édition
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === 'preview' ? "bg-white shadow-sm text-indigo-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Aperçu
              </button>
            </div>
            <button 
              onClick={exportPlan}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Arguments Library */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Layout size={18} className="text-indigo-500" />
                Arguments
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    selectedCategory === cat 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingArgs ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                  <RotateCcw className="animate-spin" size={24} />
                  <span className="text-xs font-bold uppercase tracking-widest">Chargement...</span>
                </div>
              ) : filteredArguments.map(arg => (
                <div
                  key={arg.id}
                  draggable="true"
                  onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('text/plain', arg.text);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 cursor-grab active:cursor-grabbing group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all transform hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest">{arg.category}</span>
                  </div>
                  <p className="leading-relaxed">{arg.text}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 italic">
                Astuce : Copiez-collez les arguments dans votre plan pour gagner du temps.
              </p>
            </div>
          </div>
        </aside>

        {/* Center: Plan Editor */}
        <div className="lg:col-span-9 space-y-8">
          {/* Subject Input */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Type className="text-amber-600 w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Le Sujet</h2>
              </div>
              <button 
                onClick={() => setShowSubjectBank(true)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm bg-indigo-50 px-4 py-2 rounded-lg transition-all"
              >
                <Search size={16} />
                Banque de sujets
              </button>
            </div>
            <textarea
              value={plan.subject}
              onChange={(e) => setPlan({ ...plan, subject: e.target.value })}
              placeholder="Entrez votre sujet de dissertation ici..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg font-medium resize-none min-h-[100px]"
            />
          </section>

          {activeTab === 'edit' ? (
            <div className="space-y-8 pb-20">
              {/* Introduction */}
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                  <ChevronRight size={18} className="text-slate-400" />
                  <h3 className="font-bold text-slate-800">I. Introduction</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Accroche</label>
                    <input 
                      type="text" 
                      value={plan.introduction.accroche}
                      onChange={(e) => setPlan({...plan, introduction: {...plan.introduction, accroche: e.target.value}})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Citation, fait historique, actualité..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Problématique</label>
                    <textarea 
                      value={plan.introduction.problematique}
                      onChange={(e) => setPlan({...plan, introduction: {...plan.introduction, problematique: e.target.value}})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows={2}
                      placeholder="La question centrale à laquelle vous allez répondre..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Annonce du plan</label>
                    <input 
                      type="text" 
                      value={plan.introduction.annoncePlan}
                      onChange={(e) => setPlan({...plan, introduction: {...plan.introduction, annoncePlan: e.target.value}})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Dans une première partie, nous verrons... puis..."
                    />
                  </div>
                </div>
              </section>

              {/* Development */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Layout size={20} className="text-indigo-500" />
                    II. Développement
                  </h3>
                  <button 
                    onClick={addPart}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                  >
                    <Plus size={18} />
                    Ajouter une partie
                  </button>
                </div>

                {plan.development.map((part, pIdx) => (
                  <motion.div 
                    key={part.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                  >
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-bold text-indigo-600">{pIdx + 1}.</span>
                        <input 
                          type="text"
                          value={part.title}
                          onChange={(e) => {
                            const newDev = [...plan.development];
                            newDev[pIdx].title = e.target.value;
                            setPlan({ ...plan, development: newDev });
                          }}
                          className="bg-transparent font-bold text-slate-800 outline-none focus:border-b border-indigo-300 w-full"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setPlan({ ...plan, development: plan.development.filter(p => p.id !== part.id) });
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      {part.subParts.map((sub, sIdx) => (
                        <div key={sub.id} className="flex gap-4">
                          <div className="pt-3">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                              {pIdx + 1}.{sIdx + 1}
                            </div>
                          </div>
                          <div className="flex-1 relative group/sub">
                            <textarea 
                              value={sub.content}
                              onChange={(e) => updateSubPart(part.id, sub.id, e.target.value)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('ring-2', 'ring-indigo-400', 'bg-indigo-50/50');
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50/50');
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50/50');
                                const text = e.dataTransfer.getData('text/plain');
                                if (text) {
                                  const currentContent = sub.content;
                                  const newContent = currentContent 
                                    ? (currentContent.endsWith(' ') ? currentContent + text : currentContent + ' ' + text)
                                    : text;
                                  updateSubPart(part.id, sub.id, newContent);
                                }
                              }}
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
                              rows={2}
                              placeholder="Déposez un argument ici ou écrivez..."
                            />
                            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-indigo-300 rounded-xl opacity-0 group-drag-over:opacity-100 transition-opacity flex items-center justify-center bg-indigo-50/20">
                              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Relâcher pour insérer</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const newDev = [...plan.development];
                              newDev[pIdx].subParts = newDev[pIdx].subParts.filter(s => s.id !== sub.id);
                              setPlan({ ...plan, development: newDev });
                            }}
                            className="pt-3 text-slate-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addSubPart(part.id)}
                        className="ml-10 flex items-center gap-2 text-slate-400 hover:text-indigo-500 text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Plus size={14} />
                        Ajouter une sous-partie
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Conclusion */}
              <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                  <ChevronRight size={18} className="text-slate-400" />
                  <h3 className="font-bold text-slate-800">III. Conclusion</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Synthèse</label>
                    <textarea 
                      value={plan.conclusion.synthese}
                      onChange={(e) => setPlan({...plan, conclusion: {...plan.conclusion, synthese: e.target.value}})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows={2}
                      placeholder="Résumé des points clés du développement..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Réponse à la problématique</label>
                    <textarea 
                      value={plan.conclusion.reponse}
                      onChange={(e) => setPlan({...plan, conclusion: {...plan.conclusion, reponse: e.target.value}})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      rows={2}
                      placeholder="Votre conclusion finale et nuancée..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ouverture</label>
                    <input 
                      type="text" 
                      value={plan.conclusion.ouverture}
                      onChange={(e) => setPlan({...plan, conclusion: {...plan.conclusion, ouverture: e.target.value}})}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Élargissement du sujet, autre perspective..."
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* Preview Mode */
            <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm min-h-[80vh] font-serif prose prose-slate max-w-none">
              <div className="text-center mb-12 border-b border-slate-100 pb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{plan.subject || "Sans titre"}</h1>
                <p className="text-slate-500 italic">Plan de dissertation structuré</p>
              </div>

              <div className="space-y-12">
                <section>
                  <h2 className="text-xl font-bold text-indigo-600 border-b border-indigo-100 pb-2 mb-6 uppercase tracking-widest">I. Introduction</h2>
                  <div className="space-y-4 pl-6 border-l-2 border-slate-100">
                    <p><strong>Accroche :</strong> {plan.introduction.accroche || "..."}</p>
                    <p><strong>Problématique :</strong> {plan.introduction.problematique || "..."}</p>
                    <p><strong>Annonce du plan :</strong> {plan.introduction.annoncePlan || "..."}</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-indigo-600 border-b border-indigo-100 pb-2 mb-6 uppercase tracking-widest">II. Développement</h2>
                  <div className="space-y-8">
                    {plan.development.map((p, i) => (
                      <div key={p.id} className="pl-6 border-l-2 border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{i + 1}. {p.title}</h3>
                        <ul className="space-y-3 list-none p-0">
                          {p.subParts.map((s, j) => (
                            <li key={s.id} className="text-slate-700 leading-relaxed">
                              <span className="font-bold text-indigo-400 mr-2">{i + 1}.{j + 1}</span>
                              {s.content || "..."}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-indigo-600 border-b border-indigo-100 pb-2 mb-6 uppercase tracking-widest">III. Conclusion</h2>
                  <div className="space-y-4 pl-6 border-l-2 border-slate-100">
                    <p><strong>Synthèse :</strong> {plan.conclusion.synthese || "..."}</p>
                    <p><strong>Réponse :</strong> {plan.conclusion.reponse || "..."}</p>
                    <p><strong>Ouverture :</strong> {plan.conclusion.ouverture || "..."}</p>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Subject Bank Modal */}
      <AnimatePresence>
        {showSubjectBank && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectBank(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Search size={20} className="text-indigo-500" />
                  Banque de Sujets
                </h2>
                <button 
                  onClick={() => setShowSubjectBank(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <RotateCcw size={20} className="rotate-45" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                    placeholder="Rechercher un sujet..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredSubjects.length > 0 ? filteredSubjects.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSubject(s)}
                      className="w-full text-left p-4 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group flex items-center justify-between"
                    >
                      <span className="text-slate-700 font-medium leading-relaxed">{s}</span>
                      <CheckCircle2 size={18} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )) : (
                    <div className="text-center py-12 text-slate-400">
                      Aucun sujet trouvé pour cette recherche.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Status */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Système Prêt
            </span>
            <span>{plan.development.length} Parties</span>
            <span>{plan.development.reduce((acc, p) => acc + p.subParts.length, 0)} Sous-parties</span>
          </div>
          <div>
            © 2026 Planificateur d'Essai Français
          </div>
        </div>
      </footer>
    </div>
  );
}
