<template>
  <div class="single-keyboard-box">
    <keyboard-view :keyboard="dyKeyboard" :keycount="dyKeyCount" @onkeyclick="onClickKey"
      @onmoreclick="onClickShowAll" />
  </div>
</template>
<script>
import KeyboardView from './KeyboardView.vue';
let engine = require('./engine.js');
let provinces = require('./provinces.js');
export default {
  name: 'vechicle-single-keyboard',
  props: {
    /**
     * 参数配置项
     * @param {String} presetNumber 预设车牌号
     * @param {Number} keyboardType 键盘类型[0:全键盘，1：民用, 2：民用+武警]
     * @param {Number} currentIndex 当前输入位置
     * @param {String} provinceName 默认省份
     * @param {Number} numberType 用户预设车牌输入类型 0：自动探测车牌类型，5:新能源车牌(engine.NUM_TYPES)
     */
    args: {
      type: Object,
      default: () => {}
    },
    /**
     * 回掉接口
     */
    callbacks: {
      type: Object,
      default: () => {
        return {
          /**按键监听*/
          onkeypressed(key) {},
          /**车牌改变监听(车牌号，是否已完成)*/
          onchanged(presetNumber, isCompleted) {},
          /**车牌完成监听(车牌号，是否自动完成)*/
          oncompleted(presetNumber, isAutoCompleted) {},
          /**错误回调*/
          onmessage(message) {}
        };
      }
    }
  },
  data() {
    return {
      options: {
        presetNumber: '', //预设车牌号码
        keyboardType: 1, //键盘类型[0:全键盘，1：民用, 2：民用+武警]
        currentIndex: 0, //当前输入位置
        numberType: 0, //用户预设车牌输入类型 0：自动探测车牌类型，5:新能源车牌(engine.NUM_TYPES)
        provinceName: '', //省份
        showShortCut: false //是否显示快捷省份
      },
      prevNumber: '', //缓存上次车牌
      layout: {},
      currentKey: {} //缓存当前按键
    };
  },
  created() {
    this.init(this.args);
  },
  computed: {
    dyKeyCount() {
      return (this.dyKeyboard['row0'] || []).length;
    },
    dyKeyboard() {
      if (
        this.options.currentIndex === 0 &&
        (this.options.provinceName || '').length >= 2 &&
        this.options.showShortCut
      ) {
        let kb = this.updateShortcut();
        if (kb.shortcuts.length > 1) {
          try {
            return kb;
          } finally {
            this.submitprovince(kb);
          }
        } else {
          return this.updateKeyboard();
        }
      } else {
        return this.updateKeyboard();
      }
    }
  },
  methods: {
    /**
     * 初始化
     */
    init(args) {
      this.options = Object.assign({}, this.options, args);
      //showShortCut 没有传递进来时，默认通过 provinceName 来判断
      !args.hasOwnProperty('showShortCut') &&
        this.$set(
          this.options,
          'showShortCut',
          this.options.provinceName != undefined &&
            this.options.provinceName.length > 0
        );
    },
    /**
     * 更新配置项
     */
    updateArgs(args) {
      this.init(args);
    },
    /**
     * 更新键盘布局
     */
    updateKeyboard() {
      try {
        this.layout = engine.update(this.options);
      } catch (err) {
        this.callMethod(this.callbacks.onmessage, err.message);
        return this.layout;
      }
      // 判断输入车牌是否已完成
      try {
        if (this.prevNumber !== this.layout.presetNumber) {
          let isCompleted =
            this.layout.numberLength === this.layout.numberLimitLength;
          try {
            this.prevNumber = this.layout.presetNumber;
            this.callMethod(
              this.callbacks.onchanged,
              this.layout.presetNumber,
              isCompleted
            );
          } finally {
            if (isCompleted) {
              this.callMethod(
                this.callbacks.oncompleted,
                this.layout.presetNumber,
                true
              );
            }
          }
        }
      } catch (err) {
        console.error('SingleKeyboard:::', err);
      }
      this.autocommitsinglekey(this.layout);
      return this.layout;
    },
    /**
     * 更新键盘快捷键
     */
    updateShortcut() {
      return {
        shortcuts: provinces
          .locationOf(this.options.provinceName)
          .peripheryShortnames()
          .map(name => engine.$newKey(name))
          .slice(0, 6) // 只返回6个快捷键
      };
    },
    /**
     * 当键盘数据只有一个键位可选择时,自动提交点击事件:(武警车牌第二位J和使馆车最后一位)
     */
    autocommitsinglekey(layout) {
      if (!this.currentKey.isFunKey) {
        let availableKeys = layout.keys.filter(k => {
          return k.enabled && !k.isFunKey;
        });
        if (availableKeys.length === 1) {
          setTimeout(() => {
            this.onClickKey(availableKeys[0]);
          }, 32);
        }
      }
    },
    /**
     * 如果当前为空车牌号码，自动提交第一位快捷省份汉字
     */
    submitprovince(layout) {
      // 注意：如果是用户点击删除按钮，退回到第一位。则不自动提交第一位快捷省份汉字。
      // 注意：如果用户外部重新设置了空的车牌号码，则需要自动提交
      if (this.options.presetNumber.length === 0 && !this.currentKey.isFunKey) {
        setTimeout(() => {
          if (this.options.currentIndex === 0) {
            // 注意检查当自动提交省份时，输入框选中位置是否在第一位上
            this.onClickKey(layout.shortcuts[0]);
          }
        }, 32);
      }
    },
    /**
     * 键位点击回调
     */
    onClickKey(key) {
      key.FUN_DEL = engine.KEY_TYPES.FUN_DEL === key.keyCode; //删除
      key.FUN_OK = engine.KEY_TYPES.FUN_OK === key.keyCode; //确认
      this.currentKey = key;
      try {
        let autoSlice = this.callbacks.onkeypressed
          ? this.callbacks.onkeypressed(key)
          : true; //是否自动处理车牌录入，false：交由调用者在 onkeypressed 中处理车牌信息
        if (key.FUN_DEL) {
          if (autoSlice) {
            this.options.presetNumber = this.options.presetNumber.slice(
              0,
              this.options.presetNumber.length - 1
            );
          }
          this.layout.numberLength < this.layout.numberLimitLength &&
            this.options.currentIndex > 0 &&
            this.options.currentIndex--;
          this.options.currentIndex === 0 &&
            this.callMethod(
              this.callbacks.onchanged,
              this.options.presetNumber,
              false
            );
        } else if (!key.FUN_OK) {
          if (autoSlice) {
            if (this.layout.numberLength === this.layout.numberLimitLength) {
              this.options.presetNumber =
                this.options.presetNumber.slice(
                  0,
                  this.options.presetNumber.length - 1
                ) + key.text;
            } else {
              this.options.presetNumber += key.text;
            }
          }
          this.options.currentIndex === 0
            ? this.options.currentIndex++
            : this.options.currentIndex < this.layout.numberLimitLength - 1 &&
              this.options.currentIndex++;
        }
      } finally {
        if (key.FUN_OK) {
          this.callMethod(
            this.callbacks.oncompleted,
            this.options.presetNumber,
            false
          );
        }
      }
    },
    /**
     * 显示更多回调
     */
    onClickShowAll() {
      this.options.showShortCut = false;
    },
    /**
     * 执行回调
     */
    callMethod() {
      if (
        arguments[0] &&
        Object.prototype.toString.call(arguments[0]) === '[object Function]'
      ) {
        arguments[0].apply(
          this,
          Array.prototype.slice.call(arguments).slice(1)
        );
      }
    }
  },
  components: {
    'keyboard-view': KeyboardView
  }
};
</script>

<style global>
@import './keyboard.css';
</style>