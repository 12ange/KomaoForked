
function initialMove(){
	//指し手の構造体の領域を確保
	gTheMove = new TSashite();
}

function banClick(event,offset){
	//駒や盤をクリックしたら
	var suji;
	var dan;
	var messageMovableOrImpossible;
	var movableNum;

	//駒を動かす
	if(gCtrlPhase==1){
		suji = clickSuji(event,offset);
		dan = clickDan(event,offset);
		fromInput(suji,dan,"動かせる駒はそこにはないにゃ");
	}else if(gCtrlPhase==2){
		suji = clickSuji(event,offset);
		dan = clickDan(event,offset);
		toInput(suji,dan);
		messageMovableOrImpossible = isMovable();
		if(messageMovableOrImpossible===""){
			gCtrlPhase = 3;
			movableNum = numOfCandidateMove();//成る場合はこの内部で代入
			if(movableNum>=2){
				dialogOfNaru();//成るか成らないか、そのあとforwardAndAi()
			}else{
				forwardAndAi();//駒を動かしてAIに手番を渡す
			}
		}else{
			highlightErase();//ハイライトを消す
			newText(messageMovableOrImpossible);//そこは動かせないにゃなど
			gCtrlPhase = 1;
		}
	}
}

function forwardAndAi(){
	//駒を進めて、コンピュータが指して、次の候補手を計算する
	gCtrlPhase = 4;
	highlightErase();//ハイライトを消す
	forwardKoma(gTheMove,gWhichMoves);
	aiMove();//コンピュータの番
}

function clickSuji(event,offset){
	//クリックした筋
	var sujiLeft = offset.left - event.pageX;

	var suji = Math.floor((sujiLeft + 740) / 50);
	if(1 <= suji && suji <= 9){//盤上
		return(suji);
	}

	if((-1 <= ((sujiLeft + 760) / 50) && ((sujiLeft + 760) / 50) <= 0) ||
	(-1 <= ((sujiLeft + 110) / 50) && ((sujiLeft + 110) / 50) <= 0)){
		return(-1);//駒台１列目
	}

	if((-1 <= ((sujiLeft + 840) / 50) && ((sujiLeft + 840) / 50) <= 0) ||
	(-1 <= ((sujiLeft + 30) / 50) && ((sujiLeft + 30) / 50) <= 0)){
		return(-2);//駒台２列目
	}

	return(0);//番外
}

function clickDan(event,offset){
	//クリックした段
	var dan = Math.floor((event.pageY - offset.top + 30) / 50);
	if(1 <= dan && dan <= 9){
		return(dan);
	}
	return(0);
}

function selectHighlight(suji,dan,isErase){
	//クリックしたところをハイライト

	if(isErase){
		highlightErase();//まずはハイライトを消す
	}

	if(suji==0 || dan==0){return;}//関係ないところをクリックしたらハイライトしない

	$("<img>")
	.attr("src","komaImage/select.png")
	.attr("id","highlight")
	.css("position","absolute")
	.css("top",selectShowPositionTop(dan) + "px")
	.css("left",selectShowPositionLeft(suji) + "px")
	.css("z-index","40")
    // IE6.0, IE7.0
    .css("filter","alpha(opacity=50)") 
    // Firefox, Netscape
    .css("MozOpacity","0.5")
    // Chrome, Safari, Opera
    .css("opacity","0.5")
	.click(function(event){banClick(event,$("#ban").offset());})
	.appendTo("#ban");//index.htmlにあるdivのid
}


function selectShowPositionTop(dan){
	//駒の移動先の座標・段
	return(dan * 50 - 30);
}

function selectShowPositionLeft(suji){
	//駒の移動先の座標・筋
	if(1<=suji && suji<=9){
		return(- suji * 50 + 690);
	}else if(gWhichMoves==0 && suji==-1){//先手
		return(760);
	}else if(gWhichMoves==0 && suji==-2){//先手
		return(840);
	}else if(gWhichMoves==1 && suji==-1){//後手
		return(110);
	}else if(gWhichMoves==1 && suji==-2){//後手
		return(30);
	}
}

