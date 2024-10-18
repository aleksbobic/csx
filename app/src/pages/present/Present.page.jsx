import "./Present.scss";

import { Box, useColorMode } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Helmet } from "react-helmet-async";
import Loader from "components/loader/Loader.component";
import PropTypes from "prop-types";
import Reveal from "reveal.js";
import { RootStoreContext } from "stores/RootStore";
import SlidesComponent from "components/slides/Slides.component";
import SlidesFooterComponent from "components/slides/slidesfooter/SlidesFooter.component";
import { observer } from "mobx-react";
import queryString from "query-string";

function PresentPage() {
  const { colorMode } = useColorMode();
  const store = useContext(RootStoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [revealInstance, setRevealInstance] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    store.track.trackPageChange();
    const studyID = queryString.parse(location.search).study;
    const publicStudyID = queryString.parse(location.search).pstudy;
    const activeItem = queryString.parse(location.search).active_item;
    store.present.generateSlides(studyID, publicStudyID, activeItem);
  }, [location.search, store.present, store.track]);

  useEffect(() => {
    if (store.present.slides.length > 0) {
      const deck = new Reveal();
      setRevealInstance(deck);
      deck.initialize({
        transition: "slide",
        slideNumber: false,
        controls: false,
        maxScale: 2.5,
      });
      deck.on("slidechanged", (e) => {
        setCurrentSlide(e.indexv);

        store.track.trackEvent(
          {
            area: "Presentation page",
          },
          {
            item_type: null,
          },
          {
            event_type: "Key press",
            event_action: "Navigate to slide",
            event_value: e.indexv,
          }
        );
      });
    }
  }, [store.present.slides, store.track]);

  useEffect(() => {
    if (store.core.studyIsEmpty) {
      navigate("/");
    }
  }, [navigate, store.core.studyIsEmpty]);

  if (!store.present.slides.length > 0) {
    return <Loader />;
  }

  return (
    <Box
      width="100%"
      height="100%"
      position="absolute"
      left="0"
      backgroundColor={colorMode === "light" ? "white" : "#171A23"}
      className="reveal"
    >
      <Helmet>
        <title>{store.present.studyTitle}</title>
      </Helmet>
      <SlidesFooterComponent
        revealInstance={revealInstance}
        currentSlide={currentSlide}
      />
      <Box className="slides" data-transition="slide">
        <Box as="section">
          <SlidesComponent />
        </Box>
      </Box>
    </Box>
  );
}

PresentPage.propTypes = {
  history: PropTypes.object,
};

const ObservedPresentPage = observer(PresentPage);
export default ObservedPresentPage;
