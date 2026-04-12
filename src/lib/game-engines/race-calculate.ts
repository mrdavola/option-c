// Race & Calculate — set speed/angle to hit a target distance.

import type { ThemeConfig, MathParams, GameVariant } from "./engine-types"
import { baseTemplate } from "./base-template"

export function raceCalculateEngine(config: ThemeConfig, math: MathParams, variant: GameVariant = "classic"): string {
  const c = config.colors
  const gameContent = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title}</h2><p>You are a <strong>${config.character}</strong> in a <strong>${config.worldName}</strong>.</p><p>Set the speed to land the ${config.itemName} in the target zone!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Play →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>A target distance is shown. Set the speed using the slider. The ${config.itemName} travels for a fixed time. Speed × time = distance. Hit the target zone!</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title}</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea">
  <div style="width: 90%; max-width: 500px; text-align: center;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span style="font-size: 14px; opacity: 0.6;">Target distance: <strong id="targetDist" style="color: ${c.accent};">?</strong></span>
      <span style="font-size: 14px; opacity: 0.6;">Time: <strong id="timeVal" style="color: ${c.primary};">?</strong> sec</span>
    </div>
    <!-- Track -->
    <div style="position: relative; height: 60px; background: ${c.secondary}11; border: 1px solid ${c.secondary}33; border-radius: 8px; margin-bottom: 16px; overflow: hidden;">
      <div id="targetZone" style="position: absolute; top: 0; bottom: 0; background: ${c.accent}22; border-left: 2px solid ${c.accent}; border-right: 2px solid ${c.accent};"></div>
      <div id="projectile" style="position: absolute; top: 50%; left: 0; width: 20px; height: 20px; background: ${c.primary}; border-radius: 50%; transform: translateY(-50%); transition: left 1s linear;"></div>
      <!-- Start label -->
      <div style="position: absolute; bottom: 2px; left: 4px; font-size: 10px; color: ${c.text}44;">0</div>
    </div>
    <!-- Speed control -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 14px; opacity: 0.6; margin-bottom: 4px;">Set speed</div>
      <input type="range" id="speedSlider" min="1" max="20" value="5" style="width: 80%; accent-color: ${c.primary};">
      <div style="font-size: 24px; font-weight: 700; color: ${c.primary};"><span id="speedVal">5</span> per sec</div>
      <div style="font-size: 14px; opacity: 0.5;">Distance = <span id="speedVal2">5</span> × <span id="timeVal2">?</span> = <strong id="calcDist">?</strong></div>
    </div>
    <button id="launchBtn" onclick="launch()" style="padding: 12px 40px; background: ${c.accent}; color: ${c.bg}; border: none; border-radius: 8px; font-family: inherit; font-size: 18px; font-weight: 700; cursor: pointer;">Launch!</button>
  </div>
