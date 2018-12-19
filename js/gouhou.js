
function initialGouhou(){
	//合法手に関する初期化

	//人間の指し手のグローバル変数
	for(var i=0; i<candidateTe.length; i++){
		candidateTe[i] = new TSashite();
	}

}

function makeCandidateTe(gouhouTe){
	//合法手生成
	var gouhouCount = 0;

	//打つ手
	gouhouCount = gouhouDrop(gouhouTe,gouhouCount);

	//盤上の手
	gouhouCount = gouhouMove(gouhouTe,gouhouCount);

	//反則の削除
	gouhouCount = removeIllegalMove(gouhouTe,gouhouCount);

	return(gouhouCount);
}

function makeMoveTe(gouhouTe){
	//動く手だけ生成
	var gouhouCount = 0;

	//盤上の手
	gouhouCount = gouhouMove(gouhouTe,gouhouCount);

	return(gouhouCount);
}

function gouhouDrop(gouhouTe,gouhouCount){
	//打つ手

	//打てるマスを探す
	var dropPos = new Array(81);
	var dropNum = 0;

	for(var i=0; i<blankBan.length; i++){
		if(blankBan[i]==0){
			dropPos[dropNum] = i;
			dropNum++;
		}
	}

	//打つ手を生成
	for(var k=1; k<=7; k++){
		if(mochi[teban][k]>0){
			for(var i=0; i<dropNum; i++){
				gouhouTe[gouhouCount].isUtsu = 1;
				gouhouTe[gouhouCount].MochiKoma = k;
				gouhouTe[gouhouCount].toSuji = Math.floor(dropPos[i] / 16);
				gouhouTe[gouhouCount].toDan = dropPos[i] % 16;
				gouhouTe[gouhouCount].id = findUtsuID(gouhouTe[gouhouCount]);
				gouhouTe[gouhouCount].isOK = true;
				gouhouCount++;
			}
		}
	}

	return(gouhouCount);
}

//14    -18
//15 -1 -17
//16  X -16
//17  1 -15
//18    -14

var OneStep = [
	[],//0
	[-1],//1歩
	[],//2香
	[14,-18],//3桂
	[-1,-17,-15,17,15],//4銀
	[-1,-17,-16,1,16,15],//5金
	[],//6角
	[],//7飛
	[-1,-17,-16,-15,1,17,16,15],//8玉
	[-1,-17,-16,1,16,15],//9と
	[-1,-17,-16,1,16,15],//10杏
	[-1,-17,-16,1,16,15],//11圭
	[-1,-17,-16,1,16,15],//12全
	[],//13
	[-1,-16,1,16],//14馬
	[-17,-15,17,15],//15龍
	[],//16
	[1],//17歩
	[],//18香
	[-14,18],//19桂
	[1,17,15,-17,-15],//20銀
	[1,17,16,-1,-16,-15],//21金
	[],//22角
	[],//23飛
	[-1,-17,-16,-15,1,17,16,15],//24玉
	[1,17,16,-1,-16,-15],//25と
	[1,17,16,-1,-16,-15],//26杏
	[1,17,16,-1,-16,-15],//27圭
	[1,17,16,-1,-16,-15],//28全
	[],//29
	[-1,-16,1,16],//30馬
	[-17,-15,17,15],//31龍
	[] //32
];

var Jump = [
	[],//0
	[],//1歩
	[-1],//2香
	[],//3桂
	[],//4銀
	[],//5金
	[-17,-15,17,15],//6角
	[-1,-16,1,16],//7飛
	[],//8玉
	[],//9と
	[],//10杏
	[],//11圭
	[],//12全
	[],//13
	[-17,-15,17,15],//14馬
	[-1,-16,1,16],//15龍
	[],//16
	[],//17歩
	[1],//18香
	[],//19桂
	[],//20銀
	[],//21金
	[-17,-15,17,15],//22角
	[-1,-16,1,16],//23飛
	[],//24玉
	[],//25と
	[],//26杏
	[],//27圭
	[],//28全
	[],//29
	[-17,-15,17,15],//30馬
	[-1,-16,1,16],//31龍
	[] //32
];

