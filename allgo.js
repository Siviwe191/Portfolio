class Algorithms{

constructor(container,maze)
{
this.container = container;
this.colors = {green :'green',red :'red',grey :'grey',black :'black',blue :'rgb(10, 114, 233)',white:'white',orange:'orange'}
this.grid = maze;
this.start = start;
this.end = end;

}

/*
 * Draw grid using hexagon css style
 * Used for all algorihthms
*/
draw(){
    for(let row=0; row < this.grid.length; row++ ){
        let outerid = this.outerdiv(row);
        var rowDiv = $('<div>', {
            id: outerid,
            class: 'rows'
        });

        for(let col=0; col < this.grid[row].length; col++){
            let innerid = this.innerdiv(col);
            var innerDiv = $('<div>', {
                id: innerid,
                class:'hexagon'
            });
            rowDiv.append(innerDiv);
        }
        $(this.container).append(rowDiv);
       
    }
  
    return this.container;
}

outerdiv(row){ return row; }

innerdiv(col){ return col; }

getposition(target){
    $('.hexagon').on('click', function (event) {
        const rect = this.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        console.log(`Clicked on hexagon (X: ${x}, Y: ${y})`);
       
    });
}


async iterator(row,col,type){
await new Promise(resolve => setTimeout(resolve, 100)); 
    const canvas = this.container; 
    const rowElements = canvas.getElementsByClassName('rows');
    const rowElement = rowElements[row];
    const rowId = rowElement.id;
    const hexagonElements = rowElement.getElementsByClassName('hexagon');
    const hexagonElement = hexagonElements[col];
    const colId = hexagonElement.id;

    if(type == 'visited'){
        if(rowId == row && colId == col) {hexagonElement.style.backgroundColor = this.colors.blue};
    }else if(type == 'neighbor'){
        if(rowId == row && colId == col) {hexagonElement.style.backgroundColor = this.colors.green};
    }else if(type == 'wall'){
        if(rowId == row && colId == col) {hexagonElement.style.backgroundColor = this.colors.white};
    }else if(type == 'path'){
      if(rowId == row && colId == col) {hexagonElement.style.backgroundColor = this.colors.orange};
  }
     
}

/* Start bfs */
async bfs(grid, startRow, startCol, targetRow, targetCol,speed,visited) {
  const queue = [];
  const path = [];
  const rows = grid.length;
  const cols = grid[0].length;

  const distances = new Array(rows).fill(0).map(() => new Array(cols).fill(Infinity));
  queue.push([startRow, startCol]);
  visited[startRow][startCol] = true;
 
  distances[startRow][startCol] = 0;
  while (queue.length > 0) {
    const [currentRow, currentCol] = queue.shift();
    path.push([currentRow, currentCol]);
   
    if (currentRow === targetRow && currentCol === targetCol) {
      this.reconstruct(startRow,startCol,targetRow, targetCol,distances)
      return path; // Found the target node
    }

    if(visited[currentRow][currentCol]){
      this.iterator(currentRow, currentCol,'visited');
    }

    await new Promise(resolve => setTimeout(resolve, speed));
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of directions) {
      const newRow = currentRow + dr;
      const newCol = currentCol + dc;
     
      if (this.isValid(grid,newRow, newCol) && !visited[newRow][newCol]) {
        queue.push([newRow, newCol]);
        
        visited[newRow][newCol] = true;
        
        const newDistance = distances[currentRow][currentCol] + 1;
          if (newDistance < distances[newRow][newCol]) {
            this.iterator(newRow, newCol,'neighbor');
            distances[newRow][newCol] = newDistance;
          }
       
      }
    }
    
  }

  return []; // No path found
}

async playbfs(node,speed){
let matrix = this.grid;

let startpoint_a = node.start[0];
let startpoint_b = node.start[1];

let endpoint_a = node.end[0];
let endpoint_b = node.end[1];

const visitedMatrix = matrix.map(row=>row.map(col=>false));
        
await new Promise(resolve => setTimeout(resolve, speed));
this.bfs(matrix, startpoint_a, startpoint_b, endpoint_a, endpoint_b,speed,visitedMatrix);
  
}

/* End bfs */


/* Start dfs */
async playdfs(node,speed){
let matrix = this.grid;

const start_row = node.start[0];
const start_col = node.start[1];
const endpoint_a = node.end[0];
const endpoint_b = node.end[1];

const path = this.dfs(matrix, start_row , start_col,endpoint_a, endpoint_b,speed); 

}

async dfs(grid, startRow, startCol,targetRow, targetCol,speed) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Array(rows).fill(false).map(() => new Array(cols).fill(false));
  const path = [];
  await new Promise(resolve => setTimeout(resolve, speed));
  return this.dfsHelper(grid,startRow, startCol,targetRow, targetCol,visited,path,speed) ? path : []; // Return the path if found, otherwise empty array
}

