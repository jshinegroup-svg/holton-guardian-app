import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BattleProps } from './GuardianBattle';

/** Presentation only: debit and ownership remain in the existing persisted transaction. */
export default function GuardianFilm({ hero, guardian, cost, reduced, won, preview, saving, error, onWin, onClose, onCompanion }: BattleProps) {
  const [finished, setFinished] = useState(won || reduced);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (reduced || won) setFinished(true);
  }, [reduced, won]);
  useEffect(() => () => { video.current?.pause(); }, []);
  const button = (label: string, action: () => void) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={saving} onPress={action} style={[s.button, saving && { opacity: 0.5 }]}><Text style={s.buttonText}>{label}</Text></Pressable>;
  const skip = () => { video.current?.pause(); setFinished(true); };
  return <ScrollView contentContainerStyle={s.page} testID="guardian-battle">
    <Text style={s.title}>{won ? '新的守護夥伴！' : finished ? '試煉成功！' : '潮汐夥伴試煉'}</Text>
    <Text style={s.body}>{preview ? '動畫預覽 · 不扣點／不取得卡片' : won ? '牠願意陪你一起成長。' : `已使用 ${cost} 點 · 這場試煉一定能成功`}</Text>
    {!finished && !won ? <View testID="battle-arena" style={s.arena}>
      {React.createElement('video', {
        ref: video,
        src: `${process.env.EXPO_PUBLIC_BASE_URL || ''}/battles/tidefin-mini-v2.mp4`,
        autoPlay: true, muted: true, playsInline: true, controls: true, preload: 'auto',
        'aria-label': '17 秒 2D 機器人與 Mini 鯊魚戰鬥動畫',
        style: { display: 'block', width: '100%', aspectRatio: '4 / 5', background: '#071f35' },
        onEnded: () => setFinished(true), onError: () => setFailed(true),
      })}
      <Text style={s.note}>17 秒角色演出 · Super Hero 機器人 × Tidefin Mini</Text>
    </View> : <Image source={guardian.image} accessibilityLabel={guardian.name} style={s.card} resizeMode="contain" />}
    <Text accessibilityLabel={`出戰：${hero.name}`} style={s.note}>本次時間卡：{hero.name}。角色短片使用已完成的 Super Hero 機器人演出。</Text>
    {!finished && !won ? <Text style={s.note}>{failed ? '影片暫時無法載入，可直接查看結果；不影響已扣點數或取得夥伴。' : '預設靜音，可用影片控制列播放或開啟聲音。'}</Text> : <Text style={s.body}>「從今天起，我們一起面對挑戰。」</Text>}
    {error ? <Text accessibilityRole="alert" style={s.body}>{error}</Text> : null}
    {won ? <>{button('今天就陪我', onCompanion)}{button('回到守護獸收藏', onClose)}</> : finished ? preview ? button('結束預覽', onClose) : button('締結夥伴 · 收下守護獸', onWin) : <>{button('跳過動畫，看試煉結果', skip)}{preview ? button('關閉預覽', onClose) : null}</>}
    {!preview && !won ? <Text style={s.note}>只扣一次點數；重新開啟會重播動畫，不會再次扣點。</Text> : null}
  </ScrollView>;
}
const s = StyleSheet.create({
  page: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', padding: 16, gap: 12, justifyContent: 'center' },
  title: { color: '#ffe2a4', textAlign: 'center', fontSize: 28, fontWeight: '900' },
  body: { backgroundColor: '#102e45ee', color: '#fff0d3', padding: 12, borderRadius: 14, textAlign: 'center', fontSize: 17, lineHeight: 25 },
  arena: { borderWidth: 2, borderColor: '#ccae6b', borderRadius: 20, overflow: 'hidden', backgroundColor: '#071f35' },
  card: { width: '100%', height: 260 },
  note: { fontSize: 13, color: '#d0e3e9', textAlign: 'center', lineHeight: 20, backgroundColor: '#102e45ee', padding: 6, borderRadius: 8 },
  button: { minHeight: 52, borderRadius: 18, padding: 13, backgroundColor: '#087f91', borderWidth: 2, borderColor: '#e2c689', justifyContent: 'center' },
  buttonText: { color: '#fff4db', fontWeight: '800', fontSize: 17, textAlign: 'center' },
});
