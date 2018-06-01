//Handles board behavior
class LifeBoard {
    constructor(board) {
        this.setBoard(board);
    }

    setBoard(board) {
        if(typeof board === 'string') {
            board = board.split("\n");
        } else if(typeof board !== 'object' || board.constructor !== Array) {
            //TODO: error message
            return;
        }

        this._board = [];

        const boardHeight = board.length;
        for(let i = 0; i < boardHeight; i++) {
            this.setRow(i, board[i]);
        }

        //in a real application I would put some code here to validate that the board rows are all the same width.
    }

    setRow(yPos, rowArray) {

        if(typeof rowArray === 'string') {
            rowArray = rowArray.split('');
        } else if(typeof rowArray !== 'object' || rowArray.constructor !== Array) {
            //TODO: error message
            return;
        }

        const rowWidth = rowArray.length;
        for(let i = 0; i < rowWidth; i++) {
            this.setCell(i, yPos, rowArray[i]);
        }
    }

    setCell(xPos, yPos, value) {
        //check for invalid postiions
        if(xPos < 0 || xPos > this.getBoardWidth() || yPos < 0 || yPos > this.getBoardHeight()) {
            //TODO: error message
            return;
        }

        if(typeof value === 'boolean') {
            value = value ? 1 : 0;
        } else {
            value = parseInt(value);
            if(isNaN(value)) {
                value = 0;
            }
        }

        if(this._board[yPos] === undefined) {
            this._board[yPos] = [];
        }

        this._board[yPos][xPos] = value >= 1 ? 1 : 0;
    }

    getCell(xPos, yPos) {
        return this._board[yPos][xPos];
    }

    getBoardWidth() {
        if(this._board.length === 0) {
            return 0;
        }

        return this._board[0].length;
    }

    getBoardHeight() {
        return this._board.length;
    }

    countLiveNeighbors(xPos, yPos) {
        const startX = xPos > 0 ? xPos - 1 : xPos;
        const startY = yPos > 0 ? yPos - 1 : yPos;

        const boardHeight = this.getBoardHeight();

        let liveCount = 0;

        for(let i = startY; i <= yPos + 1 && i < boardHeight; i++) {
            const row = this._board[i];

            liveCount += row.slice(startX, xPos + 2).reduce((accumulator, val) => accumulator + val, 0);

            //exclude actual cell from count
            if(i === yPos) {
                liveCount -= this.getCell(xPos, yPos);
            }
        }

        return liveCount;
    }

    getNextGenCell(xPos, yPos) {
        const neighborCount = this.countLiveNeighbors(xPos, yPos);

        if(neighborCount === 3 || neighborCount === 2 && this.getCell(xPos, yPos) === 1) {
            return 1;
        }

        return 0;
    }

    getNextGenBoard() {
        const nextBoard = [];

        const height = this.getBoardHeight();
        const width = this.getBoardWidth();

        for(let y = 0; y < height; y++) {
            const nextRow = [];
            for(let x = 0; x < width; x++) {
                nextRow.push(this.getNextGenCell(x, y));
            }

            nextBoard.push(nextRow);
        }

        return new LifeBoard(nextBoard);
    }

}

//Initializes the game and the UI
const gameHandler = {

    init() {
        const beginningBoard = [
            [0,1,0,0,0],
            [1,0,0,1,1],
            [1,1,0,0,1],
            [0,1,0,0,0],
            [1,0,0,0,1]
        ];

        this.gameBoard = new LifeBoard(beginningBoard);

        this.updateBoardView();
        this.setupEventHandlers();
    },

    setupEventHandlers() {
        //click handlers for cells
        document.querySelectorAll('.board-cell').forEach((cell) =>{ cell.addEventListener('click', () => { this.toggleCell(cell); } ) });

        //button to move onto next gen
        document.getElementById('next').addEventListener('click', () => { this.progressNextGeneration() });
    },

    updateBoardView() {
        const rows = document.querySelectorAll('.board-row');
        //this.gameBoard._board.map((r) => console.log(r.toString()));

        const numRows = rows.length;
        for(let y = 0; y < numRows; y++) {
            const row = rows.item(y);
            row.querySelectorAll('.board-cell').forEach((cell, x) => { this.setCellView(cell, this.gameBoard.getCell(x, y)); })
        }
    },

    setCellView(cell, alive) {
        if(alive) {
            cell.classList.add('alive');
            cell.dataset.alive = 1;
        } else {
            cell.classList.remove('alive');
            cell.dataset.alive = 0;
        }
    },

    toggleCell(cell) {
        const newValue = cell.dataset.alive == 0 ? 1 : 0; 
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.parentElement.dataset.y);

        this.gameBoard.setCell(x, y, newValue);
        this.setCellView(cell, newValue);
    },

    progressNextGeneration() {
        this.gameBoard = this.gameBoard.getNextGenBoard();
        this.updateBoardView();
    }

    
}

gameHandler.init();