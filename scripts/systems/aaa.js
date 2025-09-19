import { world, system } from '@minecraft/server';

let dimension;
world.afterEvents.worldLoad.subscribe(() => {
    dimension = world.getDimension(overworld);
});
export function loadfunction001(){
world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
    const { player, block, itemStack } = ev;
    system.runTimeout(() => {
        if (typeof itemStack == 'undefined') return;
        if (block.typeId == 'minecraft:iron_door') {
            let location = block.location;
            location.y = location.y - 4;
            const chest = dimension.getBlock(location);
            if (chest.typeId == 'minecraft:furnace') {
                const container = chest.getComponent('inventory').container;
                const keyItem = container.getItem(0);
                if (typeof keyItem == 'undefined') return;
                if (itemStack.typeId == keyItem.typeId) {
                    location.y = block.location.y - 3;
                    dimension.setBlockType(location, 'minecraft:redstone_torch');
                    try {
                        player.runCommand('clear @s ' + itemStack.typeId + ' 0 1');
                    } catch (e) { }
                }
            }
        }
    });
});
}