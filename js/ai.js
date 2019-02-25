//思考用設定値
var gcProbabilityBonus = 0.5; //指し手のボーナスを計算する割合(0-1)
var gcValueHugeNega = -60000; //とてつもなく負の評価値(最近は-30000とか-100000とか見るやつ)
var gcaValuePKind = [0,100,500,500,600,600,1300,1400,3000]; //駒種別既定評価値
var gcValueBeenPromoted = 300; //成駒の評価加算値
var gcValueDoPromote = 1; //駒を成った時の評価加算値(成ることそれ自体の評価)
var gcValueCptrByPawn = 70; //歩で駒を取った時の評価加算値
var gcValueRecaptured = 75; //取って取り返される時の評価加算値
var gcValueTakenFree = 40000; //タダ取りされる時の評価**減算**値
var gcBonusPromote = 15; //成るボーナス(加算)値
var gcBonusDrop = 13; //打つボーナス(加算)値
var gcBonusPrecapt = 3; //当てるボーナス(加算)値
var gcaBonusMovePKind = [0,20, 0,10,20,20, 0, 0,0]; //指した駒種ボーナス(加算)値
var gcaBonusDropPKind = [0,10,10,10,10,10,20,30,0]; //打った駒種ボーナス(加算)値

//コンピュータの番
function aiMove(){

	//人間の手へのリアクション
	reactForHumanTe(gTheMove);

	//コンピュータの手番へ
	switchTeban();

	//コンピュータの手番
	setTimeout(comSide,VERYSLOW);
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
	}else{
		//人間の入力フェーズへ
		gCtrlPhase = 1;
	}
}

//コンピュータが負けたときの処理
function comToryo(){ finishMatch(false); }

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

	if(bMatedHuman){ finishMatch(true); } //com勝利

	return bMatedHuman;
}

