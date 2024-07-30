const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

let restDurationElements = $$(".alarm-left-rest-duration");
const modalElement = $(".modal");

const modalInnerElement = $(".modal-inner");

const listInputElements = modalInnerElement.querySelectorAll("input");

const setTimeBtnElement = $(".modal-inner-btn-set");

const countDownTimeElement = $(".count-down time");

const startBtnElement = $(".count-down-start");
const stopBtnElement = $(".count-down-stop");
const resetBtnElement = $(".count-down-reset");
const startAgainBtnElement = $(".count-down-start-again");

const audioElement = $("#audio");

const listAudiosElement = $(".list-audios");

const bellElement = $(".bell");

const addAlarmElement = $(".button-add-alarm");

const listAlarmElement = $(".list-alarm");

const app = {
  listAlarms: [],
  addEventListener() {
    let action = "";
    let timeCountdown = {};
    let totalSeconds = 0;
    let indexActiveAlarm;

    listAlarmElement.onclick = (e) => {
      const buttonSlideElement = e.target.closest(".button-slide");
      const alarmElement = e.target.closest(".alarm");
      const index = alarmElement?.getAttribute("index");

      if (buttonSlideElement) {
        buttonSlideElement.classList.toggle("button-slide-active");
        this.listAlarms[index].state = !this.listAlarms[index].state;
        restDurationElements[index].innerText = "";
      }
      if (alarmElement && !buttonSlideElement) {
        modalElement.classList.add("show");
        const time = this.handleFormatTime(this.listAlarms[index].time);
        for (let inputElement of listInputElements) {
          inputElement.value = time[inputElement.id];
        }
        indexActiveAlarm = index;
        action = "change-alarm";
      }
    };
    addAlarmElement.onclick = () => {
      modalElement.classList.add("show");
      for (let inputElement of listInputElements) {
        inputElement.value = "00";
      }
      action = "add-alarm";
    };

    window.onunload = () => {
      localStorage.setItem("timeCountdown", JSON.stringify(timeCountdown));
      localStorage.setItem("audioSrc", listAudiosElement.value);
      localStorage.setItem("listAlarms", JSON.stringify(this.listAlarms));
    };

    window.onload = () => {
      const audioSrc =
        localStorage.getItem("audioSrc") ||
        "./audio/day-di-le-duong-bao-lam-sieu-hai-nhacchuongviet.com.mp3";

      audioElement.src = audioSrc;
      listAudiosElement.value = audioSrc;

      this.listAlarms = JSON.parse(localStorage.getItem("listAlarms")) || [];

      this.renderAlarms();

      timeCountdown = JSON.parse(localStorage.getItem("timeCountdown")) || {
        hours: 0,
        minutes: 0,
        seconds: 0,
      };

      totalSeconds = this.convertTimeToTotalSeconds(timeCountdown);

      if (totalSeconds <= 0) {
        startBtnElement.disabled = true;
      } else {
        startBtnElement.disabled = false;
      }

      let timeText = this.handleFormatTime(timeCountdown);

      for (let inputElement of listInputElements) {
        const activeClass = "modal-inner-time-group-menu-item-active";
        const menuElement = inputElement.nextElementSibling;

        const listMenuItemElements = menuElement.querySelectorAll("li");

        let value = timeText[inputElement.id];

        for (let menuItemElement of listMenuItemElements) {
          if (menuItemElement.getAttribute("value") === value) {
            menuItemElement.classList.add(activeClass);
            break;
          }
        }

        inputElement.value = value;

        inputElement.onfocus = () => {
          inputElement.select();
        };

        inputElement.onblur = () => {
          const valueNumber = Number(inputElement.value);
          if (valueNumber >= 0 && valueNumber <= 9) {
            inputElement.value = "0" + valueNumber;
          }
        };

        inputElement.oninput = () => {
          const valueNumber = Number(inputElement.value);
          if (isNaN(valueNumber)) {
            inputElement.value = value;
          } else {
            if (valueNumber > 60) {
              inputElement.value = "60";
            }
            value = inputElement.value;
          }
        };

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
      countDownTimeElement.innerText = `${timeText.hours}:${timeText.minutes}:${timeText.seconds}`;

      setInterval(() => {
        const date = new Date();
        isFireAlarm = false;
        let index = 0;
        for (let alarm of this.listAlarms) {
          if (alarm.state) {
            let totalSecondsAlarm = this.convertTimeToTotalSeconds(alarm.time);

            let totalSecondSTimeNow =
              (date.getHours() * 60 + date.getMinutes()) * 60 +
              date.getSeconds();

            let restDuration = totalSecondsAlarm - totalSecondSTimeNow;

            if (restDuration < 0) {
              restDuration += 24 * 60 * 60;
            }
            const time = this.convertTotalSecondsToTime(restDuration);
            let timeText = "Báo thức sau";
            if (time.hours) timeText += ` ${time.hours} giờ`;
            if (time.minutes) timeText += ` ${time.minutes} phút`;
            if (time.seconds && !time.hours && !time.minutes)
              timeText += ` ${time.seconds} giây`;
            restDurationElements[index].innerText = timeText;

            if (totalSecondsAlarm === totalSecondSTimeNow) {
              isFireAlarm = true;
              alarm.state = false;
              this.renderAlarms();
            }
          }
          index++;
        }
        if (isFireAlarm) {
          handleStartAudio();
        }
      }, 1000);
    };

    modalElement.onmousedown = () => {
      modalElement.classList.remove("show");
    };

    modalInnerElement.onmousedown = (e) => {
      e.stopPropagation();
    };

    countDownTimeElement.onclick = () => {
      action = "set-count-down";
      modalElement.classList.add("show");
      const timeText = this.handleFormatTime(timeCountdown);
      for (let inputElement of listInputElements) {
        inputElement.value = timeText[inputElement.id];
      }
    };

    let countDownIntervalId;
    startBtnElement.onclick = () => {
      handleStopAudio();
      countDownIntervalId = setInterval(() => {
        if (--totalSeconds < 0) {
          clearInterval(countDownIntervalId);
          stopBtnElement.classList.remove("show");
          startAgainBtnElement.classList.add("show");
          audioElement.currentTime = 0;
          handleStartAudio();
        } else {
          countDownTimeElement.innerText = this.convertTimeToText(
            this.convertTotalSecondsToTime(totalSeconds)
          );
        }
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
      totalSeconds = this.convertTimeToTotalSeconds(timeCountdown);
      countDownTimeElement.innerText = this.convertTimeToText(timeCountdown);
      resetBtnElement.classList.remove("show");
    };

    startAgainBtnElement.onclick = () => {
      stopBtnElement.classList.add("show");
      startAgainBtnElement.classList.remove("show");
      totalSeconds = this.convertTimeToTotalSeconds(timeCountdown);
      countDownTimeElement.innerText = this.convertTimeToText(timeCountdown);
      handleStopAudio();
      startBtnElement.dispatchEvent(new Event("click"));
    };

    setTimeBtnElement.onclick = () => {
      time = {};
      for (let inputElement of listInputElements) {
        time[inputElement.id] = Number(inputElement.value);
      }
      console.log("a");
      handleStopAudio();
      switch (action) {
        case "set-count-down":
          timeCountdown = time;
          totalSeconds = this.convertTimeToTotalSeconds(timeCountdown);
          countDownTimeElement.innerText =
            this.convertTimeToText(timeCountdown);
          clearInterval(countDownIntervalId);
          stopBtnElement.classList.remove("show");
          startBtnElement.classList.add("show");
          resetBtnElement.classList.remove("show");
          startAgainBtnElement.classList.remove("show");

          if (totalSeconds <= 0) {
            startBtnElement.disabled = true;
          } else {
            startBtnElement.disabled = false;
          }
          break;
        case "add-alarm":
          this.listAlarms.unshift({
            time,
            state: true,
          });
          this.renderAlarms();
          break;
        case "change-alarm":
          this.listAlarms[indexActiveAlarm].time = time;
          this.renderAlarms();
          break;
      }
      modalElement.classList.remove("show");
      resetBtnElement.classList.remove("show");
    };
    listAudiosElement.onchange = () => {
      audioElement.src = listAudiosElement.value;
      bellElement.classList.remove("animation-shaking");
    };

    bellElement.onclick = () => {
      if (bellElement.classList.contains("animation-shaking")) {
        handleStopAudio();
      } else {
        handleStartAudio();
      }
    };

    const handleStopAudio = () => {
      bellElement.classList.remove("animation-shaking");
      audioElement.pause();
    };
    const handleStartAudio = () => {
      bellElement.classList.add("animation-shaking");
      audioElement.play();
    };
  },
  handleTimeNow() {
    const timeNowElement = $(".time-now");
    setInterval(() => {
      const date = new Date();
      timeNowElement.innerText = date.toTimeString().slice(0, 8);
    }, 1000);
  },

  renderAlarms() {
    let html = "";
    this.listAlarms.forEach((alarm, index) => {
      html += `<div class="alarm" index='${index}'>
      <div class="alarm-left">
       <time>${this.convertTimeToText(alarm.time)}</time>
       <span class="alarm-left-rest-duration"></span>
      </div>
      <button class="button-slide ${alarm.state ? "button-slide-active" : ""}">
        <div class="button-slide-circle"></div>
        <div class="button-slide-bg"></div>
      </button>
    </div>`;
    });

    listAlarmElement.innerHTML = html;

    restDurationElements = $$(".alarm-left-rest-duration");
  },
  convertTotalSecondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 60 / 60);
    const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60);
    const seconds = totalSeconds - (hours * 60 * 60 + minutes * 60);
    return {
      hours,
      minutes,
      seconds,
    };
  },
  convertTimeToTotalSeconds(time) {
    return (time.hours * 60 + time.minutes) * 60 + time.seconds;
  },
  handleFormatTime(time) {
    const hours = String(time.hours).padStart(2, "0");
    const minutes = String(time.minutes).padStart(2, "0");
    const seconds = String(time.seconds).padStart(2, "0");
    return {
      hours,
      minutes,
      seconds,
    };
  },
  convertTimeToText(time) {
    let newTime = this.handleFormatTime(time);
    return `${newTime.hours}:${newTime.minutes}:${newTime.seconds}`;
  },
  start() {
    this.addEventListener();
    this.handleTimeNow();
  },
};

app.start();
