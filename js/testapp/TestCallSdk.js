
var callSdkGlobal = {};
var _isAudioMuted = false;
var _isVideoMuted = false;

function AVLog(elem) {
	var this_ = this;

	this_.console_ = elem;

	this_.info = function (messageString) {
		console.log(messageString);

		var entry = document.createElement('p');
		entry.style = 'color: darkblue;';
		entry.innerHTML = '<b>info:</b> ' + messageString;
		this_.console_.appendChild(entry);
	}

	this_.trace = function (messageString) {
		console.log(messageString);

		var entry = document.createElement('p');
		entry.style = 'color: gray;';
		entry.innerHTML = '<b>trace:</b> ' + messageString;
		this_.console_.appendChild(entry);
	}

	this_.error = function (code, msg) {
		console.log('error: [' + code + '] ' + msg);

		var entry = document.createElement('p');
		entry.style = 'color: darkred;';
		entry.innerHTML = '<b>error:</b> [' + code + '] ' + msg;
		this_.console_.appendChild(entry);
	}
}

function NodeJSChannel(addr) {
	var this_ = this;

	LiveChatAvCommInterface(this_);

	this_.socket_ = new WebSocket(addr);
	this_.uid_ = '' + Math.random();

	this_.onopen = function () { }
	this_.onclose = function () { }

	this_.isopen = function () {
		return (this_.socket_.readyState == WebSocket.OPEN);
	}

	this_.getUserId = function () {
		return this_.uid_;
	}

	this_.onVideoMessage = function (msg) { }

	this_.SendAppMessage = function (msg, to) {
		this_.socket_.send(msg);
	}

	this_.slog = function (type, unit, msg) { }

	this_.socket_.onopen = function (event) {
		callSdkGlobal.log.trace("web socket connected");
	}

	this_.socket_.onmessage = function (event) {
		callSdkGlobal.log.trace('message recieved ' + event.data);
		this_.onVideoMessage(event.data);
	}

	this_.socket_.onerror = function (event) {
		callSdkGlobal.log.error(0, "web socket error (" + event.reason + ")");
	}

	this_.socket_.onclose = function (event) {
		var error = event.reason;
		callSdkGlobal.log.trace("web socket closed");
		callSdkGlobal.log.trace('connection closed due to ' + error);
	}
}

function dummyChannel() {
	var this_ = this;

	this_.onopen = function () { }
	this_.onclose = function () { }

	this_.isopen = function () { return true; }

	setTimeout(function () {
		this_.onopen();
	}, 1000);
}

function MsSignalChannel(sessionId, address) {
	var this_ = this;

	LiveChatAvCommInterface(this_);

	this_.socket_ = new WebSocket(address);
	this_.sessionId_ = sessionId;
	this_.connected_ = false;
	this_.id_ = "n/a";

	this_.onopen = function () { }
	this_.onclose = function () { }

	//{@ Channel interface implementation
	this_.isopen = function () {
		return (this_.socket_.readyState == WebSocket.OPEN && this_.connected_);
	}

	this_.getUserId = function () {
		return this_.id_;
	}

	this_.onVideoMessage = function (msg) { }

	this_.SendAppMessage = function (msg, to) {
		var json = JSON.parse(msg);
		this_._send(json);
	}

	this_.slog = function (type, unit, msg) { }
	//@}

	this_._send = function (json) {
		json[ "from" ] = this_.id_;
		var jsonStr = JSON.stringify(json);
		this_.socket_.send(jsonStr);
	}

	this_.close = function () {
		this_.socket_.close();
	}

	this_.socket_.onopen = function (event) {
		callSdkGlobal.log.trace("web socket connected");

		var connectRequest = '{ "type" : "connect", "sessionId" : "test_session_' + this_.sessionId_ + '" }';
		this_.socket_.send(connectRequest);
		callSdkGlobal.log.trace("connecting to session " + this_.sessionId_);
	}

	this_.socket_.onmessage = function (event) {
		var json = JSON.parse(event.data);
		var frm = json[ "from" ];

		if (json.type == "connect") {
			this_.connected_ = true;
			this_.id_ = json.id;
			callSdkGlobal.log.trace('connect recieved');

			callSdkGlobal.log.trace('connected to chat session ' + this_.sessionId_ + ' as ' + this_.id_);

			this_.onopen();
		} else if (!this_.connected_) {
			callSdkGlobal.log.trace('message recieved prior to connection establishment ignored\nmessage: ' + event.data);
		} else if (json.to !== undefined && json.to != this_.id_) {
			callSdkGlobal.log.trace('message for other client (' + json.to + ') ignored\nmessage: ' + event.data);
		} else {
			this_.onVideoMessage(JSON.stringify(json));
		}
	}

	this_.socket_.onerror = function (event) {
		callSdkGlobal.log.trace("web socket error (" + event.reason + ")");
	}

	this_.socket_.onclose = function (event) {
		var error = event.reason;
		callSdkGlobal.log.trace("web socket closed");
		callSdkGlobal.log.trace('connection closed due to ' + error);
		this_.onclose();
	}
}

