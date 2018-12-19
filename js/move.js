

function initialMove(){
	//指し手の構造体の領域を確保
	te = new TSashite();
}

function banClick(event,offset){
	//駒や盤をクリックしたら
	var suji;
	var dan;
	var isMovableOrImpossibleMessage;
	var movableNum;

	//駒を動かす
	if(controlPhase==1){
		suji = clickSuji(event,offset);
		dan = clickDan(event,offset);
		fromInput(suji,dan,"動かせる駒はそこにはないにゃ");
	}else if(controlPhase==2){
		suji = clickSuji(event,offset);
		dan = clickDan(event,offset);
		toInput(suji,dan);
		isMovableOrImpossibleMessage = isMovable();
		if(isMovableOrImpossibleMessage===""){
			controlPhase = 3;
			movableNum = numOfCandidateMove();//成る場合はこの内部で代入
			if(movableNum>=2){
				dialogOfNaru();//成るか成らないか、そのあとforwardAndAi()
			}else{
				forwardAndAi();//駒を動かしてAIに手番を渡す
			}
		}else{
			highlightErase();//ハイライトを消す
			newText(isMovableOrImpossibleMessage);//そこは動かせないにゃなど
			controlPhase = 1;
		}
	}
}

function forwardAndAi(){
	//駒を進めて、コンピュータが指して、次の候補種を計算する
	controlPhase = 4;
	highlightErase();//ハイライトを消す
	forwardKoma(te,teban);
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
	}else if(teban==0 && suji==-1){//先手
		return(760);
	}else if(teban==0 && suji==-2){//先手
		return(840);
	}else if(teban==1 && suji==-1){//後手
		return(110);
	}else if(teban==1 && suji==-2){//後手
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
		blank = blankBan[16*suji+dan];
	}
	if((blank==1 && teban==0) || (blank==2 && teban==1)){
		//そこに自分の駒があれば
		te.isUtsu = 0;
		te.fromSuji = suji;
		te.fromDan = dan;
		//選んだ駒の確認
		newText("どこへ動かすにゃ？")
		//選択した駒をハイライト
		selectHighlight(suji,dan,1);
		//移動先を選ぶフェーズへ
		controlPhase = 2;
		return;
	}

	//駒台からの入力
	if(teban==0 && (suji==-1 || suji==-2) && (6<=dan && dan<=9)){//先手
		if(suji==-1 && dan==9 && mochi[teban][1]>0){//歩
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 1;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-2 && dan==8 && mochi[teban][2]>0){//香
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 2;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-1 && dan==8 && mochi[teban][3]>0){//桂
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 3;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-2 && dan==7 && mochi[teban][4]>0){//銀
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 4;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-1 && dan==7 && mochi[teban][5]>0){//金
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 5;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-2 && dan==6 && mochi[teban][6]>0){//角
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 6;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-1 && dan==6 && mochi[teban][7]>0){//飛
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 7;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}
	}else if(teban==1 && (suji==-1 || suji==-2) && (1<=dan && dan<=4)){//後手
		if(suji==-1 && dan==1 && mochi[teban][1]>0){//歩
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 1;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-2 && dan==2 && mochi[teban][2]>0){//香
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 2;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-1 && dan==2 && mochi[teban][3]>0){//桂
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 3;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-2 && dan==3 && mochi[teban][4]>0){//銀
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 4;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-1 && dan==3 && mochi[teban][5]>0){//金
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 5;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-2 && dan==4 && mochi[teban][6]>0){//角
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 6;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
			return;
		}else if(suji==-1 && dan==4 && mochi[teban][7]>0){//飛
			te.isUtsu = 1;
			te.fromSuji = suji;
			te.fromDan = dan;
			te.MochiKoma = 7;
			//選んだ駒の確認
			newText("どこへ打つにゃ？")
			//選択した駒をハイライト
			selectHighlight(suji,dan,1);
			//移動先を選ぶフェーズへ
			controlPhase = 2;
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
		blank = blankBan[16*suji+dan];
	}else{//盤外なら
		te.tottaKoma = -2;//エラーメッセージなし
		te.toSuji = -1;
		te.toDan = -1;
		return;
	}

	if(blank==0){//そこが空白なら
		te.tottaKoma = -1;
		te.tottaNari = false;
		te.toSuji = suji;
		te.toDan = dan;
	}else if(te.isUtsu==0 && ((teban==0 && blank==2) || (teban==1 && blank==1))){//盤上からの相手の駒なら
		te.tottaKoma = idBan[16*suji+dan];
		te.tottaNari = koma[te.tottaKoma].isNari;
		te.toSuji = suji;
		te.toDan = dan;
	}else if(te.isUtsu==0 && dan==te.fromDan && suji==te.fromSuji){//選択した駒なら
		te.tottaKoma = -2;//エラーメッセージなし
		te.toSuji = -1;
		te.toDan = -1;
	}else{//動けないところなら
		te.tottaKoma = -1;
		te.toSuji = -1;
		te.toDan = -1;
	}

}

