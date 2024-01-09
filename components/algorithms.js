class Algorithms{

constructor(canvas){
this.grid          = Array(80).fill(0).map(() => Array(30).fill("0"));
this.canvas        = canvas;
this.canvas.width  = 1200;
this.canvas.height = 600;

//Colors Object:-
this.colors = {
    green :'green',
    red :'red',
    grey :'grey',
    black: 'black',
    blue : 'rgb(10, 114, 233)'
    }
}

bfs(matrix){
return;
}
getNeigbors(){
 
}

gridDraw(){
let x = 0;
let y = 0;

const matrix = this.grid;
const canvasInstatiate = document.getElementById(this.canvas);
const context = canvasInstatiate.getContext('2d');

this.canvasWidth  = canvas.width/this.width;
this.canvasHeight = canvas.height/this.height;
    
for(let row = 0; row < matrix.length; row++){
    for(let col = 0; col < matrix[row].length; col++){
        y = col * this.canvasWidth;
        x = row * this.canvasHeight;
            
        context.strokeStyle = this.colors.grey;
        context.rect(x, y, this.canvasWidth, this.canvasHeight, 5);
        context.stroke();               
        }
    }
}

getPos(){

}
play(){

}
test(){
    console.log('Test function');
}
}
//export default Algorithms; // Export the class