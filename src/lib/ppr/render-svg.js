import { arches } from './clinical-rules.js';
import { toothCoordinates } from './biomechanics.js';

export function toothPathByNumber(number) {
  const digit = number % 10;
  if ([6, 7, 8].includes(digit)) return 'M -18 -14 Q -23 -2 -15 15 Q 0 24 15 15 Q 23 -2 18 -14 Q 8 -23 0 -17 Q -8 -23 -18 -14 Z';
  if ([4, 5].includes(digit)) return 'M -14 -15 Q -17 -2 -11 16 Q 0 22 11 16 Q 17 -2 14 -15 Q 0 -22 -14 -15 Z';
  if (digit === 3) return 'M -12 -17 Q -13 -2 -9 17 Q 0 24 9 17 Q 13 -2 12 -17 Q 0 -27 -12 -17 Z';
  return 'M -10 -16 Q -12 0 -8 18 Q 0 22 8 18 Q 12 0 10 -16 Q 0 -21 -10 -16 Z';
}

export function getToothPoint(arch, number) {
  return toothCoordinates[arch][number] || [0, 0];
}

export function archViewBox() {
  return '0 0 800 320';
}

export function areaPolygon(arch, area) {
  const points = area.teeth.map((number) => getToothPoint(arch, number));
  if (!points.length) return '';
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const minX = Math.min(...xs) - 28;
  const maxX = Math.max(...xs) + 28;
  const minY = Math.min(...ys) - 26;
  const maxY = Math.max(...ys) + 26;
  return `${minX},${minY} ${maxX},${minY} ${maxX},${maxY} ${minX},${maxY}`;
}

export function connectorPath(arch, connector) {
  if (arch === 'upper') {
    if (connector === 'Ferradura') return 'M 210 205 C 310 95 490 95 590 205';
    if (connector === 'Dupla cinta / anteroposterior') return 'M 230 170 C 330 110 470 110 570 170 M 240 230 C 340 185 460 185 560 230';
    if (connector === 'Placa palatina') return 'M 220 170 C 320 82 480 82 580 170 C 545 245 455 270 400 270 C 345 270 255 245 220 170 Z';
    return 'M 230 195 C 330 145 470 145 570 195';
  }
  if (connector === 'Placa lingual') return 'M 230 135 C 330 205 470 205 570 135 M 260 160 C 345 205 455 205 540 160';
  return 'M 250 155 C 335 225 465 225 550 155';
}

export function archLabel(arch) {
  return arches[arch].label;
}
