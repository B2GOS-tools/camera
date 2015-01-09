define(["exports"], function (exports) {
  "use strict";

  var DEFAULT_DCF_FILE_SEQUENCE = 1;
  var DEFAULT_DCF_DIRECTORY_SEQUENCE = 100;

  var DCF_SEQUENCE_KEY = "DCF_SEQUENCE_KEY";

  var DCF_BASE_DIRECTORY = "DCIM";

  var DCF_DIRECTORY_POSTFIX = "MZLLA";

  var DCF_FILE_PREFIX = {
    pictures: "IMG_",
    videos: "VID_"
  };

  var DCF_FILE_EXTENSION = {
    pictures: "jpg",
    videos: "3gp"
  };

  var sequence;

  function getSequence() {
    return new Promise(function (resolve) {
      if (sequence) {
        resolve(sequence);
        return;
      }

      sequence = JSON.parse(localStorage.getItem(DCF_SEQUENCE_KEY)) || {
        file: DEFAULT_DCF_FILE_SEQUENCE,
        directory: DEFAULT_DCF_DIRECTORY_SEQUENCE
      };

      resolve(sequence);
    });
  }

  function updateSequence() {
    return new Promise(function (resolve) {
      localStorage.setItem(DCF_SEQUENCE_KEY, JSON.stringify(sequence));
      resolve(sequence);
    });
  }

  function incrementDirectory() {
    sequence.file = DEFAULT_DCF_FILE_SEQUENCE;
    sequence.directory++;

    return updateSequence();
  }

  function incrementFile() {
    if (sequence.file >= 9999) {
      return incrementDirectory();
    }

    sequence.file++;

    return updateSequence();
  }

  function padLeft(value, length) {
    var stringValue = value + "";
    while (stringValue.length < length) {
      stringValue = "0" + stringValue;
    }

    return stringValue;
  }

  function getNextFilename(type, callback) {
    var storage = navigator.getDeviceStorage(type);

    getSequence().then(checkFilename);

    function checkFilename(sequence) {
      var filename = [DCF_BASE_DIRECTORY, sequence.directory + DCF_DIRECTORY_POSTFIX, DCF_FILE_PREFIX[type] + padLeft(sequence.file, 4) + "." + DCF_FILE_EXTENSION[type]].join("/");

      var request = storage.get(filename);
      request.onsuccess = function () {
        incrementDirectory().then(checkFilename);
      };
      request.onerror = function () {
        incrementFile().then(function () {
          if (typeof callback === "function") {
            callback(filename);
          }
        });
      };
    }
  }

  var DCFUtil = {
    getNextFilename: getNextFilename
  };

  exports["default"] = DCFUtil;
});