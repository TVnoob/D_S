import { world, system } from "@minecraft/server";

function stunGrenade(location) {
    system.run(() => {
    const dimension = world.getDimension("overworld");
    const system01players = dimension.getPlayers({ 
        location: { x: location.x, y: location.y -1 , z: location.z },
        maxDistance: 2,
        tags: ["参加者"]
    });
    for (const pl of system01players) {
        dimension.runCommand("say sucsess!"); // (pl, 'stunTime', 100) の部分はスコアボードのコマンドで、stunTimeという名前をスコアボードに追加する感じなのかな?
        // 一応サンプルで dimension.runCommand("scoreboard players set stunTime <ボード名> 100");
        pl.runCommand('effect @s slowness 5 255 ');
    }
    dimension.spawnParticle('minecraft:large_explosion', location);
    dimension.playSound('firework.blast', location, { volume: 5 });
    });
}
export function Detecthit00154(){
    world.afterEvents.projectileHitEntity.subscribe(ev => {
    const { location, projectile, source } = ev;
    const entity = ev.getEntityHit()?.entity;
    if (projectile.typeId == 'nico:nenchaku') stunGrenade(ev.location);
});

    world.afterEvents.projectileHitBlock.subscribe(ev => {
    const { location, projectile } = ev;
    if (projectile.typeId == 'nico:nenchaku') stunGrenade(ev.location);
});
    world.beforeEvents.chatSend.subscribe((ev) => {
        const player = ev.sender;
        //const loc = { x: location.x, y: location.y -1 , z: location.z };
        const msg = ev.message.trim();

        if (msg === "!test") { // デバッグ用
            ev.cancel = true;
            stunGrenade(player.location);
        }
});
}
// main.js には Detecthit00154 をインポート