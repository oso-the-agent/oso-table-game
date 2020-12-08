const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

var gameSettings = document.getElementById('gameSettings');
var gameOverMenu = document.getElementById('gameOverMenu');
var gameOverMenuText = gameOverMenu.getElementsByTagName('h1')[0];

canvas.width = innerWidth;
canvas.height = innerHeight;

class Table {
    constructor(lines, columns, maxLCs) {
        this.gameEnded = false;
        this.playerToMove = 0;

        this.lockLimit = maxLCs;
        this.lines = lines;
        this.columns = columns;
        
        this.ew = 0.6 * canvas.width / this.columns;
        this.eh = 0.6 * canvas.height / this.lines;
        this.el = Math.min(this.ew, this.eh);

        this.ci = (canvas.height - this.el * this.lines) / 2;
        this.cj = (canvas.width -  this.el * this.columns) / 2;

        this.mc = null;
        this.hb = null;
        this.alreadyLocked = [];

        this.al = []; this.brds = [];
        for(var i = 0; i < lines; ++i) {
            this.al[i] = [];
            this.brds[i] = [];
            for(var j = 0; j < columns; ++j) {
                this.al[i][j] = 0;
                this.brds[i][j] = 0;
            }
        }

        this.direction = 0;
        c.font = "32px Arial";

    }

    draw() {
        if(!this.gameEnded) {
            c.fillStyle = "#000";
            c.fillText("Player " + (this.playerToMove+1) + "'s turn:", this.cj-0.05 * this.el, this.ci - 34);
        }

        c.beginPath();
        for(var i = 0; i < this.lines; ++i)
            for(var j = 0; j < this.columns; ++j)
                if(this.al[i][j] == 0) {
                    c.fillStyle = "#b8b8b8";
                    c.fillRect(this.cj + (j+0.05) * this.el,
                               this.ci + (i+0.05) * this.el,
                               0.9 * this.el, 0.9 * this.el);
                }
                else if(this.al[i][j] == -2) {
                    c.fillStyle = "#808080";
                    c.fillRect(this.cj + (j) * this.el,
                               this.ci + (i) * this.el,
                               this.el, this.el);
                }

        c.beginPath();
        c.fillStyle = "#000";
        c.fillRect(this.cj - 0.05 * this.el, this.ci - 0.05 * this.el,
                   this.el * (this.columns + 0.1), 0.1 * this.el);
        c.fillRect(this.cj - 0.05 * this.el, this.ci + (this.lines - 0.05) * this.el,
                   this.el * (this.columns + 0.1), 0.1 * this.el);
        c.fillRect(this.cj - 0.05 * this.el, this.ci - 0.05 * this.el,
                   0.1 * this.el, this.el * (this.lines + 0.1));
        c.fillRect(this.cj + (this.columns - 0.05) * this.el, this.ci - 0.05 * this.el,
                   0.1 * this.el, this.el * (this.lines + 0.1));

        c.beginPath();
        for(var i = 0; i < this.lines; ++i)
            for(var j = 0; j < this.columns; ++j)
                if(this.al[i][j] == 0) {
                    c.fillStyle = "#cfcfcf";
                    c.fillRect(this.cj + (j+0.05) * this.el,
                               this.ci + (i+0.05) * this.el,
                               0.8 * this.el, 0.8 * this.el);
                }

        c.fillStyle = "#000";
        c.beginPath();

        for(var i = 0; i < this.lines; ++i)
            for(var j = 0; j < this.columns; ++j) {
                if(this.brds[i][j] & 1)
                    c.fillRect(this.cj + (j+0.95) * this.el,
                               this.ci + (i+0.05) * this.el,
                               0.1 * this.el, 0.9 * this.el);
                if(this.brds[i][j] & 2)
                    c.fillRect(this.cj + (j+0.05) * this.el,
                               this.ci + (i+0.95) * this.el,
                               0.9 * this.el, 0.1 * this.el);
            }

        for(var i = 0; i < this.lines-1; ++i)
            for(var j = 0; j < this.columns-1; ++j) {
                var aux = 0;
                if(this.brds[i][j] & 1) ++aux;
                if(this.brds[i][j] & 2) ++aux;
                if(this.brds[i+1][j] & 1) ++aux;
                if(this.brds[i][j+1] & 2) ++aux;
                if(aux > 1)
                    c.fillRect(this.cj + (j+0.95) * this.el,
                               this.ci + (i+0.95) * this.el,
                    0.1 * this.el, 0.1 * this.el);
            }
    }

