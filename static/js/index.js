var isPlaying = false;
var context = null;

var synthButton = $("#synth_button");
var saveButton = $("#save_button");

$(function () {
    synthButton.click(function (e) {
        playSound();
    });

    saveButton.click(function (e) {
        saveSound();
    })
});

function updateButton() {
    if (isPlaying) {
        synthButton.text('再生を停止');
        synthButton.removeClass('btn-primary');
        synthButton.addClass('btn-danger');
    } else {
        synthButton.text('音声を合成');
        synthButton.removeClass('btn-danger');
        synthButton.addClass('btn-primary');
    }
}

function playSound() {
    if (isPlaying) {
        isPlaying = false;
        updateButton();
        context.close();
    } else {
        var text = $("#input_text").val();
        var speaker = $("#speaker").val();

        var data = new FormData();
        data.append('text', text);
        data.append('speaker', speaker);

        var request = new XMLHttpRequest();
        var url = '/synthesize'
        request.open('POST', url, true);
        request.responseType = 'arraybuffer';
        request.send(data);

        // play synthesized speech with Web Audio API
        context = new AudioContext();
        var source = context.createBufferSource();
        request.onload = function () {
            // response should be wave binary data
            var res = request.response;
            context.decodeAudioData(res, function (buf) {
                source.buffer = buf;
                source.connect(context.destination);
                source.start(0);
                isPlaying = true;
                updateButton();
                source.onended = function () {
                    isPlaying = false;
                    updateButton();
                    context.close();
                }
            });
        };
    }
}

function saveSound() {
    var text = $("#input_text").val();
    var speaker = $("#speaker").val();
    var url = "/synthesize?text=" + text + "&speaker=" + speaker;
    window.location = url
}
