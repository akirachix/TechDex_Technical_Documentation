import DefaultTheme from "vitepress/theme";
import { onMounted, watch, nextTick } from "vue";
import { useRoute } from "vitepress";
import mediumZoom from "medium-zoom";
import { VPButton } from "vitepress/theme";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("VPButton", VPButton);
  },
  setup() {
    const route = useRoute();

    const initZoom = () => {
      mediumZoom(".vp-doc img, .ishuko-diagram, .ishuko-screens img", {
        background: "var(--vp-c-bg)",
        margin: 40,
      });
    };

    onMounted(() => initZoom());

    watch(
      () => route.path,
      () => nextTick(() => initZoom()),
    );
  },
};
