// assets/icons/LogoutIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

const LogoutIcon = ({ size = 20, color = '#134e4a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-10H5c-1.1 0-2 .9-2 2v6h2V5h14v14H5v-6H3v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
      fill={color}
    />
  </Svg>
);

export default LogoutIcon;