function gouhouMove(gouhouTe,gouhouCount){
	//盤上からの動き

	var komaKind;
	var forwardPos;

	for(var id=0; id<40; id++){
		if(!koma[id].isMochi && koma[id].sengo==teban && koma[id].isUse){
			komaKind = koma[id].kind + (koma[id].isNari?8:0) + 16 * koma[id].sengo;
			//一つずつ
			for(var d=0; d<OneStep[komaKind].length; d++){
				forwardPos = koma[id].pos + OneStep[komaKind][d];//進む位置
				if((blankBan[forwardPos]==0)
				|| (blankBan[forwardPos]==1 && teban==1)
				|| (blankBan[forwardPos]==2 && teban==0)){//敵の駒か空白なら

					gouhouTe[gouhouCount].isUtsu = 0;
					gouhouTe[gouhouCount].fromSuji = Math.floor(koma[id].pos / 16);
					gouhouTe[gouhouCount].fromDan = koma[id].pos % 16;
					gouhouTe[gouhouCount].tottaKoma = idBan[forwardPos];
					gouhouTe[gouhouCount].tottaNari = idBan[forwardPos]==-1 ? -1 : (koma[idBan[forwardPos]].isNari?1:0);
					gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
					gouhouTe[gouhouCount].toDan = forwardPos % 16;
					gouhouTe[gouhouCount].isNaru = 0;
					gouhouTe[gouhouCount].id = id;
					gouhouTe[gouhouCount].isOK = true;
					gouhouCount++;
					//成れるか？
					if(!koma[id].isNari &&
					((forwardPos%16<=3 && teban==0) || (koma[id].pos%16<=3 && teban==0)//先手番
					|| (forwardPos%16>=7 && teban==1) || (koma[id].pos%16>=7 && teban==1))){//後手番
						gouhouTe[gouhouCount].isUtsu = 0;
						gouhouTe[gouhouCount].fromSuji = Math.floor(koma[id].pos / 16);
						gouhouTe[gouhouCount].fromDan = koma[id].pos % 16;
						gouhouTe[gouhouCount].tottaKoma = idBan[forwardPos];
						gouhouTe[gouhouCount].tottaNari = idBan[forwardPos]==-1 ? -1 : (koma[idBan[forwardPos]].isNari?1:0);
						gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
						gouhouTe[gouhouCount].toDan = forwardPos % 16;
						gouhouTe[gouhouCount].isNaru = 1;
						gouhouTe[gouhouCount].id = id;
						gouhouTe[gouhouCount].isOK = true;
						gouhouCount++;
					}
				}
			}
			//ジャンプ
			for(var d=0; d<Jump[komaKind].length; d++){
				forwardPos = koma[id].pos;
				isJumpable = true;
				while(isJumpable){
					forwardPos += Jump[komaKind][d];//進む位置
					if(blankBan[forwardPos]==0){//空白なら
						gouhouTe[gouhouCount].isUtsu = 0;
						gouhouTe[gouhouCount].fromSuji = Math.floor(koma[id].pos / 16);
						gouhouTe[gouhouCount].fromDan = koma[id].pos % 16;
						gouhouTe[gouhouCount].tottaKoma = idBan[forwardPos];
						gouhouTe[gouhouCount].tottaNari = idBan[forwardPos]==-1 ? -1 : (koma[idBan[forwardPos]].isNari?1:0);
						gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
						gouhouTe[gouhouCount].toDan = forwardPos % 16;
						gouhouTe[gouhouCount].isNaru = 0;
						gouhouTe[gouhouCount].id = id;
						gouhouTe[gouhouCount].isOK = true;
						gouhouCount++;
						//成れるか？
						if(!koma[id].isNari &&
						((forwardPos%16<=3 && teban==0) || (koma[id].pos%16<=3 && teban==0)//先手番
						|| (forwardPos%16>=7 && teban==1) || (koma[id].pos%16>=7 && teban==1))){//後手番
							gouhouTe[gouhouCount].isUtsu = 0;
							gouhouTe[gouhouCount].fromSuji = Math.floor(koma[id].pos / 16);
							gouhouTe[gouhouCount].fromDan = koma[id].pos % 16;
							gouhouTe[gouhouCount].tottaKoma = idBan[forwardPos];
							gouhouTe[gouhouCount].tottaNari = idBan[forwardPos]==-1 ? -1 : (koma[idBan[forwardPos]].isNari?1:0);
							gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
							gouhouTe[gouhouCount].toDan = forwardPos % 16;
							gouhouTe[gouhouCount].isNaru = 1;
							gouhouTe[gouhouCount].id = id;
							gouhouTe[gouhouCount].isOK = true;
							gouhouCount++;
						}
					}else if((blankBan[forwardPos]==1 && teban==1)
					|| (blankBan[forwardPos]==2 && teban==0)){//敵の駒なら
						gouhouTe[gouhouCount].isUtsu = 0;
						gouhouTe[gouhouCount].fromSuji = Math.floor(koma[id].pos / 16);
						gouhouTe[gouhouCount].fromDan = koma[id].pos % 16;
						gouhouTe[gouhouCount].tottaKoma = idBan[forwardPos];
						gouhouTe[gouhouCount].tottaNari = idBan[forwardPos]==-1 ? -1 : (koma[idBan[forwardPos]].isNari?1:0);
						gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
						gouhouTe[gouhouCount].toDan = forwardPos % 16;
						gouhouTe[gouhouCount].isNaru = 0;
						gouhouTe[gouhouCount].id = id;
						gouhouTe[gouhouCount].isOK = true;
						gouhouCount++;
						//成れるか？
						if(!koma[id].isNari &&
						((forwardPos%16<=3 && teban==0) || (koma[id].pos%16<=3 && teban==0)//先手番
						|| (forwardPos%16>=7 && teban==1) || (koma[id].pos%16>=7 && teban==1))){//後手番
							gouhouTe[gouhouCount].isUtsu = 0;
							gouhouTe[gouhouCount].fromSuji = Math.floor(koma[id].pos / 16);
							gouhouTe[gouhouCount].fromDan = koma[id].pos % 16;
							gouhouTe[gouhouCount].tottaKoma = idBan[forwardPos];
							gouhouTe[gouhouCount].tottaNari = idBan[forwardPos]==-1 ? -1 : (koma[idBan[forwardPos]].isNari?1:0);
							gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
							gouhouTe[gouhouCount].toDan = forwardPos % 16;
							gouhouTe[gouhouCount].isNaru = 1;
							gouhouTe[gouhouCount].id = id;
							gouhouTe[gouhouCount].isOK = true;
							gouhouCount++;
						}
						isJumpable = false;
					}else{
						//動けない
						isJumpable = false;
					}
				}
			}
		}
	}

	return(gouhouCount);
}

