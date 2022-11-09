/**
 * PopNotify.js
 * @author CKylinMC
 * @version 1.2
 * @licence MIT
 */

class popNotifyUnit {
    static create({ title, content, onclick, timeout, style, autoshow, progressmode, register }) {
        const unit = new popNotifyUnit(title, content, onclick, timeout, style, autoshow, progressmode);
        if (register) {
            if (register === true) {
                window.popNotify.reg(unit);
            } else if (typeof (register) == 'object') {
                register.reg?.(unit);
            }
        }
        return unit;
    }
    constructor(title = null, content = null, onclick = null, timeout = 5000, style = null, autoshow = false, progressmode = false) {
        this.title = title;
        this.content = content;
        this.onclick = onclick instanceof Function ? onclick : this.close(this);
        this.timeout = timeout || 5000;
        this.id = "PNU_" + Math.floor(Math.random() * 1000000) + new Date().getMilliseconds().toString();
        this.posRight = 20;
        this.posTop = window.popNotify.getNextYPos();
        this.timer = null;
        this.style = style;
        this.showing = false;
        this.destoried = false;
        this.progressbar = null;
        this.progressmode = progressmode;
        this.element;
        this.titleel;
        this.contentel;
        // window[this.id] = this;
        if (autoshow) this.show();
    }
    setPosRight(x) {
        // if (!this.showing) return;
        x = parseFloat(x);
        if (isNaN(x)) return;
        this.posRight = x;
        this.update();
    }
    setPosTop(y) {
        // if (!this.showing) return;
        y = parseFloat(y);
        if (isNaN(y)) return;
        this.posTop = y;
        this.update();
    }
    update() {
        let el = document.querySelector("#" + this.id);
        if (!el) return;
        el.style.top = this.posTop + "px";
        el.style.right = this.posRight + "px";
    }
    clicked(e, ev) {
        return function () {
            if (e.onclick(ev, e) !== false) e.destory();
        }
    }
    replay(opt1, opt2, opt3) {
        let style, title, content;
        if (typeof (opt1) == "string") this.style = opt1;
        else if (typeof (opt1) === "object") {
            style = opt1.style;
            title = opt1.title;
            content = opt1.content;
        }
        if (typeof (opt2) == "string") this.title = opt2;
        if (typeof (opt3) == "string") this.content = opt3;
        if (style) this.style = style;
        if (title) this.title = title;
        if (content) this.content = content;
        this.show();
        return this;
    }
    setProgress(value = 0, total = 100, closeWhenDone = true) {
        if (this.timer) clearTimeout(this.timer);
        this.progressbar.style.transition = "all .3s ease-in-out";
        this.progressbar.style.animationName = "none";
        let progress = Math.max(Math.min(value / total * 100, 100), 0);
        this.progressbar.style.width = progress + "%";
        return {
            unit: this,
            setAutoClose(autoClose) {
                closeWhenDone = !!autoClose;
            },
            set: (v = progress) => {
                progress = Math.max(Math.min(v, 100), 0);
                this.progressbar.style.width = progress + "%";
                if (progress >= 100) {
                    if (closeWhenDone) this.destory();
                }
            },
            calcProgress: (value = 0, total = 100) => {
                progress = Math.max(Math.min(value / total * 100, 100), 0);
                this.progressbar.style.width = progress + "%";
                if (progress >= 100) {
                    if (closeWhenDone) this.destory();
                }
            },
            step: (v = 1) => {
                progress += v;
                progress = Math.max(Math.min(progress, 100), 0);
                this.progressbar.style.width = progress + "%";
                if (progress >= 100) {
                    if (closeWhenDone) this.destory();
                }
            },
            done: () => {
                this.destory();
            }
        }
    }
    setTimer(ms = this.timeout) {
        if (this.timer) clearTimeout(this.timer);
        this.progressbar.style.animationName = "none";
        this.progressbar.style.width = "0%";
        this.progressbar.style.animationName = "pnbar";
        this.progressbar.style.animationDuration = (ms / 1000) + "s";
        this.timer = setTimeout(this.close(this), ms);
        this.timeout = ms;
        return this;
    }
    setTitle(title = this.title) {
        if (title != null) {
            this.titleel?.remove();
            let t = document.createElement("div");
            t.innerText = title;
            t.className = "popNotifyUnitTitle";
            t.style.animation = "pntextin .8s forwards .2s cubic-bezier(0, 0.6, 0, 1)";
            this.element.appendChild(t);
            this.titleel = t;
        } else {
            this.titleel?.remove();
        }
        this.title = title;
        return this;
    }
    setContent(content = this.content) {
        if (content != null) {
            this.contentel?.remove();
            let c = document.createElement("div");
            c.innerText = content;
            c.className = "popNotifyUnitContent";
            c.style.animation = "pntextin .8s forwards .3s cubic-bezier(0, 0.6, 0, 1)";
            this.element.appendChild(c);
            this.contentel = c;
        } else {
            this.contentel?.remove();
        }
        this.content = content;
        return this;
    }
    setStyle(style = this.style) {
        this.element.className = "popNotifyUnitFrame" + (style ? " popStyle-" + style : "");
        this.style = style;
    }
    show() {
        if (this.destoried) {
            this.destoried = false;
            this.posTop = window.popNotify.getNextYPos();
            popNotify.reg(this);
        }
        // if (this.timer) clearTimeout(this.timer);
        let el = document.querySelector("#" + this.id);
        if (el) el.remove();
        el = document.createElement("div");
        el.id = this.id;
        el.className = "popNotifyUnitFrame" + (this.style ? " popStyle-" + this.style : "");
        el.onclick = this.clicked(this);
        el.style.top = this.posTop + "px";
        el.style.right = this.posRight + "px";
        this.element = el;
        this.setTitle();
        this.setContent();
        // if (this.title != null) {
        //     let t = document.createElement("div");
        //     t.innerText = this.title;
        //     t.className = "popNotifyUnitTitle";
        //     t.style.animation = "pntextin .8s forwards .2s cubic-bezier(0, 0.6, 0, 1)";
        //     el.appendChild(t);
        // }
        // if (this.content != null) {
        //     let c = document.createElement("div");
        //     c.innerText = this.content;
        //     c.className = "popNotifyUnitContent";
        //     c.style.animation = "pntextin .8s forwards .3s cubic-bezier(0, 0.6, 0, 1)";
        //     el.appendChild(c);
        // }
        let b = document.createElement("i");
        b.className = "popNotifyUnitBar";
        this.progressbar = b;
        if (!this.progressmode) {
            this.setTimer();
        }
        el.appendChild(b);
        document.body.appendChild(el);
        this.showing = true;
    }
    close(e) {
        return function () {
            e.destory();
        }
    }
    destory(force) {
        if (this.destoried) return;
        this.destoried = true;
        this.showing = false;
        if (this.timer) clearTimeout(this.timer);
        let el = document.querySelector("#" + this.id);
        if (el) {
            if (force) return el.remove();
            el.style.animation = "none";
            el.style.animation = "pnout forwards .3s ease-in-out";
            setTimeout(this.remove(this), 310);
            window.popNotify.refresh();
        }
        popNotify.cleanUp(this);
    }
    remove(e) {
        return function () {
            let el = document.querySelector("#" + e.id);
            if (el) el.remove();
        }
    }
    el() {
        return document.querySelector("#" + this.id);
    }
}

