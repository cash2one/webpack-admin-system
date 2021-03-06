/**
 * @file 图片播放器
 * @author lixiaobin 
 */

'use strict';

var compressImage = require('./compressImage');

/**
 * 图片播放器
 *
 * @constructor
 * @param {Object} options 初始化参数
 * @property {Array} datasource 图片url列表数组
 * @property {number}   current 当前要播放的下标
 */
var ImagePlayer = function(options) {
    this.options = options;
    this.init();
};

ImagePlayer.prototype.init = function() {

    var player = this;
    var options = player.options;
    var datasource = options.datasource;
    var current = options.current;

    var windowHeight = $(window).height();

    var playerElement = $('' + '<div class="image-player">' 
        + '<p class="image-player-title"></p>' + '<img />' 
        + '<strong class="image-player-count"><em>' + (current + 1) 
        + '</em><i>/</i>' + datasource.length + '</strong>' 
        + '<div class="image-control"><a href="javascript:;" class="last-btn">上一张</a><a href="javascript:;" class="next-btn">下一张</a></div>' 
        + '</div>');

    // $('body').append(
    //     playerElement.css('height', windowHeight + 'px')
    // );
    $('body').append(
        playerElement
    );
    player.container = playerElement;
    player.countElem = playerElement.find('em');
    player.nextBtn = playerElement.find('.next-btn');
    player.lastBtn = playerElement.find('.last-btn');
    player.imgElem = playerElement.children('img');
    player.setSize();
    player.initEvents();

};

ImagePlayer.prototype.setSize = function() {

    var player = this;

    var options = player.options;
    var current = options.current;
    var datasource = options.datasource;


    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();

    //player.container.css('height', windowHeight + 'px');

    player.imgElem.data('height', (windowHeight - 120));
    player.setImage(datasource[current]);

};

ImagePlayer.prototype.setImage = function(url) {

    var imgElem = this.imgElem;

    var imgPrev = imgElem.prev();
    if (imgPrev.length && (imgPrev[0].tagName === 'STRONG')) {
        imgPrev.show();
    } else {
        imgElem.before('<strong style="display:block;text-align:center; font-size: 12px; font-weight: normal; margin-top:10px;">正在加载图片中...</strong>');
    }
    imgPrev = imgElem.prev();

    var maxHeight = imgElem.data('height');
    var maxWidth = $(window).width();

    var img = new Image();
    img.onload = function() {
        var width = img.width;
        var height = img.height;

        var ratio;

        if (width > maxWidth) {
            ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
        }

        if (height > maxHeight) {
            ratio = maxHeight / height;
            height = maxHeight;
            width = width * ratio;
        }

        imgElem.css({
            width: width + 'px',
            height: height + 'px',
            top: (Math.abs(maxHeight - height + 90)) / 2 + 'px',
            left: (Math.abs(maxWidth - width)) / 2 + 'px'
        });
        imgElem.prop('src', 'http://img.gsxservice.com/4769268_qhwfm7q5.jpeg@1e_200w_200h_1c_0i_1o_90Q_1x').show();
        // imgElem.prop('src', compressImage(url, {
        //     width: width,
        //     height: height
        // })).show();
        imgPrev.hide();
    };

    img.src = url;

};

ImagePlayer.prototype.initEvents = function() {

    var player = this;

    var resizeTimeout;


    $(window).on('resize', function() {
        window.clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            player.setSize();
        }, 100);
    });

    player.nextBtn
        .on('click', function (event) {
        event.stopPropagation();
        player.switchImage('left');
    });

    player.lastBtn
        .on('click', function (event) {
        event.stopPropagation();
        player.switchImage('right');
    });

    player.container
        .on('click', function(e) {
            e.stopPropagation();
            player.dispose();
        });

    if (player.options.datasource.length < 2) {
        return;
    }

    var playerTouchStart;
    var playerTouchObj;

    player.container
        .on('touchstart', 'img', function(e) {
            e.preventDefault();
            playerTouchObj = (e.originalEvent.touches)[0];
            playerTouchStart = {
                x: playerTouchObj.screenX,
                y: playerTouchObj.screenY
            };
        })
        .on('touchend', 'img', function(e) {
            e.preventDefault();

            playerTouchObj = (e.originalEvent.changedTouches)[0];

            var yIncreasing = playerTouchObj.screenY - playerTouchStart.y;
            var xIncreasing = playerTouchObj.screenX - playerTouchStart.x;

            if (!xIncreasing || !yIncreasing) {
                return;
            }

            var direction;

            if (Math.abs(xIncreasing) >= Math.abs(yIncreasing)) {
                if (xIncreasing > 0) {
                    direction = 'right';
                } else {
                    direction = 'left';
                }
            } else {
                if (yIncreasing > 0) {
                    direction = 'down';
                } else {
                    direction = 'up';
                }
            }

            if (direction) {
                player.switchImage(direction);
            }

        });
};

ImagePlayer.prototype.switchImage = function(direction) {

    var player = this;
    var options = player.options;
    var current = options.current;
    var datasource = options.datasource;
    var len = datasource.length;

    var countElem = player.countElem;
    var imgElem = player.imgElem;

    var next = 0;
    var animateObj;

    switch (direction) {
        case 'left':

            next = current + 1;
            if (next === len) {
                next = 0;
            }

            animateObj = {
                left: '-999px'
            };

            break;
        case 'right':

            next = current - 1;
            if (next < 0) {
                next = len - 1;
            }
            animateObj = {
                right: '-999px'
            };
            break;

        case 'up':
            player.dispose({
                top: '-999px'
            });
            return;
        case 'down':
            player.dispose({
                top: '999px'
            });
            return;
        default:
            break;
    }

    imgElem.animate(
        animateObj,
        function() {
            options.current = next;
            imgElem.css('left', 'auto').css('right', 'auto').hide();
            player.setImage(datasource[next]);
        }
    );

    player.countElem.html(next + 1);



};

ImagePlayer.prototype.dispose = function(animateObj) {

    var player = this;
    var container = player.container;

    container
        .off('click').off('touchstart')
        .off('touchend');

    if (animateObj) {
        container.animate(animateObj, function() {
            container.remove();
        });
    } else {
        container.remove();

    }
};

export default ImagePlayer;
