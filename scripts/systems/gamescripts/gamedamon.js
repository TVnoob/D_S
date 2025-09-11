// gamedamon.js
import { world, system } from "@minecraft/server";
import { mainPlayers, setupSpectatorList } from "./notjoins";
import { redistributeItems } from "../JoinE.js";
import { isHost, getHostId } from "../getowuner.js";
import { setupBoard, stopBoard } from "./board.js";
import { CONFIG_KEY } from "../config.js";
import { doFirstTP } from "./firsttp.js";

// === グローバル管理用変数 ===
export let startedGame = false;        // ゲームが開始されているかどうか
export const joinedPlayers = new Map(); // 参加プレイヤー (id → player)

// === スクリプトイベント受信 ===
export function startgameinthedeathswapsurvivalminigame(){
    system.afterEvents.scriptEventReceive.subscribe((ev) => {
        if (ev.id === "ds:start") {
            if (startedGame) {
                ev.sourceEntity?.sendMessage("§eゲームはすでに開始されています。");
                return;
            }
            startGame();
        }
    });
}

// === ゲーム開始処理 ===
function startGame() {
    joinedPlayers.clear();
    startedGame = true;
    world.sendMessage("§3現在、このアドオンはアルファ版です。効果音などは無く、予期せぬ動作が起こるかもしれません。");
    world.sendMessage("§eゲームが開始されました");

    // 全プレイヤーを取得
    const players = world.getPlayers();
    world.getDimension("overworld").runCommand("gamerule falldamage false");

    for (const player of players) {
        if (player.hasTag("entry")) {
            // 参加プレイヤーとして登録
            joinedPlayers.set(player.id, player);

            // 念のため spec タグ削除
            if (player.hasTag("spec")) {
                player.removeTag("spec");
            }
            player.sendMessage("§aあなたはゲームに参加しました!");
        } else {
            // entry タグがない → 強制観戦者
            if (!player.hasTag("spec")) {
                player.addTag("spec");
            }
            player.sendMessage("§7観戦者として登録されました。");
        }
    }
    
    world.sendMessage(`§e参加人数: ${joinedPlayers.size}人`);
    doFirstTP(joinedPlayers);
    setupBoard();
    setupSpectatorList();
    setTimeout(() => {
        world.getDimension("overworld").runCommand("gamerule falldamage true")
    }, 5000);
}
export function ingorestopgame(){
    world.beforeEvents.chatSend.subscribe((ev) => {
        const player = ev.sender;
        const msg = ev.message.trim();

        if (msg === "!dsstop") {
            ev.cancel = true;

            if (isHost(player.id)) {
                player.sendMessage("§c[Death_Swap] あなたはオーナーではないため実行できません。");
                return;
            }

            if (!startedGame) {
                player.sendMessage("§e[Death_Swap] ゲームは開始されていません。");
                return;
            }

            // 緊急停止処理
            startedGame = false;
            joinedPlayers.clear();
            mainPlayers.length = 0;

            redistributeItems(); // アイテムを再配布
            world.sendMessage("§c[Death_Swap] ゲームが緊急停止されました。");
            stopBoard();
        }

        if (msg === "!D_Creset") {
            ev.cancel = true;

            if (isHost(player.id)) {
                player.sendMessage("§c[Death_Swap] あなたはオーナーではないため実行できません。");
                return;
            }

            world.setDynamicProperty(CONFIG_KEY, JSON.stringify({}));

            world.sendMessage("§c[Debug-System] clear config");
        }

        if (msg === "!D_startA") {
            ev.cancel = true;

            if (isHost(player.id)) {
                player.sendMessage("§c[Death_Swap] あなたはオーナーではないため実行できません。");
                return;
            }

            setupBoard();
            world.sendMessage("§c[Debug-System] Start script of the action bar");
        }

        if (msg === "!D_stopA") {
            ev.cancel = true;

            if (isHost(player.id)) {
                player.sendMessage("§c[Death_Swap] あなたはオーナーではないため実行できません。");
                return;
            }

            stopBoard();
            world.sendMessage("§c[Debug-System] Stop script of the action bar");
        }

    })
}

export function Endgame(){

    world.sendMessage("§b勝者が決定しました");
    world.sendMessage("§b");// 勝者を発表する
    redistributeItems();
    stopBoard();
}