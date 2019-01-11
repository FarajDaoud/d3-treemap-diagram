import './index.css';
import * as d3 from 'd3';

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
    document.getElementById('treemap').innerHTML = '';
    document.getElementById('legend').innerHTML = '';
    fetch(dataset.source)
    .then(handleResponse)
    .then((data) => {
        //create treemap diagram
        let mapWidth = 1100
        ,mapHeight = 700;
        
        let treemap = d3.treemap()
            .size([mapWidth,mapHeight])
            .paddingInner(1);

        let svg = d3.select('#treemap')
            .append('svg')
            .attr('width', mapWidth)
            .attr('height', mapHeight);

        let tooltip = d3.select('#treemap')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0);
        //Define hierarchy
        let hierarchy = d3.hierarchy(data)
            .sum((d) => d.value)
            .sort((a,b) => {return b.height - a.height || b.value - a.value});

        treemap(hierarchy);

        let cell = svg.selectAll('g')
            .data(hierarchy.leaves())
            .enter().append('g')
            .attr('class', 'group')
            .style('overflow', 'hidden')
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
            .attr('fill', (d) => color(d.data.category))
            .on('mousemove', (d) => {
                tooltip.style('opacity', .95)
                    .attr('data-value', d.data.value)
                    .style("left", d3.event.pageX + 15 + "px")
                    .style("top", d3.event.pageY + "px")
                    .style('z-index', 2)
                    .html(`Category: ${d.data.category}<br>
                        Name: ${d.data.name}<br>
                        Value: ${d.data.value}`);
            })
            .on('mouseout', (d) => {
                    tooltip.style('opacity', '0')
                    .style('z-index', -1)
            });

        //append tile title to rect element.
        cell.append("text")
            .attr('class', 'tile-text')
            .selectAll("tspan")
            .data((d) => d.data.name.split(/(\w+\W+)\W+/g))
            .enter().append("tspan")
            .attr("x", 2)
            .attr("y", (d, i) => 12 + i * 10)
            .style('font-size', '12px')
            .text((d) => d);

        let categories = data.children.map((d) => d.name);
        let legend = d3.select('#legend')
            .append('svg')
            .attr('width', 850)
            .attr('height', 250);
        let legendElement = legend
            .append('g')
            .attr('transform', 'translate(0, 10)')
            .selectAll('g')
            .data(categories).enter().append('g')
            .attr('transform', (d, i) => `translate(${(i%4)*250},${(Math.floor(i/4))*40})`)
        
        legendElement.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('class', 'legend-item')
            .attr('fill', (d) => color(d));
       
        legendElement.append('text')
            .attr('x', 25)
            .attr('y', 15)
            .text((d) => d);
    })
    .catch(error => console.error(error));
}