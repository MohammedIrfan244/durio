'use client';

import { Particle, Theme } from '@/types/theme';
import { useEffect, useState } from 'react';


function detectTheme(): Theme {
  if (typeof document === 'undefined') return 'light';

  const html = document.documentElement;
  const body = document.body;
  
  if (body.classList.contains('pookie') || html.classList.contains('pookie')) return 'pookie';
  if (body.classList.contains('gothic') || html.classList.contains('gothic')) return 'gothic';
  if (body.classList.contains('natural') || html.classList.contains('natural')) return 'natural';
  if (body.classList.contains('dark') || html.classList.contains('dark')) return 'dark';
  return 'light';
}

export default function ThemeAnimations() {
  const [theme, setTheme] = useState<Theme>(() => detectTheme());
  const [particles, setParticles] = useState<Particle[]>([]);

  // Detect theme
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(detectTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Animation spawning logic
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    const addParticle = (type: string, style: React.CSSProperties, duration: number) => {
      const id = `${type}-${Date.now()}-${Math.random()}`;
      setParticles(prev => [...prev, { id, type, style }]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== id));
      }, duration);
    };

    const spawnPookie = () => {
      const count = Math.floor(Math.random() * 2) + 3;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          addParticle('pookie', {
            left: `${Math.random() * 100}%`,
            bottom: '0',
          }, 8000);
        }, i * 800);
      }
    };

    const spawnNaturalVine = () => {
      const isLeft = Math.random() > 0.5;
      addParticle('natural-vine', {
        left: isLeft ? '0' : 'auto',
        right: isLeft ? 'auto' : '0',
        top: `${Math.random() * 60 + 10}%`,
      }, 12000);
    };

    const spawnNaturalFlower = () => {
      const isLeft = Math.random() > 0.5;
      addParticle('natural-flower', {
        left: isLeft ? `${Math.random() * 15}%` : 'auto',
        right: isLeft ? 'auto' : `${Math.random() * 15}%`,
        top: `${Math.random() * 70 + 15}%`,
      }, 10000);
    };

    const spawnDarkStar = () => {
      const count = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          addParticle('dark-star', {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
          }, 6000);
        }, i * 1000);
      }
    };

    const spawnDarkMoon = () => {
      addParticle('dark-moon', {
        top: '10%',
        right: '5%',
      }, 15000);
    };

    const spawnGothicBat = () => {
      addParticle('gothic-bat', {
        left: '-50px',
        top: `${Math.random() * 50 + 10}%`,
      }, 10000);
    };

    const spawnGothicMist = () => {
      addParticle('gothic-mist', {
        left: `${Math.random() * 80 + 10}%`,
        bottom: '-30px',
      }, 20000);
    };

    const spawnLightSparkle = () => {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          addParticle('light-sparkle', {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }, 5000);
        }, i * 1500);
      }
    };

    // Start animations based on theme
    switch (theme) {
      case 'pookie':
        spawnPookie();
        intervals.push(setInterval(spawnPookie, 10000));
        break;
      
      case 'natural':
        setTimeout(spawnNaturalVine, 1000);
        setTimeout(spawnNaturalFlower, 3000);
        intervals.push(setInterval(spawnNaturalVine, 15000));
        intervals.push(setInterval(spawnNaturalFlower, 12000));
        break;
      
      case 'dark':
        spawnDarkStar();
        setTimeout(spawnDarkMoon, 2000);
        intervals.push(setInterval(spawnDarkStar, 8000));
        intervals.push(setInterval(spawnDarkMoon, 30000));
        break;
      
      case 'gothic':
        setTimeout(spawnGothicBat, 2000);
        setTimeout(spawnGothicMist, 5000);
        intervals.push(setInterval(spawnGothicBat, 15000));
        intervals.push(setInterval(spawnGothicMist, 25000));
        break;
      
      case 'light':
        spawnLightSparkle();
        intervals.push(setInterval(spawnLightSparkle, 15000));
        break;
    }

    return () => {
      intervals.forEach(clearInterval);
      setParticles([]);
    };
  }, [theme]);

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`theme-${particle.type}`}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 9999,
            ...particle.style,
          }}
        />
      ))}
    </>
  );
}
