const gcKifu = {
	pieceStr : [
		"FU","KY","KE","GI","KI","KA","HI","OU",
		"TO","NY","NK","NG","@@","UM","RY","@@",
	],
	isFinished : false,
	flagTenchi : false,
	lastObjectUrl : "",
	arrLog : [],

	generateTimeStr : function(){
		return getLocalTimeISOStr().replace(/-/g,"/").replace("T"," ");
	},

	log : (...s)=>{ gcKifu.arrLog.push(...s) },

	start : function( _bComPlaysFirst ){
		//駒落ちチェック
		let otosuStr = ["PI"];
		for( let k of gPieces ){
			if(!k.isUse){
				otosuStr.push(`${k.pos>>>4}${k.pos&15}${gcKifu.pieceStr[k.kind-1]}`);
			}
		}
		//平手戦かつ_bComPlaysFirstの時は記録する駒位置を反転するフラグを立てる
		gcKifu.flagTenchi = otosuStr.length===1 && _bComPlaysFirst;

		gcKifu.arrLog.length=0;
		gcKifu.log(
			"V2.2",
			`N${gcKifu.flagTenchi?"-":"+"}PLAYER`,
			`N${gcKifu.flagTenchi?"+":"-"}KOMAO`,
			`$START_TIME:${gcKifu.generateTimeStr()}`,
			otosuStr.join("")
		);

		gcKifu.isFinished = false;
		if( gcKifu.lastObjectUrl !== "" ){
			//Blobの解放
			URL.revokeObjectURL(gcKifu.lastObjectUrl);
			gcKifu.lastObjectUrl = "";
		}
	},
	move : function(_te,_teban,_komaId){

		const t = v=>""+(gcKifu.flagTenchi?10-v:v);
		let thisPiece = gPieces[_komaId],
			strFrom = _teban^gcKifu.flagTenchi?"-":"+",
			strPKind;

		if(_te.isUtsu){
			strPKind = gcKifu.pieceStr[thisPiece.kind-1];
			strFrom += "00";
		}else{
			strPKind = gcKifu.pieceStr[ thisPiece.kind+( thisPiece.isNari ? 7:-1 )];
			strFrom += t(_te.fromSuji)+t(_te.fromDan);
		}

		gcKifu.log( strFrom+t(_te.toSuji)+t(_te.toDan)+strPKind);
	},
	finish : function(){
		gcKifu.log("%TSUMI",`$END_TIME:${gcKifu.generateTimeStr()}`)
		gcKifu.isFinished = true;
	},
	getCSAFileAs : function(_filename="komao",_flush=false){

		if( _flush && gcKifu.lastObjectUrl !== "" ){
			//Blobの解放
			URL.revokeObjectURL(gcKifu.lastObjectUrl);
			gcKifu.lastObjectUrl = "";
		}

		if( gcKifu.lastObjectUrl === "" ){
			//String -> Blob -> ObjectURL
			let s = gcKifu.arrLog.join("\n")+(gcKifu.isFinished?"":"\n%CHUDAN");
			let bb = new Blob([s],{type:"text/plain"});
			gcKifu.lastObjectUrl = URL.createObjectURL(bb);
		}

		let a = document.createElement("a");
		a.href = gcKifu.lastObjectUrl;
		a.target = "_blank";
		a.download = `${_filename}.csa`;
		a.click();
	}
};
