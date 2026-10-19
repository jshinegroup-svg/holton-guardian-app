import React from 'react';
import { Image, Platform, StyleSheet, View, type ImageSourcePropType } from 'react-native';

/** Decorative illustration only: all cards, labels and controls remain real UI. */
export function CardPedestal({ source, label }: { source: ImageSourcePropType | undefined; label: string }) {
  return <View style={s.stage} testID="original-card-pedestal">
    <Image source={require('../assets/worlds/sky-base/card-pedestal.png')} accessible={false} style={[StyleSheet.absoluteFill, {width:'100%',height:'100%'}]} resizeMode="stretch" />
    <Image source={source} accessibilityLabel={label} style={s.card} resizeMode="contain" />
  </View>;
}
const s = StyleSheet.create({stage:{width:244,height:326,alignSelf:'center'},card:{position:'absolute',top:49,left:57,width:130,height:184}});

export function WorldChrome() {
  if (Platform.OS !== 'web') return null;
  return React.createElement('style', {}, `
[data-testid="immersive-world"] {background:#082f43}
[data-testid="world-title"] {position:relative;border:3px solid #c6a153!important;border-radius:8px 8px 20px 20px!important;box-shadow:inset 0 0 0 2px #254e5f,inset 0 0 0 4px #ddc58a,0 5px 9px #061b2677;background:linear-gradient(110deg,#092b41,#1b5266 48%,#092b41)!important;margin:22px 24px 18px;padding:16px 20px 10px!important}
[data-testid="world-title"]:before {content:'◆';position:absolute;left:calc(50% - 14px);top:-26px;color:#52e5ee;font-size:34px;text-shadow:0 2px #d4af5e,2px 0 #e6c67c,-2px 0 #e6c67c,0 0 12px #32dbea}
[data-testid="world-title"] [role="button"] {position:absolute;right:-24px;top:-20px;border:1px solid #c7af70;border-radius:7px;padding:0 9px;background:#0b354c}
[data-testid="world-title"] [role="button"]>div{font-size:12px;padding:9px 0}
[data-testid="world-title"]>div:first-child{align-items:center;width:100%}
[data-testid="mission-stage"]{gap:7px!important;padding:0 4px!important}
[data-testid="mission-stage"]>[data-testid="mission-name"]{align-self:center;max-width:100%;min-width:65%;border:2px solid #d5b976;border-radius:9px 9px 18px 18px;background:linear-gradient(#19536a,#092b42)!important;box-shadow:inset 0 0 0 2px #071d2f,0 3px 7px #09263399;font-size:20px!important;line-height:27px!important;padding:5px 14px!important}
[data-testid="immersive-world"] [data-testid="primary-action"]{background:linear-gradient(#6ce4e5 0%,#10a6b6 18%,#027489 65%,#034458 100%)!important;border:3px solid #e0bf77!important;box-shadow:inset 0 0 0 2px #06445b,inset 0 3px 2px #d2ffffb0,0 4px 0 #5c5b45,0 6px 10px #092a38aa;min-height:51px!important;padding:9px 15px!important;margin:2px 3px}
[data-testid="immersive-world"] [data-testid="secondary-action"]{background:linear-gradient(#1f536a,#082d45)!important;border:2px solid #bca775!important;box-shadow:inset 0 0 0 2px #112d3c,0 3px 5px #08243366;min-height:44px!important;padding:8px 12px!important;border-radius:12px!important}
[data-testid="immersive-world"] [data-testid="primary-action"]>div{text-shadow:0 2px 2px #094458;font-size:19px!important}
[data-testid="immersive-world"] [data-testid="secondary-action"]>div{font-size:15px!important}
[data-testid="crystal-clock"]{position:relative;background:radial-gradient(ellipse at 50% 12%,#25647c,#0a344c 58%,#041b30)!important;border:3px solid #d2b578!important;outline:2px solid #37bdd0;outline-offset:-7px;border-radius:50% / 38%!important;padding:24px 12px 18px!important;margin:8px 8px 3px;box-shadow:0 0 14px #28d9ea77,inset 0 0 20px #37bbd455;text-shadow:0 3px 4px #001729;font-size:51px!important}
[data-testid="crystal-clock"]:before{content:'◆';position:absolute;top:-22px;left:calc(50% - 12px);font-size:28px;color:#50e7ef;text-shadow:0 2px #d8b267}
[data-testid="scene-footer"]{flex-direction:row;gap:8px;margin-top:3px}
[data-testid="scene-footer"]>[role="button"]{flex:1;min-width:0}
[data-testid="original-card-pedestal"]{filter:drop-shadow(0 5px 5px #0a243d66)}
@media(min-width:650px){[data-testid="immersive-world"]{max-width:520px;align-self:center;width:100%;box-shadow:0 0 80px #061e31}}
@media(max-height:740px){[data-testid="world-title"]{margin-top:12px;margin-bottom:10px}[data-testid="original-card-pedestal"]{height:286px!important;width:214px!important}[data-testid="original-card-pedestal"]>div:last-child{top:43px!important;left:50px!important;width:114px!important;height:161px!important}}
`);
}
