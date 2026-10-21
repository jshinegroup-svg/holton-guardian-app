export type StarterCompanionId='pip'|'hop'|'bomo';
export const isStarterCompanion=(id:unknown):id is StarterCompanionId=>id==='pip'||id==='hop'||id==='bomo';
/** A version marker separates old players from a new/reset run awaiting choice. */
export function migrateStarterCompanion<T extends {starterChoiceVersion?:number;starterCompanionId?:unknown}>(state:T,existingPlayer:boolean):T&{starterChoiceVersion:1}{
 if(state.starterChoiceVersion===1)return state as T&{starterChoiceVersion:1};
 return {...state,starterChoiceVersion:1,...(isStarterCompanion(state.starterCompanionId)?{}:existingPlayer?{starterCompanionId:'pip'}:{})};
}
