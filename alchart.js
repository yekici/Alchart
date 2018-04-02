/*
* Yasin Ekici 2016
* */

(function (scope) {
    'use strict'

    var t;

    t = scope.t = scope.Alchart = function () {};

    t.console = true;
    t.empty = function () {};

    t.log = t.console ? console.log.bind(window) : t.empty;
    t.trace = t.console ? console.trace.bind(window) : t.empty;
    t.assert = t.console ? console.assert.bind(window) : t.empty;
    t.warn = t.console ? console.warn.bind(window) : t.empty;
    t.group = t.console ? function (name  , fn) {
        console.group(name);
        fn.call(this);
        console.groupEnd(name);
    } : t.empty;
    t.time = t.console ? function (name  , fn) {
        console.time(name);
        fn.call(this);
        console.timeEnd(name);
    } : t.empty;


    //Sınama sistemi
    var _testList = {};

    t.testStatus = 1; // 2olunca test lerin adlarınıda yazar
    t.testMode = 0;

    t.test = function (name , fn , pr) {
        _testList[name] = fn;
        if (t.testStatus || pr) {
            t.execute(name);
        }
    };

    t.execute = function (name) {
        if (t.testStatus == 2) t.log('begin::' + name);
        _testList[name].call(t , name);
        if (t.testStatus == 2) t.log('end::' + name);
    };


//})(window);



// name:core.Util

var Util;

(function () {

    t.Util = Util = function () {};


    /**
     *
     * @param {object} assign
     * @param {...object} object
     * @memberof Util
     */
    Util.assign = function (assign) {
        var objs = Array.prototype.slice.call(arguments , 1),
            length = objs.length,
            i = 0,
            obj , key;


        for ( ; i < length ; i++) {
            obj = objs[i];
            for (key in obj) {
                assign[key] = obj[key];
            }
        }

        return assign;
    };


    Util.assign(Util , /**@lends Util*/{

        EPSILON: 1e-14,

        /**
         * Sayfa açılışından sonra geçen zamanı döndürür
         */
        now: (function () {

            if (performance.now) {
                return function () {
                    return performance.now();
                }
            }

            var time = Date.now();

            return function () {
                return Date.now() - time;
            }

        })(),

        /**
         *
         */
        gid: (function () {
            var id = 1;
            return  function () {
                return id++;
            }
        })(),

        degreeToRadian: (function () {
            var constant = Math.PI / 180;
            return function (degree) {
                return degree * constant;
            }
        })(),

        radianToDegree: (function () {
            var constant = 180 / Math.PI;
            return function (radian) {
                return radian * constant;
            }
        })(),

        isFunction: function (item) {
            return typeof item === 'function';
        },

        isArray: function (item) {
            return Array.isArray(item) || item instanceof Array;
        },

        isBool: function (item) {
            return typeof item === 'boolean';
        },

        isNumber: function (item) {
            return typeof item === 'number'
        },

        isObject: function (obj) {
            return obj && Object.prototype.toString.call(obj) == '[object Object]';
        },

        isString: function (item) {
            return typeof item === 'string'
        },

        /**
         * Yeni sınıf oluşturur
         * @param {string} name Object adı
         * @param {function} init Kurucu method
         * @param {array} include Dahil edilecekler
         * @param {object} obj Sınıfın methodları
         * @returns {function}
         */
        class: function (name , init , include , obj) {

            if (!t.isString(name)) {
                obj = include;
                include = init;
                init = name;
                name = null;
            }

            var prop = init.prototype,
                item , key , keys , i , j , _temp;

            _temp = prop._tObjectName;

            if (!t.isArray(include)) {
                obj = include;
            } else {
                for (i = 0 ; i < include.length ; i++) {
                    item = t.isFunction(include[i]) ? include[i].prototype : include[i];

                    /**
                     * kalıtım yapılmış ise aşağıdan yukarı doğru eklenince
                     * aynı isimli değerler super class daki değerleri alıyor
                     * halbuki son kalıtımdaki değerleri alması lazım
                     * bunu aşmak için yukardan aşağı yaptım
                     * {test: 1} super class
                     * {test: 2} alt class
                     *
                     * aşağıdan yukarı testin değeri 1
                     * yukardan aşağı testin değeri 2
                     */

                    var list = [],
                        length;

                    while (item !== Object.prototype) {
                        list.push(item);
                        item = item.__proto__;
                    }

                    length = list.length;

                    while (length--) {
                        item = list[length];
                        keys = Object.getOwnPropertyNames(item);

                        for (j = 0 ; j < keys.length ;j++) {
                            key = keys[j];
                            Object.defineProperty(prop , key , Object.getOwnPropertyDescriptor(item , key));
                        }
                    }

                }
            }


            prop._tObjectName = _temp;

            if (name) {

                if (prop._tObjectName) {
                    name = prop._tObjectName + '.' + name;
                } else {
                    name = 't.' + name;
                }

                prop._tObjectName = name;
                prop.toString = function () { return this._tObjectName};

            }

            obj && Util.assign(prop , obj);
            init.extend = Util.extend;
            prop.constructor = init;

            return init;
        },


        /**
         * Yeni kalıtılmış sınıf oluşturur
         * @param {string} name Object adı
         * @param {function} init Kurucu method
         * @param {array} include Dahil edilecekler
         * @param {object} obj Sınıfın methodları
         * @returns {function}
         */
        extend: function (name , init , include , obj) {
            var _temp = t.isString(name) ? init : name;

            _temp.prototype = Object.create(this.prototype);

            return Util.class(name , init , include , obj);
        },

        /**
         * Ara değer
         * @param {number} val
         * @param {number} min
         * @param {number} max
         * @returns {number}
         */
        clamp: function (val , min , max) {
            if (val < min) return min;
            if (val > max) return max;
            return val;
        }

    });

    Util.assign(t , Util);




})();
// name:node.Node

var Node;

(function () {

    t.Node = Node = t.class('Node' , function () {

        this.id = t.gid();


        this._nextNode = null;

        this._text = '';
    } , [] , {

        executeAndGetNextNode: function (scope) {
            return this._nextNode;
        },

        getNextNode: function () {
            return this._nextNode;
        },

        setNextNode: function (node) {
            this._nextNode = node;
        },

        toDebug: function () {
            return this + '#' + this.id + (this._text ? ', ' + this._text  : '');
        },

        getText: function () {
            return this._text;
        }

    });


})();
// name:node.Operation
// require:node.Node

(function () {

    Node.Operation = t.Node.extend('Operation' , function (text) {
        Node.call(this);

        this._text = text || '';
    } , {

        setText: function (text) {
            this._text = text;
        },

        executeAndGetNextNode: function (scope) {
            if (this._text) {
                var result = Interpreter(this._text , scope , false);
                if (result === false) {
                    return result;
                }
            }

            return this.getNextNode();
        }

    });

})();
// name:core.Chart
// require:core.Util
// require:node.Operation

var Chart;

(function () {



    t.Chart = Chart = t.class('Chart' , function (container , width , height) {
        var self = this,
            scene;

        scene = this.scene = new goz.t.Scene(container , width , height);

        this.gnodes = this.scene.add.group();
        this.glinks = this.scene.add.group();

        this.scope = new Scope('mainScope');
        this.controller = new Controller(this.scope);


        this.scene.enableZoomController(0.4 , 3 , 0.05);
        this.scene.enableDrag(false , '[right][capture]');
        this.gnodes.enableDrag(true , '[needle][left][capture]');


        this.links = {};

        this.gnodes.on('drag' , function (el) {
            if (el.textObj) {
                el.textObj.offset.set(CFG.textLRP + el.offset.x , CFG.textTP + el.offset.y);

                if (self.links[el.id]) {
                    var links = self.links[el.id],
                        i = 0;

                    for ( ; i < links.length ; i++) {
                        if (links[i].glink) {
                            //t.log(el.glink , el.iNode , i);
                            self.glinkPos(el , links[i] , links[i].glink);
                        }

                    }
                }


                if (el.nextNode && el.glink) {
                    self.glinkPos(el , el.nextNode , el.glink);
                }

                if (el.prevNode && el.prevNode.glink) {
                    self.glinkPos(el , el.prevNode , el.prevNode.glink);
                }


                if (el.nextTrueNode && el.gTrueLink) {
                    self.glinkPos(el , el.nextTrueNode , el.gTrueLink);
                }
                if (el.prevTrueNode && el.prevTrueNode.gTrueLink) {
                    self.glinkPos(el , el.prevTrueNode , el.prevTrueNode.gTrueLink);
                }

                if (el.nextFalseNode && el.gFalseLink) {
                    self.glinkPos(el , el.nextFalseNode , el.gFalseLink);
                }
                if (el.prevFalseNode && el.prevFalseNode.gFalseLink) {
                    self.glinkPos(el , el.prevFalseNode , el.prevFalseNode.gFalseLink);
                }

            }

        });

        this.gnodes.input('enter' , {
            onEnter: function (e) {
                if (e.target)
                    e.target.fill.restore('hover');
            },
            onLeave: function (e) {
                if (e.target)
                    e.target.fill.restore('default');
            }
        });

        scene.main.input('key[key=SPACE]' , {
            onDown: function () {
                scene.zoom = 1;
            }
        });


        setInterval(function () {
            var time = t.now();
            scene.drawing.render();
            time = t.now() - time;
            //t.log(time);
        } , 14);

    } , [] , {

        addNode: function (nodeType , x , y) {
            var shapeOpt = {
                    fill: new goz.t.Color(250 , 250 , 250),
                    stroke: new goz.t.Color(0 , 0 , 0 , 0.9),
                    borderWidth: 1
                },
                textOpt = {
                    fill: new goz.t.Color(0 , 0 , 0 , 0.7),
                    offset: [CFG.textLRP , CFG.textTP],
                    font: '15px Arial, Helvetica, sans-serif'
                };

            if (nodeType == 'Start' || nodeType == 'End') {
                shapeOpt.points = [0,0 , CFG.sqr,0 , CFG.sqr,CFG.height , 0,CFG.height];
            } else if (nodeType == 'Condition') {
                shapeOpt.points = [
                    CFG.corner,0 ,
                    CFG.width - CFG.corner , 0 ,
                    CFG.width , CFG.corner ,
                    CFG.width, CFG.height - CFG.corner ,
                    CFG.width - CFG.corner, CFG.height ,
                    CFG.corner , CFG.height,
                    0 , CFG.height - CFG.corner ,
                    0 , CFG.corner
                ];
            } else if (nodeType == 'Operation') {
                shapeOpt.points = [0,0 , CFG.width,0 , CFG.width,CFG.height , 0,CFG.height];
            }


            var node = this.gnodes.add.polygon(shapeOpt),
                text = this.gnodes.add.text(textOpt);

            node.textObj = text;
            node.nodeType = nodeType;
            node.iNode = new Node[nodeType];
            text.nodeObj = node;
            node.iNode.gnode = node;

            this.scope.addNode(node.iNode);

            node.fill.save('default');
            node.fill.set(240 , 240 , 240);
            node.fill.save('hover');
            node.fill.restore('default');


            text.on('change:text' , function () {
                var textWidth = this.measureText(),
                    width = 2 * CFG.textLRP + textWidth,
                    type = this.nodeObj.nodeType;

                width < CFG.minWidth && (width = CFG.minWidth);

                if (type == 'Condition') {
                    this.nodeObj.setPoint(width - CFG.corner, 0 , 1);
                    this.nodeObj.setPoint(width, CFG.corner , 2);
                    this.nodeObj.setPoint(width, CFG.height - CFG.corner , 3);
                    this.nodeObj.setPoint(width - CFG.corner, CFG.height , 4);
                } else if (type == 'Operation') {
                    this.nodeObj.setPoint(width, 0 , 1);
                    this.nodeObj.setPoint(width, CFG.height , 2);
                }

            });

            text.setText(node.iNode.getText() || '');

            node.offset.set(x || 10 , y || 10);
            this.gnodes.emit('drag' , node);

            return node;
        },

        link: function (a , b) {
            var aNode = a.iNode,
                bNode = b.iNode,
                glink = a.glink,
                glinkOpt, gDotOpt,
                isCondition = aNode instanceof Node.Condition;

            if (!isCondition && aNode.getNextNode()) {
                t.log('Zaten Bağlı');
                return;
            } else if (isCondition && aNode.getNextTrueNode() && aNode.getNextFalseNode()) {
                t.log('Zaten Bağlı - C');
                return;
            }

            glinkOpt = {
                stroke: new goz.t.Color(0 , 0 , 0 , 0.8),
                borderWidth: 1,
                points: [0,0 , 100,100]
            };

            gDotOpt = {
                stroke: new goz.t.Color(0 , 0 , 0 , 1),
                borderWidth: 5,
                points: [100,100 , 100,100]
            };

            if (!isCondition) {
                aNode.setNextNode(bNode);
                a.nextNode = b;
                b.prevNode = a;

                if (!this.links[b.id]) this.links[b.id] = [];


                if (!glink) {
                    glink = this.glinks.add.polygon(glinkOpt);
                    glink.dot = this.glinks.add.polygon(gDotOpt);
                    glink.gnode = a;
                    a.glink = glink;
                    this.links[b.id].push(a);
                }

                this.glinkPos(a , b , glink);
            } else {
                if (!aNode.getNextTrueNode()) {
                    aNode.setNextTrueNode(bNode);
                    a.nextTrueNode = b;
                    b.prevTrueNode = a;

                    if (!this.links[b.id]) this.links[b.id] = [];

                    if (!a.gTrueLink) {
                        glinkOpt.stroke = new goz.t.Color(0 , 125 , 0 , 0.8);
                        a.gTrueLink = this.glinks.add.polygon(glinkOpt);
                        a.gTrueLink.dot = this.glinks.add.polygon(gDotOpt);
                        a.gTrueLink.gnode = a;
                    }

                    this.glinkPos(a , b , a.gTrueLink);
                } else {

                    aNode.setNextFalseNode(bNode);
                    a.nextFalseNode = b;
                    b.prevFalseNode = a;

                    if (!a.gFalseLink) {
                        glinkOpt.stroke = new goz.t.Color(255 , 0 , 0 , 0.8);
                        a.gFalseLink = this.glinks.add.polygon(glinkOpt);
                        a.gFalseLink.dot = this.glinks.add.polygon(gDotOpt);
                        a.gFalseLink.gnode = a;
                    }

                    this.glinkPos(a , b , a.gFalseLink);
                }
            }


        },

        glinkPos: function (a , b , glink) {
            a.getTransformedPoints();
            b.getTransformedPoints();


            var abounds = new goz.t.Bounds(),
                bbounds = new goz.t.Bounds();

            abounds.handleArray(a.getPoints());
            bbounds.handleArray(b.getPoints());

            var points = [[0 , 0.5] , [0.5 , 0] , [1 , 0.5] , [0.5 , 1]],
                aPoints = points.map(function (val) {
                    var p = abounds.point(val[0], val[1]);
                    return new goz.t.V(p.x + a.offset.x , p.y + a.offset.y);
                }),
                bPoints = points.map(function (val) {
                    var p = bbounds.point(val[0], val[1]);
                    return new goz.t.V(p.x + b.offset.x , p.y + b.offset.y);
                }),
                minPoints = [0,0],
                _min = null,
                _val = 0,
                index = 0,
                i = 0,
                j = 0;


            for ( ; i < points.length ; i++) {
                for (j = 0 ; j < points.length ; j++) {
                    _val = aPoints[i].distance(bPoints[j].x , bPoints[j].y);
                    if (_min == null || _val < _min) {
                        _min = _val;
                        minPoints[0] = aPoints[i];
                        minPoints[1] = bPoints[j];
                    }
                }
            }


            glink.setPoint(minPoints[0].x , minPoints[0].y , 0);
            glink.setPoint(minPoints[1].x , minPoints[1].y , 1);


            if (glink.dot) {
                if (a.nextNode == b || a.nextTrueNode == b || a.nextFalseNode == b)
                    index = 1;
                glink.dot.setPoint(minPoints[index].x , minPoints[index].y , 0);
                glink.dot.setPoint(minPoints[index].x , minPoints[index].y , 1);
            }

        }

    });


    var CFG = {
        width: 200,
        minWidth: 40,
        height: 40,
        textTP: 14,
        textLRP: 15,
        corner: 10,
        sqr: 60,
        linkHeight: 10
    };

})();
// name:core.EventEmitter
// require:core.Util


var EventEmitter;

(function () {

    t.EventEmitter = EventEmitter = t.class(function () {

        this._eventListeners = {};

    } , /**@lends Event.prototype*/{
        /**
         * yeni dinleyici ekler
         * @memberof Event
         * @param {string} name Olay adı
         * @param {function} callback Dinleyici
         * @param {object} context Bağlam
         */
        on: function (name , callback , context) {
            if (!this._eventListeners[name])
                this._eventListeners[name] = [];

            if (context)
                callback._evtContext = context;

            this._eventListeners[name].push(callback);
        },


        /**
         * Dinleyici kaldırır
         * @param {string=} name Olay adı
         * @param {function=} callback Dinleyici
         * @example
         * obj.off(); // Bütün olaylar silindi
         * obj.off('myEvent'); // myEvent ait dinleyiciler silindi
         * obj.off('myEvent' , callback); // her iki şartada uyan geribildirimler silindi
         */
        off: function (name , callback) {
            if (name && !callback) {

                delete this._eventListeners[name];

            } else if (name && callback) {

                var list = this._eventListeners[name],
                    i = 0,
                    length;

                if (list) {
                    length = list.length;
                    for ( ; i < length ; i++) {
                        if (list[i] === callback) {
                            list.splice(i , 1);
                            break;
                        }
                    }
                }

            } else {
                this._eventListeners = {};
            }

            return this;
        },

        /**
         * İlgili olayı yayar(tetikler)
         * @memberof Event
         * @param {string} name Olay adı
         * @param {...any=} args Dinleyicilere gönderilecek argümanlar
         */
        emit: function (name) {
            var args = Array.prototype.slice.call(arguments , 1),
                listeners = this._eventListeners,
                list = listeners[name],
                length , i = 0;

            if (list) {
                length = list.length;
                for ( ; i < length ; i++) {
                    list[i].apply(list[i]._evtContext || this , args);
                }
            }
        }

    });

})();
// name:core.Controller
// require:core.Util
// require:core.EventEmitter

var Controller;

(function () {

    t.Controller = Controller = t.class('Controller' , function (scope) {
        EventEmitter.call(this);

        this._scope = scope;

        this._nodes = scope._nodes;

        this._interval = 300; // milisaniye

        this._intervalId = null;

        this._state = 3; // 1 play , 2 pause , 3 stop

        this._currentNode = null;
    } , [EventEmitter] , {
        getStartNode: function () {
            var nodes = this._nodes,
                i = 0;

            for ( ; i < nodes.length ; i++) {
                if (nodes[i] instanceof Node.Start) {
                    return nodes[i];
                }
            }

            return false;
        },


        play: function () {
            if (this._state == 3) {
                this._currentNode = this.getStartNode();
                this._scope.resetVariables();
            }
            this._intervalId = setInterval(this._execute.bind(this) , this._interval);
            this.emit('play');
        },

        pause: function () {
            clearInterval(this._intervalId);
            this._state = 2;
            this.emit('pause');
        },

        stop: function () {
            clearInterval(this._intervalId);
            this._currentNode = null;
            this._state = 3;
            this.emit('stop');
        },

        _execute: function () {
            if (!this._currentNode) {
                this.stop();
                return false;
            }

            var node = this._currentNode,
                result = node.executeAndGetNextNode(this._scope);

            this.emit('execute' , node);

            t.log(node.toDebug());
            if (result === false) {
                t.log(node.toDebug()  , ' Çalışırken Hata Meydana Geldi:' , t.Error() && t.Error().message);
                this.stop();
                return;
            }

            if (result === null) {
                t.log('Düğümler sona ulaştı');
                this.stop();
                return;
            }

            
            this._currentNode = result;
        }

    });

})();
// name:core.Error


(function () {

    t.Error = t.class('Error' , function (message , data) {
        if (!message) {
            return t.Error._lastError;
        }

        if (!(this instanceof t.Error)) {
            return message instanceof t.Error;
        };

        this.message = '(' + message + ')' + t.Error.MESSAGES[message];
        this.data = data;

        t.Error._lastError = this;

    } , [] , {

    });


    t.Error.MESSAGES = {
        1001: 'Belirtilen değişken bulunamadı.',
        1002: 'Belirtilen karakter ile tanımlama yapılamaz',
        1003: 'Belirtilen index değerine göre değişken bulunamadı veya dizi değil',



        //interpreter
        3001: 'String kapatılmalı',
        3002: 'Sayı tanımlaması yanlış',
        3003: 'Geçersiz tanımlama(isIdentifier)',
        3004: 'Geçersiz tanımlama(isData)',
        3005: 'Geçersiz tanımlama(isAssignment)',
        3006: 'Geçersiz tanımlama(isOperation)',
        3007: 'Geçersiz tanımlama(isCondition || isConjunction)',
        3008: 'Geçersiz tanımlama(isPhs - 80)',
        3009: 'Geçersiz tanımlama(isPhs - 81)',
        3010: 'Eksik parantez',
        3011: 'Fazla parantez',
        3012: 'Geçersiz tanımlama(isBracket - 82)',
        3013: 'Geçersiz tanımlama(isBracket - 83)',
        3014: 'Eksik bracket',
        3015: 'Fazla bracket',
        3016: 'Geçersiz tanımlama(73)',
        3017: 'Geçersiz tanımlama(72)',
        3018: 'Geçersiz karakter &',
        3019: 'Geçersiz karakter |',
        3020: 'Geçersiz tanımlama (global)',
        3021: 'Geçersiz tanımlama (!)',


        //interpreter
        4001: 'Bilinmeyen Hata (isIdentifier)',
        4002: 'Bilinmeyen Hata (isData)',
        4003: 'Veri tanımlamasının değeri bulunamadı',
        4004: 'Belirtilen değer alınamadı',
        4005: 'Tanımsız operator',
        4006: 'Atama bilgisi alınamadı',
        4007: 'Geçersiz atama',
        4008: 'Şu anlık diğer flowchart lara geçiş yapılamıyor',
        4009: '[] Bu işlem sadece dizilere yapılabilir',
        4010: 'En fazla 10 parametre',
        4011: 'Dizilerde ikili atama yapılamaz',


    };

})();
// name:core.Scope

var Scope;

(function () {

    t.Scope = Scope = t.class('Scope' , function (name , nodes , variables) {


        this.name = name;
        this.id = t.gid();

        this._nodes = nodes || [];

        this._variables = variables || new Variables();
    } , [] , {

        addNode: function (node) {
            this._nodes.push(node);
            return this;
        },

        getNodes: function () {
            return this._nodes;
        },

        getVariables: function () {
            return this._variables;
        },

        resetVariables: function () {
            this._variables.reset();
        },

        getVarI: function (name) {
            var value = this._variables.getVar(name[0]);

            if (value == null) {
                return void 0;
            }

            value = value.getValue();

            if (name.length == 1) {
                return value;
            }


            for (var i = 1; i < name.length ; i++) {

                if (i == name.length - 1) {
                    return value[name[i]];
                }

                if (!t.isArray(value)) return void 0;

                if (name[i] in value) {
                    value = value[name[i]];
                } else {
                    return void 0;
                }
            }

        },

        setVarI: function (name , data) {

            if (name.length == 1) {
                return this._variables.setVar(name[0] , data);
            }

            var variable = this.getVarI([name[0]]),
                i = 1,
                _temp;


            if (variable != null) {
                _temp = variable;
                for ( ; i < name.length ; i++) {
                    if (!t.isArray(_temp)) throw new t.Error(1003);
                    if (name[i] in _temp) {
                        if (i == name.length -1) {
                            _temp[name[i]] = data;
                        } else {
                            _temp = _temp[name[i]];
                        }
                    } else {
                        throw new t.Error(1001);
                    }
                }
            } else {
                throw new t.Error(1001);
            }

        }

    });

})();
// name:core.Variable

var Variable;

(function () {

    t.Variable = Variable = t.class('Variable' , function (name , value , global) {

        this._name = name;
        this._value = null;
        this._global = !!global;

        this._history = [];

        if (value != null) {
            this.setValue(value);
        }


    } , [] , {

        setValue: function (value) {
            this._value = value;
            this._history.push(value);
            return true;
        },

        getValue: function () {
            return this._value;
        },

        clearValue: function () {
            this._value = null;
            this._history.push(null);
        },
        
        getHistory: function () {
            return this._history;
        },

        clearHistory: function () {
            this._history = [];
        },

        getName: function () {
            return this._name;
        },

        isGlobal: function () {
            return this._global;
        }

    });



})();
// name:core.Variables

var Variables;

(function () {

    t.Variables = Variables = t.class('Variables' , function (scope) {

        this._list = [];

    } , [] , {

        reset: function () {
            this._list = [];
        },

        hasVar: function (name) {
            return this.getVar(name);
        },

        getVar: function (name) {
            var list = this._list,
                i = list.length;
            
            while (i--) {
                if (name == list[i].getName()) {
                    return list[i];
                }
            }

            return void 0;
        },


        setVar: function (name , value) {

            var vr;
            if (vr = this.getVar(name)) {
                vr.setValue(value);
            } else {
                this._list.push(vr = new Variable(name , value));
            }
            return vr;
        },

        clear: function () {
            this._list = [];
        }

    });

})();
// name:interpreter.Data

var Data;


(function () {
    t.Data = Data = t.class('Data' , function (data) {
        this._data = data;
        this._determineType();
    } , {
        getData: function () {
            return this._data;
        },
        setData: function (data) {
            this._data = data;
            this._determineType();
        },
        _determineType: function () {
            var d = this._data;
            if (t.isString(d)) {
                this._type = Data.STRING;
            } else if (t.isNumber(d)) {
                this._type = Data.NUMBER;
            } else if (d === false || d === true) {
                this._type = Data.BOOLEAN;
            } else if (t.isArray(d)) {
                this._type = Data.ARRAY;
            }
        },
        getType: function () {
            return this._type;
        },
        isString: function () {
            return this._type == Data.STRING;
        },
        isNumber: function () {
            return this._type == Data.NUMBER;
        },
        isBoolean: function () {
            return this._type == Data.BOOLEAN;
        },
        isArray: function () {
            return this._type == Data.ARRAY;
        }
    });

    Data.STRING = 1;
    Data.NUMBER = 2;
    Data.BOOLEAN = 4;
    Data.ARRAY = 5;


})();

// name:interpreter.Token


var Token,Tokens;

(function () {

    t.Tokens = Tokens = {
        // veriler
        'string': 1,
        'number': 2,
        'identifier': 3,
        'boolean': 4,

        // operatörler
        '+': 10,
        '-': 11,
        '/': 12,
        '*': 13,
        '**': 14,
        '%': 15,

        // atamalar
        '=': 30,
        '*=': 31,
        '+=': 32,
        '-=': 33,
        '/=': 34,
        '%=': 35,

        // koşullar
        '==': 50,
        '<=': 51,
        '>=': 52,
        '>': 53,
        '<': 54,
        '!=': 55,
        '!': 56,

        // bağlaçlar
        '&&': 60,
        '||': 61,

        // işaretler
        ',': 72,
        ';': 73,

        // kapsamlar
        '(': 80,
        ')': 81,
        '[': 82,
        ']': 83,


        'global': 100
    };

    var token = t.assign({} , Tokens);
    for (var key in token) {
        Tokens[token[key]] = key;
    }
    token = null;

    t.Token = Token = t.class('Token' , function (type , data , pos , tmp) {
        this.type = type;
        this.name = Tokens[type];
        this.data = data;
        this.pos = pos;
        this.tmp = tmp;
    } , {
        isType: function (type) {
            return this.type == type;
        },
        isTypes: function () {
            for (var i = 0 ; i < arguments.length ; i++) {
                if (this.type == arguments[i]) {
                    return true;
                }
            }
            return false;
        },
        isIdentifier: function () {
            return this.type == 3;
        },
        isData: function () {
            return this.type <= 2 || this.type == 4;
        },
        isOperation: function () {
            return this.type >= 10 && this.type <= 20;
        },
        isAssignment: function (t) {
            return this.type >= 30 && this.type <= 40;
        },
        isCondition: function () {
            return this.type >= 50 && this.type <= 60;
        },
        isConjunction: function () {
            return this.type >= 60 && this.type <= 70;
        },
        isScope: function () {
            return this.type >= 80 && this.type <= 90;
        },
        isBracket: function () {
            return this.type == 82 || this.type == 83;
        },
        isPhs: function () {
            return this.type == 80 || this.type == 81;
        }

    });


})();
// name:interpreter.Syntax

var Syntax;

(function () {

    Syntax = {};

    Syntax.Check = function (tokenMap) {
        if (!tokenMap) return;

        var token = null,
            nt = null,
            ns = null,
            pt = null,
            i = 0,
            length = tokenMap.length,
            phs = 0,
            brk = 0;


        for ( ; i < length ; i++) {
            token = tokenMap[i];
            nt = i < length - 1 ? tokenMap[i + 1] : null;
            ns = i < length - 2 ? tokenMap[i + 2] : null;
            pt = i > 0 ? tokenMap[i - 1] : null;

            if (token.isIdentifier()) {
                if (!nt || !pt) continue;

                if (nt.isData() || nt.isIdentifier() || (nt.isAssignment() && !pt.isTypes(80,73,100))) {
                    return new t.Error(3003 , token) && false;
                }

            } else if (token.isType(100)) { //global keyword
                //if (!pt) continue;
                if (!(nt.isIdentifier() || (pt && pt.isType(73))) ||
                    (nt.isIdentifier() && ns && !(ns.isType(30) || ns.isType(73)))
                ) {
                    return new t.Error(3020 , token) && false;
                }
            } else if (token.isData()) {
                if (!nt) continue;
                //if (ns && nt.isType(1) && ns.isType(82)) continue; 'deneme'[0]

                if (nt.isData() || nt.isIdentifier() ||
                    nt.isTypes(82 , 80) || nt.isAssignment()
                ) {
                    return new t.Error(3004 , token) && false;
                }

            } else if (token.isAssignment()) {
                if (!nt || !(nt.isData() || nt.isIdentifier() ||
                    nt.isScope() || (nt.isType(11) && ns && ns.isType(2)))
                ) {
                    return new t.Error(3005 , token) && false;
                }
            } else if (token.isOperation()) {
                if (!nt || !(nt.isData() || nt.isIdentifier() ||
                    nt.isType(80) || nt.isType(56) || (nt.isType(11) && ns && ns.isType(2)))
                ) {
                    return new t.Error(3006 , token) && false;
                }
            } else if (token.isCondition() || token.isConjunction()) {
                if (token.isType(56)) {
                    if (!nt || !(nt.isData() || nt.isIdentifier() || nt.isType(80))) {
                        return new t.Error(3021, token) && false;
                    }
                }
                if (!nt || !(nt.isData() || nt.isIdentifier() ||
                    nt.isScope() || (nt.isType(11) && ns && ns.isType(2)))
                ) {
                    return new t.Error(3007 , token) && false;
                }
            } else if (token.isPhs()) {
                if (token.isType(80)) {
                    phs++;
                    if (!nt || nt.isTypes(83) || (pt && nt.isType(81) && !pt.isIdentifier()) ||
                        !(nt.isData() || nt.isIdentifier() ||
                        nt.isScope() || nt.isType(56) ||
                        (nt.isType(11) && ns && ns.isType(2)))
                    ) {
                        return new t.Error(3008 , token) && false;
                    }
                } else {
                    if (--phs < 0) {
                        return new t.Error(3010 , token) && false;
                    }
                    if (!nt) continue;
                    if (!(nt.isTypes(81 , 83) || nt.isOperation() ||
                        nt.isCondition() || nt.isConjunction() ||
                        nt.isTypes(72 , 73))) {
                        return new t.Error(3009 , token) && false;
                    }
                }

            } else if (token.isBracket()) {
                if (token.isType(82)) {
                    brk++;
                    if (!nt || nt.isTypes(81 , 83) || !(nt.isData() || nt.isIdentifier()
                        || nt.isScope() || (nt.isType(11) && ns && ns.isType(2)))
                    ) {
                        return new t.Error(3012 , token) && false;
                    }
                } else {
                    if (--brk < 0) return new t.Error(3014 , token) && false;
                    if (!nt) continue;
                    if (nt.isData() || nt.isIdentifier() || nt.isTypes(80,82)) {
                        return new t.Error(3013 , token) && false;
                    }
                }
            } else if (token.isType(73)) {
                if (!nt || nt.isType(56) || (nt.isType(11) && ns && ns.isType(2))) continue;
                if (nt.isAssignment() || nt.isOperation() ||
                    nt.isConjunction() || nt.isCondition() ||
                    nt.isTypes(81 , 83 , 70 , 72)
                ) {
                    return new t.Error(3016 , token) && false;
                }
            } else if (token.isType(72)) {
                if (!nt || !(nt.isData() || nt.isIdentifier() ||
                    nt.isTypes(80 , 82) || (nt.isType(11) && ns && ns.isType(2)))
                ) {
                    return new t.Error(3017 , token) && false;
                }
            };

        }

        if (phs != 0) return new t.Error(3011 , token) && false;
        if (brk != 0) return new t.Error(3015 , token) && false;


        return true;
    };

})();
// name:interpreter.Interpreter
// require:interpreter.Token
// require:interpreter.Syntax
// require:interpreter.Data

var Interpreter;


(function () {

    t.Interpreter = Interpreter = function (text , scope , debug) {

        var ilog = debug === false ? function () {} : t.log;


        ilog('text:' , text);
        var tokenMap = Scanner(text);

        if (tokenMap === false) {
            return false;
        }

        ilog('tokenMap' , tokenMap);

        var syntaxCheck = Syntax.Check(tokenMap);

        if (syntaxCheck === false) {
            return false;
        }



        var tokenMapLength = tokenMap.length,
            warnings = [],
            depth = 0,
            _temp = null,
            eData = function (data , pos , setter) {
                return {
                    data: new Data(data),
                    pos: pos,
                    set: setter
                };
            },
            execute = function (b , l , mode) {
                ilog('execute' , b , l , mode);
                var begin = b || 0,
                    limit = l || tokenMapLength,
                    pos = begin,
                    result = null,
                    value = null,
                    _list = [],
                    md = ++depth,
                    phs = 0,
                    brk = 0,
                    i = 0,
                    token , nt , ns , nn , np, no;

                while (pos < limit) {
                    token = tokenMap[pos];
                    nt = pos + 1 < limit ? tokenMap[pos + 1] : null;
                    ns = pos + 2 < limit ? tokenMap[pos + 2] : null;
                    nn = pos + 3 < limit ? tokenMap[pos + 3] : null;
                    np = pos - 1 > -1 ? tokenMap[pos - 1] : null;


                    if (nt && nt.isType(81 , 83 , 73 , 72)) {
                        nt = null;
                        ns = null;
                        nn = null;
                    } else if (ns && ns.isType(81 , 83 , 73 , 72)) {
                        ns = null;
                        nn = null;
                    } else if (nn && nn.isType(81 , 83 , 73 , 72)) {
                        nn = null;
                    }

                    if (token.isType(80)) {
                        if (++phs == 1 && np && !np.isIdentifier()) {
                            _list.push(token);
                        }
                    } else if (token.isType(81)) {
                        phs--;
                    } else if (token.isType(82)) {
                        if (++brk == 1 && np && !(np.isIdentifier() || np.isType(1))) {
                            _list.push(token);
                        }
                    } else if (token.isType(83)) {
                        brk--;
                    }


                    if (phs > 0 || brk > 0) {
                        pos++;
                        continue;
                    }

                    if (phs < 0 || brk < 0 || token.isTypes(73 , 72)) { // ) ] ; ,  etki alanı sona ermiş
                        pos++;
                        break;
                    }

                    if (token.isData() || token.isIdentifier()) {
                        _list.push(token);
                        if (nt && nt.isTypes(80 , 82)) {
                            token.nt = nt;
                            pos++;
                            continue;
                        }
                    } else if (
                        token.isOperation() || token.isCondition() ||
                        token.isConjunction() || token.isType(80) || token.isAssignment()
                    ) {
                        _list.push(token);
                    }

                    /*
                    if (nt && nt.isType(80)) {
                        _list.push(nt);
                    }
                    */


                    pos++;
                }




                var diff , _v1 , _v2 , j , _edata;

                result = value = null;

                ilog('_list' , _list);

                for (i = 0 ; i < _list.length ; i++) {
                    token = _list[i];
                    nt = i + 1 < _list.length ? _list[i + 1] : null;
                    np = i - 1 >= 0 ? _list[i - 1] : null;
                    no = nt && isOperand(nt)? nt : i + 2 < _list.length && isOperand(_list[i + 2]) ? _list[i + 2] : false;



                    if (isOperand(token)) {
                        diff = (no ? getOperationPriority(no) : -1) - getOperationPriority(token);

                        //ilog('diff' , diff , no , token , nt , _list[i + 2]);

                        _edata = value;

                        _v1 = result || value || mode;

                        if (_v1 && _v1.data) {
                            _v1 = _v1.data.getData();
                        }

                        //kestirme
                        if (token.isType(60)) {
                            if (!_v1) {
                                ilog('&& kestirme');
                                return eData(_v1 , _list[_list.length - 1].tmp + 1);
                            }
                        } else if (token.isType(61)) {
                            if (_v1) {
                                ilog('&& kestirme');
                                return eData(_v1 , _list[_list.length - 1].tmp + 1);
                            }
                        }


                        if (diff > 0) {
                            ilog('*1');
                            _v2 = nt.isType(80) ? getValue(nt) : execute(nt.tmp , null , 1);

                            ilog('_v2' , nt , _v2);


                            //i = _v2.pos - 1;


                            for (j = 0; j < _list.length ; j++) {
                                if (_list[j].tmp >= _v2.pos) {
                                    break;
                                }
                            }

                            i = j;

                            ilog('*1i' , md , i);
                            //ilog('j' , j);

                            var k = 5;
                            while (_list[i] && k--) {
                                ilog('----', k , _list[i] , _list[i + 1]);
                                no = _list[i] && isOperand(_list[i]) && getOperationPriority(_list[i]);

                                if (no) {
                                    diff = no - getOperationPriority(token);

                                    if (diff >= 0) {
                                        ilog('*2');
                                        _v2 = _list[i].isType(80) ? getValue(_list[i]) : execute(_list[i].tmp , null , _v2);
                                    }
                                    //i = _v2.pos - 1;

                                    ilog('v2pos' , _v2.pos);


                                    for (j = 0; j < _list.length ; j++) {
                                        if (_list[j].tmp >= _v2.pos) {
                                            break;
                                        }
                                    }

                                    i = j;
                                    //ilog('j' , j);

                                    //i = j - 1;
                                    ilog('*2i' ,md , i);


                                } else {
                                    break;
                                }
                            }


                            i--;

                        } else {
                            _v2 = getValue(nt);
                        }

                        _v2 = _v2.data.getData();

                        if (token.isType(10)) {
                            result = _v1 + _v2;
                        } else if (token.isType(11)) {
                            result = _v1 - _v2;
                        } else if (token.isType(12)) {
                            result = _v1 / _v2;
                        } else if (token.isType(13)) {
                            result = _v1 * _v2;
                        } else if (token.isType(53)) {
                            result = _v1 > _v2;
                        } else if (token.isType(54)) {
                            result = _v1 < _v2;
                        } else if (token.isType(50)) {
                            result = _v1 == _v2;
                        } else if (token.isType(55)) {
                            result = _v1 != _v2;
                        } else if (token.isType(51)) {
                            result = _v1 <= _v2;
                        } else if (token.isType(52)) {
                            result = _v1 >= _v2;
                        } else if (token.isType(56)) {
                            result = !_v2;
                        } else if (token.isType(60)) {
                            result = _v1 && _v2;
                        } else if (token.isType(61)) {
                            result = _v1 || _v2;
                        } else if (token.isAssignment()) {

                            if (!_edata || !_edata.set) {
                                throw new t.Error(4006)
                            }

                            if (token.isType(30)) {
                                scope.setVarI(_edata.set, _v2);
                                result = _v2;
                            } else if (token.isType(31)) {
                                if (t.isArray(_v1)) {
                                    throw new t.Error(4011);
                                }
                                result = _v1 * _v2;
                                scope.setVarI(_edata.set, result);
                            } else if (token.isType(32)) {
                                if (t.isArray(_v1)) {
                                    throw new t.Error(4011);
                                }
                                result = _v1 + _v2;
                                scope.setVarI(_edata.set, result);
                            } else if (token.isType(33)) {
                                if (t.isArray(_v1)) {
                                    throw new t.Error(4011);
                                }
                                result = _v1 - _v2;
                                scope.setVarI(_edata.set, result);
                            } else if (token.isType(34)) {
                                if (t.isArray(_v1)) {
                                    throw new t.Error(4011);
                                }
                                result = _v1 / _v2;
                                scope.setVarI(_edata.set, result);
                            } else if (token.isType(35)) {
                                if (t.isArray(_v1)) {
                                    throw new t.Error(4011);
                                }
                                result = _v1 % _v2;
                                scope.setVarI(_edata.set, result);
                            } else {
                                throw new t.Error(4007)
                            }

                            ilog('atama');

                            ilog(token , _edata.set);

                        } else {
                            throw new t.Error(4005);
                        }

                        ilog('rr' , md , token , _v1 , _v2 , result);

                        if (mode) {
                            return eData(result != null ? result : value , token.tmp + 2);
                        }

                    } else if (!value && isValue(token)) {
                        ilog('-val' , token);
                        value = getValue(token);//.data.getData();
                        ilog('val' , token , value);
                    } else if (!value && token.isType(82)) {
                        ilog('*val' , token);
                        value = getValue(token);
                        ilog('*-val' , token , value);
                    }

                }

                ilog('sonuc' , result != null ? result : t.isObject(value) ? value.data.getData() : value , pos);

                if (t.isObject(value)) {
                    value = value.data.getData();
                }
                return eData(result != null ? result : t.isObject(value) ? value.data.getData() : value , pos);
            },
            isOperand = function (token) {
                return token.isOperation() || token.isCondition() || token.isConjunction() || token.isAssignment();
            },
            isValue = function (token) {
                return token.isData() || token.isIdentifier() || token.isType(80);
            },
            getValue = function (token , nt) {
                if (token.isData()) {
                    if (token.isType(2)) {
                        return eData(+token.data , token.tmp + 1);
                    } else if (token.isType(1)) {
                        return eData(token.data , token.tmp + 1);
                    } else if (token.isType(4)) {
                        return eData(token.data == 'true' , token.tmp + 1);
                    }
                } else if (token.isIdentifier()) {
                    var data , tmp , args , arg;

                    !nt && (nt = token.nt);
                    if (nt) {
                        if (nt.isType(80)) { // ( fonksiyon
                            ilog('fonksiyon');
                            data = readSerialData(nt);
                            tmp = data.tmp;
                            args = data.data.getData();
                            arg = args[0];
                            ilog('fonksiyo çağrıldı' , data.data.getData() , token.data);

                            switch (token.data) {
                                case 'ISNULL':

                                    if (arg == null) {
                                        return eData(true , tmp);
                                    }
                                    return eData(false , tmp);
                                case 'LENGTH':
                                    if (arg.length != null) {
                                        return eData(arg.length , tmp);
                                    }
                                    return eData(0 , tmp);
                                default:
                                    throw new t.Error(4008);
                            }

                        } else if (nt.isType(82)) { // [ iç erişim
                            data = readSerialData(nt);
                            tmp = data.tmp;
                            args = data.data.getData();

                            /*
                            if (!args.length) {
                                //push
                                _temp = scope.getVarI([token.data]);
                                if (_temp == null) {
                                    _temp = [];
                                    scope.setVarI([token.data] , _temp);
                                } else if (!t.isArray(_temp)) {
                                    throw new t.Error(4009);
                                }

                                _temp.push(null);
                                args = [_temp.length - 1]
                            }
                            */

                            _temp = ['abc'].concat(args);

                            ilog('_temp' , _temp);

                            return eData(scope.getVarI(_temp) , tmp , _temp);
                        } else {
                            return eData(1004);
                        }
                    } else {
                        return eData(scope.getVarI([token.data]) , token.tmp + 1 , [token.data]);
                    }

                } else if (token.isType(80)) {
                    ilog('*3' , token);
                    return execute(token.tmp + 1);
                } else if (token.isType(82)) {
                    return readSerialData(token);
                }

                ilog(token , "dfdfg");

                throw new t.Error(4004);
            },
            readSerialData = function (token , data) {
                var phs = 0,
                    brk = 0,
                    tmp = token.tmp,
                    pos = token.tmp + 1,
                    limit = tokenMap.length,
                    _temp;

                data = data || [];

                //if (token.isTypes(80 , 82)) tmp++;

                while (++tmp < tokenMap.length) {
                    token = tokenMap[tmp];

                    if (token.isType(80)) phs++;
                    else if (token.isType(81)) phs--;
                    else if (token.isType(82)) brk++;
                    else if (token.isType(83)) brk--;

                    if (brk < 0 || phs < 0) {
                        limit = tmp;
                        break;
                    }

                }

                var k = 15;

                tmp = pos;
                while (tmp < limit && k--) {
                    _temp = execute(tmp);

                    data.push(_temp.data.getData());
                    tmp = _temp.pos;
                }

                if (k <= 0) {
                    throw new t.Error(4010);
                }
                

                return eData(data , tmp);
            },
            getOperationPriority = function (token) {
                //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
                if (token.isAssignment()) return 9;
                if (token.isType(61)) return 10;
                if (token.isType(60)) return 11;
                if (token.isTypes(50 , 55)) return 12;
                if (token.isTypes(51 , 52 , 53 , 54)) return 13;
                if (token.isTypes(10 , 11)) return 14;
                if (token.isTypes(12 , 13 , 15)) return 15;
                if (token.isType(14)) return 16;
                if (token.isType(56)) return 17;


                return 0;
            };


        try {
            _temp = execute();
        } catch (e) {
            ilog('hata' , e);
            return false;
        }

        return _temp;

    };

})();
// name:interpreter.Scanner
// require:interpreter.Token
// require:core.Error


var Scanner;

(function () {

    t.Scanner = Scanner = function (text) {
        var spos = 0,
            pos = 0,
            end = text.length,
            tokenId = null,
            tokenData = null,
            tokenMap = [],//[new Token(73)],
            tokenBegin = 0,
            isDigit = function (code) {
                var ch = code || text.charCodeAt(pos);
                return ch >= 48 && ch <= 57;
            },
            scanNumber = function () {
                var begin = pos,
                    dot = false;

                if (text.charCodeAt(pos) == 45) pos++; // -

                while (pos < end) {
                    if (text.charCodeAt(pos) == 46) {
                        if (dot) return new t.Error(3002) && false;
                        dot = true;
                    } else if (!isDigit()) break;

                    pos++;
                }
                return text.substring(begin , pos);
            },
            isWhiteSpace = function (code) {
                var ch = code || text.charCodeAt(pos);
                return ch == 32;
            },
            isLetter = function (code) {
                var ch = code || text.charCodeAt(pos);
                return (ch >= 65 && ch <= 90) || (ch >= 97 && ch <= 122);
            },
            isIdentifierBegin = function (code) {
                var ch = code || text.charCodeAt(pos);
                return isLetter(ch) || ch == 95 || ch == 36;
            },
            isIdentifier = function (code) {
                var ch = code || text.charCodeAt(pos);
                return isLetter(ch) || ch == 95 || ch == 36 || isDigit(ch);
            },
            scanIdentifier = function () {
                var begin = pos;
                while (pos < end && isIdentifier()) {
                    pos++;
                }
                return text.substring(begin , pos);
            },
            scanString = function () {
                var closed = false,
                    begin = pos;
                while (pos < end) {
                    if (text.charCodeAt(pos) == 39) {
                        closed = true;
                        break;
                    }
                    pos++;
                }
                if (!closed) return new t.Error(3001) && false;
                return text.substring(begin , pos++);
            },
            scan = function () {
                tokenId = null;
                tokenData = null;
                while (pos < end) {
                    var ch = text.charCodeAt(pos),
                        nch = pos < end - 1 ? text.charCodeAt(pos + 1) : null;
                    //t.log(text[pos] , ch);

                    tokenBegin = pos;
                    switch (ch) {


                        case 33: // !
                            pos++;
                            if (nch == 61) return pos++ , 55; // !=
                            return 56;

                        case 37: // %
                            pos++;
                            if (nch == 61) return pos++ , 35; // %=
                            return 15;

                        case 38: // &
                            pos++;
                            if (nch == 38) return pos++ , 60;
                            return new t.Error(3018 , pos);

                        case 39: // ':
                            pos++;
                            tokenData = scanString();
                            return 1;

                        case 40: // (
                            pos++;
                            return 80;

                        case 41: // (
                            pos++;
                            return 81;

                        case 42: // *
                            pos++;
                            if (nch == 61) return pos++ , 31; // *=
                            if (nch == 42) return pos++ , 14; // **
                            return 13;

                        case 43: // +
                            pos++;
                            if (nch == 61) return pos++ , 32; // +=
                            return 10;


                        case 44: // ,
                            pos++;
                            return 72;

                        case 45: // -
                            if (nch == 61) return pos+=2 , 33; // -=

                            if (isDigit(nch)) {
                                var t = tokenMap[tokenMap.length - 1];
                                if (!t || !(t.isTypes(81,83) || t.isOperation() || t.isIdentifier() || t.isData())) {
                                    tokenData = scanNumber();
                                    return 2;
                                }
                            }

                            pos++;
                            return 11;
                        /*
                        case 46: // .
                            pos++;
                            return 70;
                            */

                        case 47: // /
                            pos++;
                            if (nch == 61) return pos++ , 34; // /=
                            return 12;

                        case 59: // ;
                            pos++;
                            return 73;

                        case 60: // <
                            pos++;
                            if (nch == 61) return pos++ , 51; // <=
                            return 54;

                        case 61: // =
                            pos++;
                            if (nch == 61) return pos++ , 50; // ==
                            return 30;

                        case 62: // >
                            pos++;
                            if (nch == 61) return pos++ , 52; // >=
                            return 53;

                        case 91: // [
                            pos++;
                            return 82;

                        case 93: // ]
                            pos++;
                            return 83;

                        case 124: // |
                            pos++;
                            if (nch == 124) return pos++ , 61;
                            return new t.Error(3019 , pos);

                        default:

                            if (isWhiteSpace()) {

                            } else if (isDigit()) {
                                tokenData = scanNumber();
                                return 2;
                            } else if (isIdentifierBegin()) {
                                tokenData = scanIdentifier();

                                var _;
                                if ((_ = Tokens[tokenData]) && _ >= 100) {
                                    tokenData = null;
                                    return _;
                                }

                                if (tokenData == 'true' || tokenData == 'false') {
                                    return 4;
                                }

                                return 3;
                            } else {
                                return new t.Error(1002 , pos) && false
                            }

                            pos++;
                            break;

                    }
                }

                return true;
            };


        var limitter = 50;

        while (pos < end) {
            tokenId = scan();

            if (tokenId === true) {
                break;
            }

            if (tokenId === false || tokenData === false) {
                return false;
            }

            tokenMap.push(new Token(tokenId , tokenData , tokenBegin , tokenMap.length));

            if (!limitter--) break;
        }

        if (limitter <= 0)
        t.log('limitter' , limitter);

        return tokenMap;
    };

})();
// name:node.Condition
// require:node.Node

(function () {

    Node.Condition = t.Node.extend('Condition' , function (text) {
        Node.call(this);

        this._nextTrueNode = null;
        this._nextFalseNode = null;

        this._text = text;
    } , {
        setText: function (text) {
            this._text = text;
        },

        executeAndGetNextNode: function (scope) {
            if (this._text) {
                var result = Interpreter(this._text , scope , false);
                if (result === false) {
                    return result;
                }

                if (result.data.getData()) {
                    return this.getNextTrueNode();
                }

                return this.getNextFalseNode();
            }

            return null;
        },

        setNextTrueNode: function (node) {
            this._nextTrueNode = node;
        },

        setNextFalseNode: function (node) {
            this._nextFalseNode = node;
        },

        getNextTrueNode: function () {
            return this._nextTrueNode;
        },

        getNextFalseNode: function () {
            return this._nextFalseNode;
        }


    });

})();
// name:node.End
// require:node.Node

(function () {

    Node.End = t.Node.extend('End' , function () {
        Node.call(this);

        this._text = 'End';
    } , {
        executeAndGetNextNode: function (scope) {
            return null;
        }
    });

})();
// name:node.Start
// require:node.Node

(function () {

    Node.Start = t.Node.extend('Start' , function () {
        Node.call(this);

        this._text = 'Start';
    } , {

    });

})();
// name:test.core
// require:core.Variable
// require:core.Variables
// require:interpreter.Syntax


(function () {


    t.test('core.Variable' , function () {

        /*
        Dilin temel özellikleri
        myvar = 15; //sayı ataması
        myvar = 'string'; //string ataması
        myvar = [15 , 'string']; // dizi ataması
        myMethod([15 , 'string'] , 25 , 15 + 20); //method çağırımı
        myMethod([15 , 'string'] , 25 , 15 + 20 , _m1 || _m2);
        (15 + 20) + ('elma' + 'armut');
        myvar <= myMethod(myArray[i]) && result
        myvar = '';

        elma || 15; //elma değişkeni tanımlı ise elmayı değilse 15 i döndür, uyarı modu açıkcasa bir uyarı döndürür
        elma || armut || portakal || 'geçersiz meyve';

        STRLEN(elma || armut || portakal || 'geçersiz meyve') >= 10;

        sonuc == true;//true false döner

        sonuc; // if için kullanırsa tanımlı değilse veya false ise veya 0 ise veya 0 uzunlukta string ise  false döner

        çok boyutlu dizi

        myvar = [['bir' , 'iki' , ['üç']] , 3]

        myvar[0][2][0]; // 'üç' döndürür

        ; yeni satır

        myvar += 15; myvar = 20;
        myvar = 15 && (myvar = 20) // myvar değişkenine 20 atandı
        myvar = false && (myvar = 20) // myvar değişkenine false atandı
        2 ** 3 // 8

        atamalar
        = , += , -= , *= , /= , %=
        operatöler
        + , - , * , ** , / , %



        global myvar = 15;


        global myvar; // yazılırsa o değişkene erişim izni alınır


        */



        //var tokenMap = Scanner("(-15 + 20 + (myvar+=25 % (15 + ) -15 + 'deneme' + 17.3 + varname) - 15)");
        //var tokenMap = Scanner("mehmet = tokenMap == false && (ahmet += 15 || 25)");
        //var tokenMap = Scanner("ahmet(2)[6] += 5");
        //var tokenMap = Scanner("_$al1212oo += 'deneme'");

        /** -------------------

        var abc;

        t.log('den:' , 2 + 4 - (2 * (6 / 2 + 2 - 8 + ((3 * 2) + (1 + 2))) * 6) / 4);



        var scope = new Scope() ,
            result = Interpreter("abc = [[1 , 2] , 3]" , scope);




        t.log(scope._variables);

        if (result === false) {
            t.log('Error:' , t.Error());
        } else {
            t.log('Başarılı');
        }


        /*
        var scope = new Scope;

        scope.setVarI(['abc'] , [1 , 3 , [2 , 3]]);

        t.log('--' , scope.getVarI(['abc' , 2 , 0]));


        */

        // abc[ 2 , 3 ] = 5
        // abc = (temp || 15)
        // 2 + 4 - (2 * (6 / 2 + 2 - 8 + ((3 * 2) + (1 + 2))) * 6) / 4
        // 2 + 4 - (2 * (6 / 2) * 6) / 4
        // 2 + 4 - 2 * 6 / 2 * 6 / 4 * 2
        //3 + 4 - 2 * (5 + 3) * 2 + 2 - 3
        // 3 + (4 * (5 - (3))) => 110
        // 3 + (4 * 5) - 3 =>t.log(scope._variables); 20
        // 4 * 5 + 3 - 3

        /**
         * result = null;
         *
         * 1|
         * push result || 3 +
         *
         * 2|
         *
         * 4 * 5  = 20
         * result = 20
         *
         * 3 + result = 23
         *
         * 3|
         *
         *
         * push result || value -
         *
         * 4|
         *
         *
         *
         *
         *
         */






    });

    t.test('core.Controller' , function () {
        return;
        var sNode = new Node.Start,
            oNode = new Node.Operation,
            cNode = new Node.Condition,
            eNode = new Node.End,
            scope = new Scope('testScope'),
            controller = new Controller(scope);
        
        scope.addNode(sNode).addNode(oNode).addNode(eNode).addNode(cNode);

        sNode.setNextNode(oNode);
        oNode.setNextNode(cNode);

        cNode.setNextFalseNode(oNode);
        cNode.setNextTrueNode(eNode);

        oNode.setText('abc = (abc || 0) + 1');

        cNode.setText('abc == 5');

        controller.play();

        t.log(scope);
        
    });

    t.test('core.Chart' , function () {

        var chart = new t.Chart('scene' , 1000 , 300);

        var a = chart.addNode('Start' , 22 , 44);
        var b = chart.addNode('Operation' , 97 , 44);
        var c = chart.addNode('Condition' , 23 , 124);
        var d = chart.addNode('End' , 19 , 242);
        var e = chart.addNode('Operation' , 664  , 116);
        var f = chart.addNode('Operation' , 165 , 234);
        var g = chart.addNode('Operation' , 276 , 43);
        var h = chart.addNode('Operation' , 474 , 44);
        var h1 = chart.addNode('Operation' , 233 , 142);
        var h3 = chart.addNode('Operation' , 756 , 42);
        var c1 = chart.addNode('Condition' , 355 , 152);
        var c2 = chart.addNode('Condition' , 498 , 129);
        var o1 = chart.addNode('Operation' , 813 , 113);
        var o2 = chart.addNode('Operation' , 816 , 229);
        var o3 = chart.addNode('Operation' , 518 , 230);

        var setText = function (n , text) {
            n.iNode.setText(text);
            n.textObj.setText(text);
        };

        setText(b ,'abc = [0 , 9 , 3 , 2 , 7]');
        setText(g, 'length = LENGTH(abc)');
        setText(h , 'i = 0');
        setText(h1 , 'j = 0');
        //setText(h2 , 'deger = -1');
        setText(h3 , 'temp = 0');
        setText(c , 'i < length');
        setText(e , 'temp = abc[i]');
        setText(o1 , 'abc[i] = abc[j]');
        setText(o2 , 'abc[j] = temp');
        setText(o3 , 'j+=1');
        setText(f , 'i+=1');
        setText(c1 , 'j < length');
        setText(c2 , 'abc[i] > abc[j]');


        chart.link(a , b);
        chart.link(b , g);
        chart.link(g , h);

        chart.link(h , h3);
        //chart.link(h1 , h2);
        //chart.link(h2 , h3);

        //chart.link(h1 , h3);
        chart.link(h3 , c);

        chart.link(c , h1);
        chart.link(h1 , c1);

        chart.link(c , d);
        chart.link(c1 , c2);
        chart.link(c1 , f);
        chart.link(f , c);
        chart.link(c2 , e);
        chart.link(c2 , o3);
        chart.link(e , o1);
        chart.link(o1 , o2);
        chart.link(o2 , o3);
        chart.link(o3 , c1);


        /*
        chart.link(c , e);
        chart.link(e , f);
        chart.link(f , c);
        chart.link(c , d);
        */


        var _state = false;

        var _bw = null;

        chart.scene.main.input('key[key=R]' , {
            onDown: function () {
                if (!_state) {
                    chart.controller.play();
                    _state = true;
                }
            }
        });


        document.getElementById('iEdit').addEventListener('click' , function () {
            if (!_state) {
                chart.controller.play();
                _state = true;
            }
        });




        chart.scene.main.input('key[key=T]' , {
            onDown: function () {
                if (_state) {
                    chart.controller.pause();
                    _state = false;
                }
            }
        });

        chart.scene.main.input('key[key=K]' , {
            onDown: function () {
                var nodes = chart.gnodes.getElements(),
                    i = 0,
                    node;

                for (; i < nodes.length; i++) {
                    node = nodes[i];
                    if (node.textObj) {
                        t.log(node.iNode.toDebug() , node.offset.x , node.offset.y);
                    }
                }

            }
        });

        chart.controller.on('stop' , function () {
            _state = false;
        });

        chart.controller.on('pause' , function () {
            _state = false;
        });



        var _pr = function (vari , text) {
            var val = vari.getValue(),
                name = vari.getName(),
                history = vari.getHistory();

            text += '<p>' + name + ' : ';

            if (t.isBool(val)) {
                text += val ? 'true' : 'false';
            } else if (t.isNumber(val)) {
                text += val;
            } else if (t.isString(val)) {
                text += "'" + val + "'";
            } else {
                text += JSON.stringify(val);
            }

            text += '</p>';

            return text;
        };



        chart.controller.on('execute' , function (node) {
            var el = document.getElementById('vari'),
                varis = chart.controller._scope.getVariables()._list,
                i = 0,
                text = '';

            for ( ; i < varis.length ; i++) {
                text = _pr(varis[i] , text);
            }

            el.innerHTML = text;

            if (_bw) {
                _bw.borderWidth = 1;
            }

            if (node.gnode) {
                node.gnode.borderWidth = 3;
                _bw = node.gnode;
            }

        });

    });

})();
})(window);