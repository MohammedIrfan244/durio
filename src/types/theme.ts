export type Theme = 'light' | 'dark' | 'pookie' | 'gothic' | 'natural';

export interface Particle {
  id: string;
  type: string;
  style: React.CSSProperties;
}
