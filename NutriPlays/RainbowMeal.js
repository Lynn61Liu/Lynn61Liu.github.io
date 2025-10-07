
  window.onload = function () {
    const popup = document.getElementById("introPopup");
    const closeBtn = document.getElementById("closePopup");
    const nextBtn = document.getElementById("nextBtn");

    const pages = [
      document.getElementById("popupPage1"),
      document.getElementById("popupPage2"),
      document.getElementById("popupPage3")
    ];
    const audios = {
      0: document.getElementById("intro01"),
      1: document.getElementById("intro02"),
      2: document.getElementById("intro03")
    };


    let currentPage = 0;

    nextBtn.addEventListener("click", () => {
      pages[currentPage].style.display = "none";
      // Stop previous audio if playing
      console.log(audios[currentPage])
      if (audios[currentPage]) {
        audios[currentPage].pause();
        audios[currentPage].currentTime = 0;
      }

      currentPage++;
      if (currentPage < pages.length) {
        pages[currentPage].style.display = "block";
         // Play audio for the new page
         if (audios[currentPage]) {
          audios[currentPage].play();
        }
        if (currentPage === pages.length - 1) {
          nextBtn.textContent = "Start!";
        }
      } else {
        popup.style.display = "none";
      }
    });

    closeBtn.addEventListener("click", () => {
       // Stop audio if popup is closed
       if (audios[currentPage]) {
        audios[currentPage].pause();
        audios[currentPage].currentTime = 0;
      }
      popup.style.display = "none";
    });
  };





// tip show<script>


const tips = document.getElementById("tips");
const slices = document.querySelectorAll(".slice");

slices.forEach((slice) => {
  let audioElement; 
  let timeoutId;    
  slice.addEventListener("mouseenter", () => {
   
    tips.classList.add("show");
    slices.forEach((s) => {
      s.classList.remove("active", "inactive");
      if (s !== slice) {
        s.classList.add("inactive");
      }
    });
    slice.classList.add("active");
  
    let mytips = "";
    if (slice.classList.contains("half")) {
      mytips =
        ' <img src="./imgs/immunity.gif" alt=""><H3>🥦 Vegetables and Fruits</H3><p>Choose to eat a rainbow 🌈 of colours from this group 🥦🍎🍌🍇, they provide vitamins 💊, minerals 🧂 and fibre 🌾 for the immune system 🛡️.</p><H3> ✅ 1/2 of plate should be fruits and vegetables at every meal!</H3><img src="./imgs/headphones.gif" id="playBtnVF" alt=""><audio src="./audio/FV.mp3" autoplay controls id="audioVF" autoplay></audio>';
    } else if (slice.classList.contains("q1")) {
      mytips =
        ' <img src="./imgs/intestinal.gif" alt=""><H3> 🍞 Grain Foods</H3><p>Such as breads 🍞, cereals 🥣, rice 🍚, pasta 🍝. Choose wholegrain options 🌾 for support of the digestive system 🌀.</p><H3>✅ 1/4 of plate should be whole grains at every meal!</H3><img src="./imgs/headphones.gif" id="playBtnGrains" alt=""><audio src="./audio/grains.mp3" controls  id="audioGrains" autoplay></audio>';
    } else if (slice.classList.contains("q2")) {
      mytips =
        ' <img src="./imgs/brain.gif" alt=""><H3>🍗 Protein</H3><p>Legumes 🌱, nuts 🥜, seeds 🌻, fish 🐟, eggs 🥚, chicken 🍗 and meat 🥩 provide protein 💪 and iron 🧲 for growing bodies 👶 and brain development 🧠.</p><H3>✅ 1/4 of plate should be protein foods at every meal!</H3><img src="./imgs/headphones.gif" id="playBtnProtein" alt=""><audio  src="./audio/protein.mp3" controls id="audioProtein" autoplay></audio>';
    } else {
      mytips =
        ' <img src="./imgs/brone.gif" alt=""><H3>🥛 Dairy</H3><p>Milk, cheese and yogurt are full of calcium 🦴 and protein 💪 to build strong bones and teeth! 🦷</p><H3>✅ Include 1–2 serves of dairy (or alternatives) with meals daily!</H3><img src="./imgs/headphones.gif" id="playBtnDairy" alt=""><audio src="./audio/dairy.mp3" controls id="audioDairy" autoplay></audio>';
    }
    tips.innerHTML = mytips;
    tips.classList.add("show");
    setTimeout(() => {
      audioElement = tips.querySelector("audio");
      if (audioElement) {
        audioElement.play();
      }
    }, 100);
    // auto close 10s 
    timeoutId = setTimeout(() => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      tips.classList.remove("show");
      slices.forEach((s) => s.classList.remove("active", "inactive"));
    }, 20000);

  });

  slice.addEventListener("mouseleave", () => {
    clearTimeout(timeoutId);
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    tips.classList.remove("show");
    slices.forEach((s) => s.classList.remove("active", "inactive"));
  });
});


document.addEventListener("click", function (e) {
  if (e.target && e.target.id.startsWith("playBtn")) {
    const audioId = "audio" + e.target.id.replace("playBtn", "");
    const audioEl = document.getElementById(audioId);

    if (audioEl) {
      document.querySelectorAll("audio").forEach((a) => {
        if (a !== audioEl) {
          a.pause();
          a.currentTime = 0;
        }
      });
      audioEl.play();
    }
  }
});

function replacePlateImage(targetId, newSrc) {
  const img = document.getElementById(targetId);
  img.src = newSrc;

  img.classList.remove("pop-animate");
  void img.offsetWidth;
  img.classList.add("pop-animate");
}
document.querySelectorAll(".foodstyle").forEach((item) => {
  item.addEventListener("click", () => {
    const classes = item.classList;
    const imgSrc = item.querySelector("img").src;

    if (classes.contains("veg")) {
      replacePlateImage("veg", imgSrc);
    } else if (classes.contains("protein")) {
      replacePlateImage("protein", imgSrc);
    } else if (classes.contains("grains")) {
      replacePlateImage("grain", imgSrc);
    } else if (classes.contains("fruit")) {
      replacePlateImage("fruit", imgSrc);
    } else if (classes.contains("dairy")) {
      replacePlateImage("dairy", imgSrc);
    }else {
      alert(
        "🌈 “Candy and cookies are ‘sometimes foods’ — like a little party in your mouth with sparkles and fun! But to jump high, run fast, and grow strong every day, your body needs fruits, veggies, grains, and protein!” 🎉🍭🍎💪"
      );
    }
  });
});


  document.querySelector('.diy-link').addEventListener('click', function (e) {
    e.preventDefault(); 
    document.body.classList.add('slide-out'); 

    setTimeout(() => {
      window.location.href = this.href; 
    }, 500); 
  });
