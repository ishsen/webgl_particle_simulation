// Standard Normal variate using Box-Muller transform.
function randn_bm(mean, std) {
  var u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  var pre_transform =
    Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return pre_transform * std + mean;
}

function calc_susceptibility() {
  return randn_bm(1, 0.1);
}

function calc_infectivity() {
  return randn_bm(1, 0.1);
}
