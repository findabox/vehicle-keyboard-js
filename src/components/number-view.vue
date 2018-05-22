<template>
  <div class="r-border vehicle-input-widget">
    <div class="input-area">
      <ul class="inputrow">
        <li class="cell"
          v-for="(text, index) in numberArray"
          :key="index"
          :class="['lengthof-' + numberArray.length, 
                    {'show-holder': showHolder(text, index,currentIndex)}]"
          :selected="(index === currentIndex)">
          <button class="key"
            :style="{'line-height': numberType !== undefined ? '1' : '180%'}"
            @click="onCellSelected(index)">
            {{ handleHolder(text, index, currentIndex) }}
          </button>
        </li>
      </ul>
    </div>
    <div class="mode-switcher">
      <label class="mode--label">
        <input v-model="model"
          class="mode--radio"
          type="radio"
          value="1"
          name="mode-switcher">
        <span class="mode--radioInput" />普通车牌
      </label>
      <label class="mode--label">
        <input v-model="model"
          class="mode--radio"
          type="radio"
          value="2"
          name="mode-switcher">
        <span class="mode--radioInput" />新能源车牌
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'number-view',
  props: {
    /**
     * 号码数组
     */
    numberArray: {
      type: Array,
      default: () => []
    },
    /**
     * 用于显示的车牌模式（0：自动探测，5：新能源）
     * @link{engine.NUM_TYPES}
     */
    numberType: Number,
    /**
     * 选中的号码索引
     */
    currentIndex: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      model: '1'
    };
  },
  mounted() {
    try {
      document.querySelector(
        `.mode--radio[value="${this.model}"]`
      ).checked = true;
    } catch (error) {
      console.error(error);
    }
  },
  watch: {
    model(val) {
      this.onModeChanged();
    }
  },
  methods: {
    showHolder(text, index, currentIndex) {
      return (
        index === currentIndex && (!text || text === '' || text.length === 0)
      );
    },
    handleHolder(text, index, currentIndex) {
      return this.showHolder(text, index, currentIndex) ? '|' : text;
    },
    /**
     * 车牌显示模式切换
     */
    onModeChanged() {
      this.$emit('modechanged');
    },
    /**
     * 车牌号单元格选中事件
     * @param {Number} index 选中单元格下标
     */
    onCellSelected(index) {
      this.$emit('cellselected', index, true);
    }
  }
};
</script>

<style lang="scss">
.vehicle-input-widget {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  text-align: center;
  justify-content: center;
  background: none !important;

  .input-area {
    height: 178px;
    background: #ffffff;
    display: flex;
    align-items: center;
    ul.inputrow {
      -webkit-box-flex: 1;
      -webkit-flex: 1;
      flex: 1;
      display: -webkit-box;
      display: -webkit-flex;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      list-style: none;
      padding: 0;
      margin: 0 60px 0 60px;
      height: 90px;
      border: 2px solid rgba(113, 154, 255, 1);
      border-radius: 8px;
      li {
        height: 90px;
        -webkit-box-flex: 1;
        -webkit-flex: 1;
        flex: 1;
        &.cell {
          &:first-child:not(.show-holder) {
            background-color: rgba(113, 154, 255, 1);
            button {
              color: #ffffff;
            }
          }
          button {
            font-size: 50px;
            color: rgba(113, 154, 255, 1);
          }
          button.line-height-180 {
            line-height: 180%;
          }
        }
        &[selected='selected'].show-holder {
          button {
            font-size: 38px;
            color: #b2b2b2;
          }
        }
        &:not(:last-child) {
          border-right: 2px solid rgba(113, 154, 255, 1);
        }
        &:last-child[selected='selected'] {
          border-radius: 0 8px 8px 0;
        }
      }
    }
  }

  .mode-switcher {
    margin-top: 52px;
    .mode--label {
      display: inline-block;
      color: #719aff;
      font-size: 30px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      &:first-child {
        margin-right: 60px;
      }
    }
    .mode--radio {
      display: none;
    }
    .mode--radioInput {
      background-color: rgba(178, 178, 178, 0.5);
      border: 2px solid rgba(178, 178, 178, 1);
      border-radius: 100%;
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-right: 10px;
      margin-top: -1px;
      vertical-align: middle;
      line-height: 1;
    }
    .mode--radio:checked + .mode--radioInput {
      background-color: rgba(113, 154, 255, 0.5);
      border: 2px solid rgba(113, 154, 255, 1);
    }
  }
}
</style>