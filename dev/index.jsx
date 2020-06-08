import React from "react";
import ReactDom from "react-dom";
import * as d3 from "d3";

class CustomChart extends React.Component {
  constructor(props) {
    super(props);
    let margin = { top: 20, right: 30, bottom: 100, left: 70 };
    this.state = {
      margin: margin,
      width: 960 - margin.left - margin.right,
      height: 500 - margin.top - margin.bottom,
      padding: 0.4,
    };
  }

  componentDidMount() {
    let width = this.state.width;
    let height = this.state.height;
    let margin = this.state.margin;
    let chart = d3
      .select(".chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  render() {
    return <div className="chart"></div>;
  }
}

const model = document.getElementById("test-chart");
ReactDom.render(<CustomChart />, model);
