/*
* Yasin Ekici 2017
* ekici@yahoo.com
* */

var goz = {};

(function (scope) {
    'use strict'

    var t;

    t = scope.t = scope.Tepegoz = function () {};

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

            _temp = prop._tepegozObjectName;

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


            prop._tepegozObjectName = _temp;

            if (name) {

                if (prop._tepegozObjectName) {
                    name = prop._tepegozObjectName + '.' + name;
                } else {
                    name = 't.' + name;
                }

                prop._tepegozObjectName = name;
                prop.toString = function () { return this._tepegozObjectName};

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
        },

        getWheelType: function () {
            return 'onmousewheel' in window ? 'mousewheel' : 'onwheel' in window ? 'wheel' : 'DOMMouseScroll';
        }


    });

    Util.assign(t , Util);




})();
// name:display.Bounds
// require:core.Util

var Bounds;

(function (){


    /**
     *
     * @class Bounds
     * @param {number} x En küçük x değeri
     * @param {number} y En küçük y değeri
     * @param {number} mx En büyük x değeri
     * @param {number} my En büyük y değeri
     */
    t.Bounds = Bounds = t.class(function (x , y , mx , my) {


        /**
         * X Değeri
         * @type {number}
         */
        this.x = x || Infinity;

        /**
         * Y Değeri
         * @type {number}
         */
        this.y = y || Infinity;

        /**
         * Max X Değeri
         * @type {number}
         */
        this.mx = mx || -Infinity;

        /**
         * Max Y Değeri
         * @type {number}
         */
        this.my = my || -Infinity;

        /**
         * Width Değeri
         * @type {number}
         */
        this.width = 0;

        /**
         * Height Değeri
         * @type {number}
         */
        this.height = 0;

        if (isFinite(this.x) && isFinite(this.y)) {
            this.calcSize();
        }


    } , {

        /**
         * width ve height değerlerini hesaplar
         * @returns {Bounds}
         */
        calcSize: function () {
            this.width = this.mx - this.x;
            this.height = this.my - this.y;
            return this;
        },

        /**
         *
         * @returns {Bounds}
         */
        reset: function () {
            this.x = Infinity;
            this.y = Infinity;
            this.mx = -Infinity;
            this.my = -Infinity;
            this.height = 0;
            this.width = 0;

            return this;
        },

        /**
         * x, y değerlerine göre sınırları belirler
         * @param {number} x
         * @param {number} y
         * @returns {Bounds}
         */
        handle: function (x , y) {


            if (x < this.x) this.x = x;
            if (y < this.y) this.y = y
            if (x > this.mx) this.mx = x;
            if (y > this.my) this.my = y;

            this.calcSize();

            return this;
        },

        /**
         * dizideki sıralı noktalara göre sınırları belirler
         * @param {array} list Sıralı nokta dizisi
         * @param {boolean} reset True ise önce sınırları sıfırlar
         * @returns {Bounds}
         */
        handleArray: function (list , reset) {
            if (reset) {
                this.reset();
            }

            for (var i = 0 ; i < list.length ; i+=2) {
                this.handle(list[i] , list[i + 1]);
            }

            return this;
        },

        /**
         * Noktanın sınırlar içerisinde kalıp kalmadığını kontrol eder
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         */
        containsPoint: function (x , y) {
            if (x < this.x || x > this.mx || y < this.y  || y > this.my) {
                return false;
            }
            return true;
        },


        /**
         * Sınırın orta noktasını döndürür
         * @return {Vector}
         */
        center: function () {
            return new V(this.x + this.width * 0.5  , this.y + this.height * 0.5);
        },

        /**
         * Belirtilen x , y değerine göre o sınırın noktasını döndürür
         * point(0, 0) sol üst köşe
         * point(1, 0) sağ üst köşe gibi
         * point(0.5, 0.5) merkez
         * @param {number} x
         * @param {number} y
         */
        point: function (x , y) {
            return new V(this.x + this.width * x  , this.y + this.height * y);
        }

    });

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
// name:core.Flag


// ***********ihtiyaç kalmadı
var Flag;

(function () {

    /**
     * Bayrak
     * @param {int} [length=8] - Bayrak uzunluğu
     * @class Flag
     */
    Flag = t.Flag = t.class(function (length) {

        this._charged = Math.pow(2 ,length || 8) - 1;
        this._value = 0;
        this._flagID = 0;

    } , /**@lends Flag.prototype*/{

        /**
         * Kapasiteyi yeniden düzenler
         * @param {number} length
         */
        capacity: function (length) {
            this._charged = Math.pow(2 ,length || 8) - 1;
        },

        /**
         * Belirtilen sıradaki bayrağın değerini döndürür
         * @param {int} order
         */
        get: function (order) {
            return (this._value >> order) & 1;
        },

        /**
         * Belirtilen sıradaki bayrağın değerini değiştir
         * @param {int} order
         * @param {bool} value
         */
        set: function (order , value) {
            value ? this.fill(order) : this.clear(order);
        },

        /**
         * Belirtilen bayrağı 0 yapar
         * @param {int} order
         */
        clear: function (order) {
            this._value &= ~(1 << order);
        },

        /**
         * Belirtilen bayrağı 1 yapar
         * @param {int} order
         */
        fill: function (order) {
            this._value |= 1 << order;
        },

        /**
         * Bütün bayrakları 1 yapar
         */
        charge: function () {
            this._value = this._charged;
        },

        /**
         * Bütün bayrakları 0 yapar
         */
        reset: function () {
            this._value = 0;
        },

        /**
         * Full şarj mı?
         * @returns {boolean}
         */
        isCharged: function () {
            return this._value === this._charged;
        }

    });

    Flag._data = {};

    /**
     * Bayrak ismine göre order ı  döndürür
     * @param {String} name
     * @memberof Flag
     */
    Flag.getID = function (name) {
        if (!Flag._data[name]) {
            Flag._data[name] = 0;
        }
        return Flag._data[name]++;
    };

})();
// name:t.Core.Matrix2D
// require:core.Util

var Matrix2D;


(function () {

    /**
     * 2D Görüntü Matrisi
     * @class Matrix2D
     */
    t.Matrix2D = Matrix2D = t.extend.call(Array , function (matrix) {
        if (t.isArray(matrix)) {
            this.push.apply(this , matrix);
        } else {
            this.push(1 , 0 , 0 , 1 , 0 , 0);
        }
    } , /**@lends Matrix2D.prototype*/{

        /**
         * Değerleri birim matrise çevirir
         */
        reset: function () {
            this[0] = 1;
            this[1] = 0;
            this[2] = 0;
            this[3] = 1;
            this[4] = 0;
            this[5] = 0;
            return this;
        },

        /**
         * Değeleri değiştirir
         * @param {array} matrix
         * @return {Matrix2D}
         */
        set: function (m) {
            this[0] = m[0];
            this[1] = m[1];
            this[2] = m[2];
            this[3] = m[3];
            this[4] = m[4];
            this[5] = m[5];
            return this;
        },

        /**
         * Kopyasını döndürür
         * @returns {Matrix2D}
         */
        clone: function () {
            return new Matrix2D(this);
        },

        /**
         * Mevcut matrisi Matrix2D.temp atar ve onu döndürür
         * @returns {Matrix2D}
         */
        toTemp: function () {
            Matrix2D.temp.set(this);
            return Matrix2D.Temp;
        },

        /**
         * Matris çarpımı
         * unbound true ise çıkan sonuç mevcut matrise atanmaz.sonucun kopyası döndürülür
         * m0 m2 m4     n0 n2 n4     m0*n0 + m2*n1     m0*n2 + m2*n3    m0*n4 + m2*n5 + m4
         * m1 m3 m5  x  n1 n3 n5  =  m1*n0 + m3*n1     m1*n2 + m3*n3    m1*n4 + m3*n5 + m5
         * 0  0  1      0  0  1      0
         * @param {array} matrix Çarpılacak matris
         * @param {bool} toTemp True ise kendi matrisine çarpım sonucu atmak yerine Matrix2D.temp e atar ve onu döndürür
         * @return {Transform}
         */
        multiply: function (n) {

            var t = this,
                t0 = t[0],
                t1 = t[1],
                t2 = t[2],
                t3 = t[3];

            t[0] = t0 * n[0] + t2 * n[1];
            t[1] = t1 * n[0] + t3 * n[1];

            t[2] = t0 * n[2] + t2 * n[3];
            t[3] = t1 * n[2] + t3 * n[3];

            t[4] = t0 * n[4] + t2 * n[5] + t[4];
            t[5] = t1 * n[4] + t3 * n[5] + t[5];

            return this;
        },


        /**
         * Ölçeklendirme
         * matris çarpımı yapıyoruz.[x , 0 , 0 , y , 0 , 0] matrisi ile mevcut matrisi çarpıyoruz
         * hız için etkilenecek sonuçları üstteki matrix çarpımı sonucundan tespit edip
         * tek tek çarpılır.
         * @param {number} x X eksenindeki ölçeklendirme değeri
         * @param {number} y Y eksenindeki ölçeklendirme değeri
         * @return {Matrix2D}
         * @example
         * ts.scale(2 , 2); // x ve  y ekseninde 2 kat büyüdü
         * ts.scale(1 , 2); // y eksenin 2 kat büyüdü
         */
        scale: function (x , y) {
            this[0] *= x;
            this[1] *= x;
            this[2] *= y;
            this[3] *= y;
            return this;
        },

        /**
         * Konumlandırma
         * @param {number} x X eksenindeki konumlandırma değeri
         * @param {number} y Y eksenindeki konumlandırma değeri
         */
        translate: function (x , y) {
            this[4] += this[0] * x + this[2] * y;
            this[5] += this[1] * x + this[3] * y;
            return this;
        },

        /**
         * Eğme
         * @param {number} x=0 X eksenindeki eğme değeri
         * @param {number} y=0 Y eksenindeki eğme değeri
         */
        skew: function (x , y) {
            var t = this,
                t0 = t[0],
                t1 = t[1],
                t2 = t[2],
                t3 = t[3];

            t[0] = t0 + t2 * x;
            t[1] = t1 + t3 * x;

            t[2] = t0 * y + t2;
            t[3] = t1 * y + t3;

            return this;
        },


        /**
         * Döndürme
         * @param {number} radian Döndürme değeri (radyan cinsinden)
         */
        rotate: function (radian) {
            var c = Math.cos(radian),
                s = Math.sin(radian),
                t = this,
                t0 = t[0] ,
                t1 = t[1] ,
                t2 = t[2] ,
                t3 = t[3];


            t[0] = t0 * c + t2 * s;
            t[1] = t1 * c + t3 * s;

            t[2] = t0 * -s + t2 * c;
            t[3] = t1 * -s + t3 * c;

            return this;
        },


        /**
         * Determinatı hesaplar
         * @return  {number}
         */
        determinant: function () {
            return this[0] * this[3] - this[1] * this[2];
        },

        /**
         * Matrisin tersini alır
         * @param {bool} toTemp True ise sonucu mevcut matris yerine Matrix2D.temp e atar ve onu döndürür
         * @return {Transform}
         */
        invert: function () {
            var dt = this.determinant(),
                s = this,
                s0 = s[0],
                s1 = s[1],
                s2 = s[2],
                s3 = s[3],
                s4 = s[4],
                s5 = s[5];

            if (Math.abs(dt) > t.EPSILON) {
                dt = 1 / dt;

                s[0] = s3 * dt;
                s[1] = -s1 * dt;
                s[2] = -s2 * dt;
                s[3] = s0 * dt;
                s[4] = (s2 * s5 - s3 * s4) * dt;
                s[5] = -(s0 * s5 - s1 * s4) * dt;

            }else {
                t.warn(this , 'Determinant mustnt equals zero');
            }
            return this;
        },


        /**
         * Belirtilen noktanın mevcut matriste göre hangi noktaya denk geldiğini döndürür
         * @param {number} x=0 X değeri
         * @param {number} y=0 Y değeri
         * return {Vector}
         * @example
         * ts.translate(30 , 30);
         * ts.point(0 , 0); // döndürür {x:30 , y:30}
         */
        point: function (x , y) {
            return new V(this[0] * x + this[2] * y + this[4] , this[1] * x + this[3] * y + this[5]);
        },

    });


    Matrix2D.temp = new Matrix2D;



})();
// name:t.Core.Vector

var V,Vector;

(function () {


    /**
     * 2d Vector
     * @class Vector
     * @param {number} x=0 X Değeri
     * @param {number} y=0 Y Değeri
     */
    t.Vector = t.V = V = Vector = t.class(function (x , y) {

        if (x instanceof V) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x || 0;
            this.y = y || 0;
        }


    } , /**@lends Vector.prototype*/{

        /**
         * Kendi kopyasını döndürür
         * @return {Point}
         */
        clone: function () {
            return new V(this.x , this.y);
        },

        /**
         * Belirtilen nokta ile arasındaki mesafeyi döndürür
         * @param {number} x=0 X Değeri
         * @param {number} y=0 Y Değeri
         * @return {number} Mesafe
         */
        distance: function (x , y) {
            x = this.x - (x || 0);
            y = this.y - (y || 0);
            return Math.sqrt(x * x + y * y);
        },

        /**
         * Noktanın x , y değerlerini değiştiri
         * @param {number} x=0 X Değeri
         * @param {number} y=0 Y Değeri (yok ise x in değerini alır)
         */
        set: function (x , y) {
            this.x = x;
            this.y = y == null ? x : y;
            return this;
        },

        /**
         * Noktanın x , y değerlerine belirtilen noktanın x , y değerleri eklenir(toplanır)
         * @param {number} x=0 X Değeri
         * @param {number} y=0 Y Değeri
         */
        sum: function (x , y) {
            this.x += x;
            this.y += y;
            return this;
        },

        /**
         * Noktanın x , y değerlerinden belirtilen noktanın x , y değerleri çıkarılır
         * @param {number} x=0 X Değeri
         * @param {number} y=0 Y Değeri
         */
        sub: function (x , y) {
            this.x -= x;
            this.y -= y;
            return this;
        },

        /**
         * Kendi değerlerini belirtlen değerlere böler
         * @param {number} x=0 X Değeri
         * @param {number} y=0 Y Değeri
         */
        div: function (x , y) {
            this.x /= x;
            this.y /= y;
            return this;
        },

        /**
         * Kendi değerlerini belirtlen değerlerle çarpar
         * @param {number} x=0 X Değeri
         * @param {number} y=0 Y Değeri
         */
        mul: function (x , y) {
            this.x *= x;
            this.y *= y;
            return this;
        },

        /**
         * Skaler çarpım yapar
         * @param {number} x=0 X Değeri
         * @param {number} y=0 Y Değeri
         * @return {Vector} sonuç
         */
        dot: function (x , y) {
            return this.x * x + this.y * y;
        },

        /**
         * Noktayı saat yönünün tersine 90 derece çevirir
         * @return {Point}
         */
        perp: function () {
            var x = this.x;
            this.x = this.y;
            this.y = -x;
            return this;
        },

        /**
         * X ve y değerlerini karşılıklı değiştirir
         */
        reverse: function () {
            var temp = this.x;
            this.x = this.y;
            this.y = temp;
            return this;
        },

        /**
         * Görüntü matrsini noktaya uygular
         * @param {array} matris Görüntü matrisi
         */
        atr: function (m) {
            var x = this.x,
                y = this.y;

            this.x = m[0] * x + m[2] * y + m[4];
            this.y = m[1] * x + m[3] * y + m[5];
            return this;
        },


        /**
         *
         * @param {Vector|number} vector
         * @paran {number=} y
         * @returns {boolean}
         */
        equals: function (vector , y) {
            if (vector instanceof Vector) {
                return this.x === vector.x && this.y === vector.y;
            }


            return this.x === vector && this.y === y;

        }

    });



})();
// name:core.ObservableVector
// require:core.Vector


var ObservableVector,OV;

(function () {


    /**
     * 2d Takip edilebilir Vector
     * @class Vector
     * @param {number} x=0 X Değeri
     * @param {number} y=0 Y Değeri
     * @param {Flag|function} callback
     */
    t.ObservableVector = t.OV = ObservableVector = OV = Vector.extend(function (x , y , callback , context) {

        this._x = 0;
        this._y = 0;

        this._callback = callback;
        this._context = context || this;


        Vector.call(this , x , y);
    } , /**ObservableVector.prototype*/{
        /**
         * Kendi kopyasını döndürür
         * @returns {ObservableVector}
         */
        clone: function (callback , context) {
            return new OV(this._x , this._y , callback || this._callback , context || this._context);
        },


        /**
         *
         * @param {Vector} vector
         * @returns {boolean}
         */
        equals: function (vector , y) {
            if (vector instanceof Vector) {
                return this._x === vector.x && this._y === vector.y;
            }

            return this.x === vector && this.y === y;
        },


        _emit: function () {
            this._callback.call(this._context);
        }

    });

    Object.defineProperties(ObservableVector.prototype , {
        x: {
            get: function () {
                return this._x;
            },
            set: function (val) {
                this._x = val;
                this._emit();
            }
        },
        y: {
            get: function () {
                return this._y;
            },
            set: function (val) {
                this._y = val;
                this._emit();
            }
        }
    })

})();
// name:core.Points
// require:core.Matrix2D

var Points;

(function () {

    /**
     * Sıralı ikili şeklinde noktaları tutar
     * x,y , x,y
     * @param {array} points
     * @class Points
     */
    t.Points = Points = t.class(function (points) {

        this._points = points ? points.slice() : [];

    } , {

        /**
         *
         */
        clone: function () {
            return new Points(this._points);
        },

        /**
         * Nokta sayısını döndürür
         * @returns {number}
         */
        getLength: function () {
            return this._points.length / 2;
        },

        /**
         *
         * @returns {number}
         */
        getLastIndex: function () {
            return (this._points.length / 2) - 1
        },

        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} [index=0]
         */
        add: function (x , y , index) {

            if (index == null) {
                this._points.push(x , y);
            } else {
                this._points.splice(2 * index , 0 , x , y);
            }

        },


        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} [index=0] Belirtilen index ten itibaren aramaya başlar
         * @param {boolean} Herhangi bir nokta silinirse true yoksa false
         */
        remove: function (x , y , index) {

            var i = index != null ? 2 * index : 0,
                points = this._points,
                length = points.length,
                status = false;

            for ( ; i < length ; i += 2) {

                if (points[i] == x && points[i + 1] == y) {
                    points.splice(i , 2);
                    i-=2;
                    status = true;
                }

            }

            return status;
        },

        /**
         * Belirtilen sıradaki noktayı siler
         * @param {number} index
         * @returns {Array.<T>}
         */
        delete: function (index) {
            return this._points.splice(2 * index , 2);
        },


        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} [index=0] Belirtilen index ten itibaren aramaya başlar
         * @return {number|boolean} Bulunursa index sini yoksa false döndürür
         */
        search: function (x , y , index) {
            var i = index != null ? 2 * index : 0,
                points = this._points,
                length = points.length;

            for ( ; i < length ; i += 2) {
                if (points[i] == x && points[i + 1] == y) {
                    return i / 2;
                }
            }

            return false;
        },

        /**
         *
         * @param {number} index
         * @param {Vector=} vector Gönderilerse noktayı bu vektöre yazar
         */
        get: function (i , vector) {

            if (!vector) {
                vector = new V;
            }

            var p = this._points;

            i *= 2;

            vector.set(p[i] , p[i + 1]);

            return vector;
        },

        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} index
         */
        set: function (x , y , index) {
            var i = 2 * index,
                points = this._points;

            points[i] = x;
            points[i + 1] = y;

            return this;
        },

        /**
         *
         * @returns {*}
         */
        getPoints: function () {
            return this._points;
        },

        /**
         * Matrisi noktaya uygular
         * @param {Matrix2D} matrix
         * @param {number=} index Yok ise bütün noktalara uygular
         * @param {Points} source Kendi nokta sayısı uzunluğu ile aynı uzunlukta nokta kaynağı
         */
        transform: function (matrix , index , source) {

            var mypoints = this._points,
                points = source || mypoints,
                length = points.length,
                i = 0,
                x , y;

            //this[0] * x + this[2] * y + this[4] , this[1] * x + this[3] * y + this[5]

            if (index != null) {

                i = index * 2;

                x = points[i];
                y = points[i + 1]

                mypoints[i] = matrix[0] * x + matrix[2] * y + matrix[4];
                mypoints[i + 1] = matrix[1] * x + matrix[3] * y + matrix[5];

            } else {

                for ( ; i < length ; i += 2) {
                    x = points[i];
                    y = points[i + 1]

                    mypoints[i] = matrix[0] * x + matrix[2] * y + matrix[4];
                    mypoints[i + 1] = matrix[1] * x + matrix[3] * y + matrix[5];
                }

            }

            return this;

        }

    });

})();
// name:core.Scene

