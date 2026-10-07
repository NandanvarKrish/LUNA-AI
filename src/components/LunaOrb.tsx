import React, { useMemo } from 'react';
import { PersonaType } from '../types';
import { PERSONAS } from '../utils/constants';

interface LunaOrbProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  persona: PersonaType;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const LunaOrb: React.FC<LunaOrbProps> = ({
  status,
  persona,
  onClick,
  size = 'md',
}) => {
  const currentPersona = PERSONAS[persona] || PERSONAS.luna;
  const accentColor = currentPersona.accentColor;

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10';
      case 'lg':
        return 'w-36 h-36 md:w-44 md:h-44';
      case 'md':
      default:
        return 'w-24 h-24 md:w-28 md:h-28';
    }
  }, [size]);

  // Dynamic status glow styling
  const glowStyle = useMemo(() => {
    switch (status) {
      case 'listening':
        return {
          boxShadow: `0 0 50px 10px ${accentColor}88, inset 0 0 30px ${accentColor}`,
          borderColor: accentColor,
        };
      case 'thinking':
        return {
          boxShadow: `0 0 60px 15px #a855f7aa, inset 0 0 35px #c084fc`,
          borderColor: '#c084fc',
        };
      case 'speaking':
        return {
          boxShadow: `0 0 60px 15px ${accentColor}aa, 0 0 100px 30px ${accentColor}44, inset 0 0 30px #ffffff`,
          borderColor: '#ffffff',
        };
      case 'idle':
      default:
        return {
          boxShadow: `0 0 35px 2px ${accentColor}44, inset 0 0 20px ${accentColor}33`,
          borderColor: `${accentColor}66`,
        };
    }
  }, [status, accentColor]);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
    >
      {/* Outer Pulse Rings (visible during active states) */}
      {(status === 'speaking' || status === 'listening' || status === 'thinking') && (
        <>
          <div
            className="absolute rounded-full border border-sky-400/40 animate-ping opacity-60 pointer-events-none"
            style={{
              width: size === 'lg' ? '180px' : size === 'sm' ? '54px' : '130px',
              height: size === 'lg' ? '180px' : size === 'sm' ? '54px' : '130px',
              borderColor: accentColor,
            }}
          />
          <div
            className="absolute rounded-full border border-purple-400/30 animate-pulse-ring pointer-events-none"
            style={{
              width: size === 'lg' ? '220px' : size === 'sm' ? '64px' : '160px',
              height: size === 'lg' ? '220px' : size === 'sm' ? '64px' : '160px',
              borderColor: `${accentColor}55`,
            }}
          />
        </>
      )}

      {/* Main Lunar Core Sphere */}
      <div
        style={glowStyle}
        className={`relative ${sizeClasses} rounded-full transition-all duration-700 ease-out flex items-center justify-center border overflow-hidden backdrop-blur-md bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800`}
      >
        {/* Subtle Lunar Texture & Craters */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-2 left-3 w-5 h-5 rounded-full bg-white/10 blur-[1px]" />
          <div className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-white/5 blur-[2px]" />
          <div className="absolute top-1/2 left-1/3 w-3 h-3 rounded-full bg-cyan-300/10 blur-[0.5px]" />
        </div>

        {/* Ambient Shimmer / Swirl */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/60 transition-transform duration-1000 ${
            status === 'thinking' ? 'animate-spin' : 'group-hover:rotate-45'
          }`}
          style={{ animationDuration: status === 'thinking' ? '4s' : '20s' }}
        />

        {/* Status Center Icon or Aura */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {status === 'thinking' ? (
            <div className="flex space-x-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : status === 'listening' ? (
            <div className="flex items-center space-x-1">
              <span className="w-1 h-3 rounded-full bg-cyan-300 animate-pulse" />
              <span className="w-1 h-5 rounded-full bg-sky-200 animate-pulse" />
              <span className="w-1 h-3 rounded-full bg-cyan-300 animate-pulse" />
            </div>
          ) : status === 'speaking' ? (
            <div className="flex items-center space-x-1">
              <span className="w-1 h-3.5 rounded-full bg-white animate-pulse" />
              <span className="w-1 h-6 rounded-full bg-sky-200 animate-pulse" style={{ animationDelay: '100ms' }} />
              <span className="w-1 h-4 rounded-full bg-cyan-200 animate-pulse" style={{ animationDelay: '200ms' }} />
            </div>
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-full opacity-80 transition-all duration-300 group-hover:scale-125"
              style={{ backgroundColor: accentColor }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
