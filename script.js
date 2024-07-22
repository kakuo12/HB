document.addEventListener("DOMContentLoaded", function () {
    const cake = document.querySelector(".cake");
    const candleCountDisplay = document.getElementById("candleCount");
    const placeCandlesMessage = document.getElementById("placeCandlesMessage");
    const blowCandlesMessage = document.getElementById("blowCandlesMessage");
    const birthdayMessage = document.getElementById("birthdayMessage");
    let candles = [];
    let audioContext;
    let analyser;
    let microphone;
    let birthdayAudio = new Audio('hbd.mp3');
    let partyAudio = new Audio('party.mp3');

    function updateCandleCount() {
        const activeCandles = candles.filter(
            (candle) => !candle.classList.contains("out")
        ).length;
        candleCountDisplay.textContent = activeCandles;
    }

    function addCandle(left, top) {
        const candle = document.createElement("div");
        candle.className = "candle";
        candle.style.left = left + "px";
        candle.style.top = top + "px";

        const flame = document.createElement("div");
        flame.className = "flame";
        candle.appendChild(flame);

        cake.appendChild(candle);
        candles.push(candle);
        updateCandleCount();
    }

    cake.addEventListener("click", function (event) {
        const rect = cake.getBoundingClientRect();
        const left = event.clientX - rect.left;
        const top = event.clientY - rect.top;
        addCandle(left, top);
    });

    function isBlowing() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Calcular la media de los datos de frecuencia
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        let average = sum / bufferLength;

        // Ajustar el umbral para evitar interferencia
        return average > 70; // Ajusta este valor si es necesario
    }

    function blowOutCandles() {
        let blownOut = 0;

        if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
            if (isBlowing()) {
                candles.forEach((candle) => {
                    if (!candle.classList.contains("out") && Math.random() > 0.5) {
                        candle.classList.add("out");
                        blownOut++;
                    }
                });
            }

            if (blownOut > 0) {
                updateCandleCount();
            }

            if (candles.every((candle) => candle.classList.contains("out"))) {
                setTimeout(function () {
                    triggerConfetti();
                    endlessConfetti(); // Inicia el confeti continuo
                    partyAudio.play(); // Reproduce el efecto de sonido de fiesta

                    // Mostrar el mensaje de cumpleaños después de un breve retraso
                    setTimeout(function () {
                        birthdayMessage.classList.remove("hidden");
                        birthdayMessage.classList.add("show");
                    }, 500); // Ajusta este tiempo si es necesario
                }, 200);

                // Reproducir la canción de cumpleaños después de apagar las velas
                birthdayAudio.play();
            }
        }
    }

    // Mostrar mensajes iniciales
    setTimeout(function () {
        placeCandlesMessage.classList.remove("hidden");
        placeCandlesMessage.classList.add("show");
        setTimeout(function () {
            placeCandlesMessage.classList.remove("show");
            placeCandlesMessage.classList.add("hidden");
            blowCandlesMessage.classList.remove("hidden");
            blowCandlesMessage.classList.add("show");
        }, 10000); // Mostrar "Sopla las velas" después de 10 segundos
    }, 0);

    // Escuchar el evento de soplo
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                analyser.fftSize = 256;
                setInterval(blowOutCandles, 200);
            })
            .catch(function (err) {
                console.log("Unable to access microphone: " + err);
            });
    } else {
        console.log("getUserMedia not supported on your browser!");
    }
});

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function endlessConfetti() {
    setInterval(function () {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0 }
        });
    }, 1000);
}
