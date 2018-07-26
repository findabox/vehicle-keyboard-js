<template>
  <ul class="vehicle-keyrow"
    :class="[ {'funcrow': (isfunc === true)}, ('rowsof-' + rowcount) ]">
    <li v-for="(key, i) in keys"
      :key="i"
      :class="['keysof-' + keyLength,{'ie9':IEVersion > 0 && IEVersion <= 9}]"
      :style="liStyle(i)">
      <button tag="button"
        ref="buttonKey"
        class="key r-border txt-key"
        :class="[ ('keycodeof-' + key.keyCode), {'disabled': (!key.enabled)}]"
        :disabled="(!key.enabled)"
        @click="onButtonClick(key, arguments[0])">
        {{ buttonTextFilter(key) }}
      </button>
    </li>
  </ul>
</template>
<script>
import { KEY_TYPES } from './engine';
export default {
  props: {
    /**
     * 行数
     */
    rowcount: {
      type: Number,
      default: 0
    },
    /**
     * 键位
     */
    keys: {
      type: Array,
      default: () => []
    },
    /**
     * 是否当前行存在Function按键（确定按钮）
     */
    isfunc: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示确认按钮
     */
    showConfirm: {
      type: Boolean,
      default: false
    },
    /**
     * 当前行键位数量
     */
    keycount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      KeyTypes: KEY_TYPES
    };
  },
  created() {
    this.initKeys();
    this.$nextTick(() => {
      this.$refs.buttonKey.forEach(button =>
        button.addEventListener('contextmenu', function(e) {
          e.preventDefault();
        })
      );
    });
  },
  watch: {
    keys(val) {
      this.initKeys();
    }
  },
  computed: {
    keyLength() {
      let length = this.keys.length + (this.isfunc ? 1 : 0);
      return length > this.keycount ? length : this.keycount;
    },
    IEVersion() {
      var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
      var isIE =
        userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1; //判断是否IE<11浏览器
      var isEdge = userAgent.indexOf('Edge') > -1 && !isIE; //判断是否IE的Edge浏览器
      var isIE11 =
        userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
      if (isIE) {
        var reIE = new RegExp('MSIE (\\d+\\.\\d+);');
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp['$1']);
        if (fIEVersion === 7) {
          return 7;
        } else if (fIEVersion === 8) {
          return 8;
        } else if (fIEVersion === 9) {
          return 9;
        } else if (fIEVersion === 10) {
          return 10;
        } 
        return 6; //IE版本<=7
        
      } else if (isEdge) {
        return 'edge'; //edge
      } else if (isIE11) {
        return 11; //IE11
      } 
      return -1; //不是ie浏览器
      
    }
  },
  methods: {
    initKeys() {
      if (this.isfunc && !this.showConfirm) {
        let confirmKey = this.keys[this.keys.length - 1],
          deleteKey = this.keys[this.keys.length - 2];
        if (
          confirmKey &&
          this.isFunOk(confirmKey) &&
          deleteKey &&
          deleteKey.keyCode === this.KeyTypes.FUN_DEL
        ) {
          this.keys.pop();
          this.keys.pop();
          this.keys.push({ text: '' });
          this.keys.push(deleteKey);
        }
      }
    },
    /**
     * 兼容IE9
     */
    liStyle(index) {
      if (index === 0 && !this.isfunc) {
        if (
          this.IEVersion > 0 &&
          this.IEVersion <= 9 &&
          this.keys.length < this.keycount
        ) {
          //IE9及以下浏览器
          return {
            marginLeft: `calc((100% - .3125rem * ${this.keycount - 1}) /${
              this.keycount
            }*${(this.keycount - this.keys.length) / 2})`
          };
        }
      }
      return {};
    },
    /**
     * 是否是确定键
     */
    isFunOk(key) {
      return key.keyCode === this.KeyTypes.FUN_OK;
    },
    /**
     * 按钮文本过滤器
     * @param {Object} key 键位
     */
    buttonTextFilter(key) {
      if (
        !key.text ||
        '←' === key.text ||
        key.keyCode === this.KeyTypes.FUN_DEL
      ) {
        return '';
      }
      if (this.isFunOk(key) && !this.showConfirm) {
        return '';
      }
      return key.text;
    },
    /**
     * 键位点击事件
     * @param {Object} key 键位对象
     * @param {Event} event 按钮事件Event
     */
    onButtonClick(key, event) {
      if (key.enabled) {
        this.$emit('keyrowclick', key, event);
      }
    }
  }
};
</script>

