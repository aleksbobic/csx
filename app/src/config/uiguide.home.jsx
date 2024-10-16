const UiGuideHomeSteps = [
  {
    target: "#Title",
    placement: "center",
    floaterProps: { hideArrow: true },
    title: (
      <span style={{ fontSize: "18px", fontWeight: "bold" }}>Welcome!</span>
    ),
    content: (
      <div style={{ padding: "10px 20px" }}>
        <p
          style={{
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          Welcome to Collaboration Spotting X 🥳! This is a new visual network
          analysis tool that enables searching, exploring, analysing and
          modeling your data 🪄. You can interact with the highlighted areas of
          this tutorial.{" "}
          <span
            style={{
              fontWeight: "bold",
            }}
          >
            Make sure to perform all tasks mentioned in this tutorial.
          </span>
        </p>
        <ul
          style={{
            textAlign: "left",
            fontSize: "14px",
            marginTop: "10px",
          }}
        >
          <li style={{ paddingBottom: "6px" }}>
            Continue this guide by{" "}
            <span
              style={{
                fontWeight: "bold",
                color: "#43a2fb",
              }}
            >
              clicking next 🚀
            </span>
            .
          </li>
        </ul>
      </div>
    ),
  },
  {
    target: "#Searchbar",
    placement: "bottom",
    title: <span style={{ fontSize: "18px", fontWeight: "bold" }}>Search</span>,
    content: (
      <div style={{ padding: "10px 20px" }}>
        <p
          style={{
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          To search through a datasets you can use the search bar 🔎. You can
          select the dataset for searching in the left dropdown. The hint bellow
          the search bar provides information on the dataset feature used for
          search.
        </p>
        <ul
          style={{
            textAlign: "left",
            fontSize: "14px",
            marginTop: "10px",
          }}
        >
          <li style={{ paddingBottom: "6px" }}>
            <span
              style={{
                fontWeight: "bold",
                color: "#43a2fb",
              }}
            >
              Click next
            </span>{" "}
            for the next step in this guide.
          </li>
        </ul>
      </div>
    ),
  },
  {
    target: "#DatasetGrid",
    placement: "bottom",
    title: (
      <span style={{ fontSize: "18px", fontWeight: "bold" }}>Datasets</span>
    ),
    content: (
      <div style={{ padding: "10px 20px" }}>
        <p
          style={{
            textAlign: "left",
            fontSize: "14px",
          }}
        >
          The dataset list displays all datasets available in CSX 📊. You can
          view full datasets(➡️) as well as launch the advanced search view
          (🔎).
        </p>
        <ul
          style={{
            textAlign: "left",
            fontSize: "14px",
            marginTop: "10px",
          }}
        >
          <li style={{ paddingBottom: "6px" }}>
            <span
              style={{
                fontWeight: "bold",
                color: "#43a2fb",
              }}
            >
              Hover over the example dataset and click the 🔎 icon
            </span>{" "}
            for the next part of this tutorial.
          </li>
        </ul>
      </div>
    ),
  },
];

export default UiGuideHomeSteps;