function isMovable(){
	//そこに動けるか、動けないとしたらなぜか
	//動けるときには空文字列を返す
	//動けないときにはメッセージを返す
	var isMovableOrImpossibleMessage;

	//盤外と選択した駒
	if(te.tottaKoma==-2){
		return("別のにするのにゃ？"); //無害なメッセージ。エラーではないものの動くわけではないので
	}

	//動けるか
	if(te.toSuji<1 || 9<te.toSuji || te.toDan<1 || 9<te.toDan){//盤上の自分の駒
		if(te.isUtsu==1){
			isMovableOrImpossibleMessage = "そこには打てないにゃ";
		}else{
			isMovableOrImpossibleMessage = "そこには指せないにゃ";
		}
	}else{//盤上の空白と相手の駒
		//デフォルトメッセージ
		if(te.isUtsu==1){
			isMovableOrImpossibleMessage = "そこには打てないにゃ";
		}else{
			isMovableOrImpossibleMessage = "そこには指せないにゃ";
		}
		//候補手との照らし合わせ
		for(var i=0; i<candidateCount; i++){
			if( isSameTe(te,candidateTe[i]) ){//成不成で二つある場合がある
				if(candidateTe[i].isOK){
					isMovableOrImpossibleMessage = "";
					break;
				}else{
					//エラーメッセージを取り出す
					isMovableOrImpossibleMessage = candidateTe[i].strWhyNoGood;
				}
			}
		}
	}

	return(isMovableOrImpossibleMessage);
}

function numOfCandidateMove(){
	//成不成の両方の可能性があるか
	//なければisNaruを決定

	var numCand = 0;

	//候補手との照らし合わせ
	for(var i=0; i<candidateCount; i++){
		if(isSameTe(te,candidateTe[i])){//成不成で二つある場合がある
			if(candidateTe[i].isOK){//どちらかが反則の場合もある
				numCand++;
				te.isNaru = candidateTe[i].isNaru;//一つだけのときのために写しておく
			}
		}
	}

	return(numCand);
}

function isSameTe(actualTe,candTe){
	//成不成を除いて同一の手かどうか
	if(actualTe.isUtsu==1){//打つなら
		if(candTe.isUtsu==1
		&& actualTe.MochiKoma==candTe.MochiKoma
		&& actualTe.toSuji==candTe.toSuji
		&& actualTe.toDan==candTe.toDan){

			return(true);
		}
	}else{//盤上から動かすなら
		if(candTe.isUtsu==0
		&& actualTe.fromSuji==candTe.fromSuji
		&& actualTe.fromDan==candTe.fromDan
		&& actualTe.toSuji==candTe.toSuji
		&& actualTe.toDan==candTe.toDan){

			return(true);
		}
	}

	return(false);
}

