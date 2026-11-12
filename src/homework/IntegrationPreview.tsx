import React from 'react';
import {View,Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LightApp from '../LightApp';
import {FamilyStorageContext} from '../family/context';
import {dateKey} from './model';
const prefix='holton-homework-integration-preview::';
const storage={async getItem(key:string){const value=await AsyncStorage.getItem(prefix+key);if(!value&&key==='holton-guardian-app::spotlight-v1')return JSON.stringify({main:true,companions:true,wishes:true,parent:true,companionTap:true,music:true});if(value||key!=='holton-guardian-app::light-v1')return value;return JSON.stringify({version:1,title:'數學習作',minutes:10,orbs:0,phase:'ready',deadline:null,remaining:600,help:false,history:[],guardian:{},starterCompanionId:'pip',starterChoiceVersion:1,onboardingDone:true,homework:{enabled:true,days:{[dateKey()]:{tasks:['國語乙本','數學習作','閱讀本','背課文','訂正'].map((title,i)=>({id:String(i),title,detail:''}))}}}});},setItem:(key:string,value:string)=>AsyncStorage.setItem(prefix+key,value),removeItem:(key:string)=>AsyncStorage.removeItem(prefix+key)};
export default function IntegrationPreview(){return <FamilyStorageContext.Provider value={{storage,pinKey:prefix+'parent-pin',familyMode:true}}><View style={{flex:1}}><Text style={{backgroundColor:'#103448',color:'#ffe7a6',padding:8,textAlign:'center'}}>整合測試版 · 不連正式帳號 · 點數僅供試玩</Text><LightApp childNickname="試玩冒險者"/></View></FamilyStorageContext.Provider>}
