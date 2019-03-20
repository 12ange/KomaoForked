[komao]:http://www.geocities.jp/komao81/

# こまおForked

この repository "こまおForked" は、とにかく弱いコンピュータ将棋ソフトウェア(ウェブページ)[「こまお」][komao] を

* Yahoo!ジオシティーズが終了する前に保護しておく
  * [Yahoo!ジオシティーズ サービス終了のお知らせ](https://info-geocities.yahoo.co.jp/close/index.html) - 2019年3月31日に閲覧不能になる
* 原開発者が残したマイナーエラーを修正する
* 棋譜出力したい (けれど kif? ki2? 形式がいくつかあるらしい)
  * (叡王戦は kif で配布されているようなのでそっちがデファクトスタンダードなのかしら)

ために立ち上げたものです。

元のソースコードは いっくん さん ( [Twitter](https://twitter.com/ikkn), [はてなブログ](http://tihara.hateblo.jp/) ← [HatenaDiary](http://d.hatena.ne.jp/tihara/) ) に帰属します。
> HatenaDiaryは [2019年2月28日に凍結、6月30日にはてなブログへの完全移行完了を予定](http://d.hatena.ne.jp/hatenadiary/20181113/1542071987) している。この時 [はてなブログに自動移行される](http://d.hatena.ne.jp/hatenadiary/20181004/1538636539) とはあるものの、既にはてなブログを開設しているアカウントにHatenaDiary記事が合流されるのかは不明。

> HatenaDiary の前に Google+ で日記を残していたらしいがリンク切れ (かつ、こちらも2019年4月に個人向けサービス終了予定)

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

### homeAppended - 自家機能拡張版

homePatched から更に見た目の変更を伴う機能の追加拡張を施したものです。
前述の棋譜出力機能はこのタイミングで……行いました。

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

## おまけ：棋譜ファイル形式
どちらもテキスト(非バイナリ)ファイル。

### 柿木将棋や竜王戦、叡王戦などなど ".kif", ".kifu"
> [柿木さん本人による解説](http://kakinoki.o.oo7.jp/kif_format.html)

こっちがデファクトスタンダード。

+ String型はUTF-8相当なので、拡張子`.kifu`で👍
+ 1行目のコメントは大抵、`# ---- ${appName} 棋譜ファイル ----`ってな感じなのでそうする

### 金沢将棋やfloodgate ".csa" 形式
> [CSA標準棋譜ファイル形式 V2.2](http://www2.computer-shogi.org/protocol/record_v22.html)

成り立ちにより、コンピュータ同士の対局では業界標準。

+ UnicodeでもSJISでもどんとこい……というかnotationで使う文字が 0x00-0x7f に収まってる
  + けれど読む側がどの文字コードでも対応しているとは限らないため、出力全文字を 0x00-0x7f に収めるのが良さそう(に思ったので、そうした)
