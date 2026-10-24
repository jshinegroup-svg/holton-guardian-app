import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type ScopedStorage=Pick<typeof AsyncStorage,'getItem'|'setItem'|'removeItem'> & {useCloud?:()=>Promise<void>};
export const FamilyStorageContext=React.createContext<{storage:ScopedStorage;pinKey:string;familyMode:boolean}>({storage:AsyncStorage,pinKey:'holton-parent-lock-v1',familyMode:false});
export const useFamilyStorage=()=>React.useContext(FamilyStorageContext);
