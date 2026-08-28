import DefaultTheme from "vitepress/theme";

import "./custom.css";
import { VPButton } from "vitepress/theme";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("VPButton", VPButton);
  },
};
