/**
 * 弹出框工具包,此前端工具专门为HerosPHP所开发，并且和HerosPHP高性能轻量级PHP框架一起开源
 * 您可以放心将其用于您的项目中也可以用于商业用途。HerosPHP-1.2下载地址http://download.csdn.net/detail/yangjian8801/5618767
 * @depenedence jquery.js		需要引进jquery框架
 * @depenedence jquery.ui.resizeable.js		jquery ui 窗口缩放插件
 * @depenedence jquery.ui.draggleable.js		jquery ui 的拖动插件
 * @author	yangjian<yangjian102621@gmail.com> qq:906388445
 * @version 1.2
 */

//窗体的最大z-index初始值
window.JWIN_MAX_ZINDEX = 1000;

//实现拖拽功能
(function() {
	$.fn.draggable = function(options) {

		var defaults = {
			handler : null
		}
		options = $.extend(defaults, options);
		var __self = this;
		$(options.handler).mousedown(function(e) {
			var offsetLeft = e.pageX - $(__self).position().left;
			var offsetTop = e.pageY - $(__self).position().top;
			$(document).mousemove(function(e) {
				//清除拖动鼠标的时候选择文本
				window.getSelection ? window.getSelection().removeAllRanges():document.selection.empty();
				$(__self).css({
					'top'  : e.pageY-offsetTop + 'px',
					'left' : e.pageX-offsetLeft + 'px'
				});
			});

		}).mouseup(function() {
			$(document).unbind('mousemove');
		});

	}
})(jQuery);

