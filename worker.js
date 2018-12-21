// Copyright (c) 2018 Oliver Lau <ola@ct.de>, Heise Medien GmbH & Co. KG
// All rights reserved.

let count = 0;
let callCount = 0;
let t0 = null;

let randint = (lo, hi) => Math.floor(lo + Math.random() * hi);

class Player {
  constructor(idx, items, others) {
    this.idx = idx;
    this.owned = [items[idx]]  // list of owned items
    this.wanted = items[randint(0, items.length)];  // TODO: should be a list of probabilities
    this.cache = null;  // kept item
    this.can_exchange = true;  // user can exchange an item he owns for the item in his cache
    this.keep_probability = 0.01;  // probability an unwanted item is kept when a 6 is rolled
    this.others = others;  // list of all players
  }

  handOverTo(direction) {
    let choice;
    for (choice in this.owned) {
      if (this.owned[choice] != this.wanted)
        break;
    }
    let receiver = this.others[(this.idx + this.others.length + direction) % this.others.length];
    receiver.take(this.owned[choice]);
    this.owned.splice(choice, 1);
  }

  take(item) {
    this.owned.push(item);
  }

  rollDice() {
    if (this.owned.length === 0)
      return;
    let pips = randint(1, 6);
    if (pips === 6) {
      let wantedIdx = this.owned.indexOf(this.wanted);
      if (wantedIdx >= 0) {
        if (this.cache === null) {
          this.cache = this.wanted;
          this.owned.splice(wantedIdx, 1);
        }
        else if (this.can_exchange) {
          [this.owned[wantedIdx], this.cache] = [this.cache, this.owned[wantedIdx]];
        }
      }
      else if (this.keep_probability > Math.random() && this.cache === null) {
        let choice = randint(0, this.owned.length);
        this.cache = this.owned[choice];
        this.owned.splice(choice, 1);
      }
    }
    else if (pips % 2 === 0) {
      this.handOverTo(Player.TO_LEFT);
    }
    else {
      this.handOverTo(Player.TO_RIGHT);
    }
  }

  data() {
    return {
      idx: this.idx,
      wanted: this.wanted,
      owned: this.owned,
      cache: this.cache
    };
  }
}

Player.TO_LEFT = -1;
Player.TO_RIGHT = +1;

let N = 6;
let players = [];

onmessage = e => {
  let data = JSON.parse(e.data);
  switch(data.cmd) {
    case 'initialize': {
      count = 0;
      callCount = 0;
      t0 = null;
      if (data.N > 0) {
        N = data.N
      }
      if (data.items && data.items.length >= N) {
        players = [];
        for (let i = 0; i < N; ++i) {
          players.push(new Player(i, data.items, players));
        }
      }
      postMessage(JSON.stringify({state: 'ok'}));
      break;
    }
    case 'continue': {
      if (t0 === null) {
        t0 = this.performance.now();
      }
      ++callCount;
      let t = this.performance.now();
      players.forEach(player => player.rollDice());
      let ms = this.performance.now() - t;
      let result = {
        players: players.map(player => player.data()),
        dt: this.performance.now() - t0,
        callCount: callCount,
        state: 'ok'
      };
      postMessage(JSON.stringify(result));
      break;
    } 
    case 'stop': {
      close();
      break;
    }
    default:
    break;
  }
}
