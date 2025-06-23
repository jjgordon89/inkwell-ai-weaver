
import { ReactNode } from 'react';

export interface Template {
  id: string;
  title: string;
  type: 'outline' | 'character' | 'scene' | 'world';
  description: string;
  icon: ReactNode;
}