<style lang="scss">
.vehicle-keyrow {
  margin: 0;
  border: 0;
  padding: 0;
  font: inherit;
  vertical-align: baseline;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  flex-direction: row;
  flex-wrap: nowrap;
  list-style: none;

  /*上下之间每行间隔*/
  &:not(:first-child) {
    margin-top: 0.25rem;
  }

  &.rowsof-5 {
    height: -webkit-calc((100% - 0.25rem * 4)/5);
    height: calc((100% - 0.25rem * 4) / 5);
  }

  &.rowsof-4 {
    height: -webkit-calc((100% - 0.25rem * 3)/4);
    height: calc((100% - 0.25rem * 3) / 4);
  }

  /*需要设置button在所有父节点上的百分比*/
  & > li {
    height: 100%;
    //禁止长按选择文字
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /*按键左右间隔为5像素*/
  & > li:not(:last-child) {
    margin-right: 0.3125rem;
    &.ie9 {
      margin-right: 0.3rem;
    }
  }

  /* 增加按键样式 */
  & > li {
    float: left;
    /*动态计算每个按键的宽度, 按每行按键个数来计算*/
    &.keysof-12 {
      -webkit-box-flex: 0.9;
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 11)/12);
      flex: 0 1 calc((100% - 0.3125rem * 11) / 12);
      width: calc((100% - 0.3125rem * 11) / 12);
    }
    &.keysof-11 {
      -webkit-box-flex: 0.9;
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 10)/11);
      flex: 0 1 calc((100% - 0.3125rem * 10) / 11);
      width: calc((100% - 0.3125rem * 10) / 11);
    }
    &.keysof-10 {
      -webkit-box-flex: 0.095;
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 9)/10);
      flex: 0 1 calc((100% - 0.3125rem * 9) / 10);
      width: calc((100% - 0.3125rem * 9) / 10);
    }
    &.keysof-9 {
      -webkit-box-flex: 0.12;
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 8)/8);
      flex: 0 1 calc((100% - 0.3125rem * 8) / 9);
      width: calc((100% - 0.3125rem * 8) / 9);
    }
    &.keysof-7 {
      -webkit-box-flex: 0.14;
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 6)/6);
      flex: 0 1 calc((100% - 0.3125rem * 6) / 7);
      width: calc((100% - 0.3125rem * 6) / 7);
    }
  }

  /*在最后一行最后一个键,如果存在"确定"键,这个按键的宽度为2倍*/
  &.funcrow > li {
    &.keysof-12:last-child {
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 11)/12 * 2 + 0.3125rem);
      flex: 0 1 calc((100% - 0.3125rem * 11) / 12 * 2 + 0.3125rem);
      width: calc((100% - 0.3125rem * 11) / 12 * 2 + 0.3125rem);
    }
    &.keysof-11:last-child {
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 10)/11 * 2 + 0.3125rem);
      flex: 0 1 calc((100% - 0.3125rem * 10) / 11 * 2 + 0.3125rem);
      width: calc((100% - 0.3125rem * 10) / 11 * 2 + 0.3125rem);
    }
    &.keysof-10:last-child {
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 9)/10 * 2 + 0.3125rem);
      flex: 0 1 calc((100% - 0.3125rem * 9) / 10 * 2 + 0.3125rem);
      width: calc((100% - 0.3125rem * 9) / 10 * 2 + 0.3125rem);
    }
    &.keysof-9:last-child {
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 8)/9 * 2 + 0.3125rem);
      flex: 0 1 calc((100% - 0.3125rem * 8) / 9 * 2 + 0.3125rem);
      width: calc((100% - 0.3125rem * 8) / 9 * 2 + 0.3125rem);
    }
    &.keysof-7:last-child {
      -webkit-flex: 0 1 -webkit-calc((100% - 0.3125rem * 6)/7 * 2 + 0.3125rem);
      flex: 0 1 calc((100% - 0.3125rem * 6) / 7 * 2 + 0.3125rem);
      width: calc((100% - 0.3125rem * 6) / 7 * 2 + 0.3125rem);
    }
  }

  /*确定按键的背景颜色*/
  button.keycodeof-2:not(:disabled) {
    background-color: #4e8af9;
    color: white;
  }

  /*删除按键，按键码为1*/
  button.keycodeof-1 {
    color: transparent;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 1rem;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NiIgaGVpZ2h0PSI0NiIgdmlld0JveD0iMCAwIDQ2IDQ2Ij48cGF0aCBmaWxsPSIjOTk5IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik00MiwzOUgxOGExLjk5LDEuOTksMCwwLDEtLjQ2Mi0wLjA1OSwzLjI2OCwzLjI2OCwwLDAsMS0yLjg4LS45MDZMMS45MTQsMjUuMjkxYTMuMjc3LDMuMjc3LDAsMCwxLDAtNC42MzRMMTQuNjU3LDcuOTE0YTMuMjY4LDMuMjY4LDAsMCwxLDMuMDA5LS44OEExLjk5MywxLjk5MywwLDAsMSwxOCw3SDQyYTQsNCwwLDAsMSw0LDRWMzVBNCw0LDAsMCwxLDQyLDM5Wk0zNy43LDE2Ljg0N0wzMS41MywyM2w2LjE0NSw2LjE0NWExLjA4NywxLjA4NywwLDEsMS0xLjUzNywxLjUzN0wyOS45OTEsMjQuNTRsLTYuMTI4LDYuMTE2YTEuMDg2LDEuMDg2LDAsMCwxLTEuNTM3LTEuNTM0TDI4LjQ1NSwyMywyMi4zLDE2Ljg1MWExLjA4NywxLjA4NywwLDAsMSwxLjUzNy0xLjUzN2w2LjE1NSw2LjE1NSw2LjE2OC02LjE1NkExLjA4NiwxLjA4NiwwLDEsMSwzNy43LDE2Ljg0N1oiLz48L3N2Zz4=');
  }
}
</style>