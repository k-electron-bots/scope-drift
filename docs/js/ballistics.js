export const MISSIONS = [
    { name: 'WARM-UP', range: 120, wind: 0, speed: 0, radius: 18, shots: 3, phase: 0 },
    { name: 'CROSSWIND', range: 180, wind: 1.2, speed: 0, radius: 15, shots: 3, phase: 0 },
    { name: 'MOVING TARGET', range: 230, wind: 0.4, speed: 1, radius: 15, shots: 3, phase: 0.8 },
    { name: 'THE RIDGE', range: 290, wind: -1.8, speed: 1.25, radius: 13, shots: 3, phase: 1.4 },
    { name: 'NARROW WINDOW', range: 340, wind: 1.5, speed: 1.55, radius: 11, shots: 3, phase: 2 },
    { name: 'COLD FRONT', range: 410, wind: -2.4, speed: 1.8, radius: 10, shots: 3, phase: 0.5 },
    { name: 'THE RUNNER', range: 470, wind: 2.1, speed: 2.2, radius: 9, shots: 3, phase: 1 },
    { name: 'LAST LIGHT', range: 550, wind: -2.8, speed: 2.45, radius: 8, shots: 3, phase: 2.6 }
];
// All coordinates are in a fixed 390 x 700 world. Time is seconds, independent of frame rate.
export const flightTime = (range) => 0.16 + range / 900;
export const windDrift = (wind, range) => wind * Math.pow(flightTime(range), 2) * 29;
export const targetX = (m, time) => 195 + 92 * Math.sin(time * m.speed + m.phase);
export const targetY = (m, time) => 285 + 20 * Math.sin(time * m.speed * 0.42 + m.phase * 0.7);
export function solveShot(m, time, aimX, aimY) {
    const travel = flightTime(m.range);
    const impactX = aimX + windDrift(m.wind, m.range);
    const impactY = aimY + m.range * .018;
    const x = targetX(m, time + travel), y = targetY(m, time + travel);
    return { impactX, impactY, targetX: x, targetY: y, travel, hit: Math.hypot(impactX - x, impactY - y) <= m.radius };
}
