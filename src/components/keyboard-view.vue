<template>
  <div class="vehicle-keyboard"
    v-if="hasShortcut">
    <shortcut-view :shortcuts="shortcuts"
      @keyrowclick="onKeyClick"
      @showmoreclick="onShowMoreClick" />
  </div>
  <div class="vehicle-keyboard"
    v-else>
    <row-view :keys="keyboard.row0"
      :keycount="keycount"
      :rowcount="rc"
      @keyrowclick="onKeyClick" />
    <row-view :keys="keyboard.row1"
      :keycount="keycount"
      :rowcount="rc"
      @keyrowclick="onKeyClick" />
    <row-view :keys="keyboard.row2"
      :keycount="keycount"
      :rowcount="rc"
      @keyrowclick="onKeyClick" />
    <row-view :keys="keyboard.row3"
      :keycount="keycount"
      :rowcount="rc"
      @keyrowclick="onKeyClick"
      :isfunc="keyboard.row4.length == 0"
      :show-confirm="showConfirm" />
    <row-view :keys="keyboard.row4"
      :keycount="keycount"
      :rowcount="rc"
      @keyrowclick="onKeyClick"
      :isfunc="true"
      :show-confirm="showConfirm"
      v-if="keyboard.row4.length > 0" />
    <div class="r-border keytip"
      v-if="tipText != ''"
      :style="{'left': tipPosX, 'top': tipPosY}">{{ tipText }} </div>
  </div>
</template>

<script>
import KeyRowView from './key-row-view';
import ShortcutView from './shortcut-view';
export default {
  props: {
    /**
     * 键盘组件的数据对象，用于传递键盘每行的数据
     */
    keyboard: {
      type: Object,
      default: () => {}
    },
    /**
     * 指定每行的键位数量
     */
    keycount: {
      type: Number,
      default: 0
    },
    /**
     * 是否显示确认按钮
     */
    showConfirm: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return { tipText: '', tipPosX: '0px', tipPosY: '0px' };
  },
  computed: {
    /**
     * 行数
     */
    rc() {
      return (this.keyboard['row4'] || []).length === 0 ? 4 : 5;
    },
    /**
     * 快捷键
     */
    shortcuts() {
      return this.keyboard['shortcuts'] || [];
    },
    /**
     * 是否存在快捷键
     */
    hasShortcut() {
      return this.shortcuts.length > 0;
    }
  },
  methods: {
    /**
     * 触发显示键位提示框
     * @param {Object} key 键位
     * @param {Event} evt
     */
    onKeyEvent(key, evt) {
      let self = this;
      let _reset = function() {
        self.tipText = '';
      };
      if (key.enabled && !key.isFunKey) {
        this.tipText = key.text;
        let dom = evt.target;
        // 60px 是tooltip的固定宽度
        // 62px 是tooltip的固定高度 + 间隔
        this.tipPosX =
          dom.offsetLeft - Math.abs(60 - dom.clientWidth) / 4 + 'px';
        this.tipPosY = dom.offsetTop - 62 + 'px';
        setTimeout(_reset, 250);
      } else {
        _reset();
      }
    },
    /**
     * 键位点击事件
     * @param {Object} key 键位
     * @param {Event} evt
     */
    onKeyClick(key, evt) {
      this.$emit('keyclick', key);
      evt && this.onKeyEvent(key, evt);
    },
    /**
     * 显示更多事件
     */
    onShowMoreClick() {
      this.$emit('moreclick');
    }
  },
  components: {
    'row-view': KeyRowView,
    'shortcut-view': ShortcutView
  }
};
</script>