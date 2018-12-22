
//手番交代
function switchTeban(){
	teban = (teban==0)? 1 : 0;
}

//コンピュータの番
function aiMove(){

	//人間の手へのリアクション
	reactForHumanTe(te);

	//コンピュータの手番へ
	switchTeban();

	//コンピュータの手番
	setTimeout("comSide()",VERYSLOW);
}

//コンピュータが考える
function comSide(){

	var comTe = comThink();

	if(!comTe.isOK){//投了なら
		comToryo();
		return;
	}

	//コンピュータの手を動かす
	forwardKoma(comTe,teban);

	//コンピュータの手の感想
	//explainComTe(comTe,te);////////////////////////////////////////////////////

	//人間の番に戻す
	switchTeban();

	//人間の候補手
	candidateCount = makeCandidateTe(candidateTe);

	//人間の指し手はあるか？
	if(isHumanToryo()){
		return;
	}

	//人間の入力フェーズへ
	controlPhase = 1;
}

function comToryo(){
	//コンピュータが負けたときの処理
	newText("負けました　きみの勝ちにゃ　ありがとうございました");
	controlPhase = -1;
	restartText();
}

//合法手はあるか？
function hasLegalSashite(_arrSashite, _cntSashite){
	var bOkay = false, i = 0;
	while(!bOkay && i<_cntSashite){
		bOkay = _arrSashite[i++].isOK;
	}
	return bOkay;
}

function isHumanToryo(){
	//人間の指し手はあるか？
	var hasSashite = hasLegalSashite(candidateTe, candidateCount);

	if(!hasSashite){ //指し手が見つからなかった
		newText("ぼくの勝ちにゃ　ありがとうございました");
		controlPhase = -1;
		restartText();
	}
	return !hasSashite;
}

function restartText(){
	//もう一度対局するか

	$("<div>")
	.attr("id","restartMessage")
	.css("position","absolute")
	.css("font-size","140%")
	.css("text-align","center")
	.css("top","450px")
	.css("left","0px")
	.css("background-color","#ccccff")
	.css("width","200")
	.css("z-index","20")
	.html("もう１回？")
	.click(function(){restartPrepare();})
	.appendTo("#ban")//index.htmlにあるdivのid
	.hide()
	.fadeIn(VERYSLOW);
}

function restartPrepare(){
	//もう一度対局する

	//ボタンの削除
	$("#restartMessage").remove();

	//駒とかの削除
	removeKoma();
	highlightErase();
	mochiCountRemove();

	//駒落ちの選択
	selectKomaochi();
}

var bUseBonus;

function comThink(){
	//思考ルーチン

	var i, aiTe = Array(GouhouNum);
	for(i=0; i<aiTe.length; i++){aiTe[i] = new TSashite();}
	var aiCount = makeCandidateTe(aiTe);

	//指す手はあるか？ なければ投了
	if(!hasLegalSashite(aiTe,aiCount)){
		return aiTe[0];
	}

	//手のスコアリング
	bUseBonus = Math.random()<BonusRate;
	var teScore = Array(GouhouNum);
	for(i=0; i<aiCount; i++){
		teScore[i] = moveScoring(aiTe[i]);
	}

	//手を選ぶ
	var maxIndex = Array();
	var maxScore = teScore[0];
	for(i=0; i<aiCount; i++){
		if(maxScore<teScore[i] && aiTe[i].isOK){
			maxScore = teScore[i];
		}
	}
	for(i=0; i<aiCount; i++){
		if(maxScore==teScore[i] && aiTe[i].isOK){
			maxIndex.push(i);
		}
	}
	return(aiTe[maxIndex[Math.floor(Math.random() * maxIndex.length)]]);

}

var NOT_OK = -60000;
var komaValue = [0,100,500,500,600,600,1300,1400,3000];//[0,10,50,50,60,60,130,140,300]
var nariValue = [0,300];//[0,30]
var nattaValue = [0,1];
var fuTori = 70;
var torikaeshiConst = 75;
var tadadorareConst = 40000;

function moveScoring(oneTe){
	//指し手に対するスコアリング
	if(!oneTe.isOK){
		return(NOT_OK);
	}

	var score = toriTori(oneTe);

	score += bonusNaru(oneTe);//成るボーナス

	if(bUseBonus){
		score += bonusDistanceToKing(oneTe);//動いた先の先手玉との距離1-8
		score += bonusUtsu(oneTe);//打つボーナス
		score += bonusAtari(oneTe);//当てるボーナス
		score += bonusKomaKind(oneTe);//動かした駒の種類のボーナス
	}

	return(score);
}

