    function iniciarTigre() {
      if (animIdTigre) cancelAnimationFrame(animIdTigre);
      tigre.y = 220; tigre.vy = 0; tigre.grounded = true;
      obstaculos = []; distance = 0; scoreT = 0;
      nextSpawn = 40 + Math.floor(Math.random() * 100);
      document.getElementById('scoreTigre').innerText = scoreT;
      gameOverT = false;
      document.getElementById('respawnBtnTigre').style.display = 'none';
      juegoTigreActivo = true;
      startTigerMusic();
      animIdTigre = requestAnimationFrame(updateTigre);
    }

    function saltarTigre() {
      if (tigre.grounded && juegoTigreActivo && !gameOverT) {
        tigre.vy = tigre.jump; 
        tigre.grounded = false;
        soundTigreJump();
      }
    }
