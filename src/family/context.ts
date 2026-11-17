import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type ScopedStorage=Pick<typeof AsyncStorage,'getItem'|'setItem'|'removeItem'> & {savedState?:()=>Promise<string|null>;refresh?:()=>Promise<string|null>;useCloud?:()=>Promise<void>;sync?:()=>Promise<void>;prepareOffline?:()=>Promise<void>};
export const FamilyStorageContext=React.createContext<{storage:ScopedStorage;pinKey:string;familyMode:boolean;childId?:string;childName?:string;offlinePreparation?:{status:string;busy:boolean;retry:()=>void}}>({storage:AsyncStorage,pinKey:'holton-parent-lock-v1',familyMode:false});
export const useFamilyStorage=()=>React.useContext(FamilyStorageContext);
