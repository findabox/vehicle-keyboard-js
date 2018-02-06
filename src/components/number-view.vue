<template>
  <div class="r-border input-widget">
    <div class="mode-switcher"
      v-if="numberType !== undefined"
      @click="onModeChanged"
      :class="'modeof-' + numberType" />
    <ul class="inputrow"
      :style="{'flex': numberType !== undefined ? '0 1 90%' : '1'}">
      <li class="cell"
        v-for="(text, index) in numberArray"
        :key="index"
        :class="'lengthof-' + numberArray.length"
        :selected="(index == currentIndex)">
        <button class="key"
          :style="{'line-height': numberType !== undefined ? '1' : '180%'}"
          @click="onCellSelected(index)">{{ text }}</button>
      </li>
    </ul>
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
  methods: {
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

<style lang="scss" scoped>
div.input-widget {
  border: 1px solid #cccccc;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 20%;
  text-align: center;
  justify-content: center;
  background: #ffffff;
  height: 3rem;
  div.mode-switcher {
    border-right: 1px solid #cccccc;
    -webkit-box-flex: 0.1;
    -webkit-flex: 0 1 10%;
    flex: 0 1 10%;
    text-align: center;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 8.5vh;
  }

  @media all and (min-width: 640px) {
    div.mode-switcher {
      background-size: 9vh;
    }
  }
  @media all and (max-width: 480px) {
    div.mode-switcher {
      background-size: 7vw;
    }
  }

  /*Mode 5 新能源键盘图标启用状态 */
  div.mode-switcher.modeof-5,
  div.mode-switcher.modeof-0 {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc5OCcgaGVpZ2h0PSc5OCcgdmlld0JveD0nMCAwIDk4IDk4Jz48ZGVmcz48c3R5bGU+LmV2ZW5vZGQge2ZpbGwtcnVsZTogZXZlbm9kZDt9PC9zdHlsZT48L2RlZnM+PGNpcmNsZSBmaWxsPScjMzA5NzdkJyBjeD0nNDknIGN5PSc0OScgcj0nNDgnLz48Y2lyY2xlIGZpbGw9JyM1OGI4YTAnIGN4PSc0OScgY3k9JzQ5JyByPSc0NCcvPjxwYXRoIGZpbGw9JyMzNmIwZTQnIGNsYXNzPSdldmVub2RkJyBkPSdNMTIuMTI5LDI1YTQzLjk4Niw0My45ODYsMCwwLDEsNzMuNzQxLDBIMTIuMTI5WicvPjxwYXRoIGZpbGw9JyMzOGJlNzAnIGNsYXNzPSdldmVub2RkJyBkPSdNMTIuMTI5LDczSDg1Ljg3MUE0My45ODYsNDMuOTg2LDAsMCwxLDEyLjEyOSw3M1onLz48cGF0aCBmaWxsPScjZWM0Njg4JyBjbGFzcz0nZXZlbm9kZCcgZD0nTTEyLjEyOSwyNUg4NS44NzFhNDMuNzMzLDQzLjczMywwLDAsMSw2LjIsMTVINS45MjVBNDMuNzMzLDQzLjczMywwLDAsMSwxMi4xMjksMjVaJy8+PHBhdGggZmlsbD0nI2QwZTIzZicgY2xhc3M9J2V2ZW5vZGQnIGQ9J002LjE1NSw1OUg5MS44NDVhNDMuNzQyLDQzLjc0MiwwLDAsMS01Ljk3NCwxNEgxMi4xMjlBNDMuNzQzLDQzLjc0MywwLDAsMSw2LjE1NSw1OVonLz48cGF0aCBmaWxsPScjZWM5ODQxJyBjbGFzcz0nZXZlbm9kZCcgZD0nTTUsNDlBNDQuMDkyLDQ0LjA5MiwwLDAsMSw2LjE1NSwzOUg5MS44NDVhNDMuODU2LDQzLjg1NiwwLDAsMSwwLDIwSDYuMTU1QTQ0LjA5Miw0NC4wOTIsMCwwLDEsNSw0OVonLz48cGF0aCBmaWxsPScjZmZmZmZmJyBjbGFzcz0nZXZlbm9kZCcgZD0nTTUuMDUxLDUxSDYxdjRINS40MThDNS4yMzgsNTMuNjg0LDUuMTExLDUyLjM1MSw1LjA1MSw1MVptMC4zNjctOEg2MXY0SDUuMDUxQzUuMTExLDQ1LjY0OSw1LjIzOCw0NC4zMTYsNS40MTgsNDNaJy8+PHBhdGggZmlsbD0nIzEwMjYxZScgY2xhc3M9J2V2ZW5vZGQnIGQ9J002MSw5MS4zM1Y3M0gzNS4yMTVMMjUuMDYzLDYyLjgzNmEyLjk4NCwyLjk4NCwwLDAsMSwuNzU4LTUuODE4YzAtLjAwNiwwLTAuMDEyLTAuMDA1LTAuMDE4SDYxVjQxSDI1LjIyMWMwLjAyNi0uMDI5LjA0NS0wLjA2MywwLjA3LTAuMDkzQTIuOTc0LDIuOTc0LDAsMCwxLDIzLjcsMzYuMWMtMC4wNjItLjAxNS0wLjEyLTAuMDM4LTAuMTgyLTAuMDQ4TDM0LjksMjVINjFWNi42N0E0NCw0NCwwLDAsMSw2MSw5MS4zM1onLz48cGF0aCBmaWxsPScjZmZmZmZmJyBjbGFzcz0nZXZlbm9kZCcgZD0nTTY1LDg1LjAwNlY2OUgzN2wtOC04SDY1VjM3SDI5bDgtOEg2NVYxMi45OTRBMzkuMDEsMzkuMDEsMCwwLDEsNjUsODUuMDA2WicvPjwvc3ZnPg==');
  }

  /*Mode 0 新能源键盘图标禁用状态 */
  div.mode-switcher.modeof-0 {
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
    filter: gray;
  }

  ul.inputrow {
    -webkit-box-flex: 0.9;
    -webkit-flex: 0 1 90%;
    flex: 0 1 90%;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    list-style: none;
    padding: 0;
    margin: 0;
    height: 100%;
    li {
      height: 100%;
    }
    .lengthof-8 {
      -webkit-box-flex: 0.125;
      -webkit-flex: 0 1 12.5%;
      flex: 0 1 12.5%;
    }
    .lengthof-7 {
      -webkit-box-flex: 0.1428;
      -webkit-flex: 0 1 14.28%;
      flex: 0 1 14.28%;
    }
    .cell {
      button {
        font-size: 5vh;
      }
      /*Landscape*/
      @media all and (min-width: 640px) {
        button {
          font-size: 9vh;
        }
      }

      /*Portrait*/
      @media all and (max-width: 480px) {
        button {
          font-size: 7vw;
        }
      }
      button.line-height-180 {
        line-height: 180%;
      }
    }
    li:not(:last-child) {
      border-right: 1px solid #cccccc;
    }
    li[selected='selected'] {
      border: 1px solid #29a0dc;
    }
  }
}
</style>