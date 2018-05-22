import NumberView from './number-view';
import SingleKeyboard from './single-keyboard';
import MixedKeyboard from './mixed-keyboard';

const components = [NumberView, SingleKeyboard, MixedKeyboard];

const install = function(Vue, opts = {}) {
  components.map(component => {
    Vue.component(component.name, component);
  });
};

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}
export default install;
export { install, NumberView, SingleKeyboard, MixedKeyboard };
