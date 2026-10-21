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
@media(min-width:700px){
 [data-testid="adaptive-secondary-scroll"]>div{max-width:720px!important}
 [data-testid="main-scroll"]>div{max-width:720px!important;padding:24px!important;padding-bottom:48px!important}
 [data-testid="world-title"]{margin-left:32px!important;margin-right:32px!important}
 [data-testid="mission-stage"]{width:100%;max-width:580px;align-self:center}
 [data-testid="parent-content"]{min-width:0}
}
@media(min-width:1000px) and (orientation:landscape), (min-width:1200px){
 [data-testid="main-scroll"]>div{max-width:1120px!important;padding:30px!important}
 [data-testid="adventure-village"]{display:grid!important;grid-template-columns:minmax(0,.9fr) minmax(0,1fr);gap:36px!important;align-items:start}
 [data-testid="village-overview"]{gap:22px;padding-top:36px;position:sticky;top:20px}
 [data-testid="village-landscape"]{width:100%;max-width:440px;justify-self:center}
 [data-testid="village-child-title"]{font-size:34px!important}
 [data-testid="mission-layout"]{display:grid!important;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);align-items:start;gap:28px!important}
 [data-testid="mission-layout"]>[data-testid="guardian-companion"]{margin-top:32px}
 [data-testid="mission-layout"]>[data-testid="mission-stage"]:only-child{grid-column:1/-1;max-width:680px;justify-self:center}
 [data-testid="parent-layout"]{display:grid!important;grid-template-columns:210px minmax(0,1fr);gap:24px!important;align-items:start}
 [data-testid="parent-nav"]{flex-direction:column!important;position:sticky;top:16px;align-items:stretch}
 [data-testid="parent-nav"]>[role="button"]{align-self:stretch!important}
}
`);
}
