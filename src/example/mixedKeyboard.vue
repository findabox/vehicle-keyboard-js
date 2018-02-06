<template>
  <div>
    <mixed-keyboard :args="args"
      :callbacks="callbacks">
      <el-button type="primary">保存</el-button>
    </mixed-keyboard>
  </div>
</template>
<script>
import MixedKeyboard from '../components/mixed-keyboard';
export default {
  data() {
    return {
      args: {
        presetNumber: '', //预设车牌号码
        keyboardType: 1, //键盘类型[0,2]
        provinceName: '', //省份
        autoComplete: false
      },
      callbacks: {
        //// 回调函数
        onchanged: (presetNumber, isCompleted) => {
          // this.args.presetNumber = presetNumber;
          console.log(
            '当前车牌[变更]：' + presetNumber + ', 已完成:' + isCompleted
          );
        },
        onkeypressed: key => {
          console.log('当前按键：' + key.text);
        },
        oncompleted: (presetNumber, isAutoCompleted) => {
          this.numberArray = presetNumber.split('');
          console.log(
            '当前车牌[完成]：' + presetNumber + ', 自动完成:' + isAutoCompleted
          );
        },
        onmessage: function(message) {
          console.info(message);
        }
      }
    };
  },
  methods: {},
  components: {
    'mixed-keyboard': MixedKeyboard
  }
};
</script>
<style lang="scss" scoped>

</style>