function highlightErase(){
	//ハイライトを消す
	//二つ必要
	$("#highlight").remove();
	$("#highlight").remove();
}

function fromInput(suji,dan,errorMessage){
	//移動元の入力

	var blank = 4;//壁

	//盤上からの入力
	if(1<=suji && suji<=9 && 1<=dan && dan<=9){
		blank = gTblSqDepend[16*suji+dan];
	}
	if((blank==1 && gWhichMoves==0) || (blank==2 && gWhichMoves==1)){
		//そこに自分の駒があれば
		gTheMove.isUtsu = false;
		gTheMove.fromSuji = suji;
		gTheMove.fromDan = dan;
		//選んだ駒の確認
		newText("どこへ動かすにゃ？")
		//選択した駒をハイライト
		selectHighlight(suji,dan,1);
		//移動先を選ぶフェーズへ
		gCtrlPhase = 2;
		return;
	}

	//駒台からの入力
	if(gWhichMoves==0 && (suji==-1 || suji==-2) && (6<=dan && dan<=9)){//先手
		if(suji==-1 && dan==9 && gInHandPc[gWhichMoves][1]>0){//歩
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 1;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-2 && dan==8 && gInHandPc[gWhichMoves][2]>0){//香
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 2;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-1 && dan==8 && gInHandPc[gWhichMoves][3]>0){//桂
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 3;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-2 && dan==7 && gInHandPc[gWhichMoves][4]>0){//銀
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 4;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-1 && dan==7 && gInHandPc[gWhichMoves][5]>0){//金
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 5;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-2 && dan==6 && gInHandPc[gWhichMoves][6]>0){//角
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 6;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-1 && dan==6 && gInHandPc[gWhichMoves][7]>0){//飛
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 7;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}
	}else if(gWhichMoves==1 && (suji==-1 || suji==-2) && (1<=dan && dan<=4)){//後手
		if(suji==-1 && dan==1 && gInHandPc[gWhichMoves][1]>0){//歩
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 1;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-2 && dan==2 && gInHandPc[gWhichMoves][2]>0){//香
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 2;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-1 && dan==2 && gInHandPc[gWhichMoves][3]>0){//桂
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 3;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-2 && dan==3 && gInHandPc[gWhichMoves][4]>0){//銀
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 4;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-1 && dan==3 && gInHandPc[gWhichMoves][5]>0){//金
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 5;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-2 && dan==4 && gInHandPc[gWhichMoves][6]>0){//角
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 6;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}else if(suji==-1 && dan==4 && gInHandPc[gWhichMoves][7]>0){//飛
			gTheMove.isUtsu = true;
			gTheMove.fromSuji = suji;
			gTheMove.fromDan = dan;
			gTheMove.MochiKoma = 7;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			gCtrlPhase = 2;
			return;
		}
	}

	//その他
	if(errorMessage!=-1){
		newText(errorMessage);
	}
}

function toInput(suji,dan){
	//移動先の入力

	var blank;

	//盤上への入力
	if(1<=suji && suji<=9 && 1<=dan && dan<=9){
		blank = gTblSqDepend[16*suji+dan];
	}else{//盤外なら
		gTheMove.tottaKoma = -2;//エラーメッセージなし
		gTheMove.toSuji = -1;
		gTheMove.toDan = -1;
		return;
	}

	if(blank==0){//そこが空白なら
		gTheMove.tottaKoma = -1;
		gTheMove.tottaNari = false;
		gTheMove.toSuji = suji;
		gTheMove.toDan = dan;
	}else if(!gTheMove.isUtsu && ((gWhichMoves==0 && blank==2) || (gWhichMoves==1 && blank==1))){//盤上からの相手の駒なら
		gTheMove.tottaKoma = gTblPcIndex[16*suji+dan];
		gTheMove.tottaNari = gPieces[gTheMove.tottaKoma].isNari;
		gTheMove.toSuji = suji;
		gTheMove.toDan = dan;
	}else if(!gTheMove.isUtsu && dan==gTheMove.fromDan && suji==gTheMove.fromSuji){//選択した駒なら
		gTheMove.tottaKoma = -2;//エラーメッセージなし
		gTheMove.toSuji = -1;
		gTheMove.toDan = -1;
	}else{//動けないところなら
		gTheMove.tottaKoma = -1;
		gTheMove.toSuji = -1;
		gTheMove.toDan = -1;
	}
}