var Scene;

(function () {

    t.Scene = Scene = t.class(function (container , width , height , opt) {

        if (!opt || !t.isObject(opt))
            opt = {};


        this.main = new Group(this);

        this.canvas = new Canvas(container , width , height );

        this.drawing = new Drawing(this);

        this.inputController = new Input.Controller(this);

        this.add = this.main.add;
    } , [] , {

        /**
         * Mainin transform unu kontrol eder
         */
        enableZoomController: function (min , max , interval , phrases) {
            if (min < 0) min = 0;
            if (max < 0) max = 0;
            if (interval < 0) interval = 0;
            if (!phrases) phrases = '';

            var self = this;

            return this.main.input('wheel' + phrases + '[id=0zoom][capture][local]' , {
                onWheel: function (e) {
                    var currentZoom = self.zoom,
                        nextZoom = currentZoom + (-1 * e.deltaY * interval),
                        o = new V(e.offsetX , e.offsetY),
                        p , k;


                    k = this.getTSMatrix().clone().invert().point(o.x , o.y);

                    self.zoom = t.clamp(nextZoom , min , max);

                    this.offset.set(0 , 0);

                    p = this.getTSMatrix().point(k.x , k.y);

                    this.offset.set(o.x - p.x, o.y - p.y);

                    this.emit('zoom');
                }
            });

        },

        disableZoomController: function () {
            this.main.inputOff('0zoom');
        },

        enableDrag: function (withEl , phrases) {
            if (!phrases) phrases = '';

            this._enableDrag = new V;
            this._enableDrag.drag = false;


            var self = this;

            this.main.input('move[local][id=0move]' , {
                onMove: function (e) {
                    if (!self._enableDrag.drag) return;
                    var p = self._enableDrag,
                        diff = new V(e.offsetX - p.x , e.offsetY - p.y);

                    this.offset.sum(diff.x , diff.y);
                    p.set(e.offsetX , e.offsetY);
                }
            });


            return this.main.input('button' + phrases + '[local][id=0button]' , {
                onDown: function (e) {
                    if (withEl && !e.target) return;
                    self._enableDrag.set(e.offsetX , e.offsetY);
                    self._enableDrag.drag = true;
                } ,
                onUp: function (e) {
                    self._enableDrag.drag = false;
                }
            });
        }



    });


    Object.defineProperties(Scene.prototype , {

        zoom: {
            get: function () {
                return this.main.scale.x;
            },
            set: function (val) {
                val < 0 && (val = 0);
                this.main.scale.set(val , val);
            }
        }

    });


})();
// name:core.Transformation
// require:core.Flag


