import type {LightState} from '../LightApp';
/** One completion, one credit. The caller persists this with its completion receipt. */
export function addDrawCredit(s:LightState,id:string):LightState {
 const progress=(s.rewardProgress??0)+1;
 return {...s,rewardProgress:progress%3,draws:[...(s.draws??[]),...(progress>=3?[{id:`draw:${id}`,reason:'又完成 3 次任務！'}]:[])]};
}