    recalcInaccessible() {
        var endgame = true;
        for(var i = 0; i < this.lines; ++i)
            for(var j = 0; j < this.columns; ++j)
                if(this.al[i][j] == 0) {
                    var solutions = 0;
                    if(j + 1 < this.columns && (this.brds[i][j] & 1) == 0 &&
                       this.al[i][j+1] == 0) { // drum dreapta
                        var aux = 0;
                        if(i != 0) {
                            if((this.brds[i-1][j] & 2) == 0) ++aux;
                            if((this.brds[i-1][j+1] & 2) == 0) ++aux;
                        }
                        if(i != this.lines-1) {
                            if((this.brds[i][j] & 2) == 0) ++aux;
                            if((this.brds[i][j+1] & 2) == 0) ++aux;
                        }
                        if(j + 1 < this.columns-1 && (this.brds[i][j+1] & 1) == 0) ++aux;
                        if(j > 0 && (this.brds[i][j-1] & 1) == 0) ++aux;

                        if(aux) ++solutions;
                    }

                    if(j > 0 && (this.brds[i][j-1] & 1) == 0 &&
                       this.al[i][j-1] == 0) { // drum stanga
                        var aux = 0;
                        if(i != 0) {
                            if((this.brds[i-1][j-1] & 2) == 0) ++aux;
                            if((this.brds[i-1][j] & 2) == 0) ++aux;
                        }
                        if(i != this.lines-1) {
                            if((this.brds[i][j-1] & 2) == 0) ++aux;
                            if((this.brds[i][j] & 2) == 0) ++aux;
                        }
                        if(j < this.columns-1 && (this.brds[i][j] & 1) == 0) ++aux;
                        if(j - 1 > 0 && (this.brds[i][j-2] & 1) == 0) ++aux;

                        if(aux) ++solutions;
                    }

                    if(i + 1 < this.lines && (this.brds[i][j] & 2) == 0 &&
                       this.al[i+1][j] == 0) { // drum jos
                        var aux = 0;
                        if(j != 0) {
                            if((this.brds[i][j-1] & 1) == 0) ++aux;
                            if((this.brds[i+1][j-1] & 1) == 0) ++aux;
                        }
                        if(j != this.columns-1) {
                            if((this.brds[i][j] & 1) == 0) ++aux;
                            if((this.brds[i+1][j] & 1) == 0) ++aux;
                        }
                        if(i + 1 < this.lines-1 && (this.brds[i+1][j] & 2) == 0) ++aux;
                        if(i > 0 && (this.brds[i-1][j] & 2) == 0) ++aux;

                        if(aux) ++solutions;
                    }

                    if(i > 0 && (this.brds[i-1][j] & 2) == 0 &&
                       this.al[i-1][j] == 0) { // drum sus
                        var aux = 0;
                        if(j != 0) {
                            if((this.brds[i-1][j-1] & 1) == 0) ++aux;
                            if((this.brds[i][j-1] & 1) == 0) ++aux;
                        }
                        if(j != this.columns-1) {
                            if((this.brds[i-1][j] & 1) == 0) ++aux;
                            if((this.brds[i][j] & 1) == 0) ++aux;
                        }
                        if(i < this.lines-1 && (this.brds[i][j] & 2) == 0) ++aux;
                        if(i -1 > 0 && (this.brds[i-2][j] & 2) == 0) ++aux;

                        if(aux) ++solutions;
                    }

                    if(!solutions)
                        this.al[i][j] = -2;
                    else endgame = false;
                }
        if(endgame) {
            this.gameEnded = true;
            this.mc = null;
            gameOverMenuText.innerHTML = "Jucătorul " + (2 - this.playerToMove) + " câștigă!"
            gameOverMenu.classList.add('show');
            this.update();
        }
    }

    update() {
        this.draw();
        if(this.alreadyLocked.length < this.lockLimit) {
            table.selectLC();
        } else {
            table.hoverBlock();
        }
    }

    getSquare(x, y) {
        if(x >= this.cj && y >= this.ci) {
            x -= this.cj; y -= this.ci;
            x = Math.floor(x / this.el);
            y = Math.floor(y / this.el);
            if(x < this.columns && y < this.lines)
                return [x, y];
        }
        return null;
    }

