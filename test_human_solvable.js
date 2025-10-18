/**
 * Test script for human-solvable puzzle generation
 * Run with: node test_human_solvable.js
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

function findViolatingCells() {
    const violatingCells = new Set();

    for (let row = 0; row < GRID_SIZE; row++) {
        const rowValues = getRow(row);

        if (hasConsecutiveViolation(rowValues)) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (rowValues[col] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }

        if (hasBalanceViolation(rowValues)) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (rowValues[col] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
        const colValues = getColumn(col);

        if (hasConsecutiveViolation(colValues)) {
            for (let row = 0; row < GRID_SIZE; row++) {
                if (colValues[row] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }

        if (hasBalanceViolation(colValues)) {
            for (let row = 0; row < GRID_SIZE; row++) {
                if (colValues[row] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }
    }

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = i + 1; j < GRID_SIZE; j++) {
            if (areArraysIdentical(getRow(i), getRow(j))) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    violatingCells.add(`${i},${col}`);
                    violatingCells.add(`${j},${col}`);
                }
            }
        }
    }

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = i + 1; j < GRID_SIZE; j++) {
            if (areArraysIdentical(getColumn(i), getColumn(j))) {
                for (let row = 0; row < GRID_SIZE; row++) {
                    violatingCells.add(`${row},${i}`);
                    violatingCells.add(`${row},${j}`);
                }
            }
        }
    }

    return violatingCells;
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

function restoreGridState(savedState) {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            gridState[row][col].value = savedState[row][col].value;
            gridState[row][col].locked = savedState[row][col].locked;
        }
    }
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

// Logic-based solving techniques
function logicTwoAdjacent() {
    let madeChange = false;

    for (let row = 0; row < GRID_SIZE; row++) {
        const line = gridState[row];
        for (let col = 0; col < GRID_SIZE - 1; col++) {
            if (line[col].value !== 0 && line[col].value === line[col + 1].value) {
                const val = line[col].value;
                const opposite = val === 1 ? 2 : 1;

                if (col > 0 && line[col - 1].value === 0) {
                    line[col - 1].value = opposite;
                    madeChange = true;
                }

                if (col + 2 < GRID_SIZE && line[col + 2].value === 0) {
                    line[col + 2].value = opposite;
                    madeChange = true;
                }
            }
        }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 1; row++) {
            if (gridState[row][col].value !== 0 &&
                gridState[row][col].value === gridState[row + 1][col].value) {
                const val = gridState[row][col].value;
                const opposite = val === 1 ? 2 : 1;

                if (row > 0 && gridState[row - 1][col].value === 0) {
                    gridState[row - 1][col].value = opposite;
                    madeChange = true;
                }

                if (row + 2 < GRID_SIZE && gridState[row + 2][col].value === 0) {
                    gridState[row + 2][col].value = opposite;
                    madeChange = true;
                }
            }
        }
    }

    return madeChange;
}

function logicTwoSeparated() {
    let madeChange = false;

    for (let row = 0; row < GRID_SIZE; row++) {
        const line = gridState[row];
        for (let col = 0; col < GRID_SIZE - 2; col++) {
            if (line[col].value !== 0 &&
                line[col].value === line[col + 2].value &&
                line[col + 1].value === 0) {
                const opposite = line[col].value === 1 ? 2 : 1;
                line[col + 1].value = opposite;
                madeChange = true;
            }
        }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            if (gridState[row][col].value !== 0 &&
                gridState[row][col].value === gridState[row + 2][col].value &&
                gridState[row + 1][col].value === 0) {
                const opposite = gridState[row][col].value === 1 ? 2 : 1;
                gridState[row + 1][col].value = opposite;
                madeChange = true;
            }
        }
    }

    return madeChange;
}

function logicMaxCountReached() {
    let madeChange = false;

    for (let row = 0; row < GRID_SIZE; row++) {
        const line = gridState[row];
        const rowValues = line.map(c => c.value);

        if (rowValues.includes(0)) {
            const onesCount = rowValues.filter(v => v === 1).length;
            const twosCount = rowValues.filter(v => v === 2).length;

            if (onesCount === 3) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (line[col].value === 0) {
                        line[col].value = 2;
                        madeChange = true;
                    }
                }
            }

            if (twosCount === 3) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (line[col].value === 0) {
                        line[col].value = 1;
                        madeChange = true;
                    }
                }
            }
        }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
        const colValues = getColumn(col);

        if (colValues.includes(0)) {
            const onesCount = colValues.filter(v => v === 1).length;
            const twosCount = colValues.filter(v => v === 2).length;

            if (onesCount === 3) {
                for (let row = 0; row < GRID_SIZE; row++) {
                    if (gridState[row][col].value === 0) {
                        gridState[row][col].value = 2;
                        madeChange = true;
                    }
                }
            }

            if (twosCount === 3) {
                for (let row = 0; row < GRID_SIZE; row++) {
                    if (gridState[row][col].value === 0) {
                        gridState[row][col].value = 1;
                        madeChange = true;
                    }
                }
            }
        }
    }

    return madeChange;
}

function logicAvoidDuplicates() {
    let madeChange = false;

    for (let row1 = 0; row1 < GRID_SIZE; row1++) {
        const line1 = gridState[row1].map(c => c.value);
        const empties1 = line1.filter(v => v === 0).length;

        if (empties1 !== 2) continue;

        for (let row2 = 0; row2 < GRID_SIZE; row2++) {
            if (row1 === row2) continue;

            const line2 = gridState[row2].map(c => c.value);
            if (line2.includes(0)) continue;

            let matches = true;
            for (let col = 0; col < GRID_SIZE; col++) {
                if (line1[col] !== 0 && line1[col] !== line2[col]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (line1[col] === 0) {
                        const opposite = line2[col] === 1 ? 2 : 1;
                        gridState[row1][col].value = opposite;
                        madeChange = true;
                    }
                }
            }
        }
    }

    for (let col1 = 0; col1 < GRID_SIZE; col1++) {
        const line1 = getColumn(col1);
        const empties1 = line1.filter(v => v === 0).length;

        if (empties1 !== 2) continue;

        for (let col2 = 0; col2 < GRID_SIZE; col2++) {
            if (col1 === col2) continue;

            const line2 = getColumn(col2);
            if (line2.includes(0)) continue;

            let matches = true;
            for (let row = 0; row < GRID_SIZE; row++) {
                if (line1[row] !== 0 && line1[row] !== line2[row]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                for (let row = 0; row < GRID_SIZE; row++) {
                    if (line1[row] === 0) {
                        const opposite = line2[row] === 1 ? 2 : 1;
                        gridState[row][col1].value = opposite;
                        madeChange = true;
                    }
                }
            }
        }
    }

    return madeChange;
}

function solveWithLogic(maxIterations = 100) {
    const techniques = [
        logicTwoAdjacent,
        logicTwoSeparated,
        logicMaxCountReached,
        logicAvoidDuplicates
    ];

    let iterations = 0;

    while (iterations < maxIterations) {
        let madeProgress = false;

        for (const technique of techniques) {
            if (technique()) {
                madeProgress = true;
            }
        }

        const allFilled = gridState.every(row => row.every(cell => cell.value !== 0));
        if (allFilled) {
            const violations = findViolatingCells();
            return violations.size === 0 ? 'solved' : 'invalid';
        }

        if (!madeProgress) {
            return 'stuck';
        }

        iterations++;
    }

    return 'stuck';
}

function isHumanSolvable() {
    const saved = copyGridState();
    const result = solveWithLogic();
    restoreGridState(saved);
    return result === 'solved';
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
    const maxAttempts = 50;

    console.log(`Generating ${difficulty} puzzle (human-solvable)...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (!generateCompleteGrid()) {
            console.error('Failed to generate complete grid');
            continue;
        }

        const positions = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                positions.push({ row, col });
            }
        }
        const shuffledPositions = shuffleArray(positions);

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

        if (isHumanSolvable()) {
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    gridState[row][col].locked = gridState[row][col].value !== 0;
                }
            }

            console.log(`✓ Human-solvable puzzle found! (attempt ${attempt}/${maxAttempts})`);
            console.log(`  Clues: ${currentClues} (target: ${numClues})`);
            return true;
        } else {
            console.log(`  Attempt ${attempt}: Not human-solvable, trying again...`);
        }
    }

    console.warn(`⚠ Could not find human-solvable puzzle in ${maxAttempts} attempts`);
    return false;
}

function printGrid() {
    console.log('');
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
console.log('=== HUMAN-SOLVABLE PUZZLE GENERATOR TEST ===\n');

console.log('Test 1: Generate Easy Human-Solvable Puzzle');
const start1 = Date.now();
const success1 = generatePuzzle('easy');
const time1 = Date.now() - start1;
if (success1) {
    printGrid();
}
console.log(`Time: ${time1}ms\n`);

console.log('Test 2: Generate Medium Human-Solvable Puzzle');
const start2 = Date.now();
const success2 = generatePuzzle('medium');
const time2 = Date.now() - start2;
if (success2) {
    printGrid();
}
console.log(`Time: ${time2}ms\n`);

console.log('Test 3: Generate Hard Human-Solvable Puzzle');
const start3 = Date.now();
const success3 = generatePuzzle('hard');
const time3 = Date.now() - start3;
if (success3) {
    printGrid();
}
console.log(`Time: ${time3}ms\n`);

console.log('=== ALL TESTS COMPLETE ===');
console.log(`Success rate: ${[success1, success2, success3].filter(x => x).length}/3`);
