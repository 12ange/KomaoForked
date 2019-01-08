//思考用設定値
var gcProbabilityBonus = 0.5; //指し手のボーナスを計算する割合(0-1)
var NOT_OK = -60000;
var komaValue = [0,100,500,500,600,600,1300,1400,3000];//[0,10,50,50,60,60,130,140,300]
var nariValue = [0,300];//[0,30]
var nattaValue = [0,1];
var fuTori = 70;
var torikaeshiConst = 75;
var tadadorareConst = 40000;
var INF = 30000;

//コンピュータの番
function aiMove(){

	//人間の手へのリアクション
	reactForHumanTe(gTheMove);

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
	forwardKoma(comTe,gWhichMoves);

	//コンピュータの手の感想
	//explainComTe(comTe,gTheMove);////////////////////////////////////////////////////

	//人間の番に戻す
	switchTeban();

	//人間の候補手
	gCandidateCount = makeCandidateTe(gCandidateMove);

	//人間の指し手はあるか？
	if(isHumanToryo()){
		return;
	}

	//人間の入力フェーズへ
	gCtrlPhase = 1;
}

function comToryo(){
	//コンピュータが負けたときの処理
	newText("負けました　きみの勝ちにゃ　ありがとうございました");
	gCtrlPhase = -1;
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
	var hasSashite = hasLegalSashite(gCandidateMove, gCandidateCount);

	if(!hasSashite){ //指し手が見つからなかった
		newText("ぼくの勝ちにゃ　ありがとうございました");
		gCtrlPhase = -1;
		restartText();
	}
	return !hasSashite;
}

