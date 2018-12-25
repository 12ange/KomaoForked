//--------------------------------------
// グローバル変数
//--------------------------------------

//駒
var gPieces = [], gInHandPc = [[],[]];

//盤
var idBan = new Array(256), blankBan = new Array(256);

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
var GouhouNum = 1024, candidateTe = new Array(GouhouNum), candidateCount;

//速さ
var VERYSLOW = 800, SLOW = 600, FAST = 200;

//指し手のボーナスを計算する割合
var BonusRate = 0.5;

//--------------------------------------
//コンストラクタ(グローバル)
//--------------------------------------

//駒
var TKoma = function TKoma(idNum,suji,dan,kind,sengo,use){
	this.idNum = idNum;         //駒のid番号
	this.pos = 16 * suji + dan; //位置・持ち駒は-1
	this.kind = kind;           //[1..8]=[歩,香,桂,銀,金,角,飛,玉]
	this.sengo = sengo;         //0:先手, 1:後手
	this.isUse = !!use;         //この駒を使うかどうか

	this.isNari = false;        //false:生,   true:成
	this.isMochi = false;       //false:盤上, true:持ち
}

//指し手
var TSashite = function TSashite(){
	this.isUtsu = 0;
	this.fromSuji = 0;
	this.fromDan = 0;
	this.MochiKoma = 0;
	this.tottaKoma = 0; //駒IDが入る？
	this.tottaNari = false; //TKoma.isNariのコピー。.tottaKomaが有効なIDなら参照される
	this.toSuji = 0;
	this.toDan = 0;
	this.isNaru = false;
	this.id = -1;
	this.isOK = true;       //合法手生成時に使用
	this.strWhyNoGood = ""; //合法手生成時に使用
}
