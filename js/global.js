//--------------------------------------
// グローバル変数
//--------------------------------------

//駒
var gPieces   = [],      //将棋に使われる全駒(TKoma型)
	gInHandPc = [[],[]], //駒台にある駒の数[先後][種別＝TKoma.kind]
//盤
	gTblPcIndex = new Array(256), //位置から駒ID(gPiecesのindex)への逆引き
	gTblSqDepend = new Array(256), //0空白,1先手駒,2後手駒,4壁
	//TODO:1=PLR駒,2=COM駒かも？ 要追跡
//フェーズ
	gCtrlPhase = 0,
	//-1=リセット待ち,0=メニュー選択待ち,1=from入力待ち,2=to入力待ち,3=isNaru入力待ち,4=アニメ→思考→アニメ間
//手番
	gWhichMoves = 0, //0=プレイヤー,1=コンピュータ
//手の選択
	gTheMove,
//人間の候補手関連
	gcCandidateSize = 1024, gCandidateMove, gCandidateCount;

//速さ
var VERYSLOW = 800, SLOW = 600, FAST = 200;

//指し手のボーナスを計算する割合
var BonusRate = 0.5;

//--------------------------------------
// コンストラクタ(グローバル)
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

//--------------------------------------
// 複数ファイル利用サブルーチン
//--------------------------------------

//手番交代
function switchTeban(){
	gWhichMoves = (gWhichMoves==0)? 1 : 0;
}

//指し手バッファ生成(可読短縮化済)
function createSashiteArray(){
	var i=0,z=gcCandidateSize,a=new Array(z);
	while(i<z)a[i++]=new TSashite();
	return a;
}
