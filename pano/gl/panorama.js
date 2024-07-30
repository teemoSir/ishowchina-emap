/**
 * Created by luwenjun on 2020/02/13.
 */
window.leador_server_ipprot = "http://streetapi.ishowchina.com/"
var Util = function () {
}//工具类

var PANO_SERVICE = {
    PANORAMA: '{ipport}/image/icon/{sid}?index={index}&d=C', // 全景缩略图地址, &d=C
    PANORAMAHD: '{ipport}/image/tile/{sid}?zoom=3&face={face}&row={row}&col={col}&c={city}', // 全景高清格式化地址 c={city}&d={dataType}&
    READ_NETWORK: ['http://websv1.ishowchina.com/v3/tile/{z}/{x}/{y}.png', []], // 蓝色路网
    PANO_COOORD_SEARCH: '{ipport}/property/nearest?range={range}&lonlat={lnglat}&callback={callback}', // 根据坐标查询全景
    PANO_STATION_SEARCH: '{ipport}/property/i/{sid}?callback={callback}' // 根据站点查全景
};

PANO_SERVICE.PANORAMA = PANO_SERVICE.PANORAMA.replace("{ipport}", window.leador_server_ipprot)
PANO_SERVICE.PANORAMAHD = PANO_SERVICE.PANORAMAHD.replace("{ipport}", window.leador_server_ipprot)
PANO_SERVICE.PANO_COOORD_SEARCH = PANO_SERVICE.PANO_COOORD_SEARCH.replace("{ipport}", window.leador_server_ipprot)
PANO_SERVICE.PANO_STATION_SEARCH = PANO_SERVICE.PANO_STATION_SEARCH.replace("{ipport}", window.leador_server_ipprot)

var PANO_IMAGE = {
    ARROW_TXTURE_OUT: '../example/assets/topo_arrow.png',
    ARROW_TXTURE_IN: '../example/assets/topo_hover.png',
    PIN_RAD: '../example/assets/pin3.png',
    LOGO: '../example/assets/logo_03.png',
    MARKER_MONKEY: '../example/assets/monkey.png',
    SECTOR: '../example/assets/sector.png',
    NAV: '../example/assets/st-navictrl.png',
    OPENHEAD: '../example/assets/openhand.cur',
    dong: '../example/assets/font_dong.png',
    MENU: '../example/assets/album.png'
};

var PANO_SVG = {
    FULLSCREEN_IN: '../src/icons/fullscreen-in.svg',//compass
    COMPASS: '../src/icons/compass.svg',//compass
};

var ARROW_TEXT = {
    '北': getCanvas('北'),
    '东北': getCanvas('东北'),
    '东': getCanvas('东'),
    '东南': getCanvas('东南'),
    '南': getCanvas('南'),
    '西南': getCanvas('西南'),
    '西': getCanvas('西'),
    '西北': getCanvas('西北'),
    '嘻嘻': getCanvass('嘻嘻')
}

/**
 * @summary Detects if canvas is supported
 * @returns {boolean}
 */
Util.isCanvasSupported = function () {
    var canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
};

/**
 * @summary Tries to return a canvas webgl context
 * @returns {WebGLRenderingContext}
 */
Util.getWebGLCtx = function () {
    var canvas = document.createElement('canvas');
    var names = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
    var context = null;

    if (!canvas.getContext) {
        return null;
    }

    if (names.some(function (name) {
            try {
                context = canvas.getContext(name);
                return (context && typeof context.getParameter === 'function');
            } catch (e) {
                return false;
            }
        })) {
        return context;
    }
    else {
        return null;
    }
};

/**
 * @summary Gets the event name for mouse wheel
 * @returns {string}
 */
Util.mouseWheelEvent = function () {
    return 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support "wheel"
        document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
            'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
};

/**
 * @summary  Gets the event name for fullscreen
 * @returns {string}
 */
Util.fullscreenEvent = function () {
    var map = {
        'exitFullscreen': 'fullscreenchange',
        'webkitExitFullscreen': 'webkitfullscreenchange',
        'mozCancelFullScreen': 'mozfullscreenchange',
        'msExitFullscreen': 'MSFullscreenChange'
    };

    for (var exit in map) {
        if (map.hasOwnProperty(exit) && exit in document) {
            return map[exit];
        }
    }

    return null;
};

/**
 * @summary Detects if WebGL is supported
 * @returns {boolean}
 */
Util.isWebGLSupported = function () {
    return !!window.WebGLRenderingContext && Util.getWebGLCtx() !== null;
};


/**
 * @summary Checks if some three.js components are loaded
 * @param {...string} components
 * @returns {boolean}
 */
Util.checkTHREE = function (components) {
    for (var i = 0, l = arguments.length; i < l; i++) {
        if (!(arguments[i] in THREE)) {
            return false;
        }
    }

    return true;
};


/**
 *获得弧度 弧度=角度*PI/180
 *
 * @param {number} 角度
 * @return  {number} 弧度
 * @date  2020-02-14
 * @author  luwenjun@leader.com.cn
 */
Util.getRadinByAngle = function (c) {
    return c * Math.PI / 180;
}

//
/**
 *获得角度
 *
 * @param {number} 弧度
 * @return  {number} 角度
 * @date  2020-02-14
 * @author  luwenjun@leader.com.cn
 */
Util.getAngleByRadin = function (c) {
    return c * 180 / Math.PI;
}

/**
 *hash赋值
 *
 * @param {number} id
 * @date  2020-02-14
 * @author  luwenjun@leader.com.cn
 */
Util.setHash = function (id) {
    window.location.hash = "#" + id
}

/**
 *hash获取
 *
 * @param {number} id
 * @date  2020-02-14
 * @author  luwenjun@leader.com.cn
 */
Util.getHash = function () {
    return window.location.hash.split('#')[1];
}

/**
 *返回带有标记的唯一值
 *
 * @param {string} key 关键字
 * @return  {string} 唯一字符串
 * @date  2020-02-14
 * @author  luwenjun@leader.com.cn
 */
Util.getRandom = function (key) {
    var date = new Date();
    return key.toUpperCase() + '_' + (Math.random() * 1000000).toFixed(0) + '_' + date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate()
}

var IShowPanorama = function (container, options) {

    if (!IShowPanorama.SYSTEM.loaded) {
        IShowPanorama._loadSystem();
    }

    // 检测支持canvas
    if (!IShowPanorama.SYSTEM.isCanvasSupported) {
        throw new Error('浏览器不支持Canvas！');
    }

    // 检测支持 webgl
    if (!IShowPanorama.SYSTEM.isWebGLSupported) {
        throw new Error('浏览器不支持WebGL');
    }

    var opt = JSON.parse(JSON.stringify(IShowPanorama.DEFAULTS));
    this.OPTIONS = opt;

    this.TITLE_URL = PANO_SERVICE.PANORAMA.replace('{sid}', options.stationID);

    var LOADIMAGE = {
        front: this.TITLE_URL.replace('{index}', 4),
        right: this.TITLE_URL.replace('{index}', 1),
        back: this.TITLE_URL.replace('{index}', 2),
        left: this.TITLE_URL.replace('{index}', 3),
        top: this.TITLE_URL.replace('{index}', 5),
        bottom: this.TITLE_URL.replace('{index}', 6)
    };

    this.PANOURL = LOADIMAGE;
    if (options.test_background == true)  this.PANOURL = IShowPanorama.TEST_LOADIMAGE;

    // keyboard 是否支持在全屏下键盘的操作 默认true
    if (typeof options.keyboard == 'boolean')opt.keyboard = options.keyboard;

    // 全景图过渡动画配置
    if (options.transition)opt.transition = options.transition;

    // 自动漫游播放 默认false
    if (typeof options.timeAnim == 'boolean')opt.time_anim = options.timeAnim

    //控制视野深度 30-90
    if (options.defaultFov)opt.default_fov = options.defaultFov;

    // 控制水平视野方向
    if (options.defaultLong)opt.default_long = options.defaultLong;

    // 控制垂直视野方向
    if (options.defaultLat)opt.default_lat = options.defaultLat;

    // 视野过渡图片
    if (options.loadingImg)opt.loading_img = options.loadingImg;

    // 视野过渡文字
    if (options.loadingText)opt.loading_txt = options.loadingText;

    // 预加载过渡缩略全景 默认 true ,不加载 false
    if (typeof options.loadShrink == 'boolean')opt.load_shrink = options.loadShrink;

    // 是否加载方向指示器 默认true 加载，false不加载
    if (typeof options.linksControl == 'boolean')opt.links_control = options.linksControl;

    // 地址描述控件 默认true 加载，false不加载
    if (typeof options.copyrightControl == 'boolean')opt.copyright_control = options.copyrightControl;

    // 全屏控件 默认true 加载，false不加载
    if (typeof options.fullscreenControl == 'boolean')opt.fullscreen_control = options.fullscreenControl;

    // 导航控件 默认true 加载，false不加载
    if (typeof options.navigationControl == 'boolean')opt.navigation_control = options.navigationControl;

    // 是否加载量测控件 默认true加载，false不加载
    if (typeof options.masureTool == 'boolean')opt.masure_control = options.masureTool;

    //useHash
    if (typeof options.useHash == 'boolean')opt.use_hash = options.useHash;

    // 是否加载小地图 默认true加载，false不加载
    if (typeof options.mapTool == 'boolean')opt.map_tool = options.mapTool;

    // 视野限制
    if (options.latitudeRange)opt.latitude_range = options.latitudeRange;

    // 绘制容器
    if (!container) {
        throw new Error('container 容器ID缺失！');
    }
    opt.container = container;

    // 全景ID
    if (Util.getHash()) {
        options.stationID = Util.getHash();
    } else {
        if (!options.stationID) {
            throw new Error('stationID 参数缺失！');
        }
    }

    opt.stationID = options.stationID;

    // 初始化
    this.init(this.OPTIONS);
}