var Transformation,TS;

(function () {


    /**
     * Genelleştirilmiş transform işlemleri
     * @class Transformation
     */
    t.Transformation = t.TS = Transformation = TS = t.class(function (opt) {


        this._matrix2D = new Matrix2D;

        opt = opt || {};

        this._bindingTSList = [];
        this._boundTS = null;


        /**
         * Ölçeklendirme
         * @name Transformation#scale
         * @type {Vector}
         * @default 1 , 1
         */
        this.scale = opt.scale ? t.isArray(opt.scale) ? new OV(opt.scale[0] || 0, opt.scale[1] || 0 , this._changeTS , this)
            : opt.scale.clone(this._changeTS , this)
            : new OV(1 , 1 , this._changeTS , this);

        /**
         * Ölçeklendirme Konumu
         * @name Transformation#origin
         * @type {Vector}
         * @default 0 , 0
         */
        this.origin = opt.origin ? t.isArray(opt.origin) ? new OV(opt.origin[0] || 0, opt.origin[1] || 0 , this._changeTS , this)
            : opt.origin.clone(this._changeTS , this)
            : new OV(0 , 0 , this._changeTS , this);

        /**
         * Konumlandırma
         * @name Transformation#offset
         * @type {Vector}
         * @default 0 , 0
         */
        this.offset = opt.offset ?  t.isArray(opt.offset) ? new OV(opt.offset[0] || 0, opt.offset[1] || 0 , this._changeTS , this)
            : opt.offset.clone(this._changeTS , this)
            : new OV(0 , 0 , this._changeTS , this);


        /**
         * Eğme
         * @name Transformation#skew
         * @type {Vector}
         * @default 0 , 0
         */
        this.skew = opt.skew ? t.isArray(opt.skew) ? new OV(opt.skew[0] || 0, opt.skew[1] || 0 , this._changeTS , this)
            : opt.skew.clone(this._changeTS , this)
            : new OV(0 , 0 , this._changeTS , this);


        /**
         * Döndürme (Derece)
         * @name Transformation#rotation
         * @type {number} Degree
         * @default 0
         */
        this.rotation = opt.rotation || 0;

        /**
         * Döndürme Konumu
         * @name Transformation#anchor
         * @type {Vector}
         * @default 0 , 0
         */
        this.anchor = opt.anchor ? t.isArray(opt.anchor) ? new OV(opt.anchor[0] || 0, opt.anchor[1] || 0 , this._changeTS , this)
            : opt.anchor.clone(this._changeTS , this)
            : new OV(0 , 0 , this._changeTS , this);



        this.updateTS();


    } , /**@lends Transformation.prototype*/{


        _changeTS: function () {
            var i , _temp;

            this._changeInTS = true;

            i = this._bindingTSList.length

            if (i) {

                _temp = this._bindingTSList;

                while (i--) {
                    _temp[i]._changeTS();
                }

            }

        },

        /**
         * Mevcut Konumlandırma , Ölçeklendirme , Eğme değerlerine göre transformu hesaplar
         * @return {Transform}
         */
        updateTS: function () {

            var matrix = this._matrix2D,
                scale = this.scale,
                skew = this.skew,
                offset = this.offset,
                rotation = this._rotation,
                anchor = this.anchor,
                origin = this.origin;


            matrix.id = t.gid();


            if (this._boundTS) {
                matrix.set(this._boundTS.getTSMatrix());
            } else {
                matrix.reset();
            }


            /**
             * Konumlandırma
             */
            if (offset._x || offset._y) {
                matrix.translate(offset._x , offset._y);
            }

            /**
             * Döndürme
             */
            if (rotation) {

                if (anchor._x || anchor._y) {
                    matrix.translate(anchor._x , anchor._y);
                    matrix.rotate(t.degreeToRadian(rotation));
                    matrix.translate(-anchor._x , -anchor._y);
                } else {
                    matrix.rotate(t.degreeToRadian(rotation));
                }

            }

            /**
             * Eğme
             */
            if (skew._x || skew._y) {
                matrix.skew(skew._x , skew._y);
            }

            /**
             * Ölçeklendirme
             */
            if (scale.x || scale.y) {

                if (origin._x || origin._y) {
                    matrix.translate(origin._x , origin._y);
                    matrix.scale(scale._x , scale._y);
                    matrix.translate(-origin._x , -origin._y);
                } else {
                    matrix.scale(scale._x , scale._y);
                }


            }

            this._changeTS();

            return this._matrix2D;
        },

        /**
         * Transformation güncel olup olmadığını döndürür
         * @returns {boolean}
         */
        TSIsUpdated: function () {
            return !this._changeInTS;
        },

        /**
         * Hesaplanmış matrisi döndürür
         */
        getTSMatrix: function () {
            if (!this.TSIsUpdated()) {
                this.updateTS();
            }
            return this._matrix2D;
        },


        /**
         * Belirtilen ts ye ile kendi ts ini bağlar
         * Aslında belirtilen matris ile kendi mantrisini çarpar ve kendi değerini elde eder
         * @param {Transformation|null} ts null gelirse bağlantı kopar(unbind)
         */
        bindTS: function (ts) {

            if (ts) {
                this._boundTS = ts;
                if (ts._bindingTSList.indexOf(this) < 0) {
                    ts._bindingTSList.push(this);
                    this._changeTS();
                }
            } else {
                if (!this._boundTS) return;
                //unbind
                var index;
                ts = this._boundTS;
                this._boundTS = null;
                if ((index = ts._bindingTSList.indexOf(this)) >= 0) {
                    ts._bindingTSList.splice(index , 1);
                    this._changeTS();
                }
            }

        },


        /**
         * Kendi kopyasını üretir
         * @return {Transformation}
         */
        clone: function () {
            return new Transformation(this);
        }
    });

    Object.defineProperties(Transformation.prototype , {
        rotation: {
            get: function () {
                return this._rotation;
            },

            set: function (val) {
                this._rotation = val;
                this._changeTS();
            }
        }
    })




})();
// name:display.Attributes

var Attributes;

(function () {

    /**
     *
     * @class Attributes
     */
    t.Attributes = Attributes = t.class('Attributes' , function (type , opt) {

        !opt && (opt = {});

        /**
         * ELEMENT veya GROUP
         */
        this._attributes = type;

        if (type <= Attributes.GROUP) { // ortak

            /**
             * False ise çizilmez
             * @type {boolean}
             */
            this.visible = opt.visible != null ? opt.visible : true;

            /**
             * Şimdilik sadece kalıtım şekilli lazım
             * @type {number}
             */
            this.position = Attributes.INHERITANCE;

            /**
             * Opaklık
             * @type {number}
             */
            this.alpha = opt.alpha != null ? opt.alpha : 1;
        }

        if (type == Attributes.ELEMENT) {
            /**
             *
             * @type {boolean}
             */
            this.closed = opt.closed != null ? opt.closed : true;

            /**
             *
             * @type {boolean|Color}
             */
            this.fill = opt.fill != null ? (opt.fill instanceof Color ? opt.fill : new Color(opt.fill))  : false;

            /**
             *
             * @type {boolean|Color}
             */
            this.stroke = opt.stroke != null ? (opt.stroke instanceof Color ? opt.stroke : new Color(opt.stroke)) : false;


            /**
             * Çerçeve kalınlığı
             * @type {number}
             */
            this.borderWidth = opt.borderWidth != null ? opt.borderWidth : 1;

        }




    } , [] , {

        applyAttributes: function (context , inheritance) {

            var type = this._attributes;


            if (type == Attributes.ELEMENT) {

                if (this.fill) {
                    context.fillStyle = this.fill.toCanvas();
                }

                if (this.stroke) {
                    context.strokeStyle = this.stroke.toCanvas();
                }

                context.globalAlpha = this.alpha * inheritance.alpha;

                context.lineWidth = this.borderWidth;

            } else if (type == Attributes.GROUP) {


                inheritance.alpha = context.globalAlpha = this.alpha * inheritance.alpha;


            }

            if (type <= Attributes.GROUP) { // ortak


            }

        }


    });

    t.assign(t.Attributes , {
        ELEMENT: 1,
        GROUP: 2,


        //Positions
        INDEPENDENT: 301,
        INHERITANCE: 302,
        FIXED: 303,
    });

    /**
     *
     * @param inheritance
     * @class {Attributes.Inheritance}
     */
    Attributes.Inheritance = function (inheritance) {
        this.alpha = inheritance ? inheritance.alpha : 1;
    }

})();
// name:display.Canvas

var Canvas;

(function () {

    /**
     * @class Canvas
     * @param {String} container kapsayıcı element id
     * @param {Number} width
     * @param {Number} height
     */
    t.Canvas = Canvas = t.class('Canvas' , function (container , width , height) {


        var canvas = document.createElement('Canvas'),
            element = document.getElementById(container);

        if (!element)
            throw new Error('Container is not found')

        canvas.width = width || 640;
        canvas.height = height || 480;


        element.appendChild(canvas);

        this._canvas = canvas;
        this._context = canvas.getContext('2d');

        this.setStyle({
            position: 'relative' ,
            top: '0px' ,
            left: '0px' ,
            padding: '0px' ,
            margin: '0px'
        });

    } , [] , {

        /**
         *
         * @param {Object} properties
         */
        setStyle: function (properties) {
            var canvas = this._canvas;
            for (var key in properties) {
                canvas.style[key] = properties[key];
            }
        },

        /**
         *
         * @returns {Element|*}
         */
        getCanvas: function () {
            return this._canvas;
        },

        /**
         *
         * @returns {*|CanvasRenderingContext2D}
         */
        getContext: function () {
            return this._context;
        }

    })

})();
// name:display.Color
// require:core.Util
var Color;

