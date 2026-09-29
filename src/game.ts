import {MISSIONS, Mission, targetX, targetY, solveShot, windDrift, flightTime} from './ballistics.js';
const canvas=document.querySelector<HTMLCanvasElement>('#game')!;
const ctx=canvas.getContext('2d')!;
const $=(id:string)=>document.getElementById(id)!;
const overlay=$('overlay'), action=$('action'), feedback=$('feedback');
let level=0,shots=3,mode:'intro'|'playing'|'result'|'complete'='intro';
let time=0,last=0,holding=false,aimX=195,aimY=280,startX=0,startY=0,downTime=0;
let hitPoint:{x:number,y:number,good:boolean,until:number}|null=null;
let audio:AudioContext|null=null;
function sound(freq:number,duration:number,type:OscillatorType='sine'){
 try{audio??=new AudioContext();const o=audio.createOscillator(),gain=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.38),audio.currentTime+duration);gain.gain.setValueAtTime(.09,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(gain).connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}catch{}
}
const W=390,H=700;
function resize(){const dpr=Math.min(window.devicePixelRatio||1,3),b=canvas.getBoundingClientRect();canvas.width=Math.round(b.width*dpr);canvas.height=Math.round(b.height*dpr);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0)}
new ResizeObserver(resize).observe(canvas);resize();
function hud(){const m=MISSIONS[level];$('mission').textContent=`${String(level+1).padStart(2,'0')} / 08`;$('mission-name').textContent=m.name;$('range').textContent=`${m.range} M`;$('wind').textContent=m.wind===0?'CALM':`${m.wind>0?'→':'←'} ${Math.abs(m.wind).toFixed(1)} M/S`;$('shots').textContent=Array.from({length:3},(_,i)=>i<shots?'●':'○').join(' ');$('progress').textContent=`${String(level+1).padStart(2,'0')} — 08`}
function panel(tag:string,title:string,copy:string,label:string){$('overlay-tag').textContent=tag;$('overlay-title').innerHTML=title;$('overlay-copy').textContent=copy;action.innerHTML=`${label} <span>↗</span>`;overlay.classList.remove('hidden')}
function begin(){shots=MISSIONS[level].shots;time=0;aimX=195;aimY=285;holding=false;hitPoint=null;mode='playing';hud();overlay.classList.add('hidden');last=performance.now()}
action.addEventListener('click',()=>{if(mode==='complete')level=0;begin();sound(530,.1)});
function f(message:string){feedback.textContent=message;feedback.classList.remove('show');void feedback.offsetWidth;feedback.classList.add('show')}
function fire(){if(mode!=='playing')return;const m=MISSIONS[level];shots--;const r=solveShot(m,time,aimX,aimY);hitPoint={x:r.impactX,y:r.impactY,good:r.hit,until:time+1.15};sound(r.hit?390:95,r.hit?.28:.22,r.hit?'sine':'sawtooth');f(r.hit?'TARGET DOWN':'MISSED');hud();if(r.hit){mode='result';window.setTimeout(()=>{if(mode!=='result')return;if(level===MISSIONS.length-1){mode='complete';panel('OPERATION COMPLETE','ALL CLEAR.<br><em>WELL SHOT.</em>','Eight targets down. Want another run?','PLAY AGAIN')}else{level++;mode='result';hud();const next=MISSIONS[level];panel('TARGET ELIMINATED','CLEAN<br><em>SHOT.</em>',`Next: ${next.name}. ${next.range}m out. ${next.wind===0?'No wind.':`Wind ${Math.abs(next.wind).toFixed(1)} m/s ${next.wind>0?'right':'left'}.`} Three rounds.`,`NEXT MISSION ${String(level+1).padStart(2,'0')}`)}},850)}else if(shots===0){mode='result';window.setTimeout(()=>{if(mode==='result')panel('OUT OF ROUNDS','TAKE<br><em>ANOTHER LOOK.</em>','Hold to steady. The round drifts with the wind, drops, and takes time to reach moving targets.','RETRY MISSION')},800)}}
canvas.addEventListener('pointerdown',e=>{if(mode!=='playing')return;e.preventDefault();canvas.setPointerCapture(e.pointerId);holding=true;startX=e.clientX;startY=e.clientY;downTime=performance.now();sound(230,.08)});
canvas.addEventListener('pointermove',e=>{if(!holding||mode!=='playing')return;e.preventDefault();const b=canvas.getBoundingClientRect();aimX=Math.max(30,Math.min(360,aimX+(e.clientX-startX)*W/b.width/1.65));aimY=Math.max(100,Math.min(590,aimY+(e.clientY-startY)*H/b.height/1.65));startX=e.clientX;startY=e.clientY});
canvas.addEventListener('pointerup',e=>{if(!holding)return;e.preventDefault();holding=false;fire()});canvas.addEventListener('pointercancel',()=>holding=false);
window.addEventListener('blur',()=>holding=false);
function line(points:number[][],color:string,width=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(const p of points.slice(1))ctx.lineTo(p[0],p[1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function terrain(y:number,amp:number,frequency:number,color:string,offset:number){ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W+8;x+=8)ctx.lineTo(x,y+Math.sin(x*frequency+offset)*amp+Math.cos(x*frequency*.53+offset)*amp*.6);ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=color;ctx.fill()}
function scene(m:Mission,t:number){
 const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#163745');sky.addColorStop(.42,'#42686a');sky.addColorStop(.65,'#9e9b77');sky.addColorStop(1,'#223e3a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#d5b88a';ctx.globalAlpha=.48;ctx.beginPath();ctx.arc(296,153,47,0,7);ctx.fill();ctx.globalAlpha=1;
 for(let i=0;i<4;i++)terrain(220+i*43,17+i*6,.014+i*.002,['#527377','#45636a','#385559','#2c4849'][i],i*2);
 // distant industrial gantry and target track
 ctx.fillStyle='#172f34';ctx.fillRect(37,315,315,5);ctx.fillRect(51,319,7,68);ctx.fillRect(337,319,7,68);
 for(let i=0;i<7;i++){const x=43+i*48;line([[x,317],[x+15,352],[x,352]],'#203d3e',2)}
 terrain(380,19,.028,'#284b48',1.8);terrain(456,26,.035,'#173936',.2);terrain(535,17,.035,'#0d2d2f',2.6);
 // silhouette with a readable high-contrast center
 const x=targetX(m,t),y=targetY(m,t);
 ctx.fillStyle='#020d14';ctx.beginPath();ctx.ellipse(x,y-14,8,10,0,0,7);ctx.fill();ctx.fillRect(x-7,y-6,14,23);ctx.fillRect(x-11,y+15,8,19);ctx.fillRect(x+3,y+15,8,19);ctx.fillRect(x-13,y-2,6,18);ctx.fillRect(x+7,y-2,6,18);
 ctx.fillStyle='#e5a95a';ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill();
 // close foreground shadows, sight lines
 ctx.fillStyle='#0b2427';ctx.beginPath();ctx.moveTo(0,700);ctx.lineTo(0,600);ctx.lineTo(65,630);ctx.lineTo(165,700);ctx.fill();ctx.beginPath();ctx.moveTo(390,700);ctx.lineTo(390,560);ctx.lineTo(330,608);ctx.lineTo(240,700);ctx.fill();
 ctx.fillStyle='#ffffff10';for(let i=0;i<24;i++){const xx=(i*127.4)%390,yy=(i*193.7+t*3)%700;ctx.fillRect(xx,yy,1,1)}
}
function scope(m:Mission){const cx=195,cy=355,r=169,zoom=1.8;ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();ctx.fillStyle='#17272d';ctx.fillRect(cx-r,cy-r,r*2,r*2);
 ctx.translate(cx-aimX*zoom,cy-aimY*zoom);ctx.scale(zoom,zoom);scene(m,time);ctx.restore();
 ctx.fillStyle='#06131bc0';ctx.beginPath();ctx.rect(0,0,W,H);ctx.arc(cx,cy,r,0,Math.PI*2,true);ctx.fill('evenodd');
 ctx.strokeStyle='#0a171a';ctx.lineWidth=13;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();ctx.strokeStyle='#d3ed9b';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(cx,cy,r-8,0,7);ctx.stroke();
 line([[cx-r+14,cy],[cx-23,cy]],'#d5eda6',1);line([[cx+23,cy],[cx+r-14,cy]],'#d5eda6',1);line([[cx,cy-r+14],[cx,cy-23]],'#d5eda6',1);line([[cx,cy+23],[cx,cy+r-14]],'#d5eda6',1);
 ctx.strokeStyle='#eaf6d6';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,10,0,7);ctx.stroke();ctx.fillStyle='#d9f57e';ctx.fillRect(cx-1,cy-1,2,2);
 for(let i=-3;i<=3;i++){if(!i)continue;line([[cx+i*26,cy-4],[cx+i*26,cy+4]],'#d5eda6',1);line([[cx-4,cy+i*26],[cx+4,cy+i*26]],'#d5eda6',1)}
 ctx.fillStyle='#d9f57e';ctx.font='11px monospace';ctx.fillText('× 1.8',34,146);ctx.fillText(`FLIGHT ${flightTime(m.range).toFixed(2)} S`,260,146);ctx.fillText(`DRIFT ${windDrift(m.wind,m.range)>0?'+':''}${windDrift(m.wind,m.range).toFixed(0)}`,34,553);
 // Beat through reticle displays a tension gauge
 const charge=Math.min(1,(performance.now()-downTime)/550);ctx.fillStyle='#c8e88c77';ctx.fillRect(127,575,136,3);ctx.fillStyle='#d9f57e';ctx.fillRect(127,575,136*charge,3);
}
function idleReticle(){const cx=195,cy=345;ctx.strokeStyle='#e1ebc6aa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,18,0,7);ctx.stroke();line([[cx-34,cy],[cx-21,cy]],'#e1ebc6');line([[cx+21,cy],[cx+34,cy]],'#e1ebc6');line([[cx,cy-34],[cx,cy-21]],'#e1ebc6');line([[cx,cy+21],[cx,cy+34]],'#e1ebc6')}
function frame(now:number){const delta=Math.min((now-last)/1000,.05);last=now;if(mode==='playing')time+=Math.max(0,delta);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);const m=MISSIONS[level];scene(m,time);if(mode==='playing'){if(holding)scope(m);else idleReticle();if(hitPoint&&hitPoint.until>time){const p=hitPoint;ctx.strokeStyle=p.good?'#d9f57e':'#ff917c';ctx.lineWidth=2;line([[p.x-10,p.y-10],[p.x+10,p.y+10]],ctx.strokeStyle,2);line([[p.x+10,p.y-10],[p.x-10,p.y+10]],ctx.strokeStyle,2)}}requestAnimationFrame(frame)}requestAnimationFrame(frame);hud();
