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
        { 
          id: 'sub-1-1', 
          title: 'Première sous-partie', 
          arguments: [{ id: 'arg-1-1-1', content: '', references: '' }] 
        }
      ]
    },
    {
      id: 'part-2',
      title: 'Antithèse (Deuxième partie)',
      subParts: [
        { 
          id: 'sub-2-1', 
          title: 'Première sous-partie', 
          arguments: [{ id: 'arg-2-1-1', content: '', references: '' }] 
        }
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
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'duel'>('edit');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [isLoadingArgs, setIsLoadingArgs] = useState(true);
  const [showSubjectBank, setShowSubjectBank] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');

  // Duel Mode State
  const [duelSubject, setDuelSubject] = useState('');
  const [duelTurn, setDuelTurn] = useState<1 | 2>(1);
  const [duelPlans, setDuelPlans] = useState<{1: EssayPlan, 2: EssayPlan}>({
    1: JSON.parse(JSON.stringify(INITIAL_PLAN)),
    2: JSON.parse(JSON.stringify(INITIAL_PLAN))
  });
  const [duelWinner, setDuelWinner] = useState<number | null>(null);

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
              const arg=line.split(":").length==2 ? line.split(":")[1].trim() :null
              const a:Argument={
                id: `${fileName}-${index}`,
                category: cat,
                text: line.split(":")[0].trim()
              }
              if(arg){
                a.argument=arg.replaceAll("—","\n").trim()
              }
              allArgs.push(a);
            });
          }
        }
        setArgumentsList(allArgs);

        // Fetch subjects
        const subResponse = await fetch('/planessai/data/sujets.txt');
        if (subResponse.ok) {
          const subText = await subResponse.text();
          const subjects = subText.split('\n').filter(line => line.trim() !== '');
          setSubjectsList(subjects);
          if (subjects.length > 0) setDuelSubject(subjects[Math.floor(Math.random() * subjects.length)]);
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
      development: [...prev.development, { 
        id: newId, 
        title: 'Nouvelle partie', 
        subParts: [{ 
          id: `${newId}-sub-1`, 
          title: 'Nouvelle sous-partie', 
          arguments: [{ id: `${newId}-sub-1-arg-1`, content: '', references: '' }] 
        }] 
      }]
    }));
  };

  const addSubPart = (partId: string) => {
    setPlan(prev => ({
      ...prev,
      development: prev.development.map(p => 
        p.id === partId 
          ? { 
              ...p, 
              subParts: [...p.subParts, { 
                id: `${p.id}-sub-${p.subParts.length + 1}`, 
                title: 'Nouvelle sous-partie', 
                arguments: [{ id: `${p.id}-sub-${p.subParts.length + 1}-arg-1`, content: '', references: '' }] 
              }] 
            }
          : p
      )
    }));
  };

  const addArgument = (partId: string, subPartId: string) => {
    setPlan(prev => ({
      ...prev,
      development: prev.development.map(p => 
        p.id === partId 
          ? { 
              ...p, 
              subParts: p.subParts.map(s => 
                s.id === subPartId 
                  ? { 
                      ...s, 
                      arguments: [...s.arguments, { id: `${s.id}-arg-${s.arguments.length + 1}`, content: '', references: '' }] 
                    }
                  : s
              )
            }
          : p
      )
    }));
  };

  const addArgumentAtStart = (partId: string, subPartId: string, content: string = '') => {
    setPlan(prev => ({
      ...prev,
      development: prev.development.map(p => 
        p.id === partId 
          ? { 
              ...p, 
              subParts: p.subParts.map(s => 
                s.id === subPartId 
                  ? { 
                      ...s, 
                      arguments: [{ id: `${s.id}-arg-${s.arguments.length + 1}`, content, references: '' }, ...s.arguments] 
                    }
                  : s
              )
            }
          : p
      )
    }));
  };

  const updateSubPartTitle = (partId: string, subId: string, title: string) => {
    setPlan(prev => ({
      ...prev,
      development: prev.development.map(p => 
        p.id === partId 
          ? { ...p, subParts: p.subParts.map(s => s.id === subId ? { ...s, title } : s) }
          : p
      )
    }));
  };

  const updateArgument = (partId: string, subPartId: string, argId: string, value: string, field: 'content' | 'references' = 'content') => {
    setPlan(prev => ({
      ...prev,
      development: prev.development.map(p => 
        p.id === partId 
          ? { 
              ...p, 
              subParts: p.subParts.map(s => 
                s.id === subPartId 
                  ? { 
                      ...s, 
                      arguments: s.arguments.map(a => a.id === argId ? { ...a, [field]: value } : a) 
                    }
                  : s
              )
            }
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
        p.subParts.map((s, j) => 
          `   ${String.fromCharCode(65 + j)}. ${s.title}\n` +
          s.arguments.map((a, k) => `      ${k + 1}. ${a.content}${a.references ? ` [Réf: ${a.references}]` : ''}`).join('\n')
        ).join('\n')
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

  const startNewDuel = () => {
    const randomSub = subjectsList[Math.floor(Math.random() * subjectsList.length)];
    setDuelSubject(randomSub);
    setDuelPlans({
      1: JSON.parse(JSON.stringify(INITIAL_PLAN)),
      2: JSON.parse(JSON.stringify(INITIAL_PLAN))
    });
    setDuelTurn(1);
    setDuelWinner(null);
  };

  const duelAction = (arg: Argument) => {
    if (duelWinner) return;

    const currentPlayerPlan = duelPlans[duelTurn];
    const nextPlayer = duelTurn === 1 ? 2 : 1;

    // Find first empty argument in development
    let updated = false;
    const newDev = currentPlayerPlan.development.map(part => {
      if (updated) return part;
      const newSubParts = part.subParts.map(sub => {
        if (updated) return sub;
        const newArgs = sub.arguments.map(a => {
          if (!updated && !a.content) {
            updated = true;
            return { ...a, content: arg.text };
          }
          return a;
        });
        return { ...sub, arguments: newArgs };
      });
      return { ...part, subParts: newSubParts };
    });

    if (updated) {
      setDuelPlans({
        ...duelPlans,
        [duelTurn]: { ...currentPlayerPlan, development: newDev }
      });
      setDuelTurn(nextPlayer);

      // Check if both plans are full
      const isFull = (p: EssayPlan) => p.development.every(part => part.subParts.every(sub => sub.arguments.every(a => a.content !== '')));
      if (isFull(duelPlans[1]) && isFull(duelPlans[2])) {
        setDuelWinner(0); // Draw or end of game
      }
    }
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
              <button 
                onClick={() => setActiveTab('duel')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                  activeTab === 'duel' ? "bg-white shadow-sm text-indigo-600" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <RotateCcw size={14} className={cn(activeTab === 'duel' && "animate-spin-slow")} />
                Mode Duel
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
                    e.dataTransfer.setData('application/json', JSON.stringify(arg));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => activeTab === 'duel' && duelAction(arg)}
                  className={cn(
                    "p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 cursor-grab active:cursor-grabbing group hover:border-indigo-200 hover:bg-indigo-50/30 transition-all transform hover:scale-[1.02]",
                    activeTab === 'duel' && "cursor-pointer"
                  )}
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
                {activeTab === 'duel' 
                  ? "Cliquez sur un argument pour l'ajouter à votre plan !" 
                  : "Astuce : Copiez-collez les arguments dans votre plan pour gagner du temps."}
              </p>
            </div>
          </div>
        </aside>

        {/* Center: Plan Editor / Duel Mode */}
        <div className="lg:col-span-9 space-y-8">
          {activeTab === 'duel' ? (
            <div className="space-y-8">
              {/* Duel Header */}
              <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Duel de Dissertation</h2>
                <p className="text-slate-500 mb-6 max-w-xl mx-auto">Chaque joueur doit compléter son plan en choisissant les meilleurs arguments à tour de rôle.</p>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                  <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-widest block mb-2">Sujet du Duel</span>
                  <p className="text-xl font-medium text-slate-800">{duelSubject}</p>
                </div>

                <div className="flex items-center justify-center gap-12">
                  <div className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    duelTurn === 1 ? "scale-110" : "opacity-40 grayscale"
                  )}>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-200">J1</div>
                    <span className="font-bold text-slate-700">Joueur 1</span>
                    {duelTurn === 1 && <motion.div layoutId="turn" className="h-1 w-8 bg-indigo-500 rounded-full mt-1" />}
                  </div>

                  <div className="text-slate-300 font-black text-4xl italic">VS</div>

                  <div className={cn(
                    "flex flex-col items-center gap-2 transition-all",
                    duelTurn === 2 ? "scale-110" : "opacity-40 grayscale"
                  )}>
                    <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-rose-200">J2</div>
                    <span className="font-bold text-slate-700">Joueur 2</span>
                    {duelTurn === 2 && <motion.div layoutId="turn" className="h-1 w-8 bg-rose-500 rounded-full mt-1" />}
                  </div>
                </div>

                <button 
                  onClick={startNewDuel}
                  className="mt-8 text-slate-400 hover:text-indigo-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={14} />
                  Nouveau Sujet
                </button>
              </section>

              {/* Duel Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map(playerNum => {
                  const pNum = playerNum as 1 | 2;
                  const pPlan = duelPlans[pNum];
                  return (
                    <div key={pNum} className={cn(
                      "bg-white rounded-2xl border-2 p-6 transition-all",
                      duelTurn === pNum ? (pNum === 1 ? "border-indigo-500 shadow-lg shadow-indigo-50" : "border-rose-500 shadow-lg shadow-rose-50") : "border-slate-100 opacity-80"
                    )}>
                      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-white text-xs", pNum === 1 ? "bg-indigo-600" : "bg-rose-500")}>
                          {pNum}
                        </div>
                        Plan du Joueur {pNum}
                      </h3>

                      <div className="space-y-6">
                        {pPlan.development.map((part, pIdx) => (
                          <div key={part.id} className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pIdx + 1}. {part.title}</h4>
                            {part.subParts.map((sub, sIdx) => (
                              <div key={sub.id} className="space-y-2">
                                <h5 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{String.fromCharCode(65 + sIdx)}. {sub.title}</h5>
                                {sub.arguments.map((arg, aIdx) => (
                                  <div 
                                    key={arg.id} 
                                    className={cn(
                                      "p-3 rounded-xl border text-sm min-h-[60px] flex items-center justify-center transition-all",
                                      arg.content 
                                        ? "bg-slate-50 border-slate-100 text-slate-700" 
                                        : (duelTurn === pNum ? "bg-indigo-50/30 border-dashed border-indigo-200 text-indigo-400 animate-pulse" : "bg-slate-50/50 border-dashed border-slate-200 text-slate-300")
                                    )}
                                  >
                                    <div className="flex flex-col items-center gap-1 text-center">
                                      <span>{arg.content || `Arg ${pIdx + 1}.${sIdx + 1}.${aIdx + 1}`}</span>
                                      {arg.references && (
                                        <span className="text-[10px] text-slate-400 italic">— {arg.references}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
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
                        <div className="p-6 space-y-8">
                          {part.subParts.map((sub, sIdx) => (
                            <div key={sub.id} className="space-y-4 pl-4 border-l-2 border-indigo-50">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="font-bold text-indigo-400">{String.fromCharCode(65 + sIdx)}.</span>
                                  <input 
                                    type="text"
                                    value={sub.title}
                                    onChange={(e) => updateSubPartTitle(part.id, sub.id, e.target.value)}
                                    className="bg-transparent font-semibold text-slate-700 outline-none focus:border-b border-indigo-200 w-full text-sm"
                                    placeholder="Titre de la sous-partie..."
                                  />
                                </div>
                                <button 
                                  onClick={() => {
                                    const newDev = [...plan.development];
                                    newDev[pIdx].subParts = newDev[pIdx].subParts.filter(s => s.id !== sub.id);
                                    setPlan({ ...plan, development: newDev });
                                  }}
                                  className="text-slate-300 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div 
                                className="space-y-4 ml-6"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const argData = e.dataTransfer.getData('application/json');
                                  if (argData) {
                                    const arg = JSON.parse(argData);
                                    updateSubPartTitle(part.id, sub.id, arg.text);
                                    if (sub.arguments.length === 1) {
                                      updateArgument(part.id, sub.id, arg.id,arg.argument || arg.text);
                                    }
                                  }
                                }}
                              >
                                {sub.arguments.length === 0 ? (
                                  <div className="min-h-[40px] flex items-center justify-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-lg">
                                    Déposez un argument ici pour commencer
                                  </div>
                                ) : (
                                  sub.arguments.map((arg, aIdx) => (
                                    <div key={arg.id} className="flex gap-4">
                                      <div className="pt-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                          {aIdx + 1}
                                        </div>
                                      </div>
                                      <div className="flex-1 relative group/sub space-y-2">
                                        <div className="relative">
                                          <textarea 
                                            value={arg.content}
                                            onChange={(e) => updateArgument(part.id, sub.id, arg.id, e.target.value, 'content')}
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
                                              const argData = e.dataTransfer.getData('application/json');
                                              let dropText = e.dataTransfer.getData('text/plain');
                                              if (argData) {
                                                const droppedArg = JSON.parse(argData);
                                                dropText = droppedArg.argument || droppedArg.text;
                                              }
                                              if (dropText) {
                                                const currentContent = arg.content;
                                                const newContent =  dropText;
                                                updateArgument(part.id, sub.id, arg.id, newContent, 'content');
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
                                        <input 
                                          type="text"
                                          value={arg.references || ''}
                                          onChange={(e) => updateArgument(part.id, sub.id, arg.id, e.target.value, 'references')}
                                          className="w-full p-2 bg-white border border-slate-100 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                                          placeholder="Références (auteur, œuvre, date...)"
                                        />
                                      </div>
                                      <button 
                                        onClick={() => {
                                          const newDev = [...plan.development];
                                          newDev[pIdx].subParts = newDev[pIdx].subParts.map(s => 
                                            s.id === sub.id ? { ...s, arguments: s.arguments.filter(a => a.id !== arg.id) } : s
                                          );
                                          setPlan({ ...plan, development: newDev });
                                        }}
                                        className="pt-3 text-slate-300 hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))
                                )}
                                <button 
                                  onClick={() => addArgument(part.id, sub.id)}
                                  className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 text-[10px] font-bold uppercase tracking-wider transition-colors"
                                >
                                  <Plus size={12} />
                                  Ajouter un argument/exemple
                                </button>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => addSubPart(part.id)}
                            className="ml-4 flex items-center gap-2 text-indigo-400 hover:text-indigo-600 text-xs font-bold uppercase tracking-wider transition-colors"
                          >
                            <Plus size={14} />
                            Ajouter une sous-partie (A, B, C...)
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
                      <div className="space-y-12">
                        {plan.development.map((p, i) => (
                          <div key={p.id} className="pl-6 border-l-2 border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">{i + 1}. {p.title}</h3>
                            <div className="space-y-8">
                              {p.subParts.map((s, j) => (
                                <div key={s.id} className="space-y-4">
                                  <h4 className="text-md font-bold text-slate-700">{String.fromCharCode(65 + j)}. {s.title}</h4>
                                  <ul className="space-y-4 list-none p-0 ml-4">
                                    {s.arguments.map((a, k) => (
                                      <li key={a.id} className="text-slate-700 leading-relaxed">
                                        <div className="flex gap-3">
                                          <span className="font-bold text-indigo-300 shrink-0">{k + 1}.</span>
                                          <div>
                                            {a.content || "..."}
                                            {a.references && (
                                              <span className="block mt-1 text-xs text-slate-400 font-medium italic">
                                                — {a.references}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
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
            </>
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
            <span>{plan.development.reduce((acc, p) => acc + p.subParts.reduce((a, s) => a + s.arguments.length, 0), 0)} Arguments</span>
          </div>
          <div>
            © 2026 Planificateur d'Essai Français
          </div>
        </div>
      </footer>
    </div>
  );
}
