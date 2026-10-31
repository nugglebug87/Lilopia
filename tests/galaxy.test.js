const test = require('node:test');
const assert = require('node:assert/strict');
require('../src/core.js'); require('../src/data.js'); require('../src/logic.js');
const {logic, PRODUCTS, SCENES, LOCATIONS} = globalThis.L;
test('Galaxy rejects simulated, development and forged ownership while default game retains it', () => {
  const pid = Object.keys(PRODUCTS).find(k => PRODUCTS[k].available);
  const s=logic.newGame();
  try {
    for (const value of ['dev','simulated',true,'verified']) {
      s.owned[pid]=value;
      globalThis.LILOPIA_DISTRIBUTION='galaxy';
      assert.equal(logic.isOwned(s,pid),false);
      assert.equal(logic.isLocked(s,'loc:'+PRODUCTS[pid].location),true);
      globalThis.LILOPIA_DISTRIBUTION='default';
      assert.equal(logic.isOwned(s,pid),true);
    }
  } finally { delete globalThis.LILOPIA_DISTRIBUTION; }
});
test('Galaxy save migration returns players from premium scenes and retains starter progress',()=>{
 const s=logic.newGame(); const sid=Object.keys(SCENES).find(k=>LOCATIONS[k.split('/')[0]].product);
 s.scene=sid; s.chars[0].scene=sid; s.owned={exp_dream_mansion:'dev'}; s.coins=147;
 try {
  globalThis.LILOPIA_DISTRIBUTION='galaxy';
  const migrated=logic.migrate(JSON.parse(logic.serialize(s)));
  assert.equal(migrated.scene,'home/living'); assert.equal(migrated.chars[0].scene,'home/living');
  assert.deepEqual(migrated.owned,{}); assert.equal(migrated.coins,147);
 } finally { delete globalThis.LILOPIA_DISTRIBUTION; }
});
