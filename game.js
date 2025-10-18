// Initialize 6x6 grid
const GRID_SIZE = 6;
const grid = document.getElementById('grid');

// Create grid state - each cell has value and locked property
const gridState = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
        value: 0,     // 0 = unfilled, 1 = full, 2 = empty
        locked: false // true for pre-filled cells
    }))
);

// Create grid cells
function createGrid() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.dataset.state = gridState[row][col].value;
            cell.dataset.locked = gridState[row][col].locked;

            // Add click handler
            cell.addEventListener('click', () => handleCellClick(row, col, cell));

            grid.appendChild(cell);
        }
    }
}

// Handle cell click - cycle through states
function handleCellClick(row, col, cell) {
    // Don't allow editing locked cells
    if (gridState[row][col].locked) {
        return;
    }

    // Cycle: 0 → 1 → 2 → 0
    gridState[row][col].value = (gridState[row][col].value + 1) % 3;
    cell.dataset.state = gridState[row][col].value;

    // Validate after change
    validateGrid();
}

// Get row values
function getRow(rowIndex) {
    return gridState[rowIndex].map(cell => cell.value);
}

// Get column values
function getColumn(colIndex) {
    return gridState.map(row => row[colIndex].value);
}

// Rule 2: Check for 3+ consecutive same symbols in an array
function hasConsecutiveViolation(values) {
    for (let i = 0; i < values.length - 2; i++) {
        // Only check filled cells (not 0)
        if (values[i] !== 0 && values[i] === values[i + 1] && values[i] === values[i + 2]) {
            return true;
        }
    }
    return false;
}

// Rule 1: Check if row/column has correct balance (3 full, 3 empty)
function hasBalanceViolation(values) {
    const fullCount = values.filter(v => v === 1).length;
    const emptyCount = values.filter(v => v === 2).length;

    // Only flag as violation if exceeds the limit (3 of each)
    return fullCount > 3 || emptyCount > 3;
}

// Rule 3: Check if two complete rows/columns are identical
function areArraysIdentical(arr1, arr2) {
    // Only compare if both are complete (no unfilled cells)
    const hasUnfilled1 = arr1.some(v => v === 0);
    const hasUnfilled2 = arr2.some(v => v === 0);

    if (hasUnfilled1 || hasUnfilled2) {
        return false;
    }

    return arr1.every((val, idx) => val === arr2[idx]);
}

// Find all cells that violate rules
function findViolatingCells() {
    const violatingCells = new Set();

    // Check each row
    for (let row = 0; row < GRID_SIZE; row++) {
        const rowValues = getRow(row);

        // Check consecutive violation
        if (hasConsecutiveViolation(rowValues)) {
            // Mark all non-zero cells in this row
            for (let col = 0; col < GRID_SIZE; col++) {
                if (rowValues[col] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }

        // Check balance violation
        if (hasBalanceViolation(rowValues)) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (rowValues[col] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }
    }

    // Check each column
    for (let col = 0; col < GRID_SIZE; col++) {
        const colValues = getColumn(col);

        // Check consecutive violation
        if (hasConsecutiveViolation(colValues)) {
            for (let row = 0; row < GRID_SIZE; row++) {
                if (colValues[row] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }

        // Check balance violation
        if (hasBalanceViolation(colValues)) {
            for (let row = 0; row < GRID_SIZE; row++) {
                if (colValues[row] !== 0) {
                    violatingCells.add(`${row},${col}`);
                }
            }
        }
    }

    // Check for duplicate rows
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = i + 1; j < GRID_SIZE; j++) {
            if (areArraysIdentical(getRow(i), getRow(j))) {
                // Mark all cells in both rows
                for (let col = 0; col < GRID_SIZE; col++) {
                    violatingCells.add(`${i},${col}`);
                    violatingCells.add(`${j},${col}`);
                }
            }
        }
    }

    // Check for duplicate columns
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = i + 1; j < GRID_SIZE; j++) {
            if (areArraysIdentical(getColumn(i), getColumn(j))) {
                // Mark all cells in both columns
                for (let row = 0; row < GRID_SIZE; row++) {
                    violatingCells.add(`${row},${i}`);
                    violatingCells.add(`${row},${j}`);
                }
            }
        }
    }

    return violatingCells;
}

