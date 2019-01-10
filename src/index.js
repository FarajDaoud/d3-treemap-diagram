import './index.css';
import * as d3 from 'd3';
import * as d3Legend from 'd3-svg-legend';

//Add event listner On page load
document.addEventListener('DOMContentLoaded', function(){
    let dataSources = {
        games: {
            title: 'Game Sales'
            ,desc: 'Top 100 Most Sold Games Grouped by Platform'
            ,source: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
        },
        movies: {
            title: 'Movie Sales'
            ,desc: 'Top 100 Highest Grossing Movies Grouped By Genre'
            ,source: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
        },
        kickStarter: {
            title: 'Kickstarter Pledges'
            ,desc: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category'
            ,source: 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
        }
    }
    //assign a click event handler for anchors.
    let anchors = Array.prototype.slice.call(document.getElementsByClassName('dataSetAnchors'));
    anchors.forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            event.preventDefault();
            switch(event.target.id){
                case 'gameAnchor':
                    console.log(event.target.id);
                    createTreemapDiagram(dataSources.games);
                    break;
                case 'movieAnchor':
                    console.log(event.target.id);
                    createTreemapDiagram(dataSources.movies);
                    break;
                case 'kickStarterAnchor':
                    console.log(event.target.id);
                    createTreemapDiagram(dataSources.kickStarter);
                    break;
                default:
                    //do nothing.
            }
        });
    });
    //on page load, load game source as default.
    createTreemapDiagram(dataSources.games);
});

function handleResponse(response) {
    if(response.ok) return response.json();
    throw new Error(response.message);
}

function createTreemapDiagram(dataset){
    document.getElementById('title').innerHTML = dataset.title;
    document.getElementById('description').innerHTML = dataset.desc;
    fetch(dataset.source)
    .then(handleResponse)
    .then((data) => {
        console.log(data);
        //create treemap diagram
        let mapWidth = 1100
        ,mapHeight = 800;
        
        let treemap = d3.treemap()
            .size([mapWidth,mapHeight])
            .paddingInner(1);

        let svg = d3.select('#treeMap')
            .append('svg')
            .attr('width', mapWidth)
            .attr('height', mapHeight);

        let tooltip = d3.select('#treeMap')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0);

        let root = d3.hierarchy(data)
            .eachBefore((d) => {
                d.data.id = d.data.name;
            })
            .sum((d) => d.value)
            .sort((a,b) => {
                //console.log(`ah: ${a.height}, bh: ${b.height}, bv: ${b.value}, av: ${a.value}`);
                return b.height - a.height || b.value - a.value
            });
        treemap(root);
        
        let cell = svg.selectAll('g')
            .data(root.leaves())
            .enter().append('g')
            .attr('class', 'group')
            .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

        let color = d3.scaleOrdinal()
            .domain(data.children.map((d) => d.name))
            .range(['rgb(230, 25, 75)', 'rgb(60, 180, 75)', 'rgb(255, 225, 25)', 'rgb(0, 130, 200)'
            ,'rgb(245, 130, 48)', 'rgb(145, 30, 180)', 'rgb(70, 240, 240)', 'rgb(240, 50, 230)'
            ,'rgb(210, 245, 60)', 'rgb(250, 190, 190)', 'rgb(0, 128, 128)', 'rgb(230, 190, 255)'
            ,'rgb(170, 110, 40)', 'rgb(255, 250, 200)', 'rgb(128, 0, 0)', 'rgb(170, 255, 195)'
            ,'rgb(128, 128, 0)', 'rgb(255, 215, 180)', 'rgb(0, 0, 128)', 'rgb(128, 128, 128)']);

        let tile = cell.append('rect')
            .attr('id', (d) => d.data.id)
            .attr('class', 'tile')
            .attr('width', (d) => d.x1 - d.x0)
            .attr('height', (d) => d.y1 - d.y0)
            .attr('data-name', (d) => d.data.name)
            .attr('data-category', (d) => d.data.category)
            .attr('data-value', (d) => d.data.value)
            .attr('fill', (d) => color(d.data.category));
    })
    .catch(error => console.error(error));
}