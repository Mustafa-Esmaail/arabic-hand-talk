let progressSpans = document.querySelectorAll(".the-progress span");
let section = document.querySelector(".our-skills");

let nums = document.querySelectorAll(".stats .number");
let statsSection = document.querySelector(".stats");
let started = false; // Function Started ? No

window.onscroll = function () {
  // Skills Animate Width
  if (window.scrollY >= section.offsetTop - 250) {
    progressSpans.forEach((span) => {
      span.style.width = span.dataset.width;
    });
  }
  // Stats Increase Number
  if (window.scrollY >= statsSection.offsetTop) {
    if (!started) {
      nums.forEach((num) => startCount(num));
    }
    started = true;
  }
};

function startCount(el) {
  let goal = el.dataset.goal;
  let count = setInterval(() => {
    el.textContent++;
    if (el.textContent == goal) {
      clearInterval(count);
    }
  }, 500 / goal);
}

// select model
let selectedModel = 0;
document
  .querySelectorAll('input[name="switch-model"]')[0]
  .addEventListener("change", () => {
    selectedModel = 0
    console.log(
      document.querySelector('input[name="switch-model"]:checked').value
    );
  });
document
  .querySelectorAll('input[name="switch-model"]')[1]
  .addEventListener("change", () => {
    selectedModel = 1
    console.log(
      document.querySelector('input[name="switch-model"]:checked').value
    );
  });
document
  .querySelectorAll('input[name="switch-model"]')[2]
  .addEventListener("change", () => {
    selectedModel = 2
    console.log(
      document.querySelector('input[name="switch-model"]:checked').value
    );
  });
import {
  PoseLandmarker,
  FilesetResolver,
  HandLandmarker,
  DrawingUtils
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

// import {
//   HandLandmarker,
//   FilesetResolver,
// } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.1.0-alpha-11";
const LetterList = [
  "ع",
  "ال",
  "ا",
  "ب",
  "د",
  "ظ",
  "ض",
  "ف",
  "ق",
  "غ",
  "ه",
  "ح",
  "ج",
  "ك",
  "خ",
  "لا",
  "ل",
  "م",
  "nothing",
  "ن",
  "ر",
  "ص",
  "س",
  "ش",
  "ت",
  "ط",
  "ث",
  "ذ",
  "ة",
  "و",
  "ي",
  "ئ",
  "ز",
];
const NumList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const poseList = ["ما اسمك", "اين منزلك", "السلام عليكم", "تمام الحمدلله", "عامل ايه", 'انا تعبان', " محتاج مساعدة ؟", "عندك كم سنة", "رقم تليفونك", "انا من مصر"]
let classesNames = [];
let spans = document.getElementsByClassName("img-result");
console.log(spans);
let cam = document.getElementsByClassName("cam-result");
let word = "";
let poseLandmarker = undefined;
let handLandmarker = undefined;
let handModel = undefined;
let NumhandModel = undefined;
// let poseModel = undefined;
let prediction = undefined;
let Camletter = [];
let Imgletter = [];
let runningMode = "IMAGE";
let enableWebcamButton;
let Space = false;
let webcamRunning = false;

const videoHeight = 360;
const videoWidth = 480;
// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const poseModel = await tf.loadLayersModel(
  "https://raw.githubusercontent.com/Mustafa-Esmaail/arabic-sign-language/sign-lang-model-v1/tfjs_model/Lmodel.json"
);
const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://fastly.jsdelivr.net/npm/@mediapipe/tasks-vision@0.1.0-alpha-11/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task`,
    },
    runningMode: runningMode,
    numHands: 2,
  });

  handModel = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/Mustafa-Esmaail/arabic-sign-language/sign-lang-model-v1/model.json"
  );
  NumhandModel = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/Mustafa-Esmaail/arabic-sign-language/sign-lang-model-v1/tfjs_num/model.json"
  );

};
createHandLandmarker();
const createPoseLandmarker = async () => {
  const visionPose = await FilesetResolver.forVisionTasks(
    "https://fastly.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(visionPose, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task`,
    },
    runningMode: runningMode,
  });
};
createPoseLandmarker();