(function () {

    /**
     *
     * @param {Number|Color|String|Hex} red
     * @param {Number} green
     * @param {Number} blue
     * @param {Number} alpha
     * @class Color
     */
    t.Color = Color = t.class('Color' , function (red , green , blue , alpha) {

        this.set(red , green , blue , alpha);

        this._palette = {};
    } , [] , /**@lends Color.prototype*/{

        set: function (red , green , blue , alpha) {

            if (t.isString(red)) {

                var data;

                if (!(data = Color.palet.get(red))) {
                    paletContext.fillStyle = red;
                    paletContext.fillRect(0 , 0 , 1 , 1);

                    data = paletContext.getImageData(0 , 0 , 1 , 1).data;

                    Color.palet.set(red , data);
                }


                this._red = data[0];
                this._green = data[1];
                this._blue = data[2];
                this._alpha = 1;

            } else if (t.isNumber(red) && green == null) {

                this._red = (red & 0xFF0000) >>> 16;
                this._green = (red & 0x00FF00) >>> 8;
                this._blue = (red & 0x0000FF) >>> 0;
                this._alpha = 1;

            } else if (red instanceof Color) {

                this._red = red._red;
                this._green = red._green;
                this._blue = red._blue;
                this._alpha = red._alpha;

            } else {

                this._red = red || 0;
                this._blue = blue || 0;
                this._green = green || 0;
                this._alpha = alpha == null ? 1 : alpha;

            }

            this._cache = false;

            return this;
        },

        /**
         * http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
         * @param {Number} value 0 - 100 negatif ise koyulaştırır, pozitifse rengi açar
         */
        shade: function (percent) {

            var val = 255;

            if (percent < 0) {
                percent *= -1;
                val = 0;
            }

            percent /= 100;

            this._red += (val - this._red) * percent;
            this._green += (val - this._green) * percent;
            this._blue += (val - this._blue) * percent;

            this._cache = false;
            return this;
        },

        /**
         * Rengi kaydeder
         * @param {String} name
         */
        save: function (name) {
            this._palette[name] = [this._red , this._green , this._blue , this._alpha];
            return this;
        },

        /**
         * Kaydedilmiş rengi uygular
         * @param {String} name
         */
        restore: function (name) {

            if (this._palette[name]) {
                Color.prototype.set.apply(this , this._palette[name]);
                this._cache = false;
            }

            return this;
        },

        /**
         *
         * @param {Number|Color|String|Hex} red
         * @param {Number} green
         * @param {Number} blue
         * @param {Number} alpha
         * @returns {boolean}
         */
        equals: function (red , green , blue , alpha) {

            var _temp = red instanceof Color ? red : _tempColor.set(red , green , blue , alpha);

            return !!(
            this._red == _temp._red
            && this._green == _temp._green
            && this._blue == _temp._blue
            && (alpha != null ? this._alpha == _temp._alpha : true)
            )

        },

        /**
         *
         */
        toString: function () {
            if (this._cache) {
                return this._cache;
            }

            return (this._cache = 'RGBA(' + this._red+ ',' + this._green + ',' + this._blue + ',' + this._alpha + ')');
        },

        toCanvas: function () {
            return this.toString();
        },

        /**
         *
         */
        clone: function () {
            var color = new Color(this._red , this._green , this._blue , this._alpha);
            color._palette = t.assign({} , this._palette);
            return color;
        }
    });



    t.assign(t.Color , {

        palet: {
            has: function (key) {
                return !!palet[key];
            },
            get: function (key) {
                return palet[key];
            },
            set: function (key , color) {
                palet[key] = color;
            }
        }

    });



    Object.defineProperties(t.Color.prototype , {

        red: {
            get: function () {
                return this._red
            },
            set: function (val) {
                this._red = val;
                this._cache = false;
            }
        },

        green: {
            get: function () {
                return this._green;
            },
            set: function (val) {
                this._green = val;
                this._cache = false;
            }
        },

        blue: {
            get: function () {
                return this._blue;
            },
            set: function (val) {
                this._blue = val;
                this._cache = false;
            }
        },

        alpha: {
            get: function () {
                return this._alpha;
            },
            set: function (val) {
                this._alpha = val;
                this._cache = false;
            }
        }

    });



    var _canvas = document.createElement('Canvas'),
        _tempColor = new Color,
        palet = {},
        paletContext;

    _canvas.width = 1;
    _canvas.height = 1;

    paletContext = _canvas.getContext('2d');

    /**
     * @name Color.prototype#red
     * @property {number} red Kırmızı Değeri
     */

    /**
     * @name Color.prototype#green
     * @property {number} green Yeşil Değeri
     */

    /**
     * @name Color.prototype#blue
     * @property {number} blue Mavi Değeri
     */


    /**
     * @name Color.prototype#alpha
     * @property {number} alpha Alpha değeri
     */
})();
// name:display.Drawing

var Drawing;

(function () {

    /**
     *
     * @class {Drawing}
     */
    Drawing = t.class('Drawing' , function (scene) {
        EventEmitter.call(this);

        this.scene = scene;
        
        this.context = scene.canvas.getContext();

        this.canvas = scene.canvas.getCanvas();

        this.group = scene.main;

        /**
         * Son render işleminin ne kadar zaman aldığı
         * @type {null}
         */
        this.lastRenderingTime = null;

        /**
         * Son Render (olaylarla beraber) işlem zamanı
         * @type {null}
         */
        this.lastProcessingTime = null;
    } , [EventEmitter] , {

        /**
         *
         */
        render: function () {
            var context = this.context,
                group = this.group,
                canvas = this.canvas,
                time , pTime;

            pTime = t.now();

            this.emit('render:begin');

            time = t.now();

            Drawing.clear(context , 0 , 0 , canvas.width , canvas.height);
            Drawing.renderGroup(context , group , new Attributes.Inheritance);

            this.lastRenderingTime = t.now() - time;

            this.emit('render');

            this.lastProcessingTime = t.now() - pTime;
        }




    });

    /**
     *
     * @memberof Drawing
     * @param {Context} context
     * @param {Element} element
     * @param {Attirbutes.Inheritance} inheritance
     */
    Drawing.renderElement = function (context , element , inheritance , drawingOrder) {
        if (!element.visible) return true;
        if (!element.draw) return false;
        !drawingOrder && (drawingOrder = 0);

        var m = element.getTSMatrix();

        context.save();
        context.beginPath();
        context.setTransform(m[0] , m[1] , m[2] , m[3] , m[4] , m[5]);

        element._drawingOrder = drawingOrder;
        element.applyAttributes(context , inheritance);
        element.draw(context);

        if (element.closed)
            context.closePath();

        if (element.stroke)
            context.stroke();

        if (element.stroke && element.fill) {
            context.shadowColor = 0;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;
        }

        if (element.fill)
            context.fill();

        context.restore();
        return true;
    };


    /**
     *
     * @memberof Drawing
     * @param {Context} context
     * @param {Element} element
     * @param {Attirbutes.Inheritance} inheritance
     */
    Drawing.renderGroup = function (context , group , inheritance , drawingOrder) {
        if (!group.visible || !group.getElementsLength()) return true;
        !drawingOrder && (drawingOrder = 0);

        var elements = group.getElements(),
            length = elements.length,
            i = 0,
            item;

        group._drawingOrder = drawingOrder;

        context.save();

        group.applyAttributes(context , inheritance);

        for ( ; i < length ; i++) {
            item = elements[i];
            if (item instanceof Group) {
                Drawing.renderGroup(context , item , new Attributes.Inheritance(inheritance) , ++drawingOrder);
            } else { // element
                Drawing.renderElement(context , item , inheritance , ++drawingOrder);
            }
        }

        context.restore();

        return true;
    }

    /**
     *
     * @param {Context} context
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    Drawing.clear = function (context , x , y , width , height) {
        context.clearRect(x , y, width , height);
    }

})();
// name:input.Input

var Input;

(function () {

    t.Input = Input = t.class('Input' , function () {

    });

})();
// name:input.Event
// require:input.Input


(function () {


    var _eventList = {};

    /**
     *
     * Tek Başına Çalışmaz
     * phrases - ifadeler
     * [capture] -> preventDefault
     * [alt] -> alt tuşuna basılımı
     * [shift] -> shift tuşuna basılımı
     * [ctrl] -> ctrl tuşuna basılımı
     *
     * opt.enable -> [true , false , func() , func()] dizi içeriği kontrol edilir
     * ve bir adet false sonuç varsa olaylar tetiklenmez
     * @class {t.Input.Event}
     */
    t.Input.Event = t.class('Event' , function (opt) {



        this._controller = opt.controller;
        this._query = opt._iq || new Input.Query(opt.query);

        var phrases = this._query.phrases;

        this.id = phrases.id ? 'u' + phrases.id.value :  t.gid();

        if (_eventList[this.id]) {
            throw new Error('event id must be unique');
        }

        _eventList[this.id] = this;

        /**
         * Olayın sahibi
         * @type {*}
         */
        this._owner = opt.owner;

        /**
         * Olayın etkinleştirme şartları
         * @type {*}
         */
        this.enable = opt.enable == null ? true : opt.enable;

        /**
         * Zincirleme için etkinmi
         */
        this._enable = false;


        /**
         * preventDefault
         * @type {boolean}
         * @private
         */
        this._capture = !!phrases.capture;

        /**
         * İstenen Özel Tuşlar
         * @type {{alt: boolean, shift: boolean, ctrl: boolean}}
         * @private
         */
        this._special = {
            alt: !!phrases.alt,
            shift: !!phrases.shift,
            ctrl: !!phrases.ctrl
        };


        this._controller.bind(this);
    } , [] , {/**@lends t.Input.Event.prototype */

        /**
         * Etkilenilen olaylar,
         * Başında * varsa global
         */
        _effectedEvents: [],

        /**
         * Etkileninlen olaylar çalışınca çalışacak
         */
        _handler: function () {},

        _eventHandler: function (event , global) {
            !event && (event = {});

            this.ehid = t.gid();

            this.originalEvent = event;

            this.altKey = event.altKey || false;
            this.ctrlKey = event.ctrlKey || false;
            this.shiftKey = event.shiftKey || false;

            this.global = global;
        },

        /**
         *
         */
        release: function () {},


        preventDefault: function () {
            this.originalEvent && this.originalEvent.preventDefault();
        },

        /**
         *
         * @returns {boolean}
         */
        checkEnable: function () {
            if (this.enable == null || this.enable === true)
                return true;

            var enable = t.isArray(this.enable) ? this.enable : [this.enable],
                i , item , state = true;

            for (i = 0 ;  i < enable.length ; i++) {
                item = enable[i];

                if ((t.isBool(item) && item === false) || (t.isFunction(item) && item() === false) || (t.isObject(item) && !item._enable)) {
                    state = false;
                    break;
                }

            }

            !state && this.release();

            return state;
        },

        /**
         *
         * @returns {boolean}
         */
        checkSpecielKeys: function () {
            var special = this._special;

            if (this.altKey == special.alt && this.shiftKey == special.shift && this.ctrlKey == special.ctrl) {
                return true;
            }

            return false;
        },

        /**
         *
         * @param callback
         */
        dispatch: function (callback , release) {
            callback && callback.call(this._owner , this , release);
        },


        remove: function () {
            return t.Input.Event.remove(this);
        }


    });


    /**
     * Olayı kaldırır
     * @param {String|t.Input.Event} id veya kendisi
     * @name t.Input.Event.remove
     * @memberof {t.Input.Event}
     */
    t.Input.Event.remove = function (event) {
        if (t.isString(event) || t.isNumber(event)) {
            if (_eventList['u' + event]) {
                event = _eventList['u' + event];
            } else {
                return false;
            }
        }

        if (_eventList[event.id]) {
            event._controller.unbind(event);
            delete _eventList[event.id];
            return true;
        }


        return false;
    };

    /**
     *
     * @param eventId
     */
    t.Input.Event.get = function (eventId) {
        return _eventList[eventId];
    };


})();
// name:input.Event.Pointer
// require:input.Input
// require:input.Event

