import React from 'react';
import { 
  Wifi, Coffee, Car, Tv, Wind, Bath, Shield, 
  Briefcase, Snowflake, CheckSquare, 
  CigaretteOff, Wine, Utensils, Key, Dumbbell, Waves,
  Flame, Shirt, Droplet, Fan, Sparkles
} from 'lucide-react-native';

export function AmenityIcon({ name, size = 16, color = '#64748B' }: { name: string; size?: number; color?: string }) {
  const n = name.toLowerCase();
  
  if (n.includes('wifi') || n.includes('internet')) return <Wifi size={size} color={color} />;
  if (n.includes('đỗ xe') || n.includes('parking') || n.includes('xe')) return <Car size={size} color={color} />;
  if (n.includes('điều hòa') || n.includes('máy lạnh') || n.includes('lạnh')) return <Snowflake size={size} color={color} />;
  if (n.includes('tắm') || n.includes('vệ sinh') || n.includes('vòi sen') || n.includes('bồn')) return <Bath size={size} color={color} />;
  if (n.includes('tv') || n.includes('tivi') || n.includes('truyền hình')) return <Tv size={size} color={color} />;
  if (n.includes('an ninh') || n.includes('bảo vệ') || n.includes('camera') || n.includes('an toàn')) return <Shield size={size} color={color} />;
  if (n.includes('làm việc') || n.includes('bàn')) return <Briefcase size={size} color={color} />;
  if (n.includes('hút thuốc')) return <CigaretteOff size={size} color={color} />;
  if (n.includes('bể bơi') || n.includes('hồ bơi') || n.includes('nước')) return <Waves size={size} color={color} />;
  if (n.includes('gym') || n.includes('thể hình')) return <Dumbbell size={size} color={color} />;
  if (n.includes('bếp') || n.includes('nấu ăn') || n.includes('ăn')) return <Utensils size={size} color={color} />;
  if (n.includes('quầy bar') || n.includes('rượu')) return <Wine size={size} color={color} />;
  if (n.includes('khóa') || n.includes('chìa')) return <Key size={size} color={color} />;
  if (n.includes('giặt') || n.includes('ủi') || n.includes('áo choàng')) return <Shirt size={size} color={color} />;
  if (n.includes('nóng lạnh') || n.includes('sấy') || n.includes('cháy')) return <Flame size={size} color={color} />;
  if (n.includes('giải trí') || n.includes('karaoke')) return <Sparkles size={size} color={color} />;

  // fallback icon
  return <CheckSquare size={size} color={color} />;
}
