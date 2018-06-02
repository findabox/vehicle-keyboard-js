<template>
  <div class="mixed-keyboard-box">
    <number-view :number-array="numberArray"
      :number-type="dyDisplayMode"
      :current-index="options.currentIndex"
      @modechanged="onUserSetMode"
      @cellselected="onSelectedInput" />
    <slot />
    <single-keyboard ref="singleKeyboard"
      :style="keyboardStyle"
      :class="args.position"
      :args="options"
      :callbacks="singleCallbacks" />
  </div>
</template>

<script>
import NumberView from './number-view';
import SingleKeyboard from './single-keyboard';
let engine = require('./engine.js');
export default {
  name: 'mixed-keyboard',
  props: {
    /**
     * 参数配置项
     * @param {String} presetNumber 预设车牌号
     * @param {Number} keyboardType 键盘类型[0:全键盘，1：民用, 2：民用+武警]
     * @param {String} provinceName 默认省份
     * @param {Boolean} forceChangeMode 是否强制切换键盘类型（忽略当前录入车牌有效性）
     * @param {Boolean} autoComplete 是否自动完成
     * @param {Boolean} showConfirm 是否显示确定按钮
     * @param {Boolean} showKeyTips 是否显示按键提示框(点击按键弹出当前按键内容提示，类似输入法)
     * @param {String} position 键盘位置，取值范围 [static: 默认, bottom: 底部]
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
      options: {
        presetNumber: '', //预设车牌号码
        keyboardType: 1, //键盘类型[0:全键盘，1：民用, 2：民用+武警]
        provinceName: '', //省份
        currentIndex: 0, // 当前用户输入框已选中的序号
        showShortCut: true, // 需要显示省份简称
        forceChangeMode: true, //是否强制切换键盘类型
        numberType: engine.NUM_TYPES.AUTO_DETECT, // 车用户设定的车牌号码类型 0：自动探测车牌类型，5:新能源车牌
        autoComplete: true, //是否自动完成
        showConfirm: true, //是否显示确定按钮
        showKeyTips: false, //是否显示按键提示框
        position: ''
      },
      numberArray: ['', '', '', '', '', '', ''], // 用户输入的车牌数据
      userChanged: false, //用户是否外部修改了车牌号码
      singleCallbacks: {
        //// 回调函数
        onchanged: (presetNumber, isCompleted) => {
          this.callMethod(this.callbacks.onchanged, presetNumber, isCompleted);
        },
        oncompleted: (presetNumber, isAutoCompleted) => {
          this.callMethod(
            this.callbacks.oncompleted,
            presetNumber,
            isAutoCompleted
          );
        },
        onkeypressed: key => {
          if (key.isFunKey) {
            this.onFuncKeyClick(key);
          } else {
            this.onTextKeyClick(key.text);
          }
          this.callMethod(this.callbacks.onkeypressed, key);
          return true;
        },
        onmessage: message => {
          this.callMethod(this.callbacks.onmessage, message);
        }
      }
    };
  },
  created() {
    this.init();
  },
  watch: {
    options: {
      handler(val, oldVal) {
        this.$refs.singleKeyboard.updateArgs(val);
      },
      deep: true
    },
    detectNumberType(val) {
      this.options.numberType = val;
    }
  },
  computed: {
    /**
     * 当用户选择的车牌类型为非AUTO_DETECT类型时，使用用户强制设置类型：目前用户选择的类型有两个值：AUTO_DETECT / NEW_ENERGY
     */
    getNumberType() {
      if (this.options.numberType === engine.NUM_TYPES.NEW_ENERGY) {
        return engine.NUM_TYPES.NEW_ENERGY;
      }
      return engine.NUM_TYPES.AUTO_DETECT;
    },
    dyDisplayMode() {
      // 用于显示的车牌类型
      if (this.options.numberType === engine.NUM_TYPES.NEW_ENERGY) {
        return engine.NUM_TYPES.NEW_ENERGY;
      }
      return this.detectNumberType === engine.NUM_TYPES.NEW_ENERGY ?
        engine.NUM_TYPES.NEW_ENERGY :
        engine.NUM_TYPES.AUTO_DETECT;
    },
    /**
     * 预测的车牌类型
     */
    detectNumberType() {
      return engine.detectNumberType(
        this.options.presetNumber,
        this.options.numberType
      );
    },
    keyboardStyle() {
      return this.$slots && this.$slots.default > 0 ?
        {} :
        {
          'margin-top': '25px'
        };
    },
    isCompleted() {
      return this.numberArray.every(
        num => num && num !== '' && num !== null && num !== undefined
      );
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
      this.options.showShortCut = true;
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
        if (presetNumber.length > 2) {
          // 只输入前两个车牌号码，不参与校验
          let size = 8 - presetNumber.length;
          for (let i = 0; i < size; i++) presetNumber += '0';
          // 使用正则严格校验补全的车牌号码
          if (
            this.options.forceChangeMode === true ||
            this.isEnergyNumber(presetNumber)
          ) {
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
     * 选中输入框
     */
    onSelectedInput(index, shouldShowKeyboard) {
      let length = this.options.presetNumber.length;
      if (length > 0 && index <= length) {
        this.options.currentIndex = index;
      }
      if (true === shouldShowKeyboard) {
        /*强制显示键盘*/
        this.options.showShortCut = false;
      } else {
        this.options.showShortCut = this.options.currentIndex === 0;
      }
    },
    /**
     * 点击字符按键盘
     */
    onTextKeyClick(text, forceUpdate) {
      if (
        true === forceUpdate ||
        text !== this.numberArray[this.options.currentIndex]
      ) {
        this.setNumberTxtAt(this.options.currentIndex, text);
      }
      this.selectNextIndex(); // 选中下一个输入框
    },
    /**
     * 点击功能键
     */
    onFuncKeyClick(key) {
      if (key.keyCode === engine.KEY_TYPES.FUN_DEL) {
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
      if (updateNumber !== undefined && updateNumber.length !== 0) {
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
    'single-keyboard': SingleKeyboard
  }
};
</script>

<style lang="scss">
.mixed-keyboard-box {
  .single-keyboard-box.bottom {
    position: absolute;
    bottom: 30px;
  }
}
</style>