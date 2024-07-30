imapgl.workerCount = 6;//获取并设置在带有GL JS映射的页面上实例化的Web Worker的数量。默认情况下，它设置为CPU内核数的一半（上限为6）。
imapgl.maxParallelImageRequests = 5;//获取并设置要并行加载的最大图像数量（栅格图块，子画面，图标）



//imapgl.baseApiUrl = "";


var map = new imapgl.Map({
    container: 'map',
    center: [105.39780155113226, 35.89970880443798],
    zoom: 3,
    minZoom: 3,
    hash: false,
    maxZoom: 20,
    localIdeographFontFamily: "微软雅黑, 'Microsoft Sans Serif', sans-serif,宋体",
    antialias: false,
    style: "../imap_jw/styles/v1/light-v10-gcj02-lc.json"
});


var Navigation = new imapgl.NavigationControl({
    visualizePitch: true
});
map.addControl(Navigation);

map.addControl(new imapgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

var scale = new imapgl.ScaleControl({
    maxWidth: 100,
    unit: 'metric'
});
map.addControl(scale);
//map.addControl(new imapgl.FullscreenControl({container: document.querySelector('body')}));

function TO3D2DControl() {
}

TO3D2DControl.prototype.onAdd = function (map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'imapgl-ctrl imapgl-ctrl-group';

    //二维转三维空间
    var but2dto3d = document.createElement("button");
    but2dto3d.className = "imapgl-ctrl-icon"
    but2dto3d.id = "2dto3d"
    but2dto3d.style.cssText = "font-weight: 900;color:#333333"
    but2dto3d.innerText = "3D";
    this._container.appendChild(but2dto3d);
    //var ss= "<button id=\"2dto3d\" class=\"imapgl-ctrl-icon \" aria-label=\"3D\" type=\button\" style=\"font-weight: 900;\">3D</button>";
    but2dto3d.onclick = function () {
        if (map.getPitch()) {
            // map.setPitch(0);
            map.easeTo({
                pitch: 0,
                easing: function (t) {
                    return t * (2 - t)
                }
            });
            this.innerText = "3D";
        } else {
            //map.setPitch(60)
            map.easeTo({
                pitch: 60,
                easing: function (t) {
                    return t * (2 - t)
                }
            });
            this.innerText = "2D";
        }
    }

    //路况图层
    /*  var traffic_button = document.createElement("button");
     traffic_button.className = "imapgl-ctrl-icon"
     traffic_button.id = "traffic_button"
     traffic_button.style.cssText = "color:#333333"
     traffic_button.innerHTML = "<svg t='1594194350119' fill='#333333'  viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='707' width='20' height='20'><path d='M768.8 582.3c24.2 0 58.5-50.4 66.6-68.6 8.1-16.1 28.2-92.8-10.1-92.8H718.4v-78.6h50.4c24.2 0 58.5-50.4 66.6-68.6 8.1-16.1 28.2-92.8-10.1-92.8H718.4v-28.2h30.3v-40.3h-478v40.3H301V183H198c-38.3 0-18.2 74.6-10.1 92.8 8.1 18.2 42.3 68.6 66.6 68.6h46.4V423H198c-38.3 0-18.2 76.6-10.1 92.8 8.1 16.1 40.3 66.5 64.5 66.5h46.4V661H198c-38.3 0-18.2 76.6-10.1 92.8 8.1 18.2 42.3 68.6 66.6 68.6h46.4v60.5h72.6V911h270.2v-28.2h72.6v-60.5h50.4c24.2 0 58.5-50.4 66.6-68.6 8.1-16.1 28.2-92.8-10.1-92.8H716.4v-78.7h52.4zM510.6 836.4c-50.4 0-92.8-42.3-92.8-92.8 0-52.4 40.3-92.8 92.8-92.8 50.4 0 92.8 42.4 92.8 92.8 0 50.5-42.3 92.8-92.8 92.8z m0-219.8c-50.4 0-92.8-42.3-92.8-92.8 0-52.4 40.3-92.8 92.8-92.8 50.4 0 92.8 42.3 92.8 92.8 0 50.4-42.3 92.8-92.8 92.8z m0-219.8c-50.4 0-92.8-42.4-92.8-92.8 0-52.4 40.3-92.8 92.8-92.8 50.4 0 92.8 42.4 92.8 92.8s-42.3 92.8-92.8 92.8z m0 0' p-id='708'></path></svg>";
     this._container.appendChild(traffic_button);
     function setVisibility(status) {
     var trafficlayers = ["way-traffic-beijing", "road-traffic"];
     if (status) {
     for (var i in trafficlayers) {
     map.setLayoutProperty(trafficlayers[i], "visibility", status)
     }
     }
     }

     traffic_button.onclick = function () {
     if (window["time_traffic_60000ms"]) {
     this.style.cssText = "background-color:#FFFFFF;";

     setVisibility("none")
     window.clearInterval(window.time_traffic_60000ms)
     window["time_traffic_60000ms"] && delete window["time_traffic_60000ms"];
     } else {
     this.style.cssText = "background-color:#4FD27D;";

     setVisibility("visible");
     window.time_traffic_60000ms = window.setInterval(function () {//  window.time_traffic_60000ms=
     setVisibility("none")
     setVisibility("visible");
     console.warn("traffic udpate - " + new Date())
     }, 60000)
     }
     }*/

    var pano = document.createElement("button");
    pano.className = "imapgl-ctrl-icon"
    pano.id = "pano_ishowchina"
    pano.style.cssText = "font-weight: 900;color:#333333"
    pano.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 41 41' fill='#333333'  width='20' height='20'><path d='M40.5 14.1c-.1-.1-1.2-.5-2.899-1-.101 0-.2-.1-.2-.2C34.5 6.5 28 2 20.5 2S6.6 6.5 3.7 12.9c0 .1-.1.1-.2.2-1.7.6-2.8 1-2.9 1l-.6.3v12.1l.6.2c.1 0 1.1.4 2.7.9.1 0 .2.1.2.199C6.3 34.4 12.9 39 20.5 39c7.601 0 14.101-4.6 16.9-11.1 0-.101.1-.101.2-.2 1.699-.6 2.699-1 2.8-1l.6-.3V14.3l-.5-.2zM20.5 4c5.8 0 10.9 3 13.8 7.5.2.3-.1.6-.399.5-3.8-1-8.8-2-13.6-2-4.7 0-9.5 1-13.2 2-.3.1-.5-.2-.4-.5C9.7 7 14.8 4 20.5 4zm0 33c-5.9 0-11.1-3.1-14-7.899-.2-.301.1-.601.4-.5 3.9 1 8.9 2.1 13.6 2.1 5 0 9.9-1 13.601-2 .3-.1.5.2.399.5A16.422 16.422 0 0 1 20.5 37zm18.601-12.1c0 .1-.101.3-.2.3-2.5.9-10.4 3.6-18.4 3.6-7.1 0-15.6-2.699-18.3-3.6C2.1 25.2 2 25 2 24.9V16c0-.1.1-.3.2-.3 2.6-.9 10.6-3.6 18.2-3.6 7.5 0 15.899 2.7 18.5 3.6.1 0 .2.2.2.3v8.9z'/><path d='M18.7 24l6.4-3.7c.3-.2.3-.7 0-.8l-6.4-3.8c-.3-.2-.7 0-.7.4v7.4c0 .5.4.7.7.5z'/><!--Created by Nick Bluth from the Noun Project--></svg> ";
    this._container.appendChild(pano);


    pano.onclick = function () {


        if (!window.ishowpano_szdq) {
            window.ishowpano_szdq = false;
        }
        showPano()

    }


    return this._container;
};

function showPano() {
    var mapc = document.getElementById("map")
    if (window.ishowpano_szdq == true) {
        mapc.style.width = "100%";
        var ishowpano_szdq = document.getElementById("ishowpano_szdq")
        if (ishowpano_szdq) {
            ishowpano_szdq.remove()
        }
        window.ishowpano_szdq = false;
map.setLayoutProperty('blue_way', 'visibility', 'none');
    } else {
        var panoplay = document.createElement("iframe")
        panoplay.setAttribute('frameborder', '0', 0);
        panoplay.src = "pano/example/index.html"
        panoplay.id = "ishowpano_szdq"
        panoplay.style.cssText = "position: absolute;right: 0;top:0"
        panoplay.style.width = "50%"
        panoplay.style.height = "100%"


        var body = document.getElementsByTagName("body")[0]
        if (body) {
            body.appendChild(panoplay);
        }

        mapc.style.width = "50%";

        window.ishowpano_szdq = true;
	map.setLayoutProperty('blue_way', 'visibility', 'visible');
    }

}

TO3D2DControl.prototype.onRemove = function () {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
};

map.addControl(new TO3D2DControl())


/*
 // 拥堵图层
 function TrafficControl() {
 }

 TrafficControl.prototype.onAdd = function (map) {
 this._map = map;
 this._container = document.createElement('div');
 this._container.className = 'imapgl-ctrl imapgl-ctrl-group';
 this._container.id = 'traffic';
 //  this._container.style.cssText = "height:30px"
 this._container.innerHTML = "<button class=\"imapgl-ctrl-icon \" aria-label=\"路况\" type=\button\" id=\"traffic_button\"><svg t='1594194350119'  viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='707' width='20' height='20'><path d='M768.8 582.3c24.2 0 58.5-50.4 66.6-68.6 8.1-16.1 28.2-92.8-10.1-92.8H718.4v-78.6h50.4c24.2 0 58.5-50.4 66.6-68.6 8.1-16.1 28.2-92.8-10.1-92.8H718.4v-28.2h30.3v-40.3h-478v40.3H301V183H198c-38.3 0-18.2 74.6-10.1 92.8 8.1 18.2 42.3 68.6 66.6 68.6h46.4V423H198c-38.3 0-18.2 76.6-10.1 92.8 8.1 16.1 40.3 66.5 64.5 66.5h46.4V661H198c-38.3 0-18.2 76.6-10.1 92.8 8.1 18.2 42.3 68.6 66.6 68.6h46.4v60.5h72.6V911h270.2v-28.2h72.6v-60.5h50.4c24.2 0 58.5-50.4 66.6-68.6 8.1-16.1 28.2-92.8-10.1-92.8H716.4v-78.7h52.4zM510.6 836.4c-50.4 0-92.8-42.3-92.8-92.8 0-52.4 40.3-92.8 92.8-92.8 50.4 0 92.8 42.4 92.8 92.8 0 50.5-42.3 92.8-92.8 92.8z m0-219.8c-50.4 0-92.8-42.3-92.8-92.8 0-52.4 40.3-92.8 92.8-92.8 50.4 0 92.8 42.3 92.8 92.8 0 50.4-42.3 92.8-92.8 92.8z m0-219.8c-50.4 0-92.8-42.4-92.8-92.8 0-52.4 40.3-92.8 92.8-92.8 50.4 0 92.8 42.4 92.8 92.8s-42.3 92.8-92.8 92.8z m0 0' p-id='708'></path></svg></button>";

 function setVisibility(status) {
 var trafficlayers = ["way-traffic-tianjin", "way-traffic-hebei", "way-traffic-beijing"];
 if (status) {
 for (var i in trafficlayers) {
 map.setLayoutProperty(trafficlayers[i], "visibility", status)
 }
 }
 }

 this._container.onclick = function () {
 if (window["time_traffic_60000ms"]) {
 var traffic = document.getElementById("traffic_button");
 traffic.style.cssText = "background-color:#FFF";

 setVisibility("none")
 window.clearInterval(window.time_traffic_60000ms)
 window["time_traffic_60000ms"] && delete window["time_traffic_60000ms"];
 } else {//style='color: #4FD27D;'
 var traffic = document.getElementById("traffic_button");

 traffic.style.cssText = "background-color:#4FD27D";

 setVisibility("visible");
 window.time_traffic_60000ms = window.setInterval(function () {//  window.time_traffic_60000ms=
 setVisibility("none")
 setVisibility("visible");
 console.warn("路况：" + new Date())
 }, 60000)
 }
 }

 return this._container;
 };

 TrafficControl.prototype.onRemove = function () {
 this._container.parentNode.removeChild(this._container);
 this._map = undefined;
 };

 map.addControl(new TrafficControl())*/


function sendSarch(key) {
    var searchListUrl = "{ipport}/v3/sug?ak={ak}&v=3.8.1&query={searchName}&region=%E5%8C%97%E4%BA%AC%E5%B8%82&callback=window.callme"
    var ak = document.createElement("script")
    ak.src = searchListUrl.replace("{searchName}", key).replace("{ipprot}", window.leador_server_ipprot)
    document.querySelector("body").appendChild(ak);
    document.querySelector("body").removeChild(ak);

}
function callme(data) {
    //console.log(data);
    var list = document.getElementById("suggestions");

    if (data.status = '0') {
        var text = [];
        for (var i in data.results) {
            var coord = data.results[i].location;
            var desc = data.results[i].city + "," + data.results[i].district + "," + data.results[i].type;
            text.push("<li><a onclick=\"pointGo('{x}','{y}')\"><strong>{text}</strong><br>{desc}<br>{xy}</a></li>".replace('{text}', data.results[i].name).replace("{desc}", desc).replace("{x}", coord.lng).replace("{y}", coord.lat).replace("{xy}", coord.lng + "," + coord.lat));
        }
        list.innerHTML = text.join("")
        list.style.display = "block"
    }

}
function pointGo(x, y) {
    console.log(x, y)
    map.setCenter({lng: x, lat: y});
    AddMarker(x, y)
}
function SearchControl() {
}

SearchControl.prototype.onAdd = function (map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'imapgl-ctrl-top-left';
    this._container.innerHTML = "<div class=\"imapgl-ctrl-geocoder imapgl-ctrl\"><svg class=\"imapgl-ctrl-geocoder--icon imapgl-ctrl-geocoder--icon-search\" viewBox=\"0 0 18 18\" xml:space=\"preserve\" width=\"18\" height=\"18\"><path d=\"M7.4 2.5c-2.7 0-4.9 2.2-4.9 4.9s2.2 4.9 4.9 4.9c1 0 1.8-.2 2.5-.8l3.7 3.7c.2.2.4.3.8.3.7 0 1.1-.4 1.1-1.1 0-.3-.1-.5-.3-.8L11.4 10c.4-.8.8-1.6.8-2.5.1-2.8-2.1-5-4.8-5zm0 1.6c1.8 0 3.2 1.4 3.2 3.2s-1.4 3.2-3.2 3.2-3.3-1.3-3.3-3.1 1.4-3.3 3.3-3.3z\"></path></svg><input type=\"text\" class=\"imapgl-ctrl-geocoder--input\" id=\"search\" placeholder=\"搜索\"><div class=\"suggestions-wrapper\"><ul class=\"suggestions\" id=\"suggestions\" style=\"display: none;\"></ul></div><div class=\"imapgl-ctrl-geocoder--pin-right\"><button aria-label=\"Clear\" class=\"imapgl-ctrl-geocoder--button\" style=\"display: none;\"><svg class=\"imapgl-ctrl-geocoder--icon imapgl-ctrl-geocoder--icon-close\" viewBox=\"0 0 18 18\" xml:space=\"preserve\" width=\"18\" height=\"18\"><path d=\"M3.8 2.5c-.6 0-1.3.7-1.3 1.3 0 .3.2.7.5.8L7.2 9 3 13.2c-.3.3-.5.7-.5 1 0 .6.7 1.3 1.3 1.3.3 0 .7-.2 1-.5L9 10.8l4.2 4.2c.2.3.7.3 1 .3.6 0 1.3-.7 1.3-1.3 0-.3-.2-.7-.3-1l-4.4-4L15 4.6c.3-.2.5-.5.5-.8 0-.7-.7-1.3-1.3-1.3-.3 0-.7.2-1 .3L9 7.1 4.8 2.8c-.3-.1-.7-.3-1-.3z\"></path></svg></button><svg class=\"imapgl-ctrl-geocoder--icon imapgl-ctrl-geocoder--icon-loading\" viewBox=\"0 0 18 18\" xml:space=\"preserve\" width=\"18\" height=\"18\" style=\"display: none;\"><path fill=\"#333\" d=\"M4.4 4.4l.8.8c2.1-2.1 5.5-2.1 7.6 0l.8-.8c-2.5-2.5-6.7-2.5-9.2 0z\"></path><path opacity=\".1\" d=\"M12.8 12.9c-2.1 2.1-5.5 2.1-7.6 0-2.1-2.1-2.1-5.5 0-7.7l-.8-.8c-2.5 2.5-2.5 6.7 0 9.2s6.6 2.5 9.2 0 2.5-6.6 0-9.2l-.8.8c2.2 2.1 2.2 5.6 0 7.7z\"></path></svg></div></div>";
    this._container.addEventListener('keyup', function () {
        sendSarch(document.getElementById("search").value)
    })
    return this._container;
};

SearchControl.prototype.onRemove = function () {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
};

//map.addControl(new SearchControl(), 'top-left')

var marker;

function AddMarker(lng, lat) {
    if (marker) {
        marker.remove(map)
    }
    marker = new imapgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);

    map.setZoom(17)
    map.setCenter([lng, lat])


}
var popupStart;
function AddPop(coordinates, html) {
    if (popupStart) {
        popupStart.remove(map)
    }

    var markerHeight = 50, markerRadius = 10, linearOffset = 25;
    var popupOffsets = {
        'top': [0, 0],
        'top-left': [0, 0],
        'top-right': [0, 0],
        'bottom': [0, -markerHeight],
        'bottom-left': [linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
        'bottom-right': [-linearOffset, (markerHeight - markerRadius + linearOffset) * -1],
        'left': [markerRadius, (markerHeight - markerRadius) * -1],
        'right': [-markerRadius, (markerHeight - markerRadius) * -1]
    };
    popupStart = new imapgl.Popup({offset: popupOffsets})
        .setLngLat(coordinates)
        .setHTML(html)
        .addTo(map);

}


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
//控制输入提示
var seaCon = {
    // setTimeOut对象
    timeOut: null,
    // 延迟
    delay: 100
};
/**
 * 每段线路上对应的 起点、途经点、终点+圆点（*）
 */
var polyLinesMarkers = [];
map.on("contextmenu", function (e) {
    map["contextmenu_position"] = e.lngLat;

    //清空其他绘制覆盖物
    map["pop_list"] && map["pop_list"].remove();
    map["marker_popup"] && map["marker_popup"].remove();

    //初始化类型
    if (!map["NAV_TYPE"]) {
        map["NAV_TYPE"] = "bus";
        $(".bus").removeClass("active").addClass("active")
    }
})

function callbackMarkInfo(data) {
    if (data.status = '0') {
        var dis = "<strong>{name}</strong><div style='border-top: 1px solid #ccc;padding: 5px 0px;margin-top: 5px'>{dis}</div>"
            .replace("{name}", data.result[0].addressComponent.street + data.result[0].addressComponent.street_number)
            .replace("{dis}", data.result[0].formatted_address);
        map["pop_list"] = new imapgl.Popup({closeOnMove: true, maxWidth: '200px', anchor: 'bottom', offset: [0, -35]})
            .setLngLat(map["contextmenu_position"])
            .setHTML(dis)
            .addTo(map);

        map["marker_popup"] = new imapgl.Marker()
            .setLngLat(map["contextmenu_position"])
            .addTo(map);

        setMapCenter();

        dis = null;
    }
}

function clearMap() {
    map["pop_list"] && map["pop_list"].remove();
    map["marker_sykblue"] && map["marker_sykblue"].remove();
    map["marker_blue"] && map["marker_blue"].remove();
    map["marker_red"] && map["marker_red"].remove();
    clearLines();
    $("#inputfrom").val("");
    $("#inputto").val("");
    $("#inputfrom,#inputto").removeAttr("title").removeAttr("data-location");
    ;
    $(".route_panel").hide();
    $(".cleanlines").hide();
    map["marker_blue_keynane"] = "";
    map["marker_red_keynane"] = "";
    searchLine.start = "";
    searchLine.end = "";
}
function initLinePageStatus() {
    map["pop_list"] && map["pop_list"].remove();
    map["marker_sykblue"] && map["marker_sykblue"].remove();
    map["marker_blue"] && map["marker_blue"].remove();
    map["marker_red"] && map["marker_red"].remove();
    clearLines();
    $("#inputfrom").val("");
    $("#inputto").val("");
    $("#inputfrom,#inputto").removeAttr("title");
    $("#inputfrom,#inputto").removeAttr("data-location");
    $(".route_panel").hide();
    $(".cleanlines").hide();
}
function setMapCenter() {
    //  map && map.panTo(map["contextmenu_position"], {duration: 3000});
    map && map.flyTo({center: map["contextmenu_position"], zoom: map.getZoom()});
}
function getAjaxMarkerInfo(funname) {
    if (!funname)funname = "callbackMarkInfo";
    var ak = document.createElement("script")
    ak.src = "{ipprot}/v3/rgeo?ak=1e706fc68d966cd554c63a8e800e0daf&location={location}&callback={callback}"
        .replace("{location}", map["contextmenu_position"].lng + "," + map["contextmenu_position"].lat)
        .replace("{callback}", funname)
        .replace("{ipprot}", window.leador_server_ipprot)
    document.querySelector("body").appendChild(ak);
    document.querySelector("body").removeChild(ak);
}
function addMarker(type) {
    var marker_sykblue = document.createElement("div")
    marker_sykblue.style.cssText = "width:30px;height:30px";
    marker_sykblue.innerHTML = "<svg t='1594346569381' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='6357' width='32' height='32' xmlns:xlink='http://www.w3.org/1999/xlink'><defs><style type='text/css'></style></defs><path d='M512 0C345.975467 0 152.234667 101.444267 152.234667 359.765333c0 175.3088 276.753067 562.7904 359.765333 664.234667 73.796267-101.444267 359.765333-479.709867 359.765333-664.234667C871.765333 101.512533 678.024533 0 512 0z' p-id='6358' fill='#1AD3EF'></path></svg><div style='position: absolute;position: absolute;left: 9px;top: 3px;font-size: 15px;color: #ffffff;'>经</div>";

    var marker_red = document.createElement("div")
    marker_red.style.cssText = "width:30px;height:30px";
    marker_red.innerHTML = "<svg t='1594346569381' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='6357' width='32' height='32' xmlns:xlink='http://www.w3.org/1999/xlink'><defs><style type='text/css'></style></defs><path d='M512 0C345.975467 0 152.234667 101.444267 152.234667 359.765333c0 175.3088 276.753067 562.7904 359.765333 664.234667 73.796267-101.444267 359.765333-479.709867 359.765333-664.234667C871.765333 101.512533 678.024533 0 512 0z' p-id='6358' fill='#E8371B'></path></svg><div style='position: absolute;position: absolute;left: 9.3px;top: 3px;font-size: 14px;color: #ffffff;'>终</div>"

    var marker_blue = document.createElement("div")
    marker_blue.style.cssText = "width:30px;height:30px";
    marker_blue.innerHTML = "<svg t='1594346569381' class='icon' viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='6357' width='32' height='32' xmlns:xlink='http://www.w3.org/1999/xlink'><defs><style type='text/css'></style></defs><path d='M512 0C345.975467 0 152.234667 101.444267 152.234667 359.765333c0 175.3088 276.753067 562.7904 359.765333 664.234667 73.796267-101.444267 359.765333-479.709867 359.765333-664.234667C871.765333 101.512533 678.024533 0 512 0z' p-id='6358' fill='#398CF3'></path></svg><div style='position: absolute;position: absolute;left: 9.3px;top: 3px;font-size: 14px;color: #ffffff;'>起</div>"

    if (type == "marker_red") {
        map[type] && map[type].remove();
        map[type] = new imapgl.Marker(marker_red).setLngLat(map["contextmenu_position"]).addTo(map);
    }
    if (type == "marker_blue") {
        map[type] && map[type].remove();
        map[type] = new imapgl.Marker(marker_blue).setLngLat(map["contextmenu_position"]).addTo(map);
    }
    if (type == "marker_sykblue") {
        map[type] && map[type].remove();
        map[type] = new imapgl.Marker(marker_sykblue).setLngLat(map["contextmenu_position"]).addTo(map);
    }
}
function setVia() {
    //   carNav()
    // addMarker("marker_sykblue")
}

function setFrom() {
    carNav()
    getAjaxMarkerInfo("callback_SetFrom");
}
function setTo() {
    carNav()
    getAjaxMarkerInfo("callback_SetTo");
}
function callback_SetFrom(data) {
    if (data.status == '0') {
        map["marker_blue_keynane"] = data.result[0].formatted_address;
        searchLine.start = data.result[0].formatted_address;
        $("#inputfrom").attr("title", map["marker_blue_keynane"])
        var location = data.result[0].location;
        $("#inputfrom").attr("data-location", "" + location.lng + "," + location.lat + "")
        $("#inputfrom").val(data.result[0].formatted_address)
        addMarker("marker_blue")
        if (map["marker_blue_keynane"] && map["marker_red_keynane"]) {
            navBy(map["NAV_TYPE"])
        }
    }
}

function callback_SetTo(data) {
    if (data.status == '0') {
        map["marker_red_keynane"] = data.result[0].formatted_address;
        searchLine.end = data.result[0].formatted_address;
        $("#inputto").attr("title", map["marker_blue_keynane"])
        var location = data.result[0].location;
        $("#inputto").attr("data-location", "" + location.lng + "," + location.lat + "");
        $("#inputto").val(data.result[0].formatted_address)
        addMarker("marker_red")
        if (map["marker_blue_keynane"] && map["marker_red_keynane"]) {
            navBy(map["NAV_TYPE"])
        }
    }
}


function cilckMapShowPano(lnglat) {
    if (window.ishowpano_szdq) {
        var ishowpano_szdq = document.getElementById("ishowpano_szdq")
        if (ishowpano_szdq) {
            ishowpano_szdq.contentWindow.mapGoPano(lnglat);
        }
    }
}

map.on("click",function(e){
    if(e.lngLat){
        cilckMapShowPano(e.lngLat)
    }

})

/*function setValue() {
 if (map["marker_blue_keynane"])document.getElementById("inputfrom").value = map["marker_blue_keynane"];
 if (map["marker_red_keynane"])document.getElementById("inputto").value = map["marker_red_keynane"];
 }*/

//showPano
$("#map").NZ_Menu({
    items: [{
        name: "设为起点", event: setFrom, icon: "fa fa-map-marker lwj-from"
    }, {
        name: "设为终点", event: setTo, icon: "fa fa-map-marker lwj-to"
    }, {
        name: "这是哪儿", event: getAjaxMarkerInfo, icon: "fa fa-question"
    }, {
        name: "设置中心", event: setMapCenter, icon: "fa fa-crosshairs"
    },
        {
            name: "全景预览(关闭/打开)", event: showPano, icon: "fa fa-crosshairs"
        },
        {
            name: "清除绘制", event: clearMap, icon: "fa fa-eraser"
        }],
    showbefre: function () {

    }
});



