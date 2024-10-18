import BasicSlide from "./basicslide/BasicSlide.component";
import FinalSlide from "./finalslide/FinalSlide.component";
import IntroSlide from "./introslide/IntroSlide.component";
import MarkdownMediaSlide from "./markdownmediaslide/MarkdownMediaSlide.component";
import MarkdownSlide from "./markdownslide/MarkdownSlide.component";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

const slideComponents = {
  intro: IntroSlide,
  markdown: MarkdownSlide,
  markdownmedia: MarkdownMediaSlide,
  final: FinalSlide,
  default: BasicSlide,
};

function Slides() {
  const store = useContext(RootStoreContext);

  return store.present.slides.map((slide, index) => {
    const SlideComponent =
      slideComponents[slide.type] || slideComponents.default;

    const props = slide.type === "markdownmedia" ? { ...slide, index } : slide;
    return <SlideComponent key={`slide_${index}`} {...props} />;
  });
}

export default observer(Slides);
