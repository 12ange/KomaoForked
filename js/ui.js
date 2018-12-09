

$(function(){
	//プレローディング
	preLoading();

	//外枠のposition:relative化
	mainDivRelative();

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
	.css("position","absolute")
	.css("font-size","200%")
	.css("text-align","center")
	.css("top","50px")
	.css("left","300px")
	.css("background-color","#ffffff")
	.css("width","330")
	.css("z-index","50")
	.html("平手")
	.click(function(){statePrepare(0);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi2")
	.css("position","absolute")
	.css("font-size","200%")
	.css("text-align","center")
	.css("top","120px")
	.css("left","300px")
	.css("background-color","#ffffff")
	.css("width","330")
	.css("z-index","50")
	.html("２枚落ち")
	.click(function(){statePrepare(2);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi4")
	.css("position","absolute")
	.css("font-size","200%")
	.css("text-align","center")
	.css("top","190px")
	.css("left","300px")
	.css("background-color","#ffffff")
	.css("width","330")
	.css("z-index","50")
	.html("４枚落ち")
	.click(function(){statePrepare(4);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi6")
	.css("position","absolute")
	.css("font-size","200%")
	.css("text-align","center")
	.css("top","260px")
	.css("left","300px")
	.css("background-color","#ffffff")
	.css("width","330")
	.css("z-index","50")
	.html("６枚落ち")
	.click(function(){statePrepare(6);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi8")
	.css("position","absolute")
	.css("font-size","200%")
	.css("text-align","center")
	.css("top","330px")
	.css("left","300px")
	.css("background-color","#ffffff")
	.css("width","330")
	.css("z-index","50")
	.html("８枚落ち")
	.click(function(){statePrepare(8);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","komaochi10")
	.css("position","absolute")
	.css("font-size","200%")
	.css("text-align","center")
	.css("top","400px")
	.css("left","300px")
	.css("background-color","#ffffff")
	.css("width","330")
	.css("z-index","50")
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
	controlPhase = 4;

	//コンピュータの手番
	teban = 1;

	//手番の明示
	newText("おねがいします　ぼくの番からにゃ");

	//コンピュータの思考へ
	setTimeout("comSide()",VERYSLOW);
}

function startHuman(){
	//人間が先手

	//人間の手番
	teban = 0;

	//最初の合法手の計算
	candidateCount = makeCandidateTe(candidateTe);

	//人間の入力待ち
	controlPhase = 1;

	//手番の明示
	newText("おねがいします　きみの番からにゃ");
}

function preLoading(){
	//画像のプレローディング

	//駒
	//表
	for(var i=1; i<=8; i++){
		for(var j=1; j<=2; j++){
			$("<img>")
			.attr("src","komaImage/" + j + "0" + i + ".png");
		}
	}
	//裏
	var uraNum = [1,2,3,4,6,7];
	for(var i=0; i<6; i++){
		for(var j=1; j<=2; j++){
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

function mainDivRelative(){
	//メインの枠の位置の相対化
	$("#ban")
	.css("position","relative");
}

function imageBanShow(){
	//盤の表示
	$("<img>")
	.attr("src","banImage/ban.png")
	.attr("id","banImage")
	.css("position","relative")
	.css("z-index","0")
	.click(function(event){banClick(event,$("#ban").offset());})
	.appendTo("#ban");//index.htmlにあるdivのid
}

function initialKomaShow(){
	//とりあえず駒の表示
	for(var i=0; i<koma.length; i++){
		if(koma[i].isUse){
			komaAppend(koma[i]);
		}
	}
}

function komaAppend(appendKoma){
	//盤への駒の追加
	$("<img>")
	.attr("src","komaImage/" + appendKoma.sengo + "0" + appendKoma.kind + ".png")
	.attr("id","k" + appendKoma.idNum)
	.css("position","absolute")
	//.css("width","40px")
	//.css("height","40px")
	.css("top",komaShowPositionTop(appendKoma.pos) + "px")
	.css("left",komaShowPositionLeft(appendKoma.pos) + "px")
	.css("z-index","30")
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
	.attr("id","textField")
	.css("position","absolute")
	.css("font-size","140%")
	.css("top","120px")
	.css("left","730px")
	.css("background-color","white")
	.css("width","200")
	.css("z-index","20")
	.appendTo("#ban");//index.htmlにあるdivのid
}

function newText(textMessage){
	//メッセージの表示

	$("#textField")
	.fadeOut(FAST,function(){
		$("#textField")
		.html(textMessage)
		.fadeOut(0)
		.fadeIn(FAST);
	});
}

function questionTextShow(){
	//最初の文字の表示
	$("<div>")
	.attr("id","questionField")
	.css("position","absolute")
	.css("font-size","140%")
	.css("text-align","center")
	.css("top","280px")
	.css("left","0px")
	.css("width","200")
	.css("z-index","20")
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","alternativeFirst")
	.css("position","absolute")
	.css("font-size","140%")
	.css("text-align","center")
	.css("top","350px")
	.css("left","0px")
	.css("background-color","#aa88ff")
	.css("width","200")
	.css("z-index","20")
	.click(function(){determineIsNaru(1);})
	.appendTo("#ban");//index.htmlにあるdivのid

	$("<div>")
	.attr("id","alternativeSecond")
	.css("position","absolute")
	.css("font-size","140%")
	.css("text-align","center")
	.css("top","400px")
	.css("left","0px")
	.css("background-color","#ff88aa")
	.css("width","200")
	.css("z-index","20")
	.click(function(){determineIsNaru(0);})
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