// Validate and update UI
function validateGrid() {
    const violatingCells = findViolatingCells();

    // Update all cells
    const cells = grid.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const key = `${row},${col}`;

        if (violatingCells.has(key)) {
            cell.dataset.error = 'true';
        } else {
            cell.dataset.error = 'false';
        }
    });

    // Check for win condition
    checkWinCondition();
}

// Check if puzzle is solved
function checkWinCondition() {
    // Check if all cells are filled
    const allFilled = gridState.every(row =>
        row.every(cell => cell.value !== 0)
    );

    if (!allFilled) {
        return;
    }

    // Check if there are any violations
    const violatingCells = findViolatingCells();

    if (violatingCells.size === 0) {
        // Puzzle is solved!
        showWinMessage();
    }
}

// Show win message
function showWinMessage() {
    const info = document.querySelector('.info');
    info.textContent = '🎉 Congratulations! You solved the puzzle! 🎉';
    info.style.color = '#10b981';
    info.style.fontWeight = 'bold';
    info.style.fontSize = '18px';
}

// Set up initial puzzle with locked cells (test puzzle)
function initializeTestPuzzle() {
    // Define some pre-filled locked cells
    // Format: [row, col, value] where value: 1=full, 2=empty
    const lockedCells = [
        [0, 0, 1], // Row 0, Col 0: Full circle
        [0, 2, 2], // Row 0, Col 2: Empty circle
        [0, 4, 1], // Row 0, Col 4: Full circle
        [1, 1, 2], // Row 1, Col 1: Empty circle
        [1, 3, 1], // Row 1, Col 3: Full circle
        [2, 0, 2], // Row 2, Col 0: Empty circle
        [2, 3, 2], // Row 2, Col 3: Empty circle
        [2, 5, 1], // Row 2, Col 5: Full circle
        [3, 1, 1], // Row 3, Col 1: Full circle
        [3, 4, 2], // Row 3, Col 4: Empty circle
        [4, 0, 1], // Row 4, Col 0: Full circle
        [4, 3, 2], // Row 4, Col 3: Empty circle
        [5, 2, 1], // Row 5, Col 2: Full circle
        [5, 4, 2], // Row 5, Col 4: Empty circle
    ];

    // Apply locked cells to the grid state
    lockedCells.forEach(([row, col, value]) => {
        gridState[row][col].value = value;
        gridState[row][col].locked = true;
    });
}

// ============================================================================
// LOGIC-BASED SOLVER - Human-solvable puzzle verification
// ============================================================================

/**
 * Technique 1: Two adjacent same values → opposite value on edges
 * Example: ?11 → 011  or  00? → 001
 * @returns {boolean} - True if made a change
 */
function logicTwoAdjacent() {
    let madeChange = false;

    // Check rows
    for (let row = 0; row < GRID_SIZE; row++) {
        const line = gridState[row];
        for (let col = 0; col < GRID_SIZE - 1; col++) {
            if (line[col].value !== 0 && line[col].value === line[col + 1].value) {
                // Found two adjacent same values
                const val = line[col].value;
                const opposite = val === 1 ? 2 : 1;

                // Check left edge
                if (col > 0 && line[col - 1].value === 0) {
                    line[col - 1].value = opposite;
                    madeChange = true;
                }

                // Check right edge
                if (col + 2 < GRID_SIZE && line[col + 2].value === 0) {
                    line[col + 2].value = opposite;
                    madeChange = true;
                }
            }
        }
    }

    // Check columns
    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 1; row++) {
            if (gridState[row][col].value !== 0 &&
                gridState[row][col].value === gridState[row + 1][col].value) {
                const val = gridState[row][col].value;
                const opposite = val === 1 ? 2 : 1;

                // Check top edge
                if (row > 0 && gridState[row - 1][col].value === 0) {
                    gridState[row - 1][col].value = opposite;
                    madeChange = true;
                }

                // Check bottom edge
                if (row + 2 < GRID_SIZE && gridState[row + 2][col].value === 0) {
                    gridState[row + 2][col].value = opposite;
                    madeChange = true;
                }
            }
        }
    }

    return madeChange;
}