//窗口对象
var JWindow = function( __options ) {
	__options = __options || {};
	var defaults = {
		width : 600, //初始化宽度
		height : 300, //初始化高度
		title : "New window",	//窗口标题
		content : "This is the content of window",	//窗口内容
		skin : "default"
	};
	//合并并补充参数
	var options = $.extend(defaults, __options);
	var o = {};
	o.winBox = null; //窗体
	o.getWinWidth = function() {return Math.max(document.documentElement.clientWidth,document.body.clientWidth);};
	o.getWinHeight = function() {return Math.max(document.documentElement.clientHeight, document.body.clientHeight);};

	if ( options.width < 100 ) { //高度设置成百分比
		options.width = options.width * o.getWinWidth()/100;
	}
	if ( options.height < 100 ) { //高度设置成百分比
		options.height = options.height * $(window).height()/100;
	}
	o.create = function( title, content ) {
		JWIN_MAX_ZINDEX++;	//每新建一个窗体，z-index + 1
		o.winBox = $('<div class="jwindow_box jwindow_'+options.skin+'" style="position:absolute; z-index:'+JWIN_MAX_ZINDEX+';"></div>');
		var title_box = $('<div class="jwindow_title_box"></div>');
		var win_title = $('<div class="jwindow_title">'+title+'</div>');
		
		var win_button = $('<div class="jwindow_button"></div>');
		var min_button = $('<a class="jwindow_min_button" href="javascript:void(0)" title="最小化"></a>');
		var max_button = $('<a class="jwindow_max_button" href="javascript:void(0)" title="最大化"></a>');
		var close_button = $('<a class="jwindow_close_button" href="javascript:void(0)" title="关闭"></a>');
		
		//绑定窗口按钮事件
		min_button.on("click", function() {o.resizeToMin(options.taskBtn.data('offset'));});  //最小化窗口
		max_button.on("click", function(e) {o.resizeToMax(); e.stopPropagation();}); //最大化窗口
		title_box.on("dblclick", function(e) {o.resizeToMax(); e.stopPropagation();}); //双击最大化窗口
		close_button.on("click", function() {o.close();}); //关闭窗口
		//选中窗口时，z-index 移到最上层
		o.winBox.on("click", function() {
			var _zindex = o.winBox.css('z-index');
			if ( _zindex == JWIN_MAX_ZINDEX ) return;
			 JWIN_MAX_ZINDEX++;
			o.winBox.css('z-index', JWIN_MAX_ZINDEX);		//将窗体移动到最顶层
		});

		//追加元素
		win_button.append(min_button);
		win_button.append(max_button);
		win_button.append(close_button);
		title_box.append(win_title);
		title_box.append(win_button);
		
		var win_content = $('<div class="jwindow_content">'+content+'</div>');
		o.winBox.append(title_box);
		o.winBox.append(win_content);
		o.winBox.data('me',{
			title : win_title,
			content : win_content,
			max_btn : max_button
		});

		//绑定拖动事件
		o.winBox.draggable({handler:win_title});

		$('body').append(o.winBox);
	}

	/**
	 * 居中显示显示窗口
	 * @param width
	 * @param height
	 */
	o.show = function( width, height ) {
		o.setContentWidth(height)	//设置内容框宽度
		var _scrollTop = window.document.body.scrollTop || window.document.documentElement.scrollTop;
		o.winBox.css({
			'width' : 0,
			'height' : 0,
			'opacity' : 0,
			'display':'block'
		}).animate({
			'top'	: (o.getWinHeight() - height)/2 + _scrollTop + 'px',
			'left'	: (o.getWinWidth() - width)/2 + 'px',
			'width'  : width,
			'height' : height,
			'opacity': 1	
		});
		//设置标题栏的宽度，使文字居中
		o.setTitleWidth( width );
	}
	
	/**
	 * 最小化/还原原始大小
	 * @param 			dstPosition        动画变动到目的坐标后隐藏
	 * @param 			click_src			事件源，是任务栏还是窗体的最小化按钮
	 */
	o.resizeToMin = function( dstPosition, click_src ) {
		//更改任务栏按钮的样式,判断当前窗口是否处于唤醒状态
		var _item = options.taskBtn.find('.task_item');
		if (  o.winBox.height() > 0 ) {
			_item.addClass('task_item_unnotify');
		} else {
			_item.removeClass('task_item_unnotify');
		}
		
		//如果窗口是显示的，则将其移到最上层
		var _zindex = o.winBox.css('z-index');
		if ( o.winBox.height() > 0 && _zindex < JWIN_MAX_ZINDEX && click_src == 'taskBtn' ) {
			JWIN_MAX_ZINDEX++;
			o.winBox.css('z-index', JWIN_MAX_ZINDEX);
			return;
		} 
		var _data = o.winBox.data('smin');
	 	if ( _data == undefined ) {
			//保存最小化之前窗口的状态
			o.winBox.data('smin',{
				top   : o.winBox.position().top,
				left  : o.winBox.position().left,
				width : o.winBox.width(),
				height: o.winBox.height(),
				zIndex: o.winBox.css('z-index')
			});	
			o.winBox.animate({
				'left' 	 : dstPosition ? dstPosition.left : 0,
				'top'  	 : dstPosition ? dstPosition.top : $(window).height(),
				'width'  : 0,
				'height' : 0,
				'opacity': 0	
			},'fast');
		} else {	//还原窗口
			o.winBox.animate({
				'top'    : _data.top,
				'left'   : _data.left,
				'width'  : _data.width,
				'height' : _data.height,
				'opacity': 1	
			},'fast');
			o.winBox.removeData('smin');
			//如果窗口处于最大化状态，则将其移动到任务栏的上层，将任务栏遮盖
			if ( o.winBox.data('smax') ) {
				o.winBox.css('z-index', _data.zIndex);
				return false;
			}
			//将窗体移动到最顶层
			var _zindex = o.winBox.css('z-index');
			if ( _zindex == JWIN_MAX_ZINDEX ) return;
			JWIN_MAX_ZINDEX++;
			o.winBox.css('z-index', JWIN_MAX_ZINDEX);	
		}
	}
	
	//最大化窗口
	o.resizeToMax = function() {
		var _data = o.winBox.data('smax');
		var max_btn = o.winBox.data('me').max_btn;
		if ( _data == undefined ) {
			//记录最大化之前窗口的状态
			o.winBox.data('smax',{
				top   : o.winBox.position().top,
				left  : o.winBox.position().left,
				width : o.winBox.width(),
				height: o.winBox.height(),
				zIndex: o.winBox.css('z-index')
			});		
			
			o.winBox.animate({
				'top'    : 0,
				'left'   : 0,
				'width'  : $(window).width()-2,
				'height' : $(window).height()-2,
				'opacity': 1
			},'fast').css('z-index', 9999);
			o.setTitleWidth($(window).width() - 2);	//设置标题栏的宽度，使文字居中
			o.setContentWidth($(window).height()-2);			//设置内容框宽度
			//设置还原按钮属性
			max_btn.attr({
				'class' : 'jwindow_reduce_button',
				'title' : '还原'
			});
			
		} else {	//还原窗口
			o.winBox.animate({
				'top'    : _data.top,
				'left'   : _data.left,
				'width'  : _data.width,
				'height' : _data.height,
				'opacity': 1	
			},'fast').css('z-index', _data.zIndex);
			o.setTitleWidth(_data.width);		//设置标题栏的宽度，使文字居中
			o.setContentWidth(_data.height);	//设置内容框宽度
			//移除当前窗口状态
			o.winBox.removeData('smax');
			//设置最大化按钮属性
			max_btn.attr({
				'class' : 'jwindow_max_button',
				'title' : '最大化'
			});
		}
		
	}

	/**
	 * 设置标题的宽度
	 * @param width
	 */
	o.setTitleWidth = function( width ) {
		o.winBox.find('.jwindow_title').css('width', width - o.winBox.find('.jwindow_button').width() - 6);
	}

	/**
	 * 设置内容宽度
	 * @param height
	 */
	o.setContentWidth = function( height ) {
		var win_content = o.winBox.data('me').content;
		win_content.height(height - 40 );
	}

	/**
	 * 获取窗体
	 * @returns {null|jQuery|HTMLElement|*}
	 */
	o.getWindow = function() {
		return o.winBox;
	}

	//关闭窗体
	o.close = function() {
		o.winBox.animate({
				'top'    : options.taskBtn.data('offset').top,
				'left'   : options.taskBtn.data('offset').left,
				'width'  : 0,
				'height' : 0,
				'opacity': 0	
			},'fast', function() {
			o.winBox.hide('fast', function(){
				o.winBox.remove();		//移除窗体
				try {
					var _id = options.taskBtn.data('id');
					delete JTaskBar.TaskBean[_id];		//移除任务的bean 对象
					options.taskBtn.remove();		//移除任务栏的任务的Task对象DOM
					JTaskBar.updateTaskBtnOffset();		//更新任务栏按钮位置数据
				} catch (e) {}
			})		
		})
	}
	
	//初始化窗口
	o.create(options.title, options.content);
	o.show(options.width, options.height);
	o.options = options;
	return o;
		
};

