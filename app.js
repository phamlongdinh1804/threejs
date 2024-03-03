let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  100,
  innerWidth / innerHeight,
  1,
  1000
);
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

// scene.add(new THREE.GridHelper(10, 0));

camera.position.set(0, 39.5, 70);

var radius = 1.3; // Thay đổi bán kính cho phù hợp với Spiral
var turns = 1; // Số lượng tầng
var objPerTurn = 15; // Số lượng mỗi tầng

var angleStep = (Math.PI * 2) / objPerTurn;
var heightStep = 6;
const spiralRadius = radius * 10;
function handleCameraZoom(value, duration) {
  const startZoom = camera.zoom;
  const targetZoom = value;
  const startTime = Date.now();

  function animateZoom() {
    const now = Date.now();
    const elapsedTime = now - startTime;
    const t = Math.min(1, elapsedTime / duration); // Đảm bảo t không vượt quá 1
    const zoom = startZoom + (targetZoom - startZoom) * t;

    camera.zoom = zoom;
    camera.updateProjectionMatrix();

    if (t < 1) {
      requestAnimationFrame(animateZoom);
    }
  }

  animateZoom();
}
camera.zoom = 9;
camera.updateProjectionMatrix();
const boxWidth = 5.53;
const boxHeight = boxWidth / (16 / 9);
var geom = new THREE.BoxBufferGeometry(boxWidth, boxHeight, 0.05);
console.log("geom: ", geom);
var imageUrlArray = [];
for (var i = 1; i <= 20; i++) {
  const newUrl = `./img/img_${i}.jpg`;
  imageUrlArray.push(newUrl);
}
const floors = [];
let img_count = 1;
for (var i = 1; i <= 5; i++) {
  const newFloor = {
    floor_id: i,
    items: [],
  };
  for (let j = 1; j <= 15; j++) {
    newFloor.items.push({
      url: `./img/img_${img_count}.jpg`,
    });
    if (img_count == 17) {
      img_count = 1;
    } else {
      img_count++;
    }
  }
  floors.push(newFloor);
}
var turns = Math.ceil(imageUrlArray.length / objPerTurn);
// Load the texture using TextureLoader
var textureLoader = new THREE.TextureLoader();
var items = []; // Danh sách các item đã được tạo

let currentIdTop = 5;
function createNewItemTop() {
  var lastItem = items[items.length - 1];
  const lastPosition = lastItem.position + 1;
  currentIdTop++;
  if (currentIdTop >= 5) {
    currentIdTop = 1;
  }
  for (let i = 0; i < objPerTurn; i++) {
    // Tạo một item mới
    var newItem = new THREE.Mesh(
      geom,
      new THREE.MeshBasicMaterial({
        map: textures[i],
        side: THREE.DoubleSide,
      })
    );

    newItem.name = `floor_id_${currentIdTop}_${i + 1}`;
    newItem.userData.url = "https://onetech.vn";
    newItem.userData.img = `./img/img_${i + 1}.jpg`;

    // Đặt vị trí của item mới tương ứng với vị trí của scene
    newItem.position.copy(lastItem.position);
    let spiralHeight = lastPosition * heightStep;
    newItem.position.set(
      Math.cos(angleStep * i) * spiralRadius,
      spiralHeight,
      Math.sin(angleStep * i) * spiralRadius
    );
    newItem.rotation.y = -angleStep * i + Math.PI / 2;
    // Add Event
    newItem.onClick = function (e) {
      console.log("onMouseUp");
    };
    // Thêm item mới vào scene và danh sách các item
    scene.add(newItem);
  }
  const newItemT = {
    position: lastPosition,
  };

  items.push(newItemT);
}

let currentIdBottom = 1;
function createNewItemBottom() {
  var lastItem = items[0];
  const lastPosition = lastItem.position - 1;
  currentIdBottom--;
  if (currentIdBottom <= 0) {
    currentIdBottom = 5;
  }
  for (let i = 0; i < objPerTurn; i++) {
    // Tạo một item mới
    var newItem = new THREE.Mesh(
      geom,
      new THREE.MeshBasicMaterial({
        map: textures[i],
        side: THREE.DoubleSide,
      })
    );
    newItem.name = `floor_id_${currentIdBottom}_${i + 1}`;
    newItem.userData.url = "https://onetech.vn";
    newItem.userData.img = `./img/img_${i + 1}.jpg`;

    // Đặt vị trí của item mới tương ứng với vị trí của scene
    newItem.position.copy(lastItem.position);
    let spiralHeight = lastPosition * heightStep;
    newItem.position.set(
      Math.cos(angleStep * i) * spiralRadius,
      spiralHeight,
      Math.sin(angleStep * i) * spiralRadius
    );
    newItem.rotation.y = -angleStep * i + Math.PI / 2;
    // Add Event
    newItem.onClick = function (e) {
      console.log("onMouseUp");
    };
    // Thêm item mới vào scene và danh sách các item
    scene.add(newItem);
  }
  const newItemT = {
    position: lastPosition,
  };

  items.unshift(newItemT);
}
var tl = gsap.timeline({
  repeat: -1,
});

