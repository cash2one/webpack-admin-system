/**
 * @fileOverview 获取某个url的二维码
 * @author XiaoBin Li(lixiaobin@baijiahulian.com)
 */

'use strict';
import Vue from 'vue';

/**
 * 格式化时间 
 * @param {string} date  
 * @param {string} pattern  
 * @return {string}         
 */
Vue.filter('qrcode', function(url, size) {
	var qrSize = size || 6;
	if (!url) {
		return '';
	}
 	return 'http://m.genshuixue.com/static/qrcode?size=' + qrSize + '&margin=0'
        + '&url=' + encodeURIComponent(url);
});