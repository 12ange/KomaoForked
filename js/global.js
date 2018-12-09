//グローバル変数

//駒
var koma = Array();
var mochi = Array();
mochi[0] = Array();
mochi[1] = Array();

//盤
var idBan = Array(256);
var blankBan = Array(256);

//フェーズ
var controlPhase = 0;
//-1:リセット待機
//0:メニュー選択の待機
//1:from入力の待機
//2:to入力の待機
//3:isNaru入力の待機
//4:アニメーション中→思考中→アニメーション中

//手番
var teban = 0;
//0:先手入力待ち
//1:後手入力待ち

//手の選択
var te;

//人間の合法手
var GouhouNum = 1024;
var candidateTe = Array(GouhouNum);
var candidateCount;

//速さ
var VERYSLOW = 800;
var SLOW = 600;
var FAST = 200;

//指し手のボーナスを計算する割合
var BonusRate = 0.5;

