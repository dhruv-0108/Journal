import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles } from 'lucide-react';
import type { SadhanaLogs, SadhanaConfig } from '../types';
import { formatDateString, isDayCompleted, getColorHex } from '../sadhanaUtils';

interface CalendarProps {
  logs: SadhanaLogs;
  sadhanas: SadhanaConfig[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ logs, sadhanas, selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get total days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(clickedDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to determine if all sadhanas were completed on a day
  const isPerfectDay = (dateStr: string): boolean => {
    const log = logs[dateStr];
    if (!log || sadhanas.length === 0) return false;
    return sadhanas.every(s => log.completed[s.id] === true);
  };

  const renderCells = () => {
    const cells: React.ReactNode[] = [];
    const todayStr = formatDateString(new Date());

    // Padding for empty cells from previous month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(
        <div 
          key={`empty-${i}`} 
          className="aspect-square bg-white/[0.005] border border-white/[0.01] rounded-lg opacity-25"
        />
      );
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const cellDateStr = formatDateString(cellDate);
      const log = logs[cellDateStr];
      const isSelected = formatDateString(selectedDate) === cellDateStr;
      const isToday = todayStr === cellDateStr;
      
      const dayCompleted = isDayCompleted(log);
      const perfectDay = isPerfectDay(cellDateStr);

      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={`
            aspect-square relative p-1 sm:p-2 flex flex-col justify-between items-center rounded-lg border transition-all duration-200 group
            ${isSelected 
              ? 'border-sadhana-gold-accent bg-sadhana-cardHover text-white scale-[1.01] z-10' 
              : isToday
                ? 'border-white/10 bg-white/5 text-white'
                : 'border-white/[0.03] bg-sadhana-card hover:bg-sadhana-cardHover hover:border-white/10 text-slate-400 hover:text-white'
            }
            ${perfectDay && !isSelected ? 'border-sadhana-gold/25 bg-sadhana-gold/5' : ''}
          `}
        >
          {/* Day number & indicators */}
          <div className="w-full flex justify-between items-start">
            <span className={`
              text-[10px] sm:text-xs md:text-sm font-serif rounded-md w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center transition-colors
              ${isToday ? 'bg-sadhana-gold text-black font-bold' : ''}
              ${isSelected && !isToday ? 'text-sadhana-gold-accent font-bold' : ''}
            `}>
              {day}
            </span>
            
            {/* Perfect Day Star */}
            {perfectDay && (
              <span className="text-sadhana-gold-accent" title="Perfect Sadhana Day!">
                <Sparkles className="w-3 h-3 fill-sadhana-gold-accent/20" />
              </span>
            )}
          </div>

          {/* Clean Horizontal Line Indicators instead of SaaS-style dots */}
          <div className="w-full flex justify-center gap-0.5 mt-auto pt-2 pb-0.5">
            {dayCompleted ? (
              sadhanas.map(s => {
                const isSadhanaDone = log?.completed[s.id];
                const colorHex = getColorHex(s.colorPreset);
                if (!isSadhanaDone) return null;
                return (
                  <span
                    key={s.id}
                    className="h-1 flex-grow rounded-sm transition-transform group-hover:scale-y-125"
                    style={{
                      backgroundColor: colorHex
                    }}
                    title={s.name}
                  />
                );
              })
            ) : log?.notes ? (
              <span className="h-1 w-3 rounded-sm bg-slate-600" title="Reflection written" />
            ) : (
              <span className="h-1" /> // Spacer
            )}
          </div>
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="glass-panel rounded-lg p-3 sm:p-4 md:p-6 shadow-md relative overflow-hidden flex flex-col">
      
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sadhana-card border border-white/5 flex items-center justify-center text-sadhana-gold-accent">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-serif text-white font-semibold leading-tight tracking-wide">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">
              Select any day to view details or log sadhana
            </p>
          </div>
        </div>
 
        <div className="flex items-center gap-1.5">
          <button 
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-2.5 py-1 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
 
      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center border-b border-white/[0.03] pb-1">
        {daysOfWeek.map(day => (
          <div key={day} className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase py-1 font-sans">
            {day}
          </div>
        ))}
      </div>
 
      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {renderCells()}
      </div>
    </div>
  );
};
