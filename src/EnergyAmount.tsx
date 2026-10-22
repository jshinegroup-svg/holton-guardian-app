import React from 'react';
import {Image, Platform, Text, type ImageStyle, type StyleProp, type TextStyle} from 'react-native';

/** Display only. Symbols distinguish a balance from incoming/outgoing energy. */
export default function EnergyAmount({value,kind='balance',size=24,style}:{value:number;kind?:'balance'|'gain'|'cost';size?:number;style?:StyleProp<TextStyle>}) {
 const symbol={balance:'×',gain:'+',cost:'−'}[kind];
 const label={balance:'能量球數量',gain:'獲得能量球',cost:'花費能量球'}[kind];
 return <Text testID={`energy-${kind}`} accessibilityLabel={`${label} ${value} 顆`} style={[{color:'#fff0c1',fontSize:18,fontWeight:'700'},style]}><Image source={require('../assets/ui/energy/blue-orb.png')} accessible={false} resizeMode="contain" style={[{width:size,height:size},Platform.OS==='web'?{display:'inline-block',verticalAlign:'middle'} as unknown as ImageStyle:null]}/>{' '}{symbol}{value}</Text>;
}