function forwardKoma(te,teban){
	//駒の画像を動かす

	var utsuId = -1;
	var komaId,tottaId,maisuu;

	if(te.isUtsu){//打つ
		for(var i=0; i<koma.length; i++){
			if(koma[i].isUse && koma[i].sengo==teban && koma[i].isMochi && koma[i].kind==te.MochiKoma){
				komaId = i;
				break;
			}
		}
		mochiCountShow(te.MochiKoma,teban,mochi[teban][te.MochiKoma]-1);
		$("#k"+komaId)
		.css("z-index","100")
		.animate({
			left: komaShowPositionLeft(te.toSuji*16) + "px",
			top: komaShowPositionTop(te.toDan) + "px"
		},SLOW,"swing",function(){
			$("#k"+komaId)
			.css("z-index","30");
		});
		utsuId = komaId;
	}else{//盤上の駒を動かす
		komaId = idBan[te.fromSuji*16+te.fromDan];
		tottaId = te.tottaKoma;
		maisuu = te.tottaKoma==-1 ? -1 : mochi[teban][koma[te.tottaKoma].kind];
		$("#k"+komaId)
		.css("z-index","100")
		.animate({
			left: komaShowPositionLeft(te.toSuji*16) + "px",
			top: komaShowPositionTop(te.toDan) + "px"
		},SLOW,"swing",function(){
			$("#k"+komaId)
			.css("z-index","30");
			//成りの考慮
			if(te.isNaru){
				$("#k"+komaId)
				.attr("src","komaImage/" + teban + 1 + koma[komaId].kind + ".png");
			}
			//取る処理
			if(te.tottaKoma!=-1){//駒を取っていれば
				$("#k"+tottaId)
				.css("z-index","90")
				.animate({
					left: mochiKomaPositionLeft(koma[tottaId].kind,teban) + "px",
					top: mochiKomaPositionTop(koma[tottaId].kind,teban) + "px"
				},SLOW,"swing",function(){
					$("#k"+tottaId)
					.attr("src","komaImage/" + teban + "0" + koma[tottaId].kind + ".png")
					.css("z-index","30");
					mochiCountShow(koma[tottaId].kind,teban,maisuu+1);
				});
			}
		});
	}

	//内部変数を動かす
	forwardState(te,teban,utsuId);
}

function forwardState(te,teban,utsuId){
	//駒の内部変数や盤の内部変数を動かす

	var toPos;
	var fromPos;

	if(te.isUtsu){//打つ
		//移動先
		toPos = 16 * te.toSuji + te.toDan;
		//駒
		koma[utsuId].pos = toPos;//位置//持ち駒は-1
		koma[utsuId].isNari = false;
		koma[utsuId].isMochi = false;
		//持ち駒
		mochi[teban][koma[utsuId].kind]--;
		//盤
		idBan[toPos] = utsuId;
		if(koma[utsuId].sengo==0){//先手
			blankBan[toPos] = 1;
		}else{//後手
			blankBan[toPos] = 2;
		}
	}else{//盤上の駒を動かす
		//位置
		fromPos = 16 * te.fromSuji + te.fromDan;
		toPos = 16 * te.toSuji + te.toDan;
		//駒id
		komaId = idBan[fromPos];
		//koma変数
		koma[komaId].pos = toPos;
		if(te.isNaru){//成るなら
			koma[komaId].isNari = true;
		}
		//盤変数（２つ）
		idBan[fromPos] = -1;
		idBan[toPos] = komaId;
		blankBan[fromPos] = 0;
		if(koma[komaId].sengo==0){//先手
			blankBan[toPos] = 1;
		}else{//後手
			blankBan[toPos] = 2;
		}

		//取る処理
		if(te.tottaKoma!=-1){//駒を取っていれば
			//駒
			koma[te.tottaKoma].pos = -1;
			koma[te.tottaKoma].isNari = false;
			koma[te.tottaKoma].isMochi = true;
			koma[te.tottaKoma].sengo = teban;//0:先手, 1:後手
			mochi[teban][koma[te.tottaKoma].kind]++;
			//盤
			//上の操作ですでに変化している
		}
	}

}

