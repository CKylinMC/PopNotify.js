# PopNotify.js
一个简单的通知条js，练手项目。

## 引入
```html
<link rel="stylesheet" href="PopNotify.css">
<script src="PopNotify.js"></script>
```

## 生成一条通知
```js
popNotify.notify("Hello~", "Click to close!", 5000);
```

### 参数解释
```js
popNotify.notify(title, content, timeout, onclick, style)
```
* **title:** 通知标题，设为`null`来跳过标题。
 * 设置为`null`时不会为标题留空，如果需要留空，请设为`""`。
* **content:** 通知内容，设为`null`来跳过内容。
 * 设置为`null`时不会为内容留空，如果需要留空，请设为`""`。
* **timeout:** 超时，通知要显示多少毫秒。
 * 不设置或`null`值时，默认显示5秒。
* **onclick:** 点击回调，当通知被点击时执行。
 * 回调的第一个参数是事件，第二个参数是对应实例，回调返回`true`时关闭通知，否则通知会等待超时才会关闭。
* **style:** 预设样式名称。
 * 默认预设有`null`(黑白)、`info`、`success`、`warn`、`error`四种。
 
## 样式
已经默认预设了四种样式，并且可以自行添加。

假如新的样式名为`new`，则添加样式表：

```css
.popStyle-new {
    background: rgb(255, 196, 196) !important;//通知背景颜色
}

.popStyle-new .popNotifyUnitTitle,
.popStyle-new .popNotifyUnitContent {
    color: rgb(255, 66, 66) !important;//通知文字颜色
}
```
之后便可使用`new`的名字调用这些样式。

## 查找和关闭通知
如果需要，可以通过通知返回的ID或通知的任意部分DOM来获得对应通知的实例。
```js
popNotify.getObjById(String id) : null || popNotifyUnit
popNotify.getObjByElement(HTMLElement e) : null || popNotifyUnit
```
获得实例后执行实例下的`.destory()`方法即可正常关闭对应通知，或设置参数为`true`以无动画的方式立刻删除通知。

您也可以直接通过一个代理的方法直接关闭对应通知，并且同时支持以上两种参数：
```js
popNotify.close(String id || HTMLElement e)
```

或者，想要直接关闭所有的通知：
```js
popNotify.closeAll()
```
