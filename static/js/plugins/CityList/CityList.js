/**
 * @fileoverview 百度地图的城市列表类，对外开放。
 * 帮助用户直接生成城市列表，并自定义点击城市的操作。
 * 使用者可以通过接口直接获取城市数据。
 * 主入口类是<a href="symbols/BMapLib.CityList.html">CityList</a>，
 * 基于Baidu Map API 1.5。
 *
 * @author Baidu Map Api Group 
 * @version 1.5
 */

/** 
 * @namespace BMap的所有library类均放在BMapLib命名空间下
 */
var BMapLib = window.BMapLib = BMapLib || {};

(function() {
    /**
     * 声明baidu包
     */
    var baidu = baidu || {guid : "$BAIDU$"};
    (function() {
        // 一些页面级别唯一的属性，需要挂载在window[baidu.guid]上
        window[baidu.guid] = {};

        /**
         * 将源对象的所有属性拷贝到目标对象中
         * @name baidu.extend
         * @function
         * @grammar baidu.extend(target, source)
         * @param {Object} target 目标对象
         * @param {Object} source 源对象
         * @returns {Object} 目标对象
         */
        baidu.extend = function (target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = source[p];
                }
            }    
            return target;
        };

        /**
         * @ignore
         * @namespace
         * @baidu.lang 对语言层面的封装，包括类型判断、模块扩展、继承基类以及对象自定义事件的支持。
         * @property guid 对象的唯一标识
        */
        baidu.lang = baidu.lang || {};

        /**
         * 返回一个当前页面的唯一标识字符串。
         * @function
         * @grammar baidu.lang.guid()
         * @returns {String} 当前页面的唯一标识字符串
         */
        baidu.lang.guid = function() {
            return "TANGRAM__" + (window[baidu.guid]._counter ++).toString(36);
        };

        window[baidu.guid]._counter = window[baidu.guid]._counter || 1;

        /**
         * 所有类的实例的容器
         * key为每个实例的guid
         */
        window[baidu.guid]._instances = window[baidu.guid]._instances || {};

        /**
         * Tangram继承机制提供的一个基类，用户可以通过继承baidu.lang.Class来获取它的属性及方法。
         * @function
         * @name baidu.lang.Class
         * @grammar baidu.lang.Class(guid)
         * @param {string} guid	对象的唯一标识
         * @meta standard
         * @remark baidu.lang.Class和它的子类的实例均包含一个全局唯一的标识guid。
         * guid是在构造函数中生成的，因此，继承自baidu.lang.Class的类应该直接或者间接调用它的构造函数。<br>
         * baidu.lang.Class的构造函数中产生guid的方式可以保证guid的唯一性，及每个实例都有一个全局唯一的guid。
         */
        baidu.lang.Class = function(guid) {
            this.guid = guid || baidu.lang.guid();
            window[baidu.guid]._instances[this.guid] = this;
        };

        window[baidu.guid]._instances = window[baidu.guid]._instances || {};

        /**
         * 判断目标参数是否string类型或String对象
         * @name baidu.lang.isString
         * @function
         * @grammar baidu.lang.isString(source)
         * @param {Any} source 目标参数
         * @shortcut isString
         * @meta standard
         *             
         * @returns {boolean} 类型判断结果
         */
        baidu.lang.isString = function (source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };

        /**
         * 判断目标参数是否为function或Function实例
         * @name baidu.lang.isFunction
         * @function
         * @grammar baidu.lang.isFunction(source)
         * @param {Any} source 目标参数
         * @returns {boolean} 类型判断结果
         */
        baidu.lang.isFunction = function (source) {
            return '[object Function]' == Object.prototype.toString.call(source);
        };

        /**
         * 重载了默认的toString方法，使得返回信息更加准确一些。
         * @return {string} 对象的String表示形式
         */
        baidu.lang.Class.prototype.toString = function(){
            return "[object " + (this._className || "Object" ) + "]";
        };

        /**
         * 自定义的事件对象。
         * @function
         * @name baidu.lang.Event
         * @grammar baidu.lang.Event(type[, target])
         * @param {string} type	 事件类型名称。为了方便区分事件和一个普通的方法，事件类型名称必须以"on"(小写)开头。
         * @param {Object} [target]触发事件的对象
         * @meta standard
         * @remark 引入该模块，会自动为Class引入3个事件扩展方法：addEventListener、removeEventListener和dispatchEvent。
         * @see baidu.lang.Class
         */
        baidu.lang.Event = function (type, target) {
            this.type = type;
            this.returnValue = true;
            this.target = target || null;
            this.currentTarget = null;
        };

        /**
         * 注册对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.addEventListener(type, handler[, key])
         * @param 	{string}   type         自定义事件的名称
         * @param 	{Function} handler      自定义事件被触发时应该调用的回调函数
         * @param 	{string}   [key]		为事件监听函数指定的名称，可在移除时使用。如果不提供，方法会默认为它生成一个全局唯一的key。
         * @remark 	事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。 
         */
        baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
            if (!baidu.lang.isFunction(handler)) {
                return;
            }
            !this.__listeners && (this.__listeners = {});
            var t = this.__listeners, id;
            if (typeof key == "string" && key) {
                if (/[^\w\-]/.test(key)) {
                    throw("nonstandard key:" + key);
                } else {
                    handler.hashCode = key; 
                    id = key;
                }
            }
            type.indexOf("on") != 0 && (type = "on" + type);
            typeof t[type] != "object" && (t[type] = {});
            id = id || baidu.lang.guid();
            handler.hashCode = id;
            t[type][id] = handler;
        };
         
        /**
         * 移除对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.removeEventListener(type, handler)
         * @param {string}   type     事件类型
         * @param {Function|string} handler  要移除的事件监听函数或者监听函数的key
         * @remark 	如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
         */
        baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
            if (baidu.lang.isFunction(handler)) {
                handler = handler.hashCode;
            } else if (!baidu.lang.isString(handler)) {
                return;
            }
            !this.__listeners && (this.__listeners = {});
            type.indexOf("on") != 0 && (type = "on" + type);
            var t = this.__listeners;
            if (!t[type]) {
                return;
            }
            t[type][handler] && delete t[type][handler];
        };

        /**
         * 派发自定义事件，使得绑定到自定义事件上面的函数都会被执行。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.dispatchEvent(event, options)
         * @param {baidu.lang.Event|String} event 	Event对象，或事件名称(1.1.1起支持)
         * @param {Object} options 扩展参数,所含属性键值会扩展到Event对象上(1.2起支持)
         * @remark 处理会调用通过addEventListenr绑定的自定义事件回调函数之外，还会调用直接绑定到对象上面的自定义事件。
         * 例如：<br>
         * myobj.onMyEvent = function(){}<br>
         * myobj.addEventListener("onMyEvent", function(){});
         */
        baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
            if (baidu.lang.isString(event)) {
                event = new baidu.lang.Event(event);
            }
            !this.__listeners && (this.__listeners = {});
            options = options || {};
            for (var i in options) {
                event[i] = options[i];
            }
            var i, t = this.__listeners, p = event.type;
            event.target = event.target || this;
            event.currentTarget = this;
            p.indexOf("on") != 0 && (p = "on" + p);
            baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);
            if (typeof t[p] == "object") {
                for (i in t[p]) {
                    t[p][i].apply(this, arguments);
                }
            }
            return event.returnValue;
        };

        /**
         * 为类型构造器建立继承关系
         * @name baidu.lang.inherits
         * @function
         * @grammar baidu.lang.inherits(subClass, superClass[, className])
         * @param {Function} subClass 子类构造器
         * @param {Function} superClass 父类构造器
         * @param {string} className 类名标识
         * @remark 使subClass继承superClass的prototype，
         * 因此subClass的实例能够使用superClass的prototype中定义的所有属性和方法。<br>
         * 这个函数实际上是建立了subClass和superClass的原型链集成，并对subClass进行了constructor修正。<br>
         * <strong>注意：如果要继承构造函数，需要在subClass里面call一下，具体见下面的demo例子</strong>
         * @shortcut inherits
         * @meta standard
         * @see baidu.lang.Class
         */
        baidu.lang.inherits = function (subClass, superClass, className) {
            var key, proto, 
                selfProps = subClass.prototype, 
                clazz = new Function();        
            clazz.prototype = superClass.prototype;
            proto = subClass.prototype = new clazz();
            for (key in selfProps) {
                proto[key] = selfProps[key];
            }
            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;

            if ("string" == typeof className) {
                proto._className = className;
            }
        };

        /**
         * @ignore
         * @namespace baidu.dom 操作dom的方法。
         */
        baidu.dom = baidu.dom || {};

        /**
         * 从文档中获取指定的DOM元素
         * @name baidu.dom.g
         * @function
         * @grammar baidu.dom.g(id)
         * @param {string|HTMLElement} id 元素的id或DOM元素
         * @meta standard
         *             
         * @returns {HTMLElement|null} 获取的元素，查找不到时返回null,如果参数不合法，直接返回参数
         */
        baidu.g = baidu.dom.g = function (id) {
            if ('string' == typeof id || id instanceof String) {
                return document.getElementById(id);
            } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                return id;
            }
            return null;
        };
        
        /**
         * @ignore
         * @namespace baidu.browser 判断浏览器类型和特性的属性。
         */
        baidu.browser = baidu.browser || {};

        if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
            //IE 8下，以documentMode为准
            /**
             * 判断是否为ie浏览器
             * @property ie ie版本号
             * @grammar baidu.browser.ie
             * @meta standard
             * @shortcut ie
             * @see baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome,baidu.browser.maxthon 
             */
            baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
        }

        /**
         * 提供给setAttr与getAttr方法作名称转换使用
         * ie6,7下class要转换成className
         * @meta standard
         */

        baidu.dom._NAME_ATTRS = (function () {
            var result = {
                'cellpadding': 'cellPadding',
                'cellspacing': 'cellSpacing',
                'colspan': 'colSpan',
                'rowspan': 'rowSpan',
                'valign': 'vAlign',
                'usemap': 'useMap',
                'frameborder': 'frameBorder'
            };
            
            if (baidu.browser.ie < 8) {
                result['for'] = 'htmlFor';
                result['class'] = 'className';
            } else {
                result['htmlFor'] = 'for';
                result['className'] = 'class';
            }
            
            return result;
        })();

        /**
         * 获取目标元素的属性值
         * @name baidu.dom.getAttr
         * @function
         * @grammar baidu.dom.getAttr(element, key)
         * @param {HTMLElement|string} element 目标元素或目标元素的id
         * @param {string} key 要获取的attribute键名
         * @shortcut getAttr
         * @meta standard
         * @see baidu.dom.setAttr,baidu.dom.setAttrs
         *             
         * @returns {string|null} 目标元素的attribute值，获取不到时返回null
         */
        baidu.getAttr = baidu.dom.getAttr = function (element, key) {
            element = baidu.dom.g(element);

            if ('style' == key){
                return element.style.cssText;
            }

            key = baidu.dom._NAME_ATTRS[key] || key;
            return element.getAttribute(key);
        };

        /**
         * @ignore
         * @namespace baidu.event 屏蔽浏览器差异性的事件封装。
         * @property target 	事件的触发元素
         * @property pageX 		鼠标事件的鼠标x坐标
         * @property pageY 		鼠标事件的鼠标y坐标
         * @property keyCode 	键盘事件的键值
         */
        baidu.event = baidu.event || {};

        /**
         * 事件监听器的存储表
         * @private
         * @meta standard
         */
        baidu.event._listeners = baidu.event._listeners || [];

        /**
         * 为目标元素添加事件监听器
         * @name baidu.event.on
         * @function
         * @grammar baidu.event.on(element, type, listener)
         * @param {HTMLElement|string|window} element 目标元素或目标元素id
         * @param {string} type 事件类型
         * @param {Function} listener 需要添加的监听器
         * @remark
         *  1. 不支持跨浏览器的鼠标滚轮事件监听器添加<br>
         *  2. 改方法不为监听器灌入事件对象，以防止跨iframe事件挂载的事件对象获取失败            
         * @shortcut on
         * @meta standard
         * @see baidu.event.un
         *             
         * @returns {HTMLElement|window} 目标元素
         */
        baidu.on = baidu.event.on = function (element, type, listener) {
            type = type.replace(/^on/i, '');
            element = baidu.g(element);
            var realListener = function (ev) {
                // 1. 这里不支持EventArgument,  原因是跨frame的事件挂载
                // 2. element是为了修正this
                listener.call(element, ev);
            },
            lis = baidu.event._listeners,
            filter = baidu.event._eventFilter,
            afterFilter,
            realType = type;
            type = type.toLowerCase();
            // filter过滤
            if(filter && filter[type]){
                afterFilter = filter[type](element, type, realListener);
                realType = afterFilter.type;
                realListener = afterFilter.listener;
            }
            // 事件监听器挂载
            if (element.addEventListener) {
                element.addEventListener(realType, realListener, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + realType, realListener);
            }
          
            // 将监听器存储到数组中
            lis[lis.length] = [element, type, listener, realListener, realType];
            return element;
        };
    })();

    /**
     * @fileoverview 数据管理模块.
     */
    var DataMgr = {
      /**
       * 请求函数
       * @param String 地址.
       * @param Function 回调函数.
       */
      request: function(url, cbk) {
        if (cbk) {
            // 生成随机数
            var timeStamp = (Math.random() * 100000).toFixed(0);
            // 全局回调函数
            BMap["_rd"]["_cbk" + timeStamp] = function(json){
              cbk && cbk(json);
              delete BMap["_rd"]["_cbk" + timeStamp];
            };
            url += "&callback=BMap._rd._cbk" + timeStamp;
        }

        var script = document.createElement('script');
        script.setAttribute('src', url);
        document.body.appendChild(script);
        // 脚本加载完成后进行移除
        if (script.addEventListener) {
          script.addEventListener('load', function(e) {
            var t = e.target;
            t.parentNode.removeChild(t);
          }, false);
        }
        else if (script.attachEvent) {
          script.attachEvent('onreadystatechange', function(e) {
            var t = window.event.srcElement;
            if (t && (t.readyState == 'loaded' || t.readyState == 'complete')) {
              t.parentNode.removeChild(t);
            }
          });
        }
        // 使用setTimeout解决ie6无法发送问题
        setTimeout(function() {
          document.getElementsByTagName('head')[0].appendChild(script);
          script = null;
        }, 1);
      }
    };

    var config = {
        serviceUrl : "http://api.map.baidu.com"
    }

    function geoToPoint(geo) {
        var projection = BMAP_NORMAL_MAP.getProjection();
        var point = null;
        geo = geo.split('|')[2];
        geo = geo.substr(0, geo.length - 1);
        geo = geo.split(',');
        var point = projection.pointToLngLat(new BMap.Pixel(geo[0], geo[1]));
        return point;
    }

    function coordinateToPoints(coordinate) {
        var projection = BMAP_NORMAL_MAP.getProjection();
        var points = [];
        coordinate = coordinate.split(';');
        for (var i = 0, len = coordinate.length; i < len; i++) {
            var pos = coordinate[i].split(',');
            var point = projection.pointToLngLat(new BMap.Pixel(pos[0], pos[1]));
            points.push(point);
        }
        return points;
    }

    /** 
     * @exports CityList as BMapLib.CityList 
     */
    var CityList =
        /**
         * CityList类的构造函数
         * @class 城市列表类，
         * 实例化该类后，可以帮助用户直接生成城市列表，
         * 也可以通过接口获取城市数据。
         * 
         * @constructor
         * @param {Json Object} opts 可选的输入参数，非必填项。可输入选项包括：<br />
         * {"<b>container</b>" : {String|HTMLElement} 需要提供界面方式展现的容器。如果此参数为空，则不提供界面方式，也没有cityclick的事件派发
         * <br />"<b>map</b>" : {BMap} 实例化的map对象，如果传入此参数，则用户点击界面中的城市时，可以直接帮助用户定位到地图的相关城市位置}
         *
         * @example <b>参考示例：</b><br />
         * var myCityListObject = new BMapLib.CityList({container : "container"});
         */
        BMapLib.CityList = function(opts){

            opts = opts || {};
            /**
             * _opts是默认参数赋值。
             * 下面通过用户输入的opts，对默认参数赋值
             * @private
             * @type {Json}
             */
            this._opts = baidu.extend(
                baidu.extend(this._opts || {}, {

                    /**
                     * 提供界面方式展现的容器
                     * @private
                     * @type {String|HTMLElement}
                     */
                    container : null,

                    /**
                     * 实例化的BMap对象
                     * @private
                     * @type {BMap}
                     */
                     map : null
                })
            , opts);

            /**
             * 城市数据的存储
             * @private
             * @type {Json}
             */
             this._data = null;

             this._init();

        }
    
    // 通过baidu.lang下的inherits方法，让CityList继承baidu.lang.Class
    baidu.lang.inherits(CityList, baidu.lang.Class, "CityList");

    CityList.prototype._init = function () {
        if (this._opts.container) {
            this._initContainer();
        }
    }

    /**
     * 获取商圈数据
     * @param {String} 商圈名称
     * @param {Function} 回调函数,结果在回调函数中回传
     * [<br/>
     *     {<br/>
     *         city: "北京市",      //商圈所在城市名<br/>
     *         coordinate: {Array}, //商圈所在的坐标范围，Point数组<br/>
     *         district: "海淀区",  //商圈所在的区域<br/>
     *         type: "4-优质商圈"   //商圈的类型<br/>
     *     }<br/>
     * ]<br/>
     *
     */
    CityList.prototype.getBusiness = function (business, cbk) {
        var url = config.serviceUrl + "/shangquan/reverse/?wd=" + business;
        DataMgr.request(url,function(json){
            var result = null;
            if (json && json['error'] && json['error']['errno'] == "0") {
                result = json['content'];
            }

            for (var i = 0, len = result.length; i < len; i++) {
                result[i]['coordinate'] = coordinateToPoints(result[i]['coordinate']);
            }

            if (cbk) {
                cbk(result);
            }
        });
    }

    /**
     * 获取下级的区域列表
     * @param {String} 城市代码(cityCode)，参考百度地图城市名称-城市代码（cityCode）关系对照：http://developer.baidu.com/map/devRes.htm
     * @param {Function} 回调函数,结果在回调函数中回传<br/>
     * 返回的json结果代表的意思<br/>
     * {<br/>
     *     area_code: 131, //城市区域code<br/>
     *     area_name: "北京市", //城市区域名称<br/>
     *     area_type: 2, //城市区域类型<br/>
     *     geo: {Point}, //城市区域中心点<br/>
     *     sup_business_area: 0 ,//是否存在商圈，仅在区的级别（area_type=3）才会有此字段<br/>
     *     sub: {Array} //下级区域列表, 里面内容同上面的那些字段<br/>
     * }<br/>
     */
    CityList.prototype.getSubAreaList = function (areaCode, cbk) {
        var url = config.serviceUrl + "/shangquan/forward/?qt=sub_area_list&ext=1&level=1&areacode=" + areaCode + "&business_flag=0";
        DataMgr.request(url,function(json){
            var result = null;
            if (json && json['result'] && json['result']['error'] == "0") {
                result = json['content'];
            }

            result.geo = geoToPoint(result.geo);

            for (var i = 0, len = result.sub.length; i < len; i++) {
                result.sub[i]['geo'] = geoToPoint(result.sub[i]['geo']);
            }

            if (cbk) {
                cbk(result);
            }
        });
    }

    CityList.prototype._initContainer = function () {
        
        var me = this;

        /*请城市地区*/
        function selectArea(areacode, id, level, isbusiness){
            selectArea.id = id;
            selectArea.level = level;
            var t= new Date().getTime();
            var url = AreaUrl + "&areacode=" + areacode;
            if (isbusiness) {
                url += "&business_flag=1";
            } else {
                url += "&business_flag=0";
            }
            DataMgr.request(url,getAreaData);
        }

        function getAreaData(data){
            var subList = "";//城区列表
            if(data.content){
                var c = data.content;
                var html = [];
                var geo = execGeo(c.geo);
                var mp = new BMap.MercatorProjection();
                var po = mp.pointToLngLat(new BMap.Pixel(geo.x, geo.y))
                if(data.content.area_code == 1){
                    var point = new BMap.Point(116.403119,39.92069);
                    map.centerAndZoom(point, 12);
                }else{
                    var point = new BMap.Point(po.lng, po.lat);
                    map.centerAndZoom(point, selectArea.level);
                }
                /*渲染城市*/
                if(data.content.sub){
                    subList = c.sub;
                    subList.splice(0,0,{area_name:'请选择', area_code:''});
                    var fragment = document.createDocumentFragment();
                    var o;
                    var citycode = {131: 1, 289: 2, 332: 3, 132: 4};
                    for(var i=0; i<subList.length;i++){
                        subList[i].sort = subList[i].area_code ? citycode[subList[i].area_code] || 5 : 0 ;
                    }
                    subList.sort(function(a, b){
                        return a.sort - b.sort;
                    });
                    for(var i=0; i<subList.length;i++){
                        o = document.createElement("option");
                        o.innerHTML = subList[i].area_name;
                        o.area_type = subList[i].area_type;
                        o.geo = subList[i].geo;
                        if (subList[i].business_geo) {
                            o.business_geo = subList[i].business_geo;
                        }
                        o.value = subList[i].area_code;
                        o.title = subList[i].area_name;
                        fragment.appendChild(o);
                    }
                    subList.shift();
                    if(selectArea.id){
                        selectArea.id.innerHTML = '';
                        selectArea.id.appendChild(fragment);
                    }
                }
            }		
        }

        function execGeo(str){
           var reg = /([^\|;]*)(?=;)/;
           var myStr = reg.exec(str);
           var myArr_x = myStr[0].split(",")[0]*1
           var myArr_y = myStr[0].split(",")[1]*1
           var geo = {"x":myArr_x,"y":myArr_y}
           return geo;
        }


        var AreaUrl = config.serviceUrl + "/shangquan/forward/?qt=sub_area_list&ext=1&level=1"

        var cssText = "width:70px;margin:0 5px;";
        var container = baidu.g(this._opts.container),
            provinceDom = document.createElement('select'),
            cityDom = document.createElement('select'),
            boroughDom = document.createElement('select'),
            businessDom = document.createElement('select');
        provinceDom.style.cssText = cssText;
        cityDom.style.cssText = cssText;
        boroughDom.style.cssText = cssText;
        businessDom.style.cssText = cssText;
        container.appendChild(provinceDom);
        container.appendChild(document.createTextNode('省'));
        container.appendChild(cityDom);
        container.appendChild(document.createTextNode('市'));
        container.appendChild(boroughDom);
        container.appendChild(document.createTextNode('区'));
        container.appendChild(businessDom);
        container.appendChild(document.createTextNode('商圈'));

        /*第一步 表单操作*/
        baidu.on(provinceDom, "change", function(){
            var s_value = provinceDom.value;
            cityDom.innerHTML = boroughDom.innerHTML = businessDom.innerHTML = "";
            if( s_value == 131 || s_value == 289 || s_value == 332 || s_value == 132){
                var cityName = ""
                switch(s_value){
                    case "131" : cityName = "北京市";
                    break;
                    case "289" : cityName = "上海市";
                    break;
                    case "332" : cityName = "天津市";
                    break;
                    case "132" : cityName = "重庆市";
                    break;
                }
                var fragment = document.createDocumentFragment();
                    var o;
                    o = document.createElement("option");
                    o.innerHTML = cityName;
                    o.value = s_value;
                    o.title = cityName;
                    fragment.appendChild(o);
                cityDom.appendChild(fragment)
                selectArea(s_value, boroughDom, 12); 
            }else{
                selectArea(s_value, cityDom, 12); 
            }
            dispatchCityClick(this.options[this.selectedIndex]);
        });
        baidu.on(cityDom, "change", function(){
            var s_value = cityDom.value;
            selectArea(s_value, boroughDom, 12); 
            boroughDom.innerHTML = "";
            dispatchCityClick(this.options[this.selectedIndex]);
        });

        baidu.on(boroughDom, "change", function(){
            var s_value = boroughDom.value;
            selectArea(s_value, businessDom, 12, 1) 
            businessDom.innerHTML = "";
            dispatchCityClick(this.options[this.selectedIndex]);
        });

        function dispatchCityClick(option){
            /**
             * 点击城市名时，派发事件的接口
             * @name CityList#oncityclick
             * @event
             * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
             * <br />{"<b>area_name</b> : {String} 点击的区域名称,
             * <br />{"<b>area_code</b> : {String} 点击的区域代码,
             * <br />"<b>geo</b>：{BMap.Point} 点击区域合适显示的中心点位置,
             * <br />"<b>area_type</b>：{Number} 该区域的类型(全国0、省1、城市2)
             *
             * @example <b>参考示例：</b><br />
             * myCityListObject.addEventListener("cityclick", function(e) {  alert(e.area_name);  });
             */
            me.dispatchEvent('cityclick', {
                area_code: option.value,
                area_type: option.area_type,
                geo: geoToPoint(option.geo),
                area_name: option.title
            });
        }

        var polygon = new BMap.Polygon();
        map.addOverlay(polygon);
        polygon.hide();
        baidu.on(businessDom, "change", function(e){
            var s_value = businessDom.value;
            var option = this.options[this.selectedIndex];
            var geo = execGeo(option.geo);
            var mp = new BMap.MercatorProjection();
            var po = mp.pointToLngLat(new BMap.Pixel(geo.x, geo.y));

            var business_geo = option.business_geo;
            business_geo = business_geo.split(';');
            for (var i = 0,len = business_geo.length; i < len; i++) {
                var business_p = business_geo[i].split(',');
                business_geo[i] = mp.pointToLngLat(new BMap.Pixel(business_p[0], business_p[1]))
            }
            polygon.show();
            polygon.setPath(business_geo);
            map.setViewport(business_geo);

            dispatchCityClick(this.options[this.selectedIndex]);

            //var point = new BMap.Point(po.lng, po.lat);
            //map.centerAndZoom(point, 14);
        });

        selectArea(1, provinceDom, 12); 
    }

})();
