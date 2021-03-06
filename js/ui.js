
$(function(){
	//non-jQuery-JSer 向け覚え書き：ここは DOMContentLoaded の時に処理される

	//プレローディング
	preLoading();

	//盤の表示
	//imageBanShow();
	//HTML内にSVG直書きにしたのでイベントリスナー登録のみ
	GET_ID("banImage").addEventListener("click", onClickBan)

	//指し手の構造体の領域を確保
	initialMove();

	//メッセージの表示
	initialTextShow();

	//人間の合法手の領域を確保
	initCandidMove();

	//質問の表示
	questionTextShow();

	//駒落ちの選択
	selectKomaochi();
});

//駒落ちの選択
function selectKomaochi(){

	newText("手合いを選ぶにゃ");

	//選択肢は計算で設定・IDに何枚落ちか仕込む
	let ban = GET_ID("ban"), d, i, a=["平手","２枚落ち","４枚落ち","６枚落ち","８枚落ち","１０枚落ち"];
	for(i in a){
		d = NEW_TAG("div");
		d.className = "komaochi";
		d.id = `komaochi${2*i}`;
		d.style.top = `${70*i+50}px`;
		d.textContent = a[i];
		d.addEventListener("click",statePrepare);
		ban.appendChild(d);
	}
}

//駒などの準備
function statePrepare(event){
	let dropcnt = event.currentTarget.id.substring(8)|0;

	//駒落ちの選択を消す
	$(".komaochi").remove();

	//駒の準備
	initialKoma();

	//駒を落とす
	komaOtosu(dropcnt);

	//内部の状態の初期化
	initialState();

	//駒の表示
	initialKomaShow();

	//先後選択して対局開始(駒落ちならCOM常先、そうでなければ半々)
	startMatch( !!dropcnt || Math.random()<0.5 );
}

//対局開始( com先フラグ )
function startMatch( _bComPlaysFirst ){

	//棋譜を記録開始するタイミング
	gcKifu.start(_bComPlaysFirst);

	gCtrlPhase  = _bComPlaysFirst ? 4 : 1; //コンピュータの思考:人間の入力待ち
	gWhichMoves = _bComPlaysFirst ? 1 : 0; //0がHUM,1がCOMの手番

	//手番の明示
	newText("おねがいします　"+( _bComPlaysFirst ? "ぼく":"きみ" )+"の番からにゃ");

	if(_bComPlaysFirst){
		setTimeout(comSide,VERYSLOW); //コンピュータの思考へ
	}else{
		gCandidateCount = makeCandidateTe(gCandidateMove); //最初の合法手の計算
	}
}

//対局終了( com勝利フラグ )
function finishMatch( _bComWinsTheGame ){
	//棋譜を記録完了するタイミング
	gcKifu.finish();

	newText((_bComWinsTheGame?"ぼく":"負けました　きみ")+"の勝ちにゃ　ありがとうございました");
	gCtrlPhase = -1;
	restartText();
}

//画像のプレローディング
function preLoading(){
	//駒
	var a=[[1,2,3,4,5,6,7,8],[1,2,3,4,6,7]];
	for( var i of [0,1] ){
		for( var j in a ){
			for( k of a[j] ){
				$("<img>").attr("src","komaImage/"+i+j+k+".png"); //NEW_TAG
	}	}	}
}

//とりあえず駒の表示
function initialKomaShow(){
	for(var i=0; i<gPieces.length; i++){
		if(gPieces[i].isUse){
			komaAppend(gPieces[i]);
		}
	}
}

//盤への駒の追加
function komaAppend(appendKoma){
	$("<img>") //NEW_TAG
	.attr("src","komaImage/" + appendKoma.sengo + "0" + appendKoma.kind + ".png")
	.attr("id","k" + appendKoma.idNum)
	.attr("class","pieces")
	//.css("width","40px")
	//.css("height","40px")
	.css("top",komaShowPositionTop(appendKoma.pos) + "px")
	.css("left",komaShowPositionLeft(appendKoma.pos) + "px")
	.click(onClickBan)
	.appendTo("#ban");//index.htmlにあるdivのid
}