    selectLC() {
        if(this.mc != null && !this.isAlreadyLocked(this.mc)) {
            c.beginPath();
            for(var i = 0; i < this.lines; ++i)
            if(this.al[i][this.mc[0]] != -1)
                c.rect(this.cj + (this.mc[0]+0.05) * this.el,
                       this.ci + (i+0.05) * this.el,
                       0.9 * this.el, 0.9 * this.el);
            for(var j = 0; j < this.columns; ++j)
            if(this.al[this.mc[1]][j] != -1)
                c.rect(this.cj + (j+0.05) * this.el,
                       this.ci + (this.mc[1]+0.05) * this.el,
                       0.9 * this.el, 0.9 * this.el);
            c.fillStyle = "#bf9a2a";
            c.fill();

            c.beginPath();
            for(var i = 0; i < this.lines; ++i)
            if(this.al[i][this.mc[0]] != -1)
                c.rect(this.cj + (this.mc[0]+0.05) * this.el,
                       this.ci + (i+0.05) * this.el,
                       0.8 * this.el, 0.8 * this.el);
            for(var j = 0; j < this.columns; ++j)
            if(this.al[this.mc[1]][j] != -1)
                c.rect(this.cj + (j+0.05) * this.el,
                       this.ci + (this.mc[1]+0.05) * this.el,
                       0.8 * this.el, 0.8 * this.el);
            c.fillStyle = "#ebbd34";
            c.fill();
        }
    }

    isAlreadyLocked(tolock) {
        var included = false;
        for(var i = 0; i < this.alreadyLocked.length; ++i)
            if(this.alreadyLocked[i][0] == tolock[0] &&
               this.alreadyLocked[i][1] == tolock[1]) {
                included = true;
                break;
            }
        return included;
    }

    lockLC(tolock) {
        if(!this.isAlreadyLocked(tolock)) {
            this.alreadyLocked.push(tolock);
            (new Audio("content/block_sound.mp3")).play();
            for(var i = 0; i < this.lines; ++i) 
                this.al[i][tolock[0]] = -1;
            for(var j = 0; j < this.columns; ++j)
                this.al[tolock[1]][j] = -1;

            for(var i = 0; i < this.lines; ++i)
                for(var j = 0; j < this.columns; ++j) {
                    if(j < this.columns-1 && this.al[i][j] != this.al[i][j+1] &&
                       (this.al[i][j] == -1 || this.al[i][j+1] == -1))
                        this.brds[i][j] |= 1;
                    else this.brds[i][j] &= 2;

                    if(i < this.lines-1 && this.al[i][j] != this.al[i+1][j] &&
                       (this.al[i][j] == -1 || this.al[i+1][j] == -1))
                        this.brds[i][j] |= 2;
                    else this.brds[i][j] &= 1;
                }

            this.playerToMove = 1 - this.playerToMove;
            this.recalcInaccessible();
        }
    }

