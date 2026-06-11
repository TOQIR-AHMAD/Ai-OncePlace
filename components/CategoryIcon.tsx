import {
  BarChart3,
  Bot,
  Briefcase,
  Code,
  GraduationCap,
  Image as ImageIcon,
  ListChecks,
  Megaphone,
  MessageSquare,
  Mic,
  Music,
  Palette,
  PenLine,
  Search,
  Sparkles,
  Video,
  type LucideIcon,
} from 'lucide-react';

// Maps the PascalCase `icon` field in categories.json to a lucide component.
const ICONS: Record<string, LucideIcon> = {
  MessageSquare,
  Image: ImageIcon,
  Video,
  Music,
  PenLine,
  Code,
  ListChecks,
  Bot,
  Palette,
  Megaphone,
  GraduationCap,
  BarChart3,
  Mic,
  Search,
  Briefcase,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
