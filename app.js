// Load tsParticles for full screen animated background with 3D polygon effect
tsParticles.load('tsparticles', {
  background: { color: { value: "#0d1014" } },
  fpsLimit: 60,
  particles: {
    number: { value: 80, density: { enable: true, value_area: 1200 } },
    color: { value: ["#17c9fc", "#f5b938", "#39ffcb", "#c583f6"] },
    shape: { type: "circle" },
    opacity: { value: 0.85 },
    size: { value: 6, random: { enable: true, minimumValue: 3 } },
    links: {
      enable: true,
      distance: 170,
      color: "#17c9fc",
      opacity: 0.3,
      width: 2,
      triangles: { enable: true, opacity: 0.06 }
    },
    move: {
      enable: true,
      speed: 1.7,
      random: true,
      outMode: "out",
      attract: { enable: true, rotateX: 800, rotateY: 1200 },
    }
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "grab" },
      onclick: { enable: true, mode: "push" }
    },
    modes: {
      grab: { distance: 140, links: { opacity: 0.4 } },
      push: { quantity: 5 }
    }
  },
  detectRetina: true,
});

// Setup mic listening wave bars
function setupWave() {
  const wave = document.getElementById('wave');
  wave.innerHTML = '';
  for(let i=0; i<5; ++i){
    let bar = document.createElement('div');
    bar.className = 'wave-bar';
    wave.appendChild(bar);
  }
}
setupWave();

const micBtn = document.getElementById('micBtn');
const chatbox = document.getElementById('chatbox');
const form = document.getElementById('form');
const textInput = document.getElementById('textInput');

let recognition;
if('webkitSpeechRecognition' in window) recognition = new webkitSpeechRecognition();
else if('SpeechRecognition' in window) recognition = new SpeechRecognition();

if(recognition){
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => micBtn.classList.add('listening');
  recognition.onend = () => micBtn.classList.remove('listening');
  recognition.onerror = () => {
    micBtn.classList.remove('listening');
    addMessage('bot', "Sorry, I didn't get that. Please try again.");
  };
  recognition.onresult = (event) => {
    let text = event.results[0][0].transcript;
    addMessage('user', text);
    handleQuery(text);
  };
}

micBtn.onclick = ()=> {
  if(recognition) recognition.start();
  else alert("Your browser does not support speech recognition.");
};

function typeWriterEffect(el, text, delay=17, cb){
  el.innerHTML = '';
  let i = 0;
  const step = () => {
    if(i < text.length){
      el.innerHTML += text.charAt(i);
      let cur = document.createElement('span');
      cur.className = 'cursor';
      cur.textContent = '|';
      el.appendChild(cur);
      setTimeout(()=>{
        cur.remove();
        i++;
        step();
      }, delay);
    } else if(cb) cb();
  };
  step();
}

function addMessage(sender, text, typing = false){
  const div = document.createElement('div');
  div.className = 'msg ' + sender;
  if(typing && sender === 'bot'){
    typeWriterEffect(div, text);
  } else {
    div.innerHTML = text;
  }
  chatbox.appendChild(div);
  chatbox.appendChild(document.createElement('div')).className = 'clearfix';
  chatbox.scrollTop = chatbox.scrollHeight;
}

function handleQuery(text){
  text = text.toLowerCase().trim();

  if(text.startsWith('search for') || text.startsWith('google')){
    const q = text.replace(/^search for|^google/, '').trim();
    if(q.length){
      addMessage('bot', `Searching Google for "${q}" ...`, true);
      fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`)
      .then(res => res.json())
      .then(data => {
        const ans = data.AbstractText || data.RelatedTopics?.[0]?.Text || '';
        if(ans) addMessage('bot', ans, true);
        else {
          addMessage('bot', "No instant answer found. Opening browser.", true);
          window.open(`https://google.com/search?q=${encodeURIComponent(q)}`, '_blank');
        }
      }).catch(() => {
        addMessage('bot', "Fetch failed, opening Google...", true);
        window.open(`https://google.com/search?q=${encodeURIComponent(q)}`, '_blank');
      });
    }
  } else if(text.includes('youtube')){
    addMessage('bot', "Opening YouTube...", true);
    window.open('https://youtube.com', '_blank');
  } else if(text.includes('open') && text.includes('google')){
    addMessage('bot', "Opening Google...", true);
    window.open('https://google.com', '_blank');
  } else if(text.includes('time')){
    addMessage('bot', "The time is " + new Date().toLocaleTimeString(), true);
  } else if(/hello|hi|hey/.test(text)){
    addMessage('bot', "Hello! How can I help?", true);
  } else if(/your name|who are you/.test(text)){
    addMessage('bot', "I'm Jarvis, your AI assistant.", true);
  } else if(text.length >= 3){
    addMessage('bot', "Searching Wikipedia...", true);
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text.split(' ').join('_'))}`)
    .then(res => res.json())
    .then(data => {
      if(data.extract) addMessage('bot', data.extract, true);
      else addMessage('bot', "Sorry, no info found.", true);
    }).catch(() => {
      addMessage('bot', "Could not find info.", true);
    });
  } else {
    addMessage('bot', "Please type or say a question or command.", true);
  }
}

function handleSubmit(e){
  e.preventDefault();
  const val = textInput.value.trim();
  if(val.length){
    addMessage('user', val);
    handleQuery(val);
    textInput.value = '';
  }
}

form.onsubmit = handleSubmit;

