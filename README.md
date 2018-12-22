[komao]:http://www.geocities.jp/komao81/

# こまおForked

この repository "こまおForked" は、とても弱いコンピュータ将棋ソフトウェア(ウェブページ)[「こまお」][komao] を

* Yahoo!ジオシティーズが終了する前に保護しておく
  * [Yahoo!ジオシティーズ サービス終了のお知らせ](https://info-geocities.yahoo.co.jp/close/index.html)
* 原開発者が残したマイナーエラーを修正する
* (棋譜出力したいけれど kif? ki2? 形式がいくつかあるらしい)
  * (叡王戦は kif で配布されているようなのでそっちがデファクトスタンダードなのかしら)

ために立ち上げたものです。

元のソースコードは いっくん さん ( [Twitter](https://twitter.com/ikkn), [はてなブログ](http://tihara.hateblo.jp/) ) に帰属します。

----

## 各ブランチとその説明

### basisVersion - 基底版

いっくん さんが作られた「こまお」オリジナルのソースコードです。(この README が唯一の追加ファイルです)
但し、以下の2点は除去しました。

* Yahoo!ジオシティーズによって自動挿入されたコード
* アクセスカウンター

### homePatched - 自家修正版

basisVersion を基準に

* 画像キャッシュを行うときに発生していたエラーの修正
* コードの意味を変えない程度のマイナーなブラッシュアップ

を施したものです。

### ※RESERVED※ homeAppended - 自家機能拡張版

homePatched から更に見た目の変更を伴う機能の追加拡張を施したものです。
(前述の棋譜出力機能はこのタイミングで行います)

### master === 公開されるrepository

上記の中から一番新しいブランチを(仮に)masterに置きます。ページ公開はオリジナルの[「こまお」][komao]が公開終了されるまでは非公開の設定にするつもりです。

----

## おまけ：将棋用語とその英訳

see: [Wikipedia(en) Shogi](https://en.wikipedia.org/wiki/Shogi)

|日本語|英語|
----|----
|手番|turn|
|駒|piece|
|持ち駒|captured piece(s) ; piece(s) in hand|
|手|move|
|(盤上の)駒を指す|move a piece (on the board)|
|駒を打つ|drop a piece|
|成-る|promote -ion|
|王手|check|
|詰み|checkmate ; mate|
