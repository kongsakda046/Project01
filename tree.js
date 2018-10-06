let m = [20, 120, 20, 20],
  w = 1280 - m[1] - m[3],
  h = 800 - m[0] - m[2],
  i = 0,
  root

const tree = d3.layout.tree()
  .size([h, w])

const diagonal = d3.svg.diagonal()
  .projection(d => [d.x, d.y])

const vis = d3.select('#classificationTree').append('svg:svg')
  .attr('width', w + m[1] + m[3])
  .attr('height', h + m[0] + m[2])
  .append('svg:g')
  .attr('transform', `translate(${m[3]},${m[0]})`)

function toggleAll(d) {
  if (d.children) {
    d.children.forEach(toggleAll)
    toggle(d)
  }
}

function update(source) {
  const duration = d3.event && d3.event.altKey ? 5000 : 500

  // Compute the new tree layout.
  const nodes = tree.nodes(root).reverse()

  // Normalize for fixed-depth.
  nodes.forEach((d) => { d.y = d.depth * 180 })

  // Update the nodes…
  const node = vis.selectAll('g.node')
    .data(nodes, d => d.id || (d.id = ++i))

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node.enter().append('svg:g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${source.y0},${source.x0})`)
    .on('click', (d) => { toggle(d); update(d) })

  nodeEnter.append('svg:circle')
    .attr('r', 1e-6)
    .style('fill', d => (d._children ? 'lightsteelblue' : '#fff'))

  nodeEnter.append('a')
    .attr('xlink:href', d => d.url)
    .append('svg:text')
    .attr('x', d => (d.children || d._children ? -10 : 10))
    .attr('dy', '.35em')
    .attr('text-anchor', d => (d.children || d._children ? 'end' : 'start'))
    .text(d => d.name)
    .style('fill', d => (d.free ? 'black' : '#999'))
    .style('fill-opacity', 1e-6)

  nodeEnter.append('svg:title')
    .text(d => d.description)

  // Transition nodes to their new position.
  const nodeUpdate = node.transition()
    .duration(duration)
    .attr('transform', d => `translate(${d.x},${d.y})`)

  nodeUpdate.select('circle')
    .attr('r', 6)
    .style('fill', d => (d._children ? 'lightsteelblue' : '#fff'))

  nodeUpdate.select('text')
    .attr('transform', 'rotate(45)')
    .style('fill-opacity', 1)

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node.exit().transition()
    .duration(duration)
    .attr('transform', d => `translate(${source.y},${source.x})`)
    .remove()

  nodeExit.select('circle')
    .attr('r', 1e-6)

  nodeExit.select('text')
    .style('fill-opacity', 1e-6)

  // Update the links…
  const link = vis.selectAll('path.link')
    .data(tree.links(nodes), d => d.target.id)

  // Enter any new links at the parent's previous position.
  link.enter().insert('svg:path', 'g')
    .attr('class', 'link')
    .attr('d', (d) => {
      const o = { x: source.x0, y: source.y0 }
      return diagonal({ source: o, target: o })
    })
    .transition()
    .duration(duration)
    .attr('d', diagonal)

  // Transition links to their new position.
  link.transition()
    .duration(duration)
    .attr('d', diagonal)

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(duration)
    .attr('d', (d) => {
      const o = { x: source.x, y: source.y }
      return diagonal({ source: o, target: o })
    })
    .remove()

  // Stash the old positions for transition.
  nodes.forEach((d) => {
    d.x0 = d.x
    d.y0 = d.y
  })
}

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children
    d.children = null
  } else {
    d.children = d._children
    d._children = null
  }
}