function toriTori(oneTe){
	//取ったり取られたりの点数

	//ただ取りできるなら
	if(isTadadori(oneTe)==true){
		return(komaValue[koma[oneTe.tottaKoma].kind]
		+ nariValue[ koma[oneTe.tottaKoma].isNari?1:0 ]
		+ nattaValue[ oneTe.isNaru?1:0 ]);
	}

	//と金と歩は取れるなら取る
	if(isFuTori(oneTe)==true){
		return(komaValue[koma[oneTe.tottaKoma].kind]
		+ nariValue[ koma[oneTe.tottaKoma].isNari?1:0 ]
		+ nattaValue[ oneTe.isNaru?1:0 ]
		+ fuTori);
	}

	//取って取り返される
	if(isTorikaeshi(oneTe)==true){
		return(komaValue[koma[oneTe.tottaKoma].kind]
		+ nariValue[ koma[oneTe.tottaKoma].isNari?1:0 ]
		- komaValue[koma[oneTe.id].kind]
		+ nattaValue[ oneTe.isNaru?1:0 ]
		+ torikaeshiConst);
	}

	//動かした駒をタダで取られる
	if(isTadadorare(oneTe)==true){
		return(-komaValue[koma[oneTe.id].kind]
		-tadadorareConst);
	}

	//取られても取り返す（または取り返せない）ボーナス
	var scoreNullTT = scoreNullToruToru(oneTe);
	if(scoreNullTT!=false){
		return(scoreNullTT);
	}

	return(0);
}

function isTadadori(oneTe){
	//ただ取りできるか？

	if(oneTe.isUtsu==0 && oneTe.tottaKoma!=-1){//駒を取れるか？

		//取り返されないかの確認（ほかの駒を取られる可能性は考えない）
		var torareruTe = Array(GouhouNum);
		for(var i=0; i<torareruTe.length; i++){torareruTe[i] = new TSashite();}
		forwardState(oneTe,teban,-1);//内部で進める
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		var torareruCount = makeCandidateTe(torareruTe);
		var isTorikaesareru = false;
		for(var i=0; i<torareruCount; i++){
			if(torareruTe[i].isOK
			&& torareruTe[i].toSuji==oneTe.toSuji
			&& torareruTe[i].toDan==oneTe.toDan){
				isTorikaesareru = true;
				break;
			}
		}
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		backwardState(oneTe,teban,-1);//内部で戻す

		if(isTorikaesareru==false){
			return(true);//取り返されないなら
		}

	}

	return(false);//ただ取りできない
}

function isFuTori(oneTe){
	//と金と歩で取れるなら取る

	if(oneTe.isUtsu==0
	&& oneTe.tottaKoma!=-1
	&& koma[oneTe.id].kind==1){
		return(true);
	}

	return(false);//取れない
}

function isTorikaeshi(oneTe){
	//取り返されても得か？

	if(oneTe.isUtsu==0 && oneTe.tottaKoma!=-1){//駒を取れるか？

		//何で取り返されるかの確認（ほかの駒を取られる可能性は考えない）
		var torareruTe = Array(GouhouNum);
		for(var i=0; i<torareruTe.length; i++){torareruTe[i] = new TSashite();}
		forwardState(oneTe,teban,-1);//内部で進める
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		var torareruCount = makeCandidateTe(torareruTe);
		var isTorikaesareru = false;
		for(var i=0; i<torareruCount; i++){
			if(torareruTe[i].isOK
			&& torareruTe[i].toSuji==oneTe.toSuji
			&& torareruTe[i].toDan==oneTe.toDan){
				isTorikaesareru = true;
			}
		}
		if(teban==0){teban=1;}else{teban=0;}//手番交代
		backwardState(oneTe,teban,-1);//内部で戻す

		if(isTorikaesareru==true){
			return(true);//取って取り返すなら
		}

	}

	return(false);
}

//成るボーナス15
function bonusNaru(oneTe){
	return (oneTe.isUtsu==0 && oneTe.isNaru)? 15 : 0;
}

//打つボーナス13
function bonusUtsu(oneTe){
	return (oneTe.isUtsu==1)? 13 : 0;
}

//動かした駒の種類のボーナス
function bonusKomaKind(oneTe){

	var moveBonusScore = [0,2,0,1,2,2,0,0,0];
	var utsuBonusScore = [0,1,1,1,1,1,2,3,0];

	if(oneTe.isUtsu==1){//打つ
		return(10*utsuBonusScore[koma[oneTe.id].kind]);
	}else{//盤上
		return(10*moveBonusScore[koma[oneTe.id].kind]);
	}
}

function bonusAtari(oneTe){
	//当てるボーナス3

	var toruTe = Array(GouhouNum);
	for(var i=0; i<toruTe.length; i++){toruTe[i] = new TSashite();}
	var utsuId = findUtsuID(oneTe);
	forwardState(oneTe,teban,utsuId);//内部で進める
	//手番を交代しない
	var toruCount = makeCandidateTe(toruTe);
	for(var i=0; i<toruCount; i++){
		if(oneTe.id==toruTe[i].id && toruTe[i].isOK && toruTe[i].isUtsu==0 && toruTe[i].tottaKoma!=-1){
			backwardState(oneTe,teban,utsuId);//内部で戻す
			return(3);
		}
	}
	backwardState(oneTe,teban,utsuId);//内部で戻す

	return(0);//進めても当たっていない
}