IShowPanorama.SYSTEM = {
    loaded: false,
    pixelRatio: 1,
    isWebGLSupported: false,
    isCanvasSupported: false,
    mouseWheelEvent: null,
    fullscreenEvent: null
}

/**
 * @summary Default options
 * @type {Object}
 * @readonly
 */
IShowPanorama.DEFAULTS = {
    navbar: false,  // navbar 是否支持导航栏 默认false
    keyboard: true,// keyboard 是否支持在全屏下键盘的操作 默认true
    transition: {
        duration: 500,// 过渡时长
        loader: true // 过渡图片
    },// 全景图过渡动画配置
    time_anim: false,// 自动漫游播放 默认false
    default_fov: 90,//控制视野深度 30-90
    default_long: 180,// 控制水平视野方向
    default_lat: 0,// 控制垂直视野方向
    loading_img: PANO_IMAGE.LOGO,// 视野过渡图片
    loading_txt: '加载中...',// 视野过渡文字
    load_shrink: true,// 预加载过渡缩略全景 默认 true ,不加载 false
    //arrow_tool: true,// 是否加载方向指示器 默认true 加载，false不加载---弃用
    masure_control: true,// 是否加载量测控件 默认true加载，false不加载
    map_tool: true,// 是否加载小地图 默认true加载，false不加载
    latitude_range: [-51, 90],// 视野限制
    test_background: false,//测试壁纸
    use_hash: true,//根据地址栏ID赋值站点
    address_control: true,//地址显示插件
    fullscreen_control: true,//全屏控件
    navigation_control: true,//导航控件
    links_control: true// 是否加载方向指示器 默认true 加载，false不加载

}

IShowPanorama.TEST_LOADIMAGE = {
    front: '../example/test-cubemap/1.png',
    right: '../example/test-cubemap/2.png',
    back: '../example/test-cubemap/3.png',
    left: '../example/test-cubemap/4.png',
    top: '../example/test-cubemap/5.png',
    bottom: '../example/test-cubemap/6.png'
};

IShowPanorama._loadSystem = function () {
    var S = IShowPanorama.SYSTEM;
    S.loaded = true;
    S.pixelRatio = window.devicePixelRatio || 1;
    S.isWebGLSupported = Util.isWebGLSupported();
    S.isCanvasSupported = Util.isCanvasSupported();
    S.mouseWheelEvent = Util.mouseWheelEvent();
    S.fullscreenEvent = Util.fullscreenEvent();
};

/**
 * 组件加载
 * @param options
 * @param options.panorama 全景地址集合
 */
IShowPanorama.prototype._controller = function () {
    var _this = this;
    //缓存加载
    this.loadBuffer();
    //初始化加载高清第一面
    var options = {
        url: PANO_SERVICE.PANO_STATION_SEARCH.replace('{sid}', this.OPTIONS.stationID),
        callback: backStation
    }
    Util.sendJSONP(options);


    function backStation(data) {
        if (data.StationID) {
            _this.STATION = data;
            _this.OPTIONS.stationID = data.StationID;

            // 箭头工具
            if (_this.OPTIONS.links_control == true) {
                _this._pluginLinks();
            }

            //addAddressControl
            if (_this.OPTIONS.copyright_control == true) {
                _this._pluginCopyright();
            }

            //全屏UI控件
            if (_this.OPTIONS.fullscreen_control == true) {
                _this._pluginFullScreen();
            }
            //_pluginNavigation
            if (_this.OPTIONS.navigation_control == true) {
                _this._pluginNavigation();
            }

            // 量测工具
            if (_this.OPTIONS.masure_tool == true) {
                //_this._pluginMasure()
            }

            //hash赋值
            if (_this.OPTIONS.use_hash == true) {
                Util.setHash(_this.STATION.StationID)
            }
            //重置方位
            // _this._pluginLogo()

            //感应方位并加载该方位HD影像
            _this.setAngle({longitude: _this.STATION.Yaw + 90, latitude: 0});
        }
    }


    // 小地图
    //if (this.OPTIONS.mapTool == true) {
    //  _this._pluginMap()
    //}
    //  }

}

IShowPanorama.prototype.loadBuffer = function () {
    // 缓存事件用于注销
    if (this.ARROW_EVENT) {
        // 注销绑定的事件
        for (var i = 0; i < this.ARROW_EVENT.length; i++) {
            this._unbind(this.ARROW_EVENT[i].name, this.ARROW_EVENT[i].func);
        }
    }
    this.ARROW_EVENT = []

    // 模型缓存清空
    if (this.SELECT_PANEL) {
        for (var i = 0; i < this.SELECT_PANEL.length; i++) {
            this.PANO_VIEW.scene.remove(this.SELECT_PANEL[i]);
        }
    }
    this.SELECT_PANEL = [];

    //圆形区域绘制缓存
    if (this.SELECT_CIRCLE) {
        this.PANO_VIEW.scene.remove(this.SELECT_CIRCLE);
    }
    this.SELECT_CIRCLE = null;
}

/**
 * 鼠标量测区域绘制
 * */
IShowPanorama.prototype._pluginMap = function () {
    var _this = this;

    function _panoMarker() {
        //删除标记
        if (_this._PANO_MAP._MONKEY_MARKER) {
            _this._PANO_MAP.getOverlayLayer().removeOverlay(_this._PANO_MAP._MONKEY_MARKER);
        }

        //添加标记
        this._marker = new IMAP.MarkerOptions();
        this._marker.editabled = true;
        this._marker.anchor = IMAP.Constants.BOTTOM_CENTER;
        this._marker.title = '拖动改变位置'
        this._marker.icon = new IMAP.Icon(PANO_IMAGE.MARKER_MONKEY, {
            'size': new IMAP.Size(25, 29),
            'offset': new IMAP.Pixel(0, 0)
        });
        this.lnglat = {lng: _this.STATION.LonLatShape.X, lat: _this.STATION.LonLatShape.Y}
        _this._PANO_MAP._MONKEY_MARKER = new IMAP.Marker(this.lnglat, this._marker);
        _this._PANO_MAP._MONKEY_MARKER.addEventListener('dragend', _panoEventDragend);

        //MONKEY_MARKER.setLabel('京Q-8382233', IMAP.Constants.RIGHT_TOP, new IMAP.Pixel(0,0));
        _this._PANO_MAP.getOverlayLayer().addOverlay(_this._PANO_MAP._MONKEY_MARKER, true);
        _this._PANO_MAP.setCenter(this.lnglat);

    }

    function _panoReadNetwork() {
        //蓝色路网加载
        var tileLayer = new IMAP.TileLayer({
            maxZoom: 18,
            minZoom: 1,
            tileSize: 256,
            baseUrl: PANO_SERVICE.READ_NETWORK
        });

        _this._PANO_MAP.addLayer(tileLayer);
    }

    function _panoContainer(width, height) {
        this._ele = document.createElement('div');
        this._ele.id = Util.getRandom('pano_map');
        this._ele.style = ' position: absolute;right: 5px;bottom: 5px;width: {w}px;height: {h}px;cursor: pointer;z-index: 100000;border:1px solid #999'.replace('{w}', width).replace('{h}', height)
        _this.PANO_VIEW.container.appendChild(this._ele);
        return this._ele.id;
    }

    function _panoMap(container) {
        _this._PANO_MAP = new IMAP.Map(container, {
            minZoom: 3, //最小地图级别
            maxZoom: 18, //最大地图级别
            zoom: 12, //初始化级别
            center: new IMAP.LngLat(_this.STATION.LonLatShape.X, _this.STATION.LonLatShape.Y)//中心点坐标
        });
    }

    function _panoSector(container) {
        var coord = {lng: _this.STATION.LonLatShape.X, lat: _this.STATION.LonLatShape.Y}
        // 添加扇形
        this.coord = _this._PANO_MAP.lnglatToPixel(coord);
        this.img = document.createElement('img');
        this.img.src = PANO_IMAGE.SECTOR;
        this.img.style = 'position:absolute;width:100px;z-index:1000;opacity: 1;left:{l}px;top:{t}px'.replace('{l}', this.coord.x - 50).replace('{t}', this.coord.y - 50);
        this.addele = document.getElementById(container);
        this.addele.appendChild(this.img);
        _this._PANO_MAP._SECTOR = this.img;

        // 加入监控时刻刷新扇形方位指示
        _this.PANO_VIEW.on('position-updated', _positionUpdated)
    }

    function _positionUpdated(lnglat) {
        var angle = ( 180 / Math.PI * lnglat.longitude) - _this.STATION.Yaw;
        _this._PANO_MAP._SECTOR.style.transform = 'rotate({r}deg)'.replace('{r}', angle);
        _this._PANO_MAP._SECTOR.style.transformOrigin = '50% 50%';
    }

    function _panoEvent() {
        _this._PANO_MAP.addEventListener(IMAP.Constants.CLICK, _panoEventClick);
        _this._PANO_MAP.addEventListener(IMAP.Constants.MOVE_START, _mapEventMoveStart);
        _this._PANO_MAP.addEventListener(IMAP.Constants.MOVE_END, _mapEventMoveEnd);
        _this._PANO_MAP.addEventListener(IMAP.Constants.ZOOM_START, _mapEventMoveStart);
        _this._PANO_MAP.addEventListener(IMAP.Constants.ZOOM_END, _mapEventMoveEnd);
    }

    var container = _panoContainer(300, 250);
    _panoMap(container);
    //_panoMarker();
    _panoReadNetwork();
    _panoSector(container);
    _panoEvent();

    function _panoEventClick(event) {
        // 设置图标中心
        _this._PANO_MAP._MONKEY_MARKER.setPosition(event.lnglat);

        // 设置地图中心
        _this._PANO_MAP.setCenter(event.lnglat);

        // 根据坐标加载全景
        _this.getPanoByCoord(event.lnglat, panoByCoord)
    }

    function panoByCoord(data) {
        if (!data.StationID || data.status) {
            _this.message('此区域暂无全景', 5000);
            return false;
        }
        _this.OPTIONS.stationID = data.StationID;
        _this.OPTIONS.load_shrink = true;
        if (!data.LonLatShape) {
            _this._PANO_MAP._MONKEY_MARKER.setPosition({lng: data.LonLatShape.X, lat: data.LonLatShape.Y})
        }
        _this.initHD(_this.OPTIONS);
    }

    function _panoEventDragend(event) {
        // 设置地图中心
        _this._PANO_MAP.setCenter(event.lnglat);

        // 根据坐标加载全景
        _this.getPanoByCoord(event.lnglat, panoByCoord)
    }

    function _mapEventMoveEnd() {
        this.coord = _this._PANO_MAP.lnglatToPixel(_this._PANO_MAP._MONKEY_MARKER.getPosition());
        _this._PANO_MAP._SECTOR.style.top = this.coord.y - 30 + 'px';
        _this._PANO_MAP._SECTOR.style.left = this.coord.x - 20 + 'px';
        _this._PANO_MAP._SECTOR.style.display = '';
    }

    function _mapEventMoveStart() {
        _this._PANO_MAP._SECTOR.style.display = 'none';
    }
}

