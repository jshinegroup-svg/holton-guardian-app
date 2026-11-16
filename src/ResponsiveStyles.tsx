import React from 'react';
import {Platform} from 'react-native';
export default function ResponsiveStyles(){
 if(Platform.OS!=='web')return null;
 return React.createElement('style',null,`
html,body,#root{width:100%;min-height:100%;background:#082f43;margin:0}
#root{display:flex;flex-direction:column;flex:1}
#root>div{width:100%;flex:1;min-width:0}
[data-testid="immersive-world"]{width:100%!important;max-width:none!important;align-self:stretch!important}
[data-testid="main-scroll"]{width:100%;flex:1}
[data-testid="mission-layout"],[data-testid="parent-layout"],[data-testid="parent-content"],[data-testid="village-overview"],[data-testid="village-landscape"]{gap:10px;min-width:0}
[data-testid="village-map-live"],[data-testid="village-map-reduced"]{max-width:520px;align-self:center}
@media(max-height:550px){
 [data-testid="tutorial-task-categories"]{flex-wrap:nowrap!important;overflow-x:auto!important}
 [data-testid="tutorial-task-categories"]>[role="button"]{flex:0 0 110px!important;min-height:92px!important}
}
@media(min-width:620px){
 [data-testid="adaptive-secondary-scroll"]>div{max-width:720px!important}
 [data-testid="main-scroll"]>div{max-width:1120px!important;padding:12px!important;padding-bottom:48px!important}
 [data-testid="world-title"]{margin-left:32px!important;margin-right:32px!important}
 [data-testid="mission-stage"]{width:100%;max-width:580px;align-self:center}
 [data-testid="parent-content"]{min-width:0}
 [data-testid="adventure-village"]{display:grid!important;grid-template-columns:minmax(0,.9fr) minmax(0,1fr);gap:20px!important;align-items:start}
 [data-testid="village-overview"]{gap:22px;padding-top:36px;position:sticky;top:20px}
 [data-testid="village-landscape"]{width:100%;max-width:440px;justify-self:center}
 [data-testid="village-child-title"]{font-size:34px!important}
 [data-testid="mission-layout"]{display:grid!important;grid-template-columns:minmax(300px,1.1fr) minmax(0,.9fr);align-items:start;gap:16px!important}
 [data-testid="mission-layout"]>[data-testid="guardian-companion"]{margin-top:32px}
 [data-testid="mission-layout"]>[data-testid="mission-stage"]:only-child{grid-column:1/-1;max-width:680px;justify-self:center}
 [data-testid="parent-layout"]{display:grid!important;grid-template-columns:180px minmax(0,1fr);gap:16px!important;align-items:start}
 [data-testid="parent-nav"]{flex-direction:column!important;position:sticky;top:16px;align-items:stretch}
 [data-testid="parent-nav"]>[role="button"]{align-self:stretch!important}
}
/* Two phone-sized lanes on an unfolded screen; no device-name detection. */
[data-testid="family-player-layout"]>div{min-width:0}
[data-testid="duo-child-task"]{min-width:0}
@media(min-width:620px){
 [data-testid="mission-layout"]>[data-testid="guardian-companion"]{flex-direction:column!important;align-items:center!important;min-width:0}
 [data-testid="mission-layout"]>[data-testid="guardian-companion"]>[data-testid="companion-details"]{width:100%}
 /* Keep the same mounted task while its companion and controls reflow. */
 [data-testid="mission-stage"]:has(>[data-testid="focus-companion-panel"]){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px!important;max-width:880px!important;width:100%}
 [data-testid="mission-stage"]:has(>[data-testid="focus-companion-panel"])>*{grid-column:2;min-width:0}
 [data-testid="mission-stage"]:has(>[data-testid="focus-companion-panel"])>[data-testid="mission-name"]{grid-column:1/-1;grid-row:1}
 [data-testid="mission-stage"]>[data-testid="focus-companion-panel"]{grid-column:1!important;grid-row:2/span 16;flex-direction:column!important;align-items:center!important;width:100%;align-self:start}
 [data-testid="focus-companion-panel"]>[data-testid="companion-details"]{width:100%;flex:none!important}
 [data-testid="focus-companion-panel"]>[data-testid="companion-reaction"]{align-self:center!important}
}
@media(min-width:620px) and (max-width:799px){
 [data-testid="village-child-title"]{font-size:26px!important}
 [data-testid="mission-layout"]>[data-testid="guardian-companion"]{padding:8px!important}
}
`);
}