/**
 * 任务栏对象
 */
var JTaskBar = {
	
	TaskBar : null,			//任务栏对象
	
	TaskUL : null,			//任务盒子UL
	
	TaskBean : {},			//存储任务队列
	
	barBg : null,			//任务栏背景DOM
	
	options : {}, 			//任务栏初始化参数
	
	taskId : 0,				//当前任务Id
	
	/* 创建元素 */
	create : function() {
		if ( this.TaskBar != null ) return;
		this.barBg = $('<div id="jwindow_task_bar_bg"></div>');
		var _bar = $('<div id="jwindow_task_bar"></div>');
		this.TaskUL = $('<ul id="jwindow_task_ul"></ul>');
		_bar.append(this.TaskUL);
		this.TaskBar = _bar;
		$('body').append(this.barBg);
		$('body').append(this.TaskBar);
	},
	
	/* 初始化任务栏位置 */
	initPosition : function() {
		if ( this.TaskBar == null ) return;
		$(this.TaskBar).css({
			'width' :  this.options.width ? this.options.width + 'px' : '100%',
			'height' : this.options.height + 'px',
			'left' : this.options.width ? ($(window).width() - this.options.width)/2 + 'px' : 0+'px',
			'top' : ($(window).height() - this.options.height) + 'px'
		});
		$(this.barBg).css({
			'width' :  this.options.width ? this.options.width + 'px' : '100%',
			'left' : this.options.width ? ($(window).width() - this.options.width)/2 + 'px' : 0+'px',
			'top' : ($(window).height() - this.barBg.height()) + 'px',
			'opacity' : 0.5
		});
	},
	
	/**
	 * 初始化任务栏, t添加到页面BODY
	 * @param  		config		任务栏的配置参数
	 */
	init : function( config ) {
		config = config || {};
		this.options.width = config.width;
		this.options.height = config.height || 64;
		this.create();
		this.initPosition();	
	},
	
	/**
	 * 往任务栏中添加任务
	 * @param   	object 		iconObj     要添加的任务图标对象
	 */
	addTask : function( iconObj ) {
		$(this.TaskUL).append(iconObj);
		$(iconObj).data('offset', $(iconObj).offset()); //记录任务图标的位置
		this.TaskBean[iconObj.data('id')] = iconObj;;
		this.taskId ++;
	},
	
	//更新任务按钮的位置数据, 确保任务删除时窗体收缩到正确的任务按钮位置
	updateTaskBtnOffset : function() {
		for ( var key in this.TaskBean ) {
			$(this.TaskBean[key]).data('offset', this.TaskBean[key].offset());
		}
	},

};

/**
 * 任务对象
 * @param options 任务配置选项
 */
var Task = function ( configs ) {
	if ( !configs ) throw new error("configs is needed.");
	var defaults = {
		task_title : 'New task', //任务名称
		icon_src : '', //任务图标
		desk_id : 0,  //桌面ID(工作区间)
		id : JTaskBar.taskId //任务ID
	}
	var options = $.extend(defaults, configs);

	//创建任务栏按钮
	var task = $('<li class="task_item_li"></li>');
	var _icon_a = $('<a id="task_item_'+options.id+'" class="task_item" href="#" appid="'+options.desk_id+'_'+options.id+'" tid="'+options.desk_id+'" title="'+options.title+'"></a>');
	var _icon_img = $('<span class="task_item_icon"><img src="'+options.icon_src+'" border="0" id="icon_'+options.id+'"></span>');
	var _task_txt = $('<span class="task_item_txt">'+options.task_title+'</span>');

	_icon_a.append(_icon_img);
	_icon_a.append(_task_txt);
	task.append(_icon_a);
	task.data('id', options.id);	//保存任务的Id, 便于删除

	//绑定事件
	configs.taskBtn = task;	//将任务对象传给窗体
	var __win = new JWindow(configs);	//新建一个窗体
	task.data('win', __win);   //保存一个窗体的引用
	task.click(function() {
		var __win = task.data('win');
		__win.resizeToMin( __win.options.taskBtn.data('offset'), 'taskBtn' );		//最小化，还原
	});

	return task;
};

JTaskBar.init();	//初始化任务栏