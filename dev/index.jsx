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
    let margin = { top: 20, right: 30, bottom: 100, left: 70 };
    this.state = {
      data: [{ name: "all", value: 0 }],
      margin: margin,
      width: 960 - margin.left - margin.right,
      height: 500 - margin.top - margin.bottom,
      padding: 0.4,
      water: {},
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

  intervalEdit(e) {
    let waterAll = this.state.water;
    let all = 0;
    let data = [];

    waterAll[e.target.name] = e.target.value;
    for (let value in waterAll) {
      all += +waterAll[value];
    }

    data = [{ name: "all", value: all }];
    this.setState({ water: waterAll, data: data });
    this.setState({ d3: this.chart() });
  }

  componentDidMount() {
    this.setState({ d3: this.chart() });
  }

  render() {
    return (
      <div className="container">
        <div className="d-flex flex-column pt-5">
          <div className="row">
            <div className="col-md-6">
              <input
                className="form-control mb-2"
                placeholder="Период 1"
                type="number"
                name="period1"
                onChange={(e) => {
                  this.intervalEdit(e);
                }}
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control mb-2"
                placeholder="Период 2"
                type="number"
                name="period2"
                onChange={(e) => {
                  this.intervalEdit(e);
                }}
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control mb-2"
                placeholder="Период 3"
                type="number"
                name="period2"
                onChange={(e) => {
                  this.intervalEdit(e);
                }}
              />
            </div>
            <div className="col-md-6">
              <input
                className="form-control mb-2"
                placeholder="Период 4"
                type="number"
                name="period4"
                onChange={(e) => {
                  this.intervalEdit(e);
                }}
              />
            </div>
          </div>
        </div>
        <RD3Component data={this.state.d3} />
      </div>
    );
  }
}

const model = document.getElementById("test-chart");
ReactDom.render(<CustomChart />, model);
