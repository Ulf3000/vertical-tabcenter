addMessageListener("tabCenterUltimate@Ulf3000:message-from-chrome", xxx);
console.log("FRAMESCRIPT LOADED !!!!!!!!!!!!!!!!!!!");
function xxx(){
	// if (timer == true) return;
	// timer = true;
	// setTimeout(function(){
		
		// timer = false;
		
	// },1000);
	let a;
	let b;
	let snapshotCanvas = content.document.createElement('canvas');
	let finalCanvas = content.document.createElement('canvas');
	
	//snapshotCanvas.mozOpaque = true;
	//snapshotCanvas.imageSmoothingEnabled = false;

	//finalCanvas.mozOpaque = true;
	//finalCanvas.imageSmoothingEnabled = false;
	
	
	
	console.log("Grab Screenshot");
	if(content.document.contentType.toLowerCase().indexOf('image/') == 0){
		image = content.document.getElementsByTagName('img')[0];
		//----------------CAPTURE IMAGE
		console.log("ISIMAGE");
		
		
		if(image.width > image.height){
			//ctx.drawImage(image, 0, 0, 54,54*image.height/image.width);
			a = 54;
			b = 54*image.height/image.width
		}else{
			//ctx.drawImage(image, 0, 0, 36*image.width/image.height,36);
			a = 36*image.width/image.height;
			b = 36;
		}
		let faktor = 2;
		snapshotCanvas.width = 54*faktor;
		snapshotCanvas.height = 36*faktor;
		
		let scale = Math.min(Math.max(a*2 / content.innerWidth,
                                  b*2 / content.innerHeight), 1);

		let snapshotCtx = snapshotCanvas.getContext("2d");
		//snapshotCtx.save();
		//snapshotCtx.scale(scale, scale);
		snapshotCtx.drawImage(image, 0, 0, a*faktor, b*faktor);
		//snapshotCtx.restore();
		
		//----- PART2 DOWNSCALE---------------
		
		finalCanvas.width = 54;
		finalCanvas.height = 36;
		
    
		let finalCtx = finalCanvas.getContext("2d");
		finalCtx.save();
		// if (!skipDownscale) {
		//finalCtx.scale(0.5, 0.5);
		//}
		finalCtx.drawImage(snapshotCanvas, 0, 0,54,36);
		finalCtx.restore();
		
		
	}else{
	
		//----------------CAPTURE WINDOW
		a = 54;
		b = 36;

		let scale = Math.min(Math.max(108 / content.innerWidth,
									  72 / content.innerHeight), 1);

		let snapshotCtx = snapshotCanvas.getContext("2d");
		snapshotCtx.save();
		snapshotCtx.scale(scale, scale);
		snapshotCtx.drawWindow(content, content.scrollX, content.scrollY, content.innerWidth, content.innerHeight,
							   "#fff",
							   snapshotCtx.DRAWWINDOW_DO_NOT_FLUSH);
		snapshotCtx.restore();
		
		//----- PART2 DOWNSCALE---------------
		
		finalCanvas.width = a;
		finalCanvas.height = b;
    
		let finalCtx = finalCanvas.getContext("2d");
		finalCtx.save();
		// if (!skipDownscale) {
		finalCtx.scale(0.5, 0.5);
		//}
		finalCtx.drawImage(snapshotCanvas, 0, 0);
		finalCtx.restore();
	}
	
	
	
	
	
	let finalImage = finalCanvas.toDataURL();
	//console.log(finalImage);
	if (finalImage == 	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAkCAYAAADCW8lNAAAARElEQVRYhe3PAQ0AIAzAsPs3DSoeMtIq2OZ8al4HbDFWY6zGWI2xGmM1xmqM1RirMVZjrMZYjbEaYzXGaozVGKsxVnMBeARDY2yTgBUAAAAASUVORK5CYII="){
		console.log("WEI?ESSSSS BIIIILLLLLLLDDDDDD!!!!! &&&&&&&&&&&");
		return;
	};
	if (finalImage == 	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAkCAYAAADCW8lNAAAAHklEQVRYhe3BMQEAAADCoPVPbQlPoAAAAAAAAADgYx6EAAEp8hhdAAAAAElFTkSuQmCC"){
		console.log("LÄÄÄÄÄÄÄÄÄÄRRRES BIIIILLLLLLLDDDDDD!!!!! &&&&&&&&&&&");
		return;
	};
	
	sendAsyncMessage("tabCenterUltimate@Ulf3000:my-e10s-extension-message", finalImage);	
}

