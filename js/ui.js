
$(function(){
	//non-jQuery-JSer 向け覚え書き：ここは DOMContentLoaded の時に処理される

	//プレローディング
	preLoading();

	//盤の表示
	imageBanShow();

	//指し手の構造体の領域を確保
	initialMove();

	//メッセージの表示
	initialTextShow();

	//人間の合法手の領域を確保
	initialGouhou();

	//質問の表示
	questionTextShow();

	//駒落ちの選択
	selectKomaochi();
});

function selectKomaochi(){
	//駒落ちの選択

	newText("手合いを選ぶにゃ");

	$("<div>")
	.attr("id","komaochi0")
	.attr("class","komaochi")
	.html("平手")
	.click(function(){statePrepare(0);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi2")
	.attr("class","komaochi")
	.html("２枚落ち")
	.click(function(){statePrepare(2);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi4")
	.attr("class","komaochi")
	.html("４枚落ち")
	.click(function(){statePrepare(4);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi6")
	.attr("class","komaochi")
	.html("６枚落ち")
	.click(function(){statePrepare(6);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi8")
	.attr("class","komaochi")
	.html("８枚落ち")
	.click(function(){statePrepare(8);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi10")
	.attr("class","komaochi")
	.html("１０枚落ち")
	.click(function(){statePrepare(10);})
	.appendTo("#ban");//index.htmlにあるdivのid
}

function komaochiRemove(){
	//駒落ちの選択を消す

	$("#komaochi0").remove();
	$("#komaochi2").remove();
	$("#komaochi4").remove();
	$("#komaochi6").remove();
	$("#komaochi8").remove();
	$("#komaochi10").remove();

}

function statePrepare(komaochi){
	//駒などの準備

	//駒落ちの選択を消す
	komaochiRemove();

	//駒の準備
	initialKoma();

	//駒を落とす
	komaOtosu(komaochi);

	//内部の状態の初期化
	initialState();

	//駒の表示
	initialKomaShow();

	if(komaochi!=0){//コンピュータから
		startCom();
	}else if(Math.random()<0.5){//やっぱりコンピュータから
		startCom();
	}else{//人間から
		startHuman();
	}

}

function startCom(){
	//コンピュータが先手または上手

	//コンピュータの思考フェーズ
	gCtrlPhase = 4;

	//コンピュータの手番
	teban = 1;

	//手番の明示
	newText("おねがいします　ぼくの番からにゃ");

	//コンピュータの思考へ
	setTimeout("comSide()",VERYSLOW);
}

function startHuman(){
	//人間が先手

	//人間の入力待ち
	gCtrlPhase = 1;

	//人間の手番
	teban = 0;

	//最初の合法手の計算
	candidateCount = makeCandidateTe(candidateTe);

	//手番の明示
	newText("おねがいします　きみの番からにゃ");
}

function preLoading(){
	//画像のプレローディング

	//駒
	//表
	for(var i=1; i<=8; i++){
		for(var j=0; j<2; j++){
			$("<img>")
			.attr("src","komaImage/" + j + "0" + i + ".png");
		}
	}
	//裏
	var uraNum = [1,2,3,4,6,7];
	for(var i=0; i<6; i++){
		for(var j=0; j<2; j++){
			$("<img>")
			.attr("src","komaImage/" + j + "1" + uraNum[i] + ".png");
		}
	}

	//ハイライト
	$("<img>")
	.attr("src","komaImage/select.png");

	//盤
	$("<img>")
	.attr("src","banImage/ban.png");
}

function imageBanShow(){
	//盤の表示
	$("<img>")
	.attr("src","banImage/ban.png")
	.attr("id","banImage")
	.click(function(event){banClick(event,$("#ban").offset());})
	.appendTo("#ban");//index.htmlにあるdivのid
}

function initialKomaShow(){
	//とりあえず駒の表示
	for(var i=0; i<gPieces.length; i++){
		if(gPieces[i].isUse){
			komaAppend(gPieces[i]);
		}
	}
}

function komaAppend(appendKoma){
	//盤への駒の追加
	$("<img>")
	.attr("src","komaImage/" + appendKoma.sengo + "0" + appendKoma.kind + ".png")
	.attr("id","k" + appendKoma.idNum)
	.attr("class","pieces")
	//.css("width","40px")
	//.css("height","40px")
	.css("top",komaShowPositionTop(appendKoma.pos) + "px")
	.css("left",komaShowPositionLeft(appendKoma.pos) + "px")
	.click(function(event){banClick(event,$("#ban").offset());})
	.appendTo("#ban");//index.htmlにあるdivのid
}

function removeKoma(){
	//駒の画像を消す

	for(var idNum=0; idNum<40; idNum++){
		$("#k" + idNum).remove();
	}
}

function komaShowPositionTop(pos){
	//駒の移動先の座標・段
	return((pos % 16) * 50 - 25);
}

function komaShowPositionLeft(pos){
	//駒の移動先の座標・筋
	return(- Math.floor(pos / 16) * 50 + 695);
}

function initialTextShow(){
	//最初の文字の表示
	$("<div>")
	.attr("id","talkField")
	.attr("class","fields")
	.appendTo("#ban");//index.htmlにあるdivのid
}

function newText(textMessage){
	//メッセージの表示

	$("#talkField")
	.fadeOut(FAST,function(){
		$("#talkField")
		.html(textMessage)
		.fadeOut(0)
		.fadeIn(FAST);
	});
}

function questionTextShow(){
	//最初の文字の表示
	$("<div>")
	.attr("id","questionField")
	.attr("class","fields")
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","alternativeFirst")
	.attr("class","alternatives")
	.click(function(){determineIsNaru(true);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
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

function dialogOfNaru(){
	//成るか成らないかのダイアログの表示

	//その前に移動先のハイライト
	selectHighlight(te.toSuji,te.toDan,0);

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

function determineIsNaru(isNaru){
	//成るか成らないか
	te.isNaru = isNaru;

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

function restartText(){
	//もう一度対局するか

	$("<div>")
	.attr("id","alternativeRestart")
	.attr("class","alternatives")
	.html("もう１回？")
	.click(function(){restartPrepare();})
	.appendTo("#ban")//index.htmlにあるdivのid
	.hide()
	.fadeIn(VERYSLOW);
}

function restartPrepare(){
	//もう一度対局する

	//ボタンの削除
	$("#alternativeRestart").remove();

	//駒とかの削除
	removeKoma();
	highlightErase();
	mochiCountRemove();

	//駒落ちの選択
	selectKomaochi();
}
