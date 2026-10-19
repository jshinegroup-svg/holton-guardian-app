import React from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

const blue = require('../assets/cards/energy-math/energy-5.jpg');
const gold = require('../assets/cards/energy-math/energy-20.jpg');
const cards: Record<number, ImageSourcePropType> = {
  1: require('../assets/cards/energy-math/energy-1.jpg'),
  4: require('../assets/cards/energy-math/energy-4.jpg'),
  2: require('../assets/cards/energy-math/energy-2.jpg'),
  3: require('../assets/cards/energy-math/energy-3.jpg'),
  5: blue, 20: gold,
  10: require('../assets/cards/energy-math/energy-10.jpg'),
  30: require('../assets/cards/energy-math/energy-30.jpg'),
  50: require('../assets/cards/energy-math/energy-50.jpg'),
  100: require('../assets/cards/energy-math/energy-100.jpg'),
  40: require('../assets/cards/energy-math/energy-40.png'),
  6: require('../assets/cards/energy-math/energy-6.png'),
  7: require('../assets/cards/energy-math/energy-7.png'),
  8: require('../assets/cards/energy-math/energy-8.png'),
  9: require('../assets/cards/energy-math/energy-9.png'),
};

// Presentation only: never round, credit, debit, or persist the actual wallet.
export function splitEnergy(total: number): [number, number] {
  const first = total >= 10 ? Math.floor(total / 10) * 10 : Math.floor(total / 2);
  return [first, Number((total - first).toFixed(8))];
}

function NumberCard({ value }: { value: number }) {
  return <View style={styles.cardColumn} accessibilityLabel={`能量數字卡 ${value}`}>
    {cards[value] ? <Image source={cards[value]} resizeMode="contain" style={styles.art} /> :
      <View style={styles.dynamicCard}>
        <Text style={styles.header}>ENERGY</Text>
        <View style={styles.orbWindow}>
          <Image source={value >= 10 ? gold : blue} style={styles.orbSource} />
        </View>
        <Text numberOfLines={1} style={[styles.value, { fontSize: Math.min(30, 100 / String(value).length) }]}>{value}</Text>
      </View>}
    <Text style={styles.cardLabel}>{value} 顆</Text>
  </View>;
}

export default function EnergyMath({ total }: { total: number }) {
  const [left, right] = splitEnergy(total);
  return <View style={styles.panel}>
    <Text style={styles.title}>一起算算看</Text>
    <View style={styles.row}><NumberCard value={left} /><Text style={styles.plus}>＋</Text><NumberCard value={right} /></View>
    <Text accessibilityLabel={`能量球算式 ${left} 加 ${right} 等於 ${total}`} style={styles.equation}>{left} ＋ {right} ＝ {total}</Text>
    <Text style={styles.caption}>兩張加起來，就是現在可用的能量球</Text>
  </View>;
}

const styles = StyleSheet.create({
  panel: { width: '100%', alignItems: 'center', gap: 10, backgroundColor: '#fffaf0', borderWidth: 1, borderColor: '#e7d39e', borderRadius: 18, paddingVertical: 14, paddingHorizontal: 8 },
  title: { color: '#174c69', fontSize: 17, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  cardColumn: { width: 92, alignItems: 'center', gap: 4 },
  art: { width: 92, height: 138, borderRadius: 8 },
  plus: { color: '#795616', fontSize: 24, fontWeight: '800' },
  dynamicCard: { width: 92, height: 138, borderWidth: 3, borderColor: '#144c6a', borderRadius: 8, overflow: 'hidden', backgroundColor: '#ffedc7', alignItems: 'center' },
  header: { width: '100%', backgroundColor: '#215e7c', color: '#ffedc7', fontSize: 16, fontWeight: '900', textAlign: 'center', paddingVertical: 6 },
  orbWindow: { width: 80, height: 66, overflow: 'hidden' },
  orbSource: { width: 100, height: 150, position: 'absolute', top: -41, left: -10 },
  value: { color: '#144c6a', fontWeight: '900', textAlign: 'center', width: '100%' },
  cardLabel: { color: '#174c69', fontWeight: '700', fontSize: 15 },
  equation: { fontSize: 21, fontWeight: '800', color: '#795616', textAlign: 'center', flexWrap: 'wrap' },
  caption: { color: '#746344', fontSize: 13, textAlign: 'center' },
});
