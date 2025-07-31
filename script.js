document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("videoModal");
  const videoPlayer = document.getElementById("videoPlayer");
  const closeBtn = modal.querySelector(".close");
  const slider = document.getElementById("videoSlider");

  const videoCount = 7;
  const groupSize = 9;
  const totalSlides = Math.ceil(videoCount / groupSize);
  let currentSlide = 0;

  function renderSlides() {
    slider.innerHTML = "";

    for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
      const slide = document.createElement("div");
      slide.className =
        "grid grid-cols-3 gap-4 w-full p-4 box-border min-w-full";

      const start = slideIndex * groupSize;
      const end = Math.min(start + groupSize, videoCount);

      for (let i = start + 1; i <= end; i++) {
        const box = document.createElement("div");
        box.className =
          "box aspect-video rounded-lg border border-[#d62828] overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer flex items-center justify-center";
        box.dataset.video = `video${i}`; // tanpa ekstensi

        const isLastSlide = slideIndex === totalSlides - 1;
        const isLastItem = i === end;
        const itemsInThisSlide = end - start;

        if (isLastSlide && isLastItem && itemsInThisSlide % 3 !== 0) {
          if (itemsInThisSlide % 3 === 1) {
            box.classList.add("col-start-2");
          }
          if (itemsInThisSlide % 3 === 2) {
            box.classList.add("last:ml-auto");
          }
        }
        const video = document.createElement("video");
        video.className = "w-full h-full object-cover";
        video.preload = "none";
        video.playsInline = true;
        video.muted = true;
        video.loading = "lazy";

        ["webm", "mp4", "ogv", "mov"].forEach((format) => {
          const source = document.createElement("source");
          source.src = `/video/video${i}.${format}`;
          source.type = `video/${format === "ogv" ? "ogg" : format}`;
          video.appendChild(source);
        });

        video.onerror = () => (box.style.display = "none");

        box.appendChild(video);
        slide.appendChild(box);
      }

      slider.appendChild(slide);
    }

    updateSlidePosition();
  }

  function updateSlidePosition() {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  // Gesture controls
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    const threshold = 50;

    if (diff < -threshold && currentSlide < totalSlides - 1) {
      currentSlide++;
    } else if (diff > threshold && currentSlide > 0) {
      currentSlide--;
    }

    updateSlidePosition();
  });

  // Click to open modal
  slider.addEventListener("click", (e) => {
    const box = e.target.closest(".box");
    if (!box) return;

    videoPlayer.innerHTML = ""; // clear previous source

    ["webm", "mp4", "ogv", "mov"].forEach((format) => {
      const source = document.createElement("source");
      source.src = `/video/${box.dataset.video}.${format}`;
      source.type = `video/${format === "ogv" ? "ogg" : format}`;
      videoPlayer.appendChild(source);
    });

    videoPlayer.load();
    videoPlayer.muted = false;
    videoPlayer.play().catch((err) => console.warn("Modal video error:", err));

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  function closeModal() {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.innerHTML = "";
  }

  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });

  // Lazy load with IntersectionObserver
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.load();
        observer.unobserve(entry.target);
      }
    });
  });

  setTimeout(() => {
    const videos = document.querySelectorAll("video[preload='none']");
    videos.forEach((video) => observer.observe(video));
  }, 500);

  renderSlides();
});
