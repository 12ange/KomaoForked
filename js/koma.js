

function Koma(idNum,suji,dan,kind,sengo,use){
	//駒コンストラクタ
	this.pos = 16 * suji + dan;//位置//持ち駒は-1
	this.kind = kind;
	this.isNari = 0;//0:生, 1:成
	this.isMochi = 0;//0:盤上, 1:持ち
	this.sengo = sengo;//0:先手, 1:後手
	this.idNum = idNum;//駒のid番号
	this.isUse = use;//この駒を使うかどうか
}

function initialKoma(){
	//駒初期化
	koma[0] = new Koma(0,1,7,1,0,1);
	koma[1] = new Koma(1,2,7,1,0,1);
	koma[2] = new Koma(2,3,7,1,0,1);
	koma[3] = new Koma(3,4,7,1,0,1);
	koma[4] = new Koma(4,5,7,1,0,1);
	koma[5] = new Koma(5,6,7,1,0,1);
	koma[6] = new Koma(6,7,7,1,0,1);
	koma[7] = new Koma(7,8,7,1,0,1);
	koma[8] = new Koma(8,9,7,1,0,1);
	koma[9] = new Koma(9,1,9,2,0,1);
	koma[10] = new Koma(10,9,9,2,0,1);
	koma[11] = new Koma(11,2,9,3,0,1);
	koma[12] = new Koma(12,8,9,3,0,1);
	koma[13] = new Koma(13,3,9,4,0,1);
	koma[14] = new Koma(14,7,9,4,0,1);
	koma[15] = new Koma(15,4,9,5,0,1);
	koma[16] = new Koma(16,6,9,5,0,1);
	koma[17] = new Koma(17,8,8,6,0,1);
	koma[18] = new Koma(18,2,8,7,0,1);
	koma[19] = new Koma(19,5,9,8,0,1);
	koma[20] = new Koma(20,1,3,1,1,1);
	koma[21] = new Koma(21,2,3,1,1,1);
	koma[22] = new Koma(22,3,3,1,1,1);
	koma[23] = new Koma(23,4,3,1,1,1);
	koma[24] = new Koma(24,5,3,1,1,1);
	koma[25] = new Koma(25,6,3,1,1,1);
	koma[26] = new Koma(26,7,3,1,1,1);
	koma[27] = new Koma(27,8,3,1,1,1);
	koma[28] = new Koma(28,9,3,1,1,1);
	koma[29] = new Koma(29,1,1,2,1,1);
	koma[30] = new Koma(30,9,1,2,1,1);
	koma[31] = new Koma(31,2,1,3,1,1);
	koma[32] = new Koma(32,8,1,3,1,1);
	koma[33] = new Koma(33,3,1,4,1,1);
	koma[34] = new Koma(34,7,1,4,1,1);
	koma[35] = new Koma(35,4,1,5,1,1);
	koma[36] = new Koma(36,6,1,5,1,1);
	koma[37] = new Koma(37,2,2,6,1,1);
	koma[38] = new Koma(38,8,2,7,1,1);
	koma[39] = new Koma(39,5,1,8,1,1);

	//持ち駒初期化
	for(var i=0; i<2; i++){
		for(var j=0; j<9; j++){
			mochi[i][j] = 0;
		}
	}

}

function komaOtosu(removeNum){
	//駒を落とす

	if(removeNum==0){//落とさない
		return;
	}else if(removeNum==2){
		koma[37].isUse = 0;
		koma[38].isUse = 0;
	}else if(removeNum==4){
		koma[37].isUse = 0;
		koma[38].isUse = 0;
		koma[29].isUse = 0;
		koma[30].isUse = 0;
	}else if(removeNum==6){
		koma[37].isUse = 0;
		koma[38].isUse = 0;
		koma[29].isUse = 0;
		koma[30].isUse = 0;
		koma[31].isUse = 0;
		koma[32].isUse = 0;
	}else if(removeNum==8){
		koma[37].isUse = 0;
		koma[38].isUse = 0;
		koma[29].isUse = 0;
		koma[30].isUse = 0;
		koma[31].isUse = 0;
		koma[32].isUse = 0;
		koma[33].isUse = 0;
		koma[34].isUse = 0;
	}else if(removeNum==10){
		koma[37].isUse = 0;
		koma[38].isUse = 0;
		koma[29].isUse = 0;
		koma[30].isUse = 0;
		koma[31].isUse = 0;
		koma[32].isUse = 0;
		koma[33].isUse = 0;
		koma[34].isUse = 0;
		koma[35].isUse = 0;
		koma[36].isUse = 0;
	}
}

function initialState(){
	//内部の状態の初期化

	//idナンバー
	for(var i=0; i<idBan.length; i++){
		//一度全てを-1にする
		idBan[i] = -1;
	}
	for(var i=0; i<koma.length; i++){
		//使う駒ならidナンバーをふる
		if(koma[i].isUse){
			idBan[koma[i].pos] = i;
		}
	}

	var suji,dan;

	//0空白・1先手・2後手・4壁
	for(var i=0; i<blankBan.length; i++){
		//全てを壁か空白にする
		suji = Math.floor(i / 16);
		dan = i % 16;
		if((1<=suji) && (suji<=9) && (1<=dan) && (dan<=9)){
			blankBan[i] = 0;//空白
		}else{
			blankBan[i] = 4;//壁
		}
	}
	for(var i=0; i<koma.length; i++){
		//使う駒なら先後を記録
		if(koma[i].isUse){
			if(koma[i].sengo==0){//先手
				blankBan[koma[i].pos] = 1;
			}else{//後手
				blankBan[koma[i].pos] = 2;
			}
		}
	}

}