/**
 * Technique 2: Two same values with gap → opposite in middle
 * Example: 1.1 → 121  or  0.0 → 010
 * @returns {boolean} - True if made a change
 */
function logicTwoSeparated() {
    let madeChange = false;

    // Check rows
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

    // Check columns
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

/**
 * Technique 3: Max count reached → fill remaining with opposite
 * Example: Row has 3 ones already → fill remaining empties with twos
 * @returns {boolean} - True if made a change
 */
function logicMaxCountReached() {
    let madeChange = false;

    // Check rows
    for (let row = 0; row < GRID_SIZE; row++) {
        const line = gridState[row];
        const rowValues = line.map(c => c.value);

        if (rowValues.includes(0)) { // Has empties
            const onesCount = rowValues.filter(v => v === 1).length;
            const twosCount = rowValues.filter(v => v === 2).length;

            // If we have 3 ones, fill empties with twos
            if (onesCount === 3) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    if (line[col].value === 0) {
                        line[col].value = 2;
                        madeChange = true;
                    }
                }
            }

            // If we have 3 twos, fill empties with ones
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

    // Check columns
    for (let col = 0; col < GRID_SIZE; col++) {
        const colValues = getColumn(col);

        if (colValues.includes(0)) { // Has empties
            const onesCount = colValues.filter(v => v === 1).length;
            const twosCount = colValues.filter(v => v === 2).length;

            // If we have 3 ones, fill empties with twos
            if (onesCount === 3) {
                for (let row = 0; row < GRID_SIZE; row++) {
                    if (gridState[row][col].value === 0) {
                        gridState[row][col].value = 2;
                        madeChange = true;
                    }
                }
            }

            // If we have 3 twos, fill empties with ones
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

/**
 * Technique 4: Avoid duplicate rows/columns
 * If partial row would duplicate complete row, fill with opposites
 * @returns {boolean} - True if made a change
 */
function logicAvoidDuplicates() {
    let madeChange = false;

    // Check rows
    for (let row1 = 0; row1 < GRID_SIZE; row1++) {
        const line1 = gridState[row1].map(c => c.value);
        const empties1 = line1.filter(v => v === 0).length;

        // Only consider rows with exactly 2 empties
        if (empties1 !== 2) continue;

        // Compare with complete rows
        for (let row2 = 0; row2 < GRID_SIZE; row2++) {
            if (row1 === row2) continue;

            const line2 = gridState[row2].map(c => c.value);
            if (line2.includes(0)) continue; // Skip incomplete rows

            // Check if filled positions match
            let matches = true;
            for (let col = 0; col < GRID_SIZE; col++) {
                if (line1[col] !== 0 && line1[col] !== line2[col]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                // This row would duplicate row2, fill empties with opposites
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

    // Check columns
    for (let col1 = 0; col1 < GRID_SIZE; col1++) {
        const line1 = getColumn(col1);
        const empties1 = line1.filter(v => v === 0).length;

        // Only consider columns with exactly 2 empties
        if (empties1 !== 2) continue;

        // Compare with complete columns
        for (let col2 = 0; col2 < GRID_SIZE; col2++) {
            if (col1 === col2) continue;

            const line2 = getColumn(col2);
            if (line2.includes(0)) continue; // Skip incomplete columns

            // Check if filled positions match
            let matches = true;
            for (let row = 0; row < GRID_SIZE; row++) {
                if (line1[row] !== 0 && line1[row] !== line2[row]) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                // This column would duplicate col2, fill empties with opposites
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

/**
 * Attempt to solve puzzle using only logical deduction (no guessing)
 * @param {number} maxIterations - Safety limit to prevent infinite loops
 * @returns {string} - 'solved' | 'stuck' | 'invalid'
 */
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

        // Apply all techniques
        for (const technique of techniques) {
            if (technique()) {
                madeProgress = true;
            }
        }

        // Check if solved
        const allFilled = gridState.every(row => row.every(cell => cell.value !== 0));
        if (allFilled) {
            // Verify it's valid
            const violations = findViolatingCells();
            return violations.size === 0 ? 'solved' : 'invalid';
        }

        // If no progress made, we're stuck
        if (!madeProgress) {
            return 'stuck';
        }

        iterations++;
    }

    return 'stuck'; // Hit iteration limit
}

/**
 * Check if a puzzle is human-solvable
 * Makes a copy, attempts logic-based solve, restores original
 * @returns {boolean} - True if solvable with logic alone
 */
function isHumanSolvable() {
    const saved = copyGridState();
    const result = solveWithLogic();
    restoreGridState(saved);
    return result === 'solved';
}

// ============================================================================
// PUZZLE GENERATION - Backtracking Solver & Generator
// ============================================================================

/**
 * Shuffle array in place using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Create a deep copy of the grid state
 */
function copyGridState() {
    return gridState.map(row =>
        row.map(cell => ({
            value: cell.value,
            locked: cell.locked
        }))
    );
}

/**
 * Restore grid state from a copy
 */
function restoreGridState(savedState) {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            gridState[row][col].value = savedState[row][col].value;
            gridState[row][col].locked = savedState[row][col].locked;
        }
    }
}

/**
 * Check if a specific cell placement violates rules
 * More efficient than checking entire grid
 */
function isValidPlacement(row, col) {
    const rowValues = getRow(row);
    const colValues = getColumn(col);

    // Check Rule 1: No more than 3 of each value
    if (hasBalanceViolation(rowValues) || hasBalanceViolation(colValues)) {
        return false;
    }

    // Check Rule 2: No 3+ consecutive
    if (hasConsecutiveViolation(rowValues) || hasConsecutiveViolation(colValues)) {
        return false;
    }

    // Check Rule 3: No duplicate complete rows/columns
    // Only check if row/column is complete
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

/**
 * Backtracking solver - fills grid starting from position (row, col)
 * @param {number} startRow - Starting row (0-based)
 * @param {number} startCol - Starting column (0-based)
 * @param {boolean} randomize - If true, tries values in random order
 * @returns {boolean} - True if solution found
 */
function backtrackSolve(startRow = 0, startCol = 0, randomize = false) {
    // Find next empty cell
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

    // No empty cells found - puzzle is complete!
    if (!found) {
        return true;
    }

    // Try values (1 = full circle, 2 = empty circle)
    const values = randomize ? shuffleArray([1, 2]) : [1, 2];

    for (const value of values) {
        gridState[row][col].value = value;

        if (isValidPlacement(row, col)) {
            // Recursively solve rest of grid
            if (backtrackSolve(row, col, randomize)) {
                return true;
            }
        }

        // Backtrack
        gridState[row][col].value = 0;
    }

    return false;
}

/**
 * Count number of solutions for current grid state
 * Stops counting at maxCount for efficiency
 * @param {number} startRow - Starting row
 * @param {number} startCol - Starting column
 * @param {number} maxCount - Stop counting at this number (default: 2)
 * @returns {number} - Number of solutions found (up to maxCount)
 */
function countSolutions(startRow = 0, startCol = 0, maxCount = 2) {
    // Find next empty cell
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

    // No empty cells - found a solution
    if (!found) {
        return 1;
    }

    let solutionCount = 0;

    // Try both values
    for (const value of [1, 2]) {
        gridState[row][col].value = value;

        if (isValidPlacement(row, col)) {
            solutionCount += countSolutions(row, col, maxCount - solutionCount);

            // Early termination - we only need to know if multiple solutions exist
            if (solutionCount >= maxCount) {
                gridState[row][col].value = 0;
                return solutionCount;
            }
        }

        gridState[row][col].value = 0;
    }

    return solutionCount;
}

/**
 * Generate a complete valid 6x6 Binero grid
 * Uses backtracking with randomization
 * @returns {boolean} - True if generation successful
 */
function generateCompleteGrid() {
    // Clear the grid
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            gridState[row][col].value = 0;
            gridState[row][col].locked = false;
        }
    }

    // Use backtracking with randomization to create varied solutions
    return backtrackSolve(0, 0, true);
}

/**
 * Generate a solvable puzzle by removing cells from complete grid
 * Ensures puzzle has unique solution AND is human-solvable (no guessing)
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {boolean} - True if generation successful
 */
function generatePuzzle(difficulty = 'medium') {
    // Difficulty settings: number of clues to leave
    const targetClues = {
        easy: 22,    // ~61% filled
        medium: 18,  // ~50% filled
        hard: 14     // ~39% filled
    };

    const numClues = targetClues[difficulty] || targetClues.medium;
    const maxAttempts = 50; // Try up to 50 puzzles to find a human-solvable one

    console.log(`Generating ${difficulty} puzzle (human-solvable)...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        // Step 1: Generate complete valid grid
        if (!generateCompleteGrid()) {
            console.error('Failed to generate complete grid');
            continue;
        }

        // Step 2: Create list of all positions and shuffle
        const positions = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                positions.push({ row, col });
            }
        }
        const shuffledPositions = shuffleArray(positions);

        // Step 3: Try removing cells while maintaining uniqueness
        let currentClues = GRID_SIZE * GRID_SIZE;

        for (const pos of shuffledPositions) {
            if (currentClues <= numClues) {
                break;
            }

            const { row, col } = pos;
            const originalValue = gridState[row][col].value;

            // Try removing this cell
            gridState[row][col].value = 0;

            // Count solutions with this cell removed
            const numSolutions = countSolutions(0, 0, 2);

            if (numSolutions === 1) {
                // Unique solution still exists - keep it removed
                currentClues--;
            } else {
                // Multiple solutions or no solution - restore the value
                gridState[row][col].value = originalValue;
            }
        }

        // Step 4: Check if puzzle is human-solvable
        if (isHumanSolvable()) {
            // Success! Mark cells as locked and return
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

    // Fallback: If we couldn't find a human-solvable puzzle,
    // return the last attempt anyway
    console.warn(`⚠ Could not find human-solvable puzzle in ${maxAttempts} attempts`);
    console.warn('  Using last generated puzzle (may require guessing)');

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            gridState[row][col].locked = gridState[row][col].value !== 0;
        }
    }

    return true;
}

/**
 * Create a new puzzle and update the UI
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 */
function newPuzzle(difficulty = 'medium') {
    // Reset info message
    const info = document.querySelector('.info');
    info.textContent = 'Click cells to cycle: Unfilled → Full → Empty → Unfilled';
    info.style.color = '';
    info.style.fontWeight = '';
    info.style.fontSize = '';

    // Generate new puzzle
    console.log(`Generating ${difficulty} puzzle...`);
    const startTime = performance.now();
    generatePuzzle(difficulty);
    const endTime = performance.now();
    console.log(`Generation took ${(endTime - startTime).toFixed(0)}ms`);

    // Update all cells in the UI
    const cells = grid.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.dataset.state = gridState[row][col].value;
        cell.dataset.locked = gridState[row][col].locked;
        cell.dataset.error = 'false';
    });
}

// Initialize the game
// Comment out test puzzle and use generator instead:
// initializeTestPuzzle();

// Generate initial puzzle
console.log('Starting puzzle generation...');
const startTime = performance.now();
generatePuzzle('medium');
const endTime = performance.now();
console.log(`Generation took ${(endTime - startTime).toFixed(0)}ms`);

createGrid();
