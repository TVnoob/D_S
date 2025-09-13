import { world, system, ItemStack, BlockPermutation, Player } from "@minecraft/server";
export function loadsystem002(){
world.afterEvents.itemUse.subscribe(arg => {
  if (arg.itemStack.typeId === 'nico:speed') {
    arg.source.runCommand('effect @p speed 9999 1 true');
    arg.source.runCommand('particle minecraft:knockback_roar_particle ~ ~ ~');
    arg.source.runCommand('clear @p nico:speed 0 1');
  }
});


world.afterEvents.itemUse.subscribe(arg => {
  if (arg.itemStack.typeId === 'nico:enmaku') {
    arg.source.runCommand('effect @p invisibility 5 1 true');
    arg.source.runCommand('effect @p weakness 5 255 true');
    arg.source.runCommand('particle minecraft:knockback_roar_particle ~ ~ ~');
    arg.source.runCommand('clear @p nico:enmaku 0 1');
  }
});


world.afterEvents.itemUse.subscribe(arg => {
  if (arg.itemStack.typeId === 'nico:ritudou') {
    arg.source.runCommand('effect @p strength 15 1 true');
    arg.source.runCommand('particle minecraft:knockback_roar_particle ~ ~ ~');
    arg.source.runCommand('clear @p nico:ritudou 0 1');
  }
});


world.afterEvents.itemUse.subscribe(arg => {
  if (arg.itemStack.typeId === 'nico:yuuki') {
    arg.source.runCommand('effect @p resistance 15 1 true');
    arg.source.runCommand('particle minecraft:knockback_roar_particle ~ ~ ~');
    arg.source.runCommand('clear @p nico:yuuki 0 1');
  }
});


world.afterEvents.itemUse.subscribe(arg => {
  if (arg.itemStack.typeId === 'nico:superu') {
    arg.source.runCommand('effect @p resistance 15 255 true');
    arg.source.runCommand('particle minecraft:knockback_roar_particle ~ ~ ~');
    arg.source.runCommand('clear @p nico:superu 0 1');
  }
});
}