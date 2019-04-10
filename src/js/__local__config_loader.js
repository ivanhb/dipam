var config = {
  "data": {
        "d0":{
            "label": "File/s in .txt format",
            "type": "txt",
        },
        "d1":{
            "label": "Topic model .csv file (each row is a different topic)",
            "type": "csv",
        },
  },
  "tool": {
        "t-topic-lda": {
            "label": "Topic modeling with LDA",
            "function": "lda",
            "param": ["p1"],
            "compatible_input": ["d0"],
            "output": ["d1"]
        },
        "t-chart-bar": {
            "label": "Bar chart",
            "function": "bar_chart",
            "param": ["p0"],
            "compatible_input": ["d1"]
        },
        "t-filter-name": {
            "label": "Filter names",
            "function": "filter_names",
            "compatible_input": ["d0"],
            "output": ["d0"]
        }
  },
  "param": {
    "p0":{
      "label": "Log scale",
      "value_label": ["True","False"],
      "value": [true,false]
    },
    "p1":{
      "label": "Topic number",
      "value_label": ["2","3","4","5","10","15","20"],
      "value": [2,3,4,5,10,15,20]
    }
  }
}
