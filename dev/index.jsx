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
    let margin = { top: 20, right: 30, bottom: 100, left: 70 };
    this.state = {
      dateStart: "",
      dateEnd: "",
      timeInterval: 0,
      data: [{ name: "all", value: 0 }],
      margin: margin,
      width: 960 - margin.left - margin.right,
      height: 500 - margin.top - margin.bottom,
      padding: 0.4,
    };
  }
  chart() {
    let x = d3
      .scaleBand()
      .domain(d3.range(this.state.data.length))
      .range([
        this.state.margin.left,
        this.state.width - this.state.margin.right,
      ])
      .padding(this.state.padding);

    let y = d3
      .scaleLinear()
      .domain([0, d3.max(this.state.data, (d) => d.value)])
      .nice()
      .range([
        this.state.height - this.state.margin.bottom,
        this.state.margin.top,
      ]);

    let xAxis = (g) =>
      g
        .attr(
          "transform",
          `translate(0,${this.state.height - this.state.margin.bottom})`
        )
        .call(d3.axisBottom(x).tickFormat("").tickSizeOuter(0));

    const svg = d3.create("svg").attr("viewBox", [0, 0, 1000, 1000]);

    svg
      .append("g")
      .attr("fill", "#4e81bd")
      .selectAll("rect")
      .data(this.state.data)
      .join("rect")
      .attr("x", (d, i) => x(i))
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value))
      .attr("width", x.bandwidth());

    svg.append("g").call(xAxis);

    return svg.node();
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
                  class="btn btn-secondary w-100 mb-2"
                >
                  Добавить интервал
                </button>
              </div>
            </div>
            <div className="col-md-8">
              <RD3Component data={this.state.d3} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const model = document.getElementById("test-chart");
ReactDom.render(<CustomChart />, model);
