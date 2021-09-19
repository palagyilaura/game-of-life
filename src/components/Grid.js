import React, { useState, useCallback, useRef, useEffect } from "react";
import "../css/Grid.css";
import produce from "immer";

const numRows = 30;
const numCols = 30;

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numCols), () => 0));
  }
  return rows;
};

const operations = [
  [0, 1],
  [1, 0],
  [-1, 0],
  [0, -1],
  [1, -1],
  [-1, 1],
  [-1, -1],
  [1, 1],
];

function Grid() {
  let [generation, setGeneration] = useState(0);
  let [population, setPopulation] = useState(0);

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });

  const [initialGrid, setInitialGrid] = useState();

  const handleClick = (i, j) => {
    const newGrid = produce(grid, (gridCopy) => {
      gridCopy[i][j] = grid[i][j] ? 0 : 1;
    });
    setGrid(newGrid);
    setInitialGrid(newGrid);
  };
  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  const simulation = () => {
    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            let neighbours = 0;
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
                neighbours += g[newI][newJ];
              }
            });
            //dies
            if (neighbours < 2 || neighbours > 3) {
              gridCopy[i][j] = 0;
            }
            //lives
            else if (g[i][j] === 0 && neighbours === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });
  };

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }
    simulation();
    setTimeout(runSimulation, 100);

    setGeneration((g) => ++g);
  }, []);

  useEffect(() => {
    let sum = 0;
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        if (grid[i][j] === 1) {
          sum++;
        }
      }
    }
    setPopulation(sum);
  }, [grid]);

  const handleRun = () => {
    setRunning(!running);
    if (!running) {
      runningRef.current = true;
      runSimulation();
    }
  };
  const handleStep = () => {
    setGeneration(++generation);
    simulation();
  };
  const handleReset = () => {
    setGrid(initialGrid);
    setGeneration(0);
    setRunning(false);
  };
  const handleClear = () => {
    setGeneration(0);
    setGrid(generateEmptyGrid());
    setInitialGrid(generateEmptyGrid());
    setRunning(false);
  };

  const handleRandom = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(
        Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0))
      );
    }
    setGrid(rows);
    setInitialGrid(rows);
  };

  return (
    <section className="main-container">
      <div className="btn-group">
        <button className="btn btn-success" onClick={handleRun}>
          {running ? "Pause" : "Start"}
        </button>
        <button
          className="btn btn-outline-primary"
          onClick={handleStep}
          disabled={runningRef.current ? true : false}
        >
          Step&gt;
        </button>
        <button className="btn btn-outline-primary" onClick={handleReset}>
          Reset
        </button>
        <button className="btn btn-outline-primary" onClick={handleClear}>
          Clear
        </button>
        <button className="btn btn-outline-primary" onClick={handleRandom}>
          Random
        </button>
      </div>
      <div className="container">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${numCols}, 20px)` }}
        >
          {grid.map((rows, i) =>
            rows.map((cols, j) => (
              <div
                key={`${i}-${j}`}
                className="cell"
                style={{ backgroundColor: grid[i][j] ? "#6f42c1" : undefined }}
                onClick={() => handleClick(i, j)}
              />
            ))
          )}
        </div>
        <div className="text-box">
          <div className="generation">Generation: {generation}</div>
          <div className="population">Population: {population}</div>
        </div>
      </div>
    </section>
  );
}

export default Grid;