/**
 * 鼠标量测区域绘制
 * */
IShowPanorama.prototype._pluginMasure = function () {

    // 鼠标量测区域绘制
    if (this.STATION.JunctionItems) {
        for (var i in this.STATION.JunctionItems) {
            var options = {
                panel_x: 40,
                panel_y: 60,
                rotation: (Math.PI / 180 * (this.STATION.JunctionItems[i].Angle - this.ARROW_ANGLE + 360 ) % 360)
            }
            //this._addPanel(options);
        }


    } else {
        // 非交叉口只有前后
        if (this.STATION.Previous) {
            var options = {
                panel_x: 40,
                panel_y: 60,
                rotation: 0
            }
            //this._addPanel(options);
        }
        if (this.STATION.Next) {
            var options = {
                panel_x: 40,
                panel_y: 60,
                rotation: (Math.PI / 180 * 180)
            }
            //this._addPanel(options);
        }
    }

    // 鼠标量测圆绘制
    //this._addCircle();

    var _this = this;
    //增加事件
    this._bind('mousemove', backMove, false);
    this.ARROW_EVENT.push({name: 'mousemove', func: backMove});
    function backMove() {
        // _this._circleMove();
        // 文字移动事件
        //_this._textMove();
    }
}


IShowPanorama.prototype._textMove = function () {
    // 射线查询是否有对象
    var _EVENT = this._raycaster(event);
    var _CSS = 'z-index:1000000;position:absolute;top:{t}px;left:{l}px;color:#fff;text-shadow:3px 3px 3px #000;font-size:13px;text-align:center;';
    var _DIS = 0;
    var _POINT = null;
    var _CONTENT = null;
    var _VIEWS = null;

    if (_EVENT[0].object.parent.name && _EVENT[0].object.parent.name.indexOf('PANEL') >= 0) {
        _DIS = _EVENT[0].distance;
        _POINT = _EVENT[0].point;
        _EVENT = _EVENT[0].object.parent;
    } else {
        if (this._TEXT_DISTINCE) {
            _CSS = _CSS.replace('{t}', -100).replace('{l}', -100);
            this._TEXT_DISTINCE = this.updateElement({ele: this._TEXT_DISTINCE, css: _CSS, html: _CONTENT});
        }
        return false;
    }

    // 转换三维坐标到屏幕坐标
    _VIEWS = this.PANO_VIEW.vector3ToViewerCoords(_POINT);
    _CONTENT = '前进{m}米'.replace('{m}', Math.abs((_DIS / 3).toFixed(1)))
    _CSS = _CSS.replace('{t}', _VIEWS.y + 25).replace('{l}', _VIEWS.x - 33);

    if (!this._TEXT_DISTINCE) {
        this._TEXT_DISTINCE = {};
        this._TEXT_DISTINCE = this.addElement({name: 'div', css: _CSS, html: _CONTENT});
    } else {
        this._TEXT_DISTINCE = this.updateElement({ele: this._TEXT_DISTINCE, css: _CSS, html: _CONTENT});
    }
    this.PANO_VIEW.renderer.render(this.PANO_VIEW.scene, this.PANO_VIEW.camera);
}

IShowPanorama.prototype._circleMove = function () {
    if (!this.SELECT_CIRCLE) {
        throw new Error('参数缺失');
    }
    // 如果有选中
    var select = this._raycaster(event);
    if (select[0]) {
        if (select[0].object.parent.name.indexOf('PANEL') > -1) {
            this.SELECT_CIRCLE.position.x = select[0].point.x;
            this.SELECT_CIRCLE.position.z = select[0].point.z;
        } else {
            this.SELECT_CIRCLE.position.x = 0;
            this.SELECT_CIRCLE.position.z = 0;
        }
    }
    this.PANO_VIEW.renderer.render(this.PANO_VIEW.scene, this.PANO_VIEW.camera);
}

// 测量工具绘制的圆形
IShowPanorama.prototype._addCircle = function () {
    if (!this.SELECT_CIRCLE) {
        var geometry = new THREE.RingBufferGeometry(6, 6.8, 100);
        var material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: .8});
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = 0;
        mesh.position.y = -9.5;
        mesh.rotation.x = -Math.PI / 2;

        var object3D = new THREE.Object3D();
        object3D.add(mesh);
        object3D.name = Util.getRandom('circle');
        this.SELECT_CIRCLE = object3D;
        this.PANO_VIEW.scene.add(object3D);
    }
}

// 鼠标量测工具
IShowPanorama.prototype._addPanel = function (options) {
    if (!this.PANO_VIEW) {
        throw new Error('对象未实例');
    }
    if (!options) {
        throw new Error('参数缺失');
    }
    var object3D, material, geometry, mesh;
    object3D = new THREE.Object3D();
    object3D.rotation.y = options.rotation;// 旋转角度与交叉口角度一致
    object3D.name = Util.getRandom('panel');

    geometry = new THREE.PlaneGeometry(options.panel_x, options.panel_y, 1, 1);
    material = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.0, transparent: false});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -60;
    mesh.position.y = -10;
    mesh.rotation.x = -Math.PI / 2;

    object3D.add(mesh);
    this.SELECT_PANEL.push(object3D);
    this.PANO_VIEW.scene.add(object3D);
}

IShowPanorama.prototype._arrowMove = function (bool) {
    this._EVENT = {};
    this._EVENT.selectModels = this._raycaster(event);
    if (!this._EVENT.selectModels) {
        throw new Error('捕获异常')
    }

    for (var i = 0; i < this._EVENT.selectModels.length; i++) {
        if (this._EVENT.selectModels[i].object.parent.name
            && this._EVENT.selectModels[i].object.parent.name.indexOf('ARROW') >= 0) {
            this._EVENT.selectModels = this._EVENT.selectModels[i].object.parent;
            break;
        }
    }
    // 是否有站点可跳转
    if (!this._EVENT.selectModels.name) {
        return false;
    }
    if (bool) {
        this._EVENT.selectModels.children[0].material.opacity = .5;
    } else {
        this._EVENT.selectModels.children[0].material.opacity = 1;
    }

    console.log(this._EVENT.selectModels.children[0].material.opacity);
}


IShowPanorama.prototype._arrowClick = function () {
    this._EVENT = {};
    this._EVENT.selectModels = this._raycaster(event);
    if (!this._EVENT.selectModels) {
        throw new Error('捕获异常')
    }

    for (var i = 0; i < this._EVENT.selectModels.length; i++) {
        if (this._EVENT.selectModels[i].object.parent.name
            && this._EVENT.selectModels[i].object.parent.name.indexOf('ARROW') >= 0
            && this._EVENT.selectModels[i].object.parent.station) {
            this._EVENT.selectModels = this._EVENT.selectModels[i].object.parent;
            break;
        }
    }

    // 是否有站点可跳转
    if (!this._EVENT.selectModels.name) {
        return false;
    }

    this.OPTIONS.stationID = this._EVENT.selectModels.station;
    //this.OPTIONS.load_shrink = true;
    this.loadPanoByID(this.OPTIONS);
}

