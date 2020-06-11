import React from "react";
import ReactDom from "react-dom";
import * as d3 from "d3";
import rd3 from "react-d3-library";
import "bootstrap";
import "./index.scss";
const RD3Component = rd3.Component;

class CustomChart extends React.Component {
  constructor(props) {
    super(props);
    this.intervalEdit = this.intervalEdit.bind(this);
    this.timeInterval = this.timeInterval.bind(this);
    this.addInteval = this.addInteval.bind(this);
    this.chart = this.chart.bind(this);
    const margin = { top: 0, right: 30, bottom: 100, left: 70 };
    this.state = {
      dateStart: "",
      dateEnd: "",
      timeInterval: 0,
      data: [{ name: "all", value: 0 }],
      margin: margin,
      width: 960,
      height: 500,
      padding: 0.4,
    };
  }

  chart() {
    const svg = d3
      .create("svg")
      .attr("viewBox", [0, 0, this.state.width, this.state.height]);

    const x = d3
      .scaleBand()
      .domain(this.state.data.map((d) => d.name))
      .range([
        this.state.margin.left,
        this.state.width - this.state.margin.right,
      ])
      .padding(0.1);

    const y = (commonRange, v) =>
      Math.ceil((this.state.height * v) / commonRange);

    // d3
    // .scaleLinear()
    // .domain([0, d3.max(this.state.data, (d) => d.value)])
    // .nice()
    // .range([this.state.height, 0]);

    const xAxis = (g) =>
      g
        .attr(
          "transform",
          `translate(0,${this.state.height - this.state.margin.bottom})`
        )
        .call(d3.axisBottom(x).tickSizeOuter(0));

    const yAxis = (g) =>
      g
        .attr("transform", `translate(${this.state.margin.left},0)`)
        .call(d3.axisLeft(y))
        .call((g) => g.select(".domain").remove());

    const bar = svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(this.state.data)
      .join("rect")
      .style("mix-blend-mode", "multiply")
      .attr("x", (d) => x(d.name))
      .attr("y", (d, i) => {
        let skipY = 0;
        let count = 0;

        if (d.name == "all") {
          this.updateInterval(i, "y", 0);
          return 0;
        }
        this.state.data.slice(1, i).forEach((x) => {
          if (count <= i) {
            skipY += x.value;
            count++;
          }
        });
        if (i > 0) {
          console.log(skipY);
          this.updateInterval(i, "y", y(skipY));
          return y(this.state.data[0].value, skipY);
        }
      })
      .attr("height", (d, i) => {
        this.updateInterval(i, "height", y(d.value) + y(0));
        return y(0) - y(d.value);
      })
      .attr("width", x.bandwidth());

    const gx = svg.append("g").call(xAxis);

    const gy = svg.append("g").call(yAxis);

    return svg.node();
  }

  updateInterval(i, key, result) {
    let data = this.state.data;
    data[i][key] = result;
    this.setState({ data });
  }

  addInteval() {
    let data = this.state.data;
    data.push({ name: `interval${data.length}`, value: 0 });
    this.setState({ data });
  }

  intervalEdit(e) {
    let data = this.state.data;
    let allPeriodTime = 0;

    data.map((period, key) => {
      if (period.name == e.target.name) {
        data[key].value = +e.target.value;
      }
      if (period.name != "all") {
        allPeriodTime += period.value;
      }
    });

    data[0].value = allPeriodTime;

    this.setState({ data: data, d3: this.chart() });
  }

  timeInterval(e) {
    this.setState({
      [e.target.name]: new Date(e.target.value),
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      (prevState.dateStart != this.state.dateStart ||
        prevState.dateEnd != this.state.dateEnd) &&
      this.state.dateStart != "" &&
      this.state.dateEnd != ""
    ) {
      this.setState({
        timeInterval: Math.ceil(
          Math.abs(
            this.state.dateEnd.getTime() - this.state.dateStart.getTime()
          ) /
            (1000 * 3600 * 24)
        ),
      });
    }
  }

  componentDidMount() {
    this.setState({ d3: this.chart() });
  }

  render() {
    return (
      <div className="container">
        <div className="d-flex flex-column pt-5">
          <div className="row">
            <div className="col-md-4">
              <div className="mb-2">
                <label>Дата начала</label>
                <input
                  className="form-control"
                  onChange={(e) => {
                    this.timeInterval(e);
                  }}
                  type="date"
                  name="dateStart"
                />
              </div>
              <div className="mb-2">
                <label>Дата окончания</label>
                <input
                  className="form-control"
                  onChange={(e) => {
                    this.timeInterval(e);
                  }}
                  type="date"
                  name="dateEnd"
                />
              </div>
              <div className="mb-3">
                {this.state.data.map((period, key) => {
                  if (period.name != "all") {
                    return (
                      <div key={`input-${key}`}>
                        <label>{`Интервал ${key}`}</label>
                        <input
                          className="form-control mb-2"
                          type="number"
                          min={0}
                          max={this.state.timeInterval}
                          name={`interval${key}`}
                          onChange={(e) => {
                            this.intervalEdit(e);
                          }}
                        />
                      </div>
                    );
                  }
                })}
              </div>
              <div>
                <button
                  type="button"
                  onClick={this.addInteval}
                  className="btn btn-secondary w-100 mb-2"
                >
                  Добавить интервал
                </button>
              </div>
            </div>
            <div className="col-md-8">
              <div className="d3-component">
                <RD3Component data={this.state.d3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const model = document.getElementById("test-chart");
ReactDom.render(<CustomChart />, model);
