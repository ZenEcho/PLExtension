document.addEventListener('DOMContentLoaded', function () {
    let gameMap = document.getElementById("gameMap");

    let platformss = [
        { left: "0px", width: "100px", height: "100px", bottom: "0px", class: "platform" }, //初始跳台
        { left: "100px", width: "50px", height: "10px", bottom: "145px", class: "platform" },
        { left: "150px", width: "100px", height: "10px", bottom: "200px", class: "platform" },
        { left: "200px", width: "10px", height: "10px", bottom: "200px", class: "platform" },
        { left: "350px", width: "50px", height: "10px", bottom: "200px", class: "platform" },
        { left: "450px", width: "50px", height: "10px", bottom: "200px", class: "platform" },
        { left: "550px", width: "200px", height: "250px", bottom: "0", class: "platform " }, //二阶跳台
        { left: "600px", width: "30px", height: "20px", bottom: "260px", class: "diamond" },
    ];

    for (let p of platformss) {
        let platform = new gamePlatform(p);
        gameMap.appendChild(platform.create());
    }

    let isGameStarted = false; // 游戏是否已开始

    const player = document.getElementById('player');
    const platforms = document.querySelectorAll('.platform');
    let playerHealth = 100; // 玩家的健康值
    let score = 0; // 玩家的分数
    let isJumping = false; // 标记玩家是否正在跳跃
    let isFalling = false; // 标记玩家是否正在下落
    let keys = { left: false, right: false, up: false }; // 记录按键状态
    let gravity = 1; // 重力值
    let jumpSpeed = 10; // 跳跃初始速度
    let fallSpeed = 0; // 下落速度

    // 更新玩家位置的函数
    function updatePlayerPosition() {
        const playerSpeed = 5;
        if (keys.left && !willCollideWithPlatform(player, platforms, -playerSpeed)) {
            player.style.left = Math.max(0, player.offsetLeft - playerSpeed) + 'px';
        }

        if (keys.right && !willCollideWithPlatform(player, platforms, playerSpeed)) {
            player.style.left = Math.min(window.innerWidth - player.offsetWidth, player.offsetLeft + playerSpeed) + 'px';
        }

        let onPlatform = isOnPlatform(player, platforms);
        if (keys.up && !isJumping && onPlatform) {
            startJumping();
        }

    }

    // 开始跳跃的函数
    function startJumping() {
        isJumping = true;
        let currentJumpSpeed = jumpSpeed;

        let upInterval = setInterval(() => {
            if (!willCollideWithPlatform(player, platforms, 0, -currentJumpSpeed)) {
                player.style.top = Math.max(0, player.offsetTop - currentJumpSpeed) + 'px';
                currentJumpSpeed -= gravity;
            } else {
                clearInterval(upInterval);
                isJumping = false;
                startFalling();
            }

            if (currentJumpSpeed <= 0) {
                clearInterval(upInterval);
                isJumping = false;
                startFalling();
            }
        }, 20);
    }

    // 开始下落的函数
    function startFalling() {
        isFalling = true;
        fallSpeed = 0;

        let fallInterval = setInterval(() => {
            if (!isFalling) {
                clearInterval(fallInterval);
                return;
            }

            let platform = isOnPlatform(player, platforms);
            if (!platform) {
                fallSpeed += gravity;
                let newTop = Math.min(window.innerHeight - player.offsetHeight, player.offsetTop + fallSpeed);

                if (newTop >= window.innerHeight - player.offsetHeight) {
                    // 玩家到达底部，触发游戏结束
                    clearInterval(fallInterval);
                    gameOver();


                }

                player.style.top = newTop + 'px';
            } else {
                clearInterval(fallInterval);
                isFalling = false;
                player.style.top = platform.offsetTop - player.offsetHeight + 'px';
            }
        }, 20);
    }
    // 玩家是否站在平台上的函数
    function isOnPlatform(player, platforms) {
        for (let i = 0; i < platforms.length; i++) {
            let p = platforms[i];
            let horizontalMatch = player.offsetLeft < p.offsetLeft + p.offsetWidth && player.offsetLeft + player.offsetWidth > p.offsetLeft;
            let verticalMatch = player.offsetTop + player.offsetHeight >= p.offsetTop && player.offsetTop + player.offsetHeight <= p.offsetTop + p.offsetHeight + gravity;

            if (horizontalMatch && verticalMatch) {
                return p;
            }
        }
        return null;
    }

    // 检测玩家是否会与平台碰撞的函数
    function willCollideWithPlatform(player, platforms, dx) {
        let newLeft = player.offsetLeft + dx;

        for (let i = 0; i < platforms.length; i++) {
            let p = platforms[i];
            let horizontalCollision = newLeft + player.offsetWidth > p.offsetLeft && newLeft < p.offsetLeft + p.offsetWidth;
            let verticalCollision = player.offsetTop + player.offsetHeight > p.offsetTop && player.offsetTop < p.offsetTop + p.offsetHeight;

            if (horizontalCollision && verticalCollision) {
                return true;
            }
        }

        return false;
    }
    function checkDistanceToRightEdge() {
        const distanceToRightEdge = window.innerWidth - (player.offsetLeft + player.offsetWidth);
        if (distanceToRightEdge < 150) {
            console.log("角色距离右边缘小于100px");
            window.postMessage({ type: 'Detect_installation_status', data: "" }, "*");
        }
    }
    let checkDiamond = false;
    function checkCollisionWithDiamonds() {

        const diamonds = document.querySelectorAll('.diamond');
        if (diamonds.length === 0 ) {
            // 所有钻石都被收集了，可以停止检查碰撞
            return;
        }

        diamonds.forEach(diamond => {
            if (isColliding(player, diamond)) {
                // diamond.remove();
                createMessageBox(`
                <p>哇！恭喜你捡到了一个宝石，现在我们将宝石到背包里吧！</p>
                <h3>按住鼠标左键拖拽宝石，到右边的盘络扩展里吧</h3>
                <p>按下'Space(空格)'关闭提示</p>
                `, function () {
                    checkDiamond = true
                    document.getElementById("messageBox").remove()
                })


            }
        });

    }

    function isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        return !(rect2.left > rect1.right ||
            rect2.right < rect1.left ||
            rect2.top > rect1.bottom ||
            rect2.bottom < rect1.top);
    }
    function createMessageBox(html, callback) {
        if (!document.getElementById("messageBox")) {
            let box = document.createElement('div');
            box.id = "messageBox";
            box.tabIndex = 0;  // 使div可以获得键盘焦点
            box.innerHTML = html || `<p style="font-size: 20px;font-weight: bold;">按下'Space(空格)'开始游戏！</p>
                                     <p style="font-size: 16px;">控制：'←(左)'、'→(右)'、'↑(上)'</p>`;
            document.body.appendChild(box);

            // 设置焦点到该元素
            box.focus();

            // 使用addEventListener而不是onkeydown
            box.addEventListener('keydown', function (e) {
                if (e.keyCode === 32) { // 检查空格键
                    if (typeof callback === "function") {
                        callback(); // 调用回调函数
                    }
                }
            });
        }
    }

    createMessageBox()
    // 按键事件监听
    document.addEventListener('keydown', function (event) {
        if (event.key == "a" || event.key == "ArrowLeft") { keys.left = true };
        if (event.key == "d" || event.key == "ArrowRight") { keys.right = true };
        if (event.key == "w" || event.key == "ArrowUp") { keys.up = true };
        if (event.code == "Space" && !isGameStarted) {
            startGame();
        };
    });

    document.addEventListener('keyup', function (event) {
        if (event.key == "a" || event.key == "ArrowLeft") { keys.left = false };
        if (event.key == "d" || event.key == "ArrowRight") { keys.right = false };
        if (event.key == "w" || event.key == "ArrowUp") { keys.up = false };
    });

    // 游戏开始的函数
    function startGame() {
        isGameStarted = true;
        player.style.top = 0
        player.style.left = 0
        gameLoop()
        document.getElementById("messageBox").remove()
    }

    // 游戏结束的函数
    function gameOver() {
        console.log("游戏结束！");
        createMessageBox()
        isGameStarted = false; // 游戏是否已开始
        playerHealth = 100; // 玩家的健康值
        score = 0; // 玩家的分数
        isJumping = false; // 标记玩家是否正在跳跃
        isFalling = false; // 标记玩家是否正在下落
        keys = { left: false, right: false, up: false }; // 记录按键状态
        gravity = 1; // 重力值
        jumpSpeed = 10; // 跳跃初始速度
        fallSpeed = 0; // 下落速度
        return;
    }

    // 主游戏循环
    function gameLoop() {
        let main = setInterval(() => {
            if (!isGameStarted) {
                clearInterval(main);
                return; // 如果游戏未开始，不执行游戏循环中的代码
            }
            updatePlayerPosition();
            // 检查角色是否接近右边缘
            checkDistanceToRightEdge();
            checkCollisionWithDiamonds()
            // 检查并应用重力
            if (!isOnPlatform(player, platforms) && !isJumping && !isFalling) {
                startFalling();
            }
        }, 20);

    }
});


