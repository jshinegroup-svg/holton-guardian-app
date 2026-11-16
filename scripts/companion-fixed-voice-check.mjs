import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
let locale='zh-TW',hidden=false;const events={},store=new Map(),audios=[];let rejectNext=false,deferNext=false,resolvePlay;
class AudioMock{
 constructor(src){this.src=src;this.paused=true;audios.push(this);}
 play(){this.paused=false;if(rejectNext){rejectNext=false;return Promise.reject(Error('blocked'));}if(deferNext){deferNext=false;return new Promise(r=>{resolvePlay=r;});}return Promise.resolve();}
 pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}
}
const cache={};function load(file){if(cache[file])return cache[file];const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:m.exports,require:id=>id==='react'?{useSyncExternalStore:(_,get)=>get()}:id.includes('locale')?{getLocale:()=>locale}:load('src/lib/'+id.replace('./','')+'.ts'),globalThis:{localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}},window:{addEventListener:(type,fn)=>events[type]=fn},document:{get hidden(){return hidden;},addEventListener:(type,fn)=>events[type]=fn},Audio:AudioMock});return cache[file]=m.exports;}
const voice=load('src/lib/companionVoice.ts'),replies=load('src/lib/companionReplies.ts'),clips=load('src/lib/companionVoiceClips.ts').companionVoiceClips;
const sample=(role,lang='zh')=>Object.keys(clips[role][lang])[0];
let checks=0;for(const id of Object.keys(clips))for(locale of ['zh-TW','en'])for(const mood of ['ready','focus','rest','done'])for(const name of ['','哥哥'])for(let turn=0;turn<10;turn++){
 const spoken=replies.companionSpokenReply(id+':instance',mood,turn,name);assert(!spoken.includes('哥哥'));const src=voice.companionAudioSource(spoken,locale,id+':instance');assert(src,JSON.stringify({id,locale,mood,name,turn,spoken}));checks++;
}
const a={},b={};locale='zh-TW';assert(voice.useCompanionVoice().supported);voice.speakCompanion(sample('hop'),locale,a,'hop');assert.equal(audios.length,0);
voice.useCompanionVoice().setEnabled(true);deferNext=true;voice.speakCompanion(sample('hop'),locale,a,'hop');const first=audios.at(-1);voice.speakCompanion(sample('stoneback'),locale,b,'stoneback');const second=audios.at(-1);assert(first.paused);voice.stopCompanionVoice(a);assert(!second.paused);resolvePlay();await new Promise(r=>setImmediate(r));assert(first.paused);assert(!second.paused);
voice.useCompanionVoice().setEnabled(false);assert(second.paused);assert.equal(store.get('holton-family-v2::companion-voice'),'off');voice.useCompanionVoice().setEnabled(true);rejectNext=true;voice.speakCompanion(sample('pip','en'),'en',a,'pip');await new Promise(r=>setImmediate(r));assert(audios.at(-1).paused);
voice.speakCompanion(sample('bomo'),locale,a,'bomo');const last=audios.at(-1);hidden=true;events.visibilitychange();assert(last.paused);assert.equal(voice.companionAudioSource('unknown','en','hop'),undefined);assert(voice.companionAudioSource(sample('guardian','en'),'en','unknown'));
for(const role of Object.values(clips))for(const lang of Object.values(role))for(const file of Object.values(lang)){if(process.env.CHECK_AUDIO_FILES==='1')assert(fs.statSync('public/companion-voices/v1/'+file).size>1000);}
console.log('PASS',checks,'phrase selections, dynamic name privacy, owner isolation, delayed playback, mute, rejection, hidden tab, unknown text');
