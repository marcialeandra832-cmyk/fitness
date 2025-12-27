
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ExerciseCard from './components/ExerciseCard';
import { generateWorkoutPlan } from './services/geminiService';
import { Student, MuscleGroup, Exercise, WorkoutDay, Coach } from './types';

// Helper para pegar a capa do YouTube
const getYouTubeThumbnail = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }
  return null;
};

const DEFAULT_EXERCISES: Exercise[] = [
  { 
    id: '2', 
    name: 'Desenvolvimento de ombros', 
    muscleGroup: MuscleGroup.SHOULDERS, 
    sets: '3', 
    reps: '10 a 12', 
    videoUrl: 'https://www.youtube.com/watch?v=HzIiNhHhhtA',
    description: 'Empurre os halteres acima da cabeça até estender braços.' 
  },
  { 
    id: '3', 
    name: 'Agachamento Livre', 
    muscleGroup: MuscleGroup.LEGS, 
    sets: '3 a 4', 
    reps: '10 a 15', 
    videoUrl: 'https://www.youtube.com/watch?v=U3HlEF_E9fo',
    description: 'Pés na largura dos ombros, agache mantendo a coluna neutra.' 
  },
  { 
    id: '4', 
    name: 'Afundo com Halteres', 
    muscleGroup: MuscleGroup.LEGS, 
    sets: '3', 
    reps: '10 a 12 por perna', 
    videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    description: 'Passada à frente descendo o joelho de trás.' 
  },
  { 
    id: '5', 
    name: 'Flexão de braços', 
    muscleGroup: MuscleGroup.CHEST, 
    sets: '3', 
    reps: '8 a 15', 
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    description: 'Corpo em linha reta, desça até quase tocar o chão.' 
  },
  { 
    id: '6', 
    name: 'Prancha abdominal', 
    muscleGroup: MuscleGroup.CORE, 
    sets: '3', 
    reps: '20 a 60 seg', 
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    description: 'Mantenha o corpo reto e core firme.' 
  },
  { 
    id: '7', 
    name: 'Elevação de panturrilha', 
    muscleGroup: MuscleGroup.LEGS, 
    sets: '3', 
    reps: '15 a 20', 
    videoUrl: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
    description: 'Eleve os calcanhares ao máximo de forma controlada.' 
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'Carlos Oliveira',
    goal: 'Hipertrofia',
    level: 'Intermediário',
    weeklySchedule: [
      {
        dayName: 'Treino A - Inferiores e Ombro',
        muscleGroups: [MuscleGroup.LEGS, MuscleGroup.SHOULDERS],
        exercises: DEFAULT_EXERCISES
      }
    ]
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'exercises' | 'ai-generator' | 'settings'>('exercises');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseFormData, setExerciseFormData] = useState<Omit<Exercise, 'id'>>({
    name: '',
    muscleGroup: MuscleGroup.CHEST,
    sets: '3',
    reps: '12',
    description: '',
    videoUrl: '',
    imageUrl: ''
  });

  const [coach, setCoach] = useState<Coach>({
    name: 'Coach Silva',
    photoUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=150&q=80',
    specialty: 'Especialista em Hipertrofia',
    email: 'contato@coachsilva.fit',
    instagram: '@coachsilva_pro'
  });

  const [aiForm, setAiForm] = useState({
    name: '',
    goal: 'Hipertrofia',
    level: 'Intermediário',
    days: 3
  });

  const handleGenerateAIWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const plan = await generateWorkoutPlan({
        name: aiForm.name,
        goal: aiForm.goal,
        level: aiForm.level,
        daysPerWeek: aiForm.days
      });

      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        name: aiForm.name,
        goal: aiForm.goal,
        level: aiForm.level as any,
        weeklySchedule: plan
      };

      setStudents(prev => [...prev, newStudent]);
      setSelectedStudent(newStudent);
      setActiveTab('students');
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar treino. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExercise) {
      setExercises(prev => prev.map(ex => ex.id === editingExercise.id ? { ...exerciseFormData, id: ex.id } : ex));
    } else {
      setExercises(prev => [...prev, { ...exerciseFormData, id: Date.now().toString() }]);
    }
    setIsExerciseModalOpen(false);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setExerciseFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: exercise.sets,
      reps: exercise.reps,
      description: exercise.description || '',
      videoUrl: exercise.videoUrl || '',
      imageUrl: exercise.imageUrl || ''
    });
    setIsExerciseModalOpen(true);
  };

  const renderDashboard = () => (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Bem-vindo, {coach.name}</h2>
          <p className="text-slate-400">Aqui está o resumo da sua consultoria hoje.</p>
        </div>
        <button 
          onClick={() => setActiveTab('ai-generator')}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Novo Aluno
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-morphism p-6 rounded-3xl border-l-4 border-indigo-500">
          <h4 className="text-3xl font-bold text-white mb-1">{students.length}</h4>
          <p className="text-slate-400 text-sm font-medium">Alunos na Plataforma</p>
        </div>
        <div className="glass-morphism p-6 rounded-3xl border-l-4 border-emerald-500">
          <h4 className="text-3xl font-bold text-white mb-1">{exercises.length}</h4>
          <p className="text-slate-400 text-sm font-medium">Exercícios Cadastrados</p>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 text-white">
      <h2 className="text-2xl font-extrabold">Fichas de Treino</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Alunos */}
        <div className="lg:col-span-4 space-y-3">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedStudent?.id === student.id 
                ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                   <img src={`https://picsum.photos/seed/${student.id}/60/60`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold truncate">{student.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{student.goal} • {student.level}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detalhes do Treino */}
        <div className="lg:col-span-8">
          {selectedStudent ? (
            <div className="glass-morphism rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 md:p-8 bg-gradient-to-br from-slate-800/50 to-transparent border-b border-slate-800">
                <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                  <div className="relative">
                    <img src={`https://picsum.photos/seed/${selectedStudent.id}/120/120`} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/10 shadow-xl" alt="" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-slate-900"></div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black mb-1">{selectedStudent.name}</h3>
                    <p className="text-indigo-400 font-bold text-sm uppercase tracking-widest">{selectedStudent.goal}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {selectedStudent.weeklySchedule.map((day, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-800"></div>
                      <h4 className="text-lg font-black text-white italic px-4 uppercase tracking-tighter">{day.dayName}</h4>
                      <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {day.exercises.map((ex, i) => {
                        const thumb = getYouTubeThumbnail(ex.videoUrl) || ex.imageUrl;
                        return (
                          <div 
                            key={i} 
                            onClick={() => ex.videoUrl && window.open(ex.videoUrl, '_blank')}
                            className="bg-slate-900 rounded-2xl p-4 border border-slate-800 hover:border-indigo-500/40 transition-all group cursor-pointer flex flex-col gap-4"
                          >
                             {/* Capa do Exercício */}
                             <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-800 shadow-inner">
                                {thumb ? (
                                  <img src={thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={ex.name} />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                    <i className="fas fa-dumbbell text-3xl"></i>
                                    <span className="text-[10px] font-bold">SEM CAPA</span>
                                  </div>
                                )}
                                {ex.videoUrl && (
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-lg group-hover:scale-125 transition-transform">
                                      <i className="fas fa-play text-xs"></i>
                                    </div>
                                  </div>
                                )}
                                <div className="absolute top-2 left-2 bg-indigo-600 text-[9px] font-bold px-2 py-0.5 rounded text-white shadow">
                                  {ex.muscleGroup}
                                </div>
                             </div>

                             <div>
                                <h5 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{ex.name}</h5>
                                <div className="flex gap-3 mt-2 text-[11px] font-bold text-slate-400">
                                   <span className="bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/50"><i className="fas fa-redo mr-1 text-indigo-500"></i>{ex.sets} SÉRIES</span>
                                   <span className="bg-slate-800 px-2 py-1 rounded-lg border border-slate-700/50"><i className="fas fa-list-ol mr-1 text-indigo-500"></i>{ex.reps} REPS</span>
                                </div>
                                {ex.description && <p className="text-[11px] text-slate-500 mt-3 italic line-clamp-1">{ex.description}</p>}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10 text-slate-600">
              <i className="fas fa-id-card text-5xl mb-4 opacity-20"></i>
              <p className="font-medium">Selecione um aluno para carregar o plano de treino.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAIGenerator = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 text-white">
      <header className="text-center">
        <h2 className="text-4xl font-black mb-3">Consultoria Inteligente</h2>
        <p className="text-slate-400">Gere treinos personalizados com vídeos e capas automáticas via IA.</p>
      </header>
      <div className="glass-morphism p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <form onSubmit={handleGenerateAIWorkout} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Aluno</label>
            <input 
              required placeholder="Nome completo"
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-white focus:ring-2 focus:ring-indigo-500 transition-all"
              value={aiForm.name}
              onChange={e => setAiForm({...aiForm, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Objetivo</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={aiForm.goal}
              onChange={e => setAiForm({...aiForm, goal: e.target.value})}
            >
              <option>Hipertrofia</option>
              <option>Emagrecimento</option>
              <option>Definição</option>
              <option>Powerlifting</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <button 
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-white text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                loading ? 'bg-slate-800 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              {loading ? <i className="fas fa-circle-notch fa-spin text-2xl"></i> : <i className="fas fa-bolt"></i>}
              <span>{loading ? 'GERANDO TREINO...' : 'CRIAR FICHA COMPLETA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 text-white">
      <h2 className="text-2xl font-extrabold">Seu Perfil Profissional</h2>
      <div className="glass-morphism p-8 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="relative">
            <img src={coach.photoUrl} className="w-44 h-44 rounded-3xl object-cover ring-8 ring-slate-800" alt="" />
            <button className="absolute -bottom-2 -right-2 bg-indigo-600 p-3 rounded-xl shadow-lg hover:scale-110 transition-transform">
              <i className="fas fa-pen text-white"></i>
            </button>
          </div>
          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Nome</label>
                 <input className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-indigo-500" value={coach.name} onChange={e => setCoach({...coach, name: e.target.value})} />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Instagram</label>
                 <input className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white outline-none focus:ring-1 focus:ring-indigo-500" value={coach.instagram} onChange={e => setCoach({...coach, instagram: e.target.value})} />
               </div>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderExercises = () => (
    <div className="space-y-8 animate-in fade-in duration-500 text-white">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black">Sua Biblioteca</h2>
          <p className="text-slate-400">Gerencie seu catálogo de exercícios favoritos.</p>
        </div>
        <button 
          onClick={() => {
            setEditingExercise(null);
            setExerciseFormData({
              name: '',
              muscleGroup: MuscleGroup.CHEST,
              sets: '3',
              reps: '12',
              description: '',
              videoUrl: '',
              imageUrl: ''
            });
            setIsExerciseModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Novo Exercício
        </button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} onEdit={openEditModal} />)}
      </div>
    </div>
  );

  const renderExerciseModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="glass-morphism w-full max-w-lg p-8 rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-white">{editingExercise ? 'Editar' : 'Novo'} Exercício</h3>
          <button onClick={() => setIsExerciseModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSaveExercise} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Título</label>
            <input required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none text-white focus:ring-1 focus:ring-indigo-500" value={exerciseFormData.name} onChange={e => setExerciseFormData({...exerciseFormData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Séries</label>
               <input required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white" value={exerciseFormData.sets} onChange={e => setExerciseFormData({...exerciseFormData, sets: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Repetições</label>
               <input required className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white" value={exerciseFormData.reps} onChange={e => setExerciseFormData({...exerciseFormData, reps: e.target.value})} />
             </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 text-red-400">Link YouTube (Capa Automática)</label>
            <input className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white focus:ring-1 focus:ring-red-400" value={exerciseFormData.videoUrl} onChange={e => setExerciseFormData({...exerciseFormData, videoUrl: e.target.value})} placeholder="https://youtube.com/..." />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Descrição</label>
            <textarea className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-white h-24 resize-none" value={exerciseFormData.description} onChange={e => setExerciseFormData({...exerciseFormData, description: e.target.value})} />
          </div>
          <button type="submit" className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all mt-4">SALVAR</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} coach={coach} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Header Mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-600 w-8 h-8 rounded flex items-center justify-center text-xs"><i className="fas fa-dumbbell"></i></div>
           <h1 className="text-base font-black italic">Fit <span className="text-indigo-500">muscle</span></h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="bg-slate-800 p-2 rounded-lg text-white">
          <i className="fas fa-bars"></i>
        </button>
      </div>

      <main className="flex-1 lg:ml-64 p-6 md:p-10 min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'exercises' && renderExercises()}
        {activeTab === 'ai-generator' && renderAIGenerator()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {isExerciseModalOpen && renderExerciseModal()}
    </div>
  );
};

export default App;
