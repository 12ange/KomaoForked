
function reactForHumanTe(_te){
	//人間の手へのリアクション

	//王手
	if(isOuteHuman()){return;}

	//駒を取る
	if(isKomatoruHuman(_te)){return;}

	//格下の駒に当てられる
	if(isNextKomatoriHuman(_te)){return;}

	//成る
	if(isNaruHuman(_te)){return;}

	//と金作りを狙われる
	if(isTokinHuman(_te)){return;}

	//玉の近くに打たれる
	if(isKingUtsu(_te)){return;}

	//駒が動いて迫る
	if(isSemaru(_te)){return;}

	//何もないとき
	noHuman();
}

function isOuteHuman(){
	//王手されているか

	//人間の手番のまま合法手生成
	var outeTe = createSashiteArray();
	var outeCount = makeCandidateTe(outeTe);
	for(var i=0; i<outeCount; i++){
		if(outeTe[i].isOK && outeTe[i].tottaKoma!=-1){
			if(gPieces[outeTe[i].tottaKoma].kind==8){//玉が取れるなら
				newText("王手されたにゃっ");
				return true;
			}
		}
	}

	return false;
}

//駒を取る
function isKomatoruHuman(_te){
	if(_te.isUtsu==0 && _te.tottaKoma!=-1){
		switch (gPieces[_te.tottaKoma].kind) {
			case 1://歩,と
				newText(_te.tottaNari?"と金を払われたにゃ":"歩ならいくらでもあげるにゃ");
				break;
			case 2://香,杏
				newText(_te.tottaNari?"成香が取られたにゃ　軽く落ち込むにゃ":"香車が取られたにゃ　微妙にショックにゃ");
				break;
			case 3://桂,圭
				newText(_te.tottaNari?"成桂が取られたにゃ　気が滅入るにゃ":"桂馬が取られたにゃ　困るにゃ");
				break;
			case 4://銀,全
				newText(_te.tottaNari?"成銀が取られたにゃ　きびしいにゃ":"銀が取られたにゃ　泣きたいにゃ");
				break;
			case 5://金
				newText("金が取られたにゃ　まずいにゃ");
				break;
			case 6://角,馬
				newText(_te.tottaNari?"馬が取られたにゃ　もう対局をやめたいにゃ":"角が取られたにゃ　生きた心地がしないにゃ");
				break;
			case 7://飛,竜
				newText(_te.tottaNari?"竜が取られたにゃ　人生おわったにゃ":"飛車が取られたにゃ　もうだめにゃ");
				break;
		}
		return true;
	}else{
		return false;
	}
}

//成る
function isNaruHuman(_te){
	if(_te.isUtsu==0 && _te.isNaru){
		switch (gPieces[gTblPcIndex[_te.toSuji*16+_te.toDan]].kind) {
			case 1://歩
				newText("と金にゃ　危険にゃ");
				break;
			case 2://香
			case 3://桂
				newText("ああっ　成られたにゃ");
				break;
			case 4://銀
				newText("成られたにゃ");
				break;
			case 6://角
				newText("馬は怖いにゃ");
				break;
			case 7://飛
				newText("竜は最強にゃ");
				break;
		}
		return true;
	}else{
		return false;
	}
}

function isNextKomatoriHuman(_te){
	//格下の駒に当てられる

	//人間の手番のまま合法手生成
	var toruKoma = -1, toruNari;
	var toruTe = createSashiteArray();
	var toruCount = makeCandidateTe(toruTe);
	for(var i=0; i<toruCount; i++){
		if(toruTe[i].isOK &&
		toruTe[i].tottaKoma!=-1 &&
		toruTe[i].fromSuji==_te.toSuji &&
		toruTe[i].fromDan==_te.toDan){//動かした駒だけ
			//格下か同格の駒で取れるか
			if(gPieces[toruTe[i].tottaKoma].kind>toruKoma &&
				gPieces[toruTe[i].tottaKoma].kind>=gPieces[gTblPcIndex[_te.toSuji*16+_te.toDan]].kind){
				toruKoma = gPieces[toruTe[i].tottaKoma].kind;
				toruNari = gPieces[toruTe[i].tottaKoma].isNari;
			}
			//ただでとれるか？
			forwardState(toruTe[i],gWhichMoves,-1);//内部で進める
			switchTeban();//手番交代
			var torikaesuTe = createSashiteArray();
			var torikaesuCount = makeMoveTe(torikaesuTe);
			var isTorikaesareru = false;
			for(var j=0; j<torikaesuCount; j++){
				if(toruTe[i].toSuji==torikaesuTe[j].toSuji &&
				toruTe[i].toDan==torikaesuTe[j].toDan){//取り返されるなら
					isTorikaesareru = true;
				}
			}
			switchTeban();//手番交代
			backwardState(toruTe[i],gWhichMoves,-1);//内部で戻す
			if(isTorikaesareru==false &&
			   gPieces[toruTe[i].tottaKoma].kind>toruKoma){//ただで取れるなら
				toruKoma = gPieces[toruTe[i].tottaKoma].kind;
				toruNari = gPieces[toruTe[i].tottaKoma].isNari;
			}
		}
	}

	if(toruKoma==-1){//当てていない
		return false;
	}else if(toruKoma==1){//歩
		return false;//当てていないのと同じ
	}else if(toruKoma==2){//香,杏
		newText( (toruNari ? "成香" : "香車")+"が狙われているにゃ");
		return true;
	}else if(toruKoma==3){//桂,圭
		newText( (toruNari ? "成桂" : "桂馬")+"はあげたくないにゃ");
		return true;
	}else if(toruKoma==4){//銀,全
		newText( (toruNari ? "成銀" : "銀")+"がピンチにゃ");
		return true;
	}else if(toruKoma==5){//金
		newText("金が取られそうにゃ");
		return true;
	}else if(toruKoma==6){//角,馬
		newText( (toruNari ? "馬" : "角")+"は取らないでほしいにゃ");
		return true;
	}else if(toruKoma==7){//飛,竜
		newText( (toruNari ? "竜" : "飛車")+"を取られたらおしまいにゃ");
		return true;
	}else{
		return false;
	}
}

