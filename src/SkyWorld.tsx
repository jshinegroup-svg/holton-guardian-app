import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

export function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (live) setReduced(value); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { live = false; sub.remove(); };
  }, []);
  return reduced;
}

export function SkyHero({ image, name }: { image: ImageSourcePropType; name: string }) {
  return <View style={s.hero} testID="sky-base-hero">
    <View style={s.landscape}><Image source={require('../assets/worlds/sky-base/island.png')} style={s.sceneImage} resizeMode="cover" accessible={false} />
      <View style={s.heroLabel}><Text style={s.eyebrow}>浮空島 · 第一站</Text><Text style={s.title}>天空基地</Text><Text style={s.heroLine}>帶著你的卡片，一起出發。</Text></View>
      <Image source={image} accessibilityLabel={`${name} 今日守護夥伴原卡`} style={s.guardian} resizeMode="contain" />
    </View>
    <View style={s.heroFooter}><Text style={s.eyebrow}>今日守護夥伴</Text><Text style={s.partnerName}>{name}</Text></View>
  </View>;
}

export function CardLift({ selected, reduced, children }: { selected: boolean; reduced: boolean; children: React.ReactNode }) {
  const y = useRef(new Animated.Value(selected ? -4 : 0)).current;
  useEffect(() => {
    y.stopAnimation();
    if (reduced) { y.setValue(0); return; }
    const motion = Animated.timing(y, { toValue: selected ? -4 : 0, duration: 170, useNativeDriver: true });
    motion.start(); return () => motion.stop();
  }, [selected, reduced, y]);
  return <Animated.View style={{ transform: [{ translateY: y }] }}>{children}</Animated.View>;
}

export function PortalCue({ reduced }: { reduced: boolean }) {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) { glow.setValue(0); return; }
    const motion = Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]);
    motion.start(); return () => motion.stop();
  }, [reduced, glow]);
  return <View style={s.portalRow} testID="sky-portal"><View style={s.portal}>
    <Animated.View pointerEvents="none" style={[s.portalGlow, { opacity: glow, transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }]} />
    <Text style={s.portalStar}>✧</Text>
  </View><View style={s.portalWords}><Text style={s.partnerName}>出發前，先準備</Text><Text style={s.heroLine}>傳送門已就緒，計時還沒開始。</Text></View></View>;
}

export function RewardArrival({ reward, balance, reduced, animate }: { reward: number; balance: number; reduced: boolean; animate: boolean }) {
  const travel = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(false);
  const motionRef = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    if (reduced || !animate) { travel.setValue(1); setPlaying(false); return; }
    travel.setValue(0); setPlaying(true);
    const motion = Animated.timing(travel, { toValue: 1, duration: 850, useNativeDriver: true });
    motionRef.current = motion;
    motion.start(({ finished }) => { if (finished) setPlaying(false); });
    return () => motion.stop();
  }, [reduced, animate, travel]);
  return <View style={s.arrival} testID="sky-reward-arrival">
    <Text style={s.eyebrow}>能量回到基地</Text>
    <View style={s.orbTrack}><Animated.View pointerEvents="none" style={[s.orb, { transform: [{ translateX: travel.interpolate({ inputRange: [0, 1], outputRange: [-75, 0] }) }, { scale: travel.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }]}><Text style={s.orbStar}>✦</Text></Animated.View></View>
    <Text style={s.reward}>＋{reward} ✦</Text><Text style={s.partnerName}>現在共有 {balance} 顆能量球</Text>
    {playing ? <Pressable accessibilityRole="button" accessibilityLabel="略過慶祝動畫" onPress={() => { motionRef.current?.stop(); travel.setValue(1); setPlaying(false); }} style={s.skip}><Text style={s.heroLine}>略過動畫</Text></Pressable> : null}
  </View>;
}
const s = StyleSheet.create({
  hero: { borderRadius: 24, borderWidth: 1, borderColor: '#cdb479', overflow: 'hidden', backgroundColor: '#fff9e9' },
  sceneImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  landscape: { height: 200, justifyContent: 'space-between', padding: 14, flexDirection: 'row', alignItems: 'flex-end' },
  heroLabel: { backgroundColor: 'rgba(255,250,234,0.96)', borderRadius: 14, padding: 12, maxWidth: '58%', gap: 3, borderWidth: 1, borderColor: '#dbc89a' },
  title: { color: '#153f52', fontWeight: '900', fontSize: 29 }, eyebrow: { color: '#76603b', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  heroLine: { color: '#365d68', fontSize: 14, lineHeight: 22 }, guardian: { width: '38%', height: 158 },
  heroFooter: { padding: 12, gap: 4 }, partnerName: { color: '#174654', fontWeight: '700', fontSize: 17, lineHeight: 25 },
  portalRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, backgroundColor: '#eaf4f3', borderRadius: 18 }, portalWords: { flex: 1 },
  portal: { width: 55, height: 72, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderWidth: 4, borderColor: '#bca571', backgroundColor: '#77cddc', alignItems: 'center', justifyContent: 'center' },
  portalGlow: { position: 'absolute', top: -4, bottom: -4, left: -4, right: -4, borderRadius: 24, backgroundColor: '#d3fffd' }, portalStar: { fontSize: 36, color: '#164c64' },
  arrival: { padding: 16, alignItems: 'center', backgroundColor: '#edf8f8', borderRadius: 20, gap: 6 }, orbTrack: { height: 60, width: '100%', alignItems: 'center', justifyContent: 'center' },
  orb: { width: 44, height: 44, backgroundColor: '#1789b2', borderColor: '#93e6ee', borderWidth: 3, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, orbStar: { fontSize: 27, color: '#fff6d9' }, reward: { fontSize: 42, color: '#80602d', fontWeight: '900' }, skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 },
});
