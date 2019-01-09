//思考用設定値
var gcProbabilityBonus = 0.5; //指し手のボーナスを計算する割合(0-1)
//TODO:rename below
var NOT_OK = -60000;
//TODO:rename NOT_OK gcValueNegaInf
var komaValue = [0,100,500,500,600,600,1300,1400,3000];//[0,10,50,50,60,60,130,140,300]
var nariValue = [0,300];//[0,30]
var nattaValue = [0,1];
var fuTori = 70;
var torikaeshiConst = 75;
var tadadorareConst = 40000;
var INF = 30000;
//TODO:rename INF gcValuePosiInf

//コンピュータの番
function aiMove(){

	//TODO:棋譜を記録するタイミング(人間が着手完了した直後、gTheMoveがその動き)

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

	//TODO:棋譜を記録するタイミング(COMが着手完了した直後、comTeがその動き)
	
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

//人間の指し手はあるか？
function isHumanToryo(){
	var bMatedHuman = ! hasLegalSashite(gCandidateMove, gCandidateCount);

	if(bMatedHuman){
		newText("ぼくの勝ちにゃ　ありがとうございました");
		gCtrlPhase = -1;
		restartText();
	}
	return bMatedHuman;
}

//思考ルーチン
function comThink(){
	var i, aiTe = createSashiteArray(),
		aiCount = makeCandidateTe(aiTe);

	//指す手はあるか？ なければ投了
	if(!hasLegalSashite(aiTe,aiCount)){
		i=0;
	}else{
		//手のスコアリング
		var bUseBonus = Math.random()<gcProbabilityBonus;
		var s, hiscore = NOT_OK, aIndexesHiscore; //合法手index配列

		for(i=0; i<aiCount; i++){
			if( aiTe[i].isOK ){ //合法手のみ評価する
				s = evalMove(aiTe[i],bUseBonus);
				if( s === hiscore ){ //同点
					aIndexesHiscore.push(i); //indexを追記
				}else if( s > hiscore ){ //新記録
					hiscore = s;
					aIndexesHiscore = [i]; //新しく配列を始める
				}
			}
		}
		i = aIndexesHiscore[ (Math.random()*aIndexesHiscore.length)|0 ];
	}
	return aiTe[i];
}

//指し手に対するスコアリング
function evalMove(_sashite,_flagBonus){
	return !_sashite.isOK ? NOT_OK : //違法手
		( //合法手
			toriTori(_sashite)+bonusNaru(_sashite)+//成るボーナス
			(_flagBonus?
				bonusDistanceToKing(_sashite)+ //動いた先の先手玉との距離1-8
				bonusUtsu(_sashite)+ //打つボーナス
				bonusAtari(_sashite)+ //当てるボーナス
				bonusKomaKind(_sashite): //動かした駒の種類のボーナス
			0)
		);
}

//スコアリング-取ったり取られたり
function toriTori(_sashite){

	//1.ただ取りできる
	if(isTadadori(_sashite)){
		return(komaValue[gPieces[_sashite.tottaKoma].kind]
		+ nariValue[ gPieces[_sashite.tottaKoma].isNari?1:0 ]
		+ nattaValue[ _sashite.isNaru?1:0 ]);
	}

	//2.と金と歩は取れるなら取る
	if(isFuTori(_sashite)){
		return(komaValue[gPieces[_sashite.tottaKoma].kind]
		+ nariValue[ gPieces[_sashite.tottaKoma].isNari?1:0 ]
		+ nattaValue[ _sashite.isNaru?1:0 ]
		+ fuTori);
	}

	//3.取って取り返される
	if(isTorikaeshi(_sashite)){
		return(komaValue[gPieces[_sashite.tottaKoma].kind]
		+ nariValue[ gPieces[_sashite.tottaKoma].isNari?1:0 ]
		- komaValue[gPieces[_sashite.id].kind]
		+ nattaValue[ _sashite.isNaru?1:0 ]
		+ torikaeshiConst);
	}

	//4.動かした駒をタダで取られる
	if(isTadadorare(_sashite)){
		return(-komaValue[gPieces[_sashite.id].kind]
		-tadadorareConst);
	}

	//5.取られても取り返す（または取り返せない）ボーナス
	return scoreNullToruToru(_sashite);
}

//ただ取りできるか？
function isTadadori(_sashite){

	if(_sashite.isUtsu==0 && _sashite.tottaKoma!=-1){//駒を取れるか？

		//取り返されないかの確認（ほかの駒を取られる可能性は考えない）
		forwardState(_sashite,gWhichMoves,-1);//内部で進める
		switchTeban();//手番交代
		var torareruTe = createSashiteArray();
		var torareruCount = makeCandidateTe(torareruTe);
		var i=0, isRecaptured = false;
		while( !isRecaptured && i<torareruCount ){
			isRecaptured = (
				torareruTe[i].isOK &&
				torareruTe[i].toSuji==_sashite.toSuji &&
				torareruTe[i].toDan==_sashite.toDan);
			i++;
		}
		switchTeban();//手番交代
		backwardState(_sashite,gWhichMoves,-1);//内部で戻す

		//「取り返される」と「ただ取りできる」は逆だから
		return !isRecaptured;
	}
	return false; //そもそも駒を取れない
}

//と金と歩で取れるなら取る
function isFuTori(_sashite){
	return _sashite.isUtsu==0 && gPieces[_sashite.id].kind==1 && _sashite.tottaKoma!=-1;
}

//取っても取り返される？
function isTorikaeshi(_sashite){

	//TODO:isTadadori()とほぼ同じ。if内のreturnが反転している。共通化できないか？

	if(_sashite.isUtsu==0 && _sashite.tottaKoma!=-1){//駒を取れるか？

		//何で取り返されるかの確認（ほかの駒を取られる可能性は考えない）
		forwardState(_sashite,gWhichMoves,-1);//内部で進める
		switchTeban();//手番交代
		var torareruTe = createSashiteArray();
		var torareruCount = makeCandidateTe(torareruTe);
		var i=0, isRecaptured = false;
		while( i<torareruCount ){
			isRecaptured = (
				torareruTe[i].isOK &&
				torareruTe[i].toSuji==_sashite.toSuji &&
				torareruTe[i].toDan==_sashite.toDan);
			i++;
		}
		switchTeban();//手番交代
		backwardState(_sashite,gWhichMoves,-1);//内部で戻す

		return isRecaptured;
	}
	return false; //そもそも駒を取れない
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
	var i, toruTe, toruCount, utsuId = findUtsuID(_sashite);

	forwardState(_sashite,gWhichMoves,utsuId);//内部で進める
	//手番を交代しない
	toruCount = makeCandidateTe( toruTe = createSashiteArray() );
	for(i=0; i<toruCount; i++){
		if(_sashite.id==toruTe[i].id && toruTe[i].isOK && toruTe[i].isUtsu==0 && toruTe[i].tottaKoma!=-1){
			break; //さらに同じ駒を、合法で、打つ手ではなく動かせれば、何らかの駒が取れる状態である
		}
	}
	backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す
	return (i<toruCount)? 3 : 0;
}

//動いた先の先手玉との距離1-8
function bonusDistanceToKing(_sashite){
	var sujiKing = gPieces[19].pos>>>4, danKing = gPieces[19].pos&15;
	var sashitaKoma = gPieces[_sashite.id];

	if(_sashite.isUtsu==1){//打つとき
		return 8 - distanceChebyshev(_sashite.toSuji, _sashite.toDan, sujiKing, danKing);
	}else if( //動かすとき
			1<=sashitaKoma.kind && sashitaKoma.kind<=5 &&
			!(sashitaKoma.kind==2 && !sashitaKoma.isNari)
		){ //金銀桂歩・成香 => 歩香桂銀金から生香を除く
			return distanceChebyshev(
				_sashite.fromSuji, _sashite.fromDan, sujiKing, danKing
			) - distanceChebyshev(
				_sashite.toSuji, _sashite.toDan, sujiKing, danKing
			);
	}else{//その他の駒
		return 0;
	}
}

//動かした駒をただで取られる
function isTadadorare(_sashite){

	var utsuId = findUtsuID(_sashite);
	forwardState(_sashite,gWhichMoves,utsuId);//内部で進める
	switchTeban();//手番交代
	var toruTe = createSashiteArray();
	var toruCount = makeCandidateTe(toruTe);
	var isTorareru = false;
	for(var i=0; !isTorareru && i<toruCount; i++){
		if(toruTe[i].isOK &&
		toruTe[i].isUtsu==0 &&
		toruTe[i].tottaKoma==_sashite.id){//動かした駒を取られる
			forwardState(toruTe[i],gWhichMoves,-1);//内部で進める
			switchTeban();//手番交代
			var kikiTe = createSashiteArray();
			var kikiCount = makeCandidateTe(kikiTe);
			var kikiExist = false;
			for(var j=0; !kikiExist && j<kikiCount; j++){
				kikiExist = (
					kikiTe[j].isOK &&
					kikiTe[j].toSuji==toruTe[i].toSuji &&
					kikiTe[j].toDan==toruTe[i].toDan
				);//そこに利いている
			}
			switchTeban();//手番交代
			backwardState(toruTe[i],gWhichMoves,-1);//内部で戻す
			isTorareru = !kikiExist; //そこに駒が利いていないなら、そりゃ取られる
		}
	}
	switchTeban();//手番交代
	backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す

	return isTorareru;
}

//取られて取り返す - 返り値はスコアか0
function scoreNullToruToru(_sashite){

	//TODO:何やってるのかいまいちわからんので後日

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

	return isTorareru ? minScore : 0;
}
