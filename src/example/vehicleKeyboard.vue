<template>
  <div>
    <h5>{{args.presetNumber}}</h5>
    <single-keyboard :args="args" :callbacks="callbacks" />
  </div>
</template>
<script>
import SingleKeyboard from '@/components/vehicle/SingleKeyboard';
export default {
  data() {
    return {
      args: {
        presetNumber: '', //预设车牌号码
        keyboardType: 1, //键盘类型
        currentIndex: 0, //当前输入位置
        numberType: 0, //车牌号码类型
        provinceName: '' //省份
      },
      callbacks: {
        //// 回调函数
        onchanged: (presetNumber, isCompleted) => {
          this.args.presetNumber = presetNumber;
          console.log(
            '当前车牌[变更]：' + presetNumber + ', 已完成:' + isCompleted
          );
        },
        oncompleted: (presetNumber, isAutoCompleted) => {
          console.log(
            '当前车牌[完成]：' + presetNumber + ', 自动完成:' + isAutoCompleted
          );
        },
        onkeypressed: key => {
          console.log('当前按键[KEY]：' + key.text);
          return true;
        },
        onmessage: function(message) {
          console.error(message);
        }
      }
    };
  },
  methods: {},
  components: {
    'single-keyboard': SingleKeyboard
  }
};
</script>
<style lang="scss" scoped>

</style>


