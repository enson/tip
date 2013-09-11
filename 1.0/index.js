/**
 * @file index.js
 * @brief 
 * @author jayli, bachi@taobao.com
 * @version 
 * @date 2012-12-10
 */
/*jshint browser:true,devel:true */

// bug:IE6下模拟max-width
//
// 补充事件
// 补充箭头的样式

KISSY.add(function(S){

	"use strict";

	// 如果你愿意，这样搞一下也可以
	var $ = S.Node.all;

	var O = S.Overlay;

	// 动态调整对齐方式的顺序
	// 从上到下
	// [target的坐标，tip的坐标，箭头的位置]
	var ARROW_POS = [
		['tc','bc','bc'],
		['bc','tc','tc'],
		['tl','br',''],
		['tl','bl','bl'],

		['bl','tr',''],
		['bl','br','rb'],
		['bl','tl','tl'],
		['br','tl',''],
		['br','bl','lb'],
		['br','tr','tr'],
		['tr','br','br'],
		['tr','bl',''],
		['tr','tl','lt'],
		['cr','cl','lc'],

		['tl','tr','rt'],
		['cl','cr','rc']
	];

	var TIP_HTML = [
		'<div class="z-tip">',
			'<span class="z-taper"></span>',
			'<span class="z-close">x</span>',
			'<div class="z-wrapper">',
				'<div class="hd">',
				'</div>',
				'<div class="bd">',
				'</div>',
			'</div>',
		'</div>'].join('');

	var MOUSE_POSITION = [];


	// new Tip(target,options)

	// 工厂风格的构造器
	var Tip = function(){
		this._init.apply(this,arguments);
	};

	// 扩充Tip
	S.augment(Tip,S.Event.Target,{

		_init:function(target,opt){

			var self = this;

			if(S.isString(target)){
				target = S.one(target);
			}

			/*
			if(targets.length > 1){
				targets.each(function(v,k){
					TIPS.push(new Tip(v,opt));
				});
				return this;
			}
			*/

			self.target = target;

			self._buildParam(opt);

			self._buildHtml();

			self._bindEvent();

			this.firstShow = true;

			return this;

		},
		_bringToTop:function(){
			var self = this;
			self.con.css('z-index',self.zIndex++);
			return this;
		},
		setContent:function(text){
			var self = this;
			if(S.isString(text)){
				self.con.one('.bd').html(text);
			}else{
				self.con.one('.bd').empty().append(text);
			}
			return this;
		},
		setHeader:function(text){
			var self = this;
			self.con.one('.hd').html('<b>'+text+'</b>');
			return this;
		},
		_buildHtml:function(){
			var self = this;
		//	self.popup = new
			
			var node = S.Node(TIP_HTML);
			node.css({
				'visibility':'hidden',
				'position':'absolute'
			}).appendTo(S.one('body'));
			self.con = node;
			self.popup = new O.Popup({
				srcNode:node,
				align:{
					node : self.target,
					points : self.points,
					offset : [self.offsetX,self.offsetY]
				},
				effect:{
					effect:self.effect,
					duration:self.duration
				}
			});

			// init data-title
			if(self.useTitle){
				self._getTitleAsData();
			}

			self.display = self.con.css('display');

			if(self.tipClass){
				self.con.addClass(self.tipClass);
				self.con.removeClass('z-tip');
			}

			if(self.closeable){
				self.con.one('.z-close').css('display','block');
			}

			return this;

		},
		rePosition:function(){
			var self = this;

			var al = self.popup.get('align');
			self.popup.align(self.target,al.points,al.offset);

			if(self.arrow){
				self.renderArrow();
			}

			return this;
		},
		_getTitleAsData:function(){
			var self = this;
			var txt = self.target.attr('title');
			if( txt!== ''){
				self.target.attr('data-title',txt);
				self.target.attr('title','');
			}
			return self.target.attr('data-title');
		},
		_bindEvent:function(){
			var self = this;
			S.each(self.showOn,function(v,k){
				self.target.on(v,function(e){
					/*
					if(self.showingTimer){
						clearTimeout(self.showingTimer);
					}
					*/
					if(self.hiddingTimer){
						clearTimeout(self.hiddingTimer);
					}
					if(self.isShowing()){
						return;
					}
					e.preventDefault();
					self.showingTimer = setTimeout(function(){
						self.show();
					},self.delayIn);
					
				});
				
			});

			S.each(self.hideOn,function(v,k){
				self.target.on(v,function(e){
					if(self.showingTimer){
						clearTimeout(self.showingTimer);
					}
					if(!self.isShowing()){
						return;
					}
					self.hiddingTimer = setTimeout(function(){
						self.hide();
					},self.delayOut);
					
				});
				
			});

			self.con.one('.z-close').on('click',function(){
				self.hide();	
			});

			if(self.mouseHook){
				S.Event.on('body','mousemove',function(e){
					MOUSE_POSITION = [
						e.pageX,e.pageY
					];
					if(self.withMouseMove){
						self._positionWithMouse();
					}
				});
			}


			if(self.hideOnEmptyClick){
				S.Event.on(document,'click',function(e){
					if(e.target != self.con.getDOMNode() && 
						e.target != self.target.getDOMNode() && 
						!self.target.contains(e.target) &&
						!self.con.contains(e.target)){
						self.hide();
					}
				});
			}

			S.Event.on(window,'resize',function(e){
				self.rePosition();
				self.rerender();
				self.renderArrow();
			});

			// TODO: 忘了为什么要加&&...了
			if(!self.fleeting /* && !self.hideOnEmptyClick */){

				self.con.on('mouseenter',function(e){
					if(self.hiddingTimer){
						clearTimeout(self.hiddingTimer);
					}
				});	

				self.con.on('mouseleave',function(e){
					self.hiddingTimer = setTimeout(function(){
						self.hide();
					},self.delayOut);
				});	

			}

			return this;
		},

		isShowing:function(){
			var self = this;
			if(self.con.css('visibility') != 'hidden'){
				return true;
			}else {
				return false;
			}
		},

		hide:function(){
			var self = this;
			if(self.fire('beforeHide') === false){
				return this;
			}
			self.popup.hide();
			self.con.css('display','none');
			self.fire('afterHide');
			self.fire('hide');
			self._teardown();
			return this;
		},

		_teardown:function(){
			var self = this;

			// 箭头处理,位置复位
			// TODO：有无更好的方法
			(function(){
				if(!self.arrow){
					return;
				}
				if(!self._arrowPos || self._arrowPos === ''){
					return;
				}

				var al = S.clone(self.popup.get('align'));

				switch(self._arrowPos.charAt(0)){
					case 'l':
						al.offset[0] -= self.aOffset;
						break;
					case 'r':
						al.offset[0] += self.aOffset;
						break;
					case 't':
						al.offset[1] -= self.aOffset;
						break;
					case 'b':
						al.offset[1] += self.aOffset;
						break;
				}

				self.popup.align(self.target,al.points,al.offset);
			})();

			return this;

		},

		_renderContent:function(text){
			var self = this;

			var BDtext = text ? text : 
						self.contentText ? self.contentText :
							self.getConentText.call(self,self.target);
			var HDtext = self.headerText ? self.headerText:
							self.getHeaderText.call(self,self.target);
			if(BDtext){
				self.setContent(BDtext);
			}
			if(HDtext){
				self.setHeader(HDtext);
			}

			return this;
		},

		_positionWithMouse:function(){
			var self = this;
			self.popup.set('x',MOUSE_POSITION[0] - 4 + self.offsetX);
			self.popup.set('y',MOUSE_POSITION[1] + 20 + self.offsetY);
			return this;
		},

		// 可为空
		show:function(text){
			var self = this;

			if(self.fire('beforeShow') === false){
				return this;
			}

			self.con.css('display',self.display);

			if(self.staticContent){
				if(self.firstShow){
					self._renderContent(text);
				}
				self.firstShow = false;
			}else{
				self._renderContent(text);
			}

			self.con.css('visibility','hidden');
			self.popup.show();
			self.con.css('visibility','');

			self.fire('afterShow');
			self.fire('show');

			if(self.mouseHook){
				self._positionWithMouse();
			}

			if(self.smarty){
				self.smartyPosition();
			}

			if(self.arrow){
				self.renderArrow();
			}

			self._bringToTop();


			return this;
		},

		_getArrowPos:function(){
			var self = this;

			var align = self.popup.get('align');

			var pos;

			for(var i = 0 ;i < ARROW_POS.length;i++){
				if(ARROW_POS[i][0] == align.points[0] && 
					ARROW_POS[i][1] == align.points[1]){
					pos = ARROW_POS[i][2];
					break;
				}
			}
			
			return pos;
		},

		renderArrow:function(){
			var self = this;

			if(!self.arrow){
				return this;
			}

			S.each(ARROW_POS,function(v,k){
				self.con.removeClass(v[2]);
			});

			if(self.mouseHook){
				return this;
			}

			var arrowPos = self._getArrowPos();

			self._arrowPos = arrowPos;

			// var align = self.popup.get('align');
			
			if(arrowPos === ''){
				return this;
			}

			// 如果tip窗口太小，则一律显示中间的箭头
			if(self.con.height() <= 36){
				if(arrowPos.charAt(0) == 'l' || arrowPos.charAt(0) == 'r'){
					arrowPos = arrowPos.charAt(0) + 'c';
				}
			}

			if(self.con.width() <= 36){
				if(arrowPos.charAt(0) == 't' || arrowPos.charAt(0) == 'b'){
					arrowPos = arrowPos.charAt(0) + 'c';
				}
			}

			self.con.addClass(arrowPos);

			var x = self.popup.get('x');
			var y = self.popup.get('y');

			var al = S.clone(self.popup.get('align'));

			switch(arrowPos.charAt(0)){
				case 'l':
					al.offset[0] += self.aOffset;
					break;
				case 'r':
					al.offset[0] -= self.aOffset;
					break;
				case 't':
					al.offset[1] += self.aOffset;
					break;
				case 'b':
					al.offset[1] -= self.aOffset;
					break;
			}

			self.popup.align(self.target,al.points,al.offset);

			return this;

		},

		rerender:function(){
			var self = this;

			self.smartyPosition();

			return this;
		},
		smartyPosition:function(){
			var self = this;

			if(!self.mouseHook){
				self.popup.set('align',{
					node:self.target,
					points:self.points,
					offset:[self.offsetX,self.offsetY]
				});
			}

			if(!self.smarty){
				return this;
			}

			var SMARTY_POINTS = ARROW_POS.concat().reverse();

			// 
			function doCheck(){
				if(self.con.inViewportRegion(0)){
					return;
				}
				/*
				var x = self.popup.get('x');
				var y = self.popup.get('y');
				var w = self.con.width();
				var h = self.con.height();
				*/

				if(SMARTY_POINTS.length === 0){
					return;
				}
				var t = SMARTY_POINTS.pop();
				self.popup.set('align',{
					node:self.target,
					points:t,
					offset:[self.offsetX,self.offsetY]
				});
				// jayli
				if(self.arrow){
					self.renderArrow();
					self.revise(self._getArrowPos());
				}
				doCheck();
			}

			doCheck();

			// doCheck();

		},

		_buildParam:function(o){

			var self = this;

			if(o === undefined || o === null){
				o = {};
			}

			function setParam(def, key){
				var v = o[key];
				self[key] = (v === undefined || v === null) ? def : v;
			}


			// 参数列表，和对应的默认值
			S.each({
				delayIn:		300,	//渐入触发的延迟
				delayOut:		100,		//渐出触发的延迟
				showOn:			'mouseenter', //可传多个
				hideOn:			'mouseleave',// 可传多个
				// 进行到这里
				hideOnEmptyClick:true,
				revise:			function(){},

				zIndex:			100,//默认起始层级
				aOffset:		7,//箭头所占长度

				withMouseMove:	false,
				
				contentText:	false,
				headerText:		false,
				/*
				getConentText:	function(target){
				},
				*/
				getHeaderText:	function(target){
					return '';					
				},
				staticContent:	false,
				// 如果useTitle为false的时候，应当给出使用的data载体
				// TODO jayli
				useTitle:		true, // 使用title作为默认data载体，只在调试时使用，不对外
				dataSegment:	'title',//
				effect:			'fade',
				points:			['bc','tc'],
				mouseHook:		true,	// 相对鼠标进行定位
				fleeting:		true,	// tip转瞬即逝的
				// stay:		300,	// 鼠标离开后停留时间
				duration:		0.2,
				tipClass:		'',//给TIp增加的一个className
				smarty:			true,//自动在viewport范围内显示
				closeable:		false,
				arrow:			true,
				/*
				durationIn:		300,//显示时的缓动
				durationOut:	100,//隐藏时的缓动
				*/
				/*
				easingIn:		'easeBoth',
				easingOut:		'easeBoth',
				*/
				showLoading:	true,

				offsetX:		0,
				offsetY:		0
				
					//jayli todo:容器在ie6下的宽度模拟实现max-width

				
			},setParam);

			// 其他对参数处理相关的代码
			
			var defaultGetContentText = function(){};

			defaultGetContentText = function(target){
				var txt = target.attr(self.dataSegment);
				if( txt!== ''){
					target.attr(self.dataSegment,'');
					target.attr('data-title',txt);
				}
				return target.attr('data-title');
			};

			S.each({
				getConentText:defaultGetContentText	
			},setParam);


			function convert2Array(str){
				if(S.isString(self[str])){
					self[str] = [self[str]];
				}
			}

			S.each([
				'showOn',
				'hideOn'
			],convert2Array);

			// IE中关掉特效
			if(S.UA.ie <= 8){
				self.effect = 'none';
			}

            return this;
		}
		// ...
	});

	return Tip;
	
},{
	requires:['overlay','./node-extension']	
});