let loadedCount = 0;
const totalItemLoad = 15;
const textures = [];
// Tính toán phần trăm loading
function handlePercentage() {
  const percentage = Math.round((loadedCount / totalItemLoad) * 100);
  const ele = document.getElementById("pace-progress");
  ele.setAttribute("data-progress-text", percentage + "%");
  if (percentage >= 100) {
    document.getElementById("pace").style.display = "none";
    document.getElementById("mainwrapper").classList.add("done");
    startRendering();
  }
}
// Tải trước các IMG cần thiết
function loadTexture(index) {
  const url = `./img/img_${index}.jpg`;
  var texture = new THREE.TextureLoader().load(url, function () {
    loadedCount++;
    handlePercentage();
    if (index < totalItemLoad) {
      setTimeout(() => {
        loadTexture(index + 1); // Đệ quy để tải texture tiếp theo
      }, 50);
    }
  });
  textures.push(texture);
}
// Start Tải Từ IMG đầu tiên
loadTexture(1);
// Render danh sách item đầu tiên
function renderItem() {
  floors.forEach((floor, index) => {
    let j = index + 1;
    for (let i = 0; i < objPerTurn; i++) {
      var material = new THREE.MeshBasicMaterial({
        map: textures[i],
        side: THREE.DoubleSide,
      });
      let item = new THREE.Mesh(geom, material);
      item.name = `floor_id_${floor.floor_id}_${i + 1}`;
      item.userData.url = "https://onetech.vn";
      item.userData.img = `./img/img_${i + 1}.jpg`;
      // position
      let spiralHeight = j * heightStep;
      item.position.set(
        Math.cos(angleStep * i) * spiralRadius,
        spiralHeight,
        Math.sin(angleStep * i) * spiralRadius
      );
      // rotation
      item.rotation.y = -angleStep * i + Math.PI / 2;

      const newItem = {
        position: j,
      };
      // Add Event
      item.onClick = function (e) {
        console.log("onMouseUp");
      };

      scene.add(item);
      items.push(newItem);
    }
  });
}

var zoomDuration = 10;
// Hàm zoom vào scene
var initialCameraPosition = camera.position.clone();
function zoomIn() {
  // Thực hiện animation zoom
  gsap.to(camera.position, {
    duration: 1,
    x: 0,
    y: 0,
    z: 50,
    ease: "power2.out",
  });
}
// Hàm reset camera về vị trí ban đầu
function resetCamera() {
  gsap.to(camera.position, {
    duration: 1,
    x: initialCameraPosition.x,
    y: initialCameraPosition.y,
    z: initialCameraPosition.z,
    ease: "power2.out",
  });
}

var autoRotateSpeed = 0.001; // Tốc độ tự xoay
var isAutoRotate = true;
function autoRotate() {
  // Tự xoay scene mỗi frame
  if (isAutoRotate) {
    if (scene.rotation.y + autoRotateSpeed > Math.PI * 2) {
      scene.rotation.y = 0;
    } else {
      scene.rotation.y += autoRotateSpeed;
    }
  }
}

// Hàm render sẽ tự động gọi autoRotate mỗi frame
function render() {
  autoRotate();
  handleScenePositionChange();
  renderer.render(scene, camera);
}
var positionTop = -14;
var positionBottom = 4;
function handleScenePositionChange() {
  if (scene.position.y < positionTop) {
    positionTop -= 13;
    createNewItemTop();
    // removeItemBottom();
  }
  if (scene.position.y > positionBottom) {
    positionBottom += 13;
    createNewItemBottom();
    // removeItemTop();
  }
}
const zoomScale = 2.2;
// Thêm hàm để bắt đầu rendering
function startRendering() {
  renderItem();
  renderer.setAnimationLoop(render);
  gsap.to(scene.scale, {
    duration: 0,
    x: zoomScale,
    y: zoomScale,
    z: zoomScale,
    ease: "power2.out",
  });
  handleCameraZoom(4, 1500);
}

document.addEventListener("click", function (event) {
  // Xác định đối tượng được click
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Lấy danh sách đối tượng gặp ray
  var intersects = raycaster.intersectObjects(scene.children, true);
  // Xử lý sự kiện click trên các đối tượng plane
  if (intersects.length > 0 && intersects[0].object.onClick) {
    // zoomIn();
  }
});

var scrollSpeed = 0.05;

document.addEventListener("wheel", function (event) {
  // event.preventDefault();
  // Thay đổi vị trí của scene dựa trên hướng cuộn chuột
  var deltaY = event.deltaY * scrollSpeed;
  gsap.to(scene.position, {
    duration: 1,
    y: `+=${deltaY * 1}`,
    ease: "power2.out",
  });
  // // Làm cho scene di chuyển theo chiều ngược lại khi đạt đến giới hạn trên hoặc dưới
  // if (scene.position.y > positionBottom) {
  //   positionBottom += 13;
  //   createNewItemBottom();
  //   // removeItemTop();
  // }
  // if (scene.position.y < positionTop) {
  //   positionTop -= 13;
  //   createNewItemTop();
  //   // removeItemBottom();
  // }
});