//駒の画像を消す
function removeKoma(){
	for(var idNum=0; idNum<40; idNum++){
		$("#k" + idNum).remove();
	}
}

//駒の移動先の座標・段
function komaShowPositionTop(pos){
	return((pos % 16) * 50 - 25);
}

//駒の移動先の座標・筋
function komaShowPositionLeft(pos){
	return(- Math.floor(pos / 16) * 50 + 695);
}

//最初の文字の表示
function initialTextShow(){
	$("<div>") //NEW_TAG
	.attr("id","talkField")
	.attr("class","fields")
	.appendTo("#ban");//index.htmlにあるdivのid
}

//メッセージの表示
function newText(textMessage){
	$("#talkField")
	.fadeOut(FAST,function(){
		$("#talkField")
		.html(textMessage)
		.fadeOut(0)
		.fadeIn(FAST);
	});
}

//最初の文字の表示
function questionTextShow(){
	$("<div>") //NEW_TAG
	.attr("id","questionField")
	.attr("class","fields")
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>") //NEW_TAG
	.attr("id","alternativeFirst")
	.attr("class","alternatives")
	.click(function(){determineIsNaru(true);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>") //NEW_TAG
	.attr("id","alternativeSecond")
	.attr("class","alternatives")
	.click(function(){determineIsNaru(false);})
	.appendTo("#ban");//index.htmlにあるdivのid

	//ダイアログを消す
	$("#questionField")
	.fadeOut(0);
	$("#alternativeFirst")
	.fadeOut(0);
	$("#alternativeSecond")
	.fadeOut(0);
}

//成るか成らないかのダイアログの表示
function dialogOfNaru(){

	//その前に移動先のハイライト
	selectHighlight(gTheMove.toSuji,gTheMove.toDan,false);

	//ダイアログ
	$("#questionField")
	.html("『成る？』")
	.fadeIn(FAST);

	$("#alternativeFirst")
	.html("成る")
	.fadeIn(FAST);

	$("#alternativeSecond")
	.html("成らない")
	.fadeIn(FAST);
}

//成るか成らないか
function determineIsNaru(_isNaru){

	gTheMove.isNaru = _isNaru;

	//ダイアログを消す
	$("#questionField")
	.fadeOut(FAST);
	$("#alternativeFirst")
	.fadeOut(FAST);
	$("#alternativeSecond")
	.fadeOut(FAST);

	//駒を動かしてAIに渡す
	forwardAndAi();
}

//もう一度対局するか
function restartText(){
	$("<div>") //NEW_TAG
	.attr("id","alternativeRestart")
	.attr("class","alternatives")
	.html("もう１回？")
	.click(()=>{restartPrepare(false);})
	.appendTo("#ban")//index.htmlにあるdivのid
	.hide()
	.fadeIn(VERYSLOW);

	$("<div>") //NEW_TAG
	.attr("id","alternativeSaveKifu")
	.attr("class","alternatives")
	.html("棋譜保存？")
	.click(()=>{restartPrepare(true);})
	.appendTo("#ban")//index.htmlにあるdivのid
	.hide()
	.fadeIn(VERYSLOW);
}

//もう一度対局する
function restartPrepare(_flagSaveKifu){
	//TODO:PLが降参(リセット)したときにも使える

	if( _flagSaveKifu ){
		gcKifu.getCSAFileAs(`komao_${getLocalTimeISOStr().replace(/[-:T]/g,"_")}`);
	}

	//ボタンの削除
	$("#alternativeRestart").remove();
	$("#alternativeSaveKifu").remove();

	//駒とかの削除
	removeKoma();
	highlightErase();
	mochiCountRemove();

	//駒落ちの選択
	selectKomaochi();
}