isValid(grid,row, col) {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length && grid[row][col] !== 1;
}

async dfsHelper(grid,row, col, targetRow, targetCol,visited,path,speed) {
  if (row === targetRow && col === targetCol) {
    return true; // Found the target node
  }

  visited[row][col] = true;
  path.push([row, col]);

  await new Promise(resolve => setTimeout(resolve, 100));
  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (this.isValid(grid,newRow, newCol) && !visited[newRow][newCol]) {
      if (this.dfsHelper(grid,newRow, newCol,targetRow, targetCol,visited,path,speed)) {
        this.iterator(newRow, newCol,'visited');
        return true; // Path found through this neighbor
      }
    }
  }

  path.pop(); // Backtrack if no path found through this neighbor
  return false;
}
/* End dfs */


/* Start dijkstra */
 async dijkstra(grid, startRow, startCol, targetRow, targetCol,speed) {
    let tt;
 
    if(typeof speed == 'number') { tt =  speed};
    const rows = grid.length;
    const cols = grid[0].length;

    const distances = new Array(rows).fill(0).map(() => new Array(cols).fill(Infinity));
    const visited = new Array(rows).fill(false).map(() => new Array(cols).fill(false));
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  
    distances[startRow][startCol] = 0;
    let currentNode = [startRow, startCol];
  
    while (!visited[targetRow][targetCol]) {
      visited[currentNode[0]][currentNode[1]] = true;
      await new Promise(resolve => setTimeout(resolve, parseInt(tt)));
      for (const [dr, dc] of directions) {
        const newRow = currentNode[0] + dr;
        const newCol = currentNode[1] + dc;
        this.iterator(currentNode[0],currentNode[1],'visited');

        if (
          this.isValid(grid, newRow, newCol) &&
          !visited[newRow][newCol] &&
          grid[newRow][newCol] !== 1 // Assuming 1 represents walls
        ) {
          const newDistance = distances[currentNode[0]][currentNode[1]] + 1;
          if (newDistance < distances[newRow][newCol]) {
            this.iterator(newRow, newCol,'neighbor');
            distances[newRow][newCol] = newDistance;
          }
        }
      }
  
      currentNode = this.findUnvisitedMinDistanceNode(distances, visited);
      if (!currentNode) {
        return []; // No path found
      }
      
    }
    this.reconstruct(startRow,startCol,targetRow, targetCol,distances)
    
  }
  reconstruct(startRow,startCol,targetRow, targetCol,distances){
    const path = [];
    let current = [targetRow, targetCol];
    while (current[0] !== startRow || current[1] !== startCol) {
      path.push(current);
      current = this.findPreviousNode(distances, current);
      this.iterator(current[0],current[1],'path');
      if (!current) {
        return []; 
      }
    }
    path.push(startRow, startCol);
    path.reverse(); 
    return path;
  } 
  
 findUnvisitedMinDistanceNode(distances, visited) {
    let minNode = null;
    let minDistance = Infinity;
  
    for (let row = 0; row < distances.length; row++) {
      for (let col = 0; col < distances[0].length; col++) {
        if (!visited[row][col] && distances[row][col] < minDistance) {
          minNode = [row, col];
          minDistance = distances[row][col];
        }
      }
    }
  
    return minNode;
  }
  
findPreviousNode(distances, current) {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of directions) {
      const newRow = current[0] + dr;
      const newCol = current[1] + dc;
      if (
        this.isValid(distances, newRow, newCol) &&
        distances[newRow][newCol] + 1 === distances[current[0]][current[1]]
      ) {
        return [newRow, newCol];
      }
    }
    return null;
  }
   
async playdijkstra(node,speed){
let graph = this.grid;
const start_row = node.start[0];
const start_col = node.start[1];
const endpoint_a = node.end[0];
const endpoint_b = node.end[1];

this.dijkstra(graph, start_row, start_col,endpoint_a, endpoint_b,speed);
await new Promise(resolve => setTimeout(resolve, parseInt(speed)));
}
/* End dijkstra */



