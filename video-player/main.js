document.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('video');
  
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const fileInput = document.getElementsByTagName('input')[0];
  const drag = document.getElementById('drag');

  // toate filmele
  const movies = [
    './media/spiderman.mp4',
    './media/exemplu.mp4',
    './media/janes.mp4',
  ];
  //se adauga in playlist toate video-urile
  movies.forEach((movie, index) => adaugaTitluVideo(movie, index));

  //variabila cu care iterez array-ul
  let index = localStorage.getItem('index') ?? 0;

  //setarea sursei primului video care va rula
  video.src = movies[index];
  video.type = 'video/mp4';
  video.currentTime = localStorage.getItem('timp') ?? 0;

  // salvare dimensiuni canvas
  let W;
  let H;
  video.play();
  // handler de evenimente
  let handler;
  canvas.addEventListener('click', function () {
    handler = setTimeout(draw, 1);
  });

  //redimensionare video
  video.addEventListener('loadedmetadata', function () {
    canvas.width = 720;
    canvas.height = 405; 
    W = canvas.width;
    H = canvas.height;
  });

  video.addEventListener('pause', function () {
    cancelAnimationFrame(handler);
  });

  //desenare video pe canvas
  function draw() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    drawControls();
    localStorage.setItem('volum', video.volume);
    localStorage.setItem('index', index);
    localStorage.setItem('timp', video.currentTime);
    handler = setTimeout(draw, 1);
  }

  let display = false;
  //functia de desenare a controalelor pe canvas
  function drawControls() {
    if (display) {
      //setarea pozitiei pentru navigarea prin progressBar si volumeBar
      let poz = 0;
      let volume = 0.5;
      if (video.currentTime && video.duration) {
        poz = video.currentTime / video.duration;
        volume = video.volume;
      }

      //volumeBar
      context.fillStyle = 'white';
      context.fillRect(W / 2 + 200, H - 75, 100 * volume, 12);
      context.strokeStyle = 'black';
      context.strokeRect(W / 2 + 200, H - 75, 100, 12);

      //progressBar
      context.fillStyle = 'white';
      context.fillRect(7, H - 30, (W - 14) * poz, 12);
      context.strokeStyle = 'black';
      context.strokeRect(7, H - 30, W - 14, 12);

      //previousBtn
      context.beginPath();
      context.moveTo(W / 2 - 250, H - 75);
      context.lineTo(W / 2 - 250, H - 55);
      context.lineTo(W / 2 - 250 - H / 20, H - 65);
      context.closePath();
      context.strokeStyle = 'black';
      context.fill();
      context.stroke();
      context.fillStyle = 'white';
      context.fillRect(W / 2 - 285, H - 75, W / 108 - 6, 20);
      context.strokeRect(W / 2 - 285, H - 75, W / 108 - 6, 20);

      //nextBtn
      context.beginPath();
      context.moveTo(W / 2 - 100, H - 75);
      context.lineTo(W / 2 - 100, H - 55);
      context.lineTo(W / 2 - 100 + H / 20, H - 65);
      context.closePath();
      context.strokeStyle = 'black';
      context.fill();
      context.stroke();
      context.fillRect(W / 2 - 65, H - 75, W / 108 - 6, 20);
      context.strokeRect(W / 2 - 65, H - 75, W / 108 - 6, 20);
      if (video.paused) {
        //playBtn
        context.beginPath();
        context.moveTo(W / 2 - 175, H - 80);
        context.lineTo(W / 2 - 175, H - 50);
        context.lineTo(W / 2 - 175 + H / 20, H - 65);
        context.closePath();
        context.strokeStyle = 'black';
        context.fill();
        context.stroke();
      } else {
        //pauseBtn
        context.fillRect(W / 2 - 175, H - 80, W / 108 - 2, 30);
        context.strokeRect(W / 2 - 175, H - 80, W / 108 - 2, 30);

        context.fillRect(W / 2 - 175 + 12, H - 80, W / 108 - 2, 30);
        context.strokeRect(W / 2 - 175 + 12, H - 80, W / 108 - 2, 30);
      }
    }
  }
  //preluarea coodonatelor de pozitionare a mouse-ului pentru evenimentul de click pe canvas
  let X;
  let Y;

  //functia de trecere la videoclipul urmator, atunci cand se apasa pe suprafata controlului de next
  function next() {
    if (index < movies.length - 1) {
      video.src = movies[index + 1];
      video.load();
      video.play();
      index++;
      onIndexChange(index);
    } else {
      alert('Final de playlist!');
    }
  }

  //functia de trecere la videoclipul anterior, atunci cand se apasa pe suprafata controlului de previous
  function previous() {
    if (index > 0) {
      video.src = movies[index - 1];
      video.load();
      video.play();
      index--;
      onIndexChange(index);
    } else {
      alert('Primul video din playlist!');
    }
  }

  //atasare eveniment de click pe suprafata canvasului
  canvas.addEventListener('click', (e) => {
    X = e.pageX - canvas.getBoundingClientRect().left;
    Y = e.pageY - canvas.getBoundingClientRect().top;

    //functia de navigare prin progressBar
    function moveThroughProgressBar() {
      if (
        video.duration &&
        X >= 7 &&
        X <= 7 + W - 14 &&
        Y >= H - 30 &&
        Y <= H - 30 + 12
      ) {
        const pozitie = (X - 7) / (W - 14);
        video.currentTime = pozitie * video.duration;
      }
    }
    moveThroughProgressBar();

    //functia de navigare prin volumeBar
    function moveThroughVolumeBar() {
      if (X >= W / 2 + 200 && X <= W / 2 + 300 && Y >= H - 75 && Y <= H - 63) {
        const volume = (X - W / 2 - 200) / 100;
        video.volume = volume;
      }
    }

    moveThroughVolumeBar();

    //atasarea de conditii pe suprafata butoanelor (play/pause/previous/next/ss)
    if (
      W / 2 - 175 <= X &&
      X <= W / 2 - 175 + W / 30 &&
      H - 80 <= Y &&
      Y <= H - 80 + 30
    ) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
    if (
      W / 2 - 270 - H / 20 <= X &&
      X <= W / 2 - 230 - H / 20 &&
      H - 80 <= Y &&
      Y <= H - 55
    ) {
      previous();
    }
    if (
      W / 2 - 100 - H / 20 <= X &&
      X <= W / 2 - 70 - H / 20 &&
      H - 80 <= Y &&
      Y <= H - 55
    ) {
      next();
    }

    if (W - 30 <= X && X <= W - 30 + 20 && H - 538 <= Y && Y <= H - 538 + 20) {
      //daca booleanul este fals, inseamna ca pe canvas nu s-a desenat nimic si trebuie sa apelam functia de salvare cadru curent, altfel golim canvasul pentru un nou cadru
      if (isDrawn === true) {
        takeScreenShot();
      } else {
        isDrawn = false;
        ctx1.clearRect(0, 0, w, h);
      }
    }
  });

  // adaugare eveniment de incarcare filme noi prin file input

  fileInput.addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      movies.push(reader.result);
      reader.onload = null;
    };
    reader.readAsDataURL(e.target.files[0]);
    adaugaTitluVideo(fileInput.value, movies.length);
  });

  // adaugare eveniment de incarcare filme noi prin drag and drop

  drag.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  drag.addEventListener('drop', (e) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = (e2) => {
      movies.push(reader.result);
      reader.onload = null;
    };
    reader.readAsDataURL(e.dataTransfer.files[0]);
    adaugaTitluVideo(fileInput.value, movies.length);
  });

  //atasare eveniment pentru incheierea unui videoclip si trecerea automata la urmatorul
  if (video.src !== null) {
    video.addEventListener('ended', next);
  }
  canvas.addEventListener('mouseenter', (e) => (display = true));
  //atasare eveniment pentru cazul in care mouse-ul se afla in exteriorul canvas-ului -> controalele nu vor fi desenate utilizatorului
  canvas.addEventListener('mouseleave', (e) => (display = false));

  //functia care adauga in playlist un titlu
  function adaugaTitluVideo(titlu, indexParagraf) {
    let p = document.createElement('p');
    let fullFilename = titlu.split('\\').pop().split('/').pop();
    p.innerText = fullFilename;
    drag.appendChild(p);
    //video-ul nou selectat devine cel activ
    p.onclick = (e) => {
      index = indexParagraf;
      onIndexChange(index);
      video.src = movies[index];
      video.load();
      video.play();
    };
    // onIndexChange(0);
  }

  //functia de incercuire video selectat
  function onIndexChange(index) {
    let paragrafe = drag.querySelectorAll('p');
    for (let i = 1; i < paragrafe.length; i++) {
      paragrafe[i].classList.remove('selectat');
    }
    paragrafe[index + 1].classList.add('selectat');
  }
});
