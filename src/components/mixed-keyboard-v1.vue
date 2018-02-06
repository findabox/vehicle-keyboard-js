<template>
  <div :class="['mixed-keyboard-box', hasSlot ? 'has-slot' : '']">
    <number-view :numberArray="numberArray"
      :numberType="dyDisplayMode"
      :currentIndex="options.currentIndex"
      @modechanged="onUserSetMode"
      @cellselected="onUserSelectedInput" />
    <div class="divider" />
    <slot></slot>
    <keyboard-view :keyboard="dyKeyboard"
      :keycount="dyKeyCount"
      @keyclick="onClickKey"
      @moreclick="onClickShowAll" />
  </div>
</template>

<script>
import NumberView from './number-view';
import KeyboardView from './keyboard-view';
let engine = require('./engine.js');
let provinces = require('./provinces.js');
export default {
  name: 'mixed-keyboard',
  props: {
    /**
     * 参数配置项
     * @param {String} presetNumber 预设车牌号
     * @param {Number} keyboardType 键盘类型[0:全键盘，1：民用, 2：民用+武警]
     * @param {String} provinceName 默认省份
     * @param {Boolean} forceChangeMode 是否强制切换键盘类型（忽略当前录入车牌有效性）
     */
    args: {
      type: Object,
      default: () => {}
    },
    /**
     * 回调函数
     */
    callbacks: {
      type: Object,
      default: () => {
        return {
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
      clickEvent: {
        //点击事件
        KEY: 0,
        OK: 1,
        DEL: 2
      },
      options: {
        presetNumber: '', //预设车牌号码
        keyboardType: 1, //键盘类型[0:全键盘，1：民用, 2：民用+武警]
        provinceName: '', //省份
        forceChangeMode: true, //是否强制切换键盘类型
        numberType: engine.NUM_TYPES.AUTO_DETECT, // 车用户设定的车牌号码类型 0：自动探测车牌类型，5:新能源车牌
        currentIndex: 0 // 当前用户输入框已选中的序号
      },
      numberArray: ['', '', '', '', '', '', ''], // 用户输入的车牌数据
      detectNumberType: engine.NUM_TYPES.AUTO_DETECT, // 识别的车牌号码类型
      clickEventType: 0, // 用户动作类型(clickEvent.KEY)
      showShortcuts: true, // 需要显示省份简称
      userChanged: false //用户是否外部修改了车牌号码
    };
  },
  created() {
    this.init();
  },
  computed: {
    /**
     * 是否含有 slot，用于处理自定义视图
     */
    hasSlot() {
      return this.$slots.default && this.$slots.default.length > 0;
    },
    /**
     * 当用户选择的车牌类型为非AUTO_DETECT类型时，使用用户强制设置类型：目前用户选择的类型有两个值：AUTO_DETECT / NEW_ENERGY
     */
    getNumberType() {
      if (this.options.numberType === engine.NUM_TYPES.NEW_ENERGY) {
        return engine.NUM_TYPES.NEW_ENERGY;
      } else {
        return engine.NUM_TYPES.AUTO_DETECT;
      }
    },
    dyKeyCount() {
      return (this.dyKeyboard['row0'] || []).length;
    },
    dyDisplayMode() {
      // 用于显示的车牌类型
      if (this.options.numberType === engine.NUM_TYPES.NEW_ENERGY) {
        return engine.NUM_TYPES.NEW_ENERGY;
      } else {
        return this.detectNumberType === engine.NUM_TYPES.NEW_ENERGY
          ? engine.NUM_TYPES.NEW_ENERGY
          : engine.NUM_TYPES.AUTO_DETECT;
      }
    },
    dyKeyboard() {
      if (
        0 === this.options.currentIndex && // 选中第一位输入框时；
        (this.options.provinceName || '').length >= 2 && // 当前为有效的省份名字
        this.showShortcuts
      ) {
        // 标记为强制显示快捷省份；
        let keyboard = {
          shortcuts: provinces
            .locationOf(this.options.provinceName)
            .peripheryShortnames()
            .map(name => engine.$newKey(name))
            .slice(0, 6) // 只返回6个
        };
        // 如果快捷省份数据不存在(快捷省份包括当前省份和周边省份数据)，则返回全键盘数据。
        if (keyboard.shortcuts.length > 1) {
          try {
            return keyboard;
          } finally {
            this.submitprovince(keyboard);
          }
        }
      }
      return this.updatekeyboard();
    }
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      this.options = Object.assign({}, this.options, this.args);
      this.$set(this.options, 'numberType', this.getNumberType);
      this.numberArray = this.rebuildNumberArray(
        this.options.presetNumber,
        this.numberArray.length /*要保证与原生长度一致*/
      );
      // 在用户更新车牌后，选中位置设置为当前车牌可输入的最后一位
      this.options.currentIndex = Math.max(
        0,
        Math.min(this.numberArray.length - 1, this.options.presetNumber.length)
      );
      this.userChanged = true;
      this.showShortcuts = true;
    },
    /**
     * 车牌是否已输入完成
     */
    isCompleted() {
      return this.options.presetNumber.length === this.numberArray.length;
    },
    /**
     * 选中下一个输入序号的输入框
     */
    selectNextIndex() {
      let next = this.options.currentIndex + 1;
      if (next <= this.numberArray.length - 1 /*限定在最大长度*/) {
        this.options.currentIndex = next;
      }
    },
    /**
     * 设置当前选择号码的位置
     */
    setNumberTxtAt(index, text) {
      this.$set(this.numberArray, index, text);
      this.resetUserChanged();
    },
    /**
     * 切换新能源车牌（8位）
     */
    setLengthTo8() {
      // 当前长度为7位长度时才允许切换至8位长度
      if (this.numberArray.length === 7) {
        // 扩展第8位：当前选中第7位，并且第7位已输入有效字符时，自动跳转到第8位
        if (
          6 === this.options.currentIndex &&
          this.options.presetNumber.length === 7
        ) {
          this.options.currentIndex = 7;
        }
        this.numberArray.push('');
        this.resetUserChanged();
      }
    },
    /**
     * 切换普通车牌（7位）
     */
    setLengthTo7() {
      if (this.numberArray.length === 8) {
        if (7 === this.options.currentIndex) {
          // 处理最后一位的选中状态
          this.options.currentIndex = 6;
        }
        this.numberArray.pop();
        this.resetUserChanged();
      }
    },
    /**
     * 重置外部用户修改车牌标记位
     */
    resetUserChanged() {
      this.options.presetNumber = this.numberArray.join('');
      this.userChanged = false;
    },
    /**
     * 同步输入框长度
     * @param {String} 输入类型（车牌类型）
     * @param {Boolean} forceNewEnergyMode 强制新能源车牌
     */
    syncInputLength(numberType, forceNewEnergyMode) {
      // 键盘引擎根据输入参数，会自动推测出当前车牌的类型。
      // 如果当前用户没有强制设置，更新键盘的输入框长度以适当当前的车牌类型,（指地方武警车牌，长度为8位）
      if (forceNewEnergyMode) {
        // 强制新能源类型，应当设置为：8位
        this.setLengthTo8();
      } else {
        if (
          engine.NUM_TYPES.WUJING_LOCAL === numberType ||
          engine.NUM_TYPES.NEW_ENERGY === numberType
        ) {
          // 地方武警，应当设置为：8位
          this.setLengthTo8();
        } else {
          // 其它车牌，应当设置为：7位
          this.setLengthTo7();
        }
      }
    },
    /**
     * 切换用户强制车牌类型
     */
    onUserSetMode() {
      // 如果当前车牌为武警车牌，不可切换：
      if (
        this.detectNumberType === engine.NUM_TYPES.WUJING ||
        this.detectNumberType === engine.NUM_TYPES.WUJING_LOCAL
      ) {
        this.callMethod(this.callbacks.onmessage, '武警车牌，请清空再切换');
        return;
      }
      if (this.options.numberType === engine.NUM_TYPES.NEW_ENERGY) {
        this.options.numberType = engine.NUM_TYPES.AUTO_DETECT;
      } else {
        // 已输入普通车牌如果不符合新能源车牌方式，不能切换为新能源车牌：
        let presetNumber = this.options.presetNumber;
        if (this.options.forceChangeMode !== true && presetNumber.length > 2) {
          // 只输入前两个车牌号码，不参与校验
          let size = 8 - presetNumber.length;
          for (let i = 0; i < size; i++) presetNumber += '0';
          // 使用正则严格校验补全的车牌号码
          if (this.isEnergyNumber(presetNumber)) {
            this.options.numberType = engine.NUM_TYPES.NEW_ENERGY;
          } else {
            this.callMethod(
              this.callbacks.onmessage,
              '非新能源车牌，请清空再切换'
            );
            return;
          }
        } else {
          this.options.numberType = engine.NUM_TYPES.NEW_ENERGY;
        }
      }
      // 如果用户切换为新能源类型，则需要修改输入长度为8位：
      if (this.options.numberType === engine.NUM_TYPES.NEW_ENERGY) {
        this.setLengthTo8();
      } else {
        this.setLengthTo7();
      }
    },
    /**
     * 点击显示更多省份信息
     */
    onClickShowAll() {
      this.onUserSelectedInput(0, true /*强制显示键盘*/);
    },
    /**
     * 选中输入框
     */
    onUserSelectedInput(index, shouldShowKeyboard) {
      let length = this.options.presetNumber.length;
      if (length > 0 && index <= length) {
        this.options.currentIndex = index;
      }
      if (true === shouldShowKeyboard) {
        /*强制显示键盘*/
        this.showShortcuts = false;
      } else {
        this.showShortcuts = this.options.currentIndex === 0;
      }
    },
    /**
     * 点击键位
     */
    onClickKey(key) {
      if (key.isFunKey) {
        this.onFuncKeyClick(key);
      } else {
        this.onTextKeyClick(key.text);
      }
    },
    /**
     * 点击字符按键盘
     */
    onTextKeyClick(text, forceUpdate) {
      this.clickEventType = this.clickEvent.KEY;
      if (
        true === forceUpdate ||
        text !== this.numberArray[this.options.currentIndex]
      ) {
        this.setNumberTxtAt(this.options.currentIndex, text);
      }
      let lastInput = this.numberArray.length - 1 === this.options.currentIndex;
      let completed = this.isCompleted();
      this.selectNextIndex(); // 选中下一个输入框
      try {
        // 通知其它回调函数
        this.callMethod(
          this.callbacks.onchanged,
          this.options.presetNumber,
          completed,
          this.detectNumberType
        );
      } finally {
        // 当输入最后一位字符并且已输入完成时，自动提交完成接口
        if (lastInput && completed) {
          this.callMethod(
            this.callbacks.oncompleted,
            this.options.presetNumber,
            true,
            this.detectNumberType
          );
        }
      }
    },
    /**
     * 点击功能键
     */
    onFuncKeyClick(key) {
      if (key.keyCode === engine.KEY_TYPES.FUN_DEL) {
        this.clickEventType = this.clickEvent.DEL;
        // 删除车辆号码的最后一位
        let maxIndex = this.numberArray.length - 1;
        let deleteIndex = Math.max(0, maxIndex);
        for (let i = maxIndex; i >= 0; i--) {
          if (this.numberArray[i].length !== 0) {
            deleteIndex = i;
            break;
          }
        }
        this.setNumberTxtAt(deleteIndex, '');
        // 更新删除时的选中状态
        this.options.currentIndex = deleteIndex;
        this.callMethod(
          this.callbacks.onchanged,
          this.options.presetNumber,
          false,
          this.detectNumberType
        );
      } else if (key.keyCode === engine.KEY_TYPES.FUN_OK) {
        this.clickEventType = this.clickEvent.OK;
        // 用户主动点击“确定”按钮，触发回调

        this.callMethod(
          this.callbacks.oncompleted,
          this.options.presetNumber,
          false,
          this.detectNumberType
        );
      }
    },
    /**
     * 更新键盘：当WidgetInput上的数据发生变化时，会触发键盘更新
     */
    updatekeyboard() {
      let updatedKeyboard = engine.update(this.options);
      this.detectNumberType = updatedKeyboard.numberType;
      // 将识别结果的车牌类型同步到用户选择类型上
      if (updatedKeyboard.numberType === engine.NUM_TYPES.NEW_ENERGY) {
        this.options.numberType = engine.NUM_TYPES.NEW_ENERGY;
      } else {
        this.options.numberType = engine.NUM_TYPES.AUTO_DETECT;
      }
      this.syncInputLength(
        updatedKeyboard.numberType,
        this.options.numberType ===
          engine.NUM_TYPES.NEW_ENERGY /*force to set NewEnergy numberType*/
      );
      this.autocommitsinglekey(updatedKeyboard);
      return updatedKeyboard;
    },
    /**
     * 当键盘数据只有一个键位可选择时,自动提交点击事件:(武警车牌第二位J和使馆车最后一位)
     */
    autocommitsinglekey(layout) {
      if (this.clickEventType === this.clickEvent.KEY) {
        let availableKeys = layout.keys.filter(k => {
          return k.enabled && !k.isFunKey;
        });
        if (availableKeys.length === 1) {
          setTimeout(() => {
            this.onTextKeyClick(availableKeys[0].text);
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
      if (
        this.options.presetNumber.length === 0 &&
        (this.clickEventType === this.clickEvent.KEY || this.userChanged)
      ) {
        setTimeout(() => {
          if (this.options.currentIndex === 0) {
            // 注意检查当自动提交省份时，输入框选中位置是否在第一位上
            this.onTextKeyClick(layout.shortcuts[0].text);
          }
        }, 32);
      }
    },
    /**
     * 将车牌号码，生成一个车牌字符数组
     */
    rebuildNumberArray(updateNumber, originLength) {
      let output = ['', '', '', '', '', '', '']; // 普通车牌长度为7位，最大长度为8位
      if (originLength > 7) {
        output.push('');
      }
      if (updateNumber != undefined && updateNumber.length != 0) {
        let size = Math.min(8, updateNumber.length);
        for (let i = 0; i < size; i++) {
          output[i] = updateNumber.charAt(i);
        }
      }
      return output;
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
    },
    /**
     * 正则校验车牌号码
     */
    isEnergyNumber(presetNumber) {
      return /\W[A-Z][0-9DF][0-9A-Z]\d{3}[0-9DF]/.test(presetNumber);
    }
  },
  components: {
    'number-view': NumberView,
    'keyboard-view': KeyboardView
  }
};
</script>

<style lang="scss" scoped>
@import './keyboard.css';
/* 键盘框的高度，占比为 80% */
div.divider {
  height: 3%;
}
div.keyboard {
  height: 77%;
}
div.mixed-keyboard-box.has-slot {
  height: auto;
  .keyboard {
    height: 13rem;
  }
  div.input-widget {
    height: 3rem;
  }
}
</style>