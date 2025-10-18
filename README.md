# Binero Puzzle Game

A browser-based implementation of **Binero** (also known as Takuzu or Binary Puzzle), a constraint satisfaction logic game where players fill a 6×6 grid with two types of symbols following strict rules.

## Features

- **Human-Solvable Puzzles** - Every puzzle is guaranteed solvable through pure logic, no guessing required
- **Unique Solutions** - All puzzles have exactly one valid solution
- **Three Difficulty Levels** - Easy, Medium, and Hard with varying numbers of clues
- **Real-time Validation** - Instant visual feedback when rules are violated
- **Fast Generation** - Puzzles generate in under 10ms
- **Zero Dependencies** - Pure vanilla JavaScript, HTML, and CSS

## Live Demo

Simply open `index.html` in any modern web browser. No build process or installation required.

## Game Rules

The game follows three fundamental rules:

1. **Balance Rule** - Each row and column must contain exactly 3 full circles (●) and 3 empty circles (○)
2. **Consecutive Rule** - No more than two identical symbols can appear consecutively in any row or column
3. **Uniqueness Rule** - No two rows can be identical, and no two columns can be identical

**How to Play:**
- Click a cell once → Full circle (●)
- Click again → Empty circle (○)
- Click a third time → Clear the cell
- Pre-filled cells (darker shade) cannot be changed

## Quick Start

### Playing the Game

```bash
# Clone the repository
git clone <your-repo-url>
cd binero

# Open in browser
open index.html  # macOS
# or just double-click index.html
```

### Running Tests

```bash
# Test basic puzzle generation
node test_generator.js

# Test human-solvable puzzle generation (with logic solver validation)
node test_human_solvable.js
```

## Project Structure

```
binero/
├── index.html              # Game UI
├── style.css               # Styling and layout
├── game.js                 # Core game logic (~900 lines)
│   ├── Logic-Based Solver (lines 249-560)
│   ├── Backtracking Solver (lines 562-760)
│   ├── Puzzle Generator (lines 762-852)
│   └── Game Engine & UI (lines 1-247)
├── test_generator.js       # Basic generation tests
├── test_human_solvable.js  # Human-solvability tests
├── python_solver.py        # Reference implementation (logic techniques)
└── takuzu.pdf             # Academic reference paper
```

## How It Works

### Two-Phase Puzzle Generation

The game uses a sophisticated two-phase generation algorithm:

#### Phase 1: Generate Valid Puzzle
1. **Create complete grid** using backtracking with randomization
2. **Remove cells strategically** while maintaining unique solution
   - Shuffle all 36 cell positions
   - Try removing each cell
   - Verify still has exactly 1 solution (using solution counter)
   - Keep removed if unique, restore if multiple solutions

#### Phase 2: Validate Human-Solvability
3. **Apply logic-based solver** using 4 human deduction techniques:
   - **Technique 1:** Two adjacent same → opposite on edges (`??11` → `0011`)
   - **Technique 2:** Two separated same → opposite in middle (`1??1` → `1021`)
   - **Technique 3:** Max count reached → fill rest (`3 ones` → `fill with twos`)
   - **Technique 4:** Avoid duplicates → eliminate to prevent matching rows
4. **If solvable with logic alone** → ✅ Return puzzle
5. **If stuck (requires guessing)** → ❌ Discard and retry (up to 50 attempts)

This ensures every puzzle is both mathematically valid AND enjoyable for humans.

### Algorithm Performance

| Difficulty | Clues | Typical Generation Time | Attempts Needed |
|------------|-------|------------------------|-----------------|
| Easy       | 22/36 | 1-5ms                  | 1-2             |
| Medium     | 18/36 | 1-5ms                  | 1-3             |
| Hard       | 14/36 | 2-10ms                 | 1-5             |

## Technical Details

### Data Representation

```javascript
// Cell states
0 = unfilled (empty cell, clickable)
1 = full circle (●)
2 = empty circle (○)

// Grid structure
gridState[row][col] = {
  value: 0 | 1 | 2,
  locked: boolean  // true for pre-filled clues
}
```

### Key Algorithms

**Backtracking Solver** (`backtrackSolve`)
- Recursive depth-first search with constraint propagation
- Checks rules incrementally for early pruning
- O(2^n) worst case, but fast in practice due to constraints

**Solution Counter** (`countSolutions`)
- Modified backtracking that counts all solutions
- Early termination at 2 solutions (we only need to know "unique" vs "not unique")
- Critical for ensuring puzzle has exactly one solution

**Logic Solver** (`solveWithLogic`)
- Iteratively applies 4 deduction techniques
- Returns `'solved'`, `'stuck'`, or `'invalid'`
- Mimics human solving patterns

## Development

### Adding New Features

The codebase is organized into distinct sections in `game.js`:

1. **Modify logic techniques** → Lines 249-560
2. **Adjust generation algorithm** → Lines 762-852
3. **Change UI/validation** → Lines 1-247
4. **Tweak solver performance** → Lines 562-760

### Testing Your Changes

```bash
# 1. Test generation still works
node test_generator.js

# 2. Verify human-solvability is maintained
node test_human_solvable.js

# 3. Test in browser
open index.html
# Try all 3 difficulty levels
# Check browser console for generation stats
```

### Code Style

- Vanilla JavaScript (ES6+)
- No build tools or transpilation
- Comprehensive JSDoc comments
- Functional programming style for solvers
- Mutable state only in grid management

## Contributing

Contributions are welcome! Here are some areas for improvement:

- [ ] **Hint System** - Show next logical deduction to help stuck players
- [ ] **Undo/Redo** - Track move history for better UX
- [ ] **Save/Load** - Persist game state to localStorage
- [ ] **Statistics** - Track solve times, success rates
- [ ] **Animations** - Add win celebration, cell transitions
- [ ] **Larger Grids** - Support 8×8 or 10×10 puzzles
- [ ] **Timer** - Add optional speedrun mode
- [ ] **Mobile Optimization** - Better touch controls

### Pull Request Guidelines

1. Maintain human-solvability checking (don't bypass `isHumanSolvable()`)
2. Add tests if modifying generation logic
3. Ensure all existing tests pass
4. Update CLAUDE.md if changing architecture

## Academic Reference

This implementation is inspired by the approach described in:
> "Solving Takuzu Puzzles" - MPRI Lecture 2-36-1 Project (included as `takuzu.pdf`)

The backtracking algorithm follows the academic specification while the logic-based solver implements common human solving patterns.

## License

MIT License - Feel free to use this code in your own projects.

## Acknowledgments

- Logic-based solving techniques adapted from various Binero/Takuzu solvers
- Constraint satisfaction approach based on academic research
- Game design inspired by popular binary puzzle implementations

---

**Enjoy solving!** If you find any bugs or have suggestions, please open an issue.
