let inputBox = document.getElementById("inputBox");
let chatBox = document.getElementById("chatBox");
let username = document.getElementById("userNameBox");
window.username = username.value;
let colorBox = document.getElementById("colorBox");
window.usercolor = colorBox.value;
let encKey = document.getElementById("encKey");
window.encKey = encKey.value;
let connectButton = document.getElementById("connector");
connectButton.disabled = true;

inputBox.focus();

function stringToInt(data){
    var intArray = new Array();
    for(var i of data){
		if(i !== " "){
			intArray.push(i.charCodeAt() - 97);
		} else {
			intArray.push(" ");
		}
	};
    return intArray;
}

function intToString(data){
    for(var i in data){
		if(data[i] !== " "){
			data[i] += 97;
			data[i] = String.fromCharCode(data[i]);
		}
    };
    return data.join("");
}

function updateScroll(){
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sizeElements(){
  inputBox.style.width = window.innerWidth/1.6 + "px";
  inputBox.style.marginRight = window.innerWidth/32 + "px";
  inputBox.style.marginTop = window.innerHeight/48 + "px";
  inputBox.style.height = window.innerHeight/20 + "px";

  chatBox.style.width = window.innerWidth/1.05 + "px";
  chatBox.style.height = window.innerHeight/1.3 + "px";
  chatBox.style.padding = window.innerHeight/64 + "px";

  username.style.width = window.innerWidth/20 + "px";
  username.style.height = window.innerHeight/60 + "px";
  username.style.marginTop = window.innerHeight/48 + "px";
  
  colorBox.style.width = username.style.width;
  colorBox.style.height = username.style.height;
  
  encKey.style.width = window.innerWidth/8 + "px";
  encKey.style.height = window.innerHeight/20 + "px";
  
  connectButton.style.width = window.innerWidth/20 + "px";
  connectButton.style.height = window.innerHeight/16 + "px";
  connectButton.style.marginTop = window.innerHeight/48 + "px";

};sizeElements();

window.addEventListener("resize", sizeElements);

var unreadMessages = 0;
var userNotFocused = false;
window.addEventListener("blur", e => {
  userNotFocused = true;
});

var warcry_header = `<pre class="user"><b>██╗    ██╗ █████╗ ██████╗  ██████╗██████╗ ██╗   ██╗
██║    ██║██╔══██╗██╔══██╗██╔════╝██╔══██╗╚██╗ ██╔╝
██║ █╗ ██║███████║██████╔╝██║     ██████╔╝ ╚████╔╝ 
██║███╗██║██╔══██║██╔══██╗██║     ██╔══██╗  ╚██╔╝  -- v1.0.0
╚███╔███╔╝██║  ██║██║  ██║╚██████╗██║  ██║   ██║   -- created by exnihilo [2022]
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   -- (Insecure Build)<br></b>  --> greetz to: j, m, n <--</pre>`
document.getElementById("chatBox").innerHTML = warcry_header;


window.addEventListener("focus", e => {
  userNotFocused = false;
  unreadMessages = 0;
  document.getElementsByTagName("title")[0].innerText = 'WaRCry v1.0.0';
})

function connect(){
  window.ircsocket = new WebSocket("wss://fire-tulip-building.glitch.me/");
  
  window.ircsocket.onopen = function(e){
    console.log("socket open");
    window.ircsocket.send(JSON.stringify({username: username.value, color: colorBox.value, init: true}));
  }

  window.ircsocket.onmessage = function(e){
    if(userNotFocused){
      unreadMessages++;
      document.getElementsByTagName("title")[0].innerText = 'WaRCry v1.0.0 ' + "(" + unreadMessages + ")";
    }
    e.data.text().then(e=>e.toString()).then(async res => {
      
      //search for ": " and then decrypt until "<".
      if(!res.includes("Connected") && !res.includes("User joined")){
        //var ciphertext = 
        console.log(res.substring(res.lastIndexOf(":") + 2, res.lastIndexOf("<")));
      }
      
      // DO THE DECRYPTION HERE
      
      chatBox.innerHTML += res;
      updateScroll();
    });
  }

  window.ircsocket.onclose = function(e){
    console.log("socket closed, " + event.code + ", " + event.reason);
    chatBox.innerHTML += "<br><span class='user'>LOST CONNECTION</span>: ERROR CODE " + event.code;
    if(event.reason != undefined && event.reason != null && event.reason != ""){
      chatBox.innerHTML += "<br>REASON: " + event.reason;
    }
    updateScroll();
  }

  window.ircsocket.onerror = function(e){
    console.log(e);
  }
  
  window.ircsocket.sendMessage = function(msg){
    //do some vigenere encryption with the key
    msg = msg.toLowerCase().replaceAll(/[^A-Za-z\s]/g, "");
    var msg_array = stringToInt(msg);
    
    var key = encKey.value.toLowerCase().replaceAll(/[^A-Za-z\s]/g, "");
    var key_array = stringToInt(key);
    
    var vig_array = [...msg_array]; //clone the message integer array with ES6
    var padding = 0; //store how many times we have encountered a space so that the key position is correct
    for(var i = 0; i < msg_array.length; i++){ //loop through each character in the plaintext to encrypt it
      if(vig_array[i] !== " "){ //make sure the current iteration is not a space
        vig_array[i] += key_array[(i - padding) % key_array.length] //add the integer value of the current position of the key
        vig_array[i] %= 26; //mod by 26
      } else {
        padding++; //if a space is encountered, increase the padding
      }
    }
    
    var encrypted_msg = intToString(vig_array);
    window.ircsocket.send(JSON.stringify({message: encrypted_msg, init: false}));
  }
  
  window.ircsocket.generateAlphabeticalKey = function(index) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let key = '';

    while (index >= 0 && key.length < 4) {
      const remainder = index % 26;
      key = letters.charAt(remainder) + key;
      index = Math.floor(index / 26) - 1;
    }

    const numPads = 4 - key.length;
    for (let i = 0; i < numPads; i++) {
      key = 'a' + key;
    }

    return key;
  }
  
  window.ircsocket.bruteForceVig = function(ciphertext){
    var dict = [];
    fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json').then(r => r.json()).then(data => {
      dict = data;
    });
    var decryptions = [];
    for (let i = 0; i <= 475253; i++) {
      const key = window.ircsocket.generateAlphabeticalKey(i);

      var iter = stringToInt(ciphertext);
      var padding = 0;
      for(var o = 0; o < ciphertext.length; o++){ //loop through each character in the ciphertext to decrypt it
        var key_array = stringToInt(key);
        if(iter[o] !== " "){ //make sure the current iteration is not a space
          iter[o] -= key_array[(o - padding) % key_array.length] //subtract the integer value of the current position of the key
          if(iter[o] < 0){
            iter[o] += 26;
          }
        } else {
          padding++; //if a space is encountered, increase the padding
        }
      }
      var count = 0;
      var result = intToString(iter);
      decryptions.push([result, 0, key]);
    }
    
    setTimeout(function(){
      decryptions.forEach(function(text){
        for(var l of text[0].split(" ")){
          if(dict[l] != undefined){
            text[1]++;
          }
        }
      })

      decryptions.sort(function(a,b){
        return b[1] - a[1];
      });

      console.log(decryptions);
    }, 6000);
    
  }
  
  connectButton.disabled = true;
}

inputBox.addEventListener("keydown", (e) => {
  if(e.keyCode == 13){
    e.preventDefault();
    
    var userMessage = inputBox.value;
    
    window.ircsocket.sendMessage(userMessage);
    
    inputBox.value = "";
  }
});

username.addEventListener("input", (e) => {
  window.hasUsername = true;
  checkUserInputs();
});

username.addEventListener("keydown", (e) => {
  if(e.keyCode == 13){
    e.preventDefault();
  }
});

colorBox.addEventListener("input", (e) => {
  window.hasColor = true;
  checkUserInputs();
});

colorBox.addEventListener("keydown", (e) => {
  if(e.keyCode == 13){
    e.preventDefault();
  }
});

encKey.addEventListener("input", (e) => {
  window.hasEncKey = true;
  checkUserInputs();
});

encKey.addEventListener("keydown", (e) => {
  if(e.keyCode == 13){
    e.preventDefault();
  }
});

function checkUserInputs(){
  if(window.hasUsername && window.hasColor && window.hasEncKey){
    connectButton.disabled = false;
  }
}