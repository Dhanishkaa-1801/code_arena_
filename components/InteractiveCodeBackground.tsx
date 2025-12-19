'use client';
import React, { useEffect, useState } from 'react';

const SNIPPETS = [
  'if (solved) {', 'while (true) {', 'return 0;', 'std::cout <<', 'print("win")', 
  'def solve(n):', 'int main()', 'const result =', '=> { }', '</>', '{ }', '++','+', '&&','||','==','!=','<=','>=','for (int i = 0; i < n; i++) {','function() {','let x =','var y =','console.log()','System.out.println()'
];

export function InteractiveCodeBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Moves symbols slightly as you move mouse
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 25 Floating Symbols/Snippets */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute font-mono text-gray-500/30 font-bold select-none transition-transform duration-700 ease-out whitespace-nowrap"
          style={{
            left: `${(i * 137) % 100}%`,
            top: `${(i * 253) % 100}%`,
            fontSize: `${Math.max(14, (i % 6) * 10)}px`,
            transform: `translate(${mousePos.x * (i % 4 + 1)}px, ${mousePos.y * (i % 4 + 1)}px)`,
            filter: 'blur(0.5px)'
          }}
        >
          {SNIPPETS[i % SNIPPETS.length]}
        </div>
      ))}

      {/* Subtle Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '48px 48px' 
        }} 
      />
    </div>
  );
}