function buildMetadata(sample) {

  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/"+sample).then(function(response) {

    // Use d3 to select the panel with id of `#sample-metadata`
    var panel = d3.select("#sample-metadata")

    // Use `.html("") to clear any existing metadata
    panel.html("")

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(response).forEach(([key, value]) => {
      var row = panel.append('p');
      row.text(key + " : " + value);
    }); 

  });
}

function buildCharts(sample) {

  // fetch the sample data for the plots
  d3.json("/samples/"+sample).then(function(response) {

    //---------------------------------- PIE CHART ----------------------------------// 

    // combine lists into one to sort them together
    var combined = [];
    for (var i = 0; i < response.sample_values.length; i++) 
      combined.push({'value': response.sample_values[i], 'id': response.otu_ids[i], 'label':response.otu_labels[i]});

    // sort by value and slice largest 10
    var top = combined.sort((a,b) => b.value-a.value).slice(0,10) ;

    // separate back
    var values = [];
    var ids = [];
    var labels = [];

    for (var i = 0; i < top.length; i++) {
      values[i] = top[i].value ;
      ids[i] = top[i].id ;
      labels[i] = top[i].label ;
    }

    // plot
    var pieData = [{
      values: values,
      labels: ids,
      hovertext: labels,
      type: "pie"
    }];

    var pieLayout = {
      height: 600,
      width: 700
    };

    Plotly.newPlot("pie", pieData, pieLayout);

    //--------------------------------- BUBBLE CHART ---------------------------------//
  
    var bubbleData = [{
      x: response.otu_ids,
      y: response.sample_values,
      mode: "markers",
      marker: {
        size: response.sample_values,
        color: response.otu_ids
      },
      text: response.otu_labels
    }];

    var bubbleLayout = {
      showlegend: false,
      height: 600,
      width: 1100,
    };

    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
