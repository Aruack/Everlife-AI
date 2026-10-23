import React, { useState, useEffect, useRef } from 'react';
import {
  Dumbbell,
  Play,
  Pause,
  SkipForward,
  TrendingDown,
  TrendingUp,
  Clock,
  RotateCcw,
  Tv,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { WorkoutItem } from '../types';
import { api } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';

interface FormShiftPageProps {
  activeWorkout: WorkoutItem | null;
  onRefresh: () => void;
}

export const FormShiftPage: React.FC<FormShiftPageProps> = ({
  activeWorkout,
  onRefresh
}) => {
  const [workout, setWorkout] = useState<WorkoutItem | null>(activeWorkout);
  const [category, setCategory] = useState<'strength' | 'mobility' | 'hiit'>('strength');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fireTvInfo, setFireTvInfo] = useState<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    api.getFireTvStatus().then(setFireTvInfo).catch(() => {});
  }, []);

  useEffect(() => {
    setWorkout(activeWorkout);
    if (activeWorkout && activeWorkout.exercises[activeWorkout.current_exercise_index]) {
      setSecondsRemaining(activeWorkout.exercises[activeWorkout.current_exercise_index].duration_seconds);
    }
  }, [activeWorkout]);

  // Countdown timer for current exercise
  useEffect(() => {
    if (!workout || workout.session_state !== 'in_progress' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleAdvance();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workout?.id, workout?.current_exercise_index, workout?.session_state, isPaused]);

  // Keyboard navigation for Fire TV D-Pad Simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!workout || workout.session_state !== 'in_progress') return;

      if (e.key === ' ' || e.key === 'MediaPlayPause') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleAdvance();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleAdapt('easier', 'Remote D-Pad Down: Requested scaling');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleAdapt('harder', 'Remote D-Pad Up: Progression triggered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workout, isPaused]);

  const handleStart = async () => {
    try {
      const res = await api.startWorkout(category, difficulty);
      setWorkout(res);
      setSecondsRemaining(res.exercises[0]?.duration_seconds || 45);
      setIsPaused(false);
      onRefresh();
    } catch (err: any) {
      alert(`Start failed: ${err.message}`);
    }
  };

  const handleAdvance = async () => {
    if (!workout) return;
    try {
      const res = await api.advanceWorkout(workout.id);
      setWorkout(res);
      if (res.exercises[res.current_exercise_index]) {
        setSecondsRemaining(res.exercises[res.current_exercise_index].duration_seconds);
      }
      onRefresh();
    } catch (err: any) {
      alert(`Advance failed: ${err.message}`);
    }
  };

  const handleAdapt = async (action: string, feedback?: string) => {
    if (!workout) return;
    try {
      const res = await api.adaptWorkout(workout.id, action, feedback);
      setWorkout(res);
      if (res.exercises[res.current_exercise_index]) {
        setSecondsRemaining(res.exercises[res.current_exercise_index].duration_seconds);
      }
      onRefresh();
    } catch (err: any) {
      alert(`Adapt failed: ${err.message}`);
    }
  };

  const handleComplete = async () => {
    if (!workout) return;
    try {
      const res = await api.completeWorkout(workout.id);
      setWorkout(res);
      onRefresh();
    } catch (err: any) {
      alert(`Complete failed: ${err.message}`);
    }
  };

  const currentExercise = workout?.exercises[workout.current_exercise_index];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">FormShift</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
              Adaptive Fire TV Experience
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            10-foot Leanback workout engine built for Amazon Fire TV with real-time adaptation (easier, harder, shorter, skip) and remote-friendly D-Pad mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-300 font-medium">Platform:</span>
          <StatusBadge status="Ready (Leanback Compliant)" size="sm" />
        </div>
      </div>

      {/* Main Interface: Leanback 10-foot TV Simulation */}
      {workout && workout.session_state === 'in_progress' ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-6 bg-gradient-to-b from-navy-900 to-navy-950 glow-subtle">
          {/* Top Workout Status Bar */}
          <div className="flex items-center justify-between border-b border-navy-800 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400">{workout.title}</span>
              <h2 className="text-xl font-black text-white">
                Exercise {workout.current_exercise_index + 1} of {workout.exercises.length}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Timer</span>
                <span className="text-3xl font-black font-mono text-cyan-400">
                  00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Active Exercise Display */}
          {currentExercise && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase">
                  <Flame className="w-4 h-4" />
                  <span>{currentExercise.difficulty} Progression</span>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight">{currentExercise.name}</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {currentExercise.instructions}
                </p>

                {currentExercise.target_reps && (
                  <div className="text-xs text-purple-300 font-mono">
                    Target Reps: <span className="text-white font-bold">{currentExercise.target_reps} reps</span>
                  </div>
                )}
              </div>

              {/* Progress & Quick Remote Actions */}
              <div className="glass-card p-6 rounded-2xl space-y-4 border border-navy-700">
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                  <span>Adaptive Quick Actions</span>
                  <span className="text-[10px] font-mono text-cyan-400">Fire TV Remote Compatible</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleAdapt('easier', 'Scaled movement down')}
                    className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <TrendingDown className="w-4 h-4 text-emerald-400 group-hover:scale-110" />
                    <span>Easier (Down)</span>
                  </button>

                  <button
                    onClick={() => handleAdapt('harder', 'Scaled movement up')}
                    className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <TrendingUp className="w-4 h-4 text-rose-400 group-hover:scale-110" />
                    <span>Harder (Up)</span>
                  </button>

                  <button
                    onClick={() => handleAdapt('shorter', 'Session truncated for time')}
                    className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110" />
                    <span>Shorter Time</span>
                  </button>

                  <button
                    onClick={() => handleAdapt('skip', 'User skipped exercise')}
                    className="p-3 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    <SkipForward className="w-4 h-4 text-cyan-400 group-hover:scale-110" />
                    <span>Skip Exercise</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 border-t border-navy-800">
                  <button
                    onClick={() => setIsPaused((p) => !p)}
                    className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-white font-bold text-xs border border-navy-700 flex items-center gap-2"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'} (Space)</span>
                  </button>

                  <button
                    onClick={handleAdvance}
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <span>Next Exercise</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Adaptations Audit Bar */}
          {workout.adaptations_applied.length > 0 && (
            <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>
                <strong>Adaptations applied this session:</strong> {workout.adaptations_applied.map((a) => a.action).join(', ')}
              </span>
            </div>
          )}
        </div>
      ) : workout && workout.session_state === 'completed' ? (
        /* Completed Summary View */
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Workout Completed!</h2>
          <p className="text-xs text-slate-400">
            Adaptive Fire TV session finished. Your metrics have been saved to your Everlife activity log.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Exercises</span>
              <span className="text-lg font-bold text-white">{workout.exercises.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Estimated Burn</span>
              <span className="text-lg font-bold text-cyan-400">{workout.summary?.estimated_calories || 120} kcal</span>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-navy-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Adaptations</span>
              <span className="text-lg font-bold text-purple-400">{workout.adaptations_applied.length}</span>
            </div>
          </div>

          <button
            onClick={() => setWorkout(null)}
            className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-navy-950 font-bold text-xs"
          >
            Start Another Routine
          </button>
        </div>
      ) : (
        /* Routine Launcher View */
        <div className="glass-panel p-8 rounded-3xl border border-navy-700 space-y-6">
          <div className="max-w-xl space-y-2">
            <h2 className="text-lg font-black text-white">Select Your Adaptive Routine</h2>
            <p className="text-xs text-slate-400">
              FormShift dynamically recalibrates reps and movement variations during your session based on your real-time remote commands.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'strength', title: 'Strength & Core', desc: 'Squats, push-ups, hollow-body holds, and tempo variations.' },
              { id: 'mobility', title: 'Mobility & Recovery', desc: 'Cat-cow, thoracic spine rotations, deep squat holds.' },
              { id: 'hiit', title: 'HIIT & Conditioning', desc: 'High knees, skaters, mountain climbers, burpee progressions.' },
            ].map((cat) => (
              <div
                key={cat.id}
                onClick={() => setCategory(cat.id as any)}
                className={`glass-card p-5 rounded-2xl cursor-pointer transition-all space-y-2 ${
                  category === cat.id ? 'border-cyan-400 bg-navy-850' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{cat.title}</span>
                  {category === cat.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-navy-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold">Difficulty:</span>
              {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize font-semibold ${
                    difficulty === d ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-navy-950 font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Launch FormShift Session</span>
            </button>
          </div>
        </div>
      )}

      {/* D-Pad Remote Control Mapping Guide */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 text-xs text-slate-400 space-y-2 font-mono">
        <div className="font-bold text-slate-300 flex items-center gap-2">
          <Tv className="w-4 h-4 text-purple-400" />
          <span>Fire TV Remote & D-Pad Keyboard Controls</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
          <div><strong className="text-white">Arrow Down:</strong> Make Easier</div>
          <div><strong className="text-white">Arrow Up:</strong> Make Harder</div>
          <div><strong className="text-white">Enter / Right:</strong> Advance Next</div>
          <div><strong className="text-white">Spacebar:</strong> Play / Pause</div>
        </div>
      </div>
    </div>
  );
};
