
> Tip控件，是一个用于弹出一段小内容的浮层，浮层的定位围绕事件发生地。它展现的生命周期应当是“很短”的，多用于提示、消息说明、警告，鼠标跟随的信息展示等等。该控件只有最基础的行为，更多的定制化需要再做封装，本组件不提供。
> 本组件基于KISSY的[overlay](http://docs.kissyui.com/docs/html/api/component/overlay/index.html)完成。

- Version 1.0 beta
- Author 拔赤
- Update 2013-05-21

## 使用方式

引入kissy种子：

	<script src="http://a.tbcdn.cn/??s/kissy/1.3.0/seed-min.js"></script>

调用：

	<script>
		// 回调传入了S（KISSY对象）和Tip构造器
		KISSY.use('gallery/tip/1.0/',function(S,Tip){
			// 这里可以调用Tip
			new tip("#hook",{
				headertext:'标题'
			});
		});
	</script>

Tip所生成的依赖典型的HTML结构

	<div class="z-tip rt">
		<span class="z-taper"></span>
		<span class="z-close">x</span>
		<div class="z-wrapper">
			<div class="hd">
				提示标题
			</div>
			<div class="bd">
				提示正文
			</div>
		</div>
	</div>

其中，‘提示标题’和‘提示正文’部分是可以添加内容的，外围结构是固定的。在初始化一个Tip时，可以定义容器的tipClass。这些结构中，z-taper是箭头容器，z-close是关闭按钮。

调用方式只支持构造器调用风格，不支持包装器调用风格。每个Tip实例都有对应的唯一一个target，即宿主，Tip相对于宿主进行定位。如果要给一组节点挂载Tip，则需要这样做：

	KISSY.use('gallery/tip/1.0/',function(S,Tip){

		S.all('a.tip').each(function(n){
			new Tip(n,{
				// 这里是配置	
			});	
		});

	});

Tip的行为只有隐藏和显示两种属性，不会被销毁。多个Tip有可能会发生重叠，程序会计算最后激活的Tip展现在最高层。

<hr class="smooth large" />

## 定义样式

Tip组件包含一套默认样式，跟随组件一起提供，由loader载入，不需要额外手动引入。如果需要自定义样式，则可以给Tip容器传入tipClass。

	new Tip("#id",{
		tipClass:	'tip-class'
	});	

### 箭头的定义和浮层定位

提示框是有箭头的。箭头有十二个方向。简写为tl或者tr，等。通过给Tip容器加className来控制箭头的显示。一般来讲，开发者是不必关心箭头的方向，箭头的方向会被自动计算并添加到Tip容器上。

![](http://img01.taobaocdn.com/tps/i1/T1XgQrXdBXXXbRijwZ-341-146.png)

比如我要定义链接的正下方弹出Tip，并且带箭头，则只需定义浮层（tip）相对于宿主（target）的位置即可，但浮层和宿主的对对齐位置都要给出。宿主可以是鼠标。构造tip时传入参数points，带入宿主的对齐位置和浮层的对器位置。

对焦点的位置的取名为 t,b,c 与 l,r,c 的两两组合, 分别表示 top,bottom,center 与 left,right,center 的两两组合, 可以表示 9 种取值范围.

![](http://docs.kissyui.com/source/raw/api/component/overlay/align.png)

和Hook的对齐的情况以及和鼠标的对其情况（对齐功能使用KISSY的[component.UIBase.Align](http://docs.kissyui.com/docs/html/api/component/component/uibase/align.html#component.UIBase.Align)组件）：

![](http://img04.taobaocdn.com/tps/i4/T1v1koXb0fXXaNOYjL-371-120.gif)

比如上面第一种情况，points为`['rb','tl']`，tip的箭头方向向上.

<!--![](http://img03.taobaocdn.com/tps/i3/T1_vMqXiXbXXbm21k7-115-61.png)-->

按照如下代码来初始化。默认初始化的宿主是鼠标，为了让宿主指定为dom节点，需要传入参数mouseHook:false

	new Tip("a#hook",{
		points:	['rb','tl'],
		mouseHook:false
	});

### Tip浮层尺寸

可以通过指定偏移量来微调Tip的定位，参数为offsetX和offsetY。

除了这些样式特征之外，API不提供额外的样式注入，需要用户定义css来实现。比如要定义一个简单浮层的最小宽度和最大宽度，定义css：

	.z-custom-tip {
		max-width:350px;
		_width:expression((this.width > 350) ? "350px" : this.width + "px" );
	}

### 展现方式

可以定义Tip浮层的展现方式，包括鼠标触碰的延时、展现动画效果等。具体请参照API部分。可以通过配置smarty:true，来表示Tip浮层总是在视窗范围内展示。

<hr class="smooth large" />

## API

构造器第二个参数为配置对象：`new Tip('#id'[,options])`。

<hr class="smooth" />

### 参数列表：

*delayIn* (Number)

显示Tip浮层的延时时间，默认为300（ms），如果设置为点击弹出Tip，最好将此值设为0

*delayOut* (Number)

隐藏时的延时时间，默认为100（ms），如果设置为点击空白处关闭Tip，最好将此值设置为0

*showOn* (String | Array)

触发显示Tip浮层的事件类型，如果传入多个事件，则用数组表示，比如`['mouseenter','click']`。默认为`'mouseenter'`。事件会绑定在宿主Dom元素上，事件的触发不会被组织冒泡。如果是click事件，首次点击会阻止默认行为。

*hideOn* (String | Array)

隐藏Tip浮层的触发事件类型，如果传入多个事件，则用数组表示，方法同上。默认为`'mouseleave'`。事件会绑定在宿主Dom元素上，事件不会被阻止默认行为和冒泡。

*hideOnEmptyClick* (Boolean)

是否点击空白处和非宿主位置时关闭Tip。默认为true。

*contentText* (String)

正文的内容，这里的内容为静态，在整个页面生命周期过程是不会改变的。有时Tip弹出的信息是需要临时获取的，这时就不需要设置此属性，而要设定getConentText函数。此属性默认值为false。

*getConentText* (Function)

即时得出Tip中要显示内容的字符串，返回一个字符串或一个Dom节点，用于在显示Tip的时候，回写到Tip的正文。如果contentText已经被设定了值，则此函数不起作用。此函数的参数为target，即触碰点的dom节点。如果返回Dom节点

此函数非常重要，默认情况下会自动返回当前触碰Dom节点的title的值，<del>当useTitle配置为true时，触碰点title属性会被删除，否则会保留</del>。如果title中途发生了改变，默认的getConentText会取得更新后的title。

如果希望只在第一次Tip显示的时候获取内容，后续的展现TIp不需要重新获取内容，则需要在getConentText函数中回写contentText属性，比如：

	new Tip("a#hook",{
		getConentText:function(target){
			// 当前上下文为 Tip的实例对象
			this.contentText = target.attr('data-customdata');
			return this.contentText;
		}
	});

当然，也可以通过绑定事件的方式来实现。

*headerText* (String)

Tip标题的内容，这里的内容为静态，在整个页面生命周期过程是不会改变的。有时Tip弹出时标题信息是需要临时获取的，这时就不需要设置此属性，而要设定getConentText函数。此属性默认值为false。

*getHeaderText* (function)

每次显示Tip时，获取内容的函数。默认为返回空字符串的函数。如果配置了固定的headerText，则此函数不起作用。

*staticContent* (Boolean)

是否只在第一次显示时渲染内容，默认为false。当此项属性为true时，则会强制停止后续对内容的渲染，Tip内容会一直保留。getConentText字段中的例子可以这样来实现：

	new Tip("a#hook",{
		getConentText:function(target){
			return target.attr('data-customdata');
		},
		staticContent: true
	});

<del>*useTitle*</del> (Boolean) (被废弃)

是否使用title作为默认数据的载体，默认为true。即在不定义getConentText和contentText情况下，会默认从触碰点dom的title取数据。

*dataSegment* (String)

默认为title，表明数据字段的载体。

*effect* (String)

Tip弹层特效，常见配置有‘none’(无特效), ‘fade’(渐隐显示), ‘slide’(滑动显示)。默认为"fade"

*points* (Array)

弹层对齐方式，格式为`[target的对齐点,Tip的对齐点]`。参照上文“箭头的定义”

*mouseHook* (Boolean)

是否相对于鼠标进行定位，定位位置默认为右下角，默认为true。

*fleeting* (Boolean)

Tip是否转瞬即逝，即只要鼠标相对于Hook Target触发了“离开事件”，则立即关闭Tip浮层。通常当不希望鼠标移动到Tip浮层上时配置此属性为true。默认为true。

*duration* (Number)

Tip弹层展开/消逝的延迟，默认为0.2，单位为秒

*tipClass* (String)

Tip弹层拥有的额外样式，默认为空字符串。

*smarty* (Boolean)

是否自动在浏览器窗口可视范围内显示，默认为true。

*closeable* (Boolean)

弹层是否带有关闭按钮，默认为false

*arrow* (Boolean)

Tip浮层是否需要带有箭头，默认为true。

*withMouseMove* (Boolean)

是否跟随鼠标移动而移动，默认为false，只有当mouseHook为true时才起作用

*zIndex* (Number)

默认弹出层的起始层级，默认为100

*aOffset* (Number)

箭头所占的尺寸，用以计算弹层的微偏移量，默认为7，单位为像素

*revise* (arrowPos)

修正函数，当定位箭头和触点无法对齐时，使用此函数来修正，参照Demo页.

<hr class="smooth" />

### 方法

*setContent* (text)

text:String或Dom，设置tip弹层的内容。如果是Dom节点，则挂载到Tip中。支持链式调用

*setHeader* (text)

text:String。设置Tip弹层的标题文字，只能是字符串。支持链式调用

*isShowing*，无参数，return (Boolean)

判断当前tip是否为显示状态。返回true或false。

*hide* 无参数

隐藏Tip，带有预先配置的动画效果

*show* 无参数

显示Tip，带有预先配置的动画效果

*renderArrow* 无参数

渲染箭头的样式，有时候Tip浮层位置发生了变化，箭头可能会改变，这时会需要调用这个函数。

*rerender* 无参数

当Tip浮层内容变化时，尺寸有可能变化，需要重新渲染位置，一般当浮层位置超出了可视范围时调用，需要手动调用此函数。

*smartyPosition* 无参数

同上

*rePosition* 无参数

按照既定的定位方式，重新计算定位对齐的位置，经常在tip尺寸发生变化时手动调用此函数。


<hr class="smooth" />

### 事件

*show*

Tip浮层显示的事件，同afterHide。回调参数为当前实例对象。

*afterShow*

显示结束后的事件。回调参数为当前实例对象。

*beforeShow*

Tip浮层显示之前调用的事件，回调参数为当前实例对象，如果回调返回为false，则阻止show事件发生。

	var t = new Tip('a#id');
	t.on('show',function(tip){
		if(...){
			return false; // 阻止Tip显示
		}else{
			return true; // Tip显示
		}
	});


*hide*

Tip浮层隐藏的事件，同afterHide。回调参数为当前实例对象。

*afterHide*

隐藏结束后的事件。回调参数为当前实例对象。

*beforeHide*

Tip浮层隐藏之前调用的事件，回调参数为当前实例对象，如果回调返回为false，则阻止hide事件发生。


