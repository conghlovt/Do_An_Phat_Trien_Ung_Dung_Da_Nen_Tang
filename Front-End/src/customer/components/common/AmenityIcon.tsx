import React from 'react';
import { Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import loveChairIcon from '@/assets/images/ghe_tinh_yeu.webp';

const PRIMARY = '#85c2a4';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type AmenityIconNameMap = Record<string, MaterialCommunityIconName>;

export type AmenityIconProps = {
  color?: string;
  name: string;
  size?: number;
};

const AMENITY_ICON_NAMES: AmenityIconNameMap = {
  WiFi: 'wifi',
  'Wi-Fi miễn phí': 'wifi',
  'Lễ tân 24/24': 'bell-ring-outline',
  'Thang máy': 'elevator-passenger',
  'Dịch vụ dọn phòng': 'broom',
  'Tiện nghi là/ủi': 'iron',
  'Dịch vụ lưu trữ/bảo quản hành lý': 'bag-suitcase-outline',
  'Bồn tắm': 'bathtub-outline',
  TV: 'television',
  'Smart TV': 'television',
  'Điều hòa': 'air-conditioner',
  'Điều hoà': 'air-conditioner',
  'Khu vực có thể hút thuốc': 'smoking',
  'Đưa đón sân bay': 'airplane',
  'Bãi đỗ xe': 'parking',
  'Bãi đỗ xe ô tô': 'parking',
  'Cà phê': 'coffee-outline',
  'Quán cafe': 'coffee-outline',
  'Nhà hàng': 'silverware-fork-knife',
  'Đồ dùng làm bếp': 'pot-steam-outline',
  'Máy sấy tóc': 'hair-dryer-outline',
  'Két sắt': 'safe-square-outline',
  'Két an toàn': 'safe-square-outline',
  'Bể bơi': 'pool',
  'Tủ lạnh': 'fridge-outline',
};

function LoveChairIcon({ color = PRIMARY, size = 14 }: Omit<AmenityIconProps, 'name'>) {
  const imageSize = Math.round(size * 1.45);

  return (
    <Image
      source={loveChairIcon}
      style={{
        height: imageSize,
        resizeMode: 'contain',
        tintColor: color,
        width: imageSize,
      }}
    />
  );
}

export function AmenityIcon({ name, color = PRIMARY, size = 14 }: AmenityIconProps) {
  if (name.trim() === 'Ghế tình yêu') {
    return <LoveChairIcon color={color} size={size} />;
  }

  const iconName = AMENITY_ICON_NAMES[name.trim()] ?? 'shield-home';

  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
}

export default AmenityIcon;
