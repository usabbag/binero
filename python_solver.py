def neg(n):
    return {'0': '1', '1': '0'}[n]

def transpose(board):
    return [[board[x][y] for x in range(len(board))] for y in range(len(board))]

def execute_all(board, steps):
    while True:
        did_something = False
        for step in steps:
            success, board = execute(step, board)
            did_something = did_something or success
        if not did_something:
            return board

def execute(step, board):
    did_something = False
    for _ in range(2):
        while step(board):
            did_something = True
        board = transpose(board)
    return did_something, board

def step_2_in_row(board):
    for line in board:
        for x in range(len(line)-1):
            if line[x+1] == line[x] != '.':
                if 0 <= x-1 and line[x-1] == ".":
                    line[x-1] = neg(line[x])
                    return True
                if x+2 < len(line) and line[x+2] == ".":
                    line[x+2] = neg(line[x])
                    return True
    return False

def step_2_separated(board):
    for line in board:
        for x in range(len(line)-2):
            if line[x] == line[x+2] and line[x] != '.':
                if line[x+1] == ".":
                    line[x+1] = neg(line[x])
                    return True
    return False

def step_one_color_left(board):
    for line in board:
        if "." not in line:
            continue
        ones, zeros = line.count("1"), line.count("0")
        if len(line) in [ones*2, zeros*2]:
            fill = "1" if zeros*2 == len(line) else "0"
            for x in range(len(line)):
                if line[x] == ".":
                    line[x] = fill
            return True
    return False

def step_find_duplicate(board):
    for line in board:
        if line.count(".") != 2:
            continue
        for line2 in board:
            if "." in line2:
                continue
            if any(c2 != c != "." for c, c2 in zip(line, line2)):
                continue
            for x in range(len(line)):
                if line[x] == ".":
                    line[x] = neg(line2[x])
            return True
    return False

def print_board(board):
    for line in board:
        print ''.join(line)
    print ''

def main():
    board = open("input.txt").read().splitlines()
    board = [list(line) for line in board]

    print_board(board)

    board = execute_all(board, [
        step_2_in_row,
        step_2_separated,
        step_one_color_left,
        step_find_duplicate
    ])

    print_board(board)

main()