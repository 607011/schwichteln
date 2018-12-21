(function(window) {
'use strict';

let tableEl = null;
let statsEl = null;
const MaxCounter = 10000000;


let shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let main = () => {
  let worker = new Worker('worker.js');
  let N = 6;
  let items = ['A', 'B', 'C', 'D', 'E', 'F'];
  shuffle(items);
  statsEl = document.getElementById('stats');
  tableEl = document.getElementById('table');
  let players = [];
  let running = true;

  document.getElementById('button-stop').addEventListener('click', () => {
    console.log('start/stop');
    running = !running;
  });
  document.getElementById('button-restart').addEventListener('restart', () => {
    console.log('restart');
    running = true;
    init();
  });

  let init = () => {
    while (tableEl.firstChild) {
      tableEl.removeChild(tableEl.firstChild);
    }
    for (let i = 0; i < N; ++i) {
      let playerDiv = document.createElement('div');
      playerDiv.className = 'player';
      let wantedDiv = document.createElement('div');
      wantedDiv.className = 'wanted';
      let itemsDiv = document.createElement('div');
      itemsDiv.className = 'items';
      itemsDiv.setAttribute('id', `player-items-${i}`);
      let cacheDiv = document.createElement('div');
      cacheDiv.className = 'cache';
      itemsDiv.setAttribute('id', `player-cache-${i}`);
      playerDiv.appendChild(itemsDiv);
      playerDiv.appendChild(cacheDiv);
      playerDiv.appendChild(wantedDiv);
      players.push({
        wanted: wantedDiv,
        items: itemsDiv,
        cache: cacheDiv
      });
      tableEl.appendChild(playerDiv);
    }  
    worker.postMessage(JSON.stringify({
      cmd: 'initialize',
      N: N,
      items: items
    }));
  }

  init();

  worker.onmessage = function(e) {
    let data = JSON.parse(e.data);
    if (data.callCount !== undefined && data.callCount < MaxCounter) {
      statsEl.innerText = `${(1e-3*data.dt)} s\n${data.callCount}`;
      //let items = data.players.map(player => player.owned).flat();
      // console.log(items);
      console.log(data.players);
      data.players.forEach(player => {
        players[player.idx].items.innerText = player.owned.join(' | '); 
        players[player.idx].cache.innerText = player.cache;
        players[player.idx].wanted.innerText = player.wanted;
        if (player.cache === undefined)
          running = false;
      });
      if (running) {
        worker.postMessage(JSON.stringify({
          cmd: 'continue'
        }));  
      }
    }
    else if (data.callCount === undefined) {
      worker.postMessage(JSON.stringify({
        cmd: 'continue'
      }));
    }  
  };

}

window.addEventListener('load', main);

})(window);
