import * as React from 'react';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface DailySpendLogoProps {
    width?: number;
    height?: number;
    style?: StyleProp<ViewStyle>;
}

const DailySpendLogo: React.FC<DailySpendLogoProps> = ({ width = 96, height = 96, style }) => (
    <Svg width={width} height={height} viewBox="0 0 96 96" fill="none" style={style}>
        {/* White Circle Outline */}
        <Circle cx="48" cy="48" r="44" stroke="#fff" strokeWidth="4" fill="none" />
        {/* Bar Chart - Three Bars */}
        <Rect x="34" y="56" width="6" height="16" rx="2" fill="#fff" />
        <Rect x="46" y="48" width="6" height="24" rx="2" fill="#fff" />
        <Rect x="58" y="40" width="6" height="32" rx="2" fill="#fff" />
        {/* Upward Arrow */}
        <Path d="M38 62 L 60 40" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <Path d="M56 40 H60 V44" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </Svg>
);

export default DailySpendLogo;