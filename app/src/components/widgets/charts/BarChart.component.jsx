import { Chart as ChartReactCharts, getElementAtEvent } from "react-chartjs-2";
import { useCallback, useContext } from "react";
import { useEffect, useRef, useState } from "react";

import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import WidgetAlert from "../WidgetAlert.component";
import WidgetSettings from "../WidgetSettings.component";
import { observer } from "mobx-react";

function BarChart({
  isExpanded = false,
  isExample = false,
  demoData,
  chart,
  chartIndex,
  settingsMode,
}) {
  const store = useContext(RootStoreContext);
  const chartRef = useRef([]);
  const [data, setData] = useState(null);

  const [chartConfig, setChartConfig] = useState(
    store.stats?.activeWidgets?.find((widget) => widget.id === chart.id) || {}
  );

  useEffect(() => {
    if (store.comment.chartToAttach === chart.id) {
      store.comment.attachChart(
        chartRef.current.toBase64Image("image/octet-stream", 1.0)
      );
      store.comment.setChartToAttach(null);
    }
  }, [chart.id, store.comment, store.comment.chartToAttach]);

  const getGroupBy = (chart) => {
    if (chart.type.toLowerCase() !== "grouped bar") {
      return null;
    }

    if (chart.elements === "nodes") {
      switch (chart.group_by) {
        case "values":
          return { type: "basic", prop: "label" };
        case "types":
          return { type: "basic", prop: "feature" };
        case "degree":
          return { type: "basic", prop: "degree" };
        default:
          return {
            type: "advanced",
            prop: chart.group_by,
          };
      }
    }

    switch (chart.group_by) {
      case "values":
        return { type: "advanced", prop: "label" };
      case "types":
        return { type: "advanced", prop: "feature" };
      default:
        return {
          type: "basic",
          prop: chart.group_by,
        };
    }
  };

  const getElementProperties = (chart) => {
    switch (chart.element_values) {
      case "values":
        return chart.elements === "nodes"
          ? { type: "basic", prop: "label" }
          : { type: "advanced", prop: "label" };
      case "types":
        return chart.elements === "nodes"
          ? { type: "basic", prop: "feature" }
          : { type: "advanced", prop: "feature" };
      case "degree":
        return { type: "basic", prop: "degree" };
      default:
        return chart.elements === "nodes"
          ? {
              type: "advanced",
              prop: chart.element_values,
            }
          : { type: "basic", prop: "weight" };
    }
  };

  const getChartData = useCallback(
    (chart) => {
      if (!chart) {
        return null;
      }

      const groupBy = getGroupBy(chart);
      const elementProperty = getElementProperties(chart);

      const anchor_properties = store.core.isOverview
        ? store.overviewSchema.anchorProperties
        : [];

      if (chart.elements !== "nodes") {
        return store.stats.getEdgeCounts(
          elementProperty,
          chart.type,
          chart.display_limit,
          groupBy,
          chart.network_data
        );
      }

      if (
        elementProperty.type === "advanced" &&
        !anchor_properties.includes(elementProperty.prop)
      ) {
        return null;
      }

      return store.stats.getNodeCounts(
        elementProperty,
        chart.type,
        chart.display_limit,
        chart.network_data,
        groupBy,
        chart.show_only,
        chart.element_sort_values
      );
    },
    [store.core.isOverview, store.overviewSchema.anchorProperties, store.stats]
  );

  useEffect(() => {
    if (demoData) {
      setData(demoData);
    } else {
      const chart = store.stats.activeWidgets.find(
        (widget) => widget.id === chart.id
      );

      setChartConfig(chart);

      setData(getChartData(chart));
    }
  }, [
    chart.id,
    demoData,
    store.core.currentGraph,
    store.core.isOverview,
    store.overviewSchema.anchorProperties,
    store.stats,
    store.stats.activeWidgets,
    store.graph.currentGraphData.nodes,
    store.graph.currentGraphData.selectedNodes,
    store.graph.currentGraphData.selectedNodes.length,
    store.graphInstance.selfCentricType,
    store.graphInstance.visibleComponents,
    getChartData,
  ]);

  const getPropertiesInChart = () => {
    if (!chartConfig) {
      return "";
    }

    switch (chartConfig.element_values) {
      case "values":
        return chartConfig.elements === "nodes"
          ? chartConfig.show_only !== "all"
            ? chartConfig.show_only
            : "Node value"
          : "Edge value";

      case "types":
        return chartConfig.elements === "nodes"
          ? "Node feature"
          : "Edge feature";

      default:
        return chartConfig.elements === "nodes"
          ? chartConfig.element_values
          : "Edge weight";
    }
  };

  const getPluginOptions = () => {
    const propsInChart = getPropertiesInChart();

    const pluginOptions = {
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (tooltipItem) => {
            if (chart.type.toLowerCase() === "grouped bar") {
              return `${propsInChart}:${
                tooltipItem[0].dataset.label.length > 10 ? "\n" : " "
              }${tooltipItem[0].dataset.label}`;
            }

            return `${propsInChart}:${
              tooltipItem[0].label.length > 10 ? "\n" : " "
            }${tooltipItem[0].label}`;
          },
          label: (tooltipItem) => {
            return `${chartConfig.element_sort_values}: ${tooltipItem.formattedValue}`;
          },
        },
      },
    };

    if (chart.groupHoverLabel) {
      pluginOptions.tooltip.callbacks.title = (tooltipItems) => {
        return `${chart.hoverLabel}: ${tooltipItems[0].label}`;
      };
    }

    return pluginOptions;
  };

  if (settingsMode && isExpanded) {
    return (
      <WidgetSettings
        widgetID={chart.id}
        settings={[
          chart.type.toLowerCase() !== "grouped bar" && "item type",
          chart.type.toLowerCase() !== "grouped bar" && "second axis",
          chart.type.toLowerCase() === "grouped bar" && "group",
          "main axis",
          "item state",
          "item count",
          store.core.isDetail && "visible types",
        ]}
        mainAxis={chart.type.toLowerCase() === "bar" ? "Y" : "X"}
      />
    );
  }

  if (!data || data.labels.length === 0) {
    return <WidgetAlert size={isExpanded ? "md" : "sm"} />;
  }

  const getPadding = () => {
    return {
      right: isExpanded ? 5 : 0,
      top: isExpanded ? 5 : 0,
      bottom: isExpanded ? 5 : 0,
      left: isExpanded ? 5 : 0,
    };
  };

  const getAxisTitle = () => {
    if (chart.type.toLowerCase() === "grouped bar") {
      if (demoData) {
        return "Group by property";
      }

      return (
        chart.group_by.charAt(0).toUpperCase() +
        chart.group_by.slice(1).toLowerCase()
      );
    }

    if (chart.elements === "edges") {
      if (demoData) {
        return "Edge property";
      }

      switch (chart.element_values) {
        case "values":
          return "Edge values";
        case "types":
          return "Edge types";
        default:
          return "Edge weights";
      }
    }

    if (demoData) {
      return "Node property";
    }

    switch (chart.element_values) {
      case "values":
        return chart.show_only ? chart.show_only : "Node values";
      case "types":
        return "Node types";
      default:
        return (
          chart.element_values.charAt(0).toUpperCase() +
          chart.element_values.slice(1).toLowerCase()
        );
    }
  };

  return (
    <ChartReactCharts
      style={{ maxWidth: "100%" }}
      ref={chartRef}
      type="bar"
      height="250px"
      key={`chart_instance_${chartIndex}_${Math.random()}`}
      redraw
      data={{ ...data }}
      onClick={(event) => {
        if (!isExample) {
          let dataIndex;
          let groupValue;
          let groupProperty;
          let clickedValue;

          try {
            const { index } = getElementAtEvent(chartRef.current, event)[0];

            const points = chartRef.current.getElementsAtEventForMode(
              event,
              "nearest",
              { intersect: true },
              true
            );

            groupProperty = chart.group_by;
            groupValue = data.datasets[points[0].datasetIndex].label;
            clickedValue = data.labels[points[0].index];

            dataIndex = index;
          } catch (error) {
            return;
          }

          let visibleNodeIds;

          if ("nodeProperty" in data) {
            store.track.trackEvent(
              JSON.stringify({
                area: "Widget",
                area_id: chart.id,
              }),
              JSON.stringify({
                item_type: "Chart area",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: `Filter by ${data.nodeProperty}`,
                event_value: data.labels[dataIndex],
              })
            );

            if (chart.type.toLowerCase() === "grouped bar") {
              visibleNodeIds = store.graphInstance.filterNodesWithValue(
                data.nodeProperty,
                groupValue,
                clickedValue,
                groupProperty
              );
            } else {
              visibleNodeIds = store.graphInstance.filterNodesWithValue(
                data.nodeProperty,
                clickedValue
              );
            }
          } else {
            store.track.trackEvent(
              JSON.stringify({
                area: "Widget",
                area_id: chart.id,
              }),
              JSON.stringify({
                item_type: "Chart area",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: `Filter by ${data.edgeProperty}`,
                event_value: data.labels[dataIndex],
              })
            );

            visibleNodeIds = store.graphInstance.filterEdgesWithValue(
              data.edgeProperty,
              clickedValue
            );
          }

          store.graphInstance.setIsFiltered(true);
          if (visibleNodeIds.length === 1) {
            store.graphInstance.zoomToFitByNodeId(visibleNodeIds[0], 400);
          } else {
            store.graphInstance.zoomToFitByNodeIds(visibleNodeIds);
          }
        }
      }}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        animation: false,
        borderColor: "#fff",
        devicePixelRatio: 2,
        indexAxis: chart.type.toLowerCase() === "bar" && "y",
        layout: {
          padding: getPadding(),
        },
        onHover: (event, elements) => {
          if (elements.length) {
            event.native.target.style.cursor = "pointer";
          } else {
            event.native.target.style.cursor = "default";
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              color: "white",
              text: ["vertical bar", "grouped bar"].includes(
                chart.type.toLowerCase()
              )
                ? chartConfig.element_sort_values
                : getAxisTitle(),
            },
            display: isExpanded,
            ticks: {
              color: "white",
              diplay: isExpanded,
              callback: function (value, index, ticks) {
                const stringValue = this.getLabelForValue(value);
                if (stringValue) {
                  if (stringValue.length > 17) {
                    return `${stringValue.slice(0, 17)}...`;
                  }
                  return stringValue;
                }
                return value;
              },
            },
            grid: {
              color: (context) => {
                if (chart.type.toLowerCase() === "bar" || context.index === 0) {
                  return "transparent";
                }
                return "#FFFFFF55";
              },
              drawBorder: false,
              borderDash: [2, 8],
            },
          },
          x: {
            title: {
              display: true,
              color: "white",
              text: ["bar"].includes(chart.type.toLowerCase())
                ? chartConfig?.element_sort_values
                  ? chartConfig?.element_sort_values
                  : "frequency"
                : getAxisTitle(),
            },
            display: isExpanded,
            ticks: {
              color: "white",
              diplay: isExpanded,
              callback: function (value, index, ticks) {
                const stringValue = this.getLabelForValue(value);
                if (stringValue) {
                  if (stringValue.length > 17) {
                    return `${stringValue.slice(0, 17)}...`;
                  }
                  return stringValue;
                }
                return value;
              },
            },
            grid: {
              color: (context) => {
                if (
                  chart.type.toLowerCase() === "vertical bar" ||
                  context.index === 0
                ) {
                  return "transparent";
                }
                return "#FFFFFF55";
              },
              drawBorder: false,
              borderDash: [2, 8],
            },
          },
        },
        dataset: [
          {
            border: { radius: 10 },
          },
        ],
        maxBarThickness: 22,
        borderRadius: 4,
        borderSkipped: false,
        plugins: {
          title: {
            display: false,
          },
          legend: {
            display:
              chart.type.toLowerCase() === "grouped bar" &&
              isExpanded &&
              data.datasets &&
              data.datasets.length <= 10,
            labels: {
              usePointStyle: true,
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                return datasets.map((data, i) => {
                  let label = data.label;

                  if (data.label.length > 25) {
                    label = `${data.label.slice(0, 25)}...`;
                  }

                  return {
                    text: label,
                    fillStyle: data.backgroundColor,
                    index: i,
                    pointStyle: "rectRounded",
                  };
                });
              },
            },
          },
          ...getPluginOptions(),
          datalabels: {
            display: false,
          },
        },
      }}
    />
  );
}
BarChart.propTypes = {
  demoData: PropTypes.any,
  chart: PropTypes.object,
  chartIndex: PropTypes.number,
  isExpanded: PropTypes.bool,
  isExample: PropTypes.bool,
};
export default observer(BarChart);