function comThink(){
	//思考ルーチン

	var i, aiTe = createSashiteArray(),
		aiCount = makeCandidateTe(aiTe);

	//指す手はあるか？ なければ投了
	if(!hasLegalSashite(aiTe,aiCount)){
		return aiTe[0];
	}

	//手のスコアリング
	var bUseBonus = Math.random()<gcProbabilityBonus;
	var teScore = new Array(aiTe.length);
	for(i=0; i<aiCount; i++){
		teScore[i] = evalMove(aiTe[i],bUseBonus);
	}

	//手を選ぶ
	var maxIndex = new Array();
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

//指し手に対するスコアリング
function evalMove(_sashite,_flagBonus){
	var score;

	if(_sashite.isOK){ //合法手
		score = toriTori(_sashite)+bonusNaru(_sashite)+//成るボーナス
			(_flagBonus?
				bonusDistanceToKing(_sashite)+ //動いた先の先手玉との距離1-8
				bonusUtsu(_sashite)+ //打つボーナス
				bonusAtari(_sashite)+ //当てるボーナス
				bonusKomaKind(_sashite): //動かした駒の種類のボーナス
			0);
	}else{ //違法手
		score = NOT_OK;
	}

	return score;
}

function toriTori(_sashite){
	//取ったり取られたりの点数

	//ただ取りできるなら
	if(isTadadori(_sashite)==true){
		return(komaValue[gPieces[_sashite.tottaKoma].kind]
		+ nariValue[ gPieces[_sashite.tottaKoma].isNari?1:0 ]
		+ nattaValue[ _sashite.isNaru?1:0 ]);
	}

	//と金と歩は取れるなら取る
	if(isFuTori(_sashite)==true){
		return(komaValue[gPieces[_sashite.tottaKoma].kind]
		+ nariValue[ gPieces[_sashite.tottaKoma].isNari?1:0 ]
		+ nattaValue[ _sashite.isNaru?1:0 ]
		+ fuTori);
	}

	//取って取り返される
	if(isTorikaeshi(_sashite)==true){
		return(komaValue[gPieces[_sashite.tottaKoma].kind]
		+ nariValue[ gPieces[_sashite.tottaKoma].isNari?1:0 ]
		- komaValue[gPieces[_sashite.id].kind]
		+ nattaValue[ _sashite.isNaru?1:0 ]
		+ torikaeshiConst);
	}

	//動かした駒をタダで取られる
	if(isTadadorare(_sashite)==true){
		return(-komaValue[gPieces[_sashite.id].kind]
		-tadadorareConst);
	}

	//取られても取り返す（または取り返せない）ボーナス
	var scoreNullTT = scoreNullToruToru(_sashite);
	if(scoreNullTT!=false){
		return(scoreNullTT);
	}

	return(0);
}

function isTadadori(_sashite){
	//ただ取りできるか？

	if(_sashite.isUtsu==0 && _sashite.tottaKoma!=-1){//駒を取れるか？

		//取り返されないかの確認（ほかの駒を取られる可能性は考えない）
		var torareruTe = createSashiteArray();
		forwardState(_sashite,gWhichMoves,-1);//内部で進める
		switchTeban();//手番交代
		var torareruCount = makeCandidateTe(torareruTe);
		var isTorikaesareru = false;
		for(var i=0; i<torareruCount; i++){
			if(torareruTe[i].isOK
			&& torareruTe[i].toSuji==_sashite.toSuji
			&& torareruTe[i].toDan==_sashite.toDan){
				isTorikaesareru = true;
				break;
			}
		}
		switchTeban();//手番交代
		backwardState(_sashite,gWhichMoves,-1);//内部で戻す

		if(isTorikaesareru==false){
			return(true);//取り返されないなら
		}

	}

	return(false);//ただ取りできない
}

function isFuTori(_sashite){
	//と金と歩で取れるなら取る

	if(_sashite.isUtsu==0
	&& _sashite.tottaKoma!=-1
	&& gPieces[_sashite.id].kind==1){
		return(true);
	}

	return(false);//取れない
}

function isTorikaeshi(_sashite){
	//取り返されても得か？

	if(_sashite.isUtsu==0 && _sashite.tottaKoma!=-1){//駒を取れるか？

		//何で取り返されるかの確認（ほかの駒を取られる可能性は考えない）
		var torareruTe = createSashiteArray();
		forwardState(_sashite,gWhichMoves,-1);//内部で進める
		switchTeban();//手番交代
		var torareruCount = makeCandidateTe(torareruTe);
		var isTorikaesareru = false;
		for(var i=0; i<torareruCount; i++){
			if(torareruTe[i].isOK
			&& torareruTe[i].toSuji==_sashite.toSuji
			&& torareruTe[i].toDan==_sashite.toDan){
				isTorikaesareru = true;
			}
		}
		switchTeban();//手番交代
		backwardState(_sashite,gWhichMoves,-1);//内部で戻す

		if(isTorikaesareru==true){
			return(true);//取って取り返すなら
		}

	}

	return(false);
}

//成るボーナス15
function bonusNaru(_sashite){
	return (_sashite.isUtsu==0 && _sashite.isNaru)? 15 : 0;
}

//打つボーナス13
function bonusUtsu(_sashite){
	return (_sashite.isUtsu==1)? 13 : 0;
}

//動かした駒の種類のボーナス
function bonusKomaKind(_sashite){

	var moveBonusScore = [0,2,0,1,2,2,0,0,0];
	var utsuBonusScore = [0,1,1,1,1,1,2,3,0];

	if(_sashite.isUtsu==1){//打つ
		return(10*utsuBonusScore[gPieces[_sashite.id].kind]);
	}else{//盤上
		return(10*moveBonusScore[gPieces[_sashite.id].kind]);
	}
}

//当てるボーナス3
function bonusAtari(_sashite){
	//TODO:forwardStateとbackwardStateが１対１ではないのがキモチワルイ

	var i, toruTe, toruCount, utsuId = findUtsuID(_sashite);

	forwardState(_sashite,gWhichMoves,utsuId);//内部で進める
	//手番を交代しない
	toruCount = makeCandidateTe( toruTe = createSashiteArray() );
	for(i=0; i<toruCount; i++){
		if(_sashite.id==toruTe[i].id && toruTe[i].isOK && toruTe[i].isUtsu==0 && toruTe[i].tottaKoma!=-1){
			backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す
			return(3);
		}
	}
	backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す
	return(0);//進めても当たっていない
}

function bonusDistanceToKing(_sashite){
	//動いた先の先手玉との距離1-8

	//TODO:この関数、処理を楽にできそう

	if(_sashite.isUtsu==1){//打つとき
		return(
			8 - Math.max(Math.abs(_sashite.toSuji - Math.floor(gPieces[19].pos/16)),
			Math.abs(_sashite.toDan - (gPieces[19].pos%16)))
		);
	}else{//動かすとき
		if(gPieces[_sashite.id].kind==1 ||
			gPieces[_sashite.id].kind==3 ||
			gPieces[_sashite.id].kind==4 ||
			gPieces[_sashite.id].kind==5 ||
			(gPieces[_sashite.id].kind==2 && gPieces[_sashite.id].isNari)){//金銀桂歩・成香
			return(
				Math.max(Math.abs(_sashite.fromSuji - Math.floor(gPieces[19].pos/16)),
				Math.abs(_sashite.fromDan - (gPieces[19].pos%16)))
				- Math.max(Math.abs(_sashite.toSuji - Math.floor(gPieces[19].pos/16)),
				Math.abs(_sashite.toDan - (gPieces[19].pos%16)))
			);
		}else{//その他の駒
			return(0);
		}
	}
}

function isTadadorare(_sashite){
	//動かした駒をただで取られる

	var utsuId = findUtsuID(_sashite);
	forwardState(_sashite,gWhichMoves,utsuId);//内部で進める
	switchTeban();//手番交代
	var toruTe = createSashiteArray();
	var toruCount = makeCandidateTe(toruTe);
	var isTorareru = false;
	for(var i=0; i<toruCount; i++){
		if(toruTe[i].isOK &&
		toruTe[i].isUtsu==0 &&
		toruTe[i].tottaKoma==_sashite.id){//動かした駒を取られる
			forwardState(toruTe[i],gWhichMoves,-1);//内部で進める
			switchTeban();//手番交代
			var kikiTe = createSashiteArray();
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
			switchTeban();//手番交代
			backwardState(toruTe[i],gWhichMoves,-1);//内部で戻す
			if(kikiExist==false){//そこに駒が利いていない
				isTorareru = true;
				break;
			}
		}
	}
	switchTeban();//手番交代
	backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す

	return(isTorareru);
}

function scoreNullToruToru(_sashite){
	//取られて取り返す
	//返り値はスコアかfalse

	var toruId = -1;
	var torareruId = -1;
	var minScore = INF;

	var utsuId = findUtsuID(_sashite);
	forwardState(_sashite,gWhichMoves,utsuId);//内部で進める
	switchTeban();//手番交代
	var toruTe = createSashiteArray();
	var toruCount = makeCandidateTe(toruTe);
	var isTorareru = false;
	for(var i=0; i<toruCount; i++){
		if(toruTe[i].isOK &&
		toruTe[i].isUtsu==0 &&
		toruTe[i].tottaKoma!=-1){//何か取られる
			isTorareru = true;
			forwardState(toruTe[i],gWhichMoves,-1);//内部で進める
			switchTeban();//手番交代
			var kaesuTe = createSashiteArray();
			var kaesuCount = makeCandidateTe(kaesuTe);
			var maxScore = -INF;
			for(var j=0; j<kaesuCount; j++){
				if(kaesuTe[j].isOK &&
				kaesuTe[j].toSuji==toruTe[i].toSuji &&
				kaesuTe[j].toDan==toruTe[i].toDan){//その駒を取り返す
					torareruId = toruTe[i].tottaKoma;
					toruId = kaesuTe[j].tottaKoma;
					eachScore = komaValue[gPieces[toruId].kind] - komaValue[gPieces[torareruId].kind];
				}else{
					torareruId = toruTe[i].tottaKoma;
					eachScore = -komaValue[gPieces[torareruId].kind];
				}
				if(maxScore<eachScore){maxScore = eachScore;}
			}
			switchTeban();//手番交代
			backwardState(toruTe[i],gWhichMoves,-1);//内部で戻す
		}
		if(minScore>maxScore){minScore = maxScore;}
	}
	switchTeban();//手番交代
	backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す

	if(isTorareru==false){
		return(0);
	}else{
		return(minScore);
	}
}