    hoverBlock() {
        if(this.mc != null) {
            var i = this.mc[1];
            var j = this.mc[0];
            if(this.al[i][j] != 0) { }
            else if(this.direction == 0) {
                var aux = 0;
                if(j + 1 < this.columns && (this.brds[i][j] & 1) == 0 &&
                   this.al[i][j+1] == 0) { // drum dreapta
                    if(i != 0) {
                        if((this.brds[i-1][j] & 2) == 0) ++aux;
                        if((this.brds[i-1][j+1] & 2) == 0) ++aux;
                    }
                    if(i != this.lines-1) {
                        if((this.brds[i][j] & 2) == 0) ++aux;
                        if((this.brds[i][j+1] & 2) == 0) ++aux;
                    }
                    if(j + 1 < this.columns-1 && (this.brds[i][j+1] & 1) == 0) ++aux;
                    if(j > 0 && (this.brds[i][j-1] & 1) == 0) ++aux;
                }
                if(aux) {
                    c.fillStyle = "rgba(52, 235, 107, .5)";
                    c.fillRect(this.cj + (j+0.05) * this.el,
                               this.ci + (i+0.05) * this.el,
                               1.9*this.el, 0.9*this.el);
                    this.hb = [j, i];
                    return true;
                } else if(j > 0 && (this.brds[i][j-1] & 1) == 0 &&
                   this.al[i][j-1] == 0) { // drum stanga
                    if(i != 0) {
                        if((this.brds[i-1][j-1] & 2) == 0) ++aux;
                        if((this.brds[i-1][j] & 2) == 0) ++aux;
                    }
                    if(i != this.lines-1) {
                        if((this.brds[i][j-1] & 2) == 0) ++aux;
                        if((this.brds[i][j] & 2) == 0) ++aux;
                    }
                    if(j < this.columns-1 && (this.brds[i][j] & 1) == 0) ++aux;
                    if(j - 1 > 0 && (this.brds[i][j-2] & 1) == 0) ++aux;
                }
                if(aux) {
                    c.fillStyle = "rgba(52, 235, 107, .5)";
                    c.fillRect(this.cj + (j-0.95) * this.el,
                               this.ci + (i+0.05) * this.el,
                               1.9*this.el, 0.9*this.el);
                    this.hb = [j-1, i];
                    return true;
                }
            }
            else if(this.direction == 1) {
                var aux = 0;
                if(i + 1 < this.lines && (this.brds[i][j] & 2) == 0 &&
                   this.al[i+1][j] == 0) { // drum jos
                    if(j != 0) {
                        if((this.brds[i][j-1] & 1) == 0) ++aux;
                        if((this.brds[i+1][j-1] & 1) == 0) ++aux;
                    }
                    if(j != this.columns-1) {
                        if((this.brds[i][j] & 1) == 0) ++aux;
                        if((this.brds[i+1][j] & 1) == 0) ++aux;
                    }
                    if(i + 1 < this.lines-1 && (this.brds[i+1][j] & 2) == 0) ++aux;
                    if(i > 0 && (this.brds[i-1][j] & 2) == 0) ++aux;
                }
                if(aux) {
                    c.fillStyle = "rgba(52, 235, 107, .5)";
                    c.fillRect(this.cj + (j+0.05) * this.el,
                               this.ci + (i+0.05) * this.el,
                               0.9*this.el, 1.9*this.el);
                    this.hb = [j, i];
                    return true;
                } else if(i > 0 && (this.brds[i-1][j] & 2) == 0 &&
                   this.al[i-1][j] == 0) { // drum sus
                    if(j != 0) {
                        if((this.brds[i-1][j-1] & 1) == 0) ++aux;
                        if((this.brds[i][j-1] & 1) == 0) ++aux;
                    }
                    if(j != this.columns-1) {
                        if((this.brds[i-1][j] & 1) == 0) ++aux;
                        if((this.brds[i][j] & 1) == 0) ++aux;
                    }
                    if(i < this.lines-1 && (this.brds[i][j] & 2) == 0) ++aux;
                    if(i -1 > 0 && (this.brds[i-2][j] & 2) == 0) ++aux;
                }
                if(aux) {
                    c.fillStyle = "rgba(52, 235, 107, .5)";
                    c.fillRect(this.cj + (j+0.05) * this.el,
                               this.ci + (i-0.95) * this.el,
                               0.9*this.el, 1.9*this.el);
                    this.hb = [j, i-1];
                    return true;
                }
            }

            c.fillStyle = "rgba(235, 52, 162, .5)";
            c.fillRect(this.cj + (j+0.05) * this.el,
                       this.ci + (i+0.05) * this.el,
                       0.9*this.el, 0.9*this.el);
            this.hb = null;
            return false;
        }
    }

    lockBlock() {
        if(this.hb != null) {
            (new Audio("content/lc_sound.mp3")).play();
            var i = this.hb[1];
            var j = this.hb[0];
            if(this.direction == 0) {
                if(i > 0) {
                    this.brds[i-1][j] |= 2;
                    this.brds[i-1][j+1] |= 2;
                }
                this.brds[i][j] |= 2;
                this.brds[i][j+1] |= 3;
                if(j > 0)
                    this.brds[i][j-1] |= 1;
            } else if(this.direction == 1) {
                if(j > 0) {
                    this.brds[i][j-1] |= 1;
                    this.brds[i+1][j-1] |= 1;
                }
                this.brds[i][j] |= 1;
                this.brds[i+1][j] |= 3;
                if(i > 0)
                    this.brds[i-1][j] |= 2;
            }
            this.playerToMove = 1 - this.playerToMove;
            this.recalcInaccessible();
        }
    }
}

function startGame() {
    var lines = parseInt(document.getElementById('glines').value);
    var columns = parseInt(document.getElementById('gcolumns').value);
    var maxLCs = parseInt(document.getElementById('gLCs').value);
    table = new Table(lines, columns, maxLCs);

    gameSettings.classList.remove('show');

    function animate() {
        requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height);
        table.update()
    }
    
    addEventListener('mousemove', (e) => {
        if(!table.gameEnded)
            table.mc = table.getSquare(e.layerX, e.layerY);
    });
    
    addEventListener('wheel', (e) => {
        if(!table.gameEnded && table.alreadyLocked.length >= table.lockLimit) {
            table.direction = 1 - table.direction;
        }
    });
    
    addEventListener('click', (e) => {
        if(!table.gameEnded) {
            var clickedon = table.getSquare(e.layerX, e.layerY);
            if(clickedon != null) {
                if(table.alreadyLocked.length < table.lockLimit) {
                    table.lockLC(clickedon);
                } else table.lockBlock();
            }
        }
    });

    animate();
}