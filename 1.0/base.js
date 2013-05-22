
/**
 * @file index.js
 * @brief 给全局KISSY增补一些常用的方法,给Node增补一些常用的方法
 * @author jayli, bachi@taobao.com
 * @version 
 * @date 2013-01-08
 */

/*jshint browser:true,devel:true */

KISSY.add('zoo/base/index',function(S){

	"use strict";

},{
	requires:[
		'zoo/base/node-extension',
		'zoo/base/util-extension',
		'zoo/base/do-extension',
		'zoo/base/kissy2yui'
	]	
});

