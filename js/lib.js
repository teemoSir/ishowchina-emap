
window.leador_server_ipprot = "http://172.192.100.39:25001"
window.leador_server_ak = "1e706fc68d966cd554c63a8e800e0daf"

function isNotNull(data) {
    return data != null && data != "" && data != undefined;
}
//var disTool;
function MapView(MAPDIV, $) {
    var ldmap, time;
    var monkey = null; //小猴子
    var distanceTool = null;
    var neturls = MAP_CONFIG.MAP_NET_URLS;
    var massurls = MAP_CONFIG.MAP_MASS_URLS;
    var tmcurls = MAP_CONFIG.MAP_TMC_URLS;

    var netlayer = null;
    var tmclayer = null;
    var hotspotlayer = null;
    this.hotMarker = null;
    // 右键菜单
    var contextMenu = null;
    this.contextMenuWrap = null;
    this.$contextMenu = null;
    this.contextMenuData = {
        callbacks: {}
    };
    var settings = {
        limitBounds: new LD.LngLatBounds(new LD["LngLat"](-90, -83), new LD["LngLat"](270, 83)),
        //		limitBounds:[new LD["LngLat"](-175, -83), new LD["LngLat"](190, 83)],
        lon: 116.614586,
        lat: 39.822436,
        zoom: 10,
        minZoom: 4,
        maxZoom: 18,
        keyboard: true,
        isNeedPlug: false,
        click: null,
        rclick: null,
        move: null,
        zoomchange: null,
        panend: null,
        hotspotclick: null,
        mousedown: null,
        /*
         icon:{
         icon:"../imap_jw/images/icon_panorama.gif",
         width:25,
         height:25,
         extention:{
         size:new LD.Size(25, 25),
         pixel:new LD.Pixel(0, 0)
         }
         }
         */
    };

    function setMapEvent() {
        ldmap.addEventListener("click", function (point) {
            var targetMap = window.map || point.target;
            targetMap.setCenter(point.lnglat);
        });
    }

    //创建和初始化地图函数：
    //可在该函数中添加其他初始化方法便于扩展
    this.init = function (options) {
        settings = $.extend(settings, options); //用mapOptions对象覆盖defaultMapOpt对象的属性值
        var mapOpt = new LD.MapOptions();
        mapOpt.zoom = settings.zoom;
        mapOpt.hotspot = false;
        mapOpt.vector = false;
        mapOpt.minZoom = settings.minZoom;
        mapOpt.maxZoom = settings.maxZoom;
        mapOpt.keyboard = settings.keyboard;
        //		mapOpt.limitBounds = settings.limitBounds;
        mapOpt.center = new LD.LngLat(settings.lon, settings.lat);
        //
        if (MAP_CONFIG.USE_OLD_MAP) {
            //			LD.MapConfig._MAP_PCBGIMG_URL = ["http://{s}.ishowchina.com/v3/tile/{z}/{x}/{y}.png?s=merge",["tile1","tile2","tile3"]];
            LD.MapConfig._MAP_PCBGIMG_URL = ["http://{s}.ishowchina.com/v3/tile/{z}/{x}/{y}.png", ["tile1", "tile2", "tile3"]];
            mapOpt.hotspot = false;
        }
        ldmap = new LD.Map(MAPDIV, mapOpt);
        ldmap.setLimitBounds(settings.limitBounds);
        initStyleAfterMapInit();
        //ldmap.removeControl(ldmap.getCopyrightControl());
        //添加..
        ///丁---//开始//
        //
        if (!MAP_CONFIG.USE_OLD_MAP) {
            ldmap.addHotspotEventListener(LD.Constants.CLICK, addHotspotEvent);
        }

        // setMapEvent();//设置地图事件
        if (settings.isNeedPlug)
            this.addPlugins(); // 向地图添加控件
        //地图鼠标点击和移动事件
        if (settings.click) {
            ldmap.addEventListener(LD.Constants.MOUSE_UP, settings.click); //
        }
        if (settings.move) {
            ldmap.addEventListener(LD.Constants.MOUSE_MOVE, settings.move);
        }
        if (settings.rclick) {
            ldmap.addEventListener(LD.Constants.MOUSE_CONTEXTMENU, settings.rclick);
        }
        if (settings.zoomchange) {
            ldmap.addEventListener(LD.Constants.ZOOM_END, settings.zoomchange);
        }
        if (settings.panend) {
            ldmap.addEventListener(LD.Constants.MOVE_END, settings.panend);
        }
        if (settings.mousedown) {
            ldmap.addEventListener(LD.Constants.MOUSE_DOWN, settings.mousedown);
        }

        var crtInfo = MAP_CONFIG.MAP_COPYRIGHT;
        if (crtInfo != null && typeof crtInfo === "string") {
            var crc = null;
            if (ldmap.getCopyrightControl || ldmap.getCopyrightControl() == null) {
                // 版权
                crc = ldmap.getCopyrightControl();
            } else {
                crc = new LD.CopyrightControl();
                ldmap.addControl(crc);
            }
            var offset = new LD.Pixel(2, -2);
            crc.setAnchor(LD.Constants.LEFT_BOTTOM);
            crc.setOffset(offset);
            crc.removeCopyright("ld_copyright");

            var crcInfo = {
                id: "ld_copyright"
            };
            crcInfo.content = crtInfo;
            crc.addCopyright(crcInfo);
        }

        this.addContextMenu();
        return ldmap;
    }
    /* TODO 20160616 换成自定义菜单
     this.addContextMenu = function() {
     if (contextMenu == null) {
     contextMenu = initContextMenu_BAK();
     ldmap.addContextMenu(contextMenu);
     }
     }
     this.removeContextMenu = function() {
     if (contextMenu != null) {
     ldmap.removeContextMenu(contextMenu);
     contextMenu = null;
     }
     }
     */
    this.addContextMenu = function () {
        var $menu = this.$contextMenu;
        if ($menu == null) {
            $menu = initContextMenu();
            $menu = $menu.clone(true);
            this.$contextMenu = $menu;
            //			_self.$contextMenu = $menu;
            //			this.$contextMenu = $menu;

            ldmap.addEventListener(LD.Constants.MOUSE_CONTEXTMENU, function (e) {
                var lonlat = e.lnglat;
                if (mapView.contextMenuWrap) {
                    mapView.removeOverlay(mapView.contextMenuWrap);
                    mapView.contextMenuWrap = null;
                }
                mapView.hideContextMenu();
                if (!mapView.$contextMenu) {
                    return;
                }
                checkAndShowContextMenu(lonlat, mapView.$contextMenu);
            });

            ldmap.addEventListener(LD.Constants.MOUSE_DOWN, function () {
                mapView.hideContextMenu();
            });
        }
    }
    this.removeContextMenu = function () {
        if (mapView.$contextMenu != null) {
            // 会导致地图卡死无反应（只能移动，不能进行缩放等其他操作+不会触发事件和取底图）
            //			ldmap.removeEventListener(LD.Constants.MOUSE_CONTEXTMENU);
            mapView.$contextMenu = null;
        }
    }
    this.hideContextMenu = function () {
        if (mapView.contextMenuWrap != null) {
            mapView.removeOverlay(mapView.contextMenuWrap);
            mapView.contextMenuWrap = null;
        }
    }
    this.resizeMap = function () {
        ldmap.autoResize();
    }
    this.addNetworkLayer = function () {
        netlayer = new LD.TileLayer({
            maxZoom: 18,
            minZoom: 1,
            tileSize: 256,
        });
        netlayer.setName("layer2");
        netlayer.setTileUrlFunc(function (x, y, z) { //自定义取图规则                         TileRow=1139&TileCol=6746
            //			var index=parseInt(Math.random()*10)%3;
//			debugger
            var index = parseInt(Math.random() * 10) % neturls.length;
            var neturl = neturls[index];
            neturl = neturl.replace("{z}", z);
            neturl = neturl.replace("{x}", x);
            neturl = neturl.replace("{y}", y);

            //			return neturl + (z) +"/"+x+"/"+(Math.pow(2, z)-y-1)+".png";//nginx取图方式
            return neturl; //nginx取图方式
        });

        ldmap.addLayer(netlayer);
        if (tmclayer) {
            ldmap.removeLayer(tmclayer);
            tmclayer = null;
        }
//		if(time){
//			clearInterval(time);
//		}

    }
    this.removeNetworkLayer = function () {
        if (netlayer) {
            ldmap.removeLayer(netlayer);
            netlayer = null;
        }
    }
    //TMC服务：
    this.addTMCLayer = function () {
        tmclayer = new LD.TileLayer({
            maxZoom: 18,
            minZoom: 1,
            tileSize: 256,
        });
        tmclayer.setName("layer2");
        tmclayer.setTileUrlFunc(function (x, y, z) { //自定义取图规则                         TileRow=1139&TileCol=6746
            //			var index=parseInt(Math.random()*10)%3;
            var index = parseInt(Math.random() * 10) % tmcurls.length;
            var tmcurl = tmcurls[index];
            tmcurl = tmcurl.replace("{z}", z);
            tmcurl = tmcurl.replace("{x}", x);
            tmcurl = tmcurl.replace("{y}", y);
            // tmcurl = tmcurl + "&t="

            //			return neturl + (z) +"/"+x+"/"+(Math.pow(2, z)-y-1)+".png";//nginx取图方式
            return tmcurl; //nginx取图方式
        });

        ldmap.addLayer(tmclayer);
        if (netlayer) {
            ldmap.removeLayer(netlayer);
            netlayer = null;
        }
//		time = setInterval(function(){
//			ldmap.addLayer(tmclayer);
//		},5*60*1000);

    }
    this.removeTMCLayer = function () {

        if (tmclayer) {
            ldmap.removeLayer(tmclayer);
            tmclayer = null;
        }
    }
    /**
     * @param cls 类型
     */
    this.addHotSpotLayer = function (cls) {
        if (hotspotlayer == null) {
            //加麻点图
            var url = MAP_CONFIG.MAP_MASS_TEMPLETE_URL + "/" + cls + "/";
            var tileLayerOptions = new LD.LayerOptions();
            tileLayerOptions.hotspotOptions = {
                template: new searchHotspotTemplate(map, url),
                type: LD["Constants"]["LAYER_HOTSPOT_ICON_TYPE"],
                iconUrl: "../imap_jw/images/layericon.png"
            }
            hotspotlayer = new LD["TileLayer"](tileLayerOptions);
            hotspotlayer.setName("layer2");
            hotspotlayer.setOpacity(1);
            hotspotlayer.setTileUrlFunc(function (x, y, z) {
                //				var index=parseInt(Math.random()*10)%3;
                var index = parseInt(Math.random() * 10) % massurls.length;
                var massurl = massurls[index] + cls + "/";
                massurl = massurl.replace("{z}", z);
                massurl = massurl.replace("{x}", x);
                massurl = massurl.replace("{y}", y);
                //				return url + (z) +"/"+x+"/"+y+".png";//nginx取图方式
                return massurl; //nginx取图方式
            });
            ldmap.addLayer(hotspotlayer);
            if (settings.hotspotclick) {
                hotspotlayer.addHotspotEventListener(LD["Constants"]["CLICK"], settings.hotspotclick);
            }

        }

    }
    this.removeHotspotLayer = function () {
        if (hotspotlayer) {
            ldmap.removeLayer(hotspotlayer);
        }
        hotspotlayer = null;
    }
    this.addPlugins = function () { //地图控件添加函数：

        var navi = new LD.NavigationControl({
            anchor: LD.Constants.RIGHT_BOTTOM,
            offset: new LD.Pixel(-40, -20)
        });
        navi.setType(LD.Constants.CONTROL_NAVIGATION_ZOOMBAR);
        ldmap.addControl(navi);

        var scale = new LD.ScaleControl({
            offset: new LD.Pixel(10, -25)
        });
        ldmap.addControl(scale);

        if (LD.DistanceTool == null) {
            // 加载插件
            this.plugin("LD.Tool", function () {
                createTool();
            });
        } else {
            createTool();
        }

        function createTool() {
            distanceTool = new LD.DistanceTool(); //添加地图测距工具
            distanceTool.addEventListener(LD.Constants.DELETE_END, function (e) {
                $(".map_tool .measurement").parent().removeClass("active"); //删除测距线时，可重新点
            });
            distanceTool.addEventListener(LD.Constants.ADD_OVERLAY, function (e) {
                $(".map_tool .measurement").parent().removeClass("active"); //完成时，测距按钮可重新点
            });
            ldmap.addTool(distanceTool);
        }
    }
    this.setBounds = function (bounds) {
        ldmap.setBounds(bounds);
    }
    this.addPolyline = function (path, config) {
        var opts = new LD.PolylineOptions();
        $.extend(opts, config);
        var polyline = new LD.Polyline(path, opts);

        ldmap.getOverlayLayer().addOverlay(polyline, opts.bestmap == null ? false : opts.bestmap);
        //		var id=polyline.getId();
        return polyline;
    }
    /**
     * @param {[LD.LonLat...]} path
     */
    this.addPolygon = function (path, config) {
        var opts = new LD.PolygonOptions();
        $.extend(opts, config);
        var polygon = new LD.Polygon(path, opts);

        ldmap.getOverlayLayer().addOverlay(polygon, opts.bestmap == null ? false : opts.bestmap);
        return polygon;
    }
    this.getOverlayById = function (id) {
        return ldmap.getOverlayLayer().getOverlayById(id);
    }
    this.addMarker = function (markerConfig) {
        if (!markerConfig.offsetX) {
            markerConfig.offsetX = 0;
        }
        if (!markerConfig.offsetY) {
            markerConfig.offsetY = 0;
        }
        var mo = new LD.MarkerOptions();
        mo.editabled = markerConfig.editable;
        mo.icon = new LD.Icon(markerConfig.icon, new LD.Size(markerConfig.iconWidth, markerConfig.iconHeight), new LD.Pixel(markerConfig.offsetX, markerConfig.offsetY)); // var lng
        // =116.416626;
        var lng = markerConfig.lon;
        var lat = markerConfig.lat;
        var iconMarker = new LD.Marker(new LD.LngLat(lng, lat), mo);

        $.extend(iconMarker, markerConfig);

        if (markerConfig.click) {
            iconMarker.addEventListener(LD.Constants["CLICK"], markerConfig.click, iconMarker);
        }

        ldmap.getOverlayLayer().addOverlay(iconMarker, markerConfig.bestmap ? true : false);
        return iconMarker;
    }
    this.getBounds = function () {
        return ldmap.getBounds();
    }
    this.setBestMap = function (lnglats) {
        //:Array<LngLat>
        ldmap.setBestMap(lnglats, [400, 20, 20, 20]);
    }
    this.openDistanceTool = function () {
        if (!distanceTool) {
            return;
        }
        distanceTool.title = "双击结束测距";
        distanceTool.open();
    }
    //关闭
    this.closeDistanceTool = function () {
        if (!distanceTool) {
            return;
        }
        distanceTool.close();
    }
    this.clearDistaceLine = function () {
        if (!distanceTool) {
            return;
        }
        distanceTool.clear();
    }

    /**
     * 设置二维图中心点
     */
    this.panTo = function (x, y) {
        var lonlat = null;
        if (x instanceof LD.LngLat && y == null) {
            lonlat = x;
        } else {
            lonlat = new LD.LngLat(x, y);
        }
        ldmap.panTo(lonlat);
    }
    /**
     * 偏移指定像素
     */
    this.panBy = function (x, y) {
        ldmap.panBy(x || 0, y || 0);
    }
    /**
     * 加载插件：字符串、数组形式指定插件名
     */
    this.plugin = function (target, callback) {
        var mds = [];
        if (target == null) {
            return;
        } else if (typeof target === "string") {
            mds.push(target)
        }
        ldmap.plugin(mds, callback);
    }
    this.setCenter = function (x, y, zoom) {
        var lonlat = null;
        if (x instanceof LD.LngLat && y == null) {
            lonlat = x;
        } else {
            lonlat = new LD.LngLat(x, y);
        }
        ldmap.setCenter(lonlat, zoom);
    }
    this.getMap = function () {
        return ldmap;
    }
    this.getCenter = function () {
        return ldmap.getCenter();
    }
    // TODO 换成自定义菜单
    /*
     this.getContextMenu = function() {
     return contextMenu;
     }
     */
    /**
     * 根据 LD.LngLat 类型的数组，设置地图的显示范围
     */
    this.setBestMap = function (lnglats) {
        ldmap.setBestMap(lnglats);
    }
    /**
     * 清理所有测距线
     */
    //	this.clearAllDistanceLine=function(){
    //		distanceTool.clear();
    //	}
    /**
     * array为null 清理所有标记点，否则清理array中的标记点
     */
    this.clearOverlays = function (array) {
        //		this.monkey=null;
        //		this.removeMonkey();
        //		this.removeNetworkLayer();
        //		this.removeHotspotLayer();
        if (array != null) {
            ldmap.getOverlayLayer().clear(array);
        } else {
            ldmap.getOverlayLayer().clear();
        }
    }
    this.getAllOverlays = function () {
        return ldmap.getOverlayLayer().getOverlays();
    }
    this.addOverlay = function (overlay, best) {
        if (best) {
            ldmap.getOverlayLayer().addOverlay(overlay, true);
        } else {
            ldmap.getOverlayLayer().addOverlay(overlay);
        }
    }
    this.removeOverlay = function (overlay) {
        ldmap.getOverlayLayer().removeOverlay(overlay);
    }
    this.setZoom = function (value) {
        ldmap.setZoom(value);
    }
    this.autoResize = function () {
        ldmap.autoResize();
    }
    this.zoomIn = function () {
        ldmap.zoomIn(); //放大
    }
    this.zoomOut = function () {
        ldmap.zoomOut(); //缩小
    }
    this.getZoom = function () {
        return ldmap.getZoom();
    }
    this.setIcon = function (marker, icon, width, height) {
        marker.setIcon(new LD.Icon(icon, new LD.Size(width, height)));
    }

    //连续全景拖小猴子
    this.addMonkey = function (lnglat) {
        var center = lnglat || ldmap.getCenter();
        if (monkey == null) {
            var mo = new LD.MarkerOptions();
            mo.editabled = true;
            mo.offset = new LD.Pixel(0, 34);
            mo.icon = new LD.Icon("../imap_jw/images/monkey.png", new LD.Size(89, 68), new LD.Pixel(0, 0));
            var origin = {
                lng: 0,
                lat: 0
            };
            monkey = new LD.Marker(origin, mo);
            /*  drag end后也会触发mouse up事件
             monkey.addEventListener(LD.Constants.DRAG_END, function(pos) {
             var x = pos.lnglat.lng;
             var y = pos.lnglat.lat;
             checkStationExsit(x, y, true);
             }, monkey);
             */
            //松手后尝试进入全景
            monkey.addEventListener(LD.Constants.MOUSE_UP, function (pos) {
                var x = pos.lnglat.lng;
                var y = pos.lnglat.lat;
                checkStationExsit(x, y, true);
            }, monkey);

            ldmap.getOverlayLayer().addOverlay(monkey, false);
            this.monkey = monkey;
        } else {
            monkey.setPosition(center);
        }
    }

    this.removeMonkey = function () {
        if (monkey) {
            ldmap.getOverlayLayer().removeOverlay(monkey);
            monkey = null;
        }
    }

    //创建label
    this.createLabel = function (labelTxt, x, y) {
        var label = new LD.Label(labelTxt, {
            "position": new LD.LngLat(x, y),
            "anchor": LD.Constants.TOP_CENTER,
            "type": LD.Constants.OVERLAY_LABEL_HTML
        });
        ldmap.getOverlayLayer().addOverlay(label);

        return label;
    }
    //删除文本标签
    this.removeLabels = function (labels) {
        labels && ldmap.getOverlayLayer().clear(labels);
    }
}
//================初始化变量================

var MAP_STYLE = null;


// 执行搜索 搜索按钮的功能实现
function doSearch() {
    //	console.log($("#smartTip"))
    $("#smartTip").hide(); //
    var word = $("#searchWord").val(); //获取输入框的信息
    //取消输入字符串的前后空格
    if ($.trim(word) == "") {
        return false;
    }
    $(".search_box .search_close").show();
    //初始化全局变量的searchPage的属性
    searchPage.word = $.trim(word);
    /*关键字搜索的输入文字*/
    searchPage.page = 1;
    /*当前页码*/
    searchPage.count = 0;
    /*总记录数*/
    searchPage.op = "word";
    /*搜索类型:word-关键字(城市范围) wordcountry关键字(全国范围)，category-类型(城市范围)，-nearbytype周边类型，-nearbyword周边关键词，-regiontype范围内类型，-regionword范围内关键词*/
    sendWordSearchRequest(true); //向后台发送关键字搜索请求

    // 历史记录
    addTotalSearchRecord({
        title: searchPage.word
    }); //linePage.js
    //收藏点不显示
    //isCollectMakerShow(false); //user.js

}

/**
 * 获取历史记录前缀
 * @params target，获取综合搜索(search)的前缀还是线路搜索(line)的前缀，默认为line
 * @returns {String}
 */
function getSearchRecordPrefix(target) {
    target = target == null ? "line" : target;
    // 按不同的搜索方式，添加不同记录前缀
    //	var lineType = checkLineType();
    var panelType = $(".all_panel").attr("data-current");
    var prefix = "";

    if (target == "search") {
        prefix = "total_";
    } else {
        prefix = "line_"
    }

    prefix = "search_" + prefix;
    return prefix;
}

var recordNum = 5;


/**
 * 获取c_name cookie的值
 * @param c_name key
 * @returns
 */
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                // 当前cookie是末尾，则没有“;”
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}


//==============================cookie相关
//20150910
/**
 * 设置cookie
 * @param c_name
 * @param value
 * @param expiredays 有效天数(0为及时性，-1删除)
 */
function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + 1 + expiredays);

    var valueStr = "";

    if (typeof value == "string") {
        valueStr = value;
    } else if (value instanceof Object) {
        valueStr = JSON.stringify(value);
    }
    var cookieStr = c_name + "=" + escape(valueStr) +
        ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());

    document.cookie = cookieStr;
}


/**
 * 显示顶部搜索历史记录
 */
function showTotalSearchRecordPage() {
    var $recordPage = $(".home_panel .search_record");
    $recordPage.show();
    var prefix = getSearchRecordPrefix("search");

    var $recordUl = $recordPage.children(".record_list");
    $recordUl.empty();

    var recordDetails = [];

    for (var i = 0; i <= recordNum - 1; i++) {
        var record = getCookie(prefix + i);

        if (record == "") {
            // 一个记录也没有，则隐藏
            if (i == 0) {
                $recordPage.hide();
            }
            break;
        }

        record = eval("(" + record + ")");

        // 起点;坐标;begin|end|jing ...
        var recordDetail = "";
        var beginDetail = record.begin.title + " ; begin";
        recordDetail += beginDetail;
        var liTitle = record.begin.title;

        // liTitle = liTitle.replace(new RegExp("'",'g'), "\\'");
        //recordDetail = recordDetail.replace(new RegExp("'",'g'), "\\'");
        //		var content = splitExcessLength(liTitle, 20, " ...");
        var content = liTitle;
        var liHtml = "" +
            "<li title=\"" + liTitle + "\" " +
            " qid='" + record.qid + "'" +
            " search-mode='" + record.mode + "' " +
            " record-detail=\"" + recordDetail + "\" " +
            " data-index='" + i + "' >" +
            content +
            "<span class='remove_record'><img src='../imap_jw/images/leftpanel/search_close_sm.png'></span>" +
            "</li>";
        $recordUl.prepend(liHtml);
    }

}

//城市内搜索智能提示
//--- target为jquery选择器，提示框在目标输入框下显示
//--- panel为提示框的jquery选择器
//--- forLine 是否为线路搜索，影响searchSource，默认false
function onSearchKeyUp(e, target, panel, forLine) {
    forLine = !(!forLine);
    var $target = $(target);
    var evt = window.event || e;
    var key = evt.keyCode ? evt.keyCode : evt.which;
    if (key && key == 13) {
        // 回车键
        if (forLine) {
            searchLineByType();
        } else {
            doSearch();
        }
    } else if (key == 40) {
        chooseSearchItem(1, target, panel); // down键
    } else if (key == 38) {
        chooseSearchItem(-1, target, panel); // up键
    } else if (key == 27 || key == 9) {
        // ESC || TAB
        $(panel).hide();
    } else {
        seaCon.timeOut = setTimeout(function () {
            if (seaCon.timeOut) {
                clearTimeout(seaCon.timeOut);
                seaCon.timeOut = null;
            }
            if ($target.val() != "") {
                if (forLine) {
                    $(".panel_top .route_page .total2line_record").hide();
                } else {
                    $(".search_box .search_close").show();
                    changeLeftPanelStatus("home", -1);
                }
            } else {
                if (forLine) {
                    var $total2line = $(".panel_top .route_page .total2line_record");
                    if ($total2line.find(".record_list > li").length > 0) {
                        $total2line.show();
                    } else {
                        $total2line.hide();
                    }
                    changeLeftPanelStatus("suggest", -1);
                } else {
                    $(".search_box .search_close").hide();
                    changeLeftPanelStatus(null, -2);
                }
                return;
            }
            onSearchTip(target, panel, forLine); // 输入动作
        }, seaCon.delay);
    }
}

/**
 * 清空搜索记录
 * @param target line为删除线路的cookie，search为删除综合搜索的cookie
 * @param callback 回调函数，特殊处理，如showTotal2LineInput()，需要参数才能正常使用
 */
function cleanAllSearchRecord(target, callback) {
    target = target == null ? "line" : target;
    var prefix = getSearchRecordPrefix(target);

    for (var i = 0; i < recordNum; i++) {
        setCookie(prefix + i, "", -1);
    }

    // 刷新
    if (target === "search") {
        showTotalSearchRecordPage();
    } else {
        showLineSearchRecordPage();
        $(".all_panel .route_panel").hide();
    }
    alertContentOnTopSearch("删除成功");

    if (callback instanceof Function) {
        callback();
    }
}


/**
 * 添加顶部搜索的搜索记录
 * @param result {title: "xxx"}
 */
function addTotalSearchRecord(result) {
    var cookieDays = "PP_2_33"//MAP_CONFIG.RECORD_HOLDTIME;
    var prefix = getSearchRecordPrefix("search");

    if (!result || !isNotNull(result.title)) {
        return;
    }

    var jsonValue = {
        mode: "total_search",
        qid: currentCity.qid,
        begin: {}
    };

    jsonValue.begin.title = result.title;

    // -1为没有记录
    var nowIndex = -1;

    var isRepeat = checkCookieHasRepeat();
    if (isRepeat) {
        return;
    }

    function checkCookieHasRepeat() {
        var tmpJson = $.extend({}, jsonValue);
        delete tmpJson.qid;
        var jsonValueStr = JSON.stringify(tmpJson);
        // search_4为最新的记录
        for (var i = 0; i <= recordNum - 1; i++) {
            var cookieName = prefix + i;
            var cookie = getCookie(cookieName);
            if (cookie == "") {
                break;
            }
            nowIndex = i;

            //var cookie = getCookie(cookieName);
            cookie = eval("(" + cookie + ")");
            delete cookie.qid;
            var cookieStr = JSON.stringify(cookie);

            var isEqual = cookieStr === jsonValueStr;

            if (isEqual) {
                return true;
            }
        }

        return false;
    }

    // 已经有5条历史记录
    // 则删除最早记录，并且索引+1
    if (nowIndex == 4) {
        // search_4以前的cookie，索引减一
        for (var i = 1; i <= recordNum - 1; i++) {
            var newValue = getCookie(prefix + i);
            setCookie(prefix + (i - 1), newValue, cookieDays);
        }
        nowIndex--;
    }
    setCookie(prefix + (nowIndex + 1), jsonValue, cookieDays);
}


/**
 * 初始化地图图标变量
 */
function initStyleAfterMapInit() {
    var style = {};
    style.icon = {
        // 行政区、在附近搜等的中心点
        center: {
            icon: "../imap_jw/images/leftpanel/icon_route_center.png",
            iconWidth: 25,
            iconHeight: 25,
        },
        // 标记
        mark: {
            icon: "../imap_jw/images/search_03.png",
            iconWidth: 20,
            iconHeight: 33,
            offsetX: -225,
            offsetY: -420,
        },
        // 地图上收藏点
        collect: {
            icon: "../imap_jw/images/user/icon-star-fill-sm.png",
            iconWidth: 15,
            iconHeight: 15,
            offsetX: 0,
            offsetY: 0,
        },
        /*
         collect: {
         icon: "../imap_jw/images/search_03.png",
         iconWidth: 15,
         iconHeight: 15,
         offsetX: -159,
         offsetY: -499,
         },
         */
        // 1-10的图标
        // offsetX : index*-53-1, offsetY : -0,
        bubble: {
            icon: "../imap_jw/images/bubble_green.png",
            iconWidth: 19,
            iconHeight: 26,
            offsetX: -1,
            offsetY: -0,
        },
        childPoiBubble: {
            icon: "../imap_jw/images/bubble-childpoi.png",
            iconWidth: 22,
            iconHeight: 22,
            offsetX: -1,
            offsetY: 0,
        },
        // 起点
        start: {
            icon: "../imap_jw/images/leftpanel/icon_route_start.png",
            //			iconWidth : 20,
            //			iconHeight : 25,
            iconWidth: 24,
            iconHeight: 32,
        },
        smallStart: {
            icon: "../imap_jw/images/leftpanel/icon_route_start-0.png",
            iconWidth: 19,
            iconHeight: 25,
        },
        // 途经点
        through: {
            icon: "../imap_jw/images/leftpanel/icon_route_through.png",
            iconWidth: 24,
            iconHeight: 32,
        },
        smallThrough: {
            icon: "../imap_jw/images/leftpanel/icon_route_through-0.png",
            iconWidth: 19,
            iconHeight: 25,
        },
        smallThroughGray: {
            icon: "../imap_jw/images/leftpanel/icon_route_through-1.png",
            iconWidth: 19,
            iconHeight: 25,
        },
        // 终点
        end: {
            icon: "../imap_jw/images/leftpanel/icon_route_end.png",
            iconWidth: 24,
            iconHeight: 32,
        },
        smallEnd: {
            icon: "../imap_jw/images/leftpanel/icon_route_end-0.png",
            iconWidth: 19,
            iconHeight: 25,
        },
        // 每段线路上的小圆圈
        lineNode: {
            icon: "../imap_jw/images/search_03.png",
            iconWidth: 11,
            iconHeight: 11,
            offsetX: -232,
            offsetY: -388,
        },
        lineNodeBlue: {
            icon: "../imap_jw/images/leftpanel/icon_cricle_blue.png",
            iconWidth: 10,
            iconHeight: 10,
            offsetX: 0,
            offsetY: 0,
        },
        // 公交图标
        lineBus: {
            icon: "../imap_jw/images/leftpanel/route_line_bus.png",
            iconWidth: 25,
            iconHeight: 25,
        },
        // 汽车图标
        lineCar: {
            icon: "../imap_jw/images/leftpanel/route_line_car.png",
            iconWidth: 25,
            iconHeight: 25,
        },
        // 地铁图标
        lineSubway: {
            icon: "../imap_jw/images/leftpanel/route_line_subway.png",
            iconWidth: 25,
            iconHeight: 25,
        }
    };
    // 替换图标默认样式值
    var iconDefOpts = {
        iconWidth: 25,
        iconHeight: 25,
        offsetX: 0,
        offsetY: 0
    };
    for (var key in style.icon) {
        var opts = style.icon[key];
        var newOpts = $.extend({}, iconDefOpts, opts);
        style.icon[key] = newOpts;
    }
    // 线路部分的样式
    style.line = {
        blue: {
            strokeColor: "#0E89F5",
            strokeOpacity: "0.8",
            strokeWeight: "6",
            strokeStyle: LD.Constants.OVERLAY_LINE_SOLID
        },
        green: {
            strokeColor: "#67C395",
            strokeOpacity: "0.8",
            strokeWeight: "6",
            strokeStyle: LD.Constants.OVERLAY_LINE_SOLID
        },
        red: {
            strokeColor: "#FF0000",
            strokeOpacity: "0.8",
            strokeWeight: "6",
            strokeStyle: LD.Constants.OVERLAY_LINE_SOLID
        }
    };
    // 多边形的样式
    style.polygon = {
        // 行政区
        district: {
            fillOpacity: 0.01,
            strokeColor: "#0E89F5",
            strokeOpacity: "1",
            strokeWeight: "3",
            strokeStyle: LD.Constants.OVERLAY_LINE_DASHED
        },
        // POI所属区
        poiArea: {
            fillOpacity: 0.25,
            fillColor: "#0E89F5",
            strokeColor: "#0E89F5",
            strokeOpacity: "1",
            strokeWeight: "3",
            strokeStyle: LD.Constants.OVERLAY_LINE_DASHED
        }
    };

    MAP_STYLE = style;
}

//////////////////===============地图事件
function mapMouseMoveEvent(e) {
    if ($("#jiejingdoor").hasClass("active") && $("#jiejingdoor").attr("data-animate") == "true") {
        var evt = e || window.event;
        mapView.monkey.setPosition(evt.lnglat);
    } else if (mark && mark.animate) {
        var evt = e || window.event;
        mark.setPosition(evt.lnglat);
    }
}

function mapMouseCLickEvent(e) {
    mapView.hideContextMenu();

    $(".city_li").css('display', 'none');
    if (e) {
        $("#smartTip,#smartTipRegion,#smartTipSimple").hide();
        if ($("#jiejingdoor").hasClass("active") && $("#jiejingdoor").attr("data-animate") == "true") {
            $("#jiejingdoor").attr("data-animate", false);
            var evt = e || window.event;
            mapView.monkey.setPosition(evt.lnglat);
        } else if (mark && mark.animate) {
            mark.animate = false;
            $(".map_tool .mark").parent().removeClass("active");
            var evt = e || window.event;
            mark.setPosition(evt.lnglat);
            openMarkerEditWindow(mark);
        }
    } else {
        return;
    }
}

function mapMouseRightClickEvent(e) {
    var $markobj = $(".map_tool .mark").parent();
    if ($markobj.hasClass("active")) {
        $markobj.removeClass("active");
        mapView.removeOverlay(mark);
        mark = null
    }
    /* TODO 20160620 换成自定义菜单
     if (mapView.getContextMenu()) {
     checkContextMenuStatus();
     }
     */
}

function mapZoomChangeEvent(e) {
    // e.center=mapView.getCenter();
    // mapPanEndEvent(e);
}

function checkRgeoCityCode(data, pro, target) {
    if (pro && target && pro.length != target.length) {
        return false;
    }
    var adc = data.addressComponent;
    for (var i in pro) {
        var pcc = pro[i];
        adc.cityCode === pcc ? adc.cityCode = target[i] : adc.cityCode;
    }
    data.addressComponent.cityCode = adc.cityCode;
}

function mapPanEndEvent(e) {
    var zoomBase = 7;
    $(".city_li").css('display', 'none');
    if (e.center && mapView.getZoom() >= zoomBase) {
        $.ajax({
            url: MAP_CONFIG.SERV.SERV_RGEO_URL + "location=" + e.center.lng + "," + e.center.lat,
            async: true,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                $(".map_weather .weather").show(100);
                if (data && data.result && data.result.length > 0) {
                    var record = data.result[0];
                    var cinfo = record.addressComponent;
                    var citycode = cinfo.adCode;
                    /* TODO 20160620 换成自定义菜单
                     // adCode为""，则判断为国外
                     if (citycode == null || citycode == "") {
                     mapView.removeContextMenu();
                     return;
                     }
                     */
                    //					checkRgeoCityCode(record, ["0899", "1433"], ["0898", "0433"]);
                    //					citycode = record.addressComponent.cityCode;

                    var cname = cinfo.city;
                    if (cname == "") {
                        cname = cinfo.province;
                    }
                    if (cname != null && cname != "") {
                        $("#currentCity").text(cname);
                        //						$(".city_on span").text(cname);
                        currentCity.cityname = cname;
                        currentCity.sname = cname;
                        currentCity.lon = parseFloat(record.location.lng);
                        currentCity.lat = parseFloat(record.location.lat);
                        currentCity.telno = cinfo.cityCode;
//						currentCity.station = {};
                    }

                    citycode = cinfo.adCode;
                    // 目前我秀后台只有市级数据，故行政代码最后两位替换为00
                    citycode = citycode.substr(0, citycode.length - 2) + "00";
                    citycode = static_checkCitycode(citycode);
                    //如果与当前城市不同，切换
                    if (currentCity.qid != citycode) {
                        changeCity(citycode, "q", true, null, false);
                        //						changeCity(citycode,"t", true, null, false);
                    }
                }
            }
        });
    } else if (mapView.getZoom() < zoomBase) {
        //全国
        $("#currentCity").text("全国");
        $(".map_weather .weather").hide(100);
        currentCity.cityname = "全国";
        currentCity.sname = "全国";
        currentCity.lon = 116.3683244;
        currentCity.lat = 39.915085;
    }
}

function mapHotSpotClickEvent(evt, lnglat) {
    /*此处做点击后的二次查询展示大点弹出信息窗口操作*/
    if (mapView.hotMarker) {
        mapView.removeOverlay(mapView.hotMarker);
        mapView.hotMarker = null;
    }

    var opts = $.extend({
        editable: false,
        lon: lnglat.lng,
        lat: lnglat.lat
    }, MAP_STYLE.icon.center);
    mapView.hotMarker = mapView.addMarker(opts);

    var html = '<div class="infowindow" marker-id="' + mapView.hotMarker.getId() + '">' +
        '<div class="infopanel">' +
        '<div class="title">' + evt.title + '<a title="关闭" class="close" href="javascript:void(0)" onclick="closeInfoWindow();"> X </a></div>' +
        '<div class="content">' +
        '<div class="desc"><span>地址：</span><span>' + evt.adr + '</span></div>' +
        '<div class="desc"><span>电话：</span><span>' + evt.phone + '</span></div>' +
        '<div class="desc"><a href="javascript:void(0);" class="thumnail_link"></a></div>' +
        '</div>' + '<div class="tools">' + '<div class="other_tool">' + '<span class="shoucang" onclick="collectPointForMarker(this, \'' + mapView.hotMarker.getId() + '\')"><img src="../imap_jw/images/img_1.gif"></span>' + '</div>' + '<div class="search_tool">' + '<div class="tool_tab_2" title="搜周边" onclick="onNearbySearch();">搜周边</div>' + '<span style="position: absolute; right: 70px;">|</span>' + '<div class="tool_tab_2" title="查路线" onclick="onLineSearch(\'' + lnglat.lng + '\',\'' + lnglat.lat + '\',\'' + evt.title + '\');">查路线</div>' + '</div>' + '</div>' +
        '<div class="tool_contents">' +
        '<div class="tool_content">' +
        '<a onclick="onNearbyTypeSearch(\'餐厅\',\'' + mapView.hotMarker.getId() + '\')">美食</a><a onclick="onNearbyTypeSearch(\'酒店\',\'' + mapView.hotMarker.getId() + '\')">酒店</a><a onclick="onNearbyTypeSearch(\'景点\',\'' + mapView.hotMarker.getId() + '\')">景点</a><a onclick="onNearbyTypeSearch(\'电影院\',\'' + mapView.hotMarker.getId() + '\')">电影院</a>' +
        '<input class="keyword" type="text" data-tip="#smartTipSimple"  onkeyup="onSearchKeyUpSimple(event, \'.infowindow .keyword\',\'#smartTipSimple\');"/><span onclick="onNearbyWordSearch();" autocomplete="off" class="search"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';
    infoWindow = new LD.InfoWindow(html, {
        title: evt.title,
        position: lnglat,
        autoPan: true,
        offset: new LD.Pixel(54, -27),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });
    mapView.addOverlay(infoWindow);
}
//=======================================右键菜单部分
// --- kanhongyu
var nearbyMarker = null;
/**
 * TODO 20160617 换成自定义菜单
 * 检查右键菜单中菜单项的可用状态
 */
/*
 function checkContextMenuStatus() {
 var contextMenu = mapView.getContextMenu();
 // TODO 屏蔽途经点 20160229
 //--- 设置途经点是否可用
 var tjdItem = contextMenu.getItem(2);
 var isDrivingPage = checkLineType() == 2;
 // {iconUrl:"../imap_jw/images/icon_y_09.png", iconSize:[19,25]}
 // {iconUrl:LD.MapConfig.API_REALM_NAME+"../imap_jw/images/tpoi.png",iconSize:[14,14]}
 if (isDrivingPage) {
 var throughIcon = MAP_STYLE.icon.smallThrough;
 tjdItem.setContent("设置途经点", {
 iconUrl: throughIcon.icon,
 iconSize: [throughIcon.iconWidth, throughIcon.iconHeight]
 });
 } else {
 var throughIcon = MAP_STYLE.icon.smallThroughGray;
 tjdItem.setContent("设置途经点", {
 iconUrl: throughIcon.icon,
 iconSize: [throughIcon.iconWidth, throughIcon.iconHeight]
 });
 }
 tjdItem.enabled(isDrivingPage);
 //--- 清空线路是否可用
 var mapHasLine = polyLines.length > 0 && polyLines[0] != null;
 var cleanMapLines = contextMenu.getItem(6);
 cleanMapLines.enabled(mapHasLine);
 }
 */
function checkAndShowContextMenu(lonlat, $root) {
    var isDrivingPage = checkLineType() == 2;
    var $setThrough = $root.find(".set-through");
    var throughIcon = MAP_STYLE.icon.smallThrough;
    if (!isDrivingPage) {
        throughIcon = MAP_STYLE.icon.smallThroughGray;
        $setThrough.addClass("disabled");
    } else {
        $setThrough.removeClass("disabled");
    }
    $setThrough.find(".item-content").css("background-image", "url(" + throughIcon.icon + ")");
    var position = lonlat;
    mapView.contextMenuData.lonlat = lonlat;
    var location = position.lng + "," + position.lat;
    $.ajax({
        async: true,
        type: "GET",
        dataType: "jsonp",
        url: MAP_CONFIG.SERV.SERV_RGEO_URL + "location=" + location,
        success: function (data) {
            if (!data || !data.result || data.result.length == 0) {
                return;
            }
            // 右键点击到国外（没有citycode）不显示右键菜单
            var rsdata = data.result[0].addressComponent;
            if (!isNotNull(rsdata.cityCode)) {
                return;
            }
            //			$root.data("data-rego", data);
            mapView.contextMenuData.rego = data;

            var wrapHtml = "<div id=\"map-contextMenu-wrap\"></div>"
            var menuWrap = null;

            menuWrap = new LD.InfoWindow(wrapHtml, {
                position: position,
                //				autoPan: true,
                offset: new LD.Pixel(0, 0),
                type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM,
            });
            mapView.addOverlay(menuWrap);

            var $contentWrap = $("#map-contextMenu-wrap").html($root);
            var width = $contentWrap.width();
            var height = $contentWrap.height();
            $contentWrap.width(width).height(height).css("position", "absolute");
            var contentHtml = $("<div></div>").append($contentWrap).html();
            menuWrap.setContent(contentHtml);
            menuWrap.setSize(new LD.Size(width, height));
            menuWrap.setAnchor(LD.Constants.LEFT_TOP);

            menuWrap.autoPan(true, [{
                x: 20,
                y: 20
            }, {
                x: 200,
                y: 240
            }]);

            mapView.contextMenuWrap = menuWrap;
        }
    });
}

/**
 * 初始化右键菜单
 * @returns {LD.ContextMenu}
 */
function initContextMenu() {
    var startIcon = MAP_STYLE.icon.smallStart;
    var endIcon = MAP_STYLE.icon.smallEnd;
    var throughIcon = MAP_STYLE.icon.smallThrough;
    var maxWidth = Math.max.apply(Math, [startIcon.iconWidth, endIcon.iconWidth, throughIcon.iconWidth]);
    var defWidth = 25;
    var defHeight = 25;
    defWidth = defWidth < maxWidth ? maxWidth : defWidth;

    var $root = $("<div></div>").addClass("map-contextMenu");
    var $list = $("<ul></ul>").addClass("map-context-list");
    $root.append($list);
    var $itemHtml = $("<li class=\"map-context-item\"><span class=\"item-content\"></span></li>");

    var $item = initItem("设为起点", {
            iconUrl: startIcon.icon,
            iconSize: [defWidth, startIcon.iconHeight],
            // 通过attr指定callback的名字，否则不会触发回调
            callbackName: "set-start"
        },
        function (data, e) {
            if (!data || !data.result || data.result.length == 0) {
                return;
            }

            var isLinePage = checkLineType() > 0;
            if (!isLinePage) {
                gotoLeftLinePage();
            }

            var target = ".panel_top .route_search .route_start .route_input";
            var result = data.result[0];
            var title = result.formatted_address;

            if (title == null || title == "") {
                return;
            }

            var marker;

            if (lineMarkers[0] != null) {
                marker = lineMarkers[0];
                marker.setPosition(new LD.LngLat(e.lng, e.lat));
            } else {
                marker = addIconMarkerForContextMenu({
                    canOpen: false,
                    icon: startIcon.icon,
                    iconWidth: startIcon.iconWidth,
                    iconHeight: startIcon.iconHeight,
                    offsetX: startIcon.offsetX,
                    offsetY: startIcon.offsetY,
                    posX: e.lng,
                    posY: e.lat,
                    name: title
                });
                lineMarkers[0] = marker;
            }

            // 使用地图右键选择时的坐标
            var location = e.lng + "," + e.lat;
            setDataToLineInputAttribute(target, {
                title: title,
                dataLocation: location
            });
            checkLineDataMatchToSearch();
        });
    $list.append($item);

    var $item = initItem("设为途经点", {
            iconUrl: throughIcon.icon,
            iconSize: [defWidth, throughIcon.iconHeight],
            // 通过attr指定callback的名字，否则不会触发回调
            callbackName: "set-through"
        },
        function (data, e) {
            if (!data || !data.result || data.result.length == 0) {
                return;
            }

            var result = data.result[0];
            var title = result.formatted_address;

            if (title == null || title == "") {
                return;
            }

            deleteTjdHtmlInputs();
            // 添加一个途经点
            var $through = $(".panel_top .route_input_form .route_through_list");
            var $addBtn = $through.siblings(".route_start").find(".route_addinput");
            $addBtn.click();

            var target = ".panel_top .route_search .route_through:eq(0) .route_input";

            var marker;

            if (lineMarkers.length > 0) {
                var startMarker = lineMarkers[0];
                var endMarker = lineMarkers[lineMarkers.length - 1];
                // 有途经点
                if (lineMarkers.length > 2) {
                    var tmpMarkers = [];
                    for (var i = 1; i < lineMarkers.length - 1; i++) {
                        mapView.removeOverlay(lineMarkers[i]);
                        lineMarkers[i] = null;
                    }
                    tmpMarkers[0] = startMarker;
                    tmpMarkers[2] = endMarker;
                    lineMarkers = tmpMarkers;

                }
                // 没有途经点
                else if (lineMarkers.length == 2) {
                    var tmpMarkers = [];
                    tmpMarkers[0] = startMarker;
                    tmpMarkers[2] = endMarker;
                    lineMarkers = tmpMarkers;
                }
            }
            // 地图上没有搜索结果
            else {

            }
            marker = addIconMarkerForContextMenu({
                canOpen: false,
                icon: throughIcon.icon,
                iconWidth: throughIcon.iconWidth,
                iconHeight: throughIcon.iconHeight,
                offsetX: throughIcon.offsetX,
                offsetY: throughIcon.offsetY,
                posX: e.lng,
                posY: e.lat,
                name: title
            });
            lineMarkers[1] = marker;

            // 使用地图右键选择时的坐标
            var location = e.lng + "," + e.lat;
            setDataToLineInputAttribute(target, {
                title: title,
                dataLocation: location
            });
            checkLineDataMatchToSearch();
        });
    $item.addClass("set-through");
    $list.append($item);

    var $item = initItem("设为终点", {
            iconUrl: endIcon.icon,
            iconSize: [defWidth, endIcon.iconHeight],
            // 通过attr指定callback的名字，否则不会触发回调
            callbackName: "set-end"
        },
        function (data, e) {
            if (!data || !data.result || data.result.length == 0) {
                return;
            }
            var target = ".panel_top .route_search .route_end .route_input";
            var result = data.result[0];
            var title = result.formatted_address;

            if (title == null || title == "") {
                return;
            }

            var marker;

            if (lineMarkers[4] != null) {
                marker = lineMarkers[4];
                marker.setPosition(new LD.LngLat(e.lng, e.lat));
            } else {
                marker = addIconMarkerForContextMenu({
                    canOpen: false,
                    icon: endIcon.icon,
                    iconWidth: endIcon.iconWidth,
                    iconHeight: endIcon.iconHeight,
                    offsetX: endIcon.offsetX,
                    offsetY: endIcon.offsetY,
                    posX: e.lng,
                    posY: e.lat,
                    name: title
                });
                lineMarkers[4] = marker;
            }

            // 使用地图右键选择时的坐标
            var location = e.lng + "," + e.lat;
            setDataToLineInputAttribute(target, {
                title: title,
                dataLocation: location
            });
            checkLineDataMatchToSearch();
        });
    $item.addClass("hr-line")
    $list.append($item);

    var $item = initItem("在附近找", {
            //			iconUrl: endIcon.icon,
            iconSize: [defWidth, defHeight],
            // 通过attr指定callback的名字，否则不会触发回调
            callbackName: "set-nearby"
        },
        function (data, e) {
            if (!data || !data.result || data.result.length == 0) {
                return;
            }
            showLeftPageCategoryPage();

            var component = data.result[0].addressComponent;
            //var title = component.district + component.street + component["street_number"];
            var result = data.result[0];
            var title = result.formatted_address;

            // type:poi,road,district,housenumber
            var needSlice = result.type == "poi" || result.type == "housenumber";
            var nameTitle = title;
            var titlePrefix = component.province + "" + component.district
            if (needSlice) {
                var sindex = nameTitle.indexOf(titlePrefix) + titlePrefix.length;
                nameTitle = nameTitle.substr(sindex);
            }

            if (nearbyMarker != null) {
                mapView.removeOverlay(nearbyMarker);
                nearbyMarker = null;
            }

            var opts = $.extend({
                canOpen: true,
                posX: e.lng,
                posY: e.lat,
                name: nameTitle,
                addr: title
            }, MAP_STYLE.icon.center);
            var marker = addIconMarkerForContextMenu(opts);

            marker.click(marker);
            nearbyMarker = marker;
        });
    $item.addClass("hr-line")
    $list.append($item);

    var $item = initItem("设为地图中心点", {
            //			iconUrl: endIcon.icon,
            iconSize: [defWidth, defHeight],
            // 通过attr指定callback的名字，否则不会触发回调
            callbackName: "set-mapcenter"
        },
        function (data, e) {
            mapView.setCenter(e.lng, e.lat);
        });
    $item.addClass("hr-line")
    $list.append($item);

    var $item = initItem("清除路线", {
            //			iconUrl: endIcon.icon,
            iconSize: [defWidth, defHeight],
            // 通过attr指定callback的名字，否则不会触发回调
            callbackName: "set-clearline"
        },
        function (data, e) {
            initLinePageStatus();
        });
    $list.append($item);

    /**
     * 初始化模拟右键菜单的选项
     * @param {Object} text 文本内容
     * @param {Array} opts 前缀图标 iconUrl & iconSize
     * @param {Function} callback 选中后的回调函数
     */
    function initItem(text, opts, callback) {
        var $item = $itemHtml.clone();
        if (opts.borderLine) {
            $item.addClass("hr-line");
        }
        var $content = $item.find(".item-content");
        $content.text($.trim(text));
        var iconUrl = opts.iconUrl;
        if (isNotNull(iconUrl)) {
            $content.css("background-image", "url(" + iconUrl + ")");
        }
        var iconSize = opts.iconSize;
        if (iconSize && $.isArray(iconSize) && iconSize.length == 2) {
            var width = iconSize[0] + "px";
            var height = iconSize[1] + "px";
            $content.css("padding-left", width);
            $item.css({
                height: height,
                lineHeight: height
            });
        }

        if (opts.callbackName) {
            mapView.contextMenuData.callbacks[opts.callbackName] = callback
            $item.attr("data-fun-callback", opts.callbackName);
        }
        return $item;
    }

    return $root;
}

// 菜单选项被选择
/**
 * 用了InfoWindow，监听里面的DOM事件
 * 环境：IE9、Chrome
 * click事件在IE9环境下不会被触发
 * mousedown事件都不会被触发（没测其他的）
 * mouseup事件都触发
 */
$(document).on("mouseup.contextMenu", "#map-contextMenu-wrap .map-contextMenu .map-context-item", function () {
    var $this = $(this);
    if ($this.hasClass("disabled")) {
        return;
    }
    var $parent = $this.closest(".map-contextMenu");
    //	var callback = $this.data("data-fun-callback");
    //	var lonlat = $parent.data("data-lonlat");
    //	var regoData = $parent.data("data-rego");
    var callback = $this.attr("data-fun-callback");
    callback = mapView.contextMenuData.callbacks[callback];
    var lonlat = mapView.contextMenuData.lonlat;
    var regoData = mapView.contextMenuData.rego;

    if (callback && callback instanceof Function) {
        callback(regoData, lonlat);
    }

    mapView.hideContextMenu();
});
/**
 * TODO 20160617 换成自定义菜单
 * 初始化右键菜单
 * @returns {LD.ContextMenu}
 */
function initContextMenu_BAK() {
    var menu = new LD.ContextMenu(false);

    var startIcon = MAP_STYLE.icon.smallStart;
    var endIcon = MAP_STYLE.icon.smallEnd;
    var throughIcon = MAP_STYLE.icon.smallThrough;

    // ------
    var setBegin = new LD.MenuItem("设为起点", {
        iconUrl: startIcon.icon,
        iconSize: [startIcon.iconWidth, startIcon.iconHeight]
    });
    setBegin.setCallback(function (e) {
        var isLinePage = checkLineType() > 0;
        if (!isLinePage) {
            gotoLeftLinePage();
        }
        var location = e.lng + "," + e.lat;

        $.ajax({
            async: true,
            type: "GET",
            dataType: "jsonp",
            url: MAP_CONFIG.SERV.SERV_RGEO_URL + "location=" + location,
            success: function (data) {
                if (!data || !data.result || data.result.length == 0) {
                    return;
                }
                var target = ".panel_top .route_search .route_start .route_input";
                //				var component = data.result[0].addressComponent;
                //				var title = component.district + component.street + component["street_number"];
                var result = data.result[0];
                var title = result.formatted_address;

                if (title == null || title == "") {
                    return;
                }

                var marker;

                if (lineMarkers[0] != null) {
                    marker = lineMarkers[0];
                    marker.setPosition(new LD.LngLat(e.lng, e.lat));
                } else {
                    marker = addIconMarkerForContextMenu({
                        canOpen: false,
                        icon: startIcon.icon,
                        iconWidth: startIcon.iconWidth,
                        iconHeight: startIcon.iconHeight,
                        offsetX: startIcon.offsetX,
                        offsetY: startIcon.offsetY,
                        posX: e.lng,
                        posY: e.lat,
                        name: title
                    });
                    lineMarkers[0] = marker;
                }

                // 使用地图右键选择时的坐标
                //				location = data.result[0].location;
                //				location = location.lng + "," + location.lat;
                setDataToLineInputAttribute(target, {
                    title: title,
                    dataLocation: location
                });
                checkLineDataMatchToSearch();

            }
        });
    });

    var setEnd = new LD.MenuItem("设为终点", {
        iconUrl: endIcon.icon,
        iconSize: [endIcon.iconWidth, endIcon.iconHeight]
    });
    setEnd.setCallback(function (e) {
        var isLinePage = checkLineType() > 0;
        if (!isLinePage) {
            gotoLeftLinePage();
        }
        var location = e.lng + "," + e.lat;

        $.ajax({
            async: true,
            type: "GET",
            dataType: "jsonp",
            url: MAP_CONFIG.SERV.SERV_RGEO_URL + "location=" + location,
            success: function (data) {
                if (!data || !data.result || data.result.length == 0) {
                    return;
                }
                var target = ".panel_top .route_search .route_end .route_input";
                //				var component = data.result[0].addressComponent;
                //				var title = component.district + component.street + component["street_number"];
                var result = data.result[0];
                var title = result.formatted_address;

                if (title == null || title == "") {
                    return;
                }

                var marker;

                if (lineMarkers[4] != null) {
                    marker = lineMarkers[4];
                    marker.setPosition(new LD.LngLat(e.lng, e.lat));
                } else {
                    marker = addIconMarkerForContextMenu({
                        canOpen: false,
                        icon: endIcon.icon,
                        iconWidth: endIcon.iconWidth,
                        iconHeight: endIcon.iconHeight,
                        offsetX: endIcon.offsetX,
                        offsetY: endIcon.offsetY,
                        posX: e.lng,
                        posY: e.lat,
                        name: title
                    });
                    lineMarkers[4] = marker;
                }

                // 使用地图右键选择时的坐标
                //				location = data.result[0].location;
                //				location = location.lng + "," + location.lat;
                setDataToLineInputAttribute(target, {
                    title: title,
                    dataLocation: location
                });
                checkLineDataMatchToSearch();
            }
        });
    });

    var setTjd = new LD.MenuItem("设为途经点", {
        iconUrl: throughIcon.icon,
        iconSize: [throughIcon.iconWidth, throughIcon.iconHeight]
    });
    setTjd.setCallback(function (e) {
        var isLinePage = checkLineType() > 0;
        if (!isLinePage) {
            gotoLeftLinePage();
        }
        var location = e.lng + "," + e.lat;

        $.ajax({
            async: true,
            type: "GET",
            dataType: "jsonp",
            url: MAP_CONFIG.SERV.SERV_RGEO_URL + "location=" + location,
            success: function (data) {
                if (!data || !data.result || data.result.length == 0) {
                    return;
                }

                //				var component = data.result[0].addressComponent;
                //				var title = component.district + component.street + component["street_number"];
                var result = data.result[0];
                var title = result.formatted_address;

                if (title == null || title == "") {
                    return;
                }

                deleteTjdHtmlInputs();
                // 添加一个途经点
                var $through = $(".panel_top .route_input_form .route_through_list");
                var $addBtn = $through.siblings(".route_start").find(".route_addinput");
                $addBtn.click();

                var target = ".panel_top .route_search .route_through:eq(0) .route_input";

                var marker;

                if (lineMarkers.length > 0) {
                    var startMarker = lineMarkers[0];
                    var endMarker = lineMarkers[lineMarkers.length - 1];
                    // 有途经点
                    if (lineMarkers.length > 2) {
                        var tmpMarkers = [];
                        for (var i = 1; i < lineMarkers.length - 1; i++) {
                            mapView.removeOverlay(lineMarkers[i]);
                            lineMarkers[i] = null;
                        }
                        tmpMarkers[0] = startMarker;
                        tmpMarkers[2] = endMarker;
                        lineMarkers = tmpMarkers;

                    }
                    // 没有途经点
                    else if (lineMarkers.length == 2) {
                        var tmpMarkers = [];
                        tmpMarkers[0] = startMarker;
                        tmpMarkers[2] = endMarker;
                        lineMarkers = tmpMarkers;
                    }
                }
                // 地图上没有搜索结果
                else {

                }
                marker = addIconMarkerForContextMenu({
                    canOpen: false,
                    icon: throughIcon.icon,
                    iconWidth: throughIcon.iconWidth,
                    iconHeight: throughIcon.iconHeight,
                    offsetX: throughIcon.offsetX,
                    offsetY: throughIcon.offsetY,
                    posX: e.lng,
                    posY: e.lat,
                    name: title
                });
                lineMarkers[1] = marker;

                // 使用地图右键选择时的坐标
                //				location = data.result[0].location;
                //				location = location.lng + "," + location.lat;
                setDataToLineInputAttribute(target, {
                    title: title,
                    dataLocation: location
                });
                checkLineDataMatchToSearch();
            }
        });
    });
    // ------

    var onNearly = new LD.MenuItem("在附近找", {
        iconUrl: "../imap_jw/images/icon_b.png",
        iconSize: [19, 25]
    });
    onNearly.setCallback(function (e) {
        //		cleanMapOverlays();
        //		cleanLineInputPageData();
        showLeftPageCategoryPage();
        var location = e.lng + "," + e.lat;

        $.ajax({
            async: true,
            type: "GET",
            dataType: "jsonp",
            url: MAP_CONFIG.SERV.SERV_RGEO_URL + "location=" + location,
            success: function (data) {
                if (data.result.length == 0) {
                    return;
                }
                var component = data.result[0].addressComponent;
                //var title = component.district + component.street + component["street_number"];
                var result = data.result[0];
                var title = result.formatted_address;

                // type:poi,road,district,housenumber
                var needSlice = result.type == "poi" || result.type == "housenumber";
                var nameTitle = title;
                var titlePrefix = component.province + "" + component.district
                if (needSlice) {
                    var sindex = nameTitle.indexOf(titlePrefix) + titlePrefix.length;
                    nameTitle = nameTitle.substr(sindex);
                }

                if (nearbyMarker != null) {
                    mapView.removeOverlay(nearbyMarker);
                    nearbyMarker = null;
                }

                var opts = $.extend({
                    canOpen: true,
                    posX: e.lng,
                    posY: e.lat,
                    name: nameTitle,
                    addr: title
                }, MAP_STYLE.icon.center);
                var marker = addIconMarkerForContextMenu(opts);

                marker.click(marker);
                nearbyMarker = marker;
            }
        });
    });
    // ------

    var toMapCenter = new LD.MenuItem("设为地图中心点", {
        iconUrl: "../imap_jw/images/icon_b.png",
        iconSize: [19, 25]
    });
    toMapCenter.setCallback(function (e) {
        mapView.setCenter(e.lng, e.lat)
    });
    // ------

    var cleanMapLines = new LD.MenuItem("清除路线", {
        iconUrl: "../imap_jw/images/icon_b.png",
        iconSize: [19, 25]
    });
    cleanMapLines.setCallback(function (e) {
        initLinePageStatus();
    });

    menu.addItem(setBegin);
    menu.addItem(setTjd);
    menu.addItem(setEnd);
    menu.addSeparator(3);
    menu.addItem(onNearly);
    menu.addSeparator(4);
    menu.addItem(toMapCenter);
    menu.addSeparator(5);
    menu.addItem(cleanMapLines);

    return menu;
}

/**
 * 右键菜单部分的addMarker
 */
function addIconMarkerForContextMenu(record) {
    var iconMarker = mapView.addMarker({
        editable: false,
        icon: record.icon,
        iconWidth: record.iconWidth,
        iconHeight: record.iconHeight,
        offsetX: record.offsetX,
        offsetY: record.offsetY,
        lon: (record.posX * 1).toFixed(5),
        lat: (record.posY * 1).toFixed(5),
        name: record.name,
        addr: record.addr,
        stationID: record.stationID,
        click: record.canOpen ? openSearchWindowForContextMenu : null
    });
    return iconMarker;
}

/**
 * 右键菜单 “在附近找” 的信息框
 */
function openSearchWindowForContextMenu(e) {
    // 右键点击
    if (e && e.leftClick == false) {
        return false;
    }

    $("#smartTip").hide();
    var marker;
    if (this instanceof LD.Marker) {
        marker = this;

    } else {
        marker = arguments[0] instanceof LD.Marker ? arguments[0] : arguments[0].target;

    }

    var isCollect = checkMarkerLocationIsCollect(marker);
    var collectClass = "shoucang";
    if (marker.isCollection != null && marker.isCollection == true && isCollect) {
        collectClass += " active";
    }

    var sid = marker.stationID;

    var streetHtml = "";
    if (sid && sid != null && MAP_CONFIG.STREET_MODE) {
        streetHtml = '<div class="desc"><a href="javascript:void(0);" class="thumnail_link">' + '<img title="点击进入全景" class="thumnail" station-id="' + sid + '" src="' + MAP_CONFIG.STREET_SERVICE_URL + '/image/icon/' + sid + '?index=8"/>' + '</a></div>' + '<div class="desc_tip"><a title="点击进入全景" onclick="toStationID(\'' + sid + '\',event)">进入全景&gt;&gt;</a></div>';
    }

    var descHtml = '<div class="desc"><span>地址：</span><span>' + (marker.addr || '') + '</span></div>';
    if (isNotNull(marker.phone)) {
        descHtml += '<div class="desc"><span>电话：</span><span>' + (marker.phone || '') + '</span></div>';

    }

    var html = '<div class="infowindow" marker-id="' + marker.getId() + '">' +
        '<div class="infopanel">' +
        '<div class="title" title="' + marker.name + '">' + (splitExcessLength(marker.name, 20, " ...") || '没有找到该地点的信息') + '<a title="关闭" class="close" href="javascript:void(0)" onclick="closeInfoWindowForLine();"> X </a></div>' +
        '<div class="content">' +
        descHtml +
        '<div class="desc"><a href="javascript:void(0);" class="thumnail_link"></a></div>' + //<img class="thumnail" src="/logo/picture/2014-04-18/91e600d6133d4273a08e75689be3e7d3.jpg"/></a>
        streetHtml +
        '</div>'
        + '<div class="tools">'
//			+ '<div class="other_tool">'
//				+ '<span class="' + collectClass + '" onclick="collectPointForMarker(this, \'' + marker.getId() + '\')"><img src="../imap_jw/images/img_1.gif"></span>'
//		    	+ '<span> | </span>'
//				+ '<span class="share"><img src="../imap_jw/images/img_1.gif"></span>'
//				+ '<span> | </span>'
//				+ '<span class="fankui"><img src="../imap_jw/images/img_1.gif"></span>'
//			+ '</div>'
        + '<div class="search_tool">'
        + '<div class="tool_tab_2" title="搜周边" onclick="onNearbySearch(-22);">搜周边</div>' + '<span style="position: absolute; right: 70px;">|</span>' + '<div class="tool_tab_2" title="查路线" onclick="onLineSearch(\'' + marker.getPosition().lng + '\',\'' + marker.getPosition().lat + '\',\'' + marker.name + '\');">查路线</div>'
        + '</div>'
        + '</div>' +
        '<div class="tool_contents">' +
        '<div class="tool_content">' +
        '<a onclick="onNearbyTypeSearch(\'餐厅\',\'' + marker.getId() + '\')">美食</a><a onclick="onNearbyTypeSearch(\'酒店\',\'' + marker.getId() + '\')">酒店</a><a onclick="onNearbyTypeSearch(\'景点\',\'' + marker.getId() + '\')">景点</a><a onclick="onNearbyTypeSearch(\'电影院\',\'' + marker.getId() + '\')">电影院</a>' +
        '<input class="keyword" type="text" data-tip="#smartTipSimple"  onkeyup="onSearchKeyUpSimple(event, \'.infowindow .keyword\',\'#smartTipSimple\');"/><span onclick="onNearbyWordSearch();" autocomplete="off" class="search"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';

    infoWindow = new LD.InfoWindow(html, {
        //size : new LD.Size(350, 230),
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
        offset: new LD.Pixel(54, -22),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });
    mapView.addOverlay(infoWindow);
    infoWindow.autoPan(true, [{
        x: 430,
        y: 60
    }, {
        x: 100,
        y: 60
    }]);
    // 切换到搜周边
    $(".infowindow .infopanel .search_tool").children().first().click();
}

//==========================热点反查相关
function addHotspotEvent(data) {
    if ($(".tool_mark_savewindow").length > 0) {
        return;
    }
    if (mapView.hotMarker) {
        mapView["removeOverlay"](mapView.hotMarker);
        mapView["removeOverlay"](infoWindow);
        mapView.hotMarker = null;
        infoWindow = null;
    }

    var lnglatstr = data.c.split(",");
    var lnglat = {
        "lng": lnglatstr[0],
        "lat": lnglatstr[1]
    };
    if (data.id) {
        $.ajax({
            url: MAP_CONFIG.SERV.SERV_HOT_DETAIL_URL + "ids=" + data.id,
            type: "get",
            dataType: "jsonp",
            success: function (res) {
                if (res.status == 0) {
                    var result = res.results[0] /*,lnglat=result.location*/;
                    mapView.hotMarker = addHotspotMarker(result);
                    mapView.hotMarker.click();
                }
            }
        });
    }
}

function addHotspotMarker(record) {
    var iconMarker = mapView.addMarker({
        editable: false,
        icon: "../imap_jw/images/img_1.gif",
        iconWidth: 1,
        iconHeight: 1,
        offsetX: -192,
        offsetY: -425,
        lon: record.location.lng, //(record.posX * 0.00001).toFixed(5),
        lat: record.location.lat, // (record.posY * 0.00001).toFixed(5),
        name: record.name,
        phone: record.telephone || "",
        addr: record.address || "",
        click: openHotspotWindow
    });
    return iconMarker;
}

function openHotspotWindow() {
    //    var marker=parm1 instanceof LD.Marker?parm1:parm1.target;
    var marker = mapView.hotMarker;

    var isCollect = checkMarkerLocationIsCollect(marker);
    var collectClass = "shoucang";
    if (marker.isCollection != null && marker.isCollection == true && isCollect) {
        collectClass += " active";
    }

    var lnglat = marker.getPosition();

    closeInfoWindow();

    var html = '<div class="infowindow" marker-id="' + marker.getId() + '">' +
        '<div class="infopanel">' +
        '<div class="title" title="' + marker.name + '">' + splitExcessLength(marker.name, 20, " ...") + '<a title="关闭" class="close" href="javascript:void(0)" onclick="closeInfoWindow();"> X </a></div>' +
        '<div class="content">' +
        '<div class="desc"><span>地址：</span><span>' + marker.addr + '</span></div>' +
        '<div class="desc"><span>电话：</span><span>' + marker.phone + '</span></div>' +
        '<div class="desc"><a href="javascript:void(0);" class="thumnail_link"></a></div>' +
        '</div>' + '<div class="tools">' + '<div class="other_tool">' + '<span class="' + collectClass + '" onclick="collectPointForMarker(this, \'' + marker.getId() + '\')"><img src="../imap_jw/images/img_1.gif"></span>' + '</div>' + '<div class="search_tool">' + '<div class="tool_tab_2" title="搜周边" onclick="onNearbySearch();">搜周边</div>' + '<span style="position: absolute; right: 70px;">|</span>' + '<div class="tool_tab_2" title="查路线" onclick="onLineSearch(\'' + lnglat.lng + '\',\'' + lnglat.lat + '\',\'' + marker.name + '\');">查路线</div>' + '</div>' + '</div>' +
        '<div class="tool_contents">' +
        '<div class="tool_content">' +
        '<a onclick="onNearbyTypeSearch(\'餐厅\',\'' + marker.getId() + '\')">美食</a><a onclick="onNearbyTypeSearch(\'酒店\',\'' + marker.getId() + '\')">酒店</a><a onclick="onNearbyTypeSearch(\'景点\',\'' + marker.getId() + '\')">景点</a><a onclick="onNearbyTypeSearch(\'电影院\',\'' + marker.getId() + '\')">电影院</a>' +
        '<input class="keyword" type="text" data-tip="#smartTipSimple"  onkeyup="onSearchKeyUpSimple(event, \'.infowindow .keyword\',\'#smartTipSimple\');"/><span onclick="onNearbyWordSearch();" autocomplete="off" class="search"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';
    infoWindow = new LD.InfoWindow(html, {
        //		title :marker.name,
        position: lnglat,
        autoPan: true,
        //offset:new LD.Pixel(54,31),
        anchor: LD.Constants.BOTTOM_CENTER,
        offset: new LD.Pixel(57, -8),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });
    //ldmap["getOverlayLayer"]()["addOverlay"](infowindow);
    //debugger
    mapView.addOverlay(infoWindow, false);

    infoWindow.autoPan(true, [{
        x: 430,
        y: 60
    }, {
        x: 100,
        y: 60
    }]);
    //mapView.setCenter(lnglat.lng, lnglat.lat);
}


//window.navigator.userAgent // reg
//// if
if (/AppleWebKit.*Mobile/i.test(navigator.userAgent) || (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))) {
    if (window.location.href.indexOf("?mobile") < 0) {
        try {
            if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
                window.location.href = "http://m.ishowchina.com";
            } else if (/iPad/i.test(navigator.userAgent)) {
            } else {
                window.location.href = "http://map.ishowchina.com/"
            }
        } catch (e) {
        }
    }
}


/**
 * 配置，URL统一没有后面的 “/”
 */
var MAP_CONFIG = (function () {
    //-------------------------------------KEY相关
    /**
     * 地图和服务API使用的通用KEY
     */
    var SERV_KEY = "1e706fc68d966cd554c63a8e800e0daf";
    /**
     * 服务地址前缀
     */
//	var SERV_URL_PREFIX = "http://172.192.100.14:15001";
    //var SERV_URL_PREFIX = "http://api.ishowchina.com";
    var SERV_URL_PREFIX = window.leador_server_ipprot;
    /*yext数据展示*/
    //var SERV_URL_PREFIX_YEXT = "http://powerlist.ishowchina.com";
    var SERV_URL_PREFIX_YEXT = window.leador_server_ipprot;


    //-------------------------------------地图相关
//	var LD_MAP_URL = SERV_URL_PREFIX + "/webapi/auth/v2?v=3.2.1&t=jsmap";
    var LD_MAP_URL = SERV_URL_PREFIX + "/webapi/auth/v2?v=3.3.0&t=jsmap";
//	var LD_MAP_URL = "http://192.168.120.14:35001/webapi/auth/v2?v=3.1.2&t=jsmap";
    LD_MAP_URL += ("&ak=" + SERV_KEY);
    /**
     * 地图是否切换为旧版
     * 相关功能：切换旧版底图、屏蔽地图hotspotPOI热点
     */
    var USE_OLD_MAP = false;
    /**
     * 全景模式，false则关闭地图上全景入口
     */
    var STREET_MODE = true;
    /**
     * 全景服务地址，影像库image、属性库prop
     */
    var STREET_SERVICE_URL = "http://streetapi.ishowchina.com";
//	var STREET_SERVICE_URL = "http://localhost:8989/street";
    /**
     * 全景反投POI
     * 全国:
     *    "http://apix.ijietu.com/v3/around"
     */
    var STREET_MARKER_SERVICE_URL = null;
//	var STREET_MARKER_SERVICE_URL = "http://apix.ijietu.com/v3/around";
    /**
     * 地图路网URL，数组格式
     */
    var MAP_NET_URLS = ["http://websv1.ishowchina.com/v3/tile/{z}/{x}/{y}.png", "http://websv2.ishowchina.com/v3/tile/{z}/{x}/{y}.png"];
    /**
     * 地图实时交通URL，数组格式
     */
    var MAP_TMC_URLS = ["http://tile4.ishowchina.com/v3/tmc/{z}/{x}/{y}.png", "http://tile5.ishowchina.com/v3/tmc/{z}/{x}/{y}.png"];
//	var MAP_TMC_URLS = ["http://172.192.100.14:18888/tile?mid=tmc&f=png&scale=1&cache=false&z={z}&x={x}&y={y}"];

    /**
     * 地图麻点URL，数组格式    目前此功能暂时关闭20160411
     */
    var MAP_MASS_URLS = ["http://vector1.ishowchina.com/mass/{z}/{x}/{y}.png", "http://vector2.ishowchina.com/mass/{z}/{x}/{y}.png"];
    /**
     * 地图麻点模板地址前缀，http://apix.ijietu.com/v3/mass/${类型}/    目前此功能暂时关闭20160411
     */
    var MAP_MASS_TEMPLETE_URL = "http://apix.ijietu.com/v3/mass";

    //----------------------------------------服务API相关
    var SERV_AUTH_AK = "ak=" + SERV_KEY + "&";


    function getSERV() {
        var SERV = {
            "SERV_CITY_URL": SERV_URL_PREFIX + "/v3/search/district?" + SERV_AUTH_AK,	//城市搜索
            "SERV_HOT_DETAIL_URL": SERV_URL_PREFIX + "/v3/search/poiid?" + SERV_AUTH_AK,	//POI热点反查（根据id）
//				"SERV_HOT_DETAIL_URL": "http://192.168.120.14:35001/v3/search/poiid?"+SERV_AUTH_AK,	//POI热点反查（根据id）
//				"SERV_TOTAL_DETAILS_URL": SERV_URL_PREFIX+"/v3/online/search/detail?"+SERV_AUTH_AK,	//综合搜索
            "SERV_TOTAL_DETAILS_URL": SERV_URL_PREFIX_YEXT + "/v3/online/search/detail?" + SERV_AUTH_AK,	//综合搜索/*yext数据展示*/
            "SERV_RGEO_URL": SERV_URL_PREFIX + "/v3/rgeo?" + SERV_AUTH_AK,	//逆地理编码
            "SERV_POI_URL": SERV_URL_PREFIX_YEXT + "/v3/search/poi?" + SERV_AUTH_AK,	//POI关键字搜索/*yext数据展示*/
//				"SERV_POI_URL": SERV_URL_PREFIX+"/v3/search/poi?"+SERV_AUTH_AK,	//POI关键字搜索
            "SERV_POI_AROUND_URL": SERV_URL_PREFIX + "/v3/search/poi?" + SERV_AUTH_AK,	//周边查询接口
            "SERV_POI_BOX_URL": SERV_URL_PREFIX + "/v3/search/poi?regionType=rectangle&" + SERV_AUTH_AK,	//矩形区域内查询接口
            "SERV_SUGGEST_URL": SERV_URL_PREFIX_YEXT + "/v3/online/sug?" + SERV_AUTH_AK,	//联想猜词服务地址
            "SERV_BUS_TRANSFER_URL": SERV_URL_PREFIX + "/v3/route/bus?" + SERV_AUTH_AK,	//公交换乘服务地址
            "SERV_DRIVING_URL": SERV_URL_PREFIX + "/v3/route/car?" + SERV_AUTH_AK,	//驾车导航服务地址
            "SERV_WALKING_URL": SERV_URL_PREFIX + "/v3/route/walk?" + SERV_AUTH_AK,	//步行导航服务地址
            "SERV_BOUNDARY_URL": SERV_URL_PREFIX + "/v3/search/district?" + SERV_AUTH_AK,	// 行政区域的边界服务地址+

            //YEXT 提供数据展示的详细信息
            "SERV_DETAILS_URL": SERV_URL_PREFIX_YEXT + "/v3/online/search/getdetail?" + SERV_AUTH_AK, /*yext数据展示*/
//				"SERV_POI_DETAILS_URL": SERV_URL_PREFIX+"/poim?"+SERV_AUTH_AK,	//POI搜索
//				"SERV_BUS_LINE_ID_URL": SERV_URL_PREFIX+"/v3/search/busline/byid?"+SERV_AUTH_AK,//公交线路查询--id
//				"SERV_BUS_LINE_NAME_URL": SERV_URL_PREFIX+"/v3/search/busline/byname?"+SERV_AUTH_AK,//公交线路查询--name
//				"SERV_BUS_STATION_NAME_URL": SERV_URL_PREFIX+"/v3/search/busstop/byname?"+SERV_AUTH_AK,//公交站点查询--name
//				"SERV_BUS_STATION_ID_URL": SERV_URL_PREFIX+"/v3/search/busstop/byid?"+SERV_AUTH_AK,//公交站点查询--id
        };

        return SERV;
    }

    getSERV();


})();

//come from lina 20150724
$(function () {
    if (window.PIE) {
        $('.map_weather').each(function () {
            PIE.attach(this);
        });
    }
    $(document).click(function () {
        $("#result_top_s").hide();
        f = 0;
    });
    // 关闭全景入口
    // if (!MAP_CONFIG.STREET_MODE) {
    //	$("#jiejingdoor").remove();
    // }
    /////丁---////开始///
    //搜索输入框
    var defaultstr = "输入城市名称或首字母";
    $("#keys_city").focus(function () {
        if ($(this).val() == defaultstr) {
            $(this).val("");
        }
    }).blur(function () {
        if ($(this).val() == "") {
            $(this).val(defaultstr);
        }
    });
    //输入框输入
    // alert($("#keyword_top"))
    $("#keys_city").keyup(function (evt) {
        //alert(12112)
        //debugger
        evt = (evt) ? evt : ((window.event) ? window.event : ""); //兼容IE和Firefox获得keyBoardEvent对象
        var key = evt.keyCode ? evt.keyCode : evt.which; //兼容IE和Firefox获得keyBoardEvent对象的键值
        var id = $(this).attr("id");//根据元素ID判断是顶部输入还是尾部输入
        var flag = id == "keys_city" ? "top" : "bottom";
        if (key && key == 13) {
            //debugger
            var word = $(this).val();
            if (word != "未找到结果") {
                searchCity(flag);
            }
        } else if (key == 40) {
            //按了向下的键

            f = f + 1;
            choosetr(f, flag);

        } else if (key == 38) {
            //按了向上的键
            f = f - 1;
            choosetr(f, flag);
        } else {
            f = 0;//f表示当前选择项位置
            var id = $(this).attr("id");
            searchTrueCity(false, flag);
        }
    });
    //////丁---//结束//
});
//////丁---//开始///
function searchCity(flag) {
    var text = $.trim($("#result_" + flag + "_s").text());
    var keyword = $.trim($("#keys_city").val());

    if (text == "未找到结果") {
        return;
    } else if (text.indexOf(keyword) > -1) {
        //判断列表中是否有
        var existinlist = null;
        var lng = null, lat = null;
        var items = $("#result_" + flag + "_s p");

        $.each(items, function (index, item) {
            if (item != null) {
                var ptxt = $.trim($(item).text());

                if (ptxt && ptxt.indexOf(keyword) > -1 && lng == null && lat == null) {
                    //existinlist=$(item).attr("cityno");
                    lng = $(item).attr("a") / 1000000;
                    lat = $(item).attr("b") / 1000000;
                }
            }
        });

        if (lng && lat) {
            //列表中有城市，直接转入街景页
            changeLocation(lng, lat);
        }
    } else {
        //未找到此城市
        var items = $("#result_" + flag + "_s p");
        if (items.length > 0) {
            //默认取第一个
            //changeLocation($("#result_"+flag+"_s p:first").attr("cityno"));
            var lng = $("#result_" + flag + "_s p:first").attr("a") / 1000000;
            var lat = $("#result_" + flag + "_s p:first").attr("b") / 1000000;
            changeLocation(lng, lat);
        }
    }
}
/*选择联想词*/
function choosetr(m, flag) {
    var size = $("#result_top_s>p").size();
    var w = $("#result_top_s>p:first>a:first").html();
    if (size == 1 && w == "未找到结果") {
        f = 0;
        return false;
    }

    if (m < 1) {
        m = size;
        f = size;
    }
    if (m > size) {
        f = 1;
        m = 1;
    }

    $("#result_top_s>p").css("background-color", "#fff");
    var c = $("#result_top_s>p:nth-child(" + m + ")");
    c.css("background-color", "#ffc");
    $("#keys_city").val(c.find("a:first").html());
}
//autoEnter表示如果结果只有一条时是否自动进入。在输入时不自动进入，在点搜索时可以自动进入
function searchTrueCity(autoEnter, flag) {
    //关键字
    var keyword = $.trim($("#keys_city").val());
    if (keyword != "") {
        //查询
        //$.ajax(",{query : keyword},
        /*$.get("/city/getTrueCityByKeyWord",{keyword : encodeURIComponent(keyword)},
         function(data) {
         if (data  && data.length>0) {
         $("#result_top_s").empty();
         var l = data.length;
         if (l == 1 && autoEnter) {
         $("#keys_city").val(r[0].name);
         changeLocation(data[0].telno);
         } else {
         for ( var i = 0; i < l; i++) {
         $("#result_top_s").append("<p cityno='"+data[i].qid+"' onclick=\"changeLocation('"+ data[i].qid+ "');\"><a href='javascript:void(0);' >"+ data[i].name+ "</a></p>");
         }
         }
         } else {
         $("#result_top_s").html("<p><a>未找到结果</a></p>");
         }
         $("#result_top_s").show();
         });*/
        $.ajax({
            type: "GET",
            async: true,
            cache: true,
            dataType: "jsonp",
            url: MAP_CONFIG.SERV.SERV_CITY_URL + "callback=ISCN_CITY_S&query=" + keyword,
            success: function (city) {

            }
        });
    }
}
function ISCN_CITY_S(data) {
    if (data.results) {
        $("#result_top_s").empty();
        for (var i = 0; i < data.results.length; i++) {
            $("#result_top_s").append("<p cityno='" + data.results[i].adcode + "' a='" + data.results[i].center.lng * 1000000 + "' b='" + data.results[i].center.lat * 1000000 + "' onclick=\"changeLocation('" + data.results[i].center.lng + "','" + data.results[i].center.lat + "');\"><a href='javascript:void(0);' >" + data.results[i].name + "</a></p>");
        }
    } else {
        $("#result_top_s").html("<p><a>未找到结果</a></p>");
    }
    $("#result_top_s").show();
}
function ISCN_LOCATION(res) {
    var cityname = res.result[0].addressComponent.city || res.result[0].addressComponent.province;
    var adcode = res.result[0].addressComponent.adCode;
    $("#currentCity").text(cityname);
    document.location.hash = "c=" + adcode;
    document.location.reload();
}
function changeLocation(lng, lat) {
    //debugger
    //var numberReg = /[0-9]+/;
    /*if (numberReg.test(cityCode)) {
     q = "q";
     }else {
     q = "n"
     }*/

    // mapView.setZoom(11);
    mapView.setCenter(lng, lat, 11);
    /*var lnglatstr = lng+","+lat;
     $.ajax({
     type : "GET",
     async : true ,
     cache:true,
     dataType : "jsonp",
     url : "http://api.ishowchina.com/v3/rgeo?ak=ec85d3648154874552835438ac6a02b2&pois=1&callback=ISCN_LOCATION&location="+lnglatstr,
     success : function(res) {
     //			if (city && city.latlon) {
     //				//document.location.href ="index.html#c=" + city.qid;
     //				document.location.hash = "c=" + city.qid;
     //				document.location.reload();
     //			} else{
     //			}
     }
     })*/
    /*$.ajax({
     type : "GET",
     async : true ,
     cache:true,
     url : "/city/checkCity?c="+encodeURIComponent(cityCode)+"&p=q",
     success : function(city) {
     if (city && city.latlon) {
     //document.location.href ="index.html#c=" + city.qid;
     document.location.hash = "c=" + city.qid;
     document.location.reload();
     } else{
     }
     }
     });*/
}
//////丁---//结束///
/*********************************************全局变量*********************************************/
var mapView;
var street;//全景
var eagleMap;//鹰眼
//默认城市为武汉市
//var currentCity={
//		cityname:"武汉市",
//		sname:"武汉",
//		telno:"027",
//		postcode:"",
//		qid:"420100",
////		station:{id:"",heading:0,pitch:1},
//		lon:114.281,
//		lat:30.58
//};
//默认城市为北京市
var currentCity = {
    cityname: "北京市",
    lat: 39.9042,
    lon: 116.407,
    postcode: undefined,
    qid: 110000,
    sname: "北京市",
    telno: "010"
};

var mark;
// var SERVICEAPI="http://apix.ijietu.com/v2.6/";
/************************************全局变量结束**************************************************/
//根据URL获取参数，兼容HASH
function getUrlParamter(q, url) {
    if (!url) url = document.location + '';
    else url += '';
    var reg = new RegExp("[?#&](" + q + ")=([^&?#]+)", "i");
    var re = reg.exec(url);
    if (re) return decodeURIComponent(re[2].replace(/[+]/g, ' '));
    else return "";//没找到返回空串
};
//根据URL获取参数，兼容HASH
function urlParam(q, val) {
    var param = getUrlParamter(q);
    if (param == "") {
        return val;
    } else {
        return param;
    }
};
/**
 * 修改地址栏参数，但不刷新页面
 */
function changeUrlHash(city, station, heading, pitch, zoom) {
    // 获取原来的参数
    var c = urlParam("c", "460100");// 城市
    var s = urlParam("s", null);
    var y = urlParam("heading", 0);
    var p = urlParam("pitch", 0);
    var z = urlParam("zoom", 0);

    // 赋新值
    if (city != null && city != "undefined") {
        c = city;
    }
    // 拼串
    if (c == "") {
        c = currentCity.qid;
    }
    if (station != null && station != "undefined") {
        s = station;
    }

    if (heading != null && pitch != null && heading != NaN && heading != "NaN" && heading != "undefined") {
        y = heading > 0 ? heading % 360 : 360 - Math.abs(heading) % 360;
        p = pitch;
    }
    if (y == "" && p == "") {
        y = 0;
        p = 1;// 默认值
    }

    if (zoom != null) {
        z = zoom;
    } else if (z == null || z == "") {
        z = 0;
    }
//	document.title = "我秀地图";// 防止title变化

    y = parseInt(y);// 去小数
    p = parseInt(p);
    var parms = "";
    if (s) {
        parms += "&s=" + s + "&heading=" + y + "&pitch=" + p + "&zoom=" + z;
    }
    location.hash = "c=" + c + parms;
}
function parseURL() {
    //拿到URL参数
    // TODO:方法m=scene进全景,m=bus，进公交换乘,m=drive进驾车导航
//	var m=getUrlParamter("m");
    var c = urlParam("c", null);
    var sid = urlParam("s", null);
    var heading = urlParam("heading", 0);
    var pitch = urlParam("pitch", 0);
    if (sid && MAP_CONFIG.STREET_MODE) {
        // 出错时返回大地图
        street.fromLargeMap = true;
        toStreetView();//切为全景模式
        street.showViewByStation(sid, heading, pitch);
        if (c != null) {
            //加载地址栏中城市
            currentCity.qid = c;
            changeCity(currentCity.qid, "q");
        } else {
            //根据stationid判断所在城市qid
            street.firstLoad = true;
        }
    } else {
        var citycode = $.cookie("nowCity");
        if (isNotNull(citycode) && c == null) {
//			location.hash += location.hash=="" ? "c="+citycode : "&c="+citycode;
            location.hash = "c=" + citycode;
            c = citycode;
        }
        //二维模式
        if (c != null) {
            //加载地址栏中城市
            currentCity.qid = c;
            changeCity(currentCity.qid, "q");
        } else {
            //加载默认城市
            createMap();
        }
    }
//	getWeather(currentCity.cityname);
    //由于出现城市名称有搜不到的情况，所以切换到用城市id进行天气搜索
    getWeather(currentCity.qid);
}

function createMap() {
    if (mapView == null) {
        //加载地图
        mapView = new MapView("map", jQuery);
        mapView.init({
            lon: currentCity.lon,
            lat: currentCity.lat,
            zoom: 13,
            isNeedPlug: true,
            click: mapMouseCLickEvent,
            move: mapMouseMoveEvent,
            rclick: mapMouseRightClickEvent,
            zoomchange: mapZoomChangeEvent,
            panend: mapPanEndEvent,
            hotspotclick: mapHotSpotClickEvent,
            mousedown: function () {
                changeLeftPanelStatus("suggest", -1);
            }
        });
        $("#currentCity").text(currentCity.cityname);
    }
    mapView.panBy(0.1, 0);
}

function createEagleMap() {
    if (eagleMap == null) {
        //加载鹰眼
        eagleMap = new EagleMap("eagleMapWarp", jQuery);
        var ldmap = eagleMap.init({
            lon: currentCity.lon,
            lat: currentCity.lat,
            zoom: 16,
            isNeedPlug: false
        });
        eagleMap.addOverView(currentCity.lon, currentCity.lat);
    }
}
function initLayout() {

}

function initElementEvent() {
    $(window).resize(initLayout);
    //城市切换点击
    $(".map_weather .city_x,#currentCity").click(function () {
        var panelWidth = $(".city_li").width();
        var ofx = $("#currentCity").offset().left - panelWidth + 70;
        var ofy = $("#currentCity").offset().top + 35;
        $(".city_li").css({
            "left": ofx + "px",
            "top": ofy + "px"
        }); //面板的位置计算
        $(".city_li").toggle(100); //显示或隐藏
        $("#keys_city").val("输入城市名称或首字母"); //丁---
    });
    //
    //bindBodyKeyup();
    //范围内关键字搜索
    $(".srarch_but_s").focus(function () {
        if ($(".srarch_but_s").val() == '请输入关键字') {
            $(".srarch_but_s").val("");
        }
    }).blur(function () {
        if ($(".srarch_but_s").val() == '') {
            $(".srarch_but_s").val("请输入关键字");
        }
    });
}

function onDockEagleMap() {
    if ($("#eagleDiv .refix").attr("fix") == "true") {
        //当前为FIX状态，解除FIX状态
        $("#flashContent").css({width: "100%", height: "100%"});
        $("#eagleDiv").width(350).height(260);
        $("#eagleDiv .refix").attr("fix", "false").removeClass("dock");
    } else {
        //变为FIX状态
        $("#eagleDiv .refix").addClass("dock");
        var $eagleDiv = $("#eagleDiv");
        var $flashDiv = $("#flashContent");
        var limitWidth = $("#flashParent").width();
        var limitHeight = $("#flashParent").height();
        // 判断宽高，如果高大于宽，靠右侧，否则靠下侧
        if ($eagleDiv.width() > ($eagleDiv.height() + 50)) {
            // 靠下侧
            $eagleDiv.width(limitWidth - 8).height(limitHeight * 0.3);
            $flashDiv.height(limitHeight * 0.7 - 8);
        } else {
            // 靠右侧
            $eagleDiv.height($("#flashParent").height() - 8).width($("#flashParent").width() * 0.2);
            $flashDiv.width(limitWidth * 0.8 - 8);
        }
        $("#eagleDiv .refix").attr("fix", "true").addClass("dock");
    }
    if (eagleMap) {
        eagleMap.resizeMap();
    }
}

///////////连续全景//////////
function toggleNetworkLayer(obj) {
    $(".city_li").css("display", "none");//显示或隐藏 //丁---
    onSearchInputBlur();
    if ($(obj).hasClass("active")) {
        $(obj).removeClass("active").attr("data-animate", "false");//active是路网开关，data-animate是猴子鼠标跟踪开关

        if (mapView) {
            mapView.removeNetworkLayer();
            mapView.removeMonkey();
        }
    } else {
        $(obj).addClass("active").attr("data-animate", "true");
//		debugger
        $("#tmc").removeClass("active").attr("data-animate", "false");
        if (mapView) {
            mapView.addNetworkLayer();
            mapView.addMonkey();
        }
    }
    $(obj).siblings().removeClass("active");
}
///////////实时交通//////////
var time;
function toggleTMCLayer(obj) {

    $(".city_li").css("display", "none");//显示或隐藏 //丁---
    onSearchInputBlur();
    if ($(obj).hasClass("active")) {
        $(obj).removeClass("active");//active是路网开关，data-animate是猴子鼠标跟踪开关
        if (mapView) {
            if (time) {
                clearInterval(time);
            }
            mapView.removeTMCLayer();
        }
    } else {
        $(obj).addClass("active");
        $("#jiejingdoor").removeClass("active").attr("data-animate", "false");
        mapView.removeMonkey();
        if (mapView) {
            mapView.addTMCLayer();
            time = setInterval(function () {
                mapView.removeTMCLayer();
                mapView.addTMCLayer();
            }, 5 * 60 * 1000);

        }
    }
    $(obj).siblings().removeClass("active");
}
function toStationID(sid, e) {
    if (infoWindow) {
        mapView.removeOverlay(infoWindow);
        infoWindow = null;
    }
    var evt = e || event;
    if (evt) {
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }
        if (evt.preventDefault) {
            evt.preventDefault();
        }
    }
    toStreetView();
    street.showViewByStation(sid);
}
function checkStreetStation(markers) {
    if (!MAP_CONFIG.STREET_MODE) {
        return;
    }
    var points = markers.join(";");

    checkStreetNearest(points, function (json) {
        if (json && json.length) {
            $.each(json, function (index, item) {
                checkStationCorrect(item.StationID, function () {
                    var marker = mapView.getOverlayById(markers[index].split(",")[2]);
                    if (marker) {
                        marker.stationID = item.StationID;
                        $(".search_panel .rs_pois_content").find("[marker-id='" + item.mid + "']").attr("station-id", item.StationID).append('<font><img src="../imap_jw/images/img_1.gif" onclick="toStationID(\'' + item.StationID + '\',event)" class="person" /></font>');//加入一个结果
                    }
                });
            });
        }

    });

}
////////////////////////////地图工具
function measureDist(obj) {
    $(".city_li").css("display", "none");//显示或隐藏 //丁---
    if ($(obj).hasClass("active")) {
        $(obj).removeClass("active");
        if (mapView) {
            mapView.closeDistanceTool();//关闭测距工具
        }
    } else {
        $(obj).addClass("active");
        if (mapView) {
            mapView.openDistanceTool();//启用测距工具
        }
    }
    $(obj).siblings().removeClass("active");
    $(".search_tv").hide();
    if (mark) {
        if (mark.status == false) {
            mapView.removeOverlay(mark);
        }
        mark = null;
        if (infoWindow) {
            mapView.removeOverlay(infoWindow);
        }
    }
}

function addMarkPointMarker(record) {
    var opts = {
        editable: false,
        isCollection: record.isCollection || false, // 是否已收藏
        bdid: record.bdid, // 在表中的id
        lon: record.posX,
        lat: record.posY,
        name: record.name,
        status: record.status || false,
        desc: record.desc,
        animate: record.animate || true,
        click: openMarkerWindow
    };
    opts = $.extend({}, opts, MAP_STYLE.icon.mark);
    var marker = mapView.addMarker(opts);
    return marker;
}
//标记开关
function markPoint(obj) {
    $(".city_li").css("display", "none");//显示或隐藏 //丁---
    mapView.closeDistanceTool();//关闭测距工具
    if ($(obj).hasClass("active")) {
        $(obj).removeClass("active");
        if (mark && mark.status == false) {
            mapView.removeOverlay(mark);
            mark = null;
        }
        if (infoWindow) {
            mapView.removeOverlay(infoWindow);
            infoWindow = null;
        }
    } else {
        $(obj).addClass("active");
        if (mapView) {
            if (mark && mark.status == false) {
                mapView.removeOverlay(mark);
                mark = null;
            }
            if (infoWindow) {
                mapView.removeOverlay(infoWindow);
                infoWindow = null;
            }
            //打开标注
            var lnglat = mapView.getCenter();
            mark = addMarkPointMarker({
                status: false,
                posX: lnglat.lng,
                posY: lnglat.lat,
                animate: true
            });
        }
    }
    $(obj).siblings().removeClass("active");
}
function openMarkerEditWindow(m) {
    var marker = m instanceof LD.Marker ? m : m.target;
    //debugger
    var html = '<div class="infowindow tool_mark_savewindow">' +
        '<div class="infopanel">' +
        '<div class="title">添加标记</div>' +
        '<div class="content">' +
        '<div class="desc"><span>名称：</span><input name="maker_name" type="text" placehoder="请输入名称" autocomplete="off"/></div>' +
        '<div class="desc"><span>备注：</span><textarea type="text" onkeyup="limitLength(this,100);" name="marker_desc" style="resize: none;" placehoder="请输入备注" autocomplete="off"></textarea></div>' +
        '</div>' +
        '<div class="btns"><span>最多输入100个字符。</span><a onclick="saveNewMarker(this);">保存</a><a onclick="deleteNewMarker(this);">删除</a></div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';
    infoWindow = new LD.InfoWindow(html, {
        //size : new LD.Size(312, 228),
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
        offset: new LD.Pixel(52, -30),
        //anchor:LD.Constants.BOTTOM_CENTER,
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });
    mapView.addOverlay(infoWindow);
    infoWindow.autoPan(true, [{x: 430, y: 60}, {x: 100, y: 60}]);
    //infoWindow.setOffset(new LD.Pixel(52,-155))
    $.ajax({
        url: MAP_CONFIG.SERV.SERV_RGEO_URL + "location=" + marker.getPosition().lng + "," + marker.getPosition().lat,
        async: true,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if (data && data.result && data.result.length > 0) {
                $(".infowindow .content  input[name='maker_name']").val(data.result[0].formatted_address);
                marker.name = data.result[0].formatted_address;
            }
        }
    })
}
//输入字数限制函数
function limitLength(obj, limit) {
    if ($(obj).val().length > limit) {
        $(obj).val($(obj).val().substring(0, limit));
    }
}
function openMarkerWindow(m) {

    if (m && m.leftClick == false) {
        return;
    }
    var marker = m instanceof LD.Marker ? m : m.target;

    var descHtml = '<div class="desc"><span>我的备注</span></div>';
    if (marker.desc != "" && marker.desc != null) {
        descHtml = '<div class="desc" style="word-wrap:break-word;"><span>' + marker.desc + '</span></div>';
    }

//	var isCollect = checkMarkerLocationIsCollect(marker);
//	var collectClass = "shoucang";
//	if (marker.isCollection != null && marker.isCollection == true && isCollect) {
//		collectClass += " active";
//	}

    var html = '<div class="infowindow" marker-id="' + marker.getId() + '">' +
        '<div class="infopanel">' +
        '<div class="title" title="' + marker.name + '">' + splitExcessLength(marker.name, 20, " ...") + '<a title="关闭" class="close" href="javascript:void(0)" onclick="closeInfoWindowForLine();"> X </a><span class="delete_mark" title="删除标记" onclick="removeMarkPoint(this);"><img class="d" src="../imap_jw/images/img_1.gif"/></span></div>' +
        '<div class="content" style="border-bottom: 1px solid #999;">' +
//							    '<div class="desc markername"><span>名称：</span><span>'+marker.name+'</span></div>'+
        descHtml +
        '</div>' +
        '<div class="tools">'
        + '<div class="other_tool">'
//				    		+ '<span class="' + collectClass + '" onclick="collectPointForMarkPoint(this, \'' + marker.getId() + '\')"><img src="../imap_jw/images/img_1.gif"></span>'
//					    	+ '<span> | </span>'
//							+ '<span class="share"><img src="../imap_jw/images/img_1.gif"></span>'
//							+ '<span> | </span>'
//							+ '<span class="fankui"><img src="../imap_jw/images/img_1.gif"></span>'
        + '</div>'
        + '<div class="search_tool">'
        + '<div class="tool_tab_2" title="搜周边" onclick="onNearbySearch(-27);">搜周边</div>'
        + '<span style="position: absolute; right:70px;">|</span>'
        + '<div class="tool_tab_2" title="查路线" onclick="onLineSearch(\'' + marker.getPosition().lng + '\',\'' + marker.getPosition().lat + '\',\'' + marker.name + '\');">查路线</div>'
        + '</div>'
        + '</div>' +
        '<div class="tool_contents">' +
        '<div class="tool_content">' +
        '<a onclick="onNearbyTypeSearch(\'餐厅\',\'' + marker.getId() + '\')">美食</a><a onclick="onNearbyTypeSearch(\'酒店\',\'' + marker.getId() + '\')">酒店</a><a onclick="onNearbyTypeSearch(\'景点\',\'' + marker.getId() + '\')">景点</a><a onclick="onNearbyTypeSearch(\'电影院\',\'' + marker.getId() + '\')">电影院</a>' +
        '<input class="keyword" type="text" data-tip="#smartTipSimple"  onkeyup="onSearchKeyUpSimple(event, \'.infowindow .keyword\',\'#smartTipSimple\');"/><span onclick="onNearbyWordSearch();"  class="search"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';
    infoWindow = new LD.InfoWindow(html, {
        //size : new LD.Size(312, 228),
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
        offset: new LD.Pixel(54, -32),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });
    mapView.addOverlay(infoWindow);
    infoWindow.autoPan(true, [{x: 430, y: 60}, {x: 100, y: 60}]);
}

/**
 * 删除标记，若已收藏，则取消收藏
 * @param obj
 */
function removeMarkPoint(obj) {
    var $this = $(obj);
    var $shoucang = $this.parents(".infopanel").find(".other_tool .shoucang");
    var mid = $this.parents(".infowindow").attr("marker-id");
    var marker = mapView.getOverlayById(mid);

    // 已收藏则取消收藏
    if ($shoucang.hasClass("active")) {
        $shoucang.click();
    }

    mapView.removeOverlay(marker);

    if (infoWindow) {
        mapView.removeOverlay(infoWindow);
        infoWindow = null;
    }

}

function saveNewMarker(obj) {
    if (mark) {
        var $infopanel = $(obj).parent().parent();
        mark.name = $infopanel.find("[name='maker_name']").val();
        mark.desc = $infopanel.find("[name='marker_desc']").val();
        mark.status = true;
        if (infoWindow) {
            mapView.removeOverlay(infoWindow);
            infoWindow = null;
        }
    }
}
function deleteNewMarker(obj) {
    if (mark) {
        mapView.removeOverlay(mark);
        mapView.removeOverlay(infoWindow);
        infoWindow = null;
    }
}
function regionSearch(obj) {
    $(".city_li").css("display", "none");//显示或隐藏 //丁---
    mapView.closeDistanceTool();//关闭测距工具
    if ($(obj).hasClass("active")) {
        $(obj).removeClass("active");
        if (mapView) {
            $($(obj).attr("data-target")).hide();
        }
    } else {
        $(obj).addClass("active");
        if (mapView) {
            $($(obj).attr("data-target")).show();
        }
    }
    $(obj).siblings().removeClass("active");
}
function onRegionKeywordSearch() {
    $("#smartTipRegion,.search_tv").hide();
    $(".map_tool").find("[data-target='.search_tv']").removeClass("active");
    var word = $(".srarch_but .srarch_but_s").val();
    if (word != '' && word != "请输入关键字") {
        regionKeywordSearch(word);
    }
}

/**
 * TODO 地图初始化
 */
/*$(function(){
 //	var winHeight=window.innerHeight?window.innerHeight:document.body.clientHeight;
 //	var winWidth=window.innerWidth?window.innerWidth:document.body.clientWidth;
 //自适应页面
 initLayout();
 //初始化元素事件
 initElementEvent();
 if(MAP_CONFIG.STREET_MODE){
 //加载全景
 street=new StreetView("flashContent",jQuery);
 //toStreetView();
 }else{
 $("#jiejingdoor,#flashParent").remove();
 street={};
 street.station = {
 id : null,
 heading : 0,
 pitch : 0,
 zoom : 0
 };
 }

 //解析URL生成地图
 parseURL();
 //	location.hash="";
 //初始化全景相关事件
 //street.init();

 // 初始化城市列表面板
 var cityPanel=new CityPanel();
 cityPanel.initCityPanel();
 });*/



//=========================拓展函数
if (jQuery) {
    // 判断:当前元素是否是被筛选元素的子元素
    jQuery.fn.isChildOf = function (selector) {
        // parents会获取所有祖先元素，再通过选择器过滤
        return (this.parents(selector).length > 0);
    };
    /*
     // 判断:当前元素是否是被筛选元素的子元素或者本身
     jQuery.fn.isChildAndSelfOf = function(b) {
     return (this.closest(b).length > 0);
     };
     */
}
// =========================拓展函数结束

/**
 * 检测面板最大高度
 */
function initMapLeftPanel() {
    var pst = 0.9;
    var winHeight = $(window).height();
    var maxHeight = $(window).height() - $(".panel_top").outerHeight() - 40;
    maxHeight = parseInt(maxHeight * pst);
    $(".map_left_panel").css("max-height", maxHeight);
}
// 初始化内容；
$(function () {
    // =========================面板高度检测开始
    // 初始化时限制一次
    initMapLeftPanel();
    // 面板最大高度
    $(window).on("resize", function () {
        initMapLeftPanel();
    });
    // =========================面板高度检测结束

    // =========================绑定事件开始
    // 删除全部历史记录
    $(".remove_record_all .del_btn").on("click", function (event) {
        cleanAllSearchRecord("search", function () {
            // 若是线路搜索页面
            var type = checkLineType();
            if (type > 0) {
                showTotal2LineInput();
            }
        });
    });
    // 首页历史记录面板：搜索、删除某个历史记录
    $(".home_panel .record_list").on("click", function (event) {
        var target = event.target || event.srcElement;
        var $target = $(target);
        var $fold = $target.hasClass("remove_record") ? $target : $target.parents(".remove_record");
        if (target.tagName === "LI" && $target.attr("record-detail")) {
            setTotalSearchRecordDataToInput(target);
        } else if ($fold.length > 0) {
            var index = $fold.parents("li").attr("data-index");
            removeOneSearchRecord(index, "search");
        }
    });
    // 线路部分的历史记录面板
    $(".route_swap_panel .record_list").on("click", function (event) {
        var target = event.target || event.srcElement;
        var $target = $(target);
        var $fold = $target.hasClass("remove_record") ? $target : $target.parents(".remove_record");
        if (target.tagName === "LI" && $target.attr("record-detail")) {
            setSearchRecordDataToInput(target);
        } else if ($fold.length > 0) {
            var index = $fold.parents("li").attr("data-index");
            removeOneSearchRecord(index, "line");
        }
    });
    // 线路部分综合搜索历史记录面板
    $(".panel_top .total2line_record .record_list").on("click", function (event) {
        var target = event.target || event.srcElement;
        var $target = $(target);
        var dataTarget = $target.attr("data-target");
        if (!dataTarget) {
            dataTarget = $target.parents("[data-target]").attr("data-target");
        }
        var $fold = $target.hasClass("remove_record") ? $target : $target.parents(".remove_record");
        if (target.tagName === "LI" && $target.attr("record-detail")) {
            chooseTotal2LineItem(target, dataTarget);
        } else if ($fold.length > 0) {
            var index = $fold.parents("li").attr("data-index");
            removeOneSearchRecord(index, "search", function () {
                // 若是线路搜索页面
                var type = checkLineType();
                if (type > 0) {
                    showTotal2LineInput(dataTarget);
                }
            });
        }
    });

    $(".panel_top").on("click", function (event) {
        var target = event.target || event.srcElement;
        var $target = $(target);
        //  点击的不是输入框，也不是列表本身
        var $inputList = $(".panel_top .route_search .input_list");
        var $panel = $(".panel_top .route_page .total2line_record");

        var offset = {
            input: $.extend({}, $inputList.offset(), {
                width: $inputList.width(),
                height: $inputList.height()
            }),
            panel: $.extend({}, $panel.offset(), {
                width: $panel.width(),
                height: $panel.height()
            }),
        };

        var isOn = false;
        for (var key in offset) {
            var rect = offset[key];
            if (event.pageX > rect.left && event.pageX < (rect.left + rect.width)) {
                if (event.pageY > rect.top && event.pageY < (rect.top + rect.height)) {
                    isOn = true;
                    break;
                }
            }
        }

        //	var needShow = $target.isChildOf(".panel_top .route_search .input_list") || $target.isChildOf(".route_page .total2line_record");
        if (!isOn) {
            $panel.hide();
        }
    });

    // 首页（分类）搜索
    $(".choice_type").on("click", function (event) {
        var target = event.target || event.srcElement;
        var $target = $(target);
        if ($target.hasClass("search_type")) {
            searchByCategory($target[0]);
        }
    })

    // 显示、隐藏面板
    /* 各浏览器动画结束事件
     var animEndEventNames = {
     'webkit' : 'webkitAnimationEnd',
     'o' : 'oAnimationEnd',
     'ms' : 'MSAnimationEnd',
     'animation' : 'animationend'
     }
     */
    // 左侧面板鼠标按下事件
    // mousedown在click之前被触发，最好放到后面
    $(document).on("click", function (event) {
        var ie678Map = {
            1: 0,
            4: 1,
            2: 2
        }
        if (/MSIE\s*?[0-8]/g.test(navigator.userAgent)) {
            event.button = ie678Map[event.button];
        }
        var target = event.target || event.srcElement;
        var $target = $(target);
        var $allLeft = $(".map_left_all"); // .map_left_all .all_panel的position不能脱离文档流（absolute、fixed）
        var loc = {
            x: event.clientX,
            y: event.clientY,
            top: $allLeft.offset().top,
            left: $allLeft.offset().left
        };
        var isLeftPanel = false;
        if (loc.x >= loc.left && loc.y >= loc.top) {
            if (loc.x <= (loc.left + $allLeft.width()) && loc.y <= (loc.top + $allLeft.height())) {
                isLeftPanel = true;
            }
        }
        // 鼠标左键
        if (event.button === 0 && !isLeftPanel) {
            var $panel = $(".all_panel");
            var current = $panel.attr("data-current");
            if (current === "home") {
                $panel.removeClass("panel_open panel_close").addClass("panel_close");
                changeLeftPanelStatus("home", -1)
            }
        }
    });

    $("#searchWord").on("focus", function () {
        var $panel = $(".all_panel");
        var current = $panel.attr("data-current");
        if (current === "home") {
            $panel.removeClass("panel_close panel_open").addClass("panel_open");
            showTotalSearchRecordPage();
            changeLeftPanelStatus("home", 0);
        }
    });

    $(".panel_top,.all_panel").on("click", function () {
        $("#smartTip,#smartTipSimple,#smartTipRegion").hide();
    });

    // 顶部线路搜索的三个类型点击
    $(".panel_top .route_top .route_choose .route_type").on("click", function () {
        var $this = $(this);
        $this.siblings().removeClass("active");
        $this.removeClass("active").addClass("active");

        var baseClass = " bus driver walk";
        var reg = new RegExp(" (bus|driver|walk) ")
        var rst = reg.exec(" " + this.className + " ");
        var nowClass = rst[1];
        if (!nowClass) {
            return;
        }
        searchLine.mode = nowClass;
        $(".panel_top .route_page .route_search").removeClass(baseClass).addClass(nowClass);
        // 初始化策略为11
        searchLine.tactics = 11;
        // 初始设置方案索引
        searchLine.schemeIndex = 0;
        // 输入框没有错误则会进行搜索
        checkLineDataMatchToSearch();
    });

    // 顶部线路搜索输入框（会有动态插入的输入框）
    $(".panel_top .route_input_form").on("focus", ".input_wrap .route_input", function () {
        changeLeftPanelStatus("suggest", -1);
        var $this = $(this);
        var value = $.trim($this.val());
        var $all = $(".panel_top .route_search .input_wrap");
        var index = $all.index($this.parents(".input_wrap"));
        var target = ".panel_top .route_search .input_wrap:eq(" + index + ") .route_input";
        if (!isNotNull(value)) {
            showTotal2LineInput(target);
        }
        if (isNotNull(value)) {
            $(".panel_top .route_page .total2line_record").hide();
        }
    });

    // 线路面板导航策略按钮
    /*$(".route_panel .tactic_choose .item_list").on("click", function(event) {
     var target = event.target || event.srcElement;
     var $target = $(target);
     if (!isNotNull($target.attr("data-tactics"))) {
     return false;
     }

     changeLineListItem(target);
     return false;
     })*/

    // 顶部线路搜索 搜索按钮
    $(searchLine.searchButton).click(function () {
        isbus = true;
        var $this = $(this);
        if ($this.hasClass("loading")) {
            return;
        }
        searchLine.schemeIndex = 0;
        // 开始搜索时（searchLineByType()...）增加loading的class
        searchLineByType();
    });
    $(".panel_top .route_page .route_do").click(function () {
        $(searchLine.searchButton).click();
    });

    // 点击对应步骤，改变线路颜色
    // 公交
    $(".route_panel .route_bus .scheme_list").on("click", ".step_list .step", function () {
        var $this = $(this);
        var path = $this.data("data-path") || $this.attr("data-path");
        if (isNotNull(path) && $this.hasClass("highlight")) {
            changeLineColor(this);
        }
        return false;
    });
    // 驾车、步行
    $(".route_panel .route_driver .scheme_list").on("click", ".step_list .step", function () {
        var $this = $(this);
        var path = $this.data("data-path") || $this.attr("data-path");
        if (isNotNull(path) && $this.hasClass("highlight")) {
            changeLineColor(this);
        }
        return false;
    });

    // 移动时右侧路线变色
    /*$(".route_panel .route_driver .scheme_list").on("mouseenter", ".step_list .step", function() {
     var $this = $(this);
     var path = $this.data("data-path") || $this.attr("data-path");
     if (isNotNull(path) && $this.hasClass("highlight")) {
     changeLineHoverColor(this);
     }
     return false;
     }).on("mouseleave", ".step_list .step", function() {
     changeLineHoverColor(this, false);
     return false;
     });*/

    // 点击方案右侧的 展开/收起 按钮
    // 公交
    $(".route_panel .route_bus .scheme_list").on("click", ".scheme_header", function () {
        var $fold = $(this).find(".item_fold");
        changeSchemeListItemForTransit($fold[0]);
    });
    // 驾车、步行
    /*$(".route_panel .route_driver .scheme_list").on("click", ".scheme_header", function() {
     var $fold = $(this).find(".item_fold");
     changeSchemeListItemForDriving($fold[0]);
     });*/

    // 模糊搜索
    //	$(".route_panel .error_choose .error_content_list").on("click", ".error_title .error_fold", function(){
    /*$(".route_panel .error_choose .error_content_list").on("click", ".doubt .error_title", function() {
     var $fold = $(this).find(".error_fold");
     changeErrorListItem($fold[0]);
     })*/

    // 模拟右键菜单，点击左侧面板时消失
    //$(".map_left_all").mousedown(function() {
    //	mapView.hideContextMenu();
    //});

    // 其他面板点击时收起输入提示面板
    // 地图mousedown时也会收起输入提示面板，在index.js
    $(".all_panel #smartTopTip").siblings().click(function () {
        changeLeftPanelStatus("suggest", -1);
    });

    // 综合搜索POI、BUS列表事件
    // “附近” <==> 搜索框  切换
    $(".search_panel .rs_pois").on("click", ".rs_pois_content .sw", function () {
        var $this = $(this);
        var $panel = $this.closest(".tools");
        if ($panel.hasClass("search")) {
            $panel.removeClass("search");
        } else {
            $panel.addClass("search");
        }

        return false;
    });

    // =========================绑定事件结束
});

/**
 * 改变home、search、line容器的展开、隐藏状态，有动画效果
 *
 * @params target 选择容器：home、search、line
 * @params status为0则展开，默认值0，-1则为关闭，-2为全部关闭，1为展开时不关闭其他panel
 * @params fun 展开、收起后的回调函数
 */
function changeLeftPanelStatus(target, status, fun) {
    status = status == null ? 0 : status;//若status为空则赋值为0，否则赋值为status
    fun = fun instanceof Function ? fun : function () {
    };//如果fun是函数形式则赋值为fun,否则将其定义为函数
    var $parentPanel = $(".all_panel");
    //	var $allPanel = $(".all_panel .home_panel,.all_panel .search_panel,.all_panel .route_panel,.all_panel .suggest_panel,.all_panel .route_swap_panel");
    var $allPanel = $parentPanel;
//	console.log($parentPanel);
//	console.log($allPanel)
    var $childrenPanel = $allPanel.children();
    //状态值为-2时 全部关闭
    if (status == -2) {
        $childrenPanel.hide();
        $parentPanel.attr("data-current", "home");
        fun();
    }
    var $panel = null;
    if (target === "home") {
        // 首页
        $panel = $allPanel.find(".home_panel");//找到子元素中class名为.home_panel
    } else if (target === "search") {
        // 综合搜索结果
        $panel = $allPanel.find(".search_panel");
    } else if (target === "line") {
        // 线路部分，线路搜索结果
        $panel = $allPanel.find(".route_panel");
    } else if (target === "suggest") {
        // 输入提示
        $panel = $allPanel.find(".suggest_panel");
    } else if (target === "route-swap") {
        // 线路部分，线路历史记录
        $panel = $allPanel.find(".route_swap_panel");
    } else if (target === "collection") {
        // 收藏点列表
        $panel = $allPanel.find(".collection_panel");
    } else {
        return false;
    }
    //0,1 状态下展开列表
    if (status == 0 || status == 1) {
        $parentPanel.attr("data-current", target);
        if (!new Boolean(parseInt(status))) {
            $childrenPanel.not($panel).hide();//状态值为0的时候关闭除了panel的所有其他panel
        }

        $panel.stop(true, true);//stop(clearQueue,jumpToEnd);clearQueue:清空队列，可立即结束动画;jumpToEnd:完成队列，可以立即完成动画
        $panel.slideDown(300, function () {//slideDown以滑动的方式显示当前的panel
            fun();
        });
    } else if (status == -1) {//-1状态下关闭panel
        $panel.slideUp(200, function () {//slideUp以滑动的方式隐藏当前的panel
            fun();
        });

    }
}

/**
 * 返回搜索框初始状态
 * @param cleanInput 为true则为清空输入框内容，否则不清空
 */
function backofLeftHome(cleanInput) {
    clearMap();
    isbus = false;
    isGD = true;
    cleanInput = cleanInput == null ? true : cleanInput;
    var $parentPanel = $(".all_panel");
    var $allPanel = $parentPanel.children();

    $parentPanel.attr("data-current", "home")
    $allPanel.hide();
    $(".search_result_info").hide();
    $("#smartTip,#smartTipSimple,#smartTipRegion").hide();
    $(".panel_top .route_page .total2line_record").hide();

    $(".panel_top .route_page").hide();
    $(".panel_top .search_page").show();

    $(".search_box .search_close").hide();
    $(".search_box .search_2line").show();
    //cleanMapOverlays();

    if (cleanInput) {
        $("#searchWord").val("").removeAttr("title").removeAttr("data-location");
    }
    // 清空线路搜索输入框
    //cleanLineInputPageData();
    // 切换面板时（高度不一样）初始化一次
    initMapLeftPanel();
//	console.log(collectMarkers);
//	for(var i in collectMarkers){
//
//	}
    //isCollectMakerShow(false);
}


/**
 * 前往线路搜索状态
 */
function gotoLeftLinePage() {

    var $parentPanel = $(".all_panel");
    var $allPanel = $parentPanel.children();

    $parentPanel.attr("data-current", "line")
    $allPanel.hide();
    $(".search_result_info").hide();
    $("#smartTip,#smartTipSimple,#smartTipRegion").hide();
    $(".panel_top .route_page .total2line_record").hide();

    $(".panel_top .search_page").hide();
    $(".panel_top .route_page").show();

    //cleanMapOverlays();

    $(".panel_top .route_choose .route_type:first").click();

    $parentPanel.find(".route_swap_panel").show();
    showLineSearchRecordPage();

    // 切换面板时（高度不一样）初始化一次
    initMapLeftPanel();

    $(searchLine.searchButton).removeClass("loading");

    // 显示  “清除路线”
    $(".panel_top .route_page .cleanlines").hide();
}
/**
 * 在线路搜索页面，初始化线路页面
 * @param cleanInput 为true则为清空输入框内容，否则不清空，默认true
 */
function initLinePageStatus(cleanInput) {
    cleanInput = cleanInput == null ? true : cleanInput;
    var $parentPanel = $(".all_panel");
    var $allPanel = $parentPanel.children();

    $parentPanel.attr("data-current", "line")
    $allPanel.hide();
    $(".search_result_info").hide();
    $("#smartTip,#smartTipSimple,#smartTipRegion").hide();
    $(".panel_top .route_page .total2line_record").hide();

    $(".panel_top .search_page").hide();
    $(".panel_top .route_page").show();

    //cleanMapOverlays();

    // 清空线路搜索输入框
    if (cleanInput) {
        cleanLineInputPageData();
    }

    $parentPanel.find(".route_swap_panel").show();
    showLineSearchRecordPage();

    $(searchLine.searchButton).removeClass("loading");

    // 隐藏  “清除路线”
    $(".panel_top .route_page .cleanlines").hide();

    $(".panel_top .route_choose .route_type:first").click();
}

/**
 * 从综合搜索面板跳转至线路搜索面板，如果有值，则设置为重点终点
 * @param {Object} obj
 */
function totalSearch2linePage(obj) {
    if (marker) {
        marker.remove(map)
    }
    isbus = true;
    isGD = false;
    //	var $this = $(obj);
    var $search = $("#searchWord");
    var value = $.trim($search.val());
    var location = $search.attr("data-location") || $search.data("data-location");
    gotoLeftLinePage();

    var target = ".panel_top .route_search .route_end .route_input";
    if (isNotNull(value)) {
        setDataToLineInputAttribute(target, {
            title: value,
            dataLocation: location
        });
    }
    //isCollectMakerShow(false);
}


//======================================线路页面开始==============================================//
//kanhongyu 20150728
/**
 * 切换左侧面板
 * @param keepOverlays true为不清空地图上的遮盖物
 */
function swapLeftList(obj, keepOverlays) {
    $($(obj).attr("hideTarget")).hide();
    $($(obj).attr("showTarget")).show();

    var thisClass = $(obj).attr("class");
    // 重复点击
    if (!thisClass || thisClass.lastIndexOf("_on") != -1) {
        return;
    }

    swapItemByClassName(obj);

    // 切换到 分类 页面时初始化 路线 页面内容
    if ($(obj).attr("showTarget") == ".map_left_choice_div") {

        if (keepOverlays == null || keepOverlays == false) {
            cleanLineInputPageData();
            //cleanMapOverlays();
        }

    } else
    // 切换到 路线 页面显示历史记录
    if ($(obj).attr("showTarget") == ".map_left_line_div") {

        var isEmptyPage = true;
        $(".result_line_p_wrap,.chose_four,.chose_three").each(function () {
            if ($(this).is(":visible")) {
                isEmptyPage = false;

                return false;
            }
        });

        if (isEmptyPage) {
            // 历史记录+下载二维码
            showLineSearchRecordPage();
        }

        //		if (keepOverlays == null || keepOverlays == false) {
        //			// 历史记录+下载二维码
        //			showLineSearchRecordPage();
        //		}

    }

    //	checkLinePageHasScrollBarStatus();
}

/**
 * 清空线路页面输入框的数据，同时清空上次搜索结果
 */
function cleanLineInputPageData() {
    // 初始化输入框
    setDataToLineInputAttribute(".panel_top .route_search .input_wrap .route_input", null);
}

/**
 * 在同辈元素中，根据className的 _on 切换选中状态，并且清空地图遮盖物
 * @param obj
 */
function swapItemByClassNameForLine(obj) {

    swapItemByClassName(obj);

    var result = checkLineDataResult();
    if (!result.hasError) {
        //cleanMapOverlays();
    }
}
/**
 * 在同辈元素中，根据className的 _on 切换选中状态
 */
function swapItemByClassName(obj) {
    var $this = $(obj);
    var $siblings = $(obj).siblings();
    // alert($siblings.length);

    var thisClass = $this.attr("class");
    if (thisClass) {
        thisClass = thisClass.lastIndexOf("_on") == (thisClass.length - 3) ? thisClass
            .substr(0, thisClass.length - 3) :
            thisClass;
        $this.addClass(thisClass + "_on").removeClass(thisClass);
    }

    $siblings.each(function (index, sib) {
        var $sib = $(sib);
        var sibClass = $sib.attr("class");

        if (sibClass.lastIndexOf("_on") == sibClass.length - 3) {
            var noOn = sibClass.substr(0, sibClass.length - 3);
            $sib.addClass(noOn).removeClass(sibClass);
        }
    });

}

/**
 * 切换 公交、驾车、步行
 * @param obj
 */
function swapSearchTypeListItem(obj) {
    var thisClass = $(obj).attr("class");

    // 重复点击
    if (thisClass.lastIndexOf("_on") != -1) {
        return;
    }

    // 方案列表是否已显示
    var isShow = $(".map_left_line_div .chose_four").is(":visible") ||
        $(".map_left_line_div .chose_three").is(":visible");
    var hasErrorPage = $(".map_left_line_div .result_line_p_wrap").is(":visible");

    $(".map_left_line_div .chose_four").hide();
    $(".map_left_line_div .chose_three").hide();

    swapItemByClassNameForLine(obj);
    checkIsDrivingInput();

    var lineType = checkLineType();

    if (isShow) {
        searchLine.trueButton = true;
        // 在搜索结果显示的情况下
        // 切换公交、驾车、步行时，将输入框内容初始化为搜索时的内容
        $(".map_left_line_div .result_line p input").each(function () {
            var $this = $(this);
            if ($this.attr("haschange") == "true") {
                $this.val(splitExcessLength($this.attr("title"), 13, " . . ."))
                    .attr("haschange", "false");
            }
        });
        searchLineByType();
    } else {
        // 输入错误，有错误页面的情况下，刷新提醒列表
        if (hasErrorPage) {
            checkLineHasError();
        }
    }

    if (isShow == false) {
        // 未搜索的情况下，同时没有提醒列表
        // 显示历史记录部分

        if (hasErrorPage == false) {
            showLineSearchRecordPage();
        }
    }

}

/**
 * 模糊搜索提醒列表被选择
 * @param obj
 * @param target
 */
function chooseSearchItemForErrorListItem(obj, target) {
    var $this = $(obj);

    setDataToLineInputAttribute(target, {
        title: $this.attr("title"),
        dataLocation: $this.attr("data-location")
    });

    var $wrap = $this.parents(".error_wrap");
    $wrap.removeClass("success doubt").addClass("success");
    var $parent = $wrap.parents(".error_content_list");
    var $allWrap = $parent.find(".error_wrap");
    var thisIndex = $allWrap.index($wrap);
    var $nextWrap = $allWrap.filter(":gt(" + thisIndex + ")").filter(".doubt:first");
    if ($nextWrap.length == 0) {
        $nextWrap = $allWrap.filter(".doubt:first");
    }

    if ($nextWrap.length > 0) {
        $nextWrap.find(".error_fold").click();
    } else {
        $allWrap.removeClass("open")
        var isSearch = checkLineDataMatchToSearch();
    }

}

/**
 * 为线路搜索的输入框设置属性，data若为null，则为清空target
 * @param target 目标input
 * @param data 数据{title: 必须，dataLocation: 必须}
 */
function setDataToLineInputAttribute(target, data) {
    $(target).val("").removeAttr("title").removeAttr("data-location");
    if (data == null) {
    } else {
        $(target).val(data.title)
            .attr("data-location", data.dataLocation)
            .attr("title", data.title);
    }
}

/**
 * 如果输入内容符合规则，直接搜索
 * @param {Number} schemeIndex 指定在出现结果后打开第几个方案（默认0第一个）
 * @returns true为已搜索
 */
function checkLineDataMatchToSearch(schemeIndex) {
    var result = checkLineDataResult();
    var isSearch = false;

    if (!result.hasError) {
        // 如果通过搜索按钮点击，searchLine.schemeIndex会设为0
        searchLineByType();
        isSearch = true;
    }

    return isSearch;
}

//--- target为jquery选择器，提示框(panel)在目标input下显示
//--- panel为提示框的jquery选择器
function onSearchKeyUpForLine(e, target, panel) {
    onSearchKeyUp(e, target, panel, true);
}

/**
 * 更改选中状态的弹出列表
 * @param obj
 * @param target
 * @param panel #smartTopTip
 */
function chooseSearchItemForLine(obj, target, panel) {
    var $obj = null;
    var isClick = false;
    /*
     if(obj == 1|| obj == -1){
     var tipdiv = panel || "#smartTopTip" ;
     var index = $(tipdiv).find("ul li").index($(tipdiv).find("ul li.active"));
     index = index + obj;
     if(index > 9){
     index = 0;
     }else if(index < 0){
     index = 9;
     }
     $obj = $(tipdiv).find("ul li").eq(index);

     }else{
     $obj = $(obj);
     $obj.parent().parent().hide();
     isClick = true;
     }
     */
    $obj = $(obj);
    $obj.parent().parent().hide();
    isClick = true;
    $obj.addClass("active").siblings().removeClass("active");

    setDataToLineInputAttribute(target, {
        title: $obj.attr("title"),
        dataLocation: $obj.attr("data-location")
    });

    if (isClick) {
        var isSearch = checkLineDataMatchToSearch();

        if (!isSearch) {
            checkErrorListExistToRefresh();
        }
    }
}

/**
 * @param obj
 * @param target #smartTip
 */
function chooseTotal2LineItem(obj, target) {
    var $obj = $(obj);
    $obj.parent().parent().hide();

    setDataToLineInputAttribute(target, {
        title: $obj.attr("title"),
        dataLocation: $obj.attr("data-location")
    });

    var isSearch = checkLineDataMatchToSearch();

    if (!isSearch) {
        checkErrorListExistToRefresh();
    }
}

/**
 * 清空地图覆盖物，不清空已收藏的点
 * 若要清空地图全部覆盖物,使用 mapView.clearOverlays();
 */
/*function cleanMapOverlays() {
 var allLays = mapView.getAllOverlays();
 var cleanLays = [];

 for(var i in allLays) {
 var lay = allLays[i];
 var isclean = false;
 var mid = lay.getId();

 if(collectMarkers[mid] == null) {
 isclean = true;
 } else {
 isclean = false;
 }

 // 不清除收藏点
 if(isclean) {
 cleanLays.push(lay);
 }
 }
 if(infoWindow) {
 mapView.removeOverlay(infoWindow);
 infoWindow = null;
 }

 mapView.clearOverlays(cleanLays);
 mapView.removeNetworkLayer();
 mapView.removeMonkey();

 initLinePartVariable();

 mapView.removeHotspotLayer();
 }*/

/**
 * 清空公交、驾车、步行搜索部分的变量
 */
function initLinePartVariable() {
    infoWindow = null;
    for (var i in polyLinesOverlay) {
        polyLinesOverlay[i] = null;
    }
    for (var i in lineMarkers) {
        lineMarkers[i] = null;
    }
    for (var i in polyLines) {
        polyLines[i] = null;
    }
    //	for (var i in polyLinesMarkers){
    //		polyLinesMarkers[i] = null;
    //	}

    polyLinesMarkers = [];
}

/**
 * 交换 起点和终点
 */
function exchangeLine() {
    $("#smartTip").hide();
    var $begin = $(".panel_top .route_input_form .route_start .route_input");
    var $end = $(".panel_top .route_input_form .route_end .route_input");

    var beginVal = $begin.val();
    var beginTitle = $begin.attr("title");
    var beginLocation = $begin.attr("data-location");
    //	var beginHasChange = $begin.attr("haschange");
    //	var beginOnChange = $begin.attr("onchange");

    // 赋值失败则为 ""
    $begin.attr("title", $end.attr("title") || "");
    $begin.attr("data-location", $end.attr("data-location") || "");
    //	$begin.attr("haschange", $end.attr("haschange") || "");
    //	$begin.attr("onchange", $end.attr("onchange") || "")
    $begin.val($end.val());

    $end.attr("title", beginTitle || "");
    $end.attr("data-location", beginLocation || "");
    //	$end.attr("haschange", beginHasChange);
    //	$end.attr("onchange", beginOnChange)
    $end.val(beginVal);

    setSearchLineParam();
    /*
     // 如果有提醒列表，则重新检查
     var hasErrorList = $(".map_left_line_div .result_line_p_wrap").css("display") != "none";

     if (hasErrorList) {

     var hasError = checkLineHasError();
     // 没有检查到错误，隐藏
     if (!hasError) {
     $(".map_left_line_div .result_line_p_wrap").hide();
     }
     }
     */
    // 已经执行了线路搜索（有结果或有模糊提示）
    var $routePanel = $(".all_panel .route_panel");
    var hasLinePage = $routePanel.is(":visible");
    if (hasLinePage) {
        var result = checkLineHasError();
        if (!result.hasError) {
            checkLineDataMatchToSearch();
        } else {
            $routePanel.show();
            $routePanel.find(".error_choose").show().siblings().hide();
        }
    }
    return false;
}

/**
 * 公交、驾车换乘
 * 如果step.path的最后一个坐标与nextStep的起点坐标不符，则在step.path后增加nextStep的起点坐标
 * @param step
 * @param nextStep
 */
function connectNextStep(step, nextStep) {
    if (nextStep) {
        var isWalk = false;
        if (nextStep.stepOriginLocation == null) {
            isWalk = true;
        }
        // 是否有多余的分号
        var hasMoreSep = false;
        var nextOrigin = "";
        if (isWalk) {
            nextOrigin = nextStep.path.split(";")[0];
        } else {
            nextOrigin += parseFloat(nextStep.stepOriginLocation.lng).toFixed(6) + ",";
            nextOrigin += parseFloat(nextStep.stepOriginLocation.lat).toFixed(6);
        }
        var stepEnd = step.path.split(";");
        //
        if (step.path == "") {
            return;
        } else if (stepEnd[stepEnd.length - 1] == "") {
            hasMoreSep = true;
            stepEnd.pop();
            stepEnd = stepEnd[stepEnd.length - 1];
        } else {
            stepEnd = stepEnd[stepEnd.length - 1];
        }
        stepEnd = stepEnd.split(",");
        stepEnd = parseFloat(stepEnd[0]).toFixed(6) + "," + parseFloat(stepEnd[1]).toFixed(6);
        if (stepEnd != nextOrigin) {
            if (hasMoreSep) {
                step.path += nextOrigin;
            } else {
                step.path += ";" + nextOrigin;
            }
        }
    }
}

//======================================线路页面结束===============================================//

//===================================驾车导航===========================================//
//kanhongyu 20150810
function sendLineSearchRequestForDriving() {
    var searchLineStart = encodeURIComponent(searchLine.start);
    var searchLineEnd = encodeURIComponent(searchLine.end);
    var startParam = searchLine.bgnX + "," + searchLine.bgnY;
    var endParam = searchLine.endX + "," + searchLine.endY;

    var isDriver = searchLine.mode == "driver";
    // 途经点 xxx,xxx"xxx,xxx"xxx,xxx
    var waypoints = [];

    for (var index in searchLine.tjd) {
        var posX = searchLine.tjdX[index];
        var posY = searchLine.tjdY[index];
        if (isNotNull(posX) && isNotNull(posY)) {
            waypoints.push(posX + "," + posY);
        }
    }
    if (waypoints.length > 0) {
        waypoints = waypoints.join(";");
    } else {
        waypoints = "";
    }
    //http://192.168.11.39:25001/v3/rgeo?ak=1e706fc68d966cd554c63a8e800e0daf&location=119.47881079484148,33.35683210881632&callback=callback_SetTo
    var serverUrlTarget = isDriver ? ("{ipprot}/v3/route/car?ak=1e706fc68d966cd554c63a8e800e0daf" + "&waypoints=" + waypoints)
        : "{ipprot}/v3/route/walk?ak=1e706fc68d966cd554c63a8e800e0daf";

    var serverUrl = serverUrlTarget.replace("{ipprot}", window.leador_server_ipprot)
        + "&origin=" + startParam + "&destination=" + endParam
        + "&tactics=" + searchLine.tactics

    $.ajax({
        async: true,
        type: "GET",
        dataType: "jsonp",
        url: serverUrl,
        success: function (data) {
            // 允许进行导航搜索
            $(searchLine.searchButton).removeClass("loading");

            var errorMessage = null;
            if (!data) {
                errorMessage = "抱歉，无返回路线结果，请更换地点";
            } else if (data.status != "0") {
                errorMessage = "抱歉，无返回路线结果，请更换地点";
            }
            if (errorMessage) {
                alertContentOnTopSearch(errorMessage);
                return;
            }
            // 显示  “清除路线”
            $(".panel_top .route_page .cleanlines").show();
            // 生成HTML
            createDrivingLineScheme(data);
            // 设置导航策略样式
            var $targetTactics = $(".route_panel .route_driver .tactic_choose .item_list [data-tactics='" + searchLine.tactics + "']");
            $targetTactics.addClass("active").siblings().removeClass("active");
            // 显示面板
            var $routePanel = $(".route_panel");
            var $currentPanel = $routePanel.find(".route_driver").show();
            $currentPanel.siblings().hide();
            $currentPanel.find(".scheme_list").hide();
            $routePanel.show();
            $currentPanel.find(".scheme_list").slideDown(500);

        }
    });

}

/**
 * 生成驾车、步行搜索方案列表
 * @param data
 */
function createDrivingLineScheme(data) {
    var isWalk = searchLine.mode == "walk";
    if (isWalk) {
        $(".route_panel .route_driver").addClass("route_walk");
    } else {
        $(".route_panel .route_driver").removeClass("route_walk");
    }
    var $schemeList = $(".route_panel .route_driver .scheme_list");
    var $schemeHtml = $('<div class="scheme_item"></div>');
    $schemeHtml.append('<div class="scheme_header"></div>');
    $schemeHtml.append('<div class="step_list"></div>');
    var $schemeHeaderHtml = $schemeHtml.find(".scheme_header");
    $schemeHeaderHtml.append('<span class="title_prefix">'
        + '<span class="number"></span>'
        + '</span>');
    $schemeHeaderHtml.append('<div class="item_content">'
        + '<p class="item_title"></p>'
        + '<p class="item_detail">'
        + '<span class="shoucang"><img src="../imap_jw/images/img_1.gif" /></span> | '
        + '<span class="detail_info"></span>'
        + '</p>'
        + '</div>');
    $schemeHeaderHtml.append('<span class="item_fold"><img src="../imap_jw/images/img_1.gif" /></span>');

    // 默认步骤样式
    var $defaultStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
        + '</span>'
        + '<div class="step_content">'
        + '<span class="poi_name"></span>'
        + '</div>'
        + '</div>');
    var $busStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
        + '<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">'
            // + '<img class="icon icon_middle person" src="../imap_jw/images/img_1.gif">' // 全景图标
        + '</span>'
        + '<div class="step_content">'
        + '<span class="turn_info"></span>'
        + '进入'
        + '<span class="poi_name"></span>'
        + '，'
        + '<span class="desc_info"></span>'
        + '</div>'
        + '</div>');

    $schemeList.empty();

    // 解析input，判断线路是否收藏
    var lineData = parseLineData2collect("${num}");
    var lineDataKey = getCollectNaviLineKey(lineData);

    for (var i = 0; i < data.result.routes.length; i++) {
        var isCollectLine = false;
        if (lineDataKey) {
            var findKey = lineDataKey.replace("${num}", i);
            var rstData = collectNaviLines[findKey];
            isCollectLine = (rstData != null);
        }

        var $scheme = $schemeHtml.clone();
        var $header = $scheme.find(".scheme_header");

        if (isCollectLine) {
            $header.find(".item_content .shoucang").addClass("active");
        }

        // $header.find(".number").text(i+1);
        // 方案
        var scheme = data.result.routes[i];
        var start = searchLine.start;
        var end = searchLine.end;
        var tjdIndex = 0;
        var tjdName = [];
        var tjdLocation = [];
        if (!isWalk) {
            for (var j in searchLine.tjd) {
                if (searchLine.tjd[j]) {
                    tjdName.push(searchLine.tjd[j]);
                    tjdLocation.push({x: searchLine.tjdX[j], y: searchLine.tjdY[j]});
                }
            }
        }

        var descInfo = (searchLine.mode == "driver") ? "行驶" : "步行";

//		var detailInfo = (scheme.duration == null || scheme.duration == "") ? ""+metersToKilometers(scheme.distance) :
//			Math.round(scheme.duration / 60) + "分钟" + " | " + metersToKilometers(scheme.distance);
        var detailInfo = "";
        if (/\d+/.test("" + scheme.duration)) {
            var time = parseInt(scheme.duration);
            detailInfo += Math.round(time / 60) + "分钟 | "
        }
        detailInfo += metersToKilometers(scheme.distance);
        $header.find(".item_content .detail_info").text(detailInfo);

        var stepHtmlList = [];

        var lineNames = [];
        // 步骤
        for (var j = 0; j < scheme.steps.length; j++) {
//			debugger
            var step = scheme.steps[j];

            //当前返回的turn方向为该动作执行完之后的转向
            if (j > 0) {
                var laststep = scheme.steps[j - 1];
            }
            if (j == 0) {
                var turn = getTurnDirectionByTurn('0');
            } else {
                var turn = getTurnDirectionByTurn(laststep.turn);
            }

            var lineName = step.instruction;
            lineNames.push(step.instruction);
            // 在同一个公交站换乘，或者是地铁换乘地铁，step.path是""
            if (step.path == "") {
                continue;
            }
            connectNextStep(step, scheme.steps[j + 1]);

            var $stepHtml = null;

            var origin = step.stepOriginLocation;
            var destination = step.stepDestinationLocation;
            // 有可能没有此属性（步行）
            if (!origin || destination) {
                var paths = step.path.split(";");
                origin = paths[0];
                destination = paths[paths.length - 1];
            } else {
                origin = origin.lng + "," + origin.lat;
                destination = destination.lng + "," + destination.lat;
            }

            var distance = metersToKilometers(step.distance);
            $stepHtml = $busStepHtml.clone();
            $stepHtml.addClass(turn.directionClass);
            $stepHtml.data("data-path", step.path)
                .data("data-origin", origin)
                .data("data-destination", destination);
            $stepHtml.find(".poi_name").text(lineName).data("data-location", origin);

            //区分第一段线路方向
            if (j == 0) {
                $stepHtml.find(".turn_info").text('沿');
            } else {
                $stepHtml.find(".turn_info").text(turn.direction + '，');
            }

            $stepHtml.find(".desc_info").text(descInfo + "" + distance);

            $stepHtml.addClass("step_driver highlight");

//			debugger
            stepHtmlList.push($stepHtml);

            // 途经点
            if (step.ispasspoi == "1" && !isWalk) {
                var $stepThrough = $defaultStepHtml.clone();
                $stepThrough.addClass("step_through").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
                $stepThrough.find(".step_content .poi_name").text(tjdName[tjdIndex])
                    .data("data-location", tjdLocation[tjdIndex].x + "," + tjdLocation[tjdIndex].y);
                stepHtmlList.push($stepThrough);
                tjdIndex++;
            }
        }

        var linesInfo = "";
        var nameLength = lineNames.length;
        if (nameLength > 2) {
            linesInfo = lineNames[0] + " > ... > " + lineNames[nameLength - 1];
        } else {
            linesInfo = lineNames[0] + " > " + lineNames[nameLength - 1];
        }

        $header.find(".item_content .item_title").text(linesInfo);

        var $stepStart = $defaultStepHtml.clone();
        $stepStart.addClass("step_start").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepStart.find(".step_content .poi_name").text(searchLine.start)
            .data("data-location", searchLine.bgnX + "," + searchLine.bgnY);

        var $stepEnd = $defaultStepHtml.clone();
        $stepEnd.addClass("step_end").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepEnd.find(".step_content .poi_name").text(searchLine.end)
            .data("data-location", searchLine.endX + "," + searchLine.endY);

        var $stepList = $scheme.find(".step_list");
        $stepList.append($stepStart);
        for (var j in stepHtmlList) {
            $stepList.append(stepHtmlList[j]);
        }
        $stepList.append($stepEnd);
        $schemeList.append($scheme);

    }

    // 默认展开第一个方案
    var $allScheme = $schemeList.find(".scheme_item")
    if ($allScheme.length > 0) {
        var schemeIndex = searchLine.schemeIndex || 0;
        if (schemeIndex + 1 > $allScheme.length) {
            schemeIndex = 0;
        }
        $allScheme.eq(schemeIndex).find(".item_fold").click();
//		$allScheme.first().find(".item_fold").click();
    }
}

/**
 * 改变导航策略，使用changeLineListItem()代替
 * @param obj
 * @param tactics
 */
function changeLineListItemForDriving(obj, tactics) {
    var $this = $(obj);
    // 重复点击
    if ($this.hasClass("active")) {
        return;
    }

    cleanMapOverlays();

    $this.addClass("active").siblings().removeClass("active");

    var tactics = $this.attr("data-tactics")
    tactics = parseInt(tactics);
    searchLine.tactics = tactics || 11;

    // sendLineSearchRequestForDriving();
    searchLineByType();
}

/**
 * 改变驾车方案的 打开、关闭状态
 */
function changeSchemeListItemForDriving(obj) {
    var $this = $(obj);
    cleanMapOverlays();
    var $wrap = $this.parents(".scheme_item");
    $wrap.siblings().removeClass("open")
    if ($wrap.hasClass("open")) {
        $wrap.removeClass("open");
    } else {
        $wrap.addClass("open");
        var $steps = $wrap.find(".step_list .step");
        $steps = $steps/*.not(".step_start,.step_end")*/;
        checkStreetStationForDrivingSteps($steps);
        drawDrivingLines($steps);
    }
}

function drawDrivingLines($steps) {

    var isWalkRoute = $steps.parents(".route_driver").hasClass("route_walk");

    lineMarkers = [];
    polyLines = [];
    // 每个节点的小圆点
    polyLinesMarkers = [];

    $steps.each(function (index, obj) {
        var $this = $(this);
        var paths = $this.data("data-path") || $this.attr("data-path") || "";
        if (isNotNull(paths)) {
            paths = paths.split(";")
            if (paths[paths.length - 1] == "") {
                paths.pop();
            }

            var path = [];

            for (var i = 0; i < paths.length; i++) {
                var lnglat = paths[i].split(",");

                if (lnglat.length == 2) {
                    path.push(new LD.LngLat(lnglat[0], lnglat[1]));
                } else {
                    path = [];
                    break;
                }
            }

            if (path.length < 1) {
                return;
            }

            var polyLineOpts = {};
            var iswalking = isWalkRoute;
            if (iswalking) {
                // dashed虚线，solid实线
//				polyLineOpts.strokeStyle = LD.Constants.OVERLAY_LINE_DASHED;
                polyLineOpts = MAP_STYLE.line.green;
            } else {
                polyLineOpts = MAP_STYLE.line.blue;
            }

            var polyLine = mapView.addPolyline(path, polyLineOpts);
            polyLine.defOptions = polyLineOpts;
            polyLines.push(polyLine);
        }

        var startIcon = MAP_STYLE.icon.start;
        var endIcon = MAP_STYLE.icon.end;
        var throughIcon = MAP_STYLE.icon.through;

        var isPasspoi = $this.hasClass("step_through");

        var marker;

        if ($this.hasClass("step_start")) {
            var location = $this.find(".poi_name").data("data-location");
            location = location.split(",");
            // 起点
            marker = addIconMarkerForDriving({
                canOpen: true,
                icon: startIcon.icon,
                iconWidth: startIcon.iconWidth,
                iconHeight: startIcon.iconHeight,
                offsetX: startIcon.offsetX,
                offsetY: startIcon.offsetY,
                posX: location[0],
                posY: location[1],
                name: searchLine.start
            });

            polyLinesMarkers[index] = marker;
        } else if ($this.hasClass("step_end")) {
            var location = $this.find(".poi_name").data("data-location");
            location = location.split(",");

            // 终点
            marker = addIconMarkerForDriving({
                canOpen: true,
                icon: endIcon.icon,
                iconWidth: endIcon.iconWidth,
                iconHeight: endIcon.iconHeight,
                offsetX: endIcon.offsetX,
                offsetY: endIcon.offsetY,
                posX: location[0],
                posY: location[1],
                name: searchLine.end
            });

            polyLinesMarkers[index] = marker;
        } else
        // 途经点
        if (isPasspoi) {
            /*
             var tjdStepIndex = $(this).parent().children("[ispasspoi='1']").index(this);
             location = location.split(",");
             var offsetX = -236;
             var offsetY = -380;
             if (tjdStepIndex == 0) {
             offsetX = -1;
             offsetY = -453;
             }else if (tjdStepIndex == 1) {
             offsetX = -48;
             offsetY = -453;
             }else if (tjdStepIndex == 2) {
             offsetX = -95;
             offsetY = -453;
             }
             */
            var location = $this.find(".poi_name").data("data-location");
            location = location.split(",");
            marker = addIconMarkerForDriving({
                canOpen: true,
                icon: throughIcon.icon,
                iconWidth: throughIcon.iconWidth,
                iconHeight: throughIcon.iconHeight,
                offsetX: throughIcon.offsetX,
                offsetY: throughIcon.offsetY,
                posX: location[0],
                posY: location[1],
                name: $this.find(".poi_name").text()
            });

            polyLinesMarkers[index] = marker;
        }
        /* TODO 20160519 移除线路上的小圆圈
         else
         // 路段上的marker
         if (polyLinesMarkers[index] == null) {
         var location = $this.data("data-location");
         location = location.split(",");
         var name = $$this.find("form span").text();
         name = name.substring(name.indexOf(".") + 1);


         11*11
         -232 -388

         var opts = $.extend({
         canOpen : true,
         posX : location[0],
         posY : location[1],
         name : name
         }, MAP_STYLE.icon.lineNode);
         var lineMarker = addIconMarkerForDriving(opts);

         polyLinesMarkers[index] = lineMarker;

         }
         */
        if (marker) {
            lineMarkers.push(marker);
        }
    });

    if (lineMarkers.length > 0 && polyLines.length > 0) {
        //mapView.setCenter(lineMarkers[0].lon, lineMarkers[0].lat);
        var lnglats = [];
        for (var i in polyLines) {
            var path = polyLines[i].getPath();

            lnglats.push(path[0]);
            lnglats.push(path[path.length - 1])
        }
        mapView.setBestMap(lnglats);

        checkStreetStationForDrivingMarkers();
    }
}

/**
 * 点击对应的 起、经、终 行后，移动地图中心到对应marker
 */
function changeCenterMarkerForDriving(obj) {
    var $this = $(obj);
    var $allItem = $this.parent().children(":not([data-path])");
    var index = $allItem.index(obj);
    var marker = lineMarkers[index];

    mapView.setCenter(marker.lon, marker.lat)

    marker.click();
}

/**
 * 根据步骤列表的location，尝试获取stationID并且赋值，并且显示全景入口
 * @params $step 步骤List
 */
function checkStreetStationForDrivingSteps($step) {
    if (!MAP_CONFIG.STREET_MODE) {
        return;
    }
    var points = "";
    var $pois = $step.find(".poi_name");
    $pois.each(function (index) {
        points += ";" + $(this).data("data-location");
    });
    if (points.length > 0) {
        points = points.substring(1);
    } else {
        return;
    }

    if ($pois.filter("[station]").length > 0) {
        return;
    }

    var personImage = '<img class="icon icon_middle person" src="../imap_jw/images/img_1.gif">';
    checkStreetNearest(points, function (data) {
        if (data == null || data == "" || data == undefined) {
            return;
        }
//		var json = eval("("+data+")");
        var json = data;

        if (json && json.length > 0) {
            $.each(json, function (index, item) {
                checkStationCorrect(item.StationID, function () {
                    var $poi = $pois.eq(index);
                    $poi.attr("station", "true");
                    var $step = $poi.parents(".step");
                    var $img = $(personImage).attr("onclick", "toStationID(\"" + item.StationID + "\" ,event); return false;");
                    $step.find(".step_prefix").append($img);

                });
            });
        }
    })
}

/**
 * 根据 polyLinesMarkers 中每个marker的坐标，尝试获取stationID并且赋值
 */
function checkStreetStationForDrivingMarkers() {
    if (!MAP_CONFIG.STREET_MODE) {
        return;
    }

    for (var i in polyLinesMarkers) {
        // 只要有一个有stationid，则为已发送请求
        if (polyLinesMarkers[i].stationID != null) {
            return;
        }
    }

    var points = "";
    for (var i in polyLinesMarkers) {
        points += ";" + polyLinesMarkers[i].getPosition().lng + "," + polyLinesMarkers[i].getPosition().lat;
    }
    if (points.length > 0) {
        points = points.substring(1);
    } else {
        return;
    }

    checkStreetNearest(points, function (data) {
        if (data == null || data == "" || data == undefined) {
            return;
        }
//		var json = eval("("+data+")");
        var json = data;

        if (json && json.length > 0) {
            $.each(json, function (index, item) {
                var pline = polyLinesMarkers[index];
                if (pline) {
                    checkStationCorrect(item.StationID, function () {
                        pline.stationID = item.StationID;
                    });
                }
            });
        }
    });
}

function getTurnDirectionByTurn(type) {
    type = parseInt(type);
    var typeInfo = {};
    typeInfo.direction = "";
    typeInfo.directionClass = "";
    switch (type) {
//		case 0:
//			typeInfo.direction = "无效";
//			typeInfo.dclass = "";
//			break;
        case 0:
            typeInfo.direction = "直行";
            typeInfo.directionClass = "turn straight";
            break;
        case 1:
            typeInfo.direction = "直行";
            typeInfo.directionClass = "turn straight";
            break;
        case 2:
            typeInfo.direction = "右前方转弯";
            typeInfo.directionClass = "turn right_front";
            break;
        case 3:
            typeInfo.direction = "右转";
            typeInfo.directionClass = "turn turn_right";
            break;
        case 4:
            typeInfo.direction = "右后方转弯";
            typeInfo.directionClass = "turn right_back";
            break;
        case 5:
            typeInfo.direction = "掉头";
            typeInfo.directionClass = "turn turn_back";
            break;
        case 6:
            typeInfo.direction = "左后方转弯";
            typeInfo.directionClass = "turn left_back";
            break;
        case 7:
            typeInfo.direction = "左转";
            typeInfo.directionClass = "turn turn_left";
            break;
        case 8:
            typeInfo.direction = "左前方转弯";
            typeInfo.directionClass = "turn left_front";
            break;
        case 9:
            typeInfo.direction = "左侧";
            typeInfo.directionClass = "turn left_front";
            break;
        case 10:
            typeInfo.direction = "右侧";
            typeInfo.directionClass = "turn right_front";
            break;
        case 11:
            typeInfo.direction = "分歧-左";
            typeInfo.directionClass = "turn left_front";
            break;
        case 12:
            typeInfo.direction = "分歧中央";
            typeInfo.directionClass = "turn straight";
            break;
        case 13:
            typeInfo.direction = "分歧右";
            typeInfo.directionClass = "turn right_front";
            break;
        case 14:
            typeInfo.direction = "环岛";
            typeInfo.directionClass = "turn straight";
            break;
        case 15:
            typeInfo.direction = "进渡口";
            typeInfo.directionClass = "turn straight";
            break;
        case 16:
            typeInfo.direction = "出渡口";
            typeInfo.directionClass = "turn straight";
            break;
        default:
            break;
    }
    return typeInfo;
};
/**
 * 米、公里的转换，公里保留一位小数
 * @param distance
 * @returns 字符串
 */
function metersToKilometers(distance) {
    distance = parseInt(distance);
    return (distance + "").length > 3 ? (distance * 0.001).toFixed(1) + "公里" : distance + "米";
}

/**
 * 如果是驾车页面，需要有途经点
 */
// TODO 屏蔽途经点 20160229
function checkIsDrivingInput() {
    var lineType = checkLineType();

    if (lineType == 2) {
        $(".map_left_line_div .result_line .qi a").show();
        $(".map_left_line_div .result_line .jing").show();
    } else {
        $(".map_left_line_div .result_line .qi a").hide();
        $(".map_left_line_div .result_line .jing").hide();
    }
}

/**
 * 更改途经点的状态
 * @param obj a标签
 * @param status 1为增加途经点，2为删除途经点
 */
function changePassingPointStatus(obj, status) {
    var $through = $(".panel_top .route_input_form .route_through_list");
    var $addBtn = $through.siblings(".route_start").find(".route_addinput");
    var $btn = $(obj);
    // 途经点个数
    var tjdInputNum = 3;
    // 0、1、2
    var jingNum = $through.find(".route_through").length;
    // 最多3个途经点
    $addBtn.show();
    if (status == 1 && jingNum >= tjdInputNum - 1) {
        $addBtn.hide();
        if (jingNum >= tjdInputNum) {
            return;
        }
    }

    if (status == 1) {
        // 添加途经点
        addPassingPointContext(jingNum, "", "", "");
        addPassingPointErrorPageContext(jingNum, 1, 0);

        var jingHtml =
            '<div class="input_wrap route_through">'
            + '<span>经：</span>'
            + '<input name="" type="text" class="route_input" onkeyup="onSearchKeyUpForLine(event, \'.panel_top .route_search .route_through:eq(' + jingNum + ') .route_input\', \'#smartTopTip\');" placeholder="请输入途经点" autocomplete="off"/>'
            + '<div class="route_removeinput" onclick="changePassingPointStatus(this, 2);">'
            + '<img src="../imap_jw/images/leftpanel/icon_remove.png">'
            + '</div>'
            + '</div>';
        $through.append(jingHtml);

    } else if (status == 2) {
        var $input = $btn.parents(".route_through");
        var index = $input.index();
        // 移除对应索引的途经点变量
        removePassingPointContext(index);
        removePassingPointErrorPageContext(index);
        $input.remove();

        // 重新赋值eq
        $(".panel_top .route_search .route_through_list .route_through .route_input").each(function (index) {
            $(this).attr("onkeyup", 'onSearchKeyUpForLine(event, \'.panel_top .route_search .route_through:eq(' + index + ') .route_input\', \'#smartTip\');');
        });

        var $inputTag = $input.find(".route_input");
        var title = $inputTag.attr("title");
        var location = $inputTag.attr("data-location");
        var refresh = $(".all_panel .route_panel .route_driver").is(":visible");
        // 删除输入框后
        // 输入框为有效值，并且已经展开了导航结果的面板
        if (isNotNull(title) && isNotNull(location) && refresh) {
            // 重新验证并且搜索
            checkLineDataMatchToSearch();
        }
    }

    // 途径点输入框的增减需要重新计算面板高度
    initMapLeftPanel();
}

/**
 * 有提醒列表的话，刷新提醒列表
 */
function checkErrorListExistToRefresh() {

    if ($(".map_left_line_div .result_line_p_wrap:visible").length == 1) {
        var hasError = checkLineHasError();

        if (!hasError) {
            $(".map_left_line_div .result_line_p_wrap").hide();
        }

    }
}

/**
 * 删除途经点HTML元素
 */
function deleteTjdHtmlInputs() {
    var $through = $(".panel_top .route_input_form .route_through_list");
    var $addBtn = $through.siblings(".route_start").find(".route_addinput");
    var $tjdInputs = $through.find(".input_wrap");
    $tjdInputs.each(function (index) {
        removePassingPointContext(index);
        removePassingPointErrorPageContext(index);
    });
    $tjdInputs.remove();
    $addBtn.show();
}

/**
 * 添加途经点请求参数
 * @param tjd
 * @param tjdX
 * @param tjdY
 */
function addPassingPointContext(index, tjd, tjdX, tjdY) {
    searchLine.tjd[index] = tjd;
    searchLine.tjdX[index] = tjdX;
    searchLine.tjdY[index] = tjdY;
}

/**
 * 添加途经点提醒列表请求参数
 * @param page
 * @param count
 */
function addPassingPointErrorPageContext(index, page, count) {
    searchLineErrorPage.tjdPage[index] = page;
    searchLineErrorPage.tjdCount[index] = count;
}

/**
 * 根据索引移除对应途经点提醒列表数据
 * @param index 索引
 */
function removePassingPointErrorPageContext(index) {
    var tjdPage = [];
    var tjdCount = [];

    for (var i = 0; i < searchLineErrorPage.tjdPage.length; i++) {
        if (i == index) {
            continue;
        }

        tjdPage.push(searchLineErrorPage.tjdPage[i]);
        tjdCount.push(searchLineErrorPage.tjdCount[i]);
    }

    searchLineErrorPage.tjdPage = tjdPage;
    searchLineErrorPage.tjdCount = tjdCount;
}

/**
 * 根据索引移除对应途经点数据
 * @param index 索引
 */
function removePassingPointContext(index) {
    var tjd = [];
    var tjdX = [];
    var tjdY = [];
    for (var i = 0; i < searchLine.tjd.length; i++) {
        if (i == index) {
            continue;
        }

        tjd.push(searchLine.tjd[i]);
        tjdX.push(searchLine.tjdX[i]);
        tjdY.push(searchLine.tjdY[i]);
    }

    searchLine.tjd = tjd;
    searchLine.tjdX = tjdX;
    searchLine.tjdY = tjdY;
}

//==================================驾车导航结束==========================================//

function addIconMarkerForDriving(record) {
    var iconMarker = mapView.addMarker({
        editable: false,
        icon: record.icon,
        iconWidth: record.iconWidth,
        iconHeight: record.iconHeight,
        offsetX: record.offsetX,
        offsetY: record.offsetY,
//		lon : (record.posX * 1).toFixed(5),
//		lat : (record.posY * 1).toFixed(5),
        lon: record.posX * 1,
        lat: record.posY * 1,
        name: record.name,
        lineName: record.lineName,
        stationID: record.stationID,
        click: record.canOpen ? openSearchWindowForDriving : null
    });
    return iconMarker;
}

function openSearchWindowForDriving(e) {
    // 右键点击
    if (e && e.leftClick == false) {
        return false;
    }

    $("#smartTip").hide();
    var marker;
    if (this instanceof LD.Marker) {
        marker = this;

    } else {
        marker = arguments[0] instanceof LD.Marker ? arguments[0] : arguments[0].target;

    }

    closeInfoWindowForLine();
    // 获取索引
    // 有小圆圈就用 polyLinesMarkers
    // 没有就用 lineMarkers
//	var allMarkers = polyLinesMarkers;
    var allMarkers = lineMarkers;
    var index = $(allMarkers).index(marker);

    var sid = marker.stationID;

    var streetHtml = "";
    if (sid && sid != null && MAP_CONFIG.STREET_MODE) {
        streetHtml = '<div class="desc"><a href="javascript:void(0);" class="thumnail_link">'
            + '<img title="点击进入全景" class="thumnail" station-id="' + sid + '" src="' + MAP_CONFIG.STREET_SERVICE_URL + '/image/icon/' + sid + '?index=8"/>'
            + '</a></div>'
            + '<div class="desc_tip"><a title="点击进入全景" onclick="toStationID(\'' + sid + '\',event)">进入全景&gt;&gt;</a></div>';
    }

    // var change = '<a class="fangda" onclick="changeZoomAndLocationForTransitInfoWindow(this, ' + index + ')" style="color: #00BB00;">缩小</a>';

    var tools = '<div class="tools">'
        + '<div class="tool_tab_3" ' + (index == 0 ? ' style="color: #C7C7C7; cursor: default;" ' : ' onclick="changeLineMarkerWindowForDriving(' + (index - 1) + ');" ') + ' >上一步</div>'
            // 	+ '<span style="position: absolute; right: 110px;">|</span>'
        + '<div class="tool_tab_3">'
        + '<p class="suoxiao" onclick="changeZoomAndLocationForDrivingInfoWindow(this, ' + index + ')" ">放大</p>'
        + '</div>'
            // 	+ '<span style="position: absolute; left: 108px;">|</span>'
        + '<div class="tool_tab_3" ' + (index == allMarkers.length - 1 ? ' style="color: #C7C7C7; cursor: default;" ' : ' onclick="changeLineMarkerWindowForDriving(' + (index + 1) + ');" ') + ' >下一步</div>'
        + '</div>';

    var html = '<div class="infowindow" marker-id="' + marker.getId() + '">' +
        '<div class="infopanel">' +
        '<div class="title">' + marker.name + '<a title="关闭" old-zindex="' + marker.getZIndex() + '" class="close" href="javascript:void(0)" onclick="closeInfoWindowForLine(this);"> X </a></div>' +
        '<div class="content">' +
        '<div class="desc"><span>' + (marker.lineName || '&nbsp;') + '</span></div>' +
        streetHtml +
        '</div>' +
        tools +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';

    setTopMarkerChangeOtherMarker(marker, 20, 2);

    infoWindow = new LD.InfoWindow(html, {
        //size : new LD.Size(350, 230),
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
//		offset: new LD.Pixel(54, -marker.iconHeight),
        offset: new LD.Pixel(54, -marker.iconHeight),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });

    mapView.addOverlay(infoWindow);
    infoWindow.autoPan(true, [{x: 430, y: 60}, {x: 100, y: 60}]);
    //判断有无全景
    if (sid && sid != null && MAP_CONFIG.STREET_MODE) {

        $(".infowindow .thumnail").click(function (e) {
            var sid = $(this).attr("station-id");
            if (sid && sid != "") {
                toStationID(sid, e || event);
            }
        });
    }
}

/**
 * 根据索引决定对应marker显示infoWindow
 * @param index
 */
function changeLineMarkerWindowForDriving(index) {
    // 有小圆圈就用 polyLinesMarkers
    // 没有就用 lineMarkers

//	var markers = polyLinesMarkers;
    var markers = lineMarkers;
    if (index < 0) {
//		index = lineMarkers.length-1;

        return;
    } else if (index >= markers.length) {
//		index = 0;

        return;
    }

    markers[index].click(markers[index]);
}

/**
 * 放大：最大缩放级别（18级）<br />
 * 缩小：以路线路径为准的缩放级别, setBestMap(LD.LngLat[]);
 * @param obj
 * @param index marker的索引
 */
function changeZoomAndLocationForDrivingInfoWindow(obj, index) {
    var $this = $(obj);

    if ($this.hasClass("suoxiao")) {
        var marker = polyLinesMarkers[index];
//		mapView.setZoom(18);
        mapView.setCenter(marker.lon, marker.lat, 18);
        $this.text("缩小");
    } else if ($this.hasClass("fangda")) {
        var lnglats = [];
        for (var i = 0; i < polyLines.length; i++) {
            var path = polyLines[i].getPath();

            lnglats.push(path[0]);
            lnglats.push(path[path.length - 1])
        }
        mapView.setBestMap(lnglats);
        $this.text("放大");
    }

    $this.toggleClass("suoxiao fangda");

}

$(function () {
    checkIsDrivingInput();
});

//=======================================路线查询=================================================//
//kanhongyu 20150730
// var searchLineAPI = SEARCH_LINE_API;
var searchLine = {
    bgnX: "",
    bgnY: "",
    endX: "",
    endY: "",
    tjdX: [],
    tjdY: [],
    tjd: [],// 途经点
    start: "",// 起点
    end: "",// 终点
    city: "",
    // 导航策略 最短时间11，最短路径12...
    tactics: 11,
    // 公交 bus、驾车 driver、步行 walk
    mode: "bus",
    // 搜索结束时打开第几个方案的索引
    schemeIndex: 0,
    // 查询时验证失败则为false，xxms后可再次查询，true为正常查询
    trueButton: true,
    // 搜索按钮，开始搜索添加 loading class，再次点击无效
    // $(searchLine.searchButton).removeClass("loading"); 搜索成功移除loading class
    searchButton: ".panel_top .route_page .route_reckon"
};
/**
 * 验证起终点格式不规范时的提醒
 */
var searchLineErrorPage = {
    pageSize: 10,
    bgnPage: 1,
    endPage: 1,
    tjdPage: [],
    bgnCount: 0,
    endCount: 0,
    tjdCount: [],
    errorList: ".route_panel .error_content_list",
    // 暂时不用
    pageList: "",
    // 通过setTimeout和clearTimeout，判断最后一次调用showLineErrorList()函数
    lastTimeout: null
};
/**
 * 起点、终点、途经点
 */
var lineMarkers = [];
/**
 * 每段路线，方案中步骤的li对应
 */
var polyLines = [];
/**
 * 点击某段路线时，变颜色的线路
 */
var polyLinesOverlay = [];
/**
 * 鼠标移入某段路时线路变色，移出后清空
 */
var polyLineHover = null;
/**
 * 每段线路上对应的 起点、途经点、终点+圆点（*）
 */
var polyLinesMarkers = [];

/**
 * 根据 公交1、驾车2、步行3 查询路线
 */
function searchLineByType() {
    $("#smartTip").hide();
    if (!searchLine.trueButton) {
        return;
    }

    var $begin = $(".panel_top .route_input_form .route_start .route_input");
    var $end = $(".panel_top .route_input_form .route_end .route_input");
    if (!isNotNull($begin.val()) || !isNotNull($end.val())) {
        alertContentOnTopSearch("请输入起点和终点");
        return;
    }

    $(".all_panel .route_swap_panel").hide();

    //cleanMapOverlays();
    lineMarkers = [];
    polyLines = [];
    searchLineErrorPage.bgnPage = 1;
    searchLineErrorPage.endPage = 1;
    for (var i = 0; i < searchLine.tjd.length; i++) {
        searchLineErrorPage.tjdPage[i] = 1;
        searchLineErrorPage.tjdCount[i] = 0;
    }
    // 综合搜索历史记录的提示列表
    $(".panel_top .route_page .total2line_record").hide();
    var $routePanel = $(".route_panel").hide();
    $routePanel.siblings().hide();
    // 验证页面数据是否符合规则
    var checkResult = checkLineHasError();

    if (checkResult.hasError) {
        // 检查出错误则半秒后可再次点击
        searchLine.trueButton = false;
        setTimeout(function () {
            searchLine.trueButton = true;
        }, 500);
        // 显示模糊提示
        $routePanel.show();
        $routePanel.find(".error_choose").show().siblings().hide();
        return;
    }

    $(searchLine.searchButton).addClass("loading");

    // 模糊搜索提示列表
    $routePanel.find(".error_choose").hide();
    var $allSearchType = $(".route_panel");

    // 获取查询类型
    var type = checkLineType();

    searchLine.city = currentCity.cityname;
    searchLine.tactics = searchLine.tactics || 11;
    // 根据查询类型查询
    if (type == 1) {
        sendLineSearchRequestForTransit();

    } else if (type == 2) {
        // 如果搜索时途经点
        var $tjdInputs = $(".panel_top .route_search .route_through");
        for (var i in checkResult.tjd) {
            var result = checkResult.tjd[i];
            var index = result.tjdIndex;
            // 没有输入并且没有错误
            if (!isNotNull(result.inputVal) && !result.hasError) {
                $tjdInputs.eq(index).find(".route_removeinput").click();
            }
        }

        sendLineSearchRequestForDriving();

    } else if (type == 3) {
        sendLineSearchRequestForDriving();
    }

    // 添加历史记录
    addSearchRecord(checkResult);

//	checkLinePageHasScrollBarStatus();
}

/**
 * 公交路线查询
 */
function sendLineSearchRequestForTransit() {

    var searchLineStart = encodeURIComponent(searchLine.start);
    var searchLineEnd = encodeURIComponent(searchLine.end);
    var startParam = searchLineStart + "|" + searchLine.bgnX + "," + searchLine.bgnY;
    var endParam = searchLineEnd + "|" + searchLine.endX + "," + searchLine.endY;

    $.ajax({
        async: true,
        type: "GET",
        dataType: "jsonp",
        url: "{ipprot}/v3/route/bus?ak={ak}".replace("{ipprot}", window.leador_server_ipprot).replace("{ak}", window.leador_server_ak) + "&origin=" + startParam + "&destination=" + endParam
        + "&tactics=" + searchLine.tactics,
        success: function (data) {
            // 允许进行导航搜索
            $(searchLine.searchButton).removeClass("loading");
            // alertContentOnTopSearch
            var errorMessage = null;
            if (!data) {
                errorMessage = "抱歉，无返回路线结果，请更换地点";
            } else if (data.status == "10182") {
                errorMessage = "抱歉，起点附近没有公交站";
            } else if (data.status == "10183") {
                errorMessage = "抱歉，终点附近没有公交站";
            } else if (data.status == "10180") {
                // {"message":"起点终点步行距离过短，即步行可达","status":"10180"}
                $(".panel_top .route_page .route_choose .route_type.walk").click();
                return;
            } else if (data.status != "0") {
                errorMessage = "抱歉，无返回路线结果，请更换地点";
            }
            if (errorMessage) {
                alertContentOnTopSearch(errorMessage);
                return;
            }
            // 显示  “清除路线”
            $(".panel_top .route_page .cleanlines").show();
            // 第一个方案路程800m以内，则跳转到步行搜素
            for (var i in data.result.routes) {
                var scheme = data.result.routes[i].scheme[0];
                // scheme.distance = "500";
                if (/\d+/.test("" + scheme.distance) && parseInt(scheme.distance) <= 800) {
                    $(".panel_top .route_page .route_choose .route_type.walk").click();
                    return;
                }
            }
            // 生成HTML
            createTransitLineScheme(data);
            // 设置导航策略样式
            var $targetTactics = $(".route_panel .route_bus .tactic_choose .item_list [data-tactics='" + searchLine.tactics + "']");
            $targetTactics.addClass("active").siblings().removeClass("active");
            // 显示面板
            var $routePanel = $(".route_panel");
            var $currentPanel = $routePanel.find(".route_bus").show();
            $currentPanel.siblings().hide();
            $currentPanel.find(".scheme_list").hide();
            $routePanel.show();
            $currentPanel.find(".scheme_list").slideDown(500);
        }
    });

}

/**
 * 生成公交搜索方案列表
 * @param data
 */
function createTransitLineScheme(data) {
    var $schemeList = $(".route_panel .route_bus .scheme_list");
    var $schemeHtml = $('<div class="scheme_item"></div>');
    $schemeHtml.append('<div class="scheme_header"></div>');
    $schemeHtml.append('<div class="step_list"></div>');
    var $schemeHeaderHtml = $schemeHtml.find(".scheme_header");
    $schemeHeaderHtml.append('<span class="title_prefix">'
        + '<span class="number"></span>'
        + '</span>');
    $schemeHeaderHtml.append('<div class="item_content">'
        + '<p class="item_title"></p>'
        + '<p class="item_detail">'
        + '<span class="shoucang"><img src="../imap_jw/images/img_1.gif" /></span> | '
        + '<span class="detail_info"></span>'
        + '</p>'
        + '</div>');
    $schemeHeaderHtml.append('<span class="item_fold"><img src="../imap_jw/images/img_1.gif" /></span>');

    // 默认步骤样式
    var $defaultStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
//				+ '<span class="text_middle"></span>'
        + '</span>'
        + '<div class="step_content">'
        + '<span class="poi_name"></span>'
        + '</div>'
        + '</div>');
    var $busStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
        + '<img class="icon icon_top" src="../imap_jw/images/img_1.gif">'
        + '<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">'
        + '<img class="icon icon_bottom" src="../imap_jw/images/img_1.gif">'
        + '</span>'
        + '<div class="step_content">'
        + '<p class="step_title">'
        + '<span class="bus_name"></span>'
        + '<span class="right_extra"></span>'
        + '</p>'
        + '<p class="step_detail step_start"><span class="poi_name"></span> 上车</p>'
        + '<p class="step_detail step_end"><span class="poi_name"></span> 下车</p>'
        + '</div>'
        + '</div>');

    $schemeList.empty();

    // 解析input，判断线路是否收藏
    var lineData = parseLineData2collect("${num}");
    var lineDataKey = getCollectNaviLineKey(lineData);

    for (var i = 0; i < data.result.routes.length; i++) {
        var isCollectLine = false;
        if (lineDataKey) {
            var findKey = lineDataKey.replace("${num}", i);
            var rstData = collectNaviLines[findKey];
            isCollectLine = (rstData != null);
        }
        var $scheme = $schemeHtml.clone();
        var $header = $scheme.find(".scheme_header");

        if (isCollectLine) {
            $header.find(".item_content .shoucang").addClass("active");
        }

        $header.find(".number").text(i + 1);
        // 方案
        var scheme = data.result.routes[i].scheme[0];
        var start = searchLine.start;
        var end = searchLine.end;

        var lines = [];
        var linesInfo = "";
        // 获取步骤中的线路
        for (var j in scheme.steps) {
            var step = scheme.steps[j];

            if (step.vehicle.name != null) {
//			if (step.vehicle != null) {
                var info = step.vehicle.name;
//				var type = step.vehicle.type;
                var type = step.type;
                var other = info.substring(info.indexOf("("));
                info = info.slice(0, info.indexOf("("));

                // type  3公交  5步行  7地铁
                if (type == "3") {
                    info += "路";
                    step.vehicle.name = info + other;
                }

                lines.push(info);
            }
        }
        if (lines.length > 0) {
            linesInfo = lines.join(" > ");
        } else {
            linesInfo = "没有乘车";
        }
        $header.find(".item_content .item_title").text(linesInfo);
//		var detailInfo = (scheme.duration == null || scheme.duration == "") ? ""+metersToKilometers(scheme.distance) :
//			Math.round(scheme.duration / 60) + "分钟" + " | " + metersToKilometers(scheme.distance);
        var detailInfo = "";
        if (/\d+/.test("" + scheme.duration)) {
            var time = parseInt(scheme.duration);
            detailInfo += Math.round(time / 60) + "分钟 | "
        }
        detailInfo += metersToKilometers(scheme.distance);
        $header.find(".item_content .detail_info").text(detailInfo);

        var stepHtmlList = [];

        // 步骤
        for (var j = 0; j < scheme.steps.length; j++) {
            var step = scheme.steps[j];
            var prevStep = scheme.steps[j - 1];
            var nextStep = scheme.steps[j + 1];
            // 在同一个公交站换乘，或者是地铁换乘地铁，step.path是""
//			if(step.path==""){
//				continue;
//			}
            connectNextStep(step, nextStep);

            var $stepHtml = null;

            var origin = step.stepOriginLocation || "";
            var destination = step.stepDestinationLocation || "";
            if (isNotNull(origin)) {
                origin = origin.lng + "," + origin.lat;
            }
            if (isNotNull(destination)) {
                destination = destination.lng + "," + destination.lat;
            }

            var distance = metersToKilometers(step.distance);
            // type  3公交  5步行  7地铁
            if (step.type == "5") {
                $stepHtml = $defaultStepHtml.clone();
                $stepHtml.addClass("step_walk").data("data-path", step.path || "");
                // 当前是步行，并且下一步和上一步都是地铁，添加“站内换乘”
                if (prevStep && nextStep && prevStep.type == "7" && nextStep.type == "7") {
                    $stepHtml.find(".step_content").text("站内换乘");
                } else {
                    $stepHtml.find(".step_content").text("步行 " + distance);
                }
            } else {
                var stopnums = parseInt(step.vehicle.stop_num) + 1;
                $stepHtml = $busStepHtml.clone();
                $stepHtml.data("data-path", step.path)
                    .data("data-origin", origin)
                    .data("data-destination", destination);
                $stepHtml.find(".step_title .bus_name").text(step.vehicle.name);
                $stepHtml.find(".step_title .right_extra").text(stopnums + "站");
                // poi可点
                $stepHtml.find(".step_start .poi_name").attr("data-location", origin)
                    .text(step.vehicle.start_name);
                $stepHtml.find(".step_end .poi_name").attr("data-location", destination)
                    .text(step.vehicle.end_name);
                $stepHtml.find(".poi_name").attr("onclick", "openMarkerInfoWindowForTransit(event);");

                // step.vehicle.type   0为日常公交，1为地铁
                // 目前此字段都为0
//				$stepHtml.attr("data-road-type", step.vehicle.type);

                $stepHtml.attr("data-road-type", step.type == "7" ? 1 : 0);
                if (step.type == "7") {
                    $stepHtml.addClass("step_subway");
                } else {
                    $stepHtml.addClass("step_bus");
                }

            }
            $stepHtml.addClass("highlight");
            stepHtmlList.push($stepHtml);
        }

        var $stepStart = $defaultStepHtml.clone();
        // <img class="icon icon_middle" src="../imap_jw/images/img_1.gif">
        $stepStart.addClass("step_start").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepStart.find(".step_content .poi_name").text(searchLine.start)
            .data("data-location", searchLine.bgnX + "," + searchLine.bgnY)
            .attr("onclick", "openMarkerInfoWindowForTransit(event);");

        var $stepEnd = $defaultStepHtml.clone();
        $stepEnd.addClass("step_end").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepEnd.find(".step_content .poi_name").text(searchLine.end)
            .data("data-location", searchLine.endX + "," + searchLine.endY)
            .attr("onclick", "openMarkerInfoWindowForTransit(event);");

        var $stepList = $scheme.find(".step_list");
        $stepList.append($stepStart);
        for (var j in stepHtmlList) {
            $stepList.append(stepHtmlList[j]);
        }
        $stepList.append($stepEnd);
        $schemeList.append($scheme);
    }
    // 与changeLeftPanelStatus中的显示时间一样，显示效果最好
    setTimeout(function () {
        // 默认展开第一个方案
        var $allScheme = $schemeList.find(".scheme_item")
        if ($allScheme.length > 0) {
            var schemeIndex = searchLine.schemeIndex || 0;
            if (schemeIndex + 1 > $allScheme.length) {
                schemeIndex = 0;
            }
            $allScheme.eq(schemeIndex).find(".item_fold").click();
            //		$allScheme.first().find(".item_fold").click();
        }
    }, 300);
}

/**
 * 改变公交方案的 打开、关闭状态
 */
function changeSchemeListItemForTransit(obj) {
    var $this = $(obj);

    //cleanMapOverlays();
    var $wrap = $this.parents(".scheme_item");
    $wrap.siblings().removeClass("open")
    if ($wrap.hasClass("open")) {
        $wrap.removeClass("open");
    } else {
        var $scrollPanel = $this.parents(".map_left_panel");
        // 之前的item
        var $prevAll = $wrap.prevAll();
        // 选择列表的高度
        var chooseHeight = $scrollPanel.find(".route_bus .tactic_choose").height();

        var top = $prevAll.outerHeight(true) * $prevAll.length;
        // 第一个item则滚到顶部
        if (top == 0) {
            chooseHeight = 0;
        } else {
            //加上自己的
            // margin-top  || margin-bottom
            top += ($wrap.outerHeight(true) - $wrap.outerHeight());
        }
        top += chooseHeight;
        // 不太准
//		var top = $wrap.position().top + 10;

        $wrap.addClass("open");
        var $steps = $wrap.find(".step_list .step");
        $steps = $steps.not(".step_start,.step_end,.step_through");
        //drawTransitLines($steps);

        $scrollPanel.animate({scrollTop: top}, 300);
    }
}


/**
 * 根据鼠标移入、移出步骤li，更改polyLine的颜色
 * @param isHover true显示、false删除
 */
/*function changeLineHoverColor(obj, isHover){
 isHover = isHover == null ? true : isHover;
 mapView.removeOverlay(polyLineHover);
 polyLineHover = null;

 // this --> .step_list .step
 var $this = $(obj);
 var path = $this.data("data-path") || $this.attr("data-path");
 if(!$this.is(".step_start,.step_end,.step_through") && isNotNull(path) && isHover){
 var paths = [];
 path = path.split(";");
 for(var i in path){
 var lnglat = path[i].split(",");
 paths.push(new LD.LngLat(lnglat[0],lnglat[1]));
 }
 style = $.extend({}, MAP_STYLE.line.red);
 style.strokeOpacity = 0.8;
 polyLineHover = mapView.addPolyline(paths, style);
 }
 // 阻止事件冒泡
 return false;
 }*/

/**
 * 根据步骤li，更改polyLine的颜色
 */
function changeLineColor(obj) {
    var $this = $(obj);
    $this.parents(".step_list");
    var $allSteps = $this.parents(".step_list").find(".step").not(".step_start,.step_end,.step_through");
    var index = $($allSteps).index($this);

    var polyLine = polyLines[index];
//	if(!polyLine || !polyLine.defOptions){
//		return ;
//	}
    style = $.extend({}, MAP_STYLE.line.red, {
        bestmap: true
    });

    // 只能有一段有色线段，其他移除
    var line = polyLinesOverlay[index];
    // 再次点击，取消变色
    if (line != null) {
        var line = polyLinesOverlay[index];
        mapView.removeOverlay(line);
        polyLinesOverlay[index] = null;
    } else {
        // 清空其他线
        for (var i in polyLinesOverlay) {
            var colorLine = polyLinesOverlay[i];
            if (colorLine != null) {
                mapView.removeOverlay(colorLine);
                polyLinesOverlay[i] = null;
            }
        }
        // 第一次被点击，变色
        line = mapView.addPolyline(polyLine.getPath(), style);
        polyLinesOverlay[index] = line;

    }

    // 阻止事件冒泡
    return false;
}

/**
 * 比较input中value和title是否相同
 * @return {Boolean} true为相同
 */
function checkValueEqualTitle(obj) {
    var $this = $(obj);
    var isEqual = false;
    isEqual = $this.val() == $this.attr("title");
    if (!isNotNull($this.attr("title"))) {
        isEqual = false;
    }

    return isEqual;
}

/**
 * 检查是否有错误，若有错误，则显示提醒列表
 * @returns {Boolean} true为有错误
 */
function checkLineHasError() {
    var $begin = $(".panel_top .route_input_form .route_start .route_input");
    var beginVal = $begin.val();
    var $end = $(".panel_top .route_input_form .route_end .route_input");
    var endVal = $end.val();
    var $jingList = $(".panel_top .route_search .route_through .route_input");
    if (checkValueEqualTitle($begin[0])) {
        beginVal = $begin.attr("title");
    }

    if (checkValueEqualTitle($end[0])) {
        endVal = $end.attr("title");
    }
    // 验证输入框值
    var result = checkLineDataResult();

    var $errorList = $(searchLineErrorPage.errorList);

    if (result.hasError == false) {

        return result;
    }
    var $bg = createErrorListHtml();
    var $ed = createErrorListHtml();

    $bg.attr("is", "begin").find(".error_title").attr("title", beginVal);
    $bg.find(".content").text("起点：" + beginVal);
    $ed.attr("is", "end").find(".error_title").attr("title", endVal);
    $ed.find(".content").text("终点：" + endVal);

    var $bgList = $errorList.find(".error_start");
    var $edList = $errorList.find(".error_end");
    $bgList.html($bg);
    $edList.html($ed);

    var $thList = $errorList.find(".error_through");
    $thList.empty();
    for (var i in result.tjd) {
        var tjd = result.tjd[i];
        i = parseInt(i);
        if (!tjd || !isNotNull(tjd.inputVal)) {
            continue;
        }
        var $th = createErrorListHtml();
        if (tjd.hasError) {
            $th.addClass("doubt");
        } else {
            $th.addClass("success");
        }
        $th.attr("is", "jing" + i).find(".error_title").attr("title", tjd.inputVal);
        $th.find(".content").text("途经点 " + (i + 1) + "：" + tjd.inputVal);
        $thList.append($th)
    }

    if (result.begin.hasError) {
//	if (result.begin != null) {
        var error = result.begin.error;
        $bg.addClass("doubt");
        showLineErrorList({check: error.check});
    } else {
        $bg.addClass("success");
    }

    if (result.tjd.length > 0) {
        for (var i in result.tjd) {
            var tjd = result.tjd[i];

            showLineErrorList({
                check: 3,
                tjdIndex: tjd.tjdIndex,
                proto: tjd
            });
        }
    }

    if (result.end.hasError) {
        $ed.addClass("doubt");
        var error = result.end.error;
        showLineErrorList({check: error.check});
    } else {
        $ed.addClass("success");
    }


    return result;
}

function createErrorListHtml() {
    var $div = $("<div></div>").addClass("error_wrap");
    var $title = $("<div></div>").addClass("error_title");
    $title.append('<span class="title_prefix"><img src="../imap_jw/images/img_1.gif"></span>');
    $title.append('<span class="content"></span>');
    $title.append('<span class="error_fold"><img src="../imap_jw/images/img_1.gif"></span>');
    $div.append($title);
    $("<ul></ul>").addClass("error_list").appendTo($div);

    var $page = $("<div></div>").addClass("page-number-list");
    $("<div></div>").addClass("page-number").append('<span class="page-text">1/5</span>页').appendTo($page);
    var $pageControl = $("<div></div>").addClass("page-control");
    $("<div></div>").addClass("page-control-index").attr("onclick", "changeErrorPage(this, 1);").text("首页").appendTo($pageControl);
    $("<div></div>").addClass("page-control-prev").attr("title", "上一页").attr("onclick", "toPrevErrorPage(this);").appendTo($pageControl);
    $("<div></div>").addClass("page-control-next").attr("title", "下一页").attr("onclick", "toNextErrorPage(this);").appendTo($pageControl);
    $page.append($pageControl);

    $div.append($page);

    return $div;
}

/**
 * 根据输入框进行检查
 * @returns 储存了检查结果
 */
function checkLineDataResult() {
    // 设置请求的参数
    setSearchLineParam();
    // 起点有问题则为1，终点2，途经点3（并且加索引tjdIndex）
    var check = 0;
    // {check, tjdIndex(若是途经点的话)}
    var result = {
        hasError: false,
        begin: {hasError: false, error: {check: 1}, title: null, location: null, inputVal: null},
        end: {hasError: false, error: {check: 2}, title: null, location: null, inputVal: null},
        tjd: []
    };

    var $begin = $(".panel_top .route_input_form .route_start .route_input");
    var $end = $(".panel_top .route_input_form .route_end .route_input");
    var $jingList = $(".panel_top .route_search .route_through .route_input");

    // 检查起点是否设置
    // 检查起点值是否被改变

    if (!isNotNull($begin.attr("data-location")) || !checkValueEqualTitle($begin[0])) {
        check = 1;
        result.begin.hasError = true;
    }
    result.begin.title = $begin.attr("title");
    result.begin.location = $begin.attr("data-location");
    result.begin.inputVal = $.trim($begin.val());

    // 检查终点是否设置
    // 检查终点值是否被改变
    if (!isNotNull($end.attr("data-location")) || !checkValueEqualTitle($end[0])) {
        check = 2;
        result.end.hasError = true;
    }
    result.end.title = $end.attr("title");
    result.end.location = $end.attr("data-location");
    result.end.inputVal = $.trim($end.val());

    var lineType = checkLineType();
    // 驾车
    if (lineType == 2) {
        // 检查途经点是否设置
        // 检查途经点值是否被改变
        $jingList.each(function (index) {
            var tjd = searchLine.tjd[index];
//			var tjdX = searchLine.tjdX[index];
//			var tjdY = searchLine.tjdY[index];
            var tjdVal = $.trim($(this).val());

            // 没有选择地点
            // 值被改变
            var tjdHasError = false;

            // 刚添加的途经点,没有选择，有输入
            if (tjd == null) {
                // 已经输入
                if (tjdVal != "") {
                    tjdHasError = true;
                }
            }
            // 被改变的途经点，已选择，输入值被改变
            else {
                // 输入值被清空
                if (tjdVal == "") {
                    searchLine.tjd[index] = null;
                    searchLine.tjdX[index] = null;
                    searchLine.tjdY[index] = null;
                    $(this).removeAttr("data-location");
                    $(this).removeAttr("title");
                } else
                // 输入值跟选择值不相同
                if (!checkValueEqualTitle(this) || !isNotNull($(this).attr("data-location"))) {
                    tjdHasError = true;
                }
            }

            // 若途经点值不合规则
            var tjdProto = {
                hasError: false,
                tjdIndex: index,
                error: {
                    check: 3
                },
                title: $(this).attr("title"),
                location: $(this).attr("data-location"),
                inputVal: tjdVal
            }
            if (tjdHasError) {
                check = 3;
                tjdProto.hasError = true;
            }
            result.tjd.push(tjdProto);
        });

    }

    if (check != 0) {
        result.hasError = true;
    }

    return result;
}

/**
 * 根据 起点和终点，途经点 设置请求参数
 */
function setSearchLineParam() {
    var $start = $(".panel_top .route_input_form .route_start .route_input");
    var $end = $(".panel_top .route_input_form .route_end .route_input");

    searchLine.start = $start.attr("title");
    searchLine.end = $end.attr("title");

    var beginLocation = $start.attr("data-location");
    var endLocation = $end.attr("data-location");

    if (isNotNull(beginLocation)) {
        beginLocation = beginLocation.split(",");
        searchLine.bgnX = beginLocation[0];
        searchLine.bgnY = beginLocation[1];

    }

    if (isNotNull(endLocation)) {
        endLocation = endLocation.split(",");
        searchLine.endX = endLocation[0];
        searchLine.endY = endLocation[1];

    }

    // 途经点部分
    var $jingList = $(".panel_top .route_input_form .route_through_list .route_input");
    $jingList.each(function (index) {
        var $this = $(this);
        var tjd = $this.attr("title");
        var dataPath = $this.attr("data-location") + "";
        dataPath = dataPath.split(",");
        var tjdX;
        var tjdY;
        if (dataPath.length == 2) {
            tjdX = dataPath[0];
            tjdY = dataPath[1];
        }
        // 只有数据不同才添加参数
        if (searchLine.tjdX[index] == null || searchLine.tjdX[index] != tjdX) {
            addPassingPointContext(index, tjd, tjdX, tjdY);
        }

    });

}

/**
 * 起点 or 终点 or 途经点 有问题时，提示请选择地点
 * @param error {check:必须（1：起点；2：终点；3：途经点）, tjdIndex: 问题途经点的索引}
 * @param fromPage 为true则为从页码进行的搜索，不验证是否为最后一次请求
 */
function showLineErrorList(error, fromPage) {
    // 显示提醒列表的部分（起点，终点，途经点，选项）
    var $errorList = $(searchLineErrorPage.errorList);
    // 显示页码的部分
//	var $pageList = $(searchLineErrorPage.pageList);
    var $pageList = null;
    // 点击选项后，将data-path和title设置到哪里（jquery选择器）
    var target;
    // 搜索的关键字，以起点栏等中的title为准
    var val;
    // 根据此属性便于隐藏（起点或终点）部分
    var belongTo;
    // 当前页码
    var page;
    // 当前列表的总条数
    var count;
    // 当前有问题的栏目(起点、终点、途经点1.2...)
    var $nowErrorItem;
    // 当前的搜索类型  公交1，驾车2，步行3
    var lineType = checkLineType();
    // 设为起点、终点、途经点
    var belongToText = "";

    //
    $errorList = $(searchLineErrorPage.errorList);

    if (error.check == 1) {
        $nowErrorItem = $errorList.find(".error_start .error_wrap");
        target = ".panel_top .route_search .route_start .route_input";
        val = $nowErrorItem.find(".error_title").attr("title");
        belongTo = "begin";
        page = searchLineErrorPage.bgnPage;
        $pageList = $nowErrorItem.find(".page-number-list");
        belongToText = "起点";

    } else if (error.check == 2) {
        $nowErrorItem = $errorList.find(".error_end .error_wrap");
        target = ".panel_top .route_search .route_end .route_input";
        val = $nowErrorItem.find(".error_title").attr("title");
        belongTo = "end";
        page = searchLineErrorPage.endPage;
        $pageList = $nowErrorItem.find(".page-number-list");
        belongToText = "终点";

    } else if (error.check == 3) {
        var tjdIndex = error.tjdIndex;

        $nowErrorItem = $errorList.find(".error_through .error_wrap[is='jing" + tjdIndex + "']");
        target = ".panel_top .route_search .route_through:eq(" + tjdIndex + ") .route_input";
        val = $nowErrorItem.find(".error_title").attr("title");
        belongTo = "jing" + tjdIndex;
        page = searchLineErrorPage.tjdPage[tjdIndex];
        $pageList = $nowErrorItem.find(".page-number-list");
        belongToText = "途经点";
    }

    if (val == null || val == "") {
        return;
    }

    _onSuggestSearch(val, errorHandler, true, {"page_size": searchLineErrorPage.pageSize, "page_num": page});

    function errorHandler(data) {
        // 按class区分状态
        // success为未检查到错误
        // doubt为有模糊数据
        // error为没有模糊数据
        if (data.status != 0 || !data.results || data.results.length == 0) {
            $nowErrorItem.removeClass("success doubt error").addClass("error");
        } else {
            $nowErrorItem.find(".error_list").empty();
        }
        /**
         * 每页的实际数据条数
         */
        var pageCount = 0;
        // data.results.length == 0
        if (data && data.results && data.results.length > 0) {
            pageCount = data.results.length;
            // 记录总个数
            if (error.check == 1) {
                count = searchLineErrorPage.bgnCount = data.total;
            } else if (error.check == 2) {
                count = searchLineErrorPage.endCount = data.total;
            } else if (error.check == 3) {
                count = searchLineErrorPage.tjdCount[error.tjdIndex] = data.total;
            }

            var searchTipResults = data.results;
            $errorList = $nowErrorItem.find(".error_list");
            for (var i = 0; i < searchTipResults.length; i++) {
                var result = searchTipResults[i];
                var lon = result.location.lng;
                var lat = result.location.lat;
                var result_name = result.name;
                var iaddress = result.address || "";
                var itemHtml = '<li class="error_list_item" title="' + result.name
                    + '" data-location="' + lon + ',' + lat + '\"'
                    + ' >'
                    + '<p class="number bubble' + i + '" >' + (i + 1) + '</p>'
                    + '<div class="adress">'
                    + '<p class="address_name">'
                    + result_name
                    + '</p>'
                    + '<p class="address_info">' + iaddress + '</p>'
                    + '</div>'
                    + '<span class="item_choose" onclick="chooseSearchItemForErrorListItem($(this).parent()[0], \'' + target + '\');">设为' + belongToText + '</span>'
                    + '</li>';
                $errorList.append(itemHtml);
            }

            $errorList.append("<div class=\"clearfix\"></div>")

            // 页码部分
            createErrorPageList($pageList, count, page);
            // 页码部分结束
        }

        // 从页码进行的搜索
        if (fromPage) {
            return;
        }
        // 100ms内没有再次回调，判断为最后
        clearTimeout(searchLineErrorPage.lastTimeout);
        searchLineErrorPage.lastTimeout = null;
        searchLineErrorPage.lastTimeout = setTimeout(function () {
            var $first = $(searchLineErrorPage.errorList).find(".error_wrap.doubt").first();
            $first.addClass("open");
        }, 100);
    }

}

/**
 * 创建分页页码
 * @param $pageList
 * @param count 总页数
 * @param page 当前页码
 */
function createErrorPageList($pageList, count, page) {
//	$pageList.empty();
    count = parseInt(count || 0);
    var totalPage = (count +
        searchLineErrorPage.pageSize - 1) / searchLineErrorPage.pageSize;
    totalPage = parseInt(totalPage);
    if (totalPage == 0) {
        page = 0;
    }

    checkPageNumberStyle($pageList, page, totalPage);
}

/**
 * 根据页码读取对应页
 * @param obj
 * @param pageNo 页码
 */
function changeErrorPage(obj, pageNo) {
    var page = parseInt(pageNo);

    var belongTo = $(obj).parents(".error_wrap[is]").attr("is");
    var check;

    var tjdIndex;
    var regex = /^jing\d+$/;

    if (belongTo == "begin") {
        check = 1;
        searchLineErrorPage.bgnPage = page;

    } else if (belongTo == "end") {
        check = 2;
        searchLineErrorPage.endPage = page

    } else if (regex.test(belongTo)) {
        check = 3;
        tjdIndex = parseInt(belongTo.substr(4));
        searchLineErrorPage.tjdPage[tjdIndex] = page;

    }

    showLineErrorList({check: check, tjdIndex: tjdIndex}, true);
}

function toPrevErrorPage(obj) {
    var belongTo = $(obj).parents(".error_wrap[is]").attr("is");
    var check;
    var match = false;

    var tjdIndex;
    var regex = /^jing\d+$/;

    if (belongTo == "begin") {
        check = 1;
    } else if (belongTo == "end") {
        check = 2;
    } else if (regex.test(belongTo)) {
        check = 3;
    }

    if (check == 1) {
        if (searchLineErrorPage.bgnPage > 1) {
            searchLineErrorPage.bgnPage--;
            match = true;
        }

    } else if (check == 2) {
        if (searchLineErrorPage.endPage > 1) {
            searchLineErrorPage.endPage--;
            match = true;
        }
    } else if (check == 3) {
        tjdIndex = parseInt(belongTo.substr(4));
        if (searchLineErrorPage.tjdPage[tjdIndex] > 1) {
            searchLineErrorPage.tjdPage[tjdIndex]--;
            match = true;
        }

    }

    if (!match) {
        return;
    }
    showLineErrorList({check: check, tjdIndex: tjdIndex}, true);

}

function toNextErrorPage(obj) {

    var belongTo = $(obj).parents(".error_wrap[is]").attr("is");
    var check;
    var count;
    var match = false;

    var tjdIndex;
    var regex = /^jing\d+$/;


    if (belongTo == "begin") {
        check = 1;
        count = searchLineErrorPage.bgnCount;

    } else if (belongTo == "end") {
        check = 2;
        count = searchLineErrorPage.endCount;
    } else if (regex.test(belongTo)) {
        check = 3;
        tjdIndex = parseInt(belongTo.substr(4));
        count = searchLineErrorPage.tjdCount[tjdIndex];

    }
    count = parseInt(count);

    var totalPage = (count +
        searchLineErrorPage.pageSize - 1) / searchLineErrorPage.pageSize;
    totalPage = parseInt(totalPage);

    if (check == 1) {
        if (searchLineErrorPage.bgnPage < totalPage) {
            searchLineErrorPage.bgnPage++;
            match = true;
        }

    } else if (check == 2) {
        if (searchLineErrorPage.endPage < totalPage) {
            searchLineErrorPage.endPage++;
            match = true;
        }
    } else if (check == 3) {
        if (searchLineErrorPage.tjdPage[tjdIndex] < totalPage) {
            searchLineErrorPage.tjdPage[tjdIndex]++;
            match = true;
        }
    }

    if (!match) {
        return;
    }
    showLineErrorList({check: check, tjdIndex: tjdIndex}, true);

}

/**
 * 改变 起点，终点，途经点 的展开状态
 */
function changeErrorListItem(obj) {
    /*
     var $this = $(obj).parents("[isopen]");
     //	var $notFound = $this.siblings("[status='0']");

     var isOpen = $this.attr("isopen") == "true";

     $this.siblings("[isopen][is]").attr("isopen", "false");

     if (isOpen) {
     $this.attr("isopen", "false");
     }else {
     $this.attr("isopen","true");
     }
     */
    var $this = $(obj);
    var $wrap = $this.parents(".error_wrap");
    if (!$wrap.hasClass("open")) {
        $wrap.addClass("open");
    } else {
        $wrap.removeClass("open");
    }
    var $parent = $this.parents(".error_content_list");
    $parent.find(".error_wrap").not($wrap).removeClass("open");

}

/**
 * 查询 选择的查询类型，公交1 驾驶2 步行3
 * 默认为0，当前不在线路搜索面板
 */
function checkLineType() {
    var $routePage = $(".panel_top .route_page:visible");
    var $choose = $routePage.find(".route_choose .route_type.active");
    var type = 0;

    if ($choose.hasClass("bus")) {
        type = 1;
    } else if ($choose.hasClass("driver")) {
        type = 2;
    } else if ($choose.hasClass("walk")) {
        type = 3;
    }

    return type;
}

/**
 * 切换 公交、驾车、步行 的导航策略，以及选中状态
 * data-tactics 导航策略 11最少时间，12最短路径 等
 * @param obj
 */
function changeLineListItem(obj) {
    var $this = $(obj);
    // 重复点击
    if ($this.hasClass("active")) {
        return;
    }

    //cleanMapOverlays();

    $this.addClass("active").siblings().removeClass("active");

    var tactics = $this.attr("data-tactics")
    tactics = parseInt(tactics);
    searchLine.tactics = tactics || 11;

    //sendLineSearchRequestForTransit();
    searchLineByType();
}

/**
 * 带有竖线的公交搜索tab切换
 * @param obj 本身
 * @param hideVerticalLine true隐藏竖线，默认隐藏竖线
 */
function changeTransitTabStatus(obj, hideVerticalLine) {
    hideVerticalLine = hideVerticalLine == null ? true : hideVerticalLine;

    if (obj instanceof jQuery) {
        obj = obj[0];
    }

    var $target = $(obj).prev();

    if (hideVerticalLine) {
        $target.find("span").css("visibility", "hidden");
        var $onPrev = $(obj).siblings(".chose_four_on").prev();
        $target.siblings().not($onPrev).find("span").css("visibility", "visible");
    } else {
        // 不是选中状态，显示竖线
        if (!$(obj).hasClass("chose_four_on")) {
            $target.find("span").css("visibility", "visible");
        }
    }
}

/**
 * 检查路线查询输入框的坐标是否重复
 */
function checkInputLocationRepeat() {
    var lmap = {};
    var result = false;
    $(".map_left_line_div .result_line .qi_iput").each(function () {
        var $this = $(this);
        var location = $this.attr("data-location");
        if (!isNotNull(location)) {
            return true;
        }
        if (lmap[location]) {
            result = true;
            return false;
        }
        lmap[location] = true;
    });

    return result;
}

//======================================路线查询结束================================================//

function addIconMarkerForTransit(record) {
    var iconMarker = mapView.addMarker({
        editable: false,
        icon: record.icon,
        iconWidth: record.iconWidth,
        iconHeight: record.iconHeight,
        offsetX: record.offsetX,
        offsetY: record.offsetY,
//		lon : (record.posX * 1).toFixed(5),
//		lat : (record.posY * 1).toFixed(5),
        lon: record.posX * 1,
        lat: record.posY * 1,
        name: record.name,
        lineName: record.lineName,
        stationID: record.stationID,
        click: record.canOpen ? openSearchWindowForTransit : null
    });
    return iconMarker;
}

function openSearchWindowForTransit(e) {
    // 右键点击
    if (e && e.leftClick == false) {
        return false;
    }

    $("#smartTip").hide();
    var marker;
    if (this instanceof LD.Marker) {
        marker = this;

    } else {
        marker = arguments[0] instanceof LD.Marker ? arguments[0] : arguments[0].target;

    }

    closeInfoWindowForLine();
    // 获取索引
    var index = $(lineMarkers).index(marker);

    var sid = marker.stationID;

    var streetHtml = "";
    if (sid && sid != null && MAP_CONFIG.STREET_MODE) {

        streetHtml = '<div class="desc"><a href="javascript:void(0);" class="thumnail_link">'
            + '<img title="点击进入全景" class="thumnail" station-id="' + sid + '" src="' + MAP_CONFIG.STREET_SERVICE_URL + '/image/icon/' + sid + '?index=8"/>'
            + '</a></div>'
            + '<div class="desc_tip"><a title="点击进入全景" onclick="toStationID(\'' + sid + '\',event)">进入全景&gt;&gt;</a></div>';
    }

    // var change = '<a class="fangda" onclick="changeZoomAndLocationForTransitInfoWindow(this, ' + index + ')" style="color: #00BB00;">缩小</a>';

    var tools = '<div class="tools">'
        + '<div class="tool_tab_3" ' + (index == 0 ? ' style="color: #C7C7C7; cursor: default;" ' : ' onclick="changeLineMarkerWindowForTransit(' + (index - 1) + ');" ') + ' >上一步</div>'
            // 	+ '<span style="position: absolute; right: 110px;">|</span>'
        + '<div class="tool_tab_3">'
        + '<p class="suoxiao" onclick="changeZoomAndLocationForTransitInfoWindow(this, ' + index + ')" ">放大</p>'
        + '</div>'
            // 	+ '<span style="position: absolute; left: 108px;">|</span>'
        + '<div class="tool_tab_3" ' + (index == lineMarkers.length - 1 ? ' style="color: #C7C7C7; cursor: default;" ' : ' onclick="changeLineMarkerWindowForTransit(' + (index + 1) + ');" ') + ' >下一步</div>'
        + '</div>';

    var html = '<div class="infowindow" marker-id="' + marker.getId() + '">' +
        '<div class="infopanel">' +
        '<div class="title" title="' + marker.name + '" >' + splitExcessLength(marker.name, 20, " ...") + '<a title="关闭" old-zindex="' + marker.getZIndex() + '" class="close" href="javascript:void(0)" onclick="closeInfoWindowForLine(this);"> X </a></div>' +
        '<div class="content">' +
        '<div class="desc"><span>' + (marker.lineName || '&nbsp;') + '</span></div>' +
        streetHtml +
        '</div>' +
        tools +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';

    setTopMarkerChangeOtherMarker(marker, 20, 2);

    infoWindow = new LD.InfoWindow(html, {
        //size : new LD.Size(350, 230),
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
        offset: new LD.Pixel(54, -27),
//		offset: new LD.Pixel(54,-marker.iconHeight-30-10),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });

    mapView.addOverlay(infoWindow);
    infoWindow.autoPan(true, [{x: 430, y: 60}, {x: 100, y: 60}]);

    //判断有无全景
    if (sid && sid != null && MAP_CONFIG.STREET_MODE) {

        $(".infowindow .thumnail").click(function (e) {
            var sid = $(this).attr("station-id");
            if (sid && sid != "") {
                toStationID(sid, e || event);
            }
        });
    }
}

/**
 * 关闭信息框，若有obj，则设置对应marker的zIndex
 * @param obj 信息框的关闭按钮onclick传入this
 */
function closeInfoWindowForLine(obj) {
    var $this = $(obj);
    var oldZIndex = $this.attr("old-zindex");
    if (oldZIndex != null && oldZIndex != "") {
        var mid = $this.parents(".infowindow").attr("marker-id")
        var marker = mapView.getOverlayById(mid);
        marker.setZIndex(oldZIndex);
    }

    if (infoWindow) {
        mapView.removeOverlay(infoWindow);
        infoWindow = null;
    }
}

/**
 * 放大：最大缩放级别（18级）<br />
 * 缩小：以路线路径为准的缩放级别, setBestMap(LD.LngLat[]);
 * @param obj
 * @param index marker的索引
 */
function changeZoomAndLocationForTransitInfoWindow(obj, index) {
    var $this = $(obj);

    if ($this.hasClass("suoxiao")) {
        var marker = lineMarkers[index];
        // mapView.setZoom(18);
        mapView.setCenter(marker.lon, marker.lat, 18);
        $this.text("缩小");
    } else if ($this.hasClass("fangda")) {
        var lnglats = [];
        for (var i = 0; i < polyLines.length; i++) {
            var path = polyLines[i].getPath();

            lnglats.push(path[0]);
            lnglats.push(path[path.length - 1])
        }
        mapView.setBestMap(lnglats);
        $this.text("放大");
    }

    $this.toggleClass("suoxiao fangda");

}

/**
 * 根据索引决定对应marker显示infoWindow
 * @param index
 */
function changeLineMarkerWindowForTransit(index) {
    if (index < 0) {
//		index = lineMarkers.length-1;

        return;
    } else if (index >= lineMarkers.length) {
//		index = 0;

        return;
    }

    lineMarkers[index].click(lineMarkers[index]);
}
/**
 * 根据 lineMarkers 中每个marker的坐标，尝试获取stationID并且赋值
 */
function checkStreetStationForTransitMarkers() {
    if (!MAP_CONFIG.STREET_MODE) {
        return;
    }

    for (var i in lineMarkers) {
        // 只要有一个有stationid，则为已发送请求
        if (lineMarkers[i].stationID != null) {
            return;
        }
    }

    var points = "";
    for (var i in lineMarkers) {
        points += ";" + lineMarkers[i].getPosition().lng + "," + lineMarkers[i].getPosition().lat;
    }
    if (points.length > 0) {
        points = points.substring(1);
    } else {
        return;
    }

    checkStreetNearest(points, function (data) {
        if (data == null || data == "" || data == undefined) {
            return;
        }
//		var json = eval("("+data+")");
        var json = data;

        if (json && json.length > 0) {
            $.each(json, function (index, item) {
                checkStationCorrect(item.StationID, function () {
                    lineMarkers[index].stationID = item.StationID;
                });
            });
        }
    });

}

/**
 * 根据文本值打开对应marker.name的信息框
 * @param e
 * @param obj 根据其中的文本，
 */
function openMarkerInfoWindowForTransit(e) {
    var event = e || window.event
    var obj = event.srcElement || event.target;
    var $this = $(obj);
    var name = $this.text();
    var location = $this.data("data-location") || $this.attr("data-location");
    if (!isNotNull(location)) {
        return;
    }
    location = location.split(",");
    location[0] = parseFloat(location[0]).toFixed(5);
    location[1] = parseFloat(location[1]).toFixed(5);
    location = location.join(",");

    for (var i in lineMarkers) {
        var marker = lineMarkers[i];
        var lnglat = marker.getPosition();
        var markerLocation = lnglat.lng.toFixed(5) + "," + lnglat.lat.toFixed(5);

        if (/*marker.name == name && */markerLocation == location) {
            marker.click();
            break;
        }
    }

    stopBubble(e);
}
//全局变量定义
var searchPage = {
    page: 1,
    /*当前页码*/
    pageSize: 10,
    /*页大小*/
    count: 0,
    /*总记录数*/
    op: "word",
    /*搜索类型:word-关键字(城市范围) wordcountry关键字(全国范围)，category-类型(城市范围)，-nearbytype周边类型，-nearbyword周边关键词，-regiontype范围内类型，-regionword范围内关键词*/
    word: "",
    /*关键字搜索的输入文字*/
    category: "",
    /*类型搜索的类型代码*/
    center: {
        x: 0,
        y: 0
    },
    /*周边搜索的中心点*/
    region: {
        leftbottom: {},
        topright: {}
    },
    /*范围搜索中的范围*/
    range: 5000,
    /*周边搜索的半径*/
    tempObj: null,
    /*保存关键词搜索的POI列表*/
    searchXhr: null,
};
var gddata;
var curAdcode;
var isnearbyword = false;
var isbus = false;
var isGD;
//控制输入提示
var seaCon = {
    // setTimeOut对象
    timeOut: null,
    // 延迟
    delay: 100
};
var infoWindow = null;
// 切换城市时清空
var clear4city = [];
//getDetailsById
var getDetailsById = function (id, fun) {
    var url;
    if (id.length < 11) {
        console.log(gdParam);
        $.ajax({
            type: "get",
            url: "https://restapi.amap.com/v3/place/text",
            async: true,
            data: gdParam,
            success: function (data) {
                for (var i = 0; i < data.pois.length; i++) {
                    if (id == data.pois[i].id) {
                        fun(data.pois[i]);
                    }
                }

            }
        });
    } else {
        url = MAP_CONFIG.SERV.SERV_DETAILS_URL;
        $.ajax({
            type: "get",
            url: url,
            async: true,
            data: {
                id: id
            },
            dataType: "jsonp",
            success: function (data) {
                var data_all = data.results;
                fun(data_all);
            }
        });
    }

}

//------------------------------------初始化事件----------------------------------------
$(function () {
    // 综合搜索结果列表
    var $poisPanel = $(".search_panel .rs_pois_content");
    // 结果列表每条li的点击、移入移出
    $poisPanel.on("click mouseover mouseout", "> li", function (evt) {
        var type = evt.type;

        var $this = $(this);
        var mid = $this.attr("marker-id");
        if (type == "click") {
            //			openSearchWindow(mapView.getOverlayById(mid),true);
            /*yext数据展示*/
            var parm = mapView.getOverlayById(mid);
            var id = (parm instanceof LD.Marker ? parm : parm.target).uid;
            getDetailsById(id, function (data) {
                openSearchWindow(mapView.getOverlayById(mid), true, data);
            })

        } else if (type == "mouseover") {
            if (!$this.hasClass("active")) {
                //如果不是active的-即被点击的，鼠标移上去就要变红
                var marker = mapView.getOverlayById(mid);

                _changeMarkerSelected(marker, true);
            }
        } else if (type == "mouseout") {
            if (!$this.hasClass("active")) {
                //如果不是active的-即被点击的，鼠标移出就要变回蓝
                var marker = mapView.getOverlayById(mid);

                _changeMarkerSelected(marker, false);
            }
        }
    });

    // 子POI列表的点击、移入移出
    $poisPanel.on("click mouseover mouseout", ".childList .child-item", function (evt) {
        evt.stopPropagation();
        var $this = $(this);
        var mid = $this.attr("data-chnmid");

        if (!mid || $this.hasClass("active")) {
            return;
        }

        var marker = mapView.getOverlayById(mid);
        if (evt.type == "click") {
            marker.click(marker, false);
        } else if (evt.type == "mouseover") {
            _changeMarkerSelected(marker, true, true);
        } else if (evt.type == "mouseout") {
            _changeMarkerSelected(marker, false, true);
        }

    });

    $(".tryAClick").click(function () {
        $(".specialMapContainer").css("zIndex", "999999");
    });
    $(".closeBtn").click(function () {
        $(".specialMapContainer").css("zIndex", "0");
    })

});
//---------------------------------初始化事件结束----------------------------------------
////////////////////////////////////////1,word-关键字(城市范围)//////////////////////////////////////////////////
//绑定智能提示事件
function onSearchInputBlur() {
    $("#smartTip").hide();
}
//城市内搜索智能提示
//--- target为jquery选择器，提示框在目标输入框下显示
//--- panel为提示框的jquery选择器
//--- forLine 是否为线路搜索，影响searchSource，默认false
function onSearchKeyUp(e, target, panel, forLine) {
    forLine = !(!forLine);
    var $target = $(target);
    var evt = window.event || e;
    var key = evt.keyCode ? evt.keyCode : evt.which;
    if (key && key == 13) {
        // 回车键
        if (forLine) {
            searchLineByType();
        } else {
            doSearch();
        }
    } else if (key == 40) {
        chooseSearchItem(1, target, panel); // down键
    } else if (key == 38) {
        chooseSearchItem(-1, target, panel); // up键
    } else if (key == 27 || key == 9) {
        // ESC || TAB
        $(panel).hide();
    } else {
        seaCon.timeOut = setTimeout(function () {
            if (seaCon.timeOut) {
                clearTimeout(seaCon.timeOut);
                seaCon.timeOut = null;
            }
            if ($target.val() != "") {
                if (forLine) {
                    $(".panel_top .route_page .total2line_record").hide();
                } else {
                    $(".search_box .search_close").show();
                    changeLeftPanelStatus("home", -1);
                }
            } else {
                if (forLine) {
                    var $total2line = $(".panel_top .route_page .total2line_record");
                    if ($total2line.find(".record_list > li").length > 0) {
                        $total2line.show();
                    } else {
                        $total2line.hide();
                    }
                    changeLeftPanelStatus("suggest", -1);
                } else {
                    $(".search_box .search_close").hide();
                    changeLeftPanelStatus(null, -2);
                }
                return;
            }
            onSearchTip(target, panel, forLine); // 输入动作
        }, seaCon.delay);
    }
}
/**
 * 输入提示：在当前城市搜索、无结果则搜索全国范围
 * @param word 输入值
 * @param fun 回调函数
 * @param forLine 是否为线路搜索，影响searchSource，默认false
 * @param opts {Object}其他参数
 */
function _onSuggestSearch(word, fun, forLine, opts) {
    if (!isNotNull($.trim(word))) {
        return;
    }
    if (!fun || !(fun instanceof Function)) {
        return;
    }
    forLine = !(!forLine);
    opts = opts == null ? {} : opts;
    var searchSource = "bus,busline,poi,district";
    if (forLine) {
        searchSource = "bus,poi";
    }
    var optsStr = "";
    for (var i in opts) {
        optsStr += ("&" + i + "=" + opts[i]);
    }
    var baseUrl = "{ipprot}/v3/online/sug?ak={ak}".replace("{ipprot}", window.leador_server_ipprot).replace("{ak}",window.leador_server_ak) + "&query=" + word + optsStr + "&datasource=" + searchSource;
    var currentUrl = baseUrl + "&region=" + currentCity.cityname;
    var countryUrl = baseUrl + "&region=全国";
    var gdswLnglat = currentCity.lon + "," + currentCity.lat;
    //add
    // key f0ed0321fe002fa8c3b57053ddf92353（产品提供）   28220ef721f72f3ced3187a78b6d107e(个人)
    // key的调用需要设置白名单，测试和上线时需要注意
    var gdUrl = "https://restapi.amap.com/v3/assistant/inputtips?output=JSON&city=" + currentCity.qid + "&location=" + gdswLnglat + "&keywords=" + word + "&key=f0ed0321fe002fa8c3b57053ddf92353";
    // 新接口要支持此跨域
    // datasource：district,busline,bus,poi
    var ajaxProto = {
        async: true,
        type: "GET",
        dataType: "jsonp"
    };

    var ajaxList = {
        current: function () {
            return $.ajax($.extend({}, ajaxProto, {
                url: currentUrl
            })).promise();
        },
        country: function () {
            return $.ajax($.extend({}, ajaxProto, {
                url: countryUrl
            })).promise();
        }

    }


    ajaxList.current().then(function (v1) {
        if (!v1 || !v1.results || v1.results.length < 1) {
            ajaxList.country().then(function (v2) {
                fun(v2);
            });
        } else {
            fun(v1);

        }
    })
}

/**
 *
 * @param target 目标输入框
 * @param panel 目标面板
 * @param forLine 是否为线路搜索，影响searchSource，默认false
 */
function onSearchTip(target, panel, forLine) {
    forLine = !(!forLine);
    isnearbyword = false;

    var $target = $(target);
    var word = $target.val();
    if ($.trim(word) == "") {
        $(panel).hide();
        return;
    }

    _onSuggestSearch(word, sugCall, forLine);

    function sugCall(data) {
        if (data.results) {
            if (data.results.length > 0) {
                searchPage.count = data.total; // 记录总个数
                var searchTipRecords = data.results;
                var $list = $(panel).find("ul"); //$("#smartTip ul");
                $list.empty();
                for (var i = 0; i < searchTipRecords.length; i++) {
                    var record = searchTipRecords[i];
                    var record_name = record.name;
                    record.datasource = $.trim(record.datasource);
                    try {
                        var wordMatch = new RegExp("(" + $.trim(word) + ")", "ig");
                        record_name = record_name.replace(wordMatch, '<span class="poiname">$1</span>');
                    } catch (e) {
                        // 输入了特殊字符
                    }
                    record_name += '<span class="poicity" data-adcode="' + $.trim(record.adcode) + '">' + $.trim(record.city) + '</span>';
                    record_name = "<p class='suggest_name ellipsis'>" + record_name + "</p>";
                    var detailInfo = "";
                    if (record.location != null && record.location.lng != null) {
                        detailInfo += ' data-location="' + record.location.lng + ',' + record.location.lat + '" ';
                    }

                    var clickEvt = ' onclick="onchooseSearchItem(this, \'' + target + '\');"';
                    if (forLine) {
                        clickEvt = ' onclick="chooseSearchItemForLine(this, \'' + target + '\', \'' + panel + '\');"';
                    }

                    $list.append('<li ' + detailInfo + ' title="' + record.name + '" ' +
                        clickEvt + '><a class="smartip_icon"></a>' + record_name + '</li>');
                }

                $(panel).show();
                changeLeftPanelStatus("suggest");

            }
        }
    }
}
//周边搜索智能提示
function onSearchKeyUpSimple(e, target, panel) {
    var evt = window.event || e;
    var key = evt.keyCode ? evt.keyCode : evt.which;
    if (key && key == 13) {
        onNearbyWordSearch(target); // 回车键
    } else if (key == 40) {
        chooseSearchItem(1, target); // down键
    } else if (key == 38) {
        chooseSearchItem(-1, target); // up键
    } else if (key == 27) {
        $(panel).hide();
    } else {
        onSearchTipSimple(target, panel); // 输入动作
    }
}

function onSearchTipSimple(target, panel, forLine) {
    forLine = !(!forLine);
    panel = panel || "#smartTipSimple";
    isnearbyword = true;
    var $target = $(target);
    var $panel = $(panel);
    var word = $target.val();
    if ($.trim(word) == "") {
        $panel.hide();
        return;
    }
    _onSuggestSearch(word, sugCalls, forLine);
    var loc = mapView.getCenter().lng + "," + mapView.getCenter().lat;

    function sugCalls(data) {
        if (data && data.results && data.results.length > 0) {
            searchPage.count = data.total; // 记录总个数
            var searchTipRecords = data.results;
            var $list = $(panel).find("ul"); //$("#smartTip ul");
            $list.empty();
            for (var i = 0; i < searchTipRecords.length; i++) {
                var record = searchTipRecords[i];
                var record_name = record.name;
                try {
                    var wordMatch = new RegExp("(" + $.trim(word) + ")", "ig");
                    record_name = record_name.replace(wordMatch, '<span class="poiname">$1</span>');
                } catch (e) {
                    // 输入了特殊字符
                }
                $list.append('<li title="' + record.name + '" data-location="' + record.location.lng + ',' + record.location.lat + '" onclick="onchooseSearchItem(this, \'' + target + '\', \'#smartTipSimple\');">' + record_name + '</li>');
            }

            var offset = $target.offset();
            $panel.children("ul").width($target.outerWidth()).children("li").addClass("ellipsis");
            var offsetTop = offset.top + $target.height();
            $panel.show().offset({
                top: offsetTop,
                left: offset.left
            });
            var winHeight = $(window).height();
            var panelHeight = $panel.height();
            // 离窗口底部的距离
            var untilBottom = winHeight - offsetTop - panelHeight - 10;

            var $listContent = $panel.find("ul");
            if (untilBottom <= 0) {
                $listContent.css({
                    maxHeight: panelHeight + untilBottom,
                    overflowY: "auto"
                });
            } else {
                // element.style.maxHeight = "" 可移除属性
                // element.style是一个可读可写的样式对象
                $listContent.css({
                    maxHeight: "",
                    overflowY: ""
                })
            }

        } else {
            // 如果没有模糊查询匹配，则关闭提示列表
            $panel.hide();
        }

    }

    // 新接口要支持此跨域
    /*$.ajax({
     async : true,
     type : "GET",
     dataType : "jsonp",
     url : MAP_CONFIG.SERV.SERV_POI_AROUND_URL+"query="+word+"&location="+loc+"&radius=5000",
     success : function(data) {
     if (data && data.results && data.results.length > 0) {
     searchPage.count = data.total;// 记录总个数
     var searchTipRecords = data.results;
     var $list = $(panel).find("ul");//$("#smartTip ul");
     $list.empty();
     for (var i = 0; i < searchTipRecords.length; i++) {
     var record = searchTipRecords[i];
     var record_name = record.name;
     try{
     var wordMatch = new RegExp("("+$.trim(word)+")", "ig");
     record_name = record_name.replace(wordMatch,'<span class="poiname">$1</span>');
     }catch(e){
     // 输入了特殊字符
     }
     $list.append('<li title="' + record.name+ '" data-location="' + record.location.lng + ',' + record.location.lat+ '" onclick="onchooseSearchItem(this, \'' + target + '\', \'#smartTipSimple\');">'+ record_name + '</li>');
     }

     var offset = $target.offset();
     $panel.children("ul").width($target.outerWidth()).children("li").addClass("ellipsis");
     var offsetTop = offset.top + $target.height();
     $panel.show().offset({top: offsetTop, left:offset.left});
     var winHeight = $(window).height();
     var panelHeight = $panel.height();
     // 离窗口底部的距离
     var untilBottom = winHeight - offsetTop - panelHeight - 10;

     var $listContent = $panel.find("ul");
     if(untilBottom <= 0){
     $listContent.css({maxHeight: panelHeight + untilBottom, overflowY: "auto"});
     }else {
     // element.style.maxHeight = "" 可移除属性
     // element.style是一个可读可写的样式对象
     $listContent.css({maxHeight: "", overflowY: ""})
     }

     }else {
     // 如果没有模糊查询匹配，则关闭提示列表
     $panel.hide();
     }
     }
     });*/
}
//周边搜索智能提示
function onRegionSearchKeyUp(e, target, panel) {
    var evt = window.event || e;
    var key = evt.keyCode ? evt.keyCode : evt.which;
    if (key && key == 13) {
        onRegionKeywordSearch(); // 回车键
    } else if (key == 40) {
        chooseSearchItem(1, target); // down键
    } else if (key == 38) {
        chooseSearchItem(-1, target); // up键
    } else if (key == 27) {
        $(panel).hide();
    } else {
        onRegionSearchTipSimple(target, panel); // 输入动作
    }
}

function onRegionSearchTipSimple(target, panel) {
    var $target = $(target);
    var word = $target.val();
    var bounds = mapView.getBounds();
    var loc = bounds.southwest.lng + "," + bounds.southwest.lat + ";" + bounds.northeast.lng + "," + bounds.northeast.lat;
    $.ajax({
        async: true,
        type: "GET",
        dataType: "jsonp",
        url: MAP_CONFIG.SERV.SERV_POI_BOX_URL + "query=" + word + "&bounds=" + loc + "&page_size=10&page_num=1",
        success: function (data) {
            if (data && data.results && data.results.length > 0) {
                searchPage.count = data.total; // 记录总个数
                var searchTipRecords = data.results;
                var $list = $(panel).find("ul"); //$("#smartTip ul");
                $list.empty();
                for (var i = 0; i < searchTipRecords.length; i++) {
                    var record = searchTipRecords[i];
                    var record_name = record.name;
                    try {
                        var wordMatch = new RegExp("(" + $.trim(word) + ")", "ig");
                        record_name = record_name.replace(wordMatch, '<span class="poiname">$1</span>');
                    } catch (e) {
                        // 输入了特殊字符
                    }
                    record_name = record_name.replace(word, '<span class="bold">' + word + '</span>');
                    $list.append('<li title="' + record.name + '" data-location="' + record.location.lng + ',' + record.location.lat + '" onclick="onchooseSearchItem(this, \'' + target + '\');">' + record_name + '</li>');
                }

                var offset = $target.offset();
                $(panel).show().offset({
                    top: offset.top + $target.height(),
                    left: offset.left
                });
            } else {
                // 如果没有模糊查询匹配，则关闭提示列表
                $(panel).hide();
            }
        }
    });
}
//上下键选中
function chooseSearchItem(obj, target, panel) {
    var $obj = null;
    if ($(panel).is(":hidden")) {
        return;
    }
    if (obj == 1 || obj == -1) {
        var tipdiv = panel || "#smartTopTip";
        var index = $(tipdiv).find("ul li").index($(tipdiv).find("ul li.active"));
        index = index + obj;
        if (index > 9) {
            index = 0;
        } else if (index < 0) {
            index = 9;
        }
        $obj = $(tipdiv).find("ul li").eq(index);
    } else {
        $obj = $(obj);
    }
    $obj.addClass("active").siblings().removeClass("active");
    $(target).val($obj.attr("title")).attr("data-location", $obj.attr("data-location")).attr("title", $obj.attr("title"));
    //$obj.parent().parent().hide();
}
/**
 * 智能提示列表的某一项被选择
 * @param obj
 * @param target 目标输入框
 * @param panel  列表的容器
 */
function onchooseSearchItem(obj, target, panel) {
    var $obj = $(obj);
    //var name = $obj.attr("title");
    $obj.addClass("active").siblings().removeClass("active");
    //$(target).val(name).attr("data-location", $obj.attr("data-location")).attr("title", name);
    var tipdiv = panel || "#smartTopTip";
    var index = $(tipdiv).find("ul li").index($(tipdiv).find("ul li.active"));
    var curLi = $(tipdiv).find("ul li").eq(index);
    $obj.parent().parent().hide();

    if (target == "#searchWord") {
        curAdcode = $(curLi).find(".poicity").attr("data-adcode");
        var name = $(curLi).attr("title");
        $(target).val(name).attr("data-location", $(curLi).attr("data-location")).attr("title", name);
        var cueMaLo = $(curLi).attr("data-location").split(",");
        AddMarker(cueMaLo[0], cueMaLo[1]);


        AddPop(cueMaLo, "<b>" + name + "</b>");
        //console.log(cueMaLo)
        //doSearch();
    } else if (panel == "#smartTipRegion") {
        onRegionKeywordSearch();
    } else if (panel == "#smartTipSimple") {
        curAdcode = $(curLi).attr("data-adcode");
        var name = $(curLi).attr("title");
        $(target).val(name).attr("data-location", $obj.attr("data-location")).attr("title", name)
        onNearbyWordSearch(target);
    }
}

// 执行搜索 搜索按钮的功能实现
function doSearch() {
    //	console.log($("#smartTip"))
    $("#smartTip").hide(); //
    var word = $("#searchWord").val(); //获取输入框的信息
    //取消输入字符串的前后空格
    if ($.trim(word) == "") {
        return false;
    }
    $(".search_box .search_close").show();
    //初始化全局变量的searchPage的属性
    searchPage.word = $.trim(word);
    /*关键字搜索的输入文字*/
    searchPage.page = 1;
    /*当前页码*/
    searchPage.count = 0;
    /*总记录数*/
    searchPage.op = "word";
    /*搜索类型:word-关键字(城市范围) wordcountry关键字(全国范围)，category-类型(城市范围)，-nearbytype周边类型，-nearbyword周边关键词，-regiontype范围内类型，-regionword范围内关键词*/
    sendWordSearchRequest(true); //向后台发送关键字搜索请求

    // 历史记录
    addTotalSearchRecord({
        title: searchPage.word
    }); //linePage.js
    //收藏点不显示
    //isCollectMakerShow(false); //user.js

}
//发送关键字搜索请求
var gdParam = {};

function sendWordSearchRequest(first) {
    var searchSource = "bus,busline,poi,district";
    //如果first为true时重新定义searchSource的值
    if (first) {
        /*yext数据展示*/
        searchSource = "bus,busline,poi,district"; //district,busline,bus,poi,yextpoi

        //		searchSource = "bus,busline,poi,district";//district,busline,bus,poi,yextpoi

    }
    wxdatil();
}
function gddatil() {
    var searchSource = "bus,busline,poi,district";
    gdParam.key = "f0ed0321fe002fa8c3b57053ddf92353";
    gdParam.keywords = searchPage.word;
    if (curAdcode) {
        gdParam.city = curAdcode;
    } else {
        gdParam.city = currentCity.qid;
    }
    gdParam.children = 1;
    gdParam.page = searchPage.page;
    gdParam.offset = searchPage.pageSize;
    gdParam.output = "JSON";
    gdParam.extensions = "all";
    $.ajax({
        type: "get",
        url: "https://restapi.amap.com/v3/place/text",
        async: true,
        data: gdParam,
        success: function (dataObj) {
            if (dataObj.pois.length > 0 && searchPage.op != "nearbyword") {
                changeLeftPanelStatus(null, -2); //map_new.js 关闭所有的panel
                if (dataObj.total < 1) {
                    //总结果为空，
                    var $parentPanel = $(".all_panel");
                    $parentPanel.attr("data-current", "home")
                    return;
                }
                //cleanMapOverlays(); //linePage.js清空地图覆盖物，不清空已收藏的点
                var tempObj = convertSearchData2datasource(dataObj); //linePage.js 将搜索到的data转换成datasource
                //      	console.log(tempObj)
                //
                dataObj = tempObj; //又复制给传进来的变量，这样使代码的可读性更强
                searchPage.tempObj = dataObj;
                dataObj.total = parseInt(dataObj.total) - tempObj.districts.length - tempObj.buslines.length;
                showTotalSearchList(dataObj);
            } else {
                wxdatil();
            }

        }
    });
}
function wxdatil(first) {
    var searchSource = "bus,busline,poi,district";
    $.ajax({
        async: true, //异步请求
        type: "GET",
        dataType: "jsonp",
        url: "{ipprot}/v3/online/search/detail?ak={ak}".replace("{iprpot}", window.leador_server_ipprot).replace("{ak}",window.leador_server_ak) + "&query=" + searchPage.word + "&region=" + currentCity.cityname +
        "&page_size=" + searchPage.pageSize + "&page_num=" + searchPage.page +
        "&datasource=" + searchSource + "&children=1&displaygeom=1",
        //query:关键字;region:检索区域名称;page_size:每页的记录数;page_num:分页页码;datasource:数据源类型;children=1显示子POI;displaygeom=1显示aoi或几个图形
        success: function (dataObj) {
            //      	console.log(dataObj)
            changeLeftPanelStatus(null, -2); //map_new.js 关闭所有的panel
            //      	backofLeftHome(false);
            if (dataObj.total < 1) {
                //总结果为空，
                var $parentPanel = $(".all_panel");
                $parentPanel.attr("data-current", "home")
                return;
            }
            //cleanMapOverlays(); //linePage.js清空地图覆盖物，不清空已收藏的点
            // 查找其他关于 ${searchPage.word} 的信息
            $(".red_content strong").text(searchPage.word);
            // 当前城市没有结果，会有全国各个城市的信息status=105是当前城市为空 且存在查询结果 且长度不为0
            if (dataObj.status == '105' && dataObj.results && dataObj.results.length > 0) {
                keywordResultInOtherCitys(dataObj.results); //搜索的关键词在其他城市
                return;
            }

            var tempObj = convertSearchData2datasource(dataObj); //linePage.js 将搜索到的data转换成datasource
            //      	console.log(tempObj)
            dataObj = tempObj; //又复制给传进来的变量，这样使代码的可读性更强
            searchPage.tempObj = dataObj;
            dataObj.total = parseInt(dataObj.total) - tempObj.districts.length - tempObj.buslines.length;

            //有first参数是，才判断district,busline,busstop,road，否则直接显示poi第一页
            if (first) {
                //        		 if(dataObj.districts && dataObj.districts.results.length>0){
                if (dataObj.districts.length > 0) {
                    //优先显示行政区域kjhx.
                    var district0 = dataObj.districts[0];
                    //绘制行政区域
                    var areas = district0.polyline.split("|"); //行政区可能包括多个面。
                    var totalLngLats = []; //存放所有的坐标
                    for (var m = 0; m < areas.length; m++) {
                        var area = areas[m];
                        var points = area.split(";");
                        var path = [],
                            lnglat;
                        for (var i = 0, l = points.length; i < l; ++i) {
                            lnglat = points[i].split(",");
                            if (lnglat.length == 2) {
                                var pos = new LD.LngLat(lnglat[0], lnglat[1]);
                                path.push(pos);
                                totalLngLats.push(pos);
                            }
                        }
                        var opts = $.extend({}, MAP_STYLE.polygon.district);
                        mapView.addPolygon(path, opts); //绘制多边形区域map.js
                    }

                    var centerOpts = $.extend({ //初始化中心点
                        //              		bestmap:true,
                        editable: false,
                        lon: district0.center.lng,
                        lat: district0.center.lat
                    }, MAP_STYLE.icon.center);
                    //中心点+事件
                    var centerMarker = mapView.addMarker(centerOpts); //添加点事件map.js

                    mapView.setBestMap(totalLngLats); //调整最佳视野 map.js

                    //左侧显示区域名称
                    alertContentOnTopSearch("已切换至" + district0.name); //linePage.js
                } else if (dataObj.buslines.length > 0) {
                    //显示公交地铁
                    $(".search_panel .rs_buslines").siblings().hide(); //siblings()找到同辈元素
                    $(".search_panel .rs_buslines_content").empty(); //删除所有子元素
                    for (var i = 0; i < dataObj.buslines.length; i++) {
                        var busline = dataObj.buslines[i];
                        //          			console.log(busline);
                        parseBusline(busline); //解析公交地铁线路
                    }
                    $(".search_panel .rs_buslines").show();
                    changeLeftPanelStatus("search");

                    onBuslineClick($(".search_panel .rs_buslines_content .busline_name")[0]); //点击线路中li事件
                } else {
                    showTotalSearchList(dataObj); //展示POI、公交地铁站查询列表
                }
            } else {
                showTotalSearchList(dataObj);
            }
        }
    });
}
//=======解析
//解析公交地铁线路
function parseBusline(busline) {

    var $li = $('<li data-pts="' + busline.coords + '" class="busline bus_line_v">' //coords:路线坐标点
        +
        '<p onclick="onBuslineClick(this);">' //触发onBuslineClick()函数
        +
        '<a class="busline_name" href="javascript:void(0);">' + busline.name + '</a>' +
        '</p>' +
        '<div class="through-stops">' +
        '<span onclick="toggleBusline(this);" class="fold-stops">' //toggleBusline()显隐线路途经点列表
        +
        '途经地点<img src="../imap_jw/images/img_1.gif" class="drop_down" />' +
        '</span>' +
        '</div>' +
        '</li>');
    var $detail = $('<div class="busline_detailinfo"><ol></ol><div>');
    //遍历公交站的点数
    for (var j = 0; j < busline.stop_info.length; j++) {
        var location = busline.stop_info[j];
        if (location == null) {
            continue;
        }
        location.xy = location.xy.split(";");
        location.lng = location.xy[0];
        location.lat = location.xy[1];
        var cls = "busline_stop";
        if (j == 0) { //
            cls = "busline_start"; //选定公交站的起点和终点
        } else if (j == busline.stop_info.length - 1) {
            cls = "busline_end";
        }
        $detail.find("ol").append('<li class="' + cls + '" data-location="' + location.lng + "," + location.lat + '"><span>' + (j + 1) + '、</span><a class="item-stop-name" href="javascript:void(0);" onclick="onBuslineDetailStopClick($(this).parent()[0]);">' + location.stop_name + '</a></li>');
    }
    $li.append($detail);
    $(".search_panel .rs_buslines_content").append($li);
}

function parseRoad(road) {
    var detailinfo = road.detail_info;

    var color = detailinfo.type == "景点" ? "bus_line_g" : "bus_line_v";
    var $li = $('<li data-pts="' + detailinfo.pts + '"  data-location="' + road.location.lng + ',' + road.location.lat + '"><p onclick="onRoadClick(this);"><a href="javascript:void(0);">' + road.name + '</a></p><span>' + detailinfo.city + road.name + '(' + detailinfo.type + ')</span></li>');
    $("#roads ul").append($li);
}
//=======事件
//显隐线路途经点列表
function toggleBusline(obj) {
    var $detail = $(obj).parent().parent().find(".busline_detailinfo");
    if ($detail.is(":hidden")) {
        $detail.show();
    } else {
        $detail.hide();
    }
}
//绘制li中某条线路
function drawBusline($li) {
    mapView.clearOverlays();
    var pts = $li.attr("data-pts");
    var path = [];
    var points = pts.split(';');
    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var lnglat = point.split(',');
        if (lnglat.length == 2) {
            path.push(new LD.LngLat(lnglat[0], lnglat[1]));
        }
    }
    mapView.setBestMap(path);

    var lineOpts = $.extend({}, MAP_STYLE.line.blue);
    //画公交线
    var polyLine = mapView.addPolyline(path, lineOpts);

    var stops = $li.find(".busline_detailinfo li");
    var lineName = $li.find(".busline_name").text();
    stops.each(function (index, item) {
        var $this = $(item);
        var location = $this.attr("data-location"); //获取坐标
        var stopName = $.trim($this.find(".item-stop-name").text());
        var point = location.split(",");
        var iconMarker;
        if ($this.hasClass("busline_start")) {
            //画起点
            var opts = $.extend({
                editable: false,
                lon: point[0],
                lat: point[1],
                arrow: -27,
                lineName: lineName,
                name: stopName,
                click: openBusStopInfoWindow
            }, MAP_STYLE.icon.start);
            iconMarker = mapView.addMarker(opts);
        } else if ($this.hasClass("busline_end")) {
            //画终点
            var opts = $.extend({
                editable: false,
                lon: point[0],
                lat: point[1],
                arrow: -27,
                lineName: lineName,
                name: stopName,
                click: openBusStopInfoWindow
            }, MAP_STYLE.icon.end);
            iconMarker = mapView.addMarker(opts);
        } else {
            //画中间站点
            var opts = $.extend({
                editable: false,
                lon: point[0],
                lat: point[1],
                anchor: LD.Constants.CENTER,
                arrow: -7,
                name: stopName,
                lineName: lineName,
                click: openBusStopInfoWindow
            }, MAP_STYLE.icon.lineNodeBlue);
            iconMarker = mapView.addMarker(opts);
        }
        $this.attr("data-mid", iconMarker.getId()); //赋给marker-id属性做记录
    });
    return polyLine.getId(); //返回线路id
}
//点击线路li中名称事件
function onBuslineClick(obj) {
    var busline_id = drawBusline($(obj).parents(".busline")); //绘制li中某条线路
    $(obj).parent().attr("data-buslineid", busline_id);
}
//站点的infowindow
function openBusStopInfoWindow(m) {
    if (m && m.leftClick == false) {
        return;
    }
    var marker = m instanceof LD.Marker ? m : m.target;
    var html = '<div class="infowindow" marker-id="' + marker.getId() + '">' +
        '<div class="infopanel">' +
        '<div class="title" title="' + marker.name + '">' + splitExcessLength(marker.name, 20, " ...") + '<a title="关闭" class="close" href="javascript:void(0)" onclick="closeInfoWindow();"> X </a></div>' +
        '<div class="content">' +
        '<div class="desc"><span>线路：</span><span>' + marker.lineName + '</span></div>' +
        '<div class="desc"><a href="javascript:void(0);" class="thumnail_link"></a></div>' + //<img class="thumnail" src="/logo/picture/2014-04-18/91e600d6133d4273a08e75689be3e7d3.jpg"/></a>
        '</div>' +
        '<div class="tools">' +
        '<div class="other_tool">' +
        '</div>' +
        '<div class="search_tool">' +
        '<div class="tool_tab_2" title="搜周边" onclick="onNearbySearch(' + marker.arrow + ');">搜周边</div>' +
        '<span style="position: absolute; right: 70px;">|</span>' +
        '<div class="tool_tab_2" title="查路线" onclick="onLineSearch(\'' + marker.getPosition().lng + '\',\'' + marker.getPosition().lat + '\',\'' + marker.name + '\');">查路线</div>' +
        '</div>' +
        '</div>' +
        '<div class="tool_contents">' +
        '<div class="tool_content">' +
        '<a onclick="onNearbyTypeSearch(\'餐厅\',\'' + marker.getId() + '\')">美食</a><a onclick="onNearbyTypeSearch(\'酒店\',\'' + marker.getId() + '\')">酒店</a><a onclick="onNearbyTypeSearch(\'景点\',\'' + marker.getId() + '\')">景点</a><a onclick="onNearbyTypeSearch(\'电影院\',\'' + marker.getId() + '\')">电影院</a>' +
        '<input class="keyword" type="text" data-tip="#smartTipSimple"  onkeyup="onSearchKeyUpSimple(event, \'.infowindow .keyword\',\'#smartTipSimple\');"/><span onclick="onNearbyWordSearch();" autocomplete="off" class="search"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';

    infoWindow = new LD.InfoWindow(html, {
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
        offset: new LD.Pixel(54, marker.arrow),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });

    mapView.addOverlay(infoWindow);
    infoWindow.autoPan(true, [{
        x: 430,
        y: 60
    }, {
        x: 100,
        y: 60
    }]);
}
//点击线路途经点中的站点事件:弹提示框，如果没有绘制线路，则先绘制
function onBuslineDetailStopClick(obj) {
    var location = $(obj).attr("data-location");
    var point = location.split(",");
    if (mapView.getZoom() < 16) {
        mapView.setCenter(point[0], point[1], 16);
    } else {
        mapView.setCenter(point[0], point[1]);
    }
    //判断是否已绘制线路
    var $li = $(obj).parents("li.busline");
    var bid = $li.attr("data-buslineid");
    if (bid == null || bid == "" || !mapView.getOverlayById(bid)) {
        var busline_id = drawBusline($li);
        $li.attr("data-buslineid", busline_id)
    }
    openBusStopInfoWindow(mapView.getOverlayById($(obj).attr("data-mid")));
}
//点击li中线路名称，绘线路
function onRoadClick(obj) {
    mapView.clearOverlays();
    var pts = $(obj).parent().attr("data-pts");

    // 路线可能分段
    var lineParts = pts.split("|");
    var lines = [];

    for (var i in lineParts) {

        var path = [];
        var points = lineParts[i].split(';');
        for (var j = 0; j < points.length; j++) {
            var point = points[j];
            var lnglat = point.split(',');
            if (lnglat.length == 2) {
                path.push(new LD.LngLat(lnglat[0], lnglat[1]));
            }
        }

        var line = mapView.addPolyline(path, {
            strokeColor: "#0E89F5",
            strokeOpacity: "0.8",
            strokeWeight: "6",
            strokeStyle: LD.Constants.OVERLAY_LINE_SOLID
        });

        if (line != null) {
            lines.push(line);
        }
    }

    //中心点+事件
    var location = $(obj).parent().attr("data-location");
    var loc = location.split(",");
    var opts = $.extend({
        editable: false,
        lon: loc[0],
        lat: loc[1]
    }, MAP_STYLE.icon.center);
    var centerMarker = mapView.addMarker(opts);

    mapView.setCenter(loc[0], loc[1]); //地图中心设置在线路中点
}
//点击链接去查poi的第一页
function onBusline2POIs(fromrequest) {
    mapView.clearOverlays();
    $("#buslines,#busstops").hide();
    $("#pois").show();
    if (fromrequest) {
        sendWordSearchRequest(); //发请求，不传参数表明直接显示poi第一页
    } else {
        showTotalSearchList(searchPage.tempObj); //展示POI查询列表
    }
}
//点击左侧面板中区域项，地图中心点移植到区域中心
function onDistrictClick(obj) {
    var location = $(obj).attr("data-location");
    var point = location.split(",");
    mapView.setCenter(point[0], point[1]);
}
/**
 * 全国关键字搜索
 */
function sendWholeCountryWordSearchRequest() {
    //	searchPage.word+"&region="+ (searchPage.op == "wordcountry" ? "全国" :
    $.ajax({
        async: true,
        type: "GET",
        dataType: "jsonp",
        url: MAP_CONFIG.SERV.SERV_POI_URL + "query=" + searchPage.word + "&region=全国&page_size=" + searchPage.pageSize + "&page_num=" + searchPage.page,
        success: function (dataObj) {
            //cleanMapOverlays();
            var tempObj = convertSearchData2datasource(dataObj);
            showTotalSearchList(tempObj); //展示查询列表
        }
    });
}

//=============================2,category-类型(城市范围)===================================
/**
 * 根据分类添加对应的marker
 */
function searchByCategory(obj) {
    var lnglat = mapView.getCenter();
    var lon = parseFloat(lnglat.lng);
    var lat = parseFloat(lnglat.lat);
    // 根据category决定请求参数
    var category = $(obj).attr("data-type");
    searchPage.op = "category"; /////////////////////
    // category = category.split(",");
    searchPage.page = 1;
    searchPage.word = category;
    searchPage.category = category;
    searchPage.center = {
        x: lon,
        y: lat
    };

    sendCatagorySearchRequest();
}

function sendCatagorySearchRequest() {
    var match = 0;

    $.ajax({
        async: true,
        type: "GET",
        dataType: "jsonp",
        url: MAP_CONFIG.SERV.SERV_POI_URL + "type=" + searchPage.word + "&region=" + currentCity.cityname + "&page_size=" + searchPage.pageSize + "&page_num=" + searchPage.page,
        success: function (data) {
            //cleanMapOverlays();
            var tempObj = convertSearchData2datasource(data);
            showTotalSearchList(tempObj);
            // addSearchCircle();
        }
    });
}
////////////////////////////////////////3,nearbytype-周边类型搜索//////////////////////////////////////////////////
function onNearbySearch(offsety) {
    var $first_tab = $(".infowindow .tools .tool_tab_2:first");
    if ($first_tab.hasClass("active")) {
        $(".infowindow .tool_contents,.infowindow .tool_content").hide();
        $(".infowindow .tools .tool_tab_2:first").removeClass("active");
    } else {
        $(".infowindow .tool_contents,.infowindow .tool_content").show();
        $(".infowindow .tools .tool_tab_2:first").addClass("active");
    }

    if (offsety) {
        infoWindow.setOffset(new LD.Pixel(55, offsety));
    }
}

function onNearbyTypeSearch(category, _mid) {
    var marker = mapView.getOverlayById(_mid);
    var center = {
        x: marker.getPosition().lng,
        y: marker.getPosition().lat
    };
    nearbyTypeSearch(category, center);
}

function nearbyTypeSearch(category, center) {
    searchPage.op = "nearbytype";
    searchPage.page = 1;
    searchPage.word = category;
    searchPage.category = category;
    searchPage.center = center; //{x:lon,y:lat};
    searchPage.range = 1000; //1KM范围
    //sendNearbyTypeSearchRequest();
    //sendWordSearchRequest(true);
    sendCatagorySearchRequest();
}

function sendNearbyTypeSearchRequest() {
    $.ajax({
        async: true,
        type: "GET",
        dataType: "jsonp",
        url: MAP_CONFIG.SERV.SERV_POI_AROUND_URL + "type=" + searchPage.word + "&location=" + searchPage.center.x + "," + searchPage.center.y + "&page_size=" + searchPage.pageSize + "&page_num=" + searchPage.page + "&radius=" + searchPage.range,
        success: function (data) {
            //cleanMapOverlays();
            var tempObj = convertSearchData2datasource(data);
            showTotalSearchList(tempObj, false);
            addSearchCenterMarker();
            if (tempObj.status != "0" || tempObj.total == null || tempObj.total == "0") {
                return;
            }
            addSearchCircle();
        }
    });
}

function addSearchCircle() {
    //坐标半径
    var lat = searchPage.center.y;
    var lng = searchPage.center.x;
    var radius = searchPage.range;
    //画圆
    var co = new LD.CircleOptions();
    co.editabled = false;
    co.fillColor = "#0099ff";
    co.fillOpacity = "0.1";
    co.strokeColor = "#0000ff";
    co.strokeOpacity = "1";
    co.strokeWeight = "1";
    co.strokeStyle = "solid";
    var centerLngLat = new LD.LngLat(lng, lat);
    var circle = new LD.Circle(centerLngLat, radius, co);
    mapView.addOverlay(circle, true);
    //加拉伸事件
    var vertex = circle.getVertex();
    //	var vertex = circle.getCenter();
    var circlebounds = circle.getBounds();

    var mo = {
        lon: vertex.lng,
        lat: vertex.lat,
        editable: false,
        icon: "../imap/../imap_jw/images/around.png",
        iconWidth: 34,
        iconHeight: 24,
        offsetX: -43,
        offsetY: -3
    };
    var rangeMarker = mapView.addMarker(mo); //vertex.lng.toFixed(5)/0.00001, vertex.lat.toFixed(5)/0.00001, null, null, null, 1, null, "../imap_jw/images/around.png", 2, true);
    rangeMarker.setAnchor(LD.Constants.CENTER);
    var labelOpt = new LD.LabelOptions();
    labelOpt.anchor = LD.Constants.LEFT_CENTER;
    labelOpt.offset = new LD.Pixel(20, 0);
    labelOpt.type = LD.Constants.OVERLAY_LABEL_DEFAULT;
    labelOpt.fontSize = 12;
    labelOpt.fontColor = "#000000";
    labelOpt.fontBold = false;
    rangeMarker.setLabel(radius + "米", labelOpt);
    //PoiSearch["rangeMarker"].setLabel(PoiSearch["range"]+"米", LD.Constants.LEFT_TOP, new LD.Pixel(20, -20), LD.Constants.OVERLAY_LABEL_TEXT, 12, "#000000", false);
    var startLngLat = null,
        endLngLat = null;
    var rangeMarkerMousedown = null;
    var map = mapView.getMap();
    rangeMarkerMousedown = rangeMarker.addEventListener(LD.Constants.MOUSE_DOWN, function (evt) {
        //		LD.Event.stop(evt);
        L.Draggable._dragging = true; //TODO 临时解决事件穿透问题
        var mapMouseout = null,
            mapMousemove = null,
            mapMouseup = null;
        /*
         mapMouseout = map.addEventListener(LD.Constants.MOUSE_OUT, function(evt) {
         map.removeEventListener(mapMousemove);
         map.removeEventListener(mapMouseup);
         map.removeEventListener(mapMouseout);
         endLngLat = new LD.LngLat(evt.lnglat.lng, lat);
         radius  = Math.round(LD.Function.distanceByLngLat(centerLngLat, endLngLat));

         if (radius < 500)
         radius  = 500;
         else if (radius > 5000)
         radius = 5000;

         if (searchPage.range != radius) {
         sendNearbyTypeSearchRequest();
         }
         searchPage.range=radius;
         },map,true);
         */

        mapMousemove = map.addEventListener(LD.Constants.MOUSE_MOVE, function (evt) {
            var endLngLat = new LD.LngLat(evt.lnglat.lng, lat);
            radius = LD.Function.distanceByLngLat(centerLngLat, endLngLat);
            if (480 < radius && radius < 5020) {
                rangeMarker.setPosition(endLngLat);
                if (radius < 500)
                    radius = 500;
                else if (radius > 5000)
                    radius = 5000;
                var label = rangeMarker.getLabel();

                label.setContent(Math.round(radius) + "米");
                circle.setRadius(radius);
            }
        }, map, true);

        mapMouseup = map.addEventListener(LD.Constants.MOUSE_UP, function (evt) {
            L.Draggable._dragging = false; //TODO 临时解决事件穿透问题
            map.removeEventListener(mapMousemove);
            map.removeEventListener(mapMouseup);
            //			map.removeEventListener(mapMouseout);
            endLngLat = new LD.LngLat(evt.lnglat.lng, lat);
            radius = Math.round(LD.Function.distanceByLngLat(centerLngLat, endLngLat));

            if (radius < 500)
                radius = 500;
            else if (radius > 5000)
                radius = 5000;

            if (searchPage.range != radius) {
                // 指定新范围
                searchPage.range = radius;
                // 每次拖拽后从第一页开始搜索
                searchPage.page = 1;
                sendNearbyTypeSearchRequest();
            }
        }, map, true);

    }, rangeMarker, true);

    clear4city.push(circle);
    clear4city.push(rangeMarker);

    //mapView.setBestMap([circlebounds.getSouthWest(), circlebounds.getNorthEast()]);
}

function addSearchCenterMarker() {
    var opts = $.extend({
        editable: false,
        lon: searchPage.center.x,
        lat: searchPage.center.y,
        bestmap: false
    }, MAP_STYLE.icon.center);

    var centerMarker = mapView.addMarker(opts);

    clear4city.push(centerMarker);
    return centerMarker;
}
////////////////////////////////////////4,nearbyword-周边词搜索//////////////////////////////////////////////////
/**
 *
 * @param {String} target 指定input的选择器，默认值为.infowindow .tool_contents .keyword
 */
function onNearbyWordSearch(target) {
    target = target || ".infowindow .tool_contents .keyword";
    $("#smartTipSimple").hide();
    var word = $(target).val();

    if (word == null || $.trim(word) == "") {
        return;
    }
    var _mid = $(".infowindow").attr("marker-id");
    var marker = mapView.getOverlayById(_mid);
    var center = {
        x: marker.getPosition().lng,
        y: marker.getPosition().lat
    };
    nearbyWordSearch(word, center);
}

function nearbyWordSearch(word, center) {
    searchPage.op = "nearbyword";
    searchPage.page = 1;
    searchPage.word = word;
    searchPage.center = center; //{x:lon,y:lat};
    searchPage.range = 5000; //5KM范围
    sendNearbyWordSearchRequest();
    //sendWordSearchRequest(true)
}

function sendNearbyWordSearchRequest() {
    wxdatil(true)
    /*$.ajax({
     async: true,
     type: "GET",
     dataType: "jsonp",
     url: MAP_CONFIG.SERV.SERV_POI_AROUND_URL + "query=" + searchPage.word + "&location=" + searchPage.center.x + "," + searchPage.center.y + "&page_size=" + searchPage.pageSize + "&page_num=" + searchPage.page + "&radius=" + searchPage.range,
     success: function(data) {
     //cleanMapOverlays();
     var tempObj = convertSearchData2datasource(data);
     showTotalSearchList(tempObj, false);
     addSearchCenterMarker();
     addSearchCircle();
     }
     });*/
}
///////////////////////////////////////5,regiontype-视野内类型搜索//////////////////////////////////////////////////
//视野内类型搜索
function regionTypeSearch(code) {
    $(".search_tv").hide();
    $(".map_tool").find("[data-target='.search_tv']").removeClass("active");
    mapView.removeHotspotLayer();
    var bounds = mapView.getBounds();
    searchPage.region = bounds;
    searchPage.op = "regiontype";
    searchPage.page = 1;
    searchPage.category = code;
    sendRegionTypeSearchRequest();
}

function sendRegionTypeSearchRequest() {
    var loc = searchPage.region.southwest.lng + "," + searchPage.region.southwest.lat + ";" + searchPage.region.northeast.lng + "," + searchPage.region.northeast.lat;
    $.ajax({
        url: MAP_CONFIG.SERV.SERV_POI_BOX_URL + "query=" + searchPage.category + "&bounds=" + loc + "&page_size=" + searchPage.pageSize + "&page_num=" + searchPage.page,
        async: true,
        type: "GET",
        dataType: "jsonp",
        success: function (dataObj) {
            //cleanMapOverlays();
            var tempObj = convertSearchData2datasource(dataObj);
            showTotalSearchList(tempObj, false); //展示查询列表
            mapView.addHotSpotLayer(searchPage.category);
        }
    });
}
///////////////////////////////////////6,regionword-视野词搜索//////////////////////////////////////////////////
//视野内关键词搜索
function regionKeywordSearch(word) {
    var bounds = mapView.getBounds();
    searchPage.region = bounds;
    searchPage.op = "regionword";
    searchPage.page = 1;
    searchPage.word = word;
    sendRegionWordSearchRequest();
}

function sendRegionWordSearchRequest() {
    var location = searchPage.region.southwest.lng + "," + searchPage.region.southwest.lat + ";" + searchPage.region.northeast.lng + "," + searchPage.region.northeast.lat;
    $.ajax({
        url: MAP_CONFIG.SERV.SERV_POI_BOX_URL + "query=" + searchPage.word + "&bounds=" + location + "&page_size=" + searchPage.pageSize + "&page_num=" + searchPage.page,
        async: true,
        type: "GET",
        dataType: "jsonp",
        success: function (dataObj) {
            //cleanMapOverlays();
            var tempObj = convertSearchData2datasource(dataObj);
            showTotalSearchList(tempObj); //展示查询列表
        }
    });
}
//======================================视野词搜索结束===============================================//
//======================================搜索marker/list===============================================//

//综合搜索（POI、公交地铁站）结果列表展示
/**
 *
 * @param {Object} dataObj 请求的数据
 * @param {Boolean} bestMap 是否设置地图的最佳视野，默认true
 */
function showTotalSearchList(dataObj, bestMap) {
    bestMap = bestMap == null ? true : bestMap;
    // 回到综合搜索页面
    backofLeftHome(false);
    // 显示叉叉按钮
    $(".search_box .search_close").show();
    setDataToTotalInputAttribute({
        title: searchPage.word
    });
    if (!dataObj || !dataObj.pois || dataObj.pois.length < 1) {
        // 输入框搜索 找不到结果或请求失败，显示未找到
        changeLeftPanelStatus(null, -2);
        var $parentPanel = $(".all_panel");
        $parentPanel.attr("data-current", "home");
        var $nrst = $parentPanel.find(".search_panel .rs_nrst");
        $nrst.siblings().hide();
        $nrst.find(".search_name").text(searchPage.word);
        $nrst.show();
        changeLeftPanelStatus("search");
        return;
    }
    var records = dataObj.pois;
    var gddata = dataObj.pois;
    searchPage.count = dataObj.total;
    var marker10 = [];
    var lonlats = [];
    // 如果是公交、会有括号，去括号
    var stnameReg = new RegExp("([^（\\(]*)(（|\\().*(\\)|）)");
    $(".search_panel .rs_pois").siblings().hide();
    var $showPanel = $(".search_panel .rs_pois_content");
    $showPanel.empty();

    //把当前列表加到界面上
    for (var i = 0; i < records.length; i++) {
        var record = records[i];

        if (record.uid) {
            record.datasource = record.datasource.toLowerCase();
        } else {
            record.datasource = record.type.toLowerCase();
        }
        /*
         var noAddr = false;
         var address = "";
         if(record.address){
         noAddr = false;
         address = record.address;
         }else {
         noAddr = true;
         address = currentCity.cityname;
         }
         */
        //		var address=record.address ? record.address : currentCity.cityname;
        var address = record.address || "地址信息暂无";
        if (record.datasource === "bus") {
            address = [];
            // 过滤重复
            var map = {};
            for (var x in record.line_info) {
                var info = record.line_info[x];
                var rst = stnameReg.exec(info.line_name);
                map[rst[1]] = true;
            }

            for (var key in map) {
                var value = map[key];
                if (value) {
                    address.push(key);
                }
            }
            // 间隔更大
            //address = address.join("，");
        }
        //		record.address = noAddr ? "地址信息暂无" : address;
        record.address = address;
        var isPoiSource = record.datasource == "poi" || record.datasource == "yextpoi" || record.typecode != "undefined";
        var imgReal_n = "";

    }
    //$showPanel.append('<div class="clearfix"></div>');
    // 显示列表
    //$(".search_panel .rs_pois").show();
    // 显示面板
    //changeLeftPanelStatus("search");

    if (mapView && bestMap) {
        mapView.setBestMap(lonlats);
    }
    //查询是否有全景
    //checkStreetStation(marker10);
    //页面和记录数显示
    var totalpage = Math.ceil(parseInt(dataObj.total) / searchPage.pageSize);
    var $pageList = $(".search_panel .page-number-list");

    //checkPageNumberStyle($pageList, searchPage.page, totalpage);
    //滚动到列表顶端
    $(".search_panel .rs_pois_content").animate({
        scrollTop: 0
    }, 200);
}

/**
 * 隐藏/显示所有综合搜索POI的children和polygon(geom)
 * @param {Boolean} visible true为显示,false为隐藏，默认false
 * @param {String} mid 父marker的ID，如果visible为true时指定该项，则只会显示该marker下的覆盖物，其他的隐藏
 */
function changePoisExtraOverlayVisible(visible, mid) {
    visible = !(!visible);
    var overlays = mapView.getAllOverlays();

    // marker的geoms（可能有多个区域，数组形式）
    var rangeLnglat = [];

    for (var i in overlays) {
        var item = overlays[i];
        var mkr = item.belongTo;
        if (!mkr || !(mkr instanceof LD.Marker)) {
            continue;
        }
        if (!(item && item.visible instanceof Function)) {
            continue;
        }
        var isPolygon = item instanceof LD.Polygon;
        var isPolyline = item instanceof LD.Polyline;
        //		var isChild = item instanceof LD.Marker;
        if (isNotNull(mid)) {
            // 父marker
            var hasParent = mkr.getId() == mid;
            if (hasParent && visible) {
                item.visible(true);
                // 如果是区域，设置最佳视野
                if (isPolygon || isPolyline) {
                    var bounds = item.getBounds();
                    rangeLnglat.push(bounds.northeast);
                    rangeLnglat.push(bounds.southwest);
                }
            } else {
                item.visible(false);
            }
        } else {
            item.visible(visible);
        }

    }

    if (rangeLnglat.length > 0) {
        mapView.setBestMap(rangeLnglat);
    }
}

/**
 * 根据页码改变在页面的样式
 * @param {Object} $pageList 当前页码容器 .page-number-list
 * @param {Number} page 当前页码，从1开始
 * @param {Number} totalpage 总页码
 */
function checkPageNumberStyle($pageList, page, totalpage) {
    if (!$pageList) {
        return;
    }
    $pageList.find(".page-control .disabled").removeClass("disabled");
    if (totalpage == 0 || (totalpage == 1 && page == 1)) {
        $pageList.find(".page-control>[class*='page-control-']").addClass("disabled");
    } else if (page == totalpage) {
        $pageList.find(".page-control .page-control-next").addClass("disabled");
    } else if (page == 1) {
        $pageList.find(".page-control .page-control-prev,.page-control .page-control-index").addClass("disabled");
    }
    $pageList.find(".page-number .page-text").text((page) + "/" + totalpage);
}

/**
 * 添加综合搜索marker的子poi的marker
 * @param {Object} record
 *    record.type 类型
 *        景区： 门（110201）、售票处（070300、070306）、停车场(150904)
 *        大学/建筑物：门（141201）、停车场（150904）、教学楼（141201）
 *        车站：进站口（150200）、出站口（150200）、售票厅（070300）、候车室（150200）、广场（150200）
 */
function addIconChildrenMarker(record) {
    var typeFilter = {
        070300: 3,
        070306: 6,
        150904: 7,
    };

    var typeIndex = null;
    if (/门/.test(record.name) && new RegExp(["110201", "141201", "110101", "120302", "080501", "090101", "100102", "110103"].join("|")).test(record.type)) {
        typeIndex = 9;
    }

    if (typeIndex == null) {
        typeIndex = typeFilter[record.type || null];
    }

    if (typeIndex == null) {
        return;
    }

    record.canOpen = record.canOpen == null ? true : record.canOpen;
    var opts = $.extend({}, MAP_STYLE.icon.childPoiBubble, {
        uid: record.uid || "",
        editable: false,
        offsetX: (typeIndex - 1) * -53,
        offsetY: -0,
        datasource: "poi,yextpoi",
        lon: record.location.lng, //(record.posX * 0.00001).toFixed(5),
        lat: record.location.lat, // (record.posY * 0.00001).toFixed(5),
        name: record.name,
        phone: record.telephone || "",
        addr: record.address || "",
        click: record.canOpen ? openChildrenMarkerWindow : null
    });

    var iconMarker = mapView.addMarker(opts);
    return iconMarker;
}
/**
 * 添加综合搜索的marker
 * @param {Object} record
 * @param {Number} index 索引，对应1-10的图标（0-9），索引为10则为最后的纯色图标
 */
function addIconMarker(record, index) {
    record.canOpen = record.canOpen == null ? true : record.canOpen;
    var i = index ? index : 0;
    var lnglat, curid, curlng, curlat;
    if (record.id) {
        curid = record.id;
        lnglat = record.location.split(",");
        curlng = lnglat[0];
        curlat = lnglat[1];
    } else {
        curid = record.uid;
        curlng = record.location.lng;
        curlat = record.location.lat;
    }
    var opts = $.extend({}, MAP_STYLE.icon.bubble, {
        uid: curid || "",
        editable: false,
        offsetX: index * -53 - 1,
        offsetY: -0,
        lon: curlng, //(record.posX * 0.00001).toFixed(5),
        lat: curlat, // (record.posY * 0.00001).toFixed(5),
        name: record.name,
        phone: record.telephone || "",
        addr: record.address || "",
        //		click : record.canOpen ? openSearchWindow : null
        /*yext数据展示*/
        click: record.canOpen ? function () {
            var $this = this;
            getDetailsById(this.uid, function (data) {
                openSearchWindow($this, true, data);
            })
        } : null
    });

    var iconMarker = mapView.addMarker(opts);
    return iconMarker;
}

/**
 * 打开综合搜索结果marker的infowindow
 * @param {Object} parm1 jsmap的event，通过marker.click事件注入的
 * @param {Boolean} diffTop 是否滚到到顶部，默认为true
 */
function openChildrenMarkerWindow(parm1, diffTop) {
    diffTop = diffTop == null ? true : diffTop;
    $("#smartTip").hide();
    $("#smartTipSimple").hide();
    var marker = parm1 instanceof LD.Marker ? parm1 : parm1.target;
    /* 子POI暂不需要收藏
     var isPoiSouce = (marker.datasource == "poi" || !isNotNull(marker.datasource) );
     var isCollect = checkMarkerLocationIsCollect(marker);
     var collectClass = "shoucang";
     var nmid = "";
     if (isCollect) {
     collectClass += " active";
     var nmk = getCollectionMarkerByUID(marker.uid || "");
     if(nmk){
     nmid = nmk.getId();
     }
     }
     */
    var contentHtml = "";
    var address = marker.addr;

    contentHtml = '<div class="desc"><span>地址：</span><span>' + address + '</span></div>';

    var html = '<div class="infowindow" marker-id="' + marker.getId() + '" data-target=".search_panel .rs_pois_content">' +
        '<div class="infopanel">' +
        '<div class="title" title="' + marker.name + '">' + splitExcessLength(marker.name, 20, " ...") + '<a title="关闭" class="close" href="javascript:void(0)" onclick="closeInfoWindow();"> X </a></div>' +
        '<div class="content">' +
        contentHtml +
        '<div class="desc"><a href="javascript:void(0);" class="thumnail_link"></a></div>' + //<img class="thumnail" src="/logo/picture/2014-04-18/91e600d6133d4273a08e75689be3e7d3.jpg"/></a>
            //'<div class="desc_tip"><a title="点击进入全景">进入全景&gt;&gt;  </a></div>'+
        '</div>' +
        '<div class="tools">' +
        '<div class="other_tool">'
            // 子POI暂不需要收藏
            //						    	+ (isPoiSouce ? '<span class="' + collectClass + '" onclick="collectPointForMarker(this, \'' + marker.getId() + '\')" data-nmid="' + nmid + '"><img src="../imap_jw/images/img_1.gif"></span>' : '')
            //						    	+ '<span> | </span>'
            //								+ '<span class="share"><img src="../imap_jw/images/img_1.gif"></span>'
            //								+ '<span> | </span>'
            //								+ '<span class="fankui"><img src="../imap_jw/images/img_1.gif"></span>'
        +
        '</div>' +
        '<div class="search_tool">' +
        '<div class="tool_tab_2" title="搜周边" onclick="onNearbySearch(-25);">搜周边</div>' +
        '<span style="position: absolute; right: 70px;">|</span>' +
        '<div class="tool_tab_2" title="查路线" onclick="onLineSearch(\'' + marker.getPosition().lng + '\',\'' + marker.getPosition().lat + '\',\'' + marker.name + '\');">查路线</div>' +
        '</div>' +
        '</div>' +
        '<div class="tool_contents">' +
        '<div class="tool_content">' +
        '<a onclick="onNearbyTypeSearch(\'餐厅\',\'' + marker.getId() + '\')">美食</a><a onclick="onNearbyTypeSearch(\'酒店\',\'' + marker.getId() + '\')">酒店</a><a onclick="onNearbyTypeSearch(\'景点\',\'' + marker.getId() + '\')">景点</a><a onclick="onNearbyTypeSearch(\'电影院\',\'' + marker.getId() + '\')">电影院</a>' +
        '<input class="keyword" type="text" data-tip="#smartTipSimple"  onkeyup="onSearchKeyUpSimple(event, \'.infowindow .keyword\',\'#smartTipSimple\');"/><span onclick="onNearbyWordSearch();" autocomplete="off" class="search"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';

    // 面板相关使用父marker
    var parentMarker = marker.belongTo;
    if (!parentMarker) {
        return;
    }

    //左侧列表中对应记录处于选中状态
    var $poisPanel = $(".search_panel .rs_pois_content");
    var $li = $poisPanel.find("li[marker-id='" + parentMarker.getId() + "']");

    //MARKER图标变红
    changeTotalSearchMarkerColor(marker.getId(), $li[0]);

    if (diffTop) {
        //滚动到列表的当前项
        var $childLi = $li.find(".child-item[data-chnmid='" + marker.getId() + "']");
        var diff = $childLi.offset().top - $poisPanel.offset().top;
        $(".search_panel .map_left_panel").animate({
            scrollTop: diff
        }, 200);
    }

    // content
    var $html = $(html);

    //判断有无全景
    var sid = $li.attr("station-id");
    if (sid && sid != null && MAP_CONFIG.STREET_MODE) {
        var $infowindow = $(".infowindow");
        $html.find(".thumnail_link").append('<img title="点击进入全景" class="thumnail"  onclick="toStationID(\'' + sid + '\',event)" src="' + MAP_CONFIG.STREET_SERVICE_URL + '/image/icon/' + sid + '?index=8' + '"/>');
        $html.find(".content").append('<div class="desc_tip"><a onclick="toStationID(\'' + sid + '\',event)" title="点击进入全景">进入全景&gt;&gt;  </a></div>');
    }

    if (infoWindow) {
        mapView.removeOverlay(infoWindow);
        infoWindow = null;
    }

    infoWindow = new LD.InfoWindow($("<div></div>").html($html).html(), {
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
        anchor: LD.Constants.BOTTOM_CENTER,
        offset: new LD.Pixel(55, -25),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });
    mapView.addOverlay(infoWindow);

    infoWindow.autoPan(true, [{
        x: 430,
        y: 60
    }, {
        x: 100,
        y: 60
    }]);
}

/**
 * 打开综合搜索结果marker的infowindow
 * @param {Object} parm1 jsmap的event，通过marker.click事件注入的
 * @param {Boolean} diffTop 是否滚到到顶部，默认为true
 */
//function openSearchWindow(parm1, diffTop){
/*yext数据展示*/
function openSearchWindow(parm1, diffTop, data) {
    diffTop = diffTop == null ? true : diffTop;
    $("#smartTip").hide();
    $("#smartTipSimple").hide();
    var marker = parm1 instanceof LD.Marker ? parm1 : parm1.target;
    //
    var isPoiSouce = (marker.datasource == "poi" || marker.datasource == "yextpoi" || isNotNull(marker.datasource));

    var isCollect = checkMarkerLocationIsCollect(marker);
    var collectClass = "shoucang";
    var nmid = "";
    if (isCollect) {
        collectClass += " active";
        var nmk = getCollectionMarkerByUID(marker.uid || "");
        if (nmk) {
            nmid = nmk.getId();
        }
    }

    var contentHtml = "";
    var address = marker.addr;
    if (!(typeof address === "string") && address.slice) {
        address = "<span>" + address.join("</span>，<span>") + "</span>";
    }

    var categorieshtml = '';
    if (data && (data.length > 0)) {
        if (data[0].categories) {
            for (var i = 0; i < data[0].categories.length; i++) {
                categorieshtml += (data[0].categories[i].name + "  ");
            }
        }
    }
    // 数组格式
    if (marker.datasource === "bus") {
        contentHtml = '<div class="desc"><span>途径线路：</span><br/><span>' + address + '</span></div>';
    } else if (marker.datasource === "poi" || marker.datasource === "yextpoi") {
        //		contentHtml ='<div class="desc"><span>地址：</span><span>'+address+'</span></div>'+
        //							'<div class="desc"><span>电话：</span><span>'+marker.phone+'</span></div>';
        /*yext数据展示*/
        var hoursText = (data && (data.length > 0) && data[0].hoursText) ? '<div class="desc"><span>营业时间：</span><span>' + data[0].hoursText.display + '</span></div>' : '';
        var specialMessage = (data && (data.length > 0) && data[0].specialOfferMessage) ? '<div class="desc"><span>优惠：</span><span><a href=' + data[0].specialOfferMessage.url + ' target="_blank">' + data[0].specialOfferMessage.message + '</a></span></div>' : '';
        address = (data && (data.length > 0) && data[0].address2) ? '<div class="desc"><span class="info_address_icon"></span><span>地址：</span><span>' + address + '</span>' + data[0].address2 + (data[0].displayAddress || "") + '</div>' : '<div class="desc"><span class="info_address_icon"></span><span>地址：</span><span>' + address + '</span></div>';
        var categories = (categorieshtml != '') ? '<div class="desc"><span>分类：</span><span>' + categorieshtml + '</span></div>' : '';
        var phone = marker.phone ? '<div class="desc"><span class="info_phone_icon"></span><span>电话：</span><span>' + marker.phone + '</span></div>' : '';
        var description = data[0].description ? '<div class="desc"><span>店铺简介：</span><span>' + data[0].description + '</span></div>' : '';
        var website = data[0].website ? '<div class="desc"><span>网址：</span><span><a href="' + data[0].website[0].url + '" target="_blank">' + data[0].website[0].url + '</a></span></div>' : '';
        contentHtml = '<div class="top_content">' + address + phone + website + '</div>' + '<div class="bottom_content">' + hoursText + categories + specialMessage + description + '</div>';
    } else if (marker.uid.length < 11) {
        address = (data && (data.length > 0) && data[0].address2) ? '<div class="desc"><span class="info_address_icon"></span><span>地址：</span><span>' + address + '</span>' + data[0].address2 + (data[0].displayAddress || "") + '</div>' : '<div class="desc"><span class="info_address_icon"></span><span>地址：</span><span>' + address + '</span></div>';
        var phone = marker.phone ? '<div class="desc"><span class="info_phone_icon"></span><span>电话：</span><span>' + marker.phone + '</span></div>' : '';
        contentHtml = '<div class="top_content">' + address + phone + '</div>';
    }

    //如果marker.name中含有单引号   进行转译
    var sear = new RegExp("\'");
    if (sear.test(marker.name)) {
        var arr = marker.name.split("\'");
        marker.name = arr[0] + "\\'" + arr[1];
    }

    var html = '<div class="infowindow" marker-id="' + marker.getId() + '" data-target=".search_panel .rs_pois_content">' +
        '<div class="infopanel">' +
        '<div class="title" title="' + marker.name + '">' + splitExcessLength(marker.name, 20, " ...") + '<a title="关闭" class="close" href="javascript:void(0)" onclick="closeInfoWindow();"> X </a></div>' +
        '<div class="content">' +
        contentHtml +
        '<div class="desc"><a href="javascript:void(0);" class="thumnail_link"></a></div>' + //<img class="thumnail" src="/logo/picture/2014-04-18/91e600d6133d4273a08e75689be3e7d3.jpg"/></a>
            //'<div class="desc_tip"><a title="点击进入全景">进入全景&gt;&gt;  </a></div>'+
        '</div>' +
        '<div class="tools">' +
        '<div class="other_tool">' +
        (isPoiSouce ? '<span class="' + collectClass + '" onclick="collectPointForMarker(this, \'' + marker.getId() + '\')" data-nmid="' + nmid + '"><img src="../imap_jw/images/img_1.gif"></span>' : '')
            //						    	+ '<span> | </span>'
            //								+ '<span class="share"><img src="../imap_jw/images/img_1.gif"></span>'
            //								+ '<span> | </span>'
            //								+ '<span class="fankui"><img src="../imap_jw/images/img_1.gif"></span>'
        +
        '</div>'
            //					    	+ '<div class="detail_tool">'
            //								+ '<a href="details.htm?uid='+ marker.uid +'" target="_blank" uid='+ marker.uid +'>详情  &gt;&gt;</a>'
            //							+ '</div>'
        +
        '<div class="search_tool">' +
        '<div class="tool_tab_2" title="搜周边" onclick="onNearbySearch(-25);">搜周边</div>' +
        '<div class="tool_tab_2" title="查路线" onclick="onLineSearch(\'' + marker.getPosition().lng + '\',\'' + marker.getPosition().lat + '\',\'' + marker.name + '\');">查路线</div>' +
        '</div>' +
        '</div>' +
        '<div class="tool_contents">' +
        '<div class="tool_content">' +
        '<a onclick="onNearbyTypeSearch(\'餐厅\',\'' + marker.getId() + '\')">美食</a><a onclick="onNearbyTypeSearch(\'酒店\',\'' + marker.getId() + '\')">酒店</a><a onclick="onNearbyTypeSearch(\'景点\',\'' + marker.getId() + '\')">景点</a><a onclick="onNearbyTypeSearch(\'电影院\',\'' + marker.getId() + '\')">电影院</a>' +
        '<input class="keyword" type="text" data-tip="#smartTipSimple"  onkeyup="onSearchKeyUpSimple(event, \'.infowindow .keyword\',\'#smartTipSimple\');"/><span onclick="onNearbyWordSearch();" autocomplete="off" class="search"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="pophandle"><div class="triangle"></div></div>' +
        '</div>';

    //左侧列表中对应记录处于选中状态
    var $poisPanel = $(".search_panel .rs_pois_content");
    var $li = $poisPanel.find("li[marker-id='" + marker.getId() + "']");
    // 初始化子poi面板样式
    $li.find(".child-item.active").removeClass("active");
    // 更改相关覆盖物的显示
    changePoisExtraOverlayVisible(true, marker.getId());

    //MARKER图标变红
    changeTotalSearchMarkerColor(marker.getId(), $li[0]);

    if (diffTop) {
        //滚动到列表的当前项
        var diff = $li.offset().top - $poisPanel.offset().top;
        $(".search_panel .map_left_panel").animate({
            scrollTop: diff
        }, 200);
    }

    // content
    var $html = $(html);

    //判断有无全景
    var sid = $li.attr("station-id");
    if (sid && sid != null && MAP_CONFIG.STREET_MODE) {
        var $infowindow = $(".infowindow");
        $html.find(".thumnail_link").append('<img title="点击进入全景" class="thumnail"  onclick="toStationID(\'' + sid + '\',event)" src="' + MAP_CONFIG.STREET_SERVICE_URL + '/image/icon/' + sid + '?index=8' + '"/>');
        $html.find(".content").append('<div class="desc_tip"><a onclick="toStationID(\'' + sid + '\',event)" title="点击进入全景">进入全景&gt;&gt;  </a></div>');
    }

    if (infoWindow) {
        mapView.removeOverlay(infoWindow);
        infoWindow = null;
    }
    infoWindow = new LD.InfoWindow($("<div></div>").html($html).html(), {
        title: marker.name,
        position: marker.getPosition(),
        autoPan: true,
        anchor: LD.Constants.BOTTOM_CENTER,
        offset: new LD.Pixel(55, -25),
        type: LD.Constants.OVERLAY_INFOWINDOW_CUSTOM
    });
    mapView.addOverlay(infoWindow);

    //	var ele = infoWindow.getElement();
    //	var width = ele.offsetWidth || ele.clientWidth;
    //	var height = ele.offsetHeight || ele.clientHeight;
    //	var winSize = new LD.Size(width, height);
    //	会偏移，
    //	infoWindow.setSize(winSize);

    infoWindow.autoPan(true, [{
        x: 430,
        y: 60
    }, {
        x: 100,
        y: 60
    }]);
}

/**
 * 改变综合搜索POI的选中颜色和左侧结果列表的选中状态，支持子marker
 * @param {String} mid 需要变红的marker的id，null则全部恢复蓝色
 * @param {Element} obj 需要被选中的（active的class）左侧结果列表中的li，null则为全部移除active的class
 */
function changeTotalSearchMarkerColor(mid, obj) {
    var mkr = mapView.getOverlayById(mid);
    var isChild = mkr.belongTo && mkr.belongTo instanceof LD.Marker;

    $(".search_panel .rs_pois_content li").removeClass("active"); //清除原有的红色

    if (obj) {
        var $item = $(obj);
        $item.addClass("active"); //左侧列表中对应记录处于选中状态

        var $chnItem = null;
        if (isChild) {
            $chnItem = $item.find(".child-item[data-chnmid='" + mkr.getId() + "']");
        }
        if ($chnItem) {
            $chnItem.addClass("active").siblings().removeClass("active");
        }
    }

    // 10个父POI
    $(".search_panel .rs_pois_content li").each(function (index, item) {
        var _id = $(item).attr("marker-id");
        var marker = mapView.getOverlayById(_id);

        if (_id != mid) {
            _changeMarkerSelected(marker, false);
            // 不是子poi，是父poi
        } else if (!isChild) {
            _changeMarkerSelected(marker, true);
            // 初始化子poi为蓝色
            if (marker.children && marker.children.length > 0) {
                for (var i in marker.children) {
                    var chnMkr = marker.children[i];
                    _changeMarkerSelected(chnMkr, false, true);
                }
            }
        }
    });

    // 如果当前marker是子POI
    if (isChild) {
        // 恢复蓝色
        var pmkr = mkr.belongTo;
        for (var i in (pmkr.children || [])) {
            var childMkr = pmkr.children[i];

            _changeMarkerSelected(childMkr, false, true);
        }

        // 子poi
        _changeMarkerSelected(mkr, true, true);

        // 父poi
        /*
         var pmkrIcon = pmkr.getIcon();
         var offset=new LD.Pixel(pmkrIcon.getOffset().x, pmkrIcon.getOffset().y - 31);//变成红色
         pmkr.setIcon(new LD.Icon(pmkrIcon.getSrc(), pmkrIcon.getSize(), offset));
         pmkr.setZIndex(10);
         */
    }
}
/**
 * 改变marker的选中状态
 * @param {LD.Marker} mkr marker
 * @param {Boolean} select 是否被选中，默认false
 * @param {Boolean} ischild 是否为子poi，默认false
 */
function _changeMarkerSelected(mkr, select, ischild) {
    select = !(!select);
    ischild = !(!ischild);

    var mkrIcon = mkr.getIcon();
    if (select) {
        // 若当前为蓝色，变为红色
        if (mkrIcon.getOffset().y > -1) {
            var offset = new LD.Pixel(mkrIcon.getOffset().x, mkrIcon.getOffset().y - 31); //变成红色
            mkr.setIcon(new LD.Icon(mkrIcon.getSrc(), mkrIcon.getSize(), offset));
            if (ischild) {
                mkr.setZIndex(15);
            } else {
                mkr.setZIndex(10);
            }
        }
    } else {
        // 若当前为红色，变为蓝色
        if (mkrIcon.getOffset().y < -5) {
            var offset = new LD.Pixel(mkrIcon.getOffset().x, mkrIcon.getOffset().y + 31);
            mkr.setIcon(new LD.Icon(mkrIcon.getSrc(), mkrIcon.getSize(), offset));
            if (ischild) {
                mkr.setZIndex(14);
            } else {
                mkr.setZIndex(9);
            }
        }
    }
}

function onSearchListItemClick(_mid) {
    var marker = mapView.getOverlayById(_mid)
    var x = marker._position.lng;
    var y = marker._position.lat;
    mapView.setCenter(x, y, 12);
    //	map.setZoom(12);
    openSearchWindow(marker);
}

function closeInfoWindow() {
    //
    var mid = $(".infowindow").attr("marker-id");
    var target = $(".infowindow").attr("data-target");
    if (mid && target && mid != "" && target != "") {
        var marker = mapView.getOverlayById(mid);
        var isChild = (marker.belongTo != null && marker.belongTo instanceof LD.Marker);
        var $panel = $(target);
        //左侧列表中对应记录处于选中状态
        if (isChild) {
            $panel.find("li[marker-id='" + marker.belongTo.getId() + "'] .child-item").removeClass("active");
        } else {
            //			$panel.find("li[marker-id]").removeClass("active");
            //			changePoisExtraOverlayVisible(false);
        }
        var icon = marker.getIcon();
        var offset = new LD.Pixel(marker.getIcon().getOffset().x, marker.getIcon().getOffset().y + 31);
        marker.setIcon(new LD.Icon(icon.getSrc(), icon.getSize(), offset));
    }

    if (infoWindow) {
        mapView.removeOverlay(infoWindow);
    }
}
//搜索结果列表点返回
function backofResultList() {
    $("#poilistwrap,.map_left_search .text_close").hide();
    $("#searchWord").val($("#searchWord").attr("defaultval"));
    //cleanMapOverlays();

    //---
    $("#map_left_choice_h").show();
    $("#foldTool img").attr("data-target", "#map_left_choice_h").attr("class", "close");
    swapLeftList(".map_left_choice_li li[showTarget='.map_left_choice_div']");
}
// 搜索列表与地图之间交互操作
function onSearchListItem() {

}
//分页操作
function toPrePage(obj) {
    //var $this = $(obj);
    if ((searchPage.page /*+1*/ ) <= 1) {
        return;
    } else {
        searchPage.page--;
        reloadPage();
    }
}

function toProPage(obj) {
    //var $this = $(obj);
    var totalpage = Math.ceil(searchPage.count / searchPage.pageSize);
    if ((searchPage.page /*+1*/ ) >= totalpage) {
        return;
    } else {
        searchPage.page++;
        reloadPage();
    }
}

function toIndexPage(obj, index) {
    index = index == null ? 1 : index;
    var $this = $(obj);
    if ($this.hasClass("disabled")) {
        return;
    } else {
        searchPage.page = index;
        reloadPage();
    }
}

function reloadPage() {
    if (searchPage.op == "word") {
        sendWordSearchRequest(); //城市关键词
        mapView.removeHotspotLayer();
    } else if (searchPage.op == "category") {
        sendCatagorySearchRequest(); //城市分类
        mapView.removeHotspotLayer();
    } else if (searchPage.op == "nearbytype") {
        //sendNearbyTypeSearchRequest(); //周边分类
        sendCatagorySearchRequest();
        mapView.removeHotspotLayer();
    } else if (searchPage.op == "nearbyword") {
        sendNearbyWordSearchRequest(); //周边关键词
        //sendWordSearchRequest();
        mapView.removeHotspotLayer();
    } else if (searchPage.op == "regiontype") {
        sendRegionTypeSearchRequest(); //范围分类
    } else if (searchPage.op == "regionword") {
        sendRegionWordSearchRequest(); //范围关键词
        mapView.removeHotspotLayer();
    } else if (searchPage.op == "wordcountry") {
        sendWholeCountryWordSearchRequest(); //全国关键词
        mapView.removeHotspotLayer();
    }
}
//======================================marker infowindow结束==============================================//
/**
 *
 * @param {Object} lng
 * @param {Object} lat
 * @param {String} name
 * @param {Boolean} isEnd true为设置终点输入框，false为设置起点输入框，默认false
 */
function onLineSearch(lng, lat, name, isEnd) {
    isbus = true;
    isGD = false;
    isEnd = !(!isEnd);

    initLinePageStatus(false);
    var target = ".panel_top .route_search .route_start .route_input";
    if (isEnd) {
        target = ".panel_top .route_search .route_end .route_input";
    }
    setDataToLineInputAttribute(target, {
        title: name,
        dataLocation: lng + "," + lat
    });
    //	checkLineDataMatchToSearch();

    var icon = MAP_STYLE.icon.smallStart;
    if (isEnd) {
        icon = MAP_STYLE.icon.smallEnd;
    }

    var marker = addIconMarkerForTransit({
        canOpen: false,
        icon: icon.icon,
        iconWidth: icon.iconWidth,
        iconHeight: icon.iconHeight,
        offsetX: icon.offsetX,
        offsetY: icon.offsetY,
        posX: lng,
        posY: lat,
        name: name
    });
    // 终点直接放到最后一个
    lineMarkers[isEnd ? 4 : 0] = marker;
    // 阻止冒泡
    stopBubble(event);
    return false;
}

//=======================================新增：关键词搜索，当前城市不存在则返回全国其它城市的结果列表
function keywordResultInOtherCitys(data) {
    var labels = [];
    var $panel = $(".search_panel .rs_othercitys")
    if (data.length == 1) {
        searchCityPOI(jQuery.parseJSON(JSON.stringify(data[0])));
        return;
    }
    $panel.find(".no_find_info .currentcity").text(currentCity.cityname);
    var $list = $panel.find(".citys_list");
    //$list.css({'height':'auto', 'max-height':'600px', 'overflow-y':'auto'});
    $list.empty();
    //具体数据
    for (var i = 0, len = data.length; i < len; i++) {
        var $html = $("<div></div>").addClass("citys-list-item").attr("data-cityobj", JSON.stringify(data[i]));
        $("<a></a>").addClass("rs_cityname").text(data[i].name).appendTo($html);
        $("<span></span>").addClass("rs_poinum").text("(" + data[i].resultnum + ")").appendTo($html);
        $list.append($html);
        //显示label
        //var label = mapView.createLabel('<div class="label_for_num">'+data[i].resultnum+'</div>', '116.614586', '39.822436');
        //label.addEventListener('click',function(){searchCityPOI();});
        //labels.push(label);
    }
    $panel.siblings().hide();
    $panel.show();
    changeLeftPanelStatus("search");
    //事件绑定
    $panel.find(".citys_list .citys-list-item").click(function () {
        searchCityPOI($(this).data("cityobj"));
    });

    //点击城市或者具体label搜索具体信息
    function searchCityPOI(cityobj) {
        currentCity.cityname = cityobj.name;
        changeCity(cityobj.adcode, "q");
        doSearch();
    }
}


var searchLine = {
    bgnX: "",
    bgnY: "",
    endX: "",
    endY: "",
    tjdX: [],
    tjdY: [],
    tjd: [],// 途经点
    start: "",// 起点
    end: "",// 终点
    city: "",
    // 导航策略 最短时间11，最短路径12...
    tactics: 11,
    // 公交 bus、驾车 driver、步行 walk
    mode: "bus",
    // 搜索结束时打开第几个方案的索引
    schemeIndex: 0,
    // 查询时验证失败则为false，xxms后可再次查询，true为正常查询
    trueButton: true,
    // 搜索按钮，开始搜索添加 loading class，再次点击无效
    // $(searchLine.searchButton).removeClass("loading"); 搜索成功移除loading class
    searchButton: ".panel_top .route_page .route_reckon"
};
//默认城市为北京市
var currentCity = {
    cityname: "北京市",
    lat: 39.9042,
    lon: 116.407,
    postcode: undefined,
    qid: 110000,
    sname: "北京市",
    telno: "010"
};
var gddata;
var curAdcode;
var isnearbyword = false;
var isbus = false;
var isGD;
//全局变量定义
var searchPage = {
    page: 1,
    /*当前页码*/
    pageSize: 10,
    /*页大小*/
    count: 0,
    /*总记录数*/
    op: "word",
    /*搜索类型:word-关键字(城市范围) wordcountry关键字(全国范围)，category-类型(城市范围)，-nearbytype周边类型，-nearbyword周边关键词，-regiontype范围内类型，-regionword范围内关键词*/
    word: "",
    /*关键字搜索的输入文字*/
    category: "",
    /*类型搜索的类型代码*/
    center: {
        x: 0,
        y: 0
    },
    /*周边搜索的中心点*/
    region: {
        leftbottom: {},
        topright: {}
    },
    /*范围搜索中的范围*/
    range: 5000,
    /*周边搜索的半径*/
    tempObj: null,
    /*保存关键词搜索的POI列表*/
    searchXhr: null,
};
/**
 * 验证起终点格式不规范时的提醒
 */

var searchLineErrorPage = {
    pageSize: 10,
    bgnPage: 1,
    endPage: 1,
    tjdPage: [],
    bgnCount: 0,
    endCount: 0,
    tjdCount: [],
    errorList: ".route_panel .error_content_list",
    // 暂时不用
    pageList: "",
    // 通过setTimeout和clearTimeout，判断最后一次调用showLineErrorList()函数
    lastTimeout: null
};

/*function setValue() {
 if (map["marker_blue_keynane"])document.getElementById("inputfrom").value = map["marker_blue_keynane"];
 if (map["marker_red_keynane"])document.getElementById("inputto").value = map["marker_red_keynane"];
 }*/


function carNav() {
    //  document.getElementById("dirbox") && document.getElementById("map").removeChild(document.getElementById("dirbox"));

    // var updownicon = "<svg t='1594283179802' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='3804' xmlns:xlink='http://www.w3.org/1999/xlink' width='40' height='40'><defs><style type='text/css'></style></defs><path d='M579.3 290.1c17.1 0 31 13.4 31.6 30.5v305.2l21.3-21.3c6-6 13.9-9.3 22.4-9.3 8.5 0 16.4 3.3 22.4 9.3 6 6 9.3 13.9 9.3 22.4 0 8.5-3.3 16.4-9.3 22.4l-74.5 74.6c-6 6.5-14.4 10.2-23.3 10.2-7.7 0-15.2-2.8-20.9-7.9-6.8-6-10.7-14.6-10.7-23.7v-380c-0.2-8.3 2.8-16.2 8.4-22.3 5.7-6.2 13.6-9.8 22-10.1h1.3zM444.7 733.9c-17.1 0-31-13.4-31.6-30.5V398.3l-21.3 21.3c-6 6-13.9 9.3-22.4 9.3-8.5 0-16.4-3.3-22.4-9.3-6-6-9.3-13.9-9.3-22.4 0-8.5 3.3-16.4 9.3-22.4l74.5-74.6c6-6.5 14.4-10.2 23.3-10.2 7.7 0 15.2 2.8 20.9 7.9 6.8 6 10.7 14.6 10.7 23.7v379.8c0.2 8.3-2.8 16.2-8.4 22.3-5.7 6.2-13.6 9.8-22 10.1-0.5 0.1-0.9 0.1-1.3 0.1z' fill='#ffffff' p-id='3805'></path></svg>"
    // var caricon = "<svg t='1594281509379' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='1429' xmlns:xlink='http://www.w3.org/1999/xlink' width='25' height='25'><defs><style type='text/css'></style></defs><path d='M213.333333 469.333333l64-192h469.333334L810.666667 469.333333m-64 213.333334a64 64 0 0 1-64-64 64 64 0 0 1 64-64 64 64 0 0 1 64 64 64 64 0 0 1-64 64m-469.333334 0A64 64 0 0 1 213.333333 618.666667 64 64 0 0 1 277.333333 554.666667 64 64 0 0 1 341.333333 618.666667 64 64 0 0 1 277.333333 682.666667M807.253333 256c-8.533333-24.746667-32.426667-42.666667-60.586666-42.666667h-469.333334c-28.16 0-52.053333 17.92-60.586666 42.666667L128 512v341.333333a42.666667 42.666667 0 0 0 42.666667 42.666667h42.666666a42.666667 42.666667 0 0 0 42.666667-42.666667v-42.666666h512v42.666666a42.666667 42.666667 0 0 0 42.666667 42.666667h42.666666a42.666667 42.666667 0 0 042.666667-42.666667v-341.333333l-88.746667-256z' fill='#ffffff' p-id='1430'></path></svg>";
    //var closeicon = "<svg t='1594282285764' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='2971'xmlns:xlink='http://www.w3.org/1999/xlink' width='18' height='18'><defs><style type='text/css'></style></defs><path d='M583.168 523.776L958.464 148.48c18.944-18.944 18.944-50.176 0-69.12l-2.048-2.048c-18.944-18.944-50.176-18.944-69.12 0L512 453.12 136.704 77.312c-18.944-18.944-50.176-18.944-69.12 0l-2.048 2.048c-19.456 18.944-19.456 50.176 0 69.12l375.296 375.296L65.536 899.072c-18.944 18.944-18.944 50.176 0 69.12l2.048 2.048c18.944 18.944 50.17618.944 69.12 0L512 594.944 887.296 970.24c18.944 18.944 50.176 18.944 69.12 0l2.048-2.048c18.944-18.944 18.944-50.176 0-69.12L583.168 523.776z' p-id='2972' fill='#ffffff'></path></svg>";
    // var bxicon = "<svg t='1594283692447' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='5189' xmlns:xlink='http://www.w3.org/1999/xlink' width='25' height='25'><defs><style type='text/css'></style></defs><path d='M566.1 261.4c44.8 0 82-37.2 82-81.9s-37.3-81.9-82-81.9c-44.8 0-82.1 37.2-82.1 81.9 0.1 44.7 37.4 81.9 82.1 81.9z m179.1 208.4l-100.7-37.2-63.4-115.4c-3.7-3.7-7.5-7.4-7.5-11.2l-7.5-7.4c-26.1-26.1-63.4-29.8-97-14.9l-175.3 59.6c-14.9 3.7-26.1 18.6-29.8 33.5l-14.9 137.7c-3.7 22.3 14.9 44.7 37.3 48.4h3.7c22.4 0 41-14.9 41-37.2l11.2-107.9 67.1-22.3c-11.2 26.1-22.4 52.1-29.8 70.7-14.9 33.5-14.9 78.2 3.7 115.4l-115.6 268c-11.2 26.1 0.3 58.8 26.1 70.7 29.5 13.6 64.7-11.7 74.6-33.5l85.8-193.5c52.2 93.1 111.9 201 111.9 204.7 11.2 18.6 29.8 29.8 48.5 29.8 7.5 0 18.6-3.7 26.1-7.4 26.1-14.9 37.3-48.4 22.4-74.4-3.7-7.4-93.2-174.9-152.9-275.4l52.2-115.4 18.6 33.5c3.7 11.2 14.9 14.9 22.4 18.6L719 551.7c3.7 0 11.2 3.7 14.9 3.7 18.6 0 33.6-11.2 41-29.8 3.8-22.3-7.4-48.3-29.7-55.8z' p-id='5190' fill='#ffffff'></path></svg>"
    // var busicon = "<svg t='1594283657473' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='4696' xmlns:xlink='http://www.w3.org/1999/xlink' width='25' height='25'><defs><style type='text/css'></style></defs><path d='M768 469.333333H256V256h512m-64 469.333333a64 64 0 0 1-64-64 64 64 0 0 1 64-64 64 64 0 0 1 64 64 64 64 0 0 1-64 64m-384 0A64 64 0 0 1 256 661.333333 64 64 0 0 1 320 597.333333 64 64 0 0 1 384 661.333333 64 64 0 0 1 320 725.333333M170.666667 682.666667c0 37.546667 16.64 71.253333 42.666666 94.72V853.333333a42.666667 42.666667 0 0 0 42.666667 42.666667h42.666667a42.666667 42.666667 0 0 0 42.666666-42.666667v-42.666666h341.333334v42.666666a42.666667 42.666667 0 0 0 42.666666 42.666667h42.666667a42.666667 42.666667 0 0 0 42.666667-42.666667v-75.946666c26.026667-23.466667 42.666667-57.173333 42.666666-94.72V256c0-149.333333-152.746667-170.666667-341.333333-170.666667s-341.333333 21.333333-341.333333 170.666667v426.666667z' fill='#ffffff' p-id='4697'></path></svg>"
    // var inputTab = document.createElement("div")
    // inputTab.className = "dirbox"
    //  inputTab.id = "dirbox"
    //  inputTab.innerHTML = "<table class='planForm'>" +
    //     "<tr><td style='width: 25px'></td><td><span class='lwj-nav' onclick='setNavType(this)' data='car'>" + caricon + "</span><span   class='lwj-nav'  onclick='setNavType(this)' data='bus'>" +
    //      busicon + "</span><span  class='lwj-nav'  onclick='setNavType(this)' data='walk'>" + bxicon + "</span></td><td></td></tr>" +
    //     "<tr><td rowspan='2' ><div class='lwj-updown'>" + updownicon + "</div></td><td>起点：<input id='inputfrom' type='input' placeholder='请输入起点'  class='lwj-input'></td><td></td></tr>" +
    //    "<tr><td>终点：<input  id='inputto' type='input' placeholder='请输入终点'    class='lwj-input'></td><td></td></tr></table>" +
    // "<tr><td></td><td><br></td></tr>" +
    // "<tr><td></td><td><a href='javascript:void(0)' class='lwj-submit' onclick='submitNav()'>开车去</a></td></tr></table>" +
    //  "<div class='lwj-close' onclick='lwjclose()'>" + closeicon + "</div>";
    // document.getElementById("map").appendChild(inputTab)
    $(".imapgl-ctrl-top-left").hide();
    $(".search_page").hide();
    $(".route_page").show();
}


//多类型导航
function setNavType(e) {
    //map["NAV_TYPE"] = e.getAttribute("data");
    if (e.innerText == "公交") {
        map["NAV_TYPE"] = "bus";
        //$(".bus>div").css("color","#44b79d");
        $(".bus").removeClass("active").addClass("active");
        //$(".driver>div,.walk>div").css("color","#666");
        $(".walk,.driver").removeClass("active")
    } else if (e.innerText == "驾车") {
        map["NAV_TYPE"] = "car";
        $(".driver").removeClass("active").addClass("active");
        //$(".driver").css("color","#44b79d");
        //$(".bus>div,.walk>div").css("color","#666");
        $(".bus,.walk").removeClass("active")
    } else if (e.innerText == "步行") {
        map["NAV_TYPE"] = "walk";
        $(".walk").removeClass("active").addClass("active");
        //$(".walk").css("color","#44b79d");
        //$(".driver>div,.bus>div").css("color","#666");
        $(".bus,.driver").removeClass("active")
    }
    if ($.trim($("#inputfrom").val()) != "" && $.trim($("#inputto").val()) != "") {
        navBy(map["NAV_TYPE"])
    }


    //改变图标

    // for (var i in e.parentNode.childNodes) {
    //       e.parentNode.childNodes[i].style.cssText="opacity: 0.5;";
    //  }
    // for (var i in document.getElementsByClassName("lwj-nav")) {
    //     document.getElementsByClassName("lwj-nav")[i].style.opacity = 0.5;
    // }
    // e.style.cssText = "opacity: 1;";
}

function initNavColor() {
    var type_color;
    switch (map["NAV_TYPE"]) {
        case "car":
            type_color = "#459C50";
            break;
        case "bus":
            type_color = "#5B87C1";
            break;
        case "walk":
            type_color = "#58B6D3";
            break;
    }
    return type_color;
}
//仅初始化线类型
function addLines(arr) {
    clearLines()
    var type_color = initNavColor();

    var navLines = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": 1,
                    "name": "天府大道"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": arr
                }
            }
        ]
    }
    map.addSource('navLines', {type: 'geojson', data: navLines});
    map.addLayer({
        "id": "navLines-style-1",
        "type": "line",
        "source": "navLines",
        "layout": {
            "visibility": "visible",
            "line-join": "round",
            "line-cap": "butt"
        },
        "paint": {
            "line-translate-anchor": "viewport",
            "line-width": {
                "stops": [
                    [
                        7,
                        8
                    ],
                    [
                        18,
                        8
                    ]
                ],
                "base": 1.2
            },
            "line-color": type_color
        },
        "interactive": true
    })

    map.addLayer({
        "id": "navLines-style-2",
        "type": "line",
        "source": "navLines",
        "layout": {
            "visibility": "visible",
            "line-join": "round",
            "line-cap": "butt"
        },
        "paint": {
            "line-translate-anchor": "viewport",
            "line-width": {
                "stops": [
                    [
                        7,
                        4
                    ],
                    [
                        18,
                        4
                    ]
                ],
                "base": 1.2
            },
            "line-dasharray": [
                2,
                5
            ],
            "line-color": "#ffffff"
        },
        "interactive": true
    })

    setBound(arr);
}

function clearLines() {
    map.getLayer("navLines-style-1") && map.removeLayer("navLines-style-1");
    map.getLayer("navLines-style-2") && map.removeLayer("navLines-style-2");
    map.getSource("navLines") && map.removeSource("navLines")
}

function navBy(type) {
    //origin: 北京市东城区大兴胡同18号城隍庙|116.41099,39.9373
    var bus = "{ipprot}/v3/route/bus?ak={ak}&origin={origin}&destination={destination}&tactics=11&callback=callback_bus&" + parseInt(Math.random() * 1000000000);
    var walk = "{ipprot}/v3/route/walk?ak={ak}&origin={origin}&destination={destination}&tactics=11&callback=callback_walk&" + parseInt(Math.random() * 1000000000);
    var car = "{ipprot}/v3/route/car?ak={ak}&waypoints=&origin={origin}&destination={destination}&tactics=11&callback=callback_car&" + parseInt(Math.random() * 1000000000);

    bus = bus.replace("{ipprot}", window.leador_server_ipprot).replace("{ak}",window.leador_server_ak)
    walk = walk.replace("{ipprot}", window.leador_server_ipprot).replace("{ak}",window.leador_server_ak)
    car = car.replace("{ipprot}", window.leador_server_ipprot).replace("{ak}",window.leador_server_ak)

    if (!map["marker_blue"] || !map["marker_red"]) {
        return false;
    }
    var requestUrl;
    if (type == "bus")requestUrl = bus;
    if (type == "walk")requestUrl = walk;
    if (type == "car")requestUrl = car;

    var script = document.createElement("script")
    script.src = requestUrl
        .replace("{origin}", map["marker_blue"].getLngLat().lng + "," + map["marker_blue"].getLngLat().lat)
        .replace("{destination}", map["marker_red"].getLngLat().lng + "," + map["marker_red"].getLngLat().lat)
    document.querySelector("body").appendChild(script);
    document.querySelector("body").removeChild(script);

    window["callback_bus"] = function (data) {
        searchLine.mode = "bus";
        if (data.status == "0") {
            map["callback_bus_array"] = [];
            var steps = data.result.routes[0].scheme[0].steps;
            for (var i in steps) {
                var path = steps[i].path.split(";");
                for (var ii in path) {
                    if (path[ii].split(",")[0] && path[ii].split(",")[1]) {
                        map["callback_bus_array"].push([Number(path[ii].split(",")[0]), Number(path[ii].split(",")[1])])
                    }
                }
            }
            // console.log(map["callback_bus_array"])
            addLines(map["callback_bus_array"]);

            // 显示  “清除路线”
            $(".panel_top .route_page .cleanlines").show();
            // 第一个方案路程800m以内，则跳转到步行搜素
            for (var i in data.result.routes) {
                var scheme = data.result.routes[i].scheme[0];
                // scheme.distance = "500";
                if (/\d+/.test("" + scheme.distance) && parseInt(scheme.distance) <= 800) {
                    $(".panel_top .route_page .route_choose .route_type.walk").click();
                    return;
                }
            }
            // 生成HTML
            createTransitLineScheme(data);
            // 设置导航策略样式
            var $targetTactics = $(".route_panel .route_bus .tactic_choose .item_list [data-tactics='" + searchLine.tactics + "']");
            $targetTactics.addClass("active").siblings().removeClass("active");
            // 显示面板
            var $routePanel = $(".route_panel");
            var $currentPanel = $routePanel.find(".route_bus").show();
            $currentPanel.siblings().hide();
            $currentPanel.find(".scheme_list").hide();
            $routePanel.show();
            $currentPanel.find(".scheme_list").slideDown(500);
        }
        var errorMessage = null;
        if (!data) {
            errorMessage = "抱歉，无返回路线结果，请更换地点";
        } else if (data.status == "10182") {
            errorMessage = "抱歉，起点附近没有公交站";
        } else if (data.status == "10183") {
            errorMessage = "抱歉，终点附近没有公交站";
        } else if (data.status == "10180") {
            // {"message":"起点终点步行距离过短，即步行可达","status":"10180"}
            $(".panel_top .route_page .route_choose .route_type.walk").click();
            return;
        } else if (data.status != "0") {
            errorMessage = "抱歉，无返回路线结果，请更换地点";
        }
        if (errorMessage) {
            alertContentOnTopSearch(errorMessage);
            return;
        }
    }
    window["callback_walk"] = function (data) {
        searchLine.mode = "walk";
        if (data.status == "0") {
            map["callback_bus_array"] = [];
            var steps = data.result.routes[0].steps;
            for (var i in steps) {
                var path = steps[i].path.split(";");
                for (var ii in path) {
                    map["callback_bus_array"].push([Number(path[ii].split(",")[0]), Number(path[ii].split(",")[1])])
                }
            }
            addLines(map["callback_bus_array"]);
            // 显示  “清除路线”
            $(".panel_top .route_page .cleanlines").show();
            // 生成HTML
            createDrivingLineScheme(data);
            // 设置导航策略样式
            var $targetTactics = $(".route_panel .route_driver .tactic_choose .item_list [data-tactics='" + searchLine.tactics + "']");
            $targetTactics.addClass("active").siblings().removeClass("active");
            // 显示面板
            var $routePanel = $(".route_panel");
            var $currentPanel = $routePanel.find(".route_driver").show();
            $currentPanel.siblings().hide();
            $currentPanel.find(".scheme_list").hide();
            $routePanel.show();
            $currentPanel.find(".scheme_list").slideDown(500);
        }
        var errorMessage = null;
        if (!data) {
            errorMessage = "抱歉，无返回路线结果，请更换地点";
        } else if (data.status != "0") {
            errorMessage = "抱歉，无返回路线结果，请更换地点";
        }
        if (errorMessage) {
            alertContentOnTopSearch(errorMessage);
            return;
        }

    }

    window["callback_car"] = function (data) {
        searchLine.mode = "driver";
        if (data.status == "0") {
            map["callback_bus_array"] = [];
            var steps = data.result.routes[0].steps;
            for (var i in steps) {
                var path = steps[i].path.split(";");
                for (var ii in path) {
                    map["callback_bus_array"].push([Number(path[ii].split(",")[0]), Number(path[ii].split(",")[1])])
                }
            }
            addLines(map["callback_bus_array"]);

            // 显示  “清除路线”
            $(".panel_top .route_page .cleanlines").show();
            // 生成HTML
            createDrivingLineScheme(data);
            // 设置导航策略样式
            var $targetTactics = $(".route_panel .route_driver .tactic_choose .item_list [data-tactics='" + searchLine.tactics + "']");
            $targetTactics.addClass("active").siblings().removeClass("active");
            // 显示面板
            var $routePanel = $(".route_panel");
            var $currentPanel = $routePanel.find(".route_driver").show();
            $currentPanel.siblings().hide();
            $currentPanel.find(".scheme_list").hide();
            $routePanel.show();
            $currentPanel.find(".scheme_list").slideDown(500);
        }
        var errorMessage = null;
        if (!data) {
            errorMessage = "抱歉，无返回路线结果，请更换地点";
        } else if (data.status != "0") {
            errorMessage = "抱歉，无返回路线结果，请更换地点";
        }
        if (errorMessage) {
            alertContentOnTopSearch(errorMessage);
            return;
        }
    }
}

function setBound(arr) {
    var bbox = [];
    var x = [], y = [];
    for (var i in arr) {
        x.push(arr[i][0]);
        y.push(arr[i][1]);
    }
    bbox.push([Math.min.apply(null, x), Math.min.apply(null, y)])
    bbox.push([Math.max.apply(null, x), Math.max.apply(null, y)])

    map.fitBounds(bbox, {
        padding: {top: 100, bottom: 100, left: 450, right: 100},
        linear: true,
        // offset:[200,100]
    });
}

function lwjclose() {
    document.getElementById("map") && document.getElementById("map").removeChild(document.getElementById("dirbox"));
}


/**
 * 生成公交搜索方案列表
 * @param data
 */
function createTransitLineScheme(data) {
    var $schemeList = $(".route_panel .route_bus .scheme_list");
    var $schemeHtml = $('<div class="scheme_item"></div>');
    $schemeHtml.append('<div class="scheme_header"></div>');
    $schemeHtml.append('<div class="step_list"></div>');
    var $schemeHeaderHtml = $schemeHtml.find(".scheme_header");
    $schemeHeaderHtml.append('<span class="title_prefix">'
        + '<span class="number"></span>'
        + '</span>');
    $schemeHeaderHtml.append('<div class="item_content">'
        + '<p class="item_title"></p>'
        + '<p class="item_detail">'
        + '<span class="shoucang"><img src="../imap_jw/images/img_1.gif" /></span> | '
        + '<span class="detail_info"></span>'
        + '</p>'
        + '</div>');
    $schemeHeaderHtml.append('<span class="item_fold"><img src="../imap_jw/images/img_1.gif" /></span>');

    // 默认步骤样式
    var $defaultStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
//				+ '<span class="text_middle"></span>'
        + '</span>'
        + '<div class="step_content">'
        + '<span class="poi_name"></span>'
        + '</div>'
        + '</div>');
    var $busStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
        + '<img class="icon icon_top" src="../imap_jw/images/img_1.gif">'
        + '<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">'
        + '<img class="icon icon_bottom" src="../imap_jw/images/img_1.gif">'
        + '</span>'
        + '<div class="step_content">'
        + '<p class="step_title">'
        + '<span class="bus_name"></span>'
        + '<span class="right_extra"></span>'
        + '</p>'
        + '<p class="step_detail step_start"><span class="poi_name"></span> 上车</p>'
        + '<p class="step_detail step_end"><span class="poi_name"></span> 下车</p>'
        + '</div>'
        + '</div>');

    $schemeList.empty();

    // 解析input，判断线路是否收藏
    //var lineData = parseLineData2collect("${num}");
    //var lineDataKey = getCollectNaviLineKey(lineData);

    for (var i = 0; i < data.result.routes.length; i++) {
        //var isCollectLine = false;
        //if(lineDataKey){
        //var findKey = lineDataKey.replace("${num}", i);
        //var rstData = collectNaviLines[findKey];
        //isCollectLine = (rstData != null);
        //}
        var $scheme = $schemeHtml.clone();
        var $header = $scheme.find(".scheme_header");

        //if(isCollectLine){
        //	$header.find(".item_content .shoucang").addClass("active");
        //}

        $header.find(".number").text(i + 1);
        // 方案
        var scheme = data.result.routes[i].scheme[0];
        var start = searchLine.start;
        var end = searchLine.end;

        var lines = [];
        var linesInfo = "";
        // 获取步骤中的线路
        for (var j in scheme.steps) {
            var step = scheme.steps[j];

            if (step.vehicle.name != null) {
//			if (step.vehicle != null) {
                var info = step.vehicle.name;
//				var type = step.vehicle.type;
                var type = step.type;
                var other = info.substring(info.indexOf("("));
                info = info.slice(0, info.indexOf("("));

                // type  3公交  5步行  7地铁
                if (type == "3") {
                    info += "路";
                    step.vehicle.name = info + other;
                }

                lines.push(info);
            }
        }
        if (lines.length > 0) {
            linesInfo = lines.join(" > ");
        } else {
            linesInfo = "没有乘车";
        }
        $header.find(".item_content .item_title").text(linesInfo);
//		var detailInfo = (scheme.duration == null || scheme.duration == "") ? ""+metersToKilometers(scheme.distance) :
//			Math.round(scheme.duration / 60) + "分钟" + " | " + metersToKilometers(scheme.distance);
        var detailInfo = "";
        if (/\d+/.test("" + scheme.duration)) {
            var time = parseInt(scheme.duration);
            detailInfo += Math.round(time / 60) + "分钟 | "
        }
        detailInfo += metersToKilometers(scheme.distance);
        $header.find(".item_content .detail_info").text(detailInfo);

        var stepHtmlList = [];

        // 步骤
        for (var j = 0; j < scheme.steps.length; j++) {
            var step = scheme.steps[j];
            var prevStep = scheme.steps[j - 1];
            var nextStep = scheme.steps[j + 1];
            // 在同一个公交站换乘，或者是地铁换乘地铁，step.path是""
//			if(step.path==""){
//				continue;
//			}
            connectNextStep(step, nextStep);

            var $stepHtml = null;

            var origin = step.stepOriginLocation || "";
            var destination = step.stepDestinationLocation || "";
            if (isNotNull(origin)) {
                origin = origin.lng + "," + origin.lat;
            }
            if (isNotNull(destination)) {
                destination = destination.lng + "," + destination.lat;
            }

            var distance = metersToKilometers(step.distance);
            // type  3公交  5步行  7地铁
            if (step.type == "5") {
                $stepHtml = $defaultStepHtml.clone();
                $stepHtml.addClass("step_walk").data("data-path", step.path || "");
                // 当前是步行，并且下一步和上一步都是地铁，添加“站内换乘”
                if (prevStep && nextStep && prevStep.type == "7" && nextStep.type == "7") {
                    $stepHtml.find(".step_content").text("站内换乘");
                } else {
                    $stepHtml.find(".step_content").text("步行 " + distance);
                }
            } else {
                var stopnums = parseInt(step.vehicle.stop_num) + 1;
                $stepHtml = $busStepHtml.clone();
                $stepHtml.data("data-path", step.path)
                    .data("data-origin", origin)
                    .data("data-destination", destination);
                $stepHtml.find(".step_title .bus_name").text(step.vehicle.name);
                $stepHtml.find(".step_title .right_extra").text(stopnums + "站");
                // poi可点
                $stepHtml.find(".step_start .poi_name").attr("data-location", origin)
                    .text(step.vehicle.start_name);
                $stepHtml.find(".step_end .poi_name").attr("data-location", destination)
                    .text(step.vehicle.end_name);
                $stepHtml.find(".poi_name").attr("onclick", "openMarkerInfoWindowForTransit(event);");

                // step.vehicle.type   0为日常公交，1为地铁
                // 目前此字段都为0
//				$stepHtml.attr("data-road-type", step.vehicle.type);

                $stepHtml.attr("data-road-type", step.type == "7" ? 1 : 0);
                if (step.type == "7") {
                    $stepHtml.addClass("step_subway");
                } else {
                    $stepHtml.addClass("step_bus");
                }

            }
            $stepHtml.addClass("highlight");
            stepHtmlList.push($stepHtml);
        }

        var $stepStart = $defaultStepHtml.clone();
        // <img class="icon icon_middle" src="../imap_jw/images/img_1.gif">
        $stepStart.addClass("step_start").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepStart.find(".step_content .poi_name").text(searchLine.start)
            .data("data-location", searchLine.bgnX + "," + searchLine.bgnY)
            .attr("onclick", "openMarkerInfoWindowForTransit(event);");

        var $stepEnd = $defaultStepHtml.clone();
        $stepEnd.addClass("step_end").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepEnd.find(".step_content .poi_name").text(searchLine.end)
            .data("data-location", searchLine.endX + "," + searchLine.endY)
            .attr("onclick", "openMarkerInfoWindowForTransit(event);");

        var $stepList = $scheme.find(".step_list");
        $stepList.append($stepStart);
        for (var j in stepHtmlList) {
            $stepList.append(stepHtmlList[j]);
        }
        $stepList.append($stepEnd);
        $schemeList.append($scheme);
    }
    // 与changeLeftPanelStatus中的显示时间一样，显示效果最好
    setTimeout(function () {
        // 默认展开第一个方案
        var $allScheme = $schemeList.find(".scheme_item")
        if ($allScheme.length > 0) {
            var schemeIndex = searchLine.schemeIndex || 0;
            if (schemeIndex + 1 > $allScheme.length) {
                schemeIndex = 0;
            }
            $allScheme.eq(schemeIndex).find(".item_fold").click();
            //		$allScheme.first().find(".item_fold").click();
        }
    }, 300);
}
/**
 * 生成驾车、步行搜索方案列表
 * @param data
 */
function createDrivingLineScheme(data) {
    var isWalk = searchLine.mode == "walk";
    if (isWalk) {
        $(".route_panel .route_driver").addClass("route_walk");
    } else {
        $(".route_panel .route_driver").removeClass("route_walk");
    }
    var $schemeList = $(".route_panel .route_driver .scheme_list");
    var $schemeHtml = $('<div class="scheme_item"></div>');
    $schemeHtml.append('<div class="scheme_header"></div>');
    $schemeHtml.append('<div class="step_list"></div>');
    var $schemeHeaderHtml = $schemeHtml.find(".scheme_header");
    $schemeHeaderHtml.append('<span class="title_prefix">'
        + '<span class="number"></span>'
        + '</span>');
    $schemeHeaderHtml.append('<div class="item_content">'
        + '<p class="item_title"></p>'
        + '<p class="item_detail">'
        + '<span class="shoucang"><img src="../imap_jw/images/img_1.gif" /></span> | '
        + '<span class="detail_info"></span>'
        + '</p>'
        + '</div>');
    $schemeHeaderHtml.append('<span class="item_fold"><img src="../imap_jw/images/img_1.gif" /></span>');

    // 默认步骤样式
    var $defaultStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
        + '</span>'
        + '<div class="step_content">'
        + '<span class="poi_name"></span>'
        + '</div>'
        + '</div>');
    var $busStepHtml = $('<div class="step">'
        + '<span class="step_prefix">'
        + '<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">'
            // + '<img class="icon icon_middle person" src="../imap_jw/images/img_1.gif">' // 全景图标
        + '</span>'
        + '<div class="step_content">'
        + '<span class="turn_info"></span>'
        + '进入'
        + '<span class="poi_name"></span>'
        + '，'
        + '<span class="desc_info"></span>'
        + '</div>'
        + '</div>');

    $schemeList.empty();

    // 解析input，判断线路是否收藏
    //var lineData = parseLineData2collect("${num}");
    //var lineDataKey = getCollectNaviLineKey(lineData);

    for (var i = 0; i < data.result.routes.length; i++) {
        var isCollectLine = false;
        //if(lineDataKey){
        //var findKey = lineDataKey.replace("${num}", i);
        //var rstData = collectNaviLines[findKey];
        //isCollectLine = (rstData != null);
        //}

        var $scheme = $schemeHtml.clone();
        var $header = $scheme.find(".scheme_header");

        //if(isCollectLine){
        //	$header.find(".item_content .shoucang").addClass("active");
        //}

        // $header.find(".number").text(i+1);
        // 方案
        var scheme = data.result.routes[i];
        //searchLine.start=map["marker_blue_keynane"];
        //searchLine.end= map["marker_red_keynane"];
        var start = searchLine.start;
        var end = searchLine.end;
        var tjdIndex = 0;
        var tjdName = [];
        var tjdLocation = [];
        if (!isWalk) {
            for (var j in searchLine.tjd) {
                if (searchLine.tjd[j]) {
                    tjdName.push(searchLine.tjd[j]);
                    tjdLocation.push({x: searchLine.tjdX[j], y: searchLine.tjdY[j]});
                }
            }
        }

        var descInfo = (searchLine.mode == "driver") ? "行驶" : "步行";

//		var detailInfo = (scheme.duration == null || scheme.duration == "") ? ""+metersToKilometers(scheme.distance) :
//			Math.round(scheme.duration / 60) + "分钟" + " | " + metersToKilometers(scheme.distance);
        var detailInfo = "";
        if (/\d+/.test("" + scheme.duration)) {
            var time = parseInt(scheme.duration);
            detailInfo += Math.round(time / 60) + "分钟 | "
        }
        detailInfo += metersToKilometers(scheme.distance);
        $header.find(".item_content .detail_info").text(detailInfo);

        var stepHtmlList = [];

        var lineNames = [];
        // 步骤
        for (var j = 0; j < scheme.steps.length; j++) {
//			debugger
            var step = scheme.steps[j];

            //当前返回的turn方向为该动作执行完之后的转向
            if (j > 0) {
                var laststep = scheme.steps[j - 1];
            }
            if (j == 0) {
                var turn = getTurnDirectionByTurn('0');
            } else {
                var turn = getTurnDirectionByTurn(laststep.turn);
            }

            var lineName = step.instruction;
            lineNames.push(step.instruction);
            // 在同一个公交站换乘，或者是地铁换乘地铁，step.path是""
            if (step.path == "") {
                continue;
            }
            connectNextStep(step, scheme.steps[j + 1]);

            var $stepHtml = null;

            var origin = step.stepOriginLocation;
            var destination = step.stepDestinationLocation;
            // 有可能没有此属性（步行）
            if (!origin || destination) {
                var paths = step.path.split(";");
                origin = paths[0];
                destination = paths[paths.length - 1];
            } else {
                origin = origin.lng + "," + origin.lat;
                destination = destination.lng + "," + destination.lat;
            }

            var distance = metersToKilometers(step.distance);
            $stepHtml = $busStepHtml.clone();
            $stepHtml.addClass(turn.directionClass);
            $stepHtml.data("data-path", step.path)
                .data("data-origin", origin)
                .data("data-destination", destination);
            $stepHtml.find(".poi_name").text(lineName).data("data-location", origin);

            //区分第一段线路方向
            if (j == 0) {
                $stepHtml.find(".turn_info").text('沿');
            } else {
                $stepHtml.find(".turn_info").text(turn.direction + '，');
            }

            $stepHtml.find(".desc_info").text(descInfo + "" + distance);

            $stepHtml.addClass("step_driver highlight");

//			debugger
            stepHtmlList.push($stepHtml);

            // 途经点
            if (step.ispasspoi == "1" && !isWalk) {
                var $stepThrough = $defaultStepHtml.clone();
                $stepThrough.addClass("step_through").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
                $stepThrough.find(".step_content .poi_name").text(tjdName[tjdIndex])
                    .data("data-location", tjdLocation[tjdIndex].x + "," + tjdLocation[tjdIndex].y);
                stepHtmlList.push($stepThrough);
                tjdIndex++;
            }
        }

        var linesInfo = "";
        var nameLength = lineNames.length;
        if (nameLength > 2) {
            linesInfo = lineNames[0] + " > ... > " + lineNames[nameLength - 1];
        } else {
            linesInfo = lineNames[0] + " > " + lineNames[nameLength - 1];
        }

        $header.find(".item_content .item_title").text(linesInfo);

        var $stepStart = $defaultStepHtml.clone();
        $stepStart.addClass("step_start").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepStart.find(".step_content .poi_name").text(searchLine.start)
            .data("data-location", searchLine.bgnX + "," + searchLine.bgnY);

        var $stepEnd = $defaultStepHtml.clone();
        $stepEnd.addClass("step_end").find(".step_prefix").html('<img class="icon icon_middle" src="../imap_jw/images/img_1.gif">');
        $stepEnd.find(".step_content .poi_name").text(searchLine.end)
            .data("data-location", searchLine.endX + "," + searchLine.endY);

        var $stepList = $scheme.find(".step_list");
        $stepList.append($stepStart);
        for (var j in stepHtmlList) {
            $stepList.append(stepHtmlList[j]);
        }
        $stepList.append($stepEnd);
        $schemeList.append($scheme);

    }

    // 默认展开第一个方案
    var $allScheme = $schemeList.find(".scheme_item")
    if ($allScheme.length > 0) {
        var schemeIndex = searchLine.schemeIndex || 0;
        if (schemeIndex + 1 > $allScheme.length) {
            schemeIndex = 0;
        }
        $allScheme.eq(schemeIndex).find(".item_fold").click();
//		$allScheme.first().find(".item_fold").click();
    }
}