</div>
<script>
const TOTAL_ROUNDS = 5; let currentRound = 0, targetDist = 0, timeVal = 0, trackWidth = 0, maxDist = 0;
const slider = document.getElementById('speedSlider');
slider.oninput = () => { document.getElementById('speedVal').textContent = slider.value; document.getElementById('speedVal2').textContent = slider.value; document.getElementById('calcDist').textContent = parseInt(slider.value) * timeVal; };
function launch() {
  const speed = parseInt(slider.value);
  const dist = speed * timeVal;
  const pct = Math.min(dist / maxDist, 1);
  document.getElementById('projectile').style.left = (pct * 100) + '%';
  document.getElementById('launchBtn').disabled = true;
  setTimeout(() => {
    const diff = Math.abs(dist - targetDist);
    const tolerance = currentRound < 2 ? targetDist * 0.15 : targetDist * 0.1;
    if (diff <= tolerance) {
      window.gameScore += 10*(currentRound+1); document.getElementById('scoreDisplay').textContent = window.gameScore;
      const area = document.getElementById('gameArea'); const rect = area.getBoundingClientRect();
      spawnParticles(rect.left+rect.width/2, rect.top+rect.height/2, '${c.accent}', 12); addCombo();
      showScorePopup(rect.left+rect.width/2, rect.top+50, diff===0?'Perfect!':'Close enough!');
      const dots = document.querySelectorAll('.round-dot'); if(dots[currentRound]) dots[currentRound].classList.add('done');
      currentRound++; if(currentRound>=TOTAL_ROUNDS){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(startRound,1000);}
    } else {
      screenShake(); resetCombo(); trackFail();
      showScorePopup(window.innerWidth/2, window.innerHeight/2, dist>targetDist?'Too far! ('+dist+')':'Too short! ('+dist+')');
      setTimeout(()=>{document.getElementById('projectile').style.left='0';document.getElementById('launchBtn').disabled=false;},800);
    }
  }, 1100);
}
function startRound() { resetFails();
  timeVal = currentRound < 2 ? 2 : currentRound < 4 ? 3 : 4;
  const maxSpeed = currentRound < 2 ? 10 : 20;
  const correctSpeed = Math.floor(Math.random() * (maxSpeed - 2)) + 2;
  targetDist = correctSpeed * timeVal;
  maxDist = maxSpeed * timeVal;
  slider.max = maxSpeed; slider.value = Math.floor(maxSpeed / 2);
  document.getElementById('speedVal').textContent = slider.value;
  document.getElementById('speedVal2').textContent = slider.value;
  document.getElementById('timeVal').textContent = timeVal;
  document.getElementById('timeVal2').textContent = timeVal;
  document.getElementById('calcDist').textContent = parseInt(slider.value) * timeVal;
  document.getElementById('targetDist').textContent = targetDist;
  // Target zone on track
  const tolerance = currentRound < 2 ? 0.15 : 0.1;
  const zonePct = targetDist / maxDist;
  const zoneWidth = tolerance * 2;
  const tz = document.getElementById('targetZone');
  tz.style.left = Math.max(0, (zonePct - tolerance)) * 100 + '%';
  tz.style.width = zoneWidth * 100 + '%';
  document.getElementById('projectile').style.left = '0';
  document.getElementById('launchBtn').disabled = false;
  const dots = document.querySelectorAll('.round-dot'); dots.forEach((d,i)=>{d.classList.remove('current');if(i===currentRound)d.classList.add('current');});
}
function startGame(){
</script>`
  // VARIANT B: Speed Trap — calculate speed from distance and time
  if (variant === "variantB") {
    const vB = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Speed Trap</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. A ${config.itemName} zooms past checkpoints. Calculate its speed!</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Catch it! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>You see the distance between two checkpoints and the time it took. Calculate: speed = distance ÷ time. Type your answer!</p><h3>Example</h3><p>Distance = 20, Time = 4 → Speed = 20 ÷ 4 = 5 ✅</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Speed Trap</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:400px;">
  <div style="font-size:14px;opacity:.6;margin-bottom:16px;">Calculate the speed!</div>
  <div style="display:flex;justify-content:center;gap:24px;margin-bottom:20px;">
    <div style="background:${c.primary}11;border:2px solid ${c.primary}44;border-radius:12px;padding:16px;"><div style="font-size:11px;opacity:.5;">Distance</div><div id="distVal" style="font-size:32px;font-weight:700;color:${c.primary};"></div></div>
    <div style="font-size:24px;color:${c.text}33;align-self:center;">÷</div>
    <div style="background:${c.accent}11;border:2px solid ${c.accent}44;border-radius:12px;padding:16px;"><div style="font-size:11px;opacity:.5;">Time</div><div id="timeVal" style="font-size:32px;font-weight:700;color:${c.accent};"></div></div>
    <div style="font-size:24px;color:${c.text}33;align-self:center;">=</div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
      <div style="font-size:11px;opacity:.5;">Speed</div>
      <input type="number" id="speedAnswer" style="width:80px;font-size:28px;font-weight:700;text-align:center;background:${c.bg};color:${c.text};border:3px solid ${c.secondary};border-radius:12px;padding:8px;font-family:inherit;outline:none;" placeholder="?">
    </div>
  </div>
  <button onclick="checkSpeed()" style="padding:12px 36px;background:${c.primary};color:${c.bg};border:none;border-radius:8px;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;">Check!</button>
  <div id="feedback" style="margin-top:12px;font-size:14px;min-height:20px;"></div>
</div></div>
<script>
const TR=5;let cr=0,correctSpeed=0;
function checkSpeed(){const v=parseFloat(document.getElementById('speedAnswer').value);if(isNaN(v)){showScorePopup(window.innerWidth/2,window.innerHeight/2,'Enter a number!');return;}
  if(Math.abs(v-correctSpeed)<0.1){window.gameScore+=10*(cr+1);document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',12);addCombo();
  showScorePopup(window.innerWidth/2,100,'+'+(10*(cr+1)));document.getElementById('feedback').style.color='${c.accent}';document.getElementById('feedback').textContent='Correct! Speed = '+correctSpeed;
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(sr,800);}}
  else{screenShake();resetCombo();trackFail();document.getElementById('feedback').style.color='${c.danger}';document.getElementById('feedback').textContent='Remember: speed = distance ÷ time';setTimeout(()=>{document.getElementById('feedback').textContent='';},1500);}}
function sr(){resetFails();document.getElementById('speedAnswer').value='';document.getElementById('feedback').textContent='';
  const distances=cr<2?[10,12,15,20,24]:[30,36,42,48,60,72];const times=cr<2?[2,3,4,5]:[3,4,6,8,9,12];
  const dist2=distances[Math.floor(Math.random()*distances.length)];const time2=times[Math.floor(Math.random()*times.length)];correctSpeed=dist2/time2;
  // Ensure clean division
  if(correctSpeed!==Math.floor(correctSpeed)){const t2=[2,3,4,5,6];const tm=t2[Math.floor(Math.random()*t2.length)];const sp2=Math.floor(Math.random()*8)+2;correctSpeed=sp2;document.getElementById('distVal').textContent=sp2*tm;document.getElementById('timeVal').textContent=tm+'s';}
  else{document.getElementById('distVal').textContent=dist2;document.getElementById('timeVal').textContent=time2+'s';}
  document.getElementById('speedAnswer').focus();
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
document.addEventListener('keydown',(e)=>{if(e.key==='Enter')checkSpeed();});
</script>`
    return baseTemplate(config, vB, variant, 40)
  }

  // VARIANT C: Catch Up — you're behind, set the right speed to catch the leader
  if (variant === "variantC") {
    const vC = `
<div class="intro-overlay" id="intro"><div class="intro-box"><h2>${config.title} — Catch Up</h2><p>You are a <strong>${config.character}</strong> in <strong>${config.worldName}</strong>. The leader is ahead! Set your speed to catch them in exactly the right time.</p><button class="intro-start" onclick="document.getElementById('intro').remove(); startGame()">Chase! →</button></div></div>
<div id="helpPanel" class="help-panel"><div class="help-content"><h3>How to play</h3><p>The leader is X units ahead and you have T seconds. Set your speed so you cover exactly X units in T seconds. Speed = distance ÷ time.</p><button class="help-close" onclick="document.getElementById('helpPanel').classList.remove('open')">Got it</button></div></div>
<div class="game-header"><div class="game-title">${config.title} — Catch Up</div><div class="game-stats"><span>Score: <strong id="scoreDisplay">0</strong></span><div class="round-dots" id="roundDots"></div></div></div>
<div class="game-area" id="gameArea"><div style="text-align:center;width:90%;max-width:420px;">
  <div id="scenario" style="font-size:16px;color:${c.text};margin-bottom:16px;line-height:1.6;"></div>
  <div style="font-size:14px;opacity:.6;margin-bottom:8px;">What speed do you need?</div>
  <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:16px;">
    <input type="number" id="speedIn" style="width:100px;font-size:28px;font-weight:700;text-align:center;background:${c.bg};color:${c.text};border:3px solid ${c.primary};border-radius:12px;padding:8px;font-family:inherit;outline:none;" placeholder="?">
    <span style="font-size:16px;color:${c.text}80;">per second</span>
  </div>
  <button onclick="checkCatch()" style="padding:12px 36px;background:${c.accent};color:${c.bg};border:none;border-radius:8px;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;">Go!</button>
  <div id="feedback" style="margin-top:12px;font-size:14px;min-height:20px;"></div>
</div></div>
<script>
const TR=5;let cr=0,correctS=0;
function checkCatch(){const v=parseFloat(document.getElementById('speedIn').value);if(isNaN(v)){showScorePopup(window.innerWidth/2,window.innerHeight/2,'Enter a number!');return;}
  if(Math.abs(v-correctS)<0.1){window.gameScore+=10*(cr+1);document.getElementById('scoreDisplay').textContent=window.gameScore;spawnParticles(window.innerWidth/2,window.innerHeight/2,'${c.accent}',12);addCombo();
  document.getElementById('feedback').style.color='${c.accent}';document.getElementById('feedback').textContent='You caught them! Speed = '+correctS;
  const d=document.querySelectorAll('.round-dot');if(d[cr])d[cr].classList.add('done');cr++;if(cr>=TR){setTimeout(()=>showVictory('${config.winMessage}'),600);}else{setTimeout(sr,800);}}
  else{screenShake();resetCombo();trackFail();document.getElementById('feedback').style.color='${c.danger}';document.getElementById('feedback').textContent=v>correctS?'Too fast — you passed them!':'Too slow — they got away!';setTimeout(()=>{document.getElementById('feedback').textContent='';},1500);}}
function sr(){resetFails();document.getElementById('speedIn').value='';document.getElementById('feedback').textContent='';
  const times=[2,3,4,5,6];const t=times[Math.floor(Math.random()*times.length)];correctS=Math.floor(Math.random()*8)+2;const gap=correctS*t;
  document.getElementById('scenario').innerHTML='The leader is <strong style="color:${c.accent};">'+gap+' units</strong> ahead.<br>You have <strong style="color:${c.primary};">'+t+' seconds</strong> to catch them.';
  document.getElementById('speedIn').focus();
  const d=document.querySelectorAll('.round-dot');d.forEach((x,i)=>{x.classList.remove('current');if(i===cr)x.classList.add('current');});}
function startGame(){const dc=document.getElementById('roundDots');dc.innerHTML='';for(let i=0;i<TR;i++){const d=document.createElement('div');d.className='round-dot';dc.appendChild(d);}sr();}
document.addEventListener('keydown',(e)=>{if(e.key==='Enter')checkCatch();});
</script>`
    return baseTemplate(config, vC, variant, 40)
  }

  return baseTemplate(config, gameContent, variant, 40)
}
