let usuarioActual = "";
    let animIdCulebra = null;
    let animIdTigre = null;
    let animIdBomber = null;
    let juegoCulebraActivo = false;
    let juegoTigreActivo = false;
    let juegoBomberActivo = false;

    // --- SINTETIZADOR DE AUDIO Y SOUNDTRACKS EXPANDIDOS ---
    let audioCtx = null;
    let currentMusicInterval = null;

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    document.addEventListener('pointerdown', () => {
      initAudio();
      if (!currentMusicInterval && document.getElementById('menuPrincipal').classList.contains('active')) {
        startMenuMusic();
      }
    }, { once: true });

    function playTone(freq, duration, type = 'square', delay = 0) {
      initAudio();
      setTimeout(() => {
        if (!audioCtx || audioCtx.state !== 'running') return;
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }, delay);
    }

    function playSlide(startFreq, endFreq, duration, type = 'square') {
      initAudio();
      if (!audioCtx || audioCtx.state !== 'running') return;
      let osc = audioCtx.createOscillator();
      let gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }

    function playNoise(duration) {
      initAudio();
      if (!audioCtx || audioCtx.state !== 'running') return;
      let bufferSize = audioCtx.sampleRate * duration;
      let buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      let data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      let noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      let filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + duration);
      let gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    }

    function stopMusic() {
      if (currentMusicInterval) {
        clearInterval(currentMusicInterval);
        currentMusicInterval = null;
      }
    }

    function startMenuMusic() {
      stopMusic();
      let notes = [
        330, 392, 523, 659, 523, 392, 330, 261,
        293, 349, 440, 523, 440, 349, 392, 330
      ];
      let index = 0;
      currentMusicInterval = setInterval(() => {
        if (document.getElementById('menuPrincipal').classList.contains('active')) {
          playTone(notes[index], 0.18, 'square');
          index = (index + 1) % notes.length;
        }
      }, 200);
    }

    function startCulebraMusic() {
      stopMusic();
      let notes = [
        164.81, 196.00, 220.00, 246.94, 220.00, 196.00, 164.81, 130.81,
        146.83, 174.61, 196.00, 220.00, 196.00, 174.61, 146.83, 123.47
      ];
      let index = 0;
      currentMusicInterval = setInterval(() => {
        if (juegoCulebraActivo) {
          playTone(notes[index], 0.14, 'triangle');
          index = (index + 1) % notes.length;
        }
      }, 180);
    }

    function startTigerMusic() {
      stopMusic();
      let notes = [
        261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 293.66, 349.23,
        440.00, 523.25, 587.33, 523.25, 440.00, 349.23, 329.63, 293.66
      ];
      let index = 0;
      currentMusicInterval = setInterval(() => {
        if (juegoTigreActivo) {
          playTone(notes[index], 0.1, 'sawtooth');
          index = (index + 1) % notes.length;
        }
      }, 140);
    }

    function startBomberMusic() {
      stopMusic();
      let notes = [
        110.00, 110.00, 130.81, 146.83, 130.81, 110.00, 98.00, 110.00,
        123.47, 146.83, 164.81, 146.83, 130.81, 123.47, 110.00, 92.50
      ];
      let index = 0;
      currentMusicInterval = setInterval(() => {
        if (juegoBomberActivo) {
          playTone(notes[index], 0.12, 'square');
          index = (index + 1) % notes.length;
        }
      }, 190);
    }

    function soundCulebraEat() {
      playTone(523.25, 0.08, 'square', 0);
      playTone(659.25, 0.08, 'square', 80);
      playTone(783.99, 0.12, 'square', 160);
    }
    function soundCulebraCrash() {
      playNoise(0.3);
      playTone(150, 0.2, 'sawtooth', 0);
    }
    function soundTigreJump() {
      playSlide(200, 600, 0.12, 'square');
    }
    function soundTigreParrot() {
      playSlide(900, 1300, 0.08, 'sine');
      setTimeout(() => playSlide(1300, 900, 0.08, 'sine'), 90);
    }
    function soundBomberExplosion() {
      playNoise(0.4);
      playTone(100, 0.3, 'sawtooth', 0);
    }
    function soundBomberLose() {
      playSlide(400, 100, 0.4, 'sawtooth');
    }

    // --- GESTIÓN DE SESIÓN Y ARRANQUE ---
    window.onload = function() {
      let savedUser = localStorage.getItem('arcadeUser');
      if (savedUser) {
        usuarioActual = savedUser;
        document.getElementById('welcomeUser').innerText = "HOLA, " + usuarioActual;
        document.getElementById('btnSalirSesion').innerText = "CAMBIAR JUGADOR";
        cambiarPantalla('menuPrincipal');
      } else {
        usuarioActual = "";
        document.getElementById('welcomeUser').innerText = "MODO INVITADO";
        document.getElementById('btnSalirSesion').innerText = "PONER MI NOMBRE";
        cambiarPantalla('vistaLogin');
      }
    };

    function intentarLogin() {
      initAudio();
      let u = document.getElementById('userInput').value.trim();
      let msg = document.getElementById('loginMsg');

      if (!u) {
        msg.innerText = "POR FAVOR, INGRESA UN NOMBRE";
        return;
      }

      usuarioActual = u;
      localStorage.setItem('arcadeUser', usuarioActual);
      document.getElementById('welcomeUser').innerText = "HOLA, " + usuarioActual;
      document.getElementById('btnSalirSesion').innerText = "CAMBIAR JUGADOR";
      cambiarPantalla('menuPrincipal');
    }

    function jugarComoInvitado() {
      initAudio();
      usuarioActual = "";
      localStorage.removeItem('arcadeUser');
      document.getElementById('welcomeUser').innerText = "MODO INVITADO";
      document.getElementById('btnSalirSesion').innerText = "PONER MI NOMBRE";
      cambiarPantalla('menuPrincipal');
    }

    function cerrarSesion() {
      localStorage.removeItem('arcadeUser');
      usuarioActual = "";
      document.getElementById('userInput').value = "";
      document.getElementById('loginMsg').innerText = "";
      cambiarPantalla('vistaLogin');
    }

    function cambiarPantalla(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      
      juegoCulebraActivo = false;
      juegoTigreActivo = false;
      juegoBomberActivo = false;
      if (animIdCulebra) cancelAnimationFrame(animIdCulebra);
      if (animIdTigre) cancelAnimationFrame(animIdTigre);
      if (animIdBomber) cancelAnimationFrame(animIdBomber);

      stopMusic();
      if(id === 'menuPrincipal') { startMenuMusic(); }
      if(id === 'vistaCulebrita') { cargarTablaRécordsGenerica("Culebrita"); iniciarCulebra(); }
      if(id === 'vistaTigre') { cargarTablaRécordsGenerica("TigreSelva"); iniciarTigre(); }
      if(id === 'vistaBomber') { cargarTablaRécordsGenerica("BomberMan"); iniciarBomber(); }
      window.scrollTo(0, 0);
    }

    function guardarPuntajeAutomatico(juego, puntaje) {
      if (!usuarioActual) return;
      let scores = JSON.parse(localStorage.getItem('arcadeScores')) || [];
      
      let indexExistente = scores.findIndex(item => item.game === juego && item.name === usuarioActual);

      if (indexExistente !== -1) {
        if (puntaje > scores[indexExistente].score) {
          scores[indexExistente].score = puntaje;
        }
      } else {
        scores.push({ name: usuarioActual, score: puntaje, game: juego });
      }

      scores.sort((a, b) => b.score - a.score);
      localStorage.setItem('arcadeScores', JSON.stringify(scores));
      cargarTablaRécordsGenerica(juego);
    }

    function cargarTablaRécordsGenerica(nombreJuego) {
      let tablaId = "scoreTableCulebra";
      if (nombreJuego === "TigreSelva") tablaId = "scoreTableTigre";
      if (nombreJuego === "BomberMan") tablaId = "scoreTableBomber";
      
      let scoreTable = document.getElementById(tablaId);
      if (!scoreTable) return;
      scoreTable.innerHTML = "<tr><th>JUGADOR</th><th>PTS</th></tr>";
      
      let scores = JSON.parse(localStorage.getItem('arcadeScores')) || [];
      let filtered = scores.filter(item => item.game === nombreJuego).slice(0, 5);

      if(filtered.length === 0) {
        scoreTable.innerHTML += "<tr><td colspan='2' style='text-align:center; color:#64748b;'>SIN RÉCORDS</td></tr>";
        return;
      }
      filtered.forEach(function(item) {
        let rowStyle = item.name === usuarioActual && usuarioActual !== "" ? "color: #38bdf8;" : "";
        scoreTable.innerHTML += `<tr style="${rowStyle}"><td>${item.name}</td><td>${item.score}</td></tr>`;
      });
    }

    // --- CULEBRITA ---
    const canvasC = document.getElementById('gameCanvasCulebra');
    const ctxC = canvasC.getContext('2d');
    let snake = [{x: 140, y: 140}], food = {x: 100, y: 100};
    let dxC = 20, dyC = 0, scoreC = 0, gameOverC = false;
    let lastTimeC = 0, acumuladorC = 0, cambiandoDirC = false;

    function iniciarCulebra() {
      if (animIdCulebra) cancelAnimationFrame(animIdCulebra);
      snake = [{x: 140, y: 140}];
      dxC = 20; dyC = 0; scoreC = 0;
      document.getElementById('scoreCulebra').innerText = scoreC;
      gameOverC = false;
      lastTimeC = 0; acumuladorC = 0;
      document.getElementById('respawnBtnCulebra').style.display = 'none';
      placeFoodC();
      juegoCulebraActivo = true;
      startCulebraMusic();
      animIdCulebra = requestAnimationFrame(updateCulebra);
    }

    function placeFoodC() {
      food.x = Math.floor(Math.random() * (canvasC.width / 20)) * 20;
      food.y = Math.floor(Math.random() * (canvasC.height / 20)) * 20;
    }

    function updateCulebra(time) {
      if (!juegoCulebraActivo || gameOverC) return;
      animIdCulebra = requestAnimationFrame(updateCulebra);

      if (!lastTimeC) lastTimeC = time;
      acumuladorC += (time - lastTimeC);
      lastTimeC = time;

      let currentSnakeSpeed = 110;
      if (scoreC >= 500) currentSnakeSpeed = 65;   
      else if (scoreC >= 100) currentSnakeSpeed = 90;   

      while (acumuladorC >= currentSnakeSpeed) {
        acumuladorC -= currentSnakeSpeed;
        cambiandoDirC = false;
        const head = {x: snake[0].x + dxC, y: snake[0].y + dyC};

        if (head.x < 0 || head.x >= canvasC.width || head.y < 0 || head.y >= canvasC.height || snake.some(p => p.x === head.x && p.y === head.y)) {
          gameOverC = true;
          juegoCulebraActivo = false;
          stopMusic();
          soundCulebraCrash();
          document.getElementById('respawnBtnCulebra').style.display = 'block';
          if (scoreC > 0) guardarPuntajeAutomatico("Culebrita", scoreC);
          return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          scoreC += 10;
          soundCulebraEat();
          document.getElementById('scoreCulebra').innerText = scoreC;
          placeFoodC();
        } else {
          snake.pop();
        }
      }

      ctxC.clearRect(0, 0, canvasC.width, canvasC.height);
      
      for (let r = 0; r < canvasC.height / 20; r++) {
        for (let c = 0; c < canvasC.width / 20; c++) {
          ctxC.fillStyle = (r + c) % 2 === 0 ? '#1b431b' : '#225222';
          ctxC.fillRect(c * 20, r * 20, 20, 20);
        }
      }

      ctxC.fillStyle = '#ff2a2a';
      ctxC.fillRect(food.x + 3, food.y + 6, 14, 10);
      ctxC.fillRect(food.x + 5, food.y + 4, 10, 14);
      ctxC.fillStyle = '#55ff55';
      ctxC.fillRect(food.x + 8, food.y + 2, 4, 4);

      snake.forEach((p, index) => {
        if (index === 0) {
          ctxC.fillStyle = '#00ccff';
          ctxC.fillRect(p.x + 1, p.y + 1, 18, 18);
          ctxC.fillStyle = 'white';
          if (dxC > 0) { ctxC.fillRect(p.x+12, p.y+4, 4, 4); ctxC.fillRect(p.x+12, p.y+12, 4, 4); }
          else if (dxC < 0) { ctxC.fillRect(p.x+4, p.y+4, 4, 4); ctxC.fillRect(p.x+4, p.y+12, 4, 4); }
          else if (dyC < 0) { ctxC.fillRect(p.x+4, p.y+4, 4, 4); ctxC.fillRect(p.x+12, p.y+4, 4, 4); }
          else { ctxC.fillRect(p.x+4, p.y+12, 4, 4); ctxC.fillRect(p.x+12, p.y+12, 4, 4); }
          ctxC.fillStyle = 'black';
          if (dxC > 0) { ctxC.fillRect(p.x+14, p.y+6, 2, 2); ctxC.fillRect(p.x+14, p.y+14, 2, 2); }
          else if (dxC < 0) { ctxC.fillRect(p.x+4, p.y+6, 2, 2); ctxC.fillRect(p.x+4, p.y+14, 2, 2); }
          else if (dyC < 0) { ctxC.fillRect(p.x+6, p.y+4, 2, 2); ctxC.fillRect(p.x+14, p.y+4, 2, 2); }
          else { ctxC.fillRect(p.x+6, p.y+14, 2, 2); ctxC.fillRect(p.x+14, p.y+14, 2, 2); }
        } else {
          ctxC.fillStyle = '#0099cc';
          ctxC.fillRect(p.x + 2, p.y + 2, 16, 16);
        }
      });
    }

    function intentarMoverC(nx, ny) {
      if (gameOverC || cambiandoDirC) return;
      if (ny !== 0 && dyC === 0) { dxC = 0; dyC = ny; cambiandoDirC = true; }
      else if (nx !== 0 && dxC === 0) { dxC = nx; dyC = 0; cambiandoDirC = true; }
    }
    function resetCulebra() { iniciarCulebra(); }

    // --- TIGRE EN LA SELVA ---
    const canvasT = document.getElementById('gameCanvasTigre');
    const ctxT = canvasT.getContext('2d');
    let tigre = { x: 40, y: 220, w: 32, h: 24, vy: 0, jump: -9.5, gravity: 0.5, grounded: true };
    let obstaculos = [], distance = 0, scoreT = 0, gameOverT = false, nextSpawn = 0;

    function updateTigre() {
      if (!juegoTigreActivo || gameOverT) return;
      animIdTigre = requestAnimationFrame(updateTigre);

      let currentSpeed = scoreT >= 1000 ? 7 : (scoreT >= 400 ? 6 : 4.5);
      distance += currentSpeed;
      scoreT = Math.floor(distance / 10);
      document.getElementById('scoreTigre').innerText = scoreT;

      tigre.vy += tigre.gravity;
      tigre.y += tigre.vy;
      if (tigre.y >= 220) { tigre.y = 220; tigre.vy = 0; tigre.grounded = true; }

      nextSpawn--;
      if (nextSpawn <= 0) {
        let esLoro = scoreT >= 1000 && Math.random() > 0.55;
        if (esLoro) {
          let alturaLoro = (Math.random() > 0.5) ? 185 : 215; 
          obstaculos.push({ x: 300, y: alturaLoro, w: 24, h: 12, tipo: 'loro', sonado: false });
        } else {
          obstaculos.push({ x: 300, y: 228, w: 16, h: 16, tipo: 'tronco' });
        }
        let randomnessRange = scoreT >= 1000 ? 75 : (scoreT >= 400 ? 90 : 100); 
        nextSpawn = 35 + Math.floor(Math.random() * randomnessRange); 
      }

      for (let i = obstaculos.length - 1; i >= 0; i--) {
        obstaculos[i].x -= currentSpeed;

        if (obstaculos[i].tipo === 'loro' && !obstaculos[i].sonado && obstaculos[i].x < 150) {
          obstaculos[i].sonado = true;
          soundTigreParrot();
        }

        if (
          tigre.x < obstaculos[i].x + obstaculos[i].w &&
          tigre.x + tigre.w > obstaculos[i].x &&
          tigre.y < obstaculos[i].y + obstaculos[i].h &&
          tigre.y + tigre.h > obstaculos[i].y
        ) {
          gameOverT = true;
          juegoTigreActivo = false;
          stopMusic();
          soundCulebraCrash();
          document.getElementById('respawnBtnTigre').style.display = 'block';
          if (scoreT > 0) guardarPuntajeAutomatico("TigreSelva", scoreT);
          return;
        }
        if (obstaculos[i].x + obstaculos[i].w < 0) obstaculos.splice(i, 1);
      }

      ctxT.clearRect(0, 0, canvasT.width, canvasT.height);
      ctxT.fillStyle = '#ff7b54'; ctxT.fillRect(0, 0, canvasT.width, canvasT.height);
      ctxT.fillStyle = '#ffb26b'; ctxT.fillRect(200, 40, 40, 40);

      ctxT.fillStyle = '#939b62';
      let bgLayer3 = (distance * 0.15) % 300;
      for(let i=-1; i<3; i++) {
         let bx = i*150 - bgLayer3;
         ctxT.fillRect(bx, 100, 100, 200); ctxT.fillRect(bx+20, 80, 60, 200); ctxT.fillRect(bx+40, 60, 20, 200);
      }

      let bgLayer2 = (distance * 0.4) % 200;
      for(let i=-1; i<4; i++) {
         let bx = i*200 - bgLayer2;
         ctxT.fillStyle = '#5c4033'; ctxT.fillRect(bx+40, 100, 20, 150);
         ctxT.fillStyle = '#1e3f1a'; ctxT.fillRect(bx+10, 60, 80, 40);
         ctxT.fillRect(bx+20, 40, 60, 20); ctxT.fillRect(bx+30, 20, 40, 20);
      }

      ctxT.fillStyle = '#1b431b'; ctxT.fillRect(0, 244, canvasT.width, 56);
      ctxT.fillStyle = '#0a1c0a'; ctxT.fillRect(0, 244, canvasT.width, 4);

      obstaculos.forEach(o => {
        if (o.tipo === 'loro') {
          let wingOffset = (distance % 20 < 10) ? -3 : 2;
          ctxT.fillStyle = '#d1d5db'; ctxT.fillRect(o.x, o.y + 2, 4, 4);
          ctxT.fillStyle = '#ef4444'; ctxT.fillRect(o.x + 4, o.y, 6, 6); ctxT.fillRect(o.x + 8, o.y + 2, 10, 8); 
          ctxT.fillStyle = '#111'; ctxT.fillRect(o.x + 6, o.y + 2, 2, 2);
          ctxT.fillStyle = '#3b82f6'; ctxT.fillRect(o.x + 18, o.y + 4, 6, 4);
          let wingY = o.y + 2 + wingOffset;
          ctxT.fillStyle = '#eab308'; ctxT.fillRect(o.x + 10, wingY, 6, 3);
          ctxT.fillStyle = '#3b82f6'; ctxT.fillRect(o.x + 10, wingY + 3, 6, 3);
        } else {
          ctxT.fillStyle = '#5c4033'; ctxT.fillRect(o.x, o.y, o.w, o.h);
          ctxT.fillStyle = '#3e2723'; ctxT.fillRect(o.x, o.y+4, o.w, 4); ctxT.fillRect(o.x+4, o.y, 4, o.h);
        }
      });

      let tailOffset = (distance % 30 < 15 && tigre.grounded) ? 0 : 4;
      ctxT.fillStyle = '#f97316'; ctxT.fillRect(tigre.x - 6, tigre.y + 8 - tailOffset, 10, 2);
      ctxT.fillStyle = '#f97316'; ctxT.fillRect(tigre.x + 4, tigre.y + 8, 20, 12); ctxT.fillRect(tigre.x + 20, tigre.y + 4, 12, 10);
      ctxT.fillStyle = '#fff'; ctxT.fillRect(tigre.x + 28, tigre.y + 10, 4, 4);
      ctxT.fillStyle = '#c2410c'; ctxT.fillRect(tigre.x + 22, tigre.y + 2, 4, 4);
      ctxT.fillStyle = '#111'; ctxT.fillRect(tigre.x + 26, tigre.y + 6, 2, 2);
      ctxT.fillStyle = '#111'; ctxT.fillRect(tigre.x + 8, tigre.y + 8, 2, 12); ctxT.fillRect(tigre.x + 14, tigre.y + 8, 2, 12); ctxT.fillRect(tigre.x + 20, tigre.y + 8, 2, 12);
      
      let legFront = 0, legBack = 0;
      if (tigre.grounded) {
        legFront = (distance % 20 < 10) ? 4 : -2; legBack = (distance % 20 < 10) ? -2 : 4;
      } else {
        legFront = 4; legBack = -4; 
      }
      ctxT.fillStyle = '#c2410c';
      ctxT.fillRect(tigre.x + 6 + legBack, tigre.y + 20, 4, 4); ctxT.fillRect(tigre.x + 18 + legFront, tigre.y + 20, 4, 4);
    }
    function resetTigre() { iniciarTigre(); }

    // --- BOMBER MAN ---
    const canvasB = document.getElementById('gameCanvasBomber');
    const ctxB = canvasB.getContext('2d');
    const colsB = 11, rowsB = 11;
    let mapB = [], playerB = { x: 1, y: 1, dir: 'down' }, bombasB = [], explosionesB = [], enemigosB = [];
    let puertaB = { x: -1, y: -1, encontrada: false };
    let scoreBomber = 0, nivelBomber = 1, gameOverBomber = false, tiempoRecargaBomba = 0;

    function moverBomber(dx, dy) {
      if (!juegoBomberActivo || gameOverBomber) return;
      if (dx === 1) playerB.dir = 'right';
      if (dx === -1) playerB.dir = 'left';
      if (dy === 1) playerB.dir = 'down';
      if (dy === -1) playerB.dir = 'up';

      let nuevoX = playerB.x + dx, nuevoY = playerB.y + dy;
      let hayBomba = bombasB.some(b => b.x === nuevoX && b.y === nuevoY);
      if (nuevoX >= 0 && nuevoX < colsB && nuevoY >= 0 && nuevoY < rowsB) {
        if (mapB[nuevoY][nuevoX] === 0 && !hayBomba) {
          playerB.x = nuevoX; playerB.y = nuevoY;
          if (puertaB.encontrada && playerB.x === puertaB.x && playerB.y === puertaB.y && enemigosB.length === 0) {
            nivelBomber++; scoreBomber += 300; iniciarBomber(true);
          }
        }
      }
    }

    function ponerBomba() {
      if (!juegoBomberActivo || gameOverBomber || tiempoRecargaBomba > 0) return;
      let existe = bombasB.some(b => b.x === playerB.x && b.y === playerB.y);
      if (!existe) {
        bombasB.push({ x: playerB.x, y: playerB.y, timer: 120, alcance: 2 });
        tiempoRecargaBomba = 180;
      }
    }

    function updateBomber() {
      if (!juegoBomberActivo || gameOverBomber) return;
      animIdBomber = requestAnimationFrame(updateBomber);

      if (tiempoRecargaBomba > 0) tiempoRecargaBomba--;

      for (let i = bombasB.length - 1; i >= 0; i--) {
        bombasB[i].timer--;
        if (bombasB[i].timer <= 0) {
          let b = bombasB.splice(i, 1)[0]; 
          explotarBomba(b.x, b.y, b.alcance);
        }
      }

      for (let i = explosionesB.length - 1; i >= 0; i--) {
        explosionesB[i].timer--;
        if (explosionesB[i].timer <= 0) explosionesB.splice(i, 1);
      }

      let velocidadEnemigo = Math.max(15, 30 - (nivelBomber * 2));
      enemigosB.forEach(en => {
        en.timerMov++;
        if (en.timerMov > velocidadEnemigo) {
          en.timerMov = 0;
          let dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
          let d = dirs[Math.floor(Math.random() * dirs.length)];
          let nx = en.x + d.x, ny = en.y + d.y;
          if (nx >= 0 && nx < colsB && ny >= 0 && ny < rowsB && mapB[ny][nx] === 0) {
            en.x = nx; en.y = ny;
          }
        }
      });

      let murio = false;
      explosionesB.forEach(ex => { if (ex.x === playerB.x && ex.y === playerB.y) murio = true; });
      enemigosB.forEach(en => { if (en.x === playerB.x && en.y === playerB.y) murio = true; });

      if (murio) {
        gameOverBomber = true;
        juegoBomberActivo = false;
        stopMusic();
        soundBomberLose();
        document.getElementById('respawnBtnBomber').style.display = 'block';
        if (scoreBomber > 0) guardarPuntajeAutomatico("BomberMan", scoreBomber);
        return;
      }

      ctxB.clearRect(0, 0, canvasB.width, canvasB.height);
      let cellW = canvasB.width / colsB, cellH = canvasB.height / rowsB;

      for (let r = 0; r < rowsB; r++) {
        for (let c = 0; c < colsB; c++) {
          let px = c * cellW, py = r * cellH;

          if (puertaB.encontrada && puertaB.x === c && puertaB.y === r) {
            ctxB.fillStyle = '#1e293b'; ctxB.fillRect(px, py, cellW, cellH); 
            ctxB.fillStyle = '#22c55e'; ctxB.fillRect(px + 4, py + 2, cellW - 8, cellH - 4); 
            ctxB.fillStyle = '#14532d'; ctxB.fillRect(px + 6, py + 4, cellW - 12, cellH - 6); 
            ctxB.fillStyle = '#eab308'; ctxB.fillRect(px + 10, py + 10, cellW - 20, cellH - 18); 
          }
          else if (mapB[r][c] === 1) {
            ctxB.fillStyle = '#475569'; ctxB.fillRect(px, py, cellW, cellH);
            ctxB.fillStyle = '#94a3b8'; ctxB.fillRect(px, py, cellW, 4); 
            ctxB.fillStyle = '#1e293b'; ctxB.fillRect(px, py + cellH - 4, cellW, 4); 
            ctxB.fillStyle = '#0f172a'; ctxB.fillRect(px + 4, py + 4, cellW - 8, cellH - 8); 
            ctxB.fillStyle = '#334155'; ctxB.fillRect(px + 8, py + 8, cellW - 16, cellH - 16);
          } 
          else if (mapB[r][c] === 2) {
            ctxB.fillStyle = '#9a3412'; ctxB.fillRect(px, py, cellW, cellH); 
            ctxB.fillStyle = '#fdba74'; ctxB.fillRect(px, py, cellW, 2); 
            ctxB.fillStyle = '#ea580c'; ctxB.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);
            ctxB.fillStyle = '#431407'; 
            ctxB.fillRect(px, py + cellH/2, cellW, 2);
            ctxB.fillRect(px + cellW/3, py, 2, cellH/2);
            ctxB.fillRect(px + (cellW/3)*2, py + cellH/2, 2, cellH/2);
          } 
          else if (!puertaB.encontrada || puertaB.x !== c || puertaB.y !== r) {
            ctxB.fillStyle = '#1e293b'; ctxB.fillRect(px, py, cellW, cellH);
          }
        }
      }

      bombasB.forEach(b => {
        let px = b.x * cellW, py = b.y * cellH;
        let cx = px + cellW/2, cy = py + cellH/2;
        ctxB.fillStyle = '#111';
        ctxB.beginPath(); ctxB.arc(cx, cy + 2, cellW/2.5, 0, Math.PI*2); ctxB.fill();
        ctxB.fillStyle = '#555';
        ctxB.beginPath(); ctxB.arc(cx - 4, cy - 2, cellW/8, 0, Math.PI*2); ctxB.fill();
        ctxB.fillStyle = '#78350f';
        ctxB.fillRect(cx - 2, py + 2, 4, 6);
        ctxB.fillStyle = (b.timer % 10 < 5) ? '#ef4444' : '#facc15';
        ctxB.fillRect(cx - 3, py, 6, 4);
      });

      explosionesB.forEach(ex => {
        let px = ex.x * cellW, py = ex.y * cellH;
        ctxB.fillStyle = '#ef4444'; ctxB.fillRect(px, py, cellW, cellH);
        ctxB.fillStyle = '#f97316'; ctxB.fillRect(px + 4, py + 4, cellW - 8, cellH - 8);
        ctxB.fillStyle = '#facc15'; ctxB.fillRect(px + 8, py + 8, cellW - 16, cellH - 16);
        ctxB.fillStyle = '#ffffff'; ctxB.fillRect(px + 12, py + 12, cellW - 24, cellH - 24);
      });

      enemigosB.forEach(en => {
        let px = en.x * cellW, py = en.y * cellH;
        let floatY = Math.sin(en.timerMov * 0.3) * 3;
        let ey = py + floatY;
        
        ctxB.fillStyle = '#ec4899'; 
        ctxB.beginPath(); ctxB.arc(px + cellW/2, ey + cellH/2, cellW/2.2, Math.PI, 0); ctxB.fill();
        ctxB.fillRect(px + 2, ey + cellH/2, cellW - 4, cellH/2.5);
        ctxB.fillRect(px + 2, ey + cellH/2 + cellH/3, cellW/5, cellH/5);
        ctxB.fillRect(px + cellW/2 - cellW/10, ey + cellH/2 + cellH/3, cellW/5, cellH/5);
        ctxB.fillRect(px + cellW - 2 - cellW/5, ey + cellH/2 + cellH/3, cellW/5, cellH/5);
        
        ctxB.fillStyle = '#ffffff';
        ctxB.fillRect(px + 6, ey + 8, 6, 8); ctxB.fillRect(px + cellW - 12, ey + 8, 6, 8);
        ctxB.fillStyle = '#2563eb';
        ctxB.fillRect(px + 6, ey + 10, 4, 4); ctxB.fillRect(px + cellW - 10, ey + 10, 4, 4);
      });

      let px = playerB.x * cellW, py = playerB.y * cellH;
      let dir = playerB.dir || 'down';

      ctxB.fillStyle = '#ffffff'; ctxB.fillRect(px + 4, py + 2, cellW - 8, cellH/2 + 2);
      ctxB.fillStyle = '#f472b6'; ctxB.fillRect(px + cellW/2 - 2, py - 4, 4, 6);
      ctxB.fillStyle = '#ef4444'; ctxB.fillRect(px + cellW/2 - 3, py - 6, 6, 3);

      if (dir === 'up') {
        ctxB.fillStyle = '#e2e8f0'; ctxB.fillRect(px + 6, py + 8, cellW - 12, cellH/3);
      } else if (dir === 'down') {
        ctxB.fillStyle = '#0f172a'; ctxB.fillRect(px + 4, py + 8, cellW - 8, cellH/3);
        ctxB.fillStyle = '#38bdf8'; 
        ctxB.fillRect(px + 8, py + 10, 3, 5); 
        ctxB.fillRect(px + cellW - 11, py + 10, 3, 5);
      } else if (dir === 'left') {
        ctxB.fillStyle = '#0f172a'; ctxB.fillRect(px + 2, py + 8, cellW - 10, cellH/3);
        ctxB.fillStyle = '#38bdf8'; 
        ctxB.fillRect(px + 5, py + 10, 3, 5);
      } else if (dir === 'right') {
        ctxB.fillStyle = '#0f172a'; ctxB.fillRect(px + 8, py + 8, cellW - 10, cellH/3);
        ctxB.fillStyle = '#38bdf8'; 
        ctxB.fillRect(px + cellW - 8, py + 10, 3, 5);
      }

      ctxB.fillStyle = '#3b82f6'; ctxB.fillRect(px + 6, py + cellH/2 + 4, cellW - 12, cellH/2 - 4);
      ctxB.fillStyle = '#1e293b'; ctxB.fillRect(px + 6, py + cellH - 7, cellW - 12, 3);
      ctxB.fillStyle = '#facc15'; ctxB.fillRect(px + cellW/2 - 3, py + cellH - 8, 6, 5);
      ctxB.fillStyle = '#f472b6'; 
      ctxB.fillRect(px + 1, py + cellH/2 + 4, 5, 5); 
      ctxB.fillRect(px + cellW - 6, py + cellH/2 + 4, 5, 5);
      ctxB.beginPath(); ctxB.arc(px + 8, py + cellH, 4, Math.PI, 0); ctxB.fill();
      ctxB.beginPath(); ctxB.arc(px + cellW - 8, py + cellH, 4, Math.PI, 0); ctxB.fill();
    }

    function resetBomber() { iniciarBomber(false); }

    document.addEventListener('keydown', (e) => {
      if (["Space", " ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();

      if (document.getElementById('vistaCulebrita').classList.contains('active')) {
        if (gameOverC && (e.key === ' ' || e.code === 'Space')) return resetCulebra();
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') intentarMoverC(0, -20);
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') intentarMoverC(0, 20);
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') intentarMoverC(-20, 0);
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') intentarMoverC(20, 0);
      }

      if (document.getElementById('vistaTigre').classList.contains('active')) {
        if (e.key === ' ' || e.code === 'Space' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
          gameOverT ? resetTigre() : saltarTigre();
        }
      }

      if (document.getElementById('vistaBomber').classList.contains('active')) {
        if (gameOverBomber && (e.key === ' ' || e.code === 'Space')) return resetBomber();
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') moverBomber(0, -1);
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') moverBomber(0, 1);
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moverBomber(-1, 0);
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moverBomber(1, 0);
        if (e.key === ' ' || e.code === 'Space') ponerBomba();
      }
    });