function isMovable(){
	//そこに動けるか、動けないとしたらなぜか
	//動けるときには空文字列を返す
	//動けないときにはメッセージを返す

	//盤外と選択した駒
	if(gTheMove.tottaKoma==-2){
		return "別のにするのにゃ？"; //無害なメッセージ。エラーではないものの動くわけではないので
	}

	var messageMovableOrImpossible =
		gTheMove.isUtsu ? "そこには打てないにゃ" : "そこには指せないにゃ"; //デフォルトメッセージ

	//動けるか
	if( 1<=gTheMove.toSuji && gTheMove.toSuji<=9 && 1<=gTheMove.toDan && gTheMove.toDan<=9 ){
		//候補手との照らし合わせ
		for(var i=0; i<gCandidateCount; i++){
			if( isSameTe(gTheMove,gCandidateMove[i]) ){//成不成で二つある場合がある
				if(gCandidateMove[i].isOK){
					messageMovableOrImpossible = "";
					break;
				}else{
					//エラーメッセージを取り出す
					messageMovableOrImpossible = gCandidateMove[i].strWhyNoGood;
				}
			}
		}
	}
	return messageMovableOrImpossible;
}

function numOfCandidateMove(){
	//成不成の両方の可能性があるか
	//なければisNaruを決定

	var numCand = 0;

	//候補手との照らし合わせ
	for(var i=0; i<gCandidateCount; i++){
		if(isSameTe(gTheMove,gCandidateMove[i])){//成不成で二つある場合がある
			if(gCandidateMove[i].isOK){//どちらかが反則の場合もある
				numCand++;
				gTheMove.isNaru = gCandidateMove[i].isNaru;//一つだけのときのために写しておく
			}
		}
	}

	return(numCand);
}

//成不成を除いて同一の手かどうか
function isSameTe(_teA,_teB){
	return (
		(
			//打つ
			_teA.isUtsu && _teB.isUtsu && _teA.MochiKoma==_teB.MochiKoma
		)||(
			//盤上から指す
			!_teA.isUtsu && !_teB.isUtsu &&
			_teA.fromSuji==_teB.fromSuji && _teA.fromDan==_teB.fromDan
		)
	) && _teA.toSuji==_teB.toSuji && _teA.toDan==_teB.toDan;
}

function forwardKoma(_te,_teban){
	//駒の画像を動かす

	var utsuId = -1;
	var komaId,tottaId,maisuu;

	if(_te.isUtsu){//打つ
		for(var i=0; i<gPieces.length; i++){
			if(gPieces[i].isUse && gPieces[i].sengo==_teban && gPieces[i].isMochi && gPieces[i].kind==_te.MochiKoma){
				komaId = i;
				break;
			}
		}
		mochiCountShow(_te.MochiKoma,_teban,gInHandPc[_teban][_te.MochiKoma]-1);
		$("#k"+komaId)
		.css("z-index","100")
		.animate({
			left: komaShowPositionLeft(_te.toSuji*16) + "px",
			top: komaShowPositionTop(_te.toDan) + "px"
		},SLOW,"swing",function(){
			$("#k"+komaId)
			.css("z-index","30");
		});
		utsuId = komaId;
	}else{//盤上の駒を動かす
		komaId = gTblPcIndex[_te.fromSuji*16+_te.fromDan];
		tottaId = _te.tottaKoma;
		maisuu = _te.tottaKoma==-1 ? -1 : gInHandPc[_teban][gPieces[_te.tottaKoma].kind];
		$("#k"+komaId)
		.css("z-index","100")
		.animate({
			left: komaShowPositionLeft(_te.toSuji*16) + "px",
			top: komaShowPositionTop(_te.toDan) + "px"
		},SLOW,"swing",function(){
			$("#k"+komaId)
			.css("z-index","30");
			//成りの考慮
			if(_te.isNaru){
				$("#k"+komaId)
				.attr("src","komaImage/" + _teban + 1 + gPieces[komaId].kind + ".png");
			}
			//取る処理
			if(_te.tottaKoma!=-1){//駒を取っていれば
				$("#k"+tottaId)
				.css("z-index","90")
				.animate({
					left: mochiKomaPositionLeft(gPieces[tottaId].kind,_teban) + "px",
					top: mochiKomaPositionTop(gPieces[tottaId].kind,_teban) + "px"
				},SLOW,"swing",function(){
					$("#k"+tottaId)
					.attr("src","komaImage/" + _teban + "0" + gPieces[tottaId].kind + ".png")
					.css("z-index","30");
					mochiCountShow(gPieces[tottaId].kind,_teban,maisuu+1);
				});
			}
		});
	}

	//内部変数を動かす
	forwardState(_te,_teban,utsuId);
}