function removeIllegalMove(gouhouTe,gouhouCount){
	//反則の手に注釈をつけて消す

	//王手放置
	var utsuId;
	var gouhouForOuteCount;
	var gouhouForOuteTe = Array(GouhouNum);
	for(var i=0; i<gouhouForOuteTe.length; i++){
		gouhouForOuteTe[i] = new TSashite();
	}
	var disCount = 0;
	for(var i=0; i<gouhouCount; i++){
		utsuId = findUtsuID(gouhouTe[i]);
		forwardState(gouhouTe[i],teban,utsuId);//内部で進める
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		gouhouForOuteCount = makeMoveTe(gouhouForOuteTe);
		for(var j=0; j<gouhouForOuteCount; j++){
			if(gouhouForOuteTe[j].tottaKoma!=-1){
				if(koma[gouhouForOuteTe[j].tottaKoma].kind==8){//玉を取ることができるなら
					gouhouTe[i].isOK = "王様が取られてしまうにゃ";
					disCount++;
					break;
				}
			}
		}
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		backwardState(gouhouTe[i],teban,utsuId);//内部で戻す
	}

	//行き所のない駒
	var komaId,komaKind;
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK==true){
			komaId = gouhouTe[i].id;
			komaKind = koma[komaId].kind;
			if(teban==0 && komaKind==1 &&
			((!koma[komaId].isNari && gouhouTe[i].isNaru==0) || gouhouTe[i].isUtsu==1)){//先手・歩
				if(gouhouTe[i].toDan==1){
					gouhouTe[i].isOK = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(teban==1 && komaKind==1 &&
			((!koma[komaId].isNari && gouhouTe[i].isNaru==0) || gouhouTe[i].isUtsu==1)){//後手・歩
				if(gouhouTe[i].toDan==9){
					gouhouTe[i].isOK = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(teban==0 && komaKind==2 &&
			((!koma[komaId].isNari && gouhouTe[i].isNaru==0) || gouhouTe[i].isUtsu==1)){//先手・香
				if(gouhouTe[i].toDan==1){
					gouhouTe[i].isOK = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(teban==1 && komaKind==2 &&
			((!koma[komaId].isNari && gouhouTe[i].isNaru==0) || gouhouTe[i].isUtsu==1)){//後手・香
				if(gouhouTe[i].toDan==9){
					gouhouTe[i].isOK = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(teban==0 && komaKind==3 &&
			((!koma[komaId].isNari && gouhouTe[i].isNaru==0) || gouhouTe[i].isUtsu==1)){//先手・桂
				if(gouhouTe[i].toDan<=2){
					gouhouTe[i].isOK = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(teban==1 && komaKind==3 &&
			((!koma[komaId].isNari && gouhouTe[i].isNaru==0) || gouhouTe[i].isUtsu==1)){//後手・桂
				if(gouhouTe[i].toDan>=8){
					gouhouTe[i].isOK = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}
		}
	}

	//二歩
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK==true){
			komaId = gouhouTe[i].id;
			if(gouhouTe[i].isUtsu==1 && gouhouTe[i].MochiKoma==1){
				for(var j=0; j<40; j++){
					if(koma[j].isUse
					&& teban==koma[j].sengo
					&& koma[j].kind==1
					&& !koma[j].isNari
					&& !koma[j].isMochi
					&& Math.floor(koma[j].pos/16)==gouhouTe[i].toSuji){

						gouhouTe[i].isOK = "歩がある筋に歩は打てないにゃ";
						disCount++;
						break;
					}
				}
			}
		}
	}

	//うち歩づめ
	var escapable,catchable;
	var gouhouForTodomeCount;
	var gouhouForTodomeTe = Array(GouhouNum);
	for(var i=0; i<gouhouForTodomeTe.length; i++){
		gouhouForTodomeTe[i] = new TSashite();
	}
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK==true){
			if(gouhouTe[i].isUtsu==1 && gouhouTe[i].MochiKoma==1){
				if((teban==0 && (koma[39].pos+1)==(gouhouTe[i].toSuji*16+gouhouTe[i].toDan))//先手の歩
				|| (teban==1 && (koma[19].pos-1)==(gouhouTe[i].toSuji*16+gouhouTe[i].toDan))){//後手の歩

					escapable = false;//逃げられないかもしれない
					utsuId = findUtsuID(gouhouTe[i]);
					forwardState(gouhouTe[i],teban,utsuId);//内部で進める//とりあえず歩を打つ
					if(teban==0){teban=1;}else{teban=0;}//手番交代
					gouhouForOuteCount = makeMoveTe(gouhouForOuteTe);
					for(var j=0; j<gouhouForOuteCount; j++){//相手が何か動かす
						catchable = false;//取れないかもしれない
						forwardState(gouhouForOuteTe[j],teban,-1);//内部で進める
						if(teban==0){teban=1;}else{teban=0;}//手番交代
						gouhouForTodomeCount = makeMoveTe(gouhouForTodomeTe);
						for(var k=0; k<gouhouForTodomeCount; k++){//玉がとれるかどうか
							if(gouhouForTodomeTe[k].tottaKoma!=-1){
								if(koma[gouhouForTodomeTe[k].tottaKoma].kind==8){//玉を取ることができるなら
									catchable = true;//玉が取れる
									break;
								}
							}
						}
						if(teban==0){teban=1;}else{teban=0;}//手番交代
						backwardState(gouhouForOuteTe[j],teban,-1);//内部で戻す
						if(catchable==false){escapable = true; break;}//取れなかった
					}
					if(teban==0){teban=1;}else{teban=0;}//手番交代
					backwardState(gouhouTe[i],teban,utsuId);//内部で戻す
					if(escapable==false){
						gouhouTe[i].isOK = "歩を打って詰ましてはだめにゃ";
						disCount++;
						break;
					}
				}
			}
		}
	}

	//金と玉は裏返らない
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK==true){
			if((koma[gouhouTe[i].id].kind==5 || koma[gouhouTe[i].id].kind==8)
			&& gouhouTe[i].isNaru==1
			&& gouhouTe[i].isUtsu==0){
				gouhouTe[i].isOK = "裏返せないにゃ";
				disCount++;
			}
		}
	}

	return(gouhouCount);
}

function findUtsuID(oneTe){
	//打つときに駒のidを返す

	if(oneTe.isUtsu){//打つ
		for(var id=0; id<40; id++){
			if(koma[id].kind==oneTe.MochiKoma
			&& koma[id].isUse
			&& koma[id].isMochi
			&& koma[id].sengo==teban){

				return(id);
			}
		}
	}

	//打たない
	return(-1);
}




