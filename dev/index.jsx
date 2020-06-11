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
    const margin = { top: 30, right: 30, bottom: 100, left: 70 };
    this.state = {
      dateStart: "",
      dateEnd: "",
      timeInterval: 0,
      intervalRemainder: 0,
      data: [{ name: "all", value: 0 }],
      margin: margin,
      message: "",
      width: 1000,
      height: 600,
      padding: 0.4,
    };
  }

  chart() {
    // Calculate x
    let x = d3
      .scaleBand()
      .domain(d3.range(this.state.data.length))
      .range([
        this.state.margin.left,
        this.state.width - this.state.margin.right,
      ])
      .padding(this.state.padding);

    // Calculate y
    const scale = (commonRange, v) =>
      commonRange ? Math.ceil((this.state.height * v) / commonRange) : 0;

    // Calculate color
    let color = (name) => {
      let color = "";
      switch (name) {
        case "all":
          color = "#4e81bd";
          break;
        case "interval1":
          color = "#c0504c";
          break;
        case "interval2":
          color = "#93a944";
          break;
        case "interval3":
          color = "#e6dcd7";
          break;
        case "interval4":
          color = "#4aacc6";
          break;
        default:
          color = "gray";
          break;
      }
      return color;
    };

    // Create svg box and object
    const svg = d3
      .create("svg")
      .attr("viewBox", [
        0,
        0 - this.state.margin.top,
        this.state.width,
        this.state.height + this.state.margin.bottom,
      ]);

    // Create bar
    const bar = svg
      .append("g")
      .selectAll("rect")
      .data(this.state.data)
      .enter()
      .append("g")
      .attr("class", "bar")
      .append("g")
      .attr("class", "wrapper-bar")
      .append("rect")
      .join("rect")
      .attr("x", (d, i) => {
        this.updateInterval(i, "x", x(i));
        return x(i);
      })
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
          this.updateInterval(i, "y", scale(this.state.data[0].value, skipY));
          return scale(this.state.data[0].value, skipY);
        }
      })
      .attr("height", (d, i) => {
        this.updateInterval(
          i,
          "height",
          scale(this.state.data[0].value, d.value)
        );
        return scale(this.state.data[0].value, d.value);
      })
      .attr("width", (d, i) => {
        this.updateInterval(i, "width", x.bandwidth());
        return x.bandwidth();
      })
      .attr("fill", (d) => {
        return color(d.name);
      });

    // Create horizontal line
    const connector = svg
      .selectAll(".bar")
      .append("line")
      .attr("class", "connector")
      .attr("x1", (d, i) => {
        if (this.state.data.length > i + 1) {
          if (d.name == "all") {
            return d.x;
          } else {
            return d.x + d.width;
          }
        }
      })
      .attr("y1", (d, i) => {
        if (this.state.data.length > i + 1) {
          if (d.name == "all") {
            return 0;
          } else {
            return this.state.data[i + 1].y;
          }
        }
      })
      .attr("x2", (d, i) => {
        if (this.state.data.length > i + 1) {
          return this.state.data[i + 1].x;
        }
      })
      .attr("y2", (d, i) => {
        if (d.name == "all") {
          return 0;
        }
        if (this.state.data.length > i + 1) {
          return this.state.data[i + 1].y;
        }
      });

    // Add text for bar
    const text = svg
      .selectAll(".bar g")
      .append("text")
      .attr("x", (d) => d.x + d.width / 2 - 10)
      .attr("y", (d, i) => {
        return i == 0 || (i != 1 && i == this.state.data.length - 1)
          ? d.y - 5
          : d.y + d.height / 2;
      })
      .attr("fill", (d, i) => (!(i % 2) ? "black" : "white"))
      .text((d) => d.value);

    // Add axis x
    const gx = svg
      .append("g")
      .attr(
        "transform",
        `translate(0,${scale(
          this.state.data[0].value,
          this.state.data[0].value
        )})`
      )
      .call(d3.axisBottom(x).tickSizeOuter(0));

    svg.selectAll("rect");

    return svg.node();
  }

  updateInterval(i, key, result) {
    let data = this.state.data;
    data[i][key] = result;
    this.setState({ data });
  }

  addInteval() {
    let data = this.state.data;
    let dataLenght = this.state.data.length;
    if (dataLenght - 1 == 0 || data[dataLenght - 1].value != "") {
      data.push({ name: `interval${data.length}`, value: "" });
    }
    this.setState({ data });
  }

  allInterval() {
    let data = this.state.data;
    let allPeriodTime = 0;
    data.map((period, key) => {
      if (period.name != "all") {
        allPeriodTime += period.value;
      }
    });
    return allPeriodTime;
  }

  intervalRemainder() {
    let all = this.state.timeInterval;
    this.state.data.map((item) => {
      if (item.name != "all") {
        all -= item.value;
      }
    });
    return all;
  }

  intervalEdit(e, key) {
    let data = this.state.data;
    let value = e.target.value;
    let intervalRemainder =
      key == 1 ? this.state.timeInterval : this.state.intervalRemainder;

    if (value == "") {
      data.splice([key], 1);
      data[0].value = this.allInterval();
      this.setState({ data, d3: this.chart() });
    } else {
      if (value <= this.state.intervalRemainder) {
        let temporaryValue = +value;
        data[key].value = +value;
        data[0].value = this.allInterval();
        this.setState({
          data,
          temporaryValue,
          d3: this.chart(),
          message: "",
        });
      } else {
        this.setState({ message: "Введите правильные данные" });
      }
    }

    this.setState({ intervalRemainder: this.intervalRemainder() });
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
      let timeInterval = Math.ceil(
        Math.abs(
          this.state.dateEnd.getTime() - this.state.dateStart.getTime()
        ) /
          (1000 * 3600 * 24) +
          1
      );
      this.setState({
        intervalRemainder: timeInterval,
        timeInterval,
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
                          value={this.state.data[key].value}
                          onChange={(e) => {
                            this.intervalEdit(e, key);
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
                  className={
                    this.state.dateEnd != "" && this.state.dateStart != ""
                      ? "btn btn-secondary w-100 mb-2"
                      : "d-none"
                  }
                >
                  Добавить интервал
                </button>
                {this.state.timeInterval != "" ? (
                  <small>Выбран период из {this.state.timeInterval} д.</small>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="col-md-8">
              <div
                className={
                  this.state.message == "" ? "d-none" : "alert alert-warning"
                }
                role="alert"
              >
                {this.state.message}
              </div>
              <div
                className={
                  this.state.data[0].value > 0 ? "d3-component" : "d-none"
                }
              >
                <RD3Component data={this.state.d3} />
              </div>
              <div
                className={
                  this.state.data[0].value > 0
                    ? "d-none"
                    : "alert alert-secondary"
                }
                role="alert"
              >
                Введите данные
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