function forwardState(_te,_teban,utsuId){
	//駒の内部変数や盤の内部変数を動かす

	var toPos;
	var fromPos;
	var komaId;

	if(_te.isUtsu){//打つ
		//移動先
		toPos = 16 * _te.toSuji + _te.toDan;
		//駒
		gPieces[utsuId].pos = toPos;//位置//持ち駒は-1
		gPieces[utsuId].isNari = false;
		gPieces[utsuId].isMochi = false;
		//持ち駒
		gInHandPc[_teban][gPieces[utsuId].kind]--;
		//盤
		gTblPcIndex[toPos] = utsuId;
		if(gPieces[utsuId].sengo==0){//先手
			gTblSqDepend[toPos] = 1;
		}else{//後手
			gTblSqDepend[toPos] = 2;
		}
	}else{//盤上の駒を動かす
		//位置
		fromPos = 16 * _te.fromSuji + _te.fromDan;
		toPos = 16 * _te.toSuji + _te.toDan;
		//駒id
		komaId = gTblPcIndex[fromPos];
		//koma変数
		gPieces[komaId].pos = toPos;
		if(_te.isNaru){//成るなら
			gPieces[komaId].isNari = true;
		}
		//盤変数（２つ）
		gTblPcIndex[fromPos] = -1;
		gTblPcIndex[toPos] = komaId;
		gTblSqDepend[fromPos] = 0;
		if(gPieces[komaId].sengo==0){//先手
			gTblSqDepend[toPos] = 1;
		}else{//後手
			gTblSqDepend[toPos] = 2;
		}

		//取る処理
		if(_te.tottaKoma!=-1){//駒を取っていれば
			//駒
			gPieces[_te.tottaKoma].pos = -1;
			gPieces[_te.tottaKoma].isNari = false;
			gPieces[_te.tottaKoma].isMochi = true;
			gPieces[_te.tottaKoma].sengo = _teban;//0:先手, 1:後手
			gInHandPc[_teban][gPieces[_te.tottaKoma].kind]++;
			//盤
			//上の操作ですでに変化している
		}
	}

}