function backwardState(te,teban,utsuId){
	//駒の内部変数や盤の内部変数を戻す

	var toPos;
	var fromPos;

	if(te.isUtsu){//打つ
		//移動先
		toPos = 16 * te.toSuji + te.toDan;
		//駒
		koma[utsuId].pos = -1;//位置//持ち駒は-1
		koma[utsuId].isNari = false;
		koma[utsuId].isMochi = true;//盤上から持ち駒に戻すのだから
		//持ち駒
		mochi[teban][koma[utsuId].kind]++;
		//盤
		idBan[toPos] = -1;
		blankBan[toPos] = 0;
	}else{//盤上の駒を動かす
		//位置
		fromPos = 16 * te.fromSuji + te.fromDan;
		toPos = 16 * te.toSuji + te.toDan;
		//駒id
		komaId = idBan[toPos];
		//koma変数
		koma[komaId].pos = fromPos;
		if(te.isNaru){//成るなら成る前の状態に
			koma[komaId].isNari = false;
		}
		//盤変数（２つ）
		idBan[fromPos] = komaId;
		idBan[toPos] = -1;
		blankBan[toPos] = 0;
		if(koma[komaId].sengo==0){//先手
			blankBan[fromPos] = 1;
		}else{//後手
			blankBan[fromPos] = 2;
		}
		//取る処理
		if(te.tottaKoma!=-1){//駒を取っていれば
			//駒
			koma[te.tottaKoma].pos = toPos;
			koma[te.tottaKoma].isNari = te.tottaNari;
			koma[te.tottaKoma].isMochi = false;//取った駒を盤上に戻すのだから
			koma[te.tottaKoma].sengo = (teban==0 ? 1 : 0);//0:先手, 1:後手
			mochi[teban][koma[te.tottaKoma].kind]--;
			//盤
			idBan[toPos] = te.tottaKoma;
			if(teban==0){//手番が先手なら取った駒は後手
				blankBan[toPos] = 2;
			}else{//手番が後手なら取った駒は先手
				blankBan[toPos] = 1;
			}
		}
	}

}

function mochiKomaPositionLeft(kind,teban){
	//持ち駒に移動するときの座標
	if(teban==0 && (kind==7 || kind==5 || kind==3 || kind==1)){
		return(765);
	}else if(teban==0 && (kind==6 || kind==4 || kind==2 || kind==8)){
		return(845);
	}else if(teban==1 && (kind==7 || kind==5 || kind==3 || kind==1)){
		return(115);
	}else if(teban==1 && (kind==6 || kind==4 || kind==2 || kind==8)){
		return(35);
	}
}

function mochiKomaPositionTop(kind,teban){
	//持ち駒に移動するときの座標
	if(teban==0 && (kind==7 || kind==6 )){
		return(komaShowPositionTop(6));
	}else if(teban==0 && (kind==5 || kind==4 )){
		return(komaShowPositionTop(7));
	}else if(teban==0 && (kind==3 || kind==2 )){
		return(komaShowPositionTop(8));
	}else if(teban==0 && (kind==1 || kind==8 )){
		return(komaShowPositionTop(9));
	}else if(teban==1 && (kind==7 || kind==6 )){
		return(komaShowPositionTop(4));
	}else if(teban==1 && (kind==5 || kind==4 )){
		return(komaShowPositionTop(3));
	}else if(teban==1 && (kind==3 || kind==2 )){
		return(komaShowPositionTop(2));
	}else if(teban==1 && (kind==1 || kind==8 )){
		return(komaShowPositionTop(1));
	}
}

function mochiCountShow(kind,teban,maisuu){
	//持ち駒の枚数の表示

	$("#m" + teban + kind)
	.remove();//まずは消す

	$("<div>")
	.attr("id","m" + teban + kind)
	.css("position","absolute")
	.css("font-size","140%")
	.css("top",(20+mochiKomaPositionTop(kind,teban)) + "px")
	.css("left",(45+mochiKomaPositionLeft(kind,teban)) +"px")
	.css("z-index","20")
	.appendTo("#ban");//index.htmlにあるdivのid

	if(maisuu>1){//表示する
		$("#m" + teban + kind)
		.html(""+(maisuu));
	}
}

function mochiCountRemove(){
	//持ち駒の枚数表示の削除

	for(var teban=0; teban<2; teban++){
		for(var kind=1; kind<=8; kind++){
			$("#m" + teban + kind)
			.remove();
		}
	}
}


