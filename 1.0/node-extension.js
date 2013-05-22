


KISSY.add(function(S,Node,DOM){

	"use strict";

	S.augment(S.Node,{

		beyondViewPortRegion:function(padding){
			var self = this;
			var p;

			if(S.isUndefined(padding)){
				p = 0;
			}else{
				p = padding;
			}

			var vh,vw,left,top;

			var elemOffset = self.offset();

			vh = DOM.viewportHeight();
			vw = DOM.viewportWidth();
			left = DOM.scrollLeft();
			top = DOM.scrollTop();

			function pointInViewPort(x,y){
				if(	( x >= left + p && x <= (left + vw - p) ) && 
					( y >= top + p && y <= (top + vh - p) ) ){
						return true;
				} else {
					return false;
				}

			}

			return {
				start:pointInViewPort(elemOffset.left,elemOffset.top),
				end:pointInViewPort(elemOffset.left + self.width(),elemOffset.top + self.height() )
			};

		},

		// padding：viewport之内的缩几个像素
		inViewportRegion:function(padding){
			var self = this;

			var r = self.beyondViewPortRegion(padding);

			if(r.start && r.end ){
				return true;
			}else{
				return false;
			}

		}

	});

},{
	requires:[
		'node','dom'
	]	
});