function isTokinHuman(_te){
	//と金作りを狙われる

	var komaId = gTblPcIndex[_te.toSuji*16+_te.toDan];

	if(gPieces[komaId].kind==1 && !gPieces[komaId].isNari && _te.toDan<=4){//歩をあと一歩まで動かしたら
		//すぐには取られないなら
		switchTeban();//手番交代
		var toruTe = createSashiteArray();
		var toruCount = makeCandidateTe(toruTe);
		var isTorareru = false;
		for(var i=0; i<toruCount; i++){
			if(toruTe[i].isOK && toruTe[i].tottaKoma==komaId){//取り返される
				isTorareru = true;
				break;
			}
		}
		switchTeban();//手番交代
		if(isTorareru==false){
			newText("と金を作られそうにゃ");
			return true;
		}
	}

	return false;
}

function isKingUtsu(_te){
	//玉の近くに打たれる

	var komaId = gTblPcIndex[_te.toSuji*16+_te.toDan];
	if(_te.isUtsu==1 &&
	Math.max(Math.abs(Math.floor(gPieces[39].pos/16) - _te.toSuji),
	Math.abs((gPieces[39].pos%16) - _te.toDan))<=2){//玉の近辺に打たれたら
		//すぐには取られないなら
		switchTeban();//手番交代
		var toruTe = createSashiteArray();
		var toruCount = makeCandidateTe(toruTe);
		var isTorareru = false;
		for(var i=0; i<toruCount; i++){
			if(toruTe[i].isOK && toruTe[i].tottaKoma==komaId){//取り返される
				isTorareru = true;
				break;
			}
		}
		switchTeban();//手番交代
		if(isTorareru==false){
			newText("玉の近くに打たれて怖いにゃ");
			return true;
		}
	}

	return false;
}

function isSemaru(_te){
	//駒が動いて迫る

	//打つなら関係なし
	if(_te.isUtsu==1){ return false; }

	var komaId = gTblPcIndex[_te.toSuji*16+_te.toDan];
	var komaKind = gPieces[komaId].kind;

	//歩なら
	if(komaKind==1 && !gPieces[komaId].isNari){
		var fromDanKyori = Math.abs((gPieces[39].pos%16) - _te.fromDan);
		var toDanKyori = Math.abs((gPieces[39].pos%16) - _te.toDan);
		if(fromDanKyori>toDanKyori){//せまっている
			if(toDanKyori<=3){
				newText("敵がせまってきてるにゃ");
				return(true);
			}else if(3<toDanKyori && toDanKyori<=4){
				newText("敵がこちらに向かい始めたにゃ");
				return(true);
			}
		}
	}

	//桂銀金・と金・成香でなければ関係なし
	if(komaKind>=6 || (komaKind==2 && !gPieces[komaId].isNari) || (komaKind==1 && !gPieces[komaId].isNari)){
		return(false);
	}

	var fromKyori = Math.abs(Math.floor(gPieces[39].pos/16) - _te.fromSuji)
	+ Math.abs((gPieces[39].pos%16) - _te.fromDan);
	var toKyori = Math.abs(Math.floor(gPieces[39].pos/16) - _te.toSuji)
	+ Math.abs((gPieces[39].pos%16) - _te.toDan);

	if(fromKyori>toKyori){//せまっている
		if(toKyori<=3){
			newText("敵は目前にゃ　怖いにゃ");
			return true;
		}else if(3<toKyori && toKyori<=5){
			newText("敵がせまってきてるにゃ");
			return true;
		}else if(5<toKyori && toKyori<=8){
			newText("敵がこちらに向かい始めたにゃ");
			return true;
		}
	}
	return false;
}

function noHuman(){
	//単なるぼやき
	var rand = Math.floor(Math.random() * 6);

	if(rand==0){
		newText("おなかすいたにゃ");
	}else if(rand==1){
		newText("今日も眠いにゃ");
	}else if(rand==2){
		newText("毎日くたびれてるにゃ");
	}else if(rand==3){
		newText("人生きびしいにゃ");
	}else if(rand==4){
		newText("日常にあきたにゃ");
	}else if(rand==5){
		newText("いつもだるいにゃ");
	}

}









