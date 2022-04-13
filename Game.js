"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor() {
        this.Bar = new Map();
        this.point_matrixes = [];
    }
    Init() {
        this.point_matrixes = [];
        this.Bar.set(11, true);
        this.Bar.set(12, true);
        this.Bar.set(13, true);
        this.Bar.set(21, true);
        this.Bar.set(22, true);
        this.Bar.set(23, true);
        this.Bar.set(24, true);
        this.Bar.set(31, true);
        this.Bar.set(32, true);
        this.Bar.set(33, true);
        this.Bar.set(41, true);
        this.Bar.set(42, true);
        this.Bar.set(43, true);
        this.Bar.set(44, true);
        this.Bar.set(51, true);
        this.Bar.set(52, true);
        this.Bar.set(53, true);
        this.Bar.set(61, true);
        this.Bar.set(62, true);
        this.Bar.set(63, true);
        this.Bar.set(64, true);
        this.Bar.set(71, true);
        this.Bar.set(72, true);
        this.Bar.set(73, true);
    }
    ActiveBar(num) {
        if (this.Bar.get(num)) {
            this.Bar.set(num, false);
            return true;
        }
        else
            return false;
    }
    CheckSquare(barNum) {
        let chk_matrixes = [];
        let point_matrixes = [];
        let w = 3;
        let h = 3;
        let ten = Math.floor(barNum / 10);
        let one = Math.floor(barNum % 10);
        // 십의 자리 수가
        // 2, 4, 6...
        if (ten % 2 == 0) {
            let floor = Math.floor(ten / 2);
            if (one == 1) {
                chk_matrixes.push({ row: floor, col: one });
            }
            else if (one == w + 1) {
                chk_matrixes.push({ row: floor, col: one - 1 });
            }
            else {
                chk_matrixes.push({ row: floor, col: one - 1 });
                chk_matrixes.push({ row: floor, col: one });
            }
        }
        // 십의 자리 수가
        // 1, 3, 5..
        else {
            let floor = Math.floor(ten / 2);
            if (ten == 1) {
                chk_matrixes.push({ row: floor + 1, col: one });
            }
            else if (ten == (h * 2) + 1) {
                chk_matrixes.push({ row: floor, col: one });
            }
            else {
                chk_matrixes.push({ row: floor + 1, col: one });
                chk_matrixes.push({ row: floor, col: one });
            }
        }
        chk_matrixes.forEach(matrix => {
            let ten = (matrix.row * 2) * 10;
            let one = matrix.col;
            let bar = ten + one;
            if (this.Bar.get(bar + 10)
                && this.Bar.get(bar - 10)
                && this.Bar.get(bar)
                && this.Bar.get(bar + 1)) {
                point_matrixes.push({ row: matrix.row, col: matrix.col });
                this.point_matrixes.push({ row: matrix.row, col: matrix.col });
            }
        });
        return point_matrixes;
    }
}
exports.default = Game;
