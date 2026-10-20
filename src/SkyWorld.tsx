import {chapterScene} from './ChapterScenery';
import {chapterSceneIndex} from './lib/journeys';
import type {WorldId} from './lib/journeys';
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

export function WorldBackdrop({ scene,world='sky',completed=0 }: { scene: 'home' | 'focus' | 'rest';world?:WorldId;completed?:number }) {
  const source = chapterScene(world,completed);
  return <View pointerEvents="none" style={StyleSheet.absoluteFill} testID={`world-scene-${scene}`} accessibilityLabel={`${world} ${scene} 第${chapterSceneIndex(completed)+1}章場景`}><Image source={source} resizeMode="cover" accessible={false} style={{ width: '100%', height: '100%' }} /><View style={[StyleSheet.absoluteFill, { backgroundColor: scene === 'focus' ? 'rgba(9,19,45,0.38)' : scene==='rest'?'rgba(4,28,40,0.22)':'rgba(4,28,40,0.12)' }]} /></View>;
}
export function SkyHero({ image, name }: { image: ImageSourcePropType; name: string }) {
  return <View style={s.hero} testID="sky-base-hero"><View style={s.heroLabel}><Text style={s.eyebrow}>HOLTON HERO</Text><Text style={s.title}>天空基地</Text><Text style={s.heroLine}>帶著你的卡片，一起出發。</Text><Text style={s.partnerName}>{name}</Text></View><Image source={image} accessibilityLabel={`${name} 今日守護夥伴原卡`} style={s.guardian} resizeMode="contain" /></View>;
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

const portalArt={uri:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="144" viewBox="0 0 120 144"><defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0b8"/><stop offset=".25" stop-color="#bb8841"/><stop offset=".48" stop-color="#ffe8a2"/><stop offset=".72" stop-color="#8c622b"/><stop offset="1" stop-color="#f4d992"/></linearGradient><radialGradient id="void"><stop stop-color="#e0ffff"/><stop offset=".24" stop-color="#62e5ec"/><stop offset=".55" stop-color="#167a9e"/><stop offset="1" stop-color="#061b43"/></radialGradient><radialGradient id="halo"><stop stop-color="#76eeff" stop-opacity=".35"/><stop offset="1" stop-color="#76eeff" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="75" rx="59" ry="66" fill="url(#halo)"/><ellipse cx="60" cy="133" rx="47" ry="7" fill="#020c20" opacity=".5"/><path d="M20 123V54a40 40 0 0180 0v69Z" fill="#102b42" stroke="url(#gold)" stroke-width="7"/><path d="M27 120V55a33 33 0 0166 0v65Z" fill="url(#void)" stroke="#c8a75f" stroke-width="2"/><path d="M31 115V56a29 29 0 0158 0v59" fill="none" stroke="#b3f8ff" stroke-width="1" opacity=".8"/><ellipse cx="60" cy="77" rx="19" ry="31" fill="none" stroke="#b4fbff" stroke-width="1.3" opacity=".65" transform="rotate(22 60 77)"/><ellipse cx="60" cy="77" rx="12" ry="27" fill="none" stroke="#e8ffff" opacity=".65" transform="rotate(42 60 77)"/><path d="M50 99Q80 83 63 57Q43 40 42 74" fill="none" stroke="#7befff" stroke-width="2" opacity=".6"/><path d="M17 120h86v7H17zM11 128h98v5H11z" fill="url(#gold)"/><path d="M20 123h80M16 130h88" stroke="#fff1c5" opacity=".6"/><path d="M60 4l8 10-8 10-8-10Z" fill="#6ae8ee" stroke="url(#gold)" stroke-width="2"/><path d="M15 58l5-8 5 8-5 8ZM95 58l5-8 5 8-5 8Z" fill="#d8b76b"/><g fill="#eaffff"><circle cx="45" cy="48" r="1.3"/><circle cx="76" cy="61" r="1"/><circle cx="40" cy="96" r="1.4"/><circle cx="78" cy="106" r="1"/><circle cx="68" cy="39" r="1"/><path d="M61 66l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></g></svg>`)};

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
    <Image source={portalArt} accessibilityLabel="金框星光傳送門" resizeMode="contain" style={{width:72,height:87}}/>
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
    <View style={s.rewardRow}><View style={s.orbTrack}><Animated.View pointerEvents="none" style={[s.orb, { transform: [{ translateX: travel.interpolate({ inputRange: [0, 1], outputRange: [-75, 0] }) }, { scale: travel.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }]}><Image source={require('../assets/ui/energy/blue-orb.png')} accessibilityLabel="藍色能量球" resizeMode="contain" style={{width:78,height:78}}/></Animated.View></View>
    <Text style={s.reward}>＋{reward}</Text></View><Text style={s.balance}>現在共有 {balance} 顆能量球</Text>
    {playing ? <Pressable accessibilityRole="button" accessibilityLabel="略過慶祝動畫" onPress={() => { motionRef.current?.stop(); travel.setValue(1); setPlaying(false); }} style={s.skip}><Text style={s.heroLine}>略過動畫</Text></Pressable> : null}
  </View>;
}
const s = StyleSheet.create({
  hero: { minHeight: 180, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 12 },
  sceneImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  landscape: { height: 200, justifyContent: 'space-between', padding: 14, flexDirection: 'row', alignItems: 'flex-end' },
  heroLabel: { backgroundColor: 'rgba(8,34,54,0.88)', borderRadius: 14, padding: 12, maxWidth: '58%', gap: 3, borderWidth: 1, borderColor: '#dbc89a' },
  title: { color: '#fff0cb', fontWeight: '900', fontSize: 29 }, eyebrow: { color: '#efd7a4', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  heroLine: { color: '#d0e4eb', fontSize: 14, lineHeight: 22 }, guardian: { width: '38%', height: 158 },
  heroFooter: { padding: 12, gap: 4 }, partnerName: { color: '#f8efda', fontWeight: '700', fontSize: 17, lineHeight: 25 },
  portalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: 'rgba(9,35,52,.9)', borderRadius: 20, borderWidth:1, borderColor:'#8b8262' }, portalWords: { flex: 1 },
  portal: { width:72,height:87,alignItems:'center',justifyContent:'center' },
  portalGlow: { position: 'absolute', top: -4, bottom: -4, left: -4, right: -4, borderRadius: 24, backgroundColor: '#d3fffd' }, portalStar: { fontSize: 36, color: '#164c64' },
  arrival: { alignSelf: 'center', width: '100%', maxWidth: 220, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', backgroundColor: 'rgba(8,35,49,0.64)', borderWidth: 1, borderColor: 'rgba(235,211,150,0.55)', borderRadius: 18, gap: 4 }, rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }, balance: { color: '#fff5dc', fontSize: 16, lineHeight: 24, fontWeight: '700', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.75)', textShadowRadius: 3, textShadowOffset: {width:0,height:1} }, orbTrack: { height: 72, width: 78, alignItems: 'center', justifyContent: 'center' },
  orb: { width: 78, height: 78, alignItems: 'center', justifyContent: 'center' }, reward: { fontSize: 42, color: '#ffdf92', fontWeight: '900' }, skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14 },
});
