# DeathSwap
### [リソースパック](https://github.com/TVnoob/D_S-RE)
古いプラグインの要素を統合版にて再現することにすることに挑戦
### [リソースパック](https://github.com/TVnoob/D_S-RE)
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
## commands
- !tp = 観戦者のみ使用可能、生き残っているプレイヤーにtpできる
- !dsstop = ワールドホストのみ使用可能、ゲームを強制終了する
# 注意点
- ワールドが閉じられると設定がリセットされる可能性があります
- 現在、ディメンションはオーバーワールドに限定されています。ネザーなどに行った場合不具合が発生します
