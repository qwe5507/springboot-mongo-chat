let username = prompt("아이디를 입력하세요");
let roomNum = prompt("채팅방 번호를 입력하세요");

document.querySelector("#username").innerHTML = username;

// SSE연결하기
const eventSource = new EventSource(`http://localhost:8080/chat/roomNum/${roomNum}`);
eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.sender === username) { // 로그인한 유저가 보낸 메시지
        //파란 박스(오른쪽)
        initMyMessage(data);
    } else {
        //회색 박스(왼쪽)
        initYourMessage(data);
    }
}

// 파란박스 만들기
function getSendMsgBox(data) {
    let md = data.createAt.substring(5,10);
    let tm = data.createAt.substring(11,16);
    let convertTime = tm + " | " + md;

    return `<div class="sent_msg">
                <p>${data.msg}</p>
                <span class="time_date"> ${convertTime} /  ${data.sender}</span>
            </div>`;
}
// 회색박스 만들기
function getReceiveMsgBox(data) {
    let md = data.createAt.substring(5,10);
    let tm = data.createAt.substring(11,16);
    let convertTime = tm + " | " + md;

    return `<div class="received_withd_msg">
                <p>${data.msg}</p>
                <span class="time_date"> ${convertTime} /  ${data.sender}</span>
            </div>`;
}

// 최초 초기화 될때 1번방 3건이 있으면 3건을 다 가져온다.
// addMessage() 함수 호출시 DB에 INSERT되고, 그 데이터가 자동으로 흘러들어온다(SSE프로토콜)
// eventSource.onmessage의 로직이 그때마다 실행된다.
// - 이 안에 initMyMessage()가 실행되서 chatBox에 append하기떄문에 addMessage() 함수에서 채팅을 append할필요가 없음.
// 파란박스 초기화 하기
function initMyMessage(data) {
    let chatBox = document.querySelector("#chat-box");

    let sendBox = document.createElement("div");
    sendBox.className = "outgoing_msg";

    sendBox.innerHTML = getSendMsgBox(data);
    chatBox.append(sendBox);

    document.documentElement.scrollTop = document.body.scrollHeight;
}
// 회색박스 초기화 하기
function initYourMessage(data) {
    let chatBox = document.querySelector("#chat-box");

    let receivedBox = document.createElement("div");
    receivedBox.className = "received_msg";

    receivedBox.innerHTML = getReceiveMsgBox(data);
    chatBox.append(receivedBox);

    document.documentElement.scrollTop = document.body.scrollHeight;
}

async function addMessage() {
    let msgInput = document.querySelector("#chat-outgoing-msg");

    let chat = {
        sender: username,
        roomNum: roomNum,
        msg: msgInput.value
    };

    fetch("http://localhost:8080/chat", {
        method: "post", //http post 메서드(새로운 데이터를 write)
        body: JSON.stringify(chat), //JS object -> JSON
        headers: {
            "Content-Type":"application/json; charset=utf-8"
        }
    }).then(() => {
        msgInput.value = "";
    })
}

// 버튼 클릭시 메시지 전송
document.querySelector("#chat-outgoing-button").addEventListener("click", () => {
    addMessage();
});

// 엔터를 치면 메시지 전송
document.querySelector("#chat-outgoing-msg").addEventListener("keydown", (e) => {
    if (e.keyCode === 13) {
        addMessage();
    }
});