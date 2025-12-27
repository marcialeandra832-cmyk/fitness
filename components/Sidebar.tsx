
import React from 'react';
import { Coach } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'students' | 'exercises' | 'ai-generator' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'students' | 'exercises' | 'ai-generator' | 'settings') => void;
  coach: Coach;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, coach, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'students', label: 'Alunos', icon: 'fa-users' },
    { id: 'exercises', label: 'Exercícios', icon: 'fa-dumbbell' },
    { id: 'ai-generator', label: 'Gerador IA', icon: 'fa-wand-magic-sparkles' },
    { id: 'settings', label: 'Configurações', icon: 'fa-cog' },
  ];

  const handleTabClick = (id: any) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 p-6 flex flex-col z-50 
        transition-transform duration-300 ease-in-out w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <i className="fas fa-heart-pulse text-xl"></i>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white italic">Fit <span className="text-indigo-500">muscle</span></h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} text-lg w-6`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={coach.photoUrl || "https://picsum.photos/40/40"} 
              className="rounded-full w-10 h-10 object-cover ring-2 ring-indigo-500/30" 
              alt="Coach" 
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{coach.name}</p>
              <p className="text-[10px] text-indigo-400 truncate flex items-center gap-1">
                <i className="fab fa-instagram"></i>
                {coach.instagram || coach.specialty}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
