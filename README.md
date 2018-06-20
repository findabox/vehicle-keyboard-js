# 停车王车牌号码专用键盘 VehicleKeyboard - vue.js

- `JavaScript(Vue.js)` JavaScript(Vue.js)项目，为H5页面定制，包括Web、微信、支付宝等，同样包括输入组件、键盘组件及相关控制逻辑实现

![](keyboard-v2.png)

## 安装

```
npm i vehicle-keyboard -S
```

## 键盘输入框混合组件使用说明

[键盘输入框混合组件(js文件版)](./MixedKeyboardUsage.md)

混合组件包括键盘和输入框两部分组件，具有完成的车牌输入逻辑。

基于VUE.js实现的单组件，单JS文件，包含vue核心库，文件大小约 114KB。


[键盘输入框混合组件(vue组件版)](./MixedKeyboardUsage.md#vue%E9%A1%B9%E7%9B%AE%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)

混合组件包括键盘和输入框两部分组件，具有完成的车牌输入逻辑。

基于VUE.js实现的单组件，不包含vue核心库，仅提供 .vue 文件用于 vue + webpack 项目打包使用。

## 单键盘组件使用说明

[单键盘组件的使用方法(js文件版)](./SingleKeyboardUsage.md)

单键盘组件只包含键盘组件部分。

基于VUE.js实现的单组件，单JS文件，包含vue核心库，文件大小约 105KB。


[单键盘组件的使用方法(vue组件版)](./SingleKeyboardUsage.md#vue%E9%A1%B9%E7%9B%AE%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)

单键盘组件只包含键盘组件部分。

基于VUE.js实现的单组件，不包含vue核心库，仅提供 .vue 文件用于 vue + webpack 项目打包使用。

## 键盘逻辑引擎使用说明

[键盘逻辑引擎使用说明](./Engine.md)

## 车牌号码规则

1. 参见：[中国车牌号码编码规则全解](http://yoojia.xyz/2018/05/09/chinese-vehicle-number/)
2. 参见：[中华人民共和国民用机动车号牌](https://zh.wikipedia.org/wiki/中华人民共和国民用机动车号牌)


## 已知问题

- 在 Android4.4 以下的浏览器或者WebView中，由于不支持CSS3部分特性，会出现输入框界面宽度变化的问题；

## 版本更新记录

### v2018.0620

- 增加大使馆车牌
- 全键盘增加确认按钮

### v2018.0619

- 修改基础尺寸单位为 rem


## 维护

- [陈永佳](https://github.com/yoojia) chenyongjia@parkingwang.com

## License

    Copyright 2017 Xi'an iRain IOT Technology service CO., Ltd (ShenZhen)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.