function createChannel(mode) {
	if (mode == 0) {
		return new dummyChannel();
	} else if (mode == 1) {
		wssAddr = "wss://" + location.hostname;
		if (location.port) {
			wssAddr = wssAddr + ":" + location.port;
		}
		return new NodeJSChannel(wssAddr);
	} else {
		wssAddr = "wss://" + location.hostname + ":8448/data";
		return new MsSignalChannel(1, wssAddr);
	}
}

function createCall(fa, ch, mode) {
	if (mode == 0) {
		try {
			return fa.CreateUsingLivechat2(livechatapi);
		} catch (e) {
			return null;
		}
	} else {
		return fa.CreateUsingCustom(ch);
	}
}

function updateUI(ev) {
	callSdkGlobal.callButton.enabled = false;
	callSdkGlobal.holdButton.enabled = false;
	callSdkGlobal.hangupButton.enabled = false;
	callSdkGlobal.toIdTxt.readOnly = false;

	var isConnected = callSdkGlobal.channel.isopen();

	if (ev == 'connected') {
		callSdkGlobal.callButton.enabled = isConnected;
	} else if (ev == 'disconnected') {

	} else if (ev == 'calling') {
		callSdkGlobal.hangupButton.enabled = true;
	}
}

function initCallSdk() {
	callSdkGlobal.videoContainer = document.getElementById('videoContainer');			//<- Div (fixed width and height)
	callSdkGlobal.consolePanel = document.getElementById('console');					//<- Div (v-scroll enabled fixed sized)
	callSdkGlobal.callButton = document.getElementById('callButton');					//<- Button
	callSdkGlobal.holdButton = document.getElementById('holdButton');					//<- Button
	callSdkGlobal.voiceMuteButton = document.getElementById('voiceMuteButton');					//<- Button
	callSdkGlobal.videoMuteButton = document.getElementById('videoMuteButton');					//<- Button
	callSdkGlobal.hangupButton = document.getElementById('hangupButton');				//<- Button
	callSdkGlobal.toIdTxt = document.getElementById('toId');							//<- Input Text
	callSdkGlobal.addButton = document.getElementById('addButton');				        //<- Button
	callSdkGlobal.screenshareVideoContainer = document.getElementById('screenshareVideoContainer');
	callSdkGlobal.screenshareStartButton = document.getElementById('screenshareStartButton');
	callSdkGlobal.screenshareEndButton = document.getElementById('screenshareStopButton');

	callSdkGlobal.signalMode = 0; // 0=livechat2, 1=MsSignal, 2=NodeSignal
	callSdkGlobal.wssAddr = "";
	callSdkGlobal.channel = createChannel(callSdkGlobal.signalMode);
	callSdkGlobal.log = new AVLog(callSdkGlobal.consolePanel);
	callSdkGlobal.callFactory = new LiveChatAvFactory();
	callSdkGlobal.call = createCall(callSdkGlobal.callFactory, callSdkGlobal.channel, callSdkGlobal.signalMode);
	callSdkGlobal.video = null;
	callSdkGlobal.screenshareVideo = null;

	callSdkGlobal.callButton.enabled = false;
	callSdkGlobal.holdButton.enabled = false;
	callSdkGlobal.hangupButton.enabled = false;
	callSdkGlobal.toIdTxt.readOnly = false;

	callSdkGlobal.call.SetAvConfigs({
		MediaTransport: {
			iceServers: [ { urls: "turn:test.tetherficloud.com:3579?transport=udp", username: "tetherfi", credential: "nuwan" } ],
			iceTransportPolicy: "all"
		},
		MediaCapture: { audio: { enabled: true }, video: { enabled: true } },
		Display: {
			OnConnected: function (remoteStreams, localStreams, remoteUserInfo, callId) {
				if (callSdkGlobal.video != null) {
					callSdkGlobal.video.destroy();
				}

				callSdkGlobal.video = new VideoCallLayout(videoContainer, localStreams, remoteStreams);
			},
			OnStreamsChanged: function (remoteStreams, localStreams, remoteUserInfo, callId) {
				if (callSdkGlobal.video != null) {
					callSdkGlobal.video.destroy();
				}

				callSdkGlobal.video = new VideoCallLayout(videoContainer, localStreams, remoteStreams);
			},
			OnDisconnected: function (reasonCode, callId) {
				callSdkGlobal.video.destroy();
				callSdkGlobal.video = null;
			},
			OnLocalHold: function (callId) {
			},
			OnLocalUnhold: function (callId) {
			},
			OnRemoteHold: function (callId) {
			},
			OnRemoteUnhold: function (callId) {
			},
			OnFail: function (errorCode, callId) {
				callSdkGlobal.log.error(errorCode, 'call error');
			},
			OnRemoteRinging: function (userId, callId) {
			},
			OnIncomingCall: function (userIds, acceptObject, callId) {
				acceptObject.accept();
			},
			OnEvent: function (evData) {
				callSdkGlobal.log.info('Call Event: ' + evData.event);
			},
			OnScreenshareConnected: function (remoteStreams, remoteUserInfo, callId) {
				if (callSdkGlobal.screenshareVideo != null) {
					callSdkGlobal.screenshareVideo.destroy();
				}

				callSdkGlobal.screenshareVideo = new VideoCallLayout(screenshareVideoContainer, [], remoteStreams);
			},
			OnScreenshareDisconnected: function () {
				callSdkGlobal.screenshareVideo.destroy();
				callSdkGlobal.screenshareVideo = null;
			},
			OnVoiceActivity: function (userId) {
				if (userId === "") {
					console.log("No one is currently speaking");
				}
				else {
					console.log("User " + userId + " is currently speaking");
				}
			}
		},
		VoiceActivity: {
			AudioLevelCheckEnabled: true,
			AudioVideoLevelThreshold: 0.31
		}
	});

	callSdkGlobal.channel.onopen = function () {
		updateUI('connected');
	}

	callSdkGlobal.channel.onclose = function () {
		updateUI('disconnected');
	}

	callSdkGlobal.callButton.onclick = function () {
		try {
			if (isVideoCall != undefined) {
				var to = callSdkGlobal.toIdTxt.value;
				callSdkGlobal.toIdTxt.value = "";

				if (to != "") {
					if (isVideoCall) {
						callSdkGlobal.call.StartAvCall('2', to, 2);
					}
					else {
						callSdkGlobal.call.StartAvCall('1', to, 1);
					}
					updateUI('calling');
				}
			}
			else {
				ShowNotification(notificationTypes.error, "Select the type of call (audio/video)");
			}
		} catch (error) {
			console.error(error);
		}
	}

	callSdkGlobal.addButton.onclick = function () {
		var to = callSdkGlobal.toIdTxt.value;
		callSdkGlobal.toIdTxt.value = "";

		if (to != "") {
			callSdkGlobal.call.Conference(to);
		}
	}

	callSdkGlobal.holdButton.onclick = function () {
		callSdkGlobal.call.Hold(true);
	}

	callSdkGlobal.voiceMuteButton.onclick = function () {
		if (_isAudioMuted) {
			callSdkGlobal.call.Pause(false, _isVideoMuted);
			_isAudioMuted = false;
		}
		else {
			callSdkGlobal.call.Pause(true, _isVideoMuted);
			_isAudioMuted = true;
		}

		try {
			if (_isAudioMuted) {
				callSdkGlobal.voiceMuteButton.children[ 0 ].classList.remove("fa-microphone")
				callSdkGlobal.voiceMuteButton.children[ 0 ].classList.add("fa-microphone-slash")
			}
			else {
				callSdkGlobal.voiceMuteButton.children[ 0 ].classList.add("fa-microphone");
				callSdkGlobal.voiceMuteButton.children[ 0 ].classList.remove("fa-microphone-slash");
			}
		} catch (error) {

		}
	}

	callSdkGlobal.videoMuteButton.onclick = function () {
		if (_isVideoMuted) {
			callSdkGlobal.call.Pause(_isAudioMuted, false);
			_isVideoMuted = false;
		}
		else {
			callSdkGlobal.call.Pause(_isAudioMuted, true);
			_isVideoMuted = true;
		}

		try {
			if (_isVideoMuted) {
				callSdkGlobal.videoMuteButton.children[ 0 ].classList.remove("fa-video")
				callSdkGlobal.videoMuteButton.children[ 0 ].classList.add("fa-video-slash")
			}
			else {
				callSdkGlobal.videoMuteButton.children[ 0 ].classList.add("fa-video");
				callSdkGlobal.videoMuteButton.children[ 0 ].classList.remove("fa-video-slash");
			}
		} catch (error) {

		}
	}

	callSdkGlobal.hangupButton.onclick = function () {
		callSdkGlobal.call.EndAvCall();
	}

	callSdkGlobal.screenshareStartButton.onclick = function () {
		var to = callSdkGlobal.toIdTxt.value;
		callSdkGlobal.toIdTxt.value = "";

		if (to != "") {
			callSdkGlobal.call.StartScreensharing('1', to);
		}
	}

	callSdkGlobal.screenshareEndButton.onclick = function () {
		callSdkGlobal.call.StopScreensharing();
	}
}

//setTimeout(initCallSdk, 1000);