class PopNotify {
    queue = [];
    closingAll = false;
    topOffset = 0;
    show(title = null, content = null, style = "", timeout = 5, onclick = null) {
        return this.notify(title, content, timeout * 1000, onclick, style);
    }
    success(title = null, content = null, timeout = 5, onclick = null) {
        return this.show(title, content, "success", timeout, onclick);
    }
    info(title = null, content = null, timeout = 5, onclick = null) {
        return this.show(title, content, "info", timeout, onclick);
    }
    warn(title = null, content = null, timeout = 5, onclick = null) {
        return this.show(title, content, "warn", timeout, onclick);
    }
    error(title = null, content = null, timeout = 5, onclick = null) {
        return this.show(title, content, "error", timeout, onclick);
    }
    notify(title, content, timeout, onclick, style) {
        let n = new popNotifyUnit(title, content, onclick, timeout, style, true);
        this.queue.push(n);
        this.refresh();
        return n;
    }
    reg(unit) {
        this.queue.push(unit);
        this.refresh();
        return unit;
    }
    cleanUp(obj) {
        if (this.closingAll) return;
        if (obj) this.queue.forEach((item, index) => {
            if (item === obj) this.queue.splice(index, 1);
        });
        else for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i].showing === false) {
                this.queue.splice(i, 1);
                i -= 1;
            }
        }
    }
    refresh() {
        let top = 20;
        let height = top + popNotify.topOffset;
        this.queue.forEach(item => {
            if (!item.showing) return;
            item.setPosTop(height);
            height += top + item.el().offsetHeight;
        })
    }
    getNextYPos() {
        let top = 20;
        let height = top + popNotify.topOffset;
        this.queue.forEach(item => {
            if (!item.showing) return;
            height += top + item.el().offsetHeight;
        });
        return height;
    }
    getObjById(id) {
        if (!id) return;
        let res = null;
        this.queue.forEach(item => {
            if (item.id === id) res = item;
        });
        return res;
    }
    getObjByElement(e) {
        if (!e) return;
        if (!e instanceof HTMLElement) return;
        let id = null;
        if (e.classList.contains("popNotifyUnitFrame")) {
            id = e.id;
        } else if (e.classList.contains("popNotifyUnitTitle") || e.classList.contains("popNotifyUnitContent")) {
            id = e.parentNode.id;
        }
        let res = null;
        this.queue.forEach(item => {
            if (item.id === id) res = item;
        });
        return res;
    }
    close(item) {
        let obj;
        if (item instanceof HTMLElement) {
            obj = this.getObjByElement(item);
        } else {
            obj = this.getObjById(item);
        }
        if (!obj) return;
        obj.destory();
    }
    closeAll() {
        this.closingAll = true;
        this.queue.forEach(item => item.destory());
        this.queue = [];
        this.closingAll = false;
    }
}
window.popNotify = new PopNotify();