var Pointer;

(function () {


    /**
     * Tek Başına Çalışmaz
     * phrases - ifadeler
     * [needle] -> Üstünde başka çizilmiş nesne dahi olsa olay tetiklenir
     * @class {t.Input.Event.Pointer}
     */
    t.Input.Event.Pointer = Pointer = t.Input.Event.extend('Pointer' , function (opt) {
        t.Input.Event.call(this , opt);

        var phrases = this._query.phrases;


        this._needle = !!phrases.needle;

        this._local = !!phrases.local;

    } , [] , {/**@lends t.Input.Event.Pointer.prototype */

        _handler: function (event , global , effected) {
            t.Input.Event.prototype._handler.call(this , event , global , effected);

            this.target = t.isArray(effected) ? effected[0] : effected;
            this.targets = effected;
            this.targetX = null;
            this.targetY = null;

        },
        
        _eventHandler: function (event , global) {
            !event && (event = {});

            t.Input.Event.prototype._eventHandler(event , global);
            
            this.offsetX = event.offsetX || event.layerX;
            this.offsetY = event.offsetY || event.layerY;

            this.pageX = event.clientX && event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft || 0);
            this.pageY = event.clientY && event.clientY + (document.documentElement.scrollTop || document.body.scrollTop || 0);

            if (this.target && this.target.getTSMatrix) {
                var p = this.target.getTSMatrix().clone().invert().point(this.offsetX , this.offsetY);

                this.targetX = p.x;
                this.targetY = p.y;

            }
        },

        _elementContainsPoint: function (owner , x , y , eid) {

            x = x != null ? x : this.offsetX;
            y = y != null ? y : this.offsetY;

            var etd = owner._etd;

            if (eid && eid == etd.id) return etd.result;

            etd.id = eid;
            etd.result = owner.inputBox.containsPoint(x , y) && owner;

            return etd.result;
        },

        _groupContainsPoint: function (group , result , x , y , eid) {
            var elements = group.getElements(),
                length = elements.length,
                i = 0,
                element;

            !result && (result = [])

            for ( ; i < length ; i++) {
                element = elements[i];

                if (element instanceof Element) {
                    this._elementContainsPoint(element , x , y , eid) && result.push(element)
                } else if (element instanceof Group) {
                    this._groupContainsPoint(element , result , x , y , eid);
                }

            }


            return result.length ? result : false;
        },

        /**
         * Event owner ı kapsamıyorsa false kapsıyorsa id si
         * @return {Boolean|Number}
         */
        ownerContainsPoint: function (x , y , eid) {
            var owner = this._owner;

            if (owner instanceof Element) {
                return this._elementContainsPoint(owner , x , y , eid);
            } else if (owner instanceof Group) {
                return this._groupContainsPoint(owner , null , x , y , eid);
            }

            return false;
        },

    });

    Pointer.ButtonCode = {
        LEFT: 1,
        MIDDLE: 2,
        RIGHT: 3
    };

})();
// name:input.Event.Pointer.Button
// require:input.Input
// require:input.Event
// require:input.Pointer

(function () {

    /**
     * phrases - ifadeler
     * [left] -> olaylar sadece sol tuşta etkileşim varsa çalışır
     * [right] -> olaylar sadece sağ tuşta etkileşim varsa çalışır
     * [middle] -> olaylar sadece orta tuşta etkileşim varsa çalışır
     * [strict] -> mouseup içinde özel tuşlar kontrol edilecekmi
     * [double] -> çift tık
     * @type {t.Input.Event.Pointer.Button}
     */
    t.Input.Event.Pointer.Button = t.Input.Event.Pointer.extend('Button' , function (opt) {
        t.Input.Event.Pointer.call(this , opt);


        /**
         * Butona basılınca
         */
        this.onDown = opt.onDown;

        /**
         * Buton salınınca
         */
        this.onUp = opt.onUp;

        var phrases = this._query.phrases,
            bc = t.Input.Event.Pointer.ButtonCode;

        /**
         *
         * @type {number}
         * @private
         */
        this._button = phrases.right ? bc.RIGHT : phrases.middle ? bc.MIDDLE : phrases.left ?  bc.LEFT : -1;

        /**
         * mouseup içinde özel tuşlar kontrol edilecekmi
         * @type {boolean}
         * @private
         */
        this._strict = !!phrases.strict;

        /**
         * çift tıklama
         * @type {boolean}
         * @private
         */
        this._doubleClick = !!phrases.double;


        this._dtime = t.now();

    } , [] , {

        _effectedEvents: ['mousedown' , '*mouseup' , 'mouseup' , 'contextmenu'],

        _handler: function (event , global , effected) {
            t.Input.Event.Pointer.prototype._handler.call(this , event , global , effected);

            this._eventHandler(event , global);

            var type = event.type,
                typeIsDown = type == 'mousedown',
                typeIsUp = type == 'mouseup',
                typeIsMenu = type = 'contextmenu',
                buttonCode = t.Input.Event.Pointer.ButtonCode,
                special = true,
                strict = this._strict,
                enable = this._enable;



            if (!global && this._capture && !typeIsMenu) {
                this.preventDefault();
            }


            if (typeIsMenu && this._capture && (buttonCode.RIGHT == this._button || this._button == -1)) {
                this.preventDefault();
            }

            if (typeIsDown || typeIsUp) {
                if (this.checkButtonCode()) {
                    if (typeIsDown || strict)
                        special = this.checkSpecielKeys();

                    if (typeIsDown && !enable) {
                        if (this.checkDoubleClick()) {
                            this._enable = true;
                            this.dispatch(this.onDown);
                        }
                    } else if (typeIsUp && enable) {
                        this._enable = false;
                        this.dispatch(this.onUp , global);
                    }

                }
            }

        },

        _eventHandler: function (event , global) {
            t.Input.Event.Pointer.prototype._eventHandler.call(this , event , global);

            this.type = event.type ? event.type == 'mousedown' ? 'down' : 'up' : null;
            this.which = event.which;
        },

        /**
         *
         * @returns {boolean}
         */
        checkButtonCode: function () {
            if (this._button == -1 || this._button == this.which) {
                return true;
            }

            return false;
        },

        /**
         *
         * @returns {boolean}
         */
        checkDoubleClick: function () {
            if (!this._doubleClick) return true;
            if (t.now() - this._dtime < 500) {
                this._dtime = t.now();
                return true;
            }
            this._dtime = t.now();
            return false;
        },

        /**
         *
         */
        release: function () {
            if (this._enable) {
                this._enable = false;
                this.dispatch(this.onUp , true);
            }
        },

        /**
         * Butuna Basılımı
         * @return {Boolean}
         */
        isPressed: function () {
            return this._enable;
        }

    });

})();
// name:input.Controller
// require:input.Input
// require:input.Pointer

(function () {

    /**
     *
     * @class {Input.Controller}
     */
    t.Input.Controller = t.Input.extend('Controller' , function (scene) {

        this.scene = scene;

        this._htmlElement = scene.canvas.getCanvas();


        this._events = {};

        this._blocked = false;

        this._lastEvent = false;

        var self = this;

        this.__eventDistributor = function (e) {
            self._eventDistributor(e);
        };

    } , [] , {/**@lends t.Input.Controller.prototype */

        /**
         * Olayı  kontrolcüye bağlar
         * @param {t.Input.Event} iEvent
         */
        bind: function (iEvent) {
            if (!iEvent._binding) {

                var efEvents = iEvent._effectedEvents,
                    events = this._events,
                    length = efEvents.length,
                    i = 0,
                    eName , name , global;


                iEvent._binding = this;

                for ( ; i < length ; i++) {
                    eName = efEvents[i];
                    name = eName[0] == '*' ? eName.slice(1) : eName;
                    global = eName != name;

                    if (eName[0] == '-') {

                        eName = name = eName.slice(1);
                        !iEvent._localEvent && (iEvent._localEvent = []);
                        iEvent._localEvent.push(name);
                    }

                    if (!events[eName]) {
                        events[eName] = [];
                        this._attach(name , global);
                    }

                    events[eName].push(iEvent);
                }


            }
        },

        /**
         *
         * @param {t.Input.Event} iEvent
         */
        unbind: function (iEvent) {
            if (iEvent._binding == this) {
                var events = this._events,
                    eName , index , global;

                for (eName in events) {


                    if ((index = events[eName].indexOf(iEvent)) > -1) {
                        events[eName].splice(index , 1);

                        if (!events[eName].length) {
                            global = eName[0] == '*';
                            this._detach(global ? eName.slice(1) : eName , global);
                            delete events[eName];
                        }

                    }

                }

                iEvent._binding = null;
            }
        },



        /**
         *
         * @param e
         * @private
         */
        _eventDistributor: function (event) {

            if (!this._blocked) {

                var htmlElement = this._htmlElement,
                    eType = event.type,
                    effected = false,
                    eventId = t.gid(),
                    global , eName, events , i , j , iEvent,
                    result , temp , x , y , _max , item,
                    order , parent , elements , success,
                    localEvent;



                global = event == this._lastEvent || event.target != this._htmlElement;
                eName = global ? '*' + eType : eType;
                events = this._events[eName];


                if (events) {

                    events.sort(function (a , b) {
                        return b._owner._drawingOrder || 0 - a._owner._drawingOrder || 0;
                    });


                    x = event.offsetX || event.layerX;
                    y = event.offsetY || event.layerY;


                    for ( i = 0 ; i < events.length ; i++) {
                        iEvent = events[i];
                        temp = null;
                        localEvent = null;


                        if (global || iEvent instanceof t.Input.Event.Key) {
                            iEvent.checkEnable() && iEvent._handler(event , global);
                        } else if (iEvent instanceof t.Input.Event.Pointer) {

                            localEvent = (iEvent._localEvent && iEvent._localEvent.indexOf(eType) > -1) || iEvent._local;


                            //if (!effected || (effected && iEvent._needle) || localEvent)
                                temp = iEvent.ownerContainsPoint(x , y , eventId);

                            if (temp) {

                                if (!t.isArray(temp))
                                    temp = [temp];

                                if (temp.length > 1) {
                                    temp.sort(function (a , b) {
                                        return b._drawingOrder || 0 - a._drawingOrder || 0;
                                    });
                                }


                                if (iEvent._needle) {
                                    !localEvent && iEvent.checkEnable() && iEvent._handler(event , global , temp);
                                //} else if (!effected) {
                                } else {

                                    // hep sağa bak
                                    item = temp[0]; // en son çizilen
                                    parent = item._parent;
                                    order = item._order;
                                    result = true;

                                    while (parent) {
                                        elements = parent.getElements();
                                        for (j = order + 1 ; j < elements.length ; j++) {

                                            if (elements[j].inputVisible) {
                                                if (elements[j] instanceof Group) {
                                                    if (Pointer.prototype._groupContainsPoint(elements[j] , null , x , y , eventId)) {
                                                        result = false;
                                                        break;
                                                    }
                                                } else if (elements[j].inputBox.containsPoint(x , y)) {
                                                    result = false;
                                                    break;
                                                }
                                            }


                                        }

                                        parent = parent._parent;
                                        order = parent && parent._order;
                                    }

                                    if (result) { // işlem tamam bulundu ve tetiklendi
                                        success = item;
                                        !localEvent && iEvent.checkEnable() && iEvent._handler(event , global , temp);
                                    }

                                }

                                effected = true;
                            }


                            if (localEvent) {
                                iEvent.checkEnable() && iEvent._handler(event , global , temp , result);
                            }

                        }

                    }

                }



            }

            this._lastEvent = event;
        },

        /**
         *
         * @private
         */
        _attach: function (name , global) {
            (global ? window : this._htmlElement).addEventListener(name , this.__eventDistributor);
        },

        /**
         *
         * @private
         */
        _detach: function (name , global) {
            (global ? window : this._htmlElement).removeEventListener(name , this.__eventDistributor);
        }

    });

})();
// name:input.Event.Pointer.Enter


