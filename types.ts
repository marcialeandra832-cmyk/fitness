
export enum MuscleGroup {
  CHEST = 'Peito',
  BACK = 'Costas',
  LEGS = 'Pernas',
  SHOULDERS = 'Ombros',
  BICEPS = 'Bíceps',
  TRICEPS = 'Tríceps',
  CORE = 'Core/Abdominais'
}

export interface Coach {
  name: string;
  photoUrl: string;
  specialty: string;
  email?: string;
  instagram?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: string | number;
  reps: string;
  videoUrl?: string;
  imageUrl?: string;
  description?: string;
}

export interface WorkoutDay {
  dayName: string; // e.g., 'Segunda-feira'
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
}

export interface Student {
  id: string;
  name: string;
  goal: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  weeklySchedule: WorkoutDay[];
}

export interface AIWorkoutParams {
  name: string;
  goal: string;
  level: string;
  daysPerWeek: number;
}
