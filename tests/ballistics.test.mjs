import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS, flightTime, windDrift, targetX, targetY, solveShot} from '../docs/js/ballistics.js';
test('flight time and drift increase with range',()=>{
 assert.ok(flightTime(500)>flightTime(100));
 assert.ok(windDrift(2,500)>windDrift(2,100));
 assert.ok(windDrift(-2,300)<0);
});
test('centered still target is a hit at short range',()=>{
 const m=MISSIONS[0],t=1;
 const result=solveShot(m,t,targetX(m,t),targetY(m,t)-m.range*.018);
 assert.equal(result.hit,true);
});
test('lead and wind compensation hit a moving target',()=>{
 const m=MISSIONS[6],t=3;
 const aimX=targetX(m,t+flightTime(m.range))-windDrift(m.wind,m.range);
 const aimY=targetY(m,t+flightTime(m.range))-m.range*.018;
 assert.equal(solveShot(m,t,aimX,aimY).hit,true);
 assert.equal(solveShot(m,t,targetX(m,t),targetY(m,t)).hit,false);
});
test('all missions fit visible playfield',()=>{
 for(const m of MISSIONS) for(let t=0;t<10;t+=.13) {
  assert.ok(targetX(m,t)>90&&targetX(m,t)<300);
  assert.ok(targetY(m,t)>240&&targetY(m,t)<330);
 }
});
