# DeathSwap
古いプラグインの要素を統合版にて再現することにすることに挑戦
### create by Delta_conveyor
- MIT ライセンスはアドオン自体に内蔵されているのでライセンスのためのクレジットは不要です
## scripts
- JoinE.js → プレイヤーの参加・退出イベント処理（タグ付けや管理）
- gamescripts/ フォルダ内
- - gamedamon.js → ゲーム進行管理（開始・終了や他スクリプト制御）
- - tpcode.js → スワップのTP処理（円順列に基づいた入れ替え）
- - board.js → スコアボードやGUI的な情報表示
- - notjoins.js → 非参加プレイヤーの観戦システム
- - firsttp.js → 初期ランダムTP処理
- Config.js → UIを通じた設定・ゲーム開始トリガー
- itemsScript.js → 追加アイテムの機能を追加