var isDragging = false;
var previousMousePosition = {
  x: 0,
  y: 0,
};
const itemMouseUp = {
  name: "",
  object: "",
};
const itemMouseDown = {
  name: "",
  object: "",
};
document.addEventListener("mousedown", function (event) {
  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY,
  };
  // Xác định đối tượng được click
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Lấy danh sách đối tượng gặp ray
  var intersects = raycaster.intersectObjects(scene.children, true);
  // Xử lý sự kiện click trên các đối tượng plane
  if (intersects.length > 0 && intersects[0].object.onClick) {
    itemMouseDown.name = intersects[0].object.name;
    itemMouseDown.object = intersects[0].object;
  }
});

document.addEventListener("mouseup", function (event) {
  isDragging = false;
  // Xác định đối tượng được click
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Lấy danh sách đối tượng gặp ray
  var intersects = raycaster.intersectObjects(scene.children, true);
  // Xử lý sự kiện click trên các đối tượng plane
  if (intersects.length > 0 && intersects[0].object.onClick) {
    itemMouseUp.name = intersects[0].object.name;
    itemMouseUp.object = intersects[0].object;
    if (itemMouseUp.name == itemMouseDown.name) {
      handleClickObject();
    }
  }
});
var initialScale;
function handleClickObject() {
  if (isShowPopup) {
    return;
  }
  const object = itemMouseUp.object;
  if (!initialScale) {
    initialScale = object.scale.clone(); // Lưu trữ trạng thái ban đầu của plane
  }

  // Calculate the target rotation for the scene
  const targetRotation = {
    x: object.rotation.x,
    y: -object.rotation.y, // Invert rotation to match plane's rotation
    z: 0,
  };
  console.log(object);
  const step = 13.2;
  const spiralHeight = object.position.y;
  const currentTurn = spiralHeight / 6 - 3;
  const targetYPosition = -currentTurn * step;
  // // Animate scene rotation to target rotation
  gsap.to(scene.rotation, {
    duration: 1,
    y: targetRotation.y,
    x: targetRotation.x,
    ease: "power2.out",
  });
  // Calculate the target y position for the scene
  gsap.to(scene.position, {
    duration: 1,
    y: targetYPosition,
    ease: "power2.out",
  });
  isAutoRotate = false;
  handleCameraZoom(9, 500);
  setTimeout(() => {
    handleShowPopup(object.userData);
  }, 200);
}
document.addEventListener("mousemove", function (event) {
  if (isDragging) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 5) {
      gsap.to(scene.rotation, {
        duration: 2,
        y: `+=${deltaX * 0.08}`,
        ease: "power2.out",
      });
      gsap.to(scene.position, {
        duration: 2,
        y: `-=${deltaY * 0.5}`,
        ease: "power2.out",
      });
      itemMouseDown.name = "";
    }

    previousMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }
});
let floorTopId = 5;
let floorBottomId = 1;
function removeItemBottom() {
  for (var i = 1; i <= 15; i++) {
    const id = `floor_id_${currentIdBottom}_${i}`;
    const planeToRemove = scene.getObjectByName(id);
    if (planeToRemove) {
      scene.remove(planeToRemove);
    }
  }
  currentIdBottom++;
  if (currentIdBottom >= 6) {
    currentIdBottom = 1;
  }
}
function removeItemTop() {
  for (var i = 1; i <= 15; i++) {
    const id = `floor_id_${currentIdTop}_${i}`;
    const planeToRemove = scene.getObjectByName(id);
    if (planeToRemove) {
      scene.remove(planeToRemove);
    }
  }
  currentIdTop--;
  if (currentIdTop <= 0) {
    currentIdTop = 5;
  }
}
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  const zoomValue = (window.innerWidth / 1680) * 4;
  camera.zoom = zoomValue;
  camera.updateProjectionMatrix();
  innerWidth = window.innerWidth;
  innerHeight = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}
// onWindowResize();
var isShowPopup = false;
function handleShowPopup(data) {
  isShowPopup = true;
  const popupEle = document.getElementById("popup-video");
  popupEle.classList.add("show");
  setTimeout(() => {
    var imgEle = document.getElementById("imgItem");
    imgEle.setAttribute("src", data.img);
    imgEle.classList.add("show");
  }, 600);
}
var button = document.getElementById("btn-close");
button.addEventListener("click", handleClose);
function handleClose() {
  isShowPopup = false;
  const popupEle = document.getElementById("popup-video");
  popupEle.classList.remove("show");
  var imgEle = document.getElementById("imgItem");
  imgEle.setAttribute("src", "");
  imgEle.classList.remove("show");
  isAutoRotate = true;
  handleCameraZoom(4, 500);
}
