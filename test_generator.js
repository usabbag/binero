/**
 * Test script for puzzle generation
 * Run with: node test_generator.js
 */

const GRID_SIZE = 6;

// Create grid state
const gridState = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
        value: 0,
        locked: false
    }))
);

// Helper functions
function getRow(rowIndex) {
    return gridState[rowIndex].map(cell => cell.value);
}

function getColumn(colIndex) {
    return gridState.map(row => row[colIndex].value);
}

function hasConsecutiveViolation(values) {
    for (let i = 0; i < values.length - 2; i++) {
        if (values[i] !== 0 && values[i] === values[i + 1] && values[i] === values[i + 2]) {
            return true;
        }
    }
    return false;
}

function hasBalanceViolation(values) {
    const fullCount = values.filter(v => v === 1).length;
    const emptyCount = values.filter(v => v === 2).length;
    return fullCount > 3 || emptyCount > 3;
}

function areArraysIdentical(arr1, arr2) {
    const hasUnfilled1 = arr1.some(v => v === 0);
    const hasUnfilled2 = arr2.some(v => v === 0);

    if (hasUnfilled1 || hasUnfilled2) {
        return false;
    }

    return arr1.every((val, idx) => val === arr2[idx]);
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function copyGridState() {
    return gridState.map(row =>
        row.map(cell => ({
            value: cell.value,
            locked: cell.locked
        }))
    );
}

function isValidPlacement(row, col) {
    const rowValues = getRow(row);
    const colValues = getColumn(col);

    if (hasBalanceViolation(rowValues) || hasBalanceViolation(colValues)) {
        return false;
    }

    if (hasConsecutiveViolation(rowValues) || hasConsecutiveViolation(colValues)) {
        return false;
    }

    const rowComplete = rowValues.every(v => v !== 0);
    if (rowComplete) {
        for (let r = 0; r < GRID_SIZE; r++) {
            if (r !== row && areArraysIdentical(rowValues, getRow(r))) {
                return false;
            }
        }
    }

    const colComplete = colValues.every(v => v !== 0);
    if (colComplete) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (c !== col && areArraysIdentical(colValues, getColumn(c))) {
                return false;
            }
        }
    }

    return true;
}

function backtrackSolve(startRow = 0, startCol = 0, randomize = false) {
    let row = startRow;
    let col = startCol;
    let found = false;

    for (let r = row; r < GRID_SIZE && !found; r++) {
        for (let c = (r === row ? col : 0); c < GRID_SIZE; c++) {
            if (gridState[r][c].value === 0) {
                row = r;
                col = c;
                found = true;
                break;
            }
        }
    }

    if (!found) {
        return true;
    }

    const values = randomize ? shuffleArray([1, 2]) : [1, 2];

    for (const value of values) {
        gridState[row][col].value = value;

        if (isValidPlacement(row, col)) {
            if (backtrackSolve(row, col, randomize)) {
                return true;
            }
        }

        gridState[row][col].value = 0;
    }

    return false;
}

function countSolutions(startRow = 0, startCol = 0, maxCount = 2) {
    let row = startRow;
    let col = startCol;
    let found = false;

    for (let r = row; r < GRID_SIZE && !found; r++) {
        for (let c = (r === row ? col : 0); c < GRID_SIZE; c++) {
            if (gridState[r][c].value === 0) {
                row = r;
                col = c;
                found = true;
                break;
            }
        }
    }

    if (!found) {
        return 1;
    }

    let solutionCount = 0;

    for (const value of [1, 2]) {
        gridState[row][col].value = value;

        if (isValidPlacement(row, col)) {
            solutionCount += countSolutions(row, col, maxCount - solutionCount);

            if (solutionCount >= maxCount) {
                gridState[row][col].value = 0;
                return solutionCount;
            }
        }

        gridState[row][col].value = 0;
    }

    return solutionCount;
}

function generateCompleteGrid() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            gridState[row][col].value = 0;
            gridState[row][col].locked = false;
        }
    }

    return backtrackSolve(0, 0, true);
}

function generatePuzzle(difficulty = 'medium') {
    const targetClues = {
        easy: 22,
        medium: 18,
        hard: 14
    };

    const numClues = targetClues[difficulty] || targetClues.medium;

    console.log('Generating complete grid...');
    if (!generateCompleteGrid()) {
        console.error('Failed to generate complete grid');
        return false;
    }

    const positions = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            positions.push({ row, col });
        }
    }
    const shuffledPositions = shuffleArray(positions);

    console.log(`Removing cells to reach ${numClues} clues...`);
    let currentClues = GRID_SIZE * GRID_SIZE;

    for (const pos of shuffledPositions) {
        if (currentClues <= numClues) {
            break;
        }

        const { row, col } = pos;
        const originalValue = gridState[row][col].value;

        gridState[row][col].value = 0;

        const numSolutions = countSolutions(0, 0, 2);

        if (numSolutions === 1) {
            currentClues--;
        } else {
            gridState[row][col].value = originalValue;
        }
    }

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            gridState[row][col].locked = gridState[row][col].value !== 0;
        }
    }

    console.log(`Puzzle generated with ${currentClues} clues (target: ${numClues})`);
    return true;
}

function printGrid() {
    console.log('\nCurrent Grid:');
    for (let row = 0; row < GRID_SIZE; row++) {
        let line = '';
        for (let col = 0; col < GRID_SIZE; col++) {
            const val = gridState[row][col].value;
            const locked = gridState[row][col].locked;
            if (val === 0) {
                line += '. ';
            } else if (val === 1) {
                line += locked ? '● ' : '○ ';
            } else {
                line += locked ? '□ ' : '▢ ';
            }
        }
        console.log(line);
    }
}

// Run tests
console.log('=== BINERO PUZZLE GENERATOR TEST ===\n');

console.log('Test 1: Generate Easy Puzzle');
const start1 = Date.now();
generatePuzzle('easy');
const time1 = Date.now() - start1;
printGrid();
console.log(`Time: ${time1}ms\n`);

console.log('Test 2: Generate Medium Puzzle');
const start2 = Date.now();
generatePuzzle('medium');
const time2 = Date.now() - start2;
printGrid();
console.log(`Time: ${time2}ms\n`);

console.log('Test 3: Generate Hard Puzzle');
const start3 = Date.now();
generatePuzzle('hard');
const time3 = Date.now() - start3;
printGrid();
console.log(`Time: ${time3}ms\n`);

console.log('=== ALL TESTS COMPLETE ===');
