# PopNotify.js V2

简单通知条组件

![popnotify](image.png)

## 与 v1 版本的差别

* 将组件进行了封装
* 现在在鼠标悬停时暂停计时
* 允许添加按钮
* 可以选择从屏幕四个角落中任意一个创建通知条队列
* 脚本包含样式，会在首次使用时自动生效

## 引用 & 安装

通过script标签引入脚本

如：
```html
<script src="popNotify.min.js"></script>
```

你不需要引入样式表，js中已经包含样式表。

## 使用

默认已经创建一个从右上角开始的通知队列，你可以直接使用：

```js
popNotify.info({/* ... */})
```

你也可以自己创建一个队列，可以使用一些自定义选项。

```js
const popNotify = new PopNotify({
    // options...
});
```

支持的选项：

* `pos` 相对于四个角落的像素数。
  * 你只需要写其中两个，如左上角5像素位置只需要写`{left:"5px", right:"5px"}`
  * 你也可以使用预设，`PopNotify.RightTop` (这就是默认值)，距离右上角20像素。
    * 预设还有：`PopNotify.RightBottom`、`PopNotify.LeftBottom`、`PopNotify.LeftTop`。
* `max` 最大同时显示通知数量,超过后会进行等待，设置为0(默认)代表不限制。
* `gag` 通知条之间的间距，默认为`10px`。
* `className` 要附加给每一个通知条的自定义类名。

### 快速创建通知

默认提供了6个主题，可以通过以下方法调用：
```js
popNotify.info({/* ... */});
popNotify.warning({/* ... */});
popNotify.success({/* ... */});
popNotify.error({/* ... */});
popNotify.dark({/* ... */});
popNotify.white({/* ... */});
```

可以使用的参数有：

* `title` 标题
* `content` 内容
* `btns` 按钮
  * 这是一个数组，其中每个按钮的定义都应该是：
  * `{label:"显示文字",onclick:()=>{/*点击回调*/}}`
  * 并且点击后会自动关闭通知。
* `onclick` 点击通知回调
* `timeout` 显示超时(ms)(默认5000)
* `className` 自定义类名

### 手动创建通知

可以通过手动初始化通知的方式使用更多功能。

手动初始化方式：

```js
const unit = new PopNotifyUnit({/* ... */});
unit.show();
```

其中的参数列表：

* `theme` 默认为`blue`，你可以自定义，类名会被组成 `PN2U-theme-${theme}` 的格式。
* `context` 用于管理通知的队列，必须填写。可以通过 `new PopNotify`生成。

以及全部在快速创建通知时的参数。

除此以外，你还可以在`show()`调用后，通过`setTitle()`、`setContent()`、`setButtons()`来更改通知内容，其中`setTitle()`、`setContent()`的第二个参数如果传递`true`则会输出HTML代码，否则输出文字；`setButtons()`第二个参数如果传递为`false`，则在添加按钮之前不清空已有按钮。

你还可以通过`unit.timer`获得计时器对象，此对象可以使用`pause、start、restart、stop`等方法进行计时控制。

通过`unit.close()`可以立刻关闭通知。