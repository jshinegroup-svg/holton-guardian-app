import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import GuardianFilm from './GuardianFilm';

type Fighter = { name: string; image: ImageSourcePropType | undefined };
export type BattleProps = { guardianId?: string; hero: Fighter; guardian: Fighter; cost: number; reduced: boolean; won: boolean; preview?: boolean; saving: boolean; error: string; onWin: () => void; onClose: () => void; onCompanion: () => void };
const lines = ['夥伴試煉 · 登場', '勇氣出擊！', '守護屏障！', '匯聚你的努力', '發動夥伴之光！', '試煉成功！'];

/** Original-card choreography: no random outcome and no independent wallet writes. */
function LegacyGuardianBattle({ hero, guardian, cost, reduced, won, preview = false, saving, error, onWin, onClose, onCompanion }: BattleProps) {
  const [step, setStep] = useState(won ? 5 : reduced ? 3 : 0);
  const heroX = useRef(new Animated.Value(0)).current;
  const guardianX = useRef(new Animated.Value(0)).current;
  const aura = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (won) { setStep(5); return; }
    if (reduced && step < 3) { setStep(3); return; }
    if (step >= 3) return;
    const timer = setTimeout(() => setStep(value => value + 1), [1600, 1700, 1700][step]);
    return () => clearTimeout(timer);
  }, [step, reduced, won]);
  useEffect(() => {
    heroX.setValue(0); guardianX.setValue(0); aura.setValue(0);
    if (reduced || won) return;
    const pulse = Animated.sequence([Animated.timing(aura, { toValue: 1, duration: 450, useNativeDriver: true }), Animated.timing(aura, { toValue: 0.15, duration: 800, useNativeDriver: true })]);
    const attack = (value: Animated.Value, distance: number) => Animated.sequence([Animated.timing(value, { toValue: distance, duration: 350, useNativeDriver: true }), Animated.timing(value, { toValue: 0, duration: 600, useNativeDriver: true })]);
    const motion = Animated.parallel([pulse, attack(heroX, step === 1 || step === 4 ? 28 : -8), attack(guardianX, step === 2 ? -28 : 8)]);
    motion.start();
    return () => motion.stop();
  }, [step, reduced, won, heroX, guardianX, aura]);
  useEffect(() => {
    if (step !== 4) return;
    const timer = setTimeout(() => setStep(5), reduced ? 0 : 1800);
    return () => clearTimeout(timer);
  }, [step, reduced]);
  const button = (label: string, action: () => void, quiet = false) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={saving} onPress={action} style={[s.button, quiet && s.quiet, saving && { opacity: 0.5 }]}><Text style={s.buttonText}>{label}</Text></Pressable>;
  return <ScrollView contentContainerStyle={s.page} testID="guardian-battle">
    <Text style={s.kicker}>{preview ? '動畫預覽 · 不扣點／不取得卡片' : '天空基地 · 夥伴挑戰'}</Text>
    <Text style={s.title}>{won ? '新的守護夥伴！' : lines[step]}</Text>
    <Text style={s.body}>{preview ? '看看你與守護獸相遇的時刻。' : won ? '牠認可了你的勇氣，願意陪你一起成長。' : `已使用 ${cost} 點 · 這場試煉一定能成功`}</Text>
    <View style={s.arena} testID="battle-arena">
      <View style={s.ring} />
      <Animated.View pointerEvents="none" style={[s.aura, { opacity: reduced || won ? 0.18 : aura, transform: [{ scale: reduced ? 1 : aura.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }) }] }]} />
      <View style={s.fighters}>
        <Animated.View style={[s.fighter, { transform: [{ translateX: heroX }] }]}><Text style={s.tag}>你的出戰角色</Text><Image source={hero.image} accessibilityLabel={`出戰：${hero.name}`} style={s.art} resizeMode="contain" /><Text style={s.name}>{hero.name}</Text></Animated.View>
        <Text style={s.symbol}>{won || step === 5 ? '✧' : step === 2 ? '◇' : '⚡'}</Text>
        <Animated.View style={[s.fighter, { transform: [{ translateX: guardianX }] }]}><Text style={s.tag}>{won ? '認可你的夥伴' : '守護獸'}</Text><Image source={guardian.image} accessibilityLabel={`挑戰：${guardian.name}`} style={s.art} resizeMode="contain" /><Text style={s.name}>{guardian.name}</Text></Animated.View>
      </View>
    </View>
    <View style={s.story} accessibilityLiveRegion="polite"><Text style={s.storyText}>{won ? '「從今天起，我們一起面對挑戰。」' : step === 0 ? '你累積的每一份努力，化成出戰的力量。' : step === 1 ? '機器人向前出擊，守護獸迎接你的勇氣。' : step === 2 ? '光之屏障接住攻勢，雙方重新站穩。' : step === 3 ? '準備好了嗎？讓牠看見你的決心。' : step === 4 ? '夥伴之光匯聚，試煉迎向最後一刻。' : '守護獸低下頭，接受你的夥伴邀請。'}</Text></View>
    {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    {won ? <>{button('今天就陪我', onCompanion)}{button('回到守護獸收藏', onClose, true)}</> : step === 5 ? preview ? button('結束預覽', onClose) : button('締結夥伴 · 收下守護獸', onWin) : <>{step === 3 ? button('發動夥伴之光', () => setStep(4)) : null}{button('跳過動畫，看試煉結果', () => setStep(5), true)}</>}
    {!won && !preview ? <Text style={s.note}>點數只扣這一次。重新開啟可繼續，不會再次扣點。</Text> : null}
    {preview && step !== 5 ? button('關閉預覽', onClose, true) : null}
  </ScrollView>;
}
const s = StyleSheet.create({
  page: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingTop: 34, gap: 16, justifyContent: 'center' },
  kicker: { color: '#bbeced', fontSize: 13, letterSpacing: 2, textAlign: 'center', backgroundColor: '#123c50', padding: 8, borderRadius: 12 },
  title: { fontSize: 29, fontWeight: '900', textAlign: 'center', color: '#ffe2a4', textShadowColor: '#041b2d', textShadowRadius: 5, textShadowOffset: { width: 0, height: 3 } },
  body: { color: '#e5f3ef', fontSize: 16, lineHeight: 25, textAlign: 'center', backgroundColor: '#102e45cc', padding: 9, borderRadius: 12 },
  arena: { minHeight: 286, justifyContent: 'center', borderRadius: 30, borderWidth: 2, borderColor: '#ccae6b', backgroundColor: '#071f35df', overflow: 'hidden' },
  ring: { position: 'absolute', left: '5%', right: '5%', bottom: 28, height: 58, borderRadius: 100, borderWidth: 3, borderColor: '#60c9d499', backgroundColor: '#2c6b7555' },
  aura: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: '#7bf3e8', alignSelf: 'center' },
  fighters: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, gap: 4 }, fighter: { flex: 1, minWidth: 0, alignItems: 'center', gap: 8 }, art: { width: '100%', height: 172 },
  tag: { color: '#b6e3e8', fontSize: 12, textAlign: 'center' }, name: { color: '#fff0cb', fontWeight: '800', fontSize: 15, textAlign: 'center' }, symbol: { color: '#ffe5a1', fontSize: 26, width: 30, textAlign: 'center' },
  story: { borderRadius: 18, borderWidth: 1, borderColor: '#c2ac74', backgroundColor: '#0a2b41ee', padding: 16, minHeight: 84, justifyContent: 'center' }, storyText: { color: '#fff0d3', fontSize: 18, lineHeight: 28, textAlign: 'center' },
  button: { minHeight: 52, borderRadius: 18, padding: 13, backgroundColor: '#087f91', borderWidth: 2, borderColor: '#e2c689', justifyContent: 'center' }, quiet: { backgroundColor: '#123b50' }, buttonText: { color: '#fff4db', fontWeight: '800', fontSize: 17, textAlign: 'center' }, note: { color: '#d0e3e9', fontSize: 13, lineHeight: 21, textAlign: 'center', backgroundColor: '#102e45cc', padding: 6, borderRadius: 9 }, error: { color: '#ffd2d2', backgroundColor: '#522b37', padding: 12, fontSize: 16 },
});

export default function GuardianBattle(props: BattleProps) {
  return props.guardianId === 'tidefin:0' && Platform.OS === 'web'
    ? <GuardianFilm {...props} /> : <LegacyGuardianBattle {...props} />;
}