function backwardState(_te,_teban,utsuId){
	//駒の内部変数や盤の内部変数を戻す

	var toPos;
	var fromPos;
	var komaId;

	if(_te.isUtsu){//打つ
		//移動先
		toPos = 16 * _te.toSuji + _te.toDan;
		//駒
		gPieces[utsuId].pos = -1;//位置//持ち駒は-1
		gPieces[utsuId].isNari = false;
		gPieces[utsuId].isMochi = true;//盤上から持ち駒に戻すのだから
		//持ち駒
		gInHandPc[_teban][gPieces[utsuId].kind]++;
		//盤
		gTblPcIndex[toPos] = -1;
		gTblSqDepend[toPos] = 0;
	}else{//盤上の駒を動かす
		//位置
		fromPos = 16 * _te.fromSuji + _te.fromDan;
		toPos = 16 * _te.toSuji + _te.toDan;
		//駒id
		komaId = gTblPcIndex[toPos];
		//koma変数
		gPieces[komaId].pos = fromPos;
		if(_te.isNaru){//成るなら成る前の状態に
			gPieces[komaId].isNari = false;
		}
		//盤変数（２つ）
		gTblPcIndex[fromPos] = komaId;
		gTblPcIndex[toPos] = -1;
		gTblSqDepend[toPos] = 0;
		if(gPieces[komaId].sengo==0){//先手
			gTblSqDepend[fromPos] = 1;
		}else{//後手
			gTblSqDepend[fromPos] = 2;
		}
		//取る処理
		if(_te.tottaKoma!=-1){//駒を取っていれば
			//駒
			gPieces[_te.tottaKoma].pos = toPos;
			gPieces[_te.tottaKoma].isNari = _te.tottaNari;
			gPieces[_te.tottaKoma].isMochi = false;//取った駒を盤上に戻すのだから
			gPieces[_te.tottaKoma].sengo = (_teban==0 ? 1 : 0);//0:先手, 1:後手
			gInHandPc[_teban][gPieces[_te.tottaKoma].kind]--;
			//盤
			gTblPcIndex[toPos] = _te.tottaKoma;
			if(_teban==0){//手番が先手なら取った駒は後手
				gTblSqDepend[toPos] = 2;
			}else{//手番が後手なら取った駒は先手
				gTblSqDepend[toPos] = 1;
			}
		}
	}

}

function mochiKomaPositionLeft(kind,_teban){
	//持ち駒に移動するときの座標
	if(_teban==0 && (kind==7 || kind==5 || kind==3 || kind==1)){
		return(765);
	}else if(_teban==0 && (kind==6 || kind==4 || kind==2 || kind==8)){
		return(845);
	}else if(_teban==1 && (kind==7 || kind==5 || kind==3 || kind==1)){
		return(115);
	}else if(_teban==1 && (kind==6 || kind==4 || kind==2 || kind==8)){
		return(35);
	}
}

function mochiKomaPositionTop(kind,_teban){
	//持ち駒に移動するときの座標
	if(_teban==0 && (kind==7 || kind==6 )){
		return(komaShowPositionTop(6));
	}else if(_teban==0 && (kind==5 || kind==4 )){
		return(komaShowPositionTop(7));
	}else if(_teban==0 && (kind==3 || kind==2 )){
		return(komaShowPositionTop(8));
	}else if(_teban==0 && (kind==1 || kind==8 )){
		return(komaShowPositionTop(9));
	}else if(_teban==1 && (kind==7 || kind==6 )){
		return(komaShowPositionTop(4));
	}else if(_teban==1 && (kind==5 || kind==4 )){
		return(komaShowPositionTop(3));
	}else if(_teban==1 && (kind==3 || kind==2 )){
		return(komaShowPositionTop(2));
	}else if(_teban==1 && (kind==1 || kind==8 )){
		return(komaShowPositionTop(1));
	}
}

function mochiCountShow(_kind,_teban,_maisuu){
	//持ち駒の枚数の表示

	$("#m" + _teban + _kind)
	.remove();//まずは消す

	$("<div>")
	.attr("id","m" + _teban + _kind)
	.css("position","absolute")
	.css("font-size","140%")
	.css("top",(20+mochiKomaPositionTop(_kind,_teban)) + "px")
	.css("left",(45+mochiKomaPositionLeft(_kind,_teban)) +"px")
	.css("z-index","20")
	.appendTo("#ban");//index.htmlにあるdivのid

	if(_maisuu>=2){//2枚以上なら枚数を横に表示
		$("#m" + _teban + _kind).html(""+_maisuu);
	}
}

function mochiCountRemove(){
	//持ち駒の枚数表示の削除

	for(var k=1; k<=8; k++){ //k is kind
		$("#m0" + k).remove();
		$("#m1" + k).remove();
	}
}
