import React from 'react';
import {
  Leaf,
  Flower2,
  Trees,
  Sun,
  Moon,
  Feather,
  Compass,
  Mountain,
  Flame,
  Shield,
  Sprout,
  Waves,
  Sparkles,
  Award,
  Crown,
  Heart,
} from 'lucide-react';

export interface AvatarOption {
  id: string;
  name: string;
  iconName: string;
  preview: string;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'botanical_leaf',
    name: 'Ginkgo & Sage Leaf',
    iconName: 'Leaf',
    preview: 'Leaf',
    description: 'Harmonious organic leaf motif',
  },
  {
    id: 'laurel_wreath',
    name: 'Laurel of Wisdom',
    iconName: 'Award',
    preview: 'Award',
    description: 'Classic Art Nouveau laurel crest',
  },
  {
    id: 'solstice_sun',
    name: 'Solstice Sunburst',
    iconName: 'Sun',
    preview: 'Sun',
    description: 'Golden radiance and vitality',
  },
  {
    id: 'crescent_luna',
    name: 'Crescent Moon',
    iconName: 'Moon',
    preview: 'Moon',
    description: 'Serene twilight crescent',
  },
  {
    id: 'quill_feather',
    name: 'Artisan Feather',
    iconName: 'Feather',
    preview: 'Feather',
    description: 'Graceful flowing quill plume',
  },
  {
    id: 'wild_blossom',
    name: 'Wildflower Bloom',
    iconName: 'Flower2',
    preview: 'Flower2',
    description: 'Delicate botanical petal crest',
  },
  {
    id: 'forest_pine',
    name: 'Evergreen Pine',
    iconName: 'Trees',
    preview: 'Trees',
    description: 'Resilient alpine grove',
  },
  {
    id: 'river_current',
    name: 'Flowing Waters',
    iconName: 'Waves',
    preview: 'Waves',
    description: 'Curvilinear stream waves',
  },
  {
    id: 'wayfarer_compass',
    name: 'Wayfarer Star',
    iconName: 'Compass',
    preview: 'Compass',
    description: 'Guiding stellar compass',
  },
  {
    id: 'high_sanctuary',
    name: 'Mountain Haven',
    iconName: 'Mountain',
    preview: 'Mountain',
    description: 'Steadfast peaks of security',
  },
  {
    id: 'hearth_flame',
    name: 'Warm Hearth',
    iconName: 'Flame',
    preview: 'Flame',
    description: 'Nourishing home ember',
  },
  {
    id: 'shield_guardian',
    name: 'Aegis Shield',
    iconName: 'Shield',
    preview: 'Shield',
    description: 'Protective financial aegis',
  },
];

interface AvatarProps {
  avatar?: string;
  emoji?: string; // Legacy fallback prop name
  name?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  avatar,
  emoji,
  name,
  color,
  size = 'md',
  className = '',
}) => {
  const identifier = (avatar || emoji || '').toLowerCase();
  const partnerColor = color || '#7E9F7A';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-xl',
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 17,
    lg: 20,
    xl: 26,
  };

  const iconSize = iconSizes[size];

  // Helper to render Art Nouveau styled Vector Emblem
  const renderIcon = () => {
    if (identifier.includes('leaf') || identifier.includes('sage') || identifier.includes('otter')) {
      return <Leaf size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('sun') || identifier.includes('solstice')) {
      return <Sun size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('moon') || identifier.includes('luna')) {
      return <Moon size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('feather') || identifier.includes('quill') || identifier.includes('cat')) {
      return <Feather size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('flower') || identifier.includes('bloom') || identifier.includes('blossom')) {
      return <Flower2 size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('tree') || identifier.includes('pine') || identifier.includes('forest')) {
      return <Trees size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('wave') || identifier.includes('river') || identifier.includes('water')) {
      return <Waves size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('compass') || identifier.includes('star')) {
      return <Compass size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('mountain') || identifier.includes('peak')) {
      return <Mountain size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('flame') || identifier.includes('hearth') || identifier.includes('fire')) {
      return <Flame size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('shield') || identifier.includes('guardian') || identifier.includes('aegis')) {
      return <Shield size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('laurel') || identifier.includes('award') || identifier.includes('crown')) {
      return <Award size={iconSize} className="stroke-[2.2]" />;
    }
    if (identifier.includes('sprout') || identifier.includes('seedling')) {
      return <Sprout size={iconSize} className="stroke-[2.2]" />;
    }

    // Monogram / Initial Fallback if name is provided or default leaf
    if (name && name.trim()) {
      return (
        <span className="font-serif font-bold text-center leading-none tracking-tight">
          {name.trim().charAt(0).toUpperCase()}
        </span>
      );
    }

    return <Leaf size={iconSize} className="stroke-[2.2]" />;
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl font-bold flex-shrink-0 select-none border transition-transform duration-150 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: '#1B241B',
        borderColor: partnerColor,
        color: partnerColor,
        boxShadow: `inset 0 1px 1px #344734, 0 1px 2px #0A0E0A`,
      }}
      title={name ? `${name}'s Insignia` : 'Partner Emblem'}
    >
      {renderIcon()}
    </div>
  );
};
