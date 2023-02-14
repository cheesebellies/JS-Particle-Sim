const timer = ms => new Promise(res => setTimeout(res, ms))
var wait = 0;
var particleList = [];
var pIndex = 0;
function getLen(vec1, vec2) {
    return Math.sqrt(Math.pow(vec2[0]-vec1[0], 2) + Math.pow(vec2[1]-vec1[1], 2));
}
function add(vec, vec2) {
    let v1 = [...vec];
    let v2 = [...vec2];
    for (let index = 0; index < 2; index++) {
        v1[index] += v2[index];
    }
    return v1;
}
function subtract(vec, vec2) {
    let v1 = [...vec];
    let v2 = [...vec2];
    for (let index = 0; index < 2; index++) {
        v1[index] -= v2[index];
    }
    return v1;
}
function multiply(vec, num) {
    let v1 = [...vec];
    for (let index = 0; index < 2; index++) {
        v1[index] *= num;
    }
    return v1;
}
function divide(vec, num) {
    let v1 = [...vec];
    for (let index = 0; index < 2; index++) {
        v1[index] /= num;
    }
    return v1;
}

class Particle {
    constructor(opts) {
        let backup = { "div": undefined, "pos": [0.0, 0.0], "currentVelocity": [5.0, 5.0], "maxVelocity": 10.0, "weight": 1.0, "color": [0, 0, 0], "isStatic": false, "attractorList": [] }
        for (var [key, value] of Object.entries(backup)) {
            if (!opts.hasOwnProperty(key)) {
                opts[key] = value;
            }
        }
        this.pos = opts["pos"];
        this.div = opts["div"];
        this.vel = opts["currentVelocity"];
        this.maxVel = opts["maxVelocity"];
        this.weight = opts["weight"];
        this.color = opts["color"];
        this.isStatic = opts["isStatic"];
        this.attractorList = opts["attractorList"];
    }

    gravity(pos, val) {
        pos = [window.innerWidth / 2, window.innerHeight / 2];
        if (this.isStatic) {
            return;
        }

        pos = subtract(pos, this.pos);
        pos = divide(pos, Math.sqrt(Math.pow(pos[0], 2) + Math.pow(pos[1], 2)));
        pos = multiply(pos, val);
        this.accelerate([0,0.4]);
        return pos;
    }

    getSpeed() {
        return Math.sqrt(Math.pow(this.vel[0], 2) + Math.pow(this.vel[1], 2));
    }

    resistance(res) {
        this.vel = multiply(this.vel, 1 - res);
    }

    getWalls() {
        if (this.pos[0] > (window.innerWidth-(this.weight*10))) {
            this.pos[0] = (window.innerWidth-(this.weight*10));
            this.vel[0] = 0;
        }
        if (this.pos[0] < (0)) {
            this.pos[0] = (0);
            this.vel[0] = 0;
        }
        if (this.pos[1] > (window.innerHeight-(this.weight*10))) {
            this.pos[1] = (window.innerHeight-(this.weight*10));
            this.vel[1] = 0;
        }
        if (this.pos[1] < (0)) {
            this.pos[1] = (0);
            this.vel[1] = 0;
        }
    }

    updatePos() {
        if (this.isStatic) {
            return;
        }

        this.gravity(this.attractorList[0].pos, this.attractorList[0].weight / 100)

        this.pos = add(this.pos, this.vel);
    }

    accelerate(acc) {
        if (this.isStatic) {
            return;
        }
        acc = multiply(acc, 1 / this.weight);
        this.vel = add(this.vel, acc);
    }

    getCollisions() {
        if (this.isStatic){
            return;
        }
        var along, along2, mult;
        for (let i = 0; i < 1; i++) {
            particleList.forEach( (particle) => {
                if (particle !== this) {
                    if (getLen(this.pos, particle.pos) < this.weight * 10) {
                        mult = (this.weight * 10) - getLen(this.pos, particle.pos);
                        along = subtract(this.pos, particle.pos);
                        along = divide(along, getLen([0, 0], along));
                        along = multiply(along, mult);
                        along2 = subtract([0, 0], along);
                        particle.pos = add(particle.pos, along2);
                        this.pos = add(this.pos, along);
                    }
                }
            });
        }
        this.getWalls();
    }


    normalizeVelocity() {
        var currentSpeed, over, overPercent;
        currentSpeed = this.getSpeed();

        if (currentSpeed < this.maxVel) {
            return;
        }

        over = currentSpeed - this.maxVel;
        overPercent = 1 - over / currentSpeed;
        this.vel = multiply(this.vel, overPercent);
    }
}

function start() {

    var particles = 500;
    var grav = new Particle({ "pos": [200, 200], "isStatic": true, "weight": 14 });
    var attractorList = [grav];
    var div = undefined;
    var pos = undefined;
    function spawnParticle() {
        pIndex++;
        div = document.createElement("div");
        // Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight)
        pos = [50 + (Math.random()*10),50 + (Math.random()*10)];
        div.id = "particle_" + pIndex;
        div.style.left = pos[0] + "px";
        div.style.position = "absolute";
        div.style.top = pos[1] + "px";
        div.style.background = "#000000";
        div.style.width = "10px";
        div.style.height = "10px";
        div.style.borderRadius = "5px";
        document.body.appendChild(div);
        particleList.push(new Particle({ "div": ("particle_" + pIndex), "pos": pos, "currentVelocity": [10,2], "attractorList": attractorList }));
    }
    gameloop();
    function gameloop() {
        setTimeout(function() {
            if (particleList.length < 200) {
                spawnParticle();
            }
            updateParticles();
            gameloop();
        }, wait);
    }
    function doCollisions() {
        particleList.forEach(function(particle) {
            particle.getCollisions();
        });
    }
    function updateParticles() {
        
        particleList.forEach(function(particle) {8
            particle.updatePos();
            particle.resistance(0.01);
            div = document.getElementById(particle.div);
            div.style.left = particle.pos[0] + "px";
            div.style.top = particle.pos[1] + "px";
        })
        for(let i = 0;i < 32; i++) {
            doCollisions();
        }
    }
}

document.addEventListener("DOMContentLoaded", start());
