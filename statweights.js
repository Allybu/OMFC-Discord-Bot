const k = 6.18
const t = 6.56
const m = 6.42
const v = 6.22

const s = 1566

let a,b,c,d;

s = k*a + t*b + m*c + v*d;

a = (s - t*b - m*c - v*d) / k;
b = (s - k*a - m*c - v*d) / t;
c = (s - k*a - t*b - v*d) / m;
d = (s - k*a - t*b - m*c) / v;



a = (s - t*b - m*c - v*d) / k;