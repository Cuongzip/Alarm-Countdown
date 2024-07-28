const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const app = {
  addEventListener() {
    const modalElement = $(".modal");
    const modalInnerElement = $(".modal-inner");

    const setTimeBtnElement = $(".modal-inner-btn-set");

    const countDownTimeElement = $(".count-down time");
    const startBtnElement = $(".count-down-start");
    const stopBtnElement = $(".count-down-stop");
    const resetBtnElement = $(".count-down-reset");
    const starAgainBtnElement = $(".count-down-start-again");

    const listInputElements = modalInnerElement.querySelectorAll("input");

    const audioElement = $("#audio");

    const listAudiosElement = $(".list-audios");

    const bellElement = $(".bell");

    let isCountdown = true;
    let timeCountDownOrigin;
    let timeCountDown;

    window.onload = () => {
      const audioSrc =
        localStorage.getItem("audioSrc") ||
        "./audio/day-di-le-duong-bao-lam-sieu-hai-nhacchuongviet.com.mp3";
      audioElement.src = audioSrc;
      listAudiosElement.value = audioSrc;
      const data = JSON.parse(localStorage.getItem("timeCountDownOrigin"));

      timeCountDownOrigin = data || {
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
      timeCountDown = { ...timeCountDownOrigin };
      let timeText = this.handleTime(timeCountDownOrigin).split(":");
      let index = 0;
      for (let inputElement of listInputElements) {
        const activeClass = "modal-inner-time-group-menu-item-active";
        const menuElement = inputElement.nextElementSibling;

        const listMenuItemElements = menuElement.querySelectorAll("li");

        for (let menuItemElement of listMenuItemElements) {
          if (menuItemElement.getAttribute("value") === timeText[index]) {
            menuItemElement.classList.add(activeClass);
            break;
          }
        }
        inputElement.value = timeText[index];

        inputElement.onfocus = () => {
          inputElement.select();
        };

        inputElement.onblur = () => {
          if (!inputElement.value) inputElement.value = "00";
        };

        inputElement.oninput = () => {
          if (Number(inputElement.value) > 60) {
            inputElement.value = "60";
          }
        };

        index++;

        menuElement.onmousedown = (e) => {
          if (
            e.target.localName === "li" &&
            !e.target.classList.contains(activeClass)
          ) {
            menuElement
              .querySelector("." + activeClass)
              ?.classList.remove(activeClass);
            e.target.classList.add(activeClass);

            inputElement.value = e.target.getAttribute("value");
          }
        };
      }
      timeText = timeText.join(":");
      countDownTimeElement.innerText = timeText;
    };

    modalElement.onmousedown = () => {
      modalElement.classList.remove("show");
    };

    modalInnerElement.onmousedown = (e) => {
      e.stopPropagation();
    };
    countDownTimeElement.onclick = () => {
      isCountdown = true;
      modalElement.classList.add("show");
    };
    let countDownIntervalId;
    startBtnElement.onclick = () => {
      countDownIntervalId = setInterval(() => {
        if (
          timeCountDown.seconds + timeCountDown.minutes + timeCountDown.hours >
          0
        ) {
          if (--timeCountDown.seconds < 0) {
            timeCountDown.seconds = 59;
            if (--timeCountDown.minutes < 0) {
              timeCountDown.minutes = 59;
              if (--timeCountDown.hours < 0) {
                timeCountDown.hours = 0;
              }
            }
          }
        } else {
          clearInterval(countDownIntervalId);
          stopBtnElement.classList.remove("show");
          starAgainBtnElement.classList.add("show");
          audioElement.currentTime = 0;
          audioElement.play();
          bellElement.classList.add("animation-shaking");
        }
        countDownTimeElement.innerText = this.handleTime(timeCountDown);
      }, 1000);
      startBtnElement.classList.remove("show");
      stopBtnElement.classList.add("show");
      resetBtnElement.classList.remove("show");
    };

    stopBtnElement.onclick = () => {
      clearInterval(countDownIntervalId);
      stopBtnElement.classList.remove("show");
      startBtnElement.classList.add("show");
      resetBtnElement.classList.add("show");
    };

    resetBtnElement.onclick = () => {
      timeCountDown = { ...timeCountDownOrigin };
      countDownTimeElement.innerText = this.handleTime(timeCountDownOrigin);
      resetBtnElement.classList.remove("show");
    };

    starAgainBtnElement.onclick = () => {
      stopBtnElement.classList.add("show");
      starAgainBtnElement.classList.remove("show");
      timeCountDown = { ...timeCountDownOrigin };
      countDownTimeElement.innerText = this.handleTime(timeCountDown);
      audioElement.pause();
      startBtnElement.dispatchEvent(new Event("click"));
    };

    setTimeBtnElement.onclick = () => {
      time = {};
      for (let inputElement of listInputElements) {
        time[inputElement.id] = Number(inputElement.value);
      }
      if (true) {
        timeCountDownOrigin = time;
        timeCountDown = { ...timeCountDownOrigin };
        localStorage.setItem(
          "timeCountDownOrigin",
          JSON.stringify(timeCountDownOrigin)
        );
        countDownTimeElement.innerText = this.handleTime(timeCountDownOrigin);
      } else {
      }
      modalElement.classList.remove("show");
    };
    listAudiosElement.onchange = () => {
      audioElement.src = listAudiosElement.value;
      localStorage.setItem("audioSrc", listAudiosElement.value);
      bellElement.classList.remove("animation-shaking");
    };

    bellElement.onclick = () => {
      if (bellElement.classList.contains("animation-shaking")) {
        bellElement.classList.remove("animation-shaking");
        audioElement.pause();
      } else {
        bellElement.classList.add("animation-shaking");
        audioElement.play();
      }
    };
  },
  handleTimeNow() {
    const timeNowElement = $(".time-now");

    setInterval(() => {
      const date = new Date();

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      timeNowElement.innerText = `${hours} : ${minutes} : ${seconds}`;
    }, 1000);
  },
  handleSlideBtn() {
    const btnSlideElements = $$(".button-slide");
    for (let btnSlideElement of btnSlideElements)
      btnSlideElement.onclick = () => {
        btnSlideElement.classList.toggle("button-slide-active");
      };
  },
  handleTime(time) {
    const hours = String(time.hours).padStart(2, "0");
    const minutes = String(time.minutes).padStart(2, "0");
    const seconds = String(time.seconds).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  },
  start() {
    this.addEventListener();
    this.handleTimeNow();
    this.handleSlideBtn();
  },
};

app.start();
