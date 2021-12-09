/**
 * PopNotify.js
 * @author CKylinMC
 * @version 2.0b
 * @licence MIT
 */
// Still WIP and not working now.
(function(){
    const Tools = {
        PREFIX: "PNUtils",
        randId: function(len=10){
            return Math.random().toString(36).slice(-1*len);
        },
        rmStyle: function(name){
            document.getElementById(`#${Tools.PREFIX}-${name}-css`)?.remove();
        },
        addStyle: function(name,content,mode='UPDATE',parent=document.body,scoped=false){
            if(!name || !content || !mode) return false;
            let css = document.getElementById(`#${Tools.PREFIX}-${name}-css`);
            switch(mode){
                case "UPDATE":
                    if(!css) {
                        css = document.createElement("style");
                        css.id = `${Tools.PREFIX}-${name}-css`;
                    }
                    css.innerHTML = '';
                    break;
                case "ONCE":
                    if(css)return true;
                    else{
                        css = document.createElement("style");
                        css.id = `${Tools.PREFIX}-${name}-css`;
                    }
                    break;
                case "APPEND":
                    break;
                default: return false;
            }
            parent.appendChild(css);
            scoped?css.setAttribute("scoped", "true"):css.removeAttribute("scoped");
            css.innerHTML+= content;
            return true;
        }
    };
    class Position {
        top=NaN;bottom=NaN;left=NaN;right=NaN;
        constructor(_pos){
            const pos = Object.assign({
                top:NaN,bottom:NaN,left:NaN,right:NaN
            },_pos);
            this.top = pos.top;
            this.bottom = pos.bottom;
            this.left = pos.left;
            this.right = pos.right;
        }
        hasTop(){
            return this.top!==NaN;
        }
        hasBottom(){
            return this.top!==NaN;
        }
        hasLeft(){
            return this.top!==NaN;
        }
        hasRight(){
            return this.top!==NaN;
        }
        static Zero = new Position({top:0,bottom:0,left:0,right:0});
        static None = new Position();
    }
    class EventEmitter{
        #eventbase = {};
        #stopOnError = false;
        #stopOnReturn = false;
        constructor(options) {
            const mergedOptions = Object.assign({stopOnError:false,stopOnReturn:false},options);
            this.#stopOnError = !!mergedOptions.stopOnError;
            this.#stopOnReturn = !!mergedOptions.stopOnReturn;
        }
        on(name, listener){
            if(!this.#eventbase.hasOwnProperty(name)){
                this.#eventbase[name] = [];
            }
            this.#eventbase[name].push(listener);
        };
        off(name, listener){
            if(!this.#eventbase.hasOwnProperty(name)) return;
            const index = this.#eventbase[name].indexOf(listener);
            index>-1 && this.#eventbase[name].splice(index, 1);
        }
        emit(name,...args){
            if(!this.#eventbase.hasOwnProperty(name)) return;
            for(let listener of this.#eventbase[name]){
                try{
                    const r = listener.call(window,...args);
                    if(r!==null && this.#stopOnReturn){
                        return r;
                    }
                }catch(e) {
                    console.error(`[EventEmitter] Error while passing event to handler with "${name}" and "${args}".`,e);
                    if(this.#stopOnError) return;
                }
            }
        }
    }
    class Queue{
        #items = [];
        get length() {
            return this.#items.length;
        };
        indexOf(item){
            return this.#items.indexOf(item);
        }
        has(item){
            return this.#items.includes(item);
        }
        append(item){
            this.#items.push(item);
        }
        put(item){
            this.#items.unshift(item);
        }
        take(){
            return this.#items.shift();
        }
        takeEnd(){
            return this.#items.pop();
        }
        remove(item){
            const index = this.indexOf(item);
            if(index>-1){
                this.#items.splice(index,1);
            }
        }
        clear(){
            this.#items = [];
        }
        getAll(){
            return [...this.#items];
        }
    }
    class PopNotifyUnit{
        #d = {};
        #dom = null;
        #parent = null;
        #updater = ()=>{};
        get id(){
            return this.#d?.id;
        }
        constructor(options){
            const mergedOptions = Object.assign({
                title:null,content:null,/* icon,buttons, */
                onclick:this.defaultClick(),
                style: "normal",
                timeout: 5000,
                controller: PopNotify.getInstance(),
            },options);
            this.#parent = mergedOptions.controller;
            this.#d = {
                title: mergedOptions.title,
                content: mergedOptions.content,
                onclick:mergedOptions.onclick,
                style: mergedOptions.style,
                timeout: mergedOptions.timeout,

                timer:null,
                id: "PNU"+Tools.randId(),
                showing: false,
                destoried: false
            }
            this.#updater = this.#parent.unitRegister(this);
        }
        isShowing(){
            return this.#d.showing;
        }
        isDestroyed(){
            return this.#d.destoried;
        }
        getController(){
            return this.#parent;
        }
        update(){
            this.setPos(this.#updater(this));
        }
        setPos(pos=Position.None){
            if(this.#dom){
                pos.hasTop()&&(this.#dom.style.top = pos.top + "px");
                pos.hasBottom()&&(this.#dom.style.bottom = pos.bottom + "px");
                pos.hasLeft()&&(this.#dom.style.left = pos.left + "px");
                pos.hasRight()&&(this.#dom.style.right = pos.right + "px");
            }
        }
        clicked(ev){
            if(this.#d.onclick(ev,this)!==false) this.close();
        }
        defaultClick(){
            return ()=>{
                this.close();
            }
        }
        show(){
            this.#d.showing = true;
            if (this.#d.timer) clearTimeout(this.#d.timer);
            let el = document.querySelector("#" + this.#d.id);
            if (el) el.remove();
            el = document.createElement("div");
            el.id = this.#d.id;
            el.className = "popNotifyUnitFrame" + (this.#d.style ? " popStyle-" + this.style : "");
            el.onclick = ()=>this.clicked();
            if (this.#d.title != null) {
                let t = document.createElement("div");
                t.innerText = this.#d.title;
                t.className = "popNotifyUnitTitle";
                t.style.animation = "pntextin .8s forwards .2s cubic-bezier(0, 0.6, 0, 1)";
                el.appendChild(t);
            }
            if (this.#d.content != null) {
                let c = document.createElement("div");
                c.innerText = this.#d.content;
                c.className = "popNotifyUnitContent";
                c.style.animation = "pntextin .8s forwards .3s cubic-bezier(0, 0.6, 0, 1)";
                el.appendChild(c);
            }
            let b = document.createElement("i");
            b.className = "popNotifyUnitBar";
            b.style.animationDuration = (this.#d.timeout/1000)+"s";
            el.appendChild(b);
            this.#dom = el;
            this.#d.timer = setTimeout(this.close(),this.#d.timeout);
            this.#parent.getContainer().appendChild(el);
            this.update();
        }
        dom(){
            return this.#dom;
        }
        close(force=false){
            if (this.#d.destoried) return;
            this.#d.destoried = true;
            this.#d.showing = false;
            if (this.#d.timer) clearTimeout(this.#d.timer);
            let el = document.querySelector("#" + this.#d.id);
            if (el) {
                if (force) return el.remove();
                el.style.animation = "none";
                el.style.animation = "pnout forwards .3s ease-in-out";
                setTimeout(()=>{
                    el?.remove();
                }, 310);
                this.#parent.refresh();
            }
            this.#parent.cleanUp(this);
        }
    }
    class PopNotify{
        static instance = null;
        static getInstance(){
            if(PopNotify.instance == null) new PopNotify();
            return PopNotify.instance;
        }

        #vmargin = 20;
        #hmargin = 20;
        #gag = 20;
        #zIndex = 5000;
        #maxLimit = 10;
        #mode = "RT";
        #id = "PopNotify"+Tools.randId();
        #queue = new Queue();
        #waitingQueue = new Queue();
        constructor(options){
            this.mergeOptions(options);
            PopNotify.instance = this;
        }
        getQueue(){
            return [this.#queue,this.#waitingQueue];
        }
        show(options){
            return new PopNotifyUnit(options);
        }
        getContainer(){
            let container = document.querySelector("#"+this.#id);
            if(!container) {
                container = document.createElement("div");
                document.body.appendChild(container);
                container.id = this.#id;
            }
            return container;
        }
        mergeOptions(options){
            const mergedOptions = Object.assign({
                vmargin: 20,
                hmargin: 20,
                zIndex: 5000,
                maxLimit: 10,
                gag: 20
            }, options);
            this.#gag = mergedOptions.gag;
            this.#vmargin = mergedOptions.vmargin;
            this.#hmargin = mergedOptions.hmargin;
            this.#maxLimit = mergedOptions.maxLimit;
            this.#zIndex = mergedOptions.zIndex;
        }
        unitRegister(unit){
            if(!(unit instanceof PopNotifyUnit)) return false;
            if(this.#queue.length>=this.#maxLimit){
                this.#waitingQueue.append(unit);
            }else{
                this.#queue.append(unit);
            }
            return (unit)=>{
                if(unit.isDestroyed()) return Position.None;
                const index = this.#queue.indexOf(unit);
                if(index>-1){
                    return this.getPosition(unit);
                } else return Position.None;
            }
        }
        refresh(){
            for(let unit of this.#queue.getAll()){
                if(!unit.isShowing()) unit.show();
                else unit.update();
            }
        }
        cleanUp(unit){
            this.#queue.remove(unit);
            if(this.#waitingQueue.length>0){
                this.#queue.append(this.#waitingQueue.take());
            }
            this.refresh();
        }
        getPosition(unit){
            let height = this.#vmargin;
            this.#queue.getAll().forEach(item=>{
                if(!item.isShowing()) return;
                if(item.id===unit.id) return;
                height+=item.dom().offsetHeight + this.#gag;
            })
            switch(this.#mode) {
                case "RT":
                    {
                        return new Position({
                            top: height,
                            right: this.#hmargin
                        });
                    }
                    break;
                case "RB":
                    {
                        return new Position({
                            bottom: height,
                            right: this.#hmargin
                        });
                    }
                    break;
                case "LT":
                    {
                        return new Position({
                            top: height,
                            left: this.#hmargin
                        });
                    }
                    break;
                case "LB":
                    {
                        return new Position({
                            bottom: height,
                            left: this.#hmargin
                        });
                    }
                    break;
                default:
                    throw new Error("Unknow mode "+this.#mode);
            }
        }
    }
    window.popNotify = PopNotify.getInstance();
})()