// 捕获射线
IShowPanorama.prototype._raycaster = function (options) {
    this._ARROW_DROW = {}
    this._ARROW_DROW.view = this.PANO_VIEW.container;
    this._ARROW_DROW.standardVector = new THREE.Vector3(( options.clientX / this._ARROW_DROW.view.offsetWidth) * 2 - 1, -( options.clientY / this._ARROW_DROW.view.offsetHeight) * 2 + 1, 0.5);//标准设备坐标
    //标准设备坐标转世界坐标
    this._ARROW_DROW.worldVector = this._ARROW_DROW.standardVector.unproject(this.PANO_VIEW.camera);
    //射线投射方向单位向量(worldVector坐标减相机位置坐标)
    this._ARROW_DROW.ray = this._ARROW_DROW.worldVector.sub(this.PANO_VIEW.camera.position).normalize();
    //创建射线投射器对象
    this._ARROW_DROW.raycaster = new THREE.Raycaster(this.PANO_VIEW.camera.position, this._ARROW_DROW.ray);
    this._ARROW_DROW.intersects = this._ARROW_DROW.raycaster.intersectObjects(this.PANO_VIEW.scene.children, true);
    if (this._ARROW_DROW.intersects.length > 0) {
        this._INTERSECTED = this._ARROW_DROW.intersects;
    } else {
        this._INTERSECTED = undefined
    }
    return this._INTERSECTED
}


// 添加箭头
IShowPanorama.prototype._pluginLinks = function () {

    var options = this.STATION;
    if (!options) {
        throw new Error('参数缺失！')
    }
    // 清空现有箭头
    if (this._ARROW_GROUP) {
        this.PANO_VIEW.scene.remove(this._ARROW_GROUP);
        delete this._ARROW_GROUP;
    }

    // 绘制新箭头
    this._ARROW_GROUP = new THREE.Group();
    this._ARROW_GROUP.name = Util.getRandom('arrow');
    this.PANO_VIEW.scene.add(this._ARROW_GROUP);

    //  console.warn((options.JunctionItems != null ? ' × 交叉站点' : ' — 直行路口'));
    // console.log(options.JunctionItems, this.STATION.Direction)
    if (options.JunctionItems != null) {
        //交叉口
        //全景方位导致的偏转值
        if (this.STATION.Direction == 0) {
            for (var i in options.JunctionItems) {
                var x = {
                    arrow_rotation: options.JunctionItems[i].Angle,
                    station: options.JunctionItems[i].StationID,
                    text_rotation: (360 - (options.Yaw - options.JunctionItems[i].Angle )) % 360
                }
                this._cross(x);
            }
        } else {
            for (var i in options.JunctionItems) {
                var x = {
                    arrow_rotation: 360 - options.JunctionItems[i].Angle,//(options.JunctionItems[i].Yaw-options.Yaw) % 360,//- this.ARROW_ANGLE
                    station: options.JunctionItems[i].StationID,
                    text_rotation: ( 360 - (options.Yaw + options.JunctionItems[i].Angle)) % 360//((options.Yaw-options.JunctionItems[i].Yaw-180)) % 360
                }
                this._cross(x);
            }
        }


        //加入后方方位指向
        if (options.Previous && options.JunctionItems.length <= 3) {
            var x = {
                arrow_rotation: 180,
                station: options.Previous,
                text_rotation: (360 - options.Yaw - 180 ) % 360
            }
            //  this._cross(x); //后退一个视野站点
        }
        //加入前方方位指向
        if (options.Next && options.JunctionItems.length <= 3) {
            var x = {
                arrow_rotation: 0,
                station: options.Next,
                text_rotation: (360 - options.Yaw ) % 360
            }
            //  this._cross(x); //后退一个视野站点
        }


    } else {
        if (options.Next) {
            this._straight({arrow_rotation: 0, station: options.Next, text_rotation: (360 - options.Yaw) % 360});  //前进一个视野站点
        }

        //加入后方方位指向
        if (options.Previous) {
            this._straight({
                arrow_rotation: 180,
                station: options.Previous,
                text_rotation: (360 - options.Yaw - 180) % 360
            }); //后退一个视野站点
        }
    }


    var _this = this;

    // 点击事件
    this._bind('click', click)
    this.ARROW_EVENT.push({name: 'click', func: click});
    function click() {
        window.event.preventDefault()
        // 箭头点击事件
        _this._arrowClick();
    }


    /*    this._bind('mousemove', mousemove)
     this.ARROW_EVENT.push({name: 'mousemove', func: mousemove});
     function mousemove() {
     //_this._arrowMove(true)
     _this._arrowMove(true);
     console.log('mousemove')
     }

     this._bind('mouseout', mouseout)
     this.ARROW_EVENT.push({name: 'mouseout', func: mouseout});
     function mouseout() {
     //window.event.preventDefault()
     //_this._arrowMove();
     _this._arrowMove(false);
     console.log('mouseover')
     }*/
}

IShowPanorama.prototype._cursor = function (o) {
    this._EVENT = {};
    this._EVENT.selectModels = this._raycaster(event);
    if (!this._EVENT.selectModels) {
        throw new Error('捕获异常')
    }

    for (var i = 0; i < this._EVENT.selectModels.length; i++) {
        if (this._EVENT.selectModels[i].object.parent.name
            && this._EVENT.selectModels[i].object.parent.name.indexOf('ARROW') >= 0
            && this._EVENT.selectModels[i].object.parent.station) {
            this._EVENT.selectModels = this._EVENT.selectModels[i].object.parent;
            break;
        }
    }

    // 是否有站点可跳转
    if (!this._EVENT.selectModels.name) {
        return false;
    }
    if (o) {
        window.document.body.style.cursor = "pointer"
    } else {
        window.document.body.style.cursor = "default"
    }

}

IShowPanorama.prototype._cross = function (options) {
    this._ARROW_DROW = {}

    //文字获取 ARROW_TEXT
    this._ARROW_DROW.rotation = (options.text_rotation + 360) % 360;//排除负值
    this._ARROW_DROW.canvas = this.getDirectionByAngle(360 - (this._ARROW_DROW.rotation) % 360);
    this._ARROW_DROW.geometry = new THREE.PlaneGeometry(1.4, 2.3, 100, 100);//控制箭头大小
    this._ARROW_DROW.material = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(this._ARROW_DROW.canvas.value),
        transparent: true,
        opacity: 1
        // side: THREE.DoubleSide//双面显示
    });

    // 计算子网格的旋转坐标
    this._ARROW_DROW.angle = Math.PI / 180 * options.arrow_rotation;
    this._ARROW_DROW.jd = 180 * ( this._ARROW_DROW.angle + Math.PI / 2) / Math.PI;
    this._ARROW_DROW.mesh_x = 2.0 * Math.cos(this._ARROW_DROW.jd * Math.PI / 180);
    this._ARROW_DROW.mesh_y = 2.0 * Math.sin(this._ARROW_DROW.jd * Math.PI / 180);

    if (!this.PANO_HEIGHT)this.PANO_HEIGHT = -1.5; else this.PANO_HEIGHT = this.PANO_HEIGHT + .02;
    if (this.PANO_HEIGHT > -1)this.PANO_HEIGHT = -1.5;
    // 获得子网格的旋转坐标
    this._ARROW_DROW.mesh = new THREE.Mesh(this._ARROW_DROW.geometry, this._ARROW_DROW.material);
    this._ARROW_DROW.mesh.position.x = this._ARROW_DROW.mesh_x;
    this._ARROW_DROW.mesh.position.y = this._ARROW_DROW.mesh_y;
    this._ARROW_DROW.mesh.position.z = this.PANO_HEIGHT + 1;
    this._ARROW_DROW.mesh.rotation.z = this._ARROW_DROW.angle;

    // 添加到 object3D 用于捕获，翻转坐标为右手坐标系
    this._ARROW_DROW.object3D = new THREE.Object3D();
    this._ARROW_DROW.object3D.add(this._ARROW_DROW.mesh);
    this._ARROW_DROW.object3D.rotation.x = -Math.PI / 2;
    this._ARROW_DROW.object3D.station = options.station;
    this._ARROW_DROW.object3D.name = Util.getRandom('arrow');

    // 添加到组 设置父子坐标让其根据自定义点旋转 参考 ：http://threejs.outsidelook.cn/examples/set-pivot/index.html
    this._ARROW_GROUP.add(this._changePivot(0, 0, 0, this._ARROW_DROW.object3D));

    var _this = this;
    this._addRequestAnimationFrame(function () {
        /*
         小葵花妈妈课堂，开课啦：
         圆点坐标：(x0,y0)
         半径：r
         角度：a0
         则圆上任一点为：（x1,y1）
         x1   =   x0   +   r   *   cos(ao   *   3.14   /180   )
         y1   =   y0   +   r   *   sin(ao   *   3.14   /180   )
         */
        this.jd = 180 * (_this.getViewPosition().longitude - Math.PI / 2) / Math.PI;
        this.x = 0 + 5.0 * Math.cos(this.jd * Math.PI / 180)
        this.y = 0 + 5.0 * Math.sin(this.jd * Math.PI / 180)
        _this._ARROW_GROUP.position.set(-this.x, -1.5, -this.y);

        _this.PANO_VIEW.renderer.render(_this.PANO_VIEW.scene, _this.PANO_VIEW.camera);
    })
}

