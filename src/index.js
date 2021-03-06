import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let winningStyle = null;
    if(props.isWinningSquareIndex) {
         winningStyle = {
            backgroundColor: 'green'
        };
    }

    return (
        <button className="square" style={winningStyle} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i, col, row) {
        let isWinningSquareIndex = null;
        if(this.props.winningSquareIndexes !== null) {
            for(let x = 0; x !== 3; ++x) {
                isWinningSquareIndex = this.props.winningSquareIndexes[x] === i;
                if (isWinningSquareIndex) {break;}
            }
        }

        return (
            <Square value={this.props.squares[i]}
                    onClick={() => this.props.onClick(i, col, row)}
                    key={i}
                    isWinningSquareIndex={isWinningSquareIndex}
            />
        );
    }

    render() {
        let squareCounter = 0;
        let squareRows = [];

        for(let i = 0; i !== 3; ++i) {
            let square = [];

            for(let x = 0; x !== 3; ++x) {
                square.push(this.renderSquare(squareCounter, x, i));
                ++squareCounter;
            }

            squareRows.push(<div className="board-row" key={i}>{square}</div>);
        }

        return <div>{squareRows}</div>;
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            history: [{
                squares: [Array(9).fill(null), 0, 0],
            }],
            xIsNext: true,
            stepNumber: 0,
            isGameFinished: false,
            winner: ''
        }
    }

    handleClick(i, col, row) {
        if(this.state.isGameFinished) {return;}

        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = cloneArray(current.squares);

        if(squares[0][i] !== null) {
            return;
        }

        squares[0][i] = this.state.xIsNext ? 'X' : 'O';
        squares[1] = col;
        squares[2] = row;

        const winner = calculateWinner(squares[0]);

        this.setState(
            {
                history: history.concat([{
                    squares: squares,
                }]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
                isGameFinished: winner !== null,
                winner: winner
            });
    }

    jumpTo(step, x) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });

        //Might be cleaner to use selector syntax here? I.e getElementById..
        let selectedButton = x.currentTarget;
        let selectedListItem = selectedButton.parentElement;
        let orderedList = selectedListItem.parentElement;

        setFontWeightToHTMLCollection(orderedList, "normal");
        selectedListItem.style.fontWeight = "bold";
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        let winningSquareIndexes = null;
        let status;

        if(this.state.stepNumber === 9 && this.state.winner === null) {
            status = 'Draw - No Winners.';
        }
        else if(this.state.winner) {
            status = 'Winner: ' + this.state.winner;
            winningSquareIndexes = getWinningSquares(current.squares[0]); //TODO: Avoid re-calculating this.
        }
        else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        const moves = this.getMoves(history);

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares[0]}
                        onClick={(i, col, row) => this.handleClick(i, col, row)}
                        winningSquareIndexes={winningSquareIndexes}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                    <button onClick={() => this.reverseTimeTravelList()}>Toggle Order Asc/Desc</button>
                </div>
            </div>
        );
    }

    getMoves(history) {
        let moves = history.map((step, move) => {
            const isFirstMove = move === 0;
            let desc = 'Go to move #' + move;
            let locationInformation = step.squares[1] + ', ' + step.squares[2];

            if(isFirstMove) {
                desc = 'Go to game start';
                locationInformation = '';
            }

            return (
                <li key={move}>
                    <button onClick={(x) => this.jumpTo(move, x)}>{desc}</button>{locationInformation}
                </li>
            )
        });

        if (this.state.isTimeTravelListReversed) {
            moves = moves.reverse();
        }

        return moves;
    }

    reverseTimeTravelList() {
        this.setState({
            isTimeTravelListReversed: !this.state.isTimeTravelListReversed,
        });
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function getWinningSquares(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return lines[i];
        }
    }
    return null;
}

function calculateWinner(squares) {
    const winningSquareIndexes = getWinningSquares(squares);
    if(winningSquareIndexes !== null) {
        return squares[winningSquareIndexes[0]];
    } else {
        return null;
    }
}

function cloneArray(arr) {
    //Thanks to this website, detailing an easy way to deep clone multi-dimensional arrays:
    //https://www.freecodecamp.org/news/how-to-clone-an-array-in-javascript-1d3183468f6a/
    return JSON.parse(JSON.stringify(arr));
}

function setFontWeightToHTMLCollection(html, weight) {
    let children = html.children;
    for (let i = 0; i < children.length; i++) {
        children[i].style.fontWeight = weight;
    }
}
