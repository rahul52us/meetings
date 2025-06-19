// assets/icons/DashboardIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const DashboardIcon = ({ size = 20, color = '#134e4a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" fill={color} />
  </Svg>
);

export default DashboardIcon;
