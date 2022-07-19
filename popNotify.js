/**
 * PopNotify.js
 * @version 2.0.0 preview 1
 * @author CKylinMC
 * @license MIT
 */
 (function () {
    class EventEmitter {
        events = {};
        on(name, fn) {
            if (!this.events[name]) {
                this.events[name] = [];
            }
            this.events[name].push(fn)
        }
        off(name, fn) {
            if (this.events[name]) {
                const index = this.events[name].indexOf(fn);
                if (index > -1)
                    this.events[name].splice(index, 1);
            }
        }
        emit(name, ...args) {
            if (!this.events[name]) return;
            for (const listener of this.events[name]) {
                if (listener(...args) === false) break;
            }
        }
        async emitAsync(name, ...args) {
            if (!this.events[name]) return;
            for (const listener of this.events[name]) {
                if (await listener(...args) === false) break;
            }
        }
        clear() {
            this.events = {};
        }
    }
    class Timer {
        static timeouts = [];
        static instances = [];
        static pauseAll() {
            for (const timer of Timer.timeouts) {
                timer.pause();
            }
        }
        static stopAll() {
            for (const timer of Timer.timeouts) {
                timer.stop();
            }
        }
        static resumeAll() {
            for (const timer of Timer.instances) {
                timer.resume();
            }
        }
        static restartAll() {
            for (const timer of Timer.instances) {
                timer.restart();
            }
        }
        static startAll() {
            for (const timer of Timer.instances) {
                timer.startIfNot();
            }
        }
        static setTimeout(fn = () => { }, ms = 0) {
            return new Timer(ms).callback(fn).start();
        }
        static sleep(ms) {
            return new Timer(ms).wait();
        }
        constructor(timeout = 0/*ms*/) {
            this.total = timeout;
            this.timer = null;
            this.remain = timeout;
            this.emitter = new EventEmitter;
            Timer.instances.push(this);
        }
        clear() {
            clearTimeout(this.timer);
            Timer.timeouts.splice(Timer.timeouts.indexOf(this), 1);
            this.timer = null;
            return this;
        }
        startIfNot() {
            if (this.remain && !this.timer) this.start;
            return this;
        }
        start() {
            this.clear();
            this.remain = this.total;
            this.resume();
            return this;
        }
        _end() {
            this.clear();
            this.remain = 0;
            this.emitter.emit('end');
            this.emitter.clear();
        }
        callback(fn) {
            this.emitter.on('end', fn);
            return this;
        }
        wait() {
            return new Promise(r => {
                if (!this.timer && this.remain === 0) r();
                this.callback(r);
                if (this.timer == null) this.start();
            })
        }
        stop() {
            this.pause();
            this.remain = this.total;
            this.emitter.emit('stopped', this.remain);
            return this;
        }
        pause() {
            this.clear();
            this.remain = this.remain - (Date.now() - this.startAt);
            this.emitter.emit('paused', this.remain);
            return this;
        }
        resume() {
            if (this.timer) return (console.warn('[Timer] Already running.'), this);
            this.startAt = Date.now();
            this.timer = setTimeout(()=>this._end(), this.remain);
            Timer.timeouts.push(this);
            return this;
        }
        restart() {
            return this.start();
        }
    }
    class Unit {
        static prefix = "PN2U-";
        constructor(options = {}) {
            this.opt = Object.assign({}, {
                theme: 'blue',
                context: null,
                title: '',
                content: '',
                btns: [],
                onclick: () => this.close(),
                timeout: 1000 * 5,
                className: '',
            }, options);
            if(this.opt.timeout!==0) this.opt.timeout = isNaN(this.opt.timeout)? 1000 * 5 : this.opt.timeout;
            if (!this.opt.context) {
                throw new Error("Need PopNotify host");
            }
            this.showing = false;
            this.timer = new Timer(this.opt.timeout??10009*5);
            this.timer.callback(() => this.close());
            this.el = null;
            this.spawn();
        }
        spawn() {
            if (this.showing) return;
            this.el?.remove();
            this.el = document.createElement('div');
            this.el.id = Unit.prefix + Math.floor(Math.random() * 1000000);
            this.el.className = [Unit.prefix + 'container', Unit.prefix + "theme-" + this.opt.theme, this.opt.className].filter(i => i && i.length).join(' ');
            this.titleEl = document.createElement('div');
            this.titleEl.className = Unit.prefix + "title";
            this.titleEl.addEventListener('click', this.opt.onclick);
            this.el.appendChild(this.titleEl);
            this.contentEl = document.createElement('div');
            this.contentEl.className = Unit.prefix + "content";
            this.contentEl.addEventListener('click', this.opt.onclick);
            this.el.appendChild(this.contentEl);
            this.buttonsEl = document.createElement('div');
            this.buttonsEl.className = Unit.prefix + "buttons";
            this.el.appendChild(this.buttonsEl);
            if(this.opt.timeout!==0){
                const style = document.createElement('style');
                style.appendChild(document.createTextNode(`#${this.el.id}-timer::after {
                    animation: PN2U-anim-progress ${this.opt.timeout/1000}s linear forwards;
                }`));
                this.timerEl = document.createElement('div');
                this.timerEl.id = `${this.el.id}-timer`;
                this.timerEl.className = Unit.prefix + "timer";
                this.el.appendChild(style);
                this.el.appendChild(this.timerEl);
            }
            this.el.addEventListener('mouseenter', () => this.timer.pause());
            this.el.addEventListener('mouseleave', () => this.timer.resume());
        }
        setTitle(title,raw=false) {
            raw?(this.titleEl.innerHTML = title):(this.titleEl.innerText = title);
        }
        setContent(content,raw=false) {
            raw?this.contentEl.innerHTML = content:this.contentEl.innerText = content;
        }
        setButtons(btns, clear = true) {
            if(clear) this.buttonsEl.innerHTML = '';
            for (const { label, onclick } of btns) {
                const btn = document.createElement('button');
                btn.innerText = label;
                btn.onclick = () => {
                    this.close();
                    onclick();
                };
                this.buttonsEl.appendChild(btn);
            }
        }
        setPosition(css) {
            for (const key of Object.keys(css)) {
                const value = css[key];
                this.el.style[key] = value;
            }
        }
        getHeight() {
            return this.el.offsetHeight;
        }
        show(raw = false) {
            this.setTitle(this.opt.title,raw);
            this.setContent(this.opt.content,raw);
            this.setButtons(this.opt.btns??[]);
            this.opt.context.showUnit(this);
            this.el.classList.add('PN2U-do-enter');
        }
        startTimer(){
            if(this.opt.timeout>0)this.timer.start();
        }
        close() {
            this.opt.context.hideUnit(this);
        }
        destory(){
            this.el.classList.remove('PN2U-do-enter');
            this.el.classList.add('PN2U-do-exit');
            setTimeout(() => {
                this.el.remove();
            },500);
        }
    }

    class PopNotify {
        static RightTop = {
            top: "20px",
            right: "20px"
        }
        static LeftTop = {
            top: "20px",
            left: "20px"
        }
        static RightBottom = {
            bottom: "20px",
            right: "20px",
        }
        static LeftBottom = {
            bottom: "20px",
            left: "20px",
        }
        static importStyle() {
            const old = document.querySelector("style#PN2-styles");
            if (old) old.remove();
            const style = document.createElement("style");
            style.appendChild(document.createTextNode(`.PN2-container { position: fixed; min-width: 250px; width: -webkit-max-content; width: -moz-max-content; width: max-content; height: 100vh; overflow: hidden; display: -webkit-box; display: -ms-flexbox; display: flex; -webkit-box-orient: vertical; -webkit-box-direction: normal; -ms-flex-direction: column; flex-direction: column; z-index: 99999; } .PN2U-container { position: fixed; -webkit-transition: all 0.3s ease; -o-transition: all 0.3s ease; transition: all 0.3s ease; margin: 10px 20px; line-height: 24px; min-width: 200px; max-width: 60vw; width: -webkit-max-content; width: -moz-max-content; width: max-content; height: -webkit-fit-content; height: -moz-fit-content; height: fit-content; border-radius: 6px; min-height: 30px; overflow: hidden; -webkit-box-shadow: 0 3px 6px #8080805f; box-shadow: 0 3px 6px #8080805f; } .PN2U-do-enter{ -webkit-animation: PN2U-anim-in 0.6s cubic-bezier(0.1, 1, 0, 1) forwards; animation: PN2U-anim-in 0.6s cubic-bezier(0.1, 1, 0, 1) forwards; } .PN2U-do-exit{ -webkit-animation: PN2U-anim-out 0.6s cubic-bezier(0.1, 1, 0, 1) forwards; animation: PN2U-anim-out 0.6s cubic-bezier(0.1, 1, 0, 1) forwards; } .PN2U-title{ padding: 6px 12px 3px 12px; opacity: 0; font-size: larger; word-break: break-all; -webkit-animation: PN2U-anim-text-in 1s cubic-bezier(0.1, 1, 0, 1) forwards .2s; animation: PN2U-anim-text-in 1s cubic-bezier(0.1, 1, 0, 1) forwards .2s; } .PN2U-content{ padding: 3px 12px 6px 12px; opacity: 0; -webkit-filter: opacity(0.8); filter: opacity(0.8); word-break: break-all; -webkit-animation: PN2U-anim-text-in 1s cubic-bezier(0.1, 1, 0, 1) forwards .3s; animation: PN2U-anim-text-in 1s cubic-bezier(0.1, 1, 0, 1) forwards .3s; } .PN2U-buttons{ opacity: 0; -webkit-animation: PN2U-anim-text-in 1s cubic-bezier(0.1, 1, 0, 1) forwards .4s; animation: PN2U-anim-text-in 1s cubic-bezier(0.1, 1, 0, 1) forwards .4s; margin: 0; padding: 0; width: 100%; display: -webkit-box; display: -ms-flexbox; display: flex; -webkit-box-orient: horizontal; -webkit-box-direction: normal; -ms-flex-direction: row; flex-direction: row; -ms-flex-wrap: nowrap; flex-wrap: nowrap; -ms-flex-line-pack: stretch; align-content: stretch; -ms-flex-pack: distribute; justify-content: space-around; -webkit-box-align: stretch; -ms-flex-align: stretch; align-items: stretch; height: 24px; } .PN2U-buttons:empty{ display: none!important; } .PN2U-buttons>button{ -webkit-transition: all .3s ease; -o-transition: all .3s ease; transition: all .3s ease; border:none; background: rgba(255, 255, 255, 0.358); -webkit-box-flex: 1; -ms-flex: 1; flex: 1; border-left: 2px solid rgba(255, 255, 255, 0.436); text-shadow: 0px 0px 3px #00000063; } .PN2U-buttons>button:first-child{ border-left: none; } .PN2U-buttons>button:hover{ background: rgba(255, 255, 255, 0.557); } .PN2U-timer{ width: 100%; height:2px; background: rgba(255, 255, 255, 0.358); } .PN2U-timer::after{ content: " "; display: block; -webkit-transition: all .3s; -o-transition: all .3s; transition: all .3s; height:2px; width: 50%; background-color: white; } .PN2-pause-anim .PN2U-timer, .PN2-pause-anim .PN2U-timer::after, .PN2U-container:hover .PN2U-timer::after{ -webkit-animation-play-state:paused!important; animation-play-state:paused!important; } .PN2U-theme-white{ background: rgb(255, 255, 255); color: black; } .PN2U-theme-dark{ background: rgb(82, 82, 82); color: rgb(255, 255, 255); } .PN2U-theme-dark button{ color: rgb(255, 255, 255); } .PN2U-theme-dark .PN2U-buttons{ background: rgb(28, 28, 28); } .PN2U-theme-blue{ background: rgb(29, 153, 255); color: rgb(255, 255, 255); } .PN2U-theme-blue button{ color: rgb(255, 255, 255); } .PN2U-theme-blue .PN2U-buttons{ background: rgba(255, 255, 255, 0.046); } .PN2U-theme-green{ background: rgb(37, 196, 37); color: rgb(255, 255, 255); } .PN2U-theme-green button{ color: rgb(255, 255, 255); } .PN2U-theme-green .PN2U-buttons{ background: rgba(255, 255, 255, 0.046); } .PN2U-theme-red{ background: rgb(185, 13, 13); color: rgb(255, 255, 255); } .PN2U-theme-red button{ color: rgb(255, 255, 255); } .PN2U-theme-red .PN2U-buttons{ background: rgba(255, 255, 255, 0.046); } .PN2U-theme-yellow{ background: rgb(217, 192, 3); color: rgb(255, 255, 255); } .PN2U-theme-yellow button{ color: rgb(255, 255, 255); } .PN2U-theme-yellow .PN2U-buttons{ background: rgba(255, 255, 255, 0.046); } .PN2U-theme-orange{ background: rgb(217, 131, 3); color: rgb(255, 255, 255); } .PN2U-theme-orange button{ color: rgb(255, 255, 255); } .PN2U-theme-orange .PN2U-buttons{ background: rgba(255, 255, 255, 0.046); } @-webkit-keyframes PN2U-anim-in { from { -webkit-transform: scale(0); transform: scale(0); opacity: 0; } to { -webkit-transform: scale(1); transform: scale(1); opacity: 1; } } @keyframes PN2U-anim-in { from { -webkit-transform: scale(0); transform: scale(0); opacity: 0; } to { -webkit-transform: scale(1); transform: scale(1); opacity: 1; } } @-webkit-keyframes PN2U-anim-out { from { -webkit-transform: scale(1); transform: scale(1); opacity: 0; } to { -webkit-transform: scale(0); transform: scale(0); opacity: 1; } } @keyframes PN2U-anim-out { from { -webkit-transform: scale(1); transform: scale(1); opacity: 0; } to { -webkit-transform: scale(0); transform: scale(0); opacity: 1; } } @-webkit-keyframes PN2U-anim-text-in { from { -webkit-transform: translateY(8px); transform: translateY(8px); opacity: 0; } to { -webkit-transform: translateY(0px); transform: translateY(0px); opacity: 1; } } @keyframes PN2U-anim-text-in { from { -webkit-transform: translateY(8px); transform: translateY(8px); opacity: 0; } to { -webkit-transform: translateY(0px); transform: translateY(0px); opacity: 1; } } @-webkit-keyframes PN2U-anim-progress{ from{ width: 0%; } to{ width: 100%; } } @keyframes PN2U-anim-progress{ from{ width: 0%; } to{ width: 100%; } }`));
            document.head.appendChild(style);
        }
        static prefix = "PN2-";
        constructor(options = {}) {
            PopNotify.importStyle();
            this.opts = Object.assign({},{
                pos: PopNotify.RightTop,
                max: 0,
                gag: "10px",
                className: ""
            }, options);
            this.stack = [];
            this.showing = [];
            this.el = document.createElement("div");
            this.el.id = PopNotify.prefix + Math.floor(Math.random() * 1000000);
            this.el.className = PopNotify.prefix + "container";
            if (this.opts.pos.right) this.el.style.right = this.opts.pos.right;
            if (this.opts.pos.left) this.el.style.left = this.opts.pos.left;
            if (this.opts.pos.top) this.el.style.top = this.opts.pos.top;
            if (this.opts.pos.bottom) this.el.style.bottom = this.opts.pos.bottom;
            const align = this.opts.pos.right ? 'end' : 'start';
            this.el.style.cssText+= ` -webkit-box-align: ${align}; -ms-flex-align: ${align}; align-items: flex-${align};`
            document.body.appendChild(this.el);
        }
        getContext() {
            return {
                host: this,
                opts: this.opts,
            }
        }
        info(opt={}){
            this._send('blue',opt);
        }
        warning(opt={}){
            this._send('orange',opt);
        }
        success(opt={}){
            this._send('green',opt);
        }
        error(opt={}){
            this._send('red',opt);
        }
        dark(opt={}){
            this._send('dark',opt);
        }
        white(opt={}){
            this._send('white',opt);
        }
        show(opt){
            const unit = new Unit(opt);
            unit.show();
            return unit;
        }
        _send(theme, opt={}) {
            return this.show({ theme, context: this, title:opt.title??'', content:opt.content??'', btns:opt.btns??[], onclick:opt.onclick??(()=>{}), timeout:opt.timeout??5*1000, className:opt.className??'' })
        }
        showUnit(unit) {
            this.stack.push(unit);
            this.triggerPushStack();
        }
        hideUnit(unit) {
            if (this.stack.indexOf(unit) !== -1) {
                this.stack.splice(this.stack.indexOf(unit), 1);
            } else {
                if(this.showing.indexOf(unit) !== -1) {
                    this.showing.splice(this.showing.indexOf(unit), 1);
                    unit.destory();
                    this.triggerPushStack();
                }
            }
        }
        triggerPushStack() {
            while ((this.opts.max<=0||this.showing.length < this.opts.max) && this.stack.length) {
                const newitem = this.stack.shift();
                this.showing.push(newitem);
                this.el.appendChild(newitem.el);
                newitem.startTimer();
            }
            this.refreshPositions();
        }
        addpx(...args) {
            // let 5px + 5px
            let intval = args.map(i => +(i+'').replace('px', ''));
            // summary by reduce
            let sum = intval.reduce(function (sum, val) {
                return sum + val;
            }, 0);
            return sum +'px';
        }
        refreshPositions() {
            const side = this.opts.pos.left ? 'left' : 'right';
            const val = this.opts.pos.left ?? this.opts.pos.right;
            const vside = this.opts.pos.top ? 'top' : 'bottom';
            let pos = {
                [side]: val,
                [vside]: this.opts.pos[vside]
            }
            for(let i = 0; i < this.showing.length; i++) {
                const item = this.showing[i];
                item.setPosition(pos);
                pos[vside] = this.addpx(pos[vside], item.getHeight(), this.opts.gag);
            }
        }
    }
    window.PopNotify = PopNotify;
    window.popNotify = new PopNotify;
    window.PopNotifyUnit = Unit;
})();