


function reactForHumanTe(te){
	//人間の手へのリアクション

	//王手
	if(isOuteHuman()==true){return;}

	//駒を取る
	if(isKomatoruHuman(te)==true){return;}

	//格下の駒に当てられる
	if(isNextKomatoriHuman(te)==true){return;}

	//成る
	if(isNaruHuman(te)==true){return;}

	//と金作りを狙われる
	if(isTokinHuman(te)==true){return;}

	//玉の近くに打たれる
	if(isKingUtsu(te)==true){return;}

	//駒が動いて迫る
	if(isSemaru(te)==true){return;}

	//何もないとき
	noHuman();
}

function isOuteHuman(){
	//王手されているか

	//人間の手番のまま合法手生成
	var outeTe = Array(GouhouNum);
	for(var i=0; i<outeTe.length; i++){outeTe[i] = new TSashite();}
	var outeCount = makeCandidateTe(outeTe);
	for(var i=0; i<outeCount; i++){
		if(outeTe[i].isOK==true && outeTe[i].tottaKoma!=-1){
			if(koma[outeTe[i].tottaKoma].kind==8){//玉が取れるなら
				newText("王手されたにゃっ");
				return(true);
			}
		}
	}

	return(false);
}

//駒を取る
function isKomatoruHuman(te){
	if(te.isUtsu==0 && te.tottaKoma!=-1){
		if(koma[te.tottaKoma].kind==1){//歩,と
			newText(te.tottaNari?"と金を払われたにゃ":"歩ならいくらでもあげるにゃ");
		}else if(koma[te.tottaKoma].kind==2){//香,杏
			newText(te.tottaNari?"成香が取られたにゃ　軽く落ち込むにゃ":"香車が取られたにゃ　微妙にショックにゃ");
		}else if(koma[te.tottaKoma].kind==3){//桂,圭
			newText(te.tottaNari?"成桂が取られたにゃ　気が滅入るにゃ":"桂馬が取られたにゃ　困るにゃ");
		}else if(koma[te.tottaKoma].kind==4){//銀,全
			newText(te.tottaNari?"成銀が取られたにゃ　きびしいにゃ":"銀が取られたにゃ　泣きたいにゃ");
		}else if(koma[te.tottaKoma].kind==5){//金
			newText("金が取られたにゃ　まずいにゃ");
		}else if(koma[te.tottaKoma].kind==6){//角,馬
			newText(te.tottaNari?"馬が取られたにゃ　もう対局をやめたいにゃ":"角が取られたにゃ　生きた心地がしないにゃ");
		}else if(koma[te.tottaKoma].kind==7){//飛,竜
			newText(te.tottaNari?"竜が取られたにゃ　人生おわったにゃ":"飛車が取られたにゃ　もうだめにゃ");
		}
		return true;
	}else{
		return false;
	}
}

function isNaruHuman(te){
	//成る

	if(te.isUtsu==0 && te.isNaru==1){
		if(koma[idBan[te.toSuji*16+te.toDan]].kind==1){//歩
			newText("と金にゃ　危険にゃ");
		}else if(koma[idBan[te.toSuji*16+te.toDan]].kind==2){//香
			newText("ああっ　成られたにゃ");
		}else if(koma[idBan[te.toSuji*16+te.toDan]].kind==3){//桂
			newText("ああっ　成られたにゃ");
		}else if(koma[idBan[te.toSuji*16+te.toDan]].kind==4){//銀
			newText("成られたにゃ");
		}else if(koma[idBan[te.toSuji*16+te.toDan]].kind==6){//角
			newText("馬は怖いにゃ");
		}else if(koma[idBan[te.toSuji*16+te.toDan]].kind==7){//飛
			newText("竜は最強にゃ");
		}

		return(true);
	}

	return(false);
}

