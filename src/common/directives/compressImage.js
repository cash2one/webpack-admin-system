/**
 * @fileOverview 裁剪图片
 * @author XiaoBin Li(lixiaobin@baijiahulian.com)
 */

'use strict';

import Vue from 'vue';

let compressImage = require('../plugin/compressImage');

/**
 * 裁剪图片
 * @param {string} url   
 * @param {number} width  
 * @param {number} height  
 * @return {string}         
 */
// Vue.directive('compressimage', function(url, width, height) {

// 	if (!width) {
// 		width = $(window).width();
// 	}

//  	return compressImage(url, {
//  		width: width,
//  		height: height
//  	});

// });

Vue.directive('compressimage', {
    bind(el, binding, vnode) {
       
    },

    update(el, binding) {
        
    },

    unbind(el) {
        
    }
});