(function () {

    /**
     *
     * @type {t.Input.Event.Pointer.Enter}
     */
    t.Input.Event.Pointer.Enter = t.Input.Event.Pointer.extend('Enter' , function (opt) {
        t.Input.Event.Pointer.call(this , opt);

        /**
         *
         */
        this.onEnter = opt.onEnter;

        /**
         *
         */
        this.onLeave = opt.onLeave;


        this._entered = [];

    } , [] , {
        _effectedEvents: ['-mousemove'],


        _handler: function (event , global , effected , result) {

            t.Input.Event.Pointer.prototype._handler.call(this , event , global , effected);

            this._eventHandler(event , global , effected);
            this._capture && this.preventDefault();

            var changed = false,
                entered = this._entered,
                targets = !this._needle ? this.target ? [this.target] : [] : this.targets ? this.targets.slice() : [],
                i = 0,
                item , index;


            if (!this._needle && !result && effected) {
                targets = [];
            }


            for ( ; i < entered.length ; i++) {
                item = entered[i];
                if ((index = targets.indexOf(item)) < 0) {
                    entered.splice(i-- , 1);
                    this.target = item;
                    this.dispatch(this.onLeave);
                } else {
                    targets.splice(index , 1);
                }
            }


            if (targets && targets.length) {
                for (i = 0 ; i < targets.length; i++) {
                    this.target = targets[i];
                    entered.push(this.target);
                    this.dispatch(this.onEnter);
                }
            }

            this._enable = this.isEntered();
        },

        release: function () {
            if (this.isEntered()) {
                var entered = this._entered;
                for (var i = 0 ; i < entered.length;i++) {
                    this.target = entered[i];
                    entered.splice(i-- , 1);
                    this.dispatch(this.onLeave , true);
                }
            } 
        },

        _eventHandler: function (event , global) {
            t.Input.Event.Pointer.prototype._eventHandler.call(this , event , global);

            this.type = 'move';
        },

        /**
         *
         * @param {Element=} element
         * @returns {boolean}
         */
        isEntered: function (element) {
            if (!element) {
                return !!this._entered.length;
            }
            return this._entered.indexOf(element) > -1;
        }

    });

})();
// name:input.Key

(function () {

    /**
     * phrases - ifadeler
     * [key=A] -> tekli tuş
     * [key=A|B] -> çoklu tuş
     * [key=UP|W]
     * [key=DOWN|S]
     * [key=LEFT|A]
     * [key=RIGHT|D]
     * [strict] -> tuş salınıncada özel tuşları kontrol eder
     * @class {t.Input.Event.Key}
     */
    t.Input.Event.Key = t.Input.Event.extend('Key' , function (opt) {
        t.Input.Event.call(this , opt);

        /**
         * Tuşa basılınca
         * @type {Function}
         */
        this.onDown = opt.onDown;

        /**
         * Tuş salınınca
         * @type {Function}
         */
        this.onUp = opt.onUp;

        /**
         * Kabul edilebilcek tuşlar
         * @type {Array}
         * @private
         */
        this._keys = [];

        var phrases = this._query.phrases;


        this._strict = !!phrases.strict;

        if (phrases.key) {
            var phrase = phrases.key,
                keys = phrase.value ? phrase.value.split('|') : false,
                keyCode = Input.Event.Key.KeyCode,
                key;

            if (keys) {
                for (var i = 0 ; i < keys.length ; i++) {
                    key = keys[i];
                    if (!keyCode[key]) {
                        throw new Error('keyCode for ' + key + ' not found');
                    }
                    this._keys.push(keyCode[key]);
                }
            }

        }

    } , [] , {

        _effectedEvents: ['*keydown' , '*keyup'],


        _handler: function (event , global) {
            t.Input.Event.prototype._handler.call(this , event , global);

            this._eventHandler(event , global);

            var type = event.type,
                typeIsDown = type == 'keydown',
                enable = this._enable,
                strict = this._strict,
                special = true,
                capture = this._capture;


            if (this.checkKeyCode()) {
                if (typeIsDown || strict)
                    special = this.checkSpecielKeys();

                if (special) {
                    this.preventDefault();
                    if (!enable && typeIsDown) {
                        this.dispatch(this.onDown);
                        this._enable = true;
                    } else if (enable && !typeIsDown) {
                        this.dispatch(this.onUp);
                        this._enable = false;
                    }

                }

            }

            this._eventHandler(event , global);
        },

        _eventHandler: function (event , global) {
            t.Input.Event.prototype._eventHandler.call(this , event , global);

            this.type = event.type ? event.type == 'keydown' ? 'down' : 'up' : null;
            this.keyCode = event.keyCode;
        },

        checkKeyCode: function () {
            var keys = this._keys,
                code = this.keyCode;
            return keys.indexOf(code) > -1;
        },

        /**
         *
         * @returns {boolean}
         */
        isPressed: function () {
            return this._enable;
        }


    });

    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode

    var KeyCode = t.Input.Event.Key.KeyCode = {};

    var code = 0,
        words = ['ZERO' , 'ONE' , 'TWO' , 'THREE' , 'FOUR' , 'FIVE' , 'SIX' , 'SEVEN' , 'EIGHT' , 'NINE'];

    //harfler
    for (code = 65 ; code < 91 ; code++) {
        KeyCode[String.fromCharCode(code)] = code;
    }

    //rakamlar
    for (code = 48 ; code < 58 ; code++) {
        KeyCode[words[code - 48]] = code;
    }

    //numpad rakamları
    for (code = 96 ; code < 105 ; code++) {
        KeyCode['NP_' + words[code - 96]] = code;
    }

    //f tuşları
    for (code = 112 ; code < 124 ; code++) {
        KeyCode['F' + (code - 111)] = code;
    }

    // diğer tuşlar
    Util.assign(KeyCode , {
        ENTER: 13,
        SPACE: 32,
        TAB: 9,
        DELETE: 46,
        END: 35,
        ESCAPE: 27,
        NUMLOCK: 144,

        //yön tuşları
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,

        //special
        SHIFT: 16,
        CONTROL: 17,
        ALT: 18
    });

})();
// name:input.Manager


(function () {

    Input.Manager = Input.extend('Manager' , function () {
        Input.call(this);

        // event Test Data
        this._etd = {id: 0 , result: 0};

        this.inputVisible = true;
    } , {


        input: function (query , opt) {
            !opt && (opt = {});

            query = new Input.Query(query);

            opt.controller = this.scene.inputController;
            opt.owner = this;
            opt._iq = query;
            
            switch (query.name) {
                case 'wheel':
                    return new Input.Event.Pointer.Wheel(opt);
                case 'button':
                    return new Input.Event.Pointer.Button(opt);
                case 'move':
                    return new Input.Event.Pointer.Move(opt);
                case 'key':
                    return new Input.Event.Key(opt);
                case 'enter':
                    return new Input.Event.Pointer.Enter(opt);
            }

        },

        inputOff: function (event) {
            return Input.Event.remove(event);
        },

        /**
         *
         * @param {Boolean} elByEl Grublarda ayrı ayrımı birlikte sürükleceğimi
         * @param {String} phrases Kaydırma işlemi için şartlar [double][right] çift tıklamada ve sağ clickte kaydırma
         * @returns {Input.Event.Button}
         */
        enableDrag: function (elByEl , phrases) {
            if (this._enableDrag) return true;

            var id = this.id;

            this._enableDrag = new V;

            !phrases && (phrases = '')

            this.input('move[local][id=' + (id + 'move') + ']' , {
                onMove: function (e) {
                    if (!this._enableDrag.drag) return;
                    var x = e.offsetX,
                        y = e.offsetY,
                        dOffset = this._enableDrag,
                        ts = ((dOffset.target._boundTS ? dOffset.target._boundTS : dOffset.target) || this).getTSMatrix().clone().invert(),
                        p = ts.point(x, y);

                    dOffset.target.offset.set(p.x - dOffset.x, p.y - dOffset.y);

                    this.emit('drag' , dOffset.target);
                }
            });

            return this.input('button' + phrases + '[id=' + (id + 'button') + ']' , {
                onDown: function (e) {
                    var dOffset = this._enableDrag;
                    dOffset.drag = true;
                    dOffset.target = elByEl ? e.target || this : this;

                    if (this instanceof Element || elByEl) {
                        dOffset.set(e.targetX , e.targetY);
                    } else {
                        var p = this.getTSMatrix().clone().invert().point(e.offsetX , e.offsetY);
                        dOffset.set(p.x , p.y);
                    }

                    this.emit('drag:start');
                },
                onUp: function () {
                    this._enableDrag.drag = false;
                    this.emit('drag:end');
                }
            });
        },

        disableDrag: function () {
            if (!this._enableDrag) return true;
            var id = this.id;
            this.inputOff(id + 'move');
            this.inputOff(id + 'button');
            this._enableDrag = null;
        }

    });

})();
// name:input.Event.Pointer.Move


