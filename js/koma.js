//駒初期化
function initialKoma(){
	gPieces[ 0] = new TKoma( 0,1,7,1,0,1);
	gPieces[ 1] = new TKoma( 1,2,7,1,0,1);
	gPieces[ 2] = new TKoma( 2,3,7,1,0,1);
	gPieces[ 3] = new TKoma( 3,4,7,1,0,1);
	gPieces[ 4] = new TKoma( 4,5,7,1,0,1);
	gPieces[ 5] = new TKoma( 5,6,7,1,0,1);
	gPieces[ 6] = new TKoma( 6,7,7,1,0,1);
	gPieces[ 7] = new TKoma( 7,8,7,1,0,1);
	gPieces[ 8] = new TKoma( 8,9,7,1,0,1);
	gPieces[ 9] = new TKoma( 9,1,9,2,0,1);
	gPieces[10] = new TKoma(10,9,9,2,0,1);
	gPieces[11] = new TKoma(11,2,9,3,0,1);
	gPieces[12] = new TKoma(12,8,9,3,0,1);
	gPieces[13] = new TKoma(13,3,9,4,0,1);
	gPieces[14] = new TKoma(14,7,9,4,0,1);
	gPieces[15] = new TKoma(15,4,9,5,0,1);
	gPieces[16] = new TKoma(16,6,9,5,0,1);
	gPieces[17] = new TKoma(17,8,8,6,0,1);
	gPieces[18] = new TKoma(18,2,8,7,0,1);
	gPieces[19] = new TKoma(19,5,9,8,0,1);
	gPieces[20] = new TKoma(20,1,3,1,1,1);
	gPieces[21] = new TKoma(21,2,3,1,1,1);
	gPieces[22] = new TKoma(22,3,3,1,1,1);
	gPieces[23] = new TKoma(23,4,3,1,1,1);
	gPieces[24] = new TKoma(24,5,3,1,1,1);
	gPieces[25] = new TKoma(25,6,3,1,1,1);
	gPieces[26] = new TKoma(26,7,3,1,1,1);
	gPieces[27] = new TKoma(27,8,3,1,1,1);
	gPieces[28] = new TKoma(28,9,3,1,1,1);
	gPieces[29] = new TKoma(29,1,1,2,1,1);
	gPieces[30] = new TKoma(30,9,1,2,1,1);
	gPieces[31] = new TKoma(31,2,1,3,1,1);
	gPieces[32] = new TKoma(32,8,1,3,1,1);
	gPieces[33] = new TKoma(33,3,1,4,1,1);
	gPieces[34] = new TKoma(34,7,1,4,1,1);
	gPieces[35] = new TKoma(35,4,1,5,1,1);
	gPieces[36] = new TKoma(36,6,1,5,1,1);
	gPieces[37] = new TKoma(37,2,2,6,1,1);
	gPieces[38] = new TKoma(38,8,2,7,1,1);
	gPieces[39] = new TKoma(39,5,1,8,1,1);

	//持ち駒初期化
	for(var i=0; i<2; i++){
		for(var j=0; j<9; j++){
			gInHandPc[i][j] = 0;
		}
	}
}

//最大値最小値の範囲に畳み込む
function getValueMinMax(test,min,max){
	if(test < min) return min;
	if(max < test) return max;
	return test;
}

//駒を落とす
function komaOtosu(removeNum){

	//駒落とし順 [角,飛,香L,香R,桂L,桂R,銀L,銀R,金L,金R]
	var orderOtosuIdx = [38,37,29,30,31,32,33,34,35,36];

	//引数を畳みつつ(念の為に)整数化
	removeNum = getValueMinMax(removeNum, 0, orderOtosuIdx.length)|0;

	//落とす。
	while(removeNum>0){ gPieces[ orderOtosuIdx[--removeNum] ].isUse = false; }
}

//内部の状態の初期化
function initialState(){
	var i,suji,dan;

	//idナンバー
	for(i=0; i<gTblPcIndex.length; i++){
		//一度全てを-1にする
		gTblPcIndex[i] = -1;
	}
	for(i=0; i<gPieces.length; i++){
		//使う駒ならidナンバーをふる
		if(gPieces[i].isUse){
			gTblPcIndex[gPieces[i].pos] = i;
		}
	}

	//0空白・1先手・2後手・4壁
	for(i=0; i<gTblSqDepend.length; i++){
		//全てを壁か空白にする
		suji = i >>> 4;
		dan = i & 15;
		if((1<=suji) && (suji<=9) && (1<=dan) && (dan<=9)){
			gTblSqDepend[i] = 0;//空白
		}else{
			gTblSqDepend[i] = 4;//壁
		}
	}
	for(i=0; i<gPieces.length; i++){
		//使う駒なら先後を記録
		if(gPieces[i].isUse){
			if(gPieces[i].sengo==0){//先手
				gTblSqDepend[gPieces[i].pos] = 1;
			}else{//後手
				gTblSqDepend[gPieces[i].pos] = 2;
			}
		}
	}
}