IShowPanorama.prototype._straight = function (options) {
    this._ARROW_DROW = {};

    //文字获取 ARROW_TEXT
    this._ARROW_DROW.rotation = (options.text_rotation + 360) % 360;//排除负值
    // this._ARROW_DROW.canvas = this.getDirectionByAngle(360 - (this._ARROW_DROW.rotation + 180) % 360);
    this._ARROW_DROW.canvas = this.getDirectionByAngle(360 - (this._ARROW_DROW.rotation) % 360);
    this._ARROW_DROW.geometry = new THREE.PlaneGeometry(1.4, 2.3, 100, 100);//控制箭头大小
    this._ARROW_DROW.material = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(this._ARROW_DROW.canvas.value),//options.texture,
        transparent: true,
        opacity: 1
    });

    // 计算子网格的旋转坐标
    this._ARROW_DROW.angle = Math.PI / 180 * options.arrow_rotation;
    this._ARROW_DROW.jd = 180 * ( this._ARROW_DROW.angle + Math.PI / 2) / Math.PI;
    this._ARROW_DROW.cos_x = 0.0 + 1.5 * Math.cos(this._ARROW_DROW.jd * Math.PI / 180);
    this._ARROW_DROW.sin_y = 0.0 + 1.5 * Math.sin(this._ARROW_DROW.jd * Math.PI / 180);

    // 获得子网格的旋转坐标
    this._ARROW_DROW.mesh = new THREE.Mesh(this._ARROW_DROW.geometry, this._ARROW_DROW.material);
    this._ARROW_DROW.mesh.position.x = this._ARROW_DROW.cos_x;
    this._ARROW_DROW.mesh.position.y = this._ARROW_DROW.sin_y;
    this._ARROW_DROW.mesh.rotation.z = this._ARROW_DROW.angle;

    // 添加到 object3D 用于捕获，翻转坐标为右手坐标系
    this._ARROW_DROW.object3D = new THREE.Object3D();
    this._ARROW_DROW.object3D.add(this._ARROW_DROW.mesh);
    this._ARROW_DROW.object3D.rotation.x = -Math.PI / 2;
    this._ARROW_DROW.object3D.station = options.station;
    this._ARROW_DROW.object3D.name = Util.getRandom('arrow');

    // 添加到组 设置父子坐标让其根据自定义点旋转
    // 参考 ：http://threejs.outsidelook.cn/examples/set-pivot/index.html
    this._ARROW_GROUP.add(this._changePivot(0, 0, 0, this._ARROW_DROW.object3D));

    var _this = this;
    this._addRequestAnimationFrame(function () {
        /*
         小葵花妈妈课堂，开课啦：
         圆点坐标：(x0,y0)
         半径：r
         角度：a0
         则圆上任一点为：（x1,y1）
         x1   =   x0   +   r   *   cos(ao   *   3.14   /180   )
         y1   =   y0   +   r   *   sin(ao   *   3.14   /180   )
         */
        this.jd = 180 * (_this.getViewPosition().longitude - Math.PI / 2) / Math.PI;
        this.x = 0 + 5.0 * Math.cos(this.jd * Math.PI / 180)
        this.y = 0 + 5.0 * Math.sin(this.jd * Math.PI / 180)
        _this._ARROW_GROUP.position.set(-this.x, -1.5, -this.y);
        _this.PANO_VIEW.renderer.render(_this.PANO_VIEW.scene, _this.PANO_VIEW.camera);
    })

}

IShowPanorama.prototype.addSharp = function (d) {
    var heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.lineTo(0, 2.5);
    //heartShape.quadraticCurveTo( 0, 2.3, 1, 2.2 );
    heartShape.lineTo(1, .5);
    heartShape.lineTo(.5, .5);
    heartShape.lineTo(.5, 0);
    heartShape.lineTo(.5, -1);
    heartShape.lineTo(-.5, -1);
    heartShape.lineTo(-.5, 0);
    heartShape.lineTo(-.5, .5);
    heartShape.lineTo(-1, .5);
    heartShape.lineTo(0, 2.5);

    var geometry = new THREE.ShapeGeometry(heartShape);
    var material = new THREE.MeshBasicMaterial({color: 0xf8f8f8, opacity: .8, transparent: true});


    var material1 = new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(ARROW_TEXT.嘻嘻.value),//options.texture,
        transparent: true,
        opacity: 1
    });
//font_dong.png
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = d;
    this._ARROW_GROUP.add(this._changePivot(0, 0, 0, mesh));

}

IShowPanorama.prototype._yy = function () {

    var ambientLight = new THREE.AmbientLight("#111111");
    this._ARROW_GROUP.add(ambientLight);

    directionalLight = new THREE.DirectionalLight("#000000");
    directionalLight.position.set(-40, 60, -10);

    directionalLight.shadow.camera.near = 20; //产生阴影的最近距离
    directionalLight.shadow.camera.far = 200; //产生阴影的最远距离
    directionalLight.shadow.camera.left = -50; //产生阴影距离位置的最左边位置
    directionalLight.shadow.camera.right = 50; //最右边
    directionalLight.shadow.camera.top = 50; //最上边
    directionalLight.shadow.camera.bottom = -50; //最下面

    //这两个值决定使用多少像素生成阴影 默认512
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.mapSize.width = 1024;

    //告诉平行光需要开启阴影投射
    directionalLight.castShadow = true;

    this._ARROW_GROUP.add(directionalLight);

}

IShowPanorama.prototype._addRequestAnimationFrame = function (options) {
    if (typeof options == 'function' && typeof window.requestAnimationFrame == 'function') {
        var raf = 'RequestAnimationFrame'//PANO_TOOL.getRandom('RequestAnimationFrame');

        if (window[raf]) {
            delete  window[raf];
        }

        window[raf] = function () {
            window.requestAnimationFrame(window[raf]);
            options();
        }
        window[raf]();
    }
}

// 反转系统
IShowPanorama.prototype._changePivot = function (x, y, z, obj) {
    this._ARROW_GROUP.position.set(x, y, z);
    obj.position.set(x, y, z);
    return obj;
}

/**
 *根据图片切片进行合并
 * @param options
 * @param options.canvasWidth 需要合并的片宽度
 * @param options.canvasHeight 需要合并的片高度
 * @param options.canvasFillStyle 填充色
 * @param options.data 切片请求数组
 * @param options.position 切片合并相对坐标原点
 * @param options.imgWidth 图片宽度
 * @param options.imgHeight 图片高度
 * @param options.callback 回调
 * @param options.pano 全景朝向
 */
IShowPanorama.prototype._mergeImage = function (options) {

    var canvas = document.createElement('canvas');
    canvas.width = options.canvasWidth;
    canvas.height = options.canvasHeight;

    var ctx = canvas.getContext('2d');
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = options.canvasFillStyle;
    ctx.fill();

    // 递归完成4*4切片的拼接
    function drawing(next) {
        if (next < options.data.length) {
            var img = new Image;
            img.crossOrigin = 'Anonymous'; //解决跨域
            img.src = options.data[next];
            img.onload = function () {
                ctx.drawImage(img, options.position[next][0], options.position[next][1], options.imgWidth, options.imgHeight);
                drawing(next + 1);//递归
            }
        } else {
            options.callback(canvas.toDataURL('image/png', 1), options.index)
        }
    }

    drawing(0);
}

IShowPanorama.prototype.init = function (options) {
    if (!options) {
        throw new Error('参数缺失！')
    }
    this.PANO_VIEW = new PhotoSphereViewer({
        container: options.container,
        panorama: this.PANOURL,
        // caption: options.desc,
        //fisheye: true,
        //webgl: false,
        time_anim: options.time_anim, // 自动漫游播放
        default_fov: options.default_fov, //控制视野深度 30-90
        default_long: Util.getAngleByRadin(options.default_long), // 控制水平视野方向
        default_lat: Util.getAngleByRadin(options.default_lat), // 控制垂直视野方向
        loading_img: options.loading_img,
        loading_txt: options.loading_txt,
        //tilt_down_max: options.tilt_down_max,
        //tilt_up_max: Math.PI / 7,
        mousemove_hover: false, //视野跟随光标
        touchmove_two_fingers: false, // 触摸屏双指旋转
        latitude_range: [Util.getRadinByAngle(options.latitude_range[0]), Util.getRadinByAngle(options.latitude_range[1])],//[Math.PI/2, -Math.PI/3.5]
        transition: options.transition,
        lang: {
            autorotate: '视野漫游',
            zoom: '缩放',
            zoomOut: '放大',
            zoomIn: '缩小',
            download: '下载',
            fullscreen: '全屏',
            markers: '标记',
            gyroscope: '陀螺仪',
            stereo: '立体',
            stereo_notification: '单击任意位置退出立体视图.',
            please_rotate: ['请旋转您的设备', '(或 点击继续)'],
            two_fingers: ['Use two fingers to navigate']
        },
        navbar: false //options.navbar
    });


    //初始化加载
    this.loadPanoByID();
    //事件加载
    this.loadEvent();

}

IShowPanorama.prototype.loadEvent = function () {
    var _this = this;
    this.PANO_VIEW.on('position-updated', function (coord) {
        _this.progressiveLoad(coord);
        // console.log(Util.getAngleByRadin(coord.longitude))
        //console.log(Util.getAngleByRadin(coord.latitude))
        //console.log(_this.STATION.Yaw,coord)
        _this.rushNav(coord)
    });
}
IShowPanorama.prototype.rushNav = function (coord) {
    //罗盘指向更改
    var nav_ui = document.getElementById('nav_ui');
    if (nav_ui) {
        nav_ui.setAttribute('transform', 'rotate({angle}, 41, 41)'.replace('{angle}', Util.getAngleByRadin(coord.longitude) - this.STATION.Yaw));
    }
}

