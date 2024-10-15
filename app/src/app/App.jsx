import "./App.scss";
import "overlayscrollbars/overlayscrollbars.css";

import { Box, useColorMode, useToast } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GraphPage, HomePage, PresentPage, SearchPage } from "pages";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { isEnvFalse, isEnvTrue } from "utils/general.utils";
import { useCallback, useContext, useEffect, useRef } from "react";

import CommentModal from "components/commentmodal/CommentModal.component";
import CustomScroll from "components/customscroll/CustomScroll.component";
import { ErrorModal } from "components/errorModal/ErrorModal.component";
import LeftPanel from "layouts/leftpanel/LeftPanel.component";
import NavigationPanelComponent from "layouts/navigation/NavigationPanel.component";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";

function CSX() {
  const { colorMode } = useColorMode();
  const store = useContext(RootStoreContext);
  const errorToastRef = useRef();
  const errorToast = useToast();

  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      store.track.trackEvent(
        JSON.stringify({
          area: "Global",
        }),
        JSON.stringify({
          item_type: null,
        }),
        JSON.stringify({
          event_type: "Tab interaction",
          event_action: "Close tab",
        })
      );
    });

    window.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        store.track.trackEvent(
          JSON.stringify({
            area: "Global",
          }),
          JSON.stringify({
            item_type: null,
          }),
          JSON.stringify({
            event_type: "Tab interaction",
            event_action: "Switch to another tab",
          })
        );
      } else {
        store.track.trackEvent(
          JSON.stringify({
            area: "Global",
          }),
          JSON.stringify({
            item_type: null,
          }),
          JSON.stringify({
            event_type: "Tab interaction",
            event_action: "Return to tab",
          })
        );
      }
    });

    return () => {
      window.removeEventListener("beforeunload", () => {
        store.track.trackEvent(
          JSON.stringify({
            area: "Global",
          }),
          JSON.stringify({
            item_type: null,
          }),
          JSON.stringify({
            event_type: "Tab interaction",
            event_action: "Close tab",
          })
        );
      });
      window.removeEventListener("visibilitychange", () => {
        if (document.hidden) {
          store.track.trackEvent(
            JSON.stringify({
              area: "Global",
            }),
            JSON.stringify({
              item_type: null,
            }),
            JSON.stringify({
              event_type: "Tab interaction",
              event_action: "Switch to another tab",
            })
          );
        } else {
          store.track.trackEvent(
            JSON.stringify({
              area: "Global",
            }),
            JSON.stringify({
              item_type: null,
            }),
            JSON.stringify({
              event_type: "Tab interaction",
              event_action: "Return to tab",
            })
          );
        }
      });
    };
  }, [store.track]);

  const renderErrorToast = useCallback(() => {
    errorToastRef.current = errorToast({
      render: () => (
        <ErrorModal
          onClose={() => {
            errorToast.close(errorToastRef.current);
          }}
        />
      ),
      status: "error",
      duration: 50000,
      isClosable: true,
      onCloseComplete: function () {
        store.core.setErrorDetails(null);
      },
    });
  }, [store.core, errorToast]);

  useEffect(() => {
    if (store.core.errorDetails) {
      renderErrorToast();
    } else {
      errorToast.closeAll();
    }
  }, [colorMode, errorToast, renderErrorToast, store.core.errorDetails]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        {isEnvTrue("VITE_MANDATORY_HTTPS") && (
          <Helmet>
            <meta
              httpEquiv="Content-Security-Policy"
              content="upgrade-insecure-requests"
            />
          </Helmet>
        )}
        <CustomScroll
          style={{
            backgroundColor: colorMode === "light" ? "white" : "#171A23",
          }}
        >
          <NavigationPanelComponent />
          <Box
            backgroundColor={colorMode === "light" ? "white" : "#171A23"}
            height="100%"
            width="100%"
            zIndex="1"
          >
            <Routes>
              <Route exact path="/" label="home" element={<HomePage />} />
              <Route
                path="/graph/detail"
                label="graphdetail"
                element={
                  <>
                    <CommentModal />
                    <LeftPanel />
                    <GraphPage />
                  </>
                }
              />
              <Route
                path="/graph"
                label="graph"
                element={
                  <>
                    <CommentModal />
                    <LeftPanel />
                    <GraphPage />
                  </>
                }
              />
              <Route
                exact
                path="/present"
                label="present"
                element={<PresentPage />}
              />
              {isEnvFalse("VITE_DISABLE_ADVANCED_SEARCH") && (
                <Route path="/search" label="search" element={<SearchPage />} />
              )}
            </Routes>
          </Box>
        </CustomScroll>
      </BrowserRouter>
    </HelmetProvider>
  );
}

const ObservedCSX = observer(CSX);
export default ObservedCSX;
