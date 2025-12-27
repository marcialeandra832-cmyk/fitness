
import React, { useState } from 'react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
}

const getYouTubeThumbnail = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }
  return null;
};

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onEdit }) => {
  const [imgError, setImgError] = useState(false);

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (exercise.videoUrl) {
      window.open(exercise.videoUrl, '_blank');
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(exercise);
    }
  };

  const autoThumb = getYouTubeThumbnail(exercise.videoUrl);
  const displayImage = !imgError && (exercise.imageUrl || autoThumb);

  return (
    <div className="glass-morphism rounded-3xl overflow-hidden hover:scale-[1.03] transition-all duration-500 relative group shadow-lg">
      <div className="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden">
        {displayImage ? (
          <img 
            src={displayImage} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" 
            alt={exercise.name} 
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-800">
            <i className="fas fa-dumbbell text-4xl"></i>
            <span className="text-[10px] font-black uppercase tracking-tighter">Ficha Técnica</span>
          </div>
        )}
        
        {/* Play Icon Overlay */}
        {exercise.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
               <i className="fas fa-play ml-1"></i>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          {onEdit && (
            <button 
              onClick={handleEditClick}
              className="bg-slate-900/80 backdrop-blur-md text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center hover:text-white hover:bg-indigo-600 transition-all"
            >
              <i className="fas fa-pen text-xs"></i>
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">
          {exercise.muscleGroup}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-black text-base mb-3 text-white line-clamp-1">{exercise.name}</h3>
        <div className="flex gap-2 text-[10px] font-black text-slate-400">
          <div className="flex-1 flex items-center justify-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
            <i className="fas fa-redo-alt text-indigo-500"></i>
            <span>{exercise.sets} SÉRIES</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
            <i className="fas fa-list-ol text-indigo-500"></i>
            <span className="truncate">{exercise.reps}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