//根据站点更新全景
IShowPanorama.prototype.loadPanoByID = function () {
    var _this = this;
    delete this.PANOURL;

    //初始化动态加载参数
    this.SCENE_DETECTION = JSON.parse(JSON.stringify(this.SCENE_DETECTION_DEFAULT));
    this.SCENE_DETECTION_TOP_BOTTOM = JSON.parse(JSON.stringify(this.SCENE_DETECTION_TOP_BOTTOM_DEFAULT));

    //更新缩略图列表
    this.TITLE_URL = PANO_SERVICE.PANORAMA.replace('{sid}', this.OPTIONS.stationID);

    this.PANOURL = {
        front: this.TITLE_URL.replace('{index}', 4),
        right: this.TITLE_URL.replace('{index}', 1),
        back: this.TITLE_URL.replace('{index}', 2),
        left: this.TITLE_URL.replace('{index}', 3),
        top: this.TITLE_URL.replace('{index}', 5),
        bottom: this.TITLE_URL.replace('{index}', 6)
    };
    //即可加载全景缩略图
    this.PANO_VIEW.setPanorama(this.PANOURL, false);

    this.PANO_VIEW.once('panorama-loaded', panorama_loaded);
    function panorama_loaded() {
        _this._controller();
        //console.log('panorama-loaded');

        //重置事件
        _this.PANO_VIEW.off('panorama-loaded', panorama_loaded);
    }
}

IShowPanorama.prototype.progressiveLoad = function (coord) {
    for (var i in this.SCENE_DETECTION) {
        var a = (this.SCENE_DETECTION[i].ISHD == false) ? true : false;
        var b = (Util.getAngleByRadin(coord.longitude) > this.SCENE_DETECTION[i].MIN[0] && Util.getAngleByRadin(coord.longitude) <= this.SCENE_DETECTION[i].MIN[1]) ? true : false;
        var c = (Util.getAngleByRadin(coord.longitude) > this.SCENE_DETECTION[i].MAX[0] && Util.getAngleByRadin(coord.longitude) <= this.SCENE_DETECTION[i].MAX[1]) ? true : false;
        if (a && (b || c)) {
            this._updateOneFaceTile(this.SCENE_DETECTION[i].VAL);
            // console.log('loading ' + this.SCENE_DETECTION[i].VAL);
            this.SCENE_DETECTION[i].ISHD = true;
        }
    }

    var topa = (this.SCENE_DETECTION_TOP_BOTTOM.top.ISHD == false) ? true : false;
    var topb = (Util.getAngleByRadin(coord.latitude) > this.SCENE_DETECTION_TOP_BOTTOM.top.RANGE ) ? true : false;
    if (topa && topb) {
        this._updateOneFaceTile(this.SCENE_DETECTION_TOP_BOTTOM.top.VAL);
        this.SCENE_DETECTION_TOP_BOTTOM.top.ISHD = true;
    }

    var bottoma = (this.SCENE_DETECTION_TOP_BOTTOM.bottom.ISHD == false) ? true : false;
    var bottomb = (Util.getAngleByRadin(coord.latitude) < this.SCENE_DETECTION_TOP_BOTTOM.bottom.RANGE ) ? true : false;
    if (bottoma && bottomb) {
        this._updateOneFaceTile(this.SCENE_DETECTION_TOP_BOTTOM.bottom.VAL);
        this.SCENE_DETECTION_TOP_BOTTOM.bottom.ISHD = true;
    }
}

//根据相机水平位置判断需加载图片
IShowPanorama.prototype.SCENE_DETECTION = {

    face1: {MIN: [0, 65], MAX: [295, 360], VAL: 4, ISHD: false},
    face2: {MIN: [25, 145], MAX: [25, 145], VAL: 1, ISHD: false},
    face3: {MIN: [105, 245], MAX: [105, 245], VAL: 2, ISHD: false},
    face4: {MIN: [205, 335], MAX: [205, 335], VAL: 3, ISHD: false}
}

//根据相机垂直位置判断需加载图片
IShowPanorama.prototype.SCENE_DETECTION_TOP_BOTTOM = {
    top: {VAL: 5, RANGE: 30, ISHD: false},
    bottom: {VAL: 6, RANGE: -6, ISHD: false}
}

IShowPanorama.prototype.SCENE_DETECTION_DEFAULT = {
    face1: {MIN: [0, 65], MAX: [295, 360], VAL: 4, ISHD: false},
    face2: {MIN: [25, 145], MAX: [25, 145], VAL: 1, ISHD: false},
    face3: {MIN: [105, 245], MAX: [105, 245], VAL: 2, ISHD: false},
    face4: {MIN: [205, 335], MAX: [205, 335], VAL: 3, ISHD: false}
}

//根据相机垂直位置判断需加载图片
IShowPanorama.prototype.SCENE_DETECTION_TOP_BOTTOM_DEFAULT = {
    top: {VAL: 5, RANGE: 30, ISHD: false},
    bottom: {VAL: 6, RANGE: -6, ISHD: false}
}

IShowPanorama.prototype._updateOneFaceTile = function (face) {
    var hd = PANO_SERVICE.PANORAMAHD
        .replace('{face}', face)
        .replace('{sid}', this.OPTIONS.stationID)
    // .replace('{city}', this.STATION.CityCode)
    // .replace('{dataType}', options.dataType)
    //合并图片

    var _this = this;
    var options = {
        position: [[0, 0], [512, 0], [0, 512], [512, 512]],
        data: [
            hd.replace('{row}', 0).replace('{col}', 0),
            hd.replace('{row}', 0).replace('{col}', 1),
            hd.replace('{row}', 1).replace('{col}', 0),
            hd.replace('{row}', 1).replace('{col}', 1)
        ],
        canvasWidth: 1024,
        canvasHeight: 1024,
        imgWidth: 512,
        imgHeight: 512,
        index: face,
        callback: BackMerge
    }

    function BackMerge(imageUrl, face) {
        switch (face) {
            case 4:
                _this.PANOURL.front = imageUrl;
                break;
            case 1:
                _this.PANOURL.right = imageUrl;
                break;
            case 2:
                _this.PANOURL.back = imageUrl;
                break;
            case 3:
                _this.PANOURL.left = imageUrl;
                break;
            case 5:
                _this.PANOURL.top = imageUrl;
                break;
            case 6:
                _this.PANOURL.bottom = imageUrl;
                break;
        }

        // 加载结束既重新绘制全景
        _this.PANO_VIEW.setPanorama(_this.PANOURL, false);
    }

    this._mergeImage(options);
}

// 根据 neme 删除 object3D
IShowPanorama.prototype.linksControl = function (boolean) {
    if (typeof boolean != 'boolean') {
        boolean = true;
    }
    if (boolean == true) {
        if (this._ARROW_GROUP)  this.PANO_VIEW.scene.add(this._ARROW_GROUP);
        this.OPTIONS.links_control = true;

    } else {
        this.PANO_VIEW.scene.remove(this._ARROW_GROUP);
        this.OPTIONS.links_control = false;
    }
}
// 获取摄像机坐标
IShowPanorama.prototype.getViewPosition = function () {
    if (!this.PANO_VIEW) {
        throw new Error('PANO_VIEW 缺失！');
    }
    return this.PANO_VIEW.getPosition();
}

// 摄像机漫游到一个视野坐标
IShowPanorama.prototype.setAnimateAngle = function (options, time) {
    if (!options) {
        throw new Error('options参数缺失！');
    }
    return this.PANO_VIEW.animate({
        longitude: Util.getRadinByAngle(options.longitude),
        latitude: Util.getRadinByAngle(options.latitude)
    }, time)
}

// 开启或关闭自动旋转摄像机
IShowPanorama.prototype.toggleAutoRotate = function () {
    if (!this.PANO_VIEW) {
        throw new Error('PANO_VIEW 缺失！');
    }
    this.PANO_VIEW.toggleAutorotate();
}

// 设置摄像机到一个视野坐标
IShowPanorama.prototype.setAngle = function (options) {
    if (!options) {
        throw new Error('参数缺失！');
    }
    this.PANO_VIEW.rotate({
        longitude: Util.getRadinByAngle(options.longitude),
        latitude: Util.getRadinByAngle(options.latitude)
    })
}

// 获取容器大小
IShowPanorama.prototype.getViewSize = function () {
    if (!this.PANO_VIEW) {
        throw new Error('PANO_VIEW 缺失！');
    }
    return this.PANO_VIEW.getSize();
}
// 设置是否全屏
IShowPanorama.prototype.toggleFullScreen = function () {
    if (!this.PANO_VIEW) {
        throw new Error('PANO_VIEW 缺失！');
    }
    this.PANO_VIEW.toggleFullscreen();
}

