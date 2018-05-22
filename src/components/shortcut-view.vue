<template>
  <div style="height: 100%;">
    <ul class="shortcut-row">
      <li v-for="(key,i) in shortcuts"
        :key="i">
        <button class="key r-border shortcut"
          tag="button"
          :class="('keycodeof-' + key.keyCode)"
          :disabled="(!key.enabled)"
          @click="onButtonClick(key)">{{ key.text }}</button>
      </li>
    </ul>
    <div class="showall needclicks"
      @click="onShowMoreClick">显示全部</div>
  </div>
</template>
<script>
export default {
  props: {
    /**
     * 快捷显示
     */
    shortcuts: {
      type: Array,
      defalut: () => []
    }
  },
  methods: {
    /**
     * 键位点击事件
     * @param {Object} key 键位对象
     */
    onButtonClick(key) {
      if (key.enabled) {
        this.$emit('keyrowclick', key);
      }
    },
    /**
     * 显示全部点击事件
     */
    onShowMoreClick() {
      this.$emit('showmoreclick');
    }
  }
};
</script>

<style lang="scss" scoped>
ul.shortcut-row {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  list-style: none;
  justify-content: space-between;
  -webkit-box-pack: justify;
  justify-content: center;
  -webkit-justify-content: center;
  height: 20%;
  li {
    -webkit-box-flex: 0.25;
    -webkit-flex: 0 1 -webkit-calc((100% - 20px * 4) / 5);
    flex: 0 1 calc((100% - 20px * 4) / 5);
    height: 100%;
  }
  /*按键左右间隔为5像素*/
  li:not(:last-child) {
    margin-right: 20px;
  }
}

div.showall {
  color: #29a0dc;
  font-size: 16px;
  padding: 20px;
}
</style>