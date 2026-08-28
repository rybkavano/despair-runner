(() => {
'use strict';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const ui = {
  level:document.getElementById('hudLevel'), coins:document.getElementById('hudCoins'),
  xp:document.getElementById('hudXp'), combo:document.getElementById('hudCombo'), coinCombo:document.getElementById('hudCoinCombo'),
  perkHud:document.getElementById('perkHud'), itemText:document.getElementById('itemText'),
  kiiboHud:document.getElementById('kiiboHud'),
  kiiboText:document.getElementById('kiiboText'),
  kiiboFill:document.getElementById('kiiboFill'),
  danger:document.getElementById('danger'),
  announce:document.getElementById('announce'), bossHud:document.getElementById('bossHud'),
  bossName:document.getElementById('bossName'), bossSub:document.getElementById('bossSub'), bossHp:document.getElementById('bossHpText'),
  bossFill:document.getElementById('bossHpFill'), start:document.getElementById('startScreen'),
  levelScreen:document.getElementById('levelScreen'), levelDone:document.getElementById('levelDoneTitle'), levelRank:document.getElementById('levelRank'), levelStatsSummary:document.getElementById('levelStatsSummary'),
  storyScreen:document.getElementById('storyScreen'), storyPortrait:document.getElementById('storyPortrait'), storyPortraitFallback:document.getElementById('storyPortraitFallback'), storySpeaker:document.getElementById('storySpeaker'), storyText:document.getElementById('storyText'), storyNextBtn:document.getElementById('storyNextBtn'),
  settingsScreen:document.getElementById('settingsScreen'), settingsBtn:document.getElementById('settingsBtn'), startSettingsBtn:document.getElementById('startSettingsBtn'), closeSettingsBtn:document.getElementById('closeSettingsBtn'),
  musicVolume:document.getElementById('musicVolume'), musicVolumeValue:document.getElementById('musicVolumeValue'), sfxVolume:document.getElementById('sfxVolume'), sfxVolumeValue:document.getElementById('sfxVolumeValue'), voiceVolume:document.getElementById('voiceVolume'), voiceVolumeValue:document.getElementById('voiceVolumeValue'), shakeToggle:document.getElementById('shakeToggle'),
  perkChoices:document.getElementById('perkChoices'), gameOver:document.getElementById('gameOver'),
  victory:document.getElementById('victory'), deathTitle:document.getElementById('deathTitle'),
  deathText:document.getElementById('deathText'), deathLevel:document.getElementById('deathLevel'),
  deathXp:document.getElementById('deathXp'), victoryTime:document.getElementById('victoryTime'),
  victoryXp:document.getElementById('victoryXp'), toast:document.getElementById('toast'),
  restartBtn:document.getElementById('restartBtn'),
  deathCheckpointBtn:document.getElementById('deathCheckpointBtn'),
  saveSlots:document.getElementById('saveSlots'),
  mobileControls:document.getElementById('mobileControls'), mobileDpad:document.getElementById('mobileDpad'),
  mobilePrimary:document.getElementById('mobilePrimary'), mobileSecondary:document.getElementById('mobileSecondary'),
  mobileSprint:document.getElementById('mobileSprint'), fullscreenBtn:document.getElementById('fullscreenBtn'),
  victoryEyebrow:document.getElementById('victoryEyebrow'), victoryTitle:document.getElementById('victoryTitle'),
  victoryText:document.getElementById('victoryText'), victoryRank:document.getElementById('victoryRank'),
  victoryDeaths:document.getElementById('victoryDeaths'), victoryEnergy:document.getElementById('victoryEnergy'),
  victoryStages:document.getElementById('victoryStages'), victoryPerks:document.getElementById('victoryPerks'),
  victoryDifficulty:document.getElementById('victoryDifficulty'), victoryRunType:document.getElementById('victoryRunType'),
  victoryRestartBtn:document.getElementById('victoryRestartBtn'),
  victoryMenuBtn:document.getElementById('victoryMenuBtn')
};

const imgs = {};
for (const [k,src] of Object.entries({
  nagito:'assets/nagito.webp', kokichi:'assets/kokichi.webp',
  shuichi:'assets/shuichi.webp', hifumi:'assets/hifumi.png',
  monocoin:'assets/monocoin.png', kiibo:'assets/kiibo_gunner.png', junkoFallback:'assets/junko_local_1.png', monokuma:'assets/monokuma_normal.webp', monokumaRage:'assets/monokuma_rage.webp',
  runnerOrange:'assets/runner_car_orange.png', runnerGreen:'assets/runner_car_green.png',
  runnerTrash:'assets/runner_trash.png', runnerBarrier:'assets/runner_barrier.png',
  runnerRamp:'assets/runner_ramp.png', runnerPit:'assets/runner_pit.png',
  runnerWreck:'assets/runner_wreck.png', runnerExplosion:'assets/runner_explosion.png', runnerStairs:'assets/runner_stairs.png', runnerLadder:'assets/runner_ladder.png'
})) { imgs[k]=new Image(); imgs[k].src=src; }


const bonusCharacterUrls={
  kaito:'assets/kaito_full.webp',
  maki:'assets/maki_full.webp',
  makoto:'https://danganronpa.fandom.com/wiki/Special:Redirect/file/Danganronpa_DRAE_Makoto_Naegi_DR1_Outfit_Sprite_01.png'
};
const bonusImgs={};
for(const [k,src] of Object.entries(bonusCharacterUrls)){const im=new Image();im.referrerPolicy='no-referrer';im.src=src;bonusImgs[k]=im}

const junkoSpriteUrls=[
 'assets/junko_local_1.png',
 'assets/junko_local_2.png',
 'assets/junko_local_3.png',
 'assets/junko_local_4.png',
 'assets/junko_local_5.png',
 'assets/junko_local_6.png'
];
const junkoSprites=junkoSpriteUrls.map(src=>{const im=new Image();im.src=src;return im;});

const music={normal:new Audio('assets/music_normal.wav'),hifumi:new Audio('assets/music_hifumi.wav'),despair:new Audio('assets/music_despair.wav')};
Object.values(music).forEach(a=>{a.loop=true;a.preload='auto'});

const audioSettings={
  music:.18,
  sfx:.72,
  voice:.92,
  shake:true
};
let settingsReturnMode='menu';

function loadSettings(){
  try{
    const saved=JSON.parse(localStorage.getItem('shuichi_escape_settings')||'{}');
    if(Number.isFinite(saved.music))audioSettings.music=clamp(saved.music,0,1);
    if(Number.isFinite(saved.sfx))audioSettings.sfx=clamp(saved.sfx,0,1);
    if(Number.isFinite(saved.voice))audioSettings.voice=clamp(saved.voice,0,1);
    if(typeof saved.shake==='boolean')audioSettings.shake=saved.shake;
  }catch(e){}
}
function saveSettings(){
  try{localStorage.setItem('shuichi_escape_settings',JSON.stringify(audioSettings))}catch(e){}
}
function applyAudioSettings(){
  Object.values(music).forEach(a=>a.volume=audioSettings.music);
  [...junkoVoiceBank,...junkoLaughBank].forEach(a=>a.volume=audioSettings.voice);

  if(typeof junkoFinalLaugh!=='undefined'){
    junkoFinalLaugh.volume=
      audioSettings.voice;
  }
  ui.musicVolume.value=Math.round(audioSettings.music*100);
  ui.sfxVolume.value=Math.round(audioSettings.sfx*100);
  ui.voiceVolume.value=Math.round(audioSettings.voice*100);
  ui.musicVolumeValue.textContent=Math.round(audioSettings.music*100)+'%';
  ui.sfxVolumeValue.textContent=Math.round(audioSettings.sfx*100)+'%';
  ui.voiceVolumeValue.textContent=Math.round(audioSettings.voice*100)+'%';
  ui.shakeToggle.textContent=audioSettings.shake?'ВКЛ':'ВЫКЛ';
  ui.shakeToggle.classList.toggle('on',audioSettings.shake);
}
function setVolume(kind,value){
  audioSettings[kind]=clamp(Number(value)/100,0,1);
  applyAudioSettings();saveSettings();
}
function openSettings(){
  if(ui.settingsScreen.classList.contains('show'))return;
  settingsReturnMode=mode;
  if(mode!=='menu')mode='paused';
  ui.settingsScreen.classList.add('show');
  applyAudioSettings();
}
function closeSettings(){
  ui.settingsScreen.classList.remove('show');
  if(mode==='paused')mode=settingsReturnMode==='paused'?'playing':settingsReturnMode;
  last=performance.now();
}
let currentMusic=null,pendingMusic=null;
function playMusic(kind){
  const next=music[kind];pendingMusic=kind;
  if(currentMusic!==next){
    Object.values(music).forEach(a=>{a.pause();a.currentTime=0});
    currentMusic=next;
  }
  next.volume=audioSettings.music;
  try{
    const p=next.play();
    if(p&&typeof p.then==='function')p.then(()=>{if(currentMusic===next)pendingMusic=null}).catch(()=>{pendingMusic=kind});
    else pendingMusic=null;
  }catch(e){pendingMusic=kind}
}
function unlockGameAudio(){
  if(currentMusic){
    currentMusic.volume=audioSettings.music;
    try{const p=currentMusic.play();if(p&&typeof p.catch==='function')p.catch(()=>{})}catch(e){}
  }else if(pendingMusic)playMusic(pendingMusic);
}
function stopMusic(){Object.values(music).forEach(a=>a.pause());pendingMusic=null}

const junkoVoiceBank=[
 new Audio('assets/junko_voice_01.mp3'),
 new Audio('assets/junko_voice_02.mp3'),
 new Audio('assets/junko_voice_03.mp3'),
 new Audio('assets/junko_voice_04.mp3'),
 new Audio('assets/junko_voice_05.mp3'),
 new Audio('assets/junko_voice_06.mp3'),
 new Audio('assets/junko_voice_07.mp3'),
 new Audio('assets/junko_voice_08.mp3'),
 new Audio('assets/junko_voice_09.mp3'),
 new Audio('assets/junko_voice_10.mp3'),
 new Audio('assets/junko_voice_11.mp3'),
 new Audio('assets/junko_voice_12.mp3')
];
const junkoLaughBank=[
 new Audio('assets/junko_laugh_01.mp3'),
 new Audio('assets/junko_laugh_02.mp3'),
 new Audio('assets/junko_laugh_03.mp3'),
 new Audio('assets/junko_laugh_04.mp3')
];
[...junkoVoiceBank,...junkoLaughBank].forEach(a=>{a.preload='auto';a.volume=audioSettings.voice});
let currentJunkoVoice=null;

const junkoFinalLaugh=
  new Audio(
    'assets/junko_final_laugh.mp3'
  );

junkoFinalLaugh.preload='auto';
junkoFinalLaugh.volume=
  audioSettings.voice;

function playJunkoFinalLaugh(){
  stopJunkoVoice();

  try{
    junkoFinalLaugh.pause();
    junkoFinalLaugh.currentTime=0;
    junkoFinalLaugh.volume=
      audioSettings.voice;

    const p=
      junkoFinalLaugh.play();

    if(
      p &&
      typeof p.catch==='function'
    ){
      p.catch(()=>{});
    }
  }catch(e){}
}

function stopJunkoFinalLaugh(){
  try{
    junkoFinalLaugh.pause();
    junkoFinalLaugh.currentTime=0;
  }catch(e){}
}


function playJunkoClip(kind='voice'){
  const bank=kind==='laugh'?junkoLaughBank:junkoVoiceBank;
  if(!bank.length)return;
  if(currentJunkoVoice){
    try{currentJunkoVoice.pause();currentJunkoVoice.currentTime=0}catch(e){}
  }
  const clip=bank[Math.floor(Math.random()*bank.length)];
  currentJunkoVoice=clip;
  try{clip.currentTime=0;clip.volume=audioSettings.voice;clip.play()}catch(e){}
}

function stopJunkoVoice(){
  if(currentJunkoVoice){
    try{currentJunkoVoice.pause();currentJunkoVoice.currentTime=0}catch(e){}
  }
  currentJunkoVoice=null;
}


const fartSounds=[new Audio('assets/perfect-fart.mp3'),new Audio('assets/dry-fart.mp3')];
fartSounds.forEach(a=>a.preload='auto');
let fartIndex=0;
const sounds={
  shot:new Audio('assets/kiibo_shot.wav'),
  coin:new Audio('assets/coin.wav'),
  bad:new Audio('assets/badcoin.wav'),
  level:new Audio('assets/levelup.wav')
};
Object.values(sounds).forEach(a=>a.preload='auto');

const keys={};
let mode='menu', last=performance.now(), totalTime=0, level=1, stageCoins=0, xp=0; let difficulty='normal';
let shake=0, slow=0, fartCooldown=0, fartCombo=1, lastFart=-99, announceTimer=0, coinRushTimer=0; let coinCombo=0,coinComboTimer=0,maxCoinCombo=0,energyTimer=0,phaseTimer=0,activeItem=null,itemPickups=[]; let mapEvents=[],mapEventTimer=0,blackoutTimer=0,bellBoostTimer=0,miniBossTimer=0,stageStartTime=0,stageStats=null,mapHitStun=0,mapEventHintShown=false;
let coins=[], hazards=[], particles=[], texts=[], trail=[], obstacles=[];
let currentTheme=null;
let kiiboLaser=null, kiiboCutin=null, stageShotTimer=0, nextAutoShot=0;
let kiiboCooldown=0, kiiboMaxCooldown=0;
let boss=null, cinematic=null, bossHitLock=false; let junko=null,junkoAttacks=[],junkoSurvival=0;
let storyState=null,bonus=null,shooterMouse={x:W/2,y:H/3,active:false};let loopStarted=false;
let campaignStage=1,currentGoal=8,currentStageType='chase',guestEnemies=[],breachLock=false,breachFx=0,breachTimer=0,gateOpen=false,checkpointData=null;

let campaignStats=freshCampaignStats();

function freshCampaignStats(){
  return{
    deaths:0,
    energy:0,
    stages:0,
    stageRanks:{},
    completedStages:[],
    jumperResets:0,
    shooterResets:0,
    monokumaResets:0,
    endingDone:false
  };
}

function recordDeath(kind='game'){
  campaignStats.deaths++;

  if(kind==='runner')campaignStats.jumperResets++;
  else if(kind==='shooter')campaignStats.shooterResets++;
  else if(kind==='monokuma')campaignStats.monokumaResets++;
}

function recordStageComplete(stage,rank='✓'){
  if(!campaignStats.completedStages.includes(stage)){
    campaignStats.completedStages.push(stage);
    campaignStats.completedStages.sort((a,b)=>a-b);
    campaignStats.stages=campaignStats.completedStages.length;
  }

  campaignStats.stageRanks[String(stage)]=rank;
}

function formatRunTime(sec){
  sec=Math.max(0,Math.floor(sec||0));
  const m=Math.floor(sec/60);
  const s=sec%60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function overallCampaignRank(){
  let score=100;

  score-=campaignStats.deaths*5;
  score-=Math.max(0,totalTime-900)/35;
  score+=Math.min(12,xp/650);

  if(difficulty==='despair')score+=7;
  if(campaignStats.stages>=20)score+=5;

  if(score>=96)return 'S';
  if(score>=84)return 'A';
  if(score>=72)return 'B';
  if(score>=58)return 'C';
  return 'D';
}


const LEGACY_CHECKPOINT_KEY='shuichi_escape_checkpoint_v23';
const SAVE_VERSION=2;
const SAVE_SLOT_COUNT=3;
const ACTIVE_SLOT_KEY='despair_runner_active_slot_v1';

let activeSaveSlot=1;

function clampSaveSlot(slot){
  const n=Math.floor(Number(slot)||1);
  return Math.max(1,Math.min(SAVE_SLOT_COUNT,n));
}

function slotCheckpointKey(slot=activeSaveSlot){
  return `despair_runner_save_v1_slot_${clampSaveSlot(slot)}`;
}

function slotMetaKey(slot=activeSaveSlot){
  return `despair_runner_meta_v1_slot_${clampSaveSlot(slot)}`;
}

function readSlotMeta(slot=activeSaveSlot){
  try{
    const d=
      JSON.parse(
        localStorage.getItem(
          slotMetaKey(slot)
        )||'null'
      );

    return d&&d.version===SAVE_VERSION
      ? d
      : null;

  }catch(e){
    return null;
  }
}

function writeSlotMeta(slot,data){
  slot=clampSaveSlot(slot);

  const next={
    version:SAVE_VERSION,
    slot,
    ...(readSlotMeta(slot)||{}),
    ...data,
    savedAt:Date.now()
  };

  try{
    localStorage.setItem(
      slotMetaKey(slot),
      JSON.stringify(next)
    );
  }catch(e){}

  return next;
}

function readCheckpoint(slot=activeSaveSlot){
  try{
    const d=
      JSON.parse(
        localStorage.getItem(
          slotCheckpointKey(slot)
        )||'null'
      );

    if(
      !d ||
      d.version!==SAVE_VERSION ||
      !Number.isFinite(d.nextStage)
    ){
      return null;
    }

    return d;

  }catch(e){
    return null;
  }
}

function setActiveSaveSlot(slot){
  activeSaveSlot=
    clampSaveSlot(slot);

  try{
    localStorage.setItem(
      ACTIVE_SLOT_KEY,
      String(activeSaveSlot)
    );
  }catch(e){}

  refreshSaveSlots();
  refreshCheckpointUi();
}

function removeSlotCheckpoint(slot=activeSaveSlot){
  try{
    localStorage.removeItem(
      slotCheckpointKey(slot)
    );
  }catch(e){}

  if(
    clampSaveSlot(slot)===
    activeSaveSlot
  ){
    checkpointData=null;
  }
}

function clearSaveSlot(slot=activeSaveSlot,refresh=true){
  slot=clampSaveSlot(slot);

  try{
    localStorage.removeItem(
      slotCheckpointKey(slot)
    );

    localStorage.removeItem(
      slotMetaKey(slot)
    );
  }catch(e){}

  if(slot===activeSaveSlot){
    checkpointData=null;
  }

  if(refresh){
    refreshSaveSlots();
    refreshCheckpointUi();
  }
}

function migrateLegacyCheckpoint(){
  let anyNew=false;

  for(
    let slot=1;
    slot<=SAVE_SLOT_COUNT;
    slot++
  ){
    if(
      readCheckpoint(slot)||
      readSlotMeta(slot)
    ){
      anyNew=true;
      break;
    }
  }

  if(anyNew)return;

  try{
    const legacy=
      JSON.parse(
        localStorage.getItem(
          LEGACY_CHECKPOINT_KEY
        )||'null'
      );

    if(
      !legacy ||
      !Number.isFinite(
        legacy.nextStage
      )
    ){
      return;
    }

    const migrated={
      ...legacy,
      version:SAVE_VERSION,
      slot:1,
      savedAt:Date.now()
    };

    localStorage.setItem(
      slotCheckpointKey(1),
      JSON.stringify(migrated)
    );

    writeSlotMeta(
      1,
      {
        started:true,
        completed:false,
        nextStage:migrated.nextStage,
        totalTime:Number(migrated.totalTime)||0,
        xp:Number(migrated.xp)||0,
        difficulty:migrated.difficulty==='despair'?'despair':'normal',
        checkpoint:true
      }
    );

    localStorage.removeItem(
      LEGACY_CHECKPOINT_KEY
    );

  }catch(e){}
}

function slotDisplayData(slot){
  const cp=readCheckpoint(slot);
  const meta=readSlotMeta(slot);

  return{
    cp,
    meta,
    has:!!(cp||meta),
    completed:!!(meta&&meta.completed)
  };
}

function refreshSaveSlots(){
  if(!ui.saveSlots)return;

  ui.saveSlots.innerHTML='';

  for(
    let slot=1;
    slot<=SAVE_SLOT_COUNT;
    slot++
  ){
    const state=
      slotDisplayData(slot);

    const cp=state.cp;
    const meta=state.meta;

    const card=
      document.createElement('div');

    card.className=
      `saveSlot ${
        slot===activeSaveSlot
          ? 'active'
          : ''
      } ${
        state.completed
          ? 'completed'
          : ''
      }`;

    card.dataset.slot=
      String(slot);

    const difficultyText=
      (
        cp?.difficulty ||
        meta?.difficulty ||
        'normal'
      ).toUpperCase();

    let status='ПУСТО';
    let info=
      'Выбери этот слот и начни новый забег.';

    if(state.completed){
      status=
        'BAD END · ЭТАП 20/20';

      info=
        `${formatRunTime(meta.totalTime||0)} · XP ${meta.xp||0} · ${difficultyText}`;

    }else if(cp){
      status=
        `КОНТРОЛЬНАЯ ТОЧКА · ЭТАП ${cp.nextStage}/20`;

      info=
        `${formatRunTime(cp.totalTime||0)} · XP ${cp.xp||0} · ${difficultyText}`;

    }else if(meta&&meta.started){
      status=
        'НОВЫЙ ЗАБЕГ · ЭТАП 1/20';

      info=
        `До первой контрольной точки · ${difficultyText}`;
    }

    card.innerHTML=
      `<div class="saveSlotHeader">
        <strong>СЛОТ ${slot}</strong>
        <small>${slot===activeSaveSlot?'ВЫБРАН':'SAVE'}</small>
      </div>
      <div class="saveSlotStatus">${status}</div>
      <div class="saveSlotMeta">${info}</div>
      <div class="saveSlotActions"></div>`;

    card.onclick=()=>{
      setActiveSaveSlot(slot);
    };

    const actions=
      card.querySelector(
        '.saveSlotActions'
      );

    if(cp){
      const cont=
        document.createElement('button');

      cont.className=
        'saveContinue';

      cont.textContent=
        'ПРОДОЛЖИТЬ';

      cont.onclick=e=>{
        e.stopPropagation();
        unlockGameAudio();
        loadCheckpoint(slot);
      };

      actions.appendChild(cont);
    }

    const fresh=
      document.createElement('button');

    fresh.className=
      'saveNew';

    fresh.textContent=
      state.has
        ? 'ЗАНОВО'
        : 'НОВАЯ';

    fresh.onclick=e=>{
      e.stopPropagation();
      unlockGameAudio();
      beginNewRunInSlot(slot);
    };

    actions.appendChild(fresh);

    if(state.has){
      const del=
        document.createElement('button');

      del.className=
        'saveDelete';

      del.textContent=
        'УДАЛИТЬ';

      del.onclick=e=>{
        e.stopPropagation();

        const ok=
          typeof confirm!=='function' ||
          confirm(
            `Удалить сохранение из слота ${slot}?`
          );

        if(!ok)return;

        clearSaveSlot(slot,true);
      };

      actions.appendChild(del);
    }

    ui.saveSlots.appendChild(card);
  }
}

function refreshCheckpointUi(){
  checkpointData=
    readCheckpoint(
      activeSaveSlot
    );

  const has=
    !!checkpointData;

  if(ui.deathCheckpointBtn){
    ui.deathCheckpointBtn.style.display=
      has
        ? 'inline-block'
        : 'none';

    ui.deathCheckpointBtn.textContent=
      has
        ? `С КОНТРОЛЬНОЙ ТОЧКИ · СЛОТ ${activeSaveSlot}`
        : 'С КОНТРОЛЬНОЙ ТОЧКИ';
  }

  refreshSaveSlots();
}

function saveCheckpoint(completedStage,nextStage){
  if(
    completedStage!==5 &&
    completedStage!==10 &&
    completedStage!==15 &&
    completedStage!==19
  ){
    return;
  }

  const data={
    version:SAVE_VERSION,
    slot:activeSaveSlot,
    completedStage,
    nextStage,
    xp,
    totalTime,
    difficulty,
    stats:{...stats},
    perkStacks:{...perkStacks},
    perksOwned:[...perksOwned],
    campaignStats:
      JSON.parse(
        JSON.stringify(
          campaignStats
        )
      ),
    savedAt:Date.now()
  };

  try{
    localStorage.setItem(
      slotCheckpointKey(
        activeSaveSlot
      ),
      JSON.stringify(data)
    );

    checkpointData=data;

    writeSlotMeta(
      activeSaveSlot,
      {
        started:true,
        completed:false,
        checkpoint:true,
        nextStage,
        totalTime,
        xp,
        difficulty
      }
    );

    refreshCheckpointUi();

    toast(
      `СОХРАНЕНО · СЛОТ ${activeSaveSlot} · ЭТАП ${nextStage}/20`,
      1500
    );

  }catch(e){}
}

function loadCheckpoint(slot=activeSaveSlot){
  slot=clampSaveSlot(slot);
  setActiveSaveSlot(slot);

  const d=
    readCheckpoint(slot);

  if(!d){
    refreshCheckpointUi();
    return;
  }

  stopJunkoFinalLaugh();
  stopJunkoVoice();
  ui.settingsScreen.classList.remove('show');

  mode='playing';
  totalTime=Number(d.totalTime)||0;
  level=1;
  campaignStage=d.nextStage;
  currentGoal=8;
  currentStageType='chase';
  stageCoins=0;
  xp=Number(d.xp)||0;
  fartIndex=0;

  Object.assign(
    stats,
    {
      speed:1,
      fart:1,
      magnet:0,
      doubleCoin:0,
      sprint:1,
      luck:0,
      fartPower:1,
      fartStun:0,
      shield:0,
      panic:0,
      coinRush:0,
      kiibo:0
    },
    d.stats||{}
  );

  perksOwned.length=0;

  (d.perksOwned||[])
    .forEach(
      x=>perksOwned.push(x)
    );

  Object.keys(perkStacks)
    .forEach(
      k=>delete perkStacks[k]
    );

  Object.assign(
    perkStacks,
    d.perkStacks||{}
  );

  campaignStats=
    freshCampaignStats();

  Object.assign(
    campaignStats,
    d.campaignStats||{}
  );

  if(
    !Array.isArray(
      campaignStats.completedStages
    )
  ){
    campaignStats.completedStages=[];
  }

  if(
    !campaignStats.stageRanks ||
    typeof campaignStats.stageRanks!=='object'
  ){
    campaignStats.stageRanks={};
  }

  difficulty=
    d.difficulty==='despair'
      ? 'despair'
      : 'normal';

  document
    .querySelectorAll(
      '.diffBtn'
    )
    .forEach(
      b=>
        b.classList.toggle(
          'selected',
          b.dataset.diff===difficulty
        )
    );

  boss=null;
  junko=null;
  junkoAttacks=[];
  junkoSurvival=0;
  cinematic=null;
  guestEnemies=[];

  breachLock=false;
  breachFx=0;
  breachTimer=0;
  gateOpen=false;

  kiiboLaser=null;
  kiiboCutin=null;
  stageShotTimer=0;
  nextAutoShot=0;
  bossHitLock=false;
  kiiboCooldown=0;
  kiiboMaxCooldown=0;

  activeItem=null;
  itemPickups=[];
  mapEvents=[];
  mapHitStun=0;
  mapEventHintShown=false;

  coinCombo=0;
  coinComboTimer=0;
  maxCoinCombo=0;

  ui.start.classList.remove('show');
  ui.levelScreen.classList.remove('show');
  ui.gameOver.classList.remove('show');
  ui.victory.classList.remove('show');
  ui.bossHud.classList.remove('show');
  ui.storyScreen.classList.remove('show');

  bonus=null;
  storyState=null;

  setBonusUi(false);
  updatePerkHud();
  updateItemHud();
  ensureLoop();

  startCampaignStage(
    d.nextStage
  );

  last=
    performance.now();

  updateMobileControls(true);
}

function beginNewRunInSlot(slot=activeSaveSlot,skipConfirm=false){
  slot=clampSaveSlot(slot);

  const existing=
    slotDisplayData(slot);

  if(
    existing.has &&
    !skipConfirm
  ){
    const ok=
      typeof confirm!=='function' ||
      confirm(
        `Начать заново в слоте ${slot}? Старое сохранение этого слота будет удалено сразу.`
      );

    if(!ok)return;
  }

  setActiveSaveSlot(slot);

  // IMPORTANT RELEASE RULE:
  // erase the OLD checkpoint BEFORE level 1 starts.
  // Therefore dying on level 1 can never expose an old Junko checkpoint.
  clearSaveSlot(
    slot,
    false
  );

  writeSlotMeta(
    slot,
    {
      started:true,
      completed:false,
      checkpoint:false,
      nextStage:1,
      totalTime:0,
      xp:0,
      difficulty
    }
  );

  refreshCheckpointUi();

  fullReset();
}

function markActiveSlotCompleted(){
  removeSlotCheckpoint(
    activeSaveSlot
  );

  writeSlotMeta(
    activeSaveSlot,
    {
      started:true,
      completed:true,
      checkpoint:false,
      nextStage:20,
      totalTime,
      xp,
      difficulty,
      ending:'DESPAIR',
      campaignStats:
        JSON.parse(
          JSON.stringify(
            campaignStats
          )
        )
    }
  );

  refreshCheckpointUi();
}

function goToSaveMenu(){
  stopJunkoFinalLaugh();
  stopJunkoVoice();
  stopMusic();

  mode='menu';

  ui.settingsScreen.classList.remove('show');
  ui.levelScreen.classList.remove('show');
  ui.gameOver.classList.remove('show');
  ui.victory.classList.remove('show');
  ui.bossHud.classList.remove('show');
  ui.storyScreen.classList.remove('show');
  ui.start.classList.add('show');

  setBonusUi(false);

  refreshSaveSlots();
  refreshCheckpointUi();
  updateMobileControls(true);
}

const stats={speed:1,fart:1,magnet:0,doubleCoin:0,sprint:1,luck:0,fartPower:1,fartStun:0,shield:0,panic:0,coinRush:0,kiibo:0};
const perksOwned=[];
const perkStacks={};

const player={x:W/2,y:H/2,r:22,vx:0,vy:0,angle:0,inv:0,shields:0};

const enemies=[
  {id:'nagito',name:'Нагито',img:imgs.nagito,x:100,y:120,r:23,alive:true,bob:0,dash:0,luckCd:12,teleWarn:0,teleX:0,teleY:0,arrivalLock:0,stun:0},
  {id:'kokichi',name:'Кокичи',img:imgs.kokichi,x:W-100,y:H-110,r:23,alive:true,bob:1.5,dash:0,dashCd:7,dashWarn:0,dashDx:0,dashDy:0,stun:0}
];

const levelGoals={1:8,2:9,3:10,4:11,5:12,6:13,7:14,8:15,9:17,10:60,11:9999};

const perkPool=[
 {id:'speed',name:'ДЕТЕКТИВНЫЕ НОГИ',desc:'+10% обычная скорость Шуичи. СТАКАЕТСЯ.',apply:()=>stats.speed*=1.10},
 {id:'fart',name:'ТУРБО-ПЕРДЁЖ',desc:'откат пробела на 16% быстрее. СТАКАЕТСЯ.',apply:()=>stats.fart*=1.16},
 {id:'fartPower',name:'ЯДЕРНЫЙ ПЕРДЁЖ',desc:'+22% сила ускорения от пробела. СТАКАЕТСЯ.',apply:()=>stats.fartPower*=1.22},
 {id:'fartStun',name:'ГАЗОВАЯ АТАКА',desc:'+0.45 сек оглушения врагов рядом после пердежа. СТАКАЕТСЯ.',apply:()=>stats.fartStun+=0.45},
 {id:'magnet',name:'ЭНЕРГО-МАГНИТ',desc:'+42 к радиусу притягивания энергии. СТАКАЕТСЯ.',apply:()=>stats.magnet+=42},
 {id:'double',name:'ПЕРЕГРУЗКА',desc:'+15% шанс получить дополнительную единицу энергии. СТАКАЕТСЯ.',apply:()=>stats.doubleCoin=Math.min(.90,stats.doubleCoin+.15)},
 {id:'sprint',name:'СПРИНТ ШУИЧИ',desc:'+10% скорость при Shift. СТАКАЕТСЯ.',apply:()=>stats.sprint*=1.10},
 {id:'luck',name:'АНТИ-СБОЙ',desc:'+18% шанс игнорировать заражённую энергию. СТАКАЕТСЯ, максимум 95%.',apply:()=>stats.luck=Math.min(.95,stats.luck+.18)},
 {id:'shield',name:'АЛИБИ',desc:'+1 бесплатное спасение от столкновения на каждом уровне. СТАКАЕТСЯ.',apply:()=>stats.shield+=1},
 {id:'panic',name:'ПАНИКА ДЕТЕКТИВА',desc:'+12% скорость, когда преследователь очень близко. СТАКАЕТСЯ.',apply:()=>stats.panic+=.12},
 {id:'coinRush',name:'ЭНЕРГЕТИЧЕСКИЙ ИМПУЛЬС',desc:'+11% скорость на 0.9 сек после энергии. СТАКАЕТСЯ.',apply:()=>stats.coinRush+=.11},
 {id:'kiibo',name:'КИБО НА СВЯЗИ',desc:'Кибо начинает помогать с 6 уровня и быстрее перезаряжается. СТАКАЕТСЯ.',apply:()=>stats.kiibo+=1}
];


function perkCount(id){return perkStacks[id]||0}

function specialMaxLives(base){
  return base+Math.floor(stats.shield);
}

function specialMoveMul(){
  const raw=
    Math.sqrt(
      Math.max(.2,stats.speed)*
      Math.max(.2,stats.sprint)
    );

  return clamp(
    raw,
    .85,
    1.38
  );
}

function specialJumpMul(){
  return clamp(
    1+
    (stats.speed-1)*.18+
    (stats.fartPower-1)*.12,
    .9,
    1.20
  );
}

function specialEnergyRadius(base){
  return base+
    stats.magnet*.42;
}

function specialEnergyGain(){
  let gain=1;

  if(
    stats.doubleCoin>0 &&
    Math.random()<
      stats.doubleCoin*.60
  ){
    gain++;
  }

  return gain;
}

function specialAvoidHit(){
  const chance=
    Math.min(
      .28,
      stats.luck*.28
    );

  return chance>0 &&
    Math.random()<chance;
}

function showSpecialPerkToast(){
  const count=
    Object.values(perkStacks)
      .reduce(
        (sum,n)=>
          sum+(Number(n)||0),
        0
      );

  if(count>0){
    toast(
      `ПЕРКИ ПЕРЕНЕСЕНЫ · ${count} СТАКОВ`,
      1050
    );
  }
}

function perkValueText(id){
  const n=perkCount(id);
  switch(id){
    case 'speed': return `+${Math.round((stats.speed-1)*100)}% скорость`;
    case 'fart': return `+${Math.round((stats.fart-1)*100)}% откат пердежа`;
    case 'fartPower': return `+${Math.round((stats.fartPower-1)*100)}% сила пердежа`;
    case 'fartStun': return `${stats.fartStun.toFixed(2)} сек. оглушения`;
    case 'magnet': return `+${Math.round(stats.magnet)} радиус магнита`;
    case 'double': return `${Math.round(stats.doubleCoin*100)}% шанс +1 монеты`;
    case 'sprint': return `+${Math.round((stats.sprint-1)*100)}% спринт`;
    case 'luck': return `${Math.round(Math.min(.95,stats.luck)*100)}% игнор фальшивой монеты`;
    case 'shield': return `${Math.floor(stats.shield)} спасение(я) за уровень`;
    case 'panic': return `+${Math.round(stats.panic*100)}% скорость в панике`;
    case 'coinRush': return `+${Math.round(stats.coinRush*100)}% скорость после монеты`;
    case 'kiibo': return `откат Кибо: ${kiiboBaseCooldown().toFixed(1)} сек.`;
    default: return `стак ${n}`;
  }
}
function perkNextText(p){
  const n=perkCount(p.id);
  switch(p.id){
    case 'speed': return `Сейчас ${Math.round((stats.speed-1)*100)}% → после выбора примерно ${Math.round((stats.speed*1.10-1)*100)}%`;
    case 'fart': return `Сейчас ${Math.round((stats.fart-1)*100)}% → примерно ${Math.round((stats.fart*1.16-1)*100)}%`;
    case 'fartPower': return `Сейчас ${Math.round((stats.fartPower-1)*100)}% → примерно ${Math.round((stats.fartPower*1.22-1)*100)}%`;
    case 'fartStun': return `Сейчас ${stats.fartStun.toFixed(2)} сек. → ${(stats.fartStun+.42).toFixed(2)} сек.`;
    case 'magnet': return `Сейчас +${Math.round(stats.magnet)} → +${Math.round(stats.magnet+42)} радиуса`;
    case 'double': return `Сейчас ${Math.round(stats.doubleCoin*100)}% → ${Math.round((stats.doubleCoin+.15)*100)}%`;
    case 'sprint': return `Сейчас +${Math.round((stats.sprint-1)*100)}% → примерно +${Math.round((stats.sprint*1.10-1)*100)}%`;
    case 'luck': return `Сейчас ${Math.round(Math.min(.95,stats.luck)*100)}% → ${Math.round(Math.min(.95,stats.luck+.18)*100)}%`;
    case 'shield': return `Сейчас ${Math.floor(stats.shield)} → ${Math.floor(stats.shield)+1} спасение(я) за уровень`;
    case 'panic': return `Сейчас +${Math.round(stats.panic*100)}% → +${Math.round((stats.panic+.12)*100)}%`;
    case 'coinRush': return `Сейчас +${Math.round(stats.coinRush*100)}% → +${Math.round((stats.coinRush+.11)*100)}%`;
    case 'kiibo': return `Откат ${kiiboBaseCooldown().toFixed(1)}с → ${Math.max(7.5,15*Math.pow(.84,stats.kiibo+1)).toFixed(1)}с`;
    default: return `Стак: ${n+1}`;
  }
}

const deathLines=[
 'Шуичи раскрыл дело. Но не успел убежать.',
 'Кокичи сказал, что это всё была ложь. Не помогло.',
 'Нагито назвал поражение ступенькой к надежде.',
 'Детективный талант не включает кардио.',
 'Надо было чаще жать пробел.'
];

const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const d2=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

function play(a,vol=1){try{a.pause();a.currentTime=0;a.volume=clamp(vol*audioSettings.sfx,0,1);a.play();}catch(e){}}
function fartSound(){const a=fartSounds[fartIndex]; fartIndex=(fartIndex+1)%fartSounds.length; fartSounds.forEach(x=>{x.pause();x.currentTime=0}); play(a,1);}
function toast(t,ms=850){ui.toast.textContent=t;ui.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.classList.remove('show'),ms)}
function announce(t){ui.announce.textContent=t;ui.announce.classList.remove('show');void ui.announce.offsetWidth;ui.announce.classList.add('show');}
function updatePerkHud(){
  const ownedIds=Object.keys(perkStacks).filter(id=>perkStacks[id]>0);
  if(!ownedIds.length){
    ui.perkHud.innerHTML='<div class="perkTag"><b>БАФФОВ ПОКА НЕТ</b><span>Игнор фейк-монеты: 0%</span></div>';
    return;
  }
  const luckLine=`<div class="perkTag chanceTag"><b>ШАНС ИГНОРА ФЕЙК-МОНЕТЫ</b><span>${Math.round(Math.min(.95,stats.luck)*100)}%</span></div>`;
  ui.perkHud.innerHTML=luckLine+ownedIds.map(id=>{
    const p=perkPool.find(x=>x.id===id);
    const count=perkStacks[id];
    return `<div class="perkTag"><b>${p?.name||id} ×${count}</b><span>${perkValueText(id)}</span></div>`;
  }).join('');
}



const levelThemes = {
  1:{
    name:'КОРИДОР',
    palette:{bg:'#171720',tile1:'#20202a',tile2:'#292934',top:'#0d0d12',accent:'#7d2bd6',line:'#e7e7ff'},
    deco:'hall',
    obstacles:[
      {x:105,y:165,w:115,h:34,kind:'bench',label:'ЛАВКА'},
      {x:360,y:145,w:215,h:42,kind:'deskRow',label:'ПАРТЫ'},
      {x:865,y:165,w:95,h:105,kind:'locker',label:'ШКАФ'},
      {x:215,y:405,w:185,h:38,kind:'bench',label:'ЛАВКА'},
      {x:610,y:355,w:115,h:70,kind:'cabinet',label:'ТУМБА'},
      {x:955,y:520,w:175,h:42,kind:'bench',label:'СКАМЬЯ'}
    ]
  },
  2:{
    name:'КЛАСС',
    palette:{bg:'#1b1821',tile1:'#2a2432',tile2:'#342b3f',top:'#111017',accent:'#58b8ff',line:'#ffffff'},
    deco:'class',
    obstacles:[
      {x:125,y:170,w:140,h:55,kind:'teacherDesk',label:'СТОЛ'},
      {x:380,y:160,w:225,h:40,kind:'deskRow',label:'ПАРТА'},
      {x:720,y:155,w:200,h:40,kind:'deskRow',label:'ПАРТА'},
      {x:970,y:145,w:95,h:145,kind:'bookshelf',label:'СТЕЛЛАЖ'},
      {x:215,y:465,w:175,h:38,kind:'deskRow',label:'ПАРТА'},
      {x:540,y:490,w:175,h:38,kind:'deskRow',label:'ПАРТА'}
    ]
  },
  3:{
    name:'БИБЛИОТЕКА',
    palette:{bg:'#171b1d',tile1:'#23292b',tile2:'#2e3638',top:'#0f1214',accent:'#8fe16f',line:'#ffffff'},
    deco:'library',
    obstacles:[
      {x:110,y:165,w:100,h:155,kind:'bookshelf',label:'КНИГИ'},
      {x:325,y:150,w:95,h:150,kind:'bookshelf',label:'КНИГИ'},
      {x:560,y:170,w:175,h:36,kind:'table',label:'СТОЛ'},
      {x:835,y:150,w:105,h:155,kind:'bookshelf',label:'КНИГИ'},
      {x:1020,y:395,w:120,h:130,kind:'bookshelf',label:'КНИГИ'},
      {x:410,y:505,w:215,h:38,kind:'bench',label:'ЛАВКА'}
    ]
  },
  4:{
    name:'КОМП. КЛАСС',
    palette:{bg:'#151720',tile1:'#202635',tile2:'#2a3244',top:'#0d1118',accent:'#52f0ff',line:'#e8ffff'},
    deco:'computer',
    obstacles:[
      {x:140,y:170,w:165,h:48,kind:'computerDesk',label:'ПК'},
      {x:410,y:170,w:165,h:48,kind:'computerDesk',label:'ПК'},
      {x:690,y:170,w:165,h:48,kind:'computerDesk',label:'ПК'},
      {x:970,y:160,w:100,h:150,kind:'serverRack',label:'СЕРВЕР'},
      {x:295,y:470,w:195,h:46,kind:'computerDesk',label:'ПК'},
      {x:690,y:500,w:170,h:40,kind:'cabinet',label:'ТУМБА'}
    ]
  },
  5:{
    name:'СТОЛОВАЯ',
    palette:{bg:'#21181a',tile1:'#352729',tile2:'#463133',top:'#171012',accent:'#ff9c69',line:'#fff3eb'},
    deco:'cafeteria',
    obstacles:[
      {x:115,y:175,w:195,h:40,kind:'table',label:'СТОЛ'},
      {x:430,y:170,w:195,h:40,kind:'table',label:'СТОЛ'},
      {x:775,y:170,w:195,h:40,kind:'table',label:'СТОЛ'},
      {x:990,y:155,w:110,h:105,kind:'vending',label:'АВТОМАТ'},
      {x:210,y:475,w:215,h:42,kind:'table',label:'СТОЛ'},
      {x:625,y:505,w:230,h:36,kind:'counter',label:'РАЗДАЧА'}
    ]
  },
  6:{
    name:'СПОРТЗАЛ',
    palette:{bg:'#1b1915',tile1:'#2a261f',tile2:'#383328',top:'#12100d',accent:'#ffd54d',line:'#fff2c7'},
    deco:'gym',
    obstacles:[
      {x:120,y:160,w:160,h:58,kind:'mat',label:'МАТ'},
      {x:390,y:165,w:120,h:92,kind:'crate',label:'ИНВЕНТАРЬ'},
      {x:670,y:160,w:165,h:58,kind:'mat',label:'МАТ'},
      {x:970,y:145,w:95,h:145,kind:'locker',label:'ШКАФ'},
      {x:235,y:465,w:230,h:40,kind:'bench',label:'СКАМЬЯ'},
      {x:780,y:500,w:190,h:45,kind:'bench',label:'СКАМЬЯ'}
    ]
  },
  7:{
    name:'АКТОВЫЙ ЗАЛ',
    palette:{bg:'#1f1622',tile1:'#2d2030',tile2:'#39273d',top:'#140f16',accent:'#ff72b8',line:'#ffe4f4'},
    deco:'stage',
    obstacles:[
      {x:130,y:170,w:185,h:44,kind:'seatRow',label:'РЯД'},
      {x:420,y:165,w:185,h:44,kind:'seatRow',label:'РЯД'},
      {x:710,y:165,w:185,h:44,kind:'seatRow',label:'РЯД'},
      {x:980,y:150,w:105,h:150,kind:'speaker',label:'КОЛОНКА'},
      {x:250,y:500,w:175,h:44,kind:'piano',label:'ПИАНИНО'},
      {x:660,y:500,w:220,h:36,kind:'curtainBox',label:'РЕКВИЗИТ'}
    ]
  },
  8:{
    name:'СКЛАД',
    palette:{bg:'#181717',tile1:'#252323',tile2:'#302d2d',top:'#111010',accent:'#9eb0c0',line:'#f1f1f1'},
    deco:'storage',
    obstacles:[
      {x:105,y:160,w:110,h:90,kind:'crate',label:'ЯЩИКИ'},
      {x:285,y:160,w:110,h:150,kind:'bookshelf',label:'ПОЛКИ'},
      {x:475,y:170,w:125,h:85,kind:'crate',label:'ЯЩИКИ'},
      {x:700,y:145,w:105,h:160,kind:'bookshelf',label:'ПОЛКИ'},
      {x:940,y:160,w:130,h:95,kind:'crate',label:'ЯЩИКИ'},
      {x:360,y:485,w:220,h:42,kind:'bench',label:'ТЕЛЕЖКА'},
      {x:760,y:505,w:170,h:40,kind:'cabinet',label:'ШКАФ'}
    ]
  },
  9:{
    name:'БАССЕЙН',
    palette:{bg:'#131a20',tile1:'#1f2d38',tile2:'#2a3c4a',top:'#0c1015',accent:'#64d7ff',line:'#ecffff'},
    deco:'pool',
    obstacles:[
      {x:120,y:155,w:210,h:46,kind:'bench',label:'ШЕЗЛОНГ'},
      {x:410,y:145,w:115,h:125,kind:'locker',label:'ШКАФ'},
      {x:620,y:160,w:220,h:42,kind:'bench',label:'ЛАВКА'},
      {x:975,y:150,w:100,h:145,kind:'locker',label:'ШКАФ'},
      {x:225,y:495,w:175,h:36,kind:'table',label:'СТОЛИК'},
      {x:690,y:490,w:205,h:42,kind:'bench',label:'ЛАВКА'}
    ]
  },
  10:{
    name:'БОСС-АРЕНА',
    palette:{bg:'#120b13',tile1:'#21131f',tile2:'#2a1625',top:'#0d0d12',accent:'#ff315f',line:'#ffffff'},
    deco:'boss',
    obstacles:[
      {x:215,y:165,w:170,h:42,kind:'bench',label:'ПРЕГРАДА'},
      {x:885,y:165,w:170,h:42,kind:'bench',label:'ПРЕГРАДА'},
      {x:260,y:500,w:150,h:45,kind:'crate',label:'ЯЩИКИ'},
      {x:845,y:500,w:150,h:45,kind:'crate',label:'ЯЩИКИ'}
    ]
  }
};


levelThemes[11]={
 name:'АБСОЛЮТНОЕ ОТЧАЯНИЕ',
 palette:{bg:'#130913',tile1:'#241025',tile2:'#321331',top:'#0d050d',accent:'#ff2d8d',line:'#ffd3ea'},
 deco:'despair',
 obstacles:[{x:130,y:500,w:150,h:42,kind:'crate',label:'ОБЛОМКИ'},{x:1000,y:500,w:150,h:42,kind:'crate',label:'ОБЛОМКИ'},{x:525,y:550,w:190,h:38,kind:'bench',label:'БАРРИКАДА'}]
};

function getThemeForLevel(lvl){
  return levelThemes[lvl] || levelThemes[1];
}

function drawObstacle(o){
  ctx.save();
  ctx.translate(o.x,o.y);

  const wood='#8d654a', dark='#171414', metal='#6d7684', paper='#f2eddc';
  const main = currentTheme?.palette?.accent || '#7d2bd6';

  if(o.kind==='bench'){
    ctx.fillStyle='#7a5c47'; ctx.fillRect(8,10,o.w-16,12);
    ctx.fillRect(12,o.h-16,8,16); ctx.fillRect(o.w-20,o.h-16,8,16);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(8,10,o.w-16,12);
  }else if(o.kind==='deskRow' || o.kind==='table'){
    ctx.fillStyle='#9d7353'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#6b4e39'; ctx.fillRect(6,6,o.w-12,o.h-12);
    ctx.fillStyle='#4b3a2d'; ctx.fillRect(8,o.h-8,8,8); ctx.fillRect(o.w-16,o.h-8,8,8);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else if(o.kind==='teacherDesk' || o.kind==='counter'){
    ctx.fillStyle='#7f5a3e'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#a57954'; ctx.fillRect(0,0,o.w,10);
    ctx.fillStyle='#5d4330'; ctx.fillRect(12,18,26,o.h-28);
    ctx.fillRect(o.w-38,18,26,o.h-28);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else if(o.kind==='cabinet'){
    ctx.fillStyle='#a59fb1'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#8e879c'; ctx.fillRect(8,8,o.w-16,o.h-16);
    ctx.fillStyle=dark; ctx.fillRect(o.w-18,o.h/2-4,6,8);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else if(o.kind==='locker' || o.kind==='serverRack'){
    ctx.fillStyle=o.kind==='serverRack' ? '#2d3748' : '#9da6b3';
    ctx.fillRect(0,0,o.w,o.h);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
    ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=2;
    for(let x=0;x<o.w;x+=o.w/2){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,o.h); ctx.stroke(); }
    for(let y=18;y<o.h;y+=18){
      ctx.beginPath(); ctx.moveTo(8,y); ctx.lineTo(o.w-8,y); ctx.stroke();
    }
  }else if(o.kind==='bookshelf'){
    ctx.fillStyle='#6f4e37'; ctx.fillRect(0,0,o.w,o.h);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
    ctx.fillStyle='#9d7353';
    for(let y=18;y<o.h-10;y+=28){ ctx.fillRect(6,y,o.w-12,5); }
    const colors=['#d66767','#6aa5ff','#f1d36a','#7cd29e','#d39cff'];
    for(let y=5;y<o.h-20;y+=28){
      let xx=8;
      while(xx<o.w-12){
        const bw=Math.min(o.w-xx-8, 10+Math.floor((xx+y)%3)*6);
        ctx.fillStyle=colors[(xx+y)%colors.length];
        ctx.fillRect(xx,y,bw,18);
        xx+=bw+4;
      }
    }
  }else if(o.kind==='computerDesk'){
    ctx.fillStyle='#7a5b44'; ctx.fillRect(0,12,o.w,o.h-12);
    ctx.fillStyle='#5c4332'; ctx.fillRect(6,18,o.w-12,o.h-18);
    ctx.fillStyle='#2d4059'; ctx.fillRect(22,0,44,22);
    ctx.fillStyle='#59d1ff'; ctx.fillRect(28,6,32,10);
    ctx.fillStyle='#2d4059'; ctx.fillRect(o.w-66,0,44,22);
    ctx.fillStyle='#59d1ff'; ctx.fillRect(o.w-60,6,32,10);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,12,o.w,o.h-12);
  }else if(o.kind==='vending'){
    ctx.fillStyle='#8a4f58'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#d5f7ff'; ctx.fillRect(14,16,o.w-28,42);
    ctx.fillStyle='#ffffff'; ctx.fillRect(18,22,o.w-36,30);
    ctx.fillStyle='#633640'; ctx.fillRect(18,68,o.w-36,16);
    ctx.fillStyle='#2e2a2b'; ctx.fillRect(o.w-24,o.h-40,10,24);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else if(o.kind==='mat'){
    ctx.fillStyle='#d05c6f'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#f5a4a4'; ctx.fillRect(6,6,o.w-12,o.h-12);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else if(o.kind==='crate'){
    ctx.fillStyle='#8a6a45'; ctx.fillRect(0,0,o.w,o.h);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
    ctx.strokeStyle='#cba06b'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(8,8); ctx.lineTo(o.w-8,o.h-8); ctx.moveTo(o.w-8,8); ctx.lineTo(8,o.h-8); ctx.stroke();
  }else if(o.kind==='seatRow'){
    ctx.fillStyle='#a54469'; ctx.fillRect(0,12,o.w,o.h-12);
    ctx.fillStyle='#db7e9c'; ctx.fillRect(8,18,o.w-16,o.h-22);
    ctx.fillStyle='#7b2e49'; ctx.fillRect(12,0,o.w-24,16);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,12,o.w,o.h-12);
  }else if(o.kind==='speaker'){
    ctx.fillStyle='#2a2431'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#5b4d70'; ctx.fillRect(10,12,o.w-20,o.h-24);
    ctx.fillStyle='#1b1720'; ctx.beginPath(); ctx.arc(o.w/2,42,18,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(o.w/2,92,28,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else if(o.kind==='piano'){
    ctx.fillStyle='#2a2028'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#f5f5f5'; ctx.fillRect(10,18,o.w-20,14);
    for(let x=18;x<o.w-20;x+=16){ ctx.fillStyle='#111'; ctx.fillRect(x,18,8,9); }
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else if(o.kind==='curtainBox'){
    ctx.fillStyle='#5c2f54'; ctx.fillRect(0,0,o.w,o.h);
    ctx.fillStyle='#7d4372'; ctx.fillRect(8,8,o.w-16,o.h-16);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }else{
    ctx.fillStyle='#4b3c52'; ctx.fillRect(0,0,o.w,o.h);
    ctx.strokeStyle=dark; ctx.lineWidth=4; ctx.strokeRect(0,0,o.w,o.h);
  }

  if(o.label){
    ctx.fillStyle=main;
    ctx.font='900 11px Arial';
    ctx.textAlign='center';
    ctx.strokeStyle=dark; ctx.lineWidth=4;
    ctx.strokeText(o.label,o.w/2,o.h/2+4);
    ctx.fillText(o.label,o.w/2,o.h/2+4);
  }
  ctx.restore();
}

function drawThemeDeco(){
  if(!currentTheme) return;
  const p = currentTheme.palette;
  ctx.save();
  if(currentTheme.deco==='hall'){
    for(let x=40;x<W;x+=180){
      ctx.fillStyle='rgba(255,255,255,.05)'; ctx.fillRect(x,118,100,26);
      ctx.fillStyle='rgba(255,255,255,.14)'; ctx.fillRect(x+10,124,80,14);
    }
  }else if(currentTheme.deco==='class'){
    ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(930,112,260,34);
    ctx.fillStyle='#3d6b31'; ctx.fillRect(950,122,220,14);
  }else if(currentTheme.deco==='library'){
    ctx.fillStyle='rgba(255,255,255,.05)';
    for(let x=70;x<W;x+=210){ ctx.fillRect(x,116,110,22); }
  }else if(currentTheme.deco==='computer'){
    for(let x=85;x<W;x+=165){
      ctx.fillStyle='rgba(82,240,255,.08)'; ctx.fillRect(x,118,80,20);
      ctx.fillStyle='rgba(82,240,255,.17)'; ctx.fillRect(x+8,124,64,8);
    }
  }else if(currentTheme.deco==='cafeteria'){
    ctx.fillStyle='rgba(255,156,105,.12)'; ctx.fillRect(88,118,130,18);
    ctx.fillRect(1045,118,110,18);
  }else if(currentTheme.deco==='gym'){
    ctx.strokeStyle='rgba(255,213,77,.16)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(90,290); ctx.lineTo(W-90,290); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2,105); ctx.lineTo(W/2,H-20); ctx.stroke();
  }else if(currentTheme.deco==='stage'){
    ctx.fillStyle='rgba(255,114,184,.12)';
    ctx.fillRect(0,100,30,H-100); ctx.fillRect(W-30,100,30,H-100);
  }else if(currentTheme.deco==='storage'){
    ctx.fillStyle='rgba(255,255,255,.05)';
    for(let x=60;x<W;x+=240) ctx.fillRect(x,118,90,16);
  }else if(currentTheme.deco==='pool'){
    ctx.fillStyle='rgba(100,215,255,.09)';
    ctx.fillRect(65,118,W-130,22);
    ctx.strokeStyle='rgba(100,215,255,.2)';
    for(let x=80;x<W-80;x+=28){ ctx.beginPath(); ctx.moveTo(x,118); ctx.lineTo(x+10,140); ctx.stroke(); }
  }else if(currentTheme.deco==='boss'){
    ctx.strokeStyle='rgba(255,49,95,.18)';for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(0,150+i*70);ctx.lineTo(W,120+i*70);ctx.stroke()}
  }else if(currentTheme.deco==='despair'){
    ctx.strokeStyle='rgba(255,45,141,.23)';ctx.lineWidth=3;for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo((i*113+totalTime*28)%W,95);ctx.lineTo((i*197+180)%W,H);ctx.stroke()}
  }
  ctx.restore();
}


function kiiboBaseCooldown(){
  // Base: 15 seconds. Each "КИБО НА СВЯЗИ" stack makes it faster.
  return Math.max(7.5,15*Math.pow(.84,stats.kiibo));
}
function randomKiiboCooldown(){
  const base=kiiboBaseCooldown();
  // Tiny variance so it doesn't feel robotically identical every time.
  return rand(base-.45,base+.45);
}
function kiiboStunDuration(){
  return 1.75;
}
function setKiiboCooldown(v){
  kiiboCooldown=v;
  kiiboMaxCooldown=Math.max(.1,v);
}
function updateKiiboHud(){
  const startLevel=stats.kiibo>0?6:7;

  if(level===10){ui.kiiboText.textContent=`БОСС: выстрел каждые 10 энергии (${stageCoins}/60)`;ui.kiiboFill.style.width=`${Math.min(100,(stageCoins/60)*100)}%`;return}
  if(level===11){ui.kiiboText.textContent=junko?.rage?'СИГНАЛ КИБО ПОТЕРЯН · БЕГИ!':`10 энергии = выстрел · -10 HP Джунко`;ui.kiiboFill.style.width=junko?.rage?'0%':`${((stageCoins%10)/10)*100}%`;return}

  if(level<startLevel){
    ui.kiiboText.textContent=stats.kiibo>0
      ? 'Активируется с 6 уровня'
      : 'Активируется с 7 уровня';
    ui.kiiboFill.style.width='0%';
    return;
  }

  if(kiiboCutin){
    ui.kiiboText.textContent=`КИБО СТРЕЛЯЕТ — СТАН ${kiiboStunDuration().toFixed(2)}с`;
    ui.kiiboFill.style.width='100%';
    return;
  }

  if(kiiboCooldown<=0){
    ui.kiiboText.textContent=`Готов оглушить на ${kiiboStunDuration().toFixed(2)}с`;
    ui.kiiboFill.style.width='100%';
    return;
  }

  const pct=100*(1-kiiboCooldown/Math.max(.1,kiiboMaxCooldown));
  ui.kiiboText.textContent=`Через ${kiiboCooldown.toFixed(1)}с — стан ${kiiboStunDuration().toFixed(2)}с`;
  ui.kiiboFill.style.width=`${Math.max(0,Math.min(100,pct))}%`;
}
function stunPursuers(){
  const dur=kiiboStunDuration();let stunned=0;
  enemies.forEach(e=>{
    if(!e.alive)return;e.stun=Math.max(e.stun||0,dur);e.teleWarn=0;e.dashWarn=0;e.dash=0;stunned++;
    texts.push({text:'STUN!',x:e.x,y:e.y-58,life:.9,vy:-18});
  });
  guestEnemies.forEach(g=>{
    guestKnockback(g,player.x,player.y,285,dur,'kiibo');stunned++;
  });
  if(stunned){if(stageStats)stageStats.kiibo++;shake=Math.max(shake,12);toast(`КИБО: СТАН ${dur.toFixed(2)}с ⚡`,850)}
}


const portraits={
  shuichi:'assets/shuichi.webp',
  nagito:'assets/nagito.webp',
  kokichi:'assets/kokichi.webp',
  kiibo:'assets/kiibo_gunner.png',
  monokuma:'assets/monokuma_normal.webp',
  kaito:'assets/kaito_half.webp',
  maki:'assets/maki_half.webp',
  junko:'assets/junko_local_3.png',
  makoto:bonusCharacterUrls.makoto
};

const storyScenes={
  intro:[
    {s:'КИБО',p:'kiibo',t:'Проходы запечатаны барьерами отчаяния. Я могу пробить их, если ты соберёшь мне достаточно энергии.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Тогда собираем энергию и идём дальше. Я не собираюсь здесь оставаться.'},
    {s:'НАГИТО',p:'nagito',t:'Посмотрим, сколько продержится твоя надежда.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Столько, сколько потребуется.'}
  ],
  runner1:[
    {s:'КИБО',p:'kiibo',t:'Прямой путь разрушен. Придётся идти через город.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Понял. Показывай маршрут.'}
  ],
  kaitoRun:[
    {s:'КАЙТО',p:'kaito',t:'Шуичи! Не лезь дальше!'},
    {s:'ШУИЧИ',p:'shuichi',t:'Это говорит отчаяние, Кайто. Я тебя здесь не брошу.'}
  ],
  monokuma1:[
    {s:'МОНОКУМА',p:'monokuma',t:'Пухуху! Дальше только через меня!'},
    {s:'ШУИЧИ',p:'shuichi',t:'Кибо, готовь выстрел.'}
  ],
  makiRun:[
    {s:'МАКИ',p:'maki',t:'Развернись, Шуичи.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Нет. Я знаю, что это не настоящая ты.'}
  ],
  shooter1:[
    {s:'КИБО',p:'kiibo',t:'Обычным бегом это поле не пройти.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Тогда используем Пули Правды.'}
  ],
  runner2:[
    {s:'ШУИЧИ',p:'shuichi',t:'Впереди всё рушится. Машины, взрывы...'},
    {s:'КИБО',p:'kiibo',t:'Продолжай. Энергия всё ещё есть на маршруте.'}
  ],
  duo:[
    {s:'КАЙТО',p:'kaito',t:'На этот раз мы остановим тебя вместе!'},
    {s:'МАКИ',p:'maki',t:'Не заставляй нас догонять тебя.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Я всё равно пройду.'}
  ],
  monokuma2:[
    {s:'МОНОКУМА',p:'monokuma',t:'Пухуху! Раунд два!'},
    {s:'ШУИЧИ',p:'shuichi',t:'Давай уже покончим с этим.'}
  ],
  shooter2:[
    {s:'ШУИЧИ',p:'shuichi',t:'На этот раз придётся и стрелять, и прыгать.'},
    {s:'КИБО',p:'kiibo',t:'Я прикрою тебя.'}
  ],
  gauntlet:[
    {s:'НАГИТО',p:'nagito',t:'Ты почти дошёл. Самое подходящее время всё потерять.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Нет. Именно сейчас я не остановлюсь.'}
  ],
  beforeBoss:[
    {s:'КИБО',p:'kiibo',t:'Впереди последний крупный барьер.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Тогда пробиваем и его.'}
  ],
  afterHifumi:[
    {s:'КИБО',p:'kiibo',t:'Барьер уничтожен. Источник отчаяния прямо впереди.'},
    {s:'ШУИЧИ',p:'shuichi',t:'Хорошо. Идём до конца.'}
  ],
  epilogue:[
    {s:'ДЖУНКО',p:'junko',t:'Ха-ха-ха-ха! Какие же вы всё-таки никчёмные.'},
    {s:'ДЖУНКО',p:'junko',t:'Столько бежали. Столько надеялись. И всё ради чего?'},
    {s:'ДЖУНКО',p:'junko',t:'Кибо, Шуичи, ваша прекрасная надежда... всё оказалось бесполезным.'},
    {s:'ДЖУНКО',p:'junko',t:'Вы правда думали, что сможете выбраться из абсолютного отчаяния?'},
    {s:'ДЖУНКО',p:'junko',t:'Какой чудесный конец. Отчаяние победило.'}
  ]
};

function setBonusUi(on){
  ['hud','perkHud','itemHud','kiiboHud','bossHud','danger'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.style.display=on?'none':'';
  });
}

function renderStoryLine(){
  if(!storyState)return;
  const line=storyState.lines[storyState.i];
  ui.storySpeaker.textContent=line.s;
  ui.storyText.textContent=line.t;
  ui.storyPortraitFallback.textContent=(line.s||'?').slice(0,1);
  ui.storyPortrait.style.visibility='visible';
  ui.storyPortrait.onerror=()=>{ui.storyPortrait.style.visibility='hidden'};
  ui.storyPortrait.onload=()=>{ui.storyPortrait.style.visibility='visible'};
  ui.storyPortrait.src=portraits[line.p]||portraits.shuichi;
  ui.storyNextBtn.textContent=storyState.i===storyState.lines.length-1?'ПРОДОЛЖИТЬ ▶':'ДАЛЬШЕ ▶';
}

function showStory(lines,onDone){
  setBonusUi(true);
  mode='story';
  storyState={lines,i:0,onDone};
  ui.storyScreen.classList.add('show');
  renderStoryLine();
}

function advanceStory(){
  if(!storyState)return;
  if(storyState.i<storyState.lines.length-1){storyState.i++;renderStoryLine();return}
  const cb=storyState.onDone;storyState=null;ui.storyScreen.classList.remove('show');
  if(cb)cb();
}

function ensureLoop(){
  if(loopStarted)return;
  loopStarted=true;last=performance.now();requestAnimationFrame(loop);
}



function runnerGradient(x1,y1,x2,y2,stops){
  const g=ctx.createLinearGradient(x1,y1,x2,y2);
  stops.forEach(s=>g.addColorStop(s[0],s[1]));
  return g;
}

function runnerCarPalette(model,variant=0){
  if(model==='police')return {body1:'#f7f8fb',body2:'#b8c2d2',trim:'#20283a',glass:'#8fdaf7',accent:'#e53c5f'};
  if(model==='van')return {body1:'#586575',body2:'#2f3a47',trim:'#1b2027',glass:'#95bfd7',accent:'#d9b44a'};
  if(model==='sport')return {body1:'#d93d48',body2:'#7b1a23',trim:'#171a1f',glass:'#7fc8f2',accent:'#ffcf5d'};
  if(model==='suv')return {body1:'#697789',body2:'#39485a',trim:'#1c2028',glass:'#90c4dd',accent:'#d7dfe7'};
  if(model==='taxi')return {body1:'#f2c938',body2:'#9a6d10',trim:'#17150d',glass:'#9ed7eb',accent:'#0e0f12'};
  const alts=[
    {body1:'#4a7fe2',body2:'#27498f',trim:'#171a24',glass:'#9fd4ef',accent:'#dde6ef'},
    {body1:'#ba3d52',body2:'#6d1f30',trim:'#17141b',glass:'#9bd3ea',accent:'#f7dedf'},
    {body1:'#4eaa72',body2:'#26633c',trim:'#151a16',glass:'#9ad8e9',accent:'#dcefe5'}
  ];
  return alts[variant%alts.length];
}

function drawRoadTrash(o){
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(imgs.runnerTrash.complete&&imgs.runnerTrash.naturalWidth)ctx.drawImage(imgs.runnerTrash,o.x,o.y,o.w,o.h);
  ctx.imageSmoothingEnabled=true;ctx.restore();
}

function drawRunnerRamp(o){
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(imgs.runnerRamp.complete&&imgs.runnerRamp.naturalWidth)ctx.drawImage(imgs.runnerRamp,o.x,o.y,o.w,o.h);
  ctx.imageSmoothingEnabled=true;ctx.restore();
}

function drawRunnerPit(o,ground){
  ctx.save();ctx.imageSmoothingEnabled=false;
  const y=ground-o.h+4;
  if(imgs.runnerPit.complete&&imgs.runnerPit.naturalWidth)ctx.drawImage(imgs.runnerPit,o.x,y,o.w,o.h);
  ctx.imageSmoothingEnabled=true;
  ctx.font='900 12px Arial';ctx.textAlign='center';ctx.fillStyle='#ffd65a';ctx.strokeStyle='#111';ctx.lineWidth=4;
  ctx.strokeText('ЯМА',o.x+o.w/2,y-8);ctx.fillText('ЯМА',o.x+o.w/2,y-8);
  ctx.restore();
}

function drawRunnerWreck(o){
  ctx.save();ctx.imageSmoothingEnabled=false;
  if(imgs.runnerWreck.complete&&imgs.runnerWreck.naturalWidth)ctx.drawImage(imgs.runnerWreck,o.x,o.y,o.w,o.h);
  ctx.imageSmoothingEnabled=true;ctx.restore();
}

function drawRunnerBgExplosion(o){
  ctx.save();ctx.globalAlpha=o.alpha||.65;
  const wave=Math.sin((o.t||0)*7)*.03+1;
  ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(o.x,o.y+24,o.r*1.2,o.r*.36,0,0,Math.PI*2);ctx.fill();
  ctx.shadowColor='#ff9430';ctx.shadowBlur=25;
  for(let i=0;i<7;i++){
    const rr=o.r*(.42+i*.10)*wave;
    ctx.fillStyle=i<2?'#fff7c4':i<4?'#ffb530':'#ff5a23';
    ctx.beginPath();ctx.arc(o.x+Math.sin(i*1.8+o.t)*6,o.y-Math.cos(i*1.2+o.t)*4,rr,0,Math.PI*2);ctx.fill();
  }
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(55,57,65,.48)';
  for(const s of (o.smoke||[])){
    ctx.globalAlpha=(o.alpha||.65)*Math.max(0,s.life);
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function runnerCarModel(){
  // Both user-supplied pixel cars are now shorter than a normal full jump.
  // The hitbox covers the chassis/body only, NOT the whole visible sprite.
  if(Math.random()<.52){
    return{
      model:'orangePixel',
      img:imgs.runnerOrange,
      w:148,h:77,
      hit:{ix:25,it:32,ib:15}
    };
  }
  return{
    model:'greenPixel',
    img:imgs.runnerGreen,
    w:154,h:52,
    hit:{ix:23,it:20,ib:12}
  };
}

function drawRunnerWheel(x,y,r,spin){
  ctx.save();ctx.translate(x,y);ctx.rotate(spin);ctx.fillStyle='#08090b';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d0d3d7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r*.48,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle='#8a8f96';ctx.lineWidth=2;for(let i=0;i<4;i++){const a=i*Math.PI/2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*.42,Math.sin(a)*r*.42);ctx.stroke()}ctx.restore();
}

function drawRunnerCar(o){
  ctx.save();
  const y=o.y+Math.sin((o.wheel||0)*.10)*.8;
  ctx.fillStyle='rgba(0,0,0,.26)';
  ctx.beginPath();ctx.ellipse(o.x+o.w*.5,y+o.h+5,o.w*.42,6,0,0,Math.PI*2);ctx.fill();
  const im=o.img||(o.model==='greenPixel'?imgs.runnerGreen:imgs.runnerOrange);
  if(im&&im.complete&&im.naturalWidth){
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(im,o.x,y,o.w,o.h);
    ctx.imageSmoothingEnabled=true;
  }
  ctx.restore();
}

function drawRunnerExplosion(o){
  ctx.save();
  if(o.warn>0){
    const pulse=.55+.45*Math.sin(totalTime*16);
    ctx.globalAlpha=.24+.20*pulse;ctx.fillStyle='#ff6038';ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.strokeStyle='#ffd85b';ctx.lineWidth=5;ctx.setLineDash([12,8]);ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#ffd85b';ctx.strokeStyle='#111';ctx.lineWidth=5;ctx.font='900 13px Impact';ctx.textAlign='center';
    ctx.strokeText(`ВЗРЫВ ${Math.max(0,o.warn).toFixed(1)}с`,o.x,o.y-8);ctx.fillText(`ВЗРЫВ ${Math.max(0,o.warn).toFixed(1)}с`,o.x,o.y-8);
  }else{
    const age=o.age||0,sz=Math.max(38,92-age*58);
    ctx.imageSmoothingEnabled=false;
    if(imgs.runnerExplosion.complete&&imgs.runnerExplosion.naturalWidth){
      ctx.globalAlpha=Math.max(.42,1-age*.85);ctx.drawImage(imgs.runnerExplosion,o.x-sz/2,o.y-sz/2,sz,sz);
    }
    ctx.imageSmoothingEnabled=true;ctx.globalAlpha=1;
    ctx.strokeStyle='rgba(255,218,110,.68)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(o.x,o.y,o.r*(.42+age*.90),0,Math.PI*2);ctx.stroke();
  }
  for(const s of (o.smoke||[])){
    ctx.globalAlpha=Math.max(0,s.life);ctx.fillStyle=s.hot?'#6b5144':'#34363c';
    const q=Math.max(5,Math.round(s.r*1.3));ctx.fillRect(Math.round(s.x-q/2),Math.round(s.y-q/2),q,q);
  }
  ctx.restore();
}


function runnerLaneYs(){
  // First city runner: street + one upper route.
  // Second city runner: street + middle + high route.
  return bonus&&bonus.variant===2 ? [610,465,320] : [610,440];
}

function runnerLaneY(lane){
  const ys=runnerLaneYs();
  return ys[clamp(lane,0,ys.length-1)];
}

function runnerSetLane(lane){
  const ys=runnerLaneYs();
  bonus.lane=clamp(lane,0,ys.length-1);
  bonus.ground=ys[bonus.lane];
  if(bonus.grounded&&!bonus.climb)bonus.y=bonus.ground;
}

function runnerConnectorAtPlayer(dir){
  if(!bonus||bonus.climb)return null;

  const target=bonus.lane+dir;
  if(target<0||target>=runnerLaneYs().length)return null;

  return bonus.connectors.find(c=>{
    const connects=
      (c.from===bonus.lane&&c.to===target)||
      (c.to===bonus.lane&&c.from===target);

    return connects &&
      bonus.x>=c.x-30 &&
      bonus.x<=c.x+c.w+30;
  }) || null;
}

function runnerTryChangeLevel(dir){
  // Compatibility function kept for old bindings.
  // Vertical movement is now pure platforming:
  // SPACE jumps onto the next floor, holes let you fall down.
  if(
    mode!=='jumper' ||
    !bonus
  ){
    return false;
  }

  if(
    dir<0 &&
    bonus.grounded &&
    bonus.lane>0
  ){
    runnerDropToLowerFloor();
    return true;
  }

  return false;
}

function runnerSpawnConnector(){
  // Disabled in V29.
  // Floors are reached with a normal jump instead of W/S ladder interactions.
}

function drawRunnerConnector(c){
  // Old ladder visuals intentionally disabled.
}

function drawRunnerUpperLane(y,lane){
  const holes=
    bonus.holes
      .filter(h=>h.lane===lane)
      .sort((a,b)=>a.x-b.x);

  let cursor=0;

  for(const h of holes){
    const left=
      clamp(
        h.x,
        0,
        W
      );

    const right=
      clamp(
        h.x+h.w,
        0,
        W
      );

    if(left>cursor){
      drawRunnerPlatformSegment(
        cursor,
        left-cursor,
        y,
        lane
      );
    }

    if(
      right>0 &&
      left<W
    ){
      drawRunnerHole(h);
    }

    cursor=
      Math.max(
        cursor,
        right
      );
  }

  if(cursor<W){
    drawRunnerPlatformSegment(
      cursor,
      W-cursor,
      y,
      lane
    );
  }

  // Supports below the physical platform.
  ctx.save();

  ctx.fillStyle=
    'rgba(70,76,85,.66)';

  const below=
    runnerLaneY(lane-1);

  for(
    let x=
      ((-(bonus.t*bonus.speed*.38))%260);
    x<W;
    x+=260
  ){
    // Don't draw support inside a gap.
    if(
      !runnerIsHoleAt(
        lane,
        x+35,
        10
      )
    ){
      ctx.fillRect(
        x+30,
        y+27,
        9,
        Math.max(
          10,
          below-y-27
        )
      );
    }

    if(
      !runnerIsHoleAt(
        lane,
        x+103,
        10
      )
    ){
      ctx.fillRect(
        x+100,
        y+27,
        7,
        Math.max(
          10,
          below-y-27
        )
      );
    }
  }

  ctx.restore();
}

function runnerIsHoleAt(lane,x,margin=0){
  if(!bonus||lane<=0)return false;

  return bonus.holes.some(h=>
    h.lane===lane &&
    x+margin>h.x &&
    x-margin<h.x+h.w
  );
}

function runnerDropToLowerFloor(){
  if(!bonus||bonus.lane<=0)return;

  bonus.lane--;
  bonus.ground=runnerLaneY(bonus.lane);
  bonus.grounded=false;
  bonus.vy=Math.max(110,bonus.vy);
  bonus.y+=8;

  texts.push({
    text:'ПРОВАЛ ↓',
    x:bonus.x+24,
    y:bonus.y-78,
    life:.52,
    vy:-14
  });
}

function runnerLandOnPlatform(prevY,nextY){
  if(!bonus||bonus.vy<0)return false;

  const ys=runnerLaneYs();
  const candidates=[];

  // All elevated one-way platforms can be landed on from above.
  for(let lane=1;lane<ys.length;lane++){
    const py=ys[lane];

    if(
      prevY<=py &&
      nextY>=py &&
      !runnerIsHoleAt(lane,bonus.x,15)
    ){
      candidates.push({
        lane,
        y:py
      });
    }
  }

  // Bottom street is always a solid floor.
  if(
    prevY<=ys[0] &&
    nextY>=ys[0]
  ){
    candidates.push({
      lane:0,
      y:ys[0]
    });
  }

  if(!candidates.length)return false;

  // While falling downward, the first crossed floor is the smallest y.
  candidates.sort(
    (a,b)=>a.y-b.y
  );

  const hit=candidates[0];

  bonus.lane=hit.lane;
  bonus.ground=hit.y;
  bonus.y=hit.y;
  bonus.vy=0;
  bonus.grounded=true;

  texts.push({
    text:`ЭТАЖ ${hit.lane+1}`,
    x:bonus.x+26,
    y:bonus.y-84,
    life:.42,
    vy:-10
  });

  return true;
}

function runnerSpawnHole(){
  const ys=runnerLaneYs();

  if(ys.length<2)return;

  // Holes only exist on elevated floors.
  const lane=
    1+
    Math.floor(
      rand(
        0,
        ys.length-1
      )
    );

  const w=
    rand(
      bonus.variant===2?105:115,
      bonus.variant===2?145:155
    );

  // Avoid lining holes up vertically in the 3-floor runner.
  const x=W+130;

  const tooAligned=
    bonus.holes.some(
      h=>
        h.lane!==lane &&
        Math.abs(h.x-x)<170
    );

  if(tooAligned)return;

  bonus.holes.push({
    lane,
    x,
    w
  });
}

function drawRunnerPlatformSegment(x,w,y,lane){
  if(w<=0)return;

  ctx.save();

  // IMPORTANT: y is the TOP SURFACE.
  // Previously the slab was drawn above y, so objects looked detached.
  ctx.fillStyle=
    lane===1
      ? '#3d434d'
      : '#343946';

  ctx.fillRect(
    x,
    y,
    w,
    18
  );

  ctx.fillStyle='#171a20';

  ctx.fillRect(
    x,
    y+18,
    w,
    9
  );

  ctx.fillStyle='#7a8590';

  ctx.fillRect(
    x,
    y,
    w,
    4
  );

  ctx.fillStyle='#d5b94b';

  for(
    let stripe=
      x+
      ((-(bonus.t*bonus.speed*.65))%150);
    stripe<x+w;
    stripe+=150
  ){
    ctx.fillRect(
      stripe,
      y+21,
      72,
      3
    );
  }

  ctx.restore();
}

function drawRunnerHole(h){
  const y=runnerLaneY(h.lane);

  ctx.save();

  // Dark void below the broken floor.
  ctx.fillStyle='rgba(8,9,13,.82)';
  ctx.fillRect(
    h.x,
    y,
    h.w,
    28
  );

  // Broken bright edges make the gap impossible to miss.
  ctx.fillStyle='#ffca4c';
  ctx.strokeStyle='#111';
  ctx.lineWidth=3;

  for(const edge of [h.x,h.x+h.w]){
    ctx.beginPath();

    ctx.moveTo(
      edge,
      y-3
    );

    ctx.lineTo(
      edge+(edge===h.x?10:-10),
      y+7
    );

    ctx.lineTo(
      edge,
      y+14
    );

    ctx.lineTo(
      edge+(edge===h.x?8:-8),
      y+22
    );

    ctx.stroke();
  }

  ctx.font='900 10px Arial';
  ctx.textAlign='center';
  ctx.fillStyle='#ffd65a';
  ctx.strokeStyle='#111';
  ctx.lineWidth=4;

  ctx.strokeText(
    'ДЫРА',
    h.x+h.w/2,
    y-9
  );

  ctx.fillText(
    'ДЫРА',
    h.x+h.w/2,
    y-9
  );

  ctx.restore();
}

function runnerPlayerBox(){
  return{
    l:bonus.x-13,
    r:bonus.x+13,
    t:bonus.y-66,
    b:bonus.y-8
  };
}

function runnerRectHit(o,insetX=6,insetTop=8,insetBottom=4){
  const p=runnerPlayerBox();
  const l=o.x+insetX,r=o.x+o.w-insetX,t=o.y+insetTop,b=o.y+o.h-insetBottom;
  return p.r>l&&p.l<r&&p.b>t&&p.t<b;
}

function runnerObstacleWidth(o){
  if(!o)return 80;
  if(o.kind==='explosion')return 120;
  return o.w||80;
}

function runnerNextGapSeconds(o){
  // Still gives a large empty interval, but now only one route is blocked.
  const clearance=bonus.variant===2?425:375;

  let extra=0;

  if(o.kind==='car'||o.kind==='wreck')extra=55;
  else if(o.kind==='pit'||o.kind==='explosion')extra=35;

  return (runnerObstacleWidth(o)+clearance+extra)/bonus.speed;
}

function chooseRunnerHazard(){
  let kind;
  const r=Math.random();

  if(r<.27)kind='car';
  else if(r<.40)kind='wreck';
  else if(r<.57)kind='trash';
  else if(r<.72)kind='pit';
  else if(r<.89)kind='barrier';
  else kind='explosion';

  const heavy=['car','wreck'];

  if(
    heavy.includes(kind) &&
    heavy.includes(
      bonus.lastHazardKind
    )
  ){
    kind='trash';
  }

  const laneCount=
    runnerLaneYs().length;

  let lane=
    Math.floor(
      rand(
        0,
        laneCount
      )
    );

  // Street-only.
  if(
    kind==='car' ||
    kind==='wreck' ||
    kind==='pit'
  ){
    lane=0;
  }

  if(
    lane===bonus.lastHazardLane &&
    laneCount>1 &&
    kind!=='car' &&
    kind!=='wreck' &&
    kind!=='pit'
  ){
    lane=
      (lane+1)%
      laneCount;
  }

  const floorY=
    runnerLaneY(lane);

  let o;

  if(kind==='car'){
    const m=
      runnerCarModel();

    o={
      kind:'car',
      lane,
      model:m.model,
      img:m.img,
      x:W+145,
      y:floorY-m.h,
      w:m.w,
      h:m.h,
      hit:m.hit,
      wheel:rand(0,6)
    };

  }else if(kind==='wreck'){
    const h=64;

    o={
      kind:'wreck',
      lane,
      x:W+120,
      y:floorY-h,
      w:124,
      h
    };

  }else if(kind==='trash'){
    const h=64;

    o={
      kind:'trash',
      lane,
      x:W+110,
      y:floorY-h,
      w:48,
      h
    };

  }else if(kind==='pit'){
    o={
      kind:'pit',
      lane,
      x:W+125,
      y:floorY,
      w:118,
      h:56,
      armed:true
    };

  }else if(kind==='barrier'){
    const h=58;

    o={
      kind:'barrier',
      lane,
      x:W+115,
      y:floorY-h,
      w:72,
      h
    };

  }else{
    o={
      kind:'explosion',
      lane,
      x:W+125,
      y:floorY-30,
      floorY,
      w:118,
      warn:1.08,
      active:.44,
      age:0,
      r:61,
      dmgR:46,
      detonated:false,
      smoke:[]
    };
  }

  bonus.lastHazardKind=kind;
  bonus.lastHazardLane=lane;

  return o;
}

function startJumper(variant=1){
  setBonusUi(true);
  mode='jumper';
  currentStageType='runner';
  playMusic('normal');

  const lanes=
    variant===2
      ? [610,465,320]
      : [610,440];

  bonus={
    type:'jumper',
    variant,
    t:0,
    goal:variant===2?11:8,
    collected:0,
    lives:specialMaxLives(3),
    maxLives:specialMaxLives(3),

    x:220,
    y:lanes[0],
    vy:0,
    ground:lanes[0],
    grounded:true,
    lane:0,

    inv:0,
    speed:variant===2?340:300,

    spawnHaz:1.25,
    spawnEnergy:.35,
    spawnBgFx:1.2,
    spawnHole:1.65,

    lastHazardKind:null,
    lastHazardLane:-1,

    holes:[],
    connectors:[],
    bgFx:[],
    objects:[],
    finished:false
  };

  shooterMouse.active=false;

  toast(
    `ЭТАП ${campaignStage}/20 · SPACE — ПРЫЖОК НА ВЕРХНИЙ ЭТАЖ`,
    1800
  );

  setTimeout(()=>{
    if(mode==='jumper'){
      showSpecialPerkToast();
    }
  },450);
}

function bonusJump(){
  if(
    mode!=='jumper' ||
    !bonus
  ){
    return;
  }

  if(bonus.grounded){
    // Approx 200px jump height.
    // Floor gaps are 170px / 145px, so one clean SPACE jump reaches the next floor.
    bonus.vy=-800*specialJumpMul();
    bonus.grounded=false;

    play(
      sounds.shot,
      .10
    );
  }
}

function resetJumperAttempt(){
  recordDeath('runner');
  const lanes=runnerLaneYs();

  bonus.lives=bonus.maxLives||specialMaxLives(3);
  bonus.collected=
    Math.max(
      0,
      bonus.collected-1
    );

  bonus.lane=0;
  bonus.ground=lanes[0];
  bonus.y=lanes[0];
  bonus.vy=0;
  bonus.grounded=true;
  bonus.inv=1.35;

  bonus.objects=[];
  bonus.holes=[];
  bonus.connectors=[];
  bonus.bgFx=[];

  bonus.spawnHaz=1.35;
  bonus.spawnEnergy=.28;
  bonus.spawnBgFx=.8;
  bonus.spawnHole=1.15;

  bonus.lastHazardKind=null;
  bonus.lastHazardLane=-1;

  toast(
    'SPACE — ПРЫЖОК НА ЭТАЖ · ДЫРЫ МОЖНО ПЕРЕПРЫГНУТЬ.',
    1250
  );
}

function finishJumper(){
  if(!bonus||bonus.finished)return;recordStageComplete(campaignStage,'EX');bonus.finished=true;xp+=260+bonus.variant*50;setBonusUi(false);bonus=null;startCampaignStage(campaignStage+1);
}

function updateJumper(dt){
  if(!bonus)return;

  bonus.t+=dt;
  bonus.inv=Math.max(0,bonus.inv-dt);

  bonus.spawnHaz-=dt;
  bonus.spawnEnergy-=dt;
  bonus.spawnBgFx-=dt;
  bonus.spawnHole-=dt;

  // Spawn real gaps in elevated floors.
  if(bonus.spawnHole<=0){
    runnerSpawnHole();

    bonus.spawnHole=
      rand(
        bonus.variant===2?2.05:2.35,
        bonus.variant===2?2.80:3.15
      );
  }

  if(bonus.spawnBgFx<=0){
    const bg={
      x:W+rand(90,240),
      y:610-rand(110,205),
      r:rand(26,42),
      t:0,
      alpha:rand(.38,.72),
      smoke:[]
    };

    for(let k=0;k<10;k++){
      bg.smoke.push({
        x:bg.x+rand(-15,15),
        y:bg.y-rand(0,22),
        r:rand(10,18),
        life:rand(.45,1.0),
        vx:rand(-8,18),
        vy:rand(-28,-10)
      });
    }

    bonus.bgFx.push(bg);

    bonus.spawnBgFx=
      rand(1.2,2.1);
  }

  if(bonus.spawnHaz<=0){
    const hazard=
      chooseRunnerHazard();

    bonus.objects.push(hazard);

    bonus.spawnHaz=
      runnerNextGapSeconds(hazard)+
      rand(.22,.42);
  }

  if(bonus.spawnEnergy<=0){
    const lane=
      Math.floor(
        rand(
          0,
          runnerLaneYs().length
        )
      );

    bonus.objects.push({
      kind:'energy',
      lane,
      x:W+80,
      y:runnerLaneY(lane)-rand(55,92),
      r:16,
      bob:rand(0,6.28)
    });

    bonus.spawnEnergy=
      rand(.58,.88);
  }

  // World scroll.
  for(const h of bonus.holes){
    h.x-=bonus.speed*dt;
  }

  bonus.holes=
    bonus.holes.filter(
      h=>h.x+h.w>-100
    );

  for(const bg of bonus.bgFx){
    bg.x-=bonus.speed*dt*.36;
    bg.t+=dt;

    for(const s of bg.smoke){
      s.life-=dt*.24;
      s.x+=s.vx*dt;
      s.y+=s.vy*dt;
      s.vx*=Math.pow(.25,dt);
      s.vy-=4*dt;
      s.r+=dt*5;
    }

    bg.smoke=
      bg.smoke.filter(
        s=>s.life>0
      );
  }

  bonus.bgFx=
    bonus.bgFx.filter(
      bg=>bg.x>-180
    );

  // If a moving floor gap reaches Shuichi's feet, he really falls.
  if(
    bonus.grounded &&
    bonus.lane>0 &&
    runnerIsHoleAt(
      bonus.lane,
      bonus.x,
      11
    )
  ){
    runnerDropToLowerFloor();
  }

  // Physics.
  const prevY=bonus.y;

  if(!bonus.grounded){
    bonus.vy+=1600*dt;
    bonus.y+=bonus.vy*dt;

    runnerLandOnPlatform(
      prevY,
      bonus.y
    );
  }

  const p=
    runnerPlayerBox();

  for(
    let i=bonus.objects.length-1;
    i>=0;
    i--
  ){
    const o=
      bonus.objects[i];

    o.x-=bonus.speed*dt;

    if(o.kind==='energy'){
      o.bob+=dt*6;

      if(
        Math.hypot(
          bonus.x-o.x,
          (bonus.y-40)-o.y
        )<specialEnergyRadius(28)
      ){
        bonus.objects.splice(i,1);

        const gain=
          specialEnergyGain();

        bonus.collected+=gain;
        campaignStats.energy+=gain;
        xp+=22*gain;

        play(
          sounds.coin,
          .48
        );

        texts.push({
          text:'ЭНЕРГИЯ +1',
          x:bonus.x+25,
          y:bonus.y-95,
          life:.75,
          vy:-25
        });

        if(
          bonus.collected>=
          bonus.goal
        ){
          finishJumper();
          return;
        }

        continue;
      }

    }else if(o.kind==='car'){
      o.wheel=
        (o.wheel||0)+
        dt*bonus.speed*.12;

      const hb=
        o.hit||
        {
          ix:24,
          it:30,
          ib:13
        };

      const hit=
        runnerRectHit(
          o,
          hb.ix,
          hb.it,
          hb.ib
        );

      if(
        hit &&
        bonus.inv<=0
      ){
        bonus.inv=1;
        bonus.lives--;
        bonus.vy=-470;
        bonus.grounded=false;

        shake=
          Math.max(
            shake,
            13
          );

        play(
          sounds.bad,
          .68
        );

        texts.push({
          text:'МАШИНА!',
          x:bonus.x,
          y:bonus.y-95,
          life:.72,
          vy:-27
        });

        if(bonus.lives<=0){
          resetJumperAttempt();
          return;
        }
      }

    }else if(o.kind==='wreck'){
      if(
        runnerRectHit(
          o,20,23,12
        ) &&
        bonus.inv<=0
      ){
        bonus.inv=1;
        bonus.lives--;
        bonus.vy=-455;
        bonus.grounded=false;

        play(
          sounds.bad,
          .65
        );

        texts.push({
          text:'РАЗБИТАЯ ТАЧКА!',
          x:bonus.x,
          y:bonus.y-94,
          life:.70,
          vy:-25
        });

        if(bonus.lives<=0){
          resetJumperAttempt();
          return;
        }
      }

    }else if(o.kind==='trash'){
      if(
        runnerRectHit(
          o,12,20,10
        ) &&
        bonus.inv<=0
      ){
        bonus.inv=.95;
        bonus.lives--;
        bonus.vy=-430;
        bonus.grounded=false;

        play(
          sounds.bad,
          .60
        );

        texts.push({
          text:'МУСОРКА!',
          x:bonus.x,
          y:bonus.y-92,
          life:.68,
          vy:-24
        });

        if(bonus.lives<=0){
          resetJumperAttempt();
          return;
        }
      }

    }else if(o.kind==='barrier'){
      if(
        runnerRectHit(
          o,13,15,10
        ) &&
        bonus.inv<=0
      ){
        bonus.inv=.95;
        bonus.lives--;
        bonus.vy=-430;
        bonus.grounded=false;

        play(
          sounds.bad,
          .60
        );

        texts.push({
          text:'БАРЬЕР!',
          x:bonus.x,
          y:bonus.y-92,
          life:.68,
          vy:-24
        });

        if(bonus.lives<=0){
          resetJumperAttempt();
          return;
        }
      }

    }else if(o.kind==='pit'){
      // Pits only exist on the street.
      const overPit=
        bonus.grounded &&
        bonus.lane===0 &&
        bonus.x>o.x+34 &&
        bonus.x<o.x+o.w-34;

      if(
        overPit &&
        bonus.inv<=0 &&
        o.armed
      ){
        o.armed=false;
        bonus.inv=1.05;
        bonus.lives--;
        bonus.vy=-390;
        bonus.grounded=false;

        play(
          sounds.bad,
          .60
        );

        texts.push({
          text:'ПРОВАЛ!',
          x:bonus.x,
          y:bonus.y-92,
          life:.74,
          vy:-25
        });

        if(bonus.lives<=0){
          resetJumperAttempt();
          return;
        }
      }

    }else if(o.kind==='explosion'){
      if(o.warn>0){
        o.warn-=dt;

        if(
          o.warn<=0 &&
          !o.detonated
        ){
          o.detonated=true;
          o.age=0;

          shake=
            Math.max(
              shake,
              10
            );

          for(let k=0;k<24;k++){
            const a=
              rand(
                0,
                Math.PI*2
              );

            const sp=
              rand(
                30,
                150
              );

            o.smoke.push({
              x:o.x+rand(-10,10),
              y:o.y+rand(-8,8),
              vx:Math.cos(a)*sp,
              vy:Math.sin(a)*sp-rand(20,75),
              r:rand(5,12),
              life:rand(.5,.95),
              hot:k<8
            });
          }
        }

      }else{
        o.age+=dt;
        o.active-=dt;

        if(
          o.active>0 &&
          bonus.inv<=0 &&
          Math.hypot(
            bonus.x-o.x,
            (bonus.y-36)-o.y
          )<o.dmgR
        ){
          bonus.inv=1;
          bonus.lives--;
          bonus.vy=-470;
          bonus.grounded=false;

          play(
            sounds.bad,
            .76
          );

          texts.push({
            text:'ВЗРЫВ!',
            x:bonus.x,
            y:bonus.y-96,
            life:.78,
            vy:-28
          });

          if(bonus.lives<=0){
            resetJumperAttempt();
            return;
          }
        }
      }

      for(const s of o.smoke){
        s.life-=dt*.65;
        s.x+=s.vx*dt;
        s.y+=s.vy*dt;
        s.vx*=Math.pow(.10,dt);
        s.vy-=15*dt;
        s.r+=dt*10;
      }

      o.smoke=
        o.smoke.filter(
          s=>s.life>0
        );

      if(
        o.warn<=0 &&
        o.active<=0 &&
        !o.smoke.length
      ){
        bonus.objects.splice(i,1);
        continue;
      }
    }

    if(
      o.x<-260 &&
      o.kind!=='explosion'
    ){
      bonus.objects.splice(i,1);
    }
  }

  updateFx(dt);
}

function drawJumper(){
  if(!bonus)return;

  ctx.save();

  const night=
    bonus.variant===2;

  const sky=
    ctx.createLinearGradient(
      0,0,0,H
    );

  sky.addColorStop(
    0,
    night?'#060912':'#16253f'
  );

  sky.addColorStop(
    .55,
    night?'#1a1732':'#364f7a'
  );

  sky.addColorStop(
    1,
    night?'#331426':'#7f4c53'
  );

  ctx.fillStyle=sky;
  ctx.fillRect(0,0,W,H);

  for(let i=0;i<18;i++){
    const bw=
      70+(i%4)*28;

    const bh=
      140+(i%5)*44;

    const x=
      (
        (
          i*122-
          bonus.t*
          (night?85:64)
        )%
        (W+300)
      )-140;

    const y=
      610-140-bh;

    ctx.fillStyle=
      i%2
        ? (
            night
              ? '#141927'
              : '#2f3d5a'
          )
        : (
            night
              ? '#0f131c'
              : '#24334c'
          );

    ctx.fillRect(
      x,y,bw,bh
    );

    for(
      let wy=y+18;
      wy<y+bh-18;
      wy+=28
    ){
      for(
        let wx=x+12;
        wx<x+bw-10;
        wx+=22
      ){
        ctx.fillStyle=
          (
            (
              i+
              Math.floor(wy/28)+
              Math.floor(wx/24)
            )%4===0
          )
            ? '#ffd76a'
            : 'rgba(110,210,255,.12)';

        ctx.fillRect(
          wx,wy,8,12
        );
      }
    }
  }

  for(const bg of bonus.bgFx){
    drawRunnerBgExplosion(bg);
  }

  // Street surface: top exactly y=610.
  ctx.fillStyle='#3a3d44';
  ctx.fillRect(0,472,W,138);

  ctx.fillStyle='#22252b';
  ctx.fillRect(0,504,W,18);

  ctx.fillStyle='#efd15e';
  ctx.fillRect(0,603,W,7);

  ctx.fillStyle='#111216';
  ctx.fillRect(0,610,W,H-610);

  for(
    let x=
      ((-(bonus.t*bonus.speed))%190);
    x<W;
    x+=190
  ){
    ctx.fillStyle='#ececec';

    ctx.fillRect(
      x,
      657,
      104,
      7
    );
  }

  const ys=
    runnerLaneYs();

  for(
    let lane=1;
    lane<ys.length;
    lane++
  ){
    drawRunnerUpperLane(
      ys[lane],
      lane
    );
  }

  // Obstacles.
  for(const o of bonus.objects){
    if(o.kind==='energy'){
      drawEnergyCell({
        x:o.x,
        y:o.y+
          Math.sin(o.bob)*5,
        rot:bonus.t,
        pulse:o.bob,
        bad:false,
        golden:false
      });

    }else if(o.kind==='car'){
      drawRunnerCar(o);

    }else if(o.kind==='wreck'){
      drawRunnerWreck(o);

    }else if(o.kind==='trash'){
      drawRoadTrash(o);

    }else if(o.kind==='pit'){
      drawRunnerPit(
        o,
        runnerLaneY(o.lane)
      );

    }else if(o.kind==='barrier'){
      ctx.save();

      ctx.imageSmoothingEnabled=false;

      if(
        imgs.runnerBarrier.complete &&
        imgs.runnerBarrier.naturalWidth
      ){
        ctx.drawImage(
          imgs.runnerBarrier,
          o.x,
          o.y,
          o.w,
          o.h
        );
      }

      ctx.imageSmoothingEnabled=true;

      ctx.restore();

    }else if(o.kind==='explosion'){
      drawRunnerExplosion(o);
    }
  }

  ctx.save();

  ctx.globalAlpha=
    bonus.inv>0 &&
    Math.floor(
      bonus.inv*12
    )%2
      ? .35
      : 1;

  drawSprite(
    imgs.shuichi,
    bonus.x,
    bonus.y,
    112,
    'ШУИЧИ',
    '#8fefff'
  );

  ctx.restore();

  ctx.fillStyle='#111';
  ctx.fillRect(18,18,710,86);

  ctx.strokeStyle='#71eaff';
  ctx.lineWidth=4;

  ctx.strokeRect(
    18,18,710,86
  );

  ctx.fillStyle='#fff';
  ctx.font='900 28px Impact';

  ctx.fillText(
    `ЭТАП ${campaignStage}/20 // ПЛАТФОРМЕР: ${ys.length} ЭТАЖА`,
    36,51
  );

  ctx.font='900 17px Arial';
  ctx.fillStyle='#71eaff';

  ctx.fillText(
    `ЭНЕРГИЯ ${bonus.collected}/${bonus.goal}   ЖИЗНИ ${'♥'.repeat(bonus.lives)}   ЭТАЖ ${bonus.lane+1}/${ys.length}`,
    36,80
  );

  ctx.font='900 14px Arial';
  ctx.fillStyle='#fff';

  ctx.fillText(
    'SPACE — ПРЫЖОК / ЗАПРЫГНУТЬ НА ЭТАЖ · ДЫРЫ — СПУСК',
    W-530,
    44
  );

  drawFx();

  ctx.restore();
}

function startShooter(variant=1){
  setBonusUi(true);
  mode='shooter';
  currentStageType='shooter';
  playMusic('normal');

  const hp=
    specialMaxLives(4);

  bonus={
    type:'shooter',
    variant,
    t:0,
    goal:variant===2?16:12,
    score:0,
    hp,
    maxHp:hp,
    x:W/2,
    y:H-76,
    ground:H-76,
    vy:0,
    grounded:true,
    inv:0,
    fireCd:0,
    spawnCd:.35,
    bullets:[],
    enemyBullets:[],
    targets:[],
    finished:false
  };

  shooterMouse={
    x:W/2,
    y:210,
    active:false
  };

  toast(
    `ЭТАП ${campaignStage}/20 · TRUTH BULLET · SPACE / ЛКМ-F`,
    1800
  );

  setTimeout(()=>{
    if(mode==='shooter'){
      showSpecialPerkToast();
    }
  },450);
}

function shooterShoot(){
  if(mode!=='shooter'||!bonus||bonus.fireCd>0)return;bonus.fireCd=bonus.variant===2?.13:.16;const tx=shooterMouse.active?shooterMouse.x:bonus.x,ty=shooterMouse.active?shooterMouse.y:100;let dx=tx-bonus.x,dy=ty-(bonus.y-42),l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;bonus.bullets.push({x:bonus.x,y:bonus.y-46,vx:dx*800,vy:dy*800,r:6,life:1.8});play(sounds.shot,.30);
}
function shooterJump(){if(mode!=='shooter'||!bonus||!bonus.grounded)return;bonus.vy=-610*specialJumpMul();bonus.grounded=false}

function shooterTargetImage(kind){
  if(kind==='kaito')return bonusImgs.kaito;
  if(kind==='maki')return bonusImgs.maki;
  if(kind==='nagito')return imgs.nagito;
  return imgs.kokichi;
}

function spawnShooterTarget(){
  const types=['kaito','maki','kaito','maki','nagito','kokichi'];
  const kind=types[Math.floor(rand(0,types.length))];
  const names={kaito:'КАЙТО',maki:'МАКИ',nagito:'НАГИТО',kokichi:'КОКИЧИ'};
  bonus.targets.push({
    kind,name:names[kind],x:rand(100,W-100),y:rand(105,190),targetY:rand(210,390),
    vx:rand(-55,55),hp:kind==='kaito'||kind==='maki'?3:2,maxHp:kind==='kaito'||kind==='maki'?3:2,
    shootCd:rand(1.0,2.0),phase:rand(0,6.28),r:29
  });
}

function resetShooterAttempt(){
  recordDeath('shooter');
  bonus.hp=bonus.maxHp||specialMaxLives(4);bonus.score=Math.max(0,bonus.score-2);bonus.x=W/2;bonus.y=bonus.ground;bonus.vy=0;bonus.grounded=true;bonus.inv=1.5;bonus.bullets=[];bonus.enemyBullets=[];bonus.targets=[];bonus.spawnCd=.45;toast('ОТЧАЯНИЕ ОТБРОСИЛО ТЕБЯ НАЗАД. ПРОДОЛЖАЙ.',1100);
}

function finishShooter(){
  if(!bonus||bonus.finished)return;recordStageComplete(campaignStage,'EX');bonus.finished=true;xp+=330+bonus.variant*70;setBonusUi(false);bonus=null;startCampaignStage(campaignStage+1);
}

function updateShooter(dt){
  if(!bonus)return;bonus.t+=dt;bonus.inv=Math.max(0,bonus.inv-dt);bonus.fireCd=Math.max(0,bonus.fireCd-dt);bonus.spawnCd-=dt;
  let move=0;if(keys.KeyA||keys.ArrowLeft)move--;if(keys.KeyD||keys.ArrowRight)move++;bonus.x=clamp(bonus.x+move*(bonus.variant===2?380:345)*specialMoveMul()*dt,45,W-45);
  bonus.vy+=1450*dt;bonus.y+=bonus.vy*dt;if(bonus.y>=bonus.ground){bonus.y=bonus.ground;bonus.vy=0;bonus.grounded=true}
  const maxTargets=bonus.variant===2?6:5;if(bonus.spawnCd<=0&&bonus.targets.length<maxTargets){spawnShooterTarget();bonus.spawnCd=rand(bonus.variant===2?.55:.75,bonus.variant===2?.9:1.15)}
  for(let i=bonus.bullets.length-1;i>=0;i--){const b=bonus.bullets[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;let hit=false;for(let j=bonus.targets.length-1;j>=0;j--){const e=bonus.targets[j];if(Math.hypot(b.x-e.x,b.y-e.y)<b.r+e.r){e.hp--;hit=true;shake=Math.max(shake,4);particles.push({kind:'spark',x:b.x,y:b.y,vx:rand(-90,90),vy:rand(-90,90),life:.35,size:5});if(e.hp<=0){bonus.targets.splice(j,1);bonus.score++;xp+=30;play(sounds.coin,.45);texts.push({text:'ОТЧАЯНИЕ СНЯТО',x:e.x,y:e.y-50,life:.8,vy:-24});if(bonus.score>=bonus.goal){finishShooter();return}}break}}if(hit||b.life<=0||b.x<0||b.x>W||b.y<0||b.y>H)bonus.bullets.splice(i,1)}
  for(let i=bonus.targets.length-1;i>=0;i--){const e=bonus.targets[i];e.phase+=dt*2;if(e.y<e.targetY)e.y+=85*dt;e.x+=e.vx*dt+Math.sin(e.phase)*24*dt;if(e.x<55||e.x>W-55)e.vx*=-1;e.shootCd-=dt;if(e.shootCd<=0){let dx=bonus.x-e.x,dy=(bonus.y-35)-e.y,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const sp=bonus.variant===2?270:230;bonus.enemyBullets.push({x:e.x,y:e.y+20,vx:dx*sp,vy:dy*sp,r:10,life:5});e.shootCd=rand(bonus.variant===2?.85:1.2,bonus.variant===2?1.55:2.25)}}
  for(let i=bonus.enemyBullets.length-1;i>=0;i--){const b=bonus.enemyBullets[i],ox=b.x,oy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(bonus.inv<=0&&segmentCircleHit(ox,oy,b.x,b.y,bonus.x,bonus.y-35,b.r+22)){bonus.enemyBullets.splice(i,1);if(specialAvoidHit()){bonus.inv=.35;toast('АНТИ-СБОЙ: УКЛОНЕНИЕ',450);continue}bonus.hp--;bonus.inv=.8;shake=Math.max(shake,12);play(sounds.bad,.65);texts.push({text:'DESPAIR HIT',x:bonus.x,y:bonus.y-90,life:.7,vy:-25});if(bonus.hp<=0){resetShooterAttempt();return}continue}if(b.life<=0||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30)bonus.enemyBullets.splice(i,1)}
  updateFx(dt);
}

function drawShooterTarget(e){
  const im=shooterTargetImage(e.kind);
  ctx.save();ctx.translate(e.x,e.y);
  ctx.globalAlpha=.22+.08*Math.sin(bonus.t*7+e.phase);ctx.fillStyle='#ff2d8d';ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  if(im&&im.complete&&im.naturalWidth){
    const h=125,w=h*im.naturalWidth/im.naturalHeight;ctx.drawImage(im,-w/2,-h/2-18,w,h);
  }else{
    ctx.fillStyle=e.kind==='kaito'?'#51356d':e.kind==='maki'?'#6e2934':'#333';ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.fillRect(-30,-52,60,92);ctx.strokeRect(-30,-52,60,92);
    ctx.fillStyle='#fff';ctx.font='900 28px Impact';ctx.textAlign='center';ctx.fillText(e.name[0],0,5);
  }
  ctx.fillStyle='#111';ctx.fillRect(-31,48,62,9);ctx.fillStyle='#ff2d8d';ctx.fillRect(-31,48,62*(e.hp/e.maxHp),9);
  ctx.font='900 12px Arial';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.fillStyle='#fff';ctx.strokeText(e.name,0,72);ctx.fillText(e.name,0,72);ctx.restore();
}

function drawShooter(){
  if(!bonus)return;ctx.save();ctx.fillStyle=bonus.variant===2?'#090b13':'#0c1019';ctx.fillRect(0,0,W,H);for(let i=0;i<22;i++){ctx.strokeStyle=i%2?'rgba(113,229,255,.10)':'rgba(255,45,141,.08)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(i*70,0);ctx.lineTo(W/2,H);ctx.stroke()}ctx.fillStyle='#151521';ctx.fillRect(0,H-120,W,120);ctx.fillStyle='#71e5ff';ctx.fillRect(0,H-122,W,3);
  bonus.targets.forEach(drawShooterTarget);for(const b of bonus.bullets){ctx.save();ctx.fillStyle='#fff';ctx.shadowColor='#71e5ff';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.restore()}for(const b of bonus.enemyBullets){ctx.save();ctx.fillStyle='#ff2d8d';ctx.shadowColor='#ff2d8d';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.restore()}
  ctx.save();ctx.globalAlpha=bonus.inv>0&&Math.floor(bonus.inv*12)%2?.35:1;drawSprite(imgs.shuichi,bonus.x,bonus.y,112,'ШУИЧИ','#8fefff');ctx.restore();
  const ax=shooterMouse.active?shooterMouse.x:bonus.x,ay=shooterMouse.active?shooterMouse.y:120;ctx.save();ctx.strokeStyle='#d9ff66';ctx.lineWidth=3;ctx.beginPath();ctx.arc(ax,ay,16,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(ax-24,ay);ctx.lineTo(ax+24,ay);ctx.moveTo(ax,ay-24);ctx.lineTo(ax,ay+24);ctx.stroke();ctx.restore();
  ctx.fillStyle='#111';ctx.fillRect(18,18,610,82);ctx.strokeStyle='#71e5ff';ctx.lineWidth=4;ctx.strokeRect(18,18,610,82);ctx.fillStyle='#fff';ctx.font='900 28px Impact';ctx.fillText(`ЭТАП ${campaignStage}/20 // TRUTH BULLET`,36,51);ctx.font='900 18px Arial';ctx.fillStyle='#71e5ff';ctx.fillText(`ОСВОБОЖДЕНО ${bonus.score}/${bonus.goal}    HP ${'♥'.repeat(bonus.hp)}`,36,80);ctx.font='900 14px Arial';ctx.fillStyle='#fff';ctx.fillText('A/D — ДВИЖЕНИЕ · SPACE — ПРЫЖОК · ЛКМ/F — СТРЕЛЬБА',W-505,45);drawFx();ctx.restore();
}

function advanceAfterPerk(justFinished){
  if(justFinished===3){showStory(storyScenes.beforeJumper,()=>startJumper());return}
  if(justFinished===6){showStory(storyScenes.beforeShooter,()=>startShooter());return}
  if(justFinished===9){showStory(storyScenes.beforeBoss,()=>{level=10;mode='playing';resetStage();last=performance.now()});return}
  level=justFinished+1;mode='playing';resetStage();last=performance.now();
}



const campaignPlan={
  1:{type:'chase',base:1,goal:8},
  2:{type:'chase',base:2,goal:9},
  3:{type:'chase',base:3,goal:10},
  4:{type:'runner',variant:1,story:'runner1'},
  5:{type:'chase',base:4,goal:11},
  6:{type:'chase',base:5,goal:12,guests:['kaito'],story:'kaitoRun'},
  7:{type:'monokuma',variant:1,story:'monokuma1'},
  8:{type:'chase',base:6,goal:13,guests:['maki'],story:'makiRun'},
  9:{type:'shooter',variant:1,story:'shooter1'},
  10:{type:'chase',base:7,goal:14},
  11:{type:'chase',base:8,goal:15,guests:['kaito']},
  12:{type:'chase',base:9,goal:16,guests:['maki']},
  13:{type:'runner',variant:2,story:'runner2'},
  14:{type:'chase',base:8,goal:17,guests:['kaito','maki'],story:'duo'},
  15:{type:'monokuma',variant:2,story:'monokuma2'},
  16:{type:'shooter',variant:2,story:'shooter2'},
  17:{type:'chase',base:9,goal:18,guests:['kaito','maki'],story:'gauntlet',hard:1},
  18:{type:'chase',base:9,goal:20,guests:['kaito','maki'],hard:2},
  19:{type:'hifumi',story:'beforeBoss'},
  20:{type:'junko'}
};

function currentCampaignSpec(){return campaignPlan[campaignStage]||campaignPlan[1]}

function startCampaignStage(n,skipStory=false){
  campaignStage=clamp(n,1,20);
  const spec=currentCampaignSpec();
  currentStageType=spec.type;
  breachLock=false;breachFx=0;guestEnemies=[];
  ui.storyScreen.classList.remove('show');

  const launch=()=>{
    if(spec.type==='chase'){
      level=spec.base;currentGoal=spec.goal;mode='playing';setBonusUi(false);resetStage();last=performance.now();
    }else if(spec.type==='runner'){
      startJumper(spec.variant||1);
    }else if(spec.type==='shooter'){
      startShooter(spec.variant||1);
    }else if(spec.type==='monokuma'){
      startMonokuma(spec.variant||1);
    }else if(spec.type==='hifumi'){
      level=10;currentGoal=60;mode='playing';setBonusUi(false);resetStage();last=performance.now();
    }else if(spec.type==='junko'){
      level=11;currentGoal=100;setBonusUi(false);startJunkoStage();last=performance.now();
    }
  };

  if(!skipStory&&spec.story&&storyScenes[spec.story])showStory(storyScenes[spec.story],launch);
  else launch();
}


function guestKnockback(g,fromX,fromY,power,stunDur,kind='hit'){
  let dx=g.x-fromX,dy=g.y-fromY,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  g.vx=dx*power;g.vy=dy*power;g.stun=Math.max(g.stun||0,stunDur);
  g.tilt=clamp((g.vx/280)*.22,-.35,.35);g.hitFlash=.28;g.charge=0;g.chargeWarn=0;g.burst=0;
  for(let i=0;i<12;i++){
    const a=rand(0,Math.PI*2),sp=rand(45,160);
    particles.push({kind:'guestHit',x:g.x,y:g.y-20,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(.25,.65),size:rand(2,6)});
  }
  texts.push({text:kind==='fart'?'ГАЗОВЫЙ СТАН!':'ОГЛУШЕН!',x:g.x,y:g.y-62,life:.85,vy:-22});
}

function guestCollideWhileStunned(g){
  if(Math.hypot(player.x-g.x,player.y-g.y)>=player.r+g.r-2)return;
  guestKnockback(g,player.x,player.y,175,.35,'bump');
  let dx=player.x-g.x,dy=player.y-g.y,l=Math.hypot(dx,dy)||1;
  player.vx+=dx/l*105;player.vy+=dy/l*105;
}

function setupGuestEnemies(){
  guestEnemies=[];
  const spec=currentCampaignSpec(), list=spec.guests||[];
  list.forEach((kind,i)=>{
    guestEnemies.push({
      kind,name:kind==='kaito'?'Кайто':'Маки',img:bonusImgs[kind],
      x:i%2?W-145:145,y:i%2?155:H-115,r:26,
      vx:0,vy:0,stun:0,bob:rand(0,6.28),tilt:0,hitFlash:0,
      speedMul:kind==='maki'?1.04:.96,
      chargeCd:kind==='kaito'?rand(4.8,6.4):999,chargeWarn:0,charge:0,chargeDx:0,chargeDy:0,
      burstCd:kind==='maki'?rand(3.5,5.2):999,burst:0
    });
  });
}

function updateGuestEnemies(dt){
  if(currentStageType!=='chase')return;
  const spec=currentCampaignSpec();

  guestEnemies.forEach(g=>{
    g.bob+=dt*6.5;g.hitFlash=Math.max(0,(g.hitFlash||0)-dt);g.stun=Math.max(0,(g.stun||0)-dt);
    g.chargeCd-=dt;g.burstCd-=dt;

    if(g.stun>0){
      g.x+=g.vx*dt;g.y+=g.vy*dt;
      const drag=Math.pow(.015,dt);g.vx*=drag;g.vy*=drag;g.tilt*=Math.pow(.08,dt);
      g.x=clamp(g.x,g.r,W-g.r);g.y=clamp(g.y,110+g.r,H-g.r);resolveObstacle(g);
      guestCollideWhileStunned(g);
      return;
    }

    let dx=player.x-g.x,dy=player.y-g.y,d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
    let maxSp=(116+campaignStage*3.0)*g.speedMul;if(spec.hard)maxSp*=1+spec.hard*.06;

    if(g.kind==='kaito'){
      if(g.chargeWarn>0){
        g.chargeWarn-=dt;g.vx*=Math.pow(.06,dt);g.vy*=Math.pow(.06,dt);
        if(g.chargeWarn<=0){g.charge=.48;g.chargeDx=dx;g.chargeDy=dy;g.vx=dx*370;g.vy=dy*370}
      }else if(g.charge>0){
        g.charge-=dt;g.x+=g.vx*dt;g.y+=g.vy*dt;g.tilt=clamp(g.vx/900,-.18,.18);
      }else{
        if(g.chargeCd<=0&&d<430){g.chargeCd=rand(5.1,7);g.chargeWarn=.72;g.vx=g.vy=0}
        const desiredX=dx*maxSp,desiredY=dy*maxSp;
        g.vx+=(desiredX-g.vx)*Math.min(1,dt*4.1);g.vy+=(desiredY-g.vy)*Math.min(1,dt*4.1);
        g.x+=g.vx*dt;g.y+=g.vy*dt;g.tilt=clamp(g.vx/1000,-.10,.10);
      }
    }else{
      if(g.burst>0){g.burst-=dt;maxSp*=1.42}
      else if(g.burstCd<=0&&d<380){g.burst=.75;g.burstCd=rand(4,5.8)}
      const side=Math.sin(totalTime*2.3+g.bob)*.18;
      const tx=dx*Math.cos(side)-dy*Math.sin(side),ty=dx*Math.sin(side)+dy*Math.cos(side);
      const desiredX=tx*maxSp,desiredY=ty*maxSp;
      g.vx+=(desiredX-g.vx)*Math.min(1,dt*5.2);g.vy+=(desiredY-g.vy)*Math.min(1,dt*5.2);
      g.x+=g.vx*dt;g.y+=g.vy*dt;g.tilt=clamp(g.vx/1100,-.09,.09);
    }

    g.x=clamp(g.x,g.r,W-g.r);g.y=clamp(g.y,110+g.r,H-g.r);resolveObstacle(g);

    if(Math.hypot(player.x-g.x,player.y-g.y)<player.r+g.r-3){
      killPlayer(g);
    }
  });
}

function drawGuestEnemy(g){
  ctx.save();
  ctx.translate(g.x,g.y+Math.sin(g.bob)*3);
  ctx.rotate(g.tilt||0);
  if(g.hitFlash>0){ctx.shadowColor='#8ef5ff';ctx.shadowBlur=25}

  if(g.img&&g.img.complete&&g.img.naturalWidth){
    const h=g.kind==='kaito'?122:116,w=h*g.img.naturalWidth/g.img.naturalHeight;
    ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,26,25,8,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(g.img,-w/2,-h+34,w,h);
  }else{
    ctx.fillStyle='rgba(14,10,20,.94)';ctx.strokeStyle=g.kind==='kaito'?'#b98cff':'#ff8392';ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(0,-20,28,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillRect(-23,7,46,54);ctx.strokeRect(-23,7,46,54);
  }

  ctx.shadowBlur=0;
  ctx.font='900 11px Arial';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=5;
  ctx.fillStyle=g.kind==='kaito'?'#c7a2ff':'#ff98a4';ctx.strokeText(g.name.toUpperCase(),0,47);ctx.fillText(g.name.toUpperCase(),0,47);

  if(g.stun>0){
    const spin=totalTime*6;
    for(let i=0;i<3;i++){
      const a=spin+i*Math.PI*2/3;
      ctx.fillStyle='#8ef5ff';ctx.strokeStyle='#111';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(Math.cos(a)*25,-53+Math.sin(a)*7,5,0,Math.PI*2);ctx.fill();ctx.stroke();
    }
    ctx.fillStyle='#8ef5ff';ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.font='900 12px Arial';
    ctx.strokeText(`${g.stun.toFixed(1)}с`,0,-68);ctx.fillText(`${g.stun.toFixed(1)}с`,0,-68);
  }else if(g.kind==='kaito'&&g.chargeWarn>0){
    ctx.fillStyle='#ffce64';ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.font='900 12px Arial';
    ctx.strokeText(`РЫВОК ${g.chargeWarn.toFixed(1)}с`,0,-66);ctx.fillText(`РЫВОК ${g.chargeWarn.toFixed(1)}с`,0,-66);
  }

  ctx.restore();
}


function breachGateRect(){
  return{x:W-86,y:H*.30,w:70,h:240,cx:W-51,cy:H*.30+120};
}
function playerAtOpenGate(){
  if(!gateOpen||currentStageType!=='chase')return false;
  const g=breachGateRect();
  return player.x+player.r>=g.x+8 && player.y>=g.y-8 && player.y<=g.y+g.h+8;
}

function triggerBreach(){
  if(breachLock||currentStageType!=='chase')return;
  breachLock=true;breachTimer=1.15;breachFx=1.25;gateOpen=false;
  player.inv=Math.max(player.inv,2.2);player.vx=0;player.vy=0;
  enemies.forEach(e=>{e.stun=Math.max(e.stun||0,2.2);e.teleWarn=0;e.dashWarn=0;e.dash=0});
  guestEnemies.forEach(g=>guestKnockback(g,W-55,H*.42,230,2.2,'kiibo'));
  announce('КИБО ЗАРЯЖЕН\nВСКРЫВАЮ ПРОХОД!');
  fireLaser(W-55,H*.47,true);
}

function drawEnergyCell(c){
  const pulse=1+Math.sin(c.pulse)*.09;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot*.35);ctx.scale(pulse,pulse);
  const bad=c.bad,boost=c.golden;ctx.shadowColor=bad?'#ff2f8c':boost?'#fff17b':'#72f1ff';ctx.shadowBlur=boost?22:14;
  ctx.fillStyle=bad?'#6d174f':boost?'#fff17b':'#71eaff';ctx.strokeStyle='#101018';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(0,-20);ctx.lineTo(15,-7);ctx.lineTo(11,14);ctx.lineTo(0,23);ctx.lineTo(-11,14);ctx.lineTo(-15,-7);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=bad?'#ff79bb':'#fff';ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(-4,-12);ctx.lineTo(5,-5);ctx.lineTo(2,10);ctx.lineTo(-5,13);ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;ctx.shadowBlur=0;if(boost){ctx.font='900 13px Arial';ctx.textAlign='center';ctx.fillStyle='#111';ctx.fillText('+3',0,-28)}
  if(bad){ctx.font='900 14px Arial';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('?',0,5)}ctx.restore();
}

function drawBreachGate(){
  if(currentStageType!=='chase')return;
  const g=breachGateRect();ctx.save();

  // Frame.
  ctx.fillStyle='#0d0d13';ctx.strokeStyle='#050508';ctx.lineWidth=7;
  ctx.fillRect(g.x,g.y,g.w,g.h);ctx.strokeRect(g.x,g.y,g.w,g.h);

  if(gateOpen){
    // Open black corridor / portal.
    const grd=ctx.createLinearGradient(g.x,g.y,g.x+g.w,g.y);
    grd.addColorStop(0,'#0a1116');grd.addColorStop(.5,'#091f27');grd.addColorStop(1,'#0a1116');
    ctx.fillStyle=grd;ctx.fillRect(g.x+8,g.y+8,g.w-16,g.h-16);
    ctx.strokeStyle='#71eaff';ctx.lineWidth=4;ctx.shadowColor='#71eaff';ctx.shadowBlur=18;ctx.strokeRect(g.x+9,g.y+9,g.w-18,g.h-18);
    ctx.shadowBlur=0;ctx.fillStyle='#71eaff';ctx.font='900 14px Impact';ctx.textAlign='center';
    ctx.fillText('ВХОД',g.cx,g.cy-8);
    ctx.fillStyle='#fff';ctx.font='900 10px Arial';ctx.fillText('ДОБЕГИ',g.cx,g.cy+13);

    // Arrow pointing into the doorway.
    ctx.fillStyle='#d9ff66';ctx.beginPath();ctx.moveTo(g.x-42,g.cy);ctx.lineTo(g.x-16,g.cy-18);ctx.lineTo(g.x-16,g.cy-7);ctx.lineTo(g.x+4,g.cy-7);ctx.lineTo(g.x+4,g.cy+7);ctx.lineTo(g.x-16,g.cy+7);ctx.lineTo(g.x-16,g.cy+18);ctx.closePath();ctx.fill();
  }else{
    // Closed steel shutters.
    for(let i=0;i<6;i++){
      const yy=g.y+8+i*38;ctx.fillStyle=i%2?'#292834':'#1d1c26';ctx.fillRect(g.x+7,yy,g.w-14,30);
      ctx.strokeStyle='#3b3948';ctx.lineWidth=2;ctx.strokeRect(g.x+7,yy,g.w-14,30);
    }
    ctx.strokeStyle=breachLock?'#fff':'#71eaff';ctx.lineWidth=5;ctx.shadowColor=breachLock?'#fff':'#71eaff';ctx.shadowBlur=16;
    ctx.beginPath();ctx.arc(g.cx,g.cy,17,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#fff';ctx.font='900 10px Arial';ctx.textAlign='center';
    ctx.fillText(breachTimer>0?'OPENING':'LOCK',g.cx,g.cy+4);
  }

  if(breachFx>0){
    ctx.globalAlpha=Math.min(1,breachFx*1.4);
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6+totalTime*4,r=28+(1.25-breachFx)*82;
      ctx.strokeStyle=i%2?'#fff':'#71eaff';ctx.lineWidth=4;ctx.beginPath();
      ctx.moveTo(g.cx+Math.cos(a)*9,g.cy+Math.sin(a)*9);ctx.lineTo(g.cx+Math.cos(a)*r,g.cy+Math.sin(a)*r);ctx.stroke();
    }
  }
  ctx.restore();
}

function freshStageStats(){return{farts:0,teleports:0,kiibo:0,fakeHits:0,golden:0,items:0,maxCombo:0}}
function stageElapsed(){return Math.max(0,totalTime-stageStartTime)}
function difficultySpeedMul(){return difficulty==='despair'?1.08:1}
function difficultyXpMul(){return difficulty==='despair'?1.4:1}
function currentRank(){
  const target=(currentGoal||10)*1.7+7;let score=100-Math.max(0,stageElapsed()-target)*1.7+(stageStats?.maxCombo||0)*2-(stageStats?.fakeHits||0)*8+(stageStats?.golden||0)*3;
  if(difficulty==='despair')score+=5;return score>=90?'S':score>=76?'A':score>=61?'B':score>=46?'C':'D';
}

function showLevelStats(){ui.levelRank.textContent=currentRank();ui.levelStatsSummary.innerHTML=`Время <b>${stageElapsed().toFixed(1)}с</b> · Пердежей <b>${stageStats.farts}</b> · Телепортов Нагито <b>${stageStats.teleports}</b> · Станов Кибо <b>${stageStats.kiibo}</b> · Комбо <b>x${stageStats.maxCombo}</b> · Золотых <b>${stageStats.golden}</b>`}
function rollRarity(){const r=Math.random();if(difficulty==='despair'){if(r<.10)return{id:'legendary',name:'ЛЕГЕНДАРНЫЙ',power:3};if(r<.45)return{id:'rare',name:'РЕДКИЙ',power:2}}else{if(r<.05)return{id:'legendary',name:'ЛЕГЕНДАРНЫЙ',power:3};if(r<.30)return{id:'rare',name:'РЕДКИЙ',power:2}}return{id:'common',name:'ОБЫЧНЫЙ',power:1}}

const itemDefs={smoke:{name:'ДЫМОВАЯ ШАШКА',desc:'стан врагов 2.5с'},energy:{name:'ЭНЕРГЕТИК',desc:'суперскорость 4с'},key:{name:'КЛЮЧ ОТ СЮЖЕТА',desc:'проход сквозь мебель 4с'}};
function updateItemHud(){ui.itemText.textContent=activeItem?`${itemDefs[activeItem].name} — ${itemDefs[activeItem].desc}`:'пусто'}
function spawnItemPickup(){if(level<2||level>=10||activeItem||itemPickups.length)return;const p=freePoint(30),types=['smoke','energy','key'];itemPickups.push({x:p.x,y:p.y,r:18,type:types[Math.floor(rand(0,3))],pulse:rand(0,6.28)})}
function useActiveItem(){if(mode!=='playing'||!activeItem||cinematic)return;const t=activeItem;activeItem=null;if(stageStats)stageStats.items++;if(t==='smoke'){enemies.forEach(e=>{if(e.alive)e.stun=Math.max(e.stun||0,2.5)});toast('ДЫМОВАЯ ШАШКА — СТАН 2.5с',850)}if(t==='energy'){energyTimer=4;toast('ЭНЕРГЕТИК — СКОРОСТЬ 4с',850)}if(t==='key'){phaseTimer=4;toast('КЛЮЧ ОТ СЮЖЕТА — СКВОЗЬ МЕБЕЛЬ 4с',850)}updateItemHud();setTimeout(()=>{if(mode==='playing'&&level<10)spawnItemPickup()},8000)}


function segmentCircleHit(x1,y1,x2,y2,cx,cy,r){
  const vx=x2-x1,vy=y2-y1,wx=cx-x1,wy=cy-y1;
  const len2=vx*vx+vy*vy;
  let t=len2>0?(wx*vx+wy*vy)/len2:0;
  t=clamp(t,0,1);
  const px=x1+vx*t,py=y1+vy*t;
  return Math.hypot(px-cx,py-cy)<=r;
}
function sweptRectHit(x1,y1,x2,y2,halfW,halfH,cx,cy,cr){
  const steps=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/18));
  for(let i=0;i<=steps;i++){
    const t=i/steps,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;
    if(Math.abs(cx-x)<=halfW+cr && Math.abs(cy-y)<=halfH+cr)return true;
  }
  return false;
}
function flyingImpact(x,y){
  shake=Math.max(shake,11);
  for(let i=0;i<14;i++){
    const a=rand(0,Math.PI*2),sp=rand(50,170);
    particles.push({kind:'spark',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(.18,.45),size:rand(2,6)});
  }
}

function setupMapEvent(){
  mapEvents=[];blackoutTimer=0;bellBoostTimer=0;miniBossTimer=0;mapEventHintShown=false;

  if(level===2)mapEventTimer=7;
  else if(level===3)mapEventTimer=4.5;
  else if(level===4)mapEventTimer=7;
  else if(level===5){miniBossTimer=15;mapEventTimer=999;toast('МИНИ-БОСС: НАГИТО // HOPE SURGE 15с',1400)}
  else if(level===6)mapEventTimer=2.8;
  else if(level===7)mapEventTimer=5;
  else if(level===8){miniBossTimer=18;mapEventTimer=999;toast('МИНИ-БОСС: КОКИЧИ // CHAOS MODE 18с',1400)}
  else if(level===9){
    mapEventTimer=999;
    mapEvents=[
      {type:'puddle',x:245,y:300,w:185,h:82},
      {type:'puddle',x:715,y:360,w:215,h:88},
      {type:'puddle',x:930,y:585,w:175,h:62}
    ];
  }else mapEventTimer=999;
}


function mapHazardHit(kind,sourceX,sourceY,power=250,stun=.7){
  if(mapHitStun>0.12)return;

  mapHitStun=Math.max(mapHitStun,stun);
  slow=Math.max(slow,stun+.35);

  let dx=player.x-sourceX,dy=player.y-sourceY,l=Math.hypot(dx,dy)||1;
  dx/=l;dy/=l;
  player.vx=dx*power;
  player.vy=dy*power;

  shake=Math.max(shake,kind==='ball'?17:12);
  flyingImpact(player.x,player.y);

  const label=kind==='ball'?'МЯЧОМ ПО ЕБАЛУ!':'КНИГИ ПО БАШКЕ!';
  texts.push({text:label,x:player.x,y:player.y-55,life:1.0,vy:-30});
  toast(kind==='ball'?'БАСКЕТБОЛЬНЫЙ МЯЧ: ОГЛУШЕНИЕ':'СТОПКА КНИГ: ОГЛУШЕНИЕ',850);
}

function hitPursuerWithBall(e,ball){
  if(!e||!e.alive)return;
  e.stun=Math.max(e.stun||0,1.15);
  e.teleWarn=0;e.dashWarn=0;e.dash=0;
  e.x=clamp(e.x+Math.sign(ball.vx)*80,e.r,W-e.r);
  texts.push({text:'МЯЧ!',x:e.x,y:e.y-58,life:.75,vy:-20});
}

function booksRectHit(e){
  const hw=(e.w||94)/2,hh=(e.h||52)/2;
  return Math.abs(player.x-e.x)<=hw+player.r && Math.abs(player.y-e.y)<=hh+player.r;
}

function playerInPuddle(){return level===9&&mapEvents.some(e=>e.type==='puddle'&&player.x>e.x&&player.x<e.x+e.w&&player.y>e.y&&player.y<e.y+e.h)}
function updateMapEvents(dt){
  if(level>=10)return;

  miniBossTimer=Math.max(0,miniBossTimer-dt);
  blackoutTimer=Math.max(0,blackoutTimer-dt);
  bellBoostTimer=Math.max(0,bellBoostTimer-dt);
  mapEventTimer-=dt;

  if(mapEventTimer<=0){
    if(level===2){
      bellBoostTimer=2.2;mapEventTimer=rand(10,13);toast('ЗВОНОК! +10% СКОРОСТИ',700);

    }else if(level===3){
      const p=freePoint();
      mapEvents.push({
        type:'books',x:p.x,y:p.y,w:96,h:54,warn:1.15,life:5.2,landed:false,hitCd:0,rot:rand(-.08,.08)
      });
      mapEventTimer=rand(7.2,9.2);
      if(!mapEventHintShown){
        mapEventHintShown=true;
        toast('БИБЛИОТЕКА: ПАДАЮЩИЕ КНИГИ ОГЛУШАЮТ',1500);
      }

    }else if(level===4){
      blackoutTimer=2;mapEventTimer=rand(9,12);toast('ВЫРУБИЛО СВЕТ',700);

    }else if(level===6){
      const fromLeft=Math.random()<.5;
      mapEvents.push({
        type:'ball',
        x:fromLeft?-42:W+42,
        y:rand(175,H-70),
        r:27,hitR:34,
        vx:fromLeft?285:-285,
        rot:rand(0,6.28),
        hitCd:0,
        warn:.72,
        fromLeft
      });
      mapEventTimer=rand(4.4,5.8);
      if(!mapEventHintShown){
        mapEventHintShown=true;
        toast('СПОРТЗАЛ: МЯЧИ СБИВАЮТ С НОГ — И ВРАГОВ ТОЖЕ',1600);
      }

    }else if(level===7){
      const p=freePoint();
      mapEvents.push({type:'spot',x:p.x,y:p.y,r:70,warn:1.2,active:.55});
      mapEventTimer=rand(6.5,8);
    }
  }

  for(let i=mapEvents.length-1;i>=0;i--){
    const e=mapEvents[i];

    if(e.type==='books'){
      e.hitCd=Math.max(0,(e.hitCd||0)-dt);

      if(e.warn>0){
        e.warn-=dt;
        if(e.warn<=0){
          e.warn=0;e.landed=true;shake=Math.max(shake,8);
          for(let k=0;k<12;k++){
            particles.push({
              kind:'paper',x:e.x+rand(-35,35),y:e.y+rand(-20,20),
              vx:rand(-80,80),vy:rand(-90,30),life:rand(.35,.75),size:rand(3,7)
            });
          }
        }
      }else{
        e.life-=dt;
        if(e.landed&&e.hitCd<=0&&booksRectHit(e)){
          e.hitCd=.8;
          mapHazardHit('books',e.x,e.y,205,.58);
        }
      }

      if(e.life<=0)mapEvents.splice(i,1);

    }else if(e.type==='ball'){
      if(e.warn>0){
        e.warn-=dt;
        continue;
      }

      const oldX=e.x,oldY=e.y;
      e.x+=e.vx*dt;
      e.rot+=dt*Math.sign(e.vx)*8.5;
      e.hitCd=Math.max(0,(e.hitCd||0)-dt);

      // Player hit: very visible and mechanically meaningful.
      if(e.hitCd<=0&&segmentCircleHit(oldX,oldY,e.x,e.y,player.x,player.y,(e.hitR||34)+player.r)){
        mapHazardHit('ball',oldX,oldY,330,.78);
        mapEvents.splice(i,1);
        continue;
      }

      // Nagito / Kokichi can get smacked by the same ball.
      let consumed=false;
      for(const enemy of enemies){
        if(!enemy.alive)continue;
        if(segmentCircleHit(oldX,oldY,e.x,e.y,enemy.x,enemy.y,(e.hitR||34)+enemy.r)){
          hitPursuerWithBall(enemy,e);
          flyingImpact(enemy.x,enemy.y);
          consumed=true;break;
        }
      }

      // Kaito / Maki also react physically.
      if(!consumed){
        for(const g of guestEnemies){
          if(segmentCircleHit(oldX,oldY,e.x,e.y,g.x,g.y,(e.hitR||34)+g.r)){
            guestKnockback(g,oldX,oldY,300,1.15,'ball');
            consumed=true;break;
          }
        }
      }

      if(consumed||e.x<-90||e.x>W+90)mapEvents.splice(i,1);

    }else if(e.type==='spot'){
      if(e.warn>0)e.warn-=dt;
      else{
        e.active-=dt;
        if(Math.hypot(player.x-e.x,player.y-e.y)<e.r+player.r)slow=Math.max(slow,1);
      }
      if(e.active<=0&&e.warn<=0)mapEvents.splice(i,1);
    }
  }
}

function junkoSpeak(text,kind=0){
  if(kind===2)playJunkoClip('laugh');
  else playJunkoClip('voice');
}
const junkoLines=['Надежда? Какая скука.','Давай, детектив. Ещё немного отчаяния.','Кибо снова стреляет? Какая прелесть.','Ты правда думаешь, что это можно победить?','Отчаяние только начинается.'];
function junkoBaseSprite(){
  if(!junko)return 0;
  if(junko.rage || junko.hp<=20)return 2; // crazy expression for final stretch
  if(junko.hp<=40)return 3;               // confident/crowned
  if(junko.hp<=60)return 1;               // despair/sad persona
  if(junko.hp<=80)return 4;               // annoyed side-looking persona
  return 0;                               // neutral opening persona
}
function chooseJunkoSprite(reaction=false){
  if(!junko)return;
  if(reaction){
    // A Kiibo hit gets a short, meaningful reaction instead of random flicker.
    junko.spriteIndex = junko.hp<=30 ? 2 : 1;
    junko.spriteTimer = .85;
    return;
  }
  if(junko.spriteTimer>0)return;
  junko.spriteIndex=junkoBaseSprite();
}
function spawnJunkoAttack(){if(!junko)return;const ph=junko.rage?3:(junkoSurvival<45?1:(junkoSurvival<95?2:3)),r=Math.random();if(r<.28){const v=Math.random()<.5,s=ph===3?78:68,pos=v?rand(100,W-100):rand(190,H-65);junkoAttacks.push({type:'laser',vertical:v,pos,size:s,warn:ph===3?.62:.9,active:.38})}else if(r<.53){junkoAttacks.push({type:'blast',x:clamp(player.x+rand(-55,55),75,W-75),y:clamp(player.y+rand(-45,45),155,H-60),r:ph===3?68:58,warn:ph===3?.58:.82,active:.32})}else if(r<.78){const c=ph===1?5:ph===2?7:9,aim=Math.atan2(player.y-junko.y,player.x-junko.x);for(let i=0;i<c;i++){const a=aim+(i-(c-1)/2)*(.13-(ph-1)*.012),sp=ph===1?165:ph===2?195:225;junkoAttacks.push({type:'orb',x:junko.x,y:junko.y+30,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:11,life:5})}}else{const l=Math.random()<.5,wd=['ОТЧАЯНИЕ','DESPAIR','ПУПУПУ','НЕТ НАДЕЖДЫ'];junkoAttacks.push({type:'word',text:wd[Math.floor(rand(0,wd.length))],x:l?-170:W+170,y:rand(185,H-65),vx:l?rand(225,290):-rand(225,290),life:4,w:155,h:42})}if(junko.voiceCd<=0){if(Math.random()<.25)playJunkoClip('laugh');else playJunkoClip('voice');junko.voiceCd=rand(6.5,10.5)}if(ph>=2&&Math.random()<.25)setTimeout(()=>{if(mode==='playing'&&level===11&&!cinematic)spawnJunkoAttack()},260)}

function triggerJunkoScriptedFinal(reason='attack'){
  if(
    !junko ||
    !junko.rage ||
    junko.final
  ){
    return false;
  }

  // This is a real "death" for run statistics,
  // but it is now the intended narrative trigger.
  recordDeath('junko');

  junko.final=true;
  junko.finalReason=reason;

  junkoAttacks.length=0;

  player.inv=99;
  player.vx=0;
  player.vy=0;

  ui.gameOver.classList.remove('show');
  ui.bossHud.classList.remove('show');

  shake=30;

  playJunkoFinalLaugh();

  cinematic={
    type:'junkoEnd',
    t:0,
    dur:13.4,
    triggeredByDeath:true,
    deathReason:reason
  };

  toast(
    reason==='crush'
      ? 'АРЕНА СОМКНУЛАСЬ...'
      : 'ФАТАЛЬНЫЙ УДАР...',
    650
  );

  return true;
}

function despairDeath(reason='attack'){
  // ONLY the final 10 HP / 12.5s rage phase uses death as the ending trigger.
  if(
    level===11 &&
    junko &&
    junko.rage &&
    !junko.final
  ){
    triggerJunkoScriptedFinal(reason);
    return;
  }

  // Everywhere else on Junko's level death stays a normal Game Over.
  if(mode==='dead')return;

  recordDeath('junko');

  mode='dead';
  shake=28;

  stopMusic();

  ui.deathTitle.textContent=
    'ПОГРЕБЁН В ОТЧАЯНИИ';

  ui.deathText.textContent=
    reason==='crush'
      ? 'Арена сомкнулась.'
      : `Ты продержался ${junkoSurvival.toFixed(1)} секунд. До финальной фазы ещё нужно было добраться.`;

  ui.deathLevel.textContent=
    '20 — ABSOLUTE DESPAIR';

  ui.deathXp.textContent=xp;

  ui.bossHud.classList.remove('show');

  playJunkoClip('laugh');

  setTimeout(
    ()=>ui.gameOver.classList.add('show'),
    350
  );
}

function showFinalResults(){
  stopJunkoVoice();
  stopMusic();

  mode='victory';

  ui.storyScreen.classList.remove('show');
  ui.gameOver.classList.remove('show');
  ui.bossHud.classList.remove('show');

  setBonusUi(true);

  const perkStacksTotal=
    Object.values(perkStacks)
      .reduce(
        (sum,n)=>
          sum+(Number(n)||0),
        0
      );

  ui.victoryEyebrow.textContent=
    `DESPAIR RUNNER // BAD END // СЛОТ ${activeSaveSlot}`;

  ui.victoryTitle.textContent=
    'ОТЧАЯНИЕ ПОБЕДИЛО';

  ui.victoryText.textContent=
    'Шуичи не выбрался. Кибо ничего не успел изменить. Все их попытки закончились именно так, как хотела Джунко.';

  ui.victoryRank.textContent=
    'DESPAIR';

  ui.victoryTime.textContent=
    formatRunTime(totalTime);

  ui.victoryDeaths.textContent=
    campaignStats.deaths;

  ui.victoryEnergy.textContent=
    campaignStats.energy;

  ui.victoryXp.textContent=
    xp;

  ui.victoryStages.textContent=
    `${campaignStats.stages}/20`;

  ui.victoryPerks.textContent=
    perkStacksTotal;

  ui.victoryDifficulty.textContent=
    difficulty.toUpperCase();

  ui.victoryRunType.textContent=
    `SLOT ${activeSaveSlot} · BAD END`;

  ui.victory.classList.add('show');

  if(campaignStats.stages>=20){
    markActiveSlotCompleted();
  }

  updateMobileControls(true);
}

function finishCampaignEnding(){
  if(campaignStats.endingDone)return;

  campaignStats.endingDone=true;

  recordStageComplete(
    20,
    'DESPAIR'
  );

  junkoAttacks.length=0;

  ui.bossHud.classList.remove('show');

  stopMusic();

  // No hopeful story scene. Junko won.
  // Her uploaded laugh keeps playing into the result screen.
  showFinalResults();
}

function junkoHit(force=false){if(!force&&player.inv>0)return;if(!force&&player.shields>0){player.shields--;player.inv=1.2;shake=14;toast(`АЛИБИ СДЕРЖАЛО ОТЧАЯНИЕ · щитов ${player.shields}`,850);return}despairDeath(force?'crush':'attack')}
function startJunkoStage(){
  stopJunkoVoice();

  // CRITICAL: after the Hifumi story callback we are still in mode='story'.
  // Junko intro needs updateCinematic(), which only runs through update().
  mode='playing';

  campaignStage=20;
  currentStageType='junko';
  currentGoal=100;
  setBonusUi(false);
  ui.storyScreen.classList.remove('show');
  storyState=null;

  level=11;
  stageCoins=0;
  coins=[];
  itemPickups=[];
  activeItem=null;
  mapEvents=[];
  junkoAttacks=[];
  boss=null;
  bossHitLock=false;

  currentTheme=getThemeForLevel(11);
  obstacles=currentTheme.obstacles.map(o=>({...o}));

  stageStartTime=totalTime;
  stageStats=freshStageStats();
  coinCombo=0;
  coinComboTimer=0;

  player.x=W/2;
  player.y=H-90;
  player.vx=0;
  player.vy=0;
  player.inv=2.4;
  player.shields=Math.floor(stats.shield);

  junko={
    x:W/2,y:225,hp:100,
    attackCd:2.8,
    spriteIndex:0,
    spriteTimer:2.3,
    shots:0,
    voiceCd:3.5,
    shrink:0,
    shrinkStarted:false,
    rage:false,
    final:false
  };

  junkoSurvival=0;
  for(let i=0;i<9;i++)spawnCoin();

  ui.bossName.textContent='ABSOLUTE DESPAIR — JUNKO ENOSHIMA';
  ui.bossHp.textContent='100%';
  ui.bossFill.style.width='100%';
  ui.bossSub.textContent='10 ЭНЕРГИИ = ВЫСТРЕЛ КИБО · КАЖДЫЙ ВЫСТРЕЛ = -10 HP';
  ui.bossHud.classList.add('show');

  playMusic('despair');

  cinematic={type:'junkoIntro',t:0,dur:4.2};

  setTimeout(()=>{
    if(
      level===11 &&
      mode==='playing'
    ){
      showSpecialPerkToast();
    }
  },650);

  updateHud();
  last=performance.now();
  ensureLoop();
}

function junkoCoinMilestone(){
  if(!junko || junko.rage)return;

  const n=Math.floor(stageCoins/10);
  if(n>junko.shots){
    junko.shots++;
    if(stageStats)stageStats.kiibo++;
    chooseJunkoSprite(true);

    const before=junko.hp;
    const after=Math.max(0,before-10);

    fireLaser(junko.x,junko.y-25,true);

    setTimeout(()=>{
      junko.hp=after;
      shake=26;
      texts.push({text:'-10 HP',x:junko.x,y:junko.y-90,life:1.2,vy:-24});
      toast(`КИБО ПОПАЛ #${junko.shots} · ДЖУНКО ${junko.hp} HP`,1000);

      if(before===20 && after===10){
        junko.rage=true;
        junko.shrinkStarted=true;
        junko.shrink=0;
        junko.spriteIndex=2;
        junko.attackCd=1.0;
        junko.voiceCd=999;

        // Clean entry into survival phase.
        junkoAttacks.length=0;
        player.inv=Math.max(
          player.inv,
          1.15
        );

        announce(
          '10 HP — ПОСЛЕДНИЕ 12.5 СЕКУНД\nСМЕРТЬ ТЕПЕРЬ ЗАПУСКАЕТ ФИНАЛ'
        );

        playJunkoClip('laugh');

        setTimeout(()=>{
          if(
            mode==='playing' &&
            level===11
          ){
            playJunkoClip('voice');
          }
        },1300);

        toast(
          'ТОЛЬКО В ЭТОЙ ФАЗЕ: ФАТАЛЬНЫЙ УДАР = КАТСЦЕНА',
          1900
        );
      }else{
        junkoSpeak(
          junko.hp<=30?'Ещё один выстрел? Какая наглость.':
          junko.hp<=60?'Продолжай. Мне уже становится интересно.':
          'Пупупу. Минус десять.',
          junko.spriteIndex
        );
      }
      updateHud();
    },180);
  }
}
function updateJunko(dt){
  if(!junko||cinematic)return;

  junkoSurvival+=dt;
  junko.spriteTimer-=dt;
  junko.voiceCd=Math.max(0,junko.voiceCd-dt);
  chooseJunkoSprite();

  const ph=junko.rage?4:(junkoSurvival<45?1:(junkoSurvival<95?2:3));

  ui.bossSub.textContent=junko.rage
    ? `ФИНАЛ · ${Math.max(0,12.5-junko.shrink*12.5).toFixed(1)}с · СМЕРТЬ = КАТСЦЕНА`
    : `10 ЭНЕРГИИ = -10 HP · ВЫСТРЕЛОВ ${junko.shots} · ФАЗА ${ph}`;

  junko.attackCd-=dt;

  if(!junko.rage && junko.attackCd<=0){
    spawnJunkoAttack();
    junko.attackCd=(ph===1?2.15:ph===2?1.5:1.0)*(difficulty==='despair'?.88:1);
  }

  if(
    junko.rage &&
    junko.shrink<.84 &&
    junko.attackCd<=0
  ){
    // The last ~2 seconds are wall survival, not unavoidable spam.
    spawnJunkoAttack();

    junko.attackCd=
      .98*
      (
        difficulty==='despair'
          ? .88
          : 1
      );
  }

  for(let i=junkoAttacks.length-1;i>=0;i--){
    const a=junkoAttacks[i];

    if(a.type==='laser'){
      if(a.warn>0)a.warn-=dt;
      else{
        a.active-=dt;
        if(a.active>0){
          if(a.vertical&&Math.abs(player.x-a.pos)<a.size/2+player.r)junkoHit();
          if(!a.vertical&&Math.abs(player.y-a.pos)<a.size/2+player.r)junkoHit();
        }
      }
      if(a.active<=0&&a.warn<=0)junkoAttacks.splice(i,1);

    }else if(a.type==='blast'){
      if(a.warn>0)a.warn-=dt;
      else{
        a.active-=dt;
        if(a.active>0&&Math.hypot(player.x-a.x,player.y-a.y)<a.r+player.r)junkoHit();
      }
      if(a.active<=0&&a.warn<=0)junkoAttacks.splice(i,1);

    }else if(a.type==='orb'){
      const oldX=a.x,oldY=a.y;
      a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt;
      const hitR=(a.r||11)+4;
      if(segmentCircleHit(oldX,oldY,a.x,a.y,player.x,player.y,hitR+player.r)){
        flyingImpact(player.x,player.y);
        junkoHit();
      }
      if(a.life<=0||a.x<-50||a.x>W+50||a.y<-50||a.y>H+50)junkoAttacks.splice(i,1);

    }else if(a.type==='word'){
      const oldX=a.x,oldY=a.y;
      a.x+=a.vx*dt;a.life-=dt;
      if(sweptRectHit(oldX,oldY,a.x,a.y,a.w/2,a.h/2,player.x,player.y,player.r)){
        flyingImpact(player.x,player.y);
        junkoHit();
      }
      if(a.life<=0||a.x<-260||a.x>W+260)junkoAttacks.splice(i,1);
    }
  }

  if(junkoSurvival>=45&&!junko.p2){
    junko.p2=true;
    announce('ДЖУНКО: «СКУЧНО...»\nФАЗА 2');
    junkoSpeak('Скучно. Сделаем хуже.',1);
  }

  if(junkoSurvival>=95&&!junko.p3){
    junko.p3=true;
    announce('АБСОЛЮТНОЕ ОТЧАЯНИЕ\nФАЗА 3');
    junkoSpeak('Теперь начинается настоящее отчаяние!',4);
  }

  // The arena ONLY begins closing when Kiibo knocks her from 20 HP down to 10 HP.
  if(junko.rage){
    junko.shrink=Math.min(1,junko.shrink+dt/12.5);

    const side=junko.shrink*485;
    const top=junko.shrink*205;

    const minX=30+side;
    const maxX=W-30-side;
    const minY=115+top;
    const maxY=H-30-top;

    // V30 BUG:
    // shrink=1 still left a roughly 250x165 safe box,
    // so the old 'box smaller than Shuichi' condition was impossible.
    // Now surviving the full 12.5 seconds ALWAYS reaches the ending.
    if(junko.shrink>=1){
      if(!junko.final){
        // If Shuichi somehow survives the entire 12.5 seconds,
        // the same ending begins without counting a death.
        junko.final=true;
        junko.finalReason='survived';

        junkoAttacks.length=0;

        player.inv=99;
        player.vx=0;
        player.vy=0;

        ui.bossHud.classList.remove('show');

        playJunkoFinalLaugh();

        cinematic={
          type:'junkoEnd',
          t:0,
          dur:13.4,
          triggeredByDeath:false,
          deathReason:'survived'
        };
      }

      return;
    }

    if(player.x-player.r<minX||player.x+player.r>maxX||player.y-player.r<minY||player.y+player.r>maxY){
      junkoHit(true);
      return;
    }

    player.x=clamp(player.x,minX+player.r,maxX-player.r);
    player.y=clamp(player.y,minY+player.r,maxY-player.r);
  }
}

function makeObstacles(){
  currentTheme=getThemeForLevel(level);
  obstacles=currentTheme.obstacles.map(o=>({...o}));
}

function freePoint(extra=0){
  for(let tries=0;tries<80;tries++){
    const p={x:rand(55,W-55),y:rand(120,H-55)};
    if(obstacles.every(o=>!(p.x>o.x-35-extra&&p.x<o.x+o.w+35+extra&&p.y>o.y-35-extra&&p.y<o.y+o.h+35+extra))
       && Math.hypot(p.x-player.x,p.y-player.y)>120)return p;
  }
  return{x:W/2,y:H/2};
}

function spawnCoin(forceBad=false){
  const p=freePoint();
  const bad=level<10&&(forceBad||(level>=8&&Math.random()<.18));
  const golden=!bad&&level<10&&Math.random()<.075;
  coins.push({x:p.x,y:p.y,r:15,rot:rand(0,6.28),pulse:rand(0,6.28),bad,golden});
}

function spawnHazards(){hazards=[]}

function resetStage(){
  stageCoins=0;coins=[];particles=[];texts=[];trail=[];slow=0;mapHitStun=0;fartCooldown=0;fartCombo=1;coinRushTimer=0;
  coinCombo=0;coinComboTimer=0;maxCoinCombo=0;energyTimer=0;phaseTimer=0;activeItem=null;itemPickups=[];
  stageStartTime=totalTime;stageStats=freshStageStats();breachLock=false;breachFx=0;breachTimer=0;gateOpen=false;
  player.x=W/2;player.y=H/2;player.vx=0;player.vy=0;player.inv=1.35;player.shields=Math.floor(stats.shield);kiiboCooldown=0;kiiboMaxCooldown=0;
  enemies[0].x=90;enemies[0].y=130;enemies[0].alive=true;enemies[0].luckCd=rand(11.5,14);enemies[0].teleWarn=0;enemies[0].arrivalLock=0;enemies[0].stun=0;
  enemies[1].x=W-90;enemies[1].y=H-110;enemies[1].alive=true;enemies[1].dashCd=rand(6.5,8);enemies[1].dashWarn=0;enemies[1].dash=0;enemies[1].stun=0;
  makeObstacles();spawnHazards();setupMapEvent();updateItemHud();setupGuestEnemies();

  if(currentStageType==='hifumi'){
    coins=[];playMusic('hifumi');startBossCinematic();
  }else{
    playMusic('normal');for(let i=0;i<8;i++)spawnCoin();if(campaignStage>=2)spawnItemPickup();
    announce(`ЭТАП ${campaignStage} / 20\n${currentTheme.name}`);
    const startLevel=stats.kiibo>0?6:7;if(level>=startLevel)setKiiboCooldown(randomKiiboCooldown());
  }
  updateHud();
}

function fullReset(){
  stopJunkoFinalLaugh();
  stopJunkoVoice();ui.settingsScreen.classList.remove('show');
  campaignStats=freshCampaignStats();
  mode='playing';totalTime=0;level=1;campaignStage=1;currentGoal=8;currentStageType='chase';stageCoins=0;xp=0;fartIndex=0;
  perksOwned.length=0;Object.keys(perkStacks).forEach(k=>delete perkStacks[k]);
  Object.assign(stats,{speed:1,fart:1,magnet:0,doubleCoin:0,sprint:1,luck:0,fartPower:1,fartStun:0,shield:0,panic:0,coinRush:0,kiibo:0});
  boss=null;junko=null;junkoAttacks=[];junkoSurvival=0;cinematic=null;guestEnemies=[];breachLock=false;breachFx=0;breachTimer=0;gateOpen=false;
  kiiboLaser=null;kiiboCutin=null;stageShotTimer=0;nextAutoShot=0;bossHitLock=false;kiiboCooldown=0;kiiboMaxCooldown=0;
  activeItem=null;itemPickups=[];mapEvents=[];coinCombo=0;coinComboTimer=0;maxCoinCombo=0;
  ui.start.classList.remove('show');ui.levelScreen.classList.remove('show');ui.gameOver.classList.remove('show');ui.victory.classList.remove('show');ui.bossHud.classList.remove('show');ui.storyScreen.classList.remove('show');
  bonus=null;storyState=null;setBonusUi(false);updatePerkHud();updateItemHud();last=performance.now();ensureLoop();

  writeSlotMeta(
    activeSaveSlot,
    {
      started:true,
      completed:false,
      checkpoint:false,
      nextStage:1,
      totalTime:0,
      xp:0,
      difficulty
    }
  );

  refreshSaveSlots();
  refreshCheckpointUi();
  updateMobileControls(true);

  showStory(storyScenes.intro,()=>startCampaignStage(1,true));
}

function updateHud(){
  ui.level.textContent=`${campaignStage} / 20`;
  ui.coins.textContent=currentStageType==='junko'?`${stageCoins} ⚡`:gateOpen?'ДВЕРЬ ОТКРЫТА →':`${stageCoins} / ${currentGoal} ⚡`;
  ui.xp.textContent=xp;ui.combo.textContent='x'+fartCombo;ui.coinCombo.textContent='x'+coinCombo;
  if(currentStageType==='hifumi'&&boss){ui.bossName.textContent='HIFUMI YAMADA';const hp=Math.max(0,boss.hp);ui.bossHp.textContent=Math.round(hp)+'%';ui.bossFill.style.width=hp+'%'}
  if(currentStageType==='junko'&&junko){ui.bossName.textContent='ABSOLUTE DESPAIR';ui.bossHp.textContent=`${Math.max(0,junko.hp)}%`;ui.bossFill.style.width=`${Math.max(0,junko.hp)}%`}
  updateItemHud();updateKiiboHud();
}

function circleRect(ent,o){
  const nx=clamp(ent.x,o.x,o.x+o.w),ny=clamp(ent.y,o.y,o.y+o.h);
  return Math.hypot(ent.x-nx,ent.y-ny)<ent.r;
}

function resolveObstacle(ent){
  if(ent===player&&phaseTimer>0)return;
  for(const o of obstacles){
    if(!circleRect(ent,o))continue;
    const vals=[
      ['l',Math.abs((ent.x+ent.r)-o.x)],['r',Math.abs((o.x+o.w)-(ent.x-ent.r))],
      ['t',Math.abs((ent.y+ent.r)-o.y)],['b',Math.abs((o.y+o.h)-(ent.y-ent.r))]
    ].sort((a,b)=>a[1]-b[1]);
    if(vals[0][0]==='l')ent.x=o.x-ent.r;
    if(vals[0][0]==='r')ent.x=o.x+o.w+ent.r;
    if(vals[0][0]==='t')ent.y=o.y-ent.r;
    if(vals[0][0]==='b')ent.y=o.y+o.h+ent.r;
  }
}

function fartBoost(){
  if(mode!=='playing'||fartCooldown>0||cinematic||mapHitStun>0)return;
  fartCooldown=.40/stats.fart;
  fartCombo=(totalTime-lastFart<1.45)?Math.min(8,fartCombo+1):1;lastFart=totalTime;
  fartSound();shake=Math.min(17,5+fartCombo);if(stageStats)stageStats.farts++;

  let dx=0,dy=0;
  if(keys.ArrowUp||keys.KeyW)dy--;if(keys.ArrowDown||keys.KeyS)dy++;
  if(keys.ArrowLeft||keys.KeyA)dx--;if(keys.ArrowRight||keys.KeyD)dx++;
  if(!dx&&!dy){dx=Math.cos(player.angle);dy=Math.sin(player.angle)}
  const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  player.vx+=dx*(190+fartCombo*13)*stats.fartPower;player.vy+=dy*(190+fartCombo*13)*stats.fartPower;

  for(let i=0;i<18;i++){
    const a=Math.atan2(dy,dx)+Math.PI+rand(-.65,.65);
    particles.push({kind:'gas',x:player.x,y:player.y,vx:Math.cos(a)*rand(80,230),vy:Math.sin(a)*rand(80,230),life:rand(.25,.65),size:rand(5,15)});
  }
  texts.push({text:['ПРРРРТ','БРРРП','ПУК','ГАЗУЕМ'][Math.floor(rand(0,4))],x:player.x,y:player.y-42,life:.65,vy:-42});

  if(stats.fartStun>0&&currentStageType==='chase'){
    enemies.forEach(e=>{if(e.alive&&Math.hypot(player.x-e.x,player.y-e.y)<185){e.stun=Math.max(e.stun||0,stats.fartStun);e.teleWarn=0;e.dashWarn=0;e.dash=0}});
    guestEnemies.forEach(g=>{if(Math.hypot(player.x-g.x,player.y-g.y)<185)guestKnockback(g,player.x,player.y,215,stats.fartStun,'fart')});
  }
  updateHud();
}

function collectCoin(c){
  play(c.bad?sounds.bad:sounds.coin,c.bad?.7:.45);
  if(c.bad&&Math.random()>stats.luck){slow=Math.max(slow,1.6);if(stageStats)stageStats.fakeHits++;coinCombo=0;coinComboTimer=0;toast('ЗАРАЖЁННАЯ ЭНЕРГИЯ — СБОЙ 💀');texts.push({text:'СБОЙ!',x:c.x,y:c.y,life:.8,vy:-34});updateHud();return}
  coinCombo=coinComboTimer>0?coinCombo+1:1;coinComboTimer=1.5;maxCoinCombo=Math.max(maxCoinCombo,coinCombo);if(stageStats)stageStats.maxCombo=Math.max(stageStats.maxCombo,coinCombo);
  let gain=c.golden?3:1;if(Math.random()<stats.doubleCoin)gain++;
  if(c.golden){if(stageStats)stageStats.golden++;coinRushTimer=Math.max(coinRushTimer,1.5);toast(`ПЕРЕГРУЖЕННАЯ ЭНЕРГИЯ +${gain} ⚡`,850)}else toast(gain>1?`ЭНЕРГИЯ +${gain} ⚡`:'ЭНЕРГИЯ +1 ⚡');
  stageCoins+=gain;campaignStats.energy+=gain;xp+=Math.round(10*gain*(1+Math.floor(coinCombo/5)*.25)*difficultyXpMul());if(stats.coinRush>0)coinRushTimer=Math.max(coinRushTimer,.9);
  if(currentStageType==='hifumi'){stageCoins=Math.min(60,stageCoins);bossCoinMilestone()}
  else if(currentStageType==='junko')junkoCoinMilestone();
  else if(currentStageType==='chase'&&stageCoins>=currentGoal)triggerBreach();
  updateHud();
}

function finishLevel(){
  if(mode!=='playing')return;recordStageComplete(campaignStage,currentRank());mode='levelup';breachLock=false;play(sounds.level,.55);xp+=Math.round(campaignStage*22*difficultyXpMul());
  ui.levelDone.textContent=`ЭТАП ${campaignStage} ПРОЙДЕН`;showLevelStats();setTimeout(()=>{makePerkChoices();ui.levelScreen.classList.add('show')},420);
}

function makePerkChoices(){
  ui.perkChoices.innerHTML='';const pool=[...perkPool].sort(()=>Math.random()-.5).slice(0,3);
  pool.forEach(p=>{const current=perkCount(p.id),r=rollRarity(),b=document.createElement('button');b.className=`perkCard ${r.id}`;
    b.innerHTML=`<span class="rarity">${r.name} · +${r.power} СТАК${r.power>1?'А':''}</span><strong>${p.name}${current?` ×${current}`:''}</strong><span>${p.desc}<br><em>${perkNextText(p)}</em></span>`;
    b.onclick=()=>{
      const completed=campaignStage;
      for(let i=0;i<r.power;i++)p.apply();
      perkStacks[p.id]=(perkStacks[p.id]||0)+r.power;perksOwned.push(`${p.name} ${r.name}`);updatePerkHud();
      ui.levelScreen.classList.remove('show');
      if(completed===5||completed===10||completed===15)saveCheckpoint(completed,completed+1);
      startCampaignStage(completed+1);last=performance.now()
    };ui.perkChoices.appendChild(b)
  });
}

function killPlayer(by){
  if(mode!=='playing'||player.inv>0||cinematic)return;
  if(level===11){despairDeath('attack');return}
  if(player.shields>0){
    player.shields--;player.inv=1.8;shake=16;toast(`АЛИБИ СПАСЛО ШУИЧИ 🛡️ Осталось: ${player.shields}`,1200);
    const dx=player.x-(by?.x??player.x-1),dy=player.y-(by?.y??player.y),l=Math.hypot(dx,dy)||1;
    player.vx+=dx/l*300;player.vy+=dy/l*300;return;
  }
  recordDeath('chase');breachLock=false;breachTimer=0;gateOpen=false;mode='dead';stopMusic();shake=22;
  ui.deathTitle.textContent=(by?.name||'ЧТО-ТО')+' ТЕБЯ ДОГНАЛ 💀';
  ui.deathText.textContent=deathLines[Math.floor(rand(0,deathLines.length))];
  ui.deathLevel.textContent=campaignStage;ui.deathXp.textContent=xp;
  setTimeout(()=>ui.gameOver.classList.add('show'),350);
}

function safeNagitoTeleportPoint(){
  for(let i=0;i<70;i++){
    const a=rand(0,Math.PI*2),r=rand(320,430);
    const p={x:clamp(player.x+Math.cos(a)*r,55,W-55),y:clamp(player.y+Math.sin(a)*r,135,H-55)};
    const clear=obstacles.every(o=>!(p.x>o.x-65&&p.x<o.x+o.w+65&&p.y>o.y-65&&p.y<o.y+o.h+65));
    if(clear&&Math.hypot(p.x-player.x,p.y-player.y)>=285)return p;
  }
  return{x:player.x<W/2?W-90:90,y:player.y<H/2?H-90:150};
}

function enemyAI(e,dt){
  if(!e.alive)return;
  e.bob+=dt*7;e.stun=Math.max(0,(e.stun||0)-dt);e.arrivalLock=Math.max(0,(e.arrivalLock||0)-dt);
  if(e.stun>0)return;

  let dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
  let base=(126+level*6.5)*difficultySpeedMul()*(1+Math.max(0,campaignStage-8)*.012);
  if(e.id==='kokichi')base+=9;if(level>=9)base+=12;
  if(level===5&&miniBossTimer>0&&e.id==='nagito')base*=1.14;
  if(level===8&&miniBossTimer>0&&e.id==='kokichi')base*=1.13;

  if(e.id==='kokichi'&&level>=4){
    if(e.dashWarn>0){e.dashWarn-=dt;if(e.dashWarn<=0)e.dash=.38;return}
    e.dashCd-=dt;
    if(e.dashCd<=0&&e.dash<=0){e.dashCd=rand(6.2,7.8);e.dashWarn=1.15;const l=Math.hypot(player.x-e.x,player.y-e.y)||1;e.dashDx=(player.x-e.x)/l;e.dashDy=(player.y-e.y)/l}
  }
  if(e.dash>0){
    e.dash-=dt;e.x+=e.dashDx*base*1.55*dt;e.y+=e.dashDy*base*1.55*dt;
    e.x=clamp(e.x,e.r,W-e.r);e.y=clamp(e.y,105+e.r,H-e.r);resolveObstacle(e);
    if(Math.hypot(player.x-e.x,player.y-e.y)<player.r+e.r-2)killPlayer(e);return;
  }

  if(e.id==='nagito'&&level>=5){
    if(e.teleWarn>0){
      e.teleWarn-=dt;
      if(e.teleWarn<=0){e.x=e.teleX;e.y=e.teleY;if(stageStats)stageStats.teleports++;e.arrivalLock=.35;player.inv=Math.max(player.inv,.55)}
      return;
    }
    e.luckCd-=dt;
    if(e.luckCd<=0){e.luckCd=rand(level>=9?9.2:11.0,level>=9?11.7:13.8);const p=safeNagitoTeleportPoint();e.teleX=p.x;e.teleY=p.y;e.teleWarn=1.55;return}
  }
  if(e.arrivalLock>0)return;

  const wobble=Math.sin(totalTime*2.2+e.bob)*.14;
  const wx=dx*Math.cos(wobble)-dy*Math.sin(wobble),wy=dx*Math.sin(wobble)+dy*Math.cos(wobble);
  e.x+=wx*base*dt;e.y+=wy*base*dt;e.x=clamp(e.x,e.r,W-e.r);e.y=clamp(e.y,105+e.r,H-e.r);resolveObstacle(e);
  if(Math.hypot(player.x-e.x,player.y-e.y)<player.r+e.r-2)killPlayer(e);
}

function autoKiibo(dt){
  const startLevel=stats.kiibo>0?6:7;if(currentStageType!=='chase'||level<startLevel)return;
  if(kiiboCooldown>0)kiiboCooldown=Math.max(0,kiiboCooldown-dt);
  if(kiiboCooldown<=0){const targets=[...enemies.filter(e=>e.alive),...guestEnemies];if(!targets.length)return;const target=targets[Math.floor(rand(0,targets.length))];fireLaser(target.x,target.y-18,false);
    setTimeout(()=>{stunPursuers();updateHud()},170);setKiiboCooldown(randomKiiboCooldown());updateHud()}
}

function startBossCinematic(){
  mode='playing';ui.bossHud.classList.add('show');
  boss={name:'Хифуми',x:W/2,y:-240,r:52,hp:100,hits:0,speed:186,chargeCd:5,charge:0,chargeVx:0,chargeVy:0,hitFlash:0};
  ui.bossSub.textContent='Собери 60 энергии. Каждые 10 — выстрел Кибо.';for(let i=0;i<9;i++)spawnCoin();cinematic={type:'bossIntro',t:0,dur:4.3};shake=0;
}

function bossCoinMilestone(){
  if(!boss)return;
  const hits=Math.floor(stageCoins/10);
  if(hits>boss.hits&&!bossHitLock){
    boss.hits++;bossHitLock=true;const hp=Math.max(0,100-boss.hits*(100/6));fireLaser(boss.x,boss.y-70,true);
    setTimeout(()=>{
      boss.hp=hp;boss.hitFlash=.45;shake=30;
      for(let i=0;i<34;i++){const a=rand(0,Math.PI*2),sp=rand(80,340);particles.push({kind:'spark',x:boss.x,y:boss.y-50,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rand(.3,.9),size:rand(4,11)})}
      if(boss.hp<=0)startBossDeathCinematic();else{toast(`ХИФУМИ: ${Math.round(boss.hp)}% HP`);bossHitLock=false}
      updateHud();
    },180);
  }
}

function fireLaser(tx,ty,bossShot){
  play(sounds.shot,.8);shake=bossShot?26:18;
  const fromLeft=tx>W/2,sx=fromLeft?42:W-42,sy=clamp(ty+rand(-70,70),145,H-85);
  kiiboCutin={side:fromLeft?'left':'right',x:sx,y:sy,tx,ty,life:.78,max:.78,bossShot:!!bossShot};
  kiiboLaser={sx:fromLeft?88:W-88,sy:sy-8,tx,ty,life:.32,max:.32,bossShot};
}

function startBossDeathCinematic(){
  if(cinematic&&cinematic.type==='bossDeath')return;
  bossHitLock=true;cinematic={type:'bossDeath',t:0,dur:4.8};mode='playing';announce('ФИНАЛЬНЫЙ ВЫСТРЕЛ');
}

function updateBoss(dt){
  if(!boss||cinematic)return;
  boss.hitFlash=Math.max(0,boss.hitFlash-dt);
  const hp=boss.hp;let dx=player.x-boss.x,dy=player.y-boss.y,d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
  let sp=180;if(hp<=70)sp=200;if(hp<=40)sp=225;if(hp<=20)sp=245;
  boss.chargeCd-=dt;
  if(hp<=70&&boss.chargeCd<=0&&boss.charge<=0){boss.charge=.72;boss.chargeCd=hp<=40?2.5:3.5;boss.chargeVx=dx;boss.chargeVy=dy}
  if(boss.charge>0){boss.charge-=dt;boss.x+=boss.chargeVx*sp*2.25*dt;boss.y+=boss.chargeVy*sp*2.25*dt}else{boss.x+=dx*sp*dt;boss.y+=dy*sp*dt}
  boss.x=clamp(boss.x,boss.r,W-boss.r);boss.y=clamp(boss.y,130+boss.r,H-boss.r);resolveObstacle(boss);
  if(Math.hypot(player.x-boss.x,player.y-boss.y)<player.r+boss.r-4)killPlayer(boss);
}

function updateCinematic(dt){
  if(!cinematic)return;
  cinematic.t+=dt;const t=cinematic.t;
  if(cinematic.type==='bossIntro'){
    if(t<.6)shake=rand(2,8);if(t>.65&&t<1.15)shake=18;if(t>2&&t<2.7)shake=28;
    if(t>=cinematic.dur){cinematic=null;boss.x=W/2;boss.y=H*.42;player.inv=1.5;announce('БОСС-ФАЙТ!')}
  }else if(cinematic.type==='bossDeath'){
    shake=Math.min(34,8+t*7);
    if(t>1.1&&t<1.3&&!cinematic.finalShot){cinematic.finalShot=true;fireLaser(boss.x,boss.y-70,true)}
    if(t>=cinematic.dur){
      cinematic=null;
      recordStageComplete(19,'BOSS');
      xp+=1000;
      ui.bossHud.classList.remove('show');

      // Final checkpoint with the full current build.
      saveCheckpoint(19,20);

      showStory(storyScenes.afterHifumi,()=>{
        startJunkoStage();
      });
    }
  }else if(cinematic.type==='junkoIntro'){
    shake=t<1.5?rand(3,13):5;
    if(t>=cinematic.dur){cinematic=null;player.inv=1.5;announce('ВЫЖИВИ')}
  }else if(cinematic.type==='junkoEnd'){
    // No Kiibo rescue. Despair wins.
    shake=
      t<1.4
        ? Math.min(34,10+t*12)
        : Math.max(
            2,
            8-(t-1.4)*.45
          );

    if(t>=cinematic.dur){
      cinematic=null;
      finishCampaignEnding();
    }
  }
}

function update(dt){
  totalTime+=dt;
  player.inv=Math.max(0,player.inv-dt);slow=Math.max(0,slow-dt);mapHitStun=Math.max(0,mapHitStun-dt);fartCooldown=Math.max(0,fartCooldown-dt);
  coinRushTimer=Math.max(0,coinRushTimer-dt);coinComboTimer=Math.max(0,coinComboTimer-dt);energyTimer=Math.max(0,energyTimer-dt);phaseTimer=Math.max(0,phaseTimer-dt);

  if(coinComboTimer<=0&&coinCombo!==0){coinCombo=0;updateHud()}
  if(totalTime-lastFart>1.5&&fartCombo!==1){fartCombo=1;updateHud()}
  if(kiiboLaser){kiiboLaser.life-=dt;if(kiiboLaser.life<=0)kiiboLaser=null}
  if(kiiboCutin){kiiboCutin.life-=dt;if(kiiboCutin.life<=0)kiiboCutin=null}

  updateKiiboHud();updateCinematic(dt);
  if(cinematic){updateFx(dt);return}

  let dx=0,dy=0;
  if(mapHitStun<=0){
    if(keys.ArrowUp||keys.KeyW)dy--;
    if(keys.ArrowDown||keys.KeyS)dy++;
    if(keys.ArrowLeft||keys.KeyA)dx--;
    if(keys.ArrowRight||keys.KeyD)dx++;
  }
  const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
  const sprint=(keys.ShiftLeft||keys.ShiftRight)?1.27*stats.sprint:1,slowed=slow>0?.62:1;
  let panicBoost=1;
  if(stats.panic>0&&level<10){const aa=enemies.filter(e=>e.alive);const nearP=aa.length?Math.min(...aa.map(e=>d2(player,e))):9999;if(nearP<165)panicBoost+=stats.panic}
  const rushBoost=coinRushTimer>0?(1+stats.coinRush):1,energyBoost=energyTimer>0?1.32:1,bellBoost=bellBoostTimer>0?1.10:1;
  const max=235*stats.speed*sprint*slowed*panicBoost*rushBoost*energyBoost*bellBoost,accel=1320*stats.speed*sprint*slowed*panicBoost*rushBoost*energyBoost*bellBoost;

  if(dx||dy){player.vx+=dx*accel*dt;player.vy+=dy*accel*dt;player.angle=Math.atan2(dy,dx)}
  const drag=Math.pow(mapHitStun>0?.08:(playerInPuddle()?.09:.0014),dt);player.vx*=drag;player.vy*=drag;
  const sp=Math.hypot(player.vx,player.vy);if(sp>max+165){player.vx*=(max+165)/sp;player.vy*=(max+165)/sp}
  player.x+=player.vx*dt;player.y+=player.vy*dt;player.x=clamp(player.x,player.r,W-player.r);player.y=clamp(player.y,105+player.r,H-player.r);resolveObstacle(player);

  if(currentStageType==='chase'){
    const gate=breachGateRect();
    if(!gateOpen && player.y>gate.y-8 && player.y<gate.y+gate.h+8 && player.x+player.r>gate.x-5){
      player.x=gate.x-player.r-5;player.vx=Math.min(0,player.vx);
    }
    if(playerAtOpenGate()){
      finishLevel();return;
    }
  }

  trail.push({x:player.x,y:player.y,life:.20});if(trail.length>10)trail.shift();

  if(currentStageType==='chase'){enemies.forEach(e=>enemyAI(e,dt));updateGuestEnemies(dt)}else if(currentStageType==='hifumi')updateBoss(dt);else if(currentStageType==='junko')updateJunko(dt);
  if(currentStageType==='chase')autoKiibo(dt);
  if(currentStageType==='chase')updateMapEvents(dt);
  breachFx=Math.max(0,breachFx-dt);
  if(breachLock&&breachTimer>0){
    breachTimer=Math.max(0,breachTimer-dt);
    if(breachTimer<=0&&!gateOpen){
      gateOpen=true;
      player.inv=Math.max(player.inv,.6);
      toast('ПРОХОД ОТКРЫТ — ДОБЕГИ ДО ДВЕРИ!',1500);
      texts.push({text:'ДВЕРЬ ОТКРЫТА',x:W-170,y:H*.30+100,life:1.2,vy:-15});
      updateHud();
    }
  }

  for(let i=itemPickups.length-1;i>=0;i--){
    const it=itemPickups[i];it.pulse+=dt*5;
    if(Math.hypot(player.x-it.x,player.y-it.y)<player.r+it.r+5){activeItem=it.type;itemPickups.splice(i,1);toast(`ПОДОБРАНО: ${itemDefs[activeItem].name} · нажми E`,900);updateItemHud()}
  }

  for(const c of coins){
    c.rot+=dt*2.6;c.pulse+=dt*5;
    const magnet=stats.magnet,dd=Math.hypot(player.x-c.x,player.y-c.y);
    if(!c.bad&&magnet>0&&dd<85+magnet){const pull=(130+magnet)*dt;c.x+=(player.x-c.x)/(dd||1)*pull;c.y+=(player.y-c.y)/(dd||1)*pull}
  }
  for(let i=coins.length-1;i>=0;i--){
    const c=coins[i];
    if(Math.hypot(player.x-c.x,player.y-c.y)<player.r+c.r+5){
      coins.splice(i,1);collectCoin(c);
      const shouldRespawn=
        mode==='playing'&&(
          currentStageType==='junko'||
          (currentStageType==='hifumi'&&stageCoins<60)||
          (currentStageType==='chase'&&!breachLock&&stageCoins<currentGoal)
        );
      if(shouldRespawn)spawnCoin()
    }
  }

  let near=9999;
  if(currentStageType==='chase'){const aa=[...enemies.filter(e=>e.alive),...guestEnemies];near=aa.length?Math.min(...aa.map(e=>d2(player,e))):9999}else if(currentStageType==='hifumi'&&boss)near=d2(player,boss);
  ui.danger.classList.toggle('show',near<140);if(near<100)shake=Math.max(shake,3);shake*=Math.pow(.02,dt);
  updateFx(dt);
}

function updateFx(dt){
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.95;p.vy*=.95;if(p.life<=0)particles.splice(i,1)}
  for(let i=texts.length-1;i>=0;i--){const t=texts[i];t.life-=dt;t.y+=t.vy*dt;if(t.life<=0)texts.splice(i,1)}
  trail.forEach(t=>t.life-=dt);trail=trail.filter(t=>t.life>0);
}

function drawBg(){
  currentTheme=getThemeForLevel(level);const p=currentTheme.palette;ctx.fillStyle=p.bg;ctx.fillRect(0,0,W,H);const s=64;
  for(let y=96;y<H;y+=s)for(let x=0;x<W;x+=s){ctx.fillStyle=((x/s+y/s)&1)?p.tile1:p.tile2;ctx.fillRect(x,y,s,s)}
  ctx.fillStyle=p.top;ctx.fillRect(0,0,W,95);ctx.fillStyle=p.accent;ctx.fillRect(0,87,W,8);ctx.save();ctx.globalAlpha=.16;ctx.fillStyle=p.line;ctx.font='900 46px Impact';
  const title=currentStageType==='hifumi'?`ЭТАП ${campaignStage}/20 // БАРЬЕР`:currentStageType==='junko'?`ЭТАП 20/20 // ABSOLUTE DESPAIR`:`ЭТАП ${campaignStage}/20 // ${currentTheme.name}`;ctx.fillText(title,36,62);ctx.restore();drawThemeDeco();for(const o of obstacles)drawObstacle(o);drawBreachGate();
}

function drawHazard(h){}

function drawCoin(c){drawEnergyCell(c)}

function drawSprite(img,x,y,h,name,tint){
  ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,25,24,8,0,0,7);ctx.fill();
  if(img.complete&&img.naturalWidth){const w=h*(img.naturalWidth/img.naturalHeight);ctx.drawImage(img,-w/2,-h+34,w,h)}
  if(name){ctx.font='900 11px Arial';ctx.textAlign='center';ctx.fillStyle=tint;ctx.strokeStyle='#111';ctx.lineWidth=5;ctx.strokeText(name,0,45);ctx.fillText(name,0,45)}
  ctx.restore();
}

function drawEnemyWarnings(){
  if(level>=10)return;
  const n=enemies[0];
  if(n.teleWarn>0){
    ctx.save();ctx.translate(n.teleX,n.teleY);ctx.globalAlpha=.95;ctx.fillStyle='rgba(210,255,78,.16)';ctx.strokeStyle='#d8ff4e';ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,58,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.font='900 17px Arial';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=6;ctx.fillStyle='#d8ff4e';const sec=Math.max(0,n.teleWarn).toFixed(1);ctx.strokeText(`НАГИТО СЮДА ЧЕРЕЗ ${sec}с`,0,-72);ctx.fillText(`НАГИТО СЮДА ЧЕРЕЗ ${sec}с`,0,-72);ctx.restore();
  }
  const k=enemies[1];
  if(k.dashWarn>0){
    ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle='#b96aff';ctx.lineWidth=10;ctx.setLineDash([18,10]);ctx.beginPath();ctx.moveTo(k.x,k.y);ctx.lineTo(k.x+k.dashDx*230,k.y+k.dashDy*230);ctx.stroke();ctx.setLineDash([]);
    ctx.font='900 16px Arial';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=6;ctx.fillStyle='#dcb5ff';const sec=Math.max(0,k.dashWarn).toFixed(1);ctx.strokeText(`РЫВОК ЧЕРЕЗ ${sec}с`,k.x,k.y-60);ctx.fillText(`РЫВОК ЧЕРЕЗ ${sec}с`,k.x,k.y-60);ctx.restore();
  }
}


function drawMapHitStun(){
  if(mapHitStun<=0)return;
  ctx.save();ctx.translate(player.x,player.y-48);
  const spin=totalTime*7;
  for(let i=0;i<4;i++){
    const a=spin+i*Math.PI/2;
    const x=Math.cos(a)*27,y=Math.sin(a)*8;
    ctx.save();ctx.translate(x,y);ctx.rotate(a);
    ctx.fillStyle='#ffd75d';ctx.strokeStyle='#111';ctx.lineWidth=2;
    ctx.beginPath();
    for(let k=0;k<10;k++){
      const aa=-Math.PI/2+k*Math.PI/5,rr=k%2?3.5:7;
      const px=Math.cos(aa)*rr,py=Math.sin(aa)*rr;
      k?ctx.lineTo(px,py):ctx.moveTo(px,py);
    }
    ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
  ctx.font='900 12px Arial';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.strokeStyle='#111';ctx.lineWidth=4;
  ctx.strokeText(`ОГЛУШЕН ${mapHitStun.toFixed(1)}с`,0,-18);ctx.fillText(`ОГЛУШЕН ${mapHitStun.toFixed(1)}с`,0,-18);
  ctx.restore();
}

function drawStunEffects(){
  if(level>=10)return;
  enemies.forEach(e=>{
    if(!e.alive||!(e.stun>0))return;
    ctx.save();ctx.translate(e.x,e.y-28);ctx.globalAlpha=.75;ctx.strokeStyle='#79efff';ctx.lineWidth=4;ctx.shadowColor='#79efff';ctx.shadowBlur=12;
    ctx.beginPath();ctx.ellipse(0,-35,25,8,0,0,Math.PI*2);ctx.stroke();ctx.font='900 12px Arial';ctx.textAlign='center';ctx.fillStyle='#bdf8ff';ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.strokeText(`${e.stun.toFixed(1)}с`,0,-49);ctx.fillText(`${e.stun.toFixed(1)}с`,0,-49);ctx.restore();
  });
}


function spawnMonoEnergy(){if(!bonus)return;bonus.energy.push({x:rand(80,W-80),y:rand(190,H-70),r:15,rot:rand(0,6.28),pulse:rand(0,6.28),bad:false,golden:false})}
function startMonokuma(variant=1){
  setBonusUi(true);
  mode='monokuma';
  currentStageType='monokuma';
  playMusic('hifumi');

  const hp=
    specialMaxLives(3);

  bonus={
    type:'monokuma',
    variant,
    t:0,
    hp:variant===2?100:60,
    maxHp:variant===2?100:60,
    playerHp:hp,
    playerMaxHp:hp,
    energyCount:0,
    shotMilestone:0,
    x:W/2,
    y:220,
    attackCd:1.25,
    waveCd:4.2,
    inv:1.25,
    energy:[],
    shots:[],
    defeated:false,
    defeatTimer:0,
    deathCount:0,
    respawnFlash:0
  };

  player.x=W/2;
  player.y=H-95;
  player.vx=0;
  player.vy=0;

  for(let i=0;i<8;i++){
    spawnMonoEnergy();
  }

  toast(
    `ЭТАП ${campaignStage}/20 · МОНОКУМА · 5 ЭНЕРГИИ = КИБО`,
    1800
  );

  setTimeout(()=>{
    if(mode==='monokuma'){
      showSpecialPerkToast();
    }
  },450);
}

function monokumaHitPlayer(){
  if(
    !bonus ||
    bonus.defeated ||
    bonus.inv>0
  ){
    return;
  }

  if(specialAvoidHit()){
    bonus.inv=.38;
    toast(
      'АНТИ-СБОЙ: УКЛОНЕНИЕ',
      450
    );
    return;
  }

  bonus.playerHp--;bonus.inv=.85;shake=Math.max(shake,15);play(sounds.bad,.65);
  texts.push({text:'ПУХУХУ!',x:player.x,y:player.y-55,life:.7,vy:-25});

  if(bonus.playerHp<=0){
    // HARD FIX: no pause state, no respawn timer, no mode switch.
    bonus.deathCount=(bonus.deathCount||0)+1;
    recordDeath('monokuma');
    bonus.playerHp=bonus.playerMaxHp||specialMaxLives(3);
    bonus.inv=2.15;
    bonus.respawnFlash=1.0;
    bonus.shots.length=0;
    bonus.attackCd=1.65;
    bonus.waveCd=3.4;
    player.x=W/2;player.y=H-95;player.vx=0;player.vy=0;
    shake=Math.max(shake,18);
    toast('ШУИЧИ ВЕРНУЛСЯ · 2.1с НЕУЯЗВИМОСТИ',1100);
  }
}

function finishMonokuma(){
  if(!bonus)return;
  const completed=campaignStage;
  recordStageComplete(completed,'BOSS');
  xp+=bonus.variant===2?500:320;setBonusUi(false);bonus=null;
  if(completed===5||completed===10||completed===15)saveCheckpoint(completed,completed+1);
  startCampaignStage(completed+1);
}

function updateMonokuma(dt){
  if(!bonus)return;
  bonus.t+=dt;bonus.respawnFlash=Math.max(0,(bonus.respawnFlash||0)-dt);

  if(bonus.defeated){
    bonus.defeatTimer=Math.max(0,bonus.defeatTimer-dt);updateFx(dt);
    if(bonus.defeatTimer<=0)finishMonokuma();
    return;
  }

  bonus.inv=Math.max(0,bonus.inv-dt);bonus.attackCd-=dt;bonus.waveCd-=dt;

  let dx=0,dy=0;if(keys.KeyW||keys.ArrowUp)dy--;if(keys.KeyS||keys.ArrowDown)dy++;if(keys.KeyA||keys.ArrowLeft)dx--;if(keys.KeyD||keys.ArrowRight)dx++;
  const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;
  const sp=(bonus.variant===2?285:260)*specialMoveMul();player.x=clamp(player.x+dx*sp*dt,35,W-35);player.y=clamp(player.y+dy*sp*dt,135,H-35);

  if(bonus.attackCd<=0){
    let ax=player.x-bonus.x,ay=player.y-bonus.y,ll=Math.hypot(ax,ay)||1;ax/=ll;ay/=ll;const ss=bonus.variant===2?315:260;
    bonus.shots.push({type:'orb',x:bonus.x,y:bonus.y+40,vx:ax*ss,vy:ay*ss,r:12,life:5});
    if(bonus.variant===2&&Math.random()<.42)bonus.shots.push({type:'orb',x:bonus.x+35,y:bonus.y+25,vx:(ax+.14)*ss,vy:ay*ss,r:10,life:5});
    bonus.attackCd=rand(bonus.variant===2?.76:1.02,bonus.variant===2?1.15:1.42);
  }

  if(bonus.waveCd<=0){
    bonus.shots.push({type:'wave',x:bonus.x,y:bonus.y,r:15,max:bonus.variant===2?280:240,life:1.2,hitPlayer:false});
    bonus.waveCd=bonus.variant===2?3.45:4.35;
  }

  for(let i=bonus.energy.length-1;i>=0;i--){
    const e=bonus.energy[i];e.rot+=dt*2;e.pulse+=dt*5;
    if(Math.hypot(player.x-e.x,player.y-e.y)<specialEnergyRadius(player.r+22)){
      bonus.energy.splice(i,1);

      const gain=
        specialEnergyGain();

      bonus.energyCount+=gain;
      campaignStats.energy+=gain;

      play(sounds.coin,.48);
      spawnMonoEnergy();
      const milestone=Math.floor(bonus.energyCount/5);
      if(milestone>bonus.shotMilestone){
        bonus.shotMilestone=milestone;fireLaser(bonus.x,bonus.y,true);bonus.hp=Math.max(0,bonus.hp-20);shake=Math.max(shake,22);
        texts.push({text:'-20 HP',x:bonus.x,y:bonus.y-95,life:1,vy:-28});
        if(bonus.hp<=0){
          bonus.defeated=true;bonus.defeatTimer=.72;bonus.shots.length=0;bonus.inv=99;toast('МОНОКУМА ПРОБИТ!',700);return;
        }
      }
    }
  }

  for(let i=bonus.shots.length-1;i>=0;i--){
    const s=bonus.shots[i];
    if(s.type==='orb'){
      const ox=s.x,oy=s.y;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
      if(segmentCircleHit(ox,oy,s.x,s.y,player.x,player.y,s.r+player.r)){
        monokumaHitPlayer();
        if(bonus.shots[i]===s)bonus.shots.splice(i,1);
        continue;
      }
      if(s.life<=0||s.x<-50||s.x>W+50||s.y<-50||s.y>H+50)bonus.shots.splice(i,1);
    }else{
      const prev=s.r;s.r+=(s.max-15)*dt/1.2;s.life-=dt;const d=Math.hypot(player.x-s.x,player.y-s.y);
      if(!s.hitPlayer&&bonus.inv<=0&&d>=prev-player.r&&d<=s.r+player.r){
        s.hitPlayer=true;monokumaHitPlayer();
        if(!bonus.shots.length)break;
      }
      if(bonus.shots[i]===s&&s.life<=0)bonus.shots.splice(i,1);
    }
  }
  updateFx(dt);
}

function drawMonokuma(){
  if(!bonus)return;ctx.save();ctx.fillStyle=bonus.variant===2?'#170811':'#101018';ctx.fillRect(0,0,W,H);for(let i=0;i<14;i++){ctx.fillStyle=i%2?'rgba(255,40,100,.06)':'rgba(255,255,255,.025)';ctx.fillRect(i*100,100,55,H-100)}ctx.fillStyle='#24232b';ctx.fillRect(0,H-105,W,105);bonus.energy.forEach(e=>drawEnergyCell(e));
  for(const s of bonus.shots){if(s.type==='orb'){ctx.save();ctx.fillStyle='#ff2d70';ctx.shadowColor='#ff2d70';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.restore()}else{ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle='#ff2d70';ctx.lineWidth=12;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();ctx.restore()}}
  const im=bonus.variant===2?imgs.monokumaRage:imgs.monokuma;drawSprite(im,bonus.x,bonus.y+65,bonus.variant===2?245:210,'МОНОКУМА','#ff6b92');ctx.save();ctx.globalAlpha=bonus.inv>0&&Math.floor(bonus.inv*12)%2?.35:1;drawSprite(imgs.shuichi,player.x,player.y,108,'ШУИЧИ','#8fefff');ctx.restore();
  ctx.fillStyle='#111';ctx.fillRect(18,18,600,92);ctx.strokeStyle='#ff4b7e';ctx.lineWidth=4;ctx.strokeRect(18,18,600,92);ctx.fillStyle='#fff';ctx.font='900 27px Impact';ctx.fillText(`ЭТАП ${campaignStage}/20 // МОНОКУМА`,36,50);ctx.font='900 16px Arial';ctx.fillStyle='#ff6b92';ctx.fillText(`HP ${bonus.hp}/${bonus.maxHp}    ТВОИ ЖИЗНИ ${'♥'.repeat(bonus.playerHp)}    ЭНЕРГИЯ ${bonus.energyCount%5}/5`,36,78);ctx.fillStyle='#23222b';ctx.fillRect(36,88,420,10);
  ctx.fillStyle='#ff4b7e';ctx.fillRect(36,88,420*(bonus.hp/bonus.maxHp),10);

  if(bonus.respawnFlash>0){
    ctx.save();ctx.textAlign='center';ctx.font='900 23px Impact';ctx.fillStyle='#fff';ctx.strokeStyle='#111';ctx.lineWidth=6;
    ctx.strokeText('ВОЗВРАЩЕНИЕ!',W/2,H-145);ctx.fillText('ВОЗВРАЩЕНИЕ!',W/2,H-145);
    ctx.font='900 12px Arial';ctx.fillStyle='#8ef5ff';ctx.fillText('2.1с НЕУЯЗВИМОСТИ',W/2,H-122);ctx.restore();
  }else if(bonus.defeated){
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.font='900 42px Impact';
    ctx.fillStyle='#fff';ctx.strokeStyle='#111';ctx.lineWidth=8;
    ctx.strokeText('БАРЬЕР РАЗРУШЕН',W/2,H/2);
    ctx.fillText('БАРЬЕР РАЗРУШЕН',W/2,H/2);
    ctx.restore();
  }

  drawKiiboShooter();drawLaser();drawFx();ctx.restore();
}
function drawItemPickups(){itemPickups.forEach(it=>{const p=1+Math.sin(it.pulse)*.08;ctx.save();ctx.translate(it.x,it.y);ctx.scale(p,p);ctx.fillStyle=it.type==='smoke'?'#b7b7c8':it.type==='energy'?'#69e6ff':'#ffd85a';ctx.strokeStyle='#111';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#111';ctx.font='900 15px Arial';ctx.textAlign='center';ctx.fillText(it.type==='smoke'?'S':it.type==='energy'?'E':'K',0,5);ctx.restore()})}
function drawMapEvents(){
  for(const e of mapEvents){
    if(e.type==='puddle'){
      ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#61d8ff';ctx.beginPath();
      ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w/2,e.h/2,0,0,Math.PI*2);ctx.fill();ctx.restore();

    }else if(e.type==='books'){
      ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.rot||0);

      if(e.warn>0){
        const pulse=.55+.45*Math.sin(totalTime*14);
        ctx.globalAlpha=.24+.18*pulse;
        ctx.fillStyle='#ffcb48';ctx.strokeStyle='#fff0a0';ctx.lineWidth=5;
        ctx.beginPath();ctx.ellipse(0,0,56,32,0,0,Math.PI*2);ctx.fill();ctx.stroke();
        ctx.globalAlpha=1;
        ctx.fillStyle='#ffd95e';ctx.strokeStyle='#111';ctx.lineWidth=5;
        ctx.font='900 18px Impact';ctx.textAlign='center';
        ctx.strokeText('КНИГИ ↓',0,-44);ctx.fillText('КНИГИ ↓',0,-44);
        ctx.font='900 12px Arial';ctx.fillStyle='#fff';ctx.strokeText(`${Math.max(0,e.warn).toFixed(1)}с`,0,-24);ctx.fillText(`${Math.max(0,e.warn).toFixed(1)}с`,0,-24);

      }else{
        // A readable stack of separate books instead of the old brown circle.
        const fade=Math.min(1,Math.max(0,e.life/.6));ctx.globalAlpha=fade;
        const books=[
          {x:-38,y:9,w:76,h:15,c:'#6f3f36',r:-.03},
          {x:-31,y:-5,w:70,h:15,c:'#355d78',r:.035},
          {x:-35,y:-19,w:82,h:15,c:'#8a6840',r:-.025},
          {x:-24,y:-33,w:62,h:14,c:'#7b466f',r:.045}
        ];
        for(const b of books){
          ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.r);
          ctx.fillStyle=b.c;ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.fillRect(0,0,b.w,b.h);ctx.strokeRect(0,0,b.w,b.h);
          ctx.fillStyle='#e8dfc7';ctx.fillRect(7,3,b.w-13,b.h-6);
          ctx.fillStyle=b.c;ctx.fillRect(0,0,8,b.h);
          ctx.restore();
        }
        ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(2,31,50,9,0,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();

    }else if(e.type==='ball'){
      ctx.save();

      if(e.warn>0){
        const edgeX=e.fromLeft?26:W-26;
        const dir=e.fromLeft?1:-1;
        ctx.globalAlpha=.45+.25*Math.sin(totalTime*16);
        ctx.fillStyle='#ffb13d';ctx.strokeStyle='#111';ctx.lineWidth=4;
        ctx.beginPath();
        ctx.moveTo(edgeX,e.y);ctx.lineTo(edgeX-dir*30,e.y-18);ctx.lineTo(edgeX-dir*30,e.y-7);
        ctx.lineTo(edgeX-dir*53,e.y-7);ctx.lineTo(edgeX-dir*53,e.y+7);ctx.lineTo(edgeX-dir*30,e.y+7);
        ctx.lineTo(edgeX-dir*30,e.y+18);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.globalAlpha=1;ctx.fillStyle='#fff';ctx.strokeStyle='#111';ctx.lineWidth=5;
        ctx.font='900 13px Arial';ctx.textAlign=e.fromLeft?'left':'right';
        const tx=e.fromLeft?45:W-45;
        ctx.strokeText(`МЯЧ ${Math.max(0,e.warn).toFixed(1)}с`,tx,e.y-27);ctx.fillText(`МЯЧ ${Math.max(0,e.warn).toFixed(1)}с`,tx,e.y-27);
      }else{
        // Motion trail.
        const dir=Math.sign(e.vx);
        for(let k=1;k<=4;k++){
          ctx.globalAlpha=.14/k;ctx.fillStyle='#ffaf3c';ctx.beginPath();
          ctx.arc(e.x-dir*k*18,e.y,e.r*(1-k*.08),0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;ctx.translate(e.x,e.y);ctx.rotate(e.rot);

        // Proper basketball.
        ctx.fillStyle='#d97827';ctx.strokeStyle='#17110d';ctx.lineWidth=4;
        ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();ctx.stroke();

        ctx.strokeStyle='#24150e';ctx.lineWidth=3.5;
        ctx.beginPath();ctx.moveTo(-e.r,0);ctx.quadraticCurveTo(0,-7,e.r,0);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,-e.r);ctx.quadraticCurveTo(7,0,0,e.r);ctx.stroke();
        ctx.beginPath();ctx.arc(-e.r*.64,0,e.r*.76,-1.05,1.05);ctx.stroke();
        ctx.beginPath();ctx.arc(e.r*.64,0,e.r*.76,Math.PI-1.05,Math.PI+1.05);ctx.stroke();

        ctx.fillStyle='rgba(255,255,255,.20)';ctx.beginPath();ctx.arc(-8,-9,7,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();

    }else if(e.type==='spot'){
      ctx.save();ctx.globalAlpha=e.warn>0?.28:.58;ctx.fillStyle=e.warn>0?'#ff66c8':'#ff2f78';
      ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    }
  }
}

function junkoImage(){if(!junko)return imgs.junkoFallback;if(junko.spriteIndex===0)return imgs.junkoFallback;const im=junkoSprites[junko.spriteIndex-1];return im&&im.complete&&im.naturalWidth?im:imgs.junkoFallback}
function drawJunko(){if(level!==11||!junko)return;const im=junkoImage(),bob=Math.sin(junkoSurvival*2)*4;ctx.save();ctx.translate(junko.x,junko.y+bob);ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,52,52,13,0,0,Math.PI*2);ctx.fill();const hh=190,ww=hh*(im.naturalWidth?im.naturalWidth/im.naturalHeight:.72);ctx.shadowColor='#ff2d8d';ctx.shadowBlur=18;if(im.complete&&im.naturalWidth)ctx.drawImage(im,-ww/2,-hh+60,ww,hh);ctx.shadowBlur=0;ctx.font='900 13px Arial';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=5;ctx.fillStyle='#ff79bd';ctx.strokeText('ДЖУНКО // ABSOLUTE DESPAIR',0,70);ctx.fillText('ДЖУНКО // ABSOLUTE DESPAIR',0,70);ctx.restore()}
function drawJunkoAttacks(){for(const a of junkoAttacks){if(a.type==='laser'){ctx.save();ctx.globalAlpha=a.warn>0?.28:.82;ctx.fillStyle=a.warn>0?'#ff9acf':'#ff167e';ctx.shadowColor='#ff167e';ctx.shadowBlur=a.warn>0?4:20;if(a.vertical)ctx.fillRect(a.pos-a.size/2,95,a.size,H-95);else ctx.fillRect(0,a.pos-a.size/2,W,a.size);ctx.restore()}else if(a.type==='blast'){ctx.save();ctx.globalAlpha=a.warn>0?.32:.85;ctx.fillStyle=a.warn>0?'#ff91c9':'#ff167e';ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(a.x,a.y,(a.r||11)+2,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}else if(a.type==='orb'){ctx.save();ctx.fillStyle='#ff3d9c';ctx.shadowColor='#ff3d9c';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(a.x-3,a.y-3,3,0,Math.PI*2);ctx.fill();ctx.restore()}else if(a.type==='word'){ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle='#ff2d8d';ctx.strokeStyle='#111';ctx.lineWidth=8;ctx.font='900 30px Impact';ctx.textAlign='center';ctx.strokeText(a.text,0,10);ctx.fillText(a.text,0,10);ctx.restore()}}}
function drawDespairWalls(){if(level!==11||!junko||junko.shrink<=0)return;const s=junko.shrink,side=s*470,top=s*185;ctx.save();ctx.fillStyle='rgba(13,0,10,.94)';ctx.shadowColor='#ff2d8d';ctx.shadowBlur=25;ctx.fillRect(0,95,30+side,H-95);ctx.fillRect(W-30-side,95,30+side,H-95);ctx.fillRect(0,95,W,20+top);ctx.fillRect(0,H-30-top,W,30+top);ctx.strokeStyle='#ff2d8d';ctx.lineWidth=6;ctx.strokeRect(30+side,115+top,W-60-side*2,H-145-top*2);ctx.restore()}

function drawActors(){
  trail.forEach(t=>{ctx.save();ctx.globalAlpha=t.life*1.8;drawSprite(imgs.shuichi,t.x,t.y,106,'','');ctx.restore()});const list=[{kind:'p',y:player.y}];
  if(currentStageType==='chase'){enemies.forEach(e=>list.push({kind:e.id,y:e.y,e}));guestEnemies.forEach(g=>list.push({kind:'guest',y:g.y,g}))}
  else if(currentStageType==='hifumi'&&boss)list.push({kind:'boss',y:boss.y});else if(currentStageType==='junko'&&junko)list.push({kind:'junko',y:junko.y});
  list.sort((a,b)=>a.y-b.y).forEach(a=>{if(a.kind==='p')drawSprite(imgs.shuichi,player.x,player.y,108,'ШУИЧИ','#8fefff');else if(a.kind==='boss')drawBoss();else if(a.kind==='junko')drawJunko();else if(a.kind==='guest')drawGuestEnemy(a.g);else drawSprite(a.e.img,a.e.x,a.e.y+Math.sin(a.e.bob)*3,104,a.e.name.toUpperCase(),a.e.id==='kokichi'?'#b96aff':'#d8ff4e')});
}

function drawBoss(){
  if(!boss)return;
  ctx.save();
  ctx.translate(boss.x,boss.y);

  const h=205;
  const w=h*(imgs.hifumi.naturalWidth?imgs.hifumi.naturalWidth/imgs.hifumi.naturalHeight:.56);

  ctx.fillStyle='rgba(0,0,0,.42)';
  ctx.beginPath();
  ctx.ellipse(0,50,58,17,0,0,Math.PI*2);
  ctx.fill();

  if(boss.hp<=40){
    // Red rage aura, but NO red rectangle over the sprite.
    ctx.save();
    ctx.globalAlpha=.32+.12*Math.sin(totalTime*12);
    ctx.shadowColor='#ff244f';
    ctx.shadowBlur=28;
    ctx.strokeStyle='#ff244f';
    ctx.lineWidth=7;
    ctx.beginPath();
    ctx.ellipse(0,-45,w*.46,h*.48,0,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  if(boss.hitFlash>0){
    ctx.shadowColor='#ffffff';
    ctx.shadowBlur=22;
  }

  if(imgs.hifumi.complete&&imgs.hifumi.naturalWidth){
    ctx.drawImage(imgs.hifumi,-w/2,-h+68,w,h);
  }

  ctx.restore();
}

function drawKiiboShooter(){
  if(!kiiboCutin)return;
  const k=kiiboCutin;
  const fade=Math.min(1,k.life/.16);

  ctx.save();
  ctx.globalAlpha=fade;

  const img=imgs.kiibo;
  if(img.complete&&img.naturalWidth){
    // The supplied PNG naturally aims left. Mirror it when appearing on the left.
    const h=300;
    const w=h*(img.naturalWidth/img.naturalHeight);
    const fromLeft=k.side==='left';

    let x,y;
    y=clamp(k.y-h*.46,105,H-h*.70);

    if(fromLeft){
      // mirror so the cannon points right
      x=-w*.18;
      ctx.save();
      ctx.translate(x+w,y);
      ctx.scale(-1,1);
      ctx.drawImage(img,0,0,w,h);
      ctx.restore();
    }else{
      x=W-w*.82;
      ctx.drawImage(img,x,y,w,h);
    }
  }

  // Clean label only; the artwork itself is the cut-in.
  ctx.font='900 18px Impact';
  ctx.textAlign=k.side==='left'?'left':'right';
  ctx.strokeStyle='#111';
  ctx.lineWidth=6;
  ctx.fillStyle='#8ef5ff';
  const labelX=k.side==='left'?18:W-18;
  const labelY=clamp(k.y-95,120,H-35);
  const label=k.bossShot?'КИБО // BOSS SHOT':'КИБО // STUN';
  ctx.strokeText(label,labelX,labelY);
  ctx.fillText(label,labelX,labelY);

  ctx.restore();
}
function drawLaser(){
  if(!kiiboLaser)return;const a=Math.min(1,kiiboLaser.life/.1);ctx.save();ctx.globalAlpha=a;ctx.shadowBlur=28;ctx.shadowColor='#6cecff';ctx.strokeStyle='#fff';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(kiiboLaser.sx,kiiboLaser.sy);ctx.lineTo(kiiboLaser.tx,kiiboLaser.ty);ctx.stroke();ctx.strokeStyle='#56e5ff';ctx.lineWidth=7;ctx.stroke();ctx.restore();
}
function drawFx(){
  for(const p of particles){ctx.save();ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.kind==='paper'?'#e8dfc7':(p.kind==='spark'||p.kind==='kiiboStun'||p.kind==='guestHit')?'#8ef5ff':'#b9d76a';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill();ctx.restore()}
  for(const t of texts){ctx.save();ctx.globalAlpha=Math.min(1,t.life*2);ctx.font='900 25px Impact';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=6;ctx.fillStyle='#fff';ctx.strokeText(t.text,t.x,t.y);ctx.fillText(t.text,t.x,t.y);ctx.restore()}
}
function drawCinematic(){
  if(!cinematic)return;
  const t=cinematic.t;
  if(cinematic.type==='bossIntro'){
    // Hard entrance: black shutters, speed lines, giant zoom, impact card.
    ctx.save();
    if(t<.55){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='900 34px Impact';ctx.textAlign='center';ctx.fillText(`ЭТАП ${campaignStage}`,W/2,H/2)}
    if(t>=.55&&t<1.15){
      ctx.fillStyle=t%0.16<.08?'#fff':'#12000a';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#ff315f';ctx.font='900 82px Impact';ctx.textAlign='center';ctx.fillText('WARNING',W/2,H/2+25);
    }
    if(t>=1.05&&t<3.35){
      ctx.fillStyle='rgba(0,0,0,.38)';ctx.fillRect(0,0,W,H);
      for(let i=0;i<35;i++){const y=(i*47+t*520)%H;ctx.strokeStyle=i%2?'#ff315f':'#fff';ctx.globalAlpha=.18;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y-rand(20,80));ctx.stroke()}
      const p=clamp((t-1.05)/1.7,0,1);
      const ease=1-Math.pow(1-p,3);
      const h=180+ease*390,w=h*(imgs.hifumi.naturalWidth?imgs.hifumi.naturalWidth/imgs.hifumi.naturalHeight:.65);
      const y=H*.50+Math.sin(t*20)*5;
      if(imgs.hifumi.complete)ctx.drawImage(imgs.hifumi,W/2-w/2,y-h/2,w,h);
      if(t>2.15){ctx.globalAlpha=1;ctx.font='900 72px Impact';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=12;ctx.fillStyle='#ff6b92';ctx.strokeText('HIFUMI YAMADA',W/2,620);ctx.fillText('HIFUMI YAMADA',W/2,620)}
    }
    if(t>=3.35){
      ctx.fillStyle=t<3.55?'#fff':'rgba(0,0,0,.55)';ctx.fillRect(0,0,W,H);
      ctx.font='900 54px Impact';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=10;ctx.fillStyle='#ffd448';ctx.strokeText('ULTIMATE FANFIC WRITER',W/2,H/2);ctx.fillText('ULTIMATE FANFIC WRITER',W/2,H/2);
    }
    ctx.restore();
  }else if(cinematic.type==='bossDeath'){
    ctx.save();
    // Freeze-frame impact, laser, spinning launch, explosion of "manga pages".
    if(t<.8){
      ctx.fillStyle=t%0.12<.06?'#fff':'#ff315f';ctx.globalAlpha=.25;ctx.fillRect(0,0,W,H);
      ctx.font='900 70px Impact';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=12;ctx.fillStyle='#fff';ctx.strokeText('КИБО: СЕЙЧАС!',W/2,160);ctx.fillText('КИБО: СЕЙЧАС!',W/2,160);
    }
    if(t>.8&&t<2.9){
      const p=(t-.8)/2.1;
      ctx.translate(W/2,H/2);
      ctx.rotate(p*p*9);
      const sc=1+p*1.7;
      const h=230*sc,w=h*(imgs.hifumi.naturalWidth?imgs.hifumi.naturalWidth/imgs.hifumi.naturalHeight:.65);
      ctx.globalAlpha=Math.max(.1,1-p*.75);
      if(imgs.hifumi.complete)ctx.drawImage(imgs.hifumi,-w/2,-h/2,w,h);
      ctx.setTransform(1,0,0,1,0,0);
      for(let i=0;i<26;i++){
        const a=i*.83+t*3,rad=70+p*470;
        const x=W/2+Math.cos(a)*rad,y=H/2+Math.sin(a)*rad;
        ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=i%2?'#fff':'#ff6b92';ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.fillRect(-16,-10,32,20);ctx.strokeRect(-16,-10,32,20);ctx.restore();
      }
    }
    if(t>=2.9&&t<3.55){ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H)}
    if(t>=3.15){
      ctx.fillStyle='#0c0710';ctx.globalAlpha=Math.min(1,(t-3.15)*2);ctx.fillRect(0,0,W,H);
      ctx.globalAlpha=1;ctx.font='900 64px Impact';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=12;ctx.fillStyle='#cfff55';ctx.strokeText('HIFUMI DEFEATED',W/2,H/2-15);ctx.fillText('HIFUMI DEFEATED',W/2,H/2-15);
      ctx.font='900 28px Impact';ctx.fillStyle='#fff';ctx.strokeText('60 МОНОКОИНОВ. 6 ВЫСТРЕЛОВ. GG.',W/2,H/2+45);ctx.fillText('60 МОНОКОИНОВ. 6 ВЫСТРЕЛОВ. GG.',W/2,H/2+45);
    }
    ctx.restore();
  }
  else if(cinematic.type==='junkoIntro'){
    ctx.save();if(t<.65){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.font='900 46px Impact';ctx.textAlign='center';ctx.fillStyle='#ff2d8d';ctx.fillText('???',W/2,H/2)}else{ctx.fillStyle='rgba(20,0,14,.58)';ctx.fillRect(0,0,W,H);const im=junkoImage(),p=clamp((t-.65)/2,0,1),hh=230+p*250,ww=hh*(im.naturalWidth?im.naturalWidth/im.naturalHeight:.72);if(im.complete&&im.naturalWidth)ctx.drawImage(im,W/2-ww/2,H/2-hh/2-20,ww,hh);if(t>2.3){ctx.font='900 74px Impact';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=12;ctx.fillStyle='#ff2d8d';ctx.strokeText('ABSOLUTE DESPAIR',W/2,635);ctx.fillText('ABSOLUTE DESPAIR',W/2,635)}}ctx.restore()
  }else if(cinematic.type==='junkoEnd'){
    ctx.save();

    ctx.fillStyle=
      `rgba(4,0,6,${Math.min(.96,.55+t*.10)})`;

    ctx.fillRect(
      0,0,W,H
    );

    const pulse=
      .5+
      .5*Math.sin(
        t*5.2
      );

    const aura=
      ctx.createRadialGradient(
        W/2,
        H*.42,
        30,
        W/2,
        H*.42,
        390
      );

    aura.addColorStop(
      0,
      `rgba(255,45,141,${.30+.16*pulse})`
    );

    aura.addColorStop(
      .55,
      'rgba(120,0,60,.16)'
    );

    aura.addColorStop(
      1,
      'rgba(0,0,0,0)'
    );

    ctx.fillStyle=aura;

    ctx.fillRect(
      0,0,W,H
    );

    const im=
      junkoImage();

    const grow=
      clamp(
        t/1.8,
        0,1
      );

    const hh=
      390+
      grow*120+
      Math.sin(t*3)*5;

    const ww=
      hh*
      (
        im.naturalWidth
          ? im.naturalWidth/
            im.naturalHeight
          : .72
      );

    if(
      im.complete &&
      im.naturalWidth
    ){
      ctx.globalAlpha=
        .78+
        .22*grow;

      ctx.drawImage(
        im,
        W/2-ww/2,
        H/2-hh/2-55,
        ww,
        hh
      );

      ctx.globalAlpha=1;
    }

    ctx.fillStyle='#000';
    ctx.fillRect(0,0,W,54);
    ctx.fillRect(0,H-54,W,54);

    ctx.textAlign='center';
    ctx.strokeStyle='#09080c';
    ctx.lineWidth=10;

    let main='';
    let sub='';
    let mainColor='#ff2d8d';

    if(t<2.0){
      main='ХА-ХА-ХА-ХА!';

    }else if(t<4.4){
      main='КАКИЕ ЖЕ ВЫ НИКЧЁМНЫЕ.';
      sub='СТОЛЬКО БЕЖАЛИ. СТОЛЬКО НАДЕЯЛИСЬ.';

    }else if(t<6.9){
      main='И ВСЁ РАДИ ЧЕГО?';
      sub='КИБО. ШУИЧИ. ВАША ПРЕКРАСНАЯ НАДЕЖДА...';

    }else if(t<9.4){
      main='ВСЁ ОКАЗАЛОСЬ БЕСПОЛЕЗНЫМ.';
      sub='ВЫ ПРАВДА ДУМАЛИ, ЧТО СМОЖЕТЕ ВЫБРАТЬСЯ?';

    }else if(t<11.6){
      main='КАКОЙ ЧУДЕСНЫЙ КОНЕЦ.';

    }else{
      main='ОТЧАЯНИЕ ПОБЕДИЛО.';
      sub='DESPAIR WINS';
      mainColor='#ff3a72';
    }

    ctx.font=
      main.length>28
        ? '900 48px Impact'
        : '900 68px Impact';

    ctx.fillStyle=
      mainColor;

    ctx.strokeText(
      main,
      W/2,
      H-122
    );

    ctx.fillText(
      main,
      W/2,
      H-122
    );

    if(sub){
      ctx.font=
        '900 20px Arial';

      ctx.fillStyle='#fff';

      ctx.strokeText(
        sub,
        W/2,
        H-82
      );

      ctx.fillText(
        sub,
        W/2,
        H-82
      );
    }

    if(t>11.6){
      const q=
        clamp(
          (t-11.6)/1.8,
          0,1
        );

      ctx.fillStyle=
        `rgba(255,0,76,${q*.11})`;

      ctx.fillRect(
        0,0,W,H
      );
    }

    ctx.restore()
  }
}
function draw(){
  ctx.save();if(audioSettings.shake&&shake>.2)ctx.translate(rand(-shake,shake),rand(-shake,shake));
  drawBg();drawMapEvents();coins.forEach(drawCoin);drawItemPickups();drawEnemyWarnings();drawActors();drawMapHitStun();drawJunkoAttacks();drawStunEffects();drawKiiboShooter();drawLaser();drawFx();drawDespairWalls();if(blackoutTimer>0){ctx.fillStyle=`rgba(0,0,0,${.72*(blackoutTimer/2)})`;ctx.fillRect(0,0,W,H)}drawCinematic();ctx.restore();
}



function installIOSZoomGuard(){
  const wrap=document.getElementById('wrap');
  if(!wrap)return;

  // iOS Safari proprietary pinch gesture events.
  ['gesturestart','gesturechange','gestureend'].forEach(type=>{
    wrap.addEventListener(type,e=>{
      e.preventDefault();
    },{passive:false});
  });

  // Double-tap zoom fallback. We only suppress the second quick tap
  // inside the game shell; normal single taps remain untouched.
  let lastTouchEnd=0;
  wrap.addEventListener('touchend',e=>{
    const now=Date.now();
    if(now-lastTouchEnd<=320){
      e.preventDefault();
    }
    lastTouchEnd=now;
  },{passive:false});

  // Never let a two-finger move zoom the canvas.
  wrap.addEventListener('touchmove',e=>{
    if(e.touches&&e.touches.length>1){
      e.preventDefault();
    }
  },{passive:false});
}

const isTouchDevice=
  (
    typeof matchMedia==='function' &&
    matchMedia('(pointer: coarse)').matches
  ) ||
  (
    typeof navigator!=='undefined' &&
    navigator.maxTouchPoints>0
  );

if(isTouchDevice){
  document.body.classList.add(
    'touchDevice'
  );
}

let mobileControlSignature='';

function clearTouchKeys(){
  [
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'ShiftLeft'
  ].forEach(
    code=>keys[code]=false
  );

  document
    .querySelectorAll(
      '.touchKey'
    )
    .forEach(
      b=>b.classList.remove(
        'pressed'
      )
    );
}

function setTouchKey(code,on,button=null){
  keys[code]=!!on;

  if(button){
    button.classList.toggle(
      'pressed',
      !!on
    );
  }
}

function mobilePrimaryAction(){
  unlockGameAudio();

  if(mode==='jumper'){
    bonusJump();
    return;
  }

  if(mode==='shooter'){
    shooterShoot();
    return;
  }

  if(mode==='playing'){
    fartBoost();
  }
}

function mobileSecondaryAction(){
  unlockGameAudio();

  if(mode==='jumper'){
    if(
      bonus &&
      bonus.grounded &&
      bonus.lane>0
    ){
      runnerDropToLowerFloor();
    }
    return;
  }

  if(mode==='shooter'){
    shooterJump();
    return;
  }

  if(mode==='playing'){
    useActiveItem();
  }
}

function updateMobileControls(force=false){
  if(!isTouchDevice||!ui.mobileControls)return;

  const sig=
    `${mode}:${currentStageType}:${!!cinematic}`;

  if(
    !force &&
    sig===mobileControlSignature
  ){
    return;
  }

  mobileControlSignature=sig;

  const playable=
    !cinematic &&
    (
      mode==='playing' ||
      mode==='jumper' ||
      mode==='shooter' ||
      mode==='monokuma'
    );

  ui.mobileControls.classList.toggle(
    'active',
    playable
  );

  ui.mobileControls.setAttribute(
    'aria-hidden',
    playable
      ? 'false'
      : 'true'
  );

  if(!playable){
    clearTouchKeys();
    return;
  }

  ui.mobileDpad.classList.remove(
    'hidden',
    'horizontalOnly'
  );

  ui.mobilePrimary.classList.remove(
    'hidden'
  );

  ui.mobileSecondary.classList.remove(
    'hidden'
  );

  ui.mobileSprint.classList.remove(
    'hidden'
  );

  if(mode==='jumper'){
    ui.mobileDpad.classList.add(
      'hidden'
    );

    ui.mobilePrimary.textContent=
      'ПРЫЖОК';

    ui.mobileSecondary.textContent=
      'ВНИЗ';

    ui.mobileSprint.classList.add(
      'hidden'
    );

  }else if(mode==='shooter'){
    ui.mobileDpad.classList.add(
      'horizontalOnly'
    );

    ui.mobilePrimary.textContent=
      'ОГОНЬ';

    ui.mobileSecondary.textContent=
      'ПРЫЖОК';

    ui.mobileSprint.classList.add(
      'hidden'
    );

  }else if(mode==='monokuma'){
    ui.mobilePrimary.classList.add(
      'hidden'
    );

    ui.mobileSecondary.classList.add(
      'hidden'
    );

    ui.mobileSprint.classList.add(
      'hidden'
    );

  }else{
    ui.mobilePrimary.textContent=
      currentStageType==='junko'
        ? 'РЫВОК'
        : 'РЫВОК';

    ui.mobileSecondary.textContent=
      activeItem
        ? 'ПРЕДМЕТ'
        : 'E';

    ui.mobileSprint.textContent=
      'СПРИНТ';
  }
}

function setupMobileControls(){
  if(!isTouchDevice)return;

  document
    .querySelectorAll(
      '[data-touch-key]'
    )
    .forEach(btn=>{
      const code=
        btn.dataset.touchKey;

      const down=e=>{
        e.preventDefault();
        unlockGameAudio();

        try{
          btn.setPointerCapture(
            e.pointerId
          );
        }catch(err){}

        setTouchKey(
          code,
          true,
          btn
        );
      };

      const up=e=>{
        e.preventDefault();

        setTouchKey(
          code,
          false,
          btn
        );
      };

      btn.addEventListener(
        'pointerdown',
        down
      );

      btn.addEventListener(
        'pointerup',
        up
      );

      btn.addEventListener(
        'pointercancel',
        up
      );

      btn.addEventListener(
        'lostpointercapture',
        up
      );
    });

  ui.mobilePrimary.addEventListener(
    'pointerdown',
    e=>{
      e.preventDefault();
      mobilePrimaryAction();
    }
  );

  ui.mobileSecondary.addEventListener(
    'pointerdown',
    e=>{
      e.preventDefault();
      mobileSecondaryAction();
    }
  );

  ui.fullscreenBtn.addEventListener(
    'click',
    async()=>{
      unlockGameAudio();

      try{
        const wrap=
          document.getElementById(
            'wrap'
          );

        if(!document.fullscreenElement){
          if(wrap.requestFullscreen){
            await wrap.requestFullscreen();
          }
        }else if(document.exitFullscreen){
          await document.exitFullscreen();
        }
      }catch(e){}
    }
  );

  const stopAll=()=>{
    clearTouchKeys();
  };

  addEventListener(
    'blur',
    stopAll
  );

  document.addEventListener(
    'visibilitychange',
    ()=>{
      if(document.hidden){
        stopAll();
      }
    }
  );

  updateMobileControls(true);
}

function loop(now){
  const dt=Math.min(.033,Math.max(0,(now-last)/1000));last=now;
  const visualMode=mode==='paused'?settingsReturnMode:mode;

  updateMobileControls();

  if(mode==='playing')update(dt);
  else if(mode==='jumper')updateJumper(dt);
  else if(mode==='shooter')updateShooter(dt);
  else if(mode==='monokuma')updateMonokuma(dt);
  else if(mode!=='paused'&&mode!=='story'&&mode!=='menu'&&mode!=='dead'&&mode!=='levelup')updateFx(dt);

  if(mode!=='menu'){
    if(visualMode==='jumper')drawJumper();
    else if(visualMode==='shooter')drawShooter();
    else if(visualMode==='monokuma')drawMonokuma();
    else draw();
  }
  requestAnimationFrame(loop);
}

addEventListener('keydown',e=>{
  unlockGameAudio();
  keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();

  if(e.code==='Escape'&&!e.repeat){
    if(ui.settingsScreen.classList.contains('show'))closeSettings();
    else openSettings();
    return;
  }

  if(mode==='paused')return;

  if(mode==='story'){
    if((e.code==='Space'||e.code==='Enter')&&!e.repeat)advanceStory();
    return;
  }
  if(mode==='jumper'){
    if(
      e.code==='Space' &&
      !e.repeat
    ){
      bonusJump();
    }

    // Optional shortcut: down drops from an upper one-way platform.
    if(
      (
        e.code==='KeyS' ||
        e.code==='ArrowDown'
      ) &&
      !e.repeat &&
      bonus &&
      bonus.grounded &&
      bonus.lane>0
    ){
      runnerDropToLowerFloor();
    }

    return;
  }
  if(mode==='shooter'){
    if(e.code==='Space'&&!e.repeat)shooterJump();
    if((e.code==='KeyF'||e.code==='KeyJ')&&!e.repeat)shooterShoot();
    return;
  }

  if(mode==='playing'){
    if(e.code==='Space'&&!e.repeat)fartBoost();
    if(e.code==='KeyE'&&!e.repeat)useActiveItem();
  }
});
addEventListener('keyup',e=>keys[e.code]=false);
document.querySelectorAll('.diffBtn').forEach(b=>b.onclick=()=>{difficulty=b.dataset.diff;document.querySelectorAll('.diffBtn').forEach(x=>x.classList.toggle('selected',x===b))});


ui.storyNextBtn.onclick=()=>{unlockGameAudio();advanceStory()};

canvas.addEventListener('mousemove',e=>{
  const r=canvas.getBoundingClientRect();
  shooterMouse.x=(e.clientX-r.left)*W/r.width;
  shooterMouse.y=(e.clientY-r.top)*H/r.height;
  shooterMouse.active=true;
});
canvas.addEventListener('mousedown',e=>{
  if(mode==='shooter'&&e.button===0){e.preventDefault();shooterShoot()}
});

canvas.addEventListener('pointerdown',e=>{
  if(
    e.pointerType==='touch' &&
    mode==='shooter'
  ){
    e.preventDefault();

    const r=
      canvas.getBoundingClientRect();

    shooterMouse.x=
      (e.clientX-r.left)*
      W/r.width;

    shooterMouse.y=
      (e.clientY-r.top)*
      H/r.height;

    shooterMouse.active=true;

    shooterShoot();
  }
});

ui.settingsBtn.onclick=openSettings;
ui.startSettingsBtn.onclick=openSettings;
ui.closeSettingsBtn.onclick=closeSettings;
ui.musicVolume.oninput=e=>setVolume('music',e.target.value);
ui.sfxVolume.oninput=e=>setVolume('sfx',e.target.value);
ui.voiceVolume.oninput=e=>setVolume('voice',e.target.value);
ui.shakeToggle.onclick=()=>{audioSettings.shake=!audioSettings.shake;applyAudioSettings();saveSettings()};

ui.restartBtn.onclick=()=>{unlockGameAudio();beginNewRunInSlot(activeSaveSlot)};
ui.deathCheckpointBtn.onclick=()=>{unlockGameAudio();loadCheckpoint(activeSaveSlot)};
ui.victoryRestartBtn.onclick=()=>{unlockGameAudio();beginNewRunInSlot(activeSaveSlot)};
ui.victoryMenuBtn.onclick=()=>{unlockGameAudio();goToSaveMenu()};

try{
  activeSaveSlot=clampSaveSlot(
    localStorage.getItem(ACTIVE_SLOT_KEY)||1
  );
}catch(e){
  activeSaveSlot=1;
}

loadSettings();
applyAudioSettings();
migrateLegacyCheckpoint();
refreshSaveSlots();
refreshCheckpointUi();
installIOSZoomGuard();
setupMobileControls();

makeObstacles();
for(let i=0;i<8;i++)spawnCoin();
draw();
ensureLoop();
})();