/**
 * 发送消息提醒
 * @param {string} content 文本信息
 * @param {number} timeout 延迟隐藏时间（毫米）
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.message = function (content, timeout) {

    if (!content) {
        throw new Error('content 缺失！');
    }
    timeout = timeout || 3000;
    this.PANO_VIEW.showNotification({content: content, timeout: timeout})
}

/**
 * 获取视野缩放等级
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.getZoom = function () {
    if (!this.PANO_VIEW) {
        throw new Error('PANO_VIEW 缺失！');
    }
    return this.PANO_VIEW.getZoomLevel();
}

/**
 * 设置视野缩放等级
 * @param {number} level
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.setZoom = function (level) {
    if (typeof level != 'number') {
        throw new Error('number 类型参数异常 ');
    }
    return this.PANO_VIEW.zoom(level);
}

/**
 * 设置导航控件是否显示
 * @param {boolean} true 显示，false 不显示
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.setNavigationControl = function (boolean) {
    if (typeof boolean != 'boolean') {
        throw new Error('boolean 类型参数异常');
    }
    this.OPTIONS.navigationControl = boolean;
}

/**
 * 设置导航控件是否显示
 * @param {boolean} true 显示，false 不显示
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.setConyrightControl = function (boolean) {
    if (typeof boolean != 'boolean') {
        throw new Error('boolean 类型参数异常');
    }
    if (boolean == true) {
        this._pluginCopyright();
    } else {
        this._removeElement('panorama_address_ui');
    }
    this.OPTIONS.copyright_control = boolean;
}

/**
 * 设置地址控件是否显示
 * @return {object} 添加的对象
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype._pluginCopyright = function () {
    this._removeElement('panorama_address_ui');

    var copyright = [];
    copyright.push("<img src='{url}' style='height: 25px;'>".replace('{url}', PANO_IMAGE.LOGO));
    // copyright.push("<div style=' background-image: url('{url}')'; left:0;width:25px></div>".replace('{url}', PANO_IMAGE.MENU));
    var address = (this.STATION.Address != "") ? this.STATION.Address : "未名路段";
    copyright.push("<div id='pano-copyright' style='background-color:#ffffff;padding: 2px 5px'><span>" + address + "</span> ");
    copyright.push("<span> | </span><span>GS(2018)4803</span></div>");

    var ele = {address: document.createElement('div'), div: document.getElementById(this.OPTIONS.container)};
    ele.address.style.cssText = ' position: absolute;right: 0px;bottom:0px;z-index: 1000;font-size:12px;color:#797979;text-shadow:1px .5px .5px #ffffff;opacity:.8;text-align:right';
    ele.address.id = 'panorama_address_ui';
    ele.address.innerHTML = copyright.join('')
    ele.div.appendChild(ele.address);
    return ele.address;
}


/**
 * 删除节点
 * @return {object} 添加的对象
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype._removeElement = function (id) {
    var ele = {
        address: document.getElementById(id),
        div: document.getElementById(this.OPTIONS.container)
    };
    if (ele.address)ele.div.removeChild(ele.address);

}


/**
 * 设置全屏控件是否显示
 * @param {boolean} true 显示，false 不显示
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.setFullScreenControl = function (boolean) {
    if (typeof boolean != 'boolean') {
        throw new Error('boolean 类型参数异常');
    }
    if (boolean == true) {
        this._pluginFullScreen();
    } else {
        this._removeElement('panorama_fullscreen_ui');
    }
    this.OPTIONS.fullscreen_control = boolean;
}

/**
 * 返回当前站点状态
 * @param {boolean} true 显示，false 不显示
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.getStationInfo = function () {
    return this.STATION;
}

/**
 * 设置全屏控件是否显示
 * @return {object} 添加的对象
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype._pluginFullScreen = function () {
    this._removeElement('panorama_fullscreen_ui');

    var ele = {full: document.createElement('div'), div: document.getElementById(this.OPTIONS.container)};
    ele.full.style.cssText = ' position: absolute;right: 0px;top:0;z-index: 1000;padding:2px 8px;opacity:.8;background-color:#ffffff;color:#363636';
    ele.full.id = 'panorama_fullscreen_ui';
    ele.full.innerHTML = "<img src={img} style='width: 12px'>".replace('{img}', PANO_SVG.FULLSCREEN_IN);
    var _this = this;
    ele.full.addEventListener('click', function () {
        _this.toggleFullScreen()
    })
    ele.div.appendChild(ele.full);
    return ele.address;
}

/**
 * 设置logo控件
 * @return {object} 添加的对象
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype._pluginLogo = function () {
    if (document.getElementById('panorama_logo_ui')) return;
    var ele = {full: document.createElement('div'), div: document.getElementById(this.OPTIONS.container)};
    ele.full.style.cssText = 'position: absolute;left:5px;bottom:0px;z-index: 1000;opacity:.8;'
    ele.full.innerHTML = '<img src="{url}" style="height: 25px">'.replace('{url}', PANO_IMAGE.LOGO);
    ele.full.id = 'panorama_logo_ui';
    ele.div.appendChild(ele.full);

}
/**
 * 设置导航控件是否显示
 * @return {object} 添加的对象
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype._pluginNavigation = function () {
    if (document.getElementById('panorama_nav_ui'))return;

    var nva = [];
    nva.push("    <div style='position:absolute;top:4px;left:4px;width:74px;height:74px;background:url(&quot;{nav}&quot;) no-repeat;-webkit-user-select:none;overflow:hidden'>");
    nva.push("    <div></div>");
    nva.push("    </div>");
    nva.push("    <svg version='1.1' overflow='hidden' width='82px' height='82px' viewBox='0 0 82 82'");
    nva.push("style='position: absolute; top: 0px; left: 0px;' >");
    nva.push("    <g transform='rotate(360, 41, 41)' id='nav_ui'>");
    nva.push("    <rect x='33' y='1' width='14' height='12' rx='4' ry='4' stroke='#868685' stroke-width='1'");
    nva.push("fill='#f8f8f8'></rect>");
    nva.push("    <polyline points='37.5,9.5 37.5,3.5 42.5,9.5 42.5,3.5' stroke-linejoin='bevel' stroke-width='1.5'");
    nva.push("fill='#f2f4f6' stroke='#868685'></polyline>");
    nva.push("    </g>");
    nva.push("    </svg>");
    nva.push("    <div style='position:absolute;top:0px;left:0;width:82px;height:82px;-webkit-user-select:none;cursor:url(&quot;{cur}&quot;) 8 8,default'>");
    nva.push("    <div style='position:absolute;left:32px;top:13px;cursor:pointer;width:17px;height:17px;' title='向上平移' id='view_change_up'></div>");
    nva.push("    <div style='position:absolute;left:14px;top:32px;cursor:pointer;width:17px;height:17px;' title='向左平移' id='view_change_left'></div>");
    nva.push("    <div style='position:absolute;left:51px;top:32px;cursor:pointer;width:17px;height:17px;' title='向右平移' id='view_change_right'></div>");
    nva.push("    <div style='position:absolute;left:33px;top:51px;cursor:pointer;width:17px;height:17px;' title='向下平移' id='view_change_down'></div>");
    nva.push("    </div>");
    nva.push("    <div style='position: absolute; top: 84px; left: 30px; width: 24px; height: 52px; background-image: url(&quot;{nav}&quot;); background-repeat: no-repeat; background-position: -73px 0px; user-select: none; overflow: hidden;'>");
    nva.push("    <div style='position:absolute;cursor:pointer;width:22px;height:24px;top:0;left:0;");
    nva.push("      -webkit-user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0)' title='放大一级' id='view_change_zoom'></div>");
    nva.push("    <div style='position: absolute; width: 22px; height: 24px; top: 25px; left: 0px; ");
    nva.push("      user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0);'title='缩小一级' id='view_change_narrow'></div>");
    nva.push("    <div></div>");
    nva.push("    </div>");


    var ele = {
        nav: document.createElement('div'),
        div: document.getElementById(this.OPTIONS.container)
    };

    ele.nav.style.cssText = 'position:absolute; left:10px; top: 10px; z-index: 1201;'
    ele.nav.innerHTML = nva.join('').replace('{nav}', PANO_IMAGE.NAV).replace('{cur}', PANO_IMAGE.OPENHEAD).replace('{nav}', PANO_IMAGE.NAV);
    ele.nav.id = 'panorama_nav_ui';
    if (ele.nav)ele.div.appendChild(ele.nav);

    var _this = this;

    var bar = {
        up: document.getElementById('view_change_up'),
        left: document.getElementById('view_change_left'),
        right: document.getElementById('view_change_right'),
        down: document.getElementById('view_change_down'),
        zoom: document.getElementById('view_change_zoom'),
        narrow: document.getElementById('view_change_narrow')
    }
    bar.left.addEventListener('click', function () {
        var x = Util.getAngleByRadin(_this.getViewPosition().longitude);
        var y = Util.getAngleByRadin(_this.getViewPosition().latitude);

        _this.setAnimateAngle({longitude: x - 30, latitude: y}, 1000)
    })
    bar.right.addEventListener('click', function () {
        var x = Util.getAngleByRadin(_this.getViewPosition().longitude);
        var y = Util.getAngleByRadin(_this.getViewPosition().latitude);

        _this.setAnimateAngle({longitude: x + 30, latitude: y}, 1000)
    })
    bar.up.addEventListener('click', function () {
        var x = Util.getAngleByRadin(_this.getViewPosition().longitude);
        var y = Util.getAngleByRadin(_this.getViewPosition().latitude);

        _this.setAnimateAngle({longitude: x, latitude: y + 10}, 1000)
    })
    bar.down.addEventListener('click', function () {
        var x = Util.getAngleByRadin(_this.getViewPosition().longitude);
        var y = Util.getAngleByRadin(_this.getViewPosition().latitude);

        _this.setAnimateAngle({longitude: x, latitude: y - 10}, 1000)
    })
    //0-100
    bar.zoom.addEventListener('click', function () {
        _this.setZoom(_this.getZoom() + 25);
        bar.narrow.parentNode.style.backgroundPosition = '-97px 0px';
    })
    bar.narrow.addEventListener('click', function () {
        _this.setZoom(_this.getZoom() - 25);
        bar.narrow.parentNode.style.backgroundPosition = '-121px 0px';
    })
    bar.zoom.addEventListener('mouseout', function () {
        bar.narrow.parentNode.style.backgroundPosition = '-73px 0px';
    })
    bar.narrow.addEventListener('mouseout', function () {
        bar.narrow.parentNode.style.backgroundPosition = '-73px 0px';
    })

}


/**
 * 事件注册
 * @param {string} eventName 事件名称
 * @param {function} callback 回调
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype._bind = function (name, event, useCapture) {
    if (!this.PANO_VIEW) {
        throw new Error('参数缺失！')
    }
    if (!this.PANO_VIEW.container) {
        throw new Error('参数container缺失！')
    }
    this.PANO_VIEW.container.addEventListener(name, event, useCapture);
}

/**
 * 事件注册
 * @param {string} eventName 事件名称
 * @param {function} callback 回调
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype._unbind = function (name, event, useCapture) {
    if (!this.PANO_VIEW) {
        throw new Error('参数缺失！')
    }
    if (!this.PANO_VIEW.container) {
        throw new Error('参数container缺失！')
    }
    this.PANO_VIEW.container.removeEventListener(name, event, useCapture);
}

/**
 * 事件注册
 * @param {string} eventName 事件名称
 * @param {function} callback 回调
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.on = function (name, event, useCapture) {
    if (!this.PANO_VIEW) {
        throw new Error('参数缺失！')
    }
    if (!this.PANO_VIEW.container) {
        throw new Error('参数container缺失！')
    }
    this.PANO_VIEW.on(name, event, useCapture);
}

/**
 * 事件注册
 * @param {string} eventName 事件名称
 * @param {function} callback 回调
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.off = function (name, event, useCapture) {
    if (!this.PANO_VIEW) {
        throw new Error('参数缺失！')
    }
    if (!this.PANO_VIEW.container) {
        throw new Error('参数container缺失！')
    }
    this.PANO_VIEW.off(name, event, useCapture);
}

/**
 * 事件注册
 * @param {string} eventName 事件名称
 * @param {function} callback 回调
 * @date 2020-12-11
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.once = function (name, event, useCapture) {
    if (!this.PANO_VIEW) {
        throw new Error('参数缺失！')
    }
    if (!this.PANO_VIEW.container) {
        throw new Error('参数container缺失！')
    }
    this.PANO_VIEW.once(name, event, useCapture);
}

/**
 * 根据坐标查询全景
 * @param options
 * @param options.content HTML内容
 * @param options.latitude 纬度
 * @param options.longitude 经度
 */