(function () {

    /**
     *
     * @type {t.Input.Event.Pointer.Move}
     */
    t.Input.Event.Pointer.Move = t.Input.Event.Pointer.extend('Move' , function (opt) {
        t.Input.Event.Pointer.call(this , opt);

        /**
         *
         */
        this.onMove = opt.onMove;

    } , [] , {
        _effectedEvents: ['mousemove'],

        _handler: function (event , global , effected) {
            t.Input.Event.Pointer.prototype._handler.call(this , event , global , effected);

            this._eventHandler(event , global , effected);
            this._capture && this.preventDefault();

            this.dispatch(this.onMove);
        },

        _eventHandler: function (event , global) {
            t.Input.Event.Pointer.prototype._eventHandler.call(this , event , global);

            this.type = 'move';
        }

    });

})();
// name:input.Query
// require:input.Input
(function () {

    t.Input.Query = t.Input.extend('Query' , function (query) {
        var index = query.indexOf('['),
            temp;

        this.key = query.slice(0 , index < 0 ? void 0 : index);

        this.phrases = {};

        // name.property
        temp = this.key.split('.');

        if (temp[1]) {
            this.property = temp[1];
        }

        this.name = temp[0];

        if (index > -1) {
            Input.Query.REGEXP.lastIndex = 0;
            while (temp = Input.Query.REGEXP.exec(query)) {

                this.phrases[temp[1]] = {
                    target: null,
                    operator: null,
                    value: temp[3]
                };

                if (temp[2].length > 1) {
                    this.phrases[temp[1]].target = temp[2][0];
                    this.phrases[temp[1]].operator = temp[2][1];
                } else {
                    this.phrases[temp[1]].operator = temp[2] || null;
                }

            }
        }
    });


    /**
     * pointer.down[needle][event][key=value]
     * Yapısı ayıklamak için
     * @type {RegExp}
     */
    t.Input.Query.REGEXP = new RegExp("\\[([^\\]=\?]+)([=\?]{0,2})(.*?)\\]" , "ig");

})();
// name:input.Event.Pointer.Button
// require:input.Input
// require:input.Event
// require:input.Pointer


(function () {

    var _wheelType = t.getWheelType();

    /**
     *
     * @type {t.Input.Event.Pointer.Wheel}
     */
    t.Input.Event.Pointer.Wheel = t.Input.Event.Pointer.extend('Wheel' , function (opt) {
        t.Input.Event.Pointer.call(this , opt);

        /**
         *
         */
        this.onWheel = opt.onWheel;

    } , [] , {
        _effectedEvents: [_wheelType],

        _handler: function (event , global , effected) {
            t.Input.Event.Pointer.prototype._handler.call(this , event , global , effected);

            this._eventHandler(event , global , effected);
            if (!this.checkSpecielKeys()) return;
            this._capture && this.preventDefault();
            this.dispatch(this.onWheel);
        },

        _eventHandler: function (event , global) {
            t.Input.Event.Pointer.prototype._eventHandler.call(this , event , global);

            // https://developer.mozilla.org/en-US/docs/Web/Events/wheel

            this.type = 'wheel';
            this.deltaY = event.deltaY;
            this.deltaX = 0;
            this.deltaZ = 0;


            if (_wheelType != 'wheel') {
                if (_wheelType == "mousewheel") {
                    this.deltaY = - 1/40 * event.wheelDelta;
                    event.wheelDeltaX && ( this.deltaX = - 1/40 * event.wheelDeltaX );
                } else {
                    this.deltaY = event.detail;
                }
            }
        }

    });

})();
// name:items.Creator
// require:item.Polygon
// require:item.Group

(function () {

    t.Creator = t.class('Creator' , function (scene , group) {
        this.scene = scene;
        this._group = group;
    } , {
        polygon: function (opt) {
            return this._group.addItem(new Element.Polygon(this.scene , opt));
        },
        group: function () {
            return this._group.addItem(new Group(this.scene));
        },
        text: function (opt) {
            return this._group.addItem(new Element.Text(this.scene , opt));
        }
    })

})();
// name:shape.Shape

var Shape;

(function () {

    /**
     *
     * @class {Shape}
     */
    t.Shape = Shape = t.class('Shape' , function (opt) {
        Transformation.call(this , opt || {});

        /**
         * Zorunlu
         * @type {Bounds}
         */
        this.bounds = new Bounds;

        if (this.containsPoint == Shape.prototype.containsPoint) {
            t.warn('this.containsPoint == Shape.prototype.containsPoint');
        }

        if (this.clone == Shape.prototype.clone) {
            t.warn('this.clone == Shape.prototype.clone');
        }

    } , [Transformation] , {

        // zorunlu
        containsPoint: function (x , y , without) {},
        clone: function () {}

    });

})();
// name:shape.Polygon
// require:core.Transformation
// require:shape.Shape


var Polygon;

(function () {

    /**
     * Çokgen
     * @param {Array} points [5,5 , 10,10 , 11,11] sıralı
     * @class {Polygon}
     */
    t.Polygon = Polygon = t.Shape.extend('Polygon' , function (points , opt) {

        Shape.call(this , opt);



        /**
         * Sıralı ikili şeklinde tutulacak
         * x,y , x,y
         * @type {Array}
         * @private
         */
        this._points = new Points;

        /**
         * Transformation uygulanmış noktalar
         * @type {Array}
         * @private
         */
        this._tPoints = new Points;


        this._tsuid = -1;

        if (points && points.getPoints)
            points = points.getPoints();

        if (t.isArray(points)) {
            for (var i = 0 ; i < points.length ; i+=2) {
                this.addPoint(points[i] , points[i + 1]);
            }
        }

    } , [] , /**@lends Polygon.prototype*/{

        clone: function () {
            var pl = new Polygon;
            Transformation.call(pl , this);
            pl._points = this._points.clone();
            pl._tPoints = this._tPoints.clone();
            pl.bounds.handleArray(pl.getTransformedPoints() , true);
            return pl;
        },

        /**
         *
         * @returns {*}
         */
        getPoints: function () {
            return this._points.getPoints();
        },

        /**
         *
         * @returns {*}
         */
        getTransformedPoints: function () {

            var _matrix = this.getTSMatrix(),
                _tps = this._tPoints.getPoints();

            if (this._tsuid != _matrix.id) {
                this._tPoints.transform(_matrix , null , this._points.getPoints());
                this.bounds.handleArray(_tps , true);
                this._tsuid = _matrix.id;
            }

            return _tps;
        },


        /**
         * Nokta sayısını döndürür
         * @returns {number}
         */
        getPointsLength: function () {
            return this._points.getLength() / 2;
        },

        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} [index=0]
         * @returns {Polygon}
         */
        addPoint: function (x , y , index) {

            var points = this._points,
                tPoints = this._tPoints,
                matrix = this.getTSMatrix(),
                list = tPoints.getPoints();

            points.add(x , y , index);

            tPoints.add(x , y , index);

            if (index == null) {
                index = tPoints.getLastIndex();
            }

            tPoints.transform(matrix , index);

            this.bounds.handle(list[index * 2] , list[index * 2 + 1]);

            return this;
        },

        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} [index=0] Belirtilen index ten itibaren aramaya başlar
         * @return {number|boolean} Bulunursa index sini yoksa false döndürür
         */
        searchPoint: function (x , y , index) {
            return this._points.search(x , y , index);
        },


        /**
         * Transformed noktalarda arama yapar
         * @param {number} x
         * @param {number} y
         * @param {number} [index=0] Belirtilen index ten itibaren aramaya başlar
         * @return {number|boolean} Bulunursa index sini yoksa false döndürür
         */
        searchTransformedPoint: function (x , y , index) {
            this.getTransformedPoints(); // değişilik varsa uygulasın diye
            return this._tPoints.search(x , y , index);
        },

        /**
         *
         * @param {number} index
         */
        delete: function (index) {
            this._points.delete(index);
            this._tPoints.delete(index);
            this.bounds.handleArray(this.getTransformedPoints() , true);
        },

        /**
         *
         * @param {number} index
         * @param {Vector=} vector Gönderilerse noktayı bu vektöre yazar
         */
        getPoint: function (index , vector) {
            return this._points.get(index , vector);
        },

        /**
         *
         * @param {number} index
         * @param {Vector=} vector Gönderilerse noktayı bu vektöre yazar
         */
        getTransformedPoint: function (index , vector) {
            return this._tPoints.get(index , vector);
        },


        /**
         *
         * @param {number} x
         * @param {number} y
         * @param {number} index
         */
        setPoint: function (x , y , index) {
            this._points.set(x , y , index);
            this._tPoints.set(x , y , index);
            this._tPoints.transform(this.getTSMatrix() , index);
            this.bounds.handleArray(this.getTransformedPoints() , true);
            return this;
        },

        /**
         * Çokgenin belirtilen noktayı içerip içermediğini konrol eder
         * @param {number} x
         * @param {number} y
         * @param {boolean} without True ise ts uygulanmamış noktalara göre sonuç döndürür
         */
        containsPoint: function (x , y , without) {



            if (this.getTransformedPoints() && !this.bounds.containsPoint(x , y)) {
                return false;
            }


            var points = without ? this.getPoints() : this.getTransformedPoints(),
                length = points.length,
                inside = false,
                i , j,
                pix, piy, pjx, pjy;


            // https://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
            for (i = 0 , j = length - 2 ; i < length ; j = i , i+=2) {
                pix = points[i];
                piy = points[i + 1];
                pjx = points[j];
                pjy = points[j + 1];

                if (((piy > y) != (pjy > y)) && (x < (pjx - pix) * (y - piy) / (pjy - piy) + pix)) {
                    inside = !inside;
                }

            }

            return inside;

        }

    });


})();
// name:shape.ShapeBox
// require:shape.Shape
// require:core.Bounds


var ShapeBox;