//思考ルーチン
function comThink(){
	var i, aiTe = createSashiteArray(),
		aiCount = makeCandidateTe(aiTe);

	//指す手はあるか？ なければ投了(無効な手を返すことで)
	if(!hasLegalSashite(aiTe,aiCount)){
		i=0;
	}else{
		//手のスコアリング
		var bUseBonus = Math.random()<gcProbabilityBonus;
		var s, hiscore = gcValueHugeNega, aIndexesHiscore; //合法手index配列

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
	return !_sashite.isOK ? gcValueHugeNega : //違法手
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

//---- evalMove()内 ----

//スコアリング-取ったり取られたり
function toriTori(_sashite){

	//1.ただ取りできる
	if(isTadadori(_sashite)){
		return (gcaValuePKind[gPieces[_sashite.tottaKoma].kind]
		+ (gPieces[_sashite.tottaKoma].isNari ? gcValueBeenPromoted : 0)
		+ (_sashite.isNaru ? gcValueDoPromote : 0));
	}

	//2.と金と歩は取れるなら取る
	if(isFuTori(_sashite)){
		return (gcaValuePKind[gPieces[_sashite.tottaKoma].kind]
		+ (gPieces[_sashite.tottaKoma].isNari ? gcValueBeenPromoted : 0)
		+ (_sashite.isNaru ? gcValueDoPromote : 0)
		+ gcValueCptrByPawn);
	}

	//3.取って取り返される
	if(isTorikaeshi(_sashite)){
		return (gcaValuePKind[gPieces[_sashite.tottaKoma].kind]
		+ (gPieces[_sashite.tottaKoma].isNari ? gcValueBeenPromoted : 0)
		- gcaValuePKind[gPieces[_sashite.id].kind]
		+ (_sashite.isNaru ? gcValueDoPromote : 0)
		+ gcValueRecaptured);
	}

	//4.動かした駒をタダで取られる
	if(isTadadorare(_sashite)){
		return -(gcaValuePKind[gPieces[_sashite.id].kind]
		+gcValueTakenFree);
	}

	//5.取られても取り返す（または取り返せない）ボーナス
	return scoreNullToruToru(_sashite);
}

//成るボーナス
function bonusNaru(_sashite){
	return (!_sashite.isUtsu && _sashite.isNaru)? gcBonusPromote : 0;
}

//動いた先の先手玉との距離1-8
function bonusDistanceToKing(_sashite){
	var sujiKing = gPieces[19].pos>>>4, danKing = gPieces[19].pos&15;
	var sashitaKoma = gPieces[_sashite.id];

	if( _sashite.isUtsu ){//打つとき
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

//打つボーナス
function bonusUtsu(_sashite){
	return _sashite.isUtsu ? gcBonusDrop : 0;
}

//当てるボーナス
function bonusAtari(_sashite){
	var i, toruTe, toruCount, utsuId = findUtsuID(_sashite);

	forwardState(_sashite,gWhichMoves,utsuId);//内部で進める
	//手番を交代しない
	toruCount = makeCandidateTe( toruTe = createSashiteArray() );
	for(i=0; i<toruCount; i++){
		if(_sashite.id==toruTe[i].id && isSashiteCapture(toruTe[i]) ){
			break; //さらに同じ駒を(合法手で)動かせば、何らかの駒が取れる状態である
		}
	}
	backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す
	return i<toruCount ? gcBonusPrecapt : 0;
}

//動かした駒の種類のボーナス
function bonusKomaKind(_sashite){
	return (_sashite.isUtsu ? gcaBonusDropPKind : gcaBonusMovePKind)[gPieces[_sashite.id].kind];
}

//---- toritori()内 ----

//駒を取る手？
function isSashiteCapture(_sashite){
	return _sashite.isOK && !_sashite.isUtsu && _sashite.tottaKoma!=-1;
}

//ただ取りできるか？
function isTadadori(_sashite){

	if( isSashiteCapture(_sashite) ){//駒を取れるか？

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
	return isSashiteCapture(_sashite) && gPieces[_sashite.id].kind==1;
}

//取っても取り返される？
function isTorikaeshi(_sashite){

	//TODO:isTadadori()とほぼ同じ。if内のreturnが反転している。共通化できないか？

	if( isSashiteCapture(_sashite) ){//駒を取れるか？

		//何で取り返されるかの確認（ほかの駒を取られる可能性は考えない）
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

		return isRecaptured;
	}
	return false; //そもそも駒を取れない
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
		if(toruTe[i].isOK && !toruTe[i].isUtsu &&
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
	var BIGINT = gcaValuePKind[8]<<1, minScoreNx = BIGINT, maxScoreNxnx,
		utsuId = findUtsuID(_sashite);

	forwardState(_sashite,gWhichMoves,utsuId);//内部で進める
	switchTeban();//手番交代
	var toruTe = createSashiteArray(); //toruTeは相手番
	var toruCount = makeCandidateTe(toruTe);
	var i=0, j, isTorareru = false;

	for(; i<toruCount; i++){
		if(toruTe[i].isOK && !toruTe[i].isUtsu && toruTe[i].tottaKoma!=-1){
			//何か取られる
			isTorareru = true;
			maxScoreNxnx = -BIGINT;
			var valueTaken = gcaValuePKind[ gPieces[ toruTe[i].tottaKoma ].kind ]; //取られる駒の価値

			forwardState(toruTe[i],gWhichMoves,-1);//内部で進める
			switchTeban();//手番交代
			var kaesuTe = createSashiteArray(); //kaesuTeは自手番
			var kaesuCount = makeCandidateTe(kaesuTe);
			for(j=0; j<kaesuCount; j++){
				var bGetBack = kaesuTe[j].isOK && kaesuTe[j].toSuji==toruTe[i].toSuji && kaesuTe[j].toDan==toruTe[i].toDan;
				var valueGot = bGetBack ? gcaValuePKind[ gPieces[ kaesuTe[j].tottaKoma ].kind ] : 0;
					//取ってきた駒を取り返せるなら、その駒の価値。もしくは０。
				var score = valueGot - valueTaken;
				if(maxScoreNxnx<score){maxScoreNxnx = score;}
				//maxScore~は、(１手先)相手側候補手の２手先駒価値収支
			}
			switchTeban();//手番交代
			backwardState(toruTe[i],gWhichMoves,-1);//内部で戻す
			if(minScoreNx>maxScoreNxnx){minScoreNx = maxScoreNxnx;}
			//イメージ：１手先の相手が指す手は、取り返されるのを見越して２手先駒価値収支が極力小さくなるよう選ばれるだろう。
		}
	}
	switchTeban();//手番交代
	backwardState(_sashite,gWhichMoves,utsuId);//内部で戻す

	return isTorareru ? minScoreNx : 0;
}