/* Start astar */
 heuristic(node) {
    const dx = Math.abs(node.pos.x - this.end.pos.x);
    const dy = Math.abs(node.pos.y - this.end.pos.y);
    return dx + dy; // Manhattan distance heuristic
  }

  neighbors(node) {
    const ret = [];
    const [x, y] = node.pos;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      const newPos = [newX, newY];
      
   
      if (
        newX >= 0 &&
        newX < this.grid.length &&
        newY >= 0 &&
        newY < this.grid[0].length &&
        this.grid[newX][newY] !== 1
      ) {
        const neighbor = new Node(newPos, node);
        neighbor.g = node.g + 1;
        neighbor.h = this.heuristic(neighbor);
        neighbor.f = neighbor.g + neighbor.h;
        ret.push(neighbor);
       
      }
    }

    return ret;
  } 

  async search(node,speed) {
    
    const openSet = new Set();
    const closedSet = new Set();
    let start_node = node.start;
    let target_node = node.end;
    
    this.start = new Node(start_node);
    this.end = new Node(target_node);

    openSet.add(this.start);
     
    const visitedMatrix = this.grid.map(row=>row.map(col=>false));
    
    while (openSet.size > 0) {
      const current = openSet.values().next().value;
      await new Promise(resolve => setTimeout(resolve, speed));
      if (current.pos.every((value, index) => value === this.end.pos[index])) {
          return this.reconstructPath(current);
        }
        

      openSet.delete(current);
      closedSet.add(current);
     
      for (const neighbor of this.neighbors(current)) {
            
            let row = neighbor.pos[0];
            let col = neighbor.pos[1];
            if( !visitedMatrix[row][col] ){
            visitedMatrix[row][col] = true;
           

            if(visitedMatrix[row][col]){
                this.iterator(neighbor.pos[0],neighbor.pos[1],'neighbor');
                
            }
            
            if (closedSet.has(neighbor)) {
            continue;
            }

        const existingNeighbor = openSet.has(neighbor) ? openSet.get(neighbor) : null;
       
        if (!existingNeighbor || neighbor.f < existingNeighbor.f) {
          if (existingNeighbor) {
            openSet.delete(existingNeighbor);
          }
         
          openSet.add(neighbor);
        }
    }
     
    }
    }

    return null; // No path found
  }
  

 reconstructPath(node) {
    const path = [];
    let current = node;

    while (current) {
      path.unshift(current.pos);
      current = current.parent;
    }
   
    for(const [row,col] of path){
        this.iterator(row,col,'path');
    }
    return path;
  }

async playastar(node,speed){
const path = this.search(node,speed);
   
}
/* End astar */



/* Start bidirectional */

getneighbors(matrix,row,col){
  const neighbors = [];
  if(row !== 0)   neighbors.push([row - 1, col]);
  if(col !== 0)   neighbors.push([row, col - 1]);
  if(row !== matrix.length - 1)   neighbors.push([row + 1, col]);
  if(col !== matrix[0].length - 1)   neighbors.push([row, col + 1]);
      
  return neighbors; 
  }
   async bidirectional_searchA(matrix,row,col,visited,speed){
        await new Promise(resolve => setTimeout(resolve, speed));    
        if(visited[row][col]) {   
        this.iterator(row,col,'visited');
        return;
        }
        visited[row][col] = true;
        const neighbors = this.getneighbors(matrix,row, col);
        for(const[neighborrow, neighborcol] of neighbors){
            this.iterator(neighborrow,neighborcol,'neighbor')
                this.bidirectional_searchA(matrix,neighborrow, neighborcol,visited,speed);
        }  
    }
   async bidirectional_searchB(matrix,row,col,visited,speed){
        await new Promise(resolve => setTimeout(resolve, speed));    
        if(visited[row][col]) {   
        this.iterator(row,col,'visited');
        return;
        }
        visited[row][col] = true;
        const neighbors = this.getneighbors(matrix,row, col);
        for(const[neighborrow, neighborcol] of neighbors){
            this.iterator(neighborrow,neighborcol,'neighbor')
                this.bidirectional_searchB(matrix,neighborrow, neighborcol,visited,speed);
        }
    }
    async playbidirectional(node,speed){
    let matrix = this.grid;
 
   const startrow = node.start[0];
   const startcol = node.start[1];
   const targetrow = node.end[0];
   const targetcol = node.end[1];

    const visitedMatrix = matrix.map(row=>row.map(col=>false));
        for(let row = 0; row < matrix.length; row++){
            for(let col = 0; col < matrix[row].length; col++){
                await new Promise(resolve => setTimeout(resolve, 100));
                    const promiseA = this.bidirectional_searchA(matrix, startrow, startcol, visitedMatrix,speed);
                    const promiseB = this.bidirectional_searchB(matrix, targetrow, targetcol, visitedMatrix,speed);
                     await Promise.all([promiseA, promiseB]);
                }
            }
    }
/* End bidirectional */


mazes(maze){
    for(let row = 0; row < maze.length; row++){
        for(let col = 0; col < maze[row].length; col++){ 
            if(maze[row][col] == 1) this.iterator(row,col,'wall');
        }
    }
 
}

}
class Node {
    constructor(pos, parent = null) {
      this.pos = pos;
      this.parent = parent;
      this.g = 0; // Distance from start
      this.h = 0; // Heuristic distance to goal
      this.f = 0; // Total cost (g + h)
    }
  }
  
  
  