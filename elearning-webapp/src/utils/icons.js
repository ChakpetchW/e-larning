import { 
  Zap, Brain, Monitor, Briefcase, Palette, Heart, Star, Smile, 
  MessageSquare, FileText, Layers, Settings, Globe, Music, Code, 
  Database, Cpu, Cloud, Lock, BookOpen, GraduationCap, Target, 
  Users, Activity, Award, LayoutGrid, Hash
} from 'lucide-react';

export const ICON_LIST = {
  Zap, Brain, Monitor, Briefcase, Palette, Heart, Star, Smile, 
  MessageSquare, FileText, Layers, Settings, Globe, Music, Code, 
  Database, Cpu, Cloud, Lock, BookOpen, GraduationCap, Target, 
  Users, Activity, Award, LayoutGrid
};

export const getCategoryIcon = (iconName) => {
  return ICON_LIST[iconName] || Hash;
};