(function () {

    /**
     *
     * @class {ShapeBox}
     */
    t.ShapeBox = ShapeBox = t.class('ShapeBox' , function (game) {

        this.game = game;//lazım olursa

        /**
         *
         * @type {Array}
         * @private
         */
        this._shapes = [];

        /**
         *
         */
        this.bounds = new ShapeBoxBounds(this);

    } , [] , {

        /**
         *
         * @returns {Array}
         */
        getShapes: function () {
            return this._shapes;
        },

        /**
         *
         * @returns {Number}
         */
        getShapesLength: function () {
            return this._shapes.length;
        },

        /**
         * Shape ekli ise indis numarasını deilse false  döndürür
         * @param shape
         * @returns {boolean|number}
         */
        has: function (shape) {
            var i = this._shapes.indexOf(shape);
            return i < 0 ? false : i;
        },

        /**
         * Shape i ekler
         * @param shape
         */
        add: function (shape) {
            if (shape instanceof Shape && !this.has(shape)) {
                this._shapes.push(shape);
            }
        },

        /**
         * Belirtilen Shape i  kaldırır
         * @param shape
         */
        remove: function (shape) {
            var i = this.has(shape);
            if (i) {
                this._shapes.splice(i , 1);
            }
        },

        //zorunlu fonksiyon atamaları

        bindTS: function (ts) {
            var shapes = this._shapes,
                i = shapes.length;

            if (i) {

                if (i == 1) {
                    shapes[0].bindTS(ts);
                } else {
                    while (i--) {
                        shapes[i].bindTS(ts);
                    }
                }

            }

        },

        /**
         *
         * @param x
         * @param y
         * @param without
         */
        containsPoint: function (x , y , without) {
            var shapes = this._shapes,
                i = shapes.length;

            if (i) {
                if (i == 1) {
                    return shapes[0].containsPoint(x , y , without);
                } else {
                    while (i--) {
                        if (shapes[i].containsPoint(x , y , without)) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

    });

    var ShapeBoxBounds = t.Bounds.extend('ShapeBoxBounds' , function (shapebox) {

        this.shapebox = shapebox;

    } , {


        /**
         * Noktanın sınırlar içerisinde kalıp kalmadığını kontrol eder.(çok ağır çalışır önerilmez)
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         */
        containsPoint: function (x , y) {

            if (x < this.x || x > this.mx || y < this.y  || y > this.my) {
                return false;
            }

            return true;

        },


        //bypass

        calcSize: function () {},
        reset: function () {},
        handle: function () {},
        handleArray: function () {}
    });

    Object.defineProperties(ShapeBoxBounds.prototype , {

        x: {
            get: function () {
                var shapebox = this.shapebox,
                    shapes = shapebox.getShapes(),
                    i = shapes.length;

                if (i) {
                    if (i == 1) {
                        return shapes[0].bounds.x;
                    } else {

                        var x = Infinity;

                        while (i--) {
                            if (shapes[i].bounds.x < x)
                                x = shapes[i].bounds.x;

                        }

                        return x;
                    }

                }


                return -Infinity;
            },
            set: function () {}
        },

        y: {
            get: function () {
                var shapebox = this.shapebox,
                    shapes = shapebox.getShapes(),
                    i = shapes.length;

                if (i) {
                    if (i == 1) {
                        return shapes[0].bounds.y;
                    } else {

                        var y = Infinity;

                        while (i--) {
                            if (shapes[i].bounds.y < y)
                                y = shapes[i].bounds.y;

                        }

                        return y;
                    }

                }


                return -Infinity;
            },
            set: function () {}
        },

        mx: {
            get: function () {
                var shapebox = this.shapebox,
                    shapes = shapebox.getShapes(),
                    i = shapes.length;

                if (i) {
                    if (i == 1) {
                        return shapes[0].bounds.mx;
                    } else {

                        var x = -Infinity;

                        while (i--) {
                            if (shapes[i].bounds.mx > x)
                                x = shapes[i].bounds.mx;

                        }

                        return x;
                    }

                }


                return Infinity;
            },
            set: function () {}
        },

        my: {
            get: function () {
                var shapebox = this.shapebox,
                    shapes = shapebox.getShapes(),
                    i = shapes.length;

                if (i) {
                    if (i == 1) {
                        return shapes[0].bounds.my;
                    } else {

                        var y = -Infinity;

                        while (i--) {
                            if (shapes[i].bounds.my > y)
                                y = shapes[i].bounds.my;

                        }

                        return y;
                    }

                }


                return Infinity;
            },
            set: function () {}
        },

        width: {
            get: function () {
                return this.mx - this.x;
            },
            set: function () {}
        },

        height: {
            get: function () {
                return this.my - this.y;
            },
            set: function () {}
        }

    })

})();
// name:items.Item
// require:input.Manager



var Item;

(function () {

    t.Item = Item = t.class('Item' , function (scene) {
        EventEmitter.call(this);
        Input.Manager.call(this);

        this.scene = scene;

        this._parent = null;

        this.id = t.gid();

        this._order = null;

        this._drawingOrder = null;

    } , [EventEmitter , Input.Manager] , {
        
    });

})();

// name:items.Element
// require:core.EventEmitter
// require:core.Transformation
// require:core.Scene
// require:shape.Polygon
// require:shape.ShapeBox
// require:items.Item

var Element;

(function () {

    t.Element = Element = t.Item.extend('Element' , function (scene , opt) {
        Item.call(this , scene);

        !opt && (opt = {});

        Attributes.call(this , Attributes.ELEMENT , opt);


        //this.inputBox = new t.ShapeBox(scene);
        //this.collisonBox = new t.ShapeBox(scene);

        this.inputBox = this;
        this.collisonBox = this;


    } , [Attributes] , /**@lends Element.prototype*/{

        // zorunlu
        draw: function () {},
        clone: function () {},
        containsPoint: function () {return false}


    });


})();
// name:items.Group
// require:core.Scene
// require:items.Element
// require:items.Item
// require:core.EventEmitter

var Group;

(function () {

    /**
     *
     * @class Group
     * @param {Scene}
     */
    t.Group = Group = t.Item.extend('Group' , function (scene) {
        Item.call(this , scene);

        Transformation.call(this)
        Attributes.call(this , Attributes.GROUP);

        
        this._elements = [];

        this.add = new t.Creator(scene , this);

    } , [Transformation , Attributes] , /**@lends Group.prototype*/{

        /**
         * 
         * @returns {Array}
         */
        getElements: function () {
            return this._elements;
        },

        /**
         *
         * @returns {Number}
         */
        getElementsLength: function () {
            return this._elements.length;
        },

        /**
         * Ekli Olup Olmadığına Bakar
         * @param {Element|Group} element
         * @return {Boolean|Number} Varsa indisi yoksa false
         */
        has: function (element , index) {

            var index = 0;

            if ((index = this._elements.indexOf(element)) >= 0) {
                return index;
            }

            return false
        },

        /**
         * Gruba yeni eleman ekler
         * @param element
         * @param index
         */
        addItem: function (element , index) {
            if (this.has(element) !== false || !((element instanceof Element) || (element instanceof Group)) || element._parent) {
                return false
            }

            var length = this.getElementsLength(),
                elements = this._elements;

            
            index != null ? elements.splice(index , 0 , element) : elements.push(element);
            element._parent = this;

            //position
            element.bindTS(this);

            element._order = index != null ? index : length;
            element._drawingOrder = null;

            this.emit('elementAdded' , element , index != null ? index : length);

            return element
        },

        /**
         * Grubdan belirtilen elamanı kaldırır
         * @param element
         * @returns {Boolean|Group}
         */
        removeItem: function (element) {
            var elements = this._elements,
                index;

            if ((index = this.has(element)) === false) {
                return false
            }

            elements.splice(index , 1);
            element._parent = null;
            element.bindTS();
            element.disableDrag();
            this.emit('elementRemoved' , element , index);

            return this
        }

    });

    /**
     * Gruba yeni eleman eklenince
     * @event Group#addedElement
     * @param {Element} element Eklenen eleman
     * @param {number} index Eklenen elemanın indis numarası
     */

    /**
     * Grubdan eleman kaldırılınca
     * @event Group#removedElement
     * @param {Element} element Eklenen eleman
     * @param {number} index Eklenen elemanın indis numarası
     */


})();
// name:shape.Rectangle
// require:shape.Polygon

var Rectangle;

(function () {

    /**
     * Dikdörtgen
     * x,y  değerleri dikdörtgenin offsetini değiştirir
     * @class {Rectangle}
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    t.Rectangle = Rectangle = t.Polygon.extend('Rectangle' , function (x , y , width , height) {

        x = x || 0;
        y = y || 0;
        width = width || 100;
        height = height || 100;

        t.Polygon.call(this , [0,0 , width,0 , width,height , 0,height]);

        this.offset.set(x , y);
    } , [] , {

        clone: function () {
            return new Rectangle(this.x , this.y , this.width , this.height);
        }


    });

    Object.defineProperties(t.Rectangle.prototype , /**@lends Rectangle.prototype*/{
        x: {
            get: function () {
                return this.offset.x;
            },
            set: function (x) {
                this.offset.x = x;
            }
        },
        y: {
            get: function () {
                return this.offset.y;
            },
            set: function (y) {
                this.offset.y = y;
            }
        },
        width: {
            get: function () {
                return this.getPoints()[2];
            },
            set: function (width) {
                this.setPoint(width , 0 , 1);
                this.setPoint(width , this.getPoints()[5] , 2);
            }
        },
        height: {
            get: function () {
                return this.getPoints()[5];
            },
            set: function (height) {
                this.setPoint(this.getPoints()[4] , height , 2);
                this.setPoint(0 , height , 3);
            }
        }
    });

})();
// name:items.Image
// require:items.Element
// require:shape.Rectangle




(function () {

    t.Element.Image = t.Element.extend('Image' , function (game , opt) {
        Element.call(this , game , opt);


        Rectangle.call(this);



    } , [Rectangle] , {



    });

})();
// name:items.Polygon
// require:shape.Polygon
// require:items.Element

(function () {

    t.Element.Polygon = t.Element.extend('Polygon' , function (scene , opt) {
        Element.call(this , scene , opt);
        Polygon.call(this , opt && opt.points , opt);
        
    } , [Polygon] , {

        clone: function () {
            return new Element.Polygon(this);
        },

        draw: function (context) {
            if (this.getPointsLength()) {

                var points = this.getPoints(),
                    length = points.length,
                    i = 2;

                context.moveTo(points[0] , points[1]);

                while (i < length) {
                    context.lineTo(points[i++] , points[i++]);
                }

            }
        }

    });

})();
// name:items.Text
// require:items.Element

(function () {

    Element.Text = Element.extend('Text' , function (scene , opt) {
        Transformation.call(this , opt);
        Element.call(this , scene, opt);


        this.baseLine = opt.baseLine || 'top';
        this.font = opt.font || '14px Arial, Helvetica, sans-serif';

        this.setText(opt.text || opt._text || '');


        this.inputVisible = false;
    }, [Transformation] , {

        clone: function () {
            return new Element.Text(this);
        },

        draw: function (context) {
            context.textBaseline = this.baseLine;
            context.font = this.font;
            if (this.fill) {
                context.fillText(this._text , 0 , 0);
            } else if (this.stroke) {
                context.strokeStyleText(this._text , 0 , 0);
            }
        },

        setText: function (text) {
            this._text = text;
            this.emit('change:text');
        },

        measureText: function (ts) {
            _context.textBaseline = this.baseLine;
            _context.font = this.font;
            if (!ts)
                return _context.measureText(this._text).width;
            return this.getTSMatrix().point(_context.measureText(this._text).width , 0).x;
        }


    })


    var _context = document.createElement('canvas').getContext('2d');

})();


})(goz);