function bonusDistanceToKing(oneTe){
	//動いた先の先手玉との距離1-8

	if(oneTe.isUtsu==1){//打つとき
		return(
			8 - Math.max(Math.abs(oneTe.toSuji - Math.floor(koma[19].pos/16)),
			Math.abs(oneTe.toDan - (koma[19].pos%16)))
		);
	}else{//動かすとき
		if(koma[oneTe.id].kind==1 ||
		koma[oneTe.id].kind==3 ||
		koma[oneTe.id].kind==4 ||
		koma[oneTe.id].kind==5 ||
		(koma[oneTe.id].kind==2 && koma[oneTe.id].isNari)){//金銀桂歩・成香
			return(
				Math.max(Math.abs(oneTe.fromSuji - Math.floor(koma[19].pos/16)),
				Math.abs(oneTe.fromDan - (koma[19].pos%16)))
				- Math.max(Math.abs(oneTe.toSuji - Math.floor(koma[19].pos/16)),
				Math.abs(oneTe.toDan - (koma[19].pos%16)))
			);
		}else{//その他の駒
			return(0);
		}
	}
}

function isTadadorare(oneTe){
	//動かした駒をただで取られる

	var utsuId = findUtsuID(oneTe);
	forwardState(oneTe,teban,utsuId);//内部で進める
	if(teban==0){teban=1;}else{teban=0;}//手番交代
	var toruTe = Array(GouhouNum);
	for(var i=0; i<toruTe.length; i++){toruTe[i] = new TSashite();}
	var toruCount = makeCandidateTe(toruTe);
	var isTorareru = false;
	for(var i=0; i<toruCount; i++){
		if(toruTe[i].isOK &&
		toruTe[i].isUtsu==0 &&
		toruTe[i].tottaKoma==oneTe.id){//動かした駒を取られる
			forwardState(toruTe[i],teban,-1);//内部で進める
			if(teban==0){teban=1;}else{teban=0;}//手番交代
			var kikiTe = Array(GouhouNum);
			for(var j=0; j<kikiTe.length; j++){kikiTe[j] = new TSashite();}
			var kikiCount = makeCandidateTe(kikiTe);
			var kikiExist = false;
			for(var j=0; j<kikiCount; j++){
				if(kikiTe[j].isOK &&
				kikiTe[j].toSuji==toruTe[i].toSuji &&
				kikiTe[j].toDan==toruTe[i].toDan){//そこに一つは利いている
					kikiExist = true;
					break;
				}
			}
			if(teban==0){teban=1;}else{teban=0;}//手番交代
			backwardState(toruTe[i],teban,-1);//内部で戻す
			if(kikiExist==false){//そこに駒が利いていない
				isTorareru = true;
				break;
			}
		}
	}
	if(teban==0){teban=1;}else{teban=0;}//手番交代
	backwardState(oneTe,teban,utsuId);//内部で戻す

	return(isTorareru);
}

var INF = 30000;

function scoreNullToruToru(oneTe){
	//取られて取り返す
	//返り値はスコアかfalse

	var toruId = -1;
	var torareruId = -1;
	var minScore = INF;

	var utsuId = findUtsuID(oneTe);
	forwardState(oneTe,teban,utsuId);//内部で進める
	if(teban==0){teban=1;}else{teban=0;}//手番交代
	var toruTe = Array(GouhouNum);
	for(var i=0; i<toruTe.length; i++){toruTe[i] = new TSashite();}
	var toruCount = makeCandidateTe(toruTe);
	var isTorareru = false;
	for(var i=0; i<toruCount; i++){
		if(toruTe[i].isOK &&
		toruTe[i].isUtsu==0 &&
		toruTe[i].tottaKoma!=-1){//何か取られる
			isTorareru = true;
			forwardState(toruTe[i],teban,-1);//内部で進める
			if(teban==0){teban=1;}else{teban=0;}//手番交代
			var kaesuTe = Array(GouhouNum);
			for(var j=0; j<kaesuTe.length; j++){kaesuTe[j] = new TSashite();}
			var kaesuCount = makeCandidateTe(kaesuTe);
			var maxScore = -INF;
			for(var j=0; j<kaesuCount; j++){
				if(kaesuTe[j].isOK &&
				kaesuTe[j].toSuji==toruTe[i].toSuji &&
				kaesuTe[j].toDan==toruTe[i].toDan){//その駒を取り返す
					torareruId = toruTe[i].tottaKoma;
					toruId = kaesuTe[j].tottaKoma;
					eachScore = komaValue[koma[toruId].kind] - komaValue[koma[torareruId].kind];
				}else{
					torareruId = toruTe[i].tottaKoma;
					eachScore = -komaValue[koma[torareruId].kind];
				}
				if(maxScore<eachScore){maxScore = eachScore;}
			}
			if(teban==0){teban=1;}else{teban=0;}//手番交代
			backwardState(toruTe[i],teban,-1);//内部で戻す
		}
		if(minScore>maxScore){minScore = maxScore;}
	}
	if(teban==0){teban=1;}else{teban=0;}//手番交代
	backwardState(oneTe,teban,utsuId);//内部で戻す

	if(isTorareru==false){
		return(0);
	}else{
		return(minScore);
	}
}
