import './index.css';
import * as d3 from 'd3';
import * as d3Legend from 'd3-svg-legend';

//Add event listner On page load
document.addEventListener('DOMContentLoaded', function(){
    let dataURL = ''
    fetch(dataURL)
    .then(handleResponse)
    .then((data) => {
        //create treemap diagram
        createTreemapDiagram(data);
    })
    .catch(error => console.error(error));
});

function handleResponse(response) {
    if(response.ok) return response.json();
    throw new Error(response.message);
}

function createTreemapDiagram(data){
    let mapWidth = 1100
    ,mapHeight = 800;

    let svg = d3.select('#treeMap')
        .append('svg')
        .attr('width', mapWidth)
        .attr('height', mapHeight);

    let colorScale = d3.scaleThreshold()
        .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
        .range(d3.schemeReds[9]);

    let tooltip = d3.select('#treeMap')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0);
}