/********************************************************************
// Demo 1: Grab a bunch of images from the page and detection them
// upon click.
********************************************************************/
// In this demo, we have put all our clickable images in divs with the
// CSS class 'detectionOnClick'. Lets get all the elements that have
// this class.
const imageContainers = document.getElementsByClassName("detectOnClick");
// Now let's go through all of these and add a click event listener.
for (let i = 0; i < imageContainers.length; i++) {
  // Add event listener to the child element whichis the img element.
  imageContainers[i].children[0].addEventListener("click", handleClick);
}
// When an image is clicked, let's detect it and display results!
async function handleClick(event) {
  if (event.target.id > 4) {
    console.log(event.target.id)
    if (!poseLandmarker) {
      console.log("Wait for poseLandmarker to load before clicking!");
      return;
    }

    if (runningMode === "VIDEO") {
      runningMode = "IMAGE";
      await poseLandmarker.setOptions({ runningMode: "IMAGE" });
    }
    // Remove all landmarks drawed before
    const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
    for (var i = allCanvas.length - 1; i >= 0; i--) {
      const n = allCanvas[i];
      n.parentNode.removeChild(n);
    }

    // We can call poseLandmarker.detect as many times as we like with
    // different image data each time. The result is returned in a callback.
    poseLandmarker.detect(event.target, (result) => {
      console.log(result.landmarks)
      const canvas = document.createElement("canvas");
      canvas.setAttribute("class", "canvas");
      canvas.setAttribute("width", event.target.naturalWidth + "px");
      canvas.setAttribute("height", event.target.naturalHeight + "px");
      canvas.style =
        "left: 0px;" +
        "top: 0px;" +
        "width: " +
        event.target.width +
        "px;" +
        "height: " +
        event.target.height +
        "px;";
      event.target.parentNode.appendChild(canvas);
      const cxt = canvas.getContext("2d");
      const drawingUtils = new DrawingUtils(cxt);
      for (const landmark of result.landmarks) {

        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      }
    });
  }
  else {
    if (!handLandmarker) {
      console.log("Wait for handLandmarker to load before clicking!");
      return;
    }
    if (runningMode === "VIDEO") {
      runningMode = "IMAGE";
      await handLandmarker.setOptions({ runningMode: "IMAGE" });
    }
    // Remove all landmarks drawed before
    const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
    for (var i = allCanvas.length - 1; i >= 0; i--) {
      const n = allCanvas[i];
      n.parentNode.removeChild(n);
    }
    const handLandmarkerResult = handLandmarker.detect(event.target);
    console.log(handLandmarkerResult)
    // console.log(event.target.naturalHeight);
    // console.log(handLandmarkerResult)
    handLandmarkerResult.landmarks.map((landmarks) => {
      let landmark_point = [];
      landmarks.map((landmark) => {
        const landmark_x = Math.min(
          Number(landmark.x * event.target.naturalWidth),
          event.target.naturalWidth - 1
        );
        const landmark_y = Math.min(
          Number(landmark.y * event.target.naturalHeight),
          event.target.naturalHeight - 1
        );
        landmark_point.push([landmark_x, landmark_y]);
      });

      var base_x = 0;
      var base_y = 0;
      let marks = [];

      landmark_point.map((point, index) => {
        if (index === 0) {
          base_x = landmark_point[index][0];
          base_y = landmark_point[index][1];
        }
        landmark_point[index][0] = landmark_point[index][0] - base_x;
        landmark_point[index][1] = landmark_point[index][1] - base_y;
        marks.push(landmark_point[index][0]);
        marks.push(landmark_point[index][1]);
      });
      let max_value = Math.max.apply(null, marks.map(Math.abs));
      marks.map((point, idx) => {
        marks[idx] = marks[idx] / max_value;
      });

      let tfMark = tf.tensor(marks).reshape([1, 42]);
      if (event.target.id <= 2) {
        prediction = handModel.predict(tfMark);
        classesNames = LetterList;
        const handResult = prediction.dataSync();
        const arr = Array.from(handResult);
        const maxPredict = Math.max.apply(null, arr);
        const idx = arr.indexOf(maxPredict);
        console.log(event.target.id);
        spans[event.target.id - 1].innerHTML = classesNames[idx];
      }
      else if (event.target.id <= 4 && event.target.id > 2) {
        prediction = NumhandModel.predict(tfMark);
        classesNames = NumList;
        const handResult = prediction.dataSync();
        const arr = Array.from(handResult);
        const maxPredict = Math.max.apply(null, arr);
        const idx = arr.indexOf(maxPredict);
        console.log(event.target.id);
        spans[event.target.id - 1].innerHTML = classesNames[idx];
        console.log(classesNames[idx])
        console.log(classesNames)
      }


    });
    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style =
      "left: 0px;" +
      "top: 0px;" +
      "width: " +
      event.target.width +
      "px;" +
      "height: " +
      event.target.height +
      "px;";
    event.target.parentNode.appendChild(canvas);
    const cxt = canvas.getContext("2d");
    for (const landmarks of handLandmarkerResult.landmarks) {
      drawConnectors(cxt, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(cxt, landmarks, { color: "#FF0000", lineWidth: 1 });
    }
  }







}
/********************************************************************
// Demo 2: Continuously grab image from webcam stream and detect it.
********************************************************************/
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
// Check if webcam access is supported.
const hasGetUserMedia = () => {
  var _a;
  return !!((_a = navigator.mediaDevices) === null || _a === void 0
    ? void 0
    : _a.getUserMedia);
};
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
async function enableCam(event) {
  if (!handLandmarker) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    // let addSpace = document.getElementById("addSpace");
    // cam.innerHTML=Camletter.join('')
  } else {
    webcamRunning = true;
    if (runningMode === "IMAGE") {
      runningMode = "VIDEO";
      await handLandmarker.setOptions({ runningMode: "VIDEO" });
      await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    enableWebcamButton.innerText = "DISABLE PREDICITONS";
  }
  // getUsermedia parameters.
  const constraints = {
    video: true,
  };
  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

// function extract_keypoints(pose_landmarker,hand_landmarker){
//   let keypoints=[]
//   pose_landmarker.map((res)=>{
//     if()
//     let pose = nj.array([[res.x, res.y, res.z, res.visibility]]).flatten();

//   })

// }

let lastVideoTime = -1;
let sequence = []
async function predictWebcam() {
  canvasElement.style.height = `${videoHeight}px`;
  video.style.height = `${videoHeight}px`;
  canvasElement.style.width = `${videoWidth}px`;
  video.style.width = `${videoWidth}px`;
  // Now let's start detecting the stream.

  let startTimeMs = performance.now();
  const results = handLandmarker.detectForVideo(video, startTimeMs);


  if (selectedModel == 2) {
    if (results.handednesses.length > 0) {


      let keypoints = []

      let sentence = []
      canvasElement.style.height = videoHeight;
      video.style.height = videoHeight;
      canvasElement.style.width = videoWidth;
      video.style.width = videoWidth;

      // Now let's start detecting the stream.
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          const drawingUtils = new DrawingUtils(canvasCtx);

          for (const landmark of result.landmarks) {
            drawingUtils.drawLandmarks(landmark);
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
          }
          canvasCtx.restore();
        });

        if (results.landmarks) {
          for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 5,
            });
            drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
          }
        }
        let pose = [];
        let hands = [];
        poseLandmarker.result.landmarks.map((poseLandmark) => {
          console.log(poseLandmark)
          poseLandmark.map((point) => {
            pose.push(point.x)
            pose.push(point.y)
            pose.push(point.z)
            // pose.push(0)
          })
        })
        console.log(results.handednesses.length)
        if (results.handednesses.length > 1) {
          results.landmarks.map((landmarks) => {

            // const array = new Array(5).fill(0);

            landmarks.map((point) => {
              hands.push(point.x)
              hands.push(point.y)
              hands.push(point.z)
            })
          })
        }
        else {
          if (results.handednesses[0][0].categoryName == 'Left') {
            // console.log(results.results.handednesses.categoryName )

            results.landmarks.map((landmarks) => {

              const array = new Array(21 * 3).fill(0);
              console.log(array)

              landmarks.map((point) => {
                hands.push(point.x)
                hands.push(point.y)
                hands.push(point.z)
              })
              hands = hands.concat(array)
            })
          }
          else {
            results.landmarks.map((landmarks) => {

              const array = new Array(21 * 3).fill(0);
              console.log(array)
              hands = hands.concat(array)
              landmarks.map((point) => {
                hands.push(point.x)
                hands.push(point.y)
                hands.push(point.z)
              })

            })
          }
        }
        keypoints = pose.concat(hands)
        console.log(keypoints.length)
        sequence.push(keypoints)
        console.log(sequence)
        // console.log(pose.length)
        if (sequence.length == 40) {
          let tfpose = tf.tensor(sequence);
          tfpose = tfpose.expandDims(0)
          // let tfMark = tf.tensor(marks).reshape([1, 42]);
          const pred = poseModel.predict(tfpose);
          const PoseResult = pred.dataSync();
          const arr = Array.from(PoseResult);
          const maxPredict = Math.max.apply(null, arr);
          const idx = arr.indexOf(maxPredict);
          console.log(maxPredict)
          console.log(idx)
          Camletter.push(poseList[idx]);
          console.log(pred)
          console.log(poseList[idx])
          sequence = []
        }

        // console.log(hands)


      }
    }
  }
  else {



    results.landmarks.map((landmarks) => {
      let landmark_point = [];

      landmarks.map((landmark) => {
        const landmark_x = Math.min(
          Number(landmark.x * videoWidth),
          videoWidth - 1
        );
        const landmark_y = Math.min(
          Number(landmark.y * videoHeight),
          videoHeight - 1
        );
        landmark_point.push([landmark_x, landmark_y]);
      });

      var base_x = 0;
      var base_y = 0;
      let marks = [];

      landmark_point.map((point, index) => {
        if (index === 0) {
          base_x = landmark_point[index][0];

          base_y = landmark_point[index][1];
        }
        landmark_point[index][0] = landmark_point[index][0] - base_x;
        landmark_point[index][1] = landmark_point[index][1] - base_y;
        marks.push(landmark_point[index][0]);
        marks.push(landmark_point[index][1]);
      });

      let max_value = Math.max.apply(null, marks.map(Math.abs));

      marks.map((point, idx) => {
        marks[idx] = marks[idx] / max_value;
      });

      let tfMark = tf.tensor(marks).reshape([1, 42]);
      if (selectedModel == 0) {
        prediction = handModel.predict(tfMark);
        classesNames = LetterList;
      }
      else if (selectedModel == 1) {
        prediction = NumhandModel.predict(tfMark);
        classesNames = NumList;
      }

      const handResult = prediction.dataSync();
      const arr = Array.from(handResult);
      const maxPredict = Math.max.apply(null, arr);
      const idx = arr.indexOf(maxPredict);
      console.log(classesNames[0])
      Camletter.push(classesNames[idx]);
    });

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
  }

  canvasCtx.restore();
  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    word = Camletter.join("");
    console.log(Camletter);
    let addSpace = document.getElementById("addSpace");
    addSpace.addEventListener("click", () => {
      Camletter.push(" ");
    });
    let delChar = document.getElementById("delChar");
    delChar.addEventListener("click", () => {
      Camletter[Camletter.length - 1] = "";
    });
    let delAll = document.getElementById("delAll");
    delAll.addEventListener("click", () => {
      Camletter.splice(0, Camletter.length);
    });
    console.log(Camletter);

    document.querySelector(".cam-result").innerHTML = word;

    if (selectedModel == 2) {
      setTimeout(() => {
        console.log(selectedModel)
        predictWebcam()
      }, 1);
    }
    else {
      setTimeout(() => {
        console.log(selectedModel)
        predictWebcam()
      }, 1000);
    }

  }
}
// https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task