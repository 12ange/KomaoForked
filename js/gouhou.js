
function initCandidMove(){
	//合法手に関する初期化

	//人間の指し手のグローバル変数
	gCandidateMove = new Array(gcCandidateSize);
	for(var i=0; i<gCandidateMove.length; i++){
		gCandidateMove[i] = new TSashite();
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

	return gouhouCount;
}

function makeMoveTe(gouhouTe){
	//動く手だけ生成
	var gouhouCount = 0;

	//盤上の手
	gouhouCount = gouhouMove(gouhouTe,gouhouCount);

	return gouhouCount;
}

function gouhouDrop(gouhouTe,gouhouCount){
	//打つ手

	//打てるマスを探す
	var dropPos = new Array(81);
	var dropNum = 0;

	for(var i=0; i<gTblSqDepend.length; i++){
		if(gTblSqDepend[i]==0){
			dropPos[dropNum] = i;
			dropNum++;
		}
	}

	//打つ手を生成
	for(var k=1; k<=7; k++){
		if(gInHandPc[gWhichMoves][k]>0){
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
		if(!gPieces[id].isMochi && gPieces[id].sengo==gWhichMoves && gPieces[id].isUse){
			komaKind = gPieces[id].kind + (gPieces[id].isNari?8:0) + 16 * gPieces[id].sengo;
			//一つずつ
			for(var d=0; d<OneStep[komaKind].length; d++){
				forwardPos = gPieces[id].pos + OneStep[komaKind][d];//進む位置
				if((gTblSqDepend[forwardPos]==0)
				|| (gTblSqDepend[forwardPos]==1 && gWhichMoves==1)
				|| (gTblSqDepend[forwardPos]==2 && gWhichMoves==0)){//敵の駒か空白なら

					gouhouTe[gouhouCount].isUtsu = 0;
					gouhouTe[gouhouCount].fromSuji = Math.floor(gPieces[id].pos / 16);
					gouhouTe[gouhouCount].fromDan = gPieces[id].pos % 16;
					gouhouTe[gouhouCount].tottaKoma = gTblPcIndex[forwardPos];
					gouhouTe[gouhouCount].tottaNari = gTblPcIndex[forwardPos]==-1 ? -1 : (gPieces[gTblPcIndex[forwardPos]].isNari?1:0);
					gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
					gouhouTe[gouhouCount].toDan = forwardPos % 16;
					gouhouTe[gouhouCount].isNaru = false;
					gouhouTe[gouhouCount].id = id;
					gouhouTe[gouhouCount].isOK = true;
					gouhouCount++;
					//成れるか？
					if(!gPieces[id].isNari &&
					((forwardPos%16<=3 && gWhichMoves==0) || (gPieces[id].pos%16<=3 && gWhichMoves==0)//先手番
					|| (forwardPos%16>=7 && gWhichMoves==1) || (gPieces[id].pos%16>=7 && gWhichMoves==1))){//後手番
						gouhouTe[gouhouCount].isUtsu = 0;
						gouhouTe[gouhouCount].fromSuji = Math.floor(gPieces[id].pos / 16);
						gouhouTe[gouhouCount].fromDan = gPieces[id].pos % 16;
						gouhouTe[gouhouCount].tottaKoma = gTblPcIndex[forwardPos];
						gouhouTe[gouhouCount].tottaNari = gTblPcIndex[forwardPos]==-1 ? -1 : (gPieces[gTblPcIndex[forwardPos]].isNari?1:0);
						gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
						gouhouTe[gouhouCount].toDan = forwardPos % 16;
						gouhouTe[gouhouCount].isNaru = true;
						gouhouTe[gouhouCount].id = id;
						gouhouTe[gouhouCount].isOK = true;
						gouhouCount++;
					}
				}
			}
			//ジャンプ
			for(var d=0; d<Jump[komaKind].length; d++){
				forwardPos = gPieces[id].pos;
				isJumpable = true;
				while(isJumpable){
					forwardPos += Jump[komaKind][d];//進む位置
					if(gTblSqDepend[forwardPos]==0){//空白なら
						gouhouTe[gouhouCount].isUtsu = 0;
						gouhouTe[gouhouCount].fromSuji = Math.floor(gPieces[id].pos / 16);
						gouhouTe[gouhouCount].fromDan = gPieces[id].pos % 16;
						gouhouTe[gouhouCount].tottaKoma = gTblPcIndex[forwardPos];
						gouhouTe[gouhouCount].tottaNari = gTblPcIndex[forwardPos]==-1 ? -1 : (gPieces[gTblPcIndex[forwardPos]].isNari?1:0);
						gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
						gouhouTe[gouhouCount].toDan = forwardPos % 16;
						gouhouTe[gouhouCount].isNaru = false;
						gouhouTe[gouhouCount].id = id;
						gouhouTe[gouhouCount].isOK = true;
						gouhouCount++;
						//成れるか？
						if(!gPieces[id].isNari &&
						((forwardPos%16<=3 && gWhichMoves==0) || (gPieces[id].pos%16<=3 && gWhichMoves==0)//先手番
						|| (forwardPos%16>=7 && gWhichMoves==1) || (gPieces[id].pos%16>=7 && gWhichMoves==1))){//後手番
							gouhouTe[gouhouCount].isUtsu = 0;
							gouhouTe[gouhouCount].fromSuji = Math.floor(gPieces[id].pos / 16);
							gouhouTe[gouhouCount].fromDan = gPieces[id].pos % 16;
							gouhouTe[gouhouCount].tottaKoma = gTblPcIndex[forwardPos];
							gouhouTe[gouhouCount].tottaNari = gTblPcIndex[forwardPos]==-1 ? -1 : (gPieces[gTblPcIndex[forwardPos]].isNari?1:0);
							gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
							gouhouTe[gouhouCount].toDan = forwardPos % 16;
							gouhouTe[gouhouCount].isNaru = true;
							gouhouTe[gouhouCount].id = id;
							gouhouTe[gouhouCount].isOK = true;
							gouhouCount++;
						}
					}else if((gTblSqDepend[forwardPos]==1 && gWhichMoves==1)
					|| (gTblSqDepend[forwardPos]==2 && gWhichMoves==0)){//敵の駒なら
						gouhouTe[gouhouCount].isUtsu = 0;
						gouhouTe[gouhouCount].fromSuji = Math.floor(gPieces[id].pos / 16);
						gouhouTe[gouhouCount].fromDan = gPieces[id].pos % 16;
						gouhouTe[gouhouCount].tottaKoma = gTblPcIndex[forwardPos];
						gouhouTe[gouhouCount].tottaNari = gTblPcIndex[forwardPos]==-1 ? -1 : (gPieces[gTblPcIndex[forwardPos]].isNari?1:0);
						gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
						gouhouTe[gouhouCount].toDan = forwardPos % 16;
						gouhouTe[gouhouCount].isNaru = false;
						gouhouTe[gouhouCount].id = id;
						gouhouTe[gouhouCount].isOK = true;
						gouhouCount++;
						//成れるか？
						if(!gPieces[id].isNari &&
						((forwardPos%16<=3 && gWhichMoves==0) || (gPieces[id].pos%16<=3 && gWhichMoves==0)//先手番
						|| (forwardPos%16>=7 && gWhichMoves==1) || (gPieces[id].pos%16>=7 && gWhichMoves==1))){//後手番
							gouhouTe[gouhouCount].isUtsu = 0;
							gouhouTe[gouhouCount].fromSuji = Math.floor(gPieces[id].pos / 16);
							gouhouTe[gouhouCount].fromDan = gPieces[id].pos % 16;
							gouhouTe[gouhouCount].tottaKoma = gTblPcIndex[forwardPos];
							gouhouTe[gouhouCount].tottaNari = gTblPcIndex[forwardPos]==-1 ? -1 : (gPieces[gTblPcIndex[forwardPos]].isNari?1:0);
							gouhouTe[gouhouCount].toSuji = Math.floor(forwardPos / 16);
							gouhouTe[gouhouCount].toDan = forwardPos % 16;
							gouhouTe[gouhouCount].isNaru = true;
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

	return gouhouCount;
}

function removeIllegalMove(gouhouTe,gouhouCount){
	//反則の手に注釈をつけて消す

	//王手放置
	var utsuId;
	var gouhouForOuteCount;
	var gouhouForOuteTe = new Array(gcCandidateSize);
	for(var i=0; i<gouhouForOuteTe.length; i++){
		gouhouForOuteTe[i] = new TSashite();
	}
	var disCount = 0; //TODO:この未使用変数は何のために？
	for(var i=0; i<gouhouCount; i++){
		utsuId = findUtsuID(gouhouTe[i]);
		forwardState(gouhouTe[i],gWhichMoves,utsuId);//内部で進める
		switchTeban();//手番交代
		gouhouForOuteCount = makeMoveTe(gouhouForOuteTe);
		for(var j=0; j<gouhouForOuteCount; j++){
			if(gouhouForOuteTe[j].tottaKoma!=-1){
				if(gPieces[gouhouForOuteTe[j].tottaKoma].kind==8){//玉を取ることができるなら
					gouhouTe[i].isOK = false;
					gouhouTe[i].strWhyNoGood = "王様が取られてしまうにゃ";
					disCount++;
					break;
				}
			}
		}
		switchTeban();//手番交代
		backwardState(gouhouTe[i],gWhichMoves,utsuId);//内部で戻す
	}

	//行き所のない駒
	var komaId,komaKind;
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK){
			komaId = gouhouTe[i].id;
			komaKind = gPieces[komaId].kind;
			if(gWhichMoves==0 && komaKind==1 &&
			((!gPieces[komaId].isNari && !gouhouTe[i].isNaru) || gouhouTe[i].isUtsu==1)){//先手・歩
				if(gouhouTe[i].toDan==1){
					gouhouTe[i].isOK = false;
					gouhouTe[i].strWhyNoGood = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(gWhichMoves==1 && komaKind==1 &&
			((!gPieces[komaId].isNari && !gouhouTe[i].isNaru) || gouhouTe[i].isUtsu==1)){//後手・歩
				if(gouhouTe[i].toDan==9){
					gouhouTe[i].isOK = false;
					gouhouTe[i].strWhyNoGood = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(gWhichMoves==0 && komaKind==2 &&
			((!gPieces[komaId].isNari && !gouhouTe[i].isNaru) || gouhouTe[i].isUtsu==1)){//先手・香
				if(gouhouTe[i].toDan==1){
					gouhouTe[i].isOK = false;
					gouhouTe[i].strWhyNoGood = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(gWhichMoves==1 && komaKind==2 &&
			((!gPieces[komaId].isNari && !gouhouTe[i].isNaru) || gouhouTe[i].isUtsu==1)){//後手・香
				if(gouhouTe[i].toDan==9){
					gouhouTe[i].isOK = false;
					gouhouTe[i].strWhyNoGood = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(gWhichMoves==0 && komaKind==3 &&
			((!gPieces[komaId].isNari && !gouhouTe[i].isNaru) || gouhouTe[i].isUtsu==1)){//先手・桂
				if(gouhouTe[i].toDan<=2){
					gouhouTe[i].isOK = false;
					gouhouTe[i].strWhyNoGood = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}else if(gWhichMoves==1 && komaKind==3 &&
			((!gPieces[komaId].isNari && !gouhouTe[i].isNaru) || gouhouTe[i].isUtsu==1)){//後手・桂
				if(gouhouTe[i].toDan>=8){
					gouhouTe[i].isOK = false;
					gouhouTe[i].strWhyNoGood = "どこにも行けない駒になってしまうにゃ";
					disCount++;
				}
			}
		}
	}

	//二歩
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK){
			komaId = gouhouTe[i].id;
			if(gouhouTe[i].isUtsu==1 && gouhouTe[i].MochiKoma==1){
				for(var j=0; j<40; j++){
					if(gPieces[j].isUse
					&& gWhichMoves==gPieces[j].sengo
					&& gPieces[j].kind==1
					&& !gPieces[j].isNari
					&& !gPieces[j].isMochi
					&& Math.floor(gPieces[j].pos/16)==gouhouTe[i].toSuji){

						gouhouTe[i].isOK = false;
						gouhouTe[i].strWhyNoGood = "歩がある筋に歩は打てないにゃ";
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
	var gouhouForTodomeTe = new Array(gcCandidateSize);
	for(var i=0; i<gouhouForTodomeTe.length; i++){
		gouhouForTodomeTe[i] = new TSashite();
	}
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK){
			if(gouhouTe[i].isUtsu==1 && gouhouTe[i].MochiKoma==1){
				if((gWhichMoves==0 && (gPieces[39].pos+1)==(gouhouTe[i].toSuji*16+gouhouTe[i].toDan))//先手の歩
				|| (gWhichMoves==1 && (gPieces[19].pos-1)==(gouhouTe[i].toSuji*16+gouhouTe[i].toDan))){//後手の歩

					escapable = false;//逃げられないかもしれない
					utsuId = findUtsuID(gouhouTe[i]);
					forwardState(gouhouTe[i],gWhichMoves,utsuId);//内部で進める//とりあえず歩を打つ
					switchTeban();//手番交代
					gouhouForOuteCount = makeMoveTe(gouhouForOuteTe);
					for(var j=0; j<gouhouForOuteCount; j++){//相手が何か動かす
						catchable = false;//取れないかもしれない
						forwardState(gouhouForOuteTe[j],gWhichMoves,-1);//内部で進める
						switchTeban();//手番交代
						gouhouForTodomeCount = makeMoveTe(gouhouForTodomeTe);
						for(var k=0; k<gouhouForTodomeCount; k++){//玉がとれるかどうか
							if(gouhouForTodomeTe[k].tottaKoma!=-1){
								if(gPieces[gouhouForTodomeTe[k].tottaKoma].kind==8){//玉を取ることができるなら
									catchable = true;//玉が取れる
									break;
								}
							}
						}
						switchTeban();//手番交代
						backwardState(gouhouForOuteTe[j],gWhichMoves,-1);//内部で戻す
						if(catchable==false){escapable = true; break;}//取れなかった
					}
					switchTeban();//手番交代
					backwardState(gouhouTe[i],gWhichMoves,utsuId);//内部で戻す
					if(escapable==false){
						gouhouTe[i].isOK = false;
						gouhouTe[i].strWhyNoGood = "歩を打って詰ましてはだめにゃ";
						disCount++;
						break;
					}
				}
			}
		}
	}

	//金と玉は裏返らない
	for(var i=0; i<gouhouCount; i++){
		if(gouhouTe[i].isOK){
			if((gPieces[gouhouTe[i].id].kind==5 || gPieces[gouhouTe[i].id].kind==8)
			&& gouhouTe[i].isNaru
			&& gouhouTe[i].isUtsu==0){
				gouhouTe[i].isOK = false;
				gouhouTe[i].strWhyNoGood = "裏返せないにゃ";
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
			if(gPieces[id].kind==oneTe.MochiKoma
			&& gPieces[id].isUse
			&& gPieces[id].isMochi
			&& gPieces[id].sengo==gWhichMoves){

				return id;
			}
		}
	}

	//打たない
	return -1;
}
