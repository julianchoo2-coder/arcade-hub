    function iniciarBomber(siguienteNivel = false) {
      if (animIdBomber) cancelAnimationFrame(animIdBomber);
      if (!siguienteNivel) { scoreBomber = 0; nivelBomber = 1; }
      document.getElementById('scoreBomber').innerText = scoreBomber;
      document.getElementById('nivelBomber').innerText = nivelBomber;
      gameOverBomber = false; document.getElementById('respawnBtnBomber').style.display = 'none';
      playerB = { x: 1, y: 1, dir: 'down' }; bombasB = []; explosionesB = []; tiempoRecargaBomba = 0;
      puertaB = { x: -1, y: -1, encontrada: false };
      
      mapB = []; let bloquesDestructiblesOcultanPuerta = [];
      for (let r = 0; r < rowsB; r++) {
        let row = [];
        for (let c = 0; c < colsB; c++) {
          if (r === 0 || r === rowsB - 1 || c === 0 || c === colsB - 1 || (r % 2 === 0 && c % 2 === 0)) {
            row.push(1); 
          } else if ((r === 1 && c === 1) || (r === 1 && c === 2) || (r === 2 && c === 1)) {
            row.push(0); 
          } else {
            let esDestructible = Math.random() < 0.6;
            row.push(esDestructible ? 2 : 0);
            if (esDestructible) bloquesDestructiblesOcultanPuerta.push({r, c});
          }
        }
        mapB.push(row);
      }

      if (bloquesDestructiblesOcultanPuerta.length > 0) {
        let elegido = bloquesDestructiblesOcultanPuerta[Math.floor(Math.random() * bloquesDestructiblesOcultanPuerta.length)];
        puertaB = { x: elegido.c, y: elegido.r, encontrada: false };
      }

      let cantidadEnemigos = 2 + (nivelBomber - 1);
      enemigosB = []; let casillasLibres = [];
      for (let r = 1; r < rowsB - 1; r++) {
        for (let c = 1; c < colsB - 1; c++) {
          if (mapB[r][c] === 0 && !(r <= 2 && c <= 2)) casillasLibres.push({r, c});
        }
      }
      
      for (let i = 0; i < cantidadEnemigos && casillasLibres.length > 0; i++) {
        let index = Math.floor(Math.random() * casillasLibres.length);
        let pos = casillasLibres.splice(index, 1)[0];
        enemigosB.push({ x: pos.c, y: pos.r, timerMov: 0 });
      }

      juegoBomberActivo = true;
      startBomberMusic();
      animIdBomber = requestAnimationFrame(updateBomber);
    }

    function explotarBomba(bx, by, alcance) {
      soundBomberExplosion();
      explosionesB.push({ x: bx, y: by, timer: 15 });
      let dirs = [{x:0, y:-1}, {x:0, y:1}, {x:-1, y:0}, {x:1, y:0}];
      
      dirs.forEach(d => {
        for (let i = 1; i <= alcance; i++) {
          let nx = bx + (d.x * i), ny = by + (d.y * i);
          if (nx < 0 || nx >= colsB || ny < 0 || ny >= rowsB) break;
          if (mapB[ny][nx] === 1) break; 
          
          if (mapB[ny][nx] === 2) {
            mapB[ny][nx] = 0; scoreBomber += 25; 
            document.getElementById('scoreBomber').innerText = scoreBomber;
            if (puertaB.x === nx && puertaB.y === ny) puertaB.encontrada = true;
            explosionesB.push({ x: nx, y: ny, timer: 15 });
            break; 
          }

          explosionesB.push({ x: nx, y: ny, timer: 15 });

          for (let e = enemigosB.length - 1; e >= 0; e--) {
            if (enemigosB[e].x === nx && enemigosB[e].y === ny) {
              enemigosB.splice(e, 1); scoreBomber += 100; 
              document.getElementById('scoreBomber').innerText = scoreBomber;
            }
          }
        }
      });

      for (let e = enemigosB.length - 1; e >= 0; e--) {
        if (enemigosB[e].x === bx && enemigosB[e].y === by) {
          enemigosB.splice(e, 1); scoreBomber += 100;
          document.getElementById('scoreBomber').innerText = scoreBomber;
        }
      }
    }