IShowPanorama.prototype.addMarker = function (opitons) {
    if (!opitons.content) {
        throw new Error('内容缺失');
    }
    if (!opitons.longitude || !opitons.latitude) {
        throw new Error('坐标缺失');
    }

    this.PANO_VIEW.addMarker({
        id: Util.getRandom('#marker'),
        longitude: opitons.longitude,
        latitude: opitons.latitude,
        image: opitons.content || PANO_IMAGE.PIN_RAD,
        width: 32,
        height: 32,
        //html: opitons.content,//'HTML <b>marker</b> &hearts;',
        anchor: 'bottom center',
        //  scale: [0.5, 1.5],
        style: {
            maxWidth: '100px',
            color: 'white',
            fontSize: '20px',
            fontFamily: 'Helvetica, sans-serif',
            textAlign: 'center'
        },
        tooltip: {
            content: opitons.poptext || '这是一个检测标记',
            position: 'top'
        }
    });
}


/**
 * 根据坐标查询全景
 * @param options
 * @param options.lng 经度
 * @param options.lat 纬度
 */
IShowPanorama.prototype.getPanoByCoord = function (options) {
    var url = PANO_SERVICE.PANO_COOORD_SEARCH
        .replace('{range}', 100)
        .replace('{lnglat}', options.lng + ',' + options.lat);

    var _this = this;

    Util.sendJSONP({
        url: url, callback: function (data) {
            // console.log(data)
            if (data.StationID) {
                _this.OPTIONS.stationID = data.StationID;
                _this.STATION = data;
                // _this.init(_this.OPTIONS);
                _this.loadPanoByID();
            }
        }
    })
}


/**
 * 发送jsonp请求
 * @param {object} options
 * @param {string} options.url 请求地址
 * @param {function} options.callback 回调方法
 * @date  2020-12-11
 * @author  luwenjun@leader.com.cn
 */
Util.sendJSONP = function (options) {
    var funcName = Util.getRandom('jsonp');
    var script = document.createElement('script');
    script.src = options.url.replace('{callback}', funcName)
    window[funcName] = function (data) {
        options.callback(data);
    }
    document.head.appendChild(script)
    document.head.removeChild(script)
}

/**
 * 发送jsonp请求
 * @param {object} options
 * @param {string} options.url 请求地址
 * @param {function} options.callback 回调方法
 * @return {object} name：方位 ，value：画布
 * @author  luwenjun@leader.com.cn
 */
function getCanvas(text) {
    var canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.crossOrigin = 'Anonymous'; //解决跨域
    img.src = PANO_IMAGE.ARROW_TXTURE_OUT;
    img.onload = function () {
        ctx.drawImage(img, 0, 0, 100, 100);
        ctx.save();
        //ctx.fillStyle = '#635D5C';
        ctx.fillStyle = '#363636';
        ctx.font = 'Bold 28px \'字体\',\'字体\',\'微软雅黑\',\'宋体\'';
        if (text.length > 1) {
            ctx.fillText(text.split('')[0], 35, 50);
            ctx.fillText(text.split('')[1], 35, 85);
        } else {
            ctx.fillText(text.split('')[0], 35, 70);
        }
        ctx.textBaseline = 'middle';//更改字号后，必须重置对齐方式，否则居中错乱。设置文本的垂直对齐方式
        ctx.textAlign = 'center';
    }
    return {name: text, value: canvas};
}


/**
 * 发送jsonp请求
 * @param {object} options
 * @param {string} options.url 请求地址
 * @param {function} options.callback 回调方法
 * @return {object} name：方位 ，value：画布
 * @author  luwenjun@leader.com.cn
 */
function getCanvass(text) {
    var canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    var ctx = canvas.getContext('2d');
    var img = new Image;
    ctx.drawImage(img, 0, 0, 50, 50);
    ctx.save();
    //ctx.fillStyle = '#635D5C';
    ctx.fillStyle = '#363636';
    ctx.font = 'Bold 28px \'字体\',\'字体\',\'微软雅黑\',\'宋体\'';
    if (text.length > 1) {
        ctx.fillText(text.split('')[0], 35, 50);
        ctx.fillText(text.split('')[1], 35, 85);
    } else {
        ctx.fillText(text.split('')[0], 35, 70);
    }
    ctx.textBaseline = 'middle';//更改字号后，必须重置对齐方式，否则居中错乱。设置文本的垂直对齐方式
    ctx.textAlign = 'center';

    return {name: text, value: canvas};
}

/**
 *创建dom标签
 *
 * @param {object} options
 * @param {string} options.name 标签 div span p
 * @param {string} options.css css样式
 * @param {string} options.html 需要注入的InnerHTML
 * @return {object} dom标签对象
 * @date 2020-12-18
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.addElement = function (options) {
    var ele = document.createElement(options.name);
    ele.style = options.css;
    ele.innerHTML = options.html;
    ele.id = Util.getRandom(options.name);
    (document.body || document.html).appendChild(ele);
    return ele
}

/**
 *更新dom标签
 *
 * @param {object} options
 * @param {string} options.name 标签 div span p
 * @param {string} options.css css样式
 * @param {string} options.html 需要注入的InnerHTML
 * @return {object} dom标签对象
 * @date 2020-12-18
 * @author luwenjun@leader.com.cn
 */
IShowPanorama.prototype.updateElement = function (options) {
    if (options.css)options.ele.style = options.css;
    if (options.html)options.ele.innerHTML = options.html;
    return options.ele
}


/**
 *根据方位角返回方位
 *
 * @param {number} direction 方位角
 * @return  {string} 方向描述
 * @date  2020-12-11
 * @author  luwenjun@leader.com.cn
 */
IShowPanorama.prototype.getDirectionByAngle = function (direction) {
    var dir = Math.abs(direction) % 360, back = {};
    if (dir >= 22.5 && dir < 67.5) back = ARROW_TEXT.东北;
    else if (dir >= 67.5 && dir < 112.5) back = ARROW_TEXT.东;
    else if (dir >= 112.5 && dir < 157.5) back = ARROW_TEXT.东南;
    else if (dir >= 157.5 && dir < 202.5) back = ARROW_TEXT.南;
    else if (dir >= 202.5 && dir < 247.5) back = ARROW_TEXT.西南;
    else if (dir >= 247.5 && dir < 292.5) back = ARROW_TEXT.西;
    else if (dir >= 292.5 && dir < 337.5) back = ARROW_TEXT.西北;
    else back = ARROW_TEXT.北;
    return back;
}