function isNextKomatoriHuman(te){
	//格下の駒に当てられる

	//人間の手番のまま合法手生成
	var toruKoma = -1, toruNari;
	var toruTe = Array(GouhouNum);
	for(var i=0; i<toruTe.length; i++){toruTe[i] = new TSashite();}
	var toruCount = makeCandidateTe(toruTe);
	for(var i=0; i<toruCount; i++){
		if(toruTe[i].isOK==true &&
		toruTe[i].tottaKoma!=-1 &&
		toruTe[i].fromSuji==te.toSuji &&
		toruTe[i].fromDan==te.toDan){//動かした駒だけ
			//格下か同格の駒で取れるか
			if(koma[toruTe[i].tottaKoma].kind>toruKoma &&
			koma[toruTe[i].tottaKoma].kind>=koma[idBan[te.toSuji*16+te.toDan]].kind){
				toruKoma = koma[toruTe[i].tottaKoma].kind;
				toruNari = koma[toruTe[i].tottaKoma].isNari;
			}
			//ただでとれるか？
			forwardState(toruTe[i],teban,-1);//内部で進める
			if(teban==0){teban=1;}else{teban=0;}//手番交代
			var torikaesuTe = Array(GouhouNum);
			for(var j=0; j<torikaesuTe.length; j++){torikaesuTe[j] = new TSashite();}
			var torikaesuCount = makeMoveTe(torikaesuTe);
			var isTorikaesareru = false;
			for(var j=0; j<torikaesuCount; j++){
				if(toruTe[i].toSuji==torikaesuTe[j].toSuji &&
				toruTe[i].toDan==torikaesuTe[j].toDan){//取り返されるなら
					isTorikaesareru = true;
				}
			}
			if(teban==0){teban=1;}else{teban=0;}//手番交代
			backwardState(toruTe[i],teban,-1);//内部で戻す
			if(isTorikaesareru==false &&
			koma[toruTe[i].tottaKoma].kind>toruKoma){//ただで取れるなら
				toruKoma = koma[toruTe[i].tottaKoma].kind;
				toruNari = koma[toruTe[i].tottaKoma].isNari;
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

function isTokinHuman(te){
	//と金作りを狙われる

	var komaId = idBan[te.toSuji*16+te.toDan];

	if(koma[komaId].kind==1 && !koma[komaId].isNari && te.toDan<=4){//歩をあと一歩まで動かしたら
		//すぐには取られないなら
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		var toruTe = Array(GouhouNum);
		for(var i=0; i<toruTe.length; i++){toruTe[i] = new TSashite();}
		var toruCount = makeCandidateTe(toruTe);
		var isTorareru = false;
		for(var i=0; i<toruCount; i++){
			if(toruTe[i].isOK==true && toruTe[i].tottaKoma==komaId){//取り返される
				isTorareru = true;
				break;
			}
		}
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		if(isTorareru==false){
			newText("と金を作られそうにゃ");
			return(true);
		}
	}

	return(false);
}

function isKingUtsu(te){
	//玉の近くに打たれる

	var komaId = idBan[te.toSuji*16+te.toDan];
	if(te.isUtsu==1 &&
	Math.max(Math.abs(Math.floor(koma[39].pos/16) - te.toSuji),
	Math.abs((koma[39].pos%16) - te.toDan))<=2){//玉の近辺に打たれたら
		//すぐには取られないなら
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		var toruTe = Array(GouhouNum);
		for(var i=0; i<toruTe.length; i++){toruTe[i] = new TSashite();}
		var toruCount = makeCandidateTe(toruTe);
		var isTorareru = false;
		for(var i=0; i<toruCount; i++){
			if(toruTe[i].isOK==true && toruTe[i].tottaKoma==komaId){//取り返される
				isTorareru = true;
				break;
			}
		}
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		if(isTorareru==false){
			newText("玉の近くに打たれて怖いにゃ");
			return(true);
		}
	}

	return(false);
}

function isSemaru(te){
	//駒が動いて迫る

	//打つなら関係なし
	if(te.isUtsu==1){
		return(false);
	}

	var komaId = idBan[te.toSuji*16+te.toDan];
	var komaKind = koma[komaId].kind;

	//歩なら
	if(komaKind==1 && !koma[komaId].isNari){
		var fromDanKyori = Math.abs((koma[39].pos%16) - te.fromDan);
		var toDanKyori = Math.abs((koma[39].pos%16) - te.toDan);
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
	if(komaKind>=6 || (komaKind==2 && !koma[komaId].isNari) || (komaKind==1 && !koma[komaId].isNari)){
		return(false);
	}

	var fromKyori = Math.abs(Math.floor(koma[39].pos/16) - te.fromSuji)
	+ Math.abs((koma[39].pos%16) - te.fromDan);
	var toKyori = Math.abs(Math.floor(koma[39].pos/16) - te.toSuji)
	+ Math.abs((koma[39].pos%16) - te.toDan);

	if(fromKyori>toKyori){//せまっている
		if(toKyori<=3){
			newText("敵は目前にゃ　怖いにゃ");
			return(true);
		}else if(3<toKyori && toKyori<=5){
			newText("敵がせまってきてるにゃ");
			return(true);
		}else if(5<toKyori && toKyori<=8){
			newText("敵がこちらに向かい始めたにゃ");
			return(true);
		}
	}

	return(false);
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









