# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Binero** (also known as Takuzu or Binary Puzzle) browser game. It's a 6×6 logic puzzle where players fill a grid with two types of circles (full ●/empty ○) following constraint satisfaction rules.

**Key constraint:** All generated puzzles must be **human-solvable** (solvable through pure logic without guessing) AND have exactly one unique solution.

## Development Commands

```bash
# Run the game
# Simply open index.html in a browser (no build step required)

# Test puzzle generation (basic)
node test_generator.js

# Test human-solvable puzzle generation (with logic solver validation)
node test_human_solvable.js
```

## Architecture

### Core Components (game.js)

The codebase is organized into 4 major sections:

**1. Logic-Based Solver (lines 249-560)**
- Implements 4 human-solving techniques from academic research
- `logicTwoAdjacent()`: Detects `??11` patterns → fills edges with opposite
- `logicTwoSeparated()`: Detects `1??1` patterns → fills middle with opposite
- `logicMaxCountReached()`: If row has 3 of one value → fills rest with other
- `logicAvoidDuplicates()`: Prevents duplicate rows/columns by elimination
- `solveWithLogic()`: Iteratively applies all techniques until solved or stuck
- `isHumanSolvable()`: Validates puzzle can be solved without guessing

**2. Backtracking Solver & Generator (lines 562-760)**
- `backtrackSolve()`: Recursive constraint satisfaction solver
  - Can be randomized for varied solutions
  - Uses incremental validation for efficiency
- `countSolutions()`: Counts solutions with early termination at 2
  - Critical for uniqueness verification
- `generateCompleteGrid()`: Creates valid complete solutions
- `isValidPlacement()`: Validates single cell against all 3 rules

**3. Human-Solvable Puzzle Generator (lines 762-852)**
- Two-phase generation:
  1. Generate complete grid + remove cells (maintaining uniqueness)
  2. Validate with logic solver (retry if requires guessing)
- Max 50 attempts to find human-solvable puzzle
- Difficulty based on number of clues (easy: 22, medium: 18, hard: 14)

**4. Game Engine & UI (lines 1-247)**
- Grid state management with locked/unlocked cells
- Real-time validation with visual error feedback
- Win condition detection

### The Two Solving Approaches

**Backtracking solver** (computational):
- Used for: Generation, uniqueness verification, fallback solving
- Tries all possibilities with intelligent pruning
- Always finds solution if one exists

**Logic-based solver** (human-like):
- Used for: Validating puzzles are human-solvable
- Only uses deduction techniques humans can apply
- May get "stuck" on puzzles requiring guessing

### Critical Generation Flow

```javascript
generatePuzzle(difficulty) {
  for (attempt = 1..50) {
    1. generateCompleteGrid()           // Backtracking with randomization
    2. Remove cells maintaining uniqueness  // Uses countSolutions()
    3. isHumanSolvable()                // Logic solver validation
       ✓ Success → return puzzle
       ✗ Requires guessing → try again
  }
}
```

## Game Rules (Constraint Satisfaction)

1. **Balance:** Each row/column must have exactly 3 full circles and 3 empty circles
2. **No three consecutive:** No more than 2 identical values in a row (horizontally or vertically)
3. **Unique rows/columns:** No two rows can be identical, no two columns can be identical

Rules are checked incrementally during generation for performance.

## Data Representation

```javascript
// Cell states
0 = unfilled (empty cell)
1 = full circle (filled ●)
2 = empty circle (hollow ○)

// Grid structure
gridState[row][col] = {
  value: 0|1|2,
  locked: boolean  // true for pre-filled clues
}
```

## Testing Strategy

When modifying puzzle generation:
1. Run `test_human_solvable.js` first (validates human-solvability)
2. Run `test_generator.js` for basic generation speed benchmarks
3. Open index.html and test all 3 difficulty levels
4. Check browser console for generation stats and warnings

## Important Constraints

- **Never bypass `isHumanSolvable()` check** - this is what makes puzzles enjoyable
- **Preserve the 4 logic techniques** - they match human solving patterns
- **Maintain uniqueness verification** - puzzles must have exactly 1 solution
- The 50-attempt limit in generation is intentional (prevents infinite loops)

## File Organization

- `game.js` - All game logic (single file, ~900 lines, 4 distinct sections)
- `index.html` - Minimal HTML structure with difficulty buttons
- `style.css` - Grid layout, cell states, error highlighting
- `test_*.js` - Standalone test files (duplicate core logic for Node.js testing)
- `takuzu.pdf` - Academic reference for the backtracking algorithm
- `python_solver.py` - Original reference implementation of logic techniques

## Performance Notes

- Easy puzzles: ~1-5ms generation time
- Medium puzzles: ~1-5ms
- Hard puzzles: ~2-10ms (may require 2-3 attempts to find human-solvable)

All generation is synchronous and fast enough not to block UI.
