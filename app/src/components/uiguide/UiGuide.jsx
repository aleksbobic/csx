import Joyride from "react-joyride";
import PropTypes from "prop-types";
import React from "react";

const UiGuide = ({ steps, run, onFinish }) => {
  return (
    <Joyride
      steps={steps}
      styles={{
        options: {
          backgroundColor: "#171A23",
          textColor: "white",
          primaryColor: "#43a2fb",
          arrowColor: "#171A23",
          tooltip: {
            borderRadius: "10px",
          },
        },
      }}
      showProgress={true}
      continuous={true}
      spotlightClicks={true}
      callback={(data) => onFinish(data)}
      run={run}
    />
  );
};

UiGuide.propTypes = {
  steps: PropTypes.array.isRequired,
  run: PropTypes.bool.isRequired,
  onFinish: PropTypes.func,
};

export default